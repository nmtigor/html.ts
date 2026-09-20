/** 80**************************************************************************
 * @module lib/compiling/html/HTMLLexr_test
 * @license MIT
 ******************************************************************************/

import * as Is from "@fe-lib/util/is.ts";
import { g_count } from "@fe-lib/util/performance.ts";
import { assertEquals } from "@std/assert";
import { after, afterEach, describe, it } from "@std/testing/bdd";
import type { TestO } from "../_test.ts";
import { ran, repl, rv, test_o } from "../_test.ts";
import { Bufr } from "../Bufr.ts";
import { g_loc_fac } from "../Loc.ts";
import { g_ran_fac } from "../RanFac.ts";
import type { ErrRepr, TokenRepr } from "./alias.ts";
import { State } from "./alias.ts";
import { HTMLLexr } from "./HTMLLexr.ts";
import { _sortErrs_ } from "./util.ts";
import { Stnode } from "../Stnode.ts";
/*80--------------------------------------------------------------------------*/

const bufr = new Bufr();
const lexr = HTMLLexr.create(bufr);
Object.assign(test_o, { bufr, lexr } as Partial<TestO>);
Stnode.FilterDepth = 100;

/**
 * @const @param text_x
 * @const @param state_x
 * @const @param lastTagname_x
 */
const init_ = (
  text_x?: string | string[],
  state_x = State.Data,
  lastTagname_x?: string,
) => {
  lexr.reset_Lexr();
  lexr.state_$ = state_x;
  lexr.lastTagname_$ = lastTagname_x;
  bufr.repl_actr.init(lexr);

  if (text_x !== undefined) repl(rv(0, 0), text_x);
};

const fina_ = () => {
  bufr.reset_Bufr();
  lexr.destructor();
};

afterEach(() => {
  fina_();
  assertEquals(g_count.newToken, g_count.oldToken);
  // g_count.newToken = g_count.oldToken = 0;
});

after(() => {
  console.log(`g_count.newLoc: ${g_count.newLoc}`);
  console.log(`g_count.newRan: ${g_count.newRan}`);
  console.log(`g_count.newToken: ${g_count.newToken}`);
  console.log(`g_count.oldToken: ${g_count.oldToken}`);
  console.log(`g_ran_fac: ${g_ran_fac}`);
  console.log(`g_loc_fac: ${g_loc_fac}`);
});

/** @const @param ers_x */
const reprErrs_ = (ers_x: ErrRepr[]): ErrRepr[] =>
  _sortErrs_(ers_x).map((er_y) => (delete er_y.ts, er_y));
/*64----------------------------------------------------------*/

/* [html5lib-tests/tokenizer/](https://github.com/html5lib/html5lib-tests/tree/master/tokenizer) */
describe("Tokenizer", () => {
  type Test = {
    description: string;
    doubleEscaped?: boolean;
    initialStates?: State[];
    lastStartTag?: string;
    input: string;
    output: TokenRepr[];
    errors?: ErrRepr[];
  };
  type Tests = { tests: Test[] };

  /**
   * @const @param t_x
   * @const @param is_x initial State
   */
  const test_it = (t_x: Test, is_x?: State): void => {
    it(t_x.description, () => {
      if (t_x.doubleEscaped) {
        /** pattern */
        const p_ = /\\u([0-9A-Fa-f]{4})/g;
        /** replacement */
        const r_ = (_: unknown, grp: string) =>
          String.fromCharCode(parseInt(grp, 16));
        t_x.input = t_x.input.replaceAll(p_, r_);
        for (const tr of t_x.output) {
          for (let i = 0; i < tr.length; i++) {
            if (Is.string(tr[i])) {
              tr[i] = (tr[i] as string).replaceAll(p_, r_);
            }
          }
        }
      }

      init_(t_x.input, is_x, t_x.lastStartTag);
      assertEquals(lexr._repr_, t_x.output);
      if (t_x.errors?.length) {
        assertEquals(reprErrs_(lexr._err_), t_x.errors);
      }
    });
  };

  for (
    const testfile of [
      "testdata/tokenizer/contentModelFlags_changed.test",
      "testdata/tokenizer/domjs_changed.test",
      "testdata/tokenizer/entities.test",
      "testdata/tokenizer/escapeFlag.test",
      "testdata/tokenizer/namedEntities.test",
      "testdata/tokenizer/numericEntities.test",
      "testdata/tokenizer/pendingSpecChanges.test",
      "testdata/tokenizer/test1.test",
      "testdata/tokenizer/test2_changed.test",
      "testdata/tokenizer/test3_changed.test",
      "testdata/tokenizer/test4_changed.test",
      "testdata/tokenizer/unicodeChars.test",
      "testdata/tokenizer/unicodeCharsProblematic.test",
      //
      // "testdata/tokenizer/test.jsonc",
    ]
  ) {
    describe(testfile, () => {
      const tests_jo: Tests = JSON.parse(
        Deno.readTextFileSync(`${import.meta.dirname}/${testfile}`),
      );
      for (const test of tests_jo.tests) {
        if (test.initialStates) {
          for (const is of test.initialStates) {
            // if (is === State.RAWTEXT) test_it(test, is);
            test_it(test, is);
          }
        } else {
          test_it(test);
        }
      }
    });
  }
});
/*64----------------------------------------------------------*/

describe("Compiling in body", () => {
  it("Start p-like tag", () => {
    init_("<!DOCTYPE html><p>abc");
    assertEquals(lexr.isErr, false);
    assertEquals(lexr._pazr_.isErr, false);
    assertEquals(lexr._pazr_._root_?._toHTML_(), [
      "| <!DOCTYPE html>",
      "| <html>",
      "|   <head>",
      "|   <body>",
      "|     <p>",
      '|       "abc"',
    ]);

    repl(ran(0).rv, "d");
    /*
    <!DOCTYPE html><p>abcd
    */
    assertEquals(lexr.isErr, false);
    assertEquals(lexr._pazr_.isErr, false);
    assertEquals(lexr._pazr_._root_?._toHTML_(), [
      "| <!DOCTYPE html>",
      "| <html>",
      "|   <head>",
      "|   <body>",
      "|     <p>",
      '|       "abcd"',
    ]);
  });
});
/*80--------------------------------------------------------------------------*/
