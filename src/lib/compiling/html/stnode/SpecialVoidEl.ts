/** 80**************************************************************************
 * @module lib/compiling/html/stnode/SpecialVoidEl
 * @license MIT
 ******************************************************************************/

import { ContCat, NestCat } from "../alias.ts";
import type { HTMLTk } from "../HTMLTk.ts";
import { avIsBodyok } from "../util.ts";
import { VoidEl } from "./VoidEl.ts";
/*80--------------------------------------------------------------------------*/

export abstract class SpecialVoidEl extends VoidEl {
  /**
   * @const @param tagname_x
   * @const @param opntagTk_x
   */
  constructor(tagname_x: string, opntagTk_x: HTMLTk) {
    super(tagname_x, opntagTk_x);
    this.nestCat$ = NestCat.special;
  }
}
/*64----------------------------------------------------------*/

/** @final */
export class Area_El extends SpecialVoidEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("area", opntagTk_x);
    this.contCat$ = ContCat.phrasing;
  }
}

/** @final */
export class Base_El extends SpecialVoidEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("base", opntagTk_x);
    this.contCat$ = ContCat.metadata;
  }
}

/** @final */
export class Br_El extends SpecialVoidEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("br", opntagTk_x);
    this.contCat$ = ContCat.phrasing;
  }
}

/** @final */
export class Col_El extends SpecialVoidEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("col", opntagTk_x);
  }
}

/** @final */
export class Embed_El extends SpecialVoidEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("embed", opntagTk_x);
    this.contCat$ = ContCat.embedded | ContCat.interactive | ContCat.palpable;
  }
}

/** @final */
export class Hr_El extends SpecialVoidEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("hr", opntagTk_x);
    this.contCat$ = ContCat.flow;
  }
}

/** @final */
export class Img_El extends SpecialVoidEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("img", opntagTk_x);
    this.contCat$ = ContCat.embedded | ContCat.palpable |
      ContCat.form_associated;
    if (this.attrs_$.hasAn("usemap") || this.attrs_$.hasAn("controls")) {
      this.contCat$ |= ContCat.interactive;
    }
  }
}

/** @final */
export class Input_El extends SpecialVoidEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("input", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.form_associated;
    if (this.attrs_$.getAv("type") !== "hidden") {
      this.contCat$ |= ContCat.interactive | ContCat.palpable |
        ContCat.labelable;
    }
  }
}

/** @final */
export class Link_El extends SpecialVoidEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("link", opntagTk_x);
    this.contCat$ = ContCat.metadata;
    if (
      this.attrs_$.hasAn("itemprop") || avIsBodyok(this.attrs_$.getAv("rel"))
    ) {
      this.contCat$ |= ContCat.phrasing;
    }
  }
}

/** @final */
export class Meta_El extends SpecialVoidEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("meta", opntagTk_x);
    this.contCat$ = ContCat.metadata;
    if (this.attrs_$.hasAn("itemprop")) {
      this.contCat$ |= ContCat.phrasing;
    }
  }
}

/** @final */
export class Source_El extends SpecialVoidEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("source", opntagTk_x);
  }
}

/** @final */
export class Track_El extends SpecialVoidEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("track", opntagTk_x);
  }
}

/** @final */
export class Wbr_El extends SpecialVoidEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("wbr", opntagTk_x);
    this.contCat$ = ContCat.phrasing;
  }
}
/*80--------------------------------------------------------------------------*/
