import type { DimensionalFormula } from '../units/dimensionalFormula';
import { formatDimensions } from './formatDimensions';

function splitSignedDims(dims: DimensionalFormula): { pos: DimensionalFormula; neg: DimensionalFormula } {
  const pos: DimensionalFormula = {};
  const neg: DimensionalFormula = {};
  for (const [dim, exp] of Object.entries(dims)) {
    if (exp > 0) pos[dim as keyof DimensionalFormula] = exp;
    else if (exp < 0) neg[dim as keyof DimensionalFormula] = exp;
  }
  return { pos, neg };
}

export const formatSIComposition = (
  derivedSymbols: string[],
  remainingDims: DimensionalFormula
): string => {
  const { pos, neg } = splitSignedDims(remainingDims);
  const parts: string[] = [];
  parts.push(...derivedSymbols);
  const positiveBase = formatDimensions(pos);
  if (positiveBase) parts.push(positiveBase);
  const negativeBase = formatDimensions(neg);
  if (negativeBase) parts.push(negativeBase);
  return parts.join('⋅');
};
