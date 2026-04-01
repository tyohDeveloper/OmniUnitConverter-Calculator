import type { DimensionalFormula } from '../units/shared-types';
import type { DerivedUnitPowerMatch } from './types';
import { isDimensionless } from './isDimensionless';
import { toSuperscript } from './toSuperscript';
import { SI_DERIVED_UNITS } from './siDerivedUnits';

type DimEntry = [keyof DimensionalFormula, number];

function getNonZeroDimEntries(dims: DimensionalFormula): DimEntry[] {
  return Object.entries(dims).filter(([, exp]) => exp !== 0 && exp !== undefined) as DimEntry[];
}

function computeUniformPower(entries: DimEntry[], unitDims: DimensionalFormula): number | null {
  let power: number | null = null;
  for (const [dim, inputExp] of entries) {
    const unitExp = unitDims[dim] || 0;
    if (unitExp === 0) return null;
    const ratio = inputExp / unitExp;
    if (!Number.isInteger(ratio) || ratio <= 1) return null;
    if (power === null) power = ratio;
    else if (power !== ratio) return null;
  }
  return power;
}

function matchDerivedUnitPower(dimEntries: DimEntry[], derivedUnit: (typeof SI_DERIVED_UNITS)[number]): DerivedUnitPowerMatch | null {
  if (derivedUnit.category === 'photon') return null;
  const unitEntries = getNonZeroDimEntries(derivedUnit.dimensions);
  if (unitEntries.length === 0) return null;
  const inputKeys = dimEntries.map(([k]) => k);
  const unitKeysSet = new Set(unitEntries.map(([k]) => k));
  if (inputKeys.length !== unitKeysSet.size || !inputKeys.every(k => unitKeysSet.has(k))) return null;
  const power = computeUniformPower(dimEntries, derivedUnit.dimensions);
  if (power === null || power <= 1) return null;
  return { symbol: `${derivedUnit.symbol}${toSuperscript(power)}`, baseSymbol: derivedUnit.symbol, power, category: derivedUnit.category };
}

export const findDerivedUnitPower = (dimensions: DimensionalFormula): DerivedUnitPowerMatch | null => {
  if (isDimensionless(dimensions)) return null;
  const dimEntries = getNonZeroDimEntries(dimensions);
  if (dimEntries.length === 0) return null;
  for (const derivedUnit of SI_DERIVED_UNITS) {
    const match = matchDerivedUnitPower(dimEntries, derivedUnit);
    if (match) return match;
  }
  return null;
};
