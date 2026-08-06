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
import { CATEGORY_FAMILIES } from '@/lib/units/categoryFamilies';
import { parseTimeWithZone } from '@/lib/calculator/parseTimeWithZone';
import { defaultInputValueForCategory } from '@/lib/calculator/defaultInputValueForCategory';

interface UseConverterInputHandlersArgs {
  inputValue: string;
  fromUnit: string;
  activeCategory: UnitCategory;
  numberFormat: NumberFormat;
  parseNumberWithFormat: (s: string) => number;
  setInputValue: (v: string) => void;
  setActiveCategory: (v: UnitCategory) => void;
  setFromUnit: (v: string) => void;
}

const isCompoundUnit = (u: string): boolean => u === 'deg_dms' || u === 'ft_in';

function computePlaceholder(fromUnit: string, activeCategory: UnitCategory): string {
  if (CATEGORY_FAMILIES[activeCategory] === 'SYMBOLIC') {
    if (activeCategory === 'timezone') return 'HH:MM (empty = now)';
    return '';
  }
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

// For SYMBOLIC categories, Enter commits by blurring — that triggers
// the blur handler and its parseTimeWithZone dispatch. For numeric
// categories, Enter is left as-is to preserve existing behavior.
function handleEnterKey(e: React.KeyboardEvent<HTMLInputElement>, activeCategory: UnitCategory): boolean {
  if (e.key !== 'Enter') return false;
  if (CATEGORY_FAMILIES[activeCategory] !== 'SYMBOLIC') return false;
  (e.currentTarget as HTMLInputElement).blur();
  return true;
}

function stepCategoryOnArrowKey(
  e: React.KeyboardEvent<HTMLInputElement>,
  activeCategory: UnitCategory,
  setActiveCategory: (v: UnitCategory) => void,
  setInputValue: (v: string) => void,
): void {
  if (handleEnterKey(e, activeCategory)) return;
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
  e.preventDefault();
  const allCategories = CATEGORY_GROUPS.flatMap(g => g.categories);
  const currentIndex = allCategories.indexOf(activeCategory);
  if (currentIndex === -1) return;
  const newIndex = e.key === 'ArrowUp'
    ? (currentIndex > 0 ? currentIndex - 1 : allCategories.length - 1)
    : (currentIndex < allCategories.length - 1 ? currentIndex + 1 : 0);
  const nextCat = allCategories[newIndex] as UnitCategory;
  setActiveCategory(nextCat);
  setInputValue(defaultInputValueForCategory(nextCat));
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
// SYMBOLIC branches skip numeric sanitization / blur reformat /
// number-format reformat pass; extracted so the exported hook body
// stays within the 20-line limit.
function dispatchInputChange(value: string, isSymbolic: boolean, numberFormat: NumberFormat, fromUnit: string, setInputValue: (v: string) => void): void {
  if (isSymbolic) { setInputValue(value); return; }
  setInputValue(sanitizeInput({ value, format: numberFormat, isCompound: isCompoundUnit(fromUnit) }));
}

// On blur for a SYMBOLIC timezone input: run the extended parser to
// pick out a trailing zone tag ('HH:MM UTC' etc.) and update both
// the value field and the from-zone dropdown. If parsing fails, the
// raw input stays as-typed and the from-zone dropdown is unchanged.
// If the zone token is unrecognized, only the value is normalized.
//
// Exported for testability — the tests exercise this function
// directly with stub setters rather than mounting the React tree.
export function dispatchSymbolicBlur(
  activeCategory: UnitCategory,
  inputValue: string,
  setInputValue: (v: string) => void,
  setFromUnit: (v: string) => void,
): void {
  if (activeCategory !== 'timezone') return;
  const parsed = parseTimeWithZone(inputValue);
  if (parsed.time !== null && parsed.time !== inputValue) setInputValue(parsed.time);
  if (parsed.zoneUnitId !== null) setFromUnit(parsed.zoneUnitId);
}

function dispatchInputBlur(isSymbolic: boolean, activeCategory: UnitCategory, inputValue: string, fromUnit: string, numberFormat: NumberFormat, parseNumberWithFormat: (s: string) => number, setInputValue: (v: string) => void, setFromUnit: (v: string) => void): void {
  if (isSymbolic) { dispatchSymbolicBlur(activeCategory, inputValue, setInputValue, setFromUnit); return; }
  blurReformat(inputValue, fromUnit, numberFormat, parseNumberWithFormat, setInputValue);
}

function dispatchReformat(isSymbolic: boolean, inputValue: string, fromUnit: string, o: NumberFormat, n: NumberFormat, setInputValue: (v: string) => void): void {
  if (isSymbolic) return;
  reformatValue(inputValue, fromUnit, o, n, setInputValue);
}

export function useConverterInputHandlers(args: UseConverterInputHandlersArgs) {
  const { inputValue, fromUnit, activeCategory, numberFormat,
          parseNumberWithFormat, setInputValue, setActiveCategory, setFromUnit } = args;
  const isSymbolic = CATEGORY_FAMILIES[activeCategory] === 'SYMBOLIC';
  const getPlaceholder = useCallback(() => computePlaceholder(fromUnit, activeCategory), [fromUnit, activeCategory]);
  const reformatInputValue = useCallback(
    (o: NumberFormat, n: NumberFormat) => dispatchReformat(isSymbolic, inputValue, fromUnit, o, n, setInputValue),
    [isSymbolic, inputValue, fromUnit, setInputValue]);
  const handleInputChange = useCallback(
    (value: string) => dispatchInputChange(value, isSymbolic, numberFormat, fromUnit, setInputValue),
    [isSymbolic, numberFormat, fromUnit, setInputValue]);
  const handleInputBlur = useCallback(
    () => dispatchInputBlur(isSymbolic, activeCategory, inputValue, fromUnit, numberFormat, parseNumberWithFormat, setInputValue, setFromUnit),
    [isSymbolic, activeCategory, inputValue, fromUnit, numberFormat, parseNumberWithFormat, setInputValue, setFromUnit]);
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => stepCategoryOnArrowKey(e, activeCategory, setActiveCategory, setInputValue),
    [activeCategory, setActiveCategory, setInputValue]);
  return { getPlaceholder, reformatInputValue, handleInputChange, handleInputBlur, handleInputKeyDown };
}
