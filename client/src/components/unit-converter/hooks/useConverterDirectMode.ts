import { useCallback } from 'react';
import type { UnitCategory } from '@/lib/units/unitCategory';
import { buildDirectUnitSymbol as buildDirectUnitSymbolLib } from '@/lib/unit-symbols/buildDirectUnitSymbol';
import { buildDirectDimensions as buildDirectDimensionsLib } from '@/lib/unit-symbols/buildDirectDimensions';
import { getCategoryKeyForQuantityName } from '@/lib/units/categoryDimensions';

interface UseConverterDirectModeArgs {
  directValue: string;
  directExponents: Record<string, number>;
  setActiveCategory: (v: UnitCategory) => void;
  setInputValue: (v: string) => void;
  setActiveTab: (v: string) => void;
}

/**
 * Direct-mode (SI-freehand) helpers for the converter:
 *
 *   - buildDirectUnitSymbol: render the SI symbol string for the
 *     current directExponents (e.g. {length:2, time:-1} -> "m^2/s").
 *   - buildDirectDimensions: coerce directExponents to the plain
 *     Record<string, number> shape callers expect.
 *   - handleQuantityClick: user clicks a physical-quantity name in
 *     Direct pane -> switch to converter tab on that category with
 *     directValue as the starting input.
 *
 * All three preserve referential stability via useCallback so
 * downstream memoized effects don't churn.
 */
export function useConverterDirectMode(args: UseConverterDirectModeArgs) {
  const { directValue, directExponents, setActiveCategory, setInputValue, setActiveTab } = args;

  const buildDirectUnitSymbol = useCallback(
    (): string => buildDirectUnitSymbolLib(directExponents),
    [directExponents],
  );

  const buildDirectDimensions = useCallback(
    (): { [key: string]: number } => buildDirectDimensionsLib(directExponents) as { [key: string]: number },
    [directExponents],
  );

  const handleQuantityClick = useCallback((quantityName: string) => {
    const categoryKey = getCategoryKeyForQuantityName(quantityName);
    if (!categoryKey) return;
    setActiveCategory(categoryKey as UnitCategory);
    setInputValue(directValue);
    setActiveTab('converter');
  }, [directValue, setActiveCategory, setInputValue, setActiveTab]);

  return { buildDirectUnitSymbol, buildDirectDimensions, handleQuantityClick };
}
