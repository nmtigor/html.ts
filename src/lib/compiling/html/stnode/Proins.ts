/** 80**************************************************************************
 * @module lib/compiling/html/stnode/Proins
 * @license MIT
 ******************************************************************************/

import type { uint } from "@fe-lib/alias.ts";
import { space } from "@fe-lib/util.ts";
import type { HTMLTk } from "../HTMLTk.ts";
import type { Proins_LI } from "../util.ts";
import type { CtnrEl } from "./CtnrEl.ts";
import { HTMLSn } from "./HTMLSn.ts";
/*80--------------------------------------------------------------------------*/

/**
 * Processing instruction
 * @final
 */
export class Proins extends HTMLSn {
  readonly tk;

  override get frstToken_1() {
    return this.frstTk$ = this.tk;
  }
  override get lastToken_1() {
    return this.lastTk$ = this.tk;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // /** against to  "targetParent" */
  // srcPa?: CtnrEl | undefined;

  /** @const @param tk_x */
  constructor(tk_x: HTMLTk) {
    super();
    this.tk = tk_x;

    this.ensureBdries();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override _toHTML_(indent_x: uint): string[] {
    const li_ = this.tk.lexdInfo as Proins_LI;
    const d_ = li_.data_$?.getText();
    return [
      `| ${space(indent_x)}<?${li_.target.getText()}${d_ ? ` ${d_}` : ""}?>`,
    ];
  }
}
/*80--------------------------------------------------------------------------*/
