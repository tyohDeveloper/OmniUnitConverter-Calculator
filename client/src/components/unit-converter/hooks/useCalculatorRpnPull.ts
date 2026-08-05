import { useCallback } from 'react';
import type { CalcValue } from '@/lib/units/calcValue';
import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import type { SIRepresentation } from '@/lib/si-representations/siRepresentation';
import { CONVERSION_DATA } from '@/lib/conversion-data';
import { PREFIXES } from '@/lib/units/prefixes';
import { CATEGORY_DIMENSIONS } from '@/lib/units/categoryDimensions';
import { pushEntry } from './useCalculatorRpnStackOps';

interface UseCalculatorRpnPullArgs {
  activeTab: string;
  result: number | null;
  activeCategory: string;
  toUnit: string;
  toPrefix: string;
  directValue: string;
  buildDirectDimensions: () => Record<string, number>;
  parseNumberWithFormat: (s: string) => number;
  saveRpnStackForUndo: () => void;
  setRpnStack: (v: Array<CalcValue | null> | ((prev: Array<CalcValue | null>) => Array<CalcValue | null>)) => void;
  setRpnResultPrefixRaw: (v: string) => void;
  setRpnSelectedAlternativeRaw: (v: number) => void;
  triggerFlashRpnResult: () => void;
  generateSIRepresentations: (dimensions: DimensionalFormula, sourceCategory?: string) => SIRepresentation[];
}

function buildConverterEntry(a: UseCalculatorRpnPullArgs): CalcValue | null {
  if (a.result === null) return null;
  const categoryData = CONVERSION_DATA.find(c => c.id === a.activeCategory);
  const toUnitData = categoryData?.units.find(u => u.id === a.toUnit);
  if (!toUnitData) return null;
  const toPrefixData = PREFIXES.find(p => p.id === a.toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
  const siValue = a.result * toUnitData.factor * (toPrefixData?.factor || 1);
  const toPfxSymbol = (toUnitData.allowPrefixes && toPrefixData && toPrefixData.id !== 'none') ? toPrefixData.symbol : '';
  const dims: Record<string, number> = {};
  Object.assign(dims, CATEGORY_DIMENSIONS[a.activeCategory]?.dimensions ?? {});
  return {
    value: siValue, dimensions: dims, prefix: 'none',
    sourceCategory: a.activeCategory,
    originalUnit: toPfxSymbol + toUnitData.symbol,
    originalValue: a.result,
  };
}

function buildDirectEntry(a: UseCalculatorRpnPullArgs): CalcValue | null {
  const numValue = a.parseNumberWithFormat(a.directValue);
  if (isNaN(numValue) || !a.directValue) return null;
  return { value: numValue, dimensions: a.buildDirectDimensions(), prefix: 'none' };
}

function computePullAutoSelection(a: UseCalculatorRpnPullArgs, entry: CalcValue): { autoAlt: number; autoPrefix: string } {
  if (a.activeTab !== 'converter') return { autoAlt: 0, autoPrefix: 'none' };
  const categoryData = CONVERSION_DATA.find(c => c.id === a.activeCategory);
  const toUnitData = categoryData?.units.find(u => u.id === a.toUnit);
  if (!toUnitData) return { autoAlt: 0, autoPrefix: 'none' };
  const siReps = a.generateSIRepresentations(entry.dimensions, a.activeCategory);
  const matchIdx = siReps.findIndex(rep => rep.displaySymbol === toUnitData.symbol);
  if (matchIdx < 0) return { autoAlt: 0, autoPrefix: 'none' };
  const toPrefixData = PREFIXES.find(p => p.id === a.toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
  const autoPrefix = (toUnitData.allowPrefixes && toPrefixData && toPrefixData.id !== 'none') ? toPrefixData.id : 'none';
  return { autoAlt: matchIdx, autoPrefix };
}

function doPullFromPane(a: UseCalculatorRpnPullArgs): void {
  const newEntry = a.activeTab === 'converter' ? buildConverterEntry(a)
    : a.activeTab === 'custom' ? buildDirectEntry(a)
    : null;
  if (!newEntry) return;
  a.saveRpnStackForUndo();
  a.setRpnStack(prev => pushEntry(prev, newEntry));
  const { autoAlt, autoPrefix } = computePullAutoSelection(a, newEntry);
  a.setRpnResultPrefixRaw(autoPrefix);
  a.setRpnSelectedAlternativeRaw(autoAlt);
  a.triggerFlashRpnResult();
}

/**
 * Pull the currently-displayed converter result or direct-mode value
 * onto the top of the RPN stack, then auto-select the matching SI
 * representation and prefix (converter tab only). Behavior is byte-
 * identical to the previous inline implementation.
 */
export function useCalculatorRpnPull(args: UseCalculatorRpnPullArgs) {
  const pullFromPane = useCallback(() => doPullFromPane(args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [args.activeTab, args.result, args.activeCategory, args.toUnit, args.toPrefix, args.directValue,
     args.buildDirectDimensions, args.parseNumberWithFormat, args.saveRpnStackForUndo, args.setRpnStack,
     args.setRpnResultPrefixRaw, args.setRpnSelectedAlternativeRaw, args.triggerFlashRpnResult, args.generateSIRepresentations]);
  return { pullFromPane };
}
