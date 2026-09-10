/** 80**************************************************************************
 * @module lib/util/dom
 * @license MIT
 ******************************************************************************/

import { rmvRangeMock } from "@fe-cpl/util.ts";
import { DENO } from "../../preNs.ts";
import { scrollO } from "../alias.ts";
import "../dom.ts";
/*80--------------------------------------------------------------------------*/
/* Event */

export const stopPropagation = (evt_x: Event) => evt_x.stopPropagation();
export const preventDefault = (evt_x: Event) => evt_x.preventDefault();

export const onWheel = (el_x: Element) => {
  return (evt_x: WheelEvent) => {
    scrollO.top = evt_x.deltaY >= 0 ? 50 : -50;
    scrollO.left = 0;
    el_x.scrollBy(scrollO);
  };
};
/*80--------------------------------------------------------------------------*/

export const rmvRange = /*#static*/ DENO ? rmvRangeMock : new Range();
/*80--------------------------------------------------------------------------*/

export const domParser = new DOMParser();
//jjjj TOCLEANUP
// const backslashOrAmp_re_ = /[\\&]/;
// export const unescapeStr = (s_x: string) =>
//   backslashOrAmp_re_.test(s_x)
//     ? domParser.parseFromString(s_x, "text/html").textContent ?? ""
//     : s_x;
/*80--------------------------------------------------------------------------*/
