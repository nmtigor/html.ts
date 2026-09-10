/** 80**************************************************************************
 * @module lib/editing/ERan
 * @license MIT
 ******************************************************************************/

import type { Ranval } from "@fe-cpl/Ranval.ts";
import { INOUT } from "../../preNs.ts";
import type { loff_t, uint } from "../alias.ts";
import type { Id_t } from "../alias_v.ts";
import { $ovlap } from "../symbols.ts";
import { assert } from "../util.ts";
import { Factory } from "../util/Factory.ts";
import { ELoc } from "./ELoc.ts";
import type { Pos } from "./alias.ts";
/*80--------------------------------------------------------------------------*/

declare global {
  interface Node {
    //jjjj TOCLEANUP
    // [$facil_node]: boolean;
    [$ovlap]: boolean;
  }
}

//jjjj TOCLEANUP
// type ElnO_ = {
//   eline(_: lnum_t): ELineBase;
// };

/**
 * Wrapper of the Range `range`
 *
 * Like `Range`, `ERan` has no visual effects. `Caret` has visual effects.\
 * Should sync with `EdtrScrolr`s modification as soon as possible.
 *
 * @final
 */
export class ERan {
  static #ID = 0 as Id_t;
  readonly id = ++ERan.#ID as Id_t;
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /* #anchrEloc */
  readonly #anchrEloc: ELoc;
  get anchrEloc() {
    return this.#anchrEloc;
  }
  get anchrCtnr(): Node {
    return this.#anchrEloc.ctnr_$!;
  }
  get anchrOffs(): uint {
    return this.#anchrEloc.offs_$;
  }
  get anchrLoff(): loff_t {
    return this.#anchrEloc.loff;
  }
  /* ~ */

  /* #focusEloc */
  readonly #focusEloc: ELoc;
  get focusEloc() {
    return this.#focusEloc;
  }
  get focusCtnr(): Node {
    return this.#focusEloc.ctnr_$;
  }
  get focusOffs(): uint {
    return this.#focusEloc.offs_$;
  }
  get focusLoff(): loff_t {
    return this.#focusEloc.loff;
  }
  /* ~ */

  /** @const */
  get collapsed() {
    return this.#anchrEloc.posE(this.#focusEloc);
  }

  readonly range = new Range();
  //jjjj TOCLEANUP
  // get rangeRect() { return this.range.getBoundingClientRect(); }

  //jjjj TOCLEANUP
  // bran$_:TokRan|null = null;

  //jjjj TOCLEANUP
  // dp_$ = Edran_DP.none; /** used by Caret.#drawFocus() */

  /**
   * @headmove @const @param focusELoc_x
   * @headmove @const @param anchrELoc_x
   */
  constructor(focusELoc_x: ELoc, anchrELoc_x?: ELoc) {
    //jjjj TOCLEANUP
    // this.range[$eran] = this;
    this.#focusEloc = focusELoc_x;
    this.#anchrEloc = anchrELoc_x ?? focusELoc_x.dup_ELoc();
    /*#static*/ if (INOUT) {
      assert(this.#focusEloc !== this.#anchrEloc);
    }
  }

  reset_ERan(): this {
    this.range.reset();
    this.#focusEloc.reset_ELoc();
    this.#anchrEloc.reset_ELoc();
    return this;
  }

  /** @const */
  become_ERan(rhs_x: ERan): this {
    this.#focusEloc.ctnr_$ = rhs_x.focusCtnr;
    this.#focusEloc.offs_$ = rhs_x.focusOffs;
    this.#anchrEloc.ctnr_$ = rhs_x.anchrCtnr;
    this.#anchrEloc.offs_$ = rhs_x.anchrOffs;
    return this;
  }

  rev(): void {
    g_eran_fac.revoke(this);
  }
  [Symbol.dispose]() {
    this.rev();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  // drop$_()
  // {
  //   this.#anchrEloc = null;
  // }
  // rise$_()
  // {
  //   if( !this.#anchrEloc )
  //     this.#anchrEloc = new ELoc(
  //       this.focusCtnr, this.focusOffs );
  // }

  /** @const */
  posE(rhs_x?: ERan): boolean {
    if (this === rhs_x) return true;
    if (!rhs_x) return false;

    // if (rhs_x.#focusEloc.posE(this.#focusEloc)) {
    //   if (this.collapsed) {
    //     return rhs_x.collapsed;
    //   } else if (!rhs_x.collapsed) {
    //     return rhs_x.#anchrEloc.posE(this.#anchrEloc);
    //   }
    // }
    // return false;
    return rhs_x.#focusEloc.posE(this.#focusEloc) &&
      rhs_x.#anchrEloc.posE(this.#anchrEloc);
  }

  /** @return reversed or not */
  reverse_$(): boolean {
    if (this.collapsed) return false;

    const ctnr = this.focusCtnr;
    const offs = this.focusOffs;
    this.#focusEloc.ctnr_$ = this.anchrCtnr;
    this.#focusEloc.offs_$ = this.anchrOffs;
    this.#anchrEloc.ctnr_$ = ctnr;
    this.#anchrEloc.offs_$ = offs;
    return true;
  }

  /**
   **! Range's start is always ahead of end, otherwise `collapsed`.
   * @borrow @return Synchronized `range`
   */
  syncRange(): Range {
    if (this.collapsed) {
      this.range
        .setStop(this.focusCtnr, this.focusOffs)
        .collapse();
    } else {
      this.range
        .setStrt(this.anchrCtnr, this.anchrOffs)
        .setStop(this.focusCtnr, this.focusOffs);
      if (this.range.collapsed) {
        this.range.setStop(this.anchrCtnr, this.anchrOffs);
      }
    }
    return this.range;
  }

  /**
   * Assign `range`, and return its synchronized `DOMRect`.
   * @const @param relPos_x
   */
  getBcr_$(relPos_x?: Pos): DOMRect {
    const retRec = this.syncRange().getBoundingClientRect();
    if (relPos_x) {
      retRec.x -= relPos_x.left;
      retRec.y -= relPos_x.top;
    }
    return retRec;
  }

  //jjjj TOCLEANUP
  // /**
  //  * @headconst @param elnO_x
  //  * @const @param relPos_x
  //  */
  // getRecA_$(elnO_x: ElnO_, relPos_x?: Pos): DOMRect[] {
  //   this.syncRange();
  //   if (this.range.collapsed) return [];
  //   /*49|||||||||||||||||||||||||||||||||||||||||||*/

  //   const ctnr_a: Node[] = [];

  //   const frstCtnr = this.range.startContainer;
  //   const lastCtnr = this.range.endContainer;
  //   /*#static*/ if (INOUT) {
  //     assert(frstCtnr.isText);
  //     assert(lastCtnr.isText);
  //   }
  //   const strtOfs = this.range.startOffset;
  //   const stopOfs = this.range.endOffset;

  //   const frstBln = ELineBase.getBLine(frstCtnr);
  //   const lastBln = ELineBase.getBLine(lastCtnr);
  //   const lastStopBofs = (lastCtnr as Text).loff(stopOfs);

  //   let ctnr = frstCtnr;
  //   let stopBofs = (ctnr as Text).stopLoff;
  //   let bln = frstBln;
  //   let eln = elnO_x.eline_1(bln.lidx_1);

  //   ctnr_a.push(ctnr);

  //   if (bln !== lastBln) {
  //     const VALVE = LnumMAX;
  //     let valve = VALVE;
  //     do {
  //       const blnLEN = bln.uchrLen;
  //       while (stopBofs < blnLEN) {
  //         ctnr = eln.caretNodeAt(stopBofs);
  //         /*#static*/ if (INOUT) {
  //           assert(ctnr.isText && stopBofs === (ctnr as Text)[$loff_0]);
  //         }
  //         ctnr_a.push(ctnr);
  //         stopBofs += (ctnr as Text).length;
  //       }

  //       stopBofs = 0;
  //       bln = bln.nextLine!;
  //       eln = elnO_x.eline_1(bln.lidx_1);
  //     } while (bln !== lastBln && --valve);
  //     assert(valve, `Loop ${VALVE}(±1) times!`);
  //   }

  //   if (frstBln !== bln) stopBofs = 0;
  //   while (stopBofs <= lastStopBofs) {
  //     ctnr = eln.caretNodeAt(stopBofs);
  //     /*#static*/ if (INOUT) {
  //       assert(ctnr.isText && stopBofs === (ctnr as Text)[$loff_0]);
  //     }
  //     ctnr_a.push(ctnr);
  //     stopBofs += (ctnr as Text).length;
  //   }
  //   /*49|||||||||||||||||||||||||||||||||||||||||||*/

  //   const retRec: DOMRect[] = [];

  //   const n_ = range_fac_.produce(ctnr_a.length);

  //   ctnr = ctnr_a[0];
  //   let len: uint,
  //     r_1: Range;
  //   //jjjj TOCLEANUP
  //   // if (ctnr) {
  //   len = n_ === 1
  //     ? stopOfs
  //     : ctnr.isText
  //     ? (ctnr as Text)[$tail_ignored]
  //       ? ctnr.textContent!.length - 1
  //       : ctnr.textContent!.length
  //     : ctnr.childNodes.length;
  //   if (len) {
  //     r_1 = range_fac_.val_a[0];
  //     r_1.setStart(ctnr, strtOfs);
  //     r_1.setEnd(ctnr, len);
  //     r_1.getStickA(retRec, !ctnr.isText, relPos_x);
  //   }
  //   // }

  //   for (let i = 1; i < n_ - 1; i++) {
  //     ctnr = ctnr_a[i];
  //     //jjjj TOCLEANUP
  //     // if (ctnr) {
  //     //jjjj TOCLEANUP
  //     // const out_o = {};
  //     // const bline = ELineBase.getBLine( ctnr, out_o );
  //     // const offset = out_o.np === NodeInELine.indent ?
  //     //   ctnr.textContent.length :
  //     //   bline.uchrLen - out_o.vuu.indent;
  //     len = ctnr.isText
  //       ? (ctnr as Text)[$tail_ignored]
  //         ? ctnr.textContent!.length - 1
  //         : ctnr.textContent!.length
  //       : ctnr.childNodes.length;
  //     if (len) {
  //       r_1 = range_fac_.val_a[i];
  //       r_1.setStart(ctnr, 0);
  //       r_1.setEnd(ctnr, len);
  //       r_1.getStickA(retRec, !ctnr.isText, relPos_x);
  //     }
  //     // }
  //   }

  //   if (n_ > 1) {
  //     ctnr = ctnr_a.at(-1)!;
  //     //jjjj TOCLEANUP
  //     // if (ctnr) {
  //     len = stopOfs;
  //     if (len) {
  //       r_1 = range_fac_.val_a[n_ - 1];
  //       r_1.setStart(ctnr, 0);
  //       r_1.setEnd(ctnr, len);
  //       r_1.getStickA(retRec, !ctnr.isText, relPos_x);
  //     }
  //     // }
  //   }

  //   return retRec;
  // }

  /** @const @param ct_x */
  collapse_$(ct_x = EdranCollapseTo.focus) {
    if (this.collapsed) return;

    if (ct_x === EdranCollapseTo.focus) {
      this.#anchrEloc.ctnr_$ = this.focusCtnr;
      this.#anchrEloc.offs_$ = this.focusOffs;
    } else if (ct_x === EdranCollapseTo.anchr) {
      this.#focusEloc.ctnr_$ = this.anchrCtnr;
      this.#focusEloc.offs_$ = this.anchrOffs;
    } else {
      const range = this.syncRange();
      if (ct_x === EdranCollapseTo.rangeStrt) {
        this.#focusEloc.ctnr_$ = range.startContainer;
        this.#focusEloc.offs_$ = range.startOffset;
      } /* if (ct_x === EdranCollapseTo.rangeStop) */ else {
        this.#focusEloc.ctnr_$ = range.endContainer;
        this.#focusEloc.offs_$ = range.endOffset;
      }
      this.#anchrEloc.ctnr_$ = this.focusCtnr;
      this.#anchrEloc.offs_$ = this.focusOffs;
    }
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // /** @out @param ret_x */
  // getRanval(ret_x?: Ranval): Ranval {
  //   ret_x ??= new Ranval(0, 0);
  //   ret_x.focusLidx = ELineBase.getBLine(this.focusCtnr).lidx_1;
  //   ret_x.focusLoff = this.focusLoff;
  //   if (this.collapsed) {
  //     ret_x.collapseToFocus();
  //   } else {
  //     ret_x.anchrLidx = ELineBase.getBLine(this.anchrCtnr).lidx_1;
  //     ret_x.anchrLoff = this.anchrLoff;
  //   }
  //   return ret_x;
  // }
}

const enum EdranCollapseTo {
  focus = 1,
  anchr,
  rangeStrt,
  rangeStop,
}
/*64----------------------------------------------------------*/

/** @final */
class ERanFac_ extends Factory<ERan> {
  /** @implement */
  protected createVal$() {
    // /*#static*/ if (PRF) {
    //   console.log(
    //     `%c# of cached ERan instances: ${this.val_a$.length + 1}`,
    //     `color:${LOG_cssc.performance}`,
    //   );
    // }
    return new ERan(new ELoc(document, 0));
  }

  protected override resetVal$(v_x: ERan): void {
    v_x.reset_ERan();
  }
}
export const g_eran_fac = new ERanFac_();

// /** @final */
// class RangeFac_ extends Factory<Range> {
//   /** @implement */
//   protected createVal$() {
//     return new Range();
//   }

//   protected override resetVal$(v_x: Range): void {
//     v_x.reset();
//   }
// }
// const range_fac_ = new RangeFac_();
/*80--------------------------------------------------------------------------*/

/** ERan getter */
export type ERanr = {
  getERanOf(rv_x: Ranval, retEran_x?: ERan): ERan;
};
/*80--------------------------------------------------------------------------*/
