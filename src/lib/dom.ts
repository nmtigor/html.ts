/** 80**************************************************************************
 * @module lib/dom
 * @license MIT
 ******************************************************************************/

import type { Pos } from "@fe-edt/alias.ts";
import { DENO } from "../preNs.ts";
import type { CSSStyle, loff_t, uint, unum } from "./alias.ts";
import type { Vuu } from "./cv.ts";
import { $CSS, $loff_0, $ovlap } from "./symbols.ts";
import * as Is from "./util/is.ts";
/*80--------------------------------------------------------------------------*/

declare global {
  interface EventMap extends
    ElementEventMap,
    // DocumentAndElementEventHandlersEventMap,
    GlobalEventHandlersEventMap,
    WindowEventHandlersEventMap,
    //
    DocumentEventMap,
    HTMLVideoElementEventMap,
    // MediaQueryListEventMap,
    OfflineAudioContextEventMap,
    ServiceWorkerEventMap,
    WindowEventMap,
    WorkerEventMap {
    "contentvisibilityautostatechange": ContentVisibilityAutoStateChangeEvent;
  }
  type EventName = keyof EventMap;
  type EventHandler<E extends EventName> = (ev: EventMap[E]) => any;

  interface Event {
    _canceled: boolean | undefined;
    canceled: boolean;

    /**
     * When `Poprect` is shown, `pocusdVu` is not `null`. At this moment, right-
     * click another place, the `Poprect` would probably be updated, rather than
     * reset. `targetPocusdVu` is to prevent this from happening, because newly
     * created `PointerEvent` does not have `targetPocusdVu`.
     *
     * Update `Poprect` only when setPocusdVu()` is called hence `targetPocusdVu`
     * is set. Otherwise, reset `Poprect`.
     */
    targetPocusdVu?: Vuu;

    /**
     * For "pointerup" by `MouseButton.Main`, to prevent `DragPopmenu` from
     * `idleHide()`.
     *
     * Do not `stopPropagation()` in advance because in general, "pointerup" by
     * `MouseButton.Main` requires to bubble up to the top to `off()` some
     * global event listeners. (see uses of `global.mw?.off()`)
     */
    keepPop?: boolean;
  }

  interface WheelEvent {
    _repr_: {
      deltaMode: string;
      deltaX: number;
      deltaY: number;
    };
  }
}

if (globalThis.Event) {
  Reflect.defineProperty(Event.prototype, "canceled", {
    get(this: Event) {
      return this._canceled ?? false;
    },
    set(this: Event, canceled_x: boolean) {
      this._canceled = canceled_x;
    },
  });
  // console.log(Event.prototype.canceled);
}

if (globalThis.WheelEvent) {
  Reflect.defineProperty(WheelEvent.prototype, "_repr_", {
    get(this: WheelEvent) {
      const m_ = /* final switch */ {
        [WheelEvent.DOM_DELTA_PIXEL]: "DOM_DELTA_PIXEL",
        [WheelEvent.DOM_DELTA_LINE]: "DOM_DELTA_LINE",
        [WheelEvent.DOM_DELTA_PAGE]: "DOM_DELTA_PAGE",
      }[this.deltaMode];
      return {
        deltaMode: m_,
        deltaX: this.deltaX,
        deltaY: this.deltaY,
      };
    },
  });
}
/*64----------------------------------------------------------*/

declare global {
  interface EventTarget {
    on<E extends EventName>(
      type: E,
      listener: EventHandler<E>,
      options?: AddEventListenerOptions | boolean,
    ): void;
    /**
     * For `{ passive: true }`, ref. https://chromestatus.com/feature/5745543795965952
     */
    onWheel(
      listener: EventHandler<"wheel">,
      options?: AddEventListenerOptions | boolean,
    ): void;
    off<E extends EventName>(
      type: E,
      listener: EventHandler<E>,
      options?: EventListenerOptions | boolean,
    ): void;
  }
}

if (globalThis.EventTarget) {
  EventTarget.prototype.on = function (this, type, listener, options?) {
    return this.addEventListener(type, listener as any, options);
  };
  EventTarget.prototype.onWheel = function (this, listener, options?) {
    return this.addEventListener(
      "wheel",
      listener as any,
      Object.assign({ passive: true }, options),
    );
  };
  EventTarget.prototype.off = function (this, type, listener, options?) {
    return this.removeEventListener(type, listener as any, options);
  };
}
/*64----------------------------------------------------------*/

declare global {
  interface Node {
    readonly isText: boolean;
    readonly secondChild: Node | null;
    readonly index: uint;

    /** @deprecated */
    assert_eq: (rhs: object) => void | never;

    /** To record, how many times this `Node` is used. */
    "cy.use": uint;
    /** In Cypress, it seems to be able to access data only through DOM. */
    "cy.any": any;
  }
}

if (globalThis.Node) {
  Reflect.defineProperty(Node.prototype, "isText", {
    get(this: Node) {
      return this.nodeType === Node.TEXT_NODE;
    },
  });

  Reflect.defineProperty(Node.prototype, "secondChild", {
    get(this: Node) {
      return this.firstChild ? this.firstChild.nextSibling : null;
    },
  });

  Reflect.defineProperty(Node.prototype, "index", {
    get(this: Node) {
      let i_: uint = 0;
      let nd_: Node | null = this;
      for (; (nd_ = nd_.previousSibling) !== null; i_++);
      return i_;
    },
  });

  /**
   * Only test properties in `rhs`
   * @headconst @param rhs
   */
  Node.prototype.assert_eq = function (this, rhs) {
    // if( rhs && rhs[$ref_test] )
    // {
    //   console.assert( this === rhs[$ref_test] );
    //   return;
    // }

    if (this === rhs) return;

    for (const key of Reflect.ownKeys(rhs)) {
      if (key === "childNodes") continue;

      const rhsval = (rhs as any)[key];
      const zisval = (this as any)[key];
      if (Is.array(rhsval)) {
        console.assert(rhsval.eql(zisval));
      } else {
        console.assert(rhsval === zisval);
      }
    }

    if ((rhs as any).childNodes) {
      const childNodes = (rhs as any).childNodes;
      console.assert(childNodes.length === this.childNodes.length);
      for (let i = childNodes.length; i--;) {
        this.childNodes[i].assert_eq(childNodes[i]);
      }
    }

    // if( rhs && rhs[test_ref_sym] ) rhs[ $ref_test ] = this;
  };
}
/*64----------------------------------------------------------*/

/*#static*/ if (DENO) {
  const m_ = "@b-fuze/deno-dom";
  const { Document, DOMParser } = await import(m_);
  globalThis.document = new Document();
  globalThis.DOMParser = DOMParser;
}
/*64----------------------------------------------------------*/

declare global {
  interface Document {
    /** Used for adding CSS pseudo-element like `::-webkit-scrollbar` */
    [$CSS]: CSSStyleSheet;
  }
}

if (globalThis.Document) {
  let cssstylesheet_: CSSStyleSheet | undefined;
  Reflect.defineProperty(Document.prototype, $CSS, {
    get(this: Document) {
      cssstylesheet_ ??= this.head.appendChild(html("style")).sheet!;
      return cssstylesheet_;
    },
  });
}
/*64----------------------------------------------------------*/

declare global {
  interface Element {
    assignAttro(attr_o: Record<string, string | number | boolean>): this;

    readonly scrollRight: number;
    readonly scrollBottom: number;

    hint: string;

    removeAllChild: () => this;
  }
}

if (globalThis.Element) {
  Element.prototype.assignAttro = function (this, attr_o) {
    for (const [key, val] of Object.entries(attr_o)) {
      this.setAttribute(key, val as any);
    }
    return this;
  };

  Reflect.defineProperty(Element.prototype, "scrollRight", {
    get(this: Element) {
      return this.scrollLeft + this.clientWidth;
    },
  });
  Reflect.defineProperty(Element.prototype, "scrollBottom", {
    get(this: Element) {
      return this.scrollTop + this.clientHeight;
    },
  });

  Reflect.defineProperty(Element.prototype, "hint", {
    get(this: Element) {
      return this.getAttribute("hint");
    },
    set(this: Element, name_x: string) {
      this.setAttribute("hint", name_x);
    },
  });

  Element.prototype.removeAllChild = function (this) {
    this.replaceChildren();
    return this;
  };
}
/*64----------------------------------------------------------*/

declare global {
  interface HTMLElement {
    assignStylo(styl_o: CSSStyle): this;

    /**
     * Return previous visible _HTMLElement_
     * jjjj cf. pdf/pdf.ts-web/ui_utils.getVisibleElements()
     */
    readonly prevVisible?: HTMLElement;

    // readonly pageX: number;
    // readonly pageY: number;

    readonly viewLeft: number;
    readonly viewRight: number;
    readonly viewTop: number;
    readonly viewBottom: number;
  }
}

if (globalThis.HTMLElement) {
  HTMLElement.prototype.assignStylo = function (this, styl_o) {
    Object.assign(this.style, styl_o);
    return this;
  };

  Reflect.defineProperty(HTMLElement.prototype, "prevVisible", {
    get(this: HTMLElement) {
      let ret = this.previousSibling as any;
      while (ret) {
        if (!(ret instanceof HTMLElement)) continue;

        if (ret.style.display !== "none") break;

        ret = ret.previousSibling;
      }
      ret ??= undefined;
      return ret;
    },
  });

  // Reflect.defineProperty(HTMLElement.prototype, "pageX", {
  //   get(this: HTMLElement) {
  //     let ret = 0;
  //     let el = this as any;
  //     do {
  //       ret += el?.offsetLeft ?? 0;
  //       ret += el?.clientLeft ?? 0;
  //       ret -= el?.scrollLeft ?? 0;
  //     } while (el = el.offsetParent);
  //     return ret;
  //   },
  // });
  // Reflect.defineProperty(HTMLElement.prototype, "pageY", {
  //   get(this: HTMLElement) {
  //     let ret = 0;
  //     let el = this as any;
  //     do {
  //       ret += el?.offsetTop ?? 0;
  //       ret += el?.clientTop ?? 0;
  //       ret -= el?.scrollTop ?? 0;
  //     } while (el = el.offsetParent);
  //     return ret;
  //   },
  // });

  Reflect.defineProperty(HTMLElement.prototype, "viewLeft", {
    get(this: HTMLElement) {
      return this.offsetLeft + this.clientLeft;
    },
  });
  Reflect.defineProperty(HTMLElement.prototype, "viewRight", {
    get(this: HTMLElement) {
      return this.viewLeft + this.clientWidth;
    },
  });
  Reflect.defineProperty(HTMLElement.prototype, "viewTop", {
    get(this: HTMLElement) {
      return this.offsetTop + this.clientTop;
    },
  });
  Reflect.defineProperty(HTMLElement.prototype, "viewBottom", {
    get(this: HTMLElement) {
      return this.viewTop + this.clientHeight;
    },
  });
}
/*64----------------------------------------------------------*/

declare global {
  interface SVGElement {
    assignStylo(styl_o: CSSStyle): this;
  }
}

if (globalThis.SVGElement) {
  SVGElement.prototype.assignStylo = function (this, styl_o) {
    Object.assign(this.style, styl_o);
    return this;
  };
}
/*64----------------------------------------------------------*/

declare global {
  interface CSSStyleDeclaration {
    /** @const @param prop_o */
    assignPropo(prop_o: Record<string, string | number>): void;
  }
}

if (globalThis.CSSStyleDeclaration) {
  CSSStyleDeclaration.prototype.assignPropo = function (this, prop_o) {
    for (const [key, val] of Object.entries(prop_o)) {
      this.setProperty(key, val as any);
    }
  };
}
/*64----------------------------------------------------------*/

declare global {
  interface CSSStyleSheet {
    /**
     * @const @param selector
     * @return Count of deleted rules
     */
    deleteSelector(selector: string): uint;
  }
}

if (globalThis.CSSStyleSheet) {
  CSSStyleSheet.prototype.deleteSelector = function (this, selector) {
    let n_: uint = 0;
    for (let i = this.cssRules.length; i--;) {
      const rule_i = this.cssRules[i];
      if (rule_i instanceof CSSStyleRule && rule_i.selectorText === selector) {
        this.deleteRule(i);
        n_ += 1;
      }
    }
    return n_;
  };
}
/*64----------------------------------------------------------*/

declare global {
  interface HTMLCollection {
    indexOf(element: Element): number;
  }

  // var HTMLCollectionBase:{
  //   prototype:HTMLCollectionBase;
  // }
}

if (globalThis.HTMLCollection) {
  HTMLCollection.prototype.indexOf = function (this, element) {
    for (let i = 0; i < this.length; ++i) {
      if (this.item(i) === element) return i;
    }
    return -1;
  };
}
/*64----------------------------------------------------------*/

export type HSElement = HTMLElement | SVGElement;
/*64----------------------------------------------------------*/

declare global {
  interface DOMRect {
    /** @const @param _x  */
    apxEq(_x: DOMRectReadOnly): boolean;
    /**
     * @const @param x_x
     * @const @param y_x
     */
    containDot(x_x: number, y_x: number): boolean;
    /**
     * @const @param rec_x
     * @const @param margin_x
     */
    containRec(rec_x: DOMRectReadOnly, margin_x?: unum): boolean;
    toString(): string;

    [$ovlap]: boolean;
  }
}

if (globalThis.DOMRect) {
  DOMRect.prototype.apxEq = function (this, _x) {
    return this === _x ||
      Number.apxE(this.left, _x.left) &&
        Number.apxE(this.top, _x.top) &&
        Number.apxE(this.height, _x.height) &&
        Number.apxE(this.width, _x.width);
  };

  DOMRect.prototype.containDot = function (this, x_x, y_x) {
    return this.left <= x_x && x_x < this.right &&
      this.top <= y_x && y_x < this.bottom;
  };
  DOMRect.prototype.containRec = function (this, rec_x, margin_x = 0) {
    return this.left <= rec_x.left - margin_x &&
      rec_x.right + margin_x <= this.right &&
      this.top <= rec_x.top - margin_x &&
      rec_x.bottom + margin_x <= this.bottom;
  };

  DOMRect.prototype.toString = function (this) {
    //jjjj TOCLEANUP
    // return [
    //   `left: ${this.left.fixTo(2)}`,
    //   `top: ${this.top.fixTo(2)}`,
    //   `height: ${this.height.fixTo(2)}`,
    //   `width: ${this.width.fixTo(2)}`,
    // ].join(", ");
    return [
      `vert: ${
        [
          this.top.fixTo(2),
          this.height.fixTo(2),
          this.bottom.fixTo(2),
        ].join(" | ")
      }`,
      `horz: ${
        [
          this.left.fixTo(2),
          this.width.fixTo(2),
          this.right.fixTo(2),
        ].join(" | ")
      }`,
    ].join(", ");
  };
}
/*64----------------------------------------------------------*/

declare global {
  interface AbstractRange {
    //jjjj TOCLEANUP
    // [$eran]?: ERan;

    /**
     * @const @param strtCtnr_x
     * @const @param strtOffs_x
     * @const @param stopCtnr_x
     * @const @param stopOffs_x
     */
    eql(
      strtCtnr_x: Node,
      strtOffs_x: uint,
      stopCtnr_x: Node,
      stopOffs_x: uint,
    ): boolean;
  }
}

if (globalThis.AbstractRange) {
  Reflect.defineProperty(AbstractRange.prototype, "eql", {
    value(
      this: AbstractRange,
      strtCtnr_x: Node,
      strtOffs_x: uint,
      stopCtnr_x: Node,
      stopOffs_x: uint,
    ) {
      return (
        this.startContainer === strtCtnr_x && this.startOffset === strtOffs_x &&
        this.endContainer === stopCtnr_x && this.endOffset === stopOffs_x
      );
    },
  });
}

declare global {
  interface Range {
    /**
     * @out @param out_a_x
     * @const @param ovlap_x
     * @const @param relPos_x
     */
    getStickA(out_a_x: DOMRect[], ovlap_x: boolean, relPos_x?: Pos): void;

    reset(): void;

    /**
     * @const @param node_x
     * @const @param offs_x
     */
    setStrt(node_x: Node, offs_x: uint): this;
    /**
     * @const @param node_x
     * @const @param offs_x
     */
    setStop(node_x: Node, offs_x: uint): this;
  }
}

if (globalThis.Range) {
  Range.prototype.getStickA = function (this, out_a_x, ovlap_x, relPos_x) {
    const recs = this.getClientRects();
    if (recs.length) {
      for (const rec of recs) {
        //jjjj TOCLEANUP
        // if (rec.width === 0) rec.width = rec.height * .1;
        rec[$ovlap] = ovlap_x;
        if (relPos_x) {
          rec.x -= relPos_x.left;
          rec.y -= relPos_x.top;
        }
        out_a_x.push(rec);
      }
    } else {
      const rec = this.getBoundingClientRect();
      rec.width = rec.height * .1;
      rec[$ovlap] = ovlap_x;
      if (relPos_x) {
        rec.x -= relPos_x.left;
        rec.y -= relPos_x.top;
      }
      out_a_x.push(rec);
    }
  };

  Range.prototype.reset = function (this) {
    this.setEnd(document, 0);
    this.collapse();
  };

  Range.prototype.setStrt = function (this, node_x, offs_x) {
    if (node_x.isText || node_x.hasChildNodes()) {
      this.setStart(node_x, offs_x);
    } else if (node_x.parentNode) {
      this.setStart(node_x.parentNode, node_x.index);
    } else {
      this.reset();
    }
    return this;
  };
  Range.prototype.setStop = function (this, node_x, offs_x) {
    if (node_x.isText || node_x.hasChildNodes()) {
      this.setEnd(node_x, offs_x);
    } else if (node_x.parentNode) {
      this.setEnd(node_x.parentNode, node_x.index);
    } else {
      this.reset();
    }
    return this;
  };
}
/*64----------------------------------------------------------*/

declare global {
  interface Highlight {
    //jjjj TOCLEANUP
    // revERans(): void;

    /** @const @param rd_x range data */
    eql(rd_x: [Node, uint, Node, uint][]): boolean;
  }
}

if (globalThis.Highlight) {
  //jjjj TOCLEANUP
  // Highlight.prototype.revERans = function (this) {
  //   if (this.size) {
  //     this.forEach((r) => r[$eran]?.rev());
  //     this.clear();
  //   }
  // };

  Reflect.defineProperty(Highlight.prototype, "eql", {
    value(this: Highlight, rd_x: [Node, uint, Node, uint][]) {
      let i_ = 0;
      for (const range of this.values()) {
        if (!range.eql(...rd_x[i_])) return false;
        i_ += 1;
      }
      return true;
    },
  });
}
/*64----------------------------------------------------------*/

declare global {
  interface Text {
    [$loff_0]?: loff_t;
    // [$tail_ignored]?: boolean;

    loff(offs_x: uint): loff_t;
    readonly strtLoff: loff_t;
    readonly stopLoff: loff_t;
  }
}

/**
 * @const @param text_x
 * @const @param loff_x
 */
export const textnode = (
  text_x: string,
  loff_x: loff_t = 0,
  // tail_ignored_x?: boolean,
) => {
  const ret = document.createTextNode(text_x);
  ret[$loff_0] = loff_x;
  // if (tail_ignored_x !== undefined) ret[$tail_ignored] = tail_ignored_x;
  return ret;
};

if (globalThis.Text) {
  Text.prototype.loff = function (this, offs_x) {
    return (this[$loff_0] ?? 0) + offs_x;
  };

  Reflect.defineProperty(Text.prototype, "strtLoff", {
    get(this: Text) {
      return this.loff(0);
    },
  });

  Reflect.defineProperty(Text.prototype, "stopLoff", {
    get(this: Text) {
      return this.loff(this.length);
    },
  });
}
/*64----------------------------------------------------------*/

type HTMLRet_<NN extends string> = NN extends keyof HTMLElementTagNameMap
  ? HTMLElementTagNameMap[NN]
  : HTMLElement;
export function html<NN extends string>(
  nodeName_x: NN,
  text_x?: string,
  doc_x = document,
) {
  const ret = doc_x.createElement(nodeName_x);
  if (text_x) ret.textContent = text_x;
  return ret as HTMLRet_<NN>;
}
export function div(text_x?: string, doc_x = document) {
  return html("div", text_x, doc_x);
}
export function span(text_x?: string, doc_x = document) {
  return html("span", text_x, doc_x);
}

type SVGRet_<NN extends string> = NN extends keyof SVGElementTagNameMap
  ? SVGElementTagNameMap[NN]
  : SVGElement;
export function svg<NN extends string>(nodeName: NN, doc = document) {
  return doc.createElementNS(
    "http://www.w3.org/2000/svg",
    nodeName,
  ) as SVGRet_<NN>;
}
/*64----------------------------------------------------------*/

declare global {
  interface OnProgressP {
    /**
     * Currently loaded number of bytes.
     */
    loaded: number;

    /**
     * Total number of bytes in the PDF file.
     */
    total: number;
  }
}
/*80--------------------------------------------------------------------------*/
