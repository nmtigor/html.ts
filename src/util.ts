/** 80**************************************************************************
 * @module util
 * @license MIT
 ******************************************************************************/

export {};
/*80--------------------------------------------------------------------------*/

export const ClickExtent = 2;
/**
 * @const @param x
 * @const @param y
 * @const @param x_0
 * @const @param y_0
 * @const @param extent_x
 */
export function isClick(
  x: number,
  y: number,
  x_0: number,
  y_0: number,
  extent_x = ClickExtent,
): boolean {
  // console.log({ x, y, x_0, y_0 });
  return Math.abs(x_0 - x) <= extent_x &&
    Math.abs(y_0 - y) <= extent_x;
}
/*64----------------------------------------------------------*/

/** in milliseconds */
export const HoldDuration = 1_000;
/*64----------------------------------------------------------*/

/** in milliseconds */
export const SpeedGran = 200;

export const SwipeValve = .08;
export type SwipeData = {
  ts_1: number;
  val_1: number;
  ts_2: number;
  val_2: number;
};
export const enum Swipe {
  dn = 1,
  up = -1,
  no = 0,
}
export function isSwipe(_x: SwipeData): Swipe {
  const speed = _x.ts_2 <= _x.ts_1
    ? 0
    : (_x.val_2 - _x.val_1) / (_x.ts_2 - _x.ts_1);
  return Math.abs(speed) <= SwipeValve
    ? Swipe.no
    : speed > 0
    ? Swipe.dn
    : Swipe.up;
}
/*80--------------------------------------------------------------------------*/
