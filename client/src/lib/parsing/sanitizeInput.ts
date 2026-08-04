import { NUMBER_FORMATS, toArabicNumerals } from '../formatting';
import type { NumberFormat } from '../formatting';

/**
 * Council-08d: sanitize a user-typed conversion-input string.
 *
 * Strips characters that are not part of the allowed input alphabet for
 * the given number format. When isCompound is true (deg_dms or ft_in
 * modes), the alphabet includes ':', "'" and '"' but not scientific-
 * notation characters. When false, it includes exponential 'eE+' but
 * not the compound separators.
 *
 * Arabic-Indic numeral formats are re-normalized to their canonical
 * Arabic-Indic digits after filtering.
 */
export function sanitizeInput(input: {
  value: string;
  format: NumberFormat;
  isCompound: boolean;
}): string {
  const fmt = NUMBER_FORMATS[input.format];
  const decimalSep = fmt.decimal === '.' ? '\\.' : fmt.decimal === "'" ? "\\'" : fmt.decimal;
  const thousandsSep = fmt.thousands ? (fmt.thousands === ' ' ? '\\s' : fmt.thousands === "'" ? "\\'" : fmt.thousands) : '';
  const isArabicFormat = fmt.useArabicNumerals ?? false;
  const digitPattern = isArabicFormat ? '0-9٠-٩' : '0-9';
  const extra = input.isCompound ? `:\\-${decimalSep}${thousandsSep}'"` : `\\-${decimalSep}${thousandsSep}eE\\+`;
  const pattern = new RegExp(`[^${digitPattern}${extra}]`, 'g');
  const filtered = input.value.replace(pattern, '');
  return isArabicFormat ? toArabicNumerals(filtered) : filtered;
}
