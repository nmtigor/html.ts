/** 80**************************************************************************
 * @module lib/compiling/LineTree
 * @license MIT
 ******************************************************************************/

import { _TREE } from "../../preNs.ts";
import type { unum } from "../alias.ts";
import type { Id_t } from "../alias_v.ts";
import { assert } from "../util.ts";
import { EmptyTn, PayloadTn, Tree, TreePlat } from "../util/Tree.ts";
import type { Line } from "./Line.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class LineTn extends PayloadTn<Line> {
  /* ctnr */
  declare ctnr: LineTp | undefined;

  override createCtnrTp() {
    return new LineTp(new EmptyTn_(), this).init_TreePlat();
  }
  /* ~ */

  /* plat_$ */
  declare plat_$: LineTp | undefined;
  /* ~ */
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @const @param id_x `EdtrBaseScrolr.id`
   * @const @param fb_x
   */
  bsizeOn_$(id_x: Id_t, fb_x: unum): unum {
    return this.payload.getBSizeOn(id_x, fb_x) +
      (this.plat_$?.bsizeOn_$(id_x, fb_x) ?? 0);
  }

  /**
   * @const @param id_x `EdtrBaseScrolr.id`
   * @const @param bsizeFb_x
   */
  bstrtOn_$(id_x: Id_t, bsizeFb_x: unum): unum {
    /*#static*/ if (_TREE) {
      assert(this.ctnr);
    }
    let bstrt_ = this.ctnr!.bstrtOn_$(id_x, bsizeFb_x);
    for (const tn of this.ctnr!) {
      if (tn === this) break;

      bstrt_ += (tn as LineTn | EmptyTn_).bsizeOn_$(id_x, bsizeFb_x);
    }
    return bstrt_;
  }
}

class EmptyTn_ extends EmptyTn<Line> {
  /* ctnr */
  declare ctnr: LineTp | undefined;
  /* ~ */

  /* plat_$ */
  declare plat_$: LineTp | undefined;
  /* ~ */
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @const @param id_x `EdtrBaseScrolr.id`
   * @const @param fb_x
   */
  bsizeOn_$(id_x: Id_t, fb_x: unum): unum {
    return this.plat_$?.bsizeOn_$(id_x, fb_x) ?? 0;
  }
}

/** @final */
export class LineTp extends TreePlat<Line> {
  declare host: LineTn | EmptyTn_ | undefined;

  override invSize_$(): void {
    super.invSize_$();
    this.invBSize_$();
  }

  readonly #bsizeO: Record<
    /** EdtrBaseScrolr.id */ Id_t,
    unum | undefined
  > = {};
  /** @const @param id_x `EdtrBaseScrolr.id` */
  invBSizeOn_$(id_x: Id_t): void {
    if (this.#bsizeO[id_x] === undefined) return;

    this.#bsizeO[id_x] = undefined;
    this.host?.ctnr?.invBSizeOn_$(id_x);
  }
  invBSize_$(): void {
    for (const id of Object.keys(this.#bsizeO)) {
      this.invBSizeOn_$(id as any);
    }
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @const @param id_x `EdtrBaseScrolr.id`
   * @const @param fb_x
   */
  bsizeOn_$(id_x: Id_t, fb_x: unum): unum {
    let bsize_ = this.#bsizeO[id_x];
    if (bsize_ !== undefined) return bsize_;

    bsize_ = 0;
    for (const tn of this) {
      bsize_ += (tn as LineTn | EmptyTn_).bsizeOn_$(id_x, fb_x);
    }
    return this.#bsizeO[id_x] = bsize_;
  }

  /**
   * @const @param id_x `EdtrBaseScrolr.id`
   * @const @param bsizeFb_x
   */
  bstrtOn_$(id_x: Id_t, bsizeFb_x: unum): unum {
    if (!this.host) return 0;

    let bstrt_: unum;
    if (this.host instanceof LineTn) {
      bstrt_ = this.host.bstrtOn_$(id_x, bsizeFb_x) +
        this.host.payload.getBSizeOn(id_x, bsizeFb_x);
    } else {
      bstrt_ = this.host.ctnr!.bstrtOn_$(id_x, bsizeFb_x);
    }
    return bstrt_;
  }
}

/** @final */
export class LineTree extends Tree<Line> {
  /** @headconst @param ln_x */
  constructor(ln_x: Line) {
    super(ln_x.hostTn_$.createCtnrTp());
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @const @param id_x `EdtrBaseScrolr.id`
   * @const @param fb_x
   */
  bsizeOn_$(id_x: Id_t, fb_x: unum): unum {
    return (this.root_$ as LineTp).bsizeOn_$(id_x, fb_x);
  }
}
/*80--------------------------------------------------------------------------*/
