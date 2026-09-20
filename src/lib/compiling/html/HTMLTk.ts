/** 80**************************************************************************
 * @module lib/compiling/html/HTMLTk
 * @license MIT
 ******************************************************************************/

import { DEBUG } from "@fe-src/preNs.ts";
import { fail } from "../../util.ts";
import { isASCIIWs } from "../../util/string.ts";
import { BaseTok } from "../BaseTok.ts";
import { Ran } from "../Ran.ts";
import { g_ran_fac } from "../RanFac.ts";
import { Token } from "../Token.ts";
import type { LexdInfo } from "../util.ts";
import { SortedErr } from "../util.ts";
import type { ErrRepr, TokenRepr } from "./alias.ts";
import type { HTMLLexr } from "./HTMLLexr.ts";
import { HTMLTok } from "./HTMLTok.ts";
import type { CtnrEl } from "./stnode/CtnrEl.ts";
import type { Comment_LI, Doctype_LI, Proins_LI } from "./util.ts";
import {
  _reprErr_,
  Chr_LI,
  NamEntity_LI,
  NumEntity_LI,
  Tag_LI,
} from "./util.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class HTMLTk extends Token<HTMLTok> {
  //jjjj TOCLEANUP
  // /** For `removeSelf()` */
  // htmlSn_$: HTMLSn | undefined;

  override get isErr(): boolean {
    if (
      this.value === HTMLTok.tag ||
      this.value === HTMLTok.bogus && this.lexdInfo instanceof Tag_LI
    ) {
      return super.isErr ||
        (this.lexdInfo as Tag_LI).attrs.crTk_a.some((tk) => tk.isErr);
    } else if (this.value === HTMLTok.character) {
      return super.isErr ||
        (this.lexdInfo as Chr_LI).crTk_a.some((tk) => tk.isErr);
    } else {
      return super.isErr;
    }
  }

  override clrErr(): this {
    if (
      this.value === HTMLTok.tag ||
      this.value === HTMLTok.bogus && this.lexdInfo instanceof Tag_LI
    ) {
      for (const tk of (this.lexdInfo as Tag_LI).attrs.crTk_a) tk.clrErr();
    } else if (this.value === HTMLTok.character) {
      for (const tk of (this.lexdInfo as Chr_LI).crTk_a) tk.clrErr();
    }
    return super.clrErr();
  }

  /** including `Err`s in `lexdInfo` */
  _getAllErrs_(): SortedErr {
    const retSa = new SortedErr(this.err_ss$).messUp();
    if (
      this.value === HTMLTok.tag ||
      this.value === HTMLTok.bogus && this.lexdInfo instanceof Tag_LI
    ) {
      for (const tk of (this.lexdInfo as Tag_LI).attrs.crTk_a) {
        retSa.push(...tk._getAllErrs_());
      }
    } else if (this.value === HTMLTok.character) {
      for (const tk of (this.lexdInfo as Chr_LI).crTk_a) {
        retSa.push(...tk._getAllErrs_());
      }
    }
    return retSa.resort();
  }
  override get _err_(): ErrRepr[] {
    const retA: ErrRepr[] = [];
    for (const err of this._getAllErrs_()) {
      retA.push(_reprErr_(err, this));
    }
    return retA;
  }

  override get lexdInfo() {
    return super.lexdInfo;
  }
  override set lexdInfo(_x: LexdInfo | null) {
    super.lexdInfo = _x;

    if (_x instanceof Chr_LI) {
      _x.host_$ = this;
    }
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // /** against to  "targetParent" */
  // srcPa?: CtnrEl | undefined;

  constructor(
    lexr_x: HTMLLexr,
    ran_x: Ran,
    value_x = BaseTok.unknown as HTMLTok,
  ) {
    super(lexr_x, ran_x, value_x);
    this.NErr$ = 4;
  }

  /** @const */
  dup_HTMLTk(): HTMLTk {
    return new HTMLTk(
      this.lexr_$ as HTMLLexr,
      g_ran_fac.byRan(this.ran_$),
      this.value,
    );
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /*jjjj TOCLEANUP used only in `Lexr.concatTokens$()` which is overridden by
  `HTMLLexr.concatTokens$()` which has no-ops. */
  // override removeSelf(pn_x?: "prev" | "next"): HTMLTk | undefined {
  //   /*#static*/ if (INOUT) {
  //     assert(
  //       this.htmlSn_$ instanceof CtnrEl || this.htmlSn_$ instanceof Doment,
  //     );
  //   }
  //   (this.htmlSn_$ as HTMLCtnr).rmvSnt(this);

  //   return super.removeSelf(pn_x) as HTMLTk | undefined;
  // }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  get isChar(): boolean {
    return this.value === HTMLTok.character || this.value === HTMLTok.chrref;
  }

  get isLF(): boolean {
    switch (this.value) {
      case HTMLTok.character:
        return this.sntStrtLoc.ucod === /* "\n" */ 0xA && this.length_1 === 1;
      case HTMLTok.chrref: {
        const li_ = this.lexdInfo;
        return li_ instanceof NamEntity_LI && li_.cps[0] === /* "\n" */ 0xA ||
          li_ instanceof NumEntity_LI && li_.num === /* "\n" */ 0xA;
      }
      default:
        return false;
    }
  }

  /** @primaryconst */
  get allWs(): boolean {
    const li_ = this.lexdInfo;
    return this.value === HTMLTok.character && (li_ as Chr_LI).allWs ||
      this.value === HTMLTok.chrref && (
          li_ instanceof NamEntity_LI && isASCIIWs(li_.cps[0]) ||
          li_ instanceof NumEntity_LI && isASCIIWs(li_.num)
        );
  }

  get isOpntag(): boolean {
    return this.value === HTMLTok.tag && !(this.lexdInfo as Tag_LI).isEnd;
  }
  /** @const @param tns_x tag names in lowercase */
  openTag(...tns_x: string[]): boolean {
    return this.isOpntag &&
      tns_x.includes((this.lexdInfo as Tag_LI).tagname_s);
  }
  get isEndtag(): boolean {
    return this.value === HTMLTok.tag && (this.lexdInfo as Tag_LI).isEnd;
  }
  /** @const @param tns_x in lowercase */
  clozTag(...tns_x: string[]): boolean {
    return this.isEndtag &&
      tns_x.includes((this.lexdInfo as Tag_LI).tagname_s);
  }

  get selfCloz(): boolean {
    return this.value === HTMLTok.tag && (this.lexdInfo as Tag_LI).selfCloz_$;
  }

  get refchr(): string | undefined {
    if (this.value !== HTMLTok.chrref) return undefined;

    return this.lexdInfo instanceof NamEntity_LI
      ? this.lexdInfo.chr
      : String.fromCodePoint((this.lexdInfo as NumEntity_LI).num);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override get _repr_(): TokenRepr {
    let ret: TokenRepr | undefined;
    /* final switch */ ({
      [HTMLTok.doctype]: () => {
        const li_ = this.lexdInfo as Doctype_LI;
        ret = [
          "DOCTYPE",
          li_.name_s?.replaceAll("\u0000", "\uFFFD") ?? null,
          null,
          li_.noqtSys_s?.replaceAll("\u0000", "\uFFFD") ?? null,
          li_.correct,
        ];
      },
      [HTMLTok.tag]: () => {
        const li_ = this.lexdInfo as Tag_LI;
        ret = [
          li_.isEnd ? "EndTag" : "StartTag",
          li_.tagname_s.replaceAll("\u0000", "\uFFFD"),
        ];

        if (ret![0] === "StartTag") {
          ret![2] ??= {};
          const an_a: string[] = [];
          for (let i = 0; i < li_.attrs.an_a.length; i++) {
            const an_i = li_.attrs.an_a[i];
            if (an_a.includes(an_i)) continue;
            an_a.push(an_i);

            ret![2][an_i] = li_.attrs.getAv(an_i);
          }
        }

        if (li_.selfCloz_$) ret![3] = true;
      },
      [HTMLTok.proins]: () => {
        const target = (this.lexdInfo as Proins_LI).target;
        ret = ["ProcessingInstruction", target.getText()];
        const data = (this.lexdInfo as Proins_LI).data_$;
        if (data) ret.push(data.getText());
      },
      [HTMLTok.comment]: () => {
        const data = (this.lexdInfo as Comment_LI).data;
        ret = ["Comment", data.getText().replaceAll("\u0000", "\uFFFD")];
      },
      [HTMLTok.character]: () => {
        ret = ["Character", (this.lexdInfo as Chr_LI).getText()];
      },
      [HTMLTok.chrref]: () => {
        ret = [
          // "chrref",
          "Character",
          this.refchr!,
        ];
      },
      [HTMLTok.bogus]: () => {},
      [HTMLTok.placeholder]: () => {},
      [HTMLTok._max]: () => {
        /*#static*/ DEBUG ? fail("Should not run here!") : {};
      },

      [BaseTok.unknown]: () => {
        /*#static*/ DEBUG ? fail("Should not run here!") : {};
      },
      [BaseTok.strtBdry]: () => {
        /*#static*/ DEBUG ? fail("Should not run here!") : {};
      },
      [BaseTok.stopBdry]: () => {
        /*#static*/ DEBUG ? fail("Should not run here!") : {};
      },
      [BaseTok._max]: () => {
        /*#static*/ DEBUG ? fail("Should not run here!") : {};
      },
    }[this.value])();
    return ret!;
  }
}
/*80--------------------------------------------------------------------------*/
