/** 80**************************************************************************
 * @module lib/compiling/util
 * @license MIT
 ******************************************************************************/

import { INOUT } from "../../preNs.ts";
import type { loff_t, ts_t, unum } from "../alias.ts";
import type { Id_t, UInt16 } from "../alias_v.ts";
import type { CsscHexNorm } from "../color/alias.ts";
import type { MooHandler } from "../Moo.ts";
import { assert } from "../util.ts";
import * as Is from "../util/is.ts";
import { SortedIdo, SortedSet } from "../util/SortedSet.ts";
import type { Locval, Tok } from "./alias.ts";
import type { Line } from "./Line.ts";
import type { Ranval } from "./Ranval.ts";
import type { Snt } from "./Snt.ts";
import { Stnode } from "./Stnode.ts";
import type { Token } from "./Token.ts";
/*80--------------------------------------------------------------------------*/

export type LineData = [
  /**
   * Record of `Token<any>`s whose `frstLine` is this Line and
   * `prevToken_$?.frstLine` is not.
   */
  frstTk: Record</** Lexr.id */ Id_t, Token<any> | undefined> | undefined,
  /**
   * Record of `Token<any>`s whose `lastLine` is this Line and
   * `nextToken_$?.lastLine` is not.
   */
  lastTk: Record</** Lexr.id */ Id_t, Token<any> | undefined> | undefined,

  //jjjj TOCLEANUP
  // frstTSeg: Record</** Tfmr.id */ Id_t, TSeg | undefined> | undefined,
  // lastTSeg: Record</** Tfmr.id */ Id_t, TSeg | undefined> | undefined,

  blockSize: Record</** EdtrBaseScrolr.id */ Id_t, unum> | undefined,
  //jjjj TOCLEANUP
  // fsrec_a: Record</** EdtrBaseScrolr.id */ Id_t, FSRec[]> | undefined,
];

export const lineFrstTkO = (_x: LineData) => _x[0] ??= {};
export const lineLastTkO = (_x: LineData) => _x[1] ??= {};

//jjjj TOCLEANUP
// export const lineFrstTSegO = (_x: LineData) => _x[2] ??= {};
// export const lineLastTSegO = (_x: LineData) => _x[3] ??= {};
// export const clearLineFrstTSeg = (_x?: LineData) => !_x || (_x[2] = undefined);
// export const clearLineLastTSeg = (_x?: LineData) => !_x || (_x[3] = undefined);

export const lineBSizeO = (_x: LineData) => _x[2] ??= {};
// export const lineFsrecaO = (_x: LineData) => _x[5] ??= {};
/*64----------------------------------------------------------*/

/**
 * @const @param ucod_x
 * @const @param ln_x
 * @const @param strt_x
 * @const @param stop_x
 */
export const frstNon = (
  ucod_x: UInt16 | UInt16[] | ((_: UInt16) => boolean),
  ln_x: Line,
  strt_x: loff_t = 0,
  stop_x: loff_t = ln_x.uchrLen,
): loff_t => {
  /*#static*/ if (INOUT) {
    assert(strt_x <= stop_x);
  }
  let i_ = strt_x;
  if (Is.func(ucod_x)) {
    for (; i_ < stop_x; i_++) {
      if (!ucod_x(ln_x.ucodAt(i_))) break;
    }
  } else if (Is.array(ucod_x)) {
    //jjjj TOCLEANUP
    // const LEN = ucod_x.length;
    for (; i_ < stop_x; i_++) {
      if (!ucod_x.includes(ln_x.ucodAt(i_))) break;
      //jjjj TOCLEANUP
      // const ucod = ln_x.ucodAt(i_);
      // let j_ = 0;
      // for (; j_ < LEN && ucod !== ucod_x[j_]; j_++);
      // if (j_ === LEN) break;
    }
  } else {
    for (; i_ < stop_x; i_++) {
      if (ln_x.ucodAt(i_) !== ucod_x) break;
    }
  }
  return i_;
};

/**
 * @const @param ucod_x
 * @const @param ln_x
 * @const @param strt_x
 * @const @param stop_x
 */
export const lastNon = (
  ucod_x: UInt16 | UInt16[] | ((_: UInt16) => boolean),
  ln_x: Line,
  strt_x: loff_t = 0,
  stop_x: loff_t = ln_x.uchrLen,
): loff_t | -1 => {
  /*#static*/ if (INOUT) {
    assert(strt_x <= stop_x);
  }
  let i_ = stop_x - 1;
  if (Is.func(ucod_x)) {
    for (; i_ >= strt_x; i_--) {
      if (!ucod_x(ln_x.ucodAt(i_))) break;
    }
  } else if (Is.array(ucod_x)) {
    //jjjj TOCLEANUP
    // const LEN = ucod_x.length;
    for (; i_ >= strt_x; i_--) {
      if (!ucod_x.includes(ln_x.ucodAt(i_))) break;
      //jjjj TOCLEANUP
      // const ucod = ln_x.ucodAt(i_);
      // let j_ = 0;
      // for (; j_ < LEN && ucod !== ucod_x[j_]; j_++);
      // if (j_ === LEN) break;
    }
  } else {
    for (; i_ >= strt_x; i_--) {
      if (ln_x.ucodAt(i_) !== ucod_x) break;
    }
  }
  return i_;
};
/*80--------------------------------------------------------------------------*/

export abstract class LexdInfo {
  static #ID = 0 as Id_t;
  readonly id = ++LexdInfo.#ID as Id_t;
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  destructor(): void {}
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // /** @const */
  // become(li_x: LexdInfo) {}

  toString(): string {
    return "";
  }
}
/*80--------------------------------------------------------------------------*/

export const sntFrstTk = <T extends Tok>(
  snt_x: Stnode<T> | Token<T>,
): Token<T> => snt_x instanceof Stnode ? snt_x.frstToken_1 : snt_x;

export const sntLastTk = <T extends Tok>(
  snt_x: Stnode<T> | Token<T>,
): Token<T> => snt_x instanceof Stnode ? snt_x.lastToken_1 : snt_x;

//jjjj TOCLEANUP
// export const sntKnown = <T extends Tok>(snt_x: Stnode<T> | Token<T>): boolean =>
//   snt_x instanceof Stnode ? snt_x.known : snt_x.value !== BaseTok.unknown;
/*80--------------------------------------------------------------------------*/

export type _OldInfo_ = {
  sort: Locval;
  info: string;
};

export class SortedSnt_id<T extends Snt = Snt> extends SortedIdo<T> {
  /** @final */
  _repr_(): string[] {
    const ret: _OldInfo_[] = [];
    for (const v of this) ret.push(v._oldInfo_);
    return ret.map((_y) => _y.info);
  }

  /** @final */
  _reprSorted_(): string[] {
    const ret: _OldInfo_[] = [];
    for (const v of this) ret.push(v._oldInfo_);
    return ret.sort((a_y, b_y) => {
      const lv_a = a_y.sort;
      const lv_b = b_y.sort;
      return lv_a[0] < lv_b[0]
        ? -1
        : lv_a[0] === lv_b[0] && lv_a[1] < lv_b[1]
        ? -1
        : lv_a[1] === lv_b[1]
        ? 0
        : 1;
    }).map((_y) => _y.info);
  }
}

/** @final */
export class SortedTk_id extends SortedSnt_id<Token<any>> {}
/** @final */
export class SortedSn_id extends SortedSnt_id<Stnode<any>> {}
/*80--------------------------------------------------------------------------*/

export const enum ErrMsg {
  quoted_string_open = "Quoted string does not closed.",
  block_comment_open = "Block comment does not closed.",
  // unexpected_surrogate = "Unexpected surrogate",
  // unexpected_null_character = "Unexpected null character",
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
  /* set */

  /* Set */
  set_unexp_tk = "Unexpected token for Set",
  set_no_cloz_paren = "In Set, no closing parentheses.",
  set_no_open_paren = "In Set, no opening parentheses.",

  /* BinaryOp */
  set_subtract_no_rhs = "In Subtract, no rhs.",
  set_intersect_no_rhs = "In Intersect, no rhs.",
  set_union_no_rhs = "In Union, no rhs.",
  set_binaryerr_no_rhs = "In BinaryErr, no rhs.",
  set_inval_binary_op = "In BinaryOp, binary op is invalid.",

  /* Rel */
  set_rel_unexp_tk = "Unexpected token for Rel",
  set_rel_no_srt = "In Rel of set, no src or rel or tgt.",
  set_rel_no_2nd = 'In Rel of set, no 2nd joiner ">".',
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
  /* uri */

  ipv4_leading_0 = "Redundant leading 0 in one dec-octet field for IPv4",
  ipv4_exceed_255 = "In IPv4, exceed 255 in one dec-octet field.",
  ipv6_no_2nd_colon = 'In IPv6, expect 2nd colon of "::".',
  ipv6_no_enough_h16 = "In IPv6, there are no enough h16.",
  ipv6_no_h16 = "In IPv6, no h16.",
  ip_no_open_bracket = "In IPv6 or IPv7, no opening bracket.",
  ip_no_cloz_bracket = "In IPv6 or IPv7, no closing bracket.",

  uri_inval_tail = "Invalid tail for URI",

  uri_pathpart_conflict = "In PathPart of uri, path parts conflict.",
  uri_no_authority = "In PathPart of uri, no authority before path-abempty.",
  uri_no_scheme = "In URI, no scheme.",
  uri_unexp_scheme = "Unexpected token for URI",
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
  /* css */

  css_inval_esc = "Invalid escape",
  css_bad_url = "Bad URL",

  css_func_open = "Function does not closed.",
  css_simple_block_open = "Simple block does not closed.",
  css_atrule_open = "At-rule is incomplete.",
  css_qurule_open = "Qualified rule is incomplete.",
  css_qurule_no_prelude = "Qualified rule has no prelude.",
  // css_root_unexp_child = "Root contains unexpected child Stnode.",
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
  /* html */

  /*
  lex error messages
  ref. [3.2.2 Parse errors](https://html.spec.whatwg.org/multipage/parsing.html#parse-errors)
  */
  html_unexp_null = "unexpected-null-character",
  html_surrogate = "surrogate-in-input-stream",
  html_unexp_nonchr = "noncharacter-in-input-stream",
  html_unexp_ctrl = "control-character-in-input-stream",

  html_doctype_no_name = "missing-doctype-name",
  html_doctype_nosp_name = "missing-whitespace-before-doctype-name",
  html_doctype_name_inval = "invalid-character-sequence-after-doctype-name",
  html_doctype_sys_nosp = "missing-whitespace-after-doctype-system-keyword",
  html_doctype_sys_noid = "missing-doctype-system-identifier",
  html_doctype_sysid_noquot = "missing-quote-before-doctype-system-identifier",
  html_doctype_sysid_abrupt = "abrupt-doctype-system-identifier",
  html_doctype_sysid_unexp =
    "unexpected-character-after-doctype-system-identifier",
  html_doctype_eof = "eof-in-doctype",
  html_tagname_inval_1stchr = "invalid-first-character-of-tag-name",
  html_tagname_unexp_quesmrk = "unexpected-question-mark-instead-of-tag-name",
  html_tagname_eof = "eof-before-tag-name",
  html_tag_unexp_solidus = "unexpected-solidus-in-tag",
  html_tag_unexp_eqsign = "unexpected-equals-sign-before-attribute-name",
  html_tag_an_unexp_chr = "unexpected-character-in-attribute-name",
  html_tag_an_dup = "duplicate-attribute",
  html_tag_av_unexp_chr = "unexpected-character-in-unquoted-attribute-value",
  html_tag_av_no = "missing-attribute-value",
  html_tag_nosp_attrs = "missing-whitespace-between-attributes",
  html_tag_void_trail_solidus =
    "non-void-html-element-start-tag-with-trailing-solidus",
  html_tag_eof = "eof-in-tag",
  html_endtag_no = "missing-end-tag-name",
  html_endtag_attrs = "end-tag-with-attributes",
  html_endtag_trail_solidus = "end-tag-with-trailing-solidus",
  html_pi_target_inval_1stchr =
    "invalid-first-character-of-processing-instruction-target",
  html_pi_target_inval = "invalid-processing-instruction-target",
  html_pi_target_disallow = "disallowed-processing-instruction-target",
  html_pi_eof = "eof-in-processing-instruction",
  html_comment_inval_open = "incorrectly-opened-comment",
  html_comment_inval_cloz = "incorrectly-closed-comment",
  html_comment_abrupt_cloz = "abrupt-closing-of-empty-comment",
  html_comment_nested = "nested-comment",
  html_comment_eof = "eof-in-comment",
  html_chrref_null = "null-character-reference",
  html_chrref_exceed = "character-reference-outside-unicode-range",
  html_chrref_nonchr = "noncharacter-character-reference",
  html_chrref_control = "control-character-reference",
  html_chrref_unknown = "unknown-named-character-reference",
  html_chrref_surrogate = "surrogate-character-reference",
  html_chrref_no_digits = "absence-of-digits-in-numeric-character-reference",
  html_chrref_no_semicolon = "missing-semicolon-after-character-reference",

  html_script_cmt_eof = "eof-in-script-html-comment-like-text",
  html_cdata_html = "cdata-in-html-content",
  html_cdata_eof = "eof-in-cdata",
  /* ~ */

  /*
  paz error messages
  ref. https://github.com/html5lib/html5lib-python/blob/master/html5lib/constants.py
  */
  "null-character" = "Null character in input stream, replaced with U+FFFD.",
  "invalid-codepoint" = "Invalid codepoint in stream.",
  "incorrectly-placed-solidus" = "Solidus (/) incorrectly placed in tag.",
  "incorrect-cr-newline-entity" =
    "Incorrect CR newline entity, replaced with LF.",
  "illegal-windows-1252-entity" =
    "Entity used with illegal number (windows-1252 reference).",
  "cant-convert-numeric-entity" =
    "Numeric entity couldn't be converted to character (codepoint U+%(charAsInt)08x).",
  //jjjj TOCLEANUP
  // "illegal-codepoint-for-numeric-entity" =
  //   "Numeric entity represents an illegal codepoint: U+%(charAsInt)08x.",
  // "numeric-entity-without-semicolon" = "Numeric entity didn't end with ';'.",
  "expected-numeric-entity-but-got-eof" =
    "Numeric entity expected. Got end of file instead.",
  //jjjj TOCLEANUP
  // "expected-numeric-entity" = "Numeric entity expected but none found.",
  // "named-entity-without-semicolon" = "Named entity didn't end with ';'.",
  "expected-named-entity" = "Named entity expected. Got none.",
  "attributes-in-end-tag" = "End tag contains unexpected attributes.",
  "self-closing-flag-on-end-tag" =
    "End tag contains unexpected self-closing flag.",
  //jjjj TOCLEANUP
  // "expected-tag-name-but-got-right-bracket" =
  //   "Expected tag name. Got '>' instead.",
  // "expected-tag-name-but-got-question-mark" =
  //   "Expected tag name. Got '?' instead. (HTML doesn't support processing instructions.)",
  "expected-tag-name" = "Expected tag name. Got something else instead",
  "expected-closing-tag-but-got-right-bracket" =
    "Expected closing tag. Got '>' instead. Ignoring '</>'.",
  html_no_endtag_eof = "expected-closing-tag-but-got-eof", // "Expected closing tag. Unexpected end of file.",
  //jjjj TOCLEANUP
  // "expected-closing-tag-but-got-char" =
  //   "Expected closing tag. Unexpected character '%(data)s' found.",
  "eof-in-tag-name" = "Unexpected end of file in the tag name.",
  "expected-attribute-name-but-got-eof" =
    "Unexpected end of file. Expected attribute name instead.",
  "eof-in-attribute-name" = "Unexpected end of file in attribute name.",
  "invalid-character-in-attribute-name" = "Invalid character in attribute name",
  "duplicate-attribute" = "Dropped duplicate attribute on tag.",
  "expected-end-of-tag-name-but-got-eof" =
    "Unexpected end of file. Expected = or end of tag.",
  "expected-attribute-value-but-got-eof" =
    "Unexpected end of file. Expected attribute value.",
  "expected-attribute-value-but-got-right-bracket" =
    "Expected attribute value. Got '>' instead.",
  "equals-in-unquoted-attribute-value" = "Unexpected = in unquoted attribute",
  "unexpected-character-in-unquoted-attribute-value" =
    "Unexpected character in unquoted attribute",
  "invalid-character-after-attribute-name" =
    "Unexpected character after attribute name.",
  "unexpected-character-after-attribute-value" =
    "Unexpected character after attribute value.",
  "eof-in-attribute-value-double-quote" =
    'Unexpected end of file in attribute value (").',
  "eof-in-attribute-value-single-quote" =
    "Unexpected end of file in attribute value (').",
  "eof-in-attribute-value-no-quotes" =
    "Unexpected end of file in attribute value.",
  "unexpected-EOF-after-solidus-in-tag" =
    "Unexpected end of file in tag. Expected >",
  "unexpected-character-after-solidus-in-tag" =
    "Unexpected character after / in tag. Expected >",
  //jjjj TOCLEANUP
  // "expected-dashes-or-doctype" = "Expected '--' or 'DOCTYPE'. Not found.",
  // "unexpected-bang-after-double-dash-in-comment" =
  //   "Unexpected ! after -- in comment",
  "unexpected-space-after-double-dash-in-comment" =
    "Unexpected space after -- in comment",
  //jjjj TOCLEANUP
  // "incorrect-comment" = "Incorrect comment.",
  // "eof-in-comment" = "Unexpected end of file in comment.",
  "eof-in-comment-end-dash" = "Unexpected end of file in comment (-)",
  "unexpected-dash-after-double-dash-in-comment" =
    "Unexpected '-' after '--' found in comment.",
  "eof-in-comment-double-dash" = "Unexpected end of file in comment (--).",
  "eof-in-comment-end-space-state" = "Unexpected end of file in comment.",
  "eof-in-comment-end-bang-state" = "Unexpected end of file in comment.",
  "unexpected-char-in-comment" = "Unexpected character in comment found.",
  //jjjj TOCLEANUP
  // "need-space-after-doctype" = "No space after literal string 'DOCTYPE'.",
  // "expected-doctype-name-but-got-right-bracket" =
  //   "Unexpected > character. Expected DOCTYPE name.",
  "expected-doctype-name-but-got-eof" =
    "Unexpected end of file. Expected DOCTYPE name.",
  "eof-in-doctype-name" = "Unexpected end of file in DOCTYPE name.",
  "eof-in-doctype" = "Unexpected end of file in DOCTYPE.",
  //jjjj TOCLEANUP
  // "expected-space-or-right-bracket-in-doctype" =
  //   "Expected space or '>'. Got '%(data)s'",
  // "unexpected-end-of-doctype" = "Unexpected end of DOCTYPE.",
  // "unexpected-char-in-doctype" = "Unexpected character in DOCTYPE.",
  "eof-in-innerhtml" = "XXX innerHTML EOF",
  html_unexp_doctype = "unexpected-doctype", // "Unexpected DOCTYPE. Ignored.",
  html_nonroot_html = "non-html-root", // "html needs to be the first start tag.",
  html_no_doctype_eof = "expected-doctype-but-got-eof", // "Unexpected End of file. Expected DOCTYPE.",
  html_unknown_doctype = "unknown-doctype", // "Erroneous DOCTYPE."
  html_unexp_chr_doctype = "expected-doctype-but-got-chars", // "Unexpected non-space characters. Expected DOCTYPE.",
  html_unexp_opntag_doctype = "expected-doctype-but-got-start-tag", // "Unexpected start tag (%(name)s). Expected DOCTYPE.",
  html_unexp_endtag_doctype = "expected-doctype-but-got-end-tag", // "Unexpected end tag (%(name)s). Expected DOCTYPE.",
  html_html_unexp_endtag = "end-tag-after-implied-root", // "Unexpected end tag (%(name)s) after the (implied) root element.",
  html_no_named_endtag_eof = "expected-named-closing-tag-but-got-eof", // "Unexpected end of file. Expected end tag (%(name)s).",
  html_two_heads = "two-heads-are-not-better-than-one", // "Unexpected start tag head in existing head. Ignored.",
  html_head_unexp_opntag = "unexpected-start-tag-out-of-my-head", // "Unexpected start tag (%(name)s) that can be in head. Moved.",
  html_unexp_opntag = "unexpected-start-tag", // "Unexpected start tag (%(name)s).",
  html_unexp_opntag_as = "unexpected-start-tag-treated-as", // "Unexpected start tag (%(originalName)s). Treated as %(newName)s.",
  html_unexp_opntag_ignored = "unexpected-start-tag-ignored", // "Unexpected start tag %(name)s. Ignored.",
  html_unexp_opntag_to_endtag = "unexpected-start-tag-implies-end-tag", // "Unexpected start tag (%(startName)s) implies end tag (%(endName)s).",
  html_unexp_endtag = "unexpected-end-tag", // "Unexpected end tag (%(name)s). Ignored.",
  html_unexp_endtag_ignored = "unexpected-end-tag-ignored", // "Unexpected end tag %(name)s. Ignored.",
  html_unexp_chr = "unexpected-chars", // "Unexpected characters. Ignored.",
  "missing-end-tag" = "Missing end tag (%(name)s).",
  "missing-end-tags" = "Missing end tags (%(name)s).",
  //jjjj TOCLEANUP
  // "deprecated-tag" = "Unexpected start tag %(name)s. Don't use it!",
  html_wrong_endtag = "expected-one-end-tag-but-got-another", // "Unexpected end tag (%(gotName)s). Missing end tag (%(expectedName)s).",
  html_endtag_early = "end-tag-too-early", // "End tag (%(name)s) seen too early. Expected other end tag.",
  //jjjj TOCLEANUP
  // html_endtag_early_1 = "end-tag-too-early-named", // "Unexpected end tag (%(gotName)s). Expected end tag (%(expectedName)s).",
  html_endtag_early_ignored = "end-tag-too-early-ignored", // "End tag (%(name)s) seen too early. Ignored.",
  "adoption-agency-1.1" =
    "End tag (%(name)s) violates step 1, paragraph 1 of the adoption agency algorithm.",
  html_aaa_1_2 = "adoption-agency-1.2", // "End tag (%(name)s) violates step 1, paragraph 2 of the adoption agency algorithm.",
  html_aaa_1_3 = "adoption-agency-1.3", // "End tag (%(name)s) violates step 1, paragraph 3 of the adoption agency algorithm.",
  /*jjjj suggestion: formatting-element-not-in-scope */
  html_aaa_4_4 = "adoption-agency-4.4", // "End tag (%(name)s) violates step 4, paragraph 4 of the adoption agency algorithm.",
  html_unexp_endtag_as = "unexpected-end-tag-treated-as", // "Unexpected end tag (%(originalName)s). Treated as %(newName)s.",
  html_no_endtag = "no-end-tag", // "This element (%(name)s) has no end tag.",
  "unexpected-implied-end-tag-in-table" =
    "Unexpected implied end tag (%(name)s) in the table phase.",
  "unexpected-implied-end-tag-in-table-body" =
    "Unexpected implied end tag (%(name)s) in the table body phase.",
  html_table_unexp_hidden_input = "unexpected-hidden-input-in-table", // "Unexpected input with type hidden in table context.",
  html_table_unexp_form = "unexpected-form-in-table", // "Unexpected form in table context."
  html_table_voodoo_opntag = "unexpected-start-tag-implies-table-voodoo", // "Unexpected start tag (%(name)s) in table context caused voodoo mode."
  html_table_voodoo_endtag = "unexpected-end-tag-implies-table-voodoo", // "Unexpected end tag (%(name)s) in table context caused voodoo mode.",
  html_table_voodoo_char = "unexpected-character-implies-table-voodoo", // "Unexpected non-space characters in table context caused voodoo mode.",
  html_tbody_unexp_cell = "unexpected-cell-in-table-body", // "Unexpected table cell start tag (%(name)s) in the table body phase.",
  html_tbody_unexp_opntag = "unexpected-start-tag-in-table-body", // "Unexpected start tag (%(name)s) in the table body phase. Ignored.",
  html_tbody_unexp_endtag = "unexpected-end-tag-in-table-body", // "Unexpected end tag (%(name)s) in the table body phase. Ignored.",
  "unexpected-implied-end-tag-in-table-row" =
    "Unexpected implied end tag (%(name)s) in the table row phase.",
  html_tr_unexp_opntag = "unexpected-start-tag-in-table-row", // "Unexpected start tag (%(name)s) in the table row phase. Ignored.",
  html_tr_unexp_endtag = "unexpected-end-tag-in-table-row", // "Unexpected end tag (%(name)s) in the table row phase. Ignored.",
  html_cell_unexp_endtag = "unexpected-cell-end-tag", // "Got table cell end tag (%(name)s) while required end tags are missing.",
  html_select_unexp_select = "unexpected-select-in-select", // "Unexpected select start tag in the select phase treated as select end tag.",
  html_select_unexp_input = "unexpected-input-in-select", // "Unexpected input start tag in the select phase.",
  html_select_unexp_opntag = "unexpected-start-tag-in-select", // "Unexpected start tag token (%(name)s in the select phase. Ignored.",
  html_select_unexp_endtag = "unexpected-end-tag-in-select", // "Unexpected end tag (%(name)s) in the select phase. Ignored.",
  html_table_select_unexp_opntag =
    "unexpected-table-element-start-tag-in-select-in-table", // "Unexpected table element start tag (%(name)s) in the select in table phase."
  "unexpected-table-element-end-tag-in-select-in-table" =
    "Unexpected table element end tag (%(name)s) in the select in table phase.",
  html_no_body_scope = "expected-body-in-scope",
  html_body_unexp_chr = "unexpected-char-after-body", // "Unexpected non-space characters in the after body phase.",
  html_body_unexp_opntag = "unexpected-start-tag-after-body", // "Unexpected start tag token (%(name)s) in the after body phase.",
  html_body_unexp_endtag = "unexpected-end-tag-after-body", // "Unexpected end tag token (%(name)s) in the after UUU phase.",
  //jjjj TOCLEANUP
  // "unexpected-char-in-frameset" =
  //   "Unexpected characters in the frameset phase. Characters ignored.",
  // "unexpected-start-tag-in-frameset" =
  //   "Unexpected start tag token (%(name)s) in the frameset phase. Ignored.",
  // "unexpected-frameset-in-frameset-innerhtml" =
  //   "Unexpected end tag token (frameset) in the frameset phase (innerHTML).",
  // "unexpected-end-tag-in-frameset" =
  //   "Unexpected end tag token (%(name)s) in the frameset phase. Ignored.",
  // "unexpected-char-after-frameset" =
  //   "Unexpected non-space characters in the after frameset phase. Ignored.",
  // "unexpected-start-tag-after-frameset" =
  //   "Unexpected start tag (%(name)s) in the after frameset phase. Ignored.",
  // "unexpected-end-tag-after-frameset" =
  //   "Unexpected end tag (%(name)s) in the after frameset phase. Ignored.",
  "unexpected-end-tag-after-body-innerhtml" =
    "Unexpected end tag after body(innerHtml)",
  html_no_eof_chr = "expected-eof-but-got-char", // "Unexpected non-space characters. Expected end of file.",
  html_no_eof_opntag = "expected-eof-but-got-start-tag", // "Unexpected start tag (%(name)s). Expected end of file.",
  html_no_eof_endtag = "expected-eof-but-got-end-tag", // "Unexpected end tag (%(name)s). Expected end of file.",
  html_table_eof = "eof-in-table", // "Unexpected end of file. Expected table content.",
  html_select_eof = "eof-in-select", // "Unexpected end of file. Expected select content.",
  html_template_eof = "eof-in-template", // "Unexpected end of file. Expected template content.",
  //jjjj TOCLEANUP
  // "eof-in-frameset" = "Unexpected end of file. Expected frameset content.",
  // html_no_script_eof = "eof-in-script-in-script", // "Unexpected end of file. Expected script content.",
  "eof-in-foreign-lands" = "Unexpected end of file. Expected foreign content",
  //jjjj TOCLEANUP
  // "non-void-element-with-trailing-solidus" =
  //   "Trailing solidus not allowed on element %(name)s",
  html_foreign_unexp_html = "unexpected-html-element-in-foreign-content", // "Element %(name)s not allowed in a non-html context",
  html_unexp_endtag_html = "unexpected-end-tag-before-html", // "Unexpected end tag (%(name)s) before html.",
  html_noscript_unexp_tag = "unexpected-inhead-noscript-tag", // "Element %(name)s not allowed in a inhead-noscript context",
  html_noscript_unexp_chr = "char-in-head-noscript", // "Unexpected non-space character. Expected inhead-noscript content",
  html_noscript_eof = "eof-in-head-noscript", // "Unexpected end of file. Expected inhead-noscript content",
  html_XXX = "XXX-undefined-error", // "Undefined error (this sucks and should be fixed)",
  /* ~ */
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
  /* mdext */

  mdext_unexp_cloz = "Unexpected close for Block of mdext",
  /* Link */
  //jjjj TOCLEANUP
  // unrecognizable_linkdest = "The link destination is unrecognizable.",
}

//jjjj TOCLEANUP
// export type ErrRv = [ErrMsg, Ranval, string?];

//jjjj TOCLEANUP
// export type Err = ErrMsg | ErrRv;
// /**
//  * @constborrow @param lhs_x
//  * @constborrow @param rhs_x
//  */
// export const errMsgEq = (lhs_x: Err, rhs_x: Err): boolean => {
//   if (lhs_x === rhs_x) return true;

//   if (Is.array(lhs_x)) lhs_x = lhs_x[0];
//   if (Is.array(rhs_x)) rhs_x = rhs_x[0];
//   return lhs_x === rhs_x;
// };
export type Err = {
  msg: ErrMsg;
  rv?: Ranval;
  txt?: string;
  ts?: ts_t | undefined;
};

/** @final */
export class SortedErr extends SortedSet<Err> {
  /** @headconst @param val_a_x */
  constructor(val_a_x?: Err[]) {
    super(
      (a, b) => a.rv && b.rv ? a.rv.posS(b.rv) : false,
      val_a_x,
      (a, b) => a === b,
    );
  }
}
/*80--------------------------------------------------------------------------*/
/* Mocks for DENO */

export const rmvRangeMock = {
  setStartBefore(_node: Node) {},
  setEndAfter(_node: Node) {},
  deleteContents() {},
};

export const paleMock = {
  registCsscHandler(_h_x: MooHandler<CsscHexNorm>) {},
  removeCsscHandler(_h_x: MooHandler<CsscHexNorm>) {},
  cssc: "#000",
};
/*80--------------------------------------------------------------------------*/
