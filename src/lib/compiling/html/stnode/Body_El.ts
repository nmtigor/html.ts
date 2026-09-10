/** 80**************************************************************************
 * @module lib/compiling/html/stnode/Body_El
 * @license MIT
 ******************************************************************************/

import type { HTMLTk } from "../HTMLTk.ts";
import { SpecialCtnrEl } from "./SpecialCtnrEl.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class Body_El extends SpecialCtnrEl {
  /** @const @param tk_x */
  constructor(tk_x: HTMLTk) {
    super("body", tk_x);
  }
}
/*80--------------------------------------------------------------------------*/
