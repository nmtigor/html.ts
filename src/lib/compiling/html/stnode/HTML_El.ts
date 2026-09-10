/** 80**************************************************************************
 * @module lib/compiling/html/stnode/HTML_El
 * @license MIT
 ******************************************************************************/

import type { HTMLTk } from "../HTMLTk.ts";
import { SpecialCtnrEl } from "./SpecialCtnrEl.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class HTML_El extends SpecialCtnrEl {
  /** @const @param tk_x */
  constructor(tk_x: HTMLTk) {
    super("html", tk_x);
  }
}
/*80--------------------------------------------------------------------------*/
