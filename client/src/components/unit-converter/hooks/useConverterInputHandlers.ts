import { useCallback } from 'react';
import type React from 'react';
import type { NumberFormat } from '@/lib/units/numberFormat';
import type { UnitCategory } from '@/lib/units/unitCategory';
import { sanitizeInput } from '@/lib/parsing/sanitizeInput';
import {
  formatNumberWithFormat as formatNumberWithSpecificFormat,
} from '@/lib/formatting';
import { parseNumberWithFormat as parseNumberWithSpecificFormat } from '@/lib/parsing/parseNumber';
import { CATEGORY_GROUPS } from '@/features/unit-converter/categoryGroups';

interface UseConverterInputHandlersArgs {
  inputValue: string;
  fromUnit: string;
  activeCategory: UnitCategory;
  numberFormat: NumberFormat;
  parseNumberWithFormat: (s: string) => number;
  setInputValue: (v: string) => void;
  setActiveCategory: (v: UnitCategory) => void;
}

const isCompoundUnit = (u: string): boolean => u === 'deg_dms' || u === 'ft_in';

function computePlaceholder(fromUnit: string): string {
  if (fromUnit === 'deg_dms') return 'dd:mm:ss';
  if (fromUnit === 'ft_in') return "ft'in\"";
  return '0';
}

function reformatValue(
  inputValue: string, fromUnit: string,
  oldFormat: NumberFormat, newFormat: NumberFormat,
  setInputValue: (v: string) => void,
): void {
  if (!inputValue || isCompoundUnit(fromUnit)) return;
  const numericValue = parseNumberWithSpecificFormat(inputValue, oldFormat);
  if (!isNaN(numericValue) && isFinite(numericValue)) {
    setInputValue(formatNumberWithSpecificFormat(numericValue, newFormat));
  }
}

function blurReformat(
  inputValue: string, fromUnit: string, numberFormat: NumberFormat,
  parseNumberWithFormat: (s: string) => number,
  setInputValue: (v: string) => void,
): void {
  if (!inputValue || isCompoundUnit(fromUnit)) return;
  const numericValue = parseNumberWithFormat(inputValue);
  if (!isNaN(numericValue) && isFinite(numericValue)) {
    setInputValue(formatNumberWithSpecificFormat(numericValue, numberFormat));
  }
}

function stepCategoryOnArrowKey(
  e: React.KeyboardEvent<HTMLInputElement>,
  activeCategory: UnitCategory,
  setActiveCategory: (v: UnitCategory) => void,
  setInputValue: (v: string) => void,
): void {
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
  e.preventDefault();
  const allCategories = CATEGORY_GROUPS.flatMap(g => g.categories);
  const currentIndex = allCategories.indexOf(activeCategory);
  if (currentIndex === -1) return;
  const newIndex = e.key === 'ArrowUp'
    ? (currentIndex > 0 ? currentIndex - 1 : allCategories.length - 1)
    : (currentIndex < allCategories.length - 1 ? currentIndex + 1 : 0);
  setActiveCategory(allCategories[newIndex] as UnitCategory);
  setInputValue('1');
}

/**
 * Input-domain handlers for the converter's From-field:
 *   - getPlaceholder: shape-hint for compound formats (DMS, ft/in)
 *   - reformatInputValue: reformat on numberFormat pref change
 *   - handleInputChange: sanitize a keystroke
 *   - handleInputBlur: reformat to canonical form on blur
 *   - handleInputKeyDown: arrow-up/down navigate between categories
 *
 * Compound units (deg_dms, ft_in) short-circuit numeric paths since
 * their string form isn't numerically roundtrippable.
 */
export function useConverterInputHandlers(args: UseConverterInputHandlersArgs) {
  const { inputValue, fromUnit, activeCategory, numberFormat,
          parseNumberWithFormat, setInputValue, setActiveCategory } = args;
  const getPlaceholder = useCallback(() => computePlaceholder(fromUnit), [fromUnit]);
  const reformatInputValue = useCallback(
    (o: NumberFormat, n: NumberFormat) => reformatValue(inputValue, fromUnit, o, n, setInputValue),
    [inputValue, fromUnit, setInputValue]);
  const handleInputChange = useCallback((value: string) => {
    setInputValue(sanitizeInput({ value, format: numberFormat, isCompound: isCompoundUnit(fromUnit) }));
  }, [numberFormat, fromUnit, setInputValue]);
  const handleInputBlur = useCallback(
    () => blurReformat(inputValue, fromUnit, numberFormat, parseNumberWithFormat, setInputValue),
    [inputValue, fromUnit, numberFormat, parseNumberWithFormat, setInputValue]);
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => stepCategoryOnArrowKey(e, activeCategory, setActiveCategory, setInputValue),
    [activeCategory, setActiveCategory, setInputValue]);
  return { getPlaceholder, reformatInputValue, handleInputChange, handleInputBlur, handleInputKeyDown };
}
