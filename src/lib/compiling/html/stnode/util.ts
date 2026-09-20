/** 80**************************************************************************
 * @module lib/compiling/html/stnode/util
 * @license MIT
 ******************************************************************************/

import type { int } from "@fe-lib/alias.ts";
import { assert, fail, space } from "@fe-lib/util.ts";
import { DEBUG, INOUT } from "@fe-src/preNs.ts";
import { HTMLTk } from "../HTMLTk.ts";
import { HTMLTok } from "../HTMLTok.ts";
import type { Chr_LI, Comment_LI, Doctype_LI } from "../util.ts";
import type { HTMLCtnr } from "./alias.ts";
import { CtnrEl } from "./CtnrEl.ts";
import { Doment } from "./Doment.ts";
import { Elment } from "./Elment.ts";
import type { HTMLSn } from "./HTMLSn.ts";
import type { Proins } from "./Proins.ts";
/*80--------------------------------------------------------------------------*/

/** @headconst @param self_x */
export const children = (self_x: HTMLCtnr): (Elment | Proins)[] => {
  if (self_x.children_$) return self_x.children_$;

  const retA: (Elment | Proins)[] = [];
  for (const snt of self_x.snt_a_$) {
    if (!(snt instanceof HTMLTk)) retA.push(snt);
  }
  return self_x.children_$ = retA;
};

export const frstToken_1 = (self_x: HTMLCtnr): HTMLTk => {
  const snt = self_x.snt_a_$[0];
  return snt instanceof HTMLTk ? snt : snt.frstToken_1;
};
export const lastToken_1 = (self_x: HTMLCtnr): HTMLTk => {
  const snt = self_x.snt_a_$.at(-1)!;
  return snt instanceof HTMLTk ? snt : snt.lastToken_1;
};

//jjjj TOCLEANUP
// /** @headconst @param snts_x  */
// const correctSnts_ = (snts_x: (HTMLTk | Elment)[]) => {
//   if (snts_x.length !== 1) return;

//   const tk_ = snts_x[0];
//   if (tk_ instanceof Elment || tk_.value !== HTMLTok.placeholder) return;

//   tk_.lexr_$.rmvScandTk_$(tk_)
//     .htmlSn_$ = undefined;
//   snts_x.length = 0;
// };

/**
 * @headconst @param self_x
 * @const @param snts_x
 */
export const apdSnt = (
  self_x: HTMLCtnr,
  ...snts_x: (HTMLTk | Elment | Proins)[]
): void => {
  if (snts_x.length === 0) return;
  //jjjj TOCLEANUP
  // correctSnts_(self_x.snt_a_$);

  for (const snt of snts_x) {
    self_x.snt_a_$.push(snt);
    if (snt instanceof HTMLTk) {
      //jjjj TOCLEANUP
      // snt.htmlSn_$ = self_x;
    } else {
      snt.attachTo_$(self_x);
      self_x.children_$ = undefined;
    }
  }

  self_x.invalBdries();
};

/**
 * @headconst @param self_x
 * @const @param snt_x
 * @const @param i_x `[-snt_a_$.length, snt_a_$.length]`
 */
export const insSnt = (
  self_x: HTMLCtnr,
  snt_x: HTMLTk | Elment | Proins,
  i_x?: int,
): void => {
  if (i_x === undefined) return self_x.apdSnt(snt_x);
  //jjjj TOCLEANUP
  // correctSnts_(self_x.snt_a_$);

  self_x.snt_a_$.splice(i_x, 0, snt_x);
  if (snt_x instanceof HTMLTk) {
    //jjjj TOCLEANUP
    // snt_x.htmlSn_$ = self_x;
  } else {
    snt_x.attachTo_$(self_x);
    self_x.children_$ = undefined;
  }
  // if (
  //   i_x === self_x.snt_a_$.length || i_x === 0 || i_x === -self_x.snt_a_$.length
  // ) {
  self_x.invalBdries();
  // }
};

/**
 * @headconst @param self_x
 * @headconst @param snts_x (Part of) `snt_a_$` of `this`\
 *    MUST be in the same order as in `snt_a_$`
 */
export const rmvSnt = (
  self_x: HTMLCtnr,
  ...snts_x: (HTMLTk | Elment | Proins)[]
): void => {
  if (snts_x.length === 0) return;

  if (snts_x === self_x.snt_a_$) {
    self_x.snt_a_$.length = 0;
    self_x.children_$ = undefined;
  } else {
    let j_ = self_x.snt_a_$.length;
    for (let i = snts_x.length; i--;) {
      const snt_i = snts_x[i];
      for (; j_-- > 0;) {
        if (self_x.snt_a_$[j_] === snt_i) {
          self_x.snt_a_$.splice(j_, 1);
          if (snt_i instanceof HTMLTk) {
            //jjjj TOCLEANUP
            // snt_i.htmlSn_$ = undefined;
          } else {
            snt_i.detach_$();
            self_x.children_$ = undefined;
          }
          break;
        }
      }
    }
  }

  self_x.invalBdries();
  /*#static*/ if (INOUT) {
    assert(
      self_x.snt_a_$.length ||
        (snts_x[0] as HTMLTk).value === HTMLTok.placeholder,
    );
  }
};

/**
 * @headconst @param self_x
 * @headconst @param tgtPa_x
 * @const @param snts_x (Part of) `snt_a_$` of `this`\
 *    MUST be in the same order as in `snt_a_$`
 */
export const tfrSntTo = (
  self_x: HTMLCtnr,
  tgtPa_x: HTMLCtnr,
  ...snts_x: (HTMLTk | Elment)[]
): void => {
  const snt_a = snts_x.length
    ? snts_x
    : self_x instanceof CtnrEl && self_x.opntagTk
    ? self_x.snt_a_$.slice(1)
    : self_x.snt_a_$;
  self_x.rmvSnt(...snt_a);
  tgtPa_x.apdSnt(...snt_a);
};
/*64----------------------------------------------------------*/

/**
 * @headconst @param self_x
 * @const @param indent_x
 */
export const _toHTML_ = (self_x: HTMLSn, indent_x = -2): string[] => {
  const ret: string[] = [];

  let dentIn = 2;
  if (self_x instanceof Elment) {
    ret.push(`| ${space(indent_x)}<${self_x.tagname}>`);

    const attr_a: string[] = [];
    const attrs = self_x.attrs_$;
    for (let i = 0, iI = attrs.an_a.length; i < iI; i++) {
      const an_i = attrs.an_a[i];
      const fan_i = attrs.foreignAn_a?.at(i);
      attr_a.push([
        fan_i ? `${fan_i.prefix} ${fan_i.localName}` : an_i,
        `"${attrs.getAv(an_i)}"`,
      ].join("="));
    }
    for (const attr of attr_a.sort()) {
      ret.push(`| ${space(indent_x + dentIn)}${attr}`);
    }

    if (self_x.tagname === "template") {
      ret.push(`| ${space(indent_x + dentIn)}content`);
      dentIn += 2;
    }
  }

  if (self_x instanceof CtnrEl || self_x instanceof Doment) {
    const texts: string[] = [];
    const flushTexts_ = () => {
      if (texts.length) {
        ret.push(`| ${space(indent_x + dentIn)}"${texts.join("")}"`);
        texts.length = 0;
      }
    };

    for (const snt of self_x.snt_a_$) {
      if (!(snt instanceof HTMLTk)) {
        flushTexts_();

        ret.push(...snt._toHTML_(indent_x + dentIn));
        continue;
      }

      if (snt.value === HTMLTok.tag || snt.value === HTMLTok.placeholder) {
        flushTexts_();
        continue;
      }

      switch (snt.value) {
        case HTMLTok.doctype: {
          flushTexts_();

          //jjjj TOCLEANUP
          // const r_ = snt._repr_;
          // ret.push(`| <!${r_[0]} ${r_[1] ?? ""}${r_[3] ? ` ${r_[3]}` : ""}>`);
          const li_ = snt.lexdInfo as Doctype_LI;
          const nm_ = li_.name_s?.replaceAll("\u0000", "\uFFFD") ?? "";
          const sys = li_.quotSys_s?.replaceAll("\u0000", "\uFFFD") ?? "";
          ret.push(`| <!DOCTYPE ${nm_}${sys ? ` ${sys}` : ""}>`);
          break;
        }
        case HTMLTok.comment: {
          flushTexts_();

          const textA = (snt.lexdInfo as Comment_LI).data.getTextA();
          if (textA.length === 1) {
            ret.push(`| ${space(indent_x + dentIn)}<!-- ${textA[0]} -->`);
          } else {
            ret.push(
              `| ${space(indent_x + dentIn)}<!-- ${textA.at(0)}`,
              ...textA.slice(1, -1),
              `${textA.at(-1)} -->`,
            );
          }
          break;
        }
        case HTMLTok.character: {
          const t_ = (snt.lexdInfo as Chr_LI).getText();
          if (t_) texts.push(t_);
          break;
        }
        case HTMLTok.chrref: {
          texts.push(snt.refchr!);
          break;
        }
        default:
          /*#static*/ DEBUG ? fail("Should not run here!") : {};
      }
    }
    flushTexts_();
  }

  return ret;
};
/*80--------------------------------------------------------------------------*/
