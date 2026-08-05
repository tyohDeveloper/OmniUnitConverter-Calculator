import { useCallback } from 'react';
import type { CalcValue } from '@/lib/units/calcValue';
import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import type { SIRepresentation } from '@/lib/si-representations/siRepresentation';
import { CONVERSION_DATA, parseUnitText } from '@/lib/conversion-data';
import { PREFIXES } from '@/lib/units/prefixes';
import { UnitType } from '@/lib/units/unitType';

interface UseCalculatorRpnPasteArgs {
  saveRpnStackForUndo: () => void;
  setRpnStack: (v: Array<CalcValue | null> | ((prev: Array<CalcValue | null>) => Array<CalcValue | null>)) => void;
  setRpnResultPrefixRaw: (v: string) => void;
  setRpnSelectedAlternativeRaw: (v: number) => void;
  generateSIRepresentations: (dimensions: DimensionalFormula, sourceCategory?: string) => SIRepresentation[];
}

type ParsedText = ReturnType<typeof parseUnitText>;

const DIM_KEYS = ['length', 'mass', 'time', 'current', 'temperature', 'amount', 'intensity', 'angle', 'solid_angle'] as const;

function copyDimensions(source: ParsedText['dimensions']): DimensionalFormula {
  const dims: DimensionalFormula = {};
  for (const key of DIM_KEYS) {
    if (source[key]) dims[key] = source[key];
  }
  return dims;
}

function resolveOriginalUnit(parsed: ParsedText): { originalUnit?: string; unitType?: UnitType; siUnit?: string } {
  if (!parsed.categoryId) return {};
  const categoryDef = CONVERSION_DATA.find(c => c.id === parsed.categoryId);
  const siUnit = categoryDef?.baseSISymbol;
  if (!parsed.unitId || !categoryDef) return { siUnit };
  const unitDef = categoryDef.units.find(u => u.id === parsed.unitId);
  if (!unitDef) return { siUnit };
  const prefixDef = PREFIXES.find(p => p.id === parsed.prefixId);
  const prefixSymbol = (unitDef.allowPrefixes && prefixDef && prefixDef.id !== 'none') ? prefixDef.symbol : '';
  return { originalUnit: prefixSymbol + unitDef.symbol, unitType: unitDef.unitType, siUnit };
}

function buildPasteEntry(parsed: ParsedText, dims: DimensionalFormula): CalcValue {
  const { originalUnit, unitType, siUnit } = resolveOriginalUnit(parsed);
  return {
    value: parsed.value, dimensions: dims, prefix: parsed.prefixId || 'none',
    sourceCategory: parsed.categoryId ?? undefined, siUnit, originalUnit,
    originalValue: parsed.originalValue, unitType,
  };
}

function computeAutoSelection(
  parsed: ParsedText, dims: DimensionalFormula,
  generateSIRepresentations: UseCalculatorRpnPasteArgs['generateSIRepresentations'],
): { autoAlt: number; autoPrefix: string } {
  if (!parsed.categoryId || !parsed.unitId) return { autoAlt: 0, autoPrefix: 'none' };
  const categoryDef = CONVERSION_DATA.find(c => c.id === parsed.categoryId);
  const unitDef = categoryDef?.units.find(u => u.id === parsed.unitId);
  if (!unitDef) return { autoAlt: 0, autoPrefix: 'none' };
  const siReps = generateSIRepresentations(dims, parsed.categoryId);
  const matchIdx = siReps.findIndex(rep => rep.displaySymbol === unitDef.symbol);
  if (matchIdx < 0) return { autoAlt: 0, autoPrefix: 'none' };
  const prefixDef = PREFIXES.find(p => p.id === parsed.prefixId);
  const autoPrefix = (unitDef.allowPrefixes && prefixDef && prefixDef.id !== 'none') ? prefixDef.id : 'none';
  return { autoAlt: matchIdx, autoPrefix };
}

async function doPasteToRpnStack(args: UseCalculatorRpnPasteArgs): Promise<void> {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) return;
    const parsed = parseUnitText(text);
    const dims = copyDimensions(parsed.dimensions);
    const newEntry = buildPasteEntry(parsed, dims);
    args.saveRpnStackForUndo();
    args.setRpnStack(prev => { const ns = [...prev]; ns[0] = prev[1]; ns[1] = prev[2]; ns[2] = prev[3]; ns[3] = newEntry; return ns; });
    const { autoAlt, autoPrefix } = computeAutoSelection(parsed, dims, args.generateSIRepresentations);
    args.setRpnResultPrefixRaw(autoPrefix);
    args.setRpnSelectedAlternativeRaw(autoAlt);
  } catch (err) {
    console.error('Failed to read clipboard:', err);
  }
}

/**
 * Read clipboard, parse it via parseUnitText, push the result to
 * the RPN stack, and auto-select the SI representation that matches
 * the parsed unit's symbol (with its prefix when applicable).
 *
 * Split from useCalculatorController for §3.7 domain focus. All
 * behavior byte-identical to the previous inline implementation.
 */
export function useCalculatorRpnPaste(args: UseCalculatorRpnPasteArgs) {
  const pasteToRpnStack = useCallback(
    () => doPasteToRpnStack(args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [args.saveRpnStackForUndo, args.setRpnStack, args.setRpnResultPrefixRaw, args.setRpnSelectedAlternativeRaw, args.generateSIRepresentations],
  );
  return { pasteToRpnStack };
}
