/** 80**************************************************************************
 * @module lib/compiling/Loc
 * @license MIT
 ******************************************************************************/

import { INOUT, PRF } from "../../preNs.ts";
import type {
  BufrDir,
  int,
  lcol_t,
  ldt_t,
  lnum_t,
  loff_t,
  UChr,
  uint,
} from "../alias.ts";
import { Endpt } from "../alias.ts";
import type { Id_t, UInt16 } from "../alias_v.ts";
import type { Bidi } from "../Bidi.ts";
import { assert } from "../util.ts";
import { Factory } from "../util/Factory.ts";
import { g_count } from "../util/performance.ts";
import type { Bufr } from "./Bufr.ts";
import type { Line } from "./Line.ts";
import { Ranval } from "./Ranval.ts";
/*80--------------------------------------------------------------------------*/

export type LocInfo = {
  ucod: UInt16;
  codp: uint;
  /** surrogate leading */
  isSurLead: boolean;
  /** surrogate trailing */
  isSurTral: boolean;
};

/** Loc compared */
export const enum LocCfd {
  yes = 0b0_0001,
  /** no but at the same `Line` */
  no_sameline = 0b0_0010,
  /** no and not at the same `Line` */
  no_othrline = 0b0_0100,
  /** no and not in the same `Bufr` */
  no_othrBufr = 0b0_1000,
  /* just use `!== LocCfd.yes` */
  // no = no_sameline | no_othrline | no_othrBufr,
}

//jjjj TOCLEANUP
// type BidirMap_ = Map<Line, Bidir>;
// type BidirMap_ = Map<lnum_t, Bidir>;
// export type _BidirMap_ = BidirMap_;
type BidiO_ = {
  bidi_1(_: lnum_t): Bidi;
};
export type _BidiO_ = BidiO_;

/** primaryconst: const exclude `#info` */
export class Loc {
  static #ID = 0 as Id_t;
  readonly id = ++Loc.#ID as Id_t;
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  line_$!: Line;
  get line() {
    return this.line_$;
  }
  get bufr() {
    return this.line_$.bufr;
  }
  loff_$!: loff_t;
  /** @final */
  get loff(): loff_t {
    return this.loff_$;
  }
  /** @final */
  set loff(_x: loff_t) {
    if (this.loff_$ !== _x) {
      this.loff_$ = _x;
      this.#lcol = -1;
      this.#part = false;
    }
  }
  //jjjj can rename to `lidx`
  /** @primaryconst */
  get lidx_1() {
    return this.line_$.lidx_1;
  }

  #info?: LocInfo;

  protected tabsize$: 2 | 4 | 8 = 4;
  get tabsize() {
    return this.tabsize$;
  }
  // //jjjj
  // set tabsize(_x: 2 | 4 | 8) {
  //   this.tabsize$ = _x;
  // }

  /**
   **! Any change of `line_$` or `loff_$` should invalidate `#lcol` to -1.
   */
  #lcol: lcol_t | -1 = -1;

  /** If tab partially consumed or not */
  #part = false;
  get part() {
    return this.#part;
  }

  /** `in( this.#part )` */
  get tabtail(): lcol_t {
    return this.tabsize$ - this.#lcol % this.tabsize$;
  }
  /** `in( this.#part )` */
  get tabhead(): lcol_t {
    return this.#lcol % this.tabsize$;
  }

  get dir(): BufrDir {
    return this.bufr?.dir ?? "ltr";
  }

  //jjjj TOCLEANUP
  // /** Peeked `Loc` */
  // protected poc$?: Loc;

  /**
   * @headconst @param line_x
   * @const @param loff_x
   */
  constructor(line_x: Line, loff_x?: loff_t) {
    this.set_Loc(line_x, loff_x);

    /*#static*/ if (PRF) {
      g_count.newLoc += 1;
    }
  }
  /**
   * @headconst @param bufr_x
   * @const @param lidx_x
   * @const @param loff_x
   */
  static create(bufr_x: Bufr, lidx_x: lnum_t, loff_x?: loff_t) {
    return new Loc(bufr_x.line(lidx_x), loff_x);
  }

  /**
   * `out( this.line_$)`
   * @final
   * @headconst @param line_x
   * @const @param loff_x
   */
  set_Loc(line_x: Line, loff_x?: loff_t): this {
    this.line_$ = line_x;
    this.loff_$ = loff_x === undefined ? line_x.uchrLen : loff_x;
    this.#lcol = -1;
    this.#part = false;
    return this;
  }
  /** @final */
  set_Loc_O(lidx_x: lnum_t, loff_x?: loff_t, bufr_x = this.bufr) {
    /*#static*/ if (INOUT) {
      assert(bufr_x);
    }
    const line = bufr_x!.line(lidx_x);
    return this.set_Loc(line, loff_x);
  }

  /** @const */
  dup_Loc() {
    const ret = new Loc(this.line_$, this.loff_$);
    ret.tabsize$ = this.tabsize$;
    ret.#lcol = this.#lcol;
    ret.#part = this.#part;
    return ret;
  }

  /**
   * @final
   * @const @param loc_x
   */
  become_Loc(loc_x: Loc): this {
    this.line_$ = loc_x.line_$;
    this.loff_$ = loc_x.loff_$;
    this.tabsize$ = loc_x.tabsize$;
    this.#lcol = loc_x.#lcol;
    this.#part = loc_x.#part;
    return this;
  }

  rev(): void {
    g_loc_fac.revoke(this);
  }
  [Symbol.dispose]() {
    this.rev();
  }

  /** @const */
  usingDup() {
    return g_loc_fac.setLine(this.line_$).oneMore().become_Loc(this);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  // reset() { this.line_$ = null; }
  // get unset() { return !this.line_$; }

  /** @const */
  get atSol() {
    return this.loff_$ === 0;
  }
  /**
   * @const
   * "Start Of Bufr"
   */
  get atSob() {
    return this.line_$.isFrstLine && this.atSol;
  }
  /** @const */
  get atEol() {
    return this.loff_$ === this.line_$.uchrLen;
  }
  /** @const */
  get overEol() {
    return this.loff_$ > this.line_$.uchrLen;
  }
  correctLoff(): loff_t {
    if (this.overEol) this.loff_$ = this.line_$.uchrLen;
    else if (this.loff_$ < 0) this.loff_$ = 0;
    return this.loff_$;
  }
  /** @const */
  get reachEol() {
    return this.loff_$ >= this.line_$.uchrLen;
  }
  /** @const */
  get reachEob() {
    return this.line_$.isLastLine && this.reachEol;
  }

  /**
   * `in( this.loff_$ >= 0)`
   * @const
   */
  get uchr(): UChr {
    return (this.overEol || this.reachEob)
      ? "\x00"
      : this.atEol
      ? "\n"
      : this.line_$.uchrAt(this.loff_$);
  }

  /** @see {@linkcode uchr} */
  get ucod(): UInt16 {
    return (this.overEol || this.reachEob)
      ? 0 as UInt16
      : this.atEol
      ? /* "\n" */ 0xA as UInt16
      : this.line_$.ucodAt(this.loff_$);
  }
  /** @see {@linkcode uchr} */
  get codp(): uint {
    return (this.overEol || this.reachEob)
      ? 0
      : this.atEol
      ? /* "\n" */ 0xA
      : this.line_$.codpAt(this.loff_$);
  }
  /**
   * `in( this.loff_$ >= 0)`
   * @primaryconst
   * @return newly assigned `#info`
   */
  get info_1(): LocInfo {
    this.#info ??= {} as LocInfo;
    if (this.overEol || this.reachEob) {
      this.#info.ucod = 0 as UInt16;
      this.#info.codp = 0;
      this.#info.isSurLead = false;
      this.#info.isSurTral = false;
    } else if (this.atEol) {
      this.#info.ucod = /* "\n" */ 0xA as UInt16;
      this.#info.codp = /* "\n" */ 0xA;
      this.#info.isSurLead = false;
      this.#info.isSurTral = false;
    } else {
      const t_ = this.line_$.text;
      const i_ = this.loff_$;
      this.#info.ucod = t_.charCodeAt(i_) as UInt16;
      this.#info.codp = t_.codePointAt(i_)!;
      this.#info.isSurLead = t_.isSurLead(i_);
      this.#info.isSurTral = t_.isSurTral(i_);
    }
    return this.#info;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  forw(inline_x?: "inline"): this {
    if (this.reachEob) return this;

    ++this.loff_$;
    if (!inline_x && this.overEol && !this.line_$.isLastLine) {
      this.line_$ = this.line_$.nextLine!;
      this.loff_$ = 0;
    }
    this.#lcol = -1;
    this.#part = false;
    return this;
  }
  back(inline_x?: "inline"): this {
    if (this.atSob) return this;

    if (this.atSol) {
      if (!inline_x) {
        this.line_$ = this.line_$.prevLine!;
        this.loff_$ = this.line_$.uchrLen;
      }
    } else {
      --this.loff_$;
    }
    this.#lcol = -1;
    this.#part = false;
    return this;
  }
  forwn(n_x: loff_t, inline_x?: "inline"): this {
    while (n_x-- > 0) this.forw(inline_x);
    return this;
  }
  backn(n_x: loff_t, inline_x?: "inline"): this {
    while (n_x-- > 0) this.back(inline_x);
    return this;
  }

  /** @final */
  uchr_forw(inline_x?: "inline"): UChr {
    const ret = this.uchr;
    this.forw(inline_x);
    return ret;
  }
  /** @final */
  ucod_forw(inline_x?: "inline"): UInt16 {
    const ret = this.ucod;
    this.forw(inline_x);
    return ret;
  }
  //jjjj TOCLEANUP
  // /** @final */
  // forw_uchr(inline_x?: "inline"): UChr {
  //   return this.forw(inline_x).uchr;
  // }
  // /** @final */
  // forw_ucod(inline_x?: "inline"): UInt16 {
  //   return this.forw(inline_x).ucod;
  // }

  toSol(): this {
    this.loff_$ = 0;
    this.#lcol = 0;
    this.#part = false;
    return this;
  }
  toEol(): this {
    this.loff = this.line_$.uchrLen;
    return this;
  }

  /** @const */
  peek_uchr(n_x: int, inline_x?: "inline"): UChr {
    using loc_u = this.usingDup();
    if (n_x >= 0) loc_u.forwn(n_x, inline_x);
    else loc_u.backn(-n_x, inline_x);
    return loc_u.uchr;
  }
  /** @const */
  peek_ucod(n_x: int, inline_x?: "inline"): UInt16 {
    using loc_u = this.usingDup();
    if (n_x >= 0) loc_u.forwn(n_x, inline_x);
    else loc_u.backn(-n_x, inline_x);
    return loc_u.ucod;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/
  /* comparison */

  /**
   * `in( !this.removed && !line_x.removed)`
   * @primaryconst
   * @primaryconst @param line_x
   * @const @param loff_x
   */
  #locS(line_x: Line, loff_x: loff_t): LocCfd {
    if (this.bufr !== line_x.bufr) return LocCfd.no_othrBufr;
    if (this.line_$ === line_x && this.loff_$ >= loff_x) {
      return LocCfd.no_sameline;
    }
    if (this.lidx_1 > line_x.lidx_1) return LocCfd.no_othrline;
    return LocCfd.yes;
  }
  /** @see {@linkcode #locS()} */
  #posS(line_x: Line, loff_x: loff_t): boolean {
    return this.line_$.bufr === line_x.bufr &&
      (this.line_$ === line_x && this.loff_$ < loff_x ||
        this.lidx_1 < line_x.lidx_1);
  }
  /** @see {@linkcode #locS()} */
  #locGE(line_x: Line, loff_x: loff_t): LocCfd {
    if (this.bufr !== line_x.bufr) return LocCfd.no_othrBufr;
    if (this.line_$ === line_x && this.loff_$ < loff_x) {
      return LocCfd.no_sameline;
    }
    if (this.lidx_1 < line_x.lidx_1) return LocCfd.no_othrline;
    return LocCfd.yes;
  }
  /** @see {@linkcode #locS()} */
  #posGE(line_x: Line, loff_x: loff_t): boolean {
    return this.line_$.bufr === line_x.bufr &&
      (this.line_$ === line_x && this.loff_$ >= loff_x ||
        this.lidx_1 > line_x.lidx_1);
  }
  /** @see {@linkcode #locS()} */
  #locSE(line_x: Line, loff_x: loff_t): LocCfd {
    if (this.bufr !== line_x.bufr) return LocCfd.no_othrBufr;
    if (this.line_$ === line_x && this.loff_$ > loff_x) {
      return LocCfd.no_sameline;
    }
    if (this.lidx_1 > line_x.lidx_1) return LocCfd.no_othrline;
    return LocCfd.yes;
  }
  /** @see {@linkcode #locS()} */
  #posSE(line_x: Line, loff_x: loff_t): boolean {
    return this.line_$.bufr === line_x.bufr &&
      (this.line_$ === line_x && this.loff_$ <= loff_x ||
        this.lidx_1 < line_x.lidx_1);
  }
  /** @see {@linkcode #locS()} */
  #locG(line_x: Line, loff_x: loff_t): LocCfd {
    if (this.bufr !== line_x.bufr) return LocCfd.no_othrBufr;
    if (this.line_$ === line_x && this.loff_$ <= loff_x) {
      return LocCfd.no_sameline;
    }
    if (this.lidx_1 < line_x.lidx_1) return LocCfd.no_othrline;
    return LocCfd.yes;
  }
  /** @see {@linkcode #locS()} */
  #posG(line_x: Line, loff_x: loff_t): boolean {
    return this.line_$.bufr === line_x.bufr &&
      (this.line_$ === line_x && this.loff_$ > loff_x ||
        this.lidx_1 > line_x.lidx_1);
  }
  /**
   * `in( !this.removed && !line_x.removed)`
   * @const
   * @const @param line_x
   * @const @param loff_x
   */
  #locE(line_x: Line, loff_x: loff_t): LocCfd {
    if (this.bufr !== line_x.bufr) return LocCfd.no_othrBufr;
    if (this.line_$ !== line_x) return LocCfd.no_othrline;
    if (this.loff_$ !== loff_x) return LocCfd.no_sameline;
    return LocCfd.yes;
  }
  /** @see {@linkcode #locE()} */
  #posE(line_x: Line, loff_x: loff_t): boolean {
    return this.line_$.bufr === line_x.bufr &&
      this.line_$ === line_x && this.loff_$ === loff_x;
  }

  /**
   * @final
   * @primaryconst
   * @primaryconst @param rhs_x
   */
  locS(rhs_x: Loc): LocCfd {
    return this.#locS(rhs_x.line_$, rhs_x.loff_$);
  }
  /** @see {@linkcode locS()} */
  posS(rhs_x: Loc): boolean {
    return this.#posS(rhs_x.line_$, rhs_x.loff_$);
  }
  /** @see {@linkcode locS()} */
  posS_inline(rhs_x: Loc): boolean {
    return this.locGE(rhs_x) === LocCfd.no_sameline;
  }
  /** @see {@linkcode locS()} */
  locGE(rhs_x: Loc): LocCfd {
    return this.#locGE(rhs_x.line_$, rhs_x.loff_$);
  }
  /** @see {@linkcode locS()} */
  posGE(rhs_x: Loc): boolean {
    return this.#posGE(rhs_x.line_$, rhs_x.loff_$);
  }
  /** @see {@linkcode locS()} */
  locSE(rhs_x: Loc): LocCfd {
    return this.#locSE(rhs_x.line_$, rhs_x.loff_$);
  }
  /** @see {@linkcode locS()} */
  posSE(rhs_x: Loc): boolean {
    return this.#posSE(rhs_x.line_$, rhs_x.loff_$);
  }
  /** @see {@linkcode locS()} */
  locG(rhs_x: Loc): LocCfd {
    return this.#locG(rhs_x.line_$, rhs_x.loff_$);
  }
  /** @see {@linkcode locS()} */
  posG(rhs_x: Loc): boolean {
    return this.#posG(rhs_x.line_$, rhs_x.loff_$);
  }
  /**
   * @final
   * @const
   * @const @param rhs_x
   * @const @param n_x
   */
  locE(rhs_x: Loc, n_x?: ldt_t): LocCfd {
    if (n_x === undefined || n_x === 0) {
      return this.#locE(rhs_x.line_$, rhs_x.loff_$);
    }

    using rhs_u = rhs_x.usingDup();
    if (n_x > 0) rhs_u.forwn(n_x);
    else rhs_u.backn(-n_x);
    return this.locE(rhs_u);
  }
  /** @see {@linkcode locE()} */
  posE(rhs_x: Loc, n_x?: int): boolean {
    if (n_x === undefined || n_x === 0) {
      return this.#posE(rhs_x.line_$, rhs_x.loff_$);
    }

    using rhs_u = rhs_x.usingDup();
    if (n_x > 0) rhs_u.forwn(n_x);
    else rhs_u.backn(-n_x);
    return this.posE(rhs_u);
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * Calc line column by `hintLoff_x` and `hintLcol_x`\
   * Set `#lcol` if `#lcol < 0` or `recalc_x`\
   *
   **! `this` can be `#part` if `this.#lcol >= 0 && !recalc_x`
   *
   * @const @param recalc_x
   */
  lcol_1(
    hintLoff_x: loff_t = 0,
    hintLcol_x: lcol_t = 0,
    recalc_x?: "recalc",
  ): lcol_t {
    if (this.#lcol >= 0 && !recalc_x) return this.#lcol;

    this.#part = false;

    if (hintLoff_x > this.loff_$) {
      hintLoff_x = 0;
      hintLcol_x = 0;
    }
    if (hintLoff_x === this.loff_$) return this.#lcol = hintLcol_x;

    let ret = hintLcol_x;
    using loc_ = this.usingDup().set_Loc(this.line_$, hintLoff_x);
    for (; loc_.loff_$ < this.loff_$; ++loc_.loff_$) {
      if (loc_.ucod === /* "\t" */ 9) {
        ret += this.tabsize$ - ret % this.tabsize$;
      } else {
        ++ret;
      }
    }
    return this.#lcol = ret;
  }
  /**
   * Calc line column by `loc_x.loff_$` and `loc_x.lcol_1()`\
   * Set `#lcol` if `#lcol < 0` or `recalc_x`\
   *
   * `in( this.bufr === loc_x.bufr)`
   *
   * @const @param loc_x
   */
  lcolBy(loc_x: Loc): lcol_t {
    using loc_ = loc_x.usingDup();
    if (loc_.#part) {
      loc_.#lcol -= loc_.#lcol % this.tabsize$;
      loc_.#part = false;
    } else {
      loc_.lcol_1();
    }
    return this.lcol_1(loc_.loff_$, loc_.#lcol);
  }

  /**
   * Set `loff_$`, `#lcol, `#part`
   * @const @param n_x
   */
  forwnCol(n_x: lcol_t): void {
    let uchrsToTab, lcol_;
    if (this.#part) {
      uchrsToTab = this.tabsize$ - this.#lcol % this.tabsize$;
      if (n_x < uchrsToTab) {
        this.#lcol += n_x;
        return;
      }

      this.#lcol += uchrsToTab;
      this.#part = false;
      ++this.loff_$;
      n_x -= uchrsToTab;
    } else {
      this.lcol_1();
    }

    let ucod;
    while (n_x > 0 && (ucod = this.ucod)) {
      if (ucod === /* "\t" */ 9) {
        uchrsToTab = this.tabsize$ - (this.#lcol % this.tabsize$);
        lcol_ = uchrsToTab > n_x ? n_x : uchrsToTab;
        this.#lcol += lcol_;
        this.#part = uchrsToTab > n_x;
        this.loff_$ += this.#part ? 0 : 1;
        n_x -= lcol_;
      } else {
        ++this.#lcol;
        this.#part = false;
        ++this.loff_$;
        --n_x;
      }
    }
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** @const */
  getText(stop_x?: loff_t): string {
    return this.line_$.text.slice(this.loff_$, stop_x);
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @headconst @param bidiO_x
   * @const @param row_x
   * @return effective or not
   */
  visulFarleftenIn(bidiO_x: BidiO_, row_x?: "row"): boolean {
    const bidi = bidiO_x.bidi_1(this.lidx_1);
    const oldLoff = this.loff_$;
    this.loff_$ = bidi.visulFarleften(
      row_x ? bidi.rowOf(this.loff_$) : undefined,
    );
    return oldLoff !== this.loff_$;
  }
  /** @see {@linkcode visulFarleftenIn()} */
  visulFarrigtenIn(bidiO_x: BidiO_, row_x?: "row"): boolean {
    const bidi = bidiO_x.bidi_1(this.lidx_1);
    const oldLoff = this.loff_$;
    this.loff_$ = bidi.visulFarrigten(
      row_x ? bidi.rowOf(this.loff_$) : undefined,
    );
    return oldLoff !== this.loff_$;
  }

  /**
   * @headconst @param bidiO_x
   * @return effective or not
   */
  visulLeftenIn(bidiO_x: BidiO_): boolean {
    const Dir_ = this.dir;
    //jjjj TOCLEANUP
    // let ln_1: Line | undefined;
    // /* The case `atEol` does not go through Bidi, because it's not in `[0,$)`. */
    // if (this.atEol && Dir_ === BufrDir.rtl) {
    //   ln_1 = this.line.nextLine;
    //   if (!ln_1) return false;

    //   this.line_$ = ln_1;
    //   this.visulFarrigtenIn(bidiO_x);
    //   return true;
    // }

    const bidi = bidiO_x.bidi_1(this.lidx_1);
    const ret = bidi.visulLeften(this.loff_$);
    this.loff_$ = bidi.lastLogal;
    if (ret) return true;

    const ln_1 = Dir_ === "ltr" ? this.line.prevLine : this.line.nextLine;
    if (!ln_1) return false;

    this.line_$ = ln_1;
    this.visulFarrigtenIn(bidiO_x);
    return true;
  }
  /** @see {@linkcode visulLeftenIn()} */
  visulRigtenIn(bidiO_x: BidiO_): boolean {
    const Dir_ = this.dir;
    //jjjj TOCLEANUP
    // let ln_1: Line | undefined;
    // /* The case `atEol` does not go through Bidi, because it's not in `[0,$)`. */
    // if (this.atEol && Dir_ === BufrDir.ltr) {
    //   ln_1 = this.line.nextLine;
    //   if (!ln_1) return false;

    //   this.line_$ = ln_1;
    //   this.visulFarleftenIn(bidiO_x);
    //   return true;
    // }

    const bidi = bidiO_x.bidi_1(this.lidx_1);
    const ret = bidi.visulRigten(this.loff_$);
    this.loff_$ = bidi.lastLogal;
    if (ret) return true;

    const ln_1 = Dir_ === "ltr" ? this.line.nextLine : this.line.prevLine;
    if (!ln_1) return false;

    this.line_$ = ln_1;
    this.visulFarleftenIn(bidiO_x);
    return true;
  }

  /** @headconst @param bidiO_x */
  updateBidi(bidiO_x: BidiO_): void {
    const bidi = bidiO_x.bidi_1(this.lidx_1);
    bidi.update(this.loff_$);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @primaryconst
   * @out @param ret_x
   * @const @param endpt_x
   */
  toRanval(ret_x?: Ranval, endpt_x?: Endpt): Ranval {
    /*#static*/ if (INOUT) {
      assert(!ret_x || ret_x && endpt_x);
    }
    if (ret_x) {
      if (endpt_x === Endpt.focus) {
        ret_x[0] = this.lidx_1;
        ret_x[1] = this.loff_$;
      } else if (endpt_x === Endpt.anchr) {
        ret_x[2] = this.lidx_1;
        ret_x[3] = this.loff_$;
      }
    } else {
      ret_x = new Ranval(this.lidx_1, this.loff_$);
    }
    return ret_x;
  }

  /**
   * For testing only
   * @primaryconst
   */
  toString() {
    return `${this.lidx_1}-${this.loff_$}`;
  }
}
/*64----------------------------------------------------------*/

class LocFac_ extends Factory<Loc> {
  #line!: Line;
  setLine(_x: Line): this {
    this.#line = _x;
    return this;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @implement */
  protected createVal$() {
    // /*#static*/ if (PRF) {
    //   console.log(
    //     `%c# of cached Loc instances: ${this.val_a$.length + 1}`,
    //     `color:${LOG_cssc.performance}`,
    //   );
    // }
    return new Loc(this.#line, 0);
  }

  protected override reuseVal$(v_x: Loc): void {
    v_x.set_Loc(this.#line, 0);
  }
}
export const g_loc_fac = new LocFac_();
/*80--------------------------------------------------------------------------*/
