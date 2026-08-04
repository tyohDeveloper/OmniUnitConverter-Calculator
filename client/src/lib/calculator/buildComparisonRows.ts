// EXCEPTION [architecture-standards §3.2]: type-and-function co-location.
// The exported ComparisonRow and BuildComparisonRowsInput interfaces travel
// with the function per the normalizeMassUnit.ts pattern.
import { convert } from '../conversion-data';
import { findOptimalPrefix } from '../units/findOptimalPrefix';
import { prefixPowerFactor } from '../units/prefixPowerFactor';
import { applyPrefixToKgUnit } from '../units/applyPrefixToKgUnit';
import type { UnitCategory } from '../units/unitCategory';

export interface ComparisonRow {
  unitId: string;
  unitName: string;
  displaySymbol: string;
  displayValue: number;
}

export interface BuildComparisonRowsInput {
  units: Array<{ id: string; name: string; symbol: string; allowPrefixes?: boolean; prefixPower?: number }>;
  inputValue: number;
  fromUnit: string;
  activeCategory: UnitCategory;
  fromPrefixFactor: number;
  fromPrefixPower: number | undefined;
  precision: number;
  nonePrefix: { id: string; symbol: string };
}

// Local helper: compute { prefix, adjustedValue, displaySymbol } for one
// unit given a converted value. Kept purely local per §3.1.
function buildOneRow(
  unit: { id: string; name: string; symbol: string; allowPrefixes?: boolean; prefixPower?: number },
  convertedValue: number,
  precision: number,
  nonePrefix: { id: string; symbol: string },
): ComparisonRow {
  let displayPrefix = nonePrefix;
  let displayValue = convertedValue;
  if (unit.allowPrefixes && Math.abs(convertedValue) > 0) {
    const optimal = findOptimalPrefix(convertedValue, unit.symbol, precision, unit.prefixPower);
    displayPrefix = optimal.prefix;
    displayValue = optimal.adjustedValue;
  }
  const kgResult = applyPrefixToKgUnit(unit.symbol, displayPrefix.id);
  const displaySymbol = kgResult.showPrefix
    ? `${displayPrefix.symbol}${kgResult.displaySymbol}`
    : kgResult.displaySymbol;
  return { unitId: unit.id, unitName: unit.name, displaySymbol, displayValue };
}

/**
 * Council-07: pure builder for the comparison-mode row list. Previously
 * lived as a render-time IIFE inside ConverterPane.tsx.
 */
export function buildComparisonRows(i: BuildComparisonRowsInput): ComparisonRow[] {
  const fromFactor = prefixPowerFactor(i.fromPrefixFactor, i.fromPrefixPower);
  return i.units.map(u => {
    const converted = convert(
      i.inputValue,
      i.fromUnit,
      u.id,
      i.activeCategory,
      fromFactor,
      1,
    );
    return buildOneRow(u, converted, i.precision, i.nonePrefix);
  });
}
