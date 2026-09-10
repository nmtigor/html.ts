/** 80**************************************************************************
 * @module lib/compiling/plain/PlainTok
 * @license MIT
 ******************************************************************************/

import { BaseTok } from "../BaseTok.ts";
/*80--------------------------------------------------------------------------*/

enum PlainTok_ {
  plaintext = 100,

  _max,
}
console.assert(PlainTok_._max <= 200);

export type PlainTok = BaseTok | PlainTok_;
export const PlainTok = { ...BaseTok, ...PlainTok_ };
/*80--------------------------------------------------------------------------*/
