/** 80**************************************************************************
 * @module lib/compiling/Ranval
 * @license MIT
 ******************************************************************************/

import type { MooEq } from "../Moo.ts";
import { Moo } from "../Moo.ts";
import type { ldt_t, lnum_t, loff_t } from "../alias.ts";
import type { Bufr } from "./Bufr.ts";
import type { Loc } from "./Loc.ts";
import type { Ran } from "./Ran.ts";
import { g_ran_fac } from "./RanFac.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class Ranval extends Array<lnum_t | loff_t> {
  /* Adding `id` needs to change comparisons in "Repl_test.ts" correspondingly. */
  // static #ID = 0 as Id_t;
  // readonly id = ++Ranval.#ID as Id_t;
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  // override readonly length = 4; // TypeError: Cannot redefine property: length

  get focusLidx(): lnum_t {
    return this[0];
  }
  set focusLidx(_x: lnum_t) {
    this[0] = _x;
  }
  get focusLoff() {
    return this[1];
  }
  set focusLoff(_x: loff_t) {
    this[1] = _x;
  }
  setFocus(lidx_x: lnum_t, loff_x: loff_t): this {
    this[0] = lidx_x;
    this[1] = loff_x;
    return this;
  }

  get anchrLidx(): lnum_t {
    return this[2];
  }
  set anchrLidx(_x: lnum_t) {
    this[2] = _x;
  }
  get anchrLoff() {
    return this[3];
  }
  set anchrLoff(_x: loff_t) {
    this[3] = _x;
  }
  setAnchr(lidx_x: lnum_t, loff_x: loff_t): this {
    this[2] = lidx_x;
    this[3] = loff_x;
    return this;
  }

  /**
   * @const @param anchrLidx_x
   * @const @param anchrLoff_x
   * @const @param focusLidx_x
   * @const @param focusLoff
   */
  constructor(
    anchrLidx_x: lnum_t,
    anchrLoff_x: loff_t,
    focusLidx_x?: lnum_t,
    focusLoff?: loff_t,
  ) {
    super(4);

    this.set_Ranval(anchrLidx_x, anchrLoff_x, focusLidx_x, focusLoff);
  }

  /** @primaryconst @param ran_x */
  static fromRan(ran_x: Ran): Ranval {
    return new Ranval(
      ran_x.frstLidx_1,
      ran_x.strtLoff,
      ran_x.lastLidx_1,
      ran_x.stopLoff,
    );
  }
  /**
   * @primaryconst @param loc_x
   * @const @param ldt_x
   */
  static fromLoc(loc_x: Loc, ldt_x: ldt_t = 0): Ranval {
    return new Ranval(loc_x.line_$.lidx_1, loc_x.loff_$ + ldt_x);
  }

  /**
   * @const @param anchrLidx_x
   * @const @param anchrLoff_x
   * @const @param focusLidx_x
   * @const @param focusLoff
   */
  set_Ranval(
    anchrLidx_x: lnum_t,
    anchrLoff_x: loff_t,
    focusLidx_x?: lnum_t,
    focusLoff?: loff_t,
  ): this {
    this[2] = anchrLidx_x;
    this[3] = anchrLoff_x;
    this[0] = focusLidx_x === undefined ? anchrLidx_x : focusLidx_x;
    this[1] = focusLoff === undefined ? anchrLoff_x : focusLoff;
    return this;
  }
  /** @primaryconst @param ran_x */
  setByRan(ran_x: Ran): this {
    return this.set_Ranval(
      ran_x.frstLidx_1,
      ran_x.strtLoff,
      ran_x.lastLidx_1,
      ran_x.stopLoff,
    );
  }
  /** @primaryconst @param loc_x */
  focusLoc(loc_x: Loc, collapse_x?: "collapse"): this {
    this[0] = loc_x.line_$.lidx_1;
    this[1] = loc_x.loff_$;
    if (collapse_x) this.collapseToFocus();
    return this;
  }
  /** @primaryconst @param loc_x */
  anchrLoc(loc_x: Loc, collapse_x?: "collapse"): this {
    this[2] = loc_x.line_$.lidx_1;
    this[3] = loc_x.loff_$;
    if (collapse_x) this.collapseToAnchr();
    return this;
  }

  /** @const */
  dup_Ranval() {
    return new Ranval(this[2], this[3], this[0], this[1]);
  }

  //jjjj TOCLEANUP
  // [Symbol.dispose]() {
  //   g_ranval_fac.revoke(this);
  // }

  //jjjj TOCLEANUP
  // /**
  //  * @final
  //  * @const
  //  */
  // usingDup() {
  //   return g_ranval_fac.oneMore().become_Array(this);
  // }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @const */
  get order(): -1 | 0 | 1 {
    if (this[0] > this[2]) return 1;
    if (this[0] < this[2]) return -1;
    if (this[1] > this[3]) return 1;
    if (this[1] < this[3]) return -1;
    return 0;
  }
  /** @const */
  get collapsed() {
    return this.order === 0;
  }

  collapseToFocus(): this {
    this[2] = this[0];
    this[3] = this[1];
    return this;
  }
  collapseToAnchr(): this {
    this[0] = this[2];
    this[1] = this[3];
    return this;
  }
  collapseToHead(): this {
    return this.order > 0 ? this.collapseToFocus() : this.collapseToAnchr();
  }
  collapseToTail(): this {
    return this.order < 0 ? this.collapseToFocus() : this.collapseToAnchr();
  }

  override reverse(): this {
    let t_ = this[0];
    this[0] = this[2];
    this[2] = t_;
    t_ = this[1];
    this[1] = this[3];
    this[3] = t_;
    return this;
  }

  /**
   * @const @param lidx_0_x
   * @const @param loff_0_x
   * @const @param lidx_1_x
   * @const @param loff_1_x
   */
  static posSE(
    lidx_0_x: lnum_t,
    loff_0_x: loff_t,
    lidx_1_x: lnum_t,
    loff_1_x: loff_t,
  ) {
    return lidx_0_x < lidx_1_x || lidx_0_x === lidx_1_x && loff_0_x <= loff_1_x;
  }
  /**
   * @const @param lidx_0_x
   * @const @param loff_0_x
   * @const @param lidx_1_x
   * @const @param loff_1_x
   */
  static posS(
    lidx_0_x: lnum_t,
    loff_0_x: loff_t,
    lidx_1_x: lnum_t,
    loff_1_x: loff_t,
  ) {
    return lidx_0_x < lidx_1_x || lidx_0_x === lidx_1_x && loff_0_x < loff_1_x;
  }
  /**
   * @const
   * @const @param rhs_x
   */
  posSE(rhs_x: Ranval): boolean {
    return Ranval.posSE(
      this.anchrLidx,
      this.anchrLoff,
      rhs_x.anchrLidx,
      rhs_x.anchrLoff,
    );
  }
  /**
   * @const
   * @const @param rhs_x
   */
  posS(rhs_x: Ranval): boolean {
    return Ranval.posS(
      this.anchrLidx,
      this.anchrLoff,
      rhs_x.anchrLidx,
      rhs_x.anchrLoff,
    );
  }
  /**
   * @const
   * @const @param rv_x
   */
  contain(rv_x: Ranval): boolean {
    const o_ = this.order;
    const o_1 = rv_x.order;
    if (o_ > 0) {
      if (o_1 > 0) {
        return Ranval.posSE(this[2], this[3], rv_x[2], rv_x[3]) &&
          Ranval.posSE(rv_x[0], rv_x[1], this[0], this[1]);
      } else {
        return Ranval.posSE(this[2], this[3], rv_x[0], rv_x[1]) &&
          Ranval.posSE(rv_x[2], rv_x[3], this[0], this[1]);
      }
    } else if (o_ < 0) {
      if (o_1 > 0) {
        return Ranval.posSE(this[0], this[1], rv_x[2], rv_x[3]) &&
          Ranval.posSE(rv_x[0], rv_x[1], this[2], this[3]);
      } else {
        return Ranval.posSE(this[0], this[1], rv_x[0], rv_x[1]) &&
          Ranval.posSE(rv_x[2], rv_x[3], this[2], this[3]);
      }
    } else {
      return false;
    }
  }

  /** @headconst @param bufr_x  */
  getTextFrom(bufr_x: Bufr) {
    using ran_u = g_ran_fac.setBufr(bufr_x).oneMore().setByRanval(this);
    return ran_u.getText();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override toString() {
    return this.collapsed
      ? `[${this[2]}-${this[3]})`
      : `[${this[2]}-${this[3]},${this[0]}-${this[1]})`;
  }
}
/*64----------------------------------------------------------*/

const ranvalEq_: MooEq<Ranval> = (a, b) =>
  a === b || a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];

export class RanvalMo extends Moo<Ranval> {
  constructor(ranval_x?: Ranval) {
    super({
      val: ranval_x ?? new Ranval(0, 0),
      eq_: ranvalEq_,
      active: true,
    });
  }
}
/*64----------------------------------------------------------*/

// export class SortedRanval extends SortedSet<Ranval> {
//   static #less(endpt_x: Endpt): Less<Ranval> {
//     return endpt_x === Endpt.anchr
//       ? (a_y, b_y) => Ranval.posSE(a_y[2], a_y[3], b_y[2], b_y[3])
//       : (a_y, b_y) => Ranval.posSE(a_y[0], a_y[1], b_y[0], b_y[1]);
//   }

//   constructor(val_a_x?: Ranval[], endpt_x = Endpt.anchr) {
//     super(SortedRanval.#less(endpt_x), val_a_x);
//     this.resort();
//   }
// }
/*64----------------------------------------------------------*/

//jjjj TOCLEANUP
// class RanvalFac_ extends Factory<Ranval> {
//   /** @implement */
//   protected createVal$() {
//     // /*#static*/ if (PRF) {
//     //   console.log(
//     //     `%c# of cached Ranval instances: ${this.val_a$.length + 1}`,
//     //     `color:${LOG_cssc.performance}`,
//     //   );
//     // }
//     return new Ranval(0, 0);
//   }
// }
// export const g_ranval_fac = new RanvalFac_();
/*80--------------------------------------------------------------------------*/
