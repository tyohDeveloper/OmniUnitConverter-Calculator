import { useEffect } from 'react';
import type { UnitCategory } from '@/lib/units/unitCategory';
import { computeConversion } from '@/lib/calculator/computeConversion';
import { computeSymbolicConversion } from '@/lib/calculator/computeSymbolicConversion';
import { CATEGORY_FAMILIES } from '@/lib/units/categoryFamilies';

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
  setSymbolicResult: (v: string | null) => void;
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
function runSymbolicBranch(a: UseConverterResultEffectArgs): void {
  a.setResult(null);
  if (!a.fromUnit || !a.toUnit) { a.setSymbolicResult(null); return; }
  a.setSymbolicResult(computeSymbolicConversion({
    value: a.inputValue, fromUnit: a.fromUnit, toUnit: a.toUnit,
    activeCategory: a.activeCategory,
  }));
}

function runNumericBranch(a: UseConverterResultEffectArgs): void {
  a.setSymbolicResult(null);
  if (!a.inputValue || !a.fromUnit || !a.toUnit) { a.setResult(null); return; }
  const val = parseInput(a.inputValue, a.fromUnit, a.parseNumberWithFormat, a.parseDMS, a.parseFtIn);
  if (isNaN(val)) { a.setResult(null); return; }
  a.setResult(computeConversion({
    value: val, fromUnit: a.fromUnit, toUnit: a.toUnit,
    activeCategory: a.activeCategory, fromPrefix: a.fromPrefix, toPrefix: a.toPrefix,
  }));
}

export function useConverterResultEffect(args: UseConverterResultEffectArgs): void {
  useEffect(() => {
    const family = CATEGORY_FAMILIES[args.activeCategory];
    if (family === 'SYMBOLIC') { runSymbolicBranch(args); return; }
    runNumericBranch(args);
  }, [args.inputValue, args.fromUnit, args.toUnit, args.activeCategory,
      args.fromPrefix, args.toPrefix, args.numberFormat]); // eslint-disable-line react-hooks/exhaustive-deps
}
