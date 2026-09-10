/** 80**************************************************************************
 * @module lib/compiling/ReplActr
 * @license MIT
 ******************************************************************************/

import { createActor, setup } from "@xstate";
import { INOUT } from "../../preNs.ts";
import { assert } from "../util.ts";
import type { Bufr } from "./Bufr.ts";
import { Lexr } from "./Lexr.ts";
import { Pazr } from "./Pazr.ts";
import { BufrReplState } from "./alias.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class ReplActr {
  readonly #bufr;
  #lexr: Lexr<any> | undefined;
  #pazr: Pazr<any> | undefined;
  //jjjj TOCLEANUP
  // #tfmr: Tfmr | undefined;

  /* "states" use literal names "idle", "preRepl", ... rather then
  `BufrReplState[BufrReplState.idle]`, ..., because otherwise xstate graph can
  not show correctly.
  Need to manually keep these literal names consistent with `BufrReplState`! */
  readonly #actr = createActor(
    /** @xstate-layout N4IgpgJg5mDOIC5QCUwAcA2BBAxgFwCcA6ASwgzAGIAVAeQAI0CxnMBtABgF1FQ0B7WCTwl+AO14gAHogCMHAExEAHLIUBWAMwLZANg4c9WgDQgAnnIAssorPXLlW2QE5L6gOyaOmgL4-TqJi4hERMLOgYNAywAK4AZqwYnDxIIAJCIuKSMgialhxEmmrqskUKuuXusqYWuRzOhequHLraypaWzhyWfgERwcSxCRFR9EOJAPqQhMmS6cKiEqk57USW7pV5lgqeero1iJ3KRArbssru3mp5O70ggdj4g-GT0wSjZBSzqfOZS6A5AC08l0RHcHXc7n0rU69gOuW0RA4yg47g8TWRmhRuj8-hAYn4EDgkgeAzmggWWWWiGB6ksYIhUJaeWccPMiC0Kk0TU0zl0fI49iqd1JT1I5DA5Iyi2yiA48I0ChF-TFYUSUsp-2kiB0Sna6m6umUXXszmq7IQiuVQTF4wiGr+sstahUbkNxsFHv2FusmhUht0rTsXjNvjxopCdswUwghAdMupCGBNmsO10dhayiK629tV9-ssgaDWnqpVxPiAA */
    setup({
      types: {} as {
        events: {
          type: `TO ${keyof typeof BufrReplState}`;
        };
      },
    }).createMachine({
      id: "ReplActr",
      initial: "idle",
      states: {
        "idle": {
          on: {
            "TO preRepl": {
              actions: () => {
                /*#static*/ if (INOUT) {
                  assert(this.#bufr.oldRan_a_$.at(0));
                }
                this.#lexr?.lexMrk_$(this.#bufr.oldRan_a_$);
                //jjjj TOCLEANUP
                // this.#pazr?.pazMrk_$();
                this.#pazr?.pazPremrk_$();
                //jjjj TOCLEANUP
                // this.#tfmr?.tfmmrk_$(this.#bufr.oldRan_a_$);
              },
              target: "preRepl",
            },
          },
        },
        "preRepl": {
          on: {
            ["TO sufRepl"]: {
              actions: () => {
                /*#static*/ if (INOUT) {
                  assert(this.#bufr.newRan_a_$.at(0));
                }
                this.#lexr
                  ?.lexAdj_$(this.#bufr.newRan_a_$)
                  .lex();
                //jjjj TOCLEANUP
                // this.#pazr?.paz();
                this.#pazr
                  ?.pazMrk_$()
                  .paz();
                //jjjj TOCLEANUP
                // this.#tfmr
                //   ?.tfmadj_$(this.#bufr.newRan_a_$)
                //   .tfm();
              },
              target: "sufRepl",
            },
          },
        },
        "sufRepl": {
          on: {
            ["TO sufRepl_edtr"]: {
              target: "sufRepl_edtr",
            },
          },
        },
        "sufRepl_edtr": {
          on: {
            ["TO idle"]: {
              target: "idle",
            },
          },
        },
      },
    }),
  );

  #inited_ReplActr = false;

  constructor(bufr_x: Bufr) {
    this.#bufr = bufr_x;
  }

  /**
   * @const @param lexr_x
   * @const @param pazr_x
   */
  init(lexr_x?: Lexr<any>, pazr_x?: Pazr<any>) {
    /*#static*/ if (INOUT) {
      assert(!this.#inited_ReplActr);
      assert(!lexr_x || lexr_x.bufr === this.#bufr);
      assert(!pazr_x || lexr_x && pazr_x.lexr === lexr_x);
      //jjjj TOCLEANUP
      // assert(!tfmr_x || tfmr_x.bufr === this.#bufr);
    }
    this.#lexr = lexr_x;
    this.#pazr = pazr_x;
    //jjjj TOCLEANUP
    // this.#tfmr = tfmr_x;

    this.#actr.start();

    this.#inited_ReplActr = true;
  }

  fina() {
    this.#lexr = undefined;
    this.#pazr = undefined;
    //jjjj TOCLEANUP
    // this.#tfmr = undefined;

    this.#actr.stop();

    this.#inited_ReplActr = false;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * If called multiple times with the same `_x`, it will only run once.
   */
  to(_x: BufrReplState) {
    this.#actr.send({
      type: `TO ${BufrReplState[_x] as keyof typeof BufrReplState}`,
    });
    // debugger;
  }
}
/*80--------------------------------------------------------------------------*/
