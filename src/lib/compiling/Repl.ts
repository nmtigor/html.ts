/** 80**************************************************************************
 * @module lib/compiling/Repl
 * @license MIT
 ******************************************************************************/

import { _TRACE, DEBUG, INOUT } from "../../preNs.ts";
import { LnumMAX } from "../alias.ts";
import type { Id_t } from "../alias_v.ts";
import { assert, fail } from "../util.ts";
import * as Is from "../util/is.ts";
import type { Cf } from "../util/SortedSet.ts";
import { SortedSet } from "../util/SortedSet.ts";
import { linesOf } from "../util/string.ts";
import { trace, traceOut } from "../util/trace.ts";
import { BufrReplState } from "./alias.ts";
import type { Bufr } from "./Bufr.ts";
import { Line } from "./Line.ts";
import { Ran } from "./Ran.ts";
import { Ranval } from "./Ranval.ts";
/*80--------------------------------------------------------------------------*/

export type Replin = {
  rv: Ranval;
  /** If `string[]`, it is responsible for line break。 */
  txt: string | string[];
};

class SortedReplin_ extends SortedSet<Replin> {
  static #less: Cf<Replin> = (a_y, b_y) =>
    Ranval.posSE(a_y.rv[2], a_y.rv[3], b_y.rv[2], b_y.rv[3]);

  constructor(val_a_x?: Replin[]) {
    super(SortedReplin_.#less, val_a_x);
    this.resort();
  }
}
/*64----------------------------------------------------------*/

/** @final */
export class Repl {
  static #ID = 0 as Id_t;
  readonly id = ++Repl.#ID as Id_t;
  /** @final */
  get class_id() {
    return `${this.constructor.name}_${this.id}`;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  readonly #bufr: Bufr;

  /** array of ran */
  readonly aoa;

  readonly #ranval_a: Ranval[] | undefined;
  get _ranval_a_(): Ranval[] {
    return this.#ranval_a!;
  }
  readonly #ranval: Ranval | undefined;
  get _ranval_() {
    return this.#ranval!;
  }

  readonly #ranval_rev_a: Ranval[] | undefined;
  get _ranval_rev_a_(): Ranval[] {
    return this.#ranval_rev_a!;
  }
  readonly #ranval_rev: Ranval | undefined;
  get _ranval_rev(): Ranval {
    return this.#ranval_rev!;
  }

  #text_a2: string[][] | undefined;
  get _text_a2_(): string[][] {
    return this.#text_a2!;
  }
  #text_a: string[] | undefined;
  get _text_a_(): string[] {
    return this.#text_a!;
  }

  readonly #replText_a2: string[][] | undefined;
  get _replText_a2_(): string[][] {
    return this.#replText_a2!;
  }
  readonly #replText_a: string[] | undefined;
  get _replText_a_(): string[] {
    return this.#replText_a!;
  }

  /** for composition */
  #replText_a2_0: string[][] | undefined;
  /** for composition */
  #replText_a_0: string[] | undefined;

  /** Helper */
  readonly #tmpRan;

  //jjjj TOCLEANUP
  // #ts = 0 as Ts_t;

  /**
   * Use `Ranval` not `Ran` directly because `Ran` can be invalid
   * after `undo()` / `redo()`.
   * @headconst @param bufr_x
   * @move @headconst @param replin_x if `this` will not be abandoned
   *    immediately after `replFRun()` (e.g. queued in `Bufr.#doq`).\
   *    If `Replin[]`, `.rv`s MUST be disjoint!.
   */
  constructor(bufr_x: Bufr, replin_x: Replin | Replin[]) {
    this.#bufr = bufr_x;
    if (Is.array(replin_x)) {
      this.aoa = true;
      const LEN = replin_x.length;
      this.#ranval_a = new Array(LEN);
      this.#text_a2 = new Array(LEN);
      new SortedReplin_(replin_x).forEach((e_y, i_y) => {
        this.#ranval_a![i_y] = e_y.rv;
        this.#text_a2![i_y] = Is.array(e_y.txt) ? e_y.txt : linesOf(e_y.txt);
      });
      this.#ranval_rev_a = Array.from({ length: LEN }, () => new Ranval(0, 0));
      this.#replText_a2 = Array.from({ length: LEN }, () => []);
    } else {
      this.aoa = false;
      this.#ranval = replin_x.rv;
      this.#text_a = Is.array(replin_x.txt)
        ? replin_x.txt as string[]
        : linesOf(replin_x.txt);
      this.#ranval_rev = new Ranval(0, 0);
      this.#replText_a = [];
    }
    this.#tmpRan = Ran.create(this.#bufr);
  }

  /**
   * `inRan_x`(src) -> `outTxt_a_x`
   * `inTxt_a_x`(tgt) -> `outRan_x`
   * @headconst @param inRan_x
   * @const @param inTxt_a_x
   * @out @param outRan_x range of inTxt_a_x
   * @out @param outTxt_a_x texts of inRan_x
   */
  #repl(
    inRan_x: Ran,
    inTxt_a_x: string[],
    outRan_x: Ran,
    outTxt_a_x: string[],
  ) {
    // console.log(this.#bufr.lineTree._treRepr_);
    let srcLn: Line | undefined = inRan_x.frstLine;
    const strtLidx = srcLn.lastLidx!;
    const srcLastLn = inRan_x.lastLine;
    /*#static*/ if (INOUT) {
      assert(!srcLastLn.removed);
    }
    const srcStrtLoff = inRan_x.strtLoff;
    const srcStopLoff = inRan_x.stopLoff;
    let i_ = 0;
    if (inTxt_a_x.length === 0) inTxt_a_x.push("");
    const tgtN = inTxt_a_x.length;
    outTxt_a_x.length = inRan_x.lineN_1;
    const srcOneLn = outTxt_a_x.length === 1;

    const VALVE = LnumMAX;
    let valve = VALVE;
    while (srcLn && srcLn !== srcLastLn && --valve) {
      if (i_ === 0) {
        outTxt_a_x[0] = srcLn.text.slice(srcStrtLoff);
        srcLn.splice_$(srcStrtLoff, srcLn.uchrLen, inTxt_a_x[0]);
      } else if (i_ < tgtN) {
        outTxt_a_x[i_] = srcLn.text;
        srcLn.resetText_$(inTxt_a_x[i_]);
      } else break;

      srcLn = srcLn.nextLine;
      i_++;
    }
    assert(valve, `Loop ${VALVE}(±1) times!`);
    /*#static*/ if (INOUT) {
      assert(srcLn);
    }

    const bufr = this.#bufr;
    const srcTxt_1 = srcLastLn.text;
    let srcFrstLn = inRan_x.frstLine;
    if (i_ === tgtN) {
      //jjjj TOCLEANUP
      // while (srcLn && srcLn !== srcLastLn && --valve) {
      //   outTxt_a_x[i_++] = srcLn.text;

      //   const ln_ = srcLn.nextLine;
      //   srcLn.rmvSelf_$();
      //   srcLn = ln_;
      // }
      // assert(valve, `Loop ${VALVE}(±1) times!`);
      // /*#static*/ if (INOUT) {
      //   assert(srcLn);
      // }
      const i_0 = i_;
      const i_1 = srcLastLn.lastLidx! - strtLidx;
      if (i_0 < i_1) {
        for (; i_ < i_1; i_++) {
          outTxt_a_x[i_] = bufr.line(strtLidx + i_).text;
        }
        bufr.rmvLines(strtLidx + i_0, strtLidx + i_1);
      }

      /*#static*/ if (INOUT) {
        assert(i_ === outTxt_a_x.length - 1);
      }
      outTxt_a_x[i_] = srcTxt_1.slice(0, srcStopLoff);

      /*#static*/ if (INOUT) {
        assert(srcLastLn.prevLine);
      }
      // outRan_x.stopLoc.set( srcLastLn.prevLine, srcLastLn.prevLine.uchrLen );
      // srcLastLn.prevLine.append_$( srcTxt_1.slice(srcStopLoff) );
      // srcLastLn.rmvSelf_$();
      srcLastLn.splice_$(0, srcStopLoff, srcLastLn.prevLine!.text);
      outRan_x.stopLoc.set_Loc(srcLastLn, srcLastLn.prevLine!.uchrLen);
      if (srcLastLn.prevLine === srcFrstLn) srcFrstLn = srcLastLn; //!
      srcLastLn.prevLine!.rmvSelf_$();
    } else if (srcLn === srcLastLn) {
      /*#static*/ if (INOUT) {
        assert(i_ === outTxt_a_x.length - 1);
      }
      outTxt_a_x[i_] = srcTxt_1.slice(srcOneLn ? srcStrtLoff : 0, srcStopLoff);

      if (tgtN === 1) {
        /*#static*/ if (INOUT) {
          assert(srcOneLn && i_ === 0);
        }
        srcLastLn.splice_$(srcStrtLoff, srcStopLoff, inTxt_a_x[0]);

        // srcFrstLn = srcLastLn;
        outRan_x.stopLoc.set_Loc(srcLastLn, srcStrtLoff + inTxt_a_x[0].length);
      } else {
        if (i_ < tgtN - 1) {
          if (srcOneLn) {
            srcFrstLn = srcLastLn.insPrev_$(
              bufr.createLine(
                `${srcTxt_1.slice(0, srcStrtLoff)}${inTxt_a_x[i_]}`,
              ),
            );
          } else {
            srcLastLn.insPrev_$(bufr.createLine(inTxt_a_x[i_]));
          }
          i_++;
          for (; i_ < tgtN - 1; i_++) {
            srcLastLn.insPrev_$(bufr.createLine(inTxt_a_x[i_]));
          }
        }
        /*#static*/ if (INOUT) {
          assert(i_ === tgtN - 1);
        }
        srcLastLn.splice_$(0, srcStopLoff, inTxt_a_x[i_]);

        outRan_x.stopLoc.set_Loc(srcLastLn, inTxt_a_x[i_].length);
      }
    } else {
      /*#static*/ DEBUG ? fail("Should not run here!") : {};
    }
    outRan_x.strtLoc.set_Loc(srcFrstLn, srcStrtLoff);

    /*#static*/ if (INOUT) {
      assert(srcLastLn === outRan_x.lastLine);
    }
    // console.log(this.#bufr.lineTree._treRepr_);
  }

  /** @const @param inRv_x */
  #pre(inRv_x: Ranval | Ranval[]): Ran[] {
    // console.log(`inRv_x = ${inRv_x.toString()}`);
    // console.log(inTxt_a_x);
    const inRan_a = this.#bufr.oldRan_a_$;
    for (const ran of inRan_a) ran.rev();

    if (this.aoa) {
      inRan_a.length = (inRv_x as Ranval[]).length;

      for (let i = (inRv_x as Ranval[]).length; i--;) {
        inRan_a[i] = this.#tmpRan.usingDup()
          .setByRanval((inRv_x as Ranval[])[i]);
        inRan_a[i].syncRanval_$(); //!
        /*#static*/ if (INOUT) {
          if (inRan_a.at(i + 1)) inRan_a[i].posS(inRan_a[i + 1]);
        }
      }
    } else {
      inRan_a.length = 1;

      inRan_a[0] = this.#tmpRan.usingDup().setByRanval(inRv_x as Ranval);
      inRan_a[0].syncRanval_$(); //!
      // const lnN_inRan = inRan.lineN_1;
    }

    //jjjj TOCLEANUP
    // this.#ts = Date.now() as Ts_t;
    this.#bufr.resetOldLidxM_$();
    return inRan_a;
  }

  /**
   * @headconst @param inRan_a
   * @const @param inTxt_a_x
   * @out @param outRv_x range of inTxt_a_x
   * @out @param outTxt_a_x texts of inRv_x
   */
  #impl(
    inRan_a: Ran[],
    inTxt_a_x: string[] | string[][],
    outRv_x: Ranval | Ranval[],
    outTxt_a_x: string[] | string[][],
  ): void {
    const outRan_a = this.#bufr.newRan_a_$;
    for (const ran of outRan_a) ran.rev();
    outRan_a.length = inRan_a.length;

    if (this.aoa) {
      let tailToNext = false;
      for (let i = inRan_a.length; i--;) {
        const prevToHead = i > 0 &&
          inRan_a[i - 1].lastLine === inRan_a[i].frstLine;
        this.#repl(
          inRan_a[i],
          (inTxt_a_x as string[][])[i],
          this.#tmpRan,
          (outTxt_a_x as string[][])[i],
        );
        if (tailToNext) {
          const next = outRan_a[i + 1];
          const dt_ = this.#tmpRan.stopLoff - inRan_a[i].stopLoff;
          next.strtLoc.loff += dt_;
          if (next.frstLine === next.lastLine) {
            next.stopLoc.loff += dt_;
          }
          tailToNext = false;
        }
        if (prevToHead) {
          const prev = inRan_a[i - 1];
          if (prev.frstLine === prev.lastLine) {
            prev.stopLoc.line_$ = prev.strtLoc.line_$ = this.#tmpRan.frstLine;
          } else {
            prev.stopLoc.line_$ = this.#tmpRan.frstLine;
          }
          tailToNext = prevToHead;
        }
        outRan_a[i] = this.#tmpRan.usingDup();
      }
    } else {
      this.#repl(
        inRan_a[0],
        inTxt_a_x as string[],
        this.#tmpRan,
        outTxt_a_x as string[],
      );
      // // #if _TRACE
      //   console.log( `outRv_x=${outRv_x.toString()}` );
      //   console.log( outTxt_a_x );
      // // #endif
      outRan_a[0] = this.#tmpRan.usingDup();
      // this.#bufr.dtLineN_$ = this.#bufr.newRan_$.lineN_1 - lnN_inRan;
    }

    if (this.aoa) {
      for (let i = outRan_a.length; i--;) {
        outRan_a[i].toRanval((outRv_x as Ranval[])[i]);
        outRan_a[i].syncRanval_$(); //!
      }
    } else {
      outRan_a[0].toRanval(outRv_x as Ranval);
      outRan_a[0].syncRanval_$(); //!
    }
  }

  /**
   * Same as `_impl_cb()` without triggering `repl_mo` callbacks
   * @const @param inRv_x
   * @const @param inTxt_a_x
   * @out @param outRv_x range of inTxt_a_x
   * @out @param outTxt_a_x texts of inRv_x
   */
  _test_(
    inRv_x: Ranval | Ranval[],
    inTxt_a_x: string[] | string[][],
    outRv_x: Ranval | Ranval[],
    outTxt_a_x: string[] | string[][],
  ) {
    const inRan_a = this.#pre(inRv_x);
    this.#impl(inRan_a, inTxt_a_x, outRv_x, outTxt_a_x);
  }

  /**
   * Trigger `repl_mo` callbacks, besides invoking `#repl()`\
   * Assign `#bufr.oldRan_a_$`, `#bufr.newRan_a_$`.
   * @const @param inRv_x
   * @const @param inTxt_a_x
   * @out @param outRv_x range of inTxt_a_x
   * @out @param outTxt_a_x texts of inRv_x
   */
  @traceOut(_TRACE)
  private _impl_cb(
    inRv_x: Ranval | Ranval[],
    inTxt_a_x: string[] | string[][],
    outRv_x: Ranval | Ranval[],
    outTxt_a_x: string[] | string[][],
  ) {
    /*#static*/ if (_TRACE) {
      console.log(
        `${trace.indent}>>>>>>> ${this.class_id}._impl_cb() >>>>>>>`,
      );
    }
    const inRan_a = this.#pre(inRv_x);

    this.#bufr.repl_mo.val = BufrReplState.preRepl;

    this.#impl(inRan_a, inTxt_a_x, outRv_x, outTxt_a_x);
    // console.log(`${trace.dent}`, { outRv_x, outTxt_a_x });

    this.#bufr.repl_mo.val = BufrReplState.sufRepl;
    this.#bufr.repl_mo.val = BufrReplState.sufRepl_edtr;

    this.#bufr.repl_mo.val = BufrReplState.idle;
    // console.log(`outRv_x = ${outRv_x.toString()}`);
    // console.log(outTxt_a_x);
  }

  #replFRund = false;
  /**
   * If `aoa`, assign `#ranval_rev_a`, `#replText_a2`,
   * else, assign `#ranval_rev`, `#replText_a`.
   *
   * A `Repl` is a step stored in `Bufr.#doq`, and `replFRun()` is called with
   * one `#text_a`.\
   * But there are cases (e.g. involving IME) that `replFRun()` is called with
   * different data other than `#text_a`, so the replacing texts need to be
   * given explicitly.\
   * Calling with data other than `#text_a` only makes sense in the first time,
   * i.e., through `Bufr.Do()` rather than `Bufr.redo()`
   *
   * @const @param txt_x
   */
  replFRun(txt_x?: string[] | string | (string[] | string)[]) {
    /*#static*/ if (INOUT) {
      assert(txt_x === undefined || !this.#replFRund);
    }
    // let replText_a_save: string[] | undefined;
    if (txt_x !== undefined) {
      if (this.aoa) {
        /*#static*/ if (INOUT) {
          assert(this.#ranval_a!.length === txt_x.length);
        }
        this.#text_a2 = (txt_x as (string[] | string)[]).map((_y) =>
          Is.array(_y) ? _y : linesOf(_y)
        );
        this.#text_a = this.#text_a2[0];
      } else {
        this.#text_a = Is.array(txt_x) ? txt_x as string[] : linesOf(txt_x);
        // this.#ranval = this.#ranval_rev.dup(); //!
        // replText_a_save = [...this.#replText_a]; //!
      }
    }

    if (this.aoa) {
      this._impl_cb(
        this.#ranval_a!,
        this.#text_a2!,
        this.#ranval_rev_a!,
        this.#replText_a2!,
      );
    } else {
      this._impl_cb(
        this.#ranval!,
        this.#text_a!,
        this.#ranval_rev!,
        this.#replText_a!,
      );
    }

    if (txt_x === undefined) {
      this.#replFRund = true;
    } else {
      if (this.aoa) {
        this.#replText_a2_0 ??= this.#replText_a2!.slice();

        for (let i = this.#ranval_rev_a!.length; i--;) {
          this.#ranval_a![i].become_Array(this.#ranval_rev_a![i]);
        }
      } else {
        this.#replText_a_0 ??= this.#replText_a!.slice();

        this.#ranval!.become_Array(this.#ranval_rev!);
      }
      /* ..., then could continue to `this.replFRun(txt_x)` */

      // this.#replText_a = replText_a_save!; // For keeping `replBRun()` correct
      // console.log(this.#replText_a);
    }
  }

  /** Assign `#ranval`, `#text_a` */
  replBRun() {
    if (this.aoa) {
      this._impl_cb(
        this.#ranval_rev_a!,
        this.#replText_a2_0 ?? this.#replText_a2!,
        this.#ranval_a!,
        this.#text_a2!,
      );
    } else {
      this._impl_cb(
        this.#ranval_rev!,
        this.#replText_a_0 ?? this.#replText_a!,
        this.#ranval!,
        this.#text_a!,
      );
    }
  }
}
/*80--------------------------------------------------------------------------*/
