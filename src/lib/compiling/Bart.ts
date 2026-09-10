/** 80**************************************************************************
 * @module lib/compiling/Bart
 * @license MIT
 ******************************************************************************/

import { INOUT } from "../../preNs.ts";
import type { lnum_t } from "../alias.ts";
import { assert } from "../util.ts";
import type { Bufr } from "./Bufr.ts";
import type { Line } from "./Line.ts";
import type { Ran } from "./Ran.ts";
/*80--------------------------------------------------------------------------*/

/**
 * Bufr part, a continuous part of a Bufr
 *
 **! Readonly (for the moment)
 *
 * @final
 */
export class Bart {
  readonly #bufr;
  readonly #frstLidx;
  readonly #lastLidx;

  get frstLine(): Line {
    return this.#bufr.line(this.#frstLidx);
  }
  get lastLine(): Line {
    return this.#bufr.line(this.#lastLidx);
  }

  get oldRan_a(): Ran[] {
    return this.#bufr.oldRan_a_$;
  }
  get newRan_a(): Ran[] {
    return this.#bufr.newRan_a_$;
  }

  /**
   * @headconst @param bufr_x
   * @const @param frstLidx_x
   * @const @param lastLidx_x
   */
  constructor(bufr_x: Bufr, frstLidx_x: lnum_t, lastLidx_x?: lnum_t) {
    this.#bufr = bufr_x;
    this.#frstLidx = frstLidx_x;
    this.#lastLidx = lastLidx_x ?? frstLidx_x;

    /*#static*/ if (INOUT) {
      assert(
        this.#frstLidx <= this.#lastLidx && this.#lastLidx < this.#bufr.lineN,
      );
    }
  }
}
/*80--------------------------------------------------------------------------*/
