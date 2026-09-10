/** 80**************************************************************************
 * @module lib/editing/EdtrBase
 * @license MIT
 ******************************************************************************/

import type { Bufr } from "@fe-cpl/Bufr.ts";
import type { Line } from "@fe-cpl/Line.ts";
import { Ranval, RanvalMo } from "@fe-cpl/Ranval.ts";
import { _TRACE, CYPRESS, DEBUG, EDTR, INOUT, RESIZ } from "../../preNs.ts";
import { LastCb_i, Moo } from "../Moo.ts";
import { Scrolr, Scronr } from "../Scronr.ts";
import type { BufrDir, CSSStyle, int, lnum_t, uint, unum } from "../alias.ts";
import { LOG_cssc, MouseButton, WritingDir, WritingMode } from "../alias.ts";
import type { Id_t, Ts_t } from "../alias_v.ts";
import { Pale } from "../color/Pale.ts";
import type { Cssc } from "../color/alias.ts";
import type { CooInterface } from "../cv.ts";
import { HTMLVCo } from "../cv.ts";
import { div } from "../dom.ts";
import { assert, bind, warn } from "../util.ts";
import { rmvRange } from "../util/dom.ts";
import { trace, traceOut } from "../util/trace.ts";
import type { CaretRvM } from "./Caret.ts";
import { Caret } from "./Caret.ts";
import type { ELineBase } from "./ELineBase.ts";
import { ELineBaseFac } from "./ELineBase.ts";
import type { ELoc } from "./ELoc.ts";
import type { ERanr } from "./ERan.ts";
import { ERan } from "./ERan.ts";
import { MainCaret } from "./MainCaret.ts";
import type { EdtrType, FSRec, Pos } from "./alias.ts";
import { EdtrMain_z, VFMrgin, VFPulse } from "./alias.ts";
/*80--------------------------------------------------------------------------*/

export interface EdtrBaseCI extends CooInterface {
  get writingMode_mo(): Moo<WritingMode>;
  get writingMode(): WritingMode;
  get scrollBStrt_mo(): Moo<number>;
  // get scrollIStrt_mo(): Moo<number>;
  get scrolr(): EdtrBaseScrolr;

  //jjjj TOCLEANUP
  // /**
  //  * `in( this.el$.isConnected )`
  //  * @final
  //  */
  // refreshEdtrScronr(): void;

  // onRanvalChange(
  //   handler_x: MooHandler<Ranval>,
  //   immediate_x?: "immediate",
  // ): void;
  // offRanvalChange(handler_x: MooHandler<Ranval>): void;

  // onCanUnvuChange(
  //   handler_x: MooHandler<boolean>,
  //   immediate_x?: "immediate",
  // ): void;
  // onCanRevuChange(
  //   handler_x: MooHandler<boolean>,
  //   immediate_x?: "immediate",
  // ): void;
  // offCanUnvuChange(handler_x: MooHandler<boolean>): void;
  // offCanRevuChange(handler_x: MooHandler<boolean>): void;

  // align(align_x: EdtrDir): void;
  // onAlignChange(
  //   handler_x: MooHandler<EdtrDir>,
  //   immediate_x?: "immediate",
  // ): void;
  // offAlignChange(handler_x: MooHandler<EdtrDir>): void;
}

export abstract class EdtrBase<CI extends EdtrBaseCI = EdtrBaseCI>
  extends HTMLVCo<CI, HTMLDivElement> {
  static #ID = 0 as Id_t;
  override readonly id = ++EdtrBase.#ID as Id_t;

  /* Pale */
  readonly #fg_p = Pale.get("edt.Edtr.fg");
  #onFgCssc = (_x: Cssc) => {
    this.el$.style.color = _x;
  };
  readonly #bg_p = Pale.get("edt.Edtr.bg");
  #onBgCssc = (_x: Cssc) => {
    this.el$.style.backgroundColor = _x;
  };

  override observeTheme() {
    this.#fg_p.registCsscHandler(this.#onFgCssc);
    this.#bg_p.registCsscHandler(this.#onBgCssc);
  }
  override unobserveTheme() {
    this.#fg_p.removeCsscHandler(this.#onFgCssc);
    this.#bg_p.removeCsscHandler(this.#onBgCssc);
  }
  /* ~ */
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  #scronr!: EdtrScronr<CI>;
  /** @final */
  get scronr() {
    return this.#scronr;
  }

  /**
   * `in( this.#inited_EdtrBase)`
   * @final
   */
  get _writingMode_mo() {
    return this.#scronr.writingMode_mo;
  }
  /**
   * `in( this.#inited_EdtrBase)`
   * @final
   */
  get _writingMode() {
    return this.#scronr.writingMode;
  }

  /** `in( this.#inited_EdtrBase)` */
  get _scrollBStrt_mo() {
    return this.#scronr.scrollBStrt_mo;
  }
  // /** `in( this.#inited_EdtrBase)` */
  // get _scrollIStrt_mo_() {
  //   return this.#scronr.scrollIStrt_mo;
  // }

  protected scrolr$!: EdtrBaseScrolr<CI>;
  /** `in( this.#inited_EdtrBase)` */
  get _scrolr() {
    return this.scrolr$;
  }

  /** @final */
  readonly wrap_mo = new Moo({ val: true, active: true });
  /** @final */
  get wrap(): boolean {
    return this.wrap_mo.val;
  }

  #lastBcr_ts = Date.now_1();
  get lastBcr_ts(): Ts_t {
    return this.#lastBcr_ts as Ts_t;
  }
  updateLastBcrTs(): Ts_t {
    return this.#lastBcr_ts = Date.now_1() as Ts_t;
  }

  /** */
  constructor() {
    super(div());
    /* `#scronr.coo` should exist before `init_EdtrBase()`, because it is needed
    in `Scrolr.constructor()`. */
    this.#scronr = new EdtrScronr(this);

    // /*#static*/ if (DEBUG) {
    //   this.el$.id = this.class_id;
    // }

    /* Some common settings here. May be overridden by `style$()`. */
    this.assignStylo({
      color: this.#fg_p.cssc,
      backgroundColor: this.#bg_p.cssc,

      lineBreak: "loose",
    });

    //jjjj TOCLEANUP
    // Object.assign(this.ci, {
    //   refreshEdtrScronr: () => this._refreshEdtrScronr(),
    // } as EdtrBaseCI);
    Reflect.defineProperty(this.ci, "writingMode_mo", {
      get: () => this._writingMode_mo,
    });
    Reflect.defineProperty(this.ci, "writingMode", {
      get: () => this._writingMode,
    });
    Reflect.defineProperty(this.ci, "scrollBStrt_mo", {
      get: () => this._scrollBStrt_mo,
    });
    // Reflect.defineProperty(this.ci, "scrollIStrt_mo", {
    //   get: () => this._scrollIStrt_mo_,
    // });
    Reflect.defineProperty(this.ci, "scrolr", {
      get: () => this._scrolr,
    });
  }

  #destroyed = false;
  destructor(): void {
    if (this.#destroyed) return;

    this.unobserveTheme();

    this.#destroyed = true;
  }

  #inited_EdtrBase = false;
  /**
   * @final
   * @headconst @param scrolr_x
   */
  init_EdtrBase(scrolr_x: EdtrBaseScrolr<CI>): void {
    /*#static*/ if (INOUT) {
      assert(!this.#inited_EdtrBase);
    }
    this.scrolr$ = scrolr_x;
    this.#scronr.initScrolr(scrolr_x);

    this.el$.append(this.#scronr.el);

    this._writingMode_mo.registHandler(
      () => this.scrolr$.invalidate_bcr().refreshCarets(),
      { i: LastCb_i },
    );
    this._writingMode_mo.set_Moo(this.#writingMode);
    this.#scronr.syncLayout();

    this.#scronr.resizob.observe(this.scrolr$.codeScrole_el);
    this.#scronr.resizob.observe(this.scrolr$.richScrole_el);
    this.#scronr.observeTheme(); //!

    this.#inited_EdtrBase = true;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  #writingMode = WritingMode.htb;
  /**
   * Init setting. Normally called within constructors. So no callbacks will be
   * invoked.
   * @final
   * @headconst @param _x
   */
  protected style$(_x?: CSSStyle) {
    const wm_css = _x?.writingMode;
    this.#writingMode = wm_css === "vertical-rl"
      ? WritingMode.vrl
      : wm_css === "vertical-lr"
      ? WritingMode.vlr
      : WritingMode.htb;
    if (this.#inited_EdtrBase) {
      this.#scronr.writingMode_mo.set_Moo(this.#writingMode);
      this.#scronr.syncLayout();
    }

    if (_x) {
      delete _x.writingMode;
      this.assignStylo(_x);
    }
  }

  //jjjj TOCLEANUP
  // /**
  //  * `in( this.el$.isConnected )`
  //  * @final
  //  */
  // _refreshEdtrScronr() {
  //   this.#scronr.refresh_Scronr();
  // }

  //jjjj TOCLEANUP
  // /** @final */
  // _refresh_EdtrBase(): this {
  //   this.scrolr$.refresh_EdtrBaseScrolr()
  //     .coo._refreshEdtrScronr();
  //   return this;
  // }
}
/*64----------------------------------------------------------*/

/** @final */
export class EdtrScronr<CI extends EdtrBaseCI> extends Scronr<EdtrBase<CI>> {
  static #ID = 0 as Id_t;
  override readonly id = ++EdtrScronr.#ID as Id_t;
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @headconst @param coo_x */
  constructor(coo_x: EdtrBase<CI>) {
    super(coo_x);

    /*#static*/ if (CYPRESS || DEBUG) {
      this.el$.hint = this.class_id;

      this.scrobarB$.el.hint = `${this.el$.hint}.scrobarB`;
      this.scrobarI$.el.hint = `${this.el$.hint}.scrobarI`;
      this.scrobarB$.slidr.el.hint = `${this.el$.hint}.scrobarB.slidr`;
      this.scrobarI$.slidr.el.hint = `${this.el$.hint}.scrobarI.slidr`;

      this.scrodB$.el.hint = `${this.el$.hint}.scrodB`;
      this.scrodI$.el.hint = `${this.el$.hint}.scrodI`;
      this.scrodB$.scrodicatr.el.hint = `${this.el$.hint}.scrodB.scrodicatr`;
      this.scrodI$.scrodicatr.el.hint = `${this.el$.hint}.scrodI.scrodicatr`;
    }
    this.assignStylo({
      blockSize: "100%",
      inlineSize: "100%",
    });
  }

  //jjjj TOCLEANUP
  // #inited = false;
  // /**
  //  * @final
  //  * @headconst @param scrolr_x
  //  */
  // init_EdtrScronr(scrolr_x: EdtrBaseScrolr<CI>): void {
  //   /*#static*/ if (INOUT) {
  //     assert(!this.#inited);
  //   }
  //   this.initScrolr(scrolr_x);

  //   this.#inited = true;
  // }
}
/*49-------------------------------------------*/

export type GetEln = (bln_x: Line) => ELineBase;
export type RevEln = (eln_x: ELineBase) => void;

/**
 * A non-generic (except `CI`) base s.t. many related uses (e.g. Caret) can be
 * non-generic.
 */
export abstract class EdtrBaseScrolr<CI extends EdtrBaseCI = EdtrBaseCI>
  extends Scrolr<EdtrBase<CI>>
  implements ERanr {
  static #ID = 0 as Id_t;
  override readonly id = ++EdtrBaseScrolr.#ID as Id_t;

  readonly type: EdtrType;
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // /** @final */
  // protected override updateContentBSize$(): void {
  //   this.contentBSize$ = this.bufr$.bsizeOn(this.id, this.elnBSize$);
  // }

  /* elidx_m$ */
  protected readonly elidx_m$ = new Map<lnum_t, ELineBase<CI>>();

  /** @const @param lidx_x */
  @traceOut(_TRACE)
  #codeLidx(lidx_x: lnum_t): void {
    /*#static*/ if (_TRACE) {
      console.log(
        `${trace.indent}>>>>>>> ${this.class_id}.#codeLidx( lidx_x: ${lidx_x}) >>>>>>>`,
      );
      console.log(
        `${trace.dent}${lidx_x} in  [${this.strtLidx$},${this.stopLidx$})?`,
      );
    }
    if (this.strtLidx$ <= lidx_x && lidx_x < this.stopLidx$) return;

    this.#sufScroll_sync = true;
    if (lidx_x < this.strtLidx$) {
      this.host.scrollScrolrTo(
        this.#getLidxBStrt(lidx_x),
      );
    } /* if (this.stopLidx$ <= lidx_x) */ else {
      this.host.scrollScrolrTo(
        this.#getLidxBStrt(lidx_x + 1 - this.lnClientMaxn$),
      );
    }
    this.#sufScroll_sync = false;
  }
  /**
   * `in( 0 <= lidx_x && lidx_x < this.bufr$.lineN)`
   * @const @param lidx_x
   */
  eline_1(lidx_x: lnum_t): ELineBase {
    this.#codeLidx(lidx_x);
    const ret = this.elidx_m$.get(lidx_x)!;
    /*#static*/ if (DEBUG) { if (!ret) debugger; }
    return ret;
  }
  /**
   * `in( 0 <= lidx_x && lidx_x < this.bufr$.lineN)`
   * @const @param lidx_x
   */
  bidi_1(lidx_x: lnum_t) {
    return this.eline_1(lidx_x).bidi;
  }

  #elnBSize: unum = 0;
  get elnBSize() {
    return this.#elnBSize;
  }
  /** `out( ret; ret > 0)` */
  protected get elnBSize$(): unum {
    if (this.#elnBSize > 0) return this.#elnBSize;

    const elnEl = div("|");
    this.code_el$.append(elnEl);
    const elnBs = this.coo$._writingMode & WritingDir.v
      ? elnEl.clientWidth
      : elnEl.clientHeight;
    /*#static*/ if (INOUT) {
      assert(elnBs > 0);
    }
    elnEl.remove();
    return this.#elnBSize = elnBs;
  }
  /** @return `>0` */
  protected get lnClientMaxn$(): uint {
    return Math.ceil(this.bsize / this.elnBSize$) + 1;
  }
  get _lnClientMaxn_() {
    return this.lnClientMaxn$;
  }

  protected strtLidx$: lnum_t = 0;
  get strtLidx() {
    return this.strtLidx$;
  }
  protected stopLidx$: lnum_t = 0;
  get stopLidx() {
    return this.stopLidx$;
  }

  /** `[ strtLidx$, stopLidx$ )` */
  readonly drtLidxStrt_mo = new Moo<lnum_t>({ val: 0, forcing: true });
  /* ~ */

  /** Scrollee, the Element being scrolled */
  readonly codeScrole_el = div();

  /* code_el$ */
  protected readonly code_el$ = div();
  // get _code_el_() {
  //   return this.code_el$;
  // }

  protected get codeSize$(): unum {
    return this.coo$._writingMode & WritingDir.v
      ? this.code_el$.clientWidth
      : this.code_el$.clientHeight;
  }
  /* ~ */

  /* #head_el */
  readonly #head_el = div();

  //jjjj TOCLEANUP
  // /** head size: `elnBSize$ * (bufr$.lineN - stopLidx$) + headBDt$` */
  // protected headBDt$: unum = 0;

  readonly scrollHeadSize_mo = new Moo<unum>({ val: 0 });

  #controlHeadSize: unum = 0;
  protected get controlHeadSize$(): unum {
    //jjjj TOCLEANUP
    // return this.coo$._writingMode & WritingDir.v
    //   ? this.#head_el.clientWidth
    //   : this.#head_el.clientHeight;
    return this.#controlHeadSize;
  }
  /** Rationale: https://share.google/aimode/TCfls9Fe72v07wgKd */
  static ScrollHeadSizeMAX = 10_000_000;
  // static ScrollHeadSizeMAX = 100;
  /** @const @param size_x */
  protected set controlHeadSize$(size_x: number) {
    this.#controlHeadSize = Math.max(size_x, 0);
    if (this.#controlHeadSize > EdtrBaseScrolr.ScrollHeadSizeMAX) {
      this.contentBStrt$ = this.#controlHeadSize -
        EdtrBaseScrolr.ScrollHeadSizeMAX;
    } else {
      this.contentBStrt$ = 0;
    }
    const size_ = Math.min(
      this.#controlHeadSize,
      EdtrBaseScrolr.ScrollHeadSizeMAX,
    );
    this.#head_el.style.blockSize = `${size_}px`;
    this.scrollHeadSize_mo.val = size_;
  }
  /* ~ */

  /* #foot_el */
  readonly #foot_el = div();

  //jjjj TOCLEANUP
  // /** foot size: `elnBSize$ * strtLidx$ + footBDt$` */
  // protected footBDt$: unum = 0;

  // readonly scrollFootSize_mo = new Moo<unum>({ val: 0 });

  #controlFootSize: unum = 0;
  protected get controlFootSize$(): unum {
    //jjjj TOCLEANUP
    // return this.coo$._writingMode & WritingDir.v
    //   ? this.#foot_el.clientWidth
    //   : this.#foot_el.clientHeight;
    return this.#controlFootSize;
  }
  /** @const @param size_x */
  protected set controlFootSize$(size_x: number) {
    this.#controlFootSize = Math.max(size_x, 0);
    // if (this.#controlFootSize > EdtrBaseScrolr.ScrollHeadSizeMAX) {
    //   this.contentBFoot$ = this.#controlFootSize - EdtrBaseScrolr.ScrollHeadSizeMAX;
    // } else {
    //   this.contentBFoot$ = 0;
    // }
    const size_ = Math.min(
      this.#controlFootSize,
      EdtrBaseScrolr.ScrollHeadSizeMAX,
    );
    this.#foot_el.style.blockSize = `${size_}px`;
    // this.scrollFootSize_mo.val = size_;
  }
  /* ~ */

  protected readonly getEln$: GetEln;
  /**
   * @headconst @param coo_x
   * @const @param bln_x
   */
  static readonly getEln$ = (coo_x: EdtrBase, bln_x: Line): ELineBase => {
    return ELineBaseFac.get(coo_x, bln_x).refreshPlain();
  };

  protected readonly revEln$: RevEln;
  /** @headconst @param eln_x */
  static readonly revEln$ = (eln_x: ELineBase): void => {
    ELineBaseFac.rev(eln_x);
  };
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  readonly richScrole_el = div().assignStylo({ display: "none" });
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /* bufr */
  protected bufr$!: Bufr;
  get bufr() {
    return this.bufr$;
  }
  /* ~ */

  override get bufrDir(): BufrDir {
    return this.bufr$.dir;
  }

  //kkkk What about wrap for PRItmFmt other than txt?
  /** @final */
  readonly wrap_mo = new Moo({ val: true, active: true });
  /** @final */
  get wrap(): boolean {
    return this.wrap_mo.val;
  }

  /* #bcr */
  #bcr: DOMRect | undefined;
  /** @final */
  get bcr() {
    if (!this.#bcr) {
      this.#bcr = this.el$.getBoundingClientRect();

      this.coo$.updateLastBcrTs(); //!
    }
    return this.#bcr;
  }

  invalidate_bcr(): this {
    this.#bcr = undefined;
    return this;
  }

  #lastVF_ts = 0 as Ts_t;
  @traceOut(_TRACE && EDTR)
  protected viewFocus$<C extends Caret>(retC_x: C): void {
    /*#static*/ if (_TRACE && EDTR) {
      console.log(
        `${trace.indent}>>>>>>> ${this.class_id}.viewFocus$() >>>>>>>`,
      );
    }
    if (retC_x.focusVisible && this.bcr.containRec(retC_x.bcr_1, VFMrgin)) {
      // console.log(`${trace.dent}bcr: ${this.bcr}`);
      // console.log(`${trace.dent}retC_x.bcr_1: ${retC_x.bcr_1}`);
      return;
    }

    const ts_ = Date.now() as Ts_t;
    if (ts_ < this.#lastVF_ts + VFPulse) return;

    this.#codeLidx(retC_x.ranval.focusLidx);
    this.host.scrollScrolrContain(retC_x.bcr_1, VFMrgin);

    this.#lastVF_ts = ts_;
  }
  /* ~ */

  /**
   * padding-box left
   * @final
   */
  get pbLeft() {
    return this.bcr.left + this.el$.clientLeft - this.el$.scrollLeft;
  }
  /**
   * padding-box top
   * @final
   */
  get pbTop() {
    return this.bcr.top + this.el$.clientTop - this.el$.scrollTop;
  }
  get pbPos(): Pos {
    return { left: this.pbLeft, top: this.pbTop };
  }
  // get innerVHeight() { return this.el$.clientHeight + this.el$.scrollTop; }

  /**
   * block-size
   * @final
   */
  get bsize(): unum {
    return this.coo$._writingMode & WritingDir.v
      ? this.bcr.right - this.bcr.left
      : this.bcr.bottom - this.bcr.top;
  }
  /**
   * content-scroll block-start
   * @final
   */
  get controlBStrt(): unum {
    return /* final switch */ {
      [WritingMode.htb]: this.contentBStrt + this.el$.scrollTop,
      [WritingMode.vrl]: -(this.contentBStrt + this.el$.scrollLeft),
      [WritingMode.vlr]: this.contentBStrt + this.el$.scrollLeft,
    }[this.coo$._writingMode];
  }

  /* caret_a$ */
  protected caret_a$: Caret[];
  /** @final */
  get mainCaret(): MainCaret {
    // const ret = this.caret_a$[0];
    // if( !ret.inuse ) ret.reset_$( this );
    // return ret;
    return this.caret_a$[0] as MainCaret;
  }

  //jjjj TOCLEANUP
  // protected sel$: Selection | null = null;
  /* ~ */

  readonly mdraging_mo = new Moo({ val: false });
  get mdraging() {
    return this.mdraging_mo.val;
  }

  protected readonly mdragged_mo$ = new Moo({ val: false });
  get mdragged() {
    return this.mdragged_mo$.val;
  }

  /* #vuq */
  // readonly #vuq = new Unre<Vchange>(
  //   /*#static*/ APP ? 500 : /*#static*/ DEBUG ? 100 : 30,
  // );
  // lastScrollpos_$: ScrollPos;

  // readonly #canUnvu_mo = new Moo({ val: false });
  // readonly #canRevu_mo = new Moo({ val: false });

  // #updateUnrevu() {
  //   this.#canUnvu_mo.val = this.#vuq.canGetUn();
  //   this.#canRevu_mo.val = this.#vuq.canGetRe();
  // }
  /* ~ */

  //jjjj TOCLEANUP
  // protected readonly dir_mo$ = new Moo<BufrDir>({ val: "ltr" });
  // get dir_$() {
  //   return this.dir_mo$.val;
  // }
  // _dir(_x: BufrDir) {
  //   this.dir_mo$.val = _x;
  // }

  /* #activEslr_mo, activ_mo */
  static readonly #activEslr_mo = new Moo<EdtrBaseScrolr | null>({
    val: null,
  });
  // static inactivate() {
  //   this.#activEslr_mo.val = null;
  // }
  set eslrActiv(_x: boolean) {
    if (_x) {
      EdtrBaseScrolr.#activEslr_mo.val = this;
    } else {
      if (EdtrBaseScrolr.#activEslr_mo.val === this) {
        EdtrBaseScrolr.#activEslr_mo.val = null;
      }
    }
  }

  readonly edtrActiv_mo = new Moo({ val: false, info: this as EdtrBaseScrolr });
  // get eslrActiv() {
  //   return this.edtrActiv_mo.val;
  // }
  /* ~ */

  //jjjj
  /* edting_mo */
  readonly edting_mo = new Moo({ val: true });
  get edting() {
    return this.edting_mo.val;
  }
  /* ~ */

  protected readonly resizob$;
  //jjjj TOCLEANUP
  // protected readonly intrsob$;

  /**
   * @headconst @param host_x
   * @const @param type_x
   * @headconst @param getEln_x
   * @headconst @param revEln_x
   */
  constructor(
    host_x: EdtrScronr<CI>,
    type_x: EdtrType,
    getEln_x: GetEln = EdtrBaseScrolr.getEln$.bind(null, host_x.coo),
    revEln_x: RevEln = EdtrBaseScrolr.revEln$,
  ) {
    super(host_x);
    this.type = type_x;
    this.getEln$ = getEln_x;
    this.revEln$ = revEln_x;
    this.caret_a$ = [MainCaret.create(host_x.coo)];

    /*! Do not set style (or attribute) here or subclasses that may change the
    valid value of `EdtrBaseScrolr.elnBSize$`. */
    const id_ = this.el$.id = this.class_id;
    /*#static*/ if (CYPRESS || DEBUG) {
      this.el$.hint = this.class_id;
    }
    //jjjj TOCLEANUP
    // this.assignAttro({
    //   // contenteditable: "true",
    //   // inputmode: "none",
    //   spellcheck: "false",
    //   // autocapitalize: "off",

    //   autocomplete: "off",
    //   autocorrect: "off",
    // });
    this.assignStylo({
      position: "relative",
      // zIndex: 0,
      // writingMode: "vertical-rl",

      // border: "2px solid",
      // inlineSize: "max-content",
      // backgroundColor: "#fff",
      // outlineWidth: "0",

      whiteSpace: "break-spaces", // Ref. https://stackoverflow.com/questions/64699828/css-property-white-space-example-for-break-spaces
      // whiteSpace: "preserve nowrap",
      // wordBreak: "break-all",
      // overflowWrap: "anywhere",
      // lineBreak: "loose",
      // fontFamily: fontFamily_x,
      // fontSize: fontSize_x,

      // caretColor: "transparent",
      // userSelect: "text",

      isolation: "isolate", //!
    });
    //jjjj TOCLEANUP
    // document[$CSS].insertRule(
    //   /*#static*/ _COLR
    //     ? `#${id_} ::selection { background-color: yellow; }`
    //     : `#${id_} ::selection { background-color: transparent; }`,
    // );

    /*#static*/ if (CYPRESS || DEBUG) {
      // this.codeScrole_el.hint = `${this.el$.hint}.scrole`;
      // this.#head_el.hint = `${this.el$.hint}.head`;
      this.code_el$.hint = `${this.el$.hint}.code`;
      // this.#foot_el.hint = `${this.el$.hint}.foot`;
    }
    this.code_el$.assignStylo({
      position: "relative",
      zIndex: EdtrMain_z,
      //
      // inlineSize: "max-content",
      // backgroundColor: "transparent",
      //
      // textAlign: "end",
      // whiteSpace: "preserve nowrap",
    });

    this.codeScrole_el.append(
      this.#head_el,
      this.code_el$,
      this.#foot_el,
    );

    this.el$.append(
      this.codeScrole_el,
      this.richScrole_el,
    );
    this.mainCaret.attachTo(this);

    EdtrBaseScrolr.#activEslr_mo.registHandler((_y) => {
      this.edtrActiv_mo.val = _y === this;
    });
    this.edtrActiv_mo.registHandler((_y) => {
      this.mainCaret.el.focus();
    });

    this.resizob$ = new ResizeObserver(this._onResiz);
    this.resizob$.observe(this.el$);
    this.resizob$.observe(document.body); //!

    //jjjj TOCLEANUP
    // this.intrsob$ = new IntersectionObserver(
    //   this._onIntrs,
    //   { root: this.el$, threshold: 1 },
    // );
    // this.intrsob$.observe(this.mainCaret.el);

    //   this.lastScrollpos_$ = [this.el$.scrollLeft, this.el$.scrollTop];

    //   this.ci.onRanvalChange = (h_y, immediate_y) => {
    //     this.mainCaret.caretrvm![1].registHandler(h_y);
    //     if (immediate_y) this.mainCaret.caretrvm![1].refresh();
    //   };
    //   this.ci.offRanvalChange = (h_y) =>
    //     this.mainCaret.caretrvm![1].removeHandler(h_y);

    //   this.ci.onCanUnvuChange = (handler_x, immediate_x) => {
    //     this.#canUnvu_mo.registHandler(handler_x);
    //     if (immediate_x) this.#canUnvu_mo.refresh();
    //   };
    //   this.ci.onCanRevuChange = (handler_x, immediate_x) => {
    //     this.#canRevu_mo.registHandler(handler_x);
    //     if (immediate_x) this.#canRevu_mo.refresh();
    //   };
    //   this.ci.offCanUnvuChange = (handler_x) =>
    //     this.#canUnvu_mo.removeHandler(handler_x);
    //   this.ci.offCanRevuChange = (handler_x) =>
    //     this.#canRevu_mo.removeHandler(handler_x);

    //   this.ci.align = (align_x) => this.dir_mo$.val = align_x;
    //   this.ci.onAlignChange = (handler_x, immediate_x) => {
    //     this.dir_mo$.registHandler(handler_x);
    //     if (immediate_x) this.dir_mo$.refresh();
    //   };
    //   this.ci.offAlignChange = (handler_x) =>
    //     this.dir_mo$.removeHandler(handler_x);

    this.on("pointerup", this.#onPointerUp.bind(this));
    // this.host.slidrB.on("pointerdown", () => this.active = false);
  }

  /** `in( this.el$.isConnected)` */
  reset_EdtrBaseScrolr(): this {
    this.controlHeadSize$ = 0;
    //jjjj TOCLEANUP
    // this.headBDt$ = 0;
    this.code_el$.removeAllChild();
    this.controlFootSize$ = 0;
    //jjjj TOCLEANUP
    // this.footBDt$ = 0;

    this.elidx_m$.clear();
    this.strtLidx$ = 0;
    this.stopLidx$ = 0;
    return this;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // /**
  //  * @headconst @param eran_x
  // //jjjj TOCLEANUP
  // //  * @out @param outF_o
  // //  * @out @param outA_o
  // //  * @return fill and return caret.repl_rv_$
  //  */
  // protected getRanvalBy$(eran_x: ERan, ret_x?: Ranval): Ranval {
  //   ret_x ??= new Ranval(0, 0);
  //   ret_x.focusLidx = ELineBase.getBLine(eran_x.focusCtnr).lidx_1;
  //   ret_x.focusLoff = eran_x.focusLoff;
  //   if (eran_x.collapsed) {
  //     ret_x.collapseToFocus();
  //   } else {
  //     ret_x.anchrLidx = ELineBase.getBLine(eran_x.anchrCtnr).lidx_1;
  //     ret_x.anchrLoff = eran_x.anchrLoff;
  //   }
  //   return ret_x;
  // }

  /**
   * `in( rv_x.order >= 0)`
   * @headconst @param rv_x `focusLidx`, `focusLoff` Will be corrected
   */
  abstract getEFocusOf_$(rv_x: Ranval, retEloc_x?: ELoc): ELoc;
  /**
   * `in( rv_x.order >= 0)`
   * @headconst @param rv_x `anchrLidx`, `anchrLoff` Will be corrected
   */
  abstract getEAnchrOf_$(rv_x: Ranval, retEloc_x?: ELoc): ELoc;
  /**
   * `in( rv_x.order >= 0)`
   * @final
   * @headconst @param rv_x Will be corrected
   */
  getERanOf(rv_x: Ranval, retEran_x?: ERan): ERan {
    // console.log(rv_x);
    const eloc = this.getEFocusOf_$(rv_x, retEran_x?.focusEloc);
    retEran_x ??= new ERan(eloc);
    this.getEAnchrOf_$(rv_x, retEran_x.anchrEloc);
    return retEran_x;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @const @param n_x
   * @const @param strtLidx_x
   * @const @param stopLidx_x
   */
  protected movMain$(
    n_x: int,
    strtLidx_x = this.strtLidx$,
    stopLidx_x = this.stopLidx$,
  ): void {
    if (n_x === 0 || strtLidx_x >= stopLidx_x) return;

    /*#static*/ if (INOUT) {
      assert(
        this.strtLidx$ <= strtLidx_x &&
          strtLidx_x < stopLidx_x &&
          stopLidx_x <= this.stopLidx$,
      );
    }
    if (n_x < 0) {
      for (let i = strtLidx_x; i < stopLidx_x; i++) {
        const eln = this.elidx_m$.get(i)!;
        this.elidx_m$.delete(i);
        this.elidx_m$.set(i + n_x, eln);
      }
    } else {
      for (let i = stopLidx_x; i-- > strtLidx_x;) {
        const eln = this.elidx_m$.get(i)!;
        this.elidx_m$.delete(i);
        this.elidx_m$.set(i + n_x, eln);
      }
    }
  }

  /** @const @param lidx_x */
  #getLidxBStrt(lidx_x: lnum_t): unum {
    return this.bufr$.line(lidx_x).getBStrtOn(this.id, this.elnBSize$);
  }
  /** @const @param lidx_x */
  #getLidxBStop(lidx_x: lnum_t): unum {
    return this.bufr$.line(lidx_x).getBStopOn(this.id, this.elnBSize$);
  }
  /**
   * `in( stopLidx_x <= this.bufr$.lineN)`
   * @const @param strtLidx_x
   * @const @param stopLidx_x
   */
  #getLidxBSize(strtLidx_x: lnum_t, stopLidx_x: lnum_t): unum {
    if (strtLidx_x >= stopLidx_x) {
      if (strtLidx_x > stopLidx_x) {
        warn(`strtLidx_x (${strtLidx_x}) > stopLidx_x (${stopLidx_x})`);
      }
      return 0;
    }

    const stopBStrt = stopLidx_x === this.bufr$.lineN
      ? this.#getLidxBStop(stopLidx_x - 1)
      : this.#getLidxBStrt(stopLidx_x);
    return stopBStrt - this.#getLidxBStrt(strtLidx_x);
  }

  /**
   * Add to `#head_el`
   * @const @param srcStopLidx_x new
   */
  protected toHead$(srcStopLidx_x: lnum_t): void {
    if (srcStopLidx_x <= this.strtLidx$) return;

    const stopLidx = Math.min(srcStopLidx_x, this.stopLidx$);

    rmvRange.setStartBefore(this.elidx_m$.get(this.strtLidx$)!.el);
    rmvRange.setEndAfter(this.elidx_m$.get(stopLidx - 1)!.el);
    rmvRange.deleteContents();

    this.controlHeadSize$ += this.#getLidxBSize(this.strtLidx$, srcStopLidx_x);
    //jjjj TOCLEANUP
    // const headBs_0 = this.controlHeadSize$ - this.headBDt$ +
    //   this.elnBSize$ * (srcStopLidx_x - this.strtLidx$);
    for (let i = this.strtLidx$; i < stopLidx; i++) {
      const eln = this.elidx_m$.get(i)!;
      //jjjj TOCLEANUP
      // this.headBDt$ += eln.bline_$.getBSizeOn(this.id) - this.elnBSize$;
      this.elidx_m$.delete(i);
      this.revEln$(eln);
    }
    //jjjj TOCLEANUP
    // for (let i = stopLidx; i < srcStopLidx_x; i++) {
    //   this.headBDt$ += this.bufr$.line(i).getBSizeOn(this.id, this.elnBSize$) -
    //     this.elnBSize$;
    // }
    // this.controlHeadSize$ = headBs_0 + this.headBDt$;
  }

  /**
   * Restore from `#head_el`
   * @const @param n_x
   * @const @param tgtStopLidx_x new
   * @const @param srcStopLidx_x useful only if `[srcStopLidx_x,strtLidx$)` is
   *    non-empty, in which case, it's new
   */
  protected fromHead$(
    n_x: uint,
    tgtStopLidx_x: lnum_t,
    srcStopLidx_x = this.strtLidx$,
  ): void {
    if (n_x === 0) return;

    /*#static*/ if (INOUT) {
      assert(srcStopLidx_x <= tgtStopLidx_x);
      assert(0 <= tgtStopLidx_x - n_x && srcStopLidx_x <= this.strtLidx$);
    }
    const elnBefo = this.elidx_m$.get(tgtStopLidx_x);
    const elnEl_a: Element[] = [];
    for (let i = n_x; i--;) {
      const eln = this.getEln$(this.bufr$.line(tgtStopLidx_x - 1 - i));
      elnEl_a.push(eln.el);
    }
    elnBefo ? elnBefo.el.before(...elnEl_a) : this.code_el$.append(...elnEl_a);

    this.controlHeadSize$ -= this.#getLidxBSize(srcStopLidx_x, this.strtLidx$) +
      this.#getLidxBSize(tgtStopLidx_x - n_x, tgtStopLidx_x);
    //jjjj TOCLEANUP
    // const headBs_0 = this.controlHeadSize$ - this.headBDt$ -
    //   this.elnBSize$ * (this.strtLidx$ - srcStopLidx_x + n_x);
    // for (let i = this.strtLidx$; i-- > srcStopLidx_x;) {
    //   this.headBDt$ -= this.bufr$.line(i).getBSizeOn(this.id, this.elnBSize$) -
    //     this.elnBSize$;
    // }
    for (let i = n_x; i--;) {
      const eln = elnEl_a[i].vuu as ELineBase<CI>;
      //jjjj TOCLEANUP
      // this.headBDt$ -= eln.bline_$.getBSizeOn(this.id, this.elnBSize$) -
      //   this.elnBSize$;
      this.elidx_m$.set(tgtStopLidx_x - n_x + i, eln);
      eln.syncBSize();
    }
    // this.controlHeadSize$ = headBs_0 + this.headBDt$;
  }

  /**
   * Add to `#foot_el`
   * @const @param srcStrtLidx_x new
   */
  protected toFoot$(srcStrtLidx_x: lnum_t): void {
    if (srcStrtLidx_x >= this.stopLidx$) return;

    const strtLidx = Math.max(srcStrtLidx_x, this.strtLidx$);

    rmvRange.setStartBefore(this.elidx_m$.get(strtLidx)!.el);
    rmvRange.setEndAfter(this.elidx_m$.get(this.stopLidx$ - 1)!.el);
    rmvRange.deleteContents();

    this.controlFootSize$ += this.#getLidxBSize(srcStrtLidx_x, this.stopLidx);
    //jjjj TOCLEANUP
    // const footBs_0 = this.controlFootSize$ - this.footBDt$ +
    //   this.elnBSize$ * (this.stopLidx$ - srcStrtLidx_x);
    for (let i = this.stopLidx$; i-- > strtLidx;) {
      const eln = this.elidx_m$.get(i)!;
      //jjjj TOCLEANUP
      // this.footBDt$ += eln.bline_$.getBSizeOn(this.id) - this.elnBSize$;
      this.elidx_m$.delete(i);
      this.revEln$(eln);
    }
    //jjjj TOCLEANUP
    // for (let i = strtLidx; i-- > srcStrtLidx_x;) {
    //   this.footBDt$ += this.bufr$.line(i).getBSizeOn(this.id, this.elnBSize$) -
    //     this.elnBSize$;
    // }
    // this.controlFootSize$ = footBs_0 + this.footBDt$;
  }

  /**
   * Restore from `#foot_el`
   * @const @param n_x
   * @const @param tgtStrtLidx_x new
   * @const @param srcStrtLidx_x useful only if `[stopLidx$,srcStrtLidx_x)` is
   *    non-empty, in which case, it's new
   */
  protected fromFoot$(
    n_x: uint,
    tgtStrtLidx_x: lnum_t,
    srcStrtLidx_x = this.stopLidx$,
  ): void {
    if (n_x === 0) return;

    /*#static*/ if (INOUT) {
      assert(tgtStrtLidx_x <= srcStrtLidx_x);
      assert(
        this.stopLidx$ <= srcStrtLidx_x &&
          tgtStrtLidx_x + n_x <= this.bufr$.lineN,
      );
    }
    const elnAftr = this.elidx_m$.get(tgtStrtLidx_x - 1);
    const elnEl_a: Element[] = [];
    for (let i = 0; i < n_x; i++) {
      const eln = this.getEln$(this.bufr$.line(tgtStrtLidx_x + i));
      elnEl_a.push(eln.el);
    }
    elnAftr ? elnAftr.el.after(...elnEl_a) : this.code_el$.append(...elnEl_a);

    this.controlFootSize$ -= this.#getLidxBSize(this.stopLidx$, srcStrtLidx_x) +
      this.#getLidxBSize(tgtStrtLidx_x, tgtStrtLidx_x + n_x);
    //jjjj TOCLEANUP
    // const footBs_0 = this.controlFootSize$ - this.footBDt$ -
    //   this.elnBSize$ * (srcStrtLidx_x - this.stopLidx$ + n_x);
    // for (let i = this.stopLidx$; i < srcStrtLidx_x; i++) {
    //   this.footBDt$ -= this.bufr$.line(i).getBSizeOn(this.id, this.elnBSize$) -
    //     this.elnBSize$;
    // }
    for (let i = 0; i < n_x; i++) {
      const eln = elnEl_a[i].vuu as ELineBase<CI>;
      //jjjj TOCLEANUP
      // this.footBDt$ -= eln.bline_$.getBSizeOn(this.id, this.elnBSize$) -
      //   this.elnBSize$;
      this.elidx_m$.set(tgtStrtLidx_x + i, eln);
      eln.syncBSize();
    }
    //jjjj TOCLEANUP
    // this.controlFootSize$ = footBs_0 + this.footBDt$;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** @const @param strtLidx_x */
  @traceOut(_TRACE && EDTR)
  protected scrollTo$(strtLidx_x: lnum_t): void {
    /*#static*/ if (_TRACE && EDTR) {
      console.log(
        `${trace.indent}>>>>>>> ${this.class_id}.scrollTo$( strtLidx_x: ${strtLidx_x}) >>>>>>>`,
      );
    }
    const stopLidx = Math.min(
      strtLidx_x + this.lnClientMaxn$,
      this.bufr$.lineN,
    );

    if (stopLidx <= this.strtLidx$) {
      /*
      --- strtLidx_x ------- stopLidx --- strtLidx$ ------- stopLidx$ ---
       */
      this.toFoot$(stopLidx);
      this.fromHead$(stopLidx - strtLidx_x, stopLidx, stopLidx);
    } else if (this.stopLidx$ <= strtLidx_x) {
      /*
      --- strtLidx$ ------- stopLidx$ --- strtLidx_x ------- stopLidx ---
       */
      this.toHead$(strtLidx_x);
      this.fromFoot$(stopLidx - strtLidx_x, strtLidx_x, strtLidx_x);
    } else {
      /*
      --- strtLidx$ ------- stopLidx$ ---
      --- strtLidx_x ------- stopLidx ---
      */
      if (this.strtLidx$ < strtLidx_x) {
        this.toHead$(strtLidx_x);
      } else if (strtLidx_x < this.strtLidx$) {
        this.fromHead$(this.strtLidx$ - strtLidx_x, this.strtLidx$);
      }
      if (stopLidx < this.stopLidx$) {
        this.toFoot$(stopLidx);
      } else if (this.stopLidx$ < stopLidx) {
        this.fromFoot$(stopLidx - this.stopLidx$, this.stopLidx$);
      }
    }
    this.strtLidx$ = strtLidx_x;
    this.stopLidx$ = stopLidx;
    this.drtLidxStrt_mo.val = this.strtLidx$;
  }

  #sufScroll_sync = false;
  #sufScroll_af: number | undefined;
  readonly #sufScroll_impl = (): void => {
    const bstrt = this.toControlBStrt$ ?? this.controlBStrt;
    // console.log(`${trace.dent}`, { bstrt });
    // console.log(`${trace.dent}${
    //   [
    //     this.controlHeadSize$.fixTo(2),
    //     this.codeSize$.fixTo(2),
    //     this.controlFootSize$.fixTo(2),
    //   ].join(" + ")
    // } = ${(this.controlHeadSize$ + this.codeSize$ + this.controlFootSize$).fixTo(2)}`);
    let strtLidx = 0;
    if (bstrt > 0) {
      const ln_ = this.bufr$.lineTree.getMax((ln_y) =>
        ln_y.getBStrtOn(this.id, this.elnBSize$) <= bstrt
      );
      if (ln_) {
        strtLidx = Math.min(
          ln_.lidx_1,
          this.bufr$.lineN - this.lnClientMaxn$ + 1,
        );
      }
    }
    // console.log(
    //   `${trace.dent}strtLidx: ${strtLidx}, strtLidx$: ${this.strtLidx$}`,
    // );
    if (strtLidx === this.strtLidx$ || strtLidx >= this.bufr$.lineN) return;

    const impl_ = () => {
      this.scrollTo$(strtLidx);
      this.refreshCarets(); // `Caret.#selec_hl` should overlay `Stnode.hl_a$`
      // console.log(`${trace.dent}${
      //   [
      //     this.controlHeadSize$.fixTo(2),
      //     this.codeSize$.fixTo(2),
      //     this.controlFootSize$.fixTo(2),
      //   ].join(" + ")
      // } = ${(this.controlHeadSize$ + this.codeSize$ + this.controlFootSize$).fixTo(2)}`);
      this.#sufScroll = undefined;
      /* This happens e.g. after removal in `#head_el` in `vrl`.
       */ if (bstrt !== this.controlBStrt) {
        this.host.scrollScrolrTo(bstrt);
      }
      if (this.controlHeadSize$ < bstrt - this.elnBSize$) {
        this.host.scrollScrolrTo(this.controlHeadSize$ + this.elnBSize$);
      } else if (this.controlHeadSize$ > bstrt) {
        this.host.scrollScrolrTo(this.controlHeadSize$);
      }
      this.#sufScroll = this.#sufScroll_impl;
    };

    if (this.#sufScroll_sync) {
      impl_();
    } else {
      if (this.#sufScroll_af !== undefined) {
        cancelAnimationFrame(this.#sufScroll_af);
      }
      this.#sufScroll_af = requestAnimationFrame(() => {
        this.#sufScroll_af = undefined;
        impl_();
      });
    }
  };
  get _sufScroll_impl_() {
    return this.#sufScroll_impl;
  }
  #sufScroll: (() => void) | undefined = this.#sufScroll_impl;
  set _sufScroll_(_x: (() => void) | undefined) {
    this.#sufScroll = _x;
  }
  // @traceOut(_TRACE && EDTR)
  override sufScroll(): void {
    // /*#static*/ if (_TRACE && EDTR) {
    //   console.log(
    //     `${trace.indent}>>>>>>> ${this.class_id}.sufScroll() >>>>>>>`,
    //   );
    // }
    this.#sufScroll?.();
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * `in( this.strtLidx$ <= rv_x.anchrLidx && rv_x.anchrLidx < this.stopLidx$)`
   * @headborrow @headconst @param rv_x will be modified
   * @const @param elnBrc_x
   */
  abstract anchrRecOf_$(rv_x: Ranval, elnBrc_x?: DOMRectReadOnly): FSRec;
  /** @final */
  _anchrRecOf_(rv_x: Ranval, elnBrc_x: DOMRectReadOnly): FSRec {
    return this.anchrRecOf_$(rv_x, elnBrc_x);
  }

  //jjjj TOCLEANUP
  // /**
  //  * remaining space
  //  * @final
  //  * @const @param rec_x
  //  * @const @param side_x
  //  */
  // protected rsFrom$(rec_x: DOMRect, side_x: "strt" | "stop"): number {
  //   return /* final switch */ ({
  //     [WritingMode.htb]: () =>
  //       this.bcr$.bottom - (side_x === "stop" ? rec_x.bottom : rec_x.top),
  //     [WritingMode.vrl]: () =>
  //       (side_x === "stop" ? rec_x.left : rec_x.right) - this.bcr$.left, //llll check
  //     [WritingMode.vlr]: () =>
  //       this.bcr$.right - (side_x === "stop" ? rec_x.right : rec_x.left), //llll check
  //   }[this.coo$._writingMode])();
  // }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** @headconst @param crm_x  */
  #setShadowCaret(crm_x?: CaretRvM) {
    /*#static*/ if (INOUT) {
      assert(!crm_x || this !== crm_x[0].eslr);
    }
    // if( !(this.#sig & crm_x.sigmask) ) return; //jjjj

    // const colr = crm_x.host.colr.dup().setAlpha( .35 );

    let c_;
    for (let i = 1; i < this.caret_a$.length; i++) {
      if (!this.caret_a$[i].active) {
        //jjjj TOCLEANUP
        // const c_i = this.caret_a$[i].disable_$();
        // c_ ??= c_i; // use the first in-`active` passive Caret
        c_ = this.caret_a$[i];
        break;
      }
    }
    if (crm_x) {
      if (c_) {
        c_.resetCaretRvM_$(crm_x);
      } else {
        c_ = Caret.create(this.coo, crm_x).attachTo(this);
        this.caret_a$.push(c_);
      }
    }
  }

  /**
   * @final
   * @const @param hard_x
   */
  protected resetCarets$(hard_x?: "hard") {
    this.caret_a$.forEach((_y) => _y.disable_$());
    const crm = hard_x
      ? undefined
      : [this.mainCaret, new RanvalMo()] as CaretRvM;
    this.mainCaret.resetCaretRvM_$(crm);
    for (const eslr of this.bufr$.eslr_ss) {
      if (eslr === this) continue;

      (eslr as EdtrBaseScrolr<CI>).#setShadowCaret(crm);
      if (!hard_x) {
        this.#setShadowCaret((eslr as EdtrBaseScrolr<CI>).mainCaret.caretrvm!);
      }
    }
  }

  /**
   * Cf. {@linkcode refresh_EdtrBaseScrolr()}
   * @final
   */
  refreshCarets(): void {
    /* In reverse order to make sure that the main caret is handled lastly */
    for (let i = this.caret_a$.length; i--;) {
      const caret = this.caret_a$[i];
      if (caret.active && caret.shown) {
        caret.draw_$();
      }
    }
  }

  @bind
  @traceOut(_TRACE && RESIZ)
  private _onResiz() {
    /*#static*/ if (_TRACE && RESIZ) {
      console.log(
        `%c${trace.indent}>>>>>>> ${this.class_id}._onResiz() >>>>>>>`,
        `color:${LOG_cssc.resiz}`,
      );
      console.log(`${trace.dent}isConnected: ${this.el$.isConnected}`);
    }
    if (!this.el$.isConnected) return;

    this.invalidate_bcr()
      .refreshCarets();
  }
  // _onResiz_() {
  //   return this._onResiz();
  // }

  //jjjj TOCLEANUP
  // /** @headconst @param entries_x */
  // @bind
  // @traceOut(_TRACE && INTRS)
  // private _onIntrs(entries_x: IntersectionObserverEntry[]) {
  //   /*#static*/ if (_TRACE && INTRS) {
  //     console.log(
  //       `%c${trace.indent}>>>>>>> ${this.class_id}._onIntrs() >>>>>>>`,
  //       `color:${LOG_cssc.intrs}`,
  //     );
  //   }
  //   if (!this.el$.isConnected) return;

  //   for (const entry of entries_x) {
  //     this.mainCaret.visible = entry.isIntersecting;
  //     break;
  //   }
  // }

  /**
   * Cf. {@linkcode refreshCarets()}\
   * `in( this.el$.isConnected)`
   * @final
   */
  // @traceOut(_TRACE)
  refresh_EdtrBaseScrolr(): this {
    // /*#static*/ if (_TRACE) {
    //   console.log(
    //     `${trace.indent}>>>>>>> ${this.class_id}.refresh_EdtrBaseScrolr() >>>>>>>`,
    //   );
    // }
    // this.reset$();

    // createSetELines(this, this.bufr$.frstLine, this.bufr$.lastLine);
    // /*#static*/ if (DEBUG) {
    //   ++g_count.newVuu;
    // }
    // this.bufr$.refresh();

    for (const caret of this.caret_a$) {
      if (caret.realBody?.shown) {
        //jjjj TOCLEANUP
        // caret.shadowShow();
        caret.draw_$();
      } else {
        caret.hideAll();
      }
    }
    return this;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  // /** @final */
  // vu_$(scrollpos_x: ScrollPos, scrollpos_rev_x?: ScrollPos) {
  //   scrollpos_rev_x ??= this.lastScrollpos_$;
  //   const vchange = new Vchange(this, scrollpos_x, scrollpos_rev_x);
  //   vchange.vchange_run();
  //   this.#vuq.add(vchange);
  //   this.#updateUnrevu();
  // }

  // /** @final */
  // protected unvu$() {
  //   const ret = this.#vuq.canGetUn();
  //   if (ret) {
  //     this.#vuq.getUn().vchange_lnu();
  //     this.#updateUnrevu();
  //   }
  //   return ret;
  // }
  // /** @final */
  // protected revu$() {
  //   const ret = this.#vuq.canGetRe();
  //   if (ret) {
  //     this.#vuq.getRe().vchange_run();
  //     this.#updateUnrevu();
  //   }
  //   return ret;
  // }

  /**
   * @see {@linkcode EdtrScrolr._onPointerUp()}
   * @haedconst @param evt_x
   */
  @traceOut(_TRACE)
  #onPointerUp(evt_x: PointerEvent) {
    /*#static*/ if (_TRACE) {
      console.log(
        `${trace.indent}>>>>>>> ${this.class_id}.#onPointerUp() >>>>>>>`,
      );
    }
    if (evt_x.button === MouseButton.Main) {
      this.eslrActiv = true;
    }
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  get _info_() {
    return {
      /* Adding ` + 0` is to prevent `-0`, which, stangely, is different to `0`
      in cypress tesing. */
      controlBStrt: this.controlBStrt + 0,
      controlBSize:
        `${this.controlHeadSize$}:${this.codeSize$}:${this.controlFootSize$}`,
      lidx: `[${this.strtLidx$},${this.stopLidx$})`,
    };
  }
}
/*80--------------------------------------------------------------------------*/
