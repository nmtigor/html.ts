/** 80**************************************************************************
 * @module lib/symbols
 * @license MIT
 ******************************************************************************/

export {};
/*80--------------------------------------------------------------------------*/

/*
Before runtimes support it natively...

Ref. https://devblogs.microsoft.com/typescript/announcing-typescript-5-2/#using-declarations-and-explicit-resource-management
*/
(Symbol as any).dispose ??= Symbol("Symbol.dispose");
(Symbol as any).asyncDispose ??= Symbol("Symbol.asyncDispose");
/*80--------------------------------------------------------------------------*/

/** General usage */
export const $inuse = Symbol("$inuse");
/*64----------------------------------------------------------*/

/** document[ $CSS ] { Getter } */
export const $CSS = Symbol("$CSS");
/**
 * document[ $CSS_ ] { CSSStyleSheet }
 * @deprecated See lib/dom
 */
export const $CSS_ = Symbol("$CSS_");
/*64----------------------------------------------------------*/

// /** Text[ $tail_ignored ] { boolean } */
// export const $tail_ignored = Symbol("$tail_ignored");

//jjjj TOCLEANUP
// /** Node[ $facil_node ] { boolean } */
// export const $facil_node = Symbol("$facil_node");

// /** Window[ features_sym ] { Object } - ref. detector.js */
// export const features_sym = Symbol("features_sym");

/** indent_el[ $indent_blockline ] { BlockLine }  */
export const $indent_blockline = Symbol("$indent_blockline");

/**
 * BlockVuu.el[ $lidx ] { lnum_t }
 * First line index of the `Element`
 */
export const $lidx = Symbol("$lidx");
/**
 * BlockVuu.el[ $lidx_1 ] { lnum_t }
 * Last line index of the `Element`
 */
export const $lidx_1 = Symbol("$lidx_1");
/**
 * SpanVuu.el[ $loff_0 ] { loff_t }\
 * Start offset of the `Element` or `Text` in the `Line`
 */
export const $loff_0 = Symbol("$loff_0");
/**
 * SpanVuu.el[ $loff_1 ] { loff_t }
 * Stop offset of the `Element` in the `Line`
 */
export const $loff_1 = Symbol("$loff_1");

/**
 * DOMRect[ $ovlap ] { boolean }\
 * Node[ $ovlap ] { boolean }
 */
export const $ovlap = Symbol("$ovlap");

/**
 * document[ $palename ] { {} }
 * @deprecated
 */
export const $palename = Symbol("$palename");

/** Where focus is redirected for `Node` should not getting focused */
export const $redirect_focus = Symbol("$redirect_focus");

/**
 * HTMLImageElement[ $src ] { String }\
 * To replace `src` to prevent console error messages\
 * For testing only
 */
export const $src = Symbol("$src");

// /** document[ $theme_modified ] { {} } */
// export const $theme_modified = Symbol("$theme_modified");

/** document[ $theme ] { Theme_ } */
export const $theme = Symbol("$theme");

/**
 * Reference to test `===`\
 * For testing only
 */
// export const $ref_test = Symbol("$ref_test");
/**
 * Test reference?\
 * For testing only
 */
// export const test_ref_sym = Symbol("test_ref_sym");

// export const valve_selectionchange_sym = Symbol("valve_selectionchange_sym");
/*64----------------------------------------------------------*/

/** { FSRec[] } */
export const $fsrec_a = Symbol("$fsrec_a");

//jjjj TOCLEANUP
// export const $fat = Symbol("$fat");
// export const $sin = Symbol("$sin");
// export const $uts = Symbol("$uts");
/*64----------------------------------------------------------*/

/** this.el$[ $vuu ] { Vuu } */
export const $vuu = Symbol("$vuu");
/**
 * this.el$[ $Vuu ] { AbstractConstructor<Vuu> }
 * kkkk check use
 */
export const $Vuu = Symbol("$Vuu");

//jjjj TOCLEANUP
// /** Range[ $eran ] { ERan? } */
// export const $eran = Symbol("$eran");
/*80--------------------------------------------------------------------------*/
