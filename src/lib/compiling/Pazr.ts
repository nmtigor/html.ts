/** 80**************************************************************************
 * @module lib/compiling/Pazr
 * @license MIT
 ******************************************************************************/

import { DEBUG, INOUT } from "../../preNs.ts";
import type { Id_t, Ts_t } from "../alias_v.ts";
import { assert, out } from "../util.ts";
import type { Tok } from "./alias.ts";
import type { Bart } from "./Bart.ts";
import type { BaseTok } from "./BaseTok.ts";
import type { Bufr } from "./Bufr.ts";
import type { Lexr } from "./Lexr.ts";
import type { PlainTok } from "./plain/PlainTok.ts";
import { Stnode } from "./Stnode.ts";
import type { Token } from "./Token.ts";
import type { Err } from "./util.ts";
import { SortedSn_id } from "./util.ts";
/*80--------------------------------------------------------------------------*/

export abstract class Pazr<T extends Tok = BaseTok> {
  static #ID = 0 as Id_t;
  readonly id = ++Pazr.#ID as Id_t;
  /** @final */
  get class_id() {
    return `${this.constructor.name}_${this.id}`;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @final */
  get bufr(): Bufr | Bart {
    return this.lexr$.bufr;
  }

  /* lexr$ */
  protected lexr$!: Lexr<T>;
  /** @final */
  get lexr() {
    return this.lexr$;
  }

  //jjjj TOCLEANUP
  // /** @final */
  // headBdryClrTk_$: Token<T> | undefined;
  // /** @final */
  // tailBdryClrTk_$: Token<T> | undefined;

  //jjjj TOCLEANUP
  // /** @primaryconst @param loc_x */
  // headClr(loc_x: Loc): boolean {
  //   return !!this.headBdryClrTk_$?.sntStopLoc.posGE(loc_x);
  // }
  // /** @primaryconst @param loc_x */
  // tailClr(loc_x: Loc): boolean {
  //   return !!this.tailBdryClrTk_$?.sntStrtLoc.posSE(loc_x);
  // }
  /* ~ */

  protected root$: Stnode<T> | undefined;
  get root() {
    return this.root$;
  }

  /**
   * @final
   * @const @param path_x e.g. "Set 0:Intersect 1:Set 0:Key"
   */
  _getChild_(path_x: string): Stnode<T> | undefined {
    if (!this.root$) return undefined;

    const paths = path_x.split(" ");
    if (this.root$.class === paths.at(0)) {
      paths.reverse().pop();
      return paths.length ? this.root$._getChild_(paths) : this.root$;
    }

    return undefined;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /* curPazTk$ */
  /** @final */
  protected curPazTk$!: Token<T>;
  /** @final */
  get curPazTk_$() {
    return this.curPazTk$;
  }

  /** @final */
  protected forceForw$(): void {
    this.curPazTk$ = this.curPazTk$.nextToken_$!;
  }
  // /** @final */
  // protected forceForwn$(n_x: uint): void {
  //   ///
  // }

  /** @final */
  protected strtPazTk$!: Token<T>;
  /* ~ */

  /* stopPazTk$ */
  /** @final */
  protected stopPazTk$!: Token<T>;
  /** @final */
  get stopPazTk_$() {
    return this.stopPazTk$;
  }
  /* ~ */

  readonly #strtPazTk_a: Token<T>[] = [];
  readonly #stopPazTk_a: Token<T>[] = [];

  /* drtSn_$ */
  /** @final */
  drtSn_$: Stnode<T> | undefined;
  get drtSn() {
    return this.drtSn_$;
  }
  /* ~ */

  /* newSn_$ */
  /** Last (finally) parsed Stnode */
  newSn_$: Stnode<T> | undefined;
  get newSn() {
    return this.newSn_$;
  }
  /* ~ */

  /* errSn_ss$ */
  protected readonly errSn_ss$ = new SortedSn_id();
  /** @final */
  get isErr() {
    return !!this.errSn_ss$.length;
  }

  /**
   * @final
   * @headconst @param sn_x
   * @const @param err_x
   */
  setErr(sn_x: Stnode<T>, err_x: Err): void {
    sn_x.setErr(err_x);
    this.errSn_ss$.add(sn_x);
  }

  get _err_(): unknown {
    const ret: [string, unknown[]][] = [];
    for (const sn of this.errSn_ss$) {
      ret.push([sn._info_, sn._err_]);
    }
    return ret;
  }
  /* ~ */

  /** @final */
  readonly unrelSn_ss_$ = new SortedSn_id();
  /**
   * reused, or partially reuesed, or abandoned
   * @final
   */
  readonly reusdSn_ss_$ = new SortedSn_id();
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** @final */
  readonly sns_$: Stnode<T>[] = [];
  /** @final */
  gc_$(): void {
    const ts_ = Date.now_1() as Ts_t;
    const rt_ = this.root$;
    let iI_ = this.sns_$.length;
    for (let i = 0; i < iI_;) {
      if (this.sns_$[i].valid_$(ts_, rt_)) {
        i += 1;
      } else {
        this.sns_$[i].destructor();
        this.sns_$[i] = this.sns_$[--iI_];
      }
    }
    this.sns_$.length = iI_;
  }

  /** @headconst @param lexr_x */
  constructor(lexr_x: Lexr<T>) {
    this.reset_Pazr$(lexr_x);
  }

  #destroyed = false;
  /** @final */
  destructor() {
    if (this.#destroyed) return;

    //jjjj TOCLEANUP
    // this.headBdryClrTk_$ = undefined;
    // this.tailBdryClrTk_$ = undefined;

    this.root$ = undefined;
    this.gc_$();
    /*64----------------------------------------------------------*/

    this.curPazTk$ = undefined as any;
    this.strtPazTk$ = undefined as any;
    this.stopPazTk$ = undefined as any;

    this.#strtPazTk_a.length = 0;
    this.#stopPazTk_a.length = 0;

    this.drtSn_$ = undefined;
    this.newSn_$ = undefined;

    this.errSn_ss$.reset_SortedArray();
    this.unrelSn_ss_$.reset_SortedArray();
    this.reusdSn_ss_$.reset_SortedArray();

    this.#destroyed = true;
  }

  /**
   * @final
   * @headconst @param lexr_x
   */
  protected reset_Pazr$(lexr_x = this.lexr$): this {
    this.destructor();

    this.lexr$ = lexr_x;
    this.curPazTk$ = this.lexr$.frstLexTk;
    this.stopPazTk$ = this.lexr$.lastLexTk;

    this.#destroyed = false;
    return this;
  }

  /** @headconst @param lexr_x */
  reset_Pazr(lexr_x?: Lexr<T>): this {
    return this.reset_Pazr$(lexr_x);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @final */
  pazPremrk_$(): this {
    let tip;

    const strtLexTk = this.lexr$.curLexTk_$;
    const stopLexTk = this.lexr$.stopLexTk_$;
    //jjjj TOCLEANUP
    // if (this.lexr$.concatBdry_$) {
    //   strtLexTk = strtLexTk.prevToken_$ ?? strtLexTk;
    //   stopLexTk = stopLexTk.nextToken_$ ?? stopLexTk;
    // }

    const VALVE = 10_000;
    let valve = VALVE;

    /* find boundary token backward */
    let snClrTk_0: Token<T> | undefined = strtLexTk;
    while (!snClrTk_0.sn_$ && (snClrTk_0 = snClrTk_0.prevToken_$) && --valve);
    assert(valve, `Loop ${VALVE}(±1) times!`);

    /* find boundary token forward */
    let snClrTk_1: Token<T> | undefined = stopLexTk;
    while (!snClrTk_1.sn_$ && (snClrTk_1 = snClrTk_1.nextToken_$) && --valve);
    assert(valve, `Loop ${VALVE}(±1) times!`);

    //jjjj TOCLEANUP
    // if (snClrTk_0 && snClrTk_1) {
    //   Stnode.sn_ss
    //     .reset_SortedArray().messUp()
    //     .push(snClrTk_0.sn_$!, snClrTk_1.sn_$!);
    //   Stnode.sn_ss.push(...this.errSn_ss$);
    //   tip = Stnode.calcCommon();
    // } else {
    //   tip = this.root$;
    // }
    if (snClrTk_0 || snClrTk_1) {
      Stnode.sn_ss.reset_SortedArray().messUp();
      if (snClrTk_0 && !snClrTk_0.sn_$!.lastToken_1.posSE(strtLexTk)) {
        Stnode.sn_ss.push(snClrTk_0.sn_$!);
      }
      if (snClrTk_1 && !snClrTk_1.sn_$!.frstToken_1.posGE(stopLexTk)) {
        Stnode.sn_ss.push(snClrTk_1.sn_$!);
      }
      if (Stnode.sn_ss.length === 0) {
        Stnode.sn_ss.push(snClrTk_0?.sn_$ ?? snClrTk_1!.sn_$!);
      }
      Stnode.sn_ss.push(...this.errSn_ss$);
      tip = Stnode.calcCommon({
        strtTk: snClrTk_0 ?? this.lexr$.frstLexTk,
        stopTk: snClrTk_1 ?? this.lexr$.lastLexTk,
      });
    } else {
      tip = this.root$;
    }

    tip?.ensureAllBdries();
    return this;
  }

  /**
   * Set `strtPazTk$`, `stopPazTk$`, `curPazTk$`\
   **! Call in "TO preRepl" action, because only at that time,
   * `.frstToken_1.prevToken_$`, `.lastToken_1.nextToken_$` are sure valid.
   */
  protected setPazRegion$(retSn_x?: Stnode<T>): Stnode<T> | undefined {
    if (retSn_x && !retSn_x.isRoot) {
      this.strtPazTk$ = retSn_x.frstToken_1.prevToken_$!;
      this.stopPazTk$ = retSn_x.lastToken_1.nextToken_$!;
    } else {
      this.strtPazTk$ = this.lexr$.frstLexTk;
      this.stopPazTk$ = this.lexr$.lastLexTk;
      retSn_x = undefined;
    }
    this.curPazTk$ = this.strtPazTk$;

    let de_ = retSn_x?.depth_1 ?? 0;
    this.#strtPazTk_a.length = de_;
    this.#stopPazTk_a.length = de_;
    if (retSn_x?.parent) {
      for (let pa = retSn_x.parent; de_--; pa = pa.parent!) {
        this.#strtPazTk_a[de_] = pa.frstToken_1.prevToken_$!;
        this.#stopPazTk_a[de_] = pa.lastToken_1.nextToken_$!;
      }
    }

    return retSn_x;
  }

  /** Helper */
  #tmpSn_ss = new SortedSn_id();
  /**
   * Invalidate "(strtPazTk$, stopPazTk$).sn_$" (if any) and their parents up
   * to `drtSn_$` (included)\
   * Use `#tmpSn_ss`
   */
  #invalBdries(): void {
    this.#tmpSn_ss.reset_SortedArray();

    const VALVE = 1_000;
    let valve = VALVE;
    const invalUp_ = (sn_y: Stnode<T> | undefined) => {
      while (sn_y && !this.#tmpSn_ss.includes(sn_y) && --valve) {
        sn_y.invalBdries();
        this.#tmpSn_ss.add(sn_y);
        if (sn_y === this.drtSn_$) break;
        sn_y = sn_y.parent;
      }
      assert(valve, `Loop ${VALVE}(±1) times!`);
    };
    for (
      let tk_ = this.strtPazTk$.nextToken_$;
      tk_ && tk_ !== this.stopPazTk$ && --valve;
      tk_ = tk_.nextToken_$
    ) {
      invalUp_(tk_.sn_$);
    }
    assert(valve, `Loop ${VALVE}(±1) times!`);

    this.#tmpSn_ss.reset_SortedArray();
  }

  /**
   * Enlarge (strtTk_x, stopTk_x) to (strtPazTk$, stopPazTk$)
   * @headconst @param strtTk_x
   * @headconst @param stopTk_x
   * @const @param saveRvTurn_x
   */
  #enlrgBdries(
    strtTk_x: Token<T>,
    stopTk_x: Token<T>,
    saveRvTurn_x = this.lexr$._saveRvTurn_,
  ): void {
    /*#static*/ if (INOUT) {
      assert(this.strtPazTk$.posSE(strtTk_x));
      assert(this.stopPazTk$.posGE(stopTk_x));
    }
    /*#static*/ if (DEBUG) {
      this.lexr$.batchBack_$(
        (tk) => tk._saveRanval_(saveRvTurn_x),
        strtTk_x,
        this.strtPazTk$,
      );
      this.lexr$.batchForw_$(
        (tk) => tk._saveRanval_(saveRvTurn_x),
        stopTk_x,
        this.stopPazTk$,
      );
    }
    this.#invalBdries();
  }

  protected sufPazmrk$() {}

  /**
   * Mark paz region
   *
   * Set `drtSn_$`, `strtPazTk$`, `stopPazTk$`, `curPazTk$`\
   * Reset `errSn_ss$`
   *
   * @final
   */
  @out((self: Pazr<T>) => {
    assert(
      self.curPazTk$ === self.strtPazTk$ &&
        self.strtPazTk$.posSe(self.stopPazTk$),
    );
    if (!self.drtSn_$) {
      assert(self.strtPazTk$ === self.lexr$.frstLexTk);
      assert(self.stopPazTk$ === self.lexr$.lastLexTk);
    }
  })
  pazMrk_$(): this {
    //jjjj TOCLEANUP
    // this.headBdryClrTk_$ = this.lexr$.curLexTk_$;
    // this.tailBdryClrTk_$ = this.lexr$.stopLexTk_$;
    //jjjj TOCLEANUP
    // strtLexTk_x ??= this.lexr$.strtLexTk_$;
    //jjjj TOCLEANUP
    // strtLexTk_x ??= this.lexr$.curLexTk_$;
    // stopLexTk_x ??= this.lexr$.stopLexTk_$;
    const strtLexTk = this.lexr$.curLexTk_$;
    const stopLexTk = this.lexr$.stopLexTk_$;
    //jjjj TOCLEANUP
    // if (this.lexr$.concatBdry_$) {
    //   strtLexTk_x = strtLexTk_x.prevToken_$ ?? strtLexTk_x;
    //   stopLexTk_x = stopLexTk_x.nextToken_$ ?? stopLexTk_x;
    // }

    this.newSn_$ = undefined; //!
    this.unrelSn_ss_$.reset_SortedArray();
    this.reusdSn_ss_$.reset_SortedArray();
    const unrelSn_a: Stnode<T>[] = [];

    const VALVE = 10_000;
    let valve = VALVE;

    let sn_: Stnode<T> | undefined,
      sn_1: Stnode<T> | undefined,
      anc_: "anc" | undefined,
      hasErr_: boolean,
      fd_;

    /* find boundary token backward */
    let snClrTk_0: Token<T> | undefined = strtLexTk;
    while (
      //jjjj TOCLEANUP
      // !snClrTk_0.sn_$?.known &&
      !snClrTk_0.sn_$ &&
      (snClrTk_0 = snClrTk_0.prevToken_$) && --valve
    );
    assert(valve, `Loop ${VALVE}(±1) times!`);
    if (snClrTk_0?.sn_$!.lastToken_1.posSE(strtLexTk)) {
      sn_ = snClrTk_0.sn_$!,
        sn_1 = undefined,
        anc_ = "anc",
        hasErr_ = false,
        fd_ = Stnode.FilterDepth;
      do {
        hasErr_ = sn_.filterTo(unrelSn_a, sn_1, anc_) || hasErr_;
        if (hasErr_) anc_ = undefined;
        sn_1 = sn_;
      } while (
        (sn_ = sn_.parent) &&
        //jjjj TOCLEANUP
        // sn_.known &&
        sn_.lastToken_1.posSE(strtLexTk) && --fd_
      );
    }

    /* find boundary token forward */
    let snClrTk_1: Token<T> | undefined = stopLexTk;
    while (
      //jjjj TOCLEANUP
      // !snClrTk_1.sn_$?.known &&
      !snClrTk_1.sn_$ &&
      (snClrTk_1 = snClrTk_1.nextToken_$) && --valve
    );
    assert(valve, `Loop ${VALVE}(±1) times!`);
    if (snClrTk_1?.sn_$!.frstToken_1.posGE(stopLexTk)) {
      sn_ = snClrTk_1.sn_$!,
        sn_1 = undefined,
        anc_ = "anc",
        hasErr_ = false,
        fd_ = Stnode.FilterDepth;
      do {
        hasErr_ = sn_.filterTo(unrelSn_a, sn_1, anc_) || hasErr_;
        if (hasErr_) anc_ = undefined;
        sn_1 = sn_;
      } while (
        (sn_ = sn_.parent) &&
        //jjjj TOCLEANUP
        // sn_.known &&
        sn_.frstToken_1.posGE(stopLexTk) && --fd_
      );
    }

    //jjjj TOCLEANUP
    // /* 1916 */ if (snClrTk_0 && snClrTk_1) {
    //   Stnode.sn_ss
    //     .reset_SortedArray().messUp()
    //     .push(snClrTk_0.sn_$!, snClrTk_1.sn_$!);
    //   let tk_: Token<T> | undefined = snClrTk_0;
    //   /* Prevent `sn_$`s in (strtTk, stopTk) from being added to `unrelSn_ss_$`
    //   in `Stnode.calcCommon()`
    //   */ while ((tk_ = tk_.nextToken_$) && tk_ !== snClrTk_1 && --valve) {
    //     if (tk_.sn_$) Stnode.sn_ss.push(tk_.sn_$);
    //   }
    //   assert(valve, `Loop ${VALVE}(±1) times!`);
    //   Stnode.sn_ss.push(...this.errSn_ss$);
    //   this.drtSn_$ = this.setPazRegion$(
    //     Stnode.calcCommon({ unrelSn_ss: this.unrelSn_ss_$, unrelSn_a }),
    //   );
    // } /* 1915 */ else {
    //   if (snClrTk_0) {
    //     let sn_: Stnode<T> | undefined = snClrTk_0.sn_$!;
    //     while ((sn_ = sn_.prevStnod) && --valve) sn_.filterTo(unrelSn_a);
    //     assert(valve, `Loop ${VALVE}(±1) times!`);
    //   }
    //   if (snClrTk_1) {
    //     let sn_: Stnode<T> | undefined = snClrTk_1.sn_$!;
    //     while ((sn_ = sn_.nextStnod) && --valve) sn_.filterTo(unrelSn_a);
    //     assert(valve, `Loop ${VALVE}(±1) times!`);
    //   }
    //   this.unrelSn_ss_$.add_O(unrelSn_a);
    //   this.drtSn_$ = this.setPazRegion$();
    // }
    if (snClrTk_0 || snClrTk_1) {
      Stnode.sn_ss.reset_SortedArray().messUp();
      if (snClrTk_0 && !snClrTk_0.sn_$!.lastToken_1.posSE(strtLexTk)) {
        Stnode.sn_ss.push(snClrTk_0.sn_$!);
      }
      if (snClrTk_1 && !snClrTk_1.sn_$!.frstToken_1.posGE(stopLexTk)) {
        Stnode.sn_ss.push(snClrTk_1.sn_$!);
      }
      const strtTk = snClrTk_0 ?? this.lexr$.frstLexTk;
      const stopTk = snClrTk_1 ?? this.lexr$.lastLexTk;
      let tk_: Token<T> | undefined = strtTk;
      /* Prevent `sn_$`s in (strtTk, stopTk) from being added to `unrelSn_ss_$`
      in `Stnode.calcCommon()`
      */ while ((tk_ = tk_.nextToken_$) && tk_ !== stopTk && --valve) {
        if (tk_.sn_$) Stnode.sn_ss.push(tk_.sn_$);
      }
      assert(valve, `Loop ${VALVE}(±1) times!`);
      if (Stnode.sn_ss.length === 0) {
        Stnode.sn_ss.push(snClrTk_0?.sn_$ ?? snClrTk_1!.sn_$!);
      }
      Stnode.sn_ss.push(...this.errSn_ss$);
      this.drtSn_$ = this.setPazRegion$(
        Stnode.calcCommon(
          { unrelSn_ss: this.unrelSn_ss_$, unrelSn_a, strtTk, stopTk },
        ),
      );
    } else {
      this.unrelSn_ss_$.add_O(unrelSn_a);
      this.drtSn_$ = this.setPazRegion$();
    }
    this.errSn_ss$.reset_SortedArray();

    if (this.drtSn_$) {
      /* Will `#invalBdries()` in `#enlrgBdries`, so check `drtSn_$` here. */
      /*#static*/ if (INOUT) {
        assert(!this.drtSn_$.isRoot && !this.drtSn_$.isErr);
        assert(this.strtPazTk$ === this.drtSn_$.frstToken_1.prevToken_$);
        assert(this.stopPazTk$ === this.drtSn_$.lastToken_1.nextToken_$);
      }
    }
    this.#enlrgBdries(strtLexTk, stopLexTk);

    this.sufPazmrk$();
    return this;
  }

  /**
   * - Enlarge boundaries from (strtPazTk$, stopPazTk$) to boundaries of `sn_x`
   * - Restore and possibly replenish `unrelSn_ss_$`
   * - Set `drtSn_$`
   * @final
   * @headconst @param sn_x
   */
  enlrgBdriesTo_$(sn_x: Stnode<T>): void {
    /*#static*/ if (INOUT) {
      assert(this.drtSn_$ && sn_x.isAncestorOf(this.drtSn_$));
    }
    if (sn_x === this.drtSn_$) return;

    // console.log(`%crun here: `, `color:${LOG_cssc.runhere}`);
    const unrelSn_a: Stnode<T>[] = [];
    sn_x.filterChildrenTo(unrelSn_a, this.drtSn_$);
    this.unrelSn_ss_$.add_O(unrelSn_a);
    this.unrelSn_ss_$.add_O(this.reusdSn_ss_$);
    this.reusdSn_ss_$.reset_SortedArray();

    //jjjj TOCLEANUP
    // const origStrtTk = this.drtSn_$!.frstToken_1.prevToken_$!;
    // const origStopTk = this.drtSn_$!.lastToken_1.nextToken_$!;
    const origStrtTk = this.strtPazTk$;
    const origStopTk = this.stopPazTk$;

    let n_ = 0;
    for (let sn = this.drtSn_$!; sn !== sn_x; sn = sn.parent!, n_++);
    this.strtPazTk$ = this.#strtPazTk_a.at(-n_)!;
    this.stopPazTk$ = this.#stopPazTk_a.at(-n_)!;
    this.#strtPazTk_a.length -= n_;
    this.#stopPazTk_a.length -= n_;
    this.curPazTk$ = this.strtPazTk$;

    //jjjj TOCLEANUP
    // this.drtSn_$ = this.setPazRegion$(sn_x);
    this.drtSn_$ = sn_x.isRoot ? undefined : sn_x;
    this.errSn_ss$.reset_SortedArray();

    this.#enlrgBdries(origStrtTk, origStopTk, ++this.lexr$._saveRvTurn_);
  }

  //jjjj TOCLEANUP
  // /**
  //  * Enlarge boundaries from (curPazTk$, stopPazTk$) to maximum
  //  * @final
  //  */
  // maximizeBdries_$(): void {
  //   /*#static*/ if (INOUT) {
  //     assert(!this.drtSn_$);
  //   }
  //   const origStrtTk = this.curPazTk$;
  //   const origStopTk = this.stopPazTk$;
  //   this.setPazRegion$();
  //   this.#enlrgBdries(origStrtTk, origStopTk);
  // }

  /**
   * @final
   * @primaryconst
   *    @const if `tk_x !== this.curPazTk$ || n_x`
   * @headborrow @primaryconst @param tk_x
   */
  protected reachPazBdry$(tk_x: Token<T> = this.curPazTk$): boolean {
    return tk_x.posGE(this.stopPazTk$);
  }
  //jjjj TOCLEANUP
  // /** @final */
  // overRigtBdry(): boolean {
  //   return this.curPazTk$.posG(this.stopPazTk$!);
  // }

  protected sufPaz$(): void {}

  /** @final */
  @out((self: Pazr<T>) => {
    assert(self.curPazTk$ === self.stopPazTk$);
  })
  paz() {
    this.forceForw$();
    if (this.reachPazBdry$()) {
      this.newSn_$ = undefined;
      this.drtSn_$?.parent!.replaceChild(this.drtSn_$, this.newSn_$);
    } else {
      this.paz_impl$();
    }

    this.sufPaz$();
  }

  /** `in( !this.reachPazBdry$() )` */
  protected abstract paz_impl$(): void;
}
/*80--------------------------------------------------------------------------*/

export class DoNothingPazr<T extends Tok = BaseTok> extends Pazr<T> {
  override pazMrk_$(): this {
    this.setPazRegion$();
    return this;
  }

  /** @implement */
  protected paz_impl$() {
    this.curPazTk$ = this.stopPazTk$;
  }
}

/** @final */
export class PlainPazr extends DoNothingPazr<PlainTok> {}
/*80--------------------------------------------------------------------------*/
