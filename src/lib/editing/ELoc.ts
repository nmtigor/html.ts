/** 80**************************************************************************
 * @module lib/editing/ELoc
 * @license MIT
 ******************************************************************************/

import type { loff_t, uint } from "../alias.ts";
import type { Id_t } from "../alias_v.ts";
import { $loff_0 } from "../symbols.ts";
import type { Pos } from "./alias.ts";
/*80--------------------------------------------------------------------------*/

/**
 * Wrapper of the Range `#endpt`
 *
 * @final
 */
export class ELoc {
  static #ID = 0 as Id_t;
  readonly id = ++ELoc.#ID as Id_t;
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  ctnr_$: Node;
  /** offset in `ctnr_$` (in logical ordering rather than visual ordering) */
  offs_$: uint;
  /** offset in `TokLine` */
  get loff(): loff_t {
    return ((this.ctnr_$ as Text)[$loff_0] ?? 0) + this.offs_$;
  }

  readonly #endpt = new Range();

  /**
   * @borrow @const @param ctnr_x
   * @const @param offs_x
   */
  constructor(ctnr_x: Node, offs_x: uint) {
    this.ctnr_$ = ctnr_x;
    this.offs_$ = offs_x;
  }

  reset_ELoc(): this {
    this.#endpt.reset();
    this.ctnr_$ = document;
    this.offs_$ = 0;
    return this;
  }

  dup_ELoc() {
    return new ELoc(this.ctnr_$, this.offs_$);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @const */
  posE_O(ctnr_x: Node, offs_x: uint): boolean {
    return this.ctnr_$ === ctnr_x && this.offs_$ === offs_x;
  }
  /** @const */
  posE(rhs: ELoc): boolean {
    return this === rhs || this.posE_O(rhs.ctnr_$, rhs.offs_$);
  }

  /** @borrow @return Synchronized `#endpt` */
  #syncRange(): Range {
    //jjjj TOCLEANUP
    // let retRec;

    // if (this.ctnr_$.isText) {
    //   this.#endpt.setEnd(this.ctnr_$, this.offs_$);
    //   this.#endpt.collapse();
    //   retRec = this.#endpt.getBoundingClientRect();
    // } else {
    //   //jjjj TOCHECK
    //   let subNd: Node | undefined;
    //   let i = 0, j = 0;
    //   const iI = this.ctnr_$.childNodes.length;
    //   for (; i < iI; ++i) {
    //     if (!this.ctnr_$.childNodes[i][$facil_node]) {
    //       subNd = this.ctnr_$.childNodes[i];
    //       if (j++ === this.offs_$) break;
    //     }
    //   }
    //   /*#static*/ if (INOUT) {
    //     assert(subNd);
    //   }
    //   this.#endpt.selectNode(subNd!);
    //   retRec = this.#endpt.getBoundingClientRect();
    //   if (i === iI) retRec.x = retRec.right; //!
    //   retRec.width = 0;
    // }
    // retRec[$ovlap] = this.ctnr_$[$ovlap]; //!
    /* ~ */

    this.#endpt
      .setStop(this.ctnr_$, this.offs_$)
      .collapse();
    return this.#endpt;
  }

  /**
   * Assign `#endpt`, and return its synchronized `DOMRect`.
   * @const @param relPos_x
   */
  getBcr_$(relPos_x?: Pos): DOMRect {
    const retRec = this.#syncRange().getBoundingClientRect();
    if (relPos_x) {
      retRec.x -= relPos_x.left;
      retRec.y -= relPos_x.top;
    }
    return retRec;
  }
}
/*80--------------------------------------------------------------------------*/
