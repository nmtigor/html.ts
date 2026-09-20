/** 80**************************************************************************
 * @module lib/compiling/html/stnode/Doment
 * @license MIT
 ******************************************************************************/

import type { int } from "@fe-lib/alias.ts";
import { assert } from "@fe-lib/util.ts";
import { INOUT } from "@fe-src/preNs.ts";
import { Ranval } from "../../Ranval.ts";
import { ErrMsg } from "../../util.ts";
import type { HTMLTk } from "../HTMLTk.ts";
import type { Doctype_LI } from "../util.ts";
import type { HTMLCtnr } from "./alias.ts";
import {
  _toHTML_,
  apdSnt,
  children,
  frstToken_1,
  insSnt,
  lastToken_1,
  rmvSnt,
  tfrSntTo,
} from "./util.ts";
import { Elment } from "./Elment.ts";
import { HTMLSn } from "./HTMLSn.ts";
import type { Proins } from "./Proins.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class Doment extends HTMLSn {
  readonly snt_a_$: (HTMLTk | Elment | Proins)[] = [];

  children_$: (Elment | Proins)[] | undefined;
  override get children(): (Elment | Proins)[] {
    return children(this);
  }

  override get frstToken_1() {
    return this.frstTk$ ??= frstToken_1(this);
  }
  override get lastToken_1() {
    return this.lastTk$ ??= lastToken_1(this);
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  doctype_$: HTMLTk | undefined;

  /**
   * `in( tk_x.value === HTMLTok.doctype)`
   * @const @param tk_x
   */
  setDoctype(tk_x: HTMLTk): this {
    /*#static*/ if (INOUT) {
      assert(!this.doctype_$);
    }
    this.doctype_$ = tk_x;
    const li_ = tk_x.lexdInfo as Doctype_LI;
    if (
      li_.name_s !== "html" ||
      li_.sys && li_.noqtSys_s !== "about:legacy-compat"
    ) {
      this.setErr({
        msg: ErrMsg.html_unknown_doctype,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    }
    return this;
  }

  /** @const @param phTk_x `HTMLTok.placeholder` */
  constructor(phTk_x: HTMLTk) {
    super();
    this.snt_a_$.push(phTk_x);
    //jjjj TOCLEANUP
    // phTk_x.htmlSn_$ = this;

    this.ensureBdries();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  apdSnt(...snts_x: (HTMLTk | Elment | Proins)[]): void {
    apdSnt(this, ...snts_x);
  }
  insSnt(snt_x: HTMLTk | Elment | Proins, i_x?: int): void {
    insSnt(this, snt_x, i_x);
  }
  rmvSnt(...snts_x: (HTMLTk | Elment | Proins)[]): void {
    rmvSnt(this, ...snts_x);
  }
  tfrSntTo(tgtEl_x: HTMLCtnr, ...snts_x: (HTMLTk | Elment)[]): this {
    tfrSntTo(this, tgtEl_x, ...snts_x);
    return this;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override _toHTML_(): string[] {
    return _toHTML_(this);
  }
}
/*80--------------------------------------------------------------------------*/
