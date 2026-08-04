import { NUMBER_FORMATS, toLatinNumerals } from '../formatting';
import type { NumberFormat } from '../units/numberFormat';

/**
 * Parse a locale-formatted number string into a JS number.
 *
 * Handles three transformations before delegating to parseFloat:
 *   1. Arabic-Indic → Latin numeral conversion (defensive: the caller
 *      may pass a string that already contains latin digits, or one
 *      that came from an Arabic-numeral locale).
 *   2. Thousands-separator removal.
 *   3. Locale-specific decimal separator normalized to '.'.
 *
 * Returns NaN when parseFloat fails (matches parseFloat's behavior;
 * callers should isFinite/isNaN check the result).
 *
 * Was previously exported from lib/formatting.ts. Moved here per §3.7
 * so callers of the parsing domain don't have to reach into the
 * formatting module.
 */
export function parseNumberWithFormat(str: string, formatKey: NumberFormat): number {
  const format = NUMBER_FORMATS[formatKey];
  let cleaned = toLatinNumerals(str);
  if (format.thousands) cleaned = cleaned.split(format.thousands).join('');
  if (format.decimal !== '.') cleaned = cleaned.replace(format.decimal, '.');
  return parseFloat(cleaned);
}
