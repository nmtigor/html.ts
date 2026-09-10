/** 80**************************************************************************
 * @module lib/editing/util
 * @license MIT
 ******************************************************************************/

import { Key } from "../../alias.ts";
import type { WritingMode } from "../alias.ts";
import { WritingDir } from "../alias.ts";
import "../jslang.ts";
import * as Is from "../util/is.ts";
import type { Keycnt } from "./alias.ts";
/*80--------------------------------------------------------------------------*/

export const samerow_top = (
  rec_x: DOMRectReadOnly,
  top_0_x: number,
  strict_x?: "strict",
) => {
  return Number.apxG(rec_x.bottom, top_0_x) &&
    (!strict_x || Number.apxSE(rec_x.top, top_0_x));
};

export const samerow_bot = (
  rec_x: DOMRectReadOnly,
  bot_0_x: number,
  strict_x?: "strict",
) => {
  return Number.apxS(rec_x.top, bot_0_x) &&
    (!strict_x || Number.apxGE(rec_x.bottom, bot_0_x));
};

export const samerow_left = (
  rec_x: DOMRectReadOnly,
  left_0_x: number,
  strict_x?: "strict",
) => {
  return Number.apxG(rec_x.right, left_0_x) &&
    (!strict_x || Number.apxSE(rec_x.left, left_0_x));
};

export const samerow_rigt = (
  rec_x: DOMRectReadOnly,
  rigt_0_x: number,
  strict_x?: "strict",
) => {
  return Number.apxS(rec_x.left, rigt_0_x) &&
    (!strict_x || Number.apxGE(rec_x.right, rigt_0_x));
};

export type InlineOf = (rec_x: DOMRectReadOnly) => number;
export type BlockOf = (rec_x: DOMRectReadOnly) => number;
export type SameRow = (
  rec_x: DOMRectReadOnly,
  _0_x: number,
  strict_x?: "strict",
) => boolean;

export const genInlineMidOf = (wm_x: WritingMode) => {
  return wm_x & WritingDir.v
    ? (rec_y: DOMRectReadOnly) => (rec_y.top + rec_y.bottom) / 2
    : (rec_y: DOMRectReadOnly) => (rec_y.left + rec_y.right) / 2;
};
/*80--------------------------------------------------------------------------*/

export const stringFrom = (_x: Keycnt) => Is.string(_x) ? _x : Key[_x];
/*80--------------------------------------------------------------------------*/

// /** @final */
// class HighlightFac_ extends Factory<Highlight> {
//   /** @implement */
//   protected createVal$() {
//     return new Highlight();
//   }

//   protected override resetVal$(v_x: Highlight): void {
//     v_x.clear();
//   }
// }
// export const g_highlight_fac = new HighlightFac_();
/*80--------------------------------------------------------------------------*/
