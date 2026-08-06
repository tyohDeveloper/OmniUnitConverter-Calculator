import { fixPrecision } from './fixPrecision';
import { toFixedBanker } from '../formatting';

/**
 * Format a number for clipboard/display with two behaviors on top of
 * toFixedBanker:
 *
 *   - increase precision for very small |num| < 1 (up to a cap of 12)
 *     so magnitudes like 1.2e-5 don't collapse to zero at low
 *     user-selected precision
 *   - trim trailing zeros in the fractional part (and the trailing
 *     "." if the number is an integer)
 *
 * Used by the simple-mode field copy handler; matches the previous
 * inline behavior in useCalculatorController exactly.
 */
export function cleanNumber(num: number, precision: number): string {
  const fixed = fixPrecision(num);
  let effectivePrecision = precision;
  const absNum = Math.abs(fixed);
  if (absNum > 0 && absNum < 1) {
    effectivePrecision = Math.min(Math.abs(Math.floor(Math.log10(absNum))) + precision, 12);
  }
  const formatted = toFixedBanker(fixed, effectivePrecision);
  return formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
}
