/** 80**************************************************************************
 * This module is loaded with top priority!
 *
 * @module global
 * @license MIT
 ******************************************************************************/

import type { uint } from "@fe-lib/alias.ts";
import { Hover, Pointer } from "@fe-lib/alias.ts";
import type { HTMLVCo } from "@fe-lib/cv.ts";
import { assert, out } from "@fe-lib/util.ts";
import { CYPRESS, DEBUG } from "./preNs.ts";
/*80--------------------------------------------------------------------------*/

export const global = new class {
  /** @deprecated Use preprocessor */
  testing = false;

  /** @deprecated */
  readonly LASTUPDATE_NOT = "2020-07-10 22:17:59 +0200";
  /** @deprecated */
  readonly LASTUPDATE_DATNI = "2020-07-24 01:59:51 +0200";
  /** @deprecated */
  readonly LASTUPDATE_DEV = "2021-05-22 05:04:21 +0200";
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  _i_: uint | -1 = -1;
  serveStatic = false;
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // vco?: MainWindlBase;
  // // holdindicatr?: [HoldIndicatr, HoldIndicatr, HoldIndicatr];

  mw_pr = Promise.withResolvers<HTMLVCo>();
  /**
   * This is actually of type `MainWindlBase | undefined`. Using `HTMLVCo` here
   * is to prevent from importing `MainWindlBase`, which will further  import
   * many "premsys codes", which is bad for subprojects like "commonmark.ts",
   * "set.ts".
   *
   * This can be regarded as decoupling point between outer "premsys codes" and
   * inner "buffer codes".
   */
  mw: HTMLVCo | undefined;
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** @deprecated */
  has_ResizeObserver = false;
  /** @deprecated */
  can_touchstart = false;

  pointer = Pointer.none;
  anyPointer = Pointer.none;
  #mockTouch: boolean | undefined;
  get canTouch() {
    return this.#mockTouch ??
      (navigator.maxTouchPoints > 0 &&
        (this.anyPointer === Pointer.coarse || "ontouchstart" in globalThis));
  }

  hover = Hover.none;
  anyHover = Hover.none;
  #mockHover: boolean | undefined;
  get canHover() {
    return this.#mockHover ??
      this.anyHover === Hover.hover;
  }

  @out((self: typeof global) => {
    assert(self.canTouch);
    assert(!self.canHover);
  })
  mockTouch() {
    this.#mockTouch = true;
    this.#mockHover = false;
  }

  // /* For testing only */
  // #_touch: Pointer | undefined;
  // set _touch(b_x: boolean | undefined) {
  //   this.#_touch ??= this.anyPointer;
  //   if (b_x === undefined) {
  //     global.anyPointer = this.#_touch;
  //   } else {
  //     if (b_x) {
  //       global.anyPointer = Pointer.coarse;
  //     } else {
  //       global.anyPointer = Pointer.fine;
  //     }
  //   }
  // }

  // #_hover: Hover | undefined;
  // set _hover(b_x: boolean | undefined) {
  //   this.#_hover ??= this.anyHover;
  //   if (b_x === undefined) {
  //     global.anyHover = this.#_hover;
  //   } else {
  //     if (b_x) {
  //       global.anyHover = Hover.hover;
  //     } else {
  //       global.anyHover = Hover.none;
  //     }
  //   }
  // }
  // /* ~ */
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** Local File System */
  hasLFS = false;

  opfs_pr = Promise.withResolvers<FileSystemDirectoryHandle>();
  /** OPFS root directory handle */
  opfs: FileSystemDirectoryHandle | undefined;

  locl = {
    bk: /*#static*/ DEBUG
      ? (/*#static*/ CYPRESS ? "bk-dev-t" : "bk-dev")
      : (/*#static*/ CYPRESS ? "bk-pro-t" : "bk-pro"),
    cmd: /*#static*/ DEBUG
      ? (/*#static*/ CYPRESS ? "cmd-dev-t" : "cmd-dev")
      : (/*#static*/ CYPRESS ? "cmd-pro-t" : "cmd-pro"),
  } as const;
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  toJSON() {
    return {
      serveStatic: this.serveStatic,

      canTouch: this.canTouch,
      canHover: this.canHover,

      locl: this.locl,
    };
  }
}();

global.mw_pr.promise.then((mw) => global.mw = mw);
global.opfs_pr.promise.then((opfs) => global.opfs = opfs);
/*80--------------------------------------------------------------------------*/
