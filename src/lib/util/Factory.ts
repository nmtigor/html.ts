/** 80**************************************************************************
 * @module lib/util/Factory
 * @license MIT
 ******************************************************************************/

import type { int, uint } from "../alias.ts";
import { assert, out } from "../util.ts";
/*80--------------------------------------------------------------------------*/

export abstract class Factory<V> {
  /* _val_a */
  private readonly _val_a: V[] = [];
  get val_a() {
    return this._val_a;
  }

  get(i_x: uint): V {
    return this._val_a[i_x];
  }
  at(i_x: int): V | undefined {
    return this._val_a.at(i_x);
  }
  /* ~ */

  /** `<= _val_a.length` */
  private _nInUse: uint = 0;
  get nInUse() {
    return this._nInUse;
  }

  readonly #MAX;
  /** Call after `_nInUse` is assigned */
  #maxCtrl(): void {
    if (this._val_a.length > this.#MAX) {
      this._val_a.length = Math.max(this.#MAX, this._nInUse);
    }
  }

  /** @const @param MAX_x */
  constructor(MAX_x?: uint) {
    this.#MAX = MAX_x ?? Infinity;

    //jjjj TOCLEANUP
    // this.init();
  }

  reset_Factory(hard_x?: "hard") {
    // if( this._nInUse )
    // {
    //   assert( this._nInUse <= this._val_a.length );
    //   for( let i = this._nInUse; i--; )
    //   {
    //     this.resetVal$( i );
    //   }
    // }
    // this._nInUse = 0;
    this.produce(0);

    if (hard_x) this._val_a.length = 0;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** Create and use */
  protected abstract createVal$(i_x: uint): V;

  /** @headconst @param _v_x */
  protected resetVal$(_v_x: V): void {}
  /**
   * @headconst @param _v_x
   * @const @param _i_x
   */
  protected reuseVal$(_v_x: V, _i_x: uint): void {}

  /**
   * @final
   * @const @param ret_x
   * @return `_nInUse`
   */
  @out((self: Factory<V>) => {
    assert(self._nInUse <= self._val_a.length);
  })
  produce(ret_x: uint): uint {
    const n_ = Math.min(ret_x, this._val_a.length);
    for (let i = this._nInUse; i < n_; i++) {
      this.reuseVal$(this._val_a[i], i);
    }
    if (ret_x > this._val_a.length) {
      for (let i = this._val_a.length; i < ret_x; i++) {
        this._val_a.push(this.createVal$(i));
      }
    } else if (ret_x < this._nInUse) {
      for (let i = ret_x; i < this._nInUse; i++) {
        this.resetVal$(this._val_a[i]);
      }
    }
    this._nInUse = ret_x;
    this.#maxCtrl();
    return ret_x;
  }

  /** @final */
  produceMore(n_x: uint): uint {
    return this.produce(this._nInUse + n_x);
  }
  /** @final */
  oneMore(): V {
    const n = this.produceMore(1);
    return this._val_a[n - 1];
  }

  /** @final */
  produceLess(n_x: uint): uint {
    return this.produce(Math.max(this._nInUse - n_x, 0));
  }

  /** @final */
  [Symbol.iterator](): Iterator<V> {
    let i_ = 0;
    return {
      next: () =>
        i_ < this._nInUse
          ? { value: this._val_a[i_++] }
          : { value: undefined, done: true },
    };
  }

  /** @const @param val_x */
  lastIndexOf(val_x: V): uint | -1 {
    for (let i = this._nInUse; i--;) {
      if (val_x === this._val_a[i]) return i;
    }
    return -1;
  }

  /**
   * Keep the order
   * @final
   * @headconst @param val_x
   */
  revoke(val_x: V): this {
    const i_ = this.lastIndexOf(val_x);
    if (0 <= i_) {
      this.resetVal$(val_x);
      for (let j = i_ + 1, jJ = this._nInUse; j < jJ; ++j) {
        this._val_a[j - 1] = this._val_a[j];
      }
      this._val_a[this._nInUse - 1] = val_x;
      this._nInUse -= 1;
      this.#maxCtrl();
    }
    return this;
  }

  //jjjj TOCLEANUP
  // /**
  //  * Keep the order
  //  * @final
  //  */
  // gcWith(cb_x: (val_y: V) => boolean): this {
  //   for (let i = this._nInUse; i--;) {
  //     const v_ = this.get(i);
  //     if (cb_x(v_)) {
  //       this.resetVal$(i);
  //       for (let j = i + 1, LEN = this._nInUse; j < LEN; ++j) {
  //         this._val_a[j - 1] = this.get(j);
  //       }
  //       this._val_a[this._nInUse - 1] = v_;
  //       this._nInUse -= 1;
  //     }
  //   }
  //   return this;
  // }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** For testing only */
  toString() {
    return `${this._nInUse}/${this._val_a.length}`;
  }
  // /**
  //  * @const @param rhs_x
  //  */
  // _toString_eq(rhs_x: string) {
  //   console.assert(this.toString() === rhs_x);
  //   return this;
  // }
}
/*80--------------------------------------------------------------------------*/
