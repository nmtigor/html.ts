/** 80**************************************************************************
 * @module lib/compiling/Snt
 * @license MIT
 ******************************************************************************/

import type { ERan, ERanr } from "@fe-edt/ERan.ts";
import { g_eran_fac } from "@fe-edt/ERan.ts";
import * as Is from "@fe-lib/util/is.ts";
import type { lnum_t, loff_t } from "../alias.ts";
import type { Id_t } from "../alias_v.ts";
import type { Line } from "./Line.ts";
import type { Loc } from "./Loc.ts";
import type { _OldInfo_, Err, ErrMsg } from "./util.ts";
import { SortedErr } from "./util.ts";
/*80--------------------------------------------------------------------------*/

type NErr_ = 2;
const NErr_ = 2;
console.assert(NErr_ >= 1);

/** syntax node or token */
export abstract class Snt {
  static #ID = 0 as Id_t;
  readonly id = ++Snt.#ID as Id_t;
  /** @final */
  get class() {
    return this.constructor.name;
  }
  /** @final */
  get class_id() {
    return `${this.class}_${this.id}`;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  abstract get sntStrtLoc(): Loc;
  abstract get sntStopLoc(): Loc;

  abstract get sntFrstLine(): Line;
  abstract get sntLastLine(): Line;

  abstract get sntFrstLidx_1(): lnum_t;
  abstract get sntLastLidx_1(): lnum_t;

  abstract get sntStrtLoff(): loff_t;
  abstract get sntStopLoff(): loff_t;

  /* err_ss$ */
  protected err_ss$?: SortedErr | undefined;
  private get _err_a() {
    return this.err_ss$ ??= new SortedErr();
  }

  /** @const */
  get isErr(): boolean {
    return !!this.err_ss$?.length;
  }
  /** @final */
  hasErrMsg(errMsg_x: ErrMsg): boolean {
    return !!this.err_ss$?.some((err) => errMsg_x === err.msg);
  }
  /**
   * @deprecated
   * @const
   * @const @param errMsg_x
   */
  onlyErrMsg(msg_x: ErrMsg): boolean {
    return this.err_ss$?.at(0)?.msg === msg_x && !this.err_ss$.at(1);
  }

  protected NErr$ = NErr_;

  /**
   * @final
   * @const @param err_x
   */
  setErr(err_x: Err): this {
    if (this._err_a.length < this.NErr$) {
      this._err_a.add(err_x);
    }
    return this;
  }
  clrErr(): this {
    this.err_ss$?.reset_SortedArray();
    return this;
  }

  /**
   * @const
   * @headconst @param tgtTk_x
   */
  tfrErr(tgtTk_x: Snt): this {
    /* in (non-reverse) order */
    for (let i = 0, iI = this.err_ss$?.length ?? 0; i < iI; i++) {
      tgtTk_x.setErr(this.err_ss$![i]);
    }
    return this;
  }

  /** @const */
  get _err_(): unknown[] {
    const retA: unknown[] = [];
    if (this.err_ss$) {
      for (const err of this.err_ss$) {
        /** representation */
        const r_: { msg: ErrMsg; rv?: string; txt?: string } = { msg: err.msg };
        if (err.rv) r_.rv = `${err.rv}`;
        if (err.txt !== undefined) r_.txt = err.txt;
        retA.push(r_);
      }
    }
    return retA;
  }
  /* ~ */

  /* #eran */
  /** @using */
  #eran?: ERan | undefined;
  /** @final */
  protected get eran$(): ERan {
    return this.#eran ??= g_eran_fac.oneMore();
  }
  /** @final */
  get range_$(): Range {
    return this.eran$.range;
  }

  /** @final */
  revERan(): void {
    if (this.#eran) {
      this.#eran.rev();
      this.#eran = undefined;
    }
  }

  /** @headconst @param eranr_x */
  abstract syncERan(eranr_x: ERanr): ERan;
  /* ~ */

  destructor() {
    this.revERan();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** For testing only */
  toString() {
    return this.class_id;
  }

  get _oldInfo_(): _OldInfo_ {
    return { sort: [0, 0], info: "" };
  }
}
/*80--------------------------------------------------------------------------*/
