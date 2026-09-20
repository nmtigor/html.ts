/** 80**************************************************************************
 * @module lib/compiling/html/stnode/Elment
 * @license MIT
 ******************************************************************************/

import type { uint } from "@fe-lib/alias.ts";
import { assert } from "@fe-lib/util.ts";
import { INOUT } from "@fe-src/preNs.ts";
import { ContCat, NestCat, TagNS, TextCat } from "../alias.ts";
import type { HTMLTk } from "../HTMLTk.ts";
import type { Tag_LI } from "../util.ts";
import { AttrRans } from "../util.ts";
import type { HTMLCtnr } from "./alias.ts";
import { CtnrEl } from "./CtnrEl.ts";
import { HTMLSn } from "./HTMLSn.ts";
import { _toHTML_ } from "./util.ts";
/*80--------------------------------------------------------------------------*/

export abstract class Elment extends HTMLSn {
  override get parent(): HTMLCtnr | undefined {
    return super.parent as HTMLCtnr | undefined;
  }

  get idx(): uint | -1 {
    return this.parent?.snt_a_$.indexOf(this) ?? -1;
  }

  /**
   * @const
   * @const @param tns_x
   */
  isIn(...tns_x: string[]): boolean {
    let paSn = this.parent;
    const VALVE = 1_000;
    let valve = VALVE;
    while (--valve) {
      if (!(paSn instanceof CtnrEl)) return false;
      if (tns_x.includes(paSn.tagname)) return true;
      paSn = paSn.parent;
    }
    assert(valve, `Loop ${VALVE}(±1) times!`);
    return false;
  }

  declare protected frstTk$: HTMLTk | undefined;
  abstract override get frstToken_1(): HTMLTk;
  declare protected lastTk$: HTMLTk | undefined;
  abstract override get lastToken_1(): HTMLTk;
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  readonly tagname;
  readonly ns;
  #nonsTagname?: string;
  /**! in lowercase, same as `Tag_LI.tagname_s` */
  get nonsTagname(): string {
    return this.#nonsTagname ??= this.tagname.split(" ").at(-1)!.toLowerCase();
  }

  protected textCat$ = TextCat.normal;
  protected nestCat$ = NestCat.ordinary;
  get nestCat() {
    return this.nestCat$;
  }
  protected contCat$ = ContCat.null;

  /** `undefined` means that `this` is auto-generated. */
  readonly opntagTk;
  //jjjj TOCLEANUP already has `TextCat.void`
  // get selfCloz(): boolean {
  //   /* Default `true` because no `selfCloz` Elment is auto-generated. */
  //   return (this.#opntag?.lexdInfo as Tag_LI | undefined)?.selfCloz ?? true;
  // }

  /**
   * @using All using `Ran`s are from `HTMLTk`s, which are responsible for
   *    `rev()`.
   */
  attrs_$;

  //jjjj TOCLEANUP
  // /** against to  "targetParent" */
  // srcPa?: CtnrEl | undefined;

  /**
   * @const @param tagname_x
   * @const @param opntagTk_x `HTMLTok.tag`
   */
  protected constructor(tagname_x: string, opntagTk_x?: HTMLTk) {
    super();
    this.tagname = tagname_x;
    this.ns = tagname_x.startsWith("svg ")
      ? TagNS.SVG
      : tagname_x.startsWith("math ")
      ? TagNS.MathML
      : TagNS.HTML;
    this.opntagTk = opntagTk_x;
    this.attrs_$ = opntagTk_x?.isEndtag
      ? new AttrRans(this.ns)
      : (opntagTk_x?.lexdInfo as Tag_LI)?.attrs ?? new AttrRans(this.ns);
  }
  //jjjj TOCLEANUP
  // /** @const @param opntagTk_x */
  // static mock(opntagTk_x?: HTMLTk) {
  //   warn("Should not run here!");
  //   return new Elment("", opntagTk_x);
  // }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  rmv(): void {
    this.parent?.rmvSnt(this);
  }

  /** @headconst @param tgtPa_x */
  tfrTo(tgtPa_x: HTMLCtnr): this {
    /*#static*/ if (INOUT) {
      assert(this.parent);
    }
    this.parent!.tfrSntTo(tgtPa_x, this);
    return this;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override _toHTML_(indent_x: uint): string[] {
    return _toHTML_(this, indent_x);
  }
}
/*80--------------------------------------------------------------------------*/
