/** 80**************************************************************************
 * @module lib/compiling/_test
 * @license MIT
 ******************************************************************************/

import type { lnum_t, loff_t } from "../alias.ts";
import type { Bufr } from "./Bufr.ts";
import type { Lexr } from "./Lexr.ts";
import { Loc } from "./Loc.ts";
import type { Pazr } from "./Pazr.ts";
import { Ran } from "./Ran.ts";
import { Ranval } from "./Ranval.ts";
import type { Replin } from "./Repl.ts";
/*80--------------------------------------------------------------------------*/

export type TestO = {
  bufr: Bufr;
  lexr: Lexr;
  pazr: Pazr;
};
export const test_o = Object.create(null) as TestO;
/*64----------------------------------------------------------*/

export const ln = (i_x: lnum_t) => test_o.bufr.line(i_x);
export const loc = (i_x: lnum_t, j_x?: loff_t) => new Loc(ln(i_x), j_x);
export const ran = (
  i_0_x: lnum_t,
  j_0_x?: loff_t,
  i_1_x?: lnum_t,
  j_1_x?: loff_t,
) =>
  new Ran(
    loc(i_0_x, j_0_x),
    i_1_x === undefined ? undefined : loc(i_1_x, j_1_x),
  );
export const rv = (
  anchrLidx_x: lnum_t,
  anchrLoff_x: loff_t,
  focusLidx_x?: lnum_t,
  focusLoff_x?: loff_t,
) => new Ranval(anchrLidx_x, anchrLoff_x, focusLidx_x, focusLoff_x);

/**
 * @const @param rv
 * @const @param txt
 */
export const repl = (rv: Ranval, txt: string | string[]) =>
  test_o.bufr.Do({ rv, txt });
export const repla = (replin: Replin[]) => test_o.bufr.Do(replin);
export const undo = () => test_o.bufr.undo();
export const redo = () => test_o.bufr.redo();
/*80--------------------------------------------------------------------------*/
