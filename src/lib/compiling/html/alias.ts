/** 80**************************************************************************
 * @module lib/compiling/html/alias
 * @license MIT
 ******************************************************************************/

import type { ts_t, uint } from "../../alias.ts";
import type { ErrMsg } from "../util.ts";
/*80--------------------------------------------------------------------------*/

/**
 * Ref. [html5lib-tests - Tokenizer tests - Test set-up](https://github.com/html5lib/html5lib-tests/tree/master/tokenizer#test-set-up)
 */
export enum State {
  Data = "Data state",
  // PLAINTEXT = "PLAINTEXT state",
  RCDATA = "RCDATA state",
  RAWTEXT = "RAWTEXT state",
  Script = "Script data state",
  CDATA = "CDATA section state",
}

export type TokenRepr =
  | [
    "DOCTYPE",
    name: string | null,
    public_id: string | null,
    system_id: string | null,
    correctness: boolean,
  ]
  | [
    "StartTag",
    name: string,
    attributes?: Record<string, string | undefined>,
    self_closing?: true,
  ]
  | ["EndTag", name: string]
  | ["ProcessingInstruction", target: string, data?: string]
  | ["Comment", data: string]
  | ["Character", data: string];
// | ["chrref", data: string]
// | ["bogus"];

export type ErrRepr = {
  code: ErrMsg;
  line?: uint;
  col?: uint;
  ts?: ts_t | undefined;
};
/*80--------------------------------------------------------------------------*/

/** [13.1.2 Elements](https://html.spec.whatwg.org/multipage/syntax.html#elements-2) */
export enum TextCat {
  normal,
  void,
  template,
  raw_text,
  escapable_raw_text,
  foreign,
  //jjjj TOCLEANUP
  // /** foreign and void */
  // forvoid,
}

/** [3.2.4.2 The stack of open elements](https://html.spec.whatwg.org/multipage/parsing.html#the-stack-of-open-elements) */
export enum NestCat {
  special,
  formatting,
  ordinary,
}

/* deno-fmt-ignore */
/** [Content Categoriy](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Content_categories) */
export enum ContCat {
  null        = 0,
  metadata    = 0b0_0000_0001,
  flow        = 0b0_0000_0010,
  sectioning  = 0b0_0000_0110,
  heading     = 0b0_0000_1010,
  phrasing    = 0b0_0001_0010,
  embedded    = 0b0_0011_0010,
  interactive = 0b0_0100_0010,
  palpable    = 0b0_1000_0000,
  script_supporing = 0b0_001_0000_0000,
  form_associated  = 0b0_010_0000_0010,
  labelable        = 0b0_100_0000_0010,
}

export const enum TagNS {
  HTML = "http://www.w3.org/1999/xhtml",
  SVG = "http://www.w3.org/2000/svg",
  MathML = "http://www.w3.org/1998/Math/MathML",
}
export const enum AttrNS {
  XLink = "http://www.w3.org/1999/xlink",
  XML = "http://www.w3.org/XML/1998/namespace",
  XMLNS = "http://www.w3.org/2000/xmlns/",
}

export type ForeignAttrName = {
  prefix: string;
  localName: string;
  namespace: AttrNS;
};
/*80--------------------------------------------------------------------------*/
