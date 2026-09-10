/** 80**************************************************************************
 * @module lib/compiling/html/stnode/P_El
 * @license MIT
 ******************************************************************************/

import { ContCat } from "../alias.ts";
import type { HTMLTk } from "../HTMLTk.ts";
import { SpecialCtnrEl } from "./SpecialCtnrEl.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class P_El extends SpecialCtnrEl {
  /** @const @param tk_x */
  constructor(tk_x: HTMLTk) {
    super("p", tk_x);
    this.contCat$ = ContCat.flow | ContCat.palpable;
  }
}
/*80--------------------------------------------------------------------------*/
