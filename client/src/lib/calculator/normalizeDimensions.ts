import type { DimensionalFormula } from '../units/shared-types';
import { isDimensionEmpty } from './isDimensionEmpty';
import { canApplyDerivedUnit } from './canApplyDerivedUnit';
import { subtractDerivedUnit } from './subtractDerivedUnit';
import { formatDimensions } from './formatDimensions';
import { toSuperscript } from './toSuperscript';
import { NORMALIZABLE_DERIVED_UNITS } from './siDerivedUnits';

const greedyMatchDerivedUnits = (
  dims: DimensionalFormula
): { remaining: DimensionalFormula; usedUnits: Map<string, number> } => {
  let remaining = { ...dims };
  const usedUnits: Map<string, number> = new Map();
  let foundMatch = true;
  while (foundMatch && !isDimensionEmpty(remaining)) {
    foundMatch = false;
    for (const derivedUnit of NORMALIZABLE_DERIVED_UNITS) {
      if (canApplyDerivedUnit(remaining, derivedUnit.dimensions)) {
        remaining = subtractDerivedUnit(remaining, derivedUnit.dimensions);
        usedUnits.set(derivedUnit.symbol, (usedUnits.get(derivedUnit.symbol) || 0) + 1);
        foundMatch = true;
        break;
      }
    }
  }
  return { remaining, usedUnits };
};

export const normalizeDimensions = (dims: DimensionalFormula): string => {
  if (isDimensionEmpty(dims)) return '';
  const { remaining, usedUnits } = greedyMatchDerivedUnits(dims);
  return buildNormalizedSymbol(remaining, usedUnits) || formatDimensions(dims);
};

function splitBySign(remaining: DimensionalFormula): { pos: DimensionalFormula; neg: DimensionalFormula } {
  const pos: DimensionalFormula = {};
  const neg: DimensionalFormula = {};
  for (const [dim, exp] of Object.entries(remaining)) {
    if (exp > 0) pos[dim as keyof DimensionalFormula] = exp;
    else if (exp < 0) neg[dim as keyof DimensionalFormula] = exp;
  }
  return { pos, neg };
}

function buildNormalizedSymbol(remaining: DimensionalFormula, usedUnits: Map<string, number>): string {
  const sortedDerived = Array.from(usedUnits.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const derivedParts = sortedDerived.map(([s, n]) => (n === 1 ? s : s + toSuperscript(n)));
  const parts: string[] = [];
  if (formatDimensions(remaining)) {
    const { pos, neg } = splitBySign(remaining);
    const positiveSymbol = formatDimensions(pos);
    if (positiveSymbol) parts.push(positiveSymbol);
    parts.push(...derivedParts);
    const negativeSymbol = formatDimensions(neg);
    if (negativeSymbol) parts.push(negativeSymbol);
  } else {
    parts.push(...derivedParts);
  }
  return parts.join('⋅');
}
