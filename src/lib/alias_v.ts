/** 80**************************************************************************
 * @module lib/alias_v
 * @license MIT
 ******************************************************************************/

import * as v from "@valibot/valibot";
import type {
  int16,
  int32,
  int64,
  int8,
  uint,
  uint16,
  uint32,
  uint8,
} from "./alias.ts";
/*80--------------------------------------------------------------------------*/
/* jslang */

//#region Brand<>
/* Ref. [5 Things They’ll NEVER Add To TypeScript](https://youtu.be/Zsj1UlCsuio?t=267) */

//jjjj TOCLEANUP
// export type Brand<T, TBrand> = T & { [$brand]: TBrand };
export type Brand<T, TBrand extends v.BrandName> = T & v.Brand<TBrand>;
//#endregion
/*64----------------------------------------------------------*/

//jjjj TOCLEANUP
// /* Not `declare const $brand: unique symbol` because it's used in `v.object()`. */
// export const $brand = Symbol("$brand");
// export const $brand_int64 = Symbol("$brand_int64");
// export const $brand_int32 = Symbol("$brand_int32");
// export const $brand_id = Symbol("$brand_id");

export const vint = v.pipe(v.number(), v.integer());
// export type int = v.InferInput<typeof vint>;
// export type uint = Brand_int{"uint">;
export const vuint = v.pipe(vint, v.minValue(0));

export type Int64 = Brand<int64, "Int64">;
const vInt64 = v.pipe(vint, v.brand("Int64"));
//jjjj TOCLEANUP
// export type Brand_Int64<TBrand> = Int64 & { [$brand_int64]: TBrand };
export type Brand_Int64<TBrand extends v.BrandName> = Int64 & v.Brand<TBrand>;
export type Int32 = Brand<int32, "Int32">;
//jjjj TOCLEANUP
// export type Brand_Int32<TBrand> = Int32 & { [$brand_int32]: TBrand };
export type Brand_Int32<TBrand extends v.BrandName> = Int32 & v.Brand<TBrand>;
export type Int16 = Brand<int16, "Int16">;
export type Int8 = Brand<int8, "Int8">;
export type UInt32 = Brand<uint32, "UInt32">;
export type UInt16 = Brand<uint16, "UInt16">;
export const vUInt16 = v.pipe(
  vuint,
  v.maxValue(2 ** 16 - 1),
  v.brand("UInt16"),
);
export const vuint8 = v.pipe(vuint, v.maxValue(2 ** 8 - 1));
export type UInt8 = Brand<uint8, "UInt8">;

export const vunum = v.pipe(v.number(), v.minValue(0));
/*49-------------------------------------------*/

export const vid_t = v.pipe(vuint);
/** 0 is special */
/* "Invalid type: Expected Object but received 16" */
// const $brand_ = Symbol("$brand_");
// export type Id_t = uint & { [$brand_]: "Id_t" };
// export const vId_t = v.intersect([
//   vuint,
//   v.object({ [$brand_]: v.literal("Id_t") }),
// ]);
// console.log(v.safeParse(vId_t, 16));
/* ~ */
export type Id_t = Brand<uint, "Id_t">;
export const vId_t = v.pipe(vuint, v.brand("Id_t"));
//jjjj TOCLEANUP
// export type Brand_id<TBrand> = Id_t & { [$brand_id]: TBrand };
export type Brand_id<TBrand extends v.BrandName> = Id_t & v.Brand<TBrand>;

export const vts_t = v.pipe(vint);
/** Type of unix timestamp */
export type Ts_t = Brand_Int64<"Ts_t">;
export const vTs_t = v.pipe(vInt64, v.brand("Ts_t"));

export const vRatio = v.pipe(v.number(), v.finite());
/*64----------------------------------------------------------*/
/* string */

/** Type of each element of `[..."(😄)"]` */
export type Chr = Brand<string, "Chr">;
/*49-------------------------------------------*/

export type ULID = Brand<string, "ULID">;
export const vULID = v.pipe(v.string(), v.ulid(), v.brand("ULID"));
/*80--------------------------------------------------------------------------*/
/* fe */

export const vBufrDir = v.picklist(["ltr", "rtl"]);

// export const vWritingMode = v.enum(WritingMode);
export const vWritingMode = v.picklist(["htb", "vrl", "vlr"]);
/*64----------------------------------------------------------*/

// export const vToolbarSide = v.enum(ToolbarSide);
export const vToolbarSide = v.picklist(/* deno-fmt-ignore */ [
  "top_left", "top_rigt",
  "bot_left", "bot_rigt",
  "left_top",
  "rigt_top",
]);
/*80--------------------------------------------------------------------------*/
