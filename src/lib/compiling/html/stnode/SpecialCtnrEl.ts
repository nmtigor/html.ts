/** 80**************************************************************************
 * @module lib/compiling/html/stnode/SpecialCtnrEl
 * @license MIT
 ******************************************************************************/

import { ContCat, NestCat, TextCat } from "../alias.ts";
import type { HTMLTk } from "../HTMLTk.ts";
import { CtnrEl } from "./CtnrEl.ts";
/*80--------------------------------------------------------------------------*/

export abstract class SpecialCtnrEl extends CtnrEl {
  /**
   * @const @param tagname_x
   * @const @param tk_x
   */
  constructor(tagname_x: string, tk_x: HTMLTk) {
    super(tagname_x, tk_x);
    this.nestCat$ = NestCat.special;
  }
}

abstract class SpecialForeignEl extends SpecialCtnrEl {
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
export class Address_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("address", opntagTk_x);
    this.contCat$ = ContCat.flow | ContCat.palpable;
  }
}

/** @final */
export class Article_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("article", opntagTk_x);
    this.contCat$ = ContCat.sectioning | ContCat.palpable;
  }
}

/** @final */
export class Aside_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("aside", opntagTk_x);
    this.contCat$ = ContCat.sectioning | ContCat.palpable;
  }
}

/** @final */
export class Blockquote_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("blockquote", opntagTk_x);
    this.contCat$ = ContCat.flow | ContCat.palpable;
  }
}

/** @final */
export class Button_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("button", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.interactive | ContCat.palpable |
      ContCat.form_associated | ContCat.labelable;
  }
}

/** @final */
export class Caption_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("caption", opntagTk_x);
  }
}

/** @final */
export class Code_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("code", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Dd_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("dd", opntagTk_x);
  }
}

/** @final */
export class Del_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("del", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Details_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("details", opntagTk_x);
    this.contCat$ = ContCat.interactive | ContCat.palpable;
  }
}

/** @final */
export class Div_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("div", opntagTk_x);
    this.contCat$ = ContCat.flow | ContCat.palpable;
  }
}

/** @final */
export class Dl_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("dl", opntagTk_x);
    this.contCat$ = ContCat.flow;
    /*llll `| ContCat.palpable` when adding child
    see [4.4.9 The dl element](https://html.spec.whatwg.org/multipage/grouping-content.html#the-dl-element)
     */
  }
}

/** @final */
export class Dt_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("dt", opntagTk_x);
  }
}

/** @final */
export class Fieldset_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("fieldset", opntagTk_x);
    this.contCat$ = ContCat.form_associated | ContCat.palpable;
  }
}

/** @final */
export class Figcaption_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("figcaption", opntagTk_x);
  }
}

/** @final */
export class Figure_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("figure", opntagTk_x);
    this.contCat$ = ContCat.flow | ContCat.palpable;
  }
}

/** @final */
export class Footer_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("footer", opntagTk_x);
    this.contCat$ = ContCat.flow | ContCat.palpable;
  }
}

/** @final */
export class Form_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("form", opntagTk_x);
    this.contCat$ = ContCat.flow | ContCat.palpable;
  }
}

/** @final */
export class H1_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("h1", opntagTk_x);
    this.contCat$ = ContCat.heading | ContCat.palpable;
  }
}

/** @final */
export class H2_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("h2", opntagTk_x);
    this.contCat$ = ContCat.heading | ContCat.palpable;
  }
}

/** @final */
export class H3_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("h3", opntagTk_x);
    this.contCat$ = ContCat.heading | ContCat.palpable;
  }
}

/** @final */
export class H4_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("h4", opntagTk_x);
    this.contCat$ = ContCat.heading | ContCat.palpable;
  }
}

/** @final */
export class H5_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("h5", opntagTk_x);
    this.contCat$ = ContCat.heading | ContCat.palpable;
  }
}

/** @final */
export class H6_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("h6", opntagTk_x);
    this.contCat$ = ContCat.heading | ContCat.palpable;
  }
}

/** @final */
export class Header_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("header", opntagTk_x);
    this.contCat$ = ContCat.flow | ContCat.palpable;
  }
}

/** @final */
export class Hgroup_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("hgroup", opntagTk_x);
    this.contCat$ = ContCat.heading | ContCat.palpable;
  }
}

/** @final */
export class Iframe_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("iframe", opntagTk_x);
    this.contCat$ = ContCat.embedded | ContCat.interactive | ContCat.palpable;
  }
}

/** @final */
export class Ins_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("ins", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.palpable;
  }
}

/** @final */
export class Li_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("li", opntagTk_x);
  }
}

/** @final */
export class Main_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("main", opntagTk_x);
    this.contCat$ = ContCat.flow | ContCat.palpable;
  }
}

/** @final */
export class Menu_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("menu", opntagTk_x);
    this.contCat$ = ContCat.flow;
    /*llll `| ContCat.palpable` when adding child
    see [4.4.7 The menu element](https://html.spec.whatwg.org/multipage/grouping-content.html#the-menu-element)
     */
  }
}

/** @final */
export class Nav_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("nav", opntagTk_x);
    this.contCat$ = ContCat.sectioning | ContCat.palpable;
  }
}

/** @final */
export class Noscript_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("noscript", opntagTk_x);
    this.contCat$ = ContCat.metadata | ContCat.phrasing;
  }
}

/** @final */
export class Object_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("object", opntagTk_x);
    this.contCat$ = ContCat.embedded | ContCat.phrasing |
      ContCat.form_associated;
  }
}

/** @final */
export class Ol_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("ol", opntagTk_x);
    this.contCat$ = ContCat.flow;
    /*llll `| ContCat.palpable` when adding child
    see [4.4.5 The ol element](https://html.spec.whatwg.org/multipage/grouping-content.html#the-ol-element)
     */
  }
}

/** @final */
export class Pre_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("pre", opntagTk_x);
    this.contCat$ = ContCat.flow | ContCat.palpable;
  }
}

/** @final */
export class Script_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("script", opntagTk_x);
    this.textCat$ = TextCat.raw_text;
    this.contCat$ = ContCat.metadata | ContCat.phrasing |
      ContCat.script_supporing;
  }
}

/** @final */
export class Search_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("search", opntagTk_x);
    this.contCat$ = ContCat.flow | ContCat.palpable;
  }
}

/** @final */
export class Section_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("section", opntagTk_x);
    this.contCat$ = ContCat.sectioning | ContCat.palpable;
  }
}

/** @final */
export class Select_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("select", opntagTk_x);
    this.contCat$ = ContCat.phrasing | ContCat.interactive | ContCat.palpable |
      ContCat.form_associated | ContCat.labelable;
  }
}

/** @final */
export class Style_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("style", opntagTk_x);
    this.textCat$ = TextCat.raw_text;
    this.contCat$ = ContCat.metadata;
  }
}

/** @final */
export class Summary_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("summary", opntagTk_x);
  }
}

/** @final */
export class Table_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("table", opntagTk_x);
    this.contCat$ = ContCat.flow | ContCat.palpable;
  }
}

/** @final */
export class Td_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("td", opntagTk_x);
  }
}

/** @final */
export class Template_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("template", opntagTk_x);
    this.textCat$ = TextCat.template;
    this.contCat$ = ContCat.metadata | ContCat.phrasing |
      ContCat.script_supporing;
  }
}

/** @final */
export class Textarea_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("textarea", opntagTk_x);
    this.textCat$ = TextCat.escapable_raw_text;
    this.contCat$ = ContCat.phrasing | ContCat.interactive | ContCat.palpable |
      ContCat.form_associated | ContCat.labelable;
  }
}

/** @final */
export class Tfoot_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("tfoot", opntagTk_x);
  }
}

/** @final */
export class Th_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("th", opntagTk_x);
  }
}

/** @final */
export class Thead_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("thead", opntagTk_x);
  }
}

/** @final */
export class Title_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("title", opntagTk_x);
    this.textCat$ = TextCat.escapable_raw_text;
    this.contCat$ = ContCat.metadata;
  }
}

/** @final */
export class Ul_El extends SpecialCtnrEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("ul", opntagTk_x);
    this.contCat$ = ContCat.flow;
    /*llll `| ContCat.palpable` when adding child
    see [4.4.6 The ul element](https://html.spec.whatwg.org/multipage/grouping-content.html#the-ul-element)
     */
  }
}
/*64----------------------------------------------------------*/

/** @final */
export class ForeignObject_SVG extends SpecialForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg foreignObject", opntagTk_x);
  }
}

/** @final */
export class Desc_SVG extends SpecialForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg desc", opntagTk_x);
  }
}

/** @final */
export class Title_SVG extends SpecialForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("svg title", opntagTk_x);
  }
}
/*64----------------------------------------------------------*/

/** @final */
export class I_MathML extends SpecialForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math mi", opntagTk_x);
  }
}

/** @final */
export class O_MathML extends SpecialForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math mo", opntagTk_x);
  }
}

/** @final */
export class N_MathML extends SpecialForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math mn", opntagTk_x);
  }
}

/** @final */
export class S_MathML extends SpecialForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math ms", opntagTk_x);
  }
}

/** @final */
export class Text_MathML extends SpecialForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math mtext", opntagTk_x);
  }
}

/** @final */
export class AnnotationXml_MathML extends SpecialForeignEl {
  /** @const @param opntagTk_x */
  constructor(opntagTk_x: HTMLTk) {
    super("math annotation-xml", opntagTk_x);
  }
}
/*80--------------------------------------------------------------------------*/
