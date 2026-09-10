/** 80**************************************************************************
 * @module lib/util/string
 * @license MIT
 ******************************************************************************/

import type { TypedArray, uint, uint16 } from "../alias.ts";
import type { UInt16 } from "../alias_v.ts";
import { validateBinaryLike } from "./general_cf.ts";
import * as Is from "./is.ts";
import { MurmurHash3_64 } from "./murmurhash3.ts";
/*80--------------------------------------------------------------------------*/

/* Not sure if js impls use regexp interning like string. So. */
// const lt_re_ = /[\n\r\u001C-\u001E\u0085\u2029]/g;
/**
 * [Line terminator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#line_terminators)
 */
// const lt_re_ = /\r\n|\n|\r|\u2028|\u2029/g;
const lt_re_ = /\r\n|\n|\r/g;
/** @const @param text_x */
export const linesOf = (text_x: string): string[] => text_x.split(lt_re_);
// console.log(linesOf("abc\n\n123\n"));

/**
 * Get trimed string on the first non-empty line
 * @const @param text_x
 */
export const line1Of = (text_x: string): string => {
  const LEN = text_x.length;
  let strt: uint = 0;
  while (strt < LEN) {
    const nextN = text_x.indexOf("\n", strt);
    const nextR = text_x.indexOf("\r", strt);

    let stop: uint;
    let offs: 1 | 2 = 1;
    if (nextN < 0 && nextR < 0) {
      stop = LEN;
    } else if (nextN >= 0 && nextR >= 0) {
      if (nextR + 1 === nextN) {
        stop = nextR;
        offs = 2;
      } else {
        stop = Math.min(nextN, nextR);
      }
    } else {
      stop = nextN >= 0 ? nextN : nextR;
    }

    const ret = text_x.slice(strt, stop).trim();
    if (ret) return ret;

    strt = stop + offs;
  }
  return "";
};
/*80--------------------------------------------------------------------------*/

/** @const @param _x */
export const isSpaceOrTab = (_x: uint): boolean =>
  _x === /* " " */ 0x20 || _x === /* "\t" */ 9;

/** @const @param _x */
export const isLFOr0 = (_x: uint): boolean => _x === /* "\n" */ 0xA || _x === 0;

/** @const @param _x */
export const isDecimalDigit = (_x: uint): boolean => 0x30 <= _x && _x <= 0x39;
/** @const @param _x */
export const isHexDigit = (_x: uint): boolean =>
  (0x30 <= _x && _x <= 0x39) || // 0..9
  (0x41 <= _x && _x <= 0x46) || // A..F
  (0x61 <= _x && _x <= 0x66); // a..f
/** @const @param _x */
export const isOctalDigit = (_x: uint): boolean => (0x30 <= _x && _x <= 0x37); // 0..7

/**
 * A..Z
 * @const @param _x
 */
export const isASCIIUpAlpha = (_x: uint): boolean => 0x41 <= _x && _x <= 0x5A;
/**
 * a..z
 * @const @param _x
 */
export const isASCIILoAlpha = (_x: uint): boolean => 0x61 <= _x && _x <= 0x7A;
/** @see {@linkcode isSpaceOrTab()} */
export const isASCIIAlpha = (_x: uint): boolean =>
  isASCIIUpAlpha(_x) || isASCIILoAlpha(_x);

/** @const @param _x */
export const isASCIIAlphanumeric = (_x: uint): boolean =>
  isDecimalDigit(_x) || isASCIIAlpha(_x);
//jjjj TOCLEANUP
// /** @const @param _x */
// export const isWordLetter = (_x: uint): boolean =>
//   isASCIIAlphanumeric(_x) || _x === /* "_" */ 0x5F;

/** @const @param _x */
export const isASCIIControl = (_x: uint): boolean =>
  0 <= _x && _x <= 0x1F || _x === 0x7F;
/**
 * [non-printable code point](https://www.w3.org/TR/css-syntax-3/#non-printable-code-point)
 * @const @param _x
 */
export const isASCIINonprint = (_x: uint): boolean =>
  isASCIIControl(_x) &&
  (_x !== /* "\t" */ 9 && _x !== /* "\n" */ 0xA && _x !== 0xC && _x !== 0xD);

/**
 * [White space](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#white_space)
 */
export const ws_a = /* deno-fmt-ignore */ [
  0x9, 0xB, 0xC, 0x20, 0xA0,
  0x0_1680,
  0x0_2000, 0x0_2001, 0x0_2002, 0x0_2003, 0x0_2004, 0x0_2005, 
  0x0_2006, 0x0_2007, 0x0_2008, 0x0_2009, 0x0_200A,
  0x0_202F, 0x0_205F,
  0x0_3000,
  0x0_FEFF,
] as UInt16[];
/**
 * whitespace
 * @const @param _x
 * @const @param a_x
 */
export const isWs = (_x: uint, a_x: uint16[] = ws_a) => a_x.indexOf(_x) >= 0;

export const ASCIIWs_a = /* deno-fmt-ignore */ [
  /* "\t" */ 9, /* "\n" */ 0xA, 0xC, /* 0xD, */ /* " " */ 0x20
] as UInt16[];
/**
 * Including line terminators, and no `0xB`\
 * Mostly used in HTML/CSS parsers
 * @const @param _x
 */
export const isASCIIWs = (_x: uint): boolean => isWs(_x, ASCIIWs_a);

// /* Not sure if js impls use regexp interning like string. So. */
// const ws_re_ = /^\s+$/;
// /** */
// export const isWhitespace = (_x: string) => ws_re_.test(_x);

/**
 * surrogate leading
 * @const @param _x
 */
export const isSurLead = (_x: uint | bigint) =>
  0x0_D800 <= _x && _x <= 0x0_DBFF;
/**
 * surrogate trailing
 * @const @param _x
 */
export const isSurTral = (_x: uint | bigint) =>
  0x0_DC00 <= _x && _x <= 0x0_DFFF;
/*80--------------------------------------------------------------------------*/

const ctrlChr_m_: Record<string, string> = {
  "n": "\n",
  "r": "\r",
  "t": "\t",
  "f": "\f",
  "b": "\b",
  "v": "\v",
  "\\": "\\",
  '"': '"',
  "'": "'",
};
export const unescapeString = (_x: string): string =>
  _x.replace(/\\(u[0-9a-fA-F]{4}|u\{[0-9a-fA-F]+\}|.)/g, (_, esc_y) => {
    if (esc_y.startsWith("u{")) {
      const hex = esc_y.slice(2, -1);
      return String.fromCodePoint(parseInt(hex, 16));
    }

    if (esc_y.startsWith("u")) {
      const hex = esc_y.slice(1);
      return String.fromCodePoint(parseInt(hex, 16));
    }

    return ctrlChr_m_[esc_y] || esc_y;
  });
/*64----------------------------------------------------------*/

const textEncoder_ = new TextEncoder();
export const encodeStr = textEncoder_.encode.bind(textEncoder_);

const textDecoder_ = new TextDecoder();
export const decodeABV = textDecoder_.decode.bind(textDecoder_);
/*80--------------------------------------------------------------------------*/

/** https://developer.mozilla.org/en-US/docs/Glossary/Base64 */
const B64_ = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * Ref. https://github.com/denoland/std/blob/e02e89fef3cd7f625e487f76e9d56b8b60137102/encoding/base64.ts#L112
 * @const @param u8ary_x
 */
export const b64FromU8ary = (u8ary_x: Uint8Array): string => {
  let b64 = "";
  let i_;
  const LEN = u8ary_x.length;
  for (i_ = 2; i_ < LEN; i_ += 3) {
    b64 += B64_[(u8ary_x[i_ - 2]!) >> 2];
    b64 += B64_[
      (((u8ary_x[i_ - 2]!) & 0x03) << 4) |
      ((u8ary_x[i_ - 1]!) >> 4)
    ];
    b64 += B64_[
      (((u8ary_x[i_ - 1]!) & 0x0f) << 2) |
      ((u8ary_x[i_]!) >> 6)
    ];
    b64 += B64_[(u8ary_x[i_]!) & 0x3f];
  }
  if (i_ === LEN + 1) {
    /* 1 octet yet to write */
    b64 += B64_[(u8ary_x[i_ - 2]!) >> 2];
    b64 += B64_[((u8ary_x[i_ - 2]!) & 0x03) << 4];
    b64 += "==";
  }
  if (i_ === LEN) {
    /* 2 octets yet to write */
    b64 += B64_[(u8ary_x[i_ - 2]!) >> 2];
    b64 += B64_[
      (((u8ary_x[i_ - 2]!) & 0x03) << 4) |
      ((u8ary_x[i_ - 1]!) >> 4)
    ];
    b64 += B64_[((u8ary_x[i_ - 1]!) & 0x0f) << 2];
    b64 += "=";
  }
  return b64;
};

/** @const @param data_x */
export const b64From = (
  data_x: ArrayBuffer | Uint8Array | string,
): string => {
  return validateBinaryLike(data_x).toBase64();
};

/**
 * Ref. https://github.com/denoland/std/blob/e02e89fef3cd7f625e487f76e9d56b8b60137102/encoding/base64url.ts#L39
 * @const @param b64_x
 */
export const b64urlFromB64 = (b64_x: string): string => {
  return b64_x.endsWith("=")
    ? b64_x.endsWith("==")
      ? b64_x.replace(/\+/g, "-").replace(/\//g, "_").slice(0, -2)
      : b64_x.replace(/\+/g, "-").replace(/\//g, "_").slice(0, -1)
    : b64_x.replace(/\+/g, "-").replace(/\//g, "_");
};

/** @const @param data_x */
export const b64urlFrom = (
  data_x: ArrayBuffer | Uint8Array | string,
): string => {
  return validateBinaryLike(data_x).toBase64({
    alphabet: "base64url",
    omitPadding: true,
  });
};
/*64----------------------------------------------------------*/

/**
 * Ref. https://github.com/denoland/std/blob/e02e89fef3cd7f625e487f76e9d56b8b60137102/encoding/base64.ts#L168
 * @const @param b64_x
 */
export const u8aryFromB64 = (b64_x: string): Uint8Array<ArrayBuffer> => {
  const binString = atob(b64_x);
  const size = binString.length;
  const u8ary = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    u8ary[i] = binString.charCodeAt(i);
  }
  return u8ary;
};

/** @const @param b64_x */
export const decodeB64 = (b64_x: string): string => {
  return decodeABV(Uint8Array.fromBase64(b64_x));
};

/**
 * Ref. https://github.com/denoland/std/blob/e02e89fef3cd7f625e487f76e9d56b8b60137102/encoding/base64url.ts#L31
 * @const @param b64url_x
 * @throw {@linkcode TypeError}
 */
export const b64FromB64url = (b64url_x: string): string => {
  if (!/^[-_A-Z0-9]*?={0,2}$/i.test(b64url_x)) {
    /* Contains characters not part of base64url spec. */
    throw new TypeError("Failed to decode base64url: invalid character");
  }
  const ret =
    (b64url_x.length % 4 === 2
      ? b64url_x + "=="
      : b64url_x.length % 4 === 3
      ? b64url_x + "="
      : b64url_x.length % 4 === 1
      ? undefined
      : b64url_x)?.replace(/\-/g, "+").replace(/_/g, "/");
  if (ret === undefined) throw new TypeError("Illegal base64url string");
  return ret;
};

/**
 * @const @param b64url_x
 * @throw {@linkcode TypeError}
 */
export const decodeB64url = (b64url_x: string): string => {
  return decodeABV(Uint8Array.fromBase64(b64url_x, { alphabet: "base64url" }));
};
/*80--------------------------------------------------------------------------*/

export const sha256 = async (src_x: string | BufferSource): Promise<string> => {
  if (Is.string(src_x)) src_x = encodeStr(src_x);
  const ab_ = await crypto.subtle.digest("SHA-256", src_x);
  return b64From(ab_);
};

export const murmur3 = (
  _x: string | ArrayBuffer | TypedArray<ArrayBuffer>,
): string => {
  const h_ = new MurmurHash3_64();
  h_.update(_x);
  return h_.hexdigest();
};

// /**
//  * Ref. [Simple (non-secure) hash function](https://stackoverflow.com/a/8831937)
//  */
// export const hash = (src_x: string): string => {
//   let hash = 0;
//   for (let i = 0, iI = src_x.length; i < iI; i++) {
//     const chr = src_x.charCodeAt(i);
//     hash = (hash << 5) - hash + chr;
//     hash |= 0; // Convert to 32bit integer
//   }
//   return hash + "";
// };
/*80--------------------------------------------------------------------------*/
