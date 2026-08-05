import { useCallback } from 'react';
import type { CalcValue } from '@/lib/units/calcValue';
import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import type { SIRepresentation } from '@/lib/si-representations/siRepresentation';
import { formatDimensions } from '@/lib/unit-symbols/formatDimensions';
import { siToDisplay as siToDisplayLib } from '@/lib/unit-symbols/siToDisplay';
import { composeUnitDisplaySymbol } from '@/lib/units/composeUnitDisplaySymbol';
import { SI_DERIVED_UNITS } from '@/lib/units/siDerivedUnitsCatalog';

// §1.6: unit-symbol composition and value transform are both
// single-sourced (composeUnitDisplaySymbol + siToDisplay). This
// hook stores the raw numeric displayValue on val.originalValue,
// so it uses the two primitives directly rather than the packaged
// formatCalcValueDisplay (which additionally produces a formatted
// string that would be unused here).

interface UseCalculatorRpnSelectionArgs {
  rpnSelectedAlternative: number;
  setRpnStack: (v: Array<CalcValue | null> | ((prev: Array<CalcValue | null>) => Array<CalcValue | null>)) => void;
  setRpnResultPrefixRaw: (v: string) => void;
  setRpnSelectedAlternativeRaw: (v: number) => void;
  generateSIRepresentations: (dimensions: DimensionalFormula, sourceCategory?: string) => SIRepresentation[];
}

export interface OriginMeta {
  originalUnit: string;
  originalValue: number;
  sourceCategory: string | undefined;
}

/**
 * Given a stack entry + selected alternative + prefix, return the
 * origin metadata that mirrors the on-screen display: the composed
 * unit symbol (with prefix), the display value, the unit type, and
 * the source category (derived-unit category takes precedence over
 * the entry's own sourceCategory when present).
 */
export function computeOriginMetaForValue(
  val: CalcValue | null,
  altIndex: number,
  prefix: string,
  generateSIRepresentations: UseCalculatorRpnSelectionArgs['generateSIRepresentations'],
): OriginMeta | null {
  if (!val) return null;
  const siReps = generateSIRepresentations(val.dimensions, val.sourceCategory);
  const rep = siReps[altIndex];
  const symbol = rep?.displaySymbol || formatDimensions(val.dimensions);
  if (!symbol || symbol === '1') return null;
  const { unitSymbol } = composeUnitDisplaySymbol(symbol, prefix);
  const displayValue = siToDisplayLib(val.value, symbol, prefix);
  const primaryDerivedUnit = rep?.derivedUnits?.[0];
  const derivedUnitInfo = primaryDerivedUnit ? SI_DERIVED_UNITS.find(u => u.symbol === primaryDerivedUnit) : undefined;
  const sourceCategory = derivedUnitInfo?.category ?? val.sourceCategory;
  return { originalUnit: unitSymbol, originalValue: displayValue, sourceCategory };
}

function applyOriginMetaToTop(
  prev: Array<CalcValue | null>,
  altIndex: number,
  prefix: string,
  generateSIRepresentations: UseCalculatorRpnSelectionArgs['generateSIRepresentations'],
): Array<CalcValue | null> {
  const ns = [...prev];
  const meta = computeOriginMetaForValue(ns[3], altIndex, prefix, generateSIRepresentations);
  if (ns[3] && meta) {
    ns[3] = { ...ns[3], originalUnit: meta.originalUnit, originalValue: meta.originalValue, sourceCategory: meta.sourceCategory };
  }
  return ns;
}

/**
 * RPN result-field selection: setRpnSelectedAlternative and
 * setRpnResultPrefix. Both write raw state + recompute origin
 * metadata on the top-of-stack entry so it survives representation
 * or prefix changes.
 */
export function useCalculatorRpnSelection(args: UseCalculatorRpnSelectionArgs) {
  const a = args;
  const setRpnSelectedAlternative = useCallback((altIndex: number) => {
    a.setRpnSelectedAlternativeRaw(altIndex);
    a.setRpnResultPrefixRaw('none');
    a.setRpnStack(prev => applyOriginMetaToTop(prev, altIndex, 'none', a.generateSIRepresentations));
  }, [a.setRpnSelectedAlternativeRaw, a.setRpnResultPrefixRaw, a.setRpnStack, a.generateSIRepresentations]);
  const setRpnResultPrefix = useCallback((prefix: string) => {
    a.setRpnResultPrefixRaw(prefix);
    a.setRpnStack(prev => applyOriginMetaToTop(prev, a.rpnSelectedAlternative, prefix, a.generateSIRepresentations));
  }, [a.setRpnResultPrefixRaw, a.setRpnStack, a.rpnSelectedAlternative, a.generateSIRepresentations]);
  return { setRpnSelectedAlternative, setRpnResultPrefix };
}
