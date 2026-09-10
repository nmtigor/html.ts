/** 80**************************************************************************
 * @module lib/editing/ELineBase
 * @license MIT
 ******************************************************************************/

import type { Line } from "@fe-cpl/Line.ts";
import { Ranval } from "@fe-cpl/Ranval.ts";
import { _TRACE, CYPRESS, DEBUG, INOUT } from "../../preNs.ts";
import type { int, ldt_t, lnum_t, loff_t, uint, unum } from "../alias.ts";
import { WritingDir, WritingMode } from "../alias.ts";
import type { Id_t } from "../alias_v.ts";
import type { Bidir } from "../Bidi.ts";
import { Bidi } from "../Bidi.ts";
import { HTMLVuu, Vuu } from "../cv.ts";
import { div, textnode } from "../dom.ts";
import "../jslang.ts";
import { assert } from "../util.ts";
import { trace, traceOut } from "../util/trace.ts";
import type { EdtrBase, EdtrBaseCI } from "./EdtrBase.ts";
import { StnodeV } from "./StnodeV.ts";
import { TextV } from "./TextV.ts";
import type { BlockOf, SameRow } from "./util.ts";
import { samerow_bot, samerow_left, samerow_rigt } from "./util.ts";
import { Factory } from "../util/Factory.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class TailV extends TextV {
  /** @headconst @param host_x  */
  constructor(host_x: ELineBase) {
    super(host_x, "|", host_x.bline_$.uchrLen);

    this.assignStylo({
      // display: "inline-block",
      // overflow: "hidden",

      // maxWidth: 0,

      color: "transparent",
    });

    // this.text[$tail_ignored] = true;
  }
}

/**
 * A non-generic base s.t. many related uses (e.g. Caret) can be non-generic.
 */
export class ELineBase<CI extends EdtrBaseCI = EdtrBaseCI>
  extends HTMLVuu<EdtrBase<CI>, HTMLDivElement>
  implements Bidir {
  static #ID = 0 as Id_t;
  override readonly id = ++ELineBase.#ID as Id_t;
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @final
   * @const @param coo_x
   */
  setCoo_$(coo_x: EdtrBase<CI>): this {
    this.coo$ = coo_x;
    return this;
  }

  /* #bline */
  #bline!: Line;
  get bline_$() {
    return this.#bline;
  }

  setBLine_$(_x: Line): void {
    this.#bline = _x;
    this.#forceSetBidiOnce = true;
  }

  get lidx_1(): lnum_t {
    return this.#bline.lidx_1;
  }
  /* ~ */

  /** To be consistent with `StnodeV.eline_$` */
  eline_$ = this;

  /* #bidi */
  //jjjj TOCLEANUP
  // /** `#bidi.valid` if there is wrapping. Otherwise, use `bline_$.bidi`. */
  readonly #bidi = new Bidi();

  #forceSetBidiOnce = false;
  /** @final @implement */
  get bidi(): Bidi {
    if (this.#forceSetBidiOnce) {
      this.#forceSetBidiOnce = false;
      this.setBidi$();
    } else if (
      this.#bidi.bidiLastCont_ts <
        Math.max(this.#bline.lineLastCont_ts, this.coo$.lastBcr_ts)
    ) {
      this.setBidi$();
    }
    //jjjj TOCLEANUP
    // return this.#bidi.valid ? this.#bidi : this.#bline.bidi;
    return this.#bidi;
  }
  /* ~ */

  // protected empty$ = true;
  /**
   * @final
   * @const
   */
  get empty() {
    return this.#bline.text.length === 0;
  }

  //jjjj TOCLEANUP
  // get #fsrec_a() {
  //   return this.#bline.getFsrecaOn(this.coo$._scrolr.id);
  // }
  // get _fsrec_a_() {
  //   return this.#fsrec_a;
  // }

  /** Text Node */
  get tn(): Text | undefined {
    return this.el$.childNodes.length === 2
      ? this.el$.firstChild as Text
      : undefined;
  }

  /**
   * @headconst @param coo_x
   * @headconst @param bln_x
   */
  constructor(coo_x: EdtrBase<CI>, bln_x: Line) {
    super(coo_x, div());
    this.setBLine_$(bln_x);

    this.el$.id = this.class_id;
    /*#static*/ if (CYPRESS || DEBUG) {
      this.el$.hint = this.class_id;
    }
    // this.assignStylo({
    //   /* It works not well for, say, 5000 individual tiny divs.
    //   Ref. [Optimize `contenteditable` Performance](https://gemini.google.com/share/94ef1d448397)
    //    */
    //   // contentVisibility: "auto",
    //   // containIntrinsicSize: "1em",
    //   /* ~ */
    // });
    /* The problem of this setting (instead of uisng `TailV`) is that it would
    be very complex to position the Caret on an empty ELineBase (of different
    BufrDir and WritingMode). */
    // document[$CSS].insertRule(
    //   `#${this.el$.id}:empty::before {
    //     display: inline-block;
    //     content: "\\feff";
    //   }`,
    // );

    //jjjj TOCLEANUP
    // /* For testing only */
    // new ResizeObserver(this._onResiz).observe(this.el$);

    // /* For testing only */
    // this.on("contentvisibilityautostatechange", this._onCvasc);
  }

  /** @final */
  protected reset_ELineBase$() {
    this.el$.removeAllChild();
    return this;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @final
   * @param strt_x Same as param `start` of `Array.splice()`
   * @const @param nrmv_x Same as param `deleteCount` of `Array.splice()`
   *    with value being `String.length`
   * @const @param inss_x inserted string
   */
  splicePlain(
    strt_x: int,
    nrmv_x?: uint | typeof Infinity,
    inss_x?: string,
  ): this {
    let ldt: ldt_t = 0;

    const tn_ = this.tn;
    if (tn_) {
      if (strt_x < -tn_.length) strt_x = 0;
      else if (strt_x < 0) strt_x += tn_.length;
      else if (strt_x > tn_.length) strt_x = tn_.length;

      if (!nrmv_x) {
        if (inss_x !== undefined) {
          tn_.insertData(strt_x, inss_x);
          ldt = inss_x.length;
        }
      } else if (inss_x === undefined) {
        tn_.deleteData(strt_x, nrmv_x);
        ldt = -nrmv_x;
      } else {
        tn_.replaceData(strt_x, nrmv_x, inss_x);
        ldt = inss_x.length - nrmv_x;
      }
    } else if (inss_x) {
      this.el$.insertBefore(textnode(inss_x), this.el$.lastChild);
      ldt = inss_x.length;
    }

    (this.el$.lastChild!.vuu as TailV).translate_$(ldt);
    return this;
  }

  /** @final */
  // @traceOut(_TRACE)
  refreshPlain(): this {
    // /*#static*/ if (_TRACE) {
    //   console.log(
    //     `${trace.indent}>>>>>>> ${this.class_id}.refreshPlain() >>>>>>>`,
    //   );
    // }
    this.reset_ELineBase$();

    if (!this.empty) {
      this.el$.append(textnode(this.#bline.text));
    }
    this.el$.append(new TailV(this).el);

    /* Not invoke `setBidi$()` here because maybe not `el$.isConnected` yet!
    setBidi$()` requires `el$.isConnected`. */
    // this.setBidi$();

    // if (/^\s*$/.test(bln.text)) {
    //   const text = bln.text + "|";
    //   // const text = new Array(bln.text.length + 1).fill("|", 0).join("");
    //   this.el$.append(textnode(text, undefined, true));
    //   this.el$.style.color = "transparent";
    // } else {
    //   this.el$.append(bln.text);
    //   this.el$.style.color = "unset";
    // }

    // const ran = new TokRan( new TokLoc(bln,this.indent_),
    //   this.empty$ ? new TokLoc(bln,this.indent_) : new TokLoc(bln) );
    // this.el$.firstChild[ ranseq_sym ] = new Ranseq( [ran] );

    // /*#static*/ if (DEBUG) {
    //   ++g_count.newVuu;
    // }
    // /*#static*/ if (INOUT) {
    //   assert(this.el$.childNodes.length === 2 && this.el$.firstChild!.isText);
    // }
    return this;
  }

  /** @final */
  get bsize(): unum {
    return this.coo$._writingMode & WritingDir.v
      ? this.el$.clientWidth
      : this.el$.clientHeight;
  }
  /** @final */
  syncBSize(): this {
    const id_ = this.coo$._scrolr.id;
    const bsize_0 = this.#bline.getBSizeOn(id_);
    const bsize_1 = this.bsize;
    if (!Number.apxE(bsize_0, bsize_1)) {
      this.#bline.invTpBSizeOn(id_);
      this.#bline.setBSizeOn(id_, bsize_1);
    }
    return this;
  }
  //jjjj TOCLEANUP
  // /** @final */
  // get viewBSize(): unum {
  //   return this.#bline.getBSizeOn(this.coo$._scrolr.id);
  // }

  //jjjj TOCLEANUP
  // /* For long editing of huge doc, need optimize further：
  // Set a boolean variable to control if in the cleaning stage, in which case,
  // gradually remove cached fsrec_a from back (so fsrec_a's should be stored in
  // linked list sorted by recent usage time).
  //  */
  // /** @final */
  // clearFsrecA(): this {
  //   this.#fsrec_a.length = 0;
  //   return this;
  // }

  //jjjj TOCLEANUP
  // /**
  //  * According to `bline_$`, which is updated in `EdtrScrolr._resetELine()`\
  //  * `in( this.el$.isConnected)`
  //  *
  //  * jjjj@return false if `newSn` is not used
  //  */
  // abstract replace_$(...a_x: any[]): any;

  //jjjj TOCLEANUP
  // /** `in( this.el$.isConnected)` */
  // refresh_$(): void {
  //   this.refreshPlain()
  //     .syncBSize();
  //   // .clearFsrecA();
  // }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** Helper */
  #wrap_a: loff_t[] = [];
  /** @final */
  @traceOut(_TRACE)
  protected setBidi$(): void {
    /*#static*/ if (_TRACE) {
      console.log(
        `${trace.indent}>>>>>>> ${this.class_id}.setBidi$() >>>>>>>`,
      );
    }
    /*#static*/ if (INOUT) {
      assert(this.el$.isConnected);
    }
    const bln = this.#bline;
    const LEN = bln.uchrLen;
    //jjjj TOCLEANUP
    // const wrap_a_0 = this.#wrap_a.slice();
    this.#wrap_a.length = 0;
    const edtr = this.coo$;
    if (edtr._scrolr.wrap) {
      //jjjj TOCLEANUP
      // using rv_u = g_ranval_fac.oneMore().set_Ranval(bln.lidx_1, 0);
      const rv_ = new Ranval(bln.lidx_1, 0);
      const elnBcr = this.bcr_1;
      let fsrec = edtr._scrolr.anchrRecOf_$(rv_, elnBcr);
      const impl_ = (blockOf_y: BlockOf, samerow_y: SameRow) => {
        let block_0 = blockOf_y(fsrec.fat);
        // const _a_ = [];
        for (let i = 1; i < LEN; ++i) {
          rv_.anchrLoff = i;
          fsrec = edtr._scrolr.anchrRecOf_$(rv_, elnBcr);
          // _a_.push(fsrec.top.fixTo(1));
          if (samerow_y(fsrec.fat, block_0)) continue;

          this.#wrap_a.push(rv_.anchrLoff);
          block_0 = blockOf_y(fsrec.fat);
        }
      };
      /* final switch */ ({
        [WritingMode.htb]: () => {
          impl_((rec_z) => rec_z.bottom, samerow_bot);
        },
        [WritingMode.vrl]: () => {
          impl_((rec_z) => rec_z.left, samerow_left);
        },
        [WritingMode.vlr]: () => {
          impl_((rec_z) => rec_z.right, samerow_rigt);
        },
      }[edtr._writingMode])();
    }
    this.#wrap_a.push(LEN);
    // console.log(this.#wrap_a);
    // console.log(_a_);

    this.#bidi.reset_Bidi(
      bln.text,
      bln.dir,
      this.#wrap_a,
      bln.bidi.embedLevels, //!
    );
    //jjjj TOCLEANUP
    // if (!this.#wrap_a.eql(wrap_a_0)) this.#bidi.validate();
  }

  // /** For testing only */
  // @bind
  // @traceOut(_TRACE)
  // private _onCvasc(evt_x: ContentVisibilityAutoStateChangeEvent) {
  //   /*#static*/ if (_TRACE) {
  //     console.log(
  //       `%c${trace.indent}>>>>>>> ${this.class_id}._onCvasc() (${this.#bline.class_id}) >>>>>>>`,
  //       `color:${LOG_cssc.cvasc}`,
  //     );
  //     console.log(`${trace.dent}evt_x.skipped: ${evt_x.skipped}`);
  //     console.log(`${trace.dent}bcr_1: ${this.bcr_1.toString()}`);
  //   }
  // }

  //jjjj TOCLEANUP
  // /** For testing only */
  // @bind
  // @traceOut(_TRACE && RESIZ)
  // private _onResiz() {
  //   /*#static*/ if (_TRACE && RESIZ) {
  //     console.log(
  //       `%c${trace.indent}>>>>>>> ${this.class_id}._onResiz() (${this.#bline.class_id}) >>>>>>>`,
  //       `color:${LOG_cssc.resiz}`,
  //     );
  //     console.log(`${trace.dent}isConnected: ${this.el$.isConnected}`);
  //     console.log(
  //       `${trace.dent}checkVisibility(): ${
  //         this.el$.checkVisibility({ contentVisibilityAuto: true })
  //       }`,
  //     );
  //   }
  //   if (!this.el$.isConnected) return;

  //   //jjjj TOCLEANUP because width of `el$` is always same as size of `code_el$`
  //   // this.coo$.updateLastBcrTs(); //!

  //   // this.setBidi$();
  //   // /*#static*/ if (PRF) {
  //   //   console.log(
  //   //     `%c${trace.dent}Have passed ${
  //   //       ((performance.now() - g_count.hr_0) / 1000).toFixed(1)
  //   //     } seconds`,
  //   //     `color:${LOG_cssc.performance}`,
  //   //   );
  //   // }
  // }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @deprecated Just use `Node.isConnected` directly
   * @final
   */
  get removed() {
    return !this.el$.parentNode;
  }

  /**
   * @final
   * @const @param loff_x
   */
  caretNodeAt(loff_x: loff_t): HTMLElement | Text {
    let ret;
    // loff_x = Math.clamp(0, loff_x, this.#bline.uchrLen - 1);
    let loff = 0, loff_1 = 0;
    for (const subNd of this.el$.childNodes) {
      if (subNd.isText) {
        loff_1 = loff + (subNd as Text).length;
        if (loff <= loff_x && loff_x < loff_1) {
          ret = subNd as Text;
          break;
        }
      } else {
        /*#static*/ if (INOUT) {
          // console.log(
          //   `loff: ${loff}, strtLoff_$: ${(subNd.vuu as StnodeV).strtLoff_$}`,
          // );
          assert(
            subNd.vuu instanceof StnodeV && loff === subNd.vuu.strtLoff_$,
          );
        }
        if (subNd.vuu instanceof TailV) {
          ret = subNd.vuu.tn;
          break;
        }

        loff_1 = (subNd.vuu as StnodeV).stopLoff_$;
        if (loff <= loff_x && loff_x < loff_1) {
          ret = (subNd.vuu as StnodeV).caretNodeAt(loff_x);
          break;
        }
      }
      loff = loff_1;
    }
    return ret!;
  }
  /**
   * `in( !this.empty)`
   * @final
   */
  get frstCaretNode(): HTMLElement | Text {
    return this.caretNodeAt(0);
  }
  /**
   * `in( !this.empty)`
   * @final
   */
  get lastCaretNode(): HTMLElement | Text {
    return this.caretNodeAt(this.#bline.uchrLen);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @final
   * @headconst @param node_x
   */
  static getELine(node_x: Node): ELineBase {
    const v_ = Vuu.of(node_x) as StnodeV | ELineBase;
    return v_.eline_$;
  }

  /**
   * @final
   * @headconst @param node_x
  //jjjj TOCLEANUP
  //  * @out @param ozrInfo_x
   */
  static getBLine(
    node_x: Node,
    //jjjj TOCLEANUP
    // ozrInfo_x?: BLineInfo,
  ): Line {
    // /*#static*/ if (INOUT) {
    //   assert(node_x.parentNode);
    // }
    // let ret;

    // let np = NodeInELine.unknown;
    // const pa_el = node_x.parentNode as Element;
    const v_ = Vuu.of(node_x) as StnodeV | ELineBase;
    return v_.bline_$;

    // if( node_x.isText )
    // {
    //   // v_ = pa_el[ $indent_blockline ];
    //   // if( v_ )
    //   // {
    //   //   np = NodeInELine.indent;
    //   //   ret = v_.bline_$;
    //   // }
    // }
    // if( !ret )
    // {
    //   v_ = HTMLVuu.of( node_x );
    //   if( v_ instanceof PlainELine )
    //   {
    //     np = NodeInELine.text;
    //     ret = v_.bline_$;
    //   }
    //   else assert(0);
    // }

    // let eline;
    //jjjj TOCLEANUP
    // if (ozrInfo_x) {
    //   // ozrInfo_x.pa_el = pa_el;
    //   ozrInfo_x.eline = v_.eline_$;

    //   // eline = v_;
    //   // ozrInfo_x.eline = <PlainELine>eline;
    // }

    // const out = ( np_y:NodeInELine, vuu_y:any, eline_y:any ) =>
    // {
    //   assert( ret );

    //   switch( np_y )
    //   {
    //   case NodeInELine.text:
    //     assert( vuu_y instanceof PlainELine );
    //     break;
    //   case NodeInELine.indent:
    //     assert( vuu_y instanceof PlainELine );
    //     break;
    //   default: assert(0);
    //   }

    //   if( ozrInfo_x ) assert( eline_y instanceof PlainELine );
    // }
    // out(np,v_,eline);
    //jjjj TOCLEANUP
    // return ret;
  }
}

/** @final */
export class ELineBaseFac extends Factory<ELineBase> {
  #coo!: EdtrBase;
  /** @const @param coo_x */
  #setCoo(coo_x: EdtrBase): this {
    this.#coo = coo_x;
    return this;
  }

  #bln!: Line;
  /** @const @param bln_x  */
  #setBln(bln_x: Line): this {
    this.#bln = bln_x;
    return this;
  }

  private constructor() {
    super();
  }

  static #instance?: ELineBaseFac;
  private static get _instance() {
    return this.#instance ??= new ELineBaseFac();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @implement */
  protected createVal$() {
    return new ELineBase(this.#coo, this.#bln);
  }

  protected override reuseVal$(v_x: ELineBase): void {
    v_x.setCoo_$(this.#coo);
    v_x.setBLine_$(this.#bln);
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @const @param coo_x
   * @const @param bln_x
   */
  static get(coo_x: EdtrBase, bln_x: Line): ELineBase {
    return this._instance.#setCoo(coo_x).#setBln(bln_x).oneMore();
  }

  /** @headconst @param eln_x */
  static rev(eln_x: ELineBase): void {
    this._instance.revoke(eln_x);
  }
}

//jjjj TOCLEANUP
// export type BLineInfo = {
//   // nodeInELine: NodeInELine = NodeInELine.unknown;
//   // pa_el?: Element;
//   // pa_el:Node | null = null;
//   eline: ELineBase;
//   // eline?:PlainELine;
// };

//jjjj TOCLEANUP
// export const enum NodeInELine {
//   unknown = 1,
//   text,
//   span,
//   indent,
// }
/*80--------------------------------------------------------------------------*/
