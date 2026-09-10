/** 80**************************************************************************
 * @module lib/editing/Caret
 * @license MIT
 ******************************************************************************/

import type { Ranpo } from "@fe-cpl/Ran.ts";
import { Ranval, RanvalMo } from "@fe-cpl/Ranval.ts";
import { _TRACE, CYPRESS, DEBUG, EDTR } from "../../preNs.ts";
import type { int } from "../alias.ts";
import { WritingDir } from "../alias.ts";
import type { Id_t } from "../alias_v.ts";
import type { Cssc } from "../color/alias.ts";
import { Pale } from "../color/Pale.ts";
import { HTMLVuu } from "../cv.ts";
import { html, span } from "../dom.ts";
import "../jslang.ts";
import { $CSS } from "../symbols.ts";
import { assert, bind, out } from "../util.ts";
import { trace, traceOut } from "../util/trace.ts";
import { Caret_passive_z, Caret_proactive_z } from "./alias.ts";
import type { EdtrBase, EdtrBaseScrolr } from "./EdtrBase.ts";
import type { ELoc } from "./ELoc.ts";
import { ERan } from "./ERan.ts";
import { MainCaret } from "./MainCaret.ts";
/*80--------------------------------------------------------------------------*/

export type CaretRvM = [mainCaret: MainCaret, ranval_mo: RanvalMo];

export class Caret extends HTMLVuu<EdtrBase, HTMLInputElement> {
  static #ID = 0 as Id_t;
  override readonly id = ++Caret.#ID as Id_t;

  /* Pale */
  #proactiveBg_p = Pale.get("edt.Caret.proactiveBg");
  #onProactiveBgCssc = (_x: Cssc) => {
    if (this.isMain$) {
      this.el$.style.backgroundColor = _x;
      this.#anchr_el.style.backgroundColor = _x;
    }
  };

  #passiveBg_p = Pale.get("edt.Caret.passiveBg");
  #onPassiveBgCssc = (_x: Cssc) => {
    if (!this.isMain$) {
      this.el$.style.backgroundColor = _x;
      this.#anchr_el.style.backgroundColor = _x;
    }
  };

  #proactiveFatOl_p = Pale.get("edt.Caret.proactiveFatOl");
  #onProactiveFatOlCssc = (_x: Cssc) => {
    if (this.isMain$) this.#fat_el.style.outlineColor = _x;
  };

  #passiveFatOl_p = Pale.get("edt.Caret.passiveFatOl");
  #onPassiveFatOlCssc = (_x: Cssc) => {
    if (!this.isMain$) this.#fat_el.style.outlineColor = _x;
  };

  #proactiveBgSelec_p = Pale.get("edt.Selec.proactiveBgSelec");
  #onProactiveBgSelecCssc = (_x: Cssc) => {
    if (this.isMain$) {
      document.body.style.setProperty(this.#selecBg_pn, _x);
    }
  };

  // #proactiveBgOvlap_p = Pale.get("edt.Selec.proactiveBgOvlap");

  #passiveBgSelec_p = Pale.get("edt.Selec.passiveBgSelec");
  #onPassiveBgSelecCssc = (_x: Cssc) => {
    if (!this.isMain$) {
      document.body.style.setProperty(this.#selecBg_pn, _x);
    }
  };

  // #passiveBgOvlap_p = Pale.get("edt.Selec.passiveBgOvlap");

  override observeTheme() {
    this.#proactiveBg_p.registCsscHandler(this.#onProactiveBgCssc);
    this.#passiveBg_p.registCsscHandler(this.#onPassiveBgCssc);
    this.#proactiveFatOl_p.registCsscHandler(this.#onProactiveFatOlCssc);
    this.#passiveFatOl_p.registCsscHandler(this.#onPassiveFatOlCssc);

    this.#proactiveBgSelec_p.registCsscHandler(this.#onProactiveBgSelecCssc);
    this.#passiveBgSelec_p.registCsscHandler(this.#onPassiveBgSelecCssc);
  }
  // override unobserveTheme() {
  //   this.#proactiveBg_p.removeCsscHandler(this.#onProactiveBgCssc);
  //   this.#passiveBg_p.removeCsscHandler(this.#onPassiveBgCssc);
  //   this.#proactiveFatOl_p.removeCsscHandler(this.#onProactiveFatOlCssc);
  //   this.#passiveFatOl_p.removeCsscHandler(this.#onPassiveFatOlCssc);

  //   this.#proactiveBgSelec_p.removeCsscHandler(this.#onProactiveBgSelecCssc);
  //   this.#passiveBgSelec_p.removeCsscHandler(this.#onPassiveBgSelecCssc);
  // }
  /* ~ */
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @final */
  get eslr() {
    return this.coo$._scrolr;
  }

  /* caretrvm$ */
  /** Exist after attaching Bufr (ref. `EdtrScrolr.attachBufr_impl$()`) */
  protected caretrvm$: CaretRvM | undefined;
  get caretrvm() {
    return this.caretrvm$;
  }
  /**
   * Not active means no reaction. But the `el$` could still `shown`. Call
   * `disable_$()` to hide `this`.
   * @final
   */
  get active() {
    return !!this.caretrvm$?.[1].nCb;
  }
  /** @final */
  get realBody(): MainCaret | undefined {
    return this.caretrvm$?.[0];
  }

  get ranval() {
    return this.caretrvm$![1].val;
  }
  /* ~ */

  /* isMain$ */
  protected get isMain$(): boolean {
    return false;
  }

  protected focusd$ = false;
  /* ~ */

  get #bgCssc(): Cssc {
    return this.class === "MainCaret"
      ? this.#proactiveBg_p.cssc
      : this.#passiveBg_p.cssc;
  }
  get #fatOlCssc(): Cssc {
    return this.class === "MainCaret"
      ? this.#proactiveFatOl_p.cssc
      : this.#passiveFatOl_p.cssc;
  }
  get #bgSelecCssc(): Cssc {
    return this.class === "MainCaret"
      ? this.#proactiveBgSelec_p.cssc
      : this.#passiveBgSelec_p.cssc;
  }
  get #zidx(): int {
    return this.class === "MainCaret" ? Caret_proactive_z : Caret_passive_z;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // /** Keep (if not undefiend) until `focused = true` */
  // #ranval_kept: Ranval | undefined;
  // keepRanval_$(rv_x: Ranval) {
  //   this.#ranval_kept = rv_x;
  // }

  protected focusVisible$ = false;
  get focusVisible() {
    return this.focusVisible$;
  }
  // #anchrVisible = false;
  // #selecVisible = false;

  //jjjj TOCLEANUP
  // #eran?: ERan;
  // get eran() {
  //   return this.#eran;
  // }

  #focusEloc!: ELoc;
  readonly #fat_el = span();
  #fat_eran!: ERan;

  #anchrEloc!: ELoc;
  readonly #anchr_el = span();

  /* #st */
  #st = CaretState.hidden;
  get st() {
    return this.#st;
  }
  get shown() {
    return this.#st !== CaretState.hidden;
  }

  #blink_an?: Animation;
  protected stare$(): void {
    if (this.#st === CaretState.staring) return;

    this.#blink_an?.cancel();

    this.el$.style.display = "revert";
    this.#fat_el.style.display = "revert";

    this.#st = CaretState.staring;
  }
  protected blink$(): void {
    if (this.#st === CaretState.blinking) return;

    if (this.#blink_an) {
      this.#blink_an.play();
    } else {
      this.#blink_an = this.el$.animate([
        { opacity: 1 },
        { opacity: 0 },
        { opacity: 1 },
      ], {
        easing: "steps(2)",
        duration: 800,
        iterations: Infinity,
      });
    }

    this.el$.style.display = "revert";
    this.#fat_el.style.display = "revert";

    this.#st = CaretState.blinking;
  }
  /* ~ */

  readonly #selecBg_pn = `--${this.class_id}-selecBg`;

  /* #selec_hl */
  //jjjj TOCLEANUP
  // readonly #selec_fac: SelecFac;

  readonly #selec_hl = new Highlight();
  readonly #selec_hl_name = `${this.class_id}_selec`;
  #hideSelec() {
    //jjjj TOCLEANUP
    // this.#selec_fac.reset_Factory();
    // //jjjj TOCLEANUP
    // // this.#anchr_el.style.display = "none";

    this.#selec_hl.clear();
  }
  //jjjj TOCLEANUP
  // #showSelec() {
  //   //jjjj TOCLEANUP
  //   // this.#selec_fac.showAll_$();
  //   for (const selec of this.#selec_fac) {
  //     selec.el.style.display = "revert";
  //   }
  //   //jjjj TOCLEANUP
  //   // this.#anchr_el.style.display = "revert";
  // }

  #selec_eran!: ERan;
  /* ~ */

  hideAll() {
    if (!this.shown) return;

    this.el$.style.display = "none";
    this.#fat_el.style.display = "none";
    this.#anchr_el.style.display = "none";
    this.#hideSelec();

    this.#st = CaretState.hidden;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  protected lastSin$?: DOMRect;
  // protected lastFat$?: DOMRect;
  //jjjj TOCLEANUP
  // #focusMoved = false;
  // get focusMoved() {
  //   return this.#focusMoved;
  // }

  /* For `EdtrScrolr.preReplace_$()`, and related thereafter */
  readonly repl_rv_$ = new Ranval(0, 0);
  // ranpA_$ = Ranp.unknown;
  // ranpF_$ = Ranp.unknown; //jjjj always `eran !== undefined` if `ranpF_$ !== Ranp.unknown`?
  // offsA_$: loff_t | lnum_t = 0;
  // offsF_$: loff_t | lnum_t = 0;
  readonly ranpo_a_$: Ranpo[] = [];
  /* ~ */

  protected constructor(coo_x: EdtrBase) {
    super(coo_x, html("input"));
    //jjjj TOCLEANUP
    // this.#selec_fac = new SelecFac(coo_x);

    this.el$.id = this.class_id; // Otherwise, Chrome DevTools will issue "A form field element has neither an id nor a name attribute."
    /*#static*/ if (CYPRESS || DEBUG) {
      this.el$.hint = this.class_id;
    }
    this.assignAttro({
      // className: "editor-selection",
      //
      inputmode: "none",
      spellcheck: "false",
      // autocapitalize: "off",
      //
      // readonly: "", // prevent native virtual keybord
      // maxlength: 0,
      autocomplete: "off",
      autocorrect: "off",

      /* To prevent Edge from complaining. See [Form <input> elements must have labels](https://dequeuniversity.com/rules/axe/4.4/label) */
      "aria-label": this.class_id,
    }).assignStylo({
      display: "none",
      position: "absolute",
      // top: `5px`,
      // left: `10px`,
      zIndex: this.#zidx,
      margin: "0",

      border: "0",
      padding: "0",
      backgroundColor: this.#bgCssc,
      outline: "none",
      // caretColor: "transparent",
    });
    this.#fat_el.assignStylo({
      display: "none",
      position: "absolute",
      zIndex: this.#zidx,

      outlineWidth: "2px",
      outlineStyle: "dotted",
      outlineColor: this.#fatOlCssc,
    });
    this.#anchr_el.assignStylo({
      display: "none",
      position: "absolute",
      zIndex: this.#zidx,

      backgroundColor: this.#bgCssc,
    });

    CSS.highlights.set(this.#selec_hl_name, this.#selec_hl);
    document[$CSS].insertRule(
      `::highlight(${this.#selec_hl_name}) {
        background-color: var(${this.#selecBg_pn});
      }`,
    );
    document.body.style.setProperty(this.#selecBg_pn, this.#bgSelecCssc);

    //jjjj TOCLEANUP "Avoid calling virtual (overridden) methods inside a constructor."
    // this.resetCaretRvM_$(crm_x);

    //jjjj TOCLEANUP
    // this.on("focus", this._onFocus);
    // this.on("blur", this._onBlur);
    //jjjj TOCLEANUP
    // // this.on( "keydown", this.#onKeyDown );
    // this.on("keyup", this.#onKeyUp);
    // // this.on("input", this.#onInput);
    this.on("compositionend", () => this.el$.value = "");
  }
  /**
   * @headconst @param coo_x
   * @headconst @param crm_x
   */
  static create(coo_x: EdtrBase, crm_x?: CaretRvM) {
    const ret = new Caret(coo_x);
    ret.resetCaretRvM_$(crm_x);
    ret.observeTheme();
    return ret;
  }

  // destructor() {
  //   this.unobserveTheme();

  //   document[$CSS].deleteSelector(
  //     `::highlight(${this.#selec_hl_name})`,
  //   );
  //   CSS.highlights.delete(this.#selec_hl_name);
  // }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @final
   * @headconst @param crm_x
   */
  resetCaretRvM_$(crm_x?: CaretRvM) {
    if (this.isMain$) {
      this.caretrvm$![1].reset_Moo();
      /* Then other shadow carets are in-`active` automatically because
      `caretrvm$![1].nCb === 0` */
    } else if (this.active) {
      this.disable_$();
    }
    this.caretrvm$ = crm_x;
    if (crm_x) {
      crm_x[1].registHandler(this._onRanvalChange);
      crm_x[1].forceOnce = true; //!
    }

    //jjjj TOCLEANUP
    // this.el$.assignStylo({
    //   zIndex: this.#zidx,

    //   backgroundColor: this.#bgCssc,
    // });
    // this.#fat_el.assignStylo({
    //   zIndex: this.#zidx,

    //   outlineColor: this.#fatOlCssc,
    // });
    // this.#anchr_el.assignStylo({
    //   zIndex: this.#zidx,

    //   backgroundColor: this.#bgCssc,
    // });
  }

  /**
   * @final
   * @headconst @param _x
   */
  attachTo(_x: EdtrBaseScrolr): this {
    _x.el.append(this.#fat_el, this.el$, this.#anchr_el);
    return this;
  }

  // createCaretRvM_$() {
  //   /*#static*/ if (INOUT) {
  //     assert(!this.active);
  //   }
  //   this.caretrvm$ = [this, new RanvalMo()];
  //   this.caretrvm$[1].registHandler(this._onRanvalChange);
  //   this.caretrvm$[1].forceOnce = true; //!
  //   /*#static*/ if (INOUT) {
  //     assert(this.active && this.isMain$);
  //   }
  //   return this.caretrvm$;
  // }

  /**
   * No effects on the main caret, only hiding.\
   * For the main caret, use `caretrvm$![1].reset_Moo()` to reset it.
   */
  @out((self: Caret) => {
    assert(!self.shown && (!self.active || self.isMain$));
  })
  disable_$(): this {
    this.hideAll();
    if (!this.isMain$) {
      this.caretrvm$?.[1].removeHandler(this._onRanvalChange);
      this.caretrvm$ = undefined;
    }
    return this;
  }

  /** @const @param rv_x */
  @bind
  @traceOut(_TRACE && EDTR)
  private _onRanvalChange(rv_x: Ranval) {
    /*#static*/ if (_TRACE && EDTR) {
      console.log(
        `${trace.indent}>>>>>>> ${this.class_id}._onRanvalChange( [${rv_x}]) >>>>>>>`,
      );
    }
    /*#static*/ if (CYPRESS) {
      this.el$["cy.any"] = `${rv_x}`;
    }
    //jjjj TOCLEANUP
    // this.#eran = this.edtr.getERanOf(rv_x, this.#eran);
    // // if( !this.#eran.focusCtnr.isText ) { this.hide(); return; }
    // // console.log(this.#eran);
    // using fat_rv = g_ranval_fac.oneMore()
    //   .set_Ranval(rv_x.focusLidx, rv_x.focusLoff);
    // fat_rv.focusLoff += 1;
    // this.#fat_eran = this.edtr.getERanOf(fat_rv, this.#fat_eran);

    this.draw_$();
    this.sufDraw$();

    //jjjj TOCLEANUP
    // // if (this.#st === CaretState.hidden) {
    // if (this.isMain$ && this.focusd$) {
    //   this.blink$();
    // } else {
    //   this.stare$();
    // }
    // // }
    // if (!this.#eran.collapsed) {
    //   this.#showSelec();
    // }
  }

  //jjjj TOCLEANUP
  // /**
  //  * Cf. `_onRanvalChange()`:\
  //  * No `rv_x`, corr of which, `rv_0`, is taken from `caretrvm$![1]`.
  //  */
  // shadowShow(): void {
  //   if (this.isMain$) return;

  //   /*#static*/ if (INOUT) {
  //     assert(this.active);
  //   }
  //   const rv_0 = this.ranval;
  //   using rv_u = rv_0.usingDup();
  //   this.#eran = this.edtr.getERanOf(rv_u, this.#eran);
  //   using fat_rv = g_ranval_fac.oneMore()
  //     .set_Ranval(rv_0.focusLidx, rv_0.focusLoff);
  //   fat_rv.focusLoff += 1;
  //   this.#fat_eran = this.edtr.getERanOf(fat_rv, this.#fat_eran);

  //   this.draw_$();
  //   this.sufDraw$();

  //   this.stare$();
  //   if (!this.#eran.collapsed) {
  //     this.#showSelec();
  //   }
  // }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // @bind
  // @traceOut(_TRACE && EDTR)
  // private _onFocus(_evt_x: FocusEvent) {
  //   /*#static*/ if (_TRACE && EDTR) {
  //     console.log(
  //       `${trace.indent}>>>>>>> ${this.class_id}._onFocus() >>>>>>>`,
  //     );
  //   }
  //   this.focusd$ = true;
  //   this.eslr.host.touched = true; //!
  // }
  // @bind
  // @traceOut(_TRACE && EDTR)
  // private _onBlur(_evt_x: FocusEvent) {
  //   /*#static*/ if (_TRACE && EDTR) {
  //     console.log(
  //       `${trace.indent}>>>>>>> ${this.class_id}._onBlur() >>>>>>>`,
  //     );
  //   }
  //   // console.log(`${trace.dent}edtr.mdraging: ${this.edtr.mdraging}`);
  //   // console.log(`${trace.dent}edtr.mdragged: ${this.edtr.mdragged}`);
  //   if (!this.eslr.mdraging) {
  //     this.focusd$ = false;
  //   }
  // }

  //jjjj TOCLEANUP
  // #onKeyUp = (evt_x: KeyboardEvent) => {
  //   /*#static*/ if (_TRACE && EDTR) {
  //     console.log(
  //       `${trace.indent}>>>>>>> ${this.class_id}.#onKeyUp() >>>>>>>`,
  //     );
  //     console.log(`${trace.dent}value = "${this.el$.value}"`);
  //   }
  //   // this.el$.value = "";
  //   /*#static*/ if (_TRACE && EDTR) trace.outdent;
  //   return;
  // };

  //jjjj TOCLEANUP
  // /** @deprecated */
  // #onInput = (evt_x: Event) => {
  //   /*#static*/ if (_TRACE && EDTR) {
  //     console.log(
  //       `${trace.indent}>>>>>>> ${this.class_id}.#onInput() >>>>>>>`,
  //     );
  //     console.log(
  //       `${trace.dent}inputType = "${(evt_x as InputEvent).inputType}"`,
  //     );
  //     console.log(`${trace.dent}data = "${(evt_x as InputEvent).data}"`);
  //   }
  //   if (!(evt_x instanceof InputEvent)) {
  //     /*#static*/ if (_TRACE && EDTR) trace.outdent;
  //     return;
  //   }

  //   evt_x.preventDefault();

  //   switch (evt_x.inputType) {
  //     case "insertText":
  //       // case "deleteContentBackward":
  //       this.el$.value = "";
  //       break;
  //   }
  //   /*#static*/ if (_TRACE && EDTR) trace.outdent;
  //   return;
  // };
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // /** @headconst @param sel_x */
  // @out((self: Caret) => {
  //   assert(self.#eran);
  // })
  // setERanBySel_$(sel_x: Selection) {
  //   /*#static*/ if (INOUT) {
  //     assert(sel_x.focusNode && sel_x.anchorNode);
  //   }
  //   if (this.#eran) {
  //     // this.#eran.rise$_();
  //     this.#eran.focusEloc.ctnr_$ = sel_x.focusNode!;
  //     this.#eran.focusEloc.offs_$ = sel_x.focusOffset;
  //     this.#eran.anchrEloc.ctnr_$ = sel_x.anchorNode!;
  //     this.#eran.anchrEloc.offs_$ = sel_x.anchorOffset;
  //   } else {
  //     this.#eran = new ERan(
  //       new ELoc(sel_x.focusNode!, sel_x.focusOffset),
  //       new ELoc(sel_x.anchorNode!, sel_x.anchorOffset),
  //     );
  //   }
  // }

  //jjjj TOCLEANUP
  // /**
  //  * `in( this.caretrvm$ )`
  //  * @move @const @param rv_x
  //  * @const @param force_x
  //  */
  // @traceOut(_TRACE && EDTR)
  // setByRanval(rv_x: Ranval, force_x?: "force"): void {
  //   /*#static*/ if (_TRACE && EDTR) {
  //     console.log(
  //       `${trace.indent}>>>>>>> ${this.class_id}.setByRanval([${rv_x}]${
  //         force_x ? `, "${force_x}"` : ""
  //       }) >>>>>>>`,
  //     );
  //   }
  //   // if( !this.caretrvm$ ) this.createCaretRvM_$( bufr_x );
  //   //jjjj TOCLEANUP
  //   // this.caretrvm$![1].forceOnce = forceOnce_x || !!this.#ranval_kept;
  //   // this.caretrvm$![1].val = this.#ranval_kept ?? rv_x;
  //   if (force_x) this.caretrvm$![1].force();
  //   this.caretrvm$![1].val = rv_x;
  // }

  /** @final */
  @traceOut(_TRACE && EDTR)
  draw_$() {
    /*#static*/ if (_TRACE && EDTR) {
      console.log(`${trace.indent}>>>>>>> ${this.class_id}.draw_$() >>>>>>>`);
    }
    this.#drawEndpt();
    //jjjj TOCLEANUP
    // if (this.#focusMoved)
    if (!this.realBody!.suppressDrawRangeOnce_$) {
      this.#drawRange();
    }
  }

  @traceOut(_TRACE && EDTR)
  #drawEndpt() {
    /*#static*/ if (_TRACE && EDTR) {
      console.log(
        `${trace.indent}>>>>>>> ${this.class_id}.#drawEndpt() >>>>>>>`,
      );
    }
    const rv_ = this.ranval;
    const eslr = this.eslr;
    eslr.bufr.correctRv(rv_);

    if (eslr.strtLidx <= rv_.focusLidx && rv_.focusLidx < eslr.stopLidx) {
      this.focusVisible$ = true;
      this.#focusEloc = eslr.getEFocusOf_$(rv_, this.#focusEloc);
      //jjjj TOCLEANUP
      // using fat_rv = g_ranval_fac.oneMore()
      //   .set_Ranval(rv_.focusLidx, rv_.focusLoff);
      const fat_rv = new Ranval(rv_.focusLidx, rv_.focusLoff);
      fat_rv.focusLoff += 1;
      this.#fat_eran = eslr.getERanOf(fat_rv, this.#fat_eran);

      const sin = this.lastSin$ = this.#focusEloc.getBcr_$(eslr.pbPos);
      this.#setPosSiz(
        this.el$,
        sin.left,
        sin.top,
        sin.width,
        sin.height,
        // sin[$ovlap],
      );
      const fat = this.#fat_eran.getBcr_$(eslr.pbPos);
      // console.log({ sin, fat });
      this.#fat_el.assignStylo({
        top: `${fat.top}px`,
        left: `${fat.left}px`,
        //jjjj TOCLEANUP
        // zIndex: this.#zidx,

        width: `${fat.width}px`,
        height: `${fat.height}px`,
        //jjjj TOCLEANUP
        // outlineColor: this.#fatOlCssc,
      });
      if (this.isMain$ && this.focusd$) {
        this.blink$();
      } else {
        this.stare$();
      }
    } else {
      this.focusVisible$ = false;
      if (!this.isMain$) this.el$.style.display = "none";
      this.#fat_el.style.display = "none";
    }

    if (
      !rv_.collapsed &&
      eslr.strtLidx <= rv_.anchrLidx && rv_.anchrLidx < eslr.stopLidx
    ) {
      // this.#anchrVisible = true;
      this.#anchrEloc = eslr.getEAnchrOf_$(rv_, this.#anchrEloc);

      const tin = this.#anchrEloc.getBcr_$(eslr.pbPos);
      this.#setPosSiz(
        this.#anchr_el,
        tin.left,
        tin.top,
        tin.width,
        tin.height,
        // tin[$ovlap],
      );
      this.#anchr_el.style.display = "revert";
    } else {
      // this.#anchrVisible = false;
      this.#anchr_el.style.display = "none";
    }

    // /* In chrome, there are strange cases that `sin.width` is very large, e.g.
    // "abc אמנון" with `rv_x` being "[0-4,0-5)". */
    // if (Number.apxG(sin.width, fat.width)) sin.width = 0;
    // if (Number.apxG(sin.height, fat.height)) sin.height = 0;
    // /* ~ */

    //jjjj TOCLEANUP
    // this.#focusMoved = !this.lastFat$ || !this.lastSin$ ||
    //   !this.lastFat$.apxE(fat) ||
    //   !Number.apxE(this.lastSin$.left, sin.left) ||
    //   !Number.apxE(this.lastSin$.top, sin.top);
    // if (!this.#focusMoved) return;
    // this.lastFat$ = fat;
    // this.lastSin$ = sin;
    // // console.log(`${trace.dent}🚀 ~ Caret ~ #drawEndpt ~ fat: ${fat}`);
    // // console.log(`${trace.dent}🚀 ~ Caret ~ #drawEndpt ~ sin: ${sin}`);
  }

  @traceOut(_TRACE && EDTR)
  #drawRange(): void {
    /*#static*/ if (_TRACE && EDTR) {
      console.log(
        `${trace.indent}>>>>>>> ${this.class_id}.#drawRange() >>>>>>>`,
      );
    }
    const rv_ = this.ranval;
    if (rv_.collapsed) {
      this.#hideSelec();
      return;
    }

    const eslr = this.eslr;
    //jjjj TOCLEANUP
    // using rv_u = rv_.usingDup();
    const rv_1 = rv_.dup_Ranval();
    if (rv_1.order < 0) rv_1.reverse();
    if (rv_1.focusLidx < eslr.strtLidx || eslr.stopLidx <= rv_1.anchrLidx) {
      // this.#selecVisible = false;
      this.#hideSelec();
      return;
    }

    // this.#selecVisible = true;
    if (rv_1.anchrLidx < eslr.strtLidx) {
      rv_1.setAnchr(eslr.strtLidx, 0);
    }
    if (eslr.stopLidx <= rv_1.focusLidx) {
      rv_1.setFocus(eslr.stopLidx - 1, Number.MAX_SAFE_INTEGER);
    }
    this.#selec_eran = eslr.getERanOf(rv_1, this.#selec_eran);
    this.#selec_hl.add(this.#selec_eran.syncRange());

    //jjjj TOCLEANUP
    // const rec_a = this.#selec_eran.getRecA_$(eslr, eslr.pbPos);
    // this.#selec_fac.isMain_$ = this.isMain$;
    // const n_ = this.#selec_fac.produce(rec_a.length);
    // const selec_a = this.#selec_fac.val_a;
    // for (let i = n_; i--;) {
    //   const rec = rec_a[i];
    //   selec_a[i].draw_$(rec.left, rec.top, rec.width, rec.height, rec[$ovlap]);
    // }
    // this.#showSelec();
  }

  //jjjj TOCLEANUP
  // /**
  //  * @headconst @param el_x
  //  * @const @param x_x
  //  * @const @param y_x
  //  * @const @param w_x
  //  * @const @param h_x
  //  * @const @param ovlap_x
  // //jjjj TOCLEANUP
  // //  * @return `true`, success;
  // //  *  `false`, failure, and `hideAll()` is already invoked
  //  */
  // #setPosSiz(
  //   el_x: HTMLInputElement | HTMLSpanElement,
  //   x_x: number,
  //   y_x: number,
  //   w_x: number,
  //   h_x: number,
  //   // ovlap_x = false,
  // ): void {
  //   // console.log({
  //   //   x_x: x_x.fixTo(1),
  //   //   y_x: y_x.fixTo(1),
  //   //   w_x: w_x.fixTo(1),
  //   //   h_x: h_x.fixTo(1),
  //   // });
  //   const edtr = this.edtr;
  //   const wm_ = this.coo$._writingMode;
  //   /**
  //    * blockSize
  //    *
  //    **! Firefox does not correctly implement vertical `writingMode` about this.
  //    */
  //   const bs_ = wm_ & WritingDir.v ? w_x : h_x;
  //   /** inlineSize */
  //   const is_ = Math.clamp(1, bs_ * .1, 5);
  //   // console.log(`%crun here: bs_: ${bs_}, is_: ${is_}`, `color:${LOG_cssc.runhere}`);
  //   // const scrollLeft_save = edtr.el.scrollLeft;
  //   // const scrollTop_save = edtr.el.scrollTop;
  //   // const edtrWidth_save = edtr.el.clientWidth;
  //   // const edtrHeight_save = edtr.el.clientHeight;
  //   //jjjj Why CSS `blockSize`, `inlineSize` do not work?
  //   el_x.assignStylo({
  //     left: wm_ & WritingDir.v
  //       ? `${x_x}px`
  //       : `${Math.clamp(0, x_x - is_ / 2, edtr.el.scrollWidth - is_)}px`,
  //     top: wm_ & WritingDir.v
  //       ? `${Math.clamp(0, y_x - is_ / 2, edtr.el.scrollHeight - is_)}px`
  //       : `${y_x}px`,
  //     zIndex: this.#zidx,

  //     width: wm_ & WritingDir.v ? `${bs_}px` : `${is_}px`,
  //     height: wm_ & WritingDir.v ? `${is_}px` : `${bs_}px`,
  //     backgroundColor: this.#bgCssc,
  //   });
  //   // if( edtr.el.scrollLeft !== scrollLeft_save
  //   //  || edtr.el.scrollTop !== scrollTop_save
  //   //  && edtr.el.clientWidth !== edtrWidth_save
  //   //  || edtr.el.clientHeight !== edtrHeight_save
  //   // ) {
  //   //   // console.log( {scrollTop_save,edtrWidth_save} );
  //   //   // console.log( `edtr.el.scrollTop=${edtr.el.scrollTop}` );
  //   //   // console.log( `edtr.el.clientWidth=${edtr.el.clientWidth}` );
  //   //   edtr.moveCarets$_(
  //   //     edtr.el.scrollLeft - scrollLeft_save,
  //   //     edtr.el.scrollTop - scrollTop_save );
  //   // }

  //   //jjjj should be able to configure if synchronize views or not
  //   // if( this !== this.coo$.caret ) return;

  //   // if (edtr.el.scrollTop > y_x) {
  //   //   if (this.isMain$) {
  //   //     edtr.vu_$(
  //   //       [undefined, y_x],
  //   //       [undefined, edtr.el.scrollTop],
  //   //     );
  //   //   } else {
  //   //     edtr.el.scrollTop = y_x;
  //   //     edtr.lastScrollpos_$[1] = edtr.el.scrollTop;
  //   //   }
  //   // } else if (
  //   //   edtr.lastScrollpos_$[1] !== undefined &&
  //   //   edtr.lastScrollpos_$[1] > y_x
  //   // ) {
  //   //   if (this.isMain$) {
  //   //     edtr.vu_$([undefined, edtr.el.scrollTop]);
  //   //   }
  //   // } else if (edtr.el.scrollTop < y_x + h_x - edtr.el.clientHeight) {
  //   //   if (this.isMain$) {
  //   //     edtr.vu_$(
  //   //       [undefined, y_x + h_x - edtr.el.clientHeight],
  //   //       [undefined, edtr.el.scrollTop],
  //   //     );
  //   //   } else {
  //   //     edtr.el.scrollTop = y_x + h_x - edtr.el.clientHeight;
  //   //     edtr.lastScrollpos_$[1] = edtr.el.scrollTop;
  //   //   }
  //   // } else if (
  //   //   edtr.lastScrollpos_$[1] !== undefined &&
  //   //   edtr.lastScrollpos_$[1] < y_x + h_x - edtr.el.clientHeight
  //   // ) {
  //   //   if (this.isMain$) {
  //   //     edtr.vu_$([undefined, edtr.el.scrollTop]);
  //   //   }
  //   // }
  // }
  /**
   * @headconst @param el_x
   * @const @param x_x
   * @const @param y_x
   * @const @param w_x
   * @const @param h_x
   * @const @param ovlap_x
   */
  #setPosSiz(
    el_x: HTMLInputElement | HTMLSpanElement,
    x_x: number,
    y_x: number,
    w_x: number,
    h_x: number,
  ): void {
    // console.log({
    //   x_x: x_x.fixTo(1),
    //   y_x: y_x.fixTo(1),
    //   w_x: w_x.fixTo(1),
    //   h_x: h_x.fixTo(1),
    // });
    const eslr = this.eslr;
    const wm_ = this.coo$._writingMode;
    /** block-size */
    const bs_ = wm_ & WritingDir.v ? w_x : h_x;
    /** inline-size */
    const is_ = Math.clamp(1, bs_ * .1, 5);
    //jjjj Why CSS `blockSize`, `inlineSize` do not work?
    el_x.assignStylo({
      left: wm_ & WritingDir.v
        ? `${x_x}px`
        : `${Math.clamp(0, x_x - is_ / 2, eslr.el.scrollWidth - is_)}px`,
      top: wm_ & WritingDir.v
        ? `${Math.clamp(0, y_x - is_ / 2, eslr.el.scrollHeight - is_)}px`
        : `${y_x}px`,
      //jjjj TOCLEANUP
      // zIndex: this.#zidx,

      width: wm_ & WritingDir.v ? `${bs_}px` : `${is_}px`,
      height: wm_ & WritingDir.v ? `${is_}px` : `${bs_}px`,
      //jjjj TOCLEANUP
      // backgroundColor: this.#bgCssc,
    });
  }

  protected sufDraw$() {}
}

export enum CaretState {
  staring = 1,
  blinking,
  hidden,
}
/*80--------------------------------------------------------------------------*/
