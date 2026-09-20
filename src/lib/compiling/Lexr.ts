/** 80**************************************************************************
 * @module lib/compiling/Lexr
 * @license MIT
 ******************************************************************************/

import { _TRACE, DEBUG, INOUT } from "../../preNs.ts";
import type { int, ldt_t, loff_t, uint } from "../alias.ts";
import { LnumMAX } from "../alias.ts";
import type { Id_t, UInt16 } from "../alias_v.ts";
import "../jslang.ts";
import { assert, fail, out } from "../util.ts";
import { ASCIIWs_a, isWs, ws_a } from "../util/string.ts";
import { trace, traceOut } from "../util/trace.ts";
import type { Locval, Tok } from "./alias.ts";
import { ScanR } from "./alias.ts";
import type { Bart } from "./Bart.ts";
import { BaseTok } from "./BaseTok.ts";
import type { Bufr } from "./Bufr.ts";
import type { Line } from "./Line.ts";
import type { Loc } from "./Loc.ts";
import { LocCfd } from "./Loc.ts";
import type { Ran } from "./Ran.ts";
import { g_ran_fac } from "./RanFac.ts";
import type { Stnode } from "./Stnode.ts";
import { Token } from "./Token.ts";
import type { ErrMsg } from "./util.ts";
import { frstNon, SortedSnt_id, SortedTk_id } from "./util.ts";
/*80--------------------------------------------------------------------------*/

export abstract class Lexr<T extends Tok = BaseTok> {
  static #ID = 0 as Id_t;
  readonly id = ++Lexr.#ID as Id_t;
  /** @final */
  get class_id() {
    return `${this.constructor.name}_${this.id}`;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /* bufr$ */
  protected bufr$!: Bufr | Bart;
  get bufr() {
    return this.bufr$;
  }

  /**
   * `out( ret; ret.value === BaseTok.strtBdry)`
   * @final
   */
  get frstLexTk(): Token<T> {
    return this.bufr$.frstLine.frstTokenBy(this)!;
  }
  /**
   * `out( ret; ret.value === BaseTok.stopBdry)`
   * @final
   */
  get lastLexTk(): Token<T> {
    return this.bufr$.lastLine.lastTokenBy(this)!;
  }
  /* ~ */

  /* curLexTk$ */
  /** @final */
  protected curLexTk$!: Token<T>;
  get curLexTk_$() {
    return this.curLexTk$;
  }

  /** @final */
  protected strtLexTk$!: Token<T>;
  get strtLexTk_$() {
    return this.strtLexTk$;
  }

  /**
   * `in( this.curLexTk$.value !== BaseTok.strtBdry)`
   * @final
   */
  protected enlrgStrtTk$(): void {
    this.drtenTk$(this.curLexTk$);
    this.curLexTk$ = this.curLexTk$.prevToken_$!;
  }

  //kkkk justify this by tests
  /** @final */
  protected enlrgStrtTk_2$(): void {
    this.enlrgStrtTk$();
    if (this.curLexTk$.sntStopLoc.posE(this.stopLexTk$.sntStrtLoc)) {
      this.enlrgStopTk$();
    }
  }
  /* ~ */

  /* stopLexTk$ */
  /** @final */
  protected stopLexTk$!: Token<T>;
  /** @final */
  get stopLexTk_$() {
    return this.stopLexTk$;
  }

  /**
   * `in( this.stopLexTk$.value !== BaseTok.stopBdry)`
   * @final
   */
  protected enlrgStopTk$(): void {
    this.drtenTk$(this.stopLexTk$);
    this.stopLexTk$ = this.stopLexTk$.nextToken_$!;
  }
  /* ~ */

  /* stopLexTk_1$ */
  /**
   * Used within `stiflStopLexTk$()` and `restoStopLexTk$()`
   * @final
   */
  protected stopLexTk_1$: Token<T> | undefined;
  /** @final */
  protected stiflStopLexTk$(): void {
    this.stopLexTk_1$ = this.stopLexTk$;
    this.stopLexTk$ = this.lastLexTk;
  }
  /**
   * `in( this.stopLexTk_1$)`
   * @final
   */
  protected restoStopLexTk$(): void {
    this.stopLexTk$ = this.stopLexTk_1$!;
    this.stopLexTk_1$ = undefined;
  }

  /**
   * Called within `stiflStopLexTk$()` and `restoStopLexTk$()`\
   * `in( this.stopLexTk_1$.value !== BaseTok.stopBdry)`
   * @final
   */
  protected enlrgStopTk_1$(): void {
    this.drtenTk$(this.stopLexTk_1$!);
    this.stopLexTk_1$ = this.stopLexTk_1$!.nextToken_$!;
  }

  /**
   * Called within `stiflStopLexTk$()` and `restoStopLexTk$()`
   * @final
   */
  protected enlrgStrtTk_1$(): void {
    const loc = this.curLexTk$.sntStopLoc;
    this.enlrgStrtTk$();
    if (loc.posE(this.stopLexTk_1$!.sntStrtLoc)) {
      this.enlrgStopTk_1$();
    }
  }
  /* ~ */

  readonly #strtLexTk_a: Token<T>[] = [];
  readonly #stopLexTk_a: Token<T>[] = [];

  readonly #lv_oldStop_a: Locval[] = [];
  readonly #dtLoff_a: ldt_t[] = [];
  get dtLoff() {
    //jjjj For the moment, take the last one. May change if needed.
    return this.#dtLoff_a.at(-1)!;
  }

  readonly #adjStrtTk_a: boolean[] = [];
  readonly #adjStopTk_a: boolean[] = [];

  /* errTk_ss$ */
  protected readonly errTk_ss$ = new SortedTk_id();
  /** @final */
  get isErr() {
    return !!this.errTk_ss$.length;
  }
  /**
   * @deprecated
   * @final
   */
  onlyErrMsg(msg_x: ErrMsg, tk_x?: Token<T>): boolean {
    return this.errTk_ss$.length === 1 &&
      this.errTk_ss$[0].onlyErrMsg(msg_x) &&
      (!tk_x || this.errTk_ss$[0] === tk_x);
  }

  /** @final */
  clrErr_$() {
    this.errTk_ss$.reset_SortedArray();
  }

  /** @primaryconst */
  get _err_(): unknown[] {
    const retA: [string, unknown[]][] = [];
    for (const tk of this.errTk_ss$) {
      retA.push([`${tk}`, tk._err_]);
    }
    return retA;
  }
  /* ~ */

  protected curLoc$!: Loc;
  //jjjj TOCLEANUP
  // initCurLoc() {
  //   let loc = this.curLexTk$.nextToken_$?.sntStrtLoc;
  //   if (!loc?.posS(this.stopLexTk$.sntStrtLoc)) {
  //     loc = this.curLexTk$.sntStopLoc;
  //   }
  //   this.curLoc$.become(loc);
  // }

  _saveRvTurn_ = 0;
  /**
   * Token's in `oldTk_ss$` are kept from `destructor()` until `sufLex$()` is
   * called, so `oldTk_ss$` (together with `scandTk_a$`) can contain unrelated
   * (but valid) Token's (see `MdextLexr.preLex$()`), then re-`lex()` can be
   * implemented (through rewriting `sufLex$()`), because at the beginning of
   * each `lex_impl$()`, Token's in `scandTk_a$` but not in `oldTk_ss$` will be
   * `destructor()`.
   * @final
   */
  protected readonly oldTk_ss$ = new SortedSnt_id<Token<T>>();
  /**
   * @final
   * @headborrow @headconst @param tk_x
   */
  protected readonly drtenTk$ = (tk_x: Token<T>): void => {
    /*#static*/ if (DEBUG) {
      tk_x._saveRanval_(this._saveRvTurn_);
    }
    tk_x.setValue(BaseTok.unknown as T); //!
    this.oldTk_ss$.add(tk_x);
  };

  /* scandTk_a$ */
  /** @final */
  protected readonly scandTk_a$: Token<T>[] = [];
  get _scandTk_a_() {
    return this.scandTk_a$;
  }

  /**
   * Insert `retTk_x` into `scandTk_a` before `retTk_x.nextToken_$`
   * @final
   * @const @param retTk_x
   */
  insScandTk_$<K extends Token<T>>(retTk_x: K): K {
    const nextTk = retTk_x.nextToken_$;
    if (nextTk) {
      let i_ = this.scandTk_a$.indexOf(nextTk);
      if (i_ < 0) i_ = this.scandTk_a$.length;
      this.scandTk_a$.splice(i_, 0, retTk_x);
    } else {
      this.scandTk_a$.push(retTk_x);
    }

    if (this.lsTk$?.posSe(retTk_x)) this.lsTk$ = retTk_x; //!

    return retTk_x;
  }

  /**
   * Remove `retTk_x` from `scandTk_a`, then `destructor()` it if it's not in
   * `oldTk_ss$`, then `removeSelf()`.
   * @final
   * @headconst @param retTk_x
   * @const @param i_x Same as `start` of `Array.splice()`
   */
  rmvScandTk_$<K extends Token<T>>(retTk_x: K, i_x?: int): K {
    if (i_x === undefined) {
      const i_ = this.scandTk_a$.indexOf(retTk_x);
      if (i_ >= 0) this.scandTk_a$.splice(i_, 1);
    } else {
      this.scandTk_a$.splice(i_x, 1);
    }

    if (!this.oldTk_ss$.includes(retTk_x)) retTk_x.destructor();
    retTk_x.removeSelf();
    return retTk_x;
  }
  /* ~ */

  /** last scanned Token */
  protected lsTk$: Token<T> | undefined;

  /* outTk$ */
  /** Helper, used in `scan_impl$()` */
  protected outTk$: Token<T> | undefined;

  //jjjj TOCLEANUP
  // readonly #genOutTk = () =>
  //   this.reachLexBdry$() === LocCfd.yes
  //     ? this.stopLexTk$
  //     : new Token(this, new TokRan(this.curLoc$.dup()));
  protected genOutTk$(): Token<T> {
    return new Token(this, g_ran_fac.byLoc(this.curLoc$));
  }
  protected get outTk_1$(): Token<T> {
    //jjjj optimize
    return this.outTk$ ??= this.genOutTk$();
  }
  /* ~ */

  // static readonly #VALVE = 100;
  // #valve = Lexr.#VALVE;

  /**
   * @headconst @param bufr_x
   * @const @param strtLoff_x
   * @const @param stopLoff_x
   */
  constructor(
    bufr_x: Bufr | Bart,
    strtLoff_x: loff_t = 0,
    stopLoff_x?: loff_t,
  ) {
    this.reset_Lexr$(bufr_x, strtLoff_x, stopLoff_x);
  }

  #destroyed = false;
  /** `in( this.bufr$)` */
  destructor(): void {
    if (this.#destroyed) return;

    this.batchForw_$((tk) => tk.destructor(), this.frstLexTk);

    let ln_: Line | undefined = this.bufr$.frstLine;
    const VALVE = LnumMAX;
    let valve = VALVE;
    while (ln_ && --valve) {
      ln_.delFrstTokenBy_$(this);
      ln_.delLastTokenBy_$(this);
      ln_ = ln_.nextLine;
    }
    assert(valve, `Loop ${VALVE}(±1) times!`);
    /*64----------------------------------------------------------*/

    // this.bufr$ = undefined as any;
    this.curLexTk$ = undefined as any;
    this.strtLexTk$ = undefined as any;
    this.stopLexTk$ = undefined as any;

    this.#strtLexTk_a.length = 0;
    this.#stopLexTk_a.length = 0;

    this.#lv_oldStop_a.length = 0;
    this.#dtLoff_a.length = 0;

    this.#adjStrtTk_a.length = 0;
    this.#adjStopTk_a.length = 0;

    this.clrErr_$();

    this.curLoc$ = undefined as any;
    this.scandTk_a$.length = 0;
    this.lsTk$ = undefined;
    this.outTk$ = undefined;

    this.#destroyed = true;
  }

  /**
   * @final
   * @headconst @param bufr_x
   * @const @param strtLoff_x
   * @const @param stopLoff_x
   */
  @out((self: Lexr<T>) => {
    assert(self.frstLexTk.value === BaseTok.strtBdry);
    assert(self.lastLexTk.value === BaseTok.stopBdry);
  })
  protected reset_Lexr$(
    bufr_x: Bufr | Bart,
    strtLoff_x: loff_t,
    stopLoff_x?: loff_t,
  ): this {
    if (this.bufr$) this.destructor();

    this.bufr$ = bufr_x;

    this.curLexTk$ = new Token(
      this,
      g_ran_fac.byLoff(bufr_x.frstLine, strtLoff_x),
      BaseTok.strtBdry as T,
    );
    this.stopLexTk$ = new Token(
      this,
      g_ran_fac.byLoff(bufr_x.lastLine, stopLoff_x),
      BaseTok.stopBdry as T,
    );
    this.curLexTk$.linkNext(this.stopLexTk$);
    //jjjj TOCLEANUP
    // bufr_x.frstLine.setFrstToken_$(this.curLexTk$);
    // bufr_x.lastLine.setLastToken_$(this.stopLexTk$);
    /*#static*/ if (INOUT) {
      assert(bufr_x.frstLine.frstTokenBy(this) === this.curLexTk$);
      assert(bufr_x.lastLine.lastTokenBy(this) === this.stopLexTk$);
    }

    this.curLoc$ = this.curLexTk$.sntStopLoc.dup_Loc();

    // this.initialized_ = false; /** @member { Boolean } */

    this.#destroyed = false;
    return this;
  }

  /**
   * @headconst @param bufr_x
   * @const @param strtLoff_x
   * @const @param stopLoff_x
   */
  reset_Lexr(
    bufr_x?: Bufr | Bart,
    strtLoff_x: loff_t = 0,
    stopLoff_x?: loff_t,
  ): this {
    return this.reset_Lexr$(bufr_x ?? this.bufr$, strtLoff_x, stopLoff_x);
  }

  // get initialized() { return this.initialized_; }

  // /**
  //  * @param { TokBufr<T> } bufr @const
  //  */
  // initialize$_( bufr )
  // {
  //   /* in */ {
  //     assert( !this.initialized_ );
  //     assert( bufr );
  //   }
  //   const out = () => {
  //     assert( this.bufr$ );
  //     assert( this.curLexTk$ && this.stopLexTk$ );
  //     assert( this.initialized_ );
  //   }

  //   this.bufr$ = bufr; /** @member { TokBufr<T> } */
  //   // this.curLoc$ = new TokLoc( bufr.frstLine ); /** @member */
  //   // this.strtloc_ = this.curLoc$.dup();
  //   // this.stoploc_ = this.curLoc$.dup();

  //   /** @member { Token } */
  //   this.curLexTk$ = new Token( new TokLoc(bufr.frstLine), BaseTok.strtBdry );
  //   /** @member { Token } */
  //   this.stopLexTk$ = new Token( new TokLoc(bufr.lastLine,bufr.lastLine.uchrLen), BaseTok.stopBdry );

  //   this.initialized_ = true;

  //   out();
  // }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @headconst @param oldRan_x */
  protected calcStrtLexTk$(oldRan_x: Ran): Token<T> | undefined {
    let ln_ = oldRan_x.frstLine;
    let retTk = ln_.frstTokenBy(this);
    /** @primaryconst */
    const strtLoc = oldRan_x.strtLoc;
    while (
      !retTk ||
      strtLoc.posS(retTk.sntStopLoc) ||
      retTk.value === BaseTok.stopBdry //!
    ) {
      if (ln_.isFrstLine) {
        retTk = undefined;
        break;
      }

      // assert( ln_.prevLine );
      ln_ = ln_.prevLine!;
      retTk = ln_.frstTokenBy(this);
    }
    // assert(valve);
    if (retTk) {
      /*#static*/ if (INOUT) {
        assert(retTk.sntStopLoc.posSE(strtLoc));
      }
      while (
        retTk.nextToken_$?.sntStopLoc.posSE(strtLoc) &&
        retTk.nextToken_$.value !== BaseTok.stopBdry
      ) {
        retTk = retTk.nextToken_$;
      }
    }
    return retTk;
  }

  /** @headconst @param oldRan_x */
  protected calcStopLexTk$(oldRan_x: Ran): Token<T> | undefined {
    let ln_ = oldRan_x.lastLine;
    let retTk = ln_.lastTokenBy(this);
    /** @primaryconst */
    const stopLoc = oldRan_x.stopLoc;
    while (
      !retTk ||
      retTk.sntStrtLoc.posS(stopLoc) ||
      retTk.value === BaseTok.strtBdry //!
    ) {
      if (ln_.isLastLine) {
        retTk = undefined;
        break;
      }

      // assert( ln_.nextLine );
      ln_ = ln_.nextLine!;
      retTk = ln_.lastTokenBy(this);
    }
    // assert(valve);
    if (retTk) {
      /*#static*/ if (INOUT) {
        assert(stopLoc.posSE(retTk.sntStrtLoc));
      }
      while (
        retTk.prevToken_$?.sntStrtLoc.posGE(stopLoc) &&
        retTk.prevToken_$.value !== BaseTok.strtBdry
      ) {
        retTk = retTk.prevToken_$;
      }
    }
    return retTk;
  }

  // /**
  //  * [`strtTk_x`, `stopTk_x`)
  //  * @headconst @param strtTk_x
  //  * @headconst @param stopTk_x
  //  */
  // bakeRanvalForw_$(strtTk_x?: Token<T>, stopTk_x?: Token<T>): void {
  //   if (!strtTk_x) return;

  //   let tk_: Token<T> | undefined = strtTk_x;
  //   const VALVE = 10_000;
  //   let valve = VALVE;
  //   while (tk_ && tk_ !== stopTk_x && --valve) {
  //     tk_.bakeRanval_$();
  //     tk_ = tk_.nextToken_$;
  //   }
  //   assert(valve, `Loop ${VALVE}(±1) times!`);
  // }
  // /** @see {@linkcode bakeRanvalForw_$()} */
  // bakeRanvalBack_$(strtTk_x?: Token<T>, stopTk_x?: Token<T>): void {
  //   if (!strtTk_x) return;

  //   let tk_: Token<T> | undefined = strtTk_x;
  //   const VALVE = 10_000;
  //   let valve = VALVE;
  //   while (tk_ && tk_ !== stopTk_x && --valve) {
  //     tk_.bakeRanval_$();
  //     tk_ = tk_.prevToken_$;
  //   }
  //   assert(valve, `Loop ${VALVE}(±1) times!`);
  // }
  /**
   * `[ strtTk_x, stopTk_x )`
   * @headconst @param fn_x
   * @headconst @param strtTk_x
   * @headconst @param stopTk_x
   */
  batchForw_$(
    fn_x: (tk: Token<T>) => void,
    strtTk_x?: Token<T>,
    stopTk_x?: Token<T>,
  ): void {
    if (!strtTk_x) return;

    let tk_: Token<T> | undefined = strtTk_x;
    const VALVE = LnumMAX;
    let valve = VALVE;
    while (tk_ && tk_ !== stopTk_x && --valve) {
      fn_x(tk_);
      tk_ = tk_.nextToken_$;
    }
    assert(valve, `Loop ${VALVE}(±1) times!`);
    //jjjj TOCLEANUP
    // /*#static*/ if (INOUT) {
    //   assert(tk_);
    // }
  }
  /** @see {@linkcode batchForw_$()} */
  batchBack_$(
    fn_x: (tk: Token<T>) => void,
    strtTk_x?: Token<T>,
    stopTk_x?: Token<T>,
  ): void {
    if (!strtTk_x) return;

    let tk_: Token<T> | undefined = strtTk_x;
    const VALVE = 10_000;
    let valve = VALVE;
    while (tk_ && tk_ !== stopTk_x && --valve) {
      fn_x(tk_);
      tk_ = tk_.prevToken_$;
    }
    assert(valve, `Loop ${VALVE}(±1) times!`);
    //jjjj TOCLEANUP
    // /*#static*/ if (INOUT) {
    //   assert(tk_);
    // }
  }

  /**
   * `in( _oldRan_a_x.length )`
   * @headconst @param _oldRan_a_x
   */
  protected sufLexmrk$(_oldRan_a_x?: Ran[]) {}

  /**
   * Mark lex region
   *
   * Assign `#strtLexTk_a`, `#stopLexTk_a`, `#lv_oldStop_a`, `#dtLoff_a`,
   * `#adjStrtTk_a`, `#adjStopTk_a`.\
   * Set `curLexTk$`, `stopLexTk$`.
   *
   * @final
   */
  @traceOut(_TRACE)
  @out((self: Lexr<T>) => {
    assert(!self.curLexTk$.isErr);
    assert(!self.stopLexTk$.isErr);
    assert(self.curLexTk$.posSe(self.stopLexTk$));
  })
  lexMrk_$(): this {
    /*#static*/ if (_TRACE) {
      console.log(
        `${trace.indent}>>>>>>> ${this.class_id}.lexMrk_$() >>>>>>>`,
      );
    }
    /*#static*/ if (DEBUG) {
      this._saveRvTurn_ = 1;
    }
    const oldRan_a = this.bufr$.oldRan_a;
    /*#static*/ if (INOUT) {
      assert(oldRan_a.length && oldRan_a[0].bufr === this.bufr$);
      // const ranbufr = oldRan_x.bufr;
      // assert( !ranbufr || ranbufr === this.bufr$ );
    }
    this.#strtLexTk_a.length =
      this.#stopLexTk_a.length =
      this.#lv_oldStop_a.length =
      this.#dtLoff_a.length =
      this.#adjStrtTk_a.length =
      this.#adjStopTk_a.length =
        oldRan_a.length;

    for (let i = oldRan_a.length; i--;) {
      const oldRan = oldRan_a[i];

      this.#lv_oldStop_a[i] = [oldRan.stopLoc.lidx_1, oldRan.stopLoff];
      this.#dtLoff_a[i] = 0;

      this.#strtLexTk_a[i] = this.calcStrtLexTk$(oldRan) ?? this.frstLexTk;
      this.#stopLexTk_a[i] = this.calcStopLexTk$(oldRan) ?? this.lastLexTk;

      this.#adjStrtTk_a[i] =
        this.#strtLexTk_a[i].sntLastLine === oldRan.frstLine;
      this.#adjStopTk_a[i] =
        oldRan.lastLine === this.#stopLexTk_a[i].sntFrstLine;

      if (i < oldRan_a.length - 1) {
        if (this.#strtLexTk_a[i] === this.#strtLexTk_a[i + 1]) {
          const tk_ = this.#stopLexTk_a[i] =
            this.#strtLexTk_a[i + 1] =
              this.#strtLexTk_a[i].insNext(
                new Token(
                  this,
                  g_ran_fac.byLoc(oldRan.stopLoc, oldRan_a[i + 1].strtLoc),
                ).syncRanval(),
              );
          /* 3248 */ if (
            tk_.nextToken_$ && tk_.sntStopLoc.posG(tk_.nextToken_$.sntStrtLoc)
          ) {
            tk_.nextToken_$.setStrt(tk_.sntStopLoc);
          }
        } else if (this.#stopLexTk_a[i] === this.#stopLexTk_a[i + 1]) {
          const tk_ = this.#stopLexTk_a[i] =
            this.#strtLexTk_a[i + 1] =
              this.#stopLexTk_a[i + 1].insPrev(
                new Token(
                  this,
                  g_ran_fac.byLoc(oldRan.stopLoc, oldRan_a[i + 1].strtLoc),
                ).syncRanval(),
              );
          /* 3249 */ if (
            tk_.prevToken_$ && tk_.sntStrtLoc.posS(tk_.prevToken_$.sntStopLoc)
          ) {
            tk_.prevToken_$.setStop(tk_.sntStrtLoc);
          }
        }
      }
    }

    if (this.curLexTk$ === this.stopLexTk$) {
      this.curLexTk$ = this.#strtLexTk_a[0];
      this.stopLexTk$ = this.#stopLexTk_a.at(-1)!;
    } else {
      if (this.curLexTk$.posGe(this.#strtLexTk_a[0])) {
        this.curLexTk$ = this.#strtLexTk_a[0];
      }
      if (this.stopLexTk$.posSe(this.#stopLexTk_a.at(-1)!)) {
        this.stopLexTk$ = this.#stopLexTk_a.at(-1)!;
      }
    }
    if (this.curLexTk$.isErr) {
      /*#static*/ if (INOUT) {
        assert(this.curLexTk$.value === BaseTok.strtBdry);
      }
      this.curLexTk$.clrErr();
      this.errTk_ss$.rmv(this.curLexTk$);
    }
    if (this.stopLexTk$.isErr) {
      /*#static*/ if (INOUT) {
        assert(this.stopLexTk$.value === BaseTok.stopBdry);
      }
      this.stopLexTk$.clrErr();
      this.errTk_ss$.rmv(this.stopLexTk$);
    }

    this.batchForw_$(
      //jjjj TOCLEANUP
      // (tk) => tk.reset_Token()._saveRanval_(),
      this.drtenTk$,
      this.curLexTk$.nextToken_$,
      this.stopLexTk$,
    );
    this.sufLexmrk$(oldRan_a);
    return this;
  }

  // /**
  //  * @final
  //  * @param { TokLine<T> } line_x
  //  * @const @param { loff_t } loff_x
  //  */
  // markLexRegion( line_x, loff_x )
  // {
  //   markLexRegion( line_x, loff_x, line_x, loff_x );
  // }

  // get strtLoc$_() { return this.strtloc_; }
  // get stoplocOld$_() { return this.stoplocOld_; }

  /** Helper */
  #anchr_s = new Set<Token<T>>();
  /** Helper */
  #focus_s = new Set<Token<T>>();
  /**
   * Adjust lex region
   *
   * Adjust `curLexTk$`, and tokens before at the same line.\
   * Adjust `stopLexTk$`, and tokens after at the same line.\
   * Reset `errTk_ss$`
   *
   * @final
   */
  @traceOut(_TRACE)
  lexAdj_$(): this {
    /*#static*/ if (_TRACE) {
      console.log(
        `${trace.indent}>>>>>>> ${this.class_id}.lexAdj_$() >>>>>>>`,
      );
    }
    if (this.isErr) {
      /*#static*/ if (INOUT) {
        assert(
          this.curLexTk$.posSe(this.errTk_ss$[0]) &&
            this.stopLexTk$.posGe(this.errTk_ss$.at(-1)!),
        );
      }
      this.clrErr_$();
    }

    const newRan_a = this.bufr$.newRan_a;
    const LEN = newRan_a.length;
    /*#static*/ if (INOUT) {
      assert(LEN);
    }
    this.#anchr_s.clear();
    this.#focus_s.clear();
    /* Adjusting each of `newRan_a`, not just `newRan_a[0]`,
    `newRan_a.at(-1)!`, is because unrelated tokens also need to be adjusted. */
    /* MUST be in (non-reverse) order, because following tokens and
    `#lv_oldStop_a` on the same line need to be adjusted. */
    for (let i = 0; i < LEN; ++i) {
      const newRan = newRan_a[i];

      const tgtStrtLn = newRan.frstLine;
      const tgtStopLn = newRan.lastLine;
      if (this.#adjStrtTk_a[i]) {
        const srcStrtLn = this.#strtLexTk_a[i].sntLastLine;
        if (srcStrtLn !== tgtStrtLn) {
          let tk_: Token<T> | undefined = this.#strtLexTk_a[i];
          do {
            tk_.sntStopLoc.line_$ = tgtStrtLn;
            this.#focus_s.add(tk_);
            if (tk_.sntFrstLine === srcStrtLn) {
              tk_.sntStrtLoc.line_$ = tgtStrtLn;
              this.#anchr_s.add(tk_);
            }

            if (tk_ === srcStrtLn.frstTokenBy(this)) {
              srcStrtLn.delFrstTokenBy_$(this);
              tgtStrtLn.setFrstToken_$(tk_);
            }
            if (
              tk_ === srcStrtLn.lastTokenBy(this) && tgtStrtLn !== tgtStopLn
            ) {
              srcStrtLn.delLastTokenBy_$(this);
              tgtStrtLn.setLastToken_$(tk_);
            }

            tk_ = tk_.prevToken_$;
          } while (tk_?.sntLastLine === srcStrtLn);
        }
      }

      if (this.#adjStopTk_a[i]) {
        const srcStopLn = this.#stopLexTk_a[i].sntFrstLine;
        const dtLoff = this.#dtLoff_a[i] = newRan.stopLoff -
          this.#lv_oldStop_a[i][1];
        if (dtLoff !== 0) {
          for (let j = i + 1; j < LEN; ++j) {
            if (this.#lv_oldStop_a[j][0] !== this.#lv_oldStop_a[i][0]) break;
            this.#lv_oldStop_a[j][1] += dtLoff;
          }
        }
        if (srcStopLn !== tgtStopLn || dtLoff !== 0) {
          let tk_: Token<T> | undefined = this.#stopLexTk_a[i];
          do {
            tk_.sntStrtLoc.set_Loc(tgtStopLn, tk_.sntStrtLoff + dtLoff);
            this.#anchr_s.add(tk_);
            if (tk_.sntLastLine === srcStopLn) {
              tk_.sntStopLoc.set_Loc(tgtStopLn, tk_.sntStopLoff + dtLoff);
              this.#focus_s.add(tk_);
            }

            if (
              tk_ === srcStopLn.frstTokenBy(this) && tgtStrtLn !== tgtStopLn
            ) {
              srcStopLn.delFrstTokenBy_$(this);
              tgtStopLn.setFrstToken_$(tk_);
            }
            if (tk_ === srcStopLn.lastTokenBy(this)) {
              srcStopLn.delLastTokenBy_$(this);
              tgtStopLn.setLastToken_$(tk_);
            }

            tk_ = tk_.nextToken_$;
          } while (tk_?.sntFrstLine === srcStopLn);
        }
      }
    }
    /* Since in (non-reverse) order, so `syncRanvalAnchr()`, `syncRanvalFocus()`
    can not be called in above loop, because otherwise they could calc `lidx_1`
    on `removed` Line.  */
    for (const tk of this.#anchr_s) tk.syncRanvalAnchr();
    for (const tk of this.#focus_s) tk.syncRanvalFocus();
    return this;
  }

  // get stoplocNew$_() { return this.stoplocNew_; }

  /** Assign `curLoc$` */
  protected preLex$(): void {
    this.curLoc$.become_Loc(this.curLexTk$.sntStopLoc);
  }

  protected sufLex$(_valve_x: uint): void {}

  /**
   * Lex [ curLexTk$.stopLoc, stopLexTk$.strtLoc )
   * @final
   */
  @traceOut(_TRACE)
  lex(valve_x = 10): void {
    assert(--valve_x, "Loop 10(±1) times!");
    /*#static*/ if (_TRACE) {
      console.log(`${trace.indent}>>>>>>> ${this.class_id}.lex() >>>>>>>`);
    }
    //jjjj TOCLEANUP
    // if (this.curLexTk$ === this.stopLexTk$) { //llll review (one Bufr with different Lexr? etc)
    //   /* This is the case of one `Bufr` with two or more `EdtrScrolr`. */
    //   return;
    // }

    /*#static*/ if (INOUT) {
      /* Error tokens, if any, are included in the lex region. */
      assert(!this.isErr);
      assert(this.curLexTk$.posSe(this.stopLexTk$));
    }
    this.preLex$();

    this.strtLexTk$ = this.curLexTk$;
    // this.#valve = Lexr.#VALVE;
    this.lex_impl$()
      .concatTokens$();

    // console.log(this.bufr$.frstLine.frstTokenBy(this));
    // console.log(this.bufr$.lastLine.lastTokenBy(this));

    this.sufLex$(valve_x);

    if (this.oldTk_ss$.length) {
      this.oldTk_ss$.rmv_O(this.scandTk_a$);
      for (const tk of this.oldTk_ss$) tk.destructor();
      this.oldTk_ss$.reset_SortedArray();
    }
    this.scandTk_a$.length = 0;
  }

  //jjjj TOCLEANUP
  // /** @return `null` means scanning token not provided here. */
  // protected getScanningToken$(): Token<T> | undefined | null {
  //   return this.lsTk$?.nextToken_$;
  // }

  /**
   * @headconst @param prevTk_x
   * @headconst @param scandTk_x
   * @return `scandTk_x`
   */
  protected linkNextTk$(prevTk_x: Token<T>, scandTk_x: Token<T>): Token<T> {
    // let retTk = prevTk_x;
    // for (let i = 0; i < nextTks_x.length; i++) {
    //   retTk = retTk.linkNext(nextTks_x[i]);
    // }
    // return retTk;

    return prevTk_x.linkNext(scandTk_x);
  }

  /**
   * Lex [ `curLexTk$.sntStopLoc`, `stopLexTk$.sntStrtLoc` )\
  //  * `in( this.#valve > 0)`
   * @final
   */
  protected lex_impl$(): this {
    // assert(--this.#valve, `Loop ${Lexr.#VALVE} times`);
    /* if in `_relex`ing...
    */ if (this.scandTk_a$.length) {
      for (const tk of this.scandTk_a$) {
        if (!this.oldTk_ss$.includes(tk)) tk.destructor();
      }
      this.scandTk_a$.length = 0;
    }
    this.lsTk$ = this.curLexTk$;
    const VALVE = LnumMAX;
    let valve = VALVE;
    do {
      const scandTk_ = this._scan();
      if (!scandTk_ || scandTk_.value === BaseTok.unknown) { // 2269
        assert(--valve, `Loop ${VALVE}(±1) times!`);
        continue;
      }
      /* `lsTk$` being `undefined` means that `scandTk_` is handled. */
      if (this.lsTk$) {
        this.linkNextTk$(this.lsTk$, scandTk_);
        if (scandTk_.isErr) this.errTk_ss$.add(scandTk_);
      }

      if (!this.isErr) this.curLexTk$ = scandTk_;
      if (scandTk_ === this.stopLexTk$) break;

      if (this.lsTk$) {
        scandTk_.syncRanval(); //!
        this.scandTk_a$.push(scandTk_);
      }
      this.lsTk$ = scandTk_;
    } while (--valve);
    assert(valve, `Loop ${VALVE}(±1) times!`);
    return this;
  }

  /**
   * @final
   * @primaryconst
   *    @const if `loc_x !== this.curLoc$ || n_x`
   * @headborrow @primaryconst @param loc_x
   * @const @param n_x
   */
  protected reachLexBdry$(loc_x: Loc = this.curLoc$, n_x?: ldt_t): boolean {
    if (n_x === undefined || n_x === 0) {
      return loc_x.posGE(this.stopLexTk$.sntStrtLoc);
    }

    using loc_u = loc_x.usingDup();
    if (n_x > 0) loc_u.forwn(n_x);
    else loc_u.backn(-n_x);
    return this.reachLexBdry$(loc_u);
  }
  /**
   * Assign `curLoc$.loff_$`
   * @const @param ucod_x
   * @const @param strt_x Relative to `curLoc$.loff_$`
   * @const @param stop_x Relative to `curLoc$.loff_$`
   * @return Same as `reachLexBdry$()` return
   */
  protected frstNonToBdry$(
    ucod_x: UInt16 | UInt16[] | ((_: UInt16) => boolean),
    strt_x = 0,
    stop_x?: loff_t,
  ): boolean {
    if (this.reachLexBdry$()) return true;

    const ln_ = this.curLoc$.line_$;
    const loff_0 = this.curLoc$.loff_$;
    const strt = loff_0 + strt_x;
    const stop = stop_x === undefined ? ln_.uchrLen : loff_0 + stop_x;
    if (
      ln_ !== this.stopLexTk$.sntFrstLine || stop < this.stopLexTk$.sntStrtLoff
    ) {
      this.curLoc$.loff_$ = frstNon(ucod_x, ln_, strt, stop);
      return false;
    }

    this.curLoc$.loff_$ = frstNon(
      ucod_x,
      ln_,
      strt,
      this.stopLexTk$.sntStrtLoff,
    );
    return this.reachLexBdry$();
  }

  /** @final */
  protected atLocLexBdry$(): LocCfd {
    return this.curLoc$.locE(this.stopLexTk$.sntStrtLoc);
  }
  //jjjj TOCLEANUP
  // /** @final */
  // protected overLocLexBdry$(): LocCfd {
  //   return this.curLoc$.locG(this.stopLexTk$.sntStrtLoc);
  // }

  /**
   * Scan one token ab to stopLexTk$ (excluded).
  //jjjj TOCLEANUP
  //  * @param retTk_x Derived from {@linkcode getScanningToken$()}
   */
  @out((self: Lexr<T>, ret) => {
    if (ret && ret !== self.stopLexTk$) {
      assert(ret.posSe(self.stopLexTk$));
      assert(ret.sntStopLoc.posSE(self.curLoc$));
    }
  })
  private _scan(
    // retTk_x: Token<T> | undefined | null,
  ): Token<T> | undefined {
    this.curLoc$.correctLoff(); // Could `overEol`
    /*#static*/ if (INOUT) {
      // assert( this.curLexTk$ && this.stopLexTk$ );
      assert(
        this.curLexTk$.sntStopLoc.posSE(this.curLoc$) &&
          this.curLoc$.posSE(this.stopLexTk$.sntStrtLoc),
      );
    }
    if (this.reachLexBdry$()) {
      return this.stopLexTk$;
    }

    //jjjj TOCLEANUP
    // if (retTk_x === undefined || retTk_x === this.stopLexTk$) {
    //   retTk_x = new Token(this, new TokRan(this.curLoc$.dup_Loc()));
    // } else if (retTk_x instanceof Token) {
    //   retTk_x.setStrt(this.curLoc$);
    // }
    this.outTk$ = undefined;
    return this.scan_impl$();
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // /**
  //  * `curLoc$` must be at the end of the scaned `tok_x` (excluded)
  //  * @final
  //  * @const @param tok_x
  //  * @out @param out_x
  //  * @const @param stopLoc_x
  //  */
  // protected setTok$(
  //   tok_x: T,
  //   out_x: Token<T>,
  //   stopLoc_x: Loc = this.curLoc$,
  // ): void {
  //   out_x.value = tok_x;
  //   out_x.setStop(stopLoc_x);
  // }

  /**
   * whitespace\
   * `in( !this.reachLexBdry$())`
   * @final
   * @const @param ws_a_x
   * @const @param VALVE_x
   * @return `continue` or `reachBdry`.\
   *    Whatever `true` or `false`, `curLoc$` will be at the right place.
   */
  protected skipWs$(ws_a_x = ws_a, VALVE_x = 10_000): ScanR {
    /*#static*/ if (INOUT) {
      assert(isWs(this.curLoc$.ucod, ws_a_x));
    }
    let ret = ScanR.continue;
    let reachBdry: boolean;
    let valve = VALVE_x;
    L_0: do {
      this.curLoc$.forw();
      switch (this.atLocLexBdry$()) {
        case LocCfd.yes:
          ret = ScanR.reachBdry;
          break L_0;
        case LocCfd.no_sameline:
          reachBdry = this.frstNonToBdry$(ws_a_x);
          if (reachBdry) ret = ScanR.reachBdry;
          break L_0;
        case LocCfd.no_othrline:
          this.curLoc$.loff_$ = frstNon(
            ws_a_x,
            this.curLoc$.line_$,
            this.curLoc$.loff_$,
          );
          if (!this.curLoc$.reachEol) break L_0;
          break;
        case LocCfd.no_othrBufr:
          fail("Should not run here!");
      }
    } while (--valve);
    assert(valve, `Loop ${VALVE_x}(±1) times!`);
    return ret;
  }
  /**
   * @final
   * @const @param VALVE_x
   */
  protected skipASCIIWs$(VALVE_x = 10_000): ScanR {
    return this.skipWs$(ASCIIWs_a, VALVE_x);
  }

  /**
   * Scan one token ab to stopLexTk$ (excluded)\
   * `in( !this.reachLexBdry$())` \
  //  * `in( retTk_x.strtLoc.posSE(this.curLoc$) )`\
  //  * `in( retTk_x.value === BaseTok.unknown )`
   */
  protected abstract scan_impl$(): Token<T> | undefined;
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  #bypassSn(sn_x: Stnode<T>): void {
    let tk_ = sn_x.frstToken_1;
    const lastTk = sn_x.lastToken_1;
    const VALVE = 1_000;
    let valve = VALVE;
    while (--valve) {
      if (tk_.isErr) this.errTk_ss$.add(tk_);
      tk_.syncRanval(); //!
      this.scandTk_a$.push(tk_);
      if (tk_ === lastTk) break;
      tk_ = tk_.nextToken_$!;
    }
    assert(valve, `Loop ${VALVE}(±1) times!`);
  }
  #bypassTk(tk_x: Token<T>): void {
    if (tk_x.isErr) this.errTk_ss$.add(tk_x);
    tk_x.syncRanval(); //!
    this.scandTk_a$.push(tk_x);
  }
  /**
   * Only chain the first token of `snt_a_x` with `lsTk$`, and put all tokens of
   * `snt_a_x` into `scandTk_a$`.\
   **! Tokens in `snt_a_x` SHOULD already be well chained.
   *
   **! Do not modify `curLoc$`
   *
   * @final
   * @headconst @param snts_x
   */
  protected bypassSnts$(...snts_x: (Token<T> | Stnode<T>)[]): Token<T> {
    /*#static*/ if (INOUT) {
      assert(snts_x.length);
      assert(this.lsTk$);
    }
    const tk_0 = snts_x[0] instanceof Token ? snts_x[0] : snts_x[0].frstToken_1;
    this.lsTk$!.linkNext(tk_0);
    for (const snt of snts_x) {
      if (snt instanceof Token) this.#bypassTk(snt);
      else this.#bypassSn(snt);
    }
    /*! to prevent `linkNextTk$()` and `scandTk_a$.push()` in `lex_impl$()` */
    this.lsTk$ = undefined;
    const lastSnt = snts_x.at(-1)!;
    return lastSnt instanceof Token ? lastSnt : lastSnt.lastToken_1;
  }

  /**
   * `out( ret; !ret ||
   *    _tk_0_x.value !== BaseTok.strtBdry && _tk_1_x !== BaseTok.stopBdry)`
   * @const @param _tk_0_x
   * @const @param _tk_1_x
   */
  protected canConcat$(
    _tk_0_x: Token<T>,
    _tk_1_x: Token<T>,
  ): boolean /* | (<TK extends Token<T>>(_: { kept: TK; rmvd: TK }) => void) */ {
    return false;
  }

  protected concatBdry$ = true;
  get concatBdry_$() {
    return this.concatBdry$;
  }
  protected concatInnr$ = false;
  get concatInnr_$() {
    return this.concatInnr$;
  }
  /**
   * Try to concat `[strtLexTk$, ...scandTk_a$, stopLexTk$]`.\
   * `strtLexTk$` could be adjusted to keep valid, which will be used in
   * `Pazr.paz()`.
   *
   * Priority to keep unchanged: `stopLexTk$` > `strtLexTk$` > `scandTk_a$`
   */
  protected concatTokens$() {
    /*#static*/ if (INOUT) {
      if (this.scandTk_a$.length) {
        assert(
          this.scandTk_a$[0].prevToken_$ === this.strtLexTk$ &&
            this.scandTk_a$.at(-1)!.nextToken_$ === this.stopLexTk$,
        );
      } else {
        assert(this.strtLexTk$.isConcatedTo(this.stopLexTk$));
      }
    }
    let tk_0, tk_1: Token<T> | undefined;
    if (this.scandTk_a$.length) {
      if (this.concatBdry$) {
        tk_0 = this.strtLexTk$;
        tk_1 = this.scandTk_a$[0];
        if (tk_0 !== this.frstLexTk && this.canConcat$(tk_0, tk_1)) { // 1894
          tk_0.setStop(tk_1.sntStopLoc);
          if (this.errTk_ss$.includes(tk_1)) {
            this.errTk_ss$.rmv(tk_1.tfrErr(tk_0));
            this.errTk_ss$.add(tk_0);
          }

          this.rmvScandTk_$(tk_1, 0);
        }

        tk_0 = this.scandTk_a$.at(-1);
        tk_1 = this.stopLexTk$;
        if (tk_1 !== this.lastLexTk && tk_0 && this.canConcat$(tk_0, tk_1)) { // 1895
          tk_1.setStrt(tk_0.sntStrtLoc);
          if (this.errTk_ss$.includes(tk_0)) {
            tk_1.tfrErr(tk_0).clrErr(); // to keep the order of Err's
            this.errTk_ss$.rmv(tk_0.tfrErr(tk_1));
            this.errTk_ss$.add(tk_1);
          }

          this.rmvScandTk_$(tk_0, -1);
        }
      }

      if (this.concatInnr$) {
        for (let i = this.scandTk_a$.length; i-- > 1;) {
          tk_0 = this.scandTk_a$[i - 1];
          tk_1 = this.scandTk_a$[i];
          if (this.canConcat$(tk_0, tk_1)) {
            tk_1.setStrt(tk_0.sntStrtLoc);
            if (this.errTk_ss$.includes(tk_0)) {
              tk_1.tfrErr(tk_0).clrErr(); // to keep the order of Err's
              this.errTk_ss$.rmv(tk_0.tfrErr(tk_1));
              this.errTk_ss$.add(tk_1);
            }

            this.rmvScandTk_$(tk_0, i - 1);
          }
        }
      }
    }

    if (this.concatBdry$ && this.scandTk_a$.length === 0) {
      tk_0 = this.strtLexTk$;
      tk_1 = this.stopLexTk$;
      if (
        tk_0 !== this.frstLexTk && tk_1 !== this.lastLexTk &&
        this.canConcat$(tk_0, tk_1)
      ) {
        tk_1.setStrt(tk_0.sntStrtLoc);
        this.strtLexTk$ = tk_1.prevToken_$!;

        tk_0.removeSelf()!.destructor();
      }
    }
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** For testing only */
  toString() {
    let tk_ = this.frstLexTk;
    const ret_a: string[] = [`${tk_}`];

    let curlidx = tk_.sntFrstLine.lidx_1;
    const lastTk = this.lastLexTk;
    const VALVE = 1_000;
    let valve = VALVE;
    do {
      tk_ = tk_.nextToken_$!;
      const lidx = tk_.sntFrstLine.lidx_1;
      if (lidx === curlidx) {
        ret_a.push(" ");
      } else {
        ret_a.push("\n");
        curlidx = lidx;
      }
      ret_a.push(`${tk_}`);
    } while (!tk_.posE(lastTk) && --valve);
    assert(valve, `Loop ${VALVE}(±1) times!`);

    return ret_a.join("");
  }

  get _tkId_a_(): Id_t[] {
    let tk_ = this.frstLexTk;
    const ret_a = [tk_.id];

    const lastTk = this.lastLexTk;
    const VALVE = 1_000;
    let valve = VALVE;
    do {
      tk_ = tk_.nextToken_$!;
      ret_a.push(tk_.id);
    } while (!tk_.posE(lastTk) && --valve);
    assert(valve, `Loop ${VALVE}(±1) times!`);

    return ret_a;
  }

  get _repr_(): unknown {
    let tk_ = this.frstLexTk;
    const ret_a = [tk_._repr_];

    const VALVE = 1_000;
    let valve = VALVE;
    do {
      tk_ = tk_.nextToken_$!;
      const r_ = tk_._repr_;
      if (r_) ret_a.push(r_);
    } while (tk_.value !== BaseTok.stopBdry && --valve);
    assert(valve, `Loop ${VALVE}(±1) times!`);

    return ret_a;
  }
}
/*80--------------------------------------------------------------------------*/
