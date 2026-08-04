import { useCallback } from 'react';
import { fixPrecision as fixPrecisionLib } from '@/lib/calculator/fixPrecision';
import {
  toFixedBanker,
  cleanNumber as cleanNumberLib,
  formatNumberWithSeparators as formatNumberWithSeparatorsLib,
  toArabicNumerals,
  toJapaneseNumerals,
  toKoreanNumerals,
  NUMBER_FORMATS,
  getTraditionalConfig,
  formatFtIn as formatFtInLib,
} from '@/lib/formatting';
import { parseNumberWithFormat as parseNumberWithSpecificFormat } from '@/lib/parsing/parseNumber';
import type { NumberFormat } from '@/lib/units/numberFormat';
import { parseDMS as parseDMSLib } from '@/lib/parsing/parseDMS';
import { parseFtIn as parseFtInLib } from '@/lib/parsing/parseFtIn';
import { UI_TRANSLATIONS } from '@/lib/translateUi';
import { UNIT_NAME_TRANSLATIONS } from '@/lib/translateUnit';
import type { SupportedLanguage } from '@/lib/localization';
import { CATEGORY_DIMENSIONS } from '@/lib/units/categoryDimensions';
import { getDimensionSignature } from '@/lib/units/getDimensionSignature';
import { generateSIRepresentations as generateSIRepresentationsLib } from '@/lib/si-representations/generateSIRepresentations';
import { PREFERRED_REPRESENTATIONS } from '@/lib/units/preferredRepresentations';
import type { UnitCategory } from '@/lib/units/unitCategory';
import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import type { SIRepresentation } from '@/lib/si-representations/generateSIRepresentations';

// EXCEPTION [architecture-standards §3.2]: type-and-function co-location.
// The hook's return type is co-located with its factory.
export interface UseLocaleHelpersReturn {
  t: (key: string) => string;
  translateUnitName: (unitName: string) => string;
  getCategoryDimensions: (category: UnitCategory) => { [key: string]: number };
  generateSIRepresentations: (dimensions: DimensionalFormula, sourceCategory?: string) => SIRepresentation[];
  parseNumberWithFormat: (str: string) => number;
  cleanNumber: (num: number, p: number) => string;
  formatNumberWithSeparators: (num: number, precisionValue: number) => string;
  formatForClipboard: (num: number, precisionValue: number) => string;
  formatResultValue: (num: number, precisionValue: number) => string;
  formatFactor: (f: number) => string;
  formatDMS: (decimal: number) => string;
  formatFtIn: (decimalFeet: number) => string;
  parseDMS: (dms: string) => number;
  parseFtIn: (ftIn: string) => number;
}

/**
 * Locale-dependent helper surface for the converter controller.
 *
 * Provides translators (t, translateUnitName), locale-aware
 * formatters (cleanNumber, formatNumberWithSeparators,
 * formatForClipboard, formatResultValue, formatFactor, formatDMS,
 * formatFtIn), locale-aware parsers (parseNumberWithFormat,
 * parseDMS, parseFtIn), and dimensional metadata lookups
 * (getCategoryDimensions, generateSIRepresentations).
 *
 * Everything here depends only on numberFormat, language, and
 * precision (plus per-call inputs) — no component state, no dispatch,
 * no refs. That's the actual domain: helpers whose behavior is
 * determined by the locale-and-precision triple.
 *
 * The hook still owns useCallback wrappers for referential stability;
 * memoized effects downstream depend on these identities not changing
 * across renders where the deps haven't changed.
 */
export function useLocaleHelpers(
  numberFormat: NumberFormat,
  language: SupportedLanguage,
  precision: number,
): UseLocaleHelpersReturn {
  const t = useCallback((key: string): string => {
    const val = UI_TRANSLATIONS[language]?.[key] ?? UNIT_NAME_TRANSLATIONS[language]?.[key];
    if (val !== undefined) return val;
    return UI_TRANSLATIONS['en']?.[key] ?? UNIT_NAME_TRANSLATIONS['en']?.[key] ?? key;
  }, [language]);

  const translateUnitName = useCallback((unitName: string): string => t(unitName), [t]);

  const getCategoryDimensions = useCallback((category: UnitCategory): { [key: string]: number } => {
    return (CATEGORY_DIMENSIONS[category]?.dimensions ?? {}) as { [key: string]: number };
  }, []);

  const generateSIRepresentations = useCallback(
    (dimensions: DimensionalFormula, sourceCategory?: string): SIRepresentation[] =>
      generateSIRepresentationsLib(dimensions, getDimensionSignature, PREFERRED_REPRESENTATIONS, sourceCategory),
    [],
  );

  const parseNumberWithFormat = useCallback(
    (str: string): number => parseNumberWithSpecificFormat(str, numberFormat),
    [numberFormat],
  );

  // Council-06: delegate to lib/formatting. The controller-local
  // implementations were byte-for-byte equivalent except for a
  // redundant fixed===0 short-circuit that produced the same output
  // as the general path.
  const cleanNumber = useCallback(
    (num: number, p: number): string => cleanNumberLib(num, p),
    [],
  );

  const formatNumberWithSeparators = useCallback(
    (num: number, precisionValue: number): string => formatBigOrExp({
      num,
      precisionValue,
      numberFormat,
      language,
    }),
    [numberFormat, language],
  );

  const formatForClipboard = useCallback(
    (num: number, precisionValue: number): string => formatClipboard({
      num,
      precisionValue,
      numberFormat,
      language,
    }),
    [numberFormat, language],
  );

  const formatResultValue = useCallback(
    (num: number, precisionValue: number): string => formatResult({
      num,
      precisionValue,
      numberFormat,
      language,
      inner: formatNumberWithSeparators,
    }),
    [numberFormat, language, formatNumberWithSeparators],
  );

  const formatFactor = useCallback(
    (f: number): string => formatFactorImpl({
      f,
      numberFormat,
      language,
      inner: formatNumberWithSeparators,
    }),
    [numberFormat, language, formatNumberWithSeparators],
  );

  const formatDMS = useCallback(
    (decimal: number): string => formatDMSImpl(decimal, precision),
    [precision],
  );

  const formatFtIn = useCallback(
    (decimalFeet: number): string => formatFtInLib(decimalFeet, precision),
    [precision],
  );

  const parseDMS = useCallback(
    (dms: string): number => parseDMSLib(dms, numberFormat),
    [numberFormat],
  );

  const parseFtIn = useCallback(
    (ftIn: string): number => parseFtInLib(ftIn, numberFormat),
    [numberFormat],
  );

  return {
    t, translateUnitName,
    getCategoryDimensions, generateSIRepresentations,
    parseNumberWithFormat,
    cleanNumber, formatNumberWithSeparators,
    formatForClipboard, formatResultValue, formatFactor,
    formatDMS, formatFtIn,
    parseDMS, parseFtIn,
  };
}

// ─── Local pure helpers (extracted so each useCallback body stays ≤20 lines) ───

// Format a number with locale separators, escaping to scientific
// notation for extreme magnitudes (the lib's formatter otherwise
// keeps the fixed representation).
function formatBigOrExp(i: {
  num: number;
  precisionValue: number;
  numberFormat: NumberFormat;
  language: SupportedLanguage;
}): string {
  const fixed = fixPrecisionLib(i.num);
  const absNum = Math.abs(fixed);
  if (absNum !== 0) {
    const fmt = resolveFormat(i.numberFormat, i.language);
    const asExp = expIfExtreme(fixed, absNum, i.precisionValue, fmt);
    if (asExp !== null) return asExp;
  }
  return formatNumberWithSeparatorsLib(fixed, i.precisionValue, i.numberFormat, i.language);
}

// Clipboard formatting: never uses group separators; escapes to
// scientific notation the same way as formatBigOrExp; boosts
// precision for sub-1 magnitudes so significant digits survive.
function formatClipboard(i: {
  num: number;
  precisionValue: number;
  numberFormat: NumberFormat;
  language: SupportedLanguage;
}): string {
  const fmt = resolveFormat(i.numberFormat, i.language);
  const fixed = fixPrecisionLib(i.num);
  if (fixed === 0) return fmt.useArabicNumerals ? '٠' : '0';
  const absNum = Math.abs(fixed);
  const asExp = expIfExtreme(fixed, absNum, i.precisionValue, fmt);
  if (asExp !== null) return asExp;
  const ep = boostPrecisionForSmall(absNum, i.precisionValue);
  const formatted = toFixedBanker(fixed, ep);
  const cleaned = formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
  return fmt.decimal !== '.' ? cleaned.replace('.', fmt.decimal) : cleaned;
}

// Result display: same escape rules as clipboard, but delegates to
// the passed-in formatter (which applies group separators). Handles
// traditional-script zero (Korean, Japanese) specially.
function formatResult(i: {
  num: number;
  precisionValue: number;
  numberFormat: NumberFormat;
  language: SupportedLanguage;
  inner: (num: number, precisionValue: number) => string;
}): string {
  const fmt = resolveFormat(i.numberFormat, i.language);
  if (i.num === 0) return formatZero(fmt);
  const absNum = Math.abs(i.num);
  const asExp = expIfExtreme(i.num, absNum, i.precisionValue, fmt);
  if (asExp !== null) return asExp;
  const ep = boostPrecisionForSmall(absNum, i.precisionValue);
  return i.inner(i.num, ep);
}

// Return the resolved NUMBER_FORMATS entry (or the language-specific
// traditional variant when numberFormat === 'traditional').
function resolveFormat(nf: NumberFormat, lang: SupportedLanguage) {
  return nf === 'traditional' ? getTraditionalConfig(lang) : NUMBER_FORMATS[nf];
}

// Zero, formatted for the display: traditional scripts get their own
// glyph; Arabic-numeral locales get ٠; everyone else gets '0'.
function formatZero(fmt: ReturnType<typeof resolveFormat>): string {
  if (fmt.traditionalScript) {
    const toNumerals = fmt.traditionalScript === 'ko' ? toKoreanNumerals : toJapaneseNumerals;
    return toNumerals('0');
  }
  return fmt.useArabicNumerals ? '٠' : '0';
}

// Return an exponential string if |num| is extreme (<1e-12 or >=1e15),
// null otherwise. Matches the escape-hatch in formatBigOrExp/formatClipboard/
// formatResult so all three use identical thresholds.
function expIfExtreme(
  num: number,
  absNum: number,
  precisionValue: number,
  fmt: ReturnType<typeof resolveFormat>,
): string | null {
  if (absNum < 1e-12 || absNum >= 1e15) {
    const expStr = num.toExponential(Math.min(precisionValue, 10));
    return fmt.useArabicNumerals ? toArabicNumerals(expStr) : expStr;
  }
  return null;
}

// Factor display: prefixed with '×', clamped precision, escapes to
// scientific for large/small factors.
function formatFactorImpl(i: {
  f: number;
  numberFormat: NumberFormat;
  language: SupportedLanguage;
  inner: (num: number, precisionValue: number) => string;
}): string {
  const fmt = resolveFormat(i.numberFormat, i.language);
  if (i.f === 1) return fmt.useArabicNumerals ? '١' : '1';
  if (i.f >= 1e9 || i.f <= 1e-8) {
    const expStr = i.f.toExponential(7);
    return fmt.useArabicNumerals ? `×${toArabicNumerals(expStr)}` : `×${expStr}`;
  }
  const n = parseFloat(i.f.toPrecision(9));
  return `×${i.inner(n, 8)}`;
}

// DMS format: decimal degrees → "sign d:mm:ss.fraction".
function formatDMSImpl(decimal: number, precision: number): string {
  const d = Math.floor(Math.abs(decimal));
  const mFloat = (Math.abs(decimal) - d) * 60;
  const m = Math.floor(mFloat);
  const s = (mFloat - m) * 60;
  const sign = decimal < 0 ? '-' : '';
  const sFixed = toFixedBanker(s, precision);
  const [sInt, sDec] = sFixed.split('.');
  const sDisplay = `${sInt.padStart(2, '0')}${sDec ? '.' + sDec : ''}`;
  return `${sign}${d}:${m.toString().padStart(2, '0')}:${sDisplay}`;
}

// For sub-1 magnitudes, boost the effective precision by the
// negative-log10 of |num| so significant digits survive rounding.
function boostPrecisionForSmall(absNum: number, precisionValue: number): number {
  if (absNum >= 1 || absNum === 0) return precisionValue;
  const magnitude = Math.floor(Math.log10(absNum));
  return Math.min(Math.abs(magnitude) + precisionValue, 12);
}
