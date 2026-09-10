/** 80**************************************************************************
 * @module lib/compiling/css/CSSTok
 * @license MIT
 ******************************************************************************/

import { BaseTok } from "../BaseTok.ts";
/*80--------------------------------------------------------------------------*/

enum CSSTok_ {
  comment = 400, // /* */

  delim, // <delim-token>
  whitespace, // <whitespace-token>
  string, // <string-token>
  hash, // #abc | <hash-token>
  paren_open, // <(-token>
  paren_cloz, // <)-token>
  number, // <number-token>
  percentage, // 80% | <percentage-token>
  dimension, // <dimension-token>
  comma, // , | <comma-token>
  CDO, // <!-- | <CDO-token>
  CDC, // --> | <CDC-token>
  ident, // <ident-token>
  function, // <function-token>
  url, // <url-token>
  colon, // : | <colon-token>
  semicolon, // ; | <semicolon-token>
  at_keyword, // @agc | <at-keyword-token>
  squar_open, // <[-token>
  squar_cloz, // <]-token>
  curly_open, // <{-token>
  curly_cloz, // <}-token>

  _max,
}
console.assert(CSSTok_._max <= 500);

export type CSSTok = BaseTok | CSSTok_;
export const CSSTok = { ...BaseTok, ...CSSTok_ };
/*80--------------------------------------------------------------------------*/
