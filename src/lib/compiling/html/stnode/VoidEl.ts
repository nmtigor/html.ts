/** 80**************************************************************************
 * @module lib/compiling/html/stnode/VoidEl
 * @license MIT
 ******************************************************************************/

import { TextCat } from "../alias.ts";
import type { HTMLTk } from "../HTMLTk.ts";
import { Elment } from "./Elment.ts";
/*80--------------------------------------------------------------------------*/

export abstract class VoidEl extends Elment {
  declare readonly opntagTk: HTMLTk;

  /** @implement */
  get frstToken_1() {
    return this.frstTk$ = this.opntagTk;
  }
  /** @implement */
  get lastToken_1() {
    return this.lastTk$ = this.opntagTk;
  }

  /**
   * @const @param tagname_x
   * @const @param opntagTk_x
   */
  constructor(tagname_x: string, opntagTk_x: HTMLTk) {
    super(tagname_x, opntagTk_x);
    //jjjj TOCLEANUP
    // opntagTk_x.htmlSn_$ = this;
    this.textCat$ = TextCat.void;

    this.ensureBdries();
  }
}
/*80--------------------------------------------------------------------------*/
