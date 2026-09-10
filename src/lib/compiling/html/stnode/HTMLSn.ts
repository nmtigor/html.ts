/** 80**************************************************************************
 * @module lib/compiling/html/stnode/HTMLSn
 * @license MIT
 ******************************************************************************/

import { uint } from "@fe-lib/alias.ts";
import { Stnode } from "../../Stnode.ts";
import type { HTMLTok } from "../HTMLTok.ts";
import { ErrRepr, TagNS } from "../alias.ts";
import { _reprErr_ } from "../util.ts";
/*80--------------------------------------------------------------------------*/

export abstract class HTMLSn extends Stnode<HTMLTok> {
  override get _err_(): ErrRepr[] {
    const retA: ErrRepr[] = [];
    if (this.err_ss$) {
      for (const err of this.err_ss$) {
        retA.push(_reprErr_(err, this));
      }
    }
    return retA;
  }

  constructor() {
    super();
    this.NErr$ = 64;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @const @param _indent_x */
  _toHTML_(_indent_x: uint = 0): string[] {
    return [];
  }
}
/*80--------------------------------------------------------------------------*/
