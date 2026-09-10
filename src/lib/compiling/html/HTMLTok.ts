/** 80**************************************************************************
 * @module lib/compiling/html/HTMLTok
 * @license MIT
 ******************************************************************************/

import { BaseTok } from "../BaseTok.ts";
/*80--------------------------------------------------------------------------*/

enum HTMLTok_ {
  doctype = 500,
  tag,
  /** processing instruction */
  proins, // <?abc>
  comment,
  character,
  chrref, // &lt; | &#60; | &#x3C;

  /**
   * By spec, some inputs are not tokenized to any spec token (e.g. "<z\r",
   * "<?"), so add this to keep `HTMLTk`s concatenated.
   */
  bogus,

  /** Used as the only Token in auto-generated Elment's */
  placeholder,

  _max,
}
console.assert(HTMLTok_._max <= 600);

export type HTMLTok = BaseTok | HTMLTok_;
export const HTMLTok = { ...BaseTok, ...HTMLTok_ };
/*80--------------------------------------------------------------------------*/
