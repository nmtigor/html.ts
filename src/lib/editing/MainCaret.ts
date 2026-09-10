/** 80**************************************************************************
 * @module lib/editing/MainCaret
 * @license MIT
 ******************************************************************************/

import { Ranval } from "@fe-cpl/Ranval.ts";
import { _TRACE, EDTR } from "../../preNs.ts";
import "../jslang.ts";
import { bind } from "../util.ts";
import { trace, traceOut } from "../util/trace.ts";
import { Caret } from "./Caret.ts";
import type { EdtrBase } from "./EdtrBase.ts";
import { genInlineMidOf } from "./util.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class MainCaret extends Caret {
  //jjjj TOCLEANUP
  // visible?: boolean;

  protected override get isMain$(): boolean {
    return this === this.realBody;
    // return true;
  }

  /** Viewport inline within `edtr` to keep */
  inline_$ = 0;
  keepInlineOnce_$ = false;

  /**
   * Set in EdtrScrolr, because it is shared between `mainCaret` and its shadow
   * carets.
   */
  suppressDrawRangeOnce_$ = false;

  /* For `EdtrScrolr.moveCaretLeft()`, etc */
  readonly move_rv_$ = new Ranval(0, 0);
  /* ~ */

  /* For dragging selection */
  ctnr_rv: Ranval | undefined;
  drag_rv_$: Ranval | undefined;
  get dragingSel(): boolean {
    return !!this.ctnr_rv && !!this.drag_rv_$;
  }
  /* ~ */

  private constructor(coo_x: EdtrBase) {
    super(coo_x);

    this.on("focus", this._onFocus);
    this.on("blur", this._onBlur);
  }
  /** @headconst @param coo_x */
  static override create(coo_x: EdtrBase) {
    const ret = new MainCaret(coo_x);
    ret.observeTheme();
    return ret;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  protected override sufDraw$(): void {
    if (!this.keepInlineOnce_$ && this.lastSin$) {
      this.inline_$ = genInlineMidOf(this.coo$._writingMode)(this.lastSin$);
      // console.log("🚀 ~ Caret ~ #drawFocus ~ inline_$:", this.inline_$);
    }
    this.keepInlineOnce_$ = false;

    const eslr = this.eslr;
    /*! `usingDup()` because `#focusLoc` will be used in `updateBidi()` */
    using loc_u = eslr.bufr.focusLoc(this.ranval).usingDup();
    loc_u.updateBidi(eslr);
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  @traceOut(_TRACE && EDTR)
  set #focusd(_x: boolean) {
    /*#static*/ if (_TRACE && EDTR) {
      console.log(
        `${trace.indent}>>>>>>> ${this.class_id}.#focusd( _x: ${_x}) >>>>>>>`,
      );
    }
    if (this.focusd$ === _x) return;

    this.focusd$ = _x;

    if (this.focusVisible$) {
      if (this.isMain$ && this.focusd$) {
        this.blink$();
      } else {
        this.stare$();
      }
    }

    //jjjj TOCLEANUP
    // if (this.focusd$) this.#ranval_kept = undefined; //!
  }

  @bind
  @traceOut(_TRACE && EDTR)
  private _onFocus(_evt_x: FocusEvent) {
    /*#static*/ if (_TRACE && EDTR) {
      console.log(
        `${trace.indent}>>>>>>> ${this.class_id}._onFocus() >>>>>>>`,
      );
    }
    this.#focusd = true;
    this.eslr.host.touched = true; //!
  }
  @bind
  @traceOut(_TRACE && EDTR)
  private _onBlur(_evt_x: FocusEvent) {
    /*#static*/ if (_TRACE && EDTR) {
      console.log(
        `${trace.indent}>>>>>>> ${this.class_id}._onBlur() >>>>>>>`,
      );
    }
    // console.log(`${trace.dent}edtr.mdraging: ${this.edtr.mdraging}`);
    // console.log(`${trace.dent}edtr.mdragged: ${this.edtr.mdragged}`);
    if (!this.eslr.mdraging) {
      this.#focusd = false;
    }
  }
}
/*80--------------------------------------------------------------------------*/
