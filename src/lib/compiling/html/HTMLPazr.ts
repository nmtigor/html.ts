/** 80**************************************************************************
 * @module lib/compiling/html/HTMLPazr
 * @license MIT
 ******************************************************************************/

import * as Is from "@fe-lib/util/is.ts";
import { DEBUG, INOUT } from "@fe-src/preNs.ts";
import type { int, uint } from "../../alias.ts";
import { assert, fail } from "../../util.ts";
import type { Loc } from "../Loc.ts";
import { Pazr } from "../Pazr.ts";
import { g_ran_fac } from "../RanFac.ts";
import { Ranval } from "../Ranval.ts";
import type { Token } from "../Token.ts";
import { ErrMsg } from "../util.ts";
import type { HTMLLexr } from "./HTMLLexr.ts";
import { HTMLTk } from "./HTMLTk.ts";
import { HTMLTok } from "./HTMLTok.ts";
import type { ErrRepr } from "./alias.ts";
import { NestCat, State, TagNS } from "./alias.ts";
import { Body_El } from "./stnode/Body_El.ts";
import { Colgroup_El } from "./stnode/Colgroup_El.ts";
import { CtnrEl } from "./stnode/CtnrEl.ts";
import { Doment } from "./stnode/Doment.ts";
import { Elment } from "./stnode/Elment.ts";
import { FmtingEl } from "./stnode/FmtingEl.ts";
import type { HTMLSn } from "./stnode/HTMLSn.ts";
import { HTML_El } from "./stnode/HTML_El.ts";
import { Head_El } from "./stnode/Head_El.ts";
import { P_El } from "./stnode/P_El.ts";
import { Proins } from "./stnode/Proins.ts";
import {
  Form_El,
  Iframe_El,
  Noscript_El,
  Script_El,
  SpecialCtnrEl,
  Style_El,
  Template_El,
  Textarea_El,
  Title_El,
} from "./stnode/SpecialCtnrEl.ts";
import { Tbody_El } from "./stnode/Tbody_El.ts";
import { Tr_El } from "./stnode/Tr_El.ts";
import type { HTMLCtnr } from "./stnode/alias.ts";
import type { Tag_LI } from "./util.ts";
import { createEl_tk, tfrAttrs } from "./util_1.ts";
/*80--------------------------------------------------------------------------*/

/* deno-fmt-ignore */
/** "insertion mode" */
const enum Insmod_ {
  initial,
  before_html,
  before_head, in_head, in_head_noscript, after_head,
  in_body, after_body, after_after_body,
  text,
  in_table, in_table_text, in_table_body,
  in_caption, 
  in_column_group, 
  in_row,
  in_cell,
  in_template,
}

const inheadTn_a_ = /* deno-fmt-ignore */ [
  "base", "link", "meta", "script", "style", "template", "title"
];

const tccc = ["caption", "col", "colgroup"];
const thbf = ["thead", "tbody", "tfoot"];
const trhd = ["th", "tr", "td"];
const thbf_1 = ["table", ...thbf, "tr"];

/** [generate implied end tags](https://html.spec.whatwg.org/multipage/parsing.html#generate-implied-end-tags) */
const autoClozTn_a_ = ["dd", "dt", "li", "optgroup", "option", "p", "rp", "rt"];
const autoClozTn_1_a_ = [...autoClozTn_a_, ...thbf, ...trhd];
/** [generate all implied end tags thoroughly](https://html.spec.whatwg.org/multipage/parsing.html#generate-all-implied-end-tags-thoroughly) */
const autoClozTn_2_a_ = [...autoClozTn_1_a_, "caption", "colgroup"];
const autoClozTn_3_a_ = ["html", "body", ...autoClozTn_1_a_];

/** [particular element in scope](https://html.spec.whatwg.org/multipage/parsing.html#has-an-element-in-scope) */
const scopeTn_a_ = /* deno-fmt-ignore */ [
  "html",
  "table", "caption", "td", "th",
  "object",
  "select",
  "template",
  "math mi", "math mo", "math mn", "math ms", "math mtext",
  "math annotation-xml",
  "svg foreignObject", "svg desc", "svg title",
];
/** [have a particular element in list item scope](https://html.spec.whatwg.org/multipage/parsing.html#has-an-element-in-list-item-scope) */
const listitemScopeTn_a_ = [...scopeTn_a_, "ol", "ul"];
/** [have a particular element in button scope](https://html.spec.whatwg.org/multipage/parsing.html#has-an-element-in-button-scope) */
const buttonScopeTn_a_ = [...scopeTn_a_, "button"];
/** [have a particular element in table scope](https://html.spec.whatwg.org/multipage/parsing.html#has-an-element-in-table-scope) */
const tableScopeTn_a_ = ["html", "table", "template"];

const p_a_ = /* deno-fmt-ignore */ [
  "address", "article", "aside", "blockquote", "details", "dialog", "div", 
  "dl", "fieldset", "figcaption", "figure", "footer", "header", "hgroup", 
  "main", "menu", "nav", "ol", "search", "section", "summary", "ul"
];
const hn_a_ = ["h1", "h2", "h3", "h4", "h5", "h6"];
/** formatting elements excluding "a" */
const f_a_ = ["b", "code", "em", "i", "s", "small", "strong", "u"];
/** for insertion mode */
const im_a_ = /* deno-fmt-ignore */ [ ...f_a_, ...hn_a_,
  "blockquote", "body", "br", "dd", "div", "dl", "dt", "embed", "head", "hr", 
  "img", "li", "menu", "meta", "ol", "p", "pre", "ruby", "span", "sub", "sup", 
  "table", "ul", "var"
];
/** Part of void elements */
const v_a_ = ["area", "br", "embed", "img", "wbr"];

/** [MathML text integration point](https://html.spec.whatwg.org/multipage/parsing.html#mathml-text-integration-point) */
const isMathIntp = (el_x: CtnrEl): boolean => {
  return el_x.tagname === "math mi" ||
    el_x.tagname === "math mo" ||
    el_x.tagname === "math mn" ||
    el_x.tagname === "math ms" ||
    el_x.tagname === "math mtext";
};
/** [MathML text integration point](https://html.spec.whatwg.org/multipage/parsing.html#mathml-text-integration-point) */
const isHTMLIntp = (el_x: CtnrEl): boolean => {
  if (el_x.tagname === "math annotation-xml") {
    const av_ = el_x.attrs_$.getAv("encoding")?.toLowerCase();
    return av_ === "text/html" || av_ === "application/xhtml+xml";
  }
  return el_x.tagname === "svg foreignObject" ||
    el_x.tagname === "svg desc" ||
    el_x.tagname === "svg title";
};
/*64----------------------------------------------------------*/

type ClozTnP_ = {
  /** tag name to close */
  tn: string;
  /** tag names to auto-close */
  allTns: string[];
  /** outlier tag name */
  olrTn?: string;
  errTk?: HTMLTk;
};

/** @final */
class Opnels_ extends Array<CtnrEl> {
  readonly #host!: HTMLPazr;

  /** @const @param host_x */
  static create(host_x: HTMLPazr): Opnels_ {
    const ret = new Opnels_();
    (ret as any).#host = host_x;
    return ret;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** "current node", or `Doment` if `this` is empty */
  get tip(): CtnrEl | undefined {
    return this.at(-1);
  }

  /**
   * @const
   * @const @param el_x
   */
  getiEl(el_x: CtnrEl): uint | -1 {
    for (let i = this.length; i--;) {
      if (el_x === this[i]) return i;
    }
    return -1;
  }
  /**
   * @const
   * @const @param tn_x
   * @const @param it_x index of top boundary, inclusive
   */
  getiTn(tn_x: string, it_x: uint = 0): uint | -1 {
    for (let i = this.length; i-- > it_x;) {
      if (tn_x === this[i].tagname) return i;
    }
    return -1;
  }

  /**
   * @const
   * @const @param el_x
   */
  hasEl(el_x: CtnrEl): boolean {
    for (let i = this.length; i--;) {
      if (el_x === this[i]) return true;
    }
    return false;
  }
  /**
   * @const
   * @const @param tn_x
   */
  hasTn(tn_x: string): boolean {
    for (let i = this.length; i--;) {
      if (tn_x === this[i].tagname) return true;
    }
    return false;
  }

  /**
   * @const
   * @const @param tns_x
   * @return The first (in reverse order) CtnrEl not in `tns_x`
   */
  hasOnlyTns(tns_x: string[]): CtnrEl | undefined {
    for (let i = this.length; i--;) {
      const el_i = this[i];
      if (!tns_x.includes(el_i.tagname)) return el_i;
    }
    return undefined;
  }

  /**
   * [have an element target node in a specific scope](https://html.spec.whatwg.org/multipage/parsing.html#has-an-element-in-the-specific-scope)
   * @const
   * @const @param el_x
   * @const @param scope_x
   */
  iScopingEl(scope_x: string[], el_x: CtnrEl): uint | -1 {
    for (let i = this.length; i--;) {
      const el_i = this[i];
      if (el_x === el_i) return i;
      if (scope_x.includes(el_i.tagname)) return -1;
    }
    return -1;
  }
  /**
   * [have an element target node in a specific scope](https://html.spec.whatwg.org/multipage/parsing.html#has-an-element-in-the-specific-scope)
   * @const
   * @const @param scope_x
   * @const @param tns_x
   */
  scopingTns(scope_x: string[], ...tns_x: string[]): boolean {
    for (let i = this.length; i--;) {
      const tn_i = this[i].tagname;
      if (tns_x.includes(tn_i)) return true;
      if (scope_x.includes(tn_i)) return false;
    }
    return false;
  }
  /**
   * [have an element target node in a specific scope](https://html.spec.whatwg.org/multipage/parsing.html#has-an-element-in-the-specific-scope)
   * @const
   * @const @param scope_x
   * @const @param tns_x
   */
  iScopingTns(scope_x: string[], ...tns_x: string[]): uint | -1 {
    for (let i = this.length; i--;) {
      const tn_i = this[i].tagname;
      if (tns_x.includes(tn_i)) return i;
      if (scope_x.includes(tn_i)) return -1;
    }
    return -1;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * [13.2.6.3 Closing elements that have implied end tags](https://html.spec.whatwg.org/multipage/parsing.html#closing-elements-that-have-implied-end-tags)\
   * @const @param allTns_x
   * @const @param olrTn_x outlier tag name
   */
  clozAllTns(allTns_x: string[], olrTn_x?: string): CtnrEl {
    let tip;
    for (
      tip = this.pop();
      tip && allTns_x.includes(tip.tagname) && olrTn_x !== tip.tagname;
      tip = this.pop()
    );
    /*#static*/ if (INOUT) {
      assert(tip);
    }
    this.push(tip!);
    return tip!;
  }

  /** @const @param tns_x inclusive */
  clozTo_inclu(...tns_x: string[]): CtnrEl | undefined {
    let tipd;
    for (
      tipd = this.pop();
      tipd && !tns_x.includes(tipd.tagname);
      tipd = this.pop()
    );
    return tipd;
  }
  /**
   * [clear the stack back to a table context](https://html.spec.whatwg.org/multipage/parsing.html#clear-the-stack-back-to-a-table-context)\
   * [clear the stack back to a table body context](https://html.spec.whatwg.org/multipage/parsing.html#clear-the-stack-back-to-a-table-body-context)
   * @const @param tns_x exclusive
   */
  clozTo_exclu(...tns_x: string[]): CtnrEl | undefined {
    let tip;
    for (
      tip = this.pop();
      tip && !tns_x.includes(tip.tagname);
      tip = this.pop()
    );
    if (tip) this.push(tip);
    return tip;
  }

  /**
   * [close a p element](https://html.spec.whatwg.org/multipage/parsing.html#close-a-p-element)\
   * `in( this.hasTn(tn))`
   * @const @param tn
   * @const @param allTns
   * @const @param olrTn
   * @const @param errTk
   */
  clozTn({ tn, allTns, olrTn = tn, errTk }: ClozTnP_): CtnrEl | undefined {
    const tip = this.clozAllTns(allTns, olrTn);
    if (errTk && tip.tagname !== tn) {
      this.#host.setErr(tip, {
        msg: tip.tagname === "select" && errTk.isOpntag && tip.isIn("table")
          ? ErrMsg.html_table_select_unexp_opntag
          // : errTk.isEndtag && tip.isIn("th", "td")
          : errTk.clozTag("th", "td")
          ? ErrMsg.html_cell_unexp_endtag
          : errTk.isEndtag && tip.isIn("caption")
          ? ErrMsg.html_wrong_endtag
          : errTk.clozTag(...hn_a_, ...p_a_, "li", "object", "pre") ||
              errTk.openTag("dd", "dt", "li")
          ? ErrMsg.html_endtag_early
          : ErrMsg.html_unexp_endtag,
        rv: Ranval.fromRan(errTk.ran_$),
        ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
      });
    }
    return hn_a_.includes(tn)
      ? this.clozTo_inclu(...hn_a_)
      : this.clozTo_inclu(tn);
  }

  /** @const @param retEl_x */
  rmvEl(retEl_x: CtnrEl): CtnrEl | undefined {
    for (let i = this.length; i--;) {
      if (this[i] === retEl_x) {
        this.splice(i, 1);
        return retEl_x;
      }
    }
    return undefined;
  }
}
/*64----------------------------------------------------------*/

/** @const @param _x */
const isMkr_ = (_x: FmtingEl | 0) => Is.int(_x);

class Afels_ extends Array<FmtingEl | 0> {
  static create(): Afels_ {
    return new Afels_();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * Respect "marker"
   * @const
   * @const @param el_x
   */
  getiEl(el_x: FmtingEl): uint | -1 {
    let el_i;
    for (let i = this.length; i-- && !isMkr_(el_i = this[i]);) {
      if (el_i === el_x) return i;
    }
    return -1;
  }
  /**
   * Respect "marker"
   * @const
   * @const @param tn_x
   */
  getiTn(tn_x: string): uint | -1 {
    let el_i;
    for (let i = this.length; i-- && !isMkr_(el_i = this[i]);) {
      if (el_i.tagname === tn_x) return i;
    }
    return -1;
  }

  /**
   * Respect "marker"
   * @const
   * @const @param tn_x
   */
  hasTn(tn_x: string): boolean {
    let el_i;
    for (let i = this.length; i-- && !isMkr_(el_i = this[i]);) {
      if (el_i.tagname === tn_x) return true;
    }
    return false;
  }

  //jjjj TOCLEANUP
  // /**
  //  * Respect "marker"\
  //  * `in( this.hasTn(tn_x))`
  //  * @const
  //  * @const @param tn_x
  //  */
  // getiFrstTn(tn_x: string): uint | -1 {
  //   let i_ = -1, el_j;
  //   for (let j = this.length; j-- && !isMkr_(el_j = this[j]);) {
  //     if (el_j.tagname === tn_x) i_ = j;
  //   }
  //   return i_!;
  // }
  /**
   * Respect "marker"\
   * `in( this.hasTn(tn_x))`
   * @const
   * @const @param tn_x
   */
  getiLastTn(tn_x: string): uint | -1 {
    let i_ = -1, el_j;
    for (let j = this.length; j-- && !isMkr_(el_j = this[j]);) {
      if (el_j.tagname === tn_x) {
        i_ = j;
        break;
      }
    }
    return i_!;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * [clear the list of active formatting elements up to the last marker](https://html.spec.whatwg.org/multipage/parsing.html#clear-the-list-of-active-formatting-elements-up-to-the-last-marker)\
   * Respect "marker"
   */
  clear(): void {
    for (let last = this.pop(); last && !isMkr_(last); last = this.pop());
  }

  apdMrk(): void {
    this.push(0);
  }

  /** @const @param el_x */
  apdEl(el_x: FmtingEl): void {
    let n_ = 0;
    let el_i;
    for (let i = this.length; i-- && !isMkr_(el_i = this[i]);) {
      if (
        el_i.tagname === el_x.tagname &&
        /* "attributes must be compared as they were when the elements were
        created"
        */ el_i.attrs_$.eql(el_x.attrs_$)
        // /* "attributes must be compared as they were when the elements were
        // created"
        // */ (el_i.opntagTk === undefined && el_x.opntagTk === undefined ||
        //   el_i.opntagTk?.lexdInfo && el_x.opntagTk?.lexdInfo &&
        //     (el_i.opntagTk.lexdInfo as Tag_LI).attrs
        //       .eql((el_x.opntagTk.lexdInfo as Tag_LI).attrs))
      ) n_ += 1;
      if (n_ === 3) {
        this.splice(i, 1);
        break;
      }
    }
    this.push(el_x);
  }
}
/*64----------------------------------------------------------*/

/** @final */
export class HTMLPazr extends Pazr<HTMLTok> {
  declare protected lexr$: HTMLLexr;
  /** @headconst @param prevTk_x */
  #insDumpTkAftr(prevTk_x: Token<any>): HTMLTk {
    const retTk = prevTk_x.insNext(
      new HTMLTk(
        this.lexr$,
        g_ran_fac.byLoc(prevTk_x.sntStopLoc),
        HTMLTok.placeholder,
      ),
    );
    return this.lexr$.insScandTk_$(retTk);
  }
  /** @headconst @param prevTk_x */
  #insDumpTkBefo(nextTk_x: Token<any>): HTMLTk {
    const retTk = nextTk_x.insPrev(
      new HTMLTk(
        this.lexr$,
        g_ran_fac.byLoc(nextTk_x.sntStrtLoc),
        HTMLTok.placeholder,
      ),
    );
    return this.lexr$.insScandTk_$(retTk);
  }

  protected override root$: Doment | undefined = undefined;
  get _root_() {
    return this.root$;
  }
  override get root(): Doment {
    return this.root$ ??= new Doment(this.#insDumpTkAftr(this.lexr$.frstLexTk));
  }

  override get drtSn(): HTMLCtnr {
    this.drtSn_$ ??= this.root;
    return this.drtSn_$ as HTMLCtnr;
  }

  override get _err_(): ErrRepr[] {
    const retA: ErrRepr[] = [];
    for (const sn of this.errSn_ss$) {
      retA.push(...(sn as HTMLSn)._err_);
    }
    return retA;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  #insmod = Insmod_.initial;
  #origInsmod = this.#insmod;

  /* #opnels */
  /** "stack of open elements" */
  readonly #opnels = Opnels_.create(this);
  get #tip(): HTMLCtnr {
    return this.#opnels.tip ?? this.drtSn;
  }

  get curTagNS(): TagNS {
    const tip = this.#tip;
    return tip instanceof Elment ? tip.ns : TagNS.HTML;
  }

  /** "head element pointer" */
  #head: Head_El | undefined;
  /** "form element pointer" */
  #form: Form_El | undefined;
  /* ~ */

  /** "list of active formatting elements" */
  readonly #afels = Afels_.create();

  /** "stack of template insertion modes" */
  readonly #insmod_a: Insmod_[] = [];

  /** "foster parenting" */
  #fp = false;

  /** "pending table character tokens" */
  readonly #ttxtTk_a: HTMLTk[] = [];

  /** @headconst @param lexr_x */
  constructor(lexr_x: HTMLLexr) {
    super(lexr_x);
  }

  override reset_Pazr(): this {
    this.reset_Pazr$();

    this.#origInsmod = this.#insmod = Insmod_.initial;
    this.#opnels.length = 0;
    this.#head = undefined;
    this.#form = undefined;
    this.#afels.length = 0;
    this.#insmod_a.length = 0;
    this.#fp = false;
    this.#ttxtTk_a.length = 0;

    return this;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @implement */
  protected paz_impl$(): void {
    fail("Disabled");
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * [13.2.6.4.1 The "initial" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#the-initial-insertion-mode)
   * @headconst @param tk_x
   */
  #paz_inital(tk_x: HTMLTk): void {
    /*#static*/ if (INOUT) {
      assert(this.#tip instanceof Doment && !this.#tip.doctype_$);
    }
    const tip_0 = this.#tip as Doment;

    if (tk_x.allWs) {
      /* no-ops */
    } else if (tk_x.value === HTMLTok.comment) {
      tip_0.apdSnt(tk_x);
    } else if (tk_x.value === HTMLTok.proins) {
      tip_0.apdSnt(new Proins(tk_x));
    } else if (tk_x.value === HTMLTok.doctype) {
      tip_0.setDoctype(tk_x)
        .apdSnt(tk_x);
      if (tip_0.isErr) this.errSn_ss$.add(tip_0);

      this.#insmod = Insmod_.before_html;
    } else {
      if (tk_x.value === HTMLTok.tag) {
        this.setErr(
          tip_0,
          (tk_x.lexdInfo as Tag_LI).isEnd
            ? {
              msg: ErrMsg.html_unexp_endtag_doctype,
              rv: Ranval.fromRan(tk_x.ran_$),
            }
            : {
              msg: ErrMsg.html_unexp_opntag_doctype,
              rv: Ranval.fromRan(tk_x.ran_$),
            },
        );
      } else if (tk_x.value === HTMLTok.character) {
        this.setErr(tip_0, {
          msg: ErrMsg.html_unexp_chr_doctype,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      } else if (tk_x.value === HTMLTok.chrref) {
        this.setErr(tip_0, {
          msg: ErrMsg.html_unexp_chr_doctype,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      } else if (tk_x.value === HTMLTok.bogus) {
        this.setErr(tip_0, {
          msg: ErrMsg.html_no_doctype_eof,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      } else {
        this.setErr(tip_0, {
          msg: ErrMsg.html_XXX,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      }

      this.#insmod = Insmod_.before_html;
      this.pazScandTk_$(tk_x);
    }
  }

  /**
   * [13.2.6.4.2 The "before html" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#the-before-html-insertion-mode)
   * @headconst @param tk_x
   */
  #paz_before_html(tk_x: HTMLTk): void {
    /*#static*/ if (INOUT) {
      assert(this.#tip instanceof Doment);
    }
    const tip_0 = this.#tip as Doment;

    const else_ = () => {
      this.#opnels.push(
        this.#insEl(
          new HTML_El(this.#insDumpTkAftr(this.#tip.lastToken_1)),
          tip_0,
        ),
      );

      this.#insmod = Insmod_.before_head;
      this.pazScandTk_$(tk_x);
    };

    if (tk_x.value === HTMLTok.doctype) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_doctype,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else if (tk_x.value === HTMLTok.comment) {
      tip_0.apdSnt(tk_x);
    } else if (tk_x.value === HTMLTok.proins) {
      tip_0.apdSnt(new Proins(tk_x));
    } else if (tk_x.allWs) {
      /* no-ops */
    } else if (tk_x.openTag("html")) {
      this.#opnels.push(
        this.#insEl(new HTML_El(tk_x), tip_0),
      );

      this.#insmod = Insmod_.before_head;
    } else if (tk_x.clozTag("br", "body", "head", "html")) {
      else_();
    } else if (tk_x.isEndtag) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_endtag_html,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else {
      else_();
    }
  }

  /**
   * [13.2.6.4.3 The "before head" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#the-before-head-insertion-mode)
   * @headconst @param tk_x
   */
  #paz_before_head(tk_x: HTMLTk): void {
    /*#static*/ if (INOUT) {
      assert(this.#tip instanceof HTML_El);
    }
    const tip_0 = this.#tip as HTML_El;

    const else_ = () => {
      this.#opnels.push(
        this.#head = this.#insEl(
          new Head_El(this.#insDumpTkAftr(tip_0.lastToken_1)),
          tip_0,
        ),
      );

      this.#insmod = Insmod_.in_head;
      this.pazScandTk_$(tk_x);
    };

    if (tk_x.allWs) {
      /* no-ops */
    } else if (tk_x.value === HTMLTok.comment) {
      tip_0.apdSnt(tk_x);
    } else if (tk_x.value === HTMLTok.proins) {
      tip_0.apdSnt(new Proins(tk_x));
    } else if (tk_x.value === HTMLTok.doctype) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_doctype,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else if (tk_x.openTag("html")) {
      this.#paz_in_body(tk_x);
    } else if (tk_x.openTag("head")) {
      this.#opnels.push(
        this.#head = this.#insEl(new Head_El(tk_x), tip_0),
      );

      this.#insmod = Insmod_.in_head;
    } else if (tk_x.clozTag("br", "body", "head", "html")) {
      else_();
    } else if (tk_x.isEndtag) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_html_unexp_endtag,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else {
      else_();
    }
  }

  /**
   * [13.2.6.4.4 The "in head" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inhead)
   * @headconst @param tk_x
   */
  #paz_in_head(tk_x: HTMLTk): void {
    const tip_0 = this.#tip as CtnrEl;

    const else_ = () => {
      this.#opnels.pop();

      this.#insmod = Insmod_.after_head;
      this.pazScandTk_$(tk_x);
    };

    if (tk_x.allWs) {
      this.#insTk(tk_x, tip_0);
    } else if (tk_x.value === HTMLTok.comment) {
      this.#insTk(tk_x, tip_0);
    } else if (tk_x.value === HTMLTok.proins) {
      this.#insEl(new Proins(tk_x), tip_0);
    } else if (tk_x.value === HTMLTok.doctype) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_doctype,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else if (tk_x.openTag("html")) {
      this.#paz_in_body(tk_x);
    } else if (tk_x.openTag("base", "link")) {
      this.#insEl(createEl_tk(tk_x), tip_0);
    } else if (tk_x.openTag("meta")) {
      this.#insEl(createEl_tk(tk_x), tip_0);
    } else if (tk_x.openTag("title")) {
      this.#intoText(State.RCDATA, createEl_tk(tk_x) as Title_El, tip_0);
    } else if (tk_x.openTag("style")) {
      this.#intoText(State.RAWTEXT, createEl_tk(tk_x) as Style_El, tip_0);
    } else if (tk_x.openTag("noscript")) {
      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, tip_0),
      );

      this.#insmod = Insmod_.in_head_noscript;
    } else if (tk_x.openTag("script")) {
      this.#intoText(State.Script, createEl_tk(tk_x) as Script_El, tip_0);
    } else if (tk_x.clozTag("head")) {
      //jjjj TOCLEANUP
      // tip_0.apdSnt(tk_x);
      this.#opnels.pop();

      this.#insmod = Insmod_.after_head;
    } else if (tk_x.clozTag("br", "body", "html")) {
      else_();
    } else if (tk_x.openTag("template")) {
      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, tip_0),
      );

      this.#afels.apdMrk();

      this.#insmod = Insmod_.in_template;
      this.#insmod_a.push(this.#insmod);
    } else if (tk_x.clozTag("template")) {
      if (this.#opnels.hasTn("template")) {
        this.#opnels
          .clozTn({ tn: "template", allTns: autoClozTn_2_a_, errTk: tk_x });
        //jjjj TOCLEANUP
        // ?.apdSnt(tk_x);
        this.#afels.clear();

        this.#insmod_a.pop();
        this.#resetInsmod();
      } else {
        this.setErr(tip_0, {
          msg: ErrMsg.html_unexp_endtag,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      }
    } else if (tk_x.openTag("head")) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_two_heads,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else if (tk_x.isEndtag) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_endtag,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else {
      else_();
    }
  }

  /**
   * [13.2.6.4.5 The "in head noscript" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inheadnoscript)
   * @headconst @param tk_x
   */
  #paz_in_head_noscript(tk_x: HTMLTk): void {
    /*#static*/ if (INOUT) {
      assert(this.#tip instanceof Noscript_El);
    }
    const tip_0 = this.#tip as Noscript_El;

    const else_ = () => {
      this.setErr(tip_0, {
        msg: tk_x.isChar
          ? ErrMsg.html_noscript_unexp_chr
          : ErrMsg.html_noscript_unexp_tag,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
      this.#opnels.pop();

      this.#insmod = Insmod_.in_head;
      this.pazScandTk_$(tk_x);
    };

    if (tk_x.value === HTMLTok.doctype) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_doctype,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else if (tk_x.openTag("html")) {
      this.#paz_in_body(tk_x);
    } else if (tk_x.clozTag("noscript")) {
      //jjjj TOCLEANUP
      // tip_0.apdSnt(tk_x);
      this.#opnels.pop();

      this.#insmod = Insmod_.in_head;
    } else if (
      tk_x.allWs ||
      tk_x.value === HTMLTok.comment ||
      tk_x.value === HTMLTok.proins ||
      tk_x.openTag("link", "meta", "style")
    ) {
      this.#paz_in_head(tk_x);
    } else if (tk_x.clozTag("br")) {
      else_();
    } else if (tk_x.openTag("head", "noscript")) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_opntag,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else if (tk_x.isEndtag) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_endtag,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else {
      else_();
    }
  }

  /**
   * [13.2.6.4.6 The "after head" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#the-after-head-insertion-mode)
   * @headconst @param tk_x
   */
  #paz_after_head(tk_x: HTMLTk): void {
    /*#static*/ if (INOUT) {
      assert(this.#tip instanceof HTML_El);
    }
    const tip_0 = this.#tip as HTML_El;

    const else_ = () => {
      this.#opnels.push(
        this.#insEl(
          new Body_El(this.#insDumpTkAftr(this.#tip.lastToken_1)),
          tip_0,
        ),
      );

      this.#insmod = Insmod_.in_body;
      this.pazScandTk_$(tk_x);
    };

    if (tk_x.allWs) {
      tip_0.apdSnt(tk_x);
    } else if (tk_x.value === HTMLTok.comment) {
      tip_0.apdSnt(tk_x);
    } else if (tk_x.value === HTMLTok.proins) {
      tip_0.apdSnt(new Proins(tk_x));
    } else if (tk_x.value === HTMLTok.doctype) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_doctype,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else if (tk_x.openTag("html")) {
      this.#paz_in_body(tk_x);
    } else if (tk_x.openTag("body")) {
      this.#opnels.push(
        this.#insEl(new Body_El(tk_x), tip_0),
      );

      this.#insmod = Insmod_.in_body;
    } else if (tk_x.openTag(...inheadTn_a_)) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_head_unexp_opntag,
        rv: Ranval.fromRan(tk_x.ran_$),
      });

      /*#static*/ if (INOUT) {
        assert(this.#head);
      }
      const i_ = this.#opnels.push(this.#head!) - 1;
      this.#paz_in_head(tk_x);
      this.#opnels.splice(i_, 1);
    } else if (tk_x.clozTag("template")) {
      this.#paz_in_head(tk_x);
    } else if (tk_x.clozTag("br", "body", "html")) {
      else_();
    } else if (tk_x.openTag("head")) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_opntag,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else if (tk_x.isEndtag) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_endtag,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else {
      else_();
    }
  }

  /** @headconst @param tk_x */
  #elseEndTag_in_body(tk_x: HTMLTk): CtnrEl | undefined {
    const tn_ = (tk_x.lexdInfo as Tag_LI).tagname_s;
    for (let i = this.#opnels.length; i--;) {
      /** "node" */
      const sn_i = this.#opnels[i];
      if (sn_i.tagname === tn_) {
        return this.#opnels.clozTn({
          tn: tn_,
          allTns: autoClozTn_1_a_,
          errTk: tk_x,
        });
      }
      if (sn_i.nestCat === NestCat.special) {
        this.setErr(sn_i, {
          msg: sn_i.tagname === "select"
            ? ErrMsg.html_select_unexp_endtag
            //jjjj TOCLEANUP
            // : f_a_.includes(tn_)
            // ? ErrMsg.html_aaa_1_3
            : ErrMsg.html_unexp_endtag,
          rv: Ranval.fromRan(tk_x.ran_$),
          ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
        });
        return undefined;
      }
    }
    return undefined;
  }

  /**
   * [13.2.6.4.7 The "in body" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inbody)
   * @headconst @param tk_x
   */
  #paz_in_body(tk_x: HTMLTk): void {
    const tip_0 = this.#tip as CtnrEl;
    if (tk_x.isChar) {
      /* "If the next token is a U+000A LINE FEED (LF) character token"
      */ if ((tk_x.prevToken_$ as HTMLTk).openTag("pre") && tk_x.isLF) {
        //jjjj TOCLEANUP
        // if (tk_x.length_1 > 1) {
        //   using poc_u = tk_x.sntStrtLoc.usingDup().forw();
        //   const tk_1 = tk_x.dup_HTMLTk();
        //   tk_1.setStrt(poc_u)
        //     .lexdInfo = tk_x.lexdInfo;
        //   tk_x.setStop(poc_u)
        //     .lexdInfo = new Chr_LI((tk_1.lexdInfo as Chr_LI).state);
        //   /* `tk_x` is linking to (former) `lsTk$`. No need to link again. */
        //   this.lexr$.lsTk_$ = undefined;
        //   this.lexr$.#lexScandTks(tk_x, tk_1);
        // }
        return;
      }

      this.#reconstructAfelA();
      this.#insTk(tk_x, this.#tip);
    } else if (tk_x.value === HTMLTok.comment) {
      this.#insTk(tk_x, tip_0);
    } else if (tk_x.value === HTMLTok.proins) {
      this.#insEl(new Proins(tk_x), tip_0);
    } else if (tk_x.value === HTMLTok.doctype) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_doctype,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else if (tk_x.openTag("html")) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_nonroot_html,
        rv: Ranval.fromRan(tk_x.ran_$),
      });

      if (!this.#opnels.hasTn("template")) {
        /*#static*/ if (INOUT) {
          assert(this.#opnels[0].tagname === "html");
        }
        tfrAttrs(tk_x, this.#opnels[0]);
      }
    } else if (tk_x.openTag(...inheadTn_a_) || tk_x.clozTag("template")) {
      this.#paz_in_head(tk_x);
    } else if (tk_x.openTag("body")) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_opntag,
        rv: Ranval.fromRan(tk_x.ran_$),
      });

      if (!this.#opnels.hasTn("template")) {
        /*#static*/ if (INOUT) {
          assert(this.#opnels[1].tagname === "body");
        }
        tfrAttrs(tk_x, this.#opnels[1]);
      }
    } else if (tk_x.clozTag("body")) {
      if (this.#opnels.scopingTns(scopeTn_a_, "body")) {
        const sn_ = this.#opnels.hasOnlyTns(autoClozTn_3_a_)
          ?.setErr({
            msg: ErrMsg.html_wrong_endtag,
            rv: Ranval.fromRan(tk_x.ran_$),
            ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
          });
        if (sn_) this.errSn_ss$.add(sn_);
        /* Do not `#opnels.pop()` Body_El, because `#opnels` may still be added
        after "in_body".  */

        this.#insmod = Insmod_.after_body;
      } else {
        this.setErr(tip_0, {
          msg: ErrMsg.html_unexp_endtag,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      }
    } else if (tk_x.clozTag("html")) {
      if (this.#opnels.scopingTns(scopeTn_a_, "body")) {
        const sn_ = this.#opnels.hasOnlyTns(autoClozTn_3_a_)
          ?.setErr({
            msg: ErrMsg.html_wrong_endtag,
            rv: Ranval.fromRan(tk_x.ran_$),
            ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
          });
        if (sn_) this.errSn_ss$.add(sn_);

        this.#insmod = Insmod_.after_body;
        this.pazScandTk_$(tk_x);
      } else {
        this.setErr(tip_0, {
          msg: ErrMsg.html_no_body_scope,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      }
    } else if (tk_x.openTag(...p_a_, "p")) {
      if (this.#opnels.scopingTns(buttonScopeTn_a_, "p")) {
        this.#opnels.clozTn({ tn: "p", allTns: autoClozTn_a_, errTk: tk_x });
      }
      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, this.#tip),
      );
    } else if (tk_x.openTag(...hn_a_)) {
      if (this.#opnels.scopingTns(buttonScopeTn_a_, "p")) {
        this.#opnels.clozTn({ tn: "p", allTns: autoClozTn_a_, errTk: tk_x });
      }
      if (hn_a_.includes((this.#tip as CtnrEl).tagname)) {
        this.setErr(this.#tip, {
          msg: ErrMsg.html_unexp_opntag,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
        this.#opnels.pop();
      }
      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, this.#tip),
      );
    } else if (tk_x.openTag("pre")) {
      if (this.#opnels.scopingTns(buttonScopeTn_a_, "p")) {
        this.#opnels.clozTn({ tn: "p", allTns: autoClozTn_a_, errTk: tk_x });
      }
      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, this.#tip),
      );
    } else if (tk_x.openTag("form")) {
      const ot_ = this.#opnels.hasTn("template");
      if (this.#form && !ot_) {
        this.setErr(tip_0, {
          msg: ErrMsg.html_unexp_opntag,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      } else {
        if (this.#opnels.scopingTns(buttonScopeTn_a_, "p")) {
          this.#opnels.clozTn({ tn: "p", allTns: autoClozTn_a_, errTk: tk_x });
        }
        const el_ = this.#insEl(createEl_tk(tk_x) as Form_El, this.#tip);
        this.#opnels.push(el_);
        if (!ot_) {
          this.#form = el_;
        }
      }
    } else if (tk_x.openTag("li")) {
      for (let i = this.#opnels.length; i--;) {
        const el_i = this.#opnels[i];
        if (el_i.tagname === "li") {
          this.#opnels.clozTn({ tn: "li", allTns: autoClozTn_a_, errTk: tk_x });
          break;
        }
        if (
          el_i.nestCat === NestCat.special &&
          el_i.tagname !== "address" && el_i.tagname !== "div" &&
          el_i.tagname !== "p"
        ) {
          break;
        }
      }
      if (this.#opnels.scopingTns(buttonScopeTn_a_, "p")) {
        this.#opnels.clozTn({ tn: "p", allTns: autoClozTn_a_, errTk: tk_x });
      }
      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, this.#tip),
      );
    } else if (tk_x.openTag("dd", "dt")) {
      for (let i = this.#opnels.length; i--;) {
        const el_i = this.#opnels[i];
        if (el_i.tagname === "dd") {
          this.#opnels.clozTn({ tn: "dd", allTns: autoClozTn_a_, errTk: tk_x });
          break;
        }
        if (el_i.tagname === "dt") {
          this.#opnels.clozTn({ tn: "dt", allTns: autoClozTn_a_, errTk: tk_x });
          break;
        }
        if (
          el_i.nestCat === NestCat.special &&
          el_i.tagname !== "address" && el_i.tagname !== "div" &&
          el_i.tagname !== "p"
        ) {
          break;
        }
      }
      if (this.#opnels.scopingTns(buttonScopeTn_a_, "p")) {
        this.#opnels.clozTn({ tn: "p", allTns: autoClozTn_a_, errTk: tk_x });
      }
      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, this.#tip),
      );
    } else if (tk_x.openTag("button")) {
      if (this.#opnels.scopingTns(scopeTn_a_, "button")) {
        this.setErr(tip_0, {
          msg: ErrMsg.html_unexp_opntag_to_endtag,
          rv: Ranval.fromRan(tk_x.ran_$),
          ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
        });
        this.#opnels.clozTn({ tn: "button", allTns: autoClozTn_a_ });
      }
      this.#reconstructAfelA();
      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, this.#tip),
      );
    } else if (tk_x.clozTag(...p_a_, "button", "pre", "select")) {
      const tn_ = (tk_x.lexdInfo as Tag_LI).tagname_s;
      if (this.#opnels.scopingTns(scopeTn_a_, tn_)) {
        this.#opnels.clozTn({ tn: tn_, allTns: autoClozTn_a_, errTk: tk_x });
        //jjjj TOCLEANUP
        // ?.apdSnt(tk_x);
      } else {
        this.setErr(tip_0, {
          msg: tn_ === "select"
            ? ErrMsg.html_unexp_endtag
            : ErrMsg.html_endtag_early,
          rv: Ranval.fromRan(tk_x.ran_$),
          ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
        });
      }
    } else if (tk_x.clozTag("form")) {
      if (this.#opnels.hasTn("template")) {
        if (this.#opnels.scopingTns(scopeTn_a_, "form")) {
          this.#opnels
            .clozTn({ tn: "form", allTns: autoClozTn_a_, errTk: tk_x });
          //jjjj TOCLEANUP
          // ?.apdSnt(tk_x);
        } else {
          this.setErr(tip_0, { msg: ErrMsg.html_unexp_endtag });
        }
      } else {
        const form = this.#form;
        this.#form = undefined;
        if (form && this.#opnels.iScopingEl(scopeTn_a_, form) >= 0) {
          const tip = this.#opnels.clozAllTns(autoClozTn_a_);
          if (tip !== form) {
            this.setErr(tip, {
              msg: ErrMsg.html_endtag_early_ignored,
              rv: Ranval.fromRan(tk_x.ran_$),
            });
          }
          this.#opnels.rmvEl(form);
          //jjjj TOCLEANUP
          // ?.apdSnt(tk_x);
        } else {
          this.setErr(tip_0, {
            msg: ErrMsg.html_unexp_endtag,
            rv: Ranval.fromRan(tk_x.ran_$),
            ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
          });
        }
      }
    } else if (tk_x.clozTag("p")) {
      if (!this.#opnels.scopingTns(buttonScopeTn_a_, "p")) {
        this.setErr(tip_0, {
          msg: ErrMsg.html_unexp_endtag,
          rv: Ranval.fromRan(tk_x.ran_$),
          ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
        });
        this.#opnels.push(
          this.#insEl(
            new P_El(this.#insDumpTkAftr(this.#tip.lastToken_1)),
            tip_0,
          ),
        );
      }
      this.#opnels.clozTn({ tn: "p", allTns: autoClozTn_a_, errTk: tk_x });
      //jjjj TOCLEANUP
      // ?.apdSnt(tk_x);
    } else if (tk_x.clozTag("li")) {
      if (this.#opnels.scopingTns(listitemScopeTn_a_, "li")) {
        this.#opnels.clozTn({ tn: "li", allTns: autoClozTn_a_, errTk: tk_x });
        //jjjj TOCLEANUP
        // ?.apdSnt(tk_x);
      } else {
        this.setErr(tip_0, {
          msg: ErrMsg.html_unexp_endtag,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      }
    } else if (tk_x.clozTag("dd", "dt")) {
      const tn_ = (tk_x.lexdInfo as Tag_LI).tagname_s;
      if (this.#opnels.scopingTns(scopeTn_a_, tn_)) {
        this.#opnels.clozTn({ tn: tn_, allTns: autoClozTn_a_, errTk: tk_x });
        //jjjj TOCLEANUP
        // ?.apdSnt(tk_x);
      } else {
        this.setErr(tip_0, {
          msg: ErrMsg.html_unexp_endtag,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      }
    } else if (tk_x.clozTag(...hn_a_)) {
      const i_ = this.#opnels.iScopingTns(scopeTn_a_, ...hn_a_);
      if (i_ >= 0) {
        const tn_ = (tk_x.lexdInfo as Tag_LI).tagname_s;
        const olrTn = this.#opnels[i_].tagname;
        this.#opnels
          .clozTn({ tn: tn_, allTns: autoClozTn_a_, olrTn, errTk: tk_x });
        //jjjj TOCLEANUP
        // ?.apdSnt(tk_x);
      } else {
        this.setErr(tip_0, {
          msg: ErrMsg.html_endtag_early,
          rv: Ranval.fromRan(tk_x.ran_$),
          ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
        });
      }
    } else if (tk_x.openTag("a")) {
      let i_ = this.#afels.getiTn("a");
      if (i_ >= 0) {
        const afel = this.#afels[i_] as FmtingEl;

        this.setErr(tip_0, {
          msg: ErrMsg.html_unexp_opntag_to_endtag,
          rv: Ranval.fromRan(tk_x.ran_$),
          ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
        });
        this.#aaa_in_body(tk_x);

        i_ = this.#afels.getiEl(afel);
        if (i_ >= 0) this.#afels.splice(i_, 1);
        i_ = this.#opnels.getiEl(afel);
        if (i_ >= 0) this.#opnels.splice(i_, 1);
      }
      this.#reconstructAfelA();
      const el_ = this.#insEl(FmtingEl.create(tk_x), this.#tip);
      this.#opnels.push(el_);
      this.#afels.apdEl(el_);
    } else if (tk_x.openTag(...f_a_)) {
      this.#reconstructAfelA();
      const el_ = this.#insEl(FmtingEl.create(tk_x), this.#tip);
      this.#opnels.push(el_);
      this.#afels.apdEl(el_);
    } else if (tk_x.clozTag("a", ...f_a_)) {
      this.#aaa_in_body(tk_x);
      //jjjj TOCLEANUP
      // ?.apdSnt(tk_x);
    } else if (tk_x.openTag("object")) {
      this.#reconstructAfelA();
      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, this.#tip),
      );

      this.#afels.apdMrk();
    } else if (tk_x.clozTag("object")) {
      if (this.#opnels.scopingTns(scopeTn_a_, "object")) {
        this.#opnels
          .clozTn({ tn: "object", allTns: autoClozTn_a_, errTk: tk_x });
        //jjjj TOCLEANUP
        // ?.apdSnt(tk_x);

        this.#afels.clear();
      } else {
        this.setErr(tip_0, {
          msg: ErrMsg.html_endtag_early,
          rv: Ranval.fromRan(tk_x.ran_$),
          ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
        });
      }
    } else if (tk_x.openTag("table")) {
      if (this.#opnels.scopingTns(buttonScopeTn_a_, "p")) {
        this.#opnels.clozTn({ tn: "p", allTns: autoClozTn_1_a_, errTk: tk_x });
      }
      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, this.#tip),
      );

      this.#insmod = Insmod_.in_table;
    } else if (tk_x.openTag(...v_a_) || tk_x.clozTag("br")) {
      if (tk_x.clozTag("br")) {
        this.setErr(tip_0, {
          msg: ErrMsg.html_unexp_endtag_as,
          rv: Ranval.fromRan(tk_x.ran_$),
          ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
        });
      }
      this.#reconstructAfelA();
      this.#insEl(createEl_tk(tk_x), this.#tip);
    } else if (tk_x.openTag("input")) {
      if (this.#opnels.scopingTns(scopeTn_a_, "select")) {
        this.setErr(tip_0, {
          msg: ErrMsg.html_select_unexp_input,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
        this.#opnels.clozTo_inclu("select");
      }
      this.#reconstructAfelA();
      this.#insEl(createEl_tk(tk_x), this.#tip);
    } else if (tk_x.openTag("source", "track")) {
      this.#insEl(createEl_tk(tk_x), tip_0);
    } else if (tk_x.openTag("hr")) {
      if (this.#opnels.scopingTns(buttonScopeTn_a_, "p")) {
        this.#opnels.clozTn({ tn: "p", allTns: autoClozTn_a_, errTk: tk_x });
      }
      if (this.#opnels.scopingTns(scopeTn_a_, "select")) {
        this.#opnels.clozAllTns(autoClozTn_a_);
        if (
          this.#opnels.scopingTns(scopeTn_a_, "option") ||
          this.#opnels.scopingTns(scopeTn_a_, "optgroup")
        ) {
          this.setErr(tip_0, { msg: ErrMsg.html_XXX });
        }
      }
      this.#insEl(createEl_tk(tk_x), this.#tip);
    } else if (tk_x.openTag("image")) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_opntag_as,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
      this.#reconstructAfelA();
      this.#insEl(createEl_tk(tk_x), this.#tip);
    } else if (tk_x.openTag("textarea")) {
      this.#intoText(State.RCDATA, createEl_tk(tk_x) as Textarea_El, tip_0);
    } else if (tk_x.openTag("iframe")) {
      this.#intoText(State.RAWTEXT, createEl_tk(tk_x) as Iframe_El, tip_0);
    } else if (tk_x.openTag("select")) {
      if (this.#opnels.scopingTns(scopeTn_a_, "select")) {
        this.setErr(tip_0, {
          msg: ErrMsg.html_select_unexp_select,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
        this.#opnels.clozTo_inclu("select");
      } else {
        this.#reconstructAfelA();
        this.#opnels.push(
          this.#insEl(createEl_tk(tk_x) as CtnrEl, this.#tip),
        );
      }
    } else if (tk_x.openTag("option")) {
      if (this.#opnels.scopingTns(scopeTn_a_, "select")) {
        this.#opnels.clozAllTns(autoClozTn_a_, "optgroup");
        if (this.#opnels.scopingTns(scopeTn_a_, "option")) {
          this.setErr(tip_0, { msg: ErrMsg.html_XXX });
        }
      } else if (tip_0.tagname === "option") {
        this.#opnels.pop();
      }
      this.#reconstructAfelA();
      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, this.#tip),
      );
    } else if (tk_x.openTag("optgroup")) {
      if (this.#opnels.scopingTns(scopeTn_a_, "select")) {
        this.#opnels.clozAllTns(autoClozTn_a_);
        if (
          this.#opnels.scopingTns(scopeTn_a_, "option") ||
          this.#opnels.scopingTns(scopeTn_a_, "optgroup")
        ) {
          this.setErr(tip_0, { msg: ErrMsg.html_XXX });
        }
      } else if (tip_0.tagname === "option") {
        this.#opnels.pop();
      }
      this.#reconstructAfelA();
      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, this.#tip),
      );
    } else if (tk_x.openTag("rp", "rt")) {
      if (this.#opnels.scopingTns(scopeTn_a_, "ruby")) {
        this.#opnels.clozAllTns(autoClozTn_a_);
        if ((this.#tip as CtnrEl).tagname !== "ruby") {
          this.setErr(this.#tip, {
            msg: ErrMsg.html_XXX,
            rv: Ranval.fromRan(tk_x.ran_$),
          });
        }
      }
      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, this.#tip),
      );
    } else if (tk_x.openTag("math")) {
      this.#reconstructAfelA();
      (tk_x.lexdInfo as Tag_LI).ns_$ = TagNS.MathML;
      (tk_x.lexdInfo as Tag_LI).attrs.adjForeignAns();
      const el_ = createEl_tk(tk_x);
      this.#insEl(el_, this.#tip);
      if (!(tk_x.lexdInfo as Tag_LI).selfCloz_$) {
        this.#opnels.push(el_ as CtnrEl);
      }
    } else if (tk_x.openTag("svg")) {
      this.#reconstructAfelA();
      (tk_x.lexdInfo as Tag_LI).ns_$ = TagNS.SVG;
      (tk_x.lexdInfo as Tag_LI).attrs.adjForeignAns();
      const el_ = createEl_tk(tk_x);
      this.#insEl(el_, this.#tip);
      if (!(tk_x.lexdInfo as Tag_LI).selfCloz_$) {
        this.#opnels.push(el_ as CtnrEl);
      }
    } else if (tk_x.openTag(...tccc, ...thbf, ...trhd, "head")) {
      this.setErr(tip_0, {
        msg: tip_0.tagname === "select"
          ? ErrMsg.html_select_unexp_opntag
          : ErrMsg.html_unexp_opntag_ignored,
        rv: Ranval.fromRan(tk_x.ran_$),
        ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
      });
    } else if (tk_x.isOpntag) {
      this.#reconstructAfelA();
      const el_ = createEl_tk(tk_x);
      /*#static*/ if (INOUT) {
        assert(el_.nestCat === NestCat.ordinary || el_.tagname === "noscript");
      }
      this.#insEl(el_, this.#tip);
      if (el_ instanceof CtnrEl) this.#opnels.push(el_);
    } else if (tk_x.isEndtag) {
      this.#elseEndTag_in_body(tk_x);
      //jjjj TOCLEANUP
      // ?.apdSnt(tk_x);
    } else {
      //llll
      // /*#static*/ DEBUG ? fail("Should not run here!") : {};
    }
  }

  /**
   * [13.2.6.4.8 The "text" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-incdata)
   * @headconst @param tk_x
   */
  #paz_text(tk_x: HTMLTk): void {
    const tip_0 = this.#tip;

    if (tk_x.isChar) {
      /* "If the next token is a U+000A LINE FEED (LF) character token"
      */ if ((tk_x.prevToken_$ as HTMLTk).openTag("textarea") && tk_x.isLF) {
        return;
      }

      this.#insTk(tk_x, tip_0);
    } else if (tk_x.clozTag("script")) {
      //jjjj TOCLEANUP
      // tip_0.apdSnt(tk_x);
      this.#opnels.pop();

      this.#insmod = this.#origInsmod;
    } else if (tk_x.isEndtag) {
      tip_0.apdSnt(tk_x);
      this.#opnels.pop();

      this.#insmod = this.#origInsmod;
    } else {
      if (tk_x.value === HTMLTok.bogus) {
        /* no-ops */
      } /*#static*/ else {
        DEBUG ? fail("Should not run here!") : {};
      }
    }
  }

  /**
   * [13.2.6.4.9 The "in table" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-intable)
   * @headconst @param tk_x
   */
  #paz_in_table(tk_x: HTMLTk): void {
    const tip_0 = this.#tip as CtnrEl;

    const else_ = () => {
      this.setErr(tip_0, {
        msg: tk_x.isOpntag
          ? ErrMsg.html_table_voodoo_opntag
          : tk_x.isEndtag
          ? ErrMsg.html_table_voodoo_endtag
          : tk_x.isChar
          ? ErrMsg.html_table_voodoo_char
          : ErrMsg.html_XXX,
        rv: Ranval.fromRan(tk_x.ran_$),
        ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
      });
      this.#fp = true;
      this.#paz_in_body(tk_x);
      this.#fp = false;
    };

    if (
      tk_x.isChar &&
      (thbf_1.includes(tip_0.tagname) || tip_0.tagname === "template")
    ) {
      this.#ttxtTk_a.length = 0;
      this.#origInsmod = this.#insmod;

      this.#insmod = Insmod_.in_table_text;
      this.pazScandTk_$(tk_x);
    } else if (tk_x.value === HTMLTok.comment) {
      this.#insTk(tk_x, tip_0);
    } else if (tk_x.value === HTMLTok.proins) {
      this.#insEl(new Proins(tk_x), tip_0);
    } else if (tk_x.value === HTMLTok.doctype) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_doctype,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else if (tk_x.openTag("caption")) {
      this.#opnels.clozTo_exclu("table", "template");

      this.#afels.apdMrk();

      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, this.#tip),
      );

      this.#insmod = Insmod_.in_caption;
    } else if (tk_x.openTag("colgroup")) {
      this.#opnels.clozTo_exclu("table", "template");
      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, this.#tip),
      );

      this.#insmod = Insmod_.in_column_group;
    } else if (tk_x.openTag("col")) {
      this.#opnels.clozTo_exclu("table", "template");
      this.#opnels.push(
        this.#insEl(
          new Colgroup_El(this.#insDumpTkAftr(this.#tip.lastToken_1)),
          this.#tip,
        ),
      );

      this.#insmod = Insmod_.in_column_group;
      this.pazScandTk_$(tk_x);
    } else if (tk_x.openTag(...thbf)) {
      this.#opnels.clozTo_exclu("table", "template");
      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, this.#tip),
      );

      this.#insmod = Insmod_.in_table_body;
    } else if (tk_x.openTag(...trhd)) {
      this.#opnels.clozTo_exclu("table", "template");
      this.#opnels.push(
        this.#insEl(
          new Tbody_El(this.#insDumpTkAftr(this.#tip.lastToken_1)),
          this.#tip,
        ),
      );

      this.#insmod = Insmod_.in_table_body;
      this.pazScandTk_$(tk_x);
    } else if (tk_x.openTag("table")) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_opntag_to_endtag,
        rv: Ranval.fromRan(tk_x.ran_$),
        ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
      });
      if (this.#opnels.scopingTns(tableScopeTn_a_, "table")) {
        this.#opnels.clozTo_inclu("table");
        this.#resetInsmod();
        this.pazScandTk_$(tk_x);
      }
    } else if (tk_x.clozTag("table")) {
      if (this.#opnels.scopingTns(tableScopeTn_a_, "table")) {
        //jjjj TOCLEANUP
        // tip_0.apdSnt(tk_x);
        this.#opnels.clozTo_inclu("table");
        this.#resetInsmod();
      } else {
        this.setErr(tip_0, {
          msg: ErrMsg.html_unexp_endtag,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      }
    } else if (tk_x.clozTag(...tccc, ...thbf, ...trhd, "body", "html")) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_endtag,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else if (
      tk_x.openTag("style", "script", "template") || tk_x.clozTag("template")
    ) {
      this.#paz_in_head(tk_x);
    } else if (tk_x.openTag("input")) {
      if (
        (tk_x.lexdInfo as Tag_LI)
          .attrs.getAv("type")?.toLowerCase() === "hidden"
      ) {
        this.setErr(tip_0, {
          msg: ErrMsg.html_table_unexp_hidden_input,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
        this.#insEl(createEl_tk(tk_x), tip_0);
      } else {
        else_();
      }
    } else if (tk_x.openTag("form")) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_table_unexp_form,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
      /** "parsing template contents" */
      const ptc = this.#opnels.hasTn("template");
      if (!this.#form || ptc) {
        const el_ = this.#insEl(createEl_tk(tk_x) as Form_El, tip_0);
        if (!ptc) this.#form = el_;
      }
    } else {
      else_();
    }
  }

  #else_in_table_text(): void {
    let nonwsTk: HTMLTk | undefined;
    for (const tk of this.#ttxtTk_a) {
      if (!tk.allWs) {
        nonwsTk = tk;
        break;
      }
    }
    if (nonwsTk) {
      this.setErr(this.#tip, {
        msg: ErrMsg.html_table_voodoo_char,
        rv: Ranval.fromLoc(nonwsTk.sntStopLoc),
      });
      this.#fp = true;
      for (const tk of this.#ttxtTk_a) {
        this.#paz_in_body(tk);
      }
      this.#fp = false;
    } else {
      this.#tip.apdSnt(...this.#ttxtTk_a);
    }
    this.#ttxtTk_a.length = 0;
  }

  /**
   * [13.2.6.4.10 The "in table text" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-intabletext)
   * @headconst @param tk_x
   */
  #paz_in_table_text(tk_x: HTMLTk): void {
    if (tk_x.isChar) {
      this.#ttxtTk_a.push(tk_x);
    } else {
      this.#else_in_table_text();
      this.#insmod = this.#origInsmod;
      this.pazScandTk_$(tk_x);
    }
  }

  /**
   * [13.2.6.4.11 The "in caption" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-incaption)
   * @headconst @param tk_x
   */
  #paz_in_caption(tk_x: HTMLTk): void {
    //jjjj TOCLEANUP e.g. "<table><caption><select>"
    // /*#static*/ if (INOUT) {
    //   assert(this.#tip instanceof Caption_El);
    // }
    const tip_0 = this.#tip as CtnrEl;

    if (tk_x.clozTag("caption")) {
      this.#opnels
        .clozTn({ tn: "caption", allTns: autoClozTn_a_, errTk: tk_x });
      //jjjj TOCLEANUP
      // ?.apdSnt(tk_x);

      this.#afels.clear();

      this.#insmod = Insmod_.in_table;
    } else if (
      tk_x.openTag(...tccc, ...thbf, ...trhd) || tk_x.clozTag("table")
    ) {
      this.#opnels
        .clozTn({ tn: "caption", allTns: autoClozTn_a_, errTk: tk_x });

      this.#afels.clear();

      this.#insmod = Insmod_.in_table;
      this.pazScandTk_$(tk_x);
    } else if (
      tk_x.clozTag("col", "colgroup", ...thbf, ...trhd, "body", "html")
    ) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_endtag,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else {
      this.#paz_in_body(tk_x);
    }
  }

  /**
   * [13.2.6.4.12 The "in column group" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-incolgroup)
   * @headconst @param tk_x
   */
  #paz_in_column_group(tk_x: HTMLTk): void {
    /*#static*/ if (INOUT) {
      assert(
        this.#tip instanceof Colgroup_El || this.#tip instanceof Template_El,
      );
    }
    const tip_0 = this.#tip as Colgroup_El | Template_El;

    if (tk_x.allWs) {
      this.#insTk(tk_x, tip_0);
    } else if (tk_x.value === HTMLTok.comment) {
      this.#insTk(tk_x, tip_0);
    } else if (tk_x.value === HTMLTok.proins) {
      this.#insEl(new Proins(tk_x), tip_0);
    } else if (tk_x.value === HTMLTok.doctype) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_doctype,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else if (tk_x.openTag("html")) {
      this.#paz_in_body(tk_x);
    } else if (tk_x.openTag("col")) {
      this.#insEl(createEl_tk(tk_x), tip_0);
    } else if (tk_x.clozTag("colgroup")) {
      if (tip_0.tagname === "colgroup") {
        //jjjj TOCLEANUP
        // tip_0.apdSnt(tk_x);
        this.#opnels.pop();

        this.#insmod = Insmod_.in_table;
      } else {
        this.setErr(tip_0, {
          msg: ErrMsg.html_unexp_endtag_ignored,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      }
    } else if (tk_x.clozTag("col")) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_no_endtag,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else if (tk_x.openTag("template") || tk_x.clozTag("template")) {
      this.#paz_in_head(tk_x);
    } else {
      if (tip_0.tagname === "colgroup") {
        this.#opnels.pop();

        this.#insmod = Insmod_.in_table;
        this.pazScandTk_$(tk_x);
      } else {
        this.setErr(tip_0, {
          msg: tk_x.isOpntag
            ? ErrMsg.html_unexp_opntag_ignored
            : tk_x.isEndtag
            ? ErrMsg.html_unexp_endtag_ignored
            : ErrMsg.html_unexp_chr,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      }
    }
  }

  /**
   * [13.2.6.4.13 The "in table body" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-intbody)
   * @headconst @param tk_x
   */
  #paz_in_table_body(tk_x: HTMLTk): void {
    //jjjj TOCLEANUP Foster parenting may aply (e.g. "<table><a>")
    // /*#static*/ if (INOUT) {
    //   assert(
    //     this.#tip instanceof Thead_El || this.#tip instanceof Tbody_El ||
    //       this.#tip instanceof Tfoot_El || this.#tip instanceof Template_El,
    //   );
    // }
    const tip_0 = this.#tip as CtnrEl;

    if (tk_x.openTag("tr")) {
      this.#opnels.clozTo_exclu(...thbf, "template");
      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, this.#tip),
      );

      this.#insmod = Insmod_.in_row;
    } else if (tk_x.openTag("th", "td")) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_tbody_unexp_cell,
        rv: Ranval.fromRan(tk_x.ran_$),
        ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
      });
      this.#opnels.clozTo_exclu(...thbf, "template");
      this.#opnels.push(
        this.#insEl(
          new Tr_El(this.#insDumpTkAftr(this.#tip.lastToken_1)),
          this.#tip,
        ),
      );

      this.#insmod = Insmod_.in_row;
      this.pazScandTk_$(tk_x);
    } else if (tk_x.clozTag(...thbf)) {
      const tn_ = (tk_x.lexdInfo as Tag_LI).tagname_s;
      if (this.#opnels.scopingTns(tableScopeTn_a_, tn_)) {
        this.#opnels.clozTo_exclu(...thbf, "template");
        //jjjj TOCLEANUP
        // this.#tip.apdSnt(tk_x);
        this.#opnels.pop();

        this.#insmod = Insmod_.in_table;
      } else {
        this.setErr(tip_0, {
          msg: ErrMsg.html_tbody_unexp_endtag,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      }
    } else if (tk_x.openTag(...tccc, ...thbf) || tk_x.clozTag("table")) {
      if (this.#opnels.scopingTns(tableScopeTn_a_, ...thbf)) {
        this.#opnels.clozTo_exclu(...thbf, "template");
        this.#opnels.pop();

        this.#insmod = Insmod_.in_table;
        this.pazScandTk_$(tk_x);
      } else {
        this.setErr(tip_0, {
          msg: tk_x.isOpntag
            ? ErrMsg.html_tbody_unexp_opntag
            : ErrMsg.html_tbody_unexp_endtag,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      }
    } else if (tk_x.clozTag(...tccc, ...trhd, "body", "html")) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_tbody_unexp_endtag,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else {
      this.#paz_in_table(tk_x);
    }
  }

  /**
   * [13.2.6.4.14 The "in row" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-intr)
   * @headconst @param tk_x
   */
  #paz_in_row(tk_x: HTMLTk): void {
    //jjjj TOCLEANUP Foster parenting may aply (e.g. "<table><tr><select>")
    // /*#static*/ if (INOUT) {
    //   assert(this.#tip instanceof Tr_El || this.#tip instanceof Template_El);
    // }
    const tip_0 = this.#tip as CtnrEl;

    if (tk_x.openTag("th", "td")) {
      this.#opnels.clozTo_exclu("tr", "template");
      this.#opnels.push(
        this.#insEl(createEl_tk(tk_x) as CtnrEl, this.#tip),
      );

      this.#afels.apdMrk();

      this.#insmod = Insmod_.in_cell;
    } else if (tk_x.clozTag("tr")) {
      if (this.#opnels.scopingTns(tableScopeTn_a_, "tr")) {
        this.#opnels.clozTo_exclu("tr", "template");
        //jjjj TOCLEANUP
        // tip_0.apdSnt(tk_x);
        this.#opnels.pop();

        this.#insmod = Insmod_.in_table_body;
      } else {
        this.setErr(tip_0, {
          msg: ErrMsg.html_unexp_endtag,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      }
    } else if (tk_x.openTag(...tccc, ...thbf, "tr") || tk_x.clozTag("table")) {
      if (this.#opnels.scopingTns(tableScopeTn_a_, "tr")) {
        this.#opnels.clozTo_exclu("tr", "template");
        this.#opnels.pop();

        this.#insmod = Insmod_.in_table_body;
        this.pazScandTk_$(tk_x);
      } else {
        this.setErr(tip_0, {
          msg: tk_x.isOpntag
            ? ErrMsg.html_tr_unexp_opntag
            : ErrMsg.html_tr_unexp_endtag,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      }
    } else if (tk_x.clozTag(...thbf)) {
      const tn_ = (tk_x.lexdInfo as Tag_LI).tagname_s;
      if (this.#opnels.scopingTns(tableScopeTn_a_, tn_)) {
        if (this.#opnels.scopingTns(tableScopeTn_a_, "tr")) {
          this.#opnels.clozTo_exclu("tr", "template");
          this.#opnels.pop();

          this.#insmod = Insmod_.in_table_body;
          this.pazScandTk_$(tk_x);
        }
      } else {
        this.setErr(tip_0, { msg: ErrMsg.html_XXX });
      }
    } else if (tk_x.clozTag(...tccc, "td", "th", "body", "html")) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_tr_unexp_endtag,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else {
      this.#paz_in_table(tk_x);
    }
  }

  /**
   * [13.2.6.4.15 The "in cell" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-intd)
   * @headconst @param tk_x
   */
  #paz_in_cell(tk_x: HTMLTk): void {
    const tip_0 = this.#tip as CtnrEl;

    /**
     * [close the cell](https://html.spec.whatwg.org/multipage/parsing.html#close-the-cell)\
     * Assign `#opnels`
     * @primaryconst errTk_x
     */
    const clozCell_ = (errTk_x: HTMLTk) => {
      const tip = this.#opnels.clozAllTns(autoClozTn_a_);
      if (tip.tagname !== "td" && tip.tagname !== "th") {
        this.setErr(tip, {
          msg: tip.tagname === "select" && errTk_x.isOpntag
            ? ErrMsg.html_table_select_unexp_opntag
            : ErrMsg.html_cell_unexp_endtag,
          rv: Ranval.fromRan(errTk_x.ran_$),
          ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
        });
      }
      this.#opnels.clozTo_inclu("td", "th");

      this.#afels.clear();

      this.#insmod = Insmod_.in_row;
    };

    if (tk_x.clozTag("td", "th")) {
      const tn_ = (tk_x.lexdInfo as Tag_LI).tagname_s;
      if (this.#opnels.scopingTns(tableScopeTn_a_, tn_)) {
        this.#opnels.clozTn({ tn: tn_, allTns: autoClozTn_a_, errTk: tk_x });
        //jjjj TOCLEANUP
        // ?.apdSnt(tk_x);

        this.#afels.clear();

        this.#insmod = Insmod_.in_row;
      } else {
        this.setErr(tip_0, {
          msg: ErrMsg.html_unexp_endtag,
          rv: Ranval.fromRan(tk_x.ran_$),
          ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
        });
      }
    } else if (tk_x.openTag(...trhd, ...thbf, ...tccc)) {
      /*#static*/ if (INOUT) {
        assert(this.#opnels.iScopingTns(tableScopeTn_a_, "td", "th") >= 0);
      }
      clozCell_(tk_x);
      this.pazScandTk_$(tk_x);
    } else if (tk_x.clozTag(...tccc, "body", "html")) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_endtag,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else if (tk_x.clozTag("tr", ...thbf, "table")) {
      const tn_ = (tk_x.lexdInfo as Tag_LI).tagname_s;
      if (this.#opnels.scopingTns(tableScopeTn_a_, tn_)) {
        clozCell_(tk_x);
        this.pazScandTk_$(tk_x);
      } else {
        this.setErr(tip_0, {
          msg: ErrMsg.html_cell_unexp_endtag,
          rv: Ranval.fromRan(tk_x.ran_$),
        });
      }
    } else {
      this.#paz_in_body(tk_x);
    }
  }

  /**
   * [13.2.6.4.16 The "in template" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-intemplate)
   * @headconst @param tk_x
   */
  #paz_in_template(tk_x: HTMLTk): void {
    const tip_0 = this.#tip as CtnrEl;

    if (
      tk_x.isChar ||
      tk_x.value === HTMLTok.comment ||
      tk_x.value === HTMLTok.proins ||
      tk_x.value === HTMLTok.doctype
    ) {
      this.#paz_in_body(tk_x);
    } else if (tk_x.openTag(...inheadTn_a_) || tk_x.clozTag("template")) {
      this.#paz_in_head(tk_x);
    } else if (tk_x.openTag(...thbf, "caption", "colgroup")) {
      this.#insmod_a.pop();

      this.#insmod_a.push(this.#insmod = Insmod_.in_table);
      this.pazScandTk_$(tk_x);
    } else if (tk_x.openTag("col")) {
      this.#insmod_a.pop();

      this.#insmod_a.push(this.#insmod = Insmod_.in_column_group);
      this.pazScandTk_$(tk_x);
    } else if (tk_x.openTag("tr")) {
      this.#insmod_a.pop();

      this.#insmod_a.push(this.#insmod = Insmod_.in_table_body);
      this.pazScandTk_$(tk_x);
    } else if (tk_x.openTag("td", "th")) {
      this.#insmod_a.pop();

      this.#insmod_a.push(this.#insmod = Insmod_.in_row);
      this.pazScandTk_$(tk_x);
    } else if (tk_x.isOpntag) {
      this.#insmod_a.pop();

      this.#insmod_a.push(this.#insmod = Insmod_.in_body);
      this.pazScandTk_$(tk_x);
    } else if (tk_x.isEndtag) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_endtag_early_ignored,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else {
      //llll
      // /*#static*/ DEBUG ? fail("Should not run here!") : {};
    }
  }

  /**
   * [13.2.6.4.17 The "after body" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-afterbody)
   * @headconst @param tk_x
   */
  #paz_after_body(tk_x: HTMLTk): void {
    /*#static*/ if (INOUT) {
      assert(this.#opnels.at(0) instanceof HTML_El);
    }
    const htmlEl = this.#opnels[0] as HTML_El;
    if (tk_x.allWs) {
      this.#paz_in_body(tk_x);
    } else if (tk_x.value === HTMLTok.comment) {
      htmlEl.apdSnt(tk_x);
    } else if (tk_x.value === HTMLTok.proins) {
      htmlEl.apdSnt(new Proins(tk_x));
    } else if (tk_x.value === HTMLTok.doctype) {
      this.setErr(htmlEl, {
        msg: ErrMsg.html_unexp_doctype,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else if (tk_x.openTag("html")) {
      this.#paz_in_body(tk_x);
    } else if (tk_x.clozTag("html")) {
      //jjjj TOCLEANUP
      // htmlEl.apdSnt(tk_x);

      this.#insmod = Insmod_.after_after_body;
    } else {
      this.setErr(htmlEl, {
        msg: tk_x.isOpntag
          ? ErrMsg.html_body_unexp_opntag
          : tk_x.isEndtag
          ? ErrMsg.html_body_unexp_endtag
          : ErrMsg.html_body_unexp_chr,
        rv: Ranval.fromRan(tk_x.ran_$),
      });

      this.#insmod = Insmod_.in_body;
      this.pazScandTk_$(tk_x);
    }
  }

  /**
   * [13.2.6.4.20 The "after after body" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#the-after-after-body-insertion-mode)
   * @headconst @param tk_x
   */
  #paz_after_after_body(tk_x: HTMLTk): void {
    /*#static*/ if (INOUT) {
      assert(this.drtSn instanceof Doment);
    }
    const doment = this.drtSn as Doment;
    if (tk_x.value === HTMLTok.comment) {
      doment.apdSnt(tk_x);
    } else if (tk_x.value === HTMLTok.proins) {
      doment.apdSnt(new Proins(tk_x));
    } else if (
      tk_x.value === HTMLTok.doctype || tk_x.allWs || tk_x.openTag("html")
    ) {
      this.#paz_in_body(tk_x);
    } else {
      this.setErr(doment, {
        msg: tk_x.isOpntag
          ? ErrMsg.html_no_eof_opntag
          : tk_x.isEndtag
          ? ErrMsg.html_no_eof_endtag
          : ErrMsg.html_no_eof_chr,
        rv: Ranval.fromRan(tk_x.ran_$),
        ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
      });

      this.#insmod = Insmod_.in_body;
      this.pazScandTk_$(tk_x);
    }
  }

  /** @headconst @param tk_x */
  #paz_in_domestic(tk_x: HTMLTk) {
    /* final switch */ ({
      [Insmod_.initial]: () => this.#paz_inital(tk_x),
      [Insmod_.before_html]: () => this.#paz_before_html(tk_x),
      [Insmod_.before_head]: () => this.#paz_before_head(tk_x),
      [Insmod_.in_head]: () => this.#paz_in_head(tk_x),
      [Insmod_.in_head_noscript]: () => this.#paz_in_head_noscript(tk_x),
      [Insmod_.after_head]: () => this.#paz_after_head(tk_x),
      [Insmod_.in_body]: () => this.#paz_in_body(tk_x),
      [Insmod_.text]: () => this.#paz_text(tk_x),
      [Insmod_.in_table]: () => this.#paz_in_table(tk_x),
      [Insmod_.in_table_text]: () => this.#paz_in_table_text(tk_x),
      [Insmod_.in_caption]: () => this.#paz_in_caption(tk_x),
      [Insmod_.in_column_group]: () => this.#paz_in_column_group(tk_x),
      [Insmod_.in_table_body]: () => this.#paz_in_table_body(tk_x),
      [Insmod_.in_row]: () => this.#paz_in_row(tk_x),
      [Insmod_.in_cell]: () => this.#paz_in_cell(tk_x),
      [Insmod_.in_template]: () => this.#paz_in_template(tk_x),
      [Insmod_.after_body]: () => this.#paz_after_body(tk_x),
      [Insmod_.after_after_body]: () => this.#paz_after_after_body(tk_x),
    }[this.#insmod])();
  }

  /** @headconst @param tk_x */
  #paz_in_foreign(tk_x: HTMLTk): void {
    const tip_0 = this.#tip as CtnrEl;

    const script_ = () => {
      /* no-ops */
    };

    if (tk_x.isChar) {
      this.#insTk(tk_x, tip_0);
    } else if (tk_x.value === HTMLTok.comment) {
      this.#insTk(tk_x, tip_0);
    } else if (tk_x.value === HTMLTok.proins) {
      this.#insEl(new Proins(tk_x), tip_0);
    } else if (tk_x.value === HTMLTok.doctype) {
      this.setErr(tip_0, {
        msg: ErrMsg.html_unexp_doctype,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
    } else if (tk_x.openTag(...im_a_) || tk_x.clozTag("br", "p")) {
      this.setErr(tip_0, {
        msg: tk_x.clozTag("br", "p")
          ? ErrMsg.html_unexp_endtag
          : ErrMsg.html_foreign_unexp_html,
        rv: Ranval.fromRan(tk_x.ran_$),
      });
      let tip_ = tip_0;
      while (!isMathIntp(tip_) && !isHTMLIntp(tip_) && tip_.ns !== TagNS.HTML) {
        this.#opnels.pop();
        tip_ = this.#tip as CtnrEl;
      }
      this.#paz_in_domestic(tk_x);
    } else if (tk_x.isOpntag) {
      (tk_x.lexdInfo as Tag_LI).ns_$ = tip_0.ns;
      (tk_x.lexdInfo as Tag_LI).attrs.adjForeignAns();
      const el_ = createEl_tk(tk_x);
      this.#insEl(el_, tip_0);
      if ((tk_x.lexdInfo as Tag_LI).selfCloz_$) {
        if (el_.tagname === "svg script") script_();
      } else {
        this.#opnels.push(el_ as CtnrEl);
      }
    } else if (tk_x.clozTag("script") && tip_0.tagname === "svg script") {
      (tk_x.lexdInfo as Tag_LI).ns_$ = tip_0.ns;
      //jjjj TOCLEANUP
      // tip_0.apdSnt(tk_x);
      this.#opnels.pop();
      script_();
    } else if (tk_x.isEndtag) {
      const tn_ = (tk_x.lexdInfo as Tag_LI).tagname_s;
      if (tip_0.nonsTagname !== tn_) {
        this.setErr(tip_0, {
          msg: ErrMsg.html_unexp_endtag,
          rv: Ranval.fromRan(tk_x.ran_$),
          ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
        });
      }
      for (let i = this.#opnels.length; i--;) {
        /** "node" */
        const sn_i = this.#opnels[i];
        if (sn_i.nonsTagname === tn_) {
          (tk_x.lexdInfo as Tag_LI).ns_$ = sn_i.ns;
          sn_i.apdSnt(tk_x);
          this.#opnels.length = i;
          break;
        }
        if (this.#opnels[i - 1].ns === TagNS.HTML) {
          this.#paz_in_domestic(tk_x);
          break;
        }
      }
    }
  }

  /** @headconst @param tk_x */
  pazScandTk_$(tk_x: HTMLTk): void {
    /* [tree construction dispatcher](https://html.spec.whatwg.org/multipage/parsing.html#tree-construction-dispatcher) */
    let im_ = false;
    if (this.#opnels.length === 0) {
      im_ = true;
    } else {
      const tip_0 = this.#tip as CtnrEl;
      if (tip_0.ns === TagNS.HTML) {
        im_ = true;
      } else if (isMathIntp(tip_0) && (tk_x.isOpntag || tk_x.isChar)) {
        im_ = true;
      } else if (
        tip_0.tagname === "math annotation-xml" && tk_x.openTag("svg")
      ) {
        im_ = true;
      } else if (isHTMLIntp(tip_0) && (tk_x.isOpntag || tk_x.isChar)) {
        im_ = true;
      }
    }
    /* ~ */

    if (im_) {
      this.#paz_in_domestic(tk_x);
    } else {
      this.#paz_in_foreign(tk_x);
    }
  }

  /** @const @param curLoc_x */
  cleanup_$(curLoc_x: Loc): void {
    const tip_0 = this.#tip;
    switch (this.#insmod) {
      case Insmod_.initial: {
        this.setErr(tip_0, {
          msg: ErrMsg.html_no_doctype_eof,
          rv: Ranval.fromLoc(curLoc_x),
        });

        this.#insmod = Insmod_.before_html;
        this.cleanup_$(curLoc_x);
        break;
      }
      case Insmod_.before_html: {
        const el_ = new HTML_El(this.#insDumpTkAftr(tip_0.lastToken_1));
        tip_0.apdSnt(el_);
        this.#opnels.push(el_);

        this.#insmod = Insmod_.before_head;
        this.cleanup_$(curLoc_x);
        break;
      }
      case Insmod_.before_head: {
        this.#opnels.push(
          this.#head = this.#insEl(
            new Head_El(this.#insDumpTkAftr(tip_0.lastToken_1)),
            tip_0,
          ),
        );

        this.#insmod = Insmod_.in_head;
        this.cleanup_$(curLoc_x);
        break;
      }
      case Insmod_.in_head: {
        this.#opnels.pop();

        this.#insmod = Insmod_.after_head;
        this.cleanup_$(curLoc_x);
        break;
      }
      case Insmod_.in_head_noscript:
        this.setErr(tip_0, {
          msg: ErrMsg.html_noscript_eof,
          rv: Ranval.fromLoc(curLoc_x),
        });
        this.#opnels.pop();

        this.#insmod = Insmod_.in_head;
        this.cleanup_$(curLoc_x);
        break;
      case Insmod_.after_head: {
        this.#opnels.push(
          this.#insEl(
            new Body_El(this.#insDumpTkAftr(tip_0.lastToken_1)),
            tip_0,
          ),
        );

        this.#insmod = Insmod_.in_body;
        this.cleanup_$(curLoc_x);
        break;
      }
      case Insmod_.in_body: {
        if (this.#insmod_a.length) {
          const insmod_save = this.#insmod;
          this.#insmod = Insmod_.in_template;
          this.cleanup_$(curLoc_x);
          this.#insmod = insmod_save;
        } else {
          const sn_ = this.#opnels.hasOnlyTns(autoClozTn_3_a_);
          if (sn_) {
            sn_.setErr({
              msg: sn_.tagname === "select"
                ? ErrMsg.html_select_eof
                : ErrMsg.html_no_endtag_eof,
              rv: Ranval.fromLoc(curLoc_x),
              ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
            });
            this.errSn_ss$.add(sn_);
          }
        }
        break;
      }
      case Insmod_.text:
        this.setErr(tip_0, {
          msg: tip_0 instanceof Textarea_El
            ? ErrMsg.html_no_endtag_eof
            : ErrMsg.html_no_named_endtag_eof,
          rv: Ranval.fromLoc(curLoc_x),
        });
        this.#opnels.pop();

        this.#insmod = this.#origInsmod;
        this.cleanup_$(curLoc_x);
        break;
      case Insmod_.in_table_text:
        this.#else_in_table_text();

        this.#insmod = this.#origInsmod;
        this.cleanup_$(curLoc_x);
        break;
      case Insmod_.in_table:
      case Insmod_.in_caption:
      case Insmod_.in_column_group:
      case Insmod_.in_table_body:
      case Insmod_.in_row:
      case Insmod_.in_cell: {
        if (this.#insmod_a.length) {
          const insmod_save = this.#insmod;
          this.#insmod = Insmod_.in_template;
          this.cleanup_$(curLoc_x);
          this.#insmod = insmod_save;
        } else {
          const sn_ = this.#opnels.hasOnlyTns(autoClozTn_3_a_);
          if (sn_) {
            sn_.setErr({
              msg: ErrMsg.html_table_eof,
              rv: Ranval.fromLoc(curLoc_x),
              ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
            });
            this.errSn_ss$.add(sn_);
          }
        }
        break;
      }
      case Insmod_.in_template:
        this.setErr(this.#tip, {
          msg: ErrMsg.html_template_eof,
          rv: Ranval.fromLoc(curLoc_x),
          ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
        });
        this.#opnels.clozTo_inclu("template");

        this.#afels.clear();

        this.#insmod_a.pop();
        this.#resetInsmod();

        this.cleanup_$(curLoc_x);
        break;
      default:
        break;
        //jjjj TOCLEANUP
        // case Insmod_.after_body:
        //   break;
        // case Insmod_.after_after_body:
        //   break;
        // default:
        //   /*#static*/ DEBUG ? fail("Should not run here!") : {};
    }
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** "adjusted insertion location" */
  #iIns: int | undefined;
  /**
   * [appropriate place for inserting a node](https://html.spec.whatwg.org/multipage/parsing.html#appropriate-place-for-inserting-a-node)\
   * Set `#iIns`
   * @const @param tip_x
   * @return "targetParent"
   */
  #getIns(tip_x: HTMLCtnr): HTMLCtnr {
    this.#iIns = undefined;
    if (!this.#fp || !thbf_1.includes((tip_x as any).tagname)) {
      return tip_x;
    }

    const iTemplate = this.#opnels.getiTn("template");
    const iTable = this.#opnels.getiTn("table");
    if (0 <= iTemplate && iTable < iTemplate) {
      return this.#opnels[iTemplate];
    }

    if (iTable < 1) return tip_x;

    /** "lastTemplateOrTable" */
    const tableEl = this.#opnels[iTable];
    if (tableEl.parent) {
      this.#iIns = tableEl.idx;
      return tableEl.parent;
    }
    return this.#opnels[iTable - 1];
  }

  /**
   * [insert an HTML element](https://html.spec.whatwg.org/multipage/parsing.html#insert-an-html-element)\
   * @const @param retEl_x
   * @const @param tip_x
   */
  #insEl<E extends Elment | Proins>(retEl_x: E, tip_x: HTMLCtnr): E {
    const tgtPa_ = this.#getIns(tip_x);
    tgtPa_.insSnt(retEl_x, this.#iIns);

    //jjjj TOCLEANUP
    // if (tgtPa_ !== tip_x && tip_x instanceof CtnrEl) {
    //   retEl_x.srcPa = tip_x;
    //   tip_x.abdSnts.push(retEl_x);
    // }

    return retEl_x;
  }

  /**
   * @const @param retTk_x
   * @const @param tip_x
   */
  #insTk(retTk_x: HTMLTk, tip_x: HTMLCtnr): void {
    const tgtPa_ = this.#getIns(tip_x);
    tgtPa_.insSnt(retTk_x, this.#iIns);

    //jjjj TOCLEANUP
    // if (tgtPa_ !== tip_x && tip_x instanceof CtnrEl) {
    //   retTk_x.srcPa = tip_x;
    //   tip_x.abdSnts.push(retTk_x);
    // }
  }
  /*36||||||||||||||||||||||||||||||*/

  /**
   * @const @param st_x
   * @const @param el_x
   * @const @param tip_x
   */
  #intoText(st_x: State, el_x: SpecialCtnrEl, tip_x: HTMLCtnr): void {
    this.#opnels.push(
      this.#insEl(el_x, tip_x),
    );

    this.lexr$.state_$ = st_x;
    this.lexr$.lastTagname_$ = el_x.tagname;

    this.#origInsmod = this.#insmod;
    this.#insmod = Insmod_.text;
  }
  /*36||||||||||||||||||||||||||||||*/

  /**
   * [reconstruct the active formatting elements](https://html.spec.whatwg.org/multipage/parsing.html#reconstruct-the-active-formatting-elements)\
   * Assign `#afels`, `#opnels`
   */
  #reconstructAfelA(): void {
    if (this.#afels.length === 0) return;

    let i_ = this.#afels.length;
    /** "entry" */
    let afel_i;
    for (; i_--;) {
      afel_i = this.#afels[i_];
      if (isMkr_(afel_i) || this.#opnels.hasEl(afel_i)) break;
    }
    if (i_ === this.#afels.length - 1) return;

    do {
      afel_i = this.#afels[++i_] as FmtingEl;
      this.#opnels.push(
        this.#afels[i_] = this.#insEl(
          FmtingEl.create(afel_i, this.#insDumpTkAftr(this.#tip.lastToken_1)),
          this.#tip,
        ),
      );
    } while (i_ < this.#afels.length - 1);
  }

  /**
   * [adoption agency algorithm](https://html.spec.whatwg.org/multipage/parsing.html#adoption-agency-algorithm)\
   * Assign `#afels`, `#opnels`. Set `#iIns`.
   * @headconst @param tk_x
   */
  #aaa_in_body(tk_x: HTMLTk): HTMLCtnr | undefined {
    /*#static*/ if (INOUT) {
      /* html, body, ... */
      assert(this.#opnels.length >= 2);
    }
    /** "subject" */
    const tn_ = (tk_x.lexdInfo as Tag_LI).tagname_s;
    /** "current node" */
    let tip_ = this.#opnels.tip!;
    if (tip_.tagname === tn_ && !this.#afels.includes(tip_)) {
      this.#opnels.pop();
      //jjjj TOCLEANUP
      // return this.#getIns();
      return this.#tip;
    }

    for (let /** "outerLoopCounter" */ n = 0; n < 8; n++) {
      const iAfel = this.#afels.getiLastTn(tn_);
      if (iAfel < 0) {
        return this.#elseEndTag_in_body(tk_x);
      }

      /** "formattingElement" */
      const lastAfel = this.#afels[iAfel] as FmtingEl;
      const iOpnel = this.#opnels.iScopingEl(scopeTn_a_, lastAfel);
      if (iOpnel < 0) {
        if (this.#opnels.hasEl(lastAfel)) {
          /* "wpt/.../html5lib/html5parser.py" also uses "adoption-agency-4.4",
          but stangely, the error message never appears in any tests in
          "wpt/html/syntax/parsing/resources/". */
          this.setErr(tip_, {
            // msg: ErrMsg.html_unexp_endtag,
            msg: ErrMsg.html_aaa_4_4,
            rv: Ranval.fromRan(tk_x.ran_$),
            ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
          });
        } else {
          this.#afels.splice(iAfel, 1);
          this.setErr(tip_, {
            msg: ErrMsg.html_aaa_1_2,
            rv: Ranval.fromRan(tk_x.ran_$),
            ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
          });
        }
        return undefined;
      }

      if (lastAfel !== tip_) {
        this.setErr(tip_, {
          msg: ErrMsg.html_aaa_1_3,
          rv: Ranval.fromRan(tk_x.ran_$),
          ts: /*#static*/ DEBUG ? Date.now_1() : undefined,
        });
      }
      /** "furthestBlock": topmost special Elment */
      let tostSpel: SpecialCtnrEl | undefined;
      let jOpnel = iOpnel + 1;
      for (; jOpnel < this.#opnels.length; jOpnel++) {
        if (this.#opnels[jOpnel].nestCat === NestCat.special) {
          tostSpel = this.#opnels[jOpnel];
          break;
        }
      }
      if (!tostSpel) {
        this.#opnels.length = iOpnel;
        this.#afels.splice(iAfel, 1);
        //jjjj TOCLEANUP
        // return this.#getIns();
        return this.#tip;
      }

      /** "commonAncestor" */
      const pa_ = this.#opnels[iOpnel - 1];
      /** "bookmark" */
      let iAfel_1 = iAfel;
      /** "position of furthestBlock" */
      let iOpnel_1 = jOpnel;
      /** "node" */
      let el_j: CtnrEl = tostSpel;
      /** "lastNode" */
      let lastEl: CtnrEl = tostSpel;
      for (
        let /** "innerLoopCounter" */ m = 1,
          /** as safeguard */ mM = jOpnel - iOpnel + 2;
        m < mM;
        m++
      ) {
        el_j = this.#opnels[--jOpnel];
        if (el_j === lastAfel) break;

        let i_ = this.#afels.indexOf(el_j);
        if (m > 3 && i_ >= 0) {
          this.#afels.splice(i_, 1);
          i_ = -1;
        }
        if (i_ < 0) {
          this.#opnels.splice(jOpnel, 1);
          iOpnel_1 -= 1;
          continue;
        }

        el_j = FmtingEl.create(el_j, this.#insDumpTkBefo(tostSpel.frstToken_1));
        this.#afels[i_] = el_j;
        this.#opnels[jOpnel] = el_j;

        if (lastEl === tostSpel) {
          iAfel_1 = i_ + 1;
        }

        if (lastEl.parent) lastEl.tfrTo(el_j);
        else el_j.apdSnt(lastEl);
        lastEl = el_j;
      }
      lastEl.rmv();
      this.#insEl(lastEl, pa_);

      const lastAfel_1 = FmtingEl.create(
        lastAfel,
        this.#insDumpTkAftr(tostSpel.frstToken_1),
      );
      tostSpel.tfrSntTo(lastAfel_1)
        .apdSnt(lastAfel_1);
      /*#static*/ if (INOUT) {
        assert(iAfel <= iAfel_1);
      }
      if (iAfel < iAfel_1) {
        this.#afels.splice(iAfel_1, 0, lastAfel_1);
        this.#afels.splice(iAfel, 1);
      } else {
        this.#afels.splice(iAfel, 1, lastAfel_1);
      }
      /*#static*/ if (INOUT) {
        assert(iOpnel < iOpnel_1);
      }
      this.#opnels.splice(iOpnel_1 + 1, 0, lastAfel_1);
      this.#opnels.splice(iOpnel, 1);
      tip_ = this.#opnels.tip!; //!
    }
    return undefined;
  }
  /*36||||||||||||||||||||||||||||||*/

  /**
   * [reset the insertion mode appropriately](https://html.spec.whatwg.org/multipage/parsing.html#reset-the-insertion-mode-appropriately)\
   * Set `#insmod`\
   * `in( this.#opnels.length)`
   */
  #resetInsmod(): void {
    for (let i = this.#opnels.length; i--;) {
      const el_i = this.#opnels[i];
      const tn_ = el_i.tagname;
      const last = i === 0;
      if ((tn_ === "td" || tn_ === "th") && !last) {
        this.#insmod = Insmod_.in_cell;
        return;
      } else if (tn_ === "tr") {
        this.#insmod = Insmod_.in_row;
        return;
      } else if (thbf.includes(tn_)) {
        this.#insmod = Insmod_.in_table_body;
        return;
      } else if (tn_ === "caption") {
        this.#insmod = Insmod_.in_caption;
        return;
      } else if (tn_ === "colgroup") {
        this.#insmod = Insmod_.in_column_group;
        return;
      } else if (tn_ === "table") {
        this.#insmod = Insmod_.in_table;
        return;
      } else if (tn_ === "template") {
        this.#insmod = this.#insmod_a.at(-1)!;
        return;
      } else if (tn_ === "head" && !last) {
        this.#insmod = Insmod_.in_head;
        return;
      } else if (tn_ === "body") {
        this.#insmod = Insmod_.in_body;
        return;
      } else if (tn_ === "html") {
        this.#insmod = Insmod_.after_head;
        return;
      }
    }
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  ///
}
/*80--------------------------------------------------------------------------*/
