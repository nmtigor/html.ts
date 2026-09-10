/** 80**************************************************************************
 * @module lib/compiling/Stnode
 * @license MIT
 ******************************************************************************/

import type { ERan, ERanr } from "@fe-edt/ERan.ts";
import { INOUT, PRF } from "../../preNs.ts";
import type { int, lnum_t, loff_t, uint } from "../alias.ts";
import type { Ts_t } from "../alias_v.ts";
import { assert, fail, out } from "../util.ts";
import type { Cf } from "../util/SortedSet.ts";
import { SortedSet } from "../util/SortedSet.ts";
import { g_count } from "../util/performance.ts";
import { BaseTok } from "./BaseTok.ts";
import type { Loc } from "./Loc.ts";
import { Pazr } from "./Pazr.ts";
import { Ranval } from "./Ranval.ts";
import { Snt } from "./Snt.ts";
import type { Token } from "./Token.ts";
import type { Tok } from "./alias.ts";
import type { _OldInfo_ } from "./util.ts";
import { SortedSn_id } from "./util.ts";
/*80--------------------------------------------------------------------------*/

type Depth_ = uint | -1;

/** @final */
export class SortedSn_depth extends SortedSet<Stnode<any>> {
  static #less: Cf<Stnode<any>> = (a, b) => a.depth < b.depth;

  constructor(val_a_x?: Stnode<any>[]) {
    super(SortedSn_depth.#less, val_a_x);
  }
}

export type CalcCommonO_ = {
  unrelSn_ss?: SortedSn_id;
  unrelSn_a?: Stnode<any>[];
  debug?: { a?: Stnode<any>[]; f?: Stnode<any>[][] };
};

/**
 * Syntax node
 *
 * primaryconst: const exclude `#depth`, `frstTk$`, `lastTk$`
 */
export abstract class Stnode<T extends Tok = BaseTok> extends Snt {
  /* #parent */
  #parent: Stnode<T> | undefined;
  get parent() {
    return this.#parent;
  }

  /** @final */
  get isRoot() {
    return !this.#parent;
  }

  detach_$(): this {
    this.#parent = undefined;
    this.#depth = 0;
    return this;
  }

  /**
   * `in( !this.#parent)`
   * @param pa_x
   */
  attachTo_$(pa_x: Stnode<T>): this {
    this.#parent = pa_x;
    this.#depth = -1;
    return this;
  }

  /** @final */
  get root_1() {
    let ret: Stnode<T> = this;
    const VALVE = 1_000;
    let valve = VALVE;
    while (ret.#parent && --valve) ret = ret.#parent;
    assert(valve, `Loop ${VALVE}(±1) times!`);
    return ret;
  }
  /**
   * @final
   * @param sn_x Inclusive
   */
  isAncestorOf(sn_x?: Stnode<T>) {
    const VALVE = 1_000;
    let valve = VALVE;
    while (sn_x && --valve) {
      if (sn_x === this) return true;
      sn_x = sn_x.#parent;
    }
    assert(valve, `Loop ${VALVE}(±1) times!`);
    return false;
  }
  /* ~ */

  /* children */
  // protected children$: Stnode<T>[] | undefined;
  get children(): Stnode<T>[] | undefined {
    // return fail("Not implemented");
    return undefined;
  }
  /** @final */
  _c_(i_x: int): Stnode<T> | undefined {
    return this.children?.at(i_x);
  }

  //jjjj TOCLEANUP
  // get hasChild() {
  //   return this.children?.length;
  // }

  /** @final */
  get frstChild(): Stnode<T> | undefined {
    return this.children?.at(0);
  }
  /** @final */
  get lastChild(): Stnode<T> | undefined {
    return this.children?.at(-1);
  }

  // /** @final */
  // get frstLeaf(): Stnode<T> | undefined {
  //   const c_ = this.frstChild;
  //   if (!c_) return undefined;

  //   const ret = c_.frstLeaf;
  //   return ret ?? c_;
  // }
  // /** @final */
  // get lastLeaf(): Stnode<T> | undefined {
  //   const c_ = this.lastChild;
  //   if (!c_) return undefined;

  //   const ret = c_.lastLeaf;
  //   return ret ?? c_;
  // }

  /** @headmove @return */
  get siblings(): Stnode<T>[] | undefined {
    const s_a = this.#parent?.children;
    if (!s_a?.length) return undefined;

    const i_ = s_a.indexOf(this);
    return i_ >= 0 ? s_a.toSpliced(i_, 1) : undefined;
  }

  get prevStnod(): Stnode<T> | undefined {
    const s_a = this.#parent?.children;
    if (!s_a?.length) return undefined;

    const i_ = s_a.indexOf(this);
    return i_ > 0 ? s_a[i_ - 1] : this.#parent!.prevStnod;
  }
  get nextStnod(): Stnode<T> | undefined {
    const s_a = this.#parent?.children;
    if (!s_a?.length) return undefined;

    const i_ = s_a.indexOf(this);
    return 0 <= i_ && i_ < s_a.length - 1
      ? s_a[i_ + 1]
      : this.#parent!.nextStnod;
  }

  // /**
  //  * Not rely on the token chain
  //  * @final
  //  */
  // get prevLeaf(): Stnode<T> | undefined {
  //   const s_a = this.#parent?.children;
  //   if (!s_a?.length) return undefined;

  //   const i_ = s_a.indexOf(this);
  //   return i_ > 0 ? s_a[i_ - 1].frstLeaf : this.#parent!.prevLeaf;
  // }
  // /** @see {@linkcode prevLeaf} */
  // get nextLeaf(): Stnode<T> | undefined {
  //   const s_a = this.#parent?.children;
  //   if (!s_a?.length) return undefined;

  //   const i_ = s_a.indexOf(this);
  //   return 0 <= i_ && i_ < s_a.length - 1
  //     ? s_a[i_ + 1].lastLeaf
  //     : this.#parent!.nextLeaf;
  // }
  /* ~ */

  /* #depth */
  /** 0 means no parent */
  #depth: Depth_ = -1;
  get depth(): Depth_ {
    return this.#depth;
  }
  set depth_$(de_x: Depth_) {
    this.#depth = de_x;
  }

  /**
   * Set `#depth`
   * @final
   */
  get depth_1(): Depth_ {
    let retDe: Depth_ = 0;
    let pa_ = this.#parent;
    const VALVE = 1_000;
    let valve = VALVE;
    while (pa_ && --valve) {
      retDe += 1;
      if (pa_.#depth >= 0) {
        retDe += pa_.#depth;
        break;
      }
      pa_ = pa_.#parent;
    }
    assert(valve, `Loop ${VALVE}(±1) times!`);

    return this.#depth = retDe;
  }

  /**
   * @final
   * @const
   */
  get _depth_2_(): Depth_ {
    return (this.#parent?._depth_2_ ?? -1) + 1;
  }
  /* ~ */

  /** @final */
  get safeSn_1() {
    let ret: Stnode<T> = this;
    const VALVE = 1_000;
    let valve = VALVE;
    while (ret.isErr && ret.#parent && --valve) ret = ret.#parent;
    assert(valve, `Loop ${VALVE}(±1) times!`);
    return ret;
  }

  /* frstTk$ */
  protected frstTk$: Token<T> | undefined;
  /**
   * `in( this.known)`
   * @primaryconst
   */
  get frstToken_1(): Token<T> {
    return fail("Not implemented");
  }
  //jjjj TOCLEANUP
  // /** @final */
  // get frstBdryTk(): Token<T> {
  //   const tk_ = this.frstToken_1;
  //   tk_.sn_$ ??= this; // First setting wins.
  //   return tk_;
  // }
  /** @final @implement */
  get sntFrstLine() {
    return this.frstToken_1.sntFrstLine;
  }
  /** @final @implement */
  get sntFrstLidx_1() {
    return this.sntFrstLine.lidx_1;
  }
  /** @final @implement */
  get sntStrtLoc() {
    return this.frstToken_1.sntStrtLoc;
  }
  /** @final @implement */
  get sntStrtLoff(): loff_t {
    return this.frstToken_1.sntStrtLoff;
  }
  /* ~ */

  /* lastTk$ */
  /** @final */
  protected lastTk$: Token<T> | undefined;
  /**
   * `in( this.known)`
   * @primaryconst
   */
  get lastToken_1(): Token<T> {
    return fail("Not implemented");
  }
  //jjjj TOCLEANUP
  // /** @final */
  // get lastBdryTk(): Token<T> {
  //   const tk_ = this.lastToken_1;
  //   tk_.sn_$ ??= this; // First setting wins.
  //   return tk_;
  // }
  /** @final @implement */
  get sntLastLine() {
    return this.lastToken_1.sntLastLine;
  }
  /** @final @implement */
  get sntLastLidx_1() {
    return this.sntLastLine.lidx_1;
  }
  /** @final @implement */
  get sntStopLoc() {
    return this.lastToken_1.sntStopLoc;
  }
  /** @final @implement */
  get sntStopLoff(): loff_t {
    return this.lastToken_1.sntStopLoff;
  }
  /* ~ */

  /** @final */
  invalBdries(): this {
    if (this.frstTk$?.sn_$ === this) {
      this.frstTk$.sn_$ = undefined;
    }
    if (this.lastTk$?.sn_$ === this) {
      this.lastTk$.sn_$ = undefined;
    }
    this.frstTk$ = undefined;
    this.lastTk$ = undefined;
    return this;
  }

  /** @final */
  ensureBdries(): this {
    //jjjj TOCLEANUP
    // this.frstBdryTk;
    // this.lastBdryTk;
    this.frstToken_1.sn_$ ??= this; // First setting wins.
    this.lastToken_1.sn_$ ??= this;
    return this;
  }
  /** @final */
  ensureAllBdries(): this {
    const c_a = this.children;
    if (c_a) {
      for (const sn of c_a) sn.ensureAllBdries();
    }
    return this.ensureBdries();
  }

  // resetBdries(): void {
  //   this.invalBdries().ensureBdries();
  // }

  //jjjj TOCLEANUP
  // /**
  //  * Used to justify `frstToken_1`, `lastToken_1` in `Pazr.pazMrk_$()`.\
  //  * Override this if `Pazr.pazMrk_$()` is invoked after `Lexr.lex()`.\
  //  * May depend on `children`\
  //  */
  /**
   * 3256
   * @final
   */
  get known(): boolean {
    return !!this.frstTk$ && this.frstTk$.value !== BaseTok.unknown &&
      !!this.lastTk$ && this.lastTk$.value !== BaseTok.unknown;
  }

  /** @final */
  contain(loc_x: Loc): boolean {
    return this.sntStrtLoc.posSE(loc_x) && loc_x.posS(this.sntStopLoc);
  }
  /** @final */
  touch(loc_x: Loc): boolean {
    return this.sntStrtLoc.posSE(loc_x) && loc_x.posSE(this.sntStopLoc);
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /* hl_a$ */
  hl_a$?: Highlight[];

  #highlighted?: boolean;
  /* ~ */

  /* #valid */
  #valid = false;
  #checkTs = 0 as Ts_t;
  /**
   * @final
   * @const @param ts_x
   * @const @param rt_x
   */
  valid_$(ts_x: Ts_t, rt_x?: Stnode<T>, valve_x = 1_000): boolean {
    assert(--valve_x, "Loop 1_000(±1) times!");
    if (this.#checkTs < ts_x) {
      if (rt_x) {
        this.#valid = this.#parent === rt_x || this === rt_x
          ? true
          : !!this.#parent?.valid_$(ts_x, rt_x, valve_x);
      } else {
        this.#valid = false;
      }
      this.#checkTs = ts_x;
    }
    return this.#valid;
  }
  /* ~ */

  /** @final @implement */
  syncERan(eranr_x: ERanr): ERan {
    return eranr_x.getERanOf(
      new Ranval(
        this.sntFrstLidx_1,
        this.sntStrtLoff,
        this.sntLastLidx_1,
        this.sntStopLoff,
      ),
      this.eran$,
    );
  }

  /** @headconst @param pazr_x */
  constructor(pazr_x?: Pazr<T>) {
    super();
    this.NErr$ = 4;

    pazr_x?.sns_$.push(this);

    /*#static*/ if (PRF) {
      g_count.newStnode += 1;
    }
  }

  override destructor(): void {
    /* Related Eran's (if any) should be `rev()`ed at the end of `Lexr.lex()`. */
    this.hl_a$?.forEach((hl) => hl.clear()); // `Array.forEach()` is not invoked for empty slots in sparse arrays.

    super.destructor();
    /*#static*/ if (PRF) {
      g_count.oldStnode += 1;
    }
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @headconst @param oldSn_x
   * @headconst @param newSn_x
   */
  replaceChild(_oldSn_x: Stnode<T>, _newSn_x?: Stnode<T>): void {
    return fail("Not implemented");
  }
  /** @final */
  removeSelf(): void {
    this.#parent?.replaceChild(this);
  }

  //jjjj TOCLEANUP
  // /**
  //  * Helper function
  //  * @final
  //  * @headconst @param newSn_x
  //  */
  // transferParentTo(newSn_x: Stnode<T>) {
  //   /*#static*/ if (INOUT) {
  //     assert(!newSn_x.#parent);
  //   }
  //   newSn_x.#parent = this.#parent;
  //   /* Do not remove `this` from syntax tree because `this` (normally as
  //   `drtSn`) could be needed in `sufrepl_edtr` phase. */
  //   // this.#parent = undefined;
  // }

  //jjjj TOCLEANUP
  // /**
  //  * Helper function
  //  * @final
  //  * @headconst @param newSn_x
  //  */
  // transferBdryTo(newSn_x: Stnode<T>) {
  //   if (this.frstTk$?.sn_$ === this) {
  //     this.frstTk$.sn_$ = newSn_x;
  //   }
  //   if (this.lastTk$?.sn_$ === this) {
  //     this.lastTk$.sn_$ = newSn_x;
  //   }
  // }

  /**
   * Count Stnode error only. Do not count Token error.
   * @final
   */
  get hasErr_1(): boolean {
    if (this.isErr) return true;

    const c_a = this.children;
    if (c_a?.length) {
      for (const sn of c_a) {
        if (sn.hasErr_1) return true;
      }
    }

    return false;
  }

  /** \>=1 */
  static FilterDepth = 2;
  // static FilterDepth = 10;
  /**
   * @final
   * @out @param outSn_a
   * @headconst @param except_x
   * @const @param cln_x
   * @const @param fd_x \>=1
   * @return Same as `hasErr_1`
   */
  filterTo(
    outSn_a: Stnode<T>[],
    except_x?: Stnode<T>,
    cln_x?: "cln",
    fd_x = Stnode.FilterDepth,
  ): boolean {
    if (this === except_x) return false;

    let hasErr = false;
    const c_a = this.children;
    if (c_a?.length) {
      for (const sn of c_a) {
        hasErr = fd_x === 1
          ? sn.hasErr_1
          : sn.filterTo(outSn_a, except_x, cln_x, fd_x - 1);
        if (hasErr) break;
      }
    }
    if (hasErr || this.isErr) return true;

    if (cln_x || !this.isAncestorOf(except_x)) outSn_a.push(this);
    return false;
  }
  /** @see {@linkcode filterTo()} */
  filterChildrenTo(
    outSn_a: Stnode<T>[],
    except_x?: Stnode<T>,
    cln_x?: "cln",
  ): boolean {
    let ret = false;
    const c_a = this.children;
    if (c_a?.length) {
      for (const sn of c_a) {
        ret ||= sn.filterTo(outSn_a, except_x, cln_x);
      }
    }
    ret ||= this.isErr;
    return ret;
  }

  // /**
  //  * @final
  //  * @headconst @param { Token } token
  //  * @return { Boolean }
  //  */
  // directBdryBy$_( token )
  // {
  //   return this.frstTk$ === token || this.lastTk$ === token;
  // }

  // /** @final */
  // get isBdryValid() {
  //   return this.frstTk$.stnode === this && this.lastTk$.stnode === this;
  // }

  // /**
  //  * Is the beginning | end of the whole AST?
  //  * @final
  //  * @return { Boolean }
  //  */
  // isBeg()
  // {
  //   if( this.isRoot ) return true;

  //   return this.calcFrstToken() ===
  //          this.root1.calcFrstToken();
  // }
  // isEnd()
  // {
  //   if( this.isRoot ) return true;

  //   return this.calcLastToken() ===
  //          this.root1.calcLastToken();
  // }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** Helper */
  static readonly sn_ss = new SortedSn_depth();
  /**
   * @out @param unrelSn_ss
   * @headconst @param unrelSn_a
   * @out @param debug
   * @headconst @param sn_ss_x
   * @return `sn_ss_x[0]`
   */
  @out((self: typeof Stnode<any>, _1, args) => {
    const sn_ss = args[1] ?? self.sn_ss;
    assert(
      sn_ss.length === 1 && sn_ss[0] &&
        (!sn_ss[0].isErr || sn_ss[0].isRoot),
    );
  })
  static calcCommon(
    { unrelSn_ss, unrelSn_a, debug }: CalcCommonO_ = {},
    sn_ss_x = this.sn_ss,
  ): Stnode<any> {
    /*#static*/ if (INOUT) {
      assert(sn_ss_x.length);
    }
    if (sn_ss_x.length === 1) {
      return sn_ss_x[0];
    }

    sn_ss_x.forEach((sn) => sn.depth_1);
    sn_ss_x.resort();
    if (debug) debug.a = sn_ss_x.slice();

    const sn2del_ss = unrelSn_ss ? new SortedSn_id(sn_ss_x) : undefined;
    sn2del_ss?.resort()
      .slice()
      .forEach((sn) => {
        while (sn.#parent) {
          sn = sn.#parent;
          sn2del_ss.add(sn);
        }
      });

    let swapSn;
    const swap = (i_y: uint, j_y: uint): void => {
      if (i_y !== j_y) {
        swapSn = sn_ss_x[i_y];
        sn_ss_x[i_y] = sn_ss_x[j_y];
        sn_ss_x[j_y] = swapSn;
      }
    };

    const VALVE = 1_000;
    let valve = VALVE;

    /**
     * @const @param i_y sn_ss_x[i_y].#depth >= 0
     * @param n_y >=1
     */
    const floatUp = (i_y: uint, n_y: uint = 1): void => {
      let sn_i = sn_ss_x[i_y];
      let de_ = sn_i.depth;
      while (n_y--) {
        //jjjj TOCLEANUP
        // unrelSn_ss?.add_O(sn_i.siblings);
        /* 3257 */ if (unrelSn_ss) {
          const siblings = sn_i.siblings;
          if (siblings) {
            for (const sn of siblings) {
              if (sn.known) unrelSn_ss.add(sn);
            }
          }
        }
        sn_i = sn_ss_x[i_y] = sn_i.#parent!;
        sn_i.depth_$ = --de_;
      }
    };

    /**
     * Make all of sorted `sn_ss_x` up `iUp_y` to the depth `tgtDe_y`.\
     * Remove duplicates.
     * @const @param iUp_y >=1
     * @const @param tgtDe_y
     */
    const floatupTail = (iUp_y: uint, tgtDe_y: Depth_): void => {
      let j_0 = iUp_y;
      for (; j_0--;) {
        if (sn_ss_x[j_0].depth !== tgtDe_y) {
          break;
        }
      }
      ++j_0; // Now `j_0` is the index of leftmost node depth equal to `tgtDe_y`.
      /*#static*/ if (INOUT) {
        assert(0 <= j_0 && j_0 < iUp_y);
      }

      const n_ = sn_ss_x.at(-1)!.depth - tgtDe_y;
      for (let k = sn_ss_x.length; k-- > iUp_y;) {
        floatUp(k, n_);
      }

      let len = sn_ss_x.length;
      /* Remove duplicates */
      L_0: while (j_0 < len - 1) {
        for (let j = j_0; j < len - 1; ++j) {
          if (sn_ss_x[j] === sn_ss_x[len - 1]) {
            sn_ss_x.length = --len;
            continue L_0;
          }
        }
        if (j_0 < len - 2) swap(j_0, len - 1);
        j_0++;
      }
    };

    let floatupTailCalled = false;
    L_0: while (sn_ss_x.length > 1 && --valve) {
      const de_0 = sn_ss_x.at(-1)!.depth;
      for (let i = sn_ss_x.length - 1; i--;) {
        const de_i = sn_ss_x[i].depth;
        if (
          de_i !== de_0 ||
          i === 0 && !floatupTailCalled
        ) {
          /* must be called at least once to remove duplicates */
          floatupTail(i + 1, de_i);
          floatupTailCalled = true;
          /*
        ! `sn_ss_x` can have been shortened */
          if (debug) {
            debug.f ??= [];
            debug.f.push(sn_ss_x.slice());
          }
          continue L_0;
        }
      }
      break;
    }
    assert(valve, `Loop ${VALVE}(±1) times!`);

    const floatupAll = (): void => {
      let len = sn_ss_x.length;
      if (len <= 1) return;

      for (let i = 0; i < len; i++) {
        floatUp(i);
        const sn_i = sn_ss_x[i];
        for (let j = i + 1; j < len;) {
          if (sn_i === sn_ss_x[j].parent) {
            swap(j, len - 1);
            sn_ss_x.length = --len;
          } else j++;
        }
      }

      floatupAll();
    };

    floatupAll();

    unrelSn_ss?.rmv_O(sn2del_ss);
    unrelSn_ss?.add_O(unrelSn_a);

    /* `sn_ss_x[0]` may be `hasErr` */
    sn_ss_x[0] = sn_ss_x[0].safeSn_1;
    return sn_ss_x[0];
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** Call `Token.revERan()` on specific Token's */
  protected clrHighlight_impl$(): false {
    return false;
  }
  /**
   * `out( this.#highlighted === false)`
   * @final
   * @return `#highlighted`
   */
  clrHighlight(): boolean {
    if (this.#highlighted) {
      this.clrHighlight_impl$();

      this.hl_a$?.forEach((hl) => hl.clear());
      if (this.children) {
        for (const c of this.children) c.clrHighlight();
      }
    }
    return this.#highlighted = false;
  }

  /**
   * Assign `Token.eran$` on specific Token's, then add Range's to `hl_a$`\
   * `in( _frstLidx_x <= _lastLidx_x)`
   * @const @param _frstLidx_x
   * @const @param _lastLidx_x
   * @headconst @param eranr_x
   * @return Highlighted or not
   */
  protected setHighlight_impl$(
    _frstLidx_x: lnum_t,
    _lastLidx_x: lnum_t,
    _eranr_x: ERanr,
  ): boolean {
    return false;
  }
  /**
   * Set `#highlighted`\
   * `in( frstLidx_x <= lastLidx_x)`
   * @final
   * @const @param frstLidx_x
   * @const @param lastLidx_x
   * @headconst @param eranr_x
   * @return `#highlighted`
   */
  setHighlight(
    frstLidx_x: lnum_t,
    lastLidx_x: lnum_t,
    eranr_x: ERanr,
  ): boolean {
    const frstLidx = this.sntFrstLidx_1;
    if (lastLidx_x < frstLidx) return this.clrHighlight();
    const lastLidx = this.sntLastLidx_1;
    if (lastLidx < frstLidx_x) return this.clrHighlight();

    this.#highlighted = this.setHighlight_impl$(
      frstLidx_x,
      lastLidx_x,
      eranr_x,
    );

    if (this.children) {
      for (const c of this.children) {
        const hl_ = c.setHighlight(frstLidx_x, lastLidx_x, eranr_x);
        this.#highlighted ||= hl_;
      }
    }
    return this.#highlighted;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // /** @final */
  // get _info(): string {
  //   return `${this.constructor.name}(${this._depth_2_})`;
  // }
  /** @const */
  get _info_(): string {
    return `${this.constructor.name},${this._depth_2_}`;
  }
  //jjjj TOCLEANUP
  // /** @final */
  // get _oldInfo_(): string {
  //   return `${this._info}[ ` +
  //     `${this.frstTk$?._name_}${this.frstTk$?.oldRanval}, ` +
  //     `${this.lastTk$?._name_}${this.lastTk$?.oldRanval} ]`;
  // }
  /**
   * @final
   * @primaryconst
   */
  override get _oldInfo_(): _OldInfo_ {
    const frstOldInfo = this.frstToken_1._oldInfo_;
    return {
      sort: frstOldInfo.sort,
      info: this.frstToken_1 === this.lastToken_1
        ? `${this._info_} [ ${frstOldInfo.info} ]`
        : `${this._info_} [ ${frstOldInfo.info}, ${this.lastToken_1._oldInfo_.info} ]`,
    };
  }
  /**
   * @final
   * @primaryconst
   */
  get _newInfo_(): string {
    return this.frstToken_1 === this.lastToken_1
      ? `${this._info_} [ ${this.frstToken_1} ]`
      : `${this._info_} [ ${this.frstToken_1}, ${this.lastToken_1} ]`;
  }

  _repr_(): unknown {
    return this._info_;
  }

  // /** For testing only */
  // abstract dup(): Stnode<T>;

  // /**
  //  * @headconst @param rhs
  //  */
  // abstract _test_eq(rhs: Stnode<T>): this;
}
/*80--------------------------------------------------------------------------*/

// /**
//  * @param { Stnode[] } sn_a_x
//  * @return { Stnode }
//  */
// export function calcCommonToBeg( sn_a_x )
// {
//   const out = ret => {
//     assert( ret );
//   }

//   let ret = calcCommon( sn_a_x );
//   if( !ret.isBeg() )
//   {
//     ret = ret.#parent;
//     let valve = 1000+1;
//     while( ret && !ret.isBeg() && --valve ) ret = ret.#parent;
//     assert(valve);
//   }
//   out(ret); return ret;
// }
/*80--------------------------------------------------------------------------*/

// /**
//  * Notice, used node will be removed from `oldsn_a`
//  * @headconst @param oldsn_a
//  * @headconst @param frsttk_x
//  * @headconst @param T_x - subclass of Stnode<T>
//  * @return return null or one of oldsn_a
//  */
// export function useOldSn<T extends Tok>(
//   oldsn_a: (Stnode<T> | undefined)[],
//   frsttk_x: Token<T>,
//   T_x: AbstractConstructor<Stnode<T>>,
// ): Stnode<T> | undefined {
//   /*#static*/ if (INOUT) {
//     assert(oldsn_a);
//     assert(frsttk_x);
//     assert(T_x);
//   }
//   for (let i = oldsn_a.length; i--;) {
//     const oldSn = oldsn_a[i];
//     let frsttk;
//     if (
//       oldSn &&
//       oldSn instanceof T_x &&
//       (frsttk = oldSn.frstToken) &&
//       frsttk.posE(frsttk_x)
//       //  && oldSn.isBdryValid
//       //jjjj strict?
//     ) {
//       oldsn_a[i] = oldsn_a.last!;
//       oldsn_a.length--;
//       return oldSn;
//     }
//   }
//   return undefined;
// }
/*80--------------------------------------------------------------------------*/
