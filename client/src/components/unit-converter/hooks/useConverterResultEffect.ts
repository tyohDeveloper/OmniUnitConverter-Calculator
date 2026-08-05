import { useEffect } from 'react';
import type { UnitCategory } from '@/lib/units/unitCategory';
import { computeConversion } from '@/lib/calculator/computeConversion';

interface UseConverterResultEffectArgs {
  inputValue: string;
  fromUnit: string;
  toUnit: string;
  activeCategory: UnitCategory;
  fromPrefix: string;
  toPrefix: string;
  numberFormat: string;
  parseNumberWithFormat: (s: string) => number;
  parseDMS: (s: string) => number;
  parseFtIn: (s: string) => number;
  setResult: (v: number | null) => void;
}

function parseInput(
  inputValue: string, fromUnit: string,
  parseNumberWithFormat: (s: string) => number,
  parseDMS: (s: string) => number,
  parseFtIn: (s: string) => number,
): number {
  if (fromUnit === 'deg_dms') return parseDMS(inputValue);
  if (fromUnit === 'ft_in') return parseFtIn(inputValue);
  return parseNumberWithFormat(inputValue);
}

/**
 * Runs the conversion whenever input, units, prefixes, or category
 * change. Sets result to null when input is empty/invalid; otherwise
 * parses (respecting compound formats) and delegates to
 * computeConversion.
 *
 * The eslint-disable is necessary: parseDMS/parseFtIn/parseNumberWith
 * Format are referentially unstable across numberFormat changes, so
 * the dep array intentionally uses numberFormat as the trigger and
 * omits the parsers.
 */
export function useConverterResultEffect(args: UseConverterResultEffectArgs): void {
  const { inputValue, fromUnit, toUnit, activeCategory, fromPrefix, toPrefix,
          numberFormat, parseNumberWithFormat, parseDMS, parseFtIn, setResult } = args;

  useEffect(() => {
    if (!inputValue || !fromUnit || !toUnit) { setResult(null); return; }
    const val = parseInput(inputValue, fromUnit, parseNumberWithFormat, parseDMS, parseFtIn);
    if (isNaN(val)) { setResult(null); return; }
    setResult(computeConversion({
      value: val, fromUnit, toUnit, activeCategory, fromPrefix, toPrefix,
    }));
  }, [inputValue, fromUnit, toUnit, activeCategory, fromPrefix, toPrefix, numberFormat]); // eslint-disable-line react-hooks/exhaustive-deps
}
