import { CONVERSION_DATA, parseUnitText } from '../conversion-data';
import { PREFIXES } from '../units/prefixes';
import { canPushToCalculator } from './canPushToCalculator';
import type { CalcValue } from '../units/calcValue';
import type { DimensionalFormula } from '../units/dimensionalFormula';
import type { SIRepresentation } from '../si-representations/siRepresentation';

type ParsedText = ReturnType<typeof parseUnitText>;
type GenerateSIRepresentations = (dimensions: DimensionalFormula, sourceCategory?: string) => SIRepresentation[];

// EXCEPTION [architecture-standards §3.2]: type-and-function co-location.
export interface RpnEntryFromText {
  entry: CalcValue;
  // Index of the SI representation matching the parsed unit's symbol
  // (0 when no unit / no match) and its prefix id ('none' likewise) —
  // apply via the RAW selection setters so the entry's own origin
  // metadata is not re-stamped from stale state.
  autoAlt: number;
  autoPrefix: string;
}

const DIM_KEYS = ['length', 'mass', 'time', 'current', 'temperature', 'amount', 'intensity', 'angle', 'solid_angle'] as const;

function copyDimensions(source: ParsedText['dimensions']): DimensionalFormula {
  const dims: DimensionalFormula = {};
  for (const key of DIM_KEYS) {
    if (source[key]) dims[key] = source[key];
  }
  return dims;
}

function resolveOriginalUnit(parsed: ParsedText): string | undefined {
  if (!parsed.categoryId || !parsed.unitId) return undefined;
  const categoryDef = CONVERSION_DATA.find(c => c.id === parsed.categoryId);
  const unitDef = categoryDef?.units.find(u => u.id === parsed.unitId);
  if (!unitDef) return undefined;
  const prefixDef = PREFIXES.find(p => p.id === parsed.prefixId);
  const prefixSymbol = (unitDef.allowPrefixes && prefixDef && prefixDef.id !== 'none') ? prefixDef.symbol : '';
  return prefixSymbol + unitDef.symbol;
}

function computeAutoSelection(
  parsed: ParsedText, dims: DimensionalFormula,
  generateSIRepresentations: GenerateSIRepresentations,
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

/**
 * Single-sourced "smart" text → RPN stack entry builder, shared by
 * Smart Paste and the X-register commit so both accept the exact
 * same inputs ("101.3J", "3 km", "9.8 m·s⁻²", plain numbers, …) and
 * produce identical entries: value + dimensions + prefix plus origin
 * metadata (sourceCategory / originalUnit / originalValue) and the
 * auto-selected SI representation + prefix for the result selectors.
 *
 * Returns null for empty/unusable text and for SYMBOLIC categories —
 * the calculator layer is 100% numeric (see canPushToCalculator).
 */
export function buildRpnEntryFromText(
  text: string,
  generateSIRepresentations: GenerateSIRepresentations,
): RpnEntryFromText | null {
  if (!text.trim()) return null;
  const parsed = parseUnitText(text);
  if (!canPushToCalculator(parsed.categoryId ?? undefined)) return null;
  const dims = copyDimensions(parsed.dimensions);
  const entry: CalcValue = {
    value: parsed.value, dimensions: dims, prefix: parsed.prefixId || 'none',
    sourceCategory: parsed.categoryId ?? undefined,
    originalUnit: resolveOriginalUnit(parsed),
    originalValue: parsed.originalValue,
  };
  return { entry, ...computeAutoSelection(parsed, dims, generateSIRepresentations) };
}
