/** 80**************************************************************************
 * @module lib/Scronr
 * @license MIT
 ******************************************************************************/

import { TouchSquaMIN } from "../alias.ts";
import { global } from "../global.ts";
import { _TRACE, CYPRESS, DEBUG, INOUT, RESIZ } from "../preNs.ts";
import { isClick } from "../util.ts";
import { Moo } from "./Moo.ts";
import type { BufrDir, SetLayoutP, unum } from "./alias.ts";
import {
  LOG_cssc,
  MouseButton,
  Scrobar_z,
  Scrod_z,
  ScrollInit,
  scrollO,
  WritingDir,
  WritingMode,
} from "./alias.ts";
import type { Id_t } from "./alias_v.ts";
import type { Colr } from "./color/Colr.ts";
import { Pale } from "./color/Pale.ts";
import type { Cssc } from "./color/alias.ts";
import type { Coo } from "./cv.ts";
import { HTMLVuu } from "./cv.ts";
import { div } from "./dom.ts";
import { assert, bind, fail } from "./util.ts";
import { trace, traceOut } from "./util/trace.ts";
/*80--------------------------------------------------------------------------*/

//jjjj TOCLEANUP
// /** in milliseconds */
// const ScronrRefresh_to_ = 500;

/** Scroll container */
export abstract class Scronr<C extends Coo> extends HTMLVuu<C, HTMLDivElement> {
  static #ID = 0 as Id_t;
  override readonly id = ++Scronr.#ID as Id_t;

  /* Pale */
  /* 2 #scrod_p */
  #scrod_p = Pale.get("lib.Scronr.scrod");
  get scrod_cp(): Colr | Pale {
    return this.#scrod_p;
  }
  #onScrodCssc = (_x: Cssc) => {
    this.scrodB$.el.style.backgroundColor = _x;
    this.scrodI$.el.style.backgroundColor = _x;
  };
  /* 2 ~ */

  /* 2 #scrodicatr_p */
  #scrodicatr_p = Pale.get("lib.Scronr.scrodicatr");
  get scrodicatr_cp(): Colr | Pale {
    return this.#scrodicatr_p;
  }
  #onScrodicatrCssc = (_x: Cssc) => {
    this.scrodB$.scrodicatr.el.style.backgroundColor = _x;
    this.scrodI$.scrodicatr.el.style.backgroundColor = _x;
  };
  /* 2 ~ */

  /* 2 #scrobar_p */
  #scrobar_p = Pale.get("lib.Scronr.scrobar");
  get scrobar_cp(): Colr | Pale {
    return this.#scrobar_p;
  }
  #onScrobarCssc = (_x: Cssc) => {
    this.scrobarB$.el.style.backgroundColor = _x;
    this.scrobarI$.el.style.backgroundColor = _x;
  };
  /* 2 ~ */

  /* 2 #slidr_p */
  #slidr_p = Pale.get("lib.Scronr.slidr");
  get slidr_cp(): Colr | Pale {
    return this.#slidr_p;
  }
  #onSlidrCssc = (_x: Cssc) => {
    this.scrobarB$.slidr.el.style.backgroundColor = _x;
    this.scrobarI$.slidr.el.style.backgroundColor = _x;
  };
  /* 2 ~ */

  override observeTheme() {
    this.#scrod_p.registCsscHandler(this.#onScrodCssc);
    this.#scrodicatr_p.registCsscHandler(this.#onScrodicatrCssc);
    this.#scrobar_p.registCsscHandler(this.#onScrobarCssc);
    this.#slidr_p.registCsscHandler(this.#onSlidrCssc);
  }
  override unobserveTheme() {
    this.#scrod_p.removeCsscHandler(this.#onScrodCssc);
    this.#scrodicatr_p.removeCsscHandler(this.#onScrodicatrCssc);
    this.#scrobar_p.removeCsscHandler(this.#onScrobarCssc);
    this.#slidr_p.removeCsscHandler(this.#onSlidrCssc);
  }
  /* ~ */
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  #scrolr!: Scrolr<C>;
  get scrolr() {
    return this.#scrolr;
  }
  protected readonly scrodB$: ScrodB_<C>;
  protected readonly scrodI$: ScrodI_<C>;

  protected readonly scrobarB$: ScrobarB_<C>;
  get slidrB() {
    return this.scrobarB$.slidr;
  }

  protected readonly scrobarI$: ScrobarI_<C>;
  get slidrI() {
    return this.scrobarI$.slidr;
  }

  touched = false;
  /*jjjj Currently, for `htb` only. To enable this for `vrl` and `vlr`,
  carefully check `scrollLeft`  which could be negative. */
  protected scrollInit$ = ScrollInit.bgn;

  /** @final */
  get bufrDir(): BufrDir {
    return this.#scrolr.bufrDir;
  }

  /** @final */
  readonly writingMode_mo = new Moo({ val: WritingMode.htb, active: true });
  /** @final */
  get writingMode(): WritingMode {
    return this.writingMode_mo.val;
  }

  /** scroll block-start */
  readonly scrollBStrt_mo = new Moo<unum>({
    val: 0,
    eq_: (a, b) => Number.apxE(a, b),
  });
  /** scroll inline-start */
  readonly scrollIStrt_mo = new Moo<unum>({
    val: 0,
    eq_: (a, b) => Number.apxE(a, b),
  });

  /* #clientBSize, #scrollBSize */
  //jjjj TOCLEANUP
  // /**
  //  * scroll block-start, used to detect in `_onScroll_scrolr()` vertical or
  //  * horizontal scroll
  //  */
  // #scrollBStrt: unum = 0;

  /** client block-size */
  #clientBSize: unum = 0;
  #getClientBSize(): unum {
    return this.writingMode & WritingDir.v
      ? this.#scrolr.el.clientWidth
      : this.#scrolr.el.clientHeight;
  }

  #scrollBSize: unum = 0;
  #getScrollBSize(): unum {
    return this.writingMode & WritingDir.v
      ? this.#scrolr.el.scrollWidth
      : this.#scrolr.el.scrollHeight;
  }

  // get #contentBSize(): unum {
  //   return this.#scrollBSize +
  //     this.#scrolr.contentBStrt + this.#scrolr.contentBFoot;
  // }

  get #slidrOrigBSize() {
    return this.#clientBSize ** 2 / this.#scrollBSize;
  }
  get #slidrBSize() {
    return Math.max(this.#slidrOrigBSize, Slidr_.SizeMIN);
  }

  /** @const @param scrollBStrt_x */
  #calcSlidrBStrt(scrollBStrt_x: unum) {
    return scrollBStrt_x *
      ((this.#clientBSize - this.#slidrBSize) /
        (this.#scrollBSize - this.#clientBSize));
  }

  calcScrollBStrt_$(slidrBStrt_x: unum): unum {
    //jjjj TOCLEANUP
    // return this.#slidrOrigBSize >= Slidr_.SizeMIN
    //   ? slidrBStrt_x / (this.#clientBSize / this.#scrollBSize)
    //   : slidrBStrt_x /
    //     ((this.#clientBSize - Slidr_.SizeMIN) /
    //       (this.#scrollBSize - this.#clientBSize));
    return slidrBStrt_x /
      ((this.#clientBSize - this.#slidrBSize) /
        (this.#scrollBSize - this.#clientBSize));
  }

  /**
   * @final
   * @const @param clientStrt_x
   * @return scroll block-start
   */
  calcJumpBStrt_$(clientStrt_x: unum): unum {
    //jjjj TOCLEANUP
    // const controlBStrt = clientStrt_x *
    //   (this.#contentBSize - this.#clientBSize) / this.#clientBSize;
    // return controlBStrt * this.#scrollBSize / this.#contentBSize;
    return clientStrt_x * this.#scrollBSize / this.#clientBSize;
  }
  /* ~ */

  /* #clientISize, #scrollISize */
  //jjjj TOCLEANUP
  // /**
  //  * scroll inline-start, used to detect in `_onScroll_scrolr()` vertical or
  //  * horizontal scroll
  //  */
  // #scrollIStrt: unum = 0;

  /** client inline-size */
  #clientISize: unum = 0;
  #getClientISize(): unum {
    return this.writingMode & WritingDir.v
      ? this.#scrolr.el.clientHeight
      : this.#scrolr.el.clientWidth;
  }

  #scrollISize: unum = 0;
  #getScrollISize(): unum {
    return this.writingMode & WritingDir.v
      ? this.#scrolr.el.scrollHeight
      : this.#scrolr.el.scrollWidth;
  }

  // get #contentISize(): unum {
  //   return this.#scrollISize +
  //     this.#scrolr.contentIStrt + this.#scrolr.contentIFoot;
  // }

  get #slidrOrigISize() {
    return this.#clientISize ** 2 / this.#scrollISize;
  }
  get #slidrISize() {
    return Math.max(this.#slidrOrigISize, Slidr_.SizeMIN);
  }

  /** @const @param scrollIStrt_x */
  #calcSlidrIStrt(scrollIStrt_x: unum) {
    //jjjj TOCLEANUP
    // return this.#slidrOrigISize >= Slidr_.SizeMIN
    //   ? scrollIStrt_x * this.#clientISize / this.#scrollISize
    //   : scrollIStrt_x *
    //     ((this.#clientISize - Slidr_.SizeMIN) /
    //       (this.#scrollISize - this.#clientISize));
    return scrollIStrt_x *
      ((this.#clientISize - this.#slidrISize) /
        (this.#scrollISize - this.#clientISize));
  }

  calcScrollIStrt_$(slidrIStrt_x: unum): unum {
    //jjjj TOCLEANUP
    // return this.#slidrOrigISize >= Slidr_.SizeMIN
    //   ? slidrIStrt_x / (this.#clientISize / this.#scrollISize)
    //   : slidrIStrt_x /
    //     ((this.#clientISize - Slidr_.SizeMIN) /
    //       (this.#scrollISize - this.#clientISize));
    return slidrIStrt_x /
      ((this.#clientISize - this.#slidrISize) /
        (this.#scrollISize - this.#clientISize));
  }

  /**
   * @final
   * @const @param clientStrt_x
   * @return scroll inline-start
   */
  calcJumpIStrt_$(clientStrt_x: unum): unum {
    //jjjj TOCLEANUP
    // return clientStrt_x *
    //   (this.#contentISize - this.#clientISize) / this.#clientISize;
    return clientStrt_x * this.#scrollISize / this.#clientISize;
  }
  /* ~ */

  /** @headconst @param coo_x */
  constructor(coo_x: C) {
    super(coo_x, div());

    // /*#static*/ if (DEBUG) {
    //   this.el$.id = this.class_id;
    // }
    this.assignStylo({
      display: "grid",
      position: "relative",
      // overflow: "hidden",
      gridTemplateRows: [
        "[row-frst] var(--t)",
        "[row-main-frst] 1fr",
        `[row-rod] ${Scrod_.Thik}px`,
        "[row-main-last] var(--b)",
        "[row-last]",
      ].join(" "),
      gridTemplateColumns: [
        "[col-frst] var(--l)",
        "[col-main-frst] 1fr",
        `[col-rod] ${Scrod_.Thik}px`,
        "[col-main-last] var(--r)",
        "[col-last]",
      ].join(" "),

      contain: "size paint",
      isolation: "isolate", // to form a new stacking context
    });
    this.el$.style.assignPropo({
      "--t": "0",
      "--b": "0",
      "--l": "0",
      "--r": "0",
    });

    this.scrodB$ = new ScrodB_(this);
    this.scrodI$ = new ScrodI_(this);

    this.scrobarB$ = new ScrobarB_(this);
    this.scrobarI$ = new ScrobarI_(this);

    this.el$.append(
      this.scrodB$.el,
      this.scrodI$.el,
      this.scrobarB$.el,
      this.scrobarI$.el,
    );

    this.scrollBStrt_mo.registHandler(this.#moScrollBStrt);
    this.scrollIStrt_mo.registHandler(this.#moScrollIStrt);

    this.resizob.observe(this.el$);
  }

  #scrolrInited = false;
  /**
   * Called by subclasses
   *
   * This method does not have to be called, i.e., it could be the state that
   * `!#scrolrInited`, `#scrolr` are not set.
   *
   * @final
   * @headconst @param scrolr_x
   */
  initScrolr(scrolr_x: Scrolr<C>): void {
    /*#static*/ if (INOUT) {
      assert(!this.#scrolrInited);
    }
    /* Assign styles here to make sure the highest priority. */
    this.#scrolr = scrolr_x.assignStylo({
      overflow: "hidden",
    });

    this.el$.append(scrolr_x.el);

    this.resizob.observe(scrolr_x.el);

    this.el$.onWheel(this._onWheel);
    scrolr_x.on("scroll", this._onScroll_scrolr);

    this.#scrolrInited = true;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * Could be called during `writingMode_mo` callbacks. Since its `active: true`,
   * so `writingMode` is new.
   *
   * `in( this.#scrolrInited)`
   *
   * @final
   * @const @param lo_x act as a verifier if any
   */
  syncLayout(lo_x?: SetLayoutP) {
    /*#static*/ if (INOUT) {
      assert(!lo_x?.writingMode || lo_x.writingMode === this.writingMode);
    }
    /* final switch */ ({
      [WritingMode.htb]: () => {
        this.el$.style.writingMode = "horizontal-tb";
      },
      [WritingMode.vrl]: () => {
        this.el$.style.writingMode = "vertical-rl";
      },
      [WritingMode.vlr]: () => {
        this.el$.style.writingMode = "vertical-lr";
      },
    }[this.writingMode])();
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // /**
  //  * Set `#contentISize` or `#contentBSize`
  //  * @const @param contentValu_x
  //  * @param contentSize_x
  //  * @const @param inline_x
  //  * @return scroll-box value
  //  */
  // #preScrollScrolr(
  //   contentValu_x: number,
  //   contentSize_x: unum | undefined,
  //   inline_x?: "inline",
  // ): number {
  //   contentSize_x ??= inline_x ? this.#contentISize : this.#contentBSize;

  //   const el_ = this.#scrolr.el;
  //   const scrollSize = this.writingMode & WritingDir.v
  //     ? (inline_x ? el_.scrollHeight : el_.scrollWidth)
  //     : (inline_x ? el_.scrollWidth : el_.scrollHeight);

  //   if (contentSize_x < scrollSize) contentSize_x = scrollSize;
  //   if (inline_x) this.#contentISize = contentSize_x;
  //   else this.#contentBSize = contentSize_x;

  //   return contentValu_x * scrollSize / contentSize_x;
  // }

  /** @const@param options */
  #scrollScrolrTo_impl(options: ScrollToOptions): void {
    this.#scrolr.el.scrollTo(options);

    this.#scrolr.sufScroll(); // 3258 Actions not causing "scroll" still need `sufScroll()`
  }
  /** @const@param options */
  #scrollScrolrBy_impl(options: ScrollToOptions): void {
    this.#scrolr.el.scrollBy(options);

    this.#scrolr.toControlBStrt_$ = undefined;
    this.#scrolr.toControlIStrt_$ = undefined;
    this.#scrolr.sufScroll();
  }

  protected toControlBStrt$: unum | undefined;
  protected toControlIStrt$: unum | undefined;
  /**
   * Use `scrollO`.
   * @const @param controlValu_x content-scroll value
   * @const @param inline_x
   */
  // @traceOut(_TRACE)
  scrollScrolrTo(controlValu_x: unum, inline_x?: "inline"): void {
    // /*#static*/ if (_TRACE) {
    //   console.log(
    //     `${trace.indent}>>>>>>> `,
    //     `${this.class_id}.scrollScrolrTo( ${val_x.fixTo(2)}, ${inline_x})`,
    //     `>>>>>>>`,
    //   );
    // }
    //jjjj TOCLEANUP
    // const scrollValu = this.#preScrollScrolr(
    //   contentValu_x,
    //   contentSize_x,
    //   inline_x,
    // );

    if (inline_x) this.#scrolr.toControlIStrt_$ = controlValu_x;
    else this.#scrolr.toControlBStrt_$ = controlValu_x;

    if (inline_x) {
      const scrollValu = controlValu_x - this.#scrolr.contentIStrt;
      /* final switch */ ({
        [WritingMode.htb]: () => {
          scrollO.top = this.#scrolr.el.scrollTop;
          scrollO.left = scrollValu;
        },
        [WritingMode.vrl]: () => {
          scrollO.top = scrollValu;
          scrollO.left = this.#scrolr.el.scrollLeft;
        },
        [WritingMode.vlr]: () => {
          scrollO.top = scrollValu;
          scrollO.left = this.#scrolr.el.scrollLeft;
        },
      }[this.writingMode])();
    } else {
      const scrollValu = controlValu_x - this.#scrolr.contentBStrt;
      /* final switch */ ({
        [WritingMode.htb]: () => {
          scrollO.top = scrollValu;
          scrollO.left = this.#scrolr.el.scrollLeft;
        },
        [WritingMode.vrl]: () => {
          scrollO.top = this.#scrolr.el.scrollTop;
          scrollO.left = -scrollValu;
        },
        [WritingMode.vlr]: () => {
          scrollO.top = this.#scrolr.el.scrollTop;
          scrollO.left = scrollValu;
        },
      }[this.writingMode])();
    }
    this.#scrollScrolrTo_impl(scrollO);
  }

  /**
   * Use `scrollO`.
   * @const @param scrollValu_x
   * @const @param inline_x
   */
  scrollScrolrBy(scrollValu_x: number, inline_x?: "inline"): void {
    if (inline_x) {
      /* final switch */ ({
        [WritingMode.htb]: () => {
          scrollO.top = 0;
          scrollO.left = -scrollValu_x;
        },
        [WritingMode.vrl]: () => {
          scrollO.top = scrollValu_x;
          scrollO.left = 0;
        },
        [WritingMode.vlr]: () => {
          scrollO.top = scrollValu_x;
          scrollO.left = 0;
        },
      }[this.writingMode])();
    } else {
      /* final switch */ ({
        [WritingMode.htb]: () => {
          scrollO.top = scrollValu_x;
          scrollO.left = 0;
        },
        [WritingMode.vrl]: () => {
          scrollO.top = 0;
          scrollO.left = -scrollValu_x;
        },
        [WritingMode.vlr]: () => {
          scrollO.top = 0;
          scrollO.left = -scrollValu_x;
        },
      }[this.writingMode])();
    }
    this.#scrollScrolrBy_impl(scrollO);
  }

  /**
   * Assume "threshold: 1".\
   * Use `scrollO`.
   * @const @param tgt_x
   * @const @param ins_x inset
   */
  // @traceOut(_TRACE)
  scrollScrolrContain(tgt_x: DOMRectReadOnly, ins_x = 0) {
    // /*#static*/ if (_TRACE) {
    //   console.log(
    //     `${trace.indent}>>>>>>> `,
    //     `${this.class_id}.scrollScrolrContain( , ${ins_x})`,
    //     `>>>>>>>`,
    //   );
    // }
    const b_0 = this.#scrolr.bcr_1;
    const tgtTop = tgt_x.top - b_0.top;
    const tgtLeft = tgt_x.left - b_0.left;

    //jjjj TOCLEANUP
    // scrollO.top = tgtTop + tgt_x.height -
    //   (this.#scrolr.el.clientHeight - ins_x);
    scrollO.top = tgtTop + tgt_x.height - (b_0.height - ins_x);
    if (scrollO.top <= 0) {
      scrollO.top = tgtTop - ins_x;
      if (scrollO.top > 0) scrollO.top = 0;
    }

    //jjjj TOCLEANUP
    // scrollO.left = tgtLeft + tgt_x.width -
    //   (this.#scrolr.el.clientWidth - ins_x);
    scrollO.left = tgtLeft + tgt_x.width - (b_0.width - ins_x);
    if (scrollO.left <= 0) {
      scrollO.left = tgtLeft - ins_x;
      if (scrollO.left > 0) scrollO.left = 0;
    }

    // console.log(`${trace.dent}`, scrollO);
    this.#scrollScrolrBy_impl(scrollO);
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** @const @param bsize_x block-size */
  #setSlidrBSize(bsize_x: unum): void {
    this.scrodB$.scrodicatr.el.style.blockSize =
      this.scrobarB$.slidr.el.style.blockSize =
        `${bsize_x}px`;
  }
  /** @const @param bstrt_x block-start */
  #setSlidrBStrt(bstrt_x: unum): void {
    this.scrodB$.scrodicatr.el.style.insetBlockStart =
      this.scrobarB$.slidr.el.style.insetBlockStart =
        `${bstrt_x}px`;
  }

  /** @const @param isize_x inline-size */
  #setSlidrISize(isize_x: unum): void {
    this.scrodI$.scrodicatr.el.style.inlineSize =
      this.scrobarI$.slidr.el.style.inlineSize =
        `${isize_x}px`;
  }
  /** @const @param istrt_x inline-start */
  #setSlidrIStrt(istrt_x: unum): void {
    this.scrodI$.scrodicatr.el.style.insetInlineStart =
      this.scrobarI$.slidr.el.style.insetInlineStart =
        `${istrt_x}px`;
  }

  //jjjj TOCLEANUP
  // /** in milliseconds */
  // static SlidrGapMAX = 50;
  // #lastSlidrBStrt_ts = 0 as Ts_t;
  /** @const @param n_x */
  readonly #moScrollBStrt = (n_x: unum) => {
    //jjjj TOCLEANUP
    // const ts_ = Date.now_1() as Ts_t;
    // if (ts_ - this.#lastSlidrBStrt_ts > Scronr.SlidrGapMAX) {
    this.scrodB$.show();
    if (global.canHover || CYPRESS) {
      this.scrobarB$.show();
    } //llll otherwise impl swipe to scroll

    this.#setSlidrBStrt(this.#calcSlidrBStrt(n_x));
    //jjjj TOCLEANUP
    //   this.#lastSlidrBStrt_ts = ts_;
    // }
  };
  //jjjj TOCLEANUP
  // #lastSlidrIStrt_ts = 0 as Ts_t;
  /** @const @param n_x */
  readonly #moScrollIStrt = (n_x: unum) => {
    //jjjj TOCLEANUP
    // const ts_ = Date.now_1() as Ts_t;
    // if (ts_ - this.#lastSlidrIStrt_ts > Scronr.SlidrGapMAX) {
    this.scrodI$.show();
    if (global.canHover || CYPRESS) {
      this.scrobarI$.show();
    } //llll otherwise impl swipe to scroll

    this.#setSlidrIStrt(this.#calcSlidrIStrt(n_x));
    //jjjj TOCLEANUP
    //   this.#lastSlidrIStrt_ts = ts_;
    // }
  };

  //jjjj TOCLEANUP
  // #suppressRefreshOnce = false;
  /**
   * Also update `#clientBSize`, `#clientISize`, `#scrollBSize`, `#scrollISize`
   * @final
   */
  @bind
  // @traceOut(_TRACE)
  refresh_Scronr(): void {
    // /*#static*/ if (_TRACE) {
    //   console.log(
    //     `${trace.indent}>>>>>>> ${this.class_id}.refresh_Scronr() >>>>>>>`,
    //   );
    //   console.log(
    //     `${trace.dent}isConnected: ${this.el$.isConnected}, #scrolrInited: ${this.#scrolrInited}`,
    //   );
    // }
    if (!this.el$.isConnected || !this.#scrolrInited) return;
    //jjjj TOCLEANUP
    // if (this.#suppressRefreshOnce) {
    //   this.#suppressRefreshOnce = false;
    //   return;
    // }

    this.#clientBSize = this.#getClientBSize();
    this.#scrollBSize = this.#getScrollBSize();
    // console.log({
    //   clientBSize: this.#clientBSize,
    //   scrollBSize: this.#scrollBSize,
    // });
    this.#clientISize = this.#getClientISize();
    this.#scrollISize = this.#getScrollISize();
    // console.log({
    //   clientISize: this.#clientISize,
    //   scrollISize: this.#scrollISize,
    // });

    if (this.writingMode & WritingDir.v) {
      this.scrollBStrt_mo.set_Moo(Math.abs(this.#scrolr.el.scrollLeft));
    } else {
      if (!this.touched) {
        this.#scrolr.el.scrollTop = /* final switch */ {
          [ScrollInit.bgn]: 0,
          [ScrollInit.end]: this.#scrollBSize - this.#clientBSize,
        }[this.scrollInit$];
      }
      // console.log(`scrollTop: ${this.#scrolr.el.scrollTop}`);
      this.scrollBStrt_mo.set_Moo(this.#scrolr.el.scrollTop);
    }
    if (0 < this.#clientBSize && this.#clientBSize < this.#scrollBSize) {
      this.#setSlidrBSize(this.#slidrBSize);
      this.scrollBStrt_mo.refresh_Moo();
    } else {
      this.scrodB$.hide_$();
      this.scrobarB$.hide_$();
    }

    this.scrollIStrt_mo.set_Moo(
      Math.abs(
        this.writingMode & WritingDir.v
          ? this.#scrolr.el.scrollTop
          : this.#scrolr.el.scrollLeft,
      ),
    );
    if (0 < this.#clientISize && this.#clientISize < this.#scrollISize) {
      this.#setSlidrISize(this.#slidrISize);
      this.scrollIStrt_mo.refresh_Moo();
    } else {
      this.scrodI$.hide_$();
      this.scrobarI$.hide_$();
    }

    //jjjj TOCLEANUP
    // this.#scrolr.updateContentBStrt_$(
    //   this.#clientBSize,
    //   this.#scrollBSize,
    //   this.scrollBStrt_mo.val,
    // );
    // this.#scrolr.updateContentIStrt_$(
    //   this.#clientISize,
    //   this.#scrollISize,
    //   this.scrollIStrt_mo.val,
    // );
  }

  //jjjj TOCLEANUP
  // #refresh_to: number | undefined;
  // toRefresh() {
  //   if (this.#refresh_to !== undefined) {
  //     clearTimeout(this.#refresh_to);
  //   }
  //   this.#refresh_to = window
  //     .setTimeout(this.refresh_Scronr, ScronrRefresh_to_);
  // }

  readonly resizob = new ResizeObserver(this._onResiz);
  @bind
  @traceOut(_TRACE && RESIZ)
  private _onResiz() {
    /*#static*/ if (_TRACE && RESIZ) {
      console.log(
        `%c${trace.indent}>>>>>>> ${this.class_id}._onResiz() >>>>>>>`,
        `color:${LOG_cssc.resiz}`,
      );
      console.log(
        `${trace.dent}isConnected: ${this.el$.isConnected}, #scrolrInited: ${this.#scrolrInited}`,
      );
    }
    if (!this.el$.isConnected || !this.#scrolrInited) return;

    this.refresh_Scronr();
  }

  /**
   * Also update `#clientBSize`, `#clientISize`, `#scrollBSize`, `#scrollISize`,
   * because this could be called before `refresh_Scronr()`.\
   * `in( this.#scrolrInited)`
   */
  @bind
  // @traceOut(_TRACE)
  private _onScroll_scrolr(_evt_x: Event) {
    // /*#static*/ if (_TRACE) {
    //   console.log(
    //     `${trace.indent}>>>>>>> ${this.class_id}._onScroll_scrolr() >>>>>>>`,
    //   );
    // }
    this.#clientBSize = this.#getClientBSize();
    this.#scrollBSize = this.#getScrollBSize();
    this.#clientISize = this.#getClientISize();
    this.#scrollISize = this.#getScrollISize();

    const scrollLeft = this.#scrolr.el.scrollLeft;
    const scrollTop = this.#scrolr.el.scrollTop;
    // console.log({ scrollLeft, scrollTop });
    this.scrollBStrt_mo.val = Math.abs(
      this.writingMode & WritingDir.v ? scrollLeft : scrollTop,
    );
    this.scrollIStrt_mo.val = Math.abs(
      this.writingMode & WritingDir.v ? scrollTop : scrollLeft,
    );

    //jjjj TOCLEANUP
    // this.#scrolr.updateContentBStrt_$(
    //   this.#clientBSize,
    //   this.#scrollBSize,
    //   this.scrollBStrt_mo.val,
    // );
    // this.#scrolr.updateContentIStrt_$(
    //   this.#clientISize,
    //   this.#scrollISize,
    //   this.scrollIStrt_mo.val,
    // );

    //jjjj TOCLEANUP
    // /* prevent jitter */
    // this.#suppressRefreshOnce = true;
  }

  static readonly Delta = 50;

  /** `in( this.#scrolrInited)` */
  @bind
  // @traceOut(_TRACE)
  private _onWheel(evt_x: WheelEvent) {
    // /*#static*/ if (_TRACE) {
    //   console.log(
    //     `${trace.indent}>>>>>>> ${this.class_id}._onWheel(`,
    //     evt_x._repr_,
    //     `) >>>>>>>`,
    //   );
    // }
    // console.log(`clientX: ${evt_x.clientX}, clientY: ${evt_x.clientY}`);
    // console.log(evt_x);
    // evt_x.preventDefault();
    this.scrollScrolrBy(
      evt_x.deltaY > 0 ? Scronr.Delta : -Scronr.Delta,
      evt_x.shiftKey ? "inline" : undefined,
    );
    this.touched = true;
  }
}
/*64----------------------------------------------------------*/

/** Scrolller, the HTMLVuu scrolling */
export abstract class Scrolr<C extends Coo> extends HTMLVuu<C, HTMLDivElement> {
  readonly host;

  get bufrDir(): BufrDir {
    return "ltr";
  }

  //jjjj TOCLEANUP
  // /* #contentBSize */
  // #contentBSize: unum = 0;
  // protected set contentBSize$(_x: unum) {
  //   this.#contentBSize = _x;
  // }

  // protected updateContentBSize$(): void {}
  // /* ~ */

  // /* #contentISize */
  // #contentISize: unum = 0;
  // protected set contentISize$(_x: unum) {
  //   this.#contentISize = _x;
  // }

  // protected updateContentISize$(): void {}
  // /* ~ */
  //~ TOCLEANUP

  /* #contentBStrt */
  #contentBStrt: unum = 0;
  get contentBStrt(): unum {
    return this.#contentBStrt;
  }
  protected set contentBStrt$(_x: unum) {
    this.#contentBStrt = _x;
  }

  //jjjj TOCLEANUP
  // /**
  //  * @const @param clientBSize_x
  //  * @const @param scrollBSize_x
  //  * @const @param scrollBStrt_x
  //  */
  // updateContentBStrt_$(
  //   clientBSize_x: unum,
  //   scrollBSize_x: unum,
  //   scrollBStrt_x: unum,
  // ): void {
  //   this.updateContentBSize$();
  //   if (scrollBSize_x - clientBSize_x > 0) {
  //     this.#contentBStrt = scrollBStrt_x *
  //       Math.max(this.#contentBSize - scrollBSize_x, 0) /
  //       (scrollBSize_x - clientBSize_x);
  //   } else {
  //     this.#contentBStrt = 0;
  //   }
  // }
  /* ~ */

  // /* #contentBFoot */
  // #contentBFoot: unum = 0;
  // get contentBFoot(): unum {
  //   return this.#contentBFoot;
  // }
  // protected set contentBFoot$(_x: unum) {
  //   this.#contentBFoot = _x;
  // }
  // /* ~ */

  /* #contentIStrt */
  #contentIStrt: unum = 0;
  get contentIStrt(): unum {
    return this.#contentIStrt;
  }
  protected set contentIStrt$(_x: unum) {
    this.#contentIStrt = _x;
  }

  //jjjj TOCLEANUP
  // /**
  //  * @const @param clientISize_x
  //  * @const @param scrollISize_x
  //  * @const @param scrollIStrt_x
  //  */
  // updateContentIStrt_$(
  //   clientISize_x: unum,
  //   scrollISize_x: unum,
  //   scrollIStrt_x: unum,
  // ): void {
  //   this.updateContentISize$();
  //   if (scrollISize_x - clientISize_x > 0) {
  //     this.#contentIStrt = scrollIStrt_x *
  //       Math.max(this.#contentISize - scrollISize_x, 0) /
  //       (scrollISize_x - clientISize_x);
  //   } else {
  //     this.#contentIStrt = 0;
  //   }
  // }
  /* ~ */

  // /* #contentIFoot */
  // #contentIFoot: unum = 0;
  // get contentIFoot(): unum {
  //   return this.#contentIFoot;
  // }
  // protected set contentIFoot$(_x: unum) {
  //   this.#contentIFoot = _x;
  // }
  // /* ~ */

  protected toControlBStrt$: unum | undefined;
  set toControlBStrt_$(_x: unum | undefined) {
    this.toControlBStrt$ = _x;
  }

  protected toControlIStrt$: unum | undefined;
  set toControlIStrt_$(_x: unum | undefined) {
    this.toControlIStrt$ = _x;
  }

  /** @headconst @param host_x */
  constructor(host_x: Scronr<C>) {
    super(host_x.coo, div());
    this.host = host_x;

    /*#static*/ if (CYPRESS || DEBUG) {
      this.el$.hint = this.class_id;
    }
    this.assignStylo({
      // position: "relative",
      gridArea: "row-main-frst / col-main-frst / row-main-last / col-main-last",
    });
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  sufScroll(): void {}
}
/*64----------------------------------------------------------*/

/** Scroll rod */
abstract class Scrod_<C extends Coo> extends HTMLVuu<C, HTMLDivElement> {
  // static #ID = 0 as Id_t;
  // override readonly id = ++Scrod_.#ID as Id_t;
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  static readonly Thik = 2;

  readonly host;

  /* #shown */
  #shown = true;
  get shown() {
    return this.#shown;
  }
  show() {
    if (this.#shown) return;

    this.el$.style.display = "revert";
    this.#shown = true;
  }
  hide_$() {
    if (!this.#shown) return;

    this.el$.style.display = "none";
    this.#shown = false;
  }
  /* ~ */

  abstract readonly scrodicatr: Scrodicatr_<C>;

  /** @headconst @param host_x */
  constructor(host_x: Scronr<C>) {
    super(host_x.coo, div());
    this.host = host_x;

    /*#static*/ if (CYPRESS || DEBUG) {
      this.el$.hint = this.class_id;
    }
    this.assignStylo({
      position: "relative",
      zIndex: Scrod_z,

      backgroundColor: host_x.scrod_cp.cssc,
    });
    this.hide_$();
  }
}

/**
 * Block scroll rod
 * @final
 */
class ScrodB_<C extends Coo> extends Scrod_<C> {
  /** @implement */
  readonly scrodicatr;

  /** @headconst @param host_x */
  constructor(host_x: Scronr<C>) {
    super(host_x);

    this.assignStylo({
      gridArea: "row-main-frst / col-rod / row-main-last / col-main-last",
    });

    this.scrodicatr = new ScrodicatrB_(this);

    this.el$.append(
      this.scrodicatr.el,
    );
  }
}

/**
 * Inline scroll rod
 * @final
 */
class ScrodI_<C extends Coo> extends Scrod_<C> {
  /** @implement */
  readonly scrodicatr;

  /** @headconst @param host_x */
  constructor(host_x: Scronr<C>) {
    super(host_x);

    this.assignStylo({
      gridArea: "row-rod / col-main-frst / row-main-last / col-main-last",
    });

    this.scrodicatr = new ScrodicatrI_(this);

    this.el$.append(
      this.scrodicatr.el,
    );
  }
}
/*49-------------------------------------------*/

/** Scroll indicator */
abstract class Scrodicatr_<C extends Coo> extends HTMLVuu<C, HTMLDivElement> {
  /** @headconst @param host_x */
  constructor(host_x: Scrod_<C>) {
    super(host_x.coo, div());

    this.assignStylo({
      position: "absolute",

      backgroundColor: host_x.host.scrodicatr_cp.cssc,
    });
  }
}

/**
 * Block scroll indicator
 * @final
 */
class ScrodicatrB_<C extends Coo> extends Scrodicatr_<C> {
  constructor(host_x: ScrodB_<C>) {
    super(host_x);

    this.assignStylo({
      inlineSize: "100%",
    });
  }
}

/**
 * Inline scroll indicator
 * @final
 */
class ScrodicatrI_<C extends Coo> extends Scrodicatr_<C> {
  constructor(host_x: ScrodI_<C>) {
    super(host_x);

    this.assignStylo({
      blockSize: "100%",
    });
  }
}
/*64----------------------------------------------------------*/

/** in milliseconds */
export const ScrobarHide_to = 2_000;

/** Scrollbar */
abstract class Scrobar_<C extends Coo> extends HTMLVuu<C, HTMLDivElement> {
  // static #ID = 0 as Id_t;
  // override readonly id = ++Scrobar_.#ID as Id_t;
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  static readonly SizeMAX = 44;

  readonly host;

  /** inline-start or block-start */
  protected strt$ = Number.MAX_SAFE_INTEGER;
  get strt() {
    return this.strt$;
  }
  set strt(_x: unum) {
    fail("Disabled");
  }

  strtMax = 0;
  protected abstract setStrtMax$(): void;

  /* show */
  protected shown$ = false;
  /** @final */
  get shown() {
    return this.shown$;
  }

  #pointerEntered = false;

  /** @final */
  show() {
    //jjjj TOCLEANUP
    // clearTimeout(this.#hide_to);
    // console.log(`%crun here: setTimeout`, `color:${LOG_cssc.runhere}`);
    // this.#hide_to = setTimeout(this.hide, ScrobarHide_to * 2);
    if (this.#pointerEntered) {
      window.clearTimeout(this.#hide_to);
    } else {
      this.toHide_$();
    }

    if (this.shown$) return;

    this.el$.style.display = "revert";

    this.setStrtMax$();
    // console.log({ strt: this.strt, strtMax: this.strtMax });
    if (this.strt$ > this.strtMax) this.strt = this.strtMax;
    this.shown$ = true;
  }

  /* hide_$ */
  readonly hide_$ = () => {
    this.el$.style.display = "none";
    this.shown$ = false;
  };

  /* #hide_to */
  #hide_to: number | undefined;
  //jjjj TOCLEANUP
  // get hide_to() {
  //   return this.#hide_to;
  // }

  toHide_$() {
    window.clearTimeout(this.#hide_to);
    this.#hide_to = window.setTimeout(this.hide_$, ScrobarHide_to);
  }
  /* ~ */

  abstract readonly slidr: Slidr_<C>;

  /** `Moo` of `Slidr_` block-start or inline-start */
  readonly slidrStrt_mo = new Moo({ val: 0 });

  /** @headconst @param host_x */
  constructor(host_x: Scronr<C>) {
    super(host_x.coo, div());
    this.host = host_x;

    /*#static*/ if (CYPRESS || DEBUG) {
      this.el$.hint = this.class_id;
    }
    this.assignStylo({
      display: "none",
      position: "absolute",
      zIndex: Scrobar_z,

      backgroundColor: host_x.scrobar_cp.cssc,
    });

    this.on("pointerdown", this.#onPointerDown);
    if (global.canHover) {
      this.on("pointerenter", this.#onPointerEnter);
      this.on("pointerleave", this.#onPointerLeave);
    }
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  abstract setAlong_$(): void;
  abstract setAcros_$(): void;

  /**
   * @const @param dtB_x
   * @const @param dtI_x
   */
  abstract dragAlong_$(dtB_x: number, dtI_x: number): void;
  /**
   * @const @param dtB_x
   * @const @param dtI_x
   */
  abstract dragAcros_$(dtB_x: number, dtI_x: number): void;

  /**
   * @const @param clientX_x
   * @const @param clientY_x
   */
  abstract jump_$(clientX_x: number, clientY_x: number): void;

  clientX_$ = 0;
  clientY_$ = 0;
  readonly #onPointerDown = (evt_x: PointerEvent) => {
    if (evt_x.button === MouseButton.Main) {
      evt_x.preventDefault(); // prevent focus transfer
      evt_x.stopPropagation();

      this.setAcros_$();
      this.clientX_$ = evt_x.clientX;
      this.clientY_$ = evt_x.clientY;

      global.mw?.on("pointermove", this.#onPointerMove);
      global.mw?.on("pointerup", this.#onPointerUp);
    } else if (evt_x.button === MouseButton.Auxiliary) {
      evt_x.preventDefault(); // prevent focus transfer
      evt_x.stopPropagation();

      this.clientX_$ = evt_x.clientX;
      this.clientY_$ = evt_x.clientY;
      global.mw?.on("pointerup", this.#onPointerUp);
    }
  };

  readonly #onPointerMove = (evt_x: PointerEvent) => {
    const dtX = evt_x.clientX - this.clientX_$;
    const dtY = evt_x.clientY - this.clientY_$;
    const wm_ = this.host.writingMode;
    const dtB = /* final switch */ {
      [WritingMode.htb]: dtY,
      [WritingMode.vrl]: -dtX,
      [WritingMode.vlr]: dtX,
    }[wm_];
    const dtI = /* final switch */ ({
      ltr: () => (/* final switch */ {
        [WritingMode.htb]: dtX,
        [WritingMode.vrl]: dtY,
        [WritingMode.vlr]: dtY,
      }[wm_]),
      rtl: () => (/* final switch */ {
        [WritingMode.htb]: -dtX,
        [WritingMode.vrl]: -dtY,
        [WritingMode.vlr]: -dtY,
      }[wm_]),
    }[this.host.bufrDir])();
    this.dragAcros_$(dtB, dtI);
  };

  readonly #onPointerUp = (evt_x: PointerEvent) => {
    evt_x.stopPropagation();

    if (
      evt_x.button === MouseButton.Auxiliary &&
      isClick(evt_x.clientX, evt_x.clientY, this.clientX_$, this.clientY_$)
    ) {
      /* Here seems to have default behavior that the focused MainCaret is
      always visible inline-wise. */
      evt_x.preventDefault();

      this.jump_$(evt_x.clientX, evt_x.clientY);
    }

    global.mw?.off("pointermove", this.#onPointerMove);
    global.mw?.off("pointerup", this.#onPointerUp);
  };

  readonly #onPointerEnter = () => {
    this.#pointerEntered = true;
    // console.log(`%crun here: clearTimeout`, `color:${LOG_cssc.runhere}`);
    window.clearTimeout(this.#hide_to);
  };
  readonly #onPointerLeave = () => {
    this.#pointerEntered = false;
    this.toHide_$();
  };
}

/**
 * Block scrollbar
 * @final
 */
class ScrobarB_<C extends Coo> extends Scrobar_<C> {
  override set strt(_x: unum) {
    // console.log(`ScrobarB_.strt( ${_x})`);
    this.strt$ = _x;
    this.el$.style.insetInlineStart = `${_x}px`;
  }

  /** @implement */
  protected setStrtMax$() {
    this.strtMax = this.host.writingMode & WritingDir.v
      ? this.host.el.clientHeight - this.el$.clientHeight
      : this.host.el.clientWidth - this.el$.clientWidth;
  }

  /** @implement */
  readonly slidr;

  /** @headconst @param host_x */
  constructor(host_x: Scronr<C>) {
    super(host_x);

    this.assignStylo({
      gridRow: "row-main-frst / row-main-last",

      blockSize: "100%",
      inlineSize: `min(${Scrobar_.SizeMAX}px,70%)`,
    });

    this.slidr = new SlidrB_(this);

    this.el$.append(
      this.slidr.el,
    );

    this.slidrStrt_mo.registHandler(this.#moSlidrStrt);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  slidrBStrt_0_$ = 0;
  /** @implement */
  setAlong_$(): void {
    /* final switch */ ({
      [WritingMode.htb]: () => {
        this.slidrBStrt_0_$ = this.slidr.el.viewTop;
      },
      [WritingMode.vrl]: () => {
        this.slidrBStrt_0_$ = this.el.clientWidth - this.slidr.el.viewRight;
      },
      [WritingMode.vlr]: () => {
        this.slidrBStrt_0_$ = this.slidr.el.viewLeft;
      },
    }[this.host.writingMode])();
  }

  istrt_0_$ = 0;
  /** @implement */
  setAcros_$(): void {
    /* final switch */ ({
      [WritingMode.htb]: () => {
        this.istrt_0_$ = this.host.bufrDir === "ltr"
          ? this.el.viewLeft
          : this.host.el.clientWidth - this.el.viewRight;
      },
      [WritingMode.vrl]: () => {
        this.istrt_0_$ = this.host.bufrDir === "ltr"
          ? this.el.viewTop
          : this.host.el.clientHeight - this.el.viewBottom;
      },
      [WritingMode.vlr]: () => {
        this.istrt_0_$ = this.host.bufrDir === "ltr"
          ? this.el.viewTop
          : this.host.el.clientHeight - this.el.viewBottom;
      },
    }[this.host.writingMode])();
  }

  /** @implement */
  dragAlong_$(dtB_x: number, _dtI_x: number): void {
    this.slidrStrt_mo.val = this.slidrBStrt_0_$ + dtB_x;
  }
  /** @implement */
  dragAcros_$(_dtB_x: number, dtI_x: number): void {
    this.strt = Math.clamp(0, this.istrt_0_$ + dtI_x, this.strtMax);
  }

  /** @implement */
  jump_$(clientX_x: number, clientY_x: number): void {
    const bcr = this.bcr_1;
    const contentBStrt = this.host.scrolr.contentBStrt;
    /* final switch */ ({
      [WritingMode.htb]: () => {
        const clientStrt = clientY_x - bcr.top;
        this.host.scrollScrolrTo(
          this.host.calcJumpBStrt_$(clientStrt) + contentBStrt,
        );
      },
      [WritingMode.vrl]: () => {
        const clientStrt = bcr.right - clientX_x;
        this.host.scrollScrolrTo(
          this.host.calcJumpBStrt_$(clientStrt) + contentBStrt,
        );
      },
      [WritingMode.vlr]: () => {
        const clientStrt = clientX_x - bcr.left;
        this.host.scrollScrolrTo(
          this.host.calcJumpBStrt_$(clientStrt) + contentBStrt,
        );
      },
    }[this.host.writingMode])();
    this.host.touched = true;
  }

  /** @const @param n_x */
  readonly #moSlidrStrt = (n_x: unum) => {
    const scrollBStrt = this.host.calcScrollBStrt_$(n_x);
    const controlBStrt = scrollBStrt + this.host.scrolr.contentBStrt;
    this.host.scrollScrolrTo(controlBStrt);
    this.host.touched = true;
  };
}

/**
 * Inline scrollbar
 * @final
 */
class ScrobarI_<C extends Coo> extends Scrobar_<C> {
  override set strt(_x: unum) {
    this.strt$ = _x;
    this.el$.style.insetBlockStart = `${_x}px`;
  }

  /** @implement */
  protected setStrtMax$() {
    this.strtMax = this.host.writingMode & WritingDir.v
      ? this.host.el.clientWidth - this.el$.clientWidth
      : this.host.el.clientHeight - this.el$.clientHeight;
  }

  /** @implement */
  readonly slidr;

  /** @headconst @param host_x */
  constructor(host_x: Scronr<C>) {
    super(host_x);

    this.assignStylo({
      gridColumn: "col-main-frst / col-main-last",

      blockSize: `min(${Scrobar_.SizeMAX}px,70%)`,
      inlineSize: "100%",
    });

    this.slidr = new SlidrI_(this);

    this.el$.append(
      this.slidr.el,
    );

    this.slidrStrt_mo.registHandler(this.#moSlidrStrt);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  slidrIStrt_0_$ = 0;
  /** @implement */
  setAlong_$(): void {
    /* final switch */ ({
      [WritingMode.htb]: () => {
        this.slidrIStrt_0_$ = this.host.bufrDir === "ltr"
          ? this.slidr.el.viewLeft
          : this.host.el.clientWidth - this.slidr.el.viewRight;
      },
      [WritingMode.vrl]: () => {
        this.slidrIStrt_0_$ = this.host.bufrDir === "ltr"
          ? this.el$.viewTop
          : this.host.el.clientHeight - this.slidr.el.viewBottom;
      },
      [WritingMode.vlr]: () => {
        this.slidrIStrt_0_$ = this.host.bufrDir === "ltr"
          ? this.el$.viewTop
          : this.host.el.clientHeight - this.slidr.el.viewBottom;
      },
    }[this.host.writingMode])();
  }

  bstrt_0_$ = 0;
  /** @implement */
  setAcros_$(): void {
    /* final switch */ ({
      [WritingMode.htb]: () => {
        this.bstrt_0_$ = this.el.viewTop;
      },
      [WritingMode.vrl]: () => {
        this.bstrt_0_$ = this.host.el.clientWidth - this.el.viewRight;
      },
      [WritingMode.vlr]: () => {
        this.bstrt_0_$ = this.el.viewLeft;
      },
    }[this.host.writingMode])();
  }

  /** @implement */
  dragAlong_$(_dtB_x: number, dtI_x: number): void {
    this.slidrStrt_mo.val = this.slidrIStrt_0_$ + dtI_x;
  }

  /** @implement */
  dragAcros_$(dtB_x: number, _dtI_x: number) {
    this.strt = Math.clamp(0, this.bstrt_0_$ + dtB_x, this.strtMax);
  }

  /** @implement */
  jump_$(clientX_x: number, clientY_x: number): void {
    const bcr = this.bcr_1;
    const contentIStrt = this.host.scrolr.contentIStrt;
    /* final switch */ ({
      [WritingMode.htb]: () => {
        const clientStrt = this.host.bufrDir === "rtl"
          ? clientX_x - bcr.right
          : clientX_x - bcr.left;
        this.host.scrollScrolrTo(
          this.host.calcJumpIStrt_$(clientStrt) + contentIStrt,
          "inline",
        );
      },
      [WritingMode.vrl]: () => {
        const clientStrt = this.host.bufrDir === "rtl"
          ? clientY_x - bcr.bottom
          : clientY_x - bcr.top;
        this.host.scrollScrolrTo(
          this.host.calcJumpIStrt_$(clientStrt) + contentIStrt,
          "inline",
        );
      },
      [WritingMode.vlr]: () => {
        const clientStrt = this.host.bufrDir === "rtl"
          ? clientY_x - bcr.bottom
          : clientY_x - bcr.top;
        this.host.scrollScrolrTo(
          this.host.calcJumpIStrt_$(clientStrt) + contentIStrt,
          "inline",
        );
      },
    }[this.host.writingMode])();
    this.host.touched = true;
  }

  /** @const @param n_x */
  readonly #moSlidrStrt = (n_x: unum) => {
    const scrollIStrt = this.host.calcScrollIStrt_$(n_x);
    const contolIStrt = scrollIStrt + this.host.scrolr.contentIStrt;
    this.host.scrollScrolrTo(
      this.host.bufrDir === "ltr" ? contolIStrt : -contolIStrt,
      "inline",
    );
    this.host.touched = true;
  };
}
/*49-------------------------------------------*/

/** Slider */
abstract class Slidr_<C extends Coo> extends HTMLVuu<C, HTMLDivElement> {
  static readonly SizeMIN = TouchSquaMIN;

  protected readonly host$;
  /** @final */
  protected get scronr$(): Scronr<C> {
    return this.host$.host;
  }

  /** @headconst @param host_x */
  constructor(host_x: Scrobar_<C>) {
    super(host_x.coo, div());
    this.host$ = host_x;

    this.assignStylo({
      position: "absolute",

      backgroundColor: host_x.host.slidr_cp.cssc,
    });

    this.on("pointerdown", this.#onPointerDown);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** Cf. `Scrobar_.#onPointerDown()` */
  readonly #onPointerDown = (evt_x: PointerEvent) => {
    if (evt_x.button === MouseButton.Main) {
      evt_x.preventDefault(); // prevent focus transfer
      evt_x.stopPropagation();

      const scrobar = this.host$;
      scrobar.setAlong_$();
      scrobar.setAcros_$();
      scrobar.clientX_$ = evt_x.clientX;
      scrobar.clientY_$ = evt_x.clientY;

      // console.log(`%crun here: clearTimeout`, `color:${LOG_cssc.runhere}`);
      // clearTimeout(this.host$.hide_to);
      global.mw?.on("pointermove", this.#onPointerMove);
      global.mw?.on("pointerup", this.#onPointerUp);
      //jjjj TOCLEANUP
      // if (global.canHover) {
      //   this.host$.off("pointerenter", this.host$.onPointerEnter);
      //   this.host$.off("pointerleave", this.host$.onPointerLeave);
      // }
    }
  };

  /** Cf. `Scrobar_.#onPointerMove()` */
  readonly #onPointerMove = (evt_x: PointerEvent) => {
    //jjjj TOCLEANUP
    // this.host$.toHide_$();

    const scrobar = this.host$;
    const dtX = evt_x.clientX - scrobar.clientX_$;
    const dtY = evt_x.clientY - scrobar.clientY_$;
    const wm_ = scrobar.host.writingMode;
    const dtB = /* final switch */ {
      [WritingMode.htb]: dtY,
      [WritingMode.vrl]: -dtX,
      [WritingMode.vlr]: dtX,
    }[wm_];
    const dtI = /* final switch */ ({
      ltr: () => (/* final switch */ {
        [WritingMode.htb]: dtX,
        [WritingMode.vrl]: dtY,
        [WritingMode.vlr]: dtY,
      }[wm_]),
      rtl: () => (/* final switch */ {
        [WritingMode.htb]: -dtX,
        [WritingMode.vrl]: -dtY,
        [WritingMode.vlr]: -dtY,
      }[wm_]),
    }[scrobar.host.bufrDir])();
    scrobar.dragAlong_$(dtB, dtI);
    scrobar.dragAcros_$(dtB, dtI);
  };

  /** Cf. `Scrobar_.#onPointerUp()` */
  readonly #onPointerUp = (evt_x: PointerEvent) => {
    evt_x.stopPropagation();

    global.mw?.off("pointermove", this.#onPointerMove);
    global.mw?.off("pointerup", this.#onPointerUp);
    //jjjj TOCLEANUP
    // if (global.canHover) {
    //   this.host$.on("pointerenter", this.host$.onPointerEnter);
    //   this.host$.on("pointerleave", this.host$.onPointerLeave);
    // }
  };
}

/**
 * Block slider
 * @final
 */
class SlidrB_<C extends Coo> extends Slidr_<C> {
  /** @headconst @param host_x */
  constructor(host_x: ScrobarB_<C>) {
    super(host_x);

    this.assignStylo({
      inlineSize: "100%",
    });
  }
}

/**
 * Inline slider
 * @final
 */
class SlidrI_<C extends Coo> extends Slidr_<C> {
  /** @headconst @param host_x */
  constructor(host_x: ScrobarI_<C>) {
    super(host_x);

    this.assignStylo({
      blockSize: "100%",
    });
  }
}
/*80--------------------------------------------------------------------------*/
