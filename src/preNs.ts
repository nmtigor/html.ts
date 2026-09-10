/** 80**************************************************************************
 * This module is loaded with top priority!
 *
 * @module preNs
 * @license MIT
 ******************************************************************************/

export {};
/*80--------------------------------------------------------------------------*/

// deno-fmt-ignore
/* preprocessor names */
export const 
  /** Release Candidate */
  RC = true // premsys.org/rc
, STAGING = true
, /** `true` means the app is loaded from localhost in production. */ 
  LOCAL = false

/* runtime */
, CF = false // cloudflare
, DENO = true
, MOZCENTRAL = false
/* ~ */

, INOUT = true // contracts
  , TREE = true
, DEBUG = true // debug build
  , COLR = true
  , INFO = true
  , STEP = true
  , TRACE = true
  
  , RESIZ = true // "resize", `ResizeObserver`
  , INTRS = true // `IntersectionObserver`

  , THEMESETTING = false
  , EDTR = true
    , /** @deprecated */EDITOR_v = true // verbose
  , PDFTS = true
    , PDFTS_v = true // verbose
      , PDFTS_vv = false // very verbose
, /** @deprecated */APP = false // release build 
, /** PeRFormance */PRF = true

/* testing */
, AUTOTEST = true
, CYPRESS = false 
, WDIO = false 
/* ~ */

, _TREE = INOUT && TREE
, _COLR = DEBUG && COLR
, _INFO = DEBUG && INFO
, _STEP = DEBUG && STEP && !AUTOTEST
, _TRACE = DEBUG && TRACE && !AUTOTEST

/* Only in ./pdf/ */
, PDFJSDev = true
, GENERIC = true
, CHROME = false
, GECKOVIEW = false
, LIB = false
, SKIP_BABEL = true
, IMAGE_DECODERS = false
, COMPONENTS = false
;
/*80--------------------------------------------------------------------------*/
