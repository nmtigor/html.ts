/** 80**************************************************************************
 * @module lib/compiling/Bufr
 * @license MIT
 ******************************************************************************/

import type { EdtrBaseScrolr } from "@fe-edt/EdtrBase.ts";
import { _TREE, DEBUG, INOUT } from "../../preNs.ts";
import { Boor, LastCb_i, Moo } from "../Moo.ts";
import type { BufrDir, lnum_t, uint, unum } from "../alias.ts";
import { LnumMAX } from "../alias.ts";
import type { Id_t, Ts_t } from "../alias_v.ts";
import { assert, out } from "../util.ts";
import { SortedIdo } from "../util/SortedSet.ts";
import { Unre } from "../util/Unre.ts";
import * as Is from "../util/is.ts";
import { linesOf } from "../util/string.ts";
import { Line } from "./Line.ts";
import { LineTree } from "./LineTree.ts";
import { Loc } from "./Loc.ts";
import type { Ran } from "./Ran.ts";
import { Ranval } from "./Ranval.ts";
import { Repl, type Replin } from "./Repl.ts";
import { ReplActr } from "./ReplActr.ts";
import type { sig_t } from "./alias.ts";
import { BufrDoState, BufrReplState } from "./alias.ts";
import type { LineData } from "./util.ts";
import { lineBSizeO } from "./util.ts";
/*80--------------------------------------------------------------------------*/

/**
 * A nnon-generic base s.t. many related uses can be non-generic.
 *
//jjjj TOCLEANUP
//  * primaryconst: const exclude `maxValidLidx_$`
 *
 * @using
 */
export class Bufr {
  static #ID = 0 as Id_t;
  readonly id = ++Bufr.#ID as Id_t;
  /** @final */
  get class_id() {
    return `${this.constructor.name}_${this.id}`;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /* dir_mo */
  readonly dir_mo = new Moo<BufrDir>({ val: "ltr", active: true });
  get dir() {
    return this.dir_mo.val;
  }

  readonly #moDir = (n_x: BufrDir): void => {
    // const rv_a = this.eslr_ss.map((edtr_y) =>
    //   (edtr_y as EdtrBaseScrolr).mainCaret.ranval
    // );
    // console.log(rv_a);
    this.refresh_Bufr();
    /* Notice, `invalidate_bcr()` should be called firstly for all `eslr_ss`,
    because setting `mc_.caretrvm![1]` in one `edslr` will impact other `edslr`s
    immediately. */
    this.eslr_ss.forEach((edslr) => (edslr as EdtrBaseScrolr).invalidate_bcr());
    for (let i = this.eslr_ss.length; i--;) {
      const edslr_i = this.eslr_ss.at(i) as EdtrBaseScrolr;
      edslr_i.coo.el.dir = n_x;

      const mc_ = edslr_i.mainCaret;
      if (mc_.shown) {
        // mc_.caretrvm![1].force().val = rv_a[i];
        mc_.caretrvm![1].force().val = mc_.ranval;
      }
    }
  };
  /* ~ */

  readonly lineTree: LineTree;

  /* oldLidx_m_$ */
  /**
   * Possible removed Line could still be useful (e.g. `strtLn_src` in
   * `Lexr.lexAdj_$()`)
   */
  readonly oldLidx_m_$ = new Map</* Line.lastLidx */ lnum_t, LineData>();

  /** Called only by `Repl.#pre()` (in order not to public `oldLidx_m_$`) */
  resetOldLidxM_$(): void {
    this.oldLidx_m_$.clear();

    for (const ran of this.oldRan_a_$) {
      for (
        let i = ran.frstLidx_1, iI = ran.lastLidx_1;
        i <= iI;
        i++
      ) {
        const ln_ = this.line(i);
        ln_.lastLidx = i;
        //jjjj TOCLEANUP
        // this.oldLidx_m_$.set(i, this.line_m$.get(ln_.id)!);
        this.oldLidx_m_$.set(i, ln_.data_$);
      }
    }
  }

  /**
   * `in( this.oldLidx_m_$.has(lidx_x))`
   * @const @param lidx_x
   * @const @param id_x `EdtrBaseScrolr.id`
   * @const @param fb_x
   */
  getOldBSize(lidx_x: lnum_t, id_x: Id_t, fb_x: unum = 0): unum {
    return lineBSizeO(this.oldLidx_m_$.get(lidx_x)!)[id_x] ?? fb_x;
  }
  /* ~ */

  /* line_m$ */
  //jjjj TOCLEANUP
  // protected readonly line_m$ = new Map</* Line */ Id_t, LineData>();

  //jjjj TOCLEANUP
  // /**
  //  * `in( this.line_m$.has(ln_x.id) || ln_x.lastLidx !== undefined)`
  //  * @const @param ln_x
  //  */
  // #lineDataOf(ln_x: Line): LineData | undefined {
  //   return this.line_m$.get(ln_x.id) ?? this.oldLidx_m_$.get(ln_x.lastLidx!);
  // }

  //jjjj TOCLEANUP
  // /** `in( this.#lineDataOf(ln_x))` */
  // lineFrstTkO_$(ln_x: Line) {
  //   return lineFrstTkO(this.#lineDataOf(ln_x)!);
  // }
  // /** `in( this.#lineDataOf(ln_x))` */
  // lineLastTkO_$(ln_x: Line) {
  //   return lineLastTkO(this.#lineDataOf(ln_x)!);
  // }

  // /** `in( this.#lineDataOf(ln_x))` */
  // lineFrstTSegO_$(ln_x: Line) {
  //   return lineFrstTSegO(this.#lineDataOf(ln_x)!);
  // }
  // /** `in( this.#lineDataOf(ln_x))` */
  // lineLastTSegO_$(ln_x: Line) {
  //   return lineLastTSegO(this.#lineDataOf(ln_x)!);
  // }

  //jjjj TOCLEANUP
  // clearLineFrstTSeg_$(ln_x: Line) {
  //   clearLineFrstTSeg(this.#lineDataOf(ln_x));
  // }
  // clearLineLastTSeg_$(ln_x: Line) {
  //   clearLineLastTSeg(this.#lineDataOf(ln_x));
  // }

  //jjjj TOCLEANUP
  // /**
  //  * `in( this.#lineDataOf(ln_x))`
  //  * @const @param ln_x
  //  * @const @param id_x `EdtrBaseScrolr.id`
  //  * @const @param bsize_x
  //  */
  // setLineBSize_$(ln_x: Line, id_x: Id_t, bsize_x: unum): void {
  //   lineBSizeO(this.#lineDataOf(ln_x)!)[id_x] = bsize_x;
  // }
  //jjjj TOCLEANUP
  // /**
  //  * `in( this.#lineDataOf(ln_x))`
  //  * @const @param ln_x
  //  * @const @param id_x `EdtrBaseScrolr.id`
  //  * @const @param bstrt_x
  //  */
  // setLineBStrt(ln_x: Line, id_x: Id_t, bstrt_x: unum): void {
  //   (lineBSizeO(
  //     this.#lineDataOf(ln_x)!,
  //   )[id_x] ??= [undefined, undefined])[0] = bstrt_x;
  // }
  //jjjj TOCLEANUP
  // /**
  //  * `in( this.#lineDataOf(ln_x))`
  //  * @const @param ln_x
  //  * @const @param id_x `EdtrBaseScrolr.id`
  //  */
  // getLineBSize_$(ln_x: Line, id_x: Id_t): unum | undefined {
  //   return lineBSizeO(this.#lineDataOf(ln_x)!)[id_x];
  // }
  //jjjj TOCLEANUP
  // /**
  //  * `in( this.#lineDataOf(ln_x))`
  //  * @const @param ln_x
  //  * @const @param id_x `EdtrBaseScrolr.id`
  //  */
  // getLineBStrt(ln_x: Line, id_x: Id_t): unum | undefined {
  //   return lineBSizeO(this.#lineDataOf(ln_x)!)[id_x]?.[0];
  // }

  //jjjj TOCLEANUP
  // /**
  //  * `in( this.#lineDataOf( this.line(lidx_x)))`
  //  * @const @param lidx_x
  //  * @const @param id_x `EdtrBaseScrolr.id`
  //  */
  // getLineFsrecA(lidx_x: lnum_t, id_x: Id_t): FSRec[] {
  //   const ln_ = this.line(lidx_x);
  //   return lineFsrecaO(this.#lineDataOf(ln_)!)[id_x] ??= [];
  // }

  //jjjj TOCLEANUP
  // /** Called only by `Line.rmvSelf_$()` (in order not to public `line_m$`) */
  // rmvLine_$(ln_x: Line): void {
  //   //jjjj TOCLEANUP
  //   // const ld_ = this.line_m$.get(ln_x.id);
  //   // if (ld_) {
  //   //   this.line_m$.delete(ln_x.id);
  //   //   this.oldLidx_m_$.set(ln_x.id, ld_);
  //   // }
  //   this.line_m$.delete(ln_x.id);
  // }
  //jjjj TOCLEANUP
  // /** Called only by `Line.removed()` (in order not to public `line_m$`) */
  // hasLine_$(ln_x: Line): boolean {
  //   return this.line_m$.has(ln_x.id);
  // }
  /* ~ */

  /** @final */
  get lineN(): lnum_t {
    //jjjj TOCLEANUP
    // return this.lineN_$;
    return this.lineTree.size_1;
  }
  /**
   * @final
   * @const @param id_x `EdtrBaseScrolr.id`
   * @const @param fb_x
   */
  bsizeOn(id_x: Id_t, fb_x: unum): unum {
    return this.lineTree.bsizeOn_$(id_x, fb_x);
  }

  frstLine_$: Line;
  get frstLine() {
    return this.frstLine_$;
  }
  lastLine_$: Line;
  get lastLine() {
    return this.lastLine_$;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /* modified */
  readonly modified_br_Bufr = new Boor();
  get modified() {
    return this.modified_br_Bufr.val;
  }
  /**
   * Also update `bufrLastCont_ts` if `modified_x`
   * @const @param modified_x
   */
  set modified(modified_x: boolean) {
    this.modified_br_Bufr.val = modified_x;

    if (modified_x) {
      this.#updateBufrLastContTs();
    } else {
      this.#repl_saved = this.#lastRepl;
    }
  }

  #lastRepl: Repl | undefined;
  #repl_saved: Repl | undefined;
  /* ~ */

  //jjjj TOCLEANUP
  // oldRan_$ = new RanMoo(); /** @member */
  // newRan_$ = new RanMoo(); /** @member */
  /**
   * Disjoint and in order
   * @using
   */
  readonly oldRan_a_$: Ran[] = [];
  get oldRan_a() {
    return this.oldRan_a_$;
  }
  /**
   * Disjoint and in order
   * @using
   */
  readonly newRan_a_$: Ran[] = [];
  get newRan_a() {
    return this.newRan_a_$;
  }
  // dtLineN_$ = 0;
  // get dtLn() {
  //   return this.dtLineN_$;
  // }

  #doState = BufrDoState.idle;
  get doState() {
    return this.#doState;
  }

  /* #doq */
  #doq = new Unre<Repl>(/*#static*/ DEBUG ? 10 : 200);

  readonly canUndo_mo = new Moo({ val: false });
  readonly canRedo_mo = new Moo({ val: false });

  #updateDoCap() {
    this.canUndo_mo.val = this.#doq.canGetUn();
    this.canRedo_mo.val = this.#doq.canGetRe();
  }
  /* ~ */

  /* repl_mo */
  readonly repl_mo = new Moo({ val: BufrReplState.idle });

  readonly #moRepl = (n_x: BufrReplState): void => this.repl_actr.to(n_x);

  //jjjj TOCLEANUP
  // #onReplStateChange:
  //   | ((newval: BufrReplState, oldval: BufrReplState) => void)
  //   | undefined;
  // set onReplStateChange(
  //   _x: ((newval: BufrReplState, oldval: BufrReplState) => void) | undefined,
  // ) {
  //   if (_x === this.#onReplStateChange) return;

  //   if (this.#onReplStateChange) {
  //     this.repl_mo.removeHandler(this.#onReplStateChange);
  //   }
  //   if (_x) {
  //     this.repl_mo.registHandler(_x);
  //   }
  //   this.#onReplStateChange = _x;
  // }
  /* ~ */

  readonly repl_actr = new ReplActr(this);
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /* bufrLastCont_ts */
  #bufrLastCont_ts = Date.now_1();
  /**
   * last content timestamp
   * @final
   */
  get bufrLastCont_ts() {
    return this.#bufrLastCont_ts;
  }
  #updateBufrLastContTs(): Ts_t {
    return this.#bufrLastCont_ts = Date.now_1() as Ts_t;
  }
  /* ~ */

  /* #sigPool */
  #sigPool: sig_t = 0x7fff_ffff;
  getSig(): sig_t {
    /*#static*/ if (INOUT) {
      assert(this.#sigPool);
    }
    let ret = 1;

    const VALVE = 30;
    let valve = VALVE;
    while (!(ret & this.#sigPool) && --valve) ret <<= 1;
    assert(valve, `Loop ${VALVE}(±1) times!`);

    this.#sigPool &= ~ret;
    // console.log(`0x${this.#sigPool.toString(16)}`);
    // console.log(`0x${ret.toString(16)}`);
    /*#static*/ if (INOUT) {
      assert(ret);
    }
    return ret;
  }
  /** @const @param sig_x */
  resSig(sig_x: sig_t) {
    this.#sigPool |= sig_x;
  }
  /* ~ */

  /* eslr_ss */
  readonly eslr_ss = new SortedIdo();
  readonly #moEdtrActiv = (
    n_x: boolean,
    _o_x: unknown,
    _d_x: unknown,
    i_x: EdtrBaseScrolr | undefined,
  ) => {
    if (n_x) this.#curEdtrId = i_x!.id;
    else if (this.#curEdtrId === i_x!.id) this.#curEdtrId = 0 as Id_t;
  };
  addEslr(_x: EdtrBaseScrolr) {
    this.eslr_ss.add(_x);
    _x.edtrActiv_mo.registHandler(this.#moEdtrActiv);
  }
  rmvEslr(_x: EdtrBaseScrolr) {
    this.eslr_ss.rmv(_x);
    _x.eslrActiv = false; //!
    _x.edtrActiv_mo.removeHandler(this.#moEdtrActiv);

    _x.reset_EdtrBaseScrolr(); //!
  }

  #curEdtrId = 0 as Id_t;
  get curEdtrId() {
    return this.#curEdtrId;
  }
  /* ~ */
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  #filehandle;
  get filehandle() {
    return this.#filehandle;
  }

  /**
   * @const @param text_x
   * @const @param dir_x
   * @headconst @param fh_x
   */
  constructor(
    text_x?: string | undefined,
    dir_x = "ltr" as BufrDir,
    fh_x?: FileSystemFileHandle,
  ) {
    this.dir_mo.set_Moo(dir_x)
      .registHandler(this.#moDir, { i: LastCb_i });

    this.frstLine_$ = this.createLine();
    this.lineTree = new LineTree(this.frstLine_$);
    //jjjj TOCLEANUP
    // this.frstLine_$.linked_$ = true;
    this.lastLine_$ = this.frstLine_$;
    if (text_x) this.setLines(text_x);

    this.repl_mo.registHandler(this.#moRepl);

    this.#filehandle = fh_x;

    // // #if DEBUG && !AUTOTEST
    //   reportBuf( text_a );
    // // #endif
    /*#static*/ if (INOUT) {
      //jjjj TOCLEANUP
      // assert(this.lineN_$ >= 1);
      assert(this.frstLine_$.bufr === this);
      assert(this.lastLine_$.bufr === this);
    }
  }

  @out((self: Bufr) => {
    //jjjj TOCLEANUP
    // assert(self.lineN_$ >= 1);
    assert(self.frstLine_$.bufr === self);
    assert(self.lastLine_$.bufr === self);
  })
  reset_Bufr(): this {
    this.dir_mo.reset_Moo()
      .registHandler(this.#moDir, { i: LastCb_i });

    //jjjj TOCLEANUP
    // let ln_: Line | undefined = this.lastLine;
    // const VALVE = LnumMAX;
    // let valve = VALVE;
    // while (ln_ && ln_ !== this.frstLine_$ && --valve) {
    //   const ln_1: Line | undefined = ln_.prevLine;
    //   ln_.rmvSelf_$();
    //   ln_ = ln_1;
    // }
    // assert(valve, `Loop ${VALVE}(±1) times!`);
    // ln_!.rmvSelf_$();
    if (this.lineN > 1) this.rmvLines(1);
    this.frstLine_$.resetText_$();

    this.modified_br_Bufr.reset_Boor();
    this.#lastRepl = this.#repl_saved = undefined;

    for (const ran of this.oldRan_a_$) ran.rev();
    for (const ran of this.newRan_a_$) ran.rev();

    this.#doState = BufrDoState.idle;
    this.#doq.reset_Unre();
    this.canUndo_mo.reset_Moo();
    this.canRedo_mo.reset_Moo();

    this.repl_mo.reset_Moo()
      .registHandler(this.#moRepl);
    //jjjj TOCLEANUP
    // this.#onReplStateChange = undefined;
    this.repl_actr.fina();

    this.#updateBufrLastContTs();

    /*#static*/ if (DEBUG) {
      assert(this.#sigPool === 0x7fff_ffff); //kkkk
      assert(this.eslr_ss.length === 0); //kkkk
    }
    return this;
  }

  [Symbol.dispose]() {
    this.reset_Bufr();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @const @param text_x */
  setLines(text_x?: string | string[]): this {
    /*#static*/ if (INOUT) {
      assert(this.lineN === 1);
    }
    const txt_a = Is.array(text_x) ? text_x : text_x ? linesOf(text_x) : [""];
    this.frstLine_$.resetText_$(txt_a[0]);

    let ln_ = this.frstLine_$;
    for (let i = 1, iI = txt_a.length; i < iI; ++i) {
      ln_ = ln_.insNext_$(this.createLine(txt_a[i]));
    }
    /*#static*/ if (INOUT) {
      assert(ln_ === this.lastLine_$);
    }
    return this;
  }

  /** @const @param text_x */
  createLine(text_x?: string): Line {
    // const { line, data } = Line.create_$(this, text_x);
    // this.line_m$.set(line.id, data);
    // return line;
    return new Line(this).resetText_$(text_x);
  }

  /**
   * @const @param strtLidx_x
   * @const @param stopLidx_x
   */
  rmvLines(strtLidx_x: lnum_t, stopLidx_x = this.lineN): void {
    /*#static*/ if (_TREE) {
      assert(strtLidx_x < stopLidx_x);
      assert(stopLidx_x - strtLidx_x < this.lineN);
    }
    if (strtLidx_x === 0) {
      this.frstLine_$ = this.line(stopLidx_x);
    } else if (stopLidx_x === this.lineN) {
      this.lastLine_$ = this.line(strtLidx_x - 1);
    }
    this.lineTree.rmv(strtLidx_x, stopLidx_x);
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** @const @param lidx_x */
  //jjjj TOCLEANUP
  // @out((_, ret) => {
  //   assert(ret);
  // })
  line(lidx_x: lnum_t): Line {
    //jjjj TOCLEANUP
    // if (lidx_x >= this.lineN) return this.lastLine;

    // let ret;
    // if (lidx_x < this.lineN * 2 / 3) {
    //   ret = this.frstLine;
    //   while (ret) {
    //     if (ret.lidx_1 === lidx_x) break;
    //     ret = ret.nextLine;
    //   }
    // } else {
    //   ret = this.lastLine;
    //   while (ret) {
    //     if (ret.lidx_1 === lidx_x) break;
    //     ret = ret.prevLine;
    //   }
    // }
    // return ret!;
    /* ~ */

    return this.lineTree.get(lidx_x).payload;
  }

  frstLineWith(cb_x: (ln_y: Line) => boolean, valve_x = LnumMAX) {
    // let ln_ = this.frstLine_$;
    // while (!cb_x(ln_) && ln_.nextLine && --valve_x) {
    //   ln_ = ln_.nextLine;
    // }
    // return cb_x(ln_) ? ln_ : undefined;
    let ln_: Line | undefined;
    const VALVE = valve_x;
    while (--valve_x) {
      if (ln_) ln_ = ln_.nextLine;
      else ln_ = this.frstLine_$;
      if (!ln_) break;
      if (cb_x(ln_)) return ln_;
    }
    assert(valve_x, `Loop ${VALVE}(±1) times!`);
    return undefined;
  }
  frstNonemptyLine(valve_x = LnumMAX) {
    return this.frstLineWith((ln_y) => !!ln_y.uchrLen, valve_x);
  }
  lastLineWith(cb_x: (ln_y: Line) => boolean, valve_x = LnumMAX) {
    // let ln_ = this.lastLine_$;
    // while (!cb_x(ln_) && ln_.prevLine && --valve_x) {
    //   ln_ = ln_.prevLine;
    // }
    // return cb_x(ln_) ? ln_ : undefined;
    const VALVE = valve_x;
    let ln_: Line | undefined;
    while (--valve_x) {
      if (ln_) ln_ = ln_.prevLine;
      else ln_ = this.lastLine_$;
      if (!ln_) break;
      if (cb_x(ln_)) return ln_;
    }
    assert(valve_x, `Loop ${VALVE}(±1) times!`);
    return undefined;
  }
  lastNonemptyLine(valve_x = LnumMAX) {
    return this.lastLineWith((ln_y) => !!ln_y.uchrLen, valve_x);
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  #focusLoc: Loc | undefined;
  /**
   * Set or assign `#focusLoc`\
   * `retRv_x.anchrLidx`, `retRv_x.anchrLoff` will not change.
   * @headconst @param retRv_x
   */
  correctRvFocus(retRv_x: Ranval): Ranval {
    if (this.#focusLoc) {
      this.#focusLoc.set_Loc_O(retRv_x.focusLidx, retRv_x.focusLoff, this);
    } else {
      this.#focusLoc = Loc.create(
        this,
        retRv_x.focusLidx,
        retRv_x.focusLoff,
      );
    }
    retRv_x.setFocus(this.#focusLoc.line.lidx_1, this.#focusLoc.correctLoff());
    return retRv_x;
  }
  /**
   * Set or assign `#focusLoc`
   * @out @param rv_x `focusLidx`, `focusLoff` will be corrected
   * @borrow @return `#focusLoc`,
   *    so suggest to `.usingDup()` it to prevent being affected by further
   *    calls of `focusLoc()`.
   */
  focusLoc(rv_x: Ranval): Loc {
    this.correctRvFocus(rv_x);
    return this.#focusLoc!;
  }

  #anchrLoc: Loc | undefined;
  /**
   * Set or assign `#anchrLoc`
   * `retRv_x.focusLidx`, `retRv_x.focusLoff` will not change.
   * @headconst @param retRv_x
   */
  correctRvAnchr(retRv_x: Ranval): Ranval {
    if (this.#anchrLoc) {
      this.#anchrLoc.set_Loc_O(retRv_x.anchrLidx, retRv_x.anchrLoff, this);
    } else {
      this.#anchrLoc = Loc.create(
        this,
        retRv_x.anchrLidx,
        retRv_x.anchrLoff,
      );
    }
    retRv_x.setAnchr(this.#anchrLoc.line.lidx_1, this.#anchrLoc.correctLoff());
    return retRv_x;
  }
  /**
   * Set or assign `#anchrLoc`
   * @out @param rv_x `anchrLidx`, `anchrLoff` will be corrected
   * @borrow @return `#anchrLoc`,
   *    so suggest to `.usingDup()` it to prevent being affected by further
   *    calls of `anchrLoc()`.
   */
  anchrLoc(rv_x: Ranval): Loc {
    this.correctRvAnchr(rv_x);
    return this.#anchrLoc!;
  }

  /**
   * Set or assign `#focusLoc`, `#anchrLoc`
   * @final
   * @headconst @param retRv_x
   */
  correctRv(retRv_x: Ranval): Ranval {
    this.correctRvFocus(retRv_x);
    this.correctRvAnchr(retRv_x);
    return retRv_x;
  }

  /**
   * @final
   * @const @param szMAX_x
   */
  @out((_, ret) => {
    assert(ret.length);
  })
  getTextA(szMAX_x?: uint): string[] {
    const ret: string[] = [];

    let sz = 0;
    let ln: Line | undefined = this.frstLine;
    const VALVE = LnumMAX;
    let valve = VALVE;
    while (ln && --valve) {
      ret.push(ln.text);
      sz += ln.uchrLen;
      if (szMAX_x !== undefined && sz > szMAX_x) {
        ret.push("...");
        break;
      }
      ln = ln.nextLine;
    }
    assert(valve, `Loop ${VALVE}(±1) times!`);

    return ret;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @move @const @param replin_x
   *    If `Replin[]`, `.rv`s MUST be disjoint!.
   */
  Do(replin_x: Replin | Replin[]): void {
    const doState_save = this.#doState;
    this.#doState = BufrDoState.doing;
    // this.#curEdtrId = edtrId_x;

    // console.log({ replin_x });
    this.#lastRepl = new Repl(this, replin_x);
    this.#lastRepl.replFRun();
    this.modified = true;

    this.#doq.add(this.#lastRepl);
    // console.log(this.#doq._repr_);
    this.#updateDoCap();

    // this.#curEdtrId = 0 as Id_t;
    this.#doState = doState_save;
  }

  /**
   * To trigger `repl_mo`s callbacks
   * @const @param text_x If `string[]`, it is responsible for line break。
   * @const @param doq_x
   */
  refresh_Bufr(text_x?: string | string[], doq_x?: "doq"): void {
    const doState_save = this.#doState;
    this.#doState = BufrDoState.doing;

    const replin = {
      rv: new Ranval(
        0,
        0,
        this.lastLine_$.lidx_1,
        this.lastLine_$.uchrLen,
      ),
      txt: text_x ?? this.getTextA(),
    };
    // console.log({ replin });
    const repl = new Repl(this, replin);
    repl.replFRun();
    if (doq_x) {
      this.#lastRepl = repl;
      this.modified = true;

      this.#doq.add(repl);
      this.#updateDoCap();
    }

    this.#doState = doState_save;
  }

  /** @headconst @param repl_x */
  doqOnly(repl_x: Repl): void {
    const doState_save = this.#doState;
    this.#doState = BufrDoState.doing;

    this.#lastRepl = repl_x;
    this.modified = true;

    this.#doq.add(repl_x);
    this.#updateDoCap();

    this.#doState = doState_save;
  }

  // /** @const @param edtrId_x */
  undo(): boolean {
    const ret = this.#doq.canGetUn();
    if (ret) {
      const doState_save = this.#doState;
      this.#doState = BufrDoState.undoing;
      // this.#curEdtrId = edtrId_x;

      // this.#doq.getUn().replBRun();
      // this.#updateDoCap();
      // this.#lastRepl = this.#doq.tryGetUn(); //!
      this.#lastRepl = this.#doq.getUn();
      this.#lastRepl.replBRun();
      this.modified = this.#lastRepl !== this.#repl_saved;

      this.#updateDoCap();

      // this.#curEdtrId = 0 as Id_t;
      this.#doState = doState_save;
    }
    return ret;
  }
  // /** @const @param edtrId_x */
  redo(): boolean {
    const ret = this.#doq.canGetRe();
    if (ret) {
      const doState_save = this.#doState;
      this.#doState = BufrDoState.redoing;
      // this.#curEdtrId = edtrId_x;

      this.#lastRepl = this.#doq.getRe();
      this.#lastRepl.replFRun();
      this.modified = this.#lastRepl !== this.#repl_saved;

      this.#updateDoCap();

      // this.#curEdtrId = 0 as Id_t;
      this.#doState = doState_save;
    }
    return ret;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // get _lineIds_() {
  //   const lineId_a: Id_t[] = [];

  //   let line = this.frstLine;
  //   let valve = 1000;
  //   do {
  //     lineId_a.push(line.id);
  //     line = line.nextLine!;
  //   } while (line && --valve);
  //   assert(valve);

  //   return `[#${lineId_a.join(", ")}]`;
  // }
}
/*80--------------------------------------------------------------------------*/
