/** 80**************************************************************************
 * @module lib/compiling/html/stnode/CtnrEl
 * @license MIT
 ******************************************************************************/

import { TagNS } from "@fe-cpl/html/alias.ts";
import { ErrMsg } from "@fe-cpl/util.ts";
import type { int } from "@fe-lib/alias.ts";
import type { HTMLTk } from "../HTMLTk.ts";
import { HTMLTok } from "../HTMLTok.ts";
import type { HTMLCtnr } from "./alias.ts";
import { Elment } from "./Elment.ts";
import type { Proins } from "./Proins.ts";
import {
  apdSnt,
  children,
  frstToken_1,
  insSnt,
  lastToken_1,
  rmvSnt,
  tfrSntTo,
} from "./util.ts";
/*80--------------------------------------------------------------------------*/

/** non-`TextCat.void` Elment */
export abstract class CtnrEl extends Elment {
  readonly snt_a_$: (HTMLTk | Elment | Proins)[] = [];

  children_$: (Elment | Proins)[] | undefined;
  override get children(): (Elment | Proins)[] {
    return children(this);
  }

  /** @implement */
  get frstToken_1() {
    return this.frstTk$ ??= frstToken_1(this);
  }
  /** @implement */
  get lastToken_1() {
    return this.lastTk$ ??= lastToken_1(this);
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // #abdSnts?: (Elment | Proins | HTMLTk)[];
  // /** abandoned Elment's, Proins's or HTMLTk's */
  // get abdSnts() {
  //   return this.#abdSnts ??= [];
  // }

  /**
   * @const @param tagname_x
   * @const @param tk_x `HTMLTok.tag` or `HTMLTok.placeholder`
   */
  constructor(tagname_x: string, tk_x: HTMLTk) {
    super(tagname_x, tk_x.value === HTMLTok.tag ? tk_x : undefined);
    this.snt_a_$.push(tk_x);
    //jjjj TOCLEANUP
    // tk_x.htmlSn_$ = this;

    if (this.ns === TagNS.HTML && tk_x.selfCloz && !tk_x.isErr) {
      tk_x.setErr({ msg: ErrMsg.html_tag_void_trail_solidus });
    }

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
  tfrSntTo(tgtPa_x: HTMLCtnr, ...snts_x: (HTMLTk | Elment)[]): this {
    tfrSntTo(this, tgtPa_x, ...snts_x);
    return this;
  }
}
/*64----------------------------------------------------------*/

/** @final */
export class Unknown_El extends CtnrEl {
  /**
   * @const @param tagname_x
   * @const @param opntagTk_x
   */
  constructor(tagname_x: string, opntagTk_x: HTMLTk) {
    super(tagname_x, opntagTk_x);
  }
}
/*80--------------------------------------------------------------------------*/
