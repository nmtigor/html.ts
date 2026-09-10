/** 80**************************************************************************
 * @module lib/util/Unre
 * @license MIT
 ******************************************************************************/

import { INOUT } from "../../preNs.ts";
import type { Id_t } from "../alias_v.ts";
import type { uint } from "../alias.ts";
import { assert } from "../util.ts";
import "../jslang.ts";
/*80--------------------------------------------------------------------------*/

export const enum LastUR {
  forw,
  bakw,
}

export class Unre<T extends {} | null> {
  static #ID = 0 as Id_t;
  readonly id = ++Unre.#ID as Id_t;
  /** @final */
  get class_id() {
    return `${this.constructor.name}_${this.id}`;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  readonly #Len: uint;
  protected readonly ary$: Array<T>;
  /** turn the sparse Array `ary$` to a normal Array */
  get _ary_(): T[] {
    let i_ = this.ary$.length;
    for (; i_-- && this.ary$[i_] === undefined;);
    return Array.from({ length: i_ + 1 }, (_, i_y) => this.ary$[i_y]);
  }

  protected i_0$: uint = 0;
  protected i$: uint = 0;
  protected i_1$: uint = 0;
  get len() {
    return this.i_0$ <= this.i_1$
      ? this.i_1$ - this.i_0$
      : this.#Len - (this.i_0$ - this.i_1$);
  }

  protected lastUR$ = LastUR.bakw;
  get lastUR() {
    return this.lastUR$;
  }
  /** @const */
  get lastGot(): T | undefined {
    return this.lastUR$ === LastUR.bakw
      ? this.ary$.at(this.i$)
      : this.ary$.at(this.#loopMinusOne(this.i$));
  }

  /** @const @param len_x */
  constructor(len_x: uint) {
    /*#static*/ if (INOUT) {
      assert(2 <= len_x); // to prevent `i_0$` === `i_1$`
    }
    this.#Len = len_x;
    this.ary$ = Array.sparse<T>(this.#Len);
  }

  reset_Unre() {
    this.i$ = this.i_1$ = this.i_0$;
    this.lastUR$ = LastUR.bakw;
  }

  /** @const */
  protected dupEmpty$() {
    return new Unre<T>(this.#Len);
  }
  /** @const */
  dup_Unre(n_x?: uint) {
    const ret = this.dupEmpty$();
    if (n_x === undefined) {
      for (let i = 0, LEN = this.ary$.length; i < LEN; ++i) {
        if (this.ary$[i] === undefined) break;
        ret.ary$[i] = this.ary$[i];
      }
    } else {
      //jjjj
    }
    ret.i_0$ = this.i_0$;
    ret.i$ = this.i$;
    ret.i_1$ = this.i_1$;
    ret.lastUR$ = this.lastUR$;
    return ret;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @const */
  #loopPlusOne(j_x: uint): uint {
    return (++j_x) >= this.#Len ? 0 : j_x;
  }
  /** @const */
  #loopMinusOne(j_x: uint): uint {
    return j_x <= 0 ? this.#Len - 1 : (--j_x);
  }

  /** @const */
  #forw = (): uint => {
    return this.i$ === this.i_1$ ? this.i$ : this.#loopPlusOne(this.i$);
  };
  /** @const */
  #bakw = (): uint => {
    return this.i$ === this.i_0$ ? this.i$ : this.#loopMinusOne(this.i$);
  };

  add(rhs_x: T): this {
    this.ary$[this.i$] = rhs_x;
    this.i$ = this.#loopPlusOne(this.i$);
    this.i_1$ = this.i$;
    if (this.i_1$ === this.i_0$) this.i_0$ = this.#loopPlusOne(this.i_0$);
    this.lastUR$ = LastUR.forw;
    return this;
  }

  /** @const */
  canGetUn(): boolean {
    return this.i$ !== this.i_0$;
  }
  canGetRe(): boolean {
    return this.i$ !== this.i_1$;
  }
  canGetUnUn(): boolean {
    return this.i$ !== this.i_0$ && this.#bakw() !== this.i_0$;
  }
  canGetReRe(): boolean {
    return this.i$ !== this.i_1$ && this.#forw() !== this.i_1$;
  }

  getUn(): T {
    this.i$ = this.#bakw();
    this.lastUR$ = LastUR.bakw;
    return this.ary$[this.i$];
  }
  /**
   **! If call this when `!canGetRe()`, returned value will be different to
   * `lastGot`.
   */
  getRe(): T {
    const i_ = this.i$;
    this.i$ = this.#forw();
    this.lastUR$ = LastUR.forw;
    return this.ary$[i_];
  }

  tryGetUn() {
    return this.canGetUn() ? this.getUn() : undefined;
  }
  tryGetRe() {
    return this.canGetRe() ? this.getRe() : undefined;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @const */
  _repr_(): Record<string, unknown> {
    return {
      ary: this.ary$,
      ran: `[${this.i_0$}, ${this.i_1$})`, // see `add()` for why "[...)"
      i$: this.i$,
    };
  }
}
