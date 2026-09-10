/** 80**************************************************************************
 * @module lib/compiling/Line
 * @license MIT
 ******************************************************************************/

import { _TREE, INOUT } from "../../preNs.ts";
import type { BufrDir, lnum_t, loff_t, UChr, uint, unum } from "../alias.ts";
import { LnumMAX, LoffMAX } from "../alias.ts";
import type { Id_t, Ts_t, UInt16 } from "../alias_v.ts";
import type { Bidir } from "../Bidi.ts";
import { Bidi } from "../Bidi.ts";
import "../jslang.ts";
import { assert, out } from "../util.ts";
import type { Tok } from "./alias.ts";
import type { Bufr } from "./Bufr.ts";
import type { Lexr } from "./Lexr.ts";
import { LineTn } from "./LineTree.ts";
import type { Token } from "./Token.ts";
import type { LineData } from "./util.ts";
import { lineBSizeO, lineFrstTkO, lineLastTkO } from "./util.ts";
/*80--------------------------------------------------------------------------*/

/**
 * A nnon-generic base s.t. many related uses can be non-generic.
 *
 * primaryconst: const exclude `lidx$`, `hostTn_$`
 */
export class Line implements Bidir {
  static #ID = 0 as Id_t;
  readonly id = ++Line.#ID as Id_t;
  /** @final */
  get class_id() {
    return `${this.constructor.name}_${this.id}`;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  readonly data_$ = Array.sparse(3) as LineData;

  /* hostTn_$ */
  readonly hostTn_$: LineTn;

  //jjjj TOCLEANUP
  // /**
  //  * @final
  //  * @const
  //  */
  // get #lidx_valid() {
  //   return !this.removed &&
  //     0 <= this.lidx$ && this.lidx$ <= this.bufr$!.maxValidLidx_$;
  // }

  //jjjj TOCLEANUP
  // /**
  //  * `in( !this.removed)`
  //  * @final
  //  * @primaryconst
  //  */
  // invalLidx$() {
  //   /*#static*/ if (INOUT) {
  //     assert(this.bufr$!.maxValidLidx_$ < LnumMAX - 1);
  //   }
  //   this.lidx$ = (this.bufr$!.maxValidLidx_$ + 1);
  // }

  //jjjj TOCLEANUP
  // /**
  //  * Imvalidate lidx's as few as possible after `this`.
  //  * @primaryconst
  //  */
  // #inval_lidx_gt() {
  //   for (
  //     let line = this.nextLine$;
  //     line && line.#lidx_valid;
  //     line = line.nextLine$
  //   ) {
  //     line.invalLidx$();
  //   }
  // }

  //jjjj TOCLEANUP
  // /**
  //  * `in( !this.removed)`
  //  * @primaryconst
  //  */
  // #inval_lidx_selfup() {
  //   if (!this.prevLine$) {
  //     this.bufr$!.maxValidLidx_$ = 0;
  //   } else if (this.prevLine$.#lidx_valid) {
  //     this.bufr$!.maxValidLidx_$ = this.prevLine$.lidx_1;
  //   }

  //   if (this.#lidx_valid) this.invalLidx$();
  //   this.#inval_lidx_gt();
  // }

  /**
   * @final
   * @primaryconst
   */
  get lidx_1(): lnum_t {
    /*#static*/ if (INOUT) {
      assert(!this.removed);
    }
    //jjjj TOCLEANUP
    // if (!this.#lidx_valid) {
    //   if (this.prevLine$) {
    //     this.lidx$ = (this.prevLine$.lidx_1 + 1);
    //   } else {
    //     this.lidx$ = 0;
    //   }

    //   if (this.bufr$!.maxValidLidx_$ < this.lidx$) {
    //     this.bufr$!.maxValidLidx_$ = this.lidx$;
    //     this.#inval_lidx_gt();
    //   }
    // }
    return this.hostTn_$.idx_1;
  }

  lastLidx?: lnum_t;

  /** @const @param id_x `EdtrBaseScrolr.id` */
  invTpBSizeOn(id_x: Id_t): void {
    this.hostTn_$.ctnr!.invBSizeOn_$(id_x);
  }
  /* ~ */

  /* bufr */
  readonly bufr: Bufr;
  get removed() {
    // return !this.bufr.hasLine_$(this);
    return this.hostTn_$.rmvd;
  }

  /** @const */
  get isFrstLine() {
    //jjjj TOCLEANUP
    // /*#static*/ if (INOUT) {
    //   assert(!this.removed /*jjjj TOCLEANUP && this.linked$ */);
    // }
    return this === this.bufr.frstLine_$;
  }
  /** @const */
  get isLastLine() {
    //jjjj TOCLEANUP
    // /*#static*/ if (INOUT) {
    //   assert(!this.removed /*jjjj TOCLEANUP && this.linked$ */);
    // }
    return this === this.bufr.lastLine_$;
  }
  /* ~ */

  /**
   * @const @param id_x `EdtrBaseScrolr.id`
   * @const @param fb_x
   */
  getBSizeOn(id_x: Id_t, fb_x: unum = 0): unum {
    //jjjj TOCLEANUP
    // return this.bufr.getLineBSize_$(this, id_x) ?? fb_x;
    return lineBSizeO(this.data_$)[id_x] ?? fb_x;
  }
  /**
   * @const @param id_x `EdtrBaseScrolr.id`
   * @const @param bsize_x
   */
  setBSizeOn(id_x: Id_t, bsize_x: unum): void {
    //jjjj TOCLEANUP
    // this.bufr.setLineBSize_$(this, id_x, bsize_x);
    lineBSizeO(this.data_$)[id_x] = bsize_x;
  }
  /**
   * @const @param id_x `EdtrBaseScrolr.id`
   * @const @param bsizeFb_x
   */
  getBStrtOn(id_x: Id_t, bsizeFb_x: unum = 0): unum {
    return this.hostTn_$.bstrtOn_$(id_x, bsizeFb_x);
  }
  /**
   * @const @param id_x `EdtrBaseScrolr.id`
   * @const @param bsizeFb_x
   */
  getBStopOn(id_x: Id_t, bsizeFb_x: unum = 0): unum {
    return this.getBStrtOn(id_x, bsizeFb_x) + this.getBSizeOn(id_x, bsizeFb_x);
  }

  //jjjj TOCLEANUP
  // /** @const @param id_x `EdtrBaseScrolr.id` */
  // getFsrecaOn(id_x: Id_t) {
  //   //jjjj TOCLEANUP
  //   // return this.bufr.getLineFsrecA(this.lidx_1, id_x);
  //   return lineFsrecaO(this.data_$)[id_x] ??= [];
  // }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /* text$ */
  protected text$ = "";
  /** @const */
  get text(): string {
    return this.text$;
  }

  /**
   * @final
   * @const
   */
  get uchrLen(): loff_t {
    return this.text.length;
  }

  /**
   * `in( i_x < this.text.length)`
   * @final
   */
  uchrAt(i_x: loff_t): UChr {
    return this.text.at(i_x)!;
  }

  /** @see {@linkcode uchrAt()} */
  ucodAt(i_x: loff_t): UInt16 {
    return this.text.charCodeAt(i_x) as UInt16;
  }
  /** @see {@linkcode uchrAt()} */
  codpAt(i_x: loff_t): uint {
    return this.text.codePointAt(i_x)!;
  }

  /** @final */
  get empty(): boolean {
    return this.text.length === 0;
  }
  /* ~ */

  get dir(): BufrDir {
    return this.bufr.dir;
  }

  /* #bidi */
  readonly #bidi = new Bidi();

  /** @final @implement */
  get bidi(): Bidi {
    if (this.#bidi.bidiLastCont_ts < this.#lineLastCont_ts) {
      this.#bidi.reset_Bidi(this.text$, this.dir);
      //jjjj TOCLEANUP
      // /*#static*/ if (!AUTOTEST) {
      //   this.#bidi.validate();
      // }
    }
    return this.#bidi;
  }
  /* ~ */

  /* lineLastCont_ts */
  #lineLastCont_ts = 0 as Ts_t;
  /**
   * last content timestamp
   * @final
   */
  get lineLastCont_ts() {
    return this.#lineLastCont_ts;
  }
  #updateLineLastContTs(): Ts_t {
    return this.#lineLastCont_ts = Date.now_1() as Ts_t;
  }
  /* ~ */

  //jjjj TOCLEANUP
  // eline: ELineBase | undefined;
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // /**
  //  * 0-based\
  // //jjjj TOCLEANUP
  // //  **! `lidx$` must be nondecreasing, however valid or not
  //  */
  // protected lidx$: lnum_t | -1 = -1; /** 0-based */

  //jjjj TOCLEANUP
  // protected linked$ = false;
  // /**
  //  * @final
  //  * @const @param _x
  //  */
  // set linked_$(_x: boolean) {
  //   /*#static*/ if (INOUT) {
  //     assert(!this.removed);
  //     assert(this.linked$ !== _x);
  //   }
  //   if (this.linked$) this.bufr$!.lineN_$--;
  //   else this.bufr$!.lineN_$++;
  //   this.linked$ = _x;
  // }

  //jjjj TOCLEANUP
  // protected prevLine$: Line | undefined;
  get prevLine() {
    //jjjj TOCLEANUP
    // return this.prevLine$;
    return this.hostTn_$.prev?.payload;
  }

  //jjjj TOCLEANUP
  // protected nextLine$: Line | undefined;
  get nextLine() {
    //jjjj TOCLEANUP
    // return this.nextLine$;
    return this.hostTn_$.next?.payload;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /* LineData.frstTk */
  //jjjj TOCLEANUP
  // readonly #frstToken_m = new Map<Lexr<any>, Token<any>>();
  /**
   * `out( ret; !ret || ret.frstLine === this)`
   * @const @param lexr_x
   */
  frstTokenBy<T extends Tok>(lexr_x: Lexr<T>): Token<T> | undefined {
    //jjjj TOCLEANUP
    // return this.#frstToken_m.get(lexr_x);
    // return this.bufr.lineFrstTkO_$(this)[lexr_x.id];
    return lineFrstTkO(this.data_$)[lexr_x.id];
  }
  /**
   * `out( ret; !ret || ret.lastLine === this)`
   * @headconst @param lexr_x
   */
  strtTokenBy<T extends Tok>(lexr_x: Lexr<T>): Token<T> | undefined {
    let ret: Token<T> | undefined;
    let tk_ = this.frstTokenBy(lexr_x);
    if (tk_) {
      ret = tk_.prevToken_$?.sntLastLine as Line === this
        ? tk_.prevToken_$
        : tk_;
    } else {
      tk_ = this.prevLine?.lastTokenBy(lexr_x);
      if (tk_?.nextToken_$?.sntLastLine as Line === this) {
        ret = tk_!.nextToken_$;
      }
    }
    return ret;
  }
  /** @const @param tk_x */
  setFrstToken_$<T extends Tok>(tk_x: Token<T>): void {
    //jjjj TOCLEANUP
    // this.#frstToken_m.set(tk_x.lexr_$, tk_x);
    // this.bufr.lineFrstTkO_$(this)[tk_x.lexr_$.id] = tk_x;
    lineFrstTkO(this.data_$)[tk_x.lexr_$.id] = tk_x;
  }
  /** @const @param lexr_x */
  delFrstTokenBy_$<T extends Tok>(lexr_x: Lexr<T>) {
    //jjjj TOCLEANUP
    // this.#frstToken_m.delete(lexr_x);
    // delete this.bufr.lineFrstTkO_$(this)[lexr_x.id];
    lineFrstTkO(this.data_$)[lexr_x.id] = undefined;
  }
  // hasStrt_$( lexr_x:Lexr ) { return this.#frstToken_m.has(lexr_x); }
  /* ~ */

  /* LineData.lastTk */
  //jjjj TOCLEANUP
  // readonly #lastToken_m = new Map<Lexr<any>, Token<any>>();
  /**
   * `out( ret; !ret || ret.lastLine === this)`
   * @const @param lexr_x
   */
  lastTokenBy<T extends Tok>(lexr_x: Lexr<T>): Token<T> | undefined {
    //jjjj TOCLEANUP
    // return this.#lastToken_m.get(lexr_x);
    // return this.bufr.lineLastTkO_$(this)[lexr_x.id];
    return lineLastTkO(this.data_$)[lexr_x.id];
  }
  /**
   * `out( ret; !ret || ret.frstLine === this)`
   * @headconst @param lexr_x
   */
  stopTokenBy<T extends Tok>(lexr_x: Lexr<T>): Token<T> | undefined {
    let ret: Token<T> | undefined;
    let tk_ = this.lastTokenBy(lexr_x);
    if (tk_) {
      ret = tk_.nextToken_$?.sntFrstLine as Line === this
        ? tk_.nextToken_$
        : tk_;
    } else {
      tk_ = this.nextLine?.frstTokenBy(lexr_x);
      if (tk_?.prevToken_$?.sntFrstLine as Line === this) {
        ret = tk_!.prevToken_$;
      }
    }
    return ret;
  }
  /** @const @param tk_x */
  setLastToken_$<T extends Tok>(tk_x: Token<T>): void {
    //jjjj TOCLEANUP
    // this.#lastToken_m.set(tk_x.lexr_$, tk_x);
    // this.bufr.lineLastTkO_$(this)[tk_x.lexr_$.id] = tk_x;
    lineLastTkO(this.data_$)[tk_x.lexr_$.id] = tk_x;
  }
  /** @const @param lexr_x */
  delLastTokenBy_$<T extends Tok>(lexr_x: Lexr<T>) {
    //jjjj TOCLEANUP
    // this.#lastToken_m.delete(lexr_x);
    // delete this.bufr.lineLastTkO_$(this)[lexr_x.id];
    lineLastTkO(this.data_$)[lexr_x.id] = undefined;
  }
  // hasStop_$( lexr_x:Lexr ) { return this.#lastToken_m.has(lexr_x); }
  /* ~ */
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // /* LineData.frstTSeg */
  // //jjjj TOCLEANUP
  // // readonly #strtTSeg_m = new Map<Tfmr, TSeg>();
  // /** @const @param tfmr_x */
  // frstTSegBy_$(tfmr_x: Tfmr): TSeg | undefined {
  //   //jjjj TOCLEANUP
  //   // return this.#strtTSeg_m.get(tfmr_x);
  //   // return this.bufr.lineFrstTSegO_$(this)[tfmr_x.id];
  //   return lineFrstTSegO(this.data_$)[tfmr_x.id];
  // }
  // /** @const @param tseg_x */
  // setFrstTSeg_$(tseg_x: TSeg): void {
  //   //jjjj TOCLEANUP
  //   // this.#strtTSeg_m.set(tseg_x.tfmr_$, tseg_x);
  //   // this.bufr.lineFrstTSegO_$(this)[tseg_x.tfmr_$.id] = tseg_x;
  //   lineFrstTSegO(this.data_$)[tseg_x.tfmr_$.id] = tseg_x;
  // }
  // /** @const @param tfmr_x */
  // delFrstTSegBy_$(tfmr_x: Tfmr): void {
  //   //jjjj TOCLEANUP
  //   // this.#strtTSeg_m.delete(tfmr_x);
  //   // delete this.bufr.lineFrstTSegO_$(this)[tfmr_x.id];
  //   lineFrstTSegO(this.data_$)[tfmr_x.id] = undefined;
  // }
  // /* ~ */

  //jjjj TOCLEANUP
  // /* LineData.lastTSeg */
  // //jjjj TOCLEANUP
  // // readonly #stopTSeg_m = new Map<Tfmr, TSeg>();
  // /** @const @param tfmr_x */
  // lastTSegBy_$(tfmr_x: Tfmr): TSeg | undefined {
  //   //jjjj TOCLEANUP
  //   // return this.#stopTSeg_m.get(tfmr_x);
  //   // return this.bufr.lineLastTSegO_$(this)[tfmr_x.id];
  //   return lineLastTSegO(this.data_$)[tfmr_x.id];
  // }
  // /** @const @param tseg_x */
  // setLastTSeg_$(tseg_x: TSeg): void {
  //   //jjjj TOCLEANUP
  //   // this.#stopTSeg_m.set(tseg_x.tfmr_$, tseg_x);
  //   // this.bufr.lineLastTSegO_$(this)[tseg_x.tfmr_$.id] = tseg_x;
  //   lineLastTSegO(this.data_$)[tseg_x.tfmr_$.id] = tseg_x;
  // }
  // /** @const @param tfmr_x */
  // delLastTSegBy_$(tfmr_x: Tfmr): void {
  //   //jjjj TOCLEANUP
  //   // this.#stopTSeg_m.delete(tfmr_x);
  //   // delete this.bufr.lineLastTSegO_$(this)[tfmr_x.id];
  //   lineLastTSegO(this.data_$)[tfmr_x.id] = undefined;
  // }
  // /* ~ */

  //jjjj TOCLEANUP
  // /** @headconst @param tfmr_x */
  // @out((self: Line, _, args) => {
  //   assert(self.frstTSegBy_$(args[0]) === undefined);
  //   assert(self.lastTSegBy_$(args[0]) === undefined);
  // })
  // delTSegBdryOf(tfmr_x: Tfmr) {
  //   this.frstTSegBy_$(tfmr_x)?.revokeSelf_$();
  //   this.lastTSegBy_$(tfmr_x)?.revokeSelf_$();
  // }

  //jjjj TOCLEANUP
  // delTSegBdry() {
  //   //jjjj TOCLEANUP
  //   // for (const tseg of this.#strtTSeg_m.values()) {
  //   // for (const tseg of Object.values(this.bufr.lineFrstTSegO_$(this))) {
  //   for (const tseg of Object.values(lineFrstTSegO(this.data_$))) {
  //     tseg?.revokeSelf_$();
  //   }
  //   //jjjj TOCLEANUP
  //   // for (const tseg of this.#stopTSeg_m.values()) {
  //   // for (const tseg of Object.values(this.bufr.lineLastTSegO_$(this))) {
  //   for (const tseg of Object.values(lineLastTSegO(this.data_$))) {
  //     tseg?.revokeSelf_$();
  //   }
  //   //jjjj TOCLEANUP
  //   // this.bufr.clearLineFrstTSeg_$(this);
  //   // this.bufr.clearLineLastTSeg_$(this);
  //   clearLineFrstTSeg(this.data_$);
  //   clearLineLastTSeg(this.data_$);
  // }

  //jjjj TOCLEANUP
  // /** @headconst @param tseg_x */
  // hasTSeg(tseg_x: TSeg) {
  //   const tfmr = tseg_x.tfmr_$;
  //   const strtTSeg = this.frstTSegBy_$(tfmr);
  //   const stopTSeg = this.lastTSegBy_$(tfmr);
  //   // if (!strtTSeg || !stopTSeg) return true;
  //   if (!strtTSeg || !stopTSeg) return false;

  //   let tseg = strtTSeg;
  //   const VALVE = 100;
  //   let valve = VALVE;
  //   while (tseg !== tseg_x && tseg !== stopTSeg && --valve) {
  //     tseg = tseg.nextTSeg_$!;
  //   }
  //   assert(valve, `Loop ${VALVE}(±1) times!`);
  //   return tseg === tseg_x;
  // }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** @const @param bufr_x */
  constructor(bufr_x: Bufr) {
    this.hostTn_$ = new LineTn(this);
    this.bufr = bufr_x;
    //jjjj TOCLEANUP
    // this.resetText_$(text_x);
    //jjjj TOCLEANUP
    // this.invalLidx$();
  }
  //jjjj TOCLEANUP
  // /**
  //  * @headconst @param bufr_x
  //  * @const @param text_x
  //  */
  // static create_$(
  //   bufr_x: Bufr,
  //   text_x?: string,
  // ): { line: Line; data: LineData } {
  //   return {
  //     line: new Line(bufr_x).resetText_$(text_x),
  //     data: Array.sparse(6) as LineData,
  //   };
  // }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @const @param text_x */
  @out((self: Line) => {
    assert(self.text$.length < LoffMAX);
  })
  resetText_$(text_x?: string): this {
    this.text$ = text_x ?? "";

    this.#updateLineLastContTs();
    return this;
  }

  /**
   * @const @param strt_x
   * @const @param stop_x
   * @const @param newt_x
   */
  // @traceOut(_TRACE)
  splice_$(strt_x: loff_t, stop_x: loff_t, newt_x?: string): void {
    // /*#static*/ if (_TRACE) {
    //   console.log([
    //     trace.indent,
    //     `>>>>>>> ${this.class_id}.splice_$( ${strt_x}, ${stop_x}, `,
    //     newt_x === undefined ? "" : `"${newt_x}"`,
    //     " ) >>>>>>>",
    //   ].join(""));
    // }
    /*#static*/ if (INOUT) {
      assert(0 <= strt_x && strt_x <= this.uchrLen);
    }
    if (strt_x === stop_x && !newt_x) {
      return;
    }

    const t_0 = this.text$.slice(0, strt_x);
    const t_1 = this.text$.slice(stop_x);
    this.resetText_$(`${t_0}${newt_x ?? ""}${t_1}`);
  }

  // /**
  //  * @final
  //  * @const @param newt_x
  //  */
  // append_$( newt_x:string )
  // {
  //   if( !newt_x ) return;

  //   this.resetText_$( this.text$.concat(newt_x) );
  // }

  nextLineWith(
    cb_x: (ln_y: Line) => boolean,
    do_x?: (ln_y: Line) => void,
    valve_x = LnumMAX,
  ) {
    // let ln = this.nextLine$;
    // while (ln && !cb_x(ln) && --valve_x) {
    //   do_x?.(ln);

    //   ln = ln.nextLine;
    // }
    // return (ln && cb_x(ln)) ? ln : undefined;
    let ln: Line | undefined = this;
    const VALVE = valve_x;
    while (--valve_x) {
      ln = ln!.nextLine;
      if (!ln) break;
      if (cb_x(ln)) return ln;
      else do_x?.(ln);
    }
    assert(valve_x, `Loop ${VALVE}(±1) times!`);
    return undefined;
  }
  nextNonemptyLine(orCb_x?: (ln_y: Line) => boolean, valve_x = LnumMAX) {
    return this.nextLineWith(
      (ln_y) => !!ln_y.uchrLen || !!orCb_x?.(ln_y),
      //jjjj TOCLEANUP
      // (ln_y) => ln_y.delTSegBdry(),
      undefined,
      valve_x,
    );
  }
  prevLineWith(
    cb_x: (ln_y: Line) => boolean,
    do_x?: (ln_y: Line) => void,
    valve_x = LnumMAX,
  ) {
    // let ln = this.prevLine$;
    // while (ln && !cb_x(ln) && --valve_x) {
    //   do_x?.(ln);

    //   ln = ln.prevLine;
    // }
    // return (ln && cb_x(ln)) ? ln : undefined;
    let ln: Line | undefined = this;
    const VALVE = valve_x;
    while (--valve_x) {
      ln = ln!.prevLine;
      if (!ln) break;
      if (cb_x(ln)) return ln;
      else do_x?.(ln);
    }
    assert(valve_x, `Loop ${VALVE}(±1) times!`);
    return undefined;
  }
  prevNonemptyLine(orCb_x?: (ln_y: Line) => boolean, valve_x = LnumMAX) {
    return this.prevLineWith(
      (ln_y) => !!ln_y.uchrLen || !!orCb_x?.(ln_y),
      //jjjj TOCLEANUP
      // (ln_y) => ln_y.delTSegBdry(),
      undefined,
      valve_x,
    );
  }

  /**
   * @const @param ret_ln_x
   */
  //jjjj TOCLEANUP
  // @out((self: Line, ret: any) => {
  //   //jjjj TOCLEANUP
  //   // assert(ret.linked$);
  //   assert(ret === self.prevLine$);
  //   assert(ret.nextLine$ === self);
  //   if (ret.prevLine$) {
  //     assert(ret === ret.prevLine$.nextLine$);
  //   } else {
  //     assert(ret === self.bufr$!.frstLine_$);
  //   }
  // })
  insPrev_$<L extends Line>(ret_ln_x: L /*jjjj TOCLEANUP , ts_x?: Ts_t */) {
    /*#static*/ if (_TREE) {
      assert(!this.removed /*jjjj TOCLEANUP && this.linked$ */);
      assert(ret_ln_x.bufr === this.bufr);
      //jjjj TOCLEANUP
      // assert(!ret_ln_x.linked$);
    }
    //jjjj TOCLEANUP
    // if (this.prevLine$) {
    //   this.prevLine$.nextLine$ = ret_ln_x;
    //   ret_ln_x.prevLine$ = this.prevLine$;
    // } else {
    //   this.bufr$!.frstLine_$ = ret_ln_x;
    // }

    //jjjj TOCLEANUP
    // ret_ln_x.nextLine$ = this;
    // this.prevLine$ = ret_ln_x;

    //jjjj TOCLEANUP
    // ret_ln_x.linked_$ = true;

    //jjjj TOCLEANUP
    // ret_ln_x.#inval_lidx_selfup();

    if (!this.prevLine) this.bufr.frstLine_$ = ret_ln_x;
    return this.hostTn_$.insPrev(ret_ln_x.hostTn_$).payload as L;
  }
  /**
   * @const @param ret_ln_x
   */
  //jjjj TOCLEANUP
  // @out((self: Line, ret: any) => {
  //   //jjjj TOCLEANUP
  //   // assert(ret.linked$);
  //   assert(ret === self.nextLine$);
  //   assert(ret.prevLine$ === self);
  //   if (ret.nextLine$) {
  //     assert(ret === ret.nextLine$.prevLine$);
  //   } else {
  //     assert(ret === self.bufr$!.lastLine_$);
  //   }
  // })
  insNext_$<L extends Line>(ret_ln_x: L /*jjjj TOCLEANUP , ts_x?: Ts_t */) {
    /*#static*/ if (_TREE) {
      assert(!this.removed /*jjjj TOCLEANUP && this.linked$ */);
      assert(ret_ln_x.bufr === this.bufr);
      //jjjj TOCLEANUP
      // assert(!ret_ln_x.linked$);
    }
    //jjjj TOCLEANUP
    // if (this.nextLine$) {
    //   this.nextLine$.prevLine$ = ret_ln_x;
    //   ret_ln_x.nextLine$ = this.nextLine$;
    // } else {
    //   this.bufr$!.lastLine_$ = ret_ln_x;
    // }

    //jjjj TOCLEANUP
    // ret_ln_x.prevLine$ = this;
    // this.nextLine$ = ret_ln_x;

    //jjjj TOCLEANUP
    // ret_ln_x.linked_$ = true;

    //jjjj TOCLEANUP
    // ret_ln_x.#inval_lidx_selfup();

    if (!this.nextLine) this.bufr.lastLine_$ = ret_ln_x;
    return this.hostTn_$.insNext(ret_ln_x.hostTn_$).payload as L;
  }

  @out((self: Line) => {
    assert(
      self.removed ||
        self === self.bufr.frstLine_$ &&
          self === self.bufr.lastLine_$,
    );
  }, _TREE)
  rmvSelf_$(/*jjjj TOCLEANUP ts_x?: Ts_t */): void {
    /* `frstTSegBy_$?`, `lastTSegBy_$?` could be useful in `Tfmr.lexAdj_$()` even
    after `this.removed`.*/
    // this.delTSegBdryOf();

    if (this.removed) {
      return;
    }
    if (this.bufr.lineN == 1) {
      this.resetText_$("");
      return;
    }

    //jjjj TOCLEANUP
    // this.#inval_lidx_selfup();

    //jjjj TOCLEANUP
    // if (this.nextLine$) {
    //   if (this.prevLine$) {
    //     this.nextLine$.prevLine$ = this.prevLine$;
    //     this.prevLine$.nextLine$ = this.nextLine$;
    //   } else {
    //     /*#static*/ if (INOUT) {
    //       assert(this === this.bufr$!.frstLine_$);
    //     }
    //     this.nextLine$.prevLine$ = undefined;
    //     this.bufr$!.frstLine_$ = this.nextLine$;
    //   }
    // } else {
    //   /*#static*/ if (INOUT) {
    //     assert(this === this.bufr$!.lastLine_$);
    //     assert(this.prevLine$);
    //   }
    //   this.prevLine$!.nextLine$ = undefined;
    //   this.bufr$!.lastLine_$ = this.prevLine$!;
    // }
    // /* `prevLine$`, `lastLine_$` are not modified */
    if (this === this.bufr.frstLine_$) {
      this.bufr.frstLine_$ = this.nextLine!;
    }
    if (this === this.bufr.lastLine_$) {
      this.bufr.lastLine_$ = this.prevLine!;
    }
    this.hostTn_$.rmvSelf();
    //jjjj TOCLEANUP
    // this.linked_$ = false;
    //jjjj TOCLEANUP
    // this.bufr.rmvLine_$(this);
    //jjjj TOCLEANUP
    // this.bufr$ = undefined;

    /* `#frstToken_m`, `#lastToken_m` will be used in `Lexr.lexAdj_$()` */
    // /* Because Lexr<T> could keep using to make `this` unreleasable. */
    // this.#frstToken_m.clear();
    // this.#lastToken_m.clear();
  }

  // /**
  //  * `in( tstrt_x <= tstop_x )`
  //  * @const @param tstop_x
  //  */
  // tmap_$(tstrt_x: loff_t, tstop_x: loff_t) {
  //   const ret: Ranval[] = [];
  //   let tseg = this.frstTSegBy_$;
  //   if (tseg) {
  //     let valve = 100;
  //     do {
  //       if (tseg.strtTLoff <= tstrt_x && tstrt_x < tseg.stopTLoff) {
  //         const rv = new Ranval(
  //           this.lidx_1,
  //           tseg.strtLoff + tstrt_x - tseg.strtTLoff,
  //         );
  //         rv[3] = tseg.stopLoff - Math.max(tseg.stopTLoff - tstop_x, 0);
  //         ret.push(rv);

  //         if (tstop_x <= tseg.stopTLoff) {
  //           break;
  //         } else tstrt_x = tseg.stopTLoff;
  //       }

  //       tseg = tseg.nextTSeg_$;
  //     } while (tseg && tseg !== this.lastTSegBy_$ && --valve);
  //     assert(valve);
  //   }
  //   return ret;
  // }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  get _info_(): string {
    return [
      this.class_id,
      this.removed ? "-" : this.bufr.class_id,
      `prev: ${this.prevLine?.class_id ?? "-"}`,
      `next: ${this.nextLine?.class_id ?? "-"}`,
    ].join(", ");
  }

  /** For testing only */
  toString() {
    const t_ = this.text$.length > 10
      ? this.text$.slice(0, 10) + "..."
      : this.text$;
    return `#${this.id}:|${t_}|`;
  }
}
/*80--------------------------------------------------------------------------*/
