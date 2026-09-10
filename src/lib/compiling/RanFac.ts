/** 80**************************************************************************
 * @module lib/compiling/RanFac
 * @license MIT
 ******************************************************************************/

import type { loff_t } from "../alias.ts";
import { Factory } from "../util/Factory.ts";
import type { Bufr } from "./Bufr.ts";
import type { Line } from "./Line.ts";
import { Loc } from "./Loc.ts";
import { Ran } from "./Ran.ts";
/*80--------------------------------------------------------------------------*/

class RanFac_ extends Factory<Ran> {
  #bufr!: Bufr;
  /** @borrow @const @param _x */
  setBufr(_x: Bufr): this {
    this.#bufr = _x;
    return this;
  }

  constructor() {
    super(10_000);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @implement */
  protected createVal$() {
    // /*#static*/ if (PRF) {
    //   console.log(
    //     `%c# of cached Ran instances: ${this.val_a$.length + 1}`,
    //     `color:${LOG_cssc.performance}`,
    //   );
    // }
    return new Ran(new Loc(this.#bufr.frstLine_$, 0));
  }

  protected override reuseVal$(v_x: Ran): void {
    v_x.reset_Ran(this.#bufr);
  }

  /**
   * @borrow @const @param line_x
   * @const @param loff_x
   */
  byLoff(line_x: Line, loff_x?: loff_t): Ran {
    const ret = this.setBufr(line_x.bufr)
      .oneMore();
    ret.stopLoc.set_Loc(line_x, loff_x);
    return ret.collapse();
  }
  /**
   * @borrow @const @param loc_x
   * @borrow @const @param loc_1_x
   */
  byLoc(loc_x: Loc, loc_1_x?: Loc): Ran {
    const ret = this.setBufr(loc_x.bufr!).oneMore();
    ret.strtLoc.become_Loc(loc_x);
    ret.stopLoc.become_Loc(loc_1_x ?? loc_x);
    return ret.ord();
  }
  /** @borrow @const @param ran_x */
  byRan(ran_x: Ran): Ran {
    return this
      .setBufr(ran_x.bufr!)
      .oneMore()
      .become_Ran(ran_x);
  }
}
export const g_ran_fac = new RanFac_();
/*80--------------------------------------------------------------------------*/
