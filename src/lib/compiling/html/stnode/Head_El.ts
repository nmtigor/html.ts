/** 80**************************************************************************
 * @module lib/compiling/html/stnode/Head_El
 * @license MIT
 ******************************************************************************/

import type { HTMLTk } from "../HTMLTk.ts";
import { SpecialCtnrEl } from "./SpecialCtnrEl.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class Head_El extends SpecialCtnrEl {
  /** @const @param tkzx */
  constructor(tkzx: HTMLTk) {
    super("head", tkzx);
  }
}
/*80--------------------------------------------------------------------------*/
