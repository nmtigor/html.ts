/** 80**************************************************************************
 * @module lib/compiling/html/HTMLPazr_test
 * @license MIT
 ******************************************************************************/

import { unescapeString } from "@fe-lib/util/string.ts";
import { g_count } from "@fe-lib/util/performance.ts";
import { assertEquals } from "@std/assert";
import { after, afterEach, describe, it } from "@std/testing/bdd";
import { fail } from "../../util.ts";
import { linesOf } from "../../util/string.ts";
import type { TestO } from "../_test.ts";
import { repl, rv, test_o } from "../_test.ts";
import { Bufr } from "../Bufr.ts";
import { g_loc_fac } from "../Loc.ts";
import { g_ran_fac } from "../RanFac.ts";
import type { ErrRepr } from "./alias.ts";
import { HTMLLexr } from "./HTMLLexr.ts";
import { _sortErrs_ } from "./util.ts";
/*80--------------------------------------------------------------------------*/

const bufr = new Bufr();
const lexr = HTMLLexr.create(bufr);
Object.assign(test_o, { bufr, lexr } as Partial<TestO>);

/**
 * @const @param text_x
 * @const @param state_x
 * @const @param lastTagname_x
 */
const init_ = (text_x?: string | string[]) => {
  lexr.reset_Lexr();
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
});

after(() => {
  console.log(`g_count.newLoc: ${g_count.newLoc}`);
  console.log(`g_count.newRan: ${g_count.newRan}`);
  console.log(`g_count.newToken: ${g_count.newToken}`);
  console.log(`g_count.oldToken: ${g_count.oldToken}`);
  console.log(`g_ran_fac: ${g_ran_fac}`);
  console.log(`g_loc_fac: ${g_loc_fac}`);
});
/*64----------------------------------------------------------*/

/* [html5lib-tests/tree-construction/](https://github.com/html5lib/html5lib-tests/tree/master/tree-construction) */
describe("Tree-construction", () => {
  type Test = {
    data: string[];
    sn_errors: string[];
    tk_errors?: string[];
    fragment?: string[];
    script?: boolean;
    document: string[];
  };

  /** @const @param ers_x */
  const reprSnErrs_ = (ers_x: ErrRepr[]): string[] =>
    _sortErrs_(ers_x)
      .map((er_y) => `(${er_y.line ?? -1},${er_y.col ?? -1}): ${er_y.code}`);
  /** @const @param ers_x */
  const reprTkErrs_ = (ers_x: ErrRepr[]): string[] =>
    _sortErrs_(ers_x)
      .map((er_y) => `(${er_y.line ?? -1}:${er_y.col ?? -1}) ${er_y.code}`);

  /** @const @param t_x */
  const test_it = (t_x: Test): void => {
    it(t_x.data.join("\\n"), () => {
      // console.log(t_x);
      init_(t_x.data.join("\n"));
      assertEquals(reprSnErrs_(lexr._pazr_._err_), t_x.sn_errors);
      assertEquals(reprTkErrs_(lexr._err_), t_x.tk_errors ?? []);
      assertEquals(lexr._pazr_._root_?._toHTML_(), t_x.document);
    });
  };

  for (
    const testfile of [
      "testdata/tree-construction/adoption01_changed.dat",
      "testdata/tree-construction/adoption02_changed.dat",
      "testdata/tree-construction/blocks_changed.dat",
      "testdata/tree-construction/comments01_changed.dat",
      "testdata/tree-construction/doctype01_changed.dat",
      "testdata/tree-construction/domjs-unsafe_changed.dat",
      "testdata/tree-construction/entities01_changed.dat",
      "testdata/tree-construction/entities02_changed.dat",
      "testdata/tree-construction/html5test-com_changed.dat",
      "testdata/tree-construction/inbody01.dat",
      "testdata/tree-construction/isindex.dat",
      "testdata/tree-construction/main-element_changed.dat",
      "testdata/tree-construction/menuitem-element_changed.dat",
      "testdata/tree-construction/namespace-sensitivity_changed.dat",
      "testdata/tree-construction/noscript01_changed.dat",
      "testdata/tree-construction/pending-spec-changes_changed.dat",
      "testdata/tree-construction/processing-instructions_changed.dat",
      "testdata/tree-construction/ruby_changed.dat",
      "testdata/tree-construction/scriptdata01_changed.dat",
      "testdata/tree-construction/search-element_changed.dat",
      "testdata/tree-construction/tables01_changed.dat",
      "testdata/tree-construction/template_changed.dat",
      "testdata/tree-construction/tests1_changed.dat",
      "testdata/tree-construction/tests2_changed.dat",
      "testdata/tree-construction/tests3_changed.dat",
      "testdata/tree-construction/tests5_changed.dat",
      "testdata/tree-construction/tests6_changed.dat",
      "testdata/tree-construction/tests7_changed.dat",
      "testdata/tree-construction/tests8_changed.dat",
      "testdata/tree-construction/tests9_changed.dat",
      "testdata/tree-construction/tests10_changed.dat",
      "testdata/tree-construction/tests11.dat",
      "testdata/tree-construction/tests12.dat",
      "testdata/tree-construction/tests14.dat",
      "testdata/tree-construction/tests15_changed.dat",
      "testdata/tree-construction/tests16_changed.dat",
      "testdata/tree-construction/tests17_changed.dat",
      "testdata/tree-construction/tests18_changed.dat",
      "testdata/tree-construction/tests19_changed.dat",
      "testdata/tree-construction/tests20_changed.dat",
      "testdata/tree-construction/tests21_changed.dat",
      "testdata/tree-construction/tests22_changed.dat",
      "testdata/tree-construction/tests23_changed.dat",
      "testdata/tree-construction/tests24.dat",
      "testdata/tree-construction/tests25_changed.dat",
      "testdata/tree-construction/tests26_changed.dat",
      "testdata/tree-construction/tricky01_changed.dat",
      "testdata/tree-construction/void-in-phrasing.dat",
      "testdata/tree-construction/webkit01_changed.dat",
      "testdata/tree-construction/webkit02_changed.dat",
      //
      // "testdata/tree-construction/test.dat",
      //
    ]
  ) {
    describe(testfile, () => {
      const tests: Test[] = [];

      let test: Partial<Test> | undefined;
      let ln_a: string[] | undefined;
      let hashLn: string | undefined;
      for (
        let ln of linesOf(
          Deno.readTextFileSync(`${import.meta.dirname}/${testfile}`),
        )
      ) {
        if (ln.startsWith("#")) {
          hashLn = ln;
          test ??= {};
          switch (ln) {
            case "#data":
              ln_a = test.data = [];
              break;
            case "#errors":
              ln_a = test.sn_errors = [];
              break;
            case "#new-errors":
              ln_a = test.tk_errors = [];
              break;
            case "#document-fragment":
              ln_a = test.fragment = [];
              break;
            case "#script-off":
              test.script = false;
              ln_a = undefined;
              break;
            case "#script-on":
              test.script = true;
              ln_a = undefined;
              break;
            case "#document":
              ln_a = test.document = [];
              break;
            default:
              fail("Unrecognized # name!");
          }
        } else if (ln === "" && test?.document) {
          tests.push(test as Test);
          test = undefined;
          ln_a = undefined;
        } else if (ln_a) {
          if (hashLn === "#data" || hashLn === "#document") {
            ln = unescapeString(ln);
          }
          ln_a.push(ln);
        }
      }
      if (test) tests.push(test as Test);

      for (const test of tests) test_it(test);
    });
  }
});
/*80--------------------------------------------------------------------------*/
