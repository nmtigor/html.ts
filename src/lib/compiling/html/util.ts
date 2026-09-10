/** 80**************************************************************************
 * @module lib/compiling/html/util
 * @license MIT
 ******************************************************************************/

import { entities, entityPrefix_o } from "@fe-src/data/html/entities.ts";
import type { uint, uint32 } from "../../alias.ts";
import { assert } from "../../util.ts";
import * as Is from "../../util/is.ts";
import { isASCIIWs } from "../../util/string.ts";
import type { Ran } from "../Ran.ts";
import type { Err } from "../util.ts";
import { LexdInfo } from "../util.ts";
import type { ErrRepr, ForeignAttrName } from "./alias.ts";
import { AttrNS, State, TagNS } from "./alias.ts";
import { HTMLTk } from "./HTMLTk.ts";
import { HTMLTok } from "./HTMLTok.ts";
import type { HTMLSn } from "./stnode/HTMLSn.ts";
/*80--------------------------------------------------------------------------*/

/** [adjust SVG attributes](https://html.spec.whatwg.org/multipage/parsing.html#adjust-svg-attributes) */
const svgAn_o_: Record<string, string | undefined> = {
  attributename: "attributeName",
  attributetype: "attributeType",
  basefrequency: "baseFrequency",
  baseprofile: "baseProfile",
  calcmode: "calcMode",
  clippathunits: "clipPathUnits",
  diffuseconstant: "diffuseConstant",
  edgemode: "edgeMode",
  filterunits: "filterUnits",
  glyphref: "glyphRef",
  gradienttransform: "gradientTransform",
  gradientunits: "gradientUnits",
  kernelmatrix: "kernelMatrix",
  kernelunitlength: "kernelUnitLength",
  keypoints: "keyPoints",
  keysplines: "keySplines",
  keytimes: "keyTimes",
  lengthadjust: "lengthAdjust",
  limitingconeangle: "limitingConeAngle",
  markerheight: "markerHeight",
  markerunits: "markerUnits",
  markerwidth: "markerWidth",
  maskcontentunits: "maskContentUnits",
  maskunits: "maskUnits",
  numoctaves: "numOctaves",
  pathlength: "pathLength",
  patterncontentunits: "patternContentUnits",
  patterntransform: "patternTransform",
  patternunits: "patternUnits",
  pointsatx: "pointsAtX",
  pointsaty: "pointsAtY",
  pointsatz: "pointsAtZ",
  preservealpha: "preserveAlpha",
  preserveaspectratio: "preserveAspectRatio",
  primitiveunits: "primitiveUnits",
  refx: "refX",
  refy: "refY",
  repeatcount: "repeatCount",
  repeatdur: "repeatDur",
  requiredextensions: "requiredExtensions",
  requiredfeatures: "requiredFeatures",
  specularconstant: "specularConstant",
  specularexponent: "specularExponent",
  spreadmethod: "spreadMethod",
  startoffset: "startOffset",
  stddeviation: "stdDeviation",
  stitchtiles: "stitchTiles",
  surfacescale: "surfaceScale",
  systemlanguage: "systemLanguage",
  tablevalues: "tableValues",
  targetx: "targetX",
  targety: "targetY",
  textlength: "textLength",
  viewbox: "viewBox",
  viewtarget: "viewTarget",
  xchannelselector: "xChannelSelector",
  ychannelselector: "yChannelSelector",
  zoomandpan: "zoomAndPan",
};

const xlinkAn_a_ = /* deno-fmt-ignore */ [
  "actuate", "arcrole", "href", "role", "show", "title", "type",
];
/**
 * [adjust foreign attributes](https://html.spec.whatwg.org/multipage/parsing.html#adjust-foreign-attributes)
 * @const @param an_x
 */
const adjForeignAn_ = (an_x: string): ForeignAttrName | undefined => {
  const [_0, _1] = an_x.split(":");
  if (_1 === undefined) {
    return _0 === "xmlns"
      ? { prefix: "", localName: _0, namespace: AttrNS.XMLNS }
      : undefined;
  }

  if (_0 === "xlink") {
    return xlinkAn_a_.includes(_1)
      ? { prefix: _0, localName: _1, namespace: AttrNS.XLink }
      : undefined;
  }

  if (_0 === "xml") {
    return _1 === "lang" || _1 === "space"
      ? { prefix: _0, localName: _1, namespace: AttrNS.XML }
      : undefined;
  }

  if (_0 === "xmlns") {
    return _1 === "xlink"
      ? { prefix: _0, localName: _1, namespace: AttrNS.XMLNS }
      : undefined;
  }

  return undefined;
};

/**
 * @final
 * @using
 */
export class AttrRans {
  /** context namespace, used as the default namespace */
  #ns;
  /** @const @param _x */
  set ns_$(_x: TagNS) {
    this.#ns = _x;

    for (let i = this.an_a.length; i--;) {
      this.an_a[i] = this.#adjAn(this.an_a[i]);
    }
  }

  /** @using */
  readonly ran_a: [Ran, Ran | undefined][] = [];

  /** attribute name */
  readonly an_a: string[] = [];
  /** attribute value */
  readonly av_a: (string | undefined)[] = [];

  /** Chrref token array containing `chrref` or `character` Token's */
  readonly crTk_a: HTMLTk[] = [];

  /** @headconst @param rhs_x */
  eql(rhs_x: AttrRans): boolean {
    if (this.ran_a.length !== rhs_x.ran_a.length) return false;

    for (let i = this.ran_a.length; i--;) {
      const an_i = this.an_a[i];
      if (!rhs_x.an_a.includes(an_i)) return false;
      if (this.getAv(an_i) !== rhs_x.getAv(an_i)) return false;
    }

    return true;
  }

  /** @const @param ns_x */
  constructor(ns_x: TagNS) {
    this.#ns = ns_x;
  }

  destructor(): void {
    for (const attr of this.ran_a) {
      attr[0].rev();
      attr.at(1)?.rev();
    }
    for (const tk of this.crTk_a) {
      tk.destructor();
    }
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @const
   * @const @param _x
   */
  hasAn(_x: string | Ran): boolean {
    return this.an_a.includes(
      Is.string(_x) ? _x : _x.getText().toLowerCase(),
    );
  }

  /** @const @param an_x */
  getAv(an_x: string | Ran): string | undefined {
    let i_: uint = 0;
    if (Is.string(an_x)) {
      /* MUST be in (non-reverse) order, because `an_a` may have repeated attr
      names, which are ignored.
      */ for (; i_ < this.an_a.length; i_++) {
        if (an_x === this.an_a[i_]) break;
      }
    } else {
      /* ditto
      */ for (; i_ < this.an_a.length; i_++) {
        if (an_x === this.ran_a[i_][0]) break;
      }
    }
    if (i_ >= this.an_a.length) return undefined;

    let retAv = this.av_a.at(i_);
    if (retAv !== undefined) return retAv;

    const ran_i = this.ran_a[i_];
    retAv = ran_i[1]?.getText()
      .replaceAll("\u0000", "\uFFFD");

    /* replace character references with strings
    */ if (retAv?.length && this.crTk_a.length) {
      for (let i = this.crTk_a.length; i--;) {
        const cr_ = this.crTk_a[i];
        if (
          cr_.sntStrtLoc.posGE(ran_i[1]!.stopLoc) ||
          cr_.value !== HTMLTok.chrref
        ) continue;
        if (cr_.sntStopLoc.posSE(ran_i[1]!.strtLoc)) break;

        const strt = cr_.sntStrtLoff - ran_i[1]!.strtLoff;
        const stop = strt + cr_.length_1;
        const chr = cr_.lexdInfo instanceof NamEntity_LI
          ? cr_.lexdInfo.chr
          : String.fromCodePoint((cr_.lexdInfo as NumEntity_LI).num);
        retAv = [retAv.slice(0, strt), chr, retAv.slice(stop)].join("");
      }
    }

    const quot = retAv?.at(0);
    /* remove quots
    */ if (quot === '"' || quot === "'") {
      retAv = retAv!.slice(1, -1);
    }
    return this.av_a[i_] = retAv ?? "";
  }

  /** @const @param an_x */
  #adjAn(an_x: string): string {
    if (this.#ns === TagNS.MathML) {
      return an_x === "definitionurl" ? "definitionURL" : an_x;
    }

    if (this.#ns === TagNS.SVG) return svgAn_o_[an_x] ?? an_x;

    return an_x;
  }

  /** @const @param _x */
  addAttr(_x: [Ran, Ran | undefined]): void {
    const an_ = _x[0].getText()
      .replaceAll("\u0000", "\uFFFD")
      .toLowerCase();
    this.an_a.push(this.#adjAn(an_));
    this.ran_a.push(_x);
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  foreignAn_a?: (ForeignAttrName | undefined)[];
  /** Assign `foreignAn_a` only */
  adjForeignAns(): void {
    this.foreignAn_a ??= [];
    for (let i = this.an_a.length; i--;) {
      this.foreignAn_a[i] = adjForeignAn_(this.an_a[i]);
    }
  }
}

/** [body-ok](https://html.spec.whatwg.org/multipage/links.html#body-ok) */
const bodyok_a_ = /* deno-fmt-ignore */ [
  "dns-prefetch", "modulepreload", "pingback", "preconnect", "prefetch",
  "preload", "stylesheet",
];

/**
 * [allowed in the body](https://html.spec.whatwg.org/multipage/semantics.html#allowed-in-the-body)
 * @const @param av_x
 */
export const avIsBodyok = (av_x: string | undefined): boolean => {
  if (av_x === undefined) return false;

  let ret = false;
  for (const rel of av_x.split(/\s+/).filter(Boolean)) {
    if (!bodyok_a_.includes(rel)) {
      ret = false;
      break;
    }
    ret = true;
  }
  return ret;
};
/*80--------------------------------------------------------------------------*/

/** @final */
export class NamEntity_LI extends LexdInfo {
  /** including prefix "&" and suffix ";" (if any) */
  nam: string;
  cps: uint32[];
  chr: string;

  /**
   * @const @param nam_x
   * @const @param cps_x
   * @const @param chr_x
   */
  constructor(nam_x: string, cps_x: uint32[], chr_x: string) {
    super();
    this.nam = nam_x;
    this.cps = cps_x;
    this.chr = chr_x;
  }
}

/**
 * @const @param prefix_x exclude prefix "&", may include suffix ";"
 * @return  -
 *    - `null`: no match
 *    - `undefined`: more than one match
 */
export const entityOfPrefix = (
  prefix_x: string,
): NamEntity_LI | null | undefined => {
  if (!Object.hasOwn(entityPrefix_o, prefix_x)) return null;

  let ret: NamEntity_LI | undefined;
  const nam = entityPrefix_o[prefix_x];
  if (Is.string(nam)) {
    const raw = entities[nam];
    ret = new NamEntity_LI(
      nam,
      raw.slice(0, -1) as uint32[],
      raw.at(-1) as string,
    );
  }
  return ret;
};
/*64----------------------------------------------------------*/

/** @final */
export class NumEntity_LI extends LexdInfo {
  num;

  /** @const @param num_x */
  constructor(num_x: uint) {
    super();
    this.num = num_x;
  }
}
/*64----------------------------------------------------------*/

/**
 * @final
 * @using
 */
export class Doctype_LI extends LexdInfo {
  /** @using */
  readonly name;
  get name_s(): string | undefined {
    return this.name?.getText().toLowerCase();
  }

  readonly correct;

  /* sys */
  /** @using */
  readonly sys;

  //jjjj TOCLEANUP
  // get sys_s(): string | undefined {
  //   return this.sys?.getText();
  // }

  get noqtSys_s(): string | undefined {
    const sys_s = this.sys?.getText();
    if (sys_s === undefined) return undefined;
    if (sys_s.length === 0) return sys_s;

    const quot = sys_s[0];
    if (sys_s.length >= 2 && sys_s.at(-1) === quot) return sys_s.slice(1, -1);

    return sys_s.slice(1);
  }
  get quotSys_s(): string | undefined {
    const sys_s = this.sys?.getText();
    if (sys_s === undefined) return undefined;
    if (sys_s.length === 0) return `""`;

    const quot = sys_s[0];
    if (sys_s.length >= 2 && sys_s.at(-1) === quot) return sys_s;

    return `${sys_s}${quot}`;
  }
  /* ~ */

  /**
   * @const @param name_x
   * @const @param correct_x
   * @const @param sys_x
   */
  constructor(
    name_x: Ran | undefined,
    correct_x: boolean,
    sys_x?: Ran,
  ) {
    super();
    this.name = name_x;
    this.correct = correct_x;
    this.sys = sys_x;
  }

  override destructor(): void {
    this.name?.rev();
    this.sys?.rev();
  }
}
/*64----------------------------------------------------------*/

const svgTn_o_: Record<string, string | undefined> = {
  altglyph: "altGlyph",
  altglyphdef: "altGlyphDef",
  altglyphitem: "altGlyphItem",
  animatecolor: "animateColor",
  animatemotion: "animateMotion",
  animatetransform: "animateTransform",
  clippath: "clipPath",
  feblend: "feBlend",
  fecolormatrix: "feColorMatrix",
  fecomponenttransfer: "feComponentTransfer",
  fecomposite: "feComposite",
  feconvolvematrix: "feConvolveMatrix",
  fediffuselighting: "feDiffuseLighting",
  fedisplacementmap: "feDisplacementMap",
  fedistantlight: "feDistantLight",
  fedropshadow: "feDropShadow",
  feflood: "feFlood",
  fefunca: "feFuncA",
  fefuncb: "feFuncB",
  fefuncg: "feFuncG",
  fefuncr: "feFuncR",
  fegaussianblur: "feGaussianBlur",
  feimage: "feImage",
  femerge: "feMerge",
  femergenode: "feMergeNode",
  femorphology: "feMorphology",
  feoffset: "feOffset",
  fepointlight: "fePointLight",
  fespecularlighting: "feSpecularLighting",
  fespotlight: "feSpotLight",
  fetile: "feTile",
  feturbulence: "feTurbulence",
  foreignobject: "foreignObject",
  glyphref: "glyphRef",
  lineargradient: "linearGradient",
  radialgradient: "radialGradient",
  textpath: "textPath",
};

/**
 * @final
 * @using
 */
export class Tag_LI extends LexdInfo {
  /** context namespace, used as the default namespace */
  #ns = TagNS.HTML;
  get ns() {
    return this.#ns;
  }
  /** @const @param _x */
  set ns_$(_x: TagNS) {
    this.#ns = _x;
    this.#tagname_s = undefined;

    this.attrs.ns_$ = _x;
  }

  /* tagname */
  /** @using */
  readonly tagname;

  #tagname_s: string | undefined;
  get tagname_s(): string {
    if (this.#tagname_s !== undefined) return this.#tagname_s;

    const prefix = this.#ns === TagNS.MathML
      ? "math "
      : this.#ns === TagNS.SVG
      ? "svg "
      : "";
    let tn_ = this.tagname.getText().toLowerCase();
    if (prefix === "svg ") {
      tn_ = svgTn_o_[tn_] ?? tn_;
    }
    return this.#tagname_s = prefix + tn_;
  }
  /* ~ */

  /** @using */
  readonly attrs = new AttrRans(this.#ns);

  //jjjj TOCLEANUP
  // readonly chrref_a: HTMLTk[] = [];

  readonly isEnd;
  selfCloz_$ = false;

  /**
   * @const @param tagname_x
   * @const @param isEnd_x
   */
  constructor(tagname_x: Ran, isEnd_x = false) {
    super();
    this.tagname = tagname_x;
    this.isEnd = isEnd_x;
  }

  override destructor(): void {
    this.tagname.rev();
    this.attrs.destructor();
  }
}
/*64----------------------------------------------------------*/

/**
 * Processing instruction LexdInfo
 * @final
 * @using
 */
export class Proins_LI extends LexdInfo {
  /** @using */
  readonly target;
  /** @using */
  data_$: Ran | undefined;

  /** @const @param target_x */
  constructor(target_x: Ran) {
    super();
    this.target = target_x;
  }

  override destructor(): void {
    this.target.rev();
    this.data_$?.rev();
  }
}
/*64----------------------------------------------------------*/

/**
 * @final
 * @using
 */
export class Comment_LI extends LexdInfo {
  /** @using */
  readonly data;

  /** @const @param data_x */
  constructor(data_x: Ran) {
    super();
    this.data = data_x;
  }

  override destructor(): void {
    this.data.rev();
  }
}
/*64----------------------------------------------------------*/

/** @final */
export class Chr_LI extends LexdInfo {
  host_$!: HTMLTk;

  readonly state;
  /** Chrref token array containing `chrref` or `character` Token's */
  readonly crTk_a: HTMLTk[] = [];

  #allWs: boolean | undefined;
  /** @primaryconst */
  get allWs(): boolean {
    if (this.#allWs !== undefined) return this.#allWs;

    using loc = this.host_$.sntStrtLoc.usingDup();
    const loc_1 = this.host_$.sntStopLoc;

    const VALVE = 1_000_000;
    let valve = VALVE;
    for (; loc.posS(loc_1) && isASCIIWs(loc.ucod) && --valve; loc.forw());
    assert(valve, `Loop ${VALVE}(±1) times!`);

    return this.#allWs = !loc.posS(loc_1);
  }

  /** @const @param state_x */
  constructor(state_x: State) {
    super();
    this.state = state_x;
  }

  override destructor(): void {
    for (const tk of this.crTk_a) {
      tk.destructor();
    }
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  getText(): string {
    const tk_ = this.host_$;
    let ret = tk_.getText();

    if (
      this.state === State.RCDATA || this.state === State.RAWTEXT ||
      this.state === State.Script
    ) {
      ret = ret.replaceAll("\u0000", "\uFFFD");
    } else if (this.state === State.CDATA) {
      ret = ret.slice(
        ret.startsWith("<![CDATA[") ? 9 : 0,
        ret.endsWith("]]>") ? -3 : undefined, // because maybe `html_cdata_eof`
      );
    }

    /* replace character references with strings
    */ if (this.crTk_a.length) {
      for (let i = this.crTk_a.length; i--;) {
        const cr_ = this.crTk_a[i];
        if (cr_.value !== HTMLTok.chrref) continue;

        const strt = cr_.sntStrtLoff - tk_.sntStrtLoff;
        const stop = strt + cr_.length_1;
        ret = [ret.slice(0, strt), cr_.refchr, ret.slice(stop)].join("");
      }
    }

    return ret;
  }
}
/*80--------------------------------------------------------------------------*/

/**
 **! In [html5lib-tests](https://github.com/html5lib/html5lib-tests)/tree-construction,
 * column number is 0-based in "#errors", and 1-based in "#new-errors" (which
 * contains tokenizer errors). Strangely!
 * @const @param err_x
 * @primaryconst @param snt_x
 */
export const _reprErr_ = (err_x: Err, snt_x: HTMLTk | HTMLSn): ErrRepr =>
  snt_x instanceof HTMLTk
    ? {
      code: err_x.msg,
      line: (err_x.rv ? err_x.rv.focusLidx : snt_x.sntStopLoc.lidx_1) + 1,
      col: (err_x.rv ? err_x.rv.focusLoff : snt_x.sntStopLoff) + 1,
      ts: err_x.ts,
    }
    : {
      code: err_x.msg,
      line: (err_x.rv ? err_x.rv.focusLidx : snt_x.sntStopLoc.lidx_1) + 1,
      col: err_x.rv ? err_x.rv.focusLoff : snt_x.sntStopLoff,
      ts: err_x.ts,
    };

/** @const @param ers_x */
export const _sortErrs_ = (ers_x: ErrRepr[]): ErrRepr[] =>
  ers_x.sort((a_y, b_y) => {
    const aL = a_y.line ?? -1;
    const bL = b_y.line ?? -1;
    if (aL < bL) return -1;
    if (aL > bL) return 1;

    const aC = a_y.col ?? -1;
    const bC = b_y.col ?? -1;
    if (aC < bC) return -1;
    if (aC > bC) return 1;

    const aT = a_y.ts ?? 0;
    const bT = b_y.ts ?? 0;
    if (aT < bT) return -1;
    if (aT > bT) return 1;

    return 0;
  });
/*80--------------------------------------------------------------------------*/
