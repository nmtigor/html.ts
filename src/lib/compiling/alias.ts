/** 80**************************************************************************
 * @module lib/compiling/alias
 * @license MIT
 ******************************************************************************/

import type { Dulstr, lnum_t, loff_t, uint32 } from "../alias.ts";
import type { Chr } from "../alias_v.ts";
import type { BaseTok } from "./BaseTok.ts";
import type { CSSTok } from "./css/CSSTok.ts";
import type { HTMLTok } from "./html/HTMLTok.ts";
import type { JSLangTok } from "./jslang/JSLangTok.ts";
import type { MdextTok } from "./mdext/MdextTok.ts";
import type { PDFTok } from "./pdf/PDFTok.ts";
import type { PlainTok } from "./plain/PlainTok.ts";
import type { RMLTok } from "./rml/RMLTok.ts";
import type { SetTok } from "./set/SetTok.ts";
import type { URITok } from "./uri/URITok.ts";
/*80--------------------------------------------------------------------------*/

export const enum BufrDoState {
  idle = 1,
  doing,
  undoing,
  redoing,
}

/**
 * ! If change `BufrReplState` names, check "ReplActr.ts" first where names are
 *  literally used (in order to show xstate graph correctly).
 */
export enum BufrReplState {
  idle = 1,
  preRepl,
  sufRepl,
  sufRepl_edtr,
}

export type sig_t = uint32;
/*64----------------------------------------------------------*/

export type Locval = [lnum_t, loff_t];

/**
 * BaseTok: [0,100) \
 * PlainTok:  BaseTok ∪ [100,200) \
 * SetTok:    BaseTok ∪ [200,300) \
 * MdextTok:  BaseTok ∪ [300,400) \
 * JSLangTok: BaseTok ∪ [400,600)
 */
export type Tok =
  | BaseTok
  | PlainTok
  | SetTok
  | URITok
  | CSSTok
  | HTMLTok
  | RMLTok
  | MdextTok
  | JSLangTok
  | PDFTok;

/** Dulling map */
export type Dulmap = Map<Chr, Dulstr | Dulstr[]>;
/*80--------------------------------------------------------------------------*/

export enum ScanR {
  reachBdry,
  continue,
  return,
}
/*80--------------------------------------------------------------------------*/

/** text-decoration-thickness in em */
export const Tdt = 0.04;
/** text-underline-offset factor in em */
export const Tuof = 0.08;
/*80--------------------------------------------------------------------------*/
