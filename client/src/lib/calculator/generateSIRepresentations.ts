import type { DimensionalFormula } from '../units/dimensionalFormula';
import type { SIRepresentation } from './types';
import { isDimensionEmpty } from './isDimensionEmpty';
import { isValidSIComposition } from './isValidSIComposition';
import { subtractDimensions } from './subtractDimensions';
import { formatSIComposition } from './formatSIComposition';
import { isValidSymbolRepresentation } from './isValidSymbolRepresentation';
import { formatDimensions } from './formatDimensions';
import { countUnits } from './countUnits';
import { sumAbsExponents } from './sumAbsExponents';
import { findCrossDomainMatches } from './findCrossDomainMatches';
import { findCrossDomainMatchesByKey } from './findCrossDomainMatchesByKey';
import { SI_DERIVED_UNITS, GENERAL_SI_DERIVED, SPECIALTY_DERIVED_UNITS } from './siDerivedUnits';
import { getDimensionSignature } from '../units/getDimensionSignature';
import { PREFERRED_REPRESENTATIONS } from '../units/preferredRepresentations';
import { CONVERSION_DATA } from '../conversion-data';
import { CATEGORY_DIMENSIONS } from '../units/categoryDimensions';

const EXCLUDED_DROPDOWN_CATEGORIES = new Set([
  'archaic_length', 'archaic_mass', 'archaic_volume', 'archaic_area', 'archaic_energy', 'archaic_power',
  'math', 'data', 'fuel', 'fuel_economy', 'rack_geometry', 'shipping', 'beer_wine_volume', 'lightbulb',
  'cooking', 'typography',
]);

const ANGULAR_SYMBOL_PATTERN = /\brad\b|rpm|rps/;

function dimensionsMatch(a: DimensionalFormula, b: DimensionalFormula): boolean {
  const allKeys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])) as (keyof DimensionalFormula)[];
  for (const k of allKeys) {
    const aVal = (a as Record<string, number>)[k as string] ?? 0;
    const bVal = (b as Record<string, number>)[k as string] ?? 0;
    if (aVal !== bVal) return false;
  }
  return true;
}

function collectCategoryUnits(
  categoryData: (typeof CONVERSION_DATA)[number],
  seenSymbols: Set<string>,
  suppressAngular: boolean
): SIRepresentation[] {
  const result: SIRepresentation[] = [];
  for (const unit of categoryData.units) {
    if (unit.mathFunction || seenSymbols.has(unit.symbol)) continue;
    if (suppressAngular && ANGULAR_SYMBOL_PATTERN.test(unit.symbol)) continue;
    seenSymbols.add(unit.symbol);
    result.push({ displaySymbol: unit.symbol, derivedUnits: [], depth: 2 });
  }
  return result;
}

function buildCategoryUnitsForDropdown(
  dimensions: DimensionalFormula,
  seenSymbols: Set<string>,
  sourceCategory?: string
): SIRepresentation[] {
  const suppressAngular = !(dimensions as Record<string, number>)['angle'];
  const result: SIRepresentation[] = [];
  for (const categoryData of CONVERSION_DATA) {
    const catId = categoryData.id;
    if (EXCLUDED_DROPDOWN_CATEGORIES.has(catId)) continue;
    const catDimInfo = CATEGORY_DIMENSIONS[catId];
    if (!catDimInfo || !dimensionsMatch(dimensions, catDimInfo.dimensions)) continue;
    if (sourceCategory && catId !== sourceCategory) continue;
    result.push(...collectCategoryUnits(categoryData, seenSymbols, suppressAngular));
  }
  return result;
}

export { PREFERRED_REPRESENTATIONS };

const CATEGORY_DEFAULT_SYMBOLS: Record<string, string> = {
  energy: 'J',
  torque: 'N⋅m',
  photon: 'eV',
  force: 'N',
  pressure: 'Pa',
  power: 'W',
  frequency: 'Hz',
  charge: 'C',
  potential: 'V',
  capacitance: 'F',
  resistance: 'Ω',
  conductance: 'S',
  magnetic_flux: 'Wb',
  magnetic_density: 'T',
  inductance: 'H',
  luminous_flux: 'lm',
  illuminance: 'lx',
  radiation_dose: 'Gy',
  equivalent_dose: 'Sv',
  catalytic: 'kat',
};

export const generateSIRepresentations = (
  dimensions: DimensionalFormula,
  _getDimensionSignature?: (dims: DimensionalFormula) => string,
  _PREFERRED?: Record<string, { displaySymbol: string; isSI: boolean }>,
  sourceCategory?: string
): SIRepresentation[] => {
  if (isDimensionEmpty(dimensions)) {
    return [{ displaySymbol: '1', derivedUnits: [], depth: 0 }];
  }

  const representations: SIRepresentation[] = [];
  const seenSymbols = new Set<string>();

  for (const derivedUnit of GENERAL_SI_DERIVED) {
    if (!isValidSIComposition(dimensions, derivedUnit.dimensions)) continue;

    const remaining = subtractDimensions(dimensions, derivedUnit.dimensions);

    const derivedDimCount = Object.keys(derivedUnit.dimensions).filter(
      k => derivedUnit.dimensions[k as keyof DimensionalFormula] !== 0
    ).length;

    if (derivedDimCount === 1) {
      const derivedDimKey = Object.keys(derivedUnit.dimensions).find(
        k => derivedUnit.dimensions[k as keyof DimensionalFormula] !== 0
      ) as keyof DimensionalFormula;
      if (remaining[derivedDimKey] !== undefined && remaining[derivedDimKey] !== 0) continue;
    }

    const compositionSymbol = formatSIComposition([derivedUnit.symbol], remaining);

    if (!seenSymbols.has(compositionSymbol) && isValidSymbolRepresentation(compositionSymbol)) {
      seenSymbols.add(compositionSymbol);
      representations.push({
        displaySymbol: compositionSymbol,
        derivedUnits: [derivedUnit.symbol],
        depth: 1
      });
    }
  }

  const rawSymbol = formatDimensions(dimensions);
  if (rawSymbol && !seenSymbols.has(rawSymbol) && isValidSymbolRepresentation(rawSymbol)) {
    representations.push({ displaySymbol: rawSymbol, derivedUnits: [], depth: 0 });
  }

  const baseTermCount = rawSymbol ? countUnits(rawSymbol) : 0;
  const filteredRepresentations = baseTermCount === 0
    ? representations
    : representations.filter(rep => rep.depth === 0 || countUnits(rep.displaySymbol) <= baseTermCount);

  const usesSpecialtyUnit = (rep: SIRepresentation): boolean =>
    rep.derivedUnits?.some(u => SPECIALTY_DERIVED_UNITS.has(u)) ?? false;

  filteredRepresentations.sort((a, b) => {
    if (a.depth === 0 && b.depth !== 0) return 1;
    if (a.depth !== 0 && b.depth === 0) return -1;
    const unitDiff = countUnits(a.displaySymbol) - countUnits(b.displaySymbol);
    if (unitDiff !== 0) return unitDiff;
    const expDiff = sumAbsExponents(a.displaySymbol) - sumAbsExponents(b.displaySymbol);
    if (expDiff !== 0) return expDiff;
    const aSpecialty = usesSpecialtyUnit(a);
    const bSpecialty = usesSpecialtyUnit(b);
    if (aSpecialty && !bSpecialty) return 1;
    if (!aSpecialty && bSpecialty) return -1;
    return a.displaySymbol.localeCompare(b.displaySymbol);
  });

  promotePerfectSIMatch(filteredRepresentations);
  applyPreferredRepresentation(filteredRepresentations, dimensions);

  const crossMatchKeys = findCrossDomainMatchesByKey(dimensions);
  if (crossMatchKeys.length > 0) {
    applyCrossDomainOrdering(filteredRepresentations, crossMatchKeys);
  }

  const crossMatches = findCrossDomainMatches(dimensions);
  for (const rep of filteredRepresentations) {
    if (crossMatches.length > 0) rep.crossDomainMatches = crossMatches;
  }

  const allSeenSymbols = new Set(filteredRepresentations.map(r => r.displaySymbol));
  const categoryUnits = buildCategoryUnitsForDropdown(dimensions, allSeenSymbols, sourceCategory);
  if (crossMatches.length > 0) {
    for (const rep of categoryUnits) rep.crossDomainMatches = crossMatches;
  }
  filteredRepresentations.push(...categoryUnits);

  return filteredRepresentations;
};

function applyCrossDomainOrdering(
  reps: SIRepresentation[],
  crossMatchKeys: string[]
): void {
  const phase1: SIRepresentation[] = [];
  const usedIndices = new Set<number>();

  for (const catKey of crossMatchKeys) {
    const defaultSymbol = CATEGORY_DEFAULT_SYMBOLS[catKey];

    let foundIdx = -1;

    if (defaultSymbol) {
      foundIdx = reps.findIndex(
        (r, i) => !usedIndices.has(i) && r.displaySymbol === defaultSymbol
      );
      if (foundIdx !== -1) {
        usedIndices.add(foundIdx);
        phase1.push(reps[foundIdx]);
      } else {
        phase1.push({ displaySymbol: defaultSymbol, derivedUnits: [], depth: 1 });
      }
    } else {
      const siUnitsForCat = SI_DERIVED_UNITS.filter(u => u.category === catKey);
      for (const siUnit of siUnitsForCat) {
        foundIdx = reps.findIndex(
          (r, i) => !usedIndices.has(i) && r.derivedUnits?.includes(siUnit.symbol)
        );
        if (foundIdx !== -1) break;
      }
      if (foundIdx !== -1) {
        usedIndices.add(foundIdx);
        phase1.push(reps[foundIdx]);
      }
    }
  }

  const phase2: SIRepresentation[] = [];
  const phase3: SIRepresentation[] = [];

  for (let i = 0; i < reps.length; i++) {
    if (usedIndices.has(i)) continue;
    if (reps[i].depth === 0) {
      phase3.push(reps[i]);
    } else {
      phase2.push(reps[i]);
    }
  }

  reps.splice(0, reps.length, ...phase1, ...phase2, ...phase3);
}

function promotePerfectSIMatch(reps: SIRepresentation[]): void {
  const idx = reps.findIndex(rep =>
    rep.derivedUnits.length === 1 &&
    rep.displaySymbol === rep.derivedUnits[0] &&
    SI_DERIVED_UNITS.some(u => u.symbol === rep.derivedUnits[0])
  );
  if (idx > 0) {
    const [match] = reps.splice(idx, 1);
    reps.unshift(match);
  }
}

function applyPreferredRepresentation(
  reps: SIRepresentation[],
  dimensions: DimensionalFormula
): void {
  const dimSignature = getDimensionSignature(dimensions);
  const preferred = PREFERRED_REPRESENTATIONS[dimSignature];
  if (!preferred) return;

  const existingIndex = reps.findIndex(r => r.displaySymbol === preferred.displaySymbol);
  if (existingIndex > 0) {
    const [existing] = reps.splice(existingIndex, 1);
    reps.unshift(existing);
  } else if (existingIndex === -1) {
    reps.unshift({
      displaySymbol: preferred.displaySymbol,
      derivedUnits: preferred.isSI ? [preferred.displaySymbol.split('⋅')[0]] : [],
      depth: preferred.isSI ? 1 : 0
    });
  }
}
