/** 80**************************************************************************
 * @module lib/compiling/html/HTMLLexr
 * @license MIT
 ******************************************************************************/

import { entityPrefix_o } from "@fe-src/data/html/entities.ts";
import { DEBUG, INOUT } from "@fe-src/preNs.ts";
import type { uint, uint16, uint8 } from "../../alias.ts";
import { Endpt } from "../../alias.ts";
import { assert, out } from "../../util.ts";
import {
  isASCIIAlpha,
  isASCIIAlphanumeric,
  isASCIIControl,
  isASCIIWs,
  isDecimalDigit,
  isHexDigit,
  isSurLead,
  isSurTral,
} from "../../util/string.ts";
import { ScanR } from "../alias.ts";
import type { Bufr } from "../Bufr.ts";
import { Lexr } from "../Lexr.ts";
import type { Loc } from "../Loc.ts";
import type { Ran } from "../Ran.ts";
import { g_ran_fac } from "../RanFac.ts";
import { Ranval } from "../Ranval.ts";
import { ErrMsg } from "../util.ts";
import type { ErrRepr, TokenRepr } from "./alias.ts";
import { State, TagNS } from "./alias.ts";
import { HTMLPazr } from "./HTMLPazr.ts";
import { HTMLTk } from "./HTMLTk.ts";
import { HTMLTok } from "./HTMLTok.ts";
import {
  Chr_LI,
  Comment_LI,
  Doctype_LI,
  entityOfPrefix,
  NumEntity_LI,
  Proins_LI,
  Tag_LI,
} from "./util.ts";
/*80--------------------------------------------------------------------------*/

enum ReturnState_ {
  Data,
  RCDATA,
  /** attribute value (double-quoted) state */
  attrVal_dq,
  /** attribute value (single-quoted) state */
  attrVal_sq,
  /** attribute value (unquoted) state */
  attrVal_uq,
}
/** @const @param rs_x */
const isAttr_ = (rs_x: ReturnState_): boolean =>
  rs_x === ReturnState_.attrVal_dq ||
  rs_x === ReturnState_.attrVal_sq ||
  rs_x === ReturnState_.attrVal_uq;

const nonchr_a_: uint[] = /* deno-fmt-ignore */ [
  0xFFFE, 0xFFFF, 0x1FFFE, 0x1FFFF, 0x2FFFE, 0x2FFFF, 0x3FFFE, 0x3FFFF,
  0x4FFFE, 0x4FFFF, 0x5FFFE, 0x5FFFF, 0x6FFFE, 0x6FFFF, 0x7FFFE, 0x7FFFF,
  0x8FFFE, 0x8FFFF, 0x9FFFE, 0x9FFFF, 0xAFFFE, 0xAFFFF, 0xBFFFE, 0xBFFFF,
  0xCFFFE, 0xCFFFF, 0xDFFFE, 0xDFFFF, 0xEFFFE, 0xEFFFF, 0xFFFFE, 0xFFFFF,
  0x10FFFE, 0x10FFFF
];
/**
 * [noncharacter](https://infra.spec.whatwg.org/#noncharacter)
 * @const @param _x
 */
const isNonchr_ = (_x: uint): boolean =>
  0xFDD0 <= _x && _x <= 0xFDEF || nonchr_a_.indexOf(_x) >= 0;

/**
 * [control](https://infra.spec.whatwg.org/#control)
 * @const @param _x
 */
const isCtrl_ = (_x: uint): boolean =>
  isASCIIControl(_x) || 0x80 <= _x && _x <= 0x9F;

/** In [13.2.5.80 Numeric character reference end state](https://html.spec.whatwg.org/multipage/parsing.html#numeric-character-reference-end-state) */
const Ctrl_m = new Map<uint8, uint16>(/* deno-fmt-ignore */ [
  [0x80, 0x20AC], [0x82, 0x201A], [0x83, 0x0192], [0x84, 0x201E], 
  [0x85, 0x2026], [0x86, 0x2020], [0x87, 0x2021], [0x88, 0x02C6],
  [0x89, 0x2030], [0x8A, 0x0160], [0x8B, 0x2039], [0x8C, 0x0152],
  [0x8E, 0x017D], [0x91, 0x2018], [0x92, 0x2019], [0x93, 0x201C],
  [0x94, 0x201D], [0x95, 0x2022], [0x96, 0x2013], [0x97, 0x2014],
  [0x98, 0x02DC], [0x99, 0x2122], [0x9A, 0x0161], [0x9B, 0x203A],
  [0x9C, 0x0153], [0x9E, 0x017E], [0x9F, 0x0178],
]);

//llll limit `VALVE` editing according to compiling
/** @final */
export class HTMLLexr extends Lexr<HTMLTok> {
  #state = State.Data;
  set state_$(_x: State) {
    this.#state = _x;
  }

  /** in lowercase */
  #lastTagname: string | undefined;
  set lastTagname_$(_x: string | undefined) {
    this.#lastTagname = _x;
  }

  override get _err_(): ErrRepr[] {
    const retA: ErrRepr[] = [];
    for (const tk of this.errTk_ss$) {
      retA.push(...(tk as HTMLTk)._err_);
    }
    return retA;
  }

  declare protected lsTk$: HTMLTk | undefined;
  //jjjj TOCLEANUP
  // set lsTk_$(_x: HTMLTk | undefined) {
  //   this.lsTk$ = _x;
  // }

  /* outTk$ */
  declare protected outTk$: HTMLTk | undefined;

  protected override genOutTk$(): HTMLTk {
    return new HTMLTk(this, g_ran_fac.byLoc(this.curLoc$));
  }
  /* ~ */

  #curQuot: /* '"' */ 0x22 | /* "'" */ 0x27 | undefined;
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  #pazr!: HTMLPazr;
  get _pazr_() {
    return this.#pazr;
  }

  /** @headconst @param bufr_x */
  private constructor(bufr_x: Bufr) {
    super(bufr_x);
    this.concatBdry$ = false;
    this.concatInnr$ = true;
  }
  /**
   * @headconst @param bufr_x
   * @const @param pazr_x
   */
  static create(bufr_x: Bufr) {
    const lexr = new HTMLLexr(bufr_x);
    lexr.#pazr = new HTMLPazr(lexr);
    return lexr;
  }

  override destructor(): void {
    super.destructor();
    this.#pazr.destructor();
  }

  override reset_Lexr(): this {
    super.reset_Lexr();
    this.#state = State.Data;
    //jjjj TOCLEANUP
    // this.#pazr = new HTMLPazr(this);
    this.#pazr.reset_Pazr();
    return this;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  protected override linkNextTk$(prevTk_x: HTMLTk, scandTk_x: HTMLTk): HTMLTk {
    const retTk = super.linkNextTk$(prevTk_x, scandTk_x) as HTMLTk;
    if (retTk === this.stopLexTk$) {
      this.#pazr.cleanup_$(this.curLoc$);
    } else {
      this.#pazr.pazScandTk_$(retTk);
    }
    return retTk;
  }

  /** @headconst @param scandTks_x */
  #lexScandTks(...scandTks_x: HTMLTk[]): HTMLTk {
    /*#static*/ if (INOUT) {
      assert(scandTks_x.length);
      assert(this.lsTk$);
    }
    let i_ = 0;
    //jjjj TOCLEANUP
    // let retTk = this.lsTk$;
    // if (!retTk) {
    //   retTk = scandTks_x[0];
    //   i_ = 1;
    // }
    let retTk = this.lsTk$!;
    for (const iI = scandTks_x.length; i_ < iI; i_++) {
      retTk = this.linkNextTk$(retTk, scandTks_x[i_]);
      if (retTk.isErr) this.errTk_ss$.add(retTk);
      retTk.syncRanval(); //!
      this.scandTk_a$.push(retTk);
    }
    /*! to prevent `linkNextTk$()` and `scandTk_a$.push()` in `lex_impl$()` */
    this.lsTk$ = undefined;
    return retTk;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** @out @param outTk_x */
  @out((self: HTMLLexr, _1, args) => {
    const tk_ = args[0] ?? self.outTk$!;
    assert(tk_.value === HTMLTok.doctype);
  })
  _scanDoctype(outTk_x = this.outTk$!): void {
    /*#static*/ if (INOUT) {
      assert(outTk_x.sntStrtLoc.posE(this.curLoc$, -9));
      using ran_u = outTk_x.ran_$.usingDup();
      ran_u.stopLoc.become_Loc(this.curLoc$);
      assert(ran_u.getText().toLowerCase() === "<!doctype");
    }
    if (this.reachLexBdry$()) {
      outTk_x.setErr({
        msg: ErrMsg.html_doctype_eof,
        rv: Ranval.fromLoc(this.curLoc$),
      }).setStop(this.curLoc$, HTMLTok.doctype)
        .lexdInfo = new Doctype_LI(undefined, false);
      return;
    }

    let ucod = this.curLoc$.ucod;
    if (ucod === /* ">" */ 0x3E) {
      outTk_x.setErr({
        msg: ErrMsg.html_doctype_no_name,
        rv: Ranval.fromLoc(this.curLoc$),
      }).setStop(this.curLoc$.forw(), HTMLTok.doctype)
        .lexdInfo = new Doctype_LI(undefined, false);
      return;
    }

    if (isASCIIWs(ucod)) {
      if (this.skipASCIIWs$() === ScanR.reachBdry) {
        outTk_x.setErr({
          msg: ErrMsg.html_doctype_eof,
          rv: Ranval.fromLoc(this.curLoc$),
        }).setStop(this.curLoc$, HTMLTok.doctype)
          .lexdInfo = new Doctype_LI(undefined, false);
        return;
      }
      ucod = this.curLoc$.ucod;
      if (ucod === /* ">" */ 0x3E) {
        outTk_x.setErr({
          msg: ErrMsg.html_doctype_no_name,
          rv: Ranval.fromLoc(this.curLoc$),
        }).setStop(this.curLoc$.forw(), HTMLTok.doctype)
          .lexdInfo = new Doctype_LI(undefined, false);
        return;
      }
    } else {
      outTk_x.setErr({
        msg: ErrMsg.html_doctype_nosp_name,
        rv: Ranval.fromLoc(this.curLoc$),
      });
    }

    const name_u = outTk_x.ran_$.usingDup();
    name_u.strtLoc.become_Loc(this.curLoc$);
    /*
    [13.2.5.55 DOCTYPE name state](https://html.spec.whatwg.org/multipage/parsing.html#doctype-name-state)
    */ {
      this.#checkChrForw_1();

      const VALVE = 1_000;
      let valve = VALVE;
      for (
        ucod = this.curLoc$.ucod;
        !this.reachLexBdry$() && !isASCIIWs(ucod) && ucod !== /* ">" */ 0x3E &&
        --valve;
        ucod = this.curLoc$.ucod
      ) {
        this.#checkChrForw_1();
      }
      assert(valve, `Loop ${VALVE}(±1) times!`);

      name_u.stopLoc.become_Loc(this.curLoc$);
    }

    if (this.reachLexBdry$()) {
      outTk_x.setErr({
        msg: ErrMsg.html_doctype_eof,
        rv: Ranval.fromLoc(this.curLoc$),
      }).setStop(this.curLoc$, HTMLTok.doctype)
        .lexdInfo = new Doctype_LI(name_u, false);
      return;
    }
    if (isASCIIWs(ucod)) {
      if (this.skipASCIIWs$() === ScanR.reachBdry) {
        outTk_x.setErr({
          msg: ErrMsg.html_doctype_eof,
          rv: Ranval.fromLoc(this.curLoc$),
        }).setStop(this.curLoc$, HTMLTok.doctype)
          .lexdInfo = new Doctype_LI(name_u, false);
        return;
      }
      ucod = this.curLoc$.ucod;
    }
    if (ucod === /* ">" */ 0x3E) {
      outTk_x.setStop(this.curLoc$.forw(), HTMLTok.doctype)
        .lexdInfo = new Doctype_LI(name_u, true);
      return;
    }

    /** including quotes */
    let sys_u: Ran | undefined;

    /**
     * [13.2.5.68 Bogus DOCTYPE state](https://html.spec.whatwg.org/multipage/parsing.html#bogus-doctype-state)
     * @const @param correct_y
     */
    const bogus_ = (correct_y: boolean): void => {
      const VALVE = 1_000;
      let valve = VALVE;
      for (
        ucod = this.curLoc$.ucod;
        !this.reachLexBdry$() && ucod !== /* ">" */ 0x3E && --valve;
        ucod = this.curLoc$.ucod
      ) {
        this.#checkChrForw_1();
      }
      assert(valve, `Loop ${VALVE}(±1) times!`);

      if (ucod === /* ">" */ 0x3E) this.curLoc$.forw();
      outTk_x.setStop(this.curLoc$, HTMLTok.doctype)
        .lexdInfo = new Doctype_LI(name_u, correct_y, sys_u);
    };

    using ran_u = outTk_x.ran_$.usingDup();
    ran_u.strtLoc.become_Loc(this.curLoc$);
    ran_u.collapseTo(Endpt.anchr);
    ran_u.stopLoc.forwn(6);
    if (this.reachLexBdry$(ran_u.stopLoc)) {
      if (ran_u.getText().toUpperCase() === "SYSTEM") {
        this.curLoc$.become_Loc(ran_u.stopLoc);
        outTk_x.setErr({
          msg: ErrMsg.html_doctype_eof,
          rv: Ranval.fromLoc(this.curLoc$),
        }).setStop(this.curLoc$, HTMLTok.doctype)
          .lexdInfo = new Doctype_LI(name_u, false, sys_u);
      } else {
        outTk_x.setErr({
          msg: ErrMsg.html_doctype_name_inval,
          rv: Ranval.fromLoc(this.curLoc$),
        });
        bogus_(false);
      }
      return;
    }
    if (ran_u.getText().toUpperCase() !== "SYSTEM") {
      outTk_x.setErr({
        msg: ErrMsg.html_doctype_name_inval,
        rv: Ranval.fromLoc(this.curLoc$),
      });
      bogus_(false);
      return;
    }

    ucod = this.curLoc$.become_Loc(ran_u.stopLoc).ucod;
    /*
    [13.2.5.63 After DOCTYPE system keyword state](https://html.spec.whatwg.org/multipage/parsing.html#after-doctype-system-keyword-state)
    [13.2.5.64 Before DOCTYPE system identifier state](https://html.spec.whatwg.org/multipage/parsing.html#before-doctype-system-identifier-state)
    */ {
      if (isASCIIWs(ucod)) {
        if (this.skipASCIIWs$() === ScanR.reachBdry) {
          outTk_x.setErr({
            msg: ErrMsg.html_doctype_eof,
            rv: Ranval.fromLoc(this.curLoc$),
          }).setStop(this.curLoc$, HTMLTok.doctype)
            .lexdInfo = new Doctype_LI(name_u, false, sys_u);
          return;
        }
        ucod = this.curLoc$.ucod;
        if (ucod === /* ">" */ 0x3E) {
          outTk_x.setErr({
            msg: ErrMsg.html_doctype_sys_noid,
            rv: Ranval.fromLoc(this.curLoc$),
          }).setStop(this.curLoc$.forw(), HTMLTok.doctype)
            .lexdInfo = new Doctype_LI(name_u, false);
          return;
        }
        if (ucod !== /* '"' */ 0x22 && ucod !== /* "'" */ 0x27) {
          outTk_x.setErr({
            msg: ErrMsg.html_doctype_sysid_noquot,
            rv: Ranval.fromLoc(this.curLoc$),
          });
          bogus_(false);
          return;
        }
      } else if (ucod === /* '"' */ 0x22 || ucod === /* "'" */ 0x27) {
        outTk_x.setErr({
          msg: ErrMsg.html_doctype_sys_nosp,
          rv: Ranval.fromLoc(this.curLoc$),
        });
      } else if (ucod === /* ">" */ 0x3E) {
        outTk_x.setErr({
          msg: ErrMsg.html_doctype_sys_noid,
          rv: Ranval.fromLoc(this.curLoc$),
        }).setStop(this.curLoc$.forw(), HTMLTok.doctype)
          .lexdInfo = new Doctype_LI(name_u, false);
        return;
      } else {
        outTk_x.setErr({
          msg: ErrMsg.html_doctype_sysid_noquot,
          rv: Ranval.fromLoc(this.curLoc$),
        });
        bogus_(false);
        return;
      }
    }

    /*
    [13.2.5.65 DOCTYPE system identifier (double-quoted) state](https://html.spec.whatwg.org/multipage/parsing.html#doctype-system-identifier-(double-quoted)-state)
    [13.2.5.66 DOCTYPE system identifier (single-quoted) state](https://html.spec.whatwg.org/multipage/parsing.html#doctype-system-identifier-(single-quoted)-state)
    */ {
      this.#curQuot = ucod as /* '"' */ 0x22 | /* "'" */ 0x27;
      sys_u = outTk_x.ran_$.usingDup();
      sys_u.strtLoc.become_Loc(this.curLoc$);
      this.curLoc$.forw();

      const VALVE = 1000;
      let valve = VALVE;
      for (
        ucod = this.curLoc$.ucod;
        !this.reachLexBdry$() && ucod !== this.#curQuot &&
        ucod !== /* ">" */ 0x3E && --valve;
        ucod = this.curLoc$.ucod
      ) {
        this.#checkChrForw_1();
      }
      assert(valve, `Loop ${VALVE}(±1) times!`);
      this.#curQuot = undefined;

      if (this.reachLexBdry$()) {
        sys_u.stopLoc.become_Loc(this.curLoc$);
        outTk_x.setErr({
          msg: ErrMsg.html_doctype_eof,
          rv: Ranval.fromLoc(this.curLoc$),
        }).setStop(this.curLoc$, HTMLTok.doctype)
          .lexdInfo = new Doctype_LI(name_u, false, sys_u);
        return;
      }
      if (ucod === /* ">" */ 0x3E) {
        sys_u.stopLoc.become_Loc(this.curLoc$);
        outTk_x.setErr({
          msg: ErrMsg.html_doctype_sysid_abrupt,
          rv: Ranval.fromLoc(this.curLoc$),
        }).setStop(this.curLoc$.forw(), HTMLTok.doctype)
          .lexdInfo = new Doctype_LI(name_u, false, sys_u);
        return;
      }

      ucod = this.curLoc$.forw().ucod;
      sys_u.stopLoc.become_Loc(this.curLoc$);
    }

    /*
    [13.2.5.67 After DOCTYPE system identifier state](https://html.spec.whatwg.org/multipage/parsing.html#after-doctype-system-identifier-state)
    */ {
      if (this.reachLexBdry$()) {
        outTk_x.setErr({
          msg: ErrMsg.html_doctype_eof,
          rv: Ranval.fromLoc(this.curLoc$),
        }).setStop(this.curLoc$, HTMLTok.doctype)
          .lexdInfo = new Doctype_LI(name_u, false, sys_u);
        return;
      }
      if (isASCIIWs(ucod)) {
        if (this.skipASCIIWs$() === ScanR.reachBdry) {
          outTk_x.setErr({
            msg: ErrMsg.html_doctype_eof,
            rv: Ranval.fromLoc(this.curLoc$),
          }).setStop(this.curLoc$, HTMLTok.doctype)
            .lexdInfo = new Doctype_LI(name_u, false, sys_u);
          return;
        }
        ucod = this.curLoc$.ucod;
      }
      if (ucod === /* ">" */ 0x3E) {
        outTk_x.setStop(this.curLoc$.forw(), HTMLTok.doctype)
          .lexdInfo = new Doctype_LI(name_u, true, sys_u);
      } else {
        outTk_x.setErr({
          msg: ErrMsg.html_doctype_sysid_unexp,
          rv: Ranval.fromLoc(this.curLoc$),
        });
        bogus_(true);
      }
    }
  }
  /*36||||||||||||||||||||||||||||||*/

  /** @out @param outTk_x */
  @out((self: HTMLLexr, _1, args) => {
    const tk_ = args[0] ?? self.outTk$!;
    assert(
      (tk_.value === HTMLTok.tag || tk_.value === HTMLTok.bogus) &&
        tk_.lexdInfo instanceof Tag_LI,
    );
  })
  private _scanTag(outTk_x = this.outTk$!): void {
    /** peek Loc */
    using poc_u = this.curLoc$.usingDup();
    /*#static*/ if (INOUT) {
      poc_u.back();
      if (outTk_x.sntStrtLoc.posE(poc_u)) {
        assert(poc_u.ucod === /* "<" */ 0x3C);
      } else {
        assert(poc_u.ucod === /* "/" */ 0x2F);
        poc_u.back();
        assert(
          outTk_x.sntStrtLoc.posE(poc_u) && poc_u.ucod === /* "<" */ 0x3C,
        );
      }
      poc_u.become_Loc(this.curLoc$);
      assert(isASCIIAlpha(poc_u.ucod));
    }
    const tagname_u = outTk_x.ran_$.usingDup();
    tagname_u.strtLoc.become_Loc(this.curLoc$);
    tagname_u.stopLoc.become_Loc(this.curLoc$);
    const tag_li = new Tag_LI(tagname_u, poc_u.back().ucod === /* "/" */ 0x2F);
    outTk_x.lexdInfo = tag_li;

    /*
    [13.2.5.8 Tag name state](https://html.spec.whatwg.org/multipage/parsing.html#tag-name-state)
    [13.2.5.11 RCDATA end tag name state](https://html.spec.whatwg.org/multipage/parsing.html#rcdata-end-tag-name-state)
    [13.2.5.14 RAWTEXT end tag name state](https://html.spec.whatwg.org/multipage/parsing.html#rawtext-end-tag-name-state)
    [13.2.5.17 Script data end tag name state](https://html.spec.whatwg.org/multipage/parsing.html#script-data-end-tag-name-state)
    [13.2.5.25 Script data escaped end tag name state](https://html.spec.whatwg.org/multipage/parsing.html#script-data-escaped-end-tag-name-state)
    */ {
      let ucod = this.curLoc$.forw().ucod;

      const VALVE = 1_000;
      let valve = VALVE;
      for (; !this.reachLexBdry$() && --valve; ucod = this.curLoc$.ucod) {
        if (this.#state === State.Data) {
          if (
            isASCIIWs(ucod) || ucod === /* "/" */ 0x2F ||
            ucod === /* ">" */ 0x3E
          ) break;
        } else {
          if (!isASCIIAlpha(ucod)) break;
        }

        this.#checkChrForw_1(outTk_x);
      }
      assert(valve, `Loop ${VALVE}(±1) times!`);

      if (
        this.#state === State.Data ||
        isASCIIWs(ucod) || ucod === /* "/" */ 0x2F || ucod === /* ">" */ 0x3E
      ) {
        tagname_u.stopLoc.become_Loc(this.curLoc$);
      }

      if (this.#state !== State.Data && tag_li.isEnd) {
        /* Anything else
        */ if (
          (!isASCIIWs(ucod) && ucod !== /* "/" */ 0x2F &&
              ucod !== /* ">" */ 0x3E ||
            this.#lastTagname !== undefined &&
              tag_li.tagname_s !== this.#lastTagname) &&
          !isASCIIAlpha(ucod)
        ) {
          outTk_x.setStop(this.curLoc$, HTMLTok.bogus);
          return;
        }
      }
    }

    let /** attribute name */ an_u: Ran | undefined,
      /** attribute value */ av_u: Ran | undefined,
      anv_: [Ran, Ran | undefined],
      clozd = false;

    const VALVE = 10_000;
    let valve = VALVE;
    /*
    [13.2.5.32 Before attribute name state](https://html.spec.whatwg.org/multipage/parsing.html#before-attribute-name-state)
    ~
    [13.2.5.40 Self-closing start tag state](https://html.spec.whatwg.org/multipage/parsing.html#self-closing-start-tag-state)
    */
    for (let ucod = this.curLoc$.ucod; !this.reachLexBdry$() && --valve;) {
      if (isASCIIWs(ucod)) {
        if (this.skipASCIIWs$() === ScanR.reachBdry) break;
      }
      ucod = this.curLoc$.ucod;
      if (ucod === /* ">" */ 0x3E) {
        this.curLoc$.forw();
        clozd = true;
        break;
      }

      if (ucod === /* "/" */ 0x2F) {
        ucod = this.curLoc$.forw().ucod;
        if (this.reachLexBdry$()) break;

        if (ucod === /* ">" */ 0x3E) {
          tag_li.selfCloz_$ = true;
          this.curLoc$.forw();
          clozd = true;
          break;
        }

        outTk_x.setErr({
          msg: ErrMsg.html_tag_unexp_solidus,
          rv: Ranval.fromLoc(this.curLoc$),
        });
        continue;
      }

      an_u = outTk_x.ran_$.usingDup();
      an_u.strtLoc.become_Loc(this.curLoc$);
      if (ucod === /* "=" */ 0x3D) {
        outTk_x.setErr({
          msg: ErrMsg.html_tag_unexp_eqsign,
          rv: Ranval.fromLoc(this.curLoc$),
        });
        ucod = this.curLoc$.forw().ucod;
      }
      for (; !this.reachLexBdry$() && --valve; ucod = this.curLoc$.ucod) {
        if (isASCIIWs(ucod)) break;
        if (ucod === /* ">" */ 0x3E) break;
        if (ucod === /* "/" */ 0x2F) {
          poc_u.become_Loc(this.curLoc$).forw();
          if (!this.reachLexBdry$(poc_u) && poc_u.ucod === /* ">" */ 0x3E) {
            break;
          }
          outTk_x.setErr({
            msg: ErrMsg.html_tag_unexp_solidus,
            rv: Ranval.fromLoc(poc_u),
          });
          break;
        }
        if (ucod === /* "=" */ 0x3D) break;

        if (
          ucod === /* '"' */ 0x22 || ucod === /* "'" */ 0x27 ||
          ucod === /* "<" */ 0x3C
        ) {
          outTk_x.setErr({
            msg: ErrMsg.html_tag_an_unexp_chr,
            rv: Ranval.fromLoc(this.curLoc$),
          });
          this.curLoc$.forw();
        } else {
          this.#checkChrForw_1(outTk_x);
        }
      }
      assert(valve, `Loop ${VALVE}(±1) times!`);

      an_u.stopLoc.become_Loc(this.curLoc$);
      if (tag_li.attrs.hasAn(an_u)) {
        outTk_x.setErr({
          msg: ErrMsg.html_tag_an_dup,
          rv: Ranval.fromLoc(this.curLoc$),
        });
      }
      anv_ = [an_u, undefined];
      tag_li.attrs.addAttr(anv_);

      if (this.reachLexBdry$()) break;
      if (isASCIIWs(ucod)) {
        if (this.skipASCIIWs$() === ScanR.reachBdry) break;
      } else if (
        ucod === /* "/" */ 0x2F &&
        poc_u.become_Loc(this.curLoc$).forw().ucod !== /* ">" */ 0x3E
      ) {
        this.curLoc$.forw();
      }
      ucod = this.curLoc$.ucod;

      if (ucod === /* "=" */ 0x3D) {
        ucod = this.curLoc$.forw().ucod;
        if (this.reachLexBdry$()) break;
        if (isASCIIWs(ucod)) {
          if (this.skipASCIIWs$() === ScanR.reachBdry) break;
        }

        ucod = this.curLoc$.ucod;
        if (ucod === /* ">" */ 0x3E) {
          outTk_x.setErr({
            msg: ErrMsg.html_tag_av_no,
            rv: Ranval.fromLoc(this.curLoc$),
          });
          this.curLoc$.forw();
          clozd = true;
          break;
        }

        av_u = outTk_x.ran_$.usingDup();
        av_u.strtLoc.become_Loc(this.curLoc$);
        anv_[1] = av_u;
        if (ucod === /* '"' */ 0x22 || ucod === /* "'" */ 0x27) {
          this.#curQuot = ucod as /* '"' */ 0x22 | /* "'" */ 0x27;
          const rs_ = this.#curQuot === /* '"' */ 0x22
            ? ReturnState_.attrVal_dq
            : ReturnState_.attrVal_sq;
          L_0: for (
            ucod = this.curLoc$.forw().ucod;
            !this.reachLexBdry$() && ucod !== this.#curQuot && --valve;
            ucod = this.curLoc$.ucod
          ) {
            if (ucod === /* "&" */ 0x26) {
              /* deno-fmt-ignore */ switch (this.#scanChrref(rs_, tag_li)) {
                case ScanR.reachBdry: break L_0;
                case ScanR.continue: continue L_0;
                case ScanR.return: continue;
              }
            }

            this.#checkChrForw_1(outTk_x);
          }
          assert(valve, `Loop ${VALVE}(±1) times!`);

          if (this.reachLexBdry$()) {
            av_u.stopLoc.become_Loc(this.curLoc$);
            break;
          }
          ucod = this.curLoc$.forw().ucod;
          av_u.stopLoc.become_Loc(this.curLoc$);

          /* [13.2.5.39 After attribute value (quoted) state](https://html.spec.whatwg.org/multipage/parsing.html#after-attribute-value-(quoted)-state)
          */ if (
            !isASCIIWs(ucod) && ucod !== /* "/" */ 0x2F &&
            ucod !== /* ">" */ 0x3E && !this.reachLexBdry$()
          ) {
            outTk_x!.setErr({
              msg: ErrMsg.html_tag_nosp_attrs,
              rv: Ranval.fromLoc(this.curLoc$),
            });
          }
        } else {
          this.#curQuot = undefined;
          const rs_ = ReturnState_.attrVal_uq;
          L_0: do {
            if (isASCIIWs(ucod) || ucod === /* ">" */ 0x3E) break;

            if (ucod === /* "&" */ 0x26) {
              /* deno-fmt-ignore */ switch (this.#scanChrref(rs_, tag_li)) {
                case ScanR.reachBdry: break L_0;
                case ScanR.continue: break;
                case ScanR.return: break;
              }
            } else {
              if (
                ucod === /* '"' */ 0x22 || ucod === /* "'" */ 0x27 ||
                ucod === /* "<" */ 0x3C || ucod === /* "=" */ 0x3D ||
                ucod === /* "`" */ 0x60
              ) {
                outTk_x.setErr({
                  msg: ErrMsg.html_tag_av_unexp_chr,
                  rv: Ranval.fromLoc(this.curLoc$),
                });
                this.curLoc$.forw();
              } else {
                this.#checkChrForw_1(outTk_x);
              }
            }
            ucod = this.curLoc$.ucod;
          } while (!this.reachLexBdry$() && --valve);
          assert(valve, `Loop ${VALVE}(±1) times!`);

          av_u.stopLoc.become_Loc(this.curLoc$);
        }
      }
    }
    assert(valve, `Loop ${VALVE}(±1) times!`);

    poc_u.become_Loc(this.curLoc$).back();
    const tok = poc_u.ucod === /* ">" */ 0x3E ? HTMLTok.tag : HTMLTok.bogus;
    if (!clozd) {
      outTk_x.setErr({
        msg: ErrMsg.html_tag_eof,
        rv: Ranval.fromLoc(this.curLoc$),
      });
    }
    outTk_x.setStop(this.curLoc$, tok);

    if (tok === HTMLTok.tag && tag_li.isEnd) {
      if (tag_li.attrs.ran_a.length) {
        const anv_ = tag_li.attrs.ran_a.at(-1)!;
        outTk_x.setErr({
          msg: ErrMsg.html_endtag_attrs,
          rv: Ranval.fromLoc((anv_[1] ?? anv_[0]).stopLoc),
          ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
        });
      }
      if (tag_li.selfCloz_$) {
        poc_u.become_Loc(this.curLoc$).back();
        outTk_x.setErr({
          msg: ErrMsg.html_endtag_trail_solidus,
          rv: Ranval.fromLoc(poc_u),
        });
        tag_li.selfCloz_$ = false;
      }
    }
  }

  /**
   * "</"\
   * `in( this.curLoc$.ucod === 0x2F)`
   */
  #scanMatchTag(): ScanR {
    const ucod_2 = this.curLoc$.forw().ucod;
    if (this.reachLexBdry$()) return ScanR.reachBdry;

    if (isASCIIAlpha(ucod_2) && this.#lastTagname !== undefined) {
      using loc_u = this.curLoc$.usingDup().backn(2);
      const tagTk = this.genOutTk$();
      tagTk.sntStrtLoc.become_Loc(loc_u);
      this._scanTag(tagTk);
      const tag_li = tagTk.lexdInfo as Tag_LI;
      /*#static*/ if (INOUT) {
        assert(tag_li.isEnd);
      }
      if (tag_li.tagname_s === this.#lastTagname) {
        if (this.outTk$!.sntStrtLoc.posS(loc_u)) {
          this.outTk$!.setStop(tagTk.sntStrtLoc, HTMLTok.character);
          this.outTk$!.lexdInfo ??= new Chr_LI(this.#state);
          this.outTk$ = this.#lexScandTks(this.outTk$!, tagTk);
        } else {
          this.outTk$!.destructor(); //!
          this.outTk$ = tagTk;
        }
        this.#lastTagname = undefined;
        this.#state = State.Data;
        return ScanR.return;
      }

      tagTk.destructor();
    } else {
      this.curLoc$.forw();
    }
    return ScanR.continue;
  }
  /*36||||||||||||||||||||||||||||||*/

  /**
   * scan Processing instruction
   * @out @param outTk_x
   */
  @out((self: HTMLLexr, _1, args) => {
    const tk_ = args[0] ?? self.outTk$!;
    assert(
      tk_.value === HTMLTok.proins && tk_.lexdInfo instanceof Proins_LI ||
        tk_.value === HTMLTok.comment && tk_.lexdInfo instanceof Comment_LI ||
        tk_.value === HTMLTok.bogus && tk_.lexdInfo instanceof Chr_LI,
    );
  })
  private _scanProins(outTk_x = this.outTk$!): void {
    /** peek Loc */
    using poc_u = this.curLoc$.usingDup();
    /*#static*/ if (INOUT) {
      poc_u.back();
      assert(poc_u.ucod === /* "?" */ 0x3F);
      poc_u.back();
      assert(outTk_x.sntStrtLoc.posE(poc_u) && poc_u.ucod === /* "<" */ 0x3C);
      poc_u.become_Loc(this.curLoc$);
      assert(isASCIIAlpha(poc_u.ucod) || poc_u.ucod === /* "_" */ 0x5F);
    }
    const target_u = outTk_x.ran_$.usingDup();
    target_u.strtLoc.become_Loc(this.curLoc$);
    const li_ = new Proins_LI(target_u);

    let ucod = this.curLoc$.forw().ucod;
    const VALVE = 1_000_000;
    let valve = VALVE;

    /*
    [13.2.5.73 Processing instruction target state](https://html.spec.whatwg.org/multipage/parsing.html#processing-instruction-target-state)
    */ {
      for (
        ;
        !this.reachLexBdry$() &&
        (isASCIIAlphanumeric(ucod) ||
          ucod === /* "-" */ 0x2D || ucod === /* "_" */ 0x5F) &&
        --valve;
        ucod = this.curLoc$.forw().ucod
      );
      assert(valve, `Loop ${VALVE}(±1) times!`);

      if (this.reachLexBdry$()) {
        outTk_x.setErr({
          msg: ErrMsg.html_pi_eof,
          rv: Ranval.fromLoc(this.curLoc$),
        });
        li_.destructor(); //!
        outTk_x.setStop(this.curLoc$, HTMLTok.bogus);
        return;
      }

      if (
        !isASCIIWs(ucod) && ucod !== /* "?" */ 0x3F && ucod !== /* ">" */ 0x3E
      ) {
        outTk_x.setErr({
          msg: ErrMsg.html_pi_target_inval,
          rv: Ranval.fromLoc(this.curLoc$),
        });
        li_.destructor(); //!
        this.curLoc$.become_Loc(poc_u).back();
        this._scanBogusComment(outTk_x);
        return;
      }

      target_u.stopLoc.become_Loc(this.curLoc$);
      const target_s = target_u.getText().toLowerCase();
      if (target_s === "xml" || target_s === "xml-stylesheet") {
        outTk_x.setErr({
          msg: ErrMsg.html_pi_target_disallow,
          rv: Ranval.fromLoc(this.curLoc$),
        });
        li_.destructor(); //!
        this.curLoc$.become_Loc(poc_u).back();
        this._scanBogusComment(outTk_x);
        return;
      }
    }

    /*
    [13.2.5.74 After processing instruction target state](https://html.spec.whatwg.org/multipage/parsing.html#after-processing-instruction-target-state)
    [13.2.5.75 Processing instruction data state](https://html.spec.whatwg.org/multipage/parsing.html#processing-instruction-data-state)
    [13.2.5.76 Processing instruction questionable state](https://html.spec.whatwg.org/multipage/parsing.html#processing-instruction-questionable-state)
    */ {
      if (isASCIIWs(ucod)) {
        if (this.skipASCIIWs$() === ScanR.reachBdry) {
          outTk_x.setErr({
            msg: ErrMsg.html_pi_eof,
            rv: Ranval.fromLoc(this.curLoc$),
          });
          li_.destructor(); //!
          outTk_x.setStop(this.curLoc$, HTMLTok.bogus);
          return;
        }
      }

      /**
       * Use `poc_u`. If return true, `poc_u` will be after ">", and `curLoc$`
       * will be at the end of data.
       * @const
       */
      const end_ = (): boolean => {
        if (this.curLoc$.ucod === /* ">" */ 0x3E) {
          poc_u.become_Loc(this.curLoc$).forw();
          return true;
        }

        if (this.curLoc$.ucod === /* "?" */ 0x3F) {
          poc_u.become_Loc(this.curLoc$).forw();
          if (poc_u.ucod === /* ">" */ 0x3E) {
            poc_u.forw();
            return true;
          }
        }

        return false;
      };

      if (end_()) {
        outTk_x.setStop(this.curLoc$.become_Loc(poc_u), HTMLTok.proins)
          .lexdInfo = li_;
        return;
      }

      const data_u = target_u.usingDup();
      data_u.strtLoc.become_Loc(this.curLoc$);
      li_.data_$ = data_u;
      for (
        this.curLoc$.forw();
        !this.reachLexBdry$() && !end_() && --valve;
        this.curLoc$.forw()
      );
      assert(valve, `Loop ${VALVE}(±1) times!`);

      if (this.reachLexBdry$()) {
        outTk_x.setErr({
          msg: ErrMsg.html_pi_eof,
          rv: Ranval.fromLoc(this.curLoc$),
        });
        li_.destructor(); //!
        outTk_x.setStop(this.curLoc$, HTMLTok.bogus);
        return;
      }

      data_u.stopLoc.become_Loc(this.curLoc$);
      outTk_x.setStop(this.curLoc$.become_Loc(poc_u), HTMLTok.proins)
        .lexdInfo = li_;
    }
  }
  /*36||||||||||||||||||||||||||||||*/

  /** @out @param outTk_x */
  @out((self: HTMLLexr, _1, args) => {
    const tk_ = args[0] ?? self.outTk$!;
    assert(tk_.value === HTMLTok.comment);
  })
  private _scanComment(outTk_x = this.outTk$!): void {
    /*#static*/ if (INOUT) {
      assert(outTk_x.sntStrtLoc.posE(this.curLoc$, -4));
      using ran_u = outTk_x.ran_$.usingDup();
      ran_u.stopLoc.become_Loc(this.curLoc$);
      assert(ran_u.getText() === "<!--");
    }
    const data_u = outTk_x.ran_$.usingDup();
    data_u.strtLoc.become_Loc(this.curLoc$);
    const li_ = new Comment_LI(data_u);

    let ucod = this.curLoc$!.ucod,
      clozd = false;

    const VALVE = 1_000_000;
    let valve = VALVE;

    /**
     * [13.2.5.44 Comment start dash state](https://html.spec.whatwg.org/multipage/parsing.html#comment-start-dash-state)\
     * `curLoc$` is at "-" following a "-"
     */
    const start_dash_ = (): ScanR => {
      ucod = this.curLoc$.forw().ucod;
      if (this.reachLexBdry$()) {
        data_u.stopLoc.become_Loc(this.curLoc$).back();
        return ScanR.reachBdry;
      }

      if (ucod === /* "-" */ 0x2D) {
        return end_();
      }

      if (ucod === /* ">" */ 0x3E) {
        data_u.collapseTo(Endpt.anchr); //! no `data` in this case
        outTk_x.setErr({
          msg: ErrMsg.html_comment_abrupt_cloz,
          rv: Ranval.fromLoc(this.curLoc$),
        });
        this.curLoc$.forw();
        clozd = true;
        return ScanR.return;
      }

      return ScanR.continue;
    };

    /**
     * [13.2.5.50 Comment end dash state](https://html.spec.whatwg.org/multipage/parsing.html#comment-end-dash-state)\
     * `curLoc$` is at first "-" following a non-"-"
     */
    const end_dash_ = (): ScanR => {
      ucod = this.curLoc$.forw().ucod;
      if (this.reachLexBdry$()) {
        data_u.stopLoc.become_Loc(this.curLoc$).back();
        return ScanR.reachBdry;
      }

      if (ucod === /* "-" */ 0x2D) {
        return end_();
      }

      return ScanR.continue;
    };

    /**
     * [13.2.5.51 Comment end state](https://html.spec.whatwg.org/multipage/parsing.html#comment-end-state)\
     * `curLoc$` is at second "-"
     */
    const end_ = (): ScanR => {
      if (!--valve) assert(valve, `Loop ${VALVE}(±1) times!`);

      ucod = this.curLoc$.forw().ucod;
      if (this.reachLexBdry$()) {
        data_u.stopLoc.become_Loc(this.curLoc$).backn(2);
        return ScanR.reachBdry;
      }

      if (ucod === /* ">" */ 0x3E) {
        data_u.stopLoc.become_Loc(this.curLoc$).backn(2);
        this.curLoc$.forw();
        clozd = true;
        return ScanR.return;
      }

      if (ucod === /* "-" */ 0x2D) {
        return end_();
      }

      if (ucod === /* "!" */ 0x21) {
        ucod = this.curLoc$.forw().ucod;
        if (this.reachLexBdry$()) {
          data_u.stopLoc.become_Loc(this.curLoc$).backn(3);
          return ScanR.reachBdry;
        }

        if (ucod === /* "-" */ 0x2D) {
          return end_dash_();
        }

        if (ucod === /* ">" */ 0x3E) {
          data_u.stopLoc.become_Loc(this.curLoc$).backn(3);
          outTk_x.setErr({
            msg: ErrMsg.html_comment_inval_cloz,
            rv: Ranval.fromLoc(this.curLoc$),
          });
          this.curLoc$.forw();
          clozd = true;
          return ScanR.return;
        }
      }

      return ScanR.continue;
    };

    /**
     * [13.2.5.46 Comment less-than sign state](https://html.spec.whatwg.org/multipage/parsing.html#comment-less-than-sign-state)
     * ~
     * [13.2.5.49 Comment less-than sign bang dash dash state](https://html.spec.whatwg.org/multipage/parsing.html#comment-less-than-sign-bang-dash-dash-state)
     */
    const less_than_sign_ = (): ScanR => {
      if (!--valve) assert(valve, `Loop ${VALVE}(±1) times!`);

      ucod = this.curLoc$.forw().ucod;
      if (this.reachLexBdry$()) {
        data_u.stopLoc.become_Loc(this.curLoc$);
        return ScanR.reachBdry;
      }

      if (ucod === /* "<" */ 0x3C) {
        return less_than_sign_();
      }

      if (ucod === /* "!" */ 0x21) {
        ucod = this.curLoc$.forw().ucod;
        if (this.reachLexBdry$()) {
          data_u.stopLoc.become_Loc(this.curLoc$);
          return ScanR.reachBdry;
        }

        if (ucod === /* "-" */ 0x2D) {
          ucod = this.curLoc$.forw().ucod;
          if (this.reachLexBdry$()) {
            data_u.stopLoc.become_Loc(this.curLoc$);
            return ScanR.reachBdry;
          }

          if (ucod === /* "-" */ 0x2D) {
            using loc_u = this.curLoc$.usingDup().forw();
            if (this.reachLexBdry$(loc_u) || loc_u.ucod === /* ">" */ 0x3E) {
              return end_();
            }

            this.curLoc$.forw();
            outTk_x.setErr({
              msg: ErrMsg.html_comment_nested,
              rv: Ranval.fromLoc(this.curLoc$),
            });
          }
        }
      }

      return ScanR.continue;
    };

    /** ucod before `curloc$` */
    let ucod_1 = /* "-" */ 0x2D;
    L_0: for (; --valve; ucod = this.curLoc$.ucod) {
      if (this.reachLexBdry$()) {
        data_u.stopLoc.become_Loc(this.curLoc$);
        break;
      }

      /*
      [13.2.5.43 Comment start state](https://html.spec.whatwg.org/multipage/parsing.html#comment-start-state)
      */ if (ucod_1 === /* "-" */ 0x2D) {
        if (ucod === /* "-" */ 0x2D) {
          /* deno-fmt-ignore */ switch (start_dash_()) {
            case ScanR.reachBdry: break L_0;
            case ScanR.continue: break;
            case ScanR.return: break L_0;
          }
        } else if (ucod === /* ">" */ 0x3E) {
          outTk_x.setErr({
            msg: ErrMsg.html_comment_abrupt_cloz,
            rv: Ranval.fromLoc(this.curLoc$),
          });
          this.curLoc$.forw();
          clozd = true;
          break;
        }
      }
      ucod_1 = ucod;
      /*
      [13.2.5.45 Comment state](https://html.spec.whatwg.org/multipage/parsing.html#comment-state)
      */ if (ucod === /* "<" */ 0x3C) {
        /* deno-fmt-ignore */ switch (less_than_sign_()) {
          case ScanR.reachBdry: break L_0;
          case ScanR.continue: break;
          case ScanR.return: break L_0;
        }
      } else if (ucod === /* "-" */ 0x2D) {
        /* deno-fmt-ignore */ switch (end_dash_()) {
          case ScanR.reachBdry: break L_0;
          case ScanR.continue: break;
          case ScanR.return: break L_0;
        }
        if (ucod === /* ">" */ 0x3E) {
          ucod_1 = ucod;
          this.curLoc$.forw();
        }
      } else {
        this.#checkChrForw_1();
      }
    }
    assert(valve, `Loop ${VALVE}(±1) times!`);

    if (!clozd) {
      outTk_x.setErr({ msg: ErrMsg.html_comment_eof });
    }
    outTk_x.setStop(this.curLoc$, HTMLTok.comment)
      .lexdInfo = li_;
  }

  /**
   * [13.2.5.41 Bogus comment state](https://html.spec.whatwg.org/multipage/parsing.html#bogus-comment-state)
   * @out @param outTk_x
   */
  @out((self: HTMLLexr, _1, args) => {
    const tk_ = args[0] ?? self.outTk$!;
    assert(tk_.value === HTMLTok.comment && tk_.lexdInfo instanceof Comment_LI);
  })
  private _scanBogusComment(outTk_x = this.outTk$!): void {
    /*#static*/ if (INOUT) {
      using loc_u = this.curLoc$.usingDup().back();
      if (loc_u.ucod !== /* "<" */ 0x3C) {
        assert(loc_u.ucod === /* "!" */ 0x21 || loc_u.ucod === /* "/" */ 0x2F);
        assert(loc_u.back().ucod === /* "<" */ 0x3C);
      }
      assert(outTk_x.sntStrtLoc.posE(loc_u));
    }
    const data_u = outTk_x.ran_$.usingDup();
    data_u.strtLoc.become_Loc(this.curLoc$);
    const li_ = new Comment_LI(data_u);

    const VALVE = 1_000_000;
    let valve = VALVE;
    for (
      let ucod = this.curLoc$.ucod;
      !this.reachLexBdry$() && ucod !== /* ">" */ 0x3E && --valve;
      ucod = this.curLoc$.ucod
    ) {
      this.#checkChrForw_1();
    }
    assert(valve, `Loop ${VALVE}(±1) times!`);

    data_u.stopLoc.become_Loc(this.curLoc$);
    if (!this.reachLexBdry$()) {
      data_u.stopLoc.become_Loc(this.curLoc$);
      this.curLoc$.forw();
    }
    outTk_x.setStop(this.curLoc$, HTMLTok.comment)
      .lexdInfo = li_;
  }
  /*36||||||||||||||||||||||||||||||*/

  /**
   * [13.2.5.78 Named character reference state](https://html.spec.whatwg.org/multipage/parsing.html#named-character-reference-state)
   * @const @param rs_x
   * @headconst @param ctxLi_x
   */
  @out((self: HTMLLexr, _1, args) => {
    const crTk_a = args[1] instanceof Tag_LI
      ? args[1].attrs.crTk_a
      : args[1]?.crTk_a;
    const tkVal = crTk_a?.at(-1)?.value ?? self.outTk$!.value;
    assert(tkVal === HTMLTok.character || tkVal === HTMLTok.chrref);
  })
  private _scanNamedChrref(
    rs_x: ReturnState_,
    ctxLi_x?: Tag_LI | Chr_LI,
  ): void {
    let tk_: HTMLTk;
    let crTk_a: HTMLTk[] | undefined;
    if (ctxLi_x) {
      tk_ = this.genOutTk$();
      tk_.sntStrtLoc.back();
      crTk_a = ctxLi_x instanceof Tag_LI
        ? ctxLi_x.attrs.crTk_a
        : ctxLi_x.crTk_a;
    } else {
      tk_ = this.outTk$!;
    }

    /** return attribute value state */
    const ra_ = isAttr_(rs_x);
    /** peek Ran */
    using pan_u = tk_.ran_$.usingDup();
    pan_u.strtLoc.become_Loc(this.curLoc$);
    /*#static*/ if (INOUT) {
      if (ra_) assert(ctxLi_x);
      else if (rs_x !== ReturnState_.RCDATA) assert(!ctxLi_x);

      pan_u.strtLoc.back();
      assert(pan_u.strtLoc.ucod === /* "&" */ 0x26);
      assert(tk_.sntStrtLoc.posSE(pan_u.strtLoc));
      pan_u.strtLoc.become_Loc(this.curLoc$);
    }
    pan_u.strtLoc.back();

    let prefix = "";
    const VALVE = 100;
    let valve = VALVE;
    do {
      prefix += this.curLoc$.uchr_forw();
      const entity = entityOfPrefix(prefix);
      if (entity === undefined) {
        if (this.reachLexBdry$()) {
          /* E.g.: "&Cap"
          */ if (
            Object.hasOwn(entityPrefix_o, prefix + ";") &&
            tk_.value !== HTMLTok.unknown
          ) {
            this.curLoc$.become_Loc(tk_.sntStopLoc);
          } else {
            tk_.setStop(this.curLoc$, HTMLTok.character);
          }
          break;
        }

        continue;
      }

      if (entity === null) {
        if (tk_.value !== HTMLTok.unknown) {
          this.curLoc$.become_Loc(tk_.sntStopLoc);
        } else {
          this.curLoc$.back();
          /* E.g.: '<h a="&lang=">' with `prefix` "lang="
          */ if (
            ra_ && Object.hasOwn(entityPrefix_o, `${prefix.slice(0, -1)};`)
          ) {
            /* no-ops */
          } else {
            let ucod = this.curLoc$.ucod;
            for (; isASCIIAlphanumeric(ucod); ucod = this.curLoc$.forw().ucod);
            if (ucod === /* ";" */ 0x3B) {
              tk_.setErr({
                msg: ErrMsg.html_chrref_unknown,
                rv: Ranval.fromLoc(this.curLoc$),
              });
              this.curLoc$.forw();
            }
          }
          tk_.setStop(this.curLoc$, HTMLTok.character);
        }
        break;
      }

      const dt_ = entity.nam.length - 1 - prefix.length;
      if (dt_ > 0 && this.reachLexBdry$(undefined, dt_ - 1)) {
        if (tk_.value !== HTMLTok.unknown) {
          this.curLoc$.become_Loc(tk_.sntStopLoc);
        } else {
          tk_.setErr({ msg: ErrMsg.html_chrref_unknown })
            .setStop(this.curLoc$, HTMLTok.character);
        }
        break;
      }

      let ucod = this.curLoc$.ucod;
      for (let i = dt_; i--;) {
        ucod = this.curLoc$.forw().ucod;
        if (ucod === /* ";" */ 0x3B) {
          this.curLoc$.forw();
          break;
        }
      }
      pan_u.stopLoc.become_Loc(this.curLoc$);
      if (pan_u.getText() !== entity.nam) {
        if (tk_.value !== HTMLTok.unknown) {
          this.curLoc$.become_Loc(tk_.sntStopLoc);
        } else {
          for (; isASCIIAlphanumeric(ucod); ucod = this.curLoc$.forw().ucod);
          if (ucod === /* ";" */ 0x3B) {
            tk_.setErr({
              msg: ErrMsg.html_chrref_unknown,
              rv: Ranval.fromLoc(this.curLoc$),
            });
            this.curLoc$.forw();
          }
          tk_.setStop(this.curLoc$, HTMLTok.character);
        }
        break;
      }

      tk_.setStop(this.curLoc$);
      if (
        ra_ && entity.nam.at(-1) !== ";" &&
        (this.curLoc$.ucod === /* "=" */ 0x3D ||
          isASCIIAlphanumeric(this.curLoc$.ucod))
      ) {
        tk_.setValue(HTMLTok.character);
      } else {
        tk_.setValue(HTMLTok.chrref);
        if (entity.nam.at(-1) !== ";") {
          tk_.setErr({
            msg: ErrMsg.html_chrref_no_semicolon,
            rv: Ranval.fromLoc(this.curLoc$),
            ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
          });
        } else {
          /* Any `.setErr()` besides the above one is returned immediately. */
          tk_.clrErr();
        }
        tk_.lexdInfo = entity;
      }
      // this.#state = rs_x;
    } while (!this.reachLexBdry$() && --valve);
    assert(valve, `Loop ${VALVE}(±1) times!`);

    //kkkk use `#scanChrAndTk()`?
    if (tk_.sntStrtLoc.posS(pan_u.strtLoc)) {
      const chrrefTk = tk_.dup_HTMLTk();
      chrrefTk.setStrt(pan_u.strtLoc)
        .lexdInfo = tk_.lexdInfo;
      tk_.setStop(pan_u.strtLoc, HTMLTok.character);
      tk_.lexdInfo = new Chr_LI(this.#state);
      this.outTk$ = this.#lexScandTks(tk_, chrrefTk);
    } else {
      if (tk_.value === HTMLTok.character) {
        tk_.lexdInfo ??= new Chr_LI(this.#state);
      }
      crTk_a?.push(tk_);
    }
  }

  /**
   * [13.2.5.75 Numeric character reference state](https://html.spec.whatwg.org/multipage/parsing.html#numeric-character-reference-state)
   * @headconst @param ctxLi_x
   */
  @out((self: HTMLLexr, _1, args) => {
    const crTk_a = args[0] instanceof Tag_LI
      ? args[0].attrs.crTk_a
      : args[0]?.crTk_a;
    const tkVal = crTk_a?.at(-1)?.value ?? self.outTk$!.value;
    assert(tkVal === HTMLTok.character || tkVal === HTMLTok.chrref);
  })
  private _scanNumericChrref(ctxLi_x?: Tag_LI | Chr_LI): ScanR {
    let tk_: HTMLTk;
    let crTk_a: HTMLTk[] | undefined;
    if (ctxLi_x) {
      tk_ = this.genOutTk$();
      tk_.sntStrtLoc.backn(2);
      crTk_a = ctxLi_x instanceof Tag_LI
        ? ctxLi_x.attrs.crTk_a
        : ctxLi_x.crTk_a;
    } else {
      tk_ = this.outTk$!;
    }

    /** peek Loc */
    using poc_u = this.curLoc$.usingDup();
    /*#static*/ if (INOUT) {
      poc_u.back();
      assert(poc_u.ucod === /* "#" */ 0x23);
      poc_u.back();
      assert(poc_u.ucod === /* "&" */ 0x26);
      assert(tk_.sntStrtLoc.posSE(poc_u));
      poc_u.become_Loc(this.curLoc$);
    }
    poc_u.backn(2);

    /**
     * [13.2.5.80 Numeric character reference end state](https://html.spec.whatwg.org/multipage/parsing.html#numeric-character-reference-end-state)\
     * Set `lexdInfo` a new `NumEntity_LI`\
     * May `tk_y.setErr()`
     * @const @param num_x
     * @headconst @param tk_y
     */
    const setLI_ = (num_x: bigint, tk_y: HTMLTk): void => {
      let num: uint;
      if (num_x === 0n) {
        tk_y.setErr({
          msg: ErrMsg.html_chrref_null,
          ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
        });
        num = 0xFFFD;
      } else if (num_x > 0x10FFFF) {
        tk_y.setErr({
          msg: ErrMsg.html_chrref_exceed,
          ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
        });
        num = 0xFFFD;
      } else if (isSurLead(num_x) || isSurTral(num_x)) {
        tk_y.setErr({ msg: ErrMsg.html_chrref_surrogate });
        num = 0xFFFD;
      } else {
        num = Number(num_x);
        if (isNonchr_(num)) {
          tk_y.setErr({ msg: ErrMsg.html_chrref_nonchr });
        } else if (isCtrl_(num) && !isASCIIWs(num)) {
          tk_y.setErr({ msg: ErrMsg.html_chrref_control });
          num = Ctrl_m.get(num) ?? num;
        }
      }
      tk_y.lexdInfo = new NumEntity_LI(num);
    };

    /** @const @param num_y */
    const setTk_ = (num_y: bigint): void => {
      //kkkk use `#scanChrAndTk()`?
      if (tk_.sntStrtLoc.posS(poc_u)) {
        const chrrefTk = this.genOutTk$();
        chrrefTk.sntStrtLoc.become_Loc(poc_u);
        if (!this.reachLexBdry$() && this.curLoc$.ucod === /* ";" */ 0x3B) {
          this.curLoc$.forw();
        } else {
          chrrefTk.setErr({
            msg: ErrMsg.html_chrref_no_semicolon,
            rv: Ranval.fromLoc(this.curLoc$),
            ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
          });
        }
        chrrefTk.setStop(this.curLoc$, HTMLTok.chrref);
        setLI_(num_y, chrrefTk);
        tk_.setStop(poc_u, HTMLTok.character);
        tk_.lexdInfo ??= new Chr_LI(this.#state);
        this.outTk$ = this.#lexScandTks(tk_, chrrefTk);
      } else {
        if (!this.reachLexBdry$() && this.curLoc$.ucod === /* ";" */ 0x3B) {
          this.curLoc$.forw();
        } else {
          tk_.setErr({
            msg: ErrMsg.html_chrref_no_semicolon,
            rv: Ranval.fromLoc(this.curLoc$),
            ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
          });
        }
        tk_.setStop(this.curLoc$, HTMLTok.chrref);
        setLI_(num_y, tk_);
        crTk_a?.push(tk_);
      }
    };

    /** range of numeric string */
    using ran_u = tk_.ran_$.usingDup();
    if (
      this.curLoc$.ucod === /* "X" */ 0x58 ||
      this.curLoc$.ucod === /* "x" */ 0x78
    ) {
      this.curLoc$.forw();
      if (this.reachLexBdry$() || !isHexDigit(this.curLoc$.ucod)) {
        tk_.setErr({
          msg: ErrMsg.html_chrref_no_digits,
          rv: Ranval.fromLoc(this.curLoc$),
        }).setStop(this.curLoc$, HTMLTok.character);
        return ScanR.reachBdry;
      }

      ran_u.strtLoc.become_Loc(this.curLoc$);
      const VALVE = 10_000;
      let valve = VALVE;
      do {
        this.curLoc$.forw();
      } while (
        !this.reachLexBdry$() && isHexDigit(this.curLoc$.ucod) && --valve
      );
      assert(valve, `Loop ${VALVE}(±1) times!`);
      ran_u.stopLoc.become_Loc(this.curLoc$);
      setTk_(BigInt(`0x${ran_u.getText()}`));
    } else {
      if (this.reachLexBdry$() || !isDecimalDigit(this.curLoc$.ucod)) {
        tk_.setErr({
          msg: ErrMsg.html_chrref_no_digits,
          rv: Ranval.fromLoc(this.curLoc$),
        }).setStop(this.curLoc$, HTMLTok.character);
        return ScanR.reachBdry;
      }

      ran_u.strtLoc.become_Loc(this.curLoc$);
      const VALVE = 10_000;
      let valve = VALVE;
      do {
        this.curLoc$.forw();
      } while (
        !this.reachLexBdry$() && isDecimalDigit(this.curLoc$.ucod) && --valve
      );
      assert(valve, `Loop ${VALVE}(±1) times!`);
      ran_u.stopLoc.become_Loc(this.curLoc$);
      setTk_(BigInt(ran_u.getText()));
    }
    return ScanR.return;
  }

  /**
   * `in( this.curLoc$.ucod === 0x26)`
   * @const @param rs_x
   * @headconst @param ctxLi_x
   */
  #scanChrref(rs_x: ReturnState_, ctxLi_x?: Tag_LI | Chr_LI): ScanR {
    const ucod_1 = this.curLoc$.forw().ucod;
    if (this.reachLexBdry$()) return ScanR.reachBdry;

    if (isASCIIAlphanumeric(ucod_1)) {
      this._scanNamedChrref(rs_x, ctxLi_x);
      return ScanR.return;
    } else if (ucod_1 === /* "#" */ 0x23) {
      this.curLoc$.forw();
      this._scanNumericChrref(ctxLi_x);
      return ScanR.return;
    }
    return ScanR.continue;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  #skipScriptEscaped(): void {
    /*#static*/ if (INOUT) {
      using ran_u = this.outTk$!.ran_$.usingDup();
      ran_u.stopLoc.become_Loc(this.curLoc$).forw();
      ran_u.strtLoc.become_Loc(this.curLoc$).backn(3);
      assert(ran_u.getText() === "<!--");
    }
    let ucod;

    const VALVE = 1_000_000;
    let valve = VALVE;

    /**
     * [13.2.5.20 Script data escaped state](https://html.spec.whatwg.org/multipage/parsing.html#script-data-escaped-state)
     */
    const escaped_ = (): void => {
      for (
        ucod = this.curLoc$.ucod;
        !this.reachLexBdry$() && --valve;
        ucod = this.curLoc$.forw().ucod
      ) {
        if (ucod === /* "-" */ 0x2D) {
          ucod = this.curLoc$.forw().ucod;
          if (this.reachLexBdry$()) break;

          if (ucod === /* "-" */ 0x2D) {
            escaped_dash_dash_();
            return;
          }
        }

        if (ucod === /* "<" */ 0x3C) {
          escaped_less_than_sign_();
          return;
        }

        if (ucod === 0) {
          this.outTk$!.setErr({
            msg: ErrMsg.html_unexp_null,
            rv: Ranval.fromLoc(this.curLoc$),
          });
        }
      }
      assert(valve, `Loop ${VALVE}(±1) times!`);

      this.outTk$!.setErr({
        msg: ErrMsg.html_script_cmt_eof,
        rv: Ranval.fromLoc(this.curLoc$),
      });
    };

    /**
     * [13.2.5.22 Script data escaped dash dash state](https://html.spec.whatwg.org/multipage/parsing.html#script-data-escaped-dash-dash-state)
     */
    const escaped_dash_dash_ = (): void => {
      if (!--valve) assert(valve, `Loop ${VALVE}(±1) times!`);

      ucod = this.curLoc$.forw().ucod;
      if (this.reachLexBdry$()) {
        this.outTk$!.setErr({
          msg: ErrMsg.html_script_cmt_eof,
          rv: Ranval.fromLoc(this.curLoc$),
        });
      } else if (ucod === /* "-" */ 0x2D) {
        escaped_dash_dash_();
      } else if (ucod === /* "<" */ 0x3C) {
        escaped_less_than_sign_();
      } else if (ucod === /* ">" */ 0x3E) {
        this.curLoc$.forw();
      } else {
        escaped_();
      }
    };

    /**
     * [13.2.5.23 Script data escaped less-than sign state](https://html.spec.whatwg.org/multipage/parsing.html#script-data-escaped-less-than-sign-state)
     */
    const escaped_less_than_sign_ = (): void => {
      if (!--valve) assert(valve, `Loop ${VALVE}(±1) times!`);

      ucod = this.curLoc$.forw().ucod;
      if (this.reachLexBdry$()) {
        this.outTk$!.setErr({
          msg: ErrMsg.html_script_cmt_eof,
          rv: Ranval.fromLoc(this.curLoc$),
        });
      } else if (ucod === /* "/" */ 0x2F) {
        /* deno-fmt-ignore */ switch (this.#scanMatchTag()) {
          case ScanR.reachBdry: break;
          case ScanR.continue: break;
          case ScanR.return: return;
        }
        escaped_();
      } else if (isASCIIAlpha(ucod)) {
        /* [13.2.5.26 Script data double escape start state](https://html.spec.whatwg.org/multipage/parsing.html#script-data-double-escape-start-state) */
        using ran_u = this.outTk$!.ran_$.usingDup();
        ran_u.strtLoc.become_Loc(this.curLoc$);
        ucod = this.curLoc$.forw().ucod;
        for (
          let i = 0;
          !this.reachLexBdry$() && isASCIIAlpha(ucod) &&
          i++ < 7 && --valve;
          ucod = this.curLoc$.forw().ucod
        );
        if (this.reachLexBdry$()) {
          escaped_();
          return;
        }

        ran_u.stopLoc.become_Loc(this.curLoc$);
        if (
          (isASCIIWs(ucod) || ucod === /* "/" */ 0x2F ||
            ucod === /* ">" */ 0x3E) &&
          ran_u.getText().toLowerCase() === "script"
        ) {
          this.curLoc$.forw();
          double_escaped_();
        } else {
          escaped_();
        }
      } else {
        escaped_();
      }
    };

    /**
     * [13.2.5.27 Script data double escaped state](https://html.spec.whatwg.org/multipage/parsing.html#script-data-double-escaped-state)
     */
    const double_escaped_ = (): void => {
      for (
        ucod = this.curLoc$.ucod;
        !this.reachLexBdry$() && --valve;
        ucod = this.curLoc$.forw().ucod
      ) {
        if (ucod === /* "-" */ 0x2D) {
          ucod = this.curLoc$.forw().ucod;
          if (this.reachLexBdry$()) break;

          if (ucod === /* "-" */ 0x2D) {
            double_escaped_dash_dash_();
            return;
          }
        }

        if (ucod === /* "<" */ 0x3C) {
          double_escaped_less_than_sign_();
          return;
        }

        if (ucod === 0) {
          this.outTk$!.setErr({
            msg: ErrMsg.html_unexp_null,
            rv: Ranval.fromLoc(this.curLoc$),
          });
        }
      }
      assert(valve, `Loop ${VALVE}(±1) times!`);

      this.outTk$!.setErr({
        msg: ErrMsg.html_script_cmt_eof,
        rv: Ranval.fromLoc(this.curLoc$),
      });
    };

    /**
     * [13.2.5.29 Script data double escaped dash dash state](https://html.spec.whatwg.org/multipage/parsing.html#script-data-double-escaped-dash-dash-state)
     */
    const double_escaped_dash_dash_ = (): void => {
      if (!--valve) assert(valve, `Loop ${VALVE}(±1) times!`);

      ucod = this.curLoc$.forw().ucod;
      if (this.reachLexBdry$()) {
        this.outTk$!.setErr({
          msg: ErrMsg.html_script_cmt_eof,
          rv: Ranval.fromLoc(this.curLoc$),
        });
      } else if (ucod === /* "-" */ 0x2D) {
        double_escaped_dash_dash_();
      } else if (ucod === /* "<" */ 0x3C) {
        double_escaped_less_than_sign_();
      } else if (ucod === /* ">" */ 0x3E) {
        this.curLoc$.forw();
      } else {
        double_escaped_();
      }
    };

    /**
     * [13.2.5.30 Script data double escaped less-than sign state](https://html.spec.whatwg.org/multipage/parsing.html#script-data-double-escaped-less-than-sign-state)
     */
    const double_escaped_less_than_sign_ = (): void => {
      if (!--valve) assert(valve, `Loop ${VALVE}(±1) times!`);

      ucod = this.curLoc$.forw().ucod;
      if (this.reachLexBdry$()) {
        this.outTk$!.setErr({
          msg: ErrMsg.html_script_cmt_eof,
          rv: Ranval.fromLoc(this.curLoc$),
        });
      } else if (ucod === /* "/" */ 0x2F) {
        /* [13.2.5.31 Script data double escape end state](https://html.spec.whatwg.org/multipage/parsing.html#script-data-double-escape-end-state) */
        let ucod_2 = this.curLoc$.forw().ucod;
        using ran_u = this.outTk$!.ran_$.usingDup();
        ran_u.strtLoc.become_Loc(this.curLoc$);
        for (
          let i = 0;
          !this.reachLexBdry$() && isASCIIAlpha(ucod_2) &&
          i++ < 7 && --valve;
          ucod_2 = this.curLoc$.forw().ucod
        );
        if (this.reachLexBdry$()) {
          double_escaped_();
        } else {
          ran_u.stopLoc.become_Loc(this.curLoc$);
          if (
            (isASCIIWs(ucod_2) || ucod_2 === /* "/" */ 0x2F ||
              ucod_2 === /* ">" */ 0x3E) &&
            ran_u.getText().toLowerCase() === "script"
          ) {
            this.curLoc$.forw();
            escaped_();
          } else {
            double_escaped_();
          }
        }
      } else {
        double_escaped_();
      }
    };

    escaped_dash_dash_();
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** `in( this.#state === State.Data)` */
  #scan_in_Data(): void {
    let allWs = true;
    const VALVE = 1_000_000;
    let valve = VALVE;
    L_0: do {
      /* [13.2.5.1 Data state](https://html.spec.whatwg.org/multipage/parsing.html#data-state) */
      switch (this.curLoc$.ucod) {
        case /* "&" */ 0x26:
          if (allWs && this.curLoc$.posG(this.outTk$!.sntStrtLoc)) break L_0;
          allWs = false;

          /* deno-fmt-ignore */ switch (this.#scanChrref(ReturnState_.Data)) {
            case ScanR.reachBdry: break L_0;
            case ScanR.continue: break;
            case ScanR.return: return;
          }
          break;
        case /* "<" */ 0x3C: {
          if (allWs && this.curLoc$.posG(this.outTk$!.sntStrtLoc)) break L_0;
          allWs = false;

          /** peek Loc */
          using poc_u = this.curLoc$.usingDup();

          /* [13.2.5.6 Tag open state](https://html.spec.whatwg.org/multipage/parsing.html#tag-open-state) */
          const ucod_1 = this.curLoc$.forw().ucod;
          if (this.reachLexBdry$()) {
            this.outTk$!.setErr({
              msg: ErrMsg.html_tagname_eof,
              rv: Ranval.fromLoc(this.curLoc$),
            });
            break L_0;
          }

          if (ucod_1 === /* "!" */ 0x21) {
            /* [13.2.5.42 Markup declaration open state](https://html.spec.whatwg.org/multipage/parsing.html#markup-declaration-open-state) */
            this.curLoc$.forw();
            using ran_u = this.outTk$!.ran_$.usingDup();
            ran_u.strtLoc.become_Loc(this.curLoc$);
            ran_u.collapseTo(Endpt.anchr);
            if (this.reachLexBdry$(ran_u.stopLoc.forw())) {
              this.outTk$!.setErr({
                msg: ErrMsg.html_comment_inval_open,
                rv: Ranval.fromLoc(this.curLoc$),
              });
              this.#scanChrAndTk(poc_u, this._scanBogusComment.bind(this));
              return;
            }
            ran_u.stopLoc.forw();
            if (ran_u.getText() === "--") {
              this.curLoc$.become_Loc(ran_u.stopLoc);
              this.#scanChrAndTk(poc_u, this._scanComment.bind(this));
              return;
            }

            if (this.reachLexBdry$(ran_u.stopLoc.forwn(4))) {
              this.outTk$!.setErr({
                msg: ErrMsg.html_comment_inval_open,
                rv: Ranval.fromLoc(this.curLoc$),
              });
              this.#scanChrAndTk(poc_u, this._scanBogusComment.bind(this));
              return;
            }
            ran_u.stopLoc.forw();
            const t_ = ran_u.getText();
            if (t_.toLowerCase() === "doctype") {
              this.curLoc$.become_Loc(ran_u.stopLoc);
              this.#scanChrAndTk(poc_u, this._scanDoctype.bind(this));
              return;
            } else if (t_ === "[CDATA[") {
              if (this.#pazr.curTagNS === TagNS.HTML) {
                this.outTk$!.setErr({
                  msg: ErrMsg.html_cdata_html,
                  rv: Ranval.fromLoc(ran_u.stopLoc),
                });
                this.#scanChrAndTk(poc_u, this._scanBogusComment.bind(this));
              } else {
                this.#state = State.CDATA;
                if (this.outTk$!.sntStrtLoc.posS(poc_u)) {
                  this.outTk$!.setStop(poc_u, HTMLTok.character);
                } else {
                  this.outTk$!.lexdInfo?.destructor();
                  this.outTk$!.lexdInfo = new Chr_LI(this.#state);
                  this.curLoc$.become_Loc(ran_u.stopLoc);
                  this.#scan_in_CDATA();
                }
              }
              return;
            }

            this.outTk$!.setErr({
              msg: ErrMsg.html_comment_inval_open,
              rv: Ranval.fromLoc(this.curLoc$),
            });
            this.#scanChrAndTk(poc_u, this._scanBogusComment.bind(this));
            return;
          }

          if (ucod_1 === /* "/" */ 0x2F) {
            /* [13.2.5.7 End tag open state](https://html.spec.whatwg.org/multipage/parsing.html#end-tag-open-state) */
            const ucod_2 = this.curLoc$.forw().ucod;
            if (this.reachLexBdry$()) {
              this.outTk$!.setErr({
                msg: ErrMsg.html_tagname_eof,
                rv: Ranval.fromLoc(this.curLoc$),
              });
              break L_0;
            }

            if (isASCIIAlpha(ucod_2)) {
              this.#scanChrAndTk(poc_u, this._scanTag.bind(this));
              return;
            }

            if (ucod_2 === /* ">" */ 0x3E) {
              /* </> */
              this.outTk$!.setErr({
                msg: ErrMsg.html_endtag_no,
                rv: Ranval.fromLoc(this.curLoc$),
              });
              this.#scanChrAndTk(poc_u, (tk_y = this.outTk$!) => {
                tk_y.setStop(this.curLoc$.forw(), HTMLTok.bogus)
                  .lexdInfo = null; //!
              });
              return;
            }

            this.outTk$!.setErr({
              msg: ErrMsg.html_tagname_inval_1stchr,
              rv: Ranval.fromLoc(this.curLoc$),
            });
            this.#scanChrAndTk(poc_u, this._scanBogusComment.bind(this));
            return;
          }

          if (isASCIIAlpha(ucod_1)) {
            this.#scanChrAndTk(poc_u, this._scanTag.bind(this));
            return;
          }

          /*
          [13.2.5.72 Processing instruction open state](https://html.spec.whatwg.org/multipage/parsing.html#processing-instruction-open-state)
          */ if (ucod_1 === /* "?" */ 0x3F) {
            const ucod_2 = this.curLoc$.forw().ucod;
            if (this.reachLexBdry$()) {
              this.outTk$!.setErr({
                msg: ErrMsg.html_pi_eof,
                rv: Ranval.fromLoc(this.curLoc$),
              });
              this.#scanChrAndTk(
                poc_u,
                (tk_y = this.outTk$!) =>
                  tk_y.setStop(this.curLoc$, HTMLTok.bogus),
              );
              return;
            }

            if (!isASCIIAlpha(ucod_2) && ucod_2 !== /* "_" */ 0x5F) {
              this.outTk$!.setErr({
                msg: ErrMsg.html_pi_target_inval_1stchr,
                rv: Ranval.fromLoc(this.curLoc$),
              });
              this.curLoc$.back();
              this.#scanChrAndTk(poc_u, this._scanBogusComment.bind(this));
              return;
            }

            this.#scanChrAndTk(poc_u, this._scanProins.bind(this));
            return;
          }

          this.outTk$!.setErr({
            msg: ErrMsg.html_tagname_inval_1stchr,
            rv: Ranval.fromLoc(this.curLoc$),
          });
          if (isSurLead(ucod_1) || isSurTral(ucod_1)) {
            for (
              let ucod = this.curLoc$.forw().ucod;
              isSurLead(ucod) || isSurTral(ucod);
              ucod = this.curLoc$.forw().ucod
            );
          } else if (ucod_1 !== /* "<" */ 0x3C) {
            this.#checkChrForw_1();
          }
          break L_0;
        }
        default:
          if (allWs) {
            if (this.curLoc$.posG(this.outTk$!.sntStrtLoc)) break L_0;
            if (!isASCIIWs(this.curLoc$.ucod)) allWs = false;
          }

          this.#checkChrForw();
          break;
      }
    } while (!this.reachLexBdry$() && --valve);
    assert(valve, `Loop ${VALVE}(±1) times!`);

    this.outTk$!.setStop(this.curLoc$, HTMLTok.character);
  }

  /** `in( this.#state === State.RCDATA)` */
  #scan_in_RCDATA(): void {
    /* Then first "\n" in `<textarea>...</textarea>` can be ignored.
    */ if (this.curLoc$.ucod === /* "\n" */ 0xA) {
      this.outTk$!.setStop(this.curLoc$.forw(), HTMLTok.character);
      return;
    }

    const VALVE = 1_000_000;
    let valve = VALVE;
    L_0: do {
      /* [13.2.5.2 RCDATA state](https://html.spec.whatwg.org/multipage/parsing.html#rcdata-state) */
      switch (this.curLoc$.ucod) {
        case /* "&" */ 0x26:
          /* deno-fmt-ignore */ switch (
            this.#scanChrref(ReturnState_.RCDATA, this.outTk$!.lexdInfo as Chr_LI)
          ) {
            case ScanR.reachBdry: break L_0;
            case ScanR.continue: break;
            case ScanR.return: break;
          }
          break;
        case /* "<" */ 0x3C: {
          const ucod_1 = this.curLoc$.forw().ucod;
          if (this.reachLexBdry$()) break L_0;

          if (ucod_1 === /* "/" */ 0x2F) {
            /* deno-fmt-ignore */ switch (this.#scanMatchTag()) {
              case ScanR.reachBdry: break L_0;
              case ScanR.continue: break;
              case ScanR.return: return;
            }
          } else {
            this.curLoc$.forw();
          }
          break;
        }
        default:
          this.#checkChrForw();
          break;
      }
    } while (!this.reachLexBdry$() && --valve);
    assert(valve, `Loop ${VALVE}(±1) times!`);

    if (this.#state === State.RCDATA) {
      this.outTk$!.setStop(this.curLoc$, HTMLTok.character);
    }
  }

  /** `in( this.#state === State.RAWTEXT)` */
  #scan_in_RAWTEXT(): void {
    const VALVE = 1_000_000;
    let valve = VALVE;
    L_0: do {
      /* [13.2.5.3 RAWTEXT state](https://html.spec.whatwg.org/multipage/parsing.html#rawtext-state) */
      switch (this.curLoc$.ucod) {
        case /* "<" */ 0x3C: {
          const ucod_1 = this.curLoc$.forw().ucod;
          if (this.reachLexBdry$()) break L_0;

          if (ucod_1 === /* "/" */ 0x2F) {
            /* deno-fmt-ignore */ switch (this.#scanMatchTag()) {
              case ScanR.reachBdry: break L_0;
              case ScanR.continue: break;
              case ScanR.return: return;
            }
          } else {
            this.curLoc$.forw();
          }
          break;
        }
        default:
          this.#checkChrForw();
          break;
      }
    } while (!this.reachLexBdry$() && --valve);
    assert(valve, `Loop ${VALVE}(±1) times!`);

    if (this.#state === State.RAWTEXT) {
      this.outTk$!.setStop(this.curLoc$, HTMLTok.character);
    }
  }

  /** `in( this.#state === State.Script)` */
  #scan_in_Script(): void {
    const VALVE = 1_000_000;
    let valve = VALVE;
    L_0: do {
      /* [13.2.5.4 Script data state](https://html.spec.whatwg.org/multipage/parsing.html#script-data-state) */
      switch (this.curLoc$.ucod) {
        case /* "<" */ 0x3C: {
          const ucod_1 = this.curLoc$.forw().ucod;
          if (this.reachLexBdry$()) break L_0;

          if (ucod_1 === /* "/" */ 0x2F) {
            /* [13.2.5.16 Script data end tag open state](https://html.spec.whatwg.org/multipage/parsing.html#script-data-end-tag-open-state) */
            /* deno-fmt-ignore */ switch (this.#scanMatchTag()) {
              case ScanR.reachBdry: break L_0;
              case ScanR.continue: break;
              case ScanR.return: break L_0;
            }
          } else if (ucod_1 === /* "!" */ 0x21) {
            /* [13.2.5.18 Script data escape start state](https://html.spec.whatwg.org/multipage/parsing.html#script-data-escape-start-state) */
            const ucod_2 = this.curLoc$.forw().ucod;
            if (this.reachLexBdry$()) break L_0;

            if (ucod_2 === /* "-" */ 0x2D) {
              /* [13.2.5.19 Script data escape start dash state](https://html.spec.whatwg.org/multipage/parsing.html#script-data-escape-start-dash-state) */
              const ucod_3 = this.curLoc$.forw().ucod;
              if (this.reachLexBdry$()) break L_0;

              if (ucod_3 === /* "-" */ 0x2D) {
                this.#skipScriptEscaped();
                if (this.#state === State.Script) break;
                else break L_0;
              }
            }
            this.curLoc$.forw();
          }
          break;
        }
        default:
          this.#checkChrForw();
          break;
      }
    } while (!this.reachLexBdry$() && --valve);
    assert(valve, `Loop ${VALVE}(±1) times!`);

    if (this.#state === State.Script) {
      this.outTk$!.setStop(this.curLoc$, HTMLTok.character);
    }
  }

  /** `in( this.#state === State.CDATA)` */
  #scan_in_CDATA(): void {
    const VALVE = 1_000_000;
    let valve = VALVE;

    /**
     * 2nd right square bracket
     * `in( this.curLoc$.ucod === 0x5D)`
     */
    const rsb2_ = (): ScanR => {
      if (!--valve) assert(valve, `Loop ${VALVE}(±1) times!`);

      const ucod = this.curLoc$.forw().ucod;
      if (this.reachLexBdry$()) return ScanR.reachBdry;

      if (ucod === /* ">" */ 0x3E) {
        this.outTk$!.setStop(this.curLoc$.forw(), HTMLTok.character);
        this.#state = State.Data;
        return ScanR.return;
      }

      if (ucod === /* "]" */ 0x5D) {
        return rsb2_();
      }

      this.curLoc$.forw();
      return ScanR.continue;
    };

    L_0: do {
      /* [13.2.5.69 CDATA section state](https://html.spec.whatwg.org/multipage/parsing.html#cdata-section-state) */
      switch (this.curLoc$.ucod) {
        case /* "]" */ 0x5D: {
          const ucod_1 = this.curLoc$.forw().ucod;
          if (this.reachLexBdry$()) break L_0;

          if (ucod_1 === /* "]" */ 0x5D) {
            /* deno-fmt-ignore */ switch (rsb2_()) {
              case ScanR.reachBdry: break L_0;
              case ScanR.continue: break;
              case ScanR.return: return;
            }
          }
          break;
        }
        default:
          this.#checkChrForw_3();
          break;
      }
    } while (!this.reachLexBdry$() && --valve);
    assert(valve, `Loop ${VALVE}(±1) times!`);

    this.outTk$!.setErr({ msg: ErrMsg.html_cdata_eof })
      .setStop(this.curLoc$, HTMLTok.character);
  }

  /**
   * `HTMLTk`s are concatenated from one end to the other, i.e., no gaps.
   * @implement
   */
  protected scan_impl$(): HTMLTk | undefined {
    this.outTk_1$;
    this.outTk$!.lexdInfo = new Chr_LI(this.#state);
    /* final switch */ ({
      [State.Data]: () => this.#scan_in_Data(),
      [State.RCDATA]: () => this.#scan_in_RCDATA(),
      [State.RAWTEXT]: () => this.#scan_in_RAWTEXT(),
      [State.Script]: () => this.#scan_in_Script(),
      [State.CDATA]: () => this.#scan_in_CDATA(),
    }[this.#state])();
    return this.outTk$;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** @using @param chrStopLoc_x  */
  #scanChrAndTk(chrStopLoc_x: Loc, scanTk_x: (tk?: HTMLTk) => void): void {
    if (this.outTk$!.sntStrtLoc.posS(chrStopLoc_x)) {
      const outTk_1 = this.genOutTk$();
      outTk_1.sntStrtLoc.become_Loc(chrStopLoc_x);
      scanTk_x(outTk_1);
      this.outTk$!.setStop(outTk_1.sntStrtLoc, HTMLTok.character);
      //jjjj TOCLEANUP
      // this.outTk$!.lexdInfo ??= new Chr_LI(this.#state);
      this.outTk$ = this.#lexScandTks(this.outTk$!, outTk_1);
    } else {
      scanTk_x();
    }
  }

  /**
   * @out @param outTk_x
   * @headconst @param loc_x
   */
  #checkChrForw(outTk_x = this.outTk$!, loc_x = this.curLoc$) {
    const codp = loc_x.codp;
    if (isNonchr_(codp)) {
      outTk_x.setErr({
        msg: ErrMsg.html_unexp_nonchr,
        rv: Ranval.fromLoc(loc_x),
      });
      if (codp >= 2 ** 16) loc_x.forw();
    } else {
      const ucod = loc_x.ucod;
      if (ucod === 0) {
        outTk_x.setErr({
          msg: ErrMsg.html_unexp_null,
          rv: Ranval.fromLoc(loc_x),
        });
      } else if (isSurLead(ucod) || isSurTral(ucod)) {
        outTk_x.setErr({
          msg: ErrMsg.html_surrogate,
          rv: Ranval.fromLoc(loc_x),
        });
      } else if (isCtrl_(ucod) && !isASCIIWs(ucod)) {
        outTk_x.setErr({
          msg: ErrMsg.html_unexp_ctrl,
          rv: Ranval.fromLoc(loc_x),
        });
      }
    }
    loc_x.forw();
  }

  /**
   * Feasures: allow surrogate
   * @out @param outTk_x
   * @headconst @param loc_x
   */
  #checkChrForw_1(outTk_x = this.outTk$!, loc_x = this.curLoc$) {
    const codp = loc_x.codp;
    if (isNonchr_(codp)) {
      outTk_x.setErr({
        msg: ErrMsg.html_unexp_nonchr,
        rv: Ranval.fromLoc(loc_x),
      });
      if (codp >= 2 ** 16) loc_x.forw();
    } else {
      const ucod = loc_x.ucod;
      if (ucod === 0) {
        outTk_x.setErr({
          msg: ErrMsg.html_unexp_null,
          rv: Ranval.fromLoc(loc_x),
        });
      } else if (isCtrl_(ucod) && !isASCIIWs(ucod)) {
        outTk_x.setErr({
          msg: ErrMsg.html_unexp_ctrl,
          rv: Ranval.fromLoc(loc_x),
        });
      }
    }
    loc_x.forw();
  }

  /**
   * Feasures: allow surrogate, allow 0
   * @out @param outTk_x
   * @headconst @param loc_x
   */
  #checkChrForw_3(outTk_x = this.outTk$!, loc_x = this.curLoc$) {
    const codp = loc_x.codp;
    if (isNonchr_(codp)) {
      outTk_x.setErr({
        msg: ErrMsg.html_unexp_nonchr,
        rv: Ranval.fromLoc(loc_x),
      });
      if (codp >= 2 ** 16) loc_x.forw();
    } else {
      const ucod = loc_x.ucod;
      if (isCtrl_(ucod) && !isASCIIWs(ucod) && ucod !== 0) {
        outTk_x.setErr({
          msg: ErrMsg.html_unexp_ctrl,
          rv: Ranval.fromLoc(loc_x),
        });
      }
    }
    loc_x.forw();
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // //llll check this
  // /**! Do not record HTMLTk's, which may be concated, into HTMLSn's. */
  // protected override canConcat$(tk_0_x: HTMLTk, tk_1_x: HTMLTk) {
  //   if (
  //     tk_0_x.value === HTMLTok.character &&
  //     tk_1_x.value === HTMLTok.character &&
  //     tk_0_x.sntFrstLine === tk_1_x.sntLastLine
  //   ) {
  //     const li_0 = tk_0_x.lexdInfo as Chr_LI;
  //     const li_1 = tk_1_x.lexdInfo as Chr_LI;
  //     if (
  //       li_0.state === li_1.state &&
  //       li_0.crTk_a.length === 0 && li_1.crTk_a.length === 0 &&
  //       /* Then whitespaces can be inserted in "after head" insertion mode. */
  //       (li_0.state !== State.Data || !(li_0.allWs && !li_1.allWs))
  //     ) {
  //       // return <HTMLTk>({ kept, rmvd }: { kept: HTMLTk; rmvd: HTMLTk }) => {
  //       // };
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  protected override concatTokens$(): void {}
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override get _repr_(): TokenRepr[] {
    const tr_a = super._repr_ as TokenRepr[];
    const ret_a: TokenRepr[] = [];
    for (let i = 1; i < tr_a.length - 1; i++) {
      const tr_i = tr_a[i];
      if (tr_i[0] !== "Character") {
        ret_a.push(tr_i);
        continue;
      }

      const data_a = [tr_i[1]];
      let j_ = i + 1;
      for (; j_ < tr_a.length - 1 && tr_a[j_][0] === "Character"; j_++) {
        data_a.push(tr_a[j_][1]!);
      }
      tr_i[1] = data_a.join("");
      ret_a.push(tr_i);

      i = j_ - 1;
    }
    return ret_a;
  }
}
/*80--------------------------------------------------------------------------*/
