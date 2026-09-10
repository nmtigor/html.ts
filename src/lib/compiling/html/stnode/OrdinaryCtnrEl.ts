/** 80**************************************************************************
 * @module lib/compiling/html/stnode/OrdinaryCtnrEl
 * @license MIT
 ******************************************************************************/

import { ContCat, TextCat } from "../alias.ts";
import type { HTMLTk } from "../HTMLTk.ts";
import { CtnrEl } from "./CtnrEl.ts";
/*80--------------------------------------------------------------------------*/

export abstract class OrdinaryCtnrEl extends CtnrEl {
  /**
   * @const @param tagname_x
   * @const @param opntagTk_x
   */
  constructor(tagname_x: string, opntagTk_x: HTMLTk) {
    super(tagname_x, opntagTk_x);
  }
}

abstract class OrdinaryForeignEl extends OrdinaryCtnrEl {
  /**
   * @const @param tagname_x
   * @const @param opntagTk_x
   */
  constructor(tagname_x: string, opntagTk_x: HTMLTk) {
    super(tagname_x, opntagTk_x);
    this.textCat$ = TextCat.foreign;
  }
}
/*64----------------------------------------------------------*/

/** @final */
export class Abbr_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("abbr", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Audio_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("audio", opntagTk_x);
    this.contCat$ = ContCat.embedded;
    if (this.attrs_$.hasAn("controls")) {
      this.contCat$ |= ContCat.interactive | ContCat.palpable;
    }
  }
}

/** @final */
export class Bdi_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("bdi", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Bdo_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("bdo", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Canvas_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("canvas", opntagTk_x);
    this.contCat$ = ContCat.embedded | ContCat.palpable;
  }
}

/** @final */
export class Cite_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("cite", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Data_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("data", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Dfn_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("dfn", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Dialog_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("dialog", opntagTk_x);
    this.contCat$ = ContCat.flow;
  }
}

/** @final */
export class Kbd_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("kbd", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Label_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("label", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.interactive | ContCat.palpable;
  }
}

/** @final */
export class Legend_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("legend", opntagTk_x);
  }
}

/** @final */
export class Map_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("map", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Mark_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("mark", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Meter_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("meter", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.labelable | ContCat.palpable;
  }
}

/** @final */
export class Option_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("option", opntagTk_x);
  }
}

/** @final */
export class Optgroup_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("optgroup", opntagTk_x);
  }
}

/** @final */
export class Output_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("output", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable |
      ContCat.form_associated | ContCat.labelable;
  }
}

/** @final */
export class Picture_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("picture", opntagTk_x);
    this.contCat$ = ContCat.embedded;
  }
}

/** @final */
export class Progress_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("progress", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable | ContCat.labelable;
  }
}

/** @final */
export class Q_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("q", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Rp_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("rp", opntagTk_x);
  }
}

/** @final */
export class Rt_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("rt", opntagTk_x);
  }
}

/** @final */
export class Samp_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("samp", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Selectedcontent_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("selectedcontent", opntagTk_x);
    this.contCat$ = ContCat.phrasing;
  }
}

/** @final */
export class Slot_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("slot", opntagTk_x);
    this.contCat$ = ContCat.phrasing;
  }
}

/** @final */
export class Span_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("span", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Sub_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("sub", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Sup_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("sup", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Time_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("time", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Var_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("var", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Video_El extends OrdinaryCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("video", opntagTk_x);
    this.contCat$ = ContCat.embedded;
    if (this.attrs_$.hasAn("controls")) {
      this.contCat$ |= ContCat.interactive | ContCat.palpable;
    }
  }
}
/*64----------------------------------------------------------*/
/* [SVG elements by category](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element#svg_elements_by_category) */

/** @final */
export class A_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg a", opntagTk_x);
  }
}

/** @final */
export class Animate_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg animate", opntagTk_x);
  }
}

/** @final */
export class AnimateMotion_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg animatemotion", opntagTk_x);
  }
}

/** @final */
export class AnimateTransform_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg animatetransform", opntagTk_x);
  }
}

/** @final */
export class Circle_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg circle", opntagTk_x);
  }
}

/** @final */
export class ClipPath_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg clippath", opntagTk_x);
  }
}

/** @final */
export class Defs_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg defs", opntagTk_x);
  }
}

/** @final */
export class Ellipse_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg ellipse", opntagTk_x);
  }
}

/** @final */
export class FeBlend_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg feblend", opntagTk_x);
  }
}

/** @final */
export class FeColorMatrix_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg fecolormatrix", opntagTk_x);
  }
}

/** @final */
export class FeComponentTransfer_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg fecomponenttransfer", opntagTk_x);
  }
}

/** @final */
export class FeComposite_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg fecomposite", opntagTk_x);
  }
}

/** @final */
export class FeConvolveMatrix_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg feconvolvematrix", opntagTk_x);
  }
}

/** @final */
export class FeDiffuseLighting_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg fediffuselighting", opntagTk_x);
  }
}

/** @final */
export class FeDisplacementMap_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg fedisplacementmap", opntagTk_x);
  }
}

/** @final */
export class FeDistantLight_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg fedistantlight", opntagTk_x);
  }
}

/** @final */
export class FeDropShadow_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg fedropshadow", opntagTk_x);
  }
}

/** @final */
export class FeFlood_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg feflood", opntagTk_x);
  }
}

/** @final */
export class FeFuncA_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg fefunca", opntagTk_x);
  }
}

/** @final */
export class FeFuncB_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg fefuncb", opntagTk_x);
  }
}

/** @final */
export class FeFuncG_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg fefuncg", opntagTk_x);
  }
}

/** @final */
export class FeFuncR_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg fefuncr", opntagTk_x);
  }
}

/** @final */
export class FeGaussianBlur_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg fegaussianblur", opntagTk_x);
  }
}

/** @final */
export class FeImage_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg feimage", opntagTk_x);
  }
}

/** @final */
export class FeMerge_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg femerge", opntagTk_x);
  }
}

/** @final */
export class FeMergeNode_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg femergenode", opntagTk_x);
  }
}

/** @final */
export class FeMorphology_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg femorphology", opntagTk_x);
  }
}

/** @final */
export class FeOffset_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg feoffset", opntagTk_x);
  }
}

/** @final */
export class FePointLight_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg fepointlight", opntagTk_x);
  }
}

/** @final */
export class FeSpotLight_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg fespotlight", opntagTk_x);
  }
}

/** @final */
export class FeSpecularLighting_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg fespecularlighting", opntagTk_x);
  }
}

/** @final */
export class FeTile_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg fetile", opntagTk_x);
  }
}

/** @final */
export class FeTurbulence_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg feturbulence", opntagTk_x);
  }
}

/** @final */
export class Filter_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg filter", opntagTk_x);
  }
}

/** @final */
export class G_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg g", opntagTk_x);
  }
}

/** @final */
export class Image_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg image", opntagTk_x);
  }
}

/** @final */
export class Line_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg line", opntagTk_x);
  }
}

/** @final */
export class LinearGradient_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg lineargradient", opntagTk_x);
  }
}

/** @final */
export class Marker_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg marker", opntagTk_x);
  }
}

/** @final */
export class Mask_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg mask", opntagTk_x);
  }
}

/** @final */
export class Metadata_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg metadata", opntagTk_x);
  }
}

/** @final */
export class Mpath_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg mpath", opntagTk_x);
  }
}

/** @final */
export class Path_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg path", opntagTk_x);
  }
}

/** @final */
export class Pattern_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg pattern", opntagTk_x);
  }
}

/** @final */
export class Polygon_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg polygon", opntagTk_x);
  }
}

/** @final */
export class Polyline_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg polyline", opntagTk_x);
  }
}

/** @final */
export class RadialGradient_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg radialgradient", opntagTk_x);
  }
}

/** @final */
export class Rect_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg rect", opntagTk_x);
  }
}

/** @final */
export class Script_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg script", opntagTk_x);
  }
}

/** @final */
export class Set_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg set", opntagTk_x);
  }
}

/** @final */
export class Stop_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg stop", opntagTk_x);
  }
}

/** @final */
export class Style_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg style", opntagTk_x);
  }
}

/** @final */
export class Svg_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg svg", opntagTk_x);
  }
}

/** @final */
export class Switch_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg switch", opntagTk_x);
  }
}

/** @final */
export class Symbol_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg symbol", opntagTk_x);
  }
}

/** @final */
export class Text_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg text", opntagTk_x);
  }
}

/** @final */
export class TextPath_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg textpath", opntagTk_x);
  }
}

/** @final */
export class Tspan_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg tspan", opntagTk_x);
  }
}

/** @final */
export class Use_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg use", opntagTk_x);
  }
}

/** @final */
export class View_SVG extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg view", opntagTk_x);
  }
}
/*64----------------------------------------------------------*/
/* [MathML elements](https://developer.mozilla.org/en-US/docs/Web/MathML/Reference/Element) */

/** @final */
export class Annotation_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math annotation", opntagTk_x);
  }
}

/** @final */
export class Error_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math merror", opntagTk_x);
  }
}

/** @final */
export class Frac_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math mfrac", opntagTk_x);
  }
}

/** @final */
export class Math_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math math", opntagTk_x);
  }
}

/** @final */
export class Multiscripts_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math mmultiscripts", opntagTk_x);
  }
}

/** @final */
export class Over_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math mover", opntagTk_x);
  }
}

/** @final */
export class Padded_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math mpadded", opntagTk_x);
  }
}

/** @final */
export class Phantom_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math mphantom", opntagTk_x);
  }
}

/** @final */
export class Prescripts_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math mprescripts", opntagTk_x);
  }
}

/** @final */
export class Root_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math mroot", opntagTk_x);
  }
}

/** @final */
export class Row_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math mrow", opntagTk_x);
  }
}

/** @final */
export class Semantics_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math semantics", opntagTk_x);
  }
}

/** @final */
export class Space_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math mspace", opntagTk_x);
  }
}

/** @final */
export class Sqrt_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math msqrt", opntagTk_x);
  }
}

/** @final */
export class Style_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math mstyle", opntagTk_x);
  }
}

/** @final */
export class Sub_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math msub", opntagTk_x);
  }
}

/** @final */
export class Subsup_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math msubsup", opntagTk_x);
  }
}

/** @final */
export class Sup_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math msup", opntagTk_x);
  }
}

/** @final */
export class Table_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math mtable", opntagTk_x);
  }
}

/** @final */
export class Td_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math mtd", opntagTk_x);
  }
}

/** @final */
export class Tr_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math mtr", opntagTk_x);
  }
}

/** @final */
export class Under_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math munder", opntagTk_x);
  }
}

/** @final */
export class Underover_MathML extends OrdinaryForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math munderover", opntagTk_x);
  }
}
/*80--------------------------------------------------------------------------*/
