import type { DimensionalFormula } from './dimensionalFormula';
import { CATEGORY_PRIMARIES } from './categoryPrimaries';

export interface CategoryDimensionInfo {
  name: string;
  dimensions: DimensionalFormula;
  isBase: boolean;
}

export const CATEGORY_DIMENSIONS: Record<string, CategoryDimensionInfo> = {
  length: { name: 'Length', dimensions: { length: 1 }, isBase: true },
  mass: { name: 'Mass', dimensions: { mass: 1 }, isBase: true },
  time: { name: 'Time', dimensions: { time: 1 }, isBase: true },
  current: { name: 'Electric Current', dimensions: { current: 1 }, isBase: true },
  temperature: { name: 'Temperature', dimensions: { temperature: 1 }, isBase: true },
  amount: { name: 'Amount of Substance', dimensions: { amount: 1 }, isBase: true },
  intensity: { name: 'Luminous Intensity', dimensions: { intensity: 1 }, isBase: true },
  angle: { name: 'Plane Angle', dimensions: { angle: 1 }, isBase: true },
  solid_angle: { name: 'Solid Angle', dimensions: { solid_angle: 1 }, isBase: true },
  area: { name: 'Area', dimensions: { length: 2 }, isBase: false },
  volume: { name: 'Volume', dimensions: { length: 3 }, isBase: false },
  speed: { name: 'Speed', dimensions: { length: 1, time: -1 }, isBase: false },
  acceleration: { name: 'Acceleration', dimensions: { length: 1, time: -2 }, isBase: false },
  force: { name: 'Force', dimensions: { mass: 1, length: 1, time: -2 }, isBase: false },
  pressure: { name: 'Pressure', dimensions: { mass: 1, length: -1, time: -2 }, isBase: false },
  energy: { name: 'Energy', dimensions: { mass: 1, length: 2, time: -2 }, isBase: false },
  power: { name: 'Power', dimensions: { mass: 1, length: 2, time: -3 }, isBase: false },
  frequency: { name: 'Frequency', dimensions: { time: -1 }, isBase: false },
  momentum: { name: 'Momentum', dimensions: { mass: 1, length: 1, time: -1 }, isBase: false },
  angular_momentum: { name: 'Angular Momentum', dimensions: { mass: 1, length: 2, time: -1 }, isBase: false },
  angular_velocity: { name: 'Angular Velocity', dimensions: { angle: 1, time: -1 }, isBase: false },
  torque: { name: 'Torque', dimensions: { mass: 1, length: 2, time: -2 }, isBase: false },
  density: { name: 'Density', dimensions: { mass: 1, length: -3 }, isBase: false },
  flow: { name: 'Flow Rate', dimensions: { length: 3, time: -1 }, isBase: false },
  viscosity: { name: 'Viscosity', dimensions: { mass: 1, length: -1, time: -1 }, isBase: false },
  kinematic_viscosity: { name: 'Kinematic Viscosity', dimensions: { length: 2, time: -1 }, isBase: false },
  surface_tension: { name: 'Surface Tension', dimensions: { mass: 1, time: -2 }, isBase: false },
  thermal_conductivity: { name: 'Thermal Conductivity', dimensions: { mass: 1, length: 1, time: -3, temperature: -1 }, isBase: false },
  specific_heat: { name: 'Specific Heat', dimensions: { length: 2, time: -2, temperature: -1 }, isBase: false },
  entropy: { name: 'Entropy', dimensions: { mass: 1, length: 2, time: -2, temperature: -1 }, isBase: false },
  charge: { name: 'Electric Charge', dimensions: { current: 1, time: 1 }, isBase: false },
  potential: { name: 'Electric Potential', dimensions: { mass: 1, length: 2, time: -3, current: -1 }, isBase: false },
  capacitance: { name: 'Capacitance', dimensions: { mass: -1, length: -2, time: 4, current: 2 }, isBase: false },
  resistance: { name: 'Resistance', dimensions: { mass: 1, length: 2, time: -3, current: -2 }, isBase: false },
  conductance: { name: 'Conductance', dimensions: { mass: -1, length: -2, time: 3, current: 2 }, isBase: false },
  magnetic_flux: { name: 'Magnetic Flux', dimensions: { mass: 1, length: 2, time: -2, current: -1 }, isBase: false },
  magnetic_density: { name: 'Magnetic Flux Density', dimensions: { mass: 1, time: -2, current: -1 }, isBase: false },
  inductance: { name: 'Inductance', dimensions: { mass: 1, length: 2, time: -2, current: -2 }, isBase: false },
  electric_field: { name: 'Electric Field', dimensions: { mass: 1, length: 1, time: -3, current: -1 }, isBase: false },
  magnetic_field_h: { name: 'Magnetic Field (H)', dimensions: { current: 1, length: -1 }, isBase: false },
  radioactivity: { name: 'Radioactivity', dimensions: { time: -1 }, isBase: false },
  radioactive_decay: { name: 'Radioactive Decay', dimensions: { time: -1 }, isBase: false },
  radiation_dose: { name: 'Radiation Dose', dimensions: { length: 2, time: -2 }, isBase: false },
  absorbed_dose: { name: 'Absorbed Dose', dimensions: { length: 2, time: -2 }, isBase: false },
  equivalent_dose: { name: 'Equivalent Dose', dimensions: { length: 2, time: -2 }, isBase: false },
  radiation_exposure: { name: 'Radiation Exposure', dimensions: { current: 1, time: 1, mass: -1 }, isBase: false },
  cross_section: { name: 'Cross-Section', dimensions: { length: 2 }, isBase: false },
  photon: { name: 'Photon Energy', dimensions: { mass: 1, length: 2, time: -2 }, isBase: false },
  luminous_flux: { name: 'Luminous Flux', dimensions: { intensity: 1, solid_angle: 1 }, isBase: false },
  illuminance: { name: 'Illuminance', dimensions: { intensity: 1, solid_angle: 1, length: -2 }, isBase: false },
  luminous_exitance: { name: 'Luminous Exitance', dimensions: { intensity: 1, solid_angle: 1, length: -2 }, isBase: false },
  luminance: { name: 'Luminance', dimensions: { intensity: 1, length: -2 }, isBase: false },
  sound_pressure: { name: 'Sound Pressure', dimensions: { mass: 1, length: -1, time: -2 }, isBase: false },
  sound_intensity: { name: 'Sound Intensity', dimensions: { mass: 1, time: -3 }, isBase: false },
  acoustic_impedance: { name: 'Acoustic Impedance', dimensions: { mass: 1, length: -2, time: -1 }, isBase: false },
  refractive_power: { name: 'Refractive Power', dimensions: { length: -1 }, isBase: false },
  catalytic: { name: 'Catalytic Activity', dimensions: { amount: 1, time: -1 }, isBase: false },
  concentration: { name: 'Concentration', dimensions: { amount: 1, length: -3 }, isBase: false },
  fuel: { name: 'Fuel Energy', dimensions: { mass: 1, length: 2, time: -2 }, isBase: false },
  archaic_length: { name: 'Archaic Length', dimensions: { length: 1 }, isBase: false },
  archaic_mass: { name: 'Archaic Mass', dimensions: { mass: 1 }, isBase: false },
  archaic_volume: { name: 'Archaic Volume', dimensions: { length: 3 }, isBase: false },
  archaic_area: { name: 'Archaic Area', dimensions: { length: 2 }, isBase: false },
  archaic_energy: { name: 'Archaic Energy', dimensions: { mass: 1, length: 2, time: -2 }, isBase: false },
  archaic_power: { name: 'Archaic Power', dimensions: { mass: 1, length: 2, time: -3 }, isBase: false },
  typography: { name: 'Typography', dimensions: { length: 1 }, isBase: false },
  cooking: { name: 'Cooking Measures', dimensions: { length: 3 }, isBase: false },
  paper_sizes: { name: 'Paper Sizes', dimensions: { length: 2 }, isBase: false },
  beer_wine_volume: { name: 'Beer & Wine Volume', dimensions: { length: 3 }, isBase: false },
  data: { name: 'Data/Information', dimensions: {}, isBase: false },
  fuel_economy: { name: 'Fuel Economy', dimensions: { length: -2 }, isBase: false },
  lightbulb: { name: 'Lightbulb Efficiency', dimensions: { intensity: 1, solid_angle: 1 }, isBase: false },
  rack_geometry: { name: 'Rack Geometry', dimensions: { length: 1 }, isBase: false },
  // Council-03: shipping units (container lengths, TEU) are LINEAR, not
  // volumetric. The controllers' now-deleted dimMap had `{ length: 1 }`;
  // this catalog previously had `{ length: 3 }` in error. Reconciled to
  // match the controllers' correct value.
  shipping: { name: 'Shipping Length', dimensions: { length: 1 }, isBase: false },
  math: { name: 'Math Functions', dimensions: {}, isBase: false },
  logarithmic: { name: 'Logarithmic Scales', dimensions: {}, isBase: false },
  unitless: { name: 'Unitless Numbers', dimensions: {}, isBase: false },
};

// Categories that should never appear as cross-domain matches or in
// getMatchingPhysicalQuantities.
//
// This list used to contain 19 entries. As of the primaryCategory
// migration, categories that are specialists of a primary (archaics,
// paper_sizes, cooking, typography, rack_geometry, shipping,
// beer_wine_volume, lightbulb, fuel) are excluded automatically by
// the primaryCategory-based filters in findCrossDomainMatchesByKey /
// findCrossDomainMatches / getMatchingPhysicalQuantities. Only
// non-specialist entries need to remain here:
//
//   - fuel_economy: dimensionally unique ({length:-2}) but not a
//     specialist of any other category. Kept to prevent findCategory
//     ByDimensions from picking it up when smart-pasting ambiguous
//     compound units.
//   - data, math, logarithmic, unitless: dimensionless. Filtered by
//     isDimensionless() in findCross* functions, but findCategoryBy
//     Dimensions has no dimensionless guard — the list keeps
//     findCategoryByDimensions({}) returning null.
export const EXCLUDED_CROSS_DOMAIN_CATEGORIES = [
  'fuel_economy',
  'data', 'math', 'logarithmic', 'unitless',
];

// Categories that share dimensions with a more familiar primary and
// should not appear in the Direct-pane's "matching quantities" list.
// These are TRUE aliases (not primaryCategory specialists): they share
// a dimensional signature with a well-known primary but represent a
// specialized physical concept.
//
// This list used to contain 12 entries. Entries that are actually
// primaryCategory specialists (radioactive_decay, equivalent_dose,
// radiation_exposure, fuel) are now handled automatically by
// getMatchingPhysicalQuantities' primaryCategory-based dedup, and
// have been removed.
export const EXCLUDED_DOMAIN_ALIAS_CATEGORIES = [
  'radioactivity',       // {time:-1}, alias for frequency
  'radiation_dose',      // {length:2, time:-2}
  'absorbed_dose',       // {length:2, time:-2}, same as radiation_dose
  'cross_section',       // {length:2}, alias for area
  'sound_pressure',      // {mass:1, length:-1, time:-2}, alias for pressure
  'sound_intensity',     // {mass:1, time:-3}
  'acoustic_impedance',  // {mass:1, length:-2, time:-1}
  'refractive_power',    // {length:-1}
];

export const ALL_EXCLUDED_CATEGORIES = [
  ...EXCLUDED_CROSS_DOMAIN_CATEGORIES,
  ...EXCLUDED_DOMAIN_ALIAS_CATEGORIES,
];

export function getCategoryKeyForQuantityName(name: string): string | null {
  for (const [key, info] of Object.entries(CATEGORY_DIMENSIONS)) {
    if (info.name === name) return key;
  }
  return null;
}

export function getMatchingPhysicalQuantities(dimensions: DimensionalFormula): string[] {
  const keys = Object.keys(dimensions) as (keyof DimensionalFormula)[];
  const hasNonZero = keys.some(k => (dimensions[k] ?? 0) !== 0);
  if (!hasNonZero) return [];

  const results: string[] = [];
  for (const [categoryKey, info] of Object.entries(CATEGORY_DIMENSIONS)) {
    if (ALL_EXCLUDED_CATEGORIES.includes(categoryKey)) continue;

    const catDims = info.dimensions;
    if (!dimensionsMatchLocal(dimensions, catDims)) continue;

    // Specialist dedup: skip categories whose primaryCategory ALSO
    // matches the query — the primary is (or will be) in `results`
    // in its own iteration.
    const primaryId = CATEGORY_PRIMARIES[categoryKey];
    if (primaryId) {
      const primaryDims = CATEGORY_DIMENSIONS[primaryId]?.dimensions;
      if (primaryDims && dimensionsMatchLocal(dimensions, primaryDims)) continue;
    }

    results.push(info.name);
  }

  return results;
}

// Local dimensional-equality; kept in-file to avoid cross-module
// dependency for a trivial check.
function dimensionsMatchLocal(a: DimensionalFormula, b: DimensionalFormula): boolean {
  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])) as (keyof DimensionalFormula)[];
  for (const k of keys) {
    if ((a[k] ?? 0) !== (b[k] ?? 0)) return false;
  }
  return true;
}
