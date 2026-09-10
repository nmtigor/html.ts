/** 80**************************************************************************
 * @module lib/editing/alias
 * @license MIT
 ******************************************************************************/

import type { Keybinding } from "../../alias.ts";
import { Key } from "../../alias.ts";
import type { uint8 } from "../alias.ts";
/*80--------------------------------------------------------------------------*/

export const enum EdtrType {
  unknown = 1,
  plain,
  set_code,
  mdext_code,
  mdext_rich,
}

export type Pos = { left: number; top: number };

/** `fat` and `sin` rects */
export type FSRec = {
  fat: DOMRect;
  sin: DOMRect;
  //jjjj TOCLEANUP
  // uts: Ts_t;
};

/** view focus margin in px */
export const VFMrgin = 20;
/** view focus pulse in milliseconds */
export const VFPulse = 500;
/*80--------------------------------------------------------------------------*/
/* zIndex */

/* Stacking context: EdtrBaseScrolr */
export const Imevu_z = 20; //jjjj TOCHECK
export const Ovlap_proactive_z = 14; //jjjj TOCHECK
export const Ovlap_passive_z = 13; //jjjj TOCHECK
export const EdtrMain_z = 30;
export const Caret_proactive_z = 25;
export const Caret_passive_z = 24;
export const Selec_proactive_z = 23;
export const Selec_passive_z = 22;

//jjjj uses?
export const REP = Object.freeze({
  none: 1,
  insert: 2,
  remove_left: 3,
  remove_rigt: 4,
  replace: 5,
});
/*80--------------------------------------------------------------------------*/
/* Editing commands */

/* deno-fmt-ignore */
export type EdtrFuncName =
  | "moveCaretLeft" | "moveCaretRigt" | "moveCaretUp" | "moveCaretDown"
  | "moveFocusLeft" | "moveFocusRigt" | "moveFocusUp" | "moveFocusDown"

  | "moveCaretLeftMost" | "moveCaretRigtMost" | "moveCaretUpMost" | "moveCaretDownMost" 
  | "moveFocusLeftMost" | "moveFocusRigtMost" | "moveFocusUpMost" | "moveFocusDownMost"

  /* "Sol": Start of line */
  | "moveCaretSol" | "moveCaretEol" 
  | "moveFocusSol" | "moveFocusEol"

  /* "Sob": Start of buffer */
  | "moveCaretSob" | "moveCaretEob" 
  | "moveFocusSob" | "moveFocusEob"

  | "selectLine" | "selectAll"

  | "undo" | "redo"

  | "cut" | "copy" | "paste"

  | "open" | "save"

  | "test"
;

export const enum EdtrState {}

export type EdtrShortcut<N extends string = string> = Map<
  Keybinding,
  N | Record<EdtrState, N>
>;
export const EdtrShortcut_a = [
  [`${Key.ArrowLeft}`, "moveCaretLeft"],
  [`${Key.ArrowRight}`, "moveCaretRigt"],
  [`${Key.ArrowUp}`, "moveCaretUp"],
  [`${Key.ArrowDown}`, "moveCaretDown"],
  [`${Key.Shift}+${Key.ArrowLeft}`, "moveFocusLeft"],
  [`${Key.Shift}+${Key.ArrowRight}`, "moveFocusRigt"],
  [`${Key.Shift}+${Key.ArrowUp}`, "moveFocusUp"],
  [`${Key.Shift}+${Key.ArrowDown}`, "moveFocusDown"],

  [`${Key.Control}+${Key.ArrowLeft}`, "moveCaretLeftMost"],
  [`${Key.Control}+${Key.ArrowRight}`, "moveCaretRigtMost"],
  [`${Key.Control}+${Key.ArrowUp}`, "moveCaretUpMost"],
  [`${Key.Control}+${Key.ArrowDown}`, "moveCaretDownMost"],
  [`${Key.Control}+${Key.Shift}+${Key.ArrowLeft}`, "moveFocusLeftMost"],
  [`${Key.Control}+${Key.Shift}+${Key.ArrowRight}`, "moveFocusRigtMost"],
  [`${Key.Control}+${Key.Shift}+${Key.ArrowUp}`, "moveFocusUpMost"],
  [`${Key.Control}+${Key.Shift}+${Key.ArrowDown}`, "moveFocusDownMost"],

  [`${Key.Home}`, "moveCaretSol"],
  [`${Key.End}`, "moveCaretEol"],
  [`${Key.Shift}+${Key.Home}`, "moveFocusSol"],
  [`${Key.Shift}+${Key.End}`, "moveFocusEol"],

  [`${Key.Control}+${Key.Home}`, "moveCaretSob"],
  [`${Key.Control}+${Key.End}`, "moveCaretEob"],
  [`${Key.Control}+${Key.Shift}+${Key.Home}`, "moveFocusSob"],
  [`${Key.Control}+${Key.Shift}+${Key.End}`, "moveFocusEob"],

  [`${Key.Control}+l`, "selectLine"],
  [`${Key.Control}+a`, "selectAll"],

  [`${Key.Control}+z`, "undo"],
  [`${Key.Control}+Z`, "redo"],

  [`${Key.Control}+x`, "cut"],
  [`${Key.Control}+c`, "copy"],
  [`${Key.Control}+v`, "paste"],

  [`${Key.Control}+o`, "open"],
  [`${Key.Control}+s`, "save"],
  //
  [`${Key.Alt}+t`, "test"],
] as const;
export const EdtrShortcut_m: EdtrShortcut<EdtrFuncName> = new Map(
  EdtrShortcut_a,
);

export const enum EdtrFuncRet {
  unknown,

  nope,
  /** Caret is possibly moved. */
  caret,
  /** May be edited */
  repl,
  /** Other function run. Nothing to do with caret. */
  func,
}
/*80--------------------------------------------------------------------------*/
/* Customized virtual keyboard */

export type Keycnt = string | Key;
/* alias_v */
// const vKeycnt

type Keycnt_1 = [Keycnt, shift?: Keycnt];
/* alias_v */
// const vKeycnt_1

export type Keysiz = uint8;
/* alias_v */
// const vKeysiz

export type Keycap = Keycnt_1 | [Keycnt_1, size: Keysiz];
/* alias_v */
// const vKeycap

export type Keyrow = Keycap[];
/* alias_v */
// const vKeyrow

export type Keybrd = Keyrow[];
/* alias_v */
// const vKeybrd

export type KeybrdName = string;
/* alias_v */
// const vKeybrdName

/** key inputs */
export type Keyins = Record<KeybrdName, Keybrd>;
/* alias_v */
// const vKeyins
/*64----------------------------------------------------------*/

export const Keyins_0: Keyins = {
  // "test": /* deno-fmt-ignore */ [
  //   [["q","Q"],["w","W"]],
  //   // [["s","S"]],
  //   [["z","Z"]],
  //   [[","]],
  // ],
  "ABC": /* deno-fmt-ignore */ [
    [["q","Q"],["w","W"],["e","E"],["r","R"],["t","T"],["y","Y"],["u","U"],["i","I"],["o","O"],["p","P"]],
    [["a","A"],["s","S"],["d","D"],["f","F"],["g","G"],["h","H"],["j","J"],["k","K"],["l","L"]],
    [[[Key.Shift],2],["z","Z"],["x","X"],["c","C"],["v","V"],["b","B"],["n","N"],["m","M"],[[Key.Backspace],2]],
    [[["?123"],2],[[Key.Control],2],[","],[[" "],3],["."],["Arrows"],[Key.Enter]],
  ],
  "?123": /* deno-fmt-ignore */ [
    [["1"],["2"],["3"],["4"],["5"],["6"],["7"],["8"],["9"],["0"]],
    [["@"],["#"],["$"],["_"],["&"],["-"],["+"],["("],[")"],["/"]],
    [[["אבג"],2],["*"],["\""],["'"],[":"],[";"],["?"],[[Key.Backspace],2]],
    [[["ABC"],2],[","],[[" "],4],["."],["Arrows"],[[Key.Enter],2]],
  ],
  "Arrows": /* deno-fmt-ignore */ [
    [[[Key.Home],2],[Key.ArrowUp],[[Key.End],2]],
    [[["ABC"],2],[Key.ArrowLeft],[Key.ArrowRight],[["?123"],2]],
    [[[Key.Shift],2],[Key.ArrowDown],[[Key.Control],2]],
  ],
  "אבג": /* deno-fmt-ignore */ [
    [["'","W"],["ק","E"],["ר","R"],["א","T"],["ט","Y"],["ו","U"],["ן","I"],["ם","O"],["פ","P"]],
    [["ש","A"],["ד","S"],["ג","D"],["כ","F"],["ע","G"],["י","H"],["ח","J"],["ל","K"],["ך","L"],["ף",":"]],
    [[Key.Shift],["ז","Z"],["ס","X"],["ב","C"],["ה","V"],["נ","B"],["מ","N"],["צ","M"],["ת",">"],["ץ","<"],[Key.Backspace]],
    [[["?123"],2],[[Key.Control],2],[","],[[" "],3],["."],["Arrows"],[Key.Enter]],
  ],
};

/** For development only */
export const Keyins_1: Keyins = {
  "ABC": /* deno-fmt-ignore */ [ 
    [["z","Z"],["x","X"],["c","C"],["v","V"]],
    [[[Key.ArrowLeft],2],[[Key.ArrowRight],1]],
    [[[Key.Shift],2],[[Key.Control],2]],
  ],
  "עבר": /* deno-fmt-ignore */ [ 
    [["ע"],["ב"],["ר"],["י"],["ת"]],
    [[Key.Alt],[Key.Control],[Key.Meta]],
    [["ABC"]],
  ],
};
/*80--------------------------------------------------------------------------*/
