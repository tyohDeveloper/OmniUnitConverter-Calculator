import accelerationData from '@/data/conversion/acceleration.json';
import acousticImpedanceData from '@/data/conversion/acoustic_impedance.json';
import amountData from '@/data/conversion/amount.json';
import angleData from '@/data/conversion/angle.json';
import angularMomentumData from '@/data/conversion/angular_momentum.json';
import angularVelocityData from '@/data/conversion/angular_velocity.json';
import archaicAreaData from '@/data/conversion/archaic_area.json';
import archaicEnergyData from '@/data/conversion/archaic_energy.json';
import archaicLengthData from '@/data/conversion/archaic_length.json';
import archaicMassData from '@/data/conversion/archaic_mass.json';
import archaicPowerData from '@/data/conversion/archaic_power.json';
import archaicVolumeData from '@/data/conversion/archaic_volume.json';
import areaData from '@/data/conversion/area.json';
import beerWineVolumeData from '@/data/conversion/beer_wine_volume.json';
import capacitanceData from '@/data/conversion/capacitance.json';
import catalyticData from '@/data/conversion/catalytic.json';
import chargeData from '@/data/conversion/charge.json';
import concentrationData from '@/data/conversion/concentration.json';
import conductanceData from '@/data/conversion/conductance.json';
import cookingData from '@/data/conversion/cooking.json';
import crossSectionData from '@/data/conversion/cross_section.json';
import currentData from '@/data/conversion/current.json';
import dataData from '@/data/conversion/data.json';
import densityData from '@/data/conversion/density.json';
import electricFieldData from '@/data/conversion/electric_field.json';
import energyData from '@/data/conversion/energy.json';
import entropyData from '@/data/conversion/entropy.json';
import equivalentDoseData from '@/data/conversion/equivalent_dose.json';
import flowData from '@/data/conversion/flow.json';
import forceData from '@/data/conversion/force.json';
import frequencyData from '@/data/conversion/frequency.json';
import fuelData from '@/data/conversion/fuel.json';
import fuelEconomyData from '@/data/conversion/fuel_economy.json';
import illuminanceData from '@/data/conversion/illuminance.json';
import inductanceData from '@/data/conversion/inductance.json';
import intensityData from '@/data/conversion/intensity.json';
import kinematicViscosityData from '@/data/conversion/kinematic_viscosity.json';
import lengthData from '@/data/conversion/length.json';
import lightbulbData from '@/data/conversion/lightbulb.json';
import luminousFluxData from '@/data/conversion/luminous_flux.json';
import magneticDensityData from '@/data/conversion/magnetic_density.json';
import magneticFieldHData from '@/data/conversion/magnetic_field_h.json';
import magneticFluxData from '@/data/conversion/magnetic_flux.json';
import massData from '@/data/conversion/mass.json';
import momentumData from '@/data/conversion/momentum.json';
import photonData from '@/data/conversion/photon.json';
import potentialData from '@/data/conversion/potential.json';
import powerData from '@/data/conversion/power.json';
import pressureData from '@/data/conversion/pressure.json';
import rackGeometryData from '@/data/conversion/rack_geometry.json';
import radiationDoseData from '@/data/conversion/radiation_dose.json';
import radioactiveDecayData from '@/data/conversion/radioactive_decay.json';
import radioactivityData from '@/data/conversion/radioactivity.json';
import refractivePowerData from '@/data/conversion/refractive_power.json';
import resistanceData from '@/data/conversion/resistance.json';
import shippingData from '@/data/conversion/shipping.json';
import solidAngleData from '@/data/conversion/solid_angle.json';
import soundIntensityData from '@/data/conversion/sound_intensity.json';
import soundPressureData from '@/data/conversion/sound_pressure.json';
import specificHeatData from '@/data/conversion/specific_heat.json';
import speedData from '@/data/conversion/speed.json';
import surfaceTensionData from '@/data/conversion/surface_tension.json';
import temperatureData from '@/data/conversion/temperature.json';
import thermalConductivityData from '@/data/conversion/thermal_conductivity.json';
import timeData from '@/data/conversion/time.json';
import torqueData from '@/data/conversion/torque.json';
import typographyData from '@/data/conversion/typography.json';
import viscosityData from '@/data/conversion/viscosity.json';
import volumeData from '@/data/conversion/volume.json';

export type UnitCategory =
  | "length"
  | "mass"
  | "time"
  | "current"
  | "temperature"
  | "amount"
  | "intensity" // SI Base
  | "area"
  | "volume"
  | "speed"
  | "acceleration"
  | "force"
  | "pressure"
  | "energy"
  | "power"
  | "frequency"
  | "charge"
  | "potential"
  | "capacitance"
  | "resistance"
  | "conductance"
  | "inductance"
  | "magnetic_flux"
  | "magnetic_density"
  | "radioactivity"
  | "radiation_dose"
  | "equivalent_dose"
  | "catalytic"
  | "angle"
  | "solid_angle"
  | "angular_velocity"
  | "momentum"
  | "angular_momentum"
  | "luminous_flux"
  | "illuminance"
  | "luminous_exitance"
  | "luminance"
  | "torque"
  | "density"
  | "flow"
  | "viscosity"
  | "surface_tension"
  | "thermal_conductivity"
  | "specific_heat"
  | "entropy"
  | "concentration"
  | "data"
  | "rack_geometry"
  | "shipping"
  | "math"
  | "beer_wine_volume"
  | "refractive_power"
  | "sound_pressure"
  | "fuel_economy"
  | "lightbulb"
  | "photon"
  | "radioactive_decay"
  | "cross_section"
  | "kinematic_viscosity"
  | "electric_field"
  | "magnetic_field_h"
  | "sound_intensity"
  | "acoustic_impedance"
  | "fuel"
  | "archaic_length"
  | "archaic_mass"
  | "archaic_volume"
  | "archaic_area"
  | "archaic_energy"
  | "archaic_power"
  | "typography"
  | "cooking";

export interface Prefix {
  id: string;
  name: string;
  symbol: string;
  factor: number;
}

export const PREFIXES: Prefix[] = [
  { id: 'yotta', name: 'Yotta', symbol: 'Y', factor: 1e24 },
  { id: 'zetta', name: 'Zetta', symbol: 'Z', factor: 1e21 },
  { id: 'exa', name: 'Exa', symbol: 'E', factor: 1e18 },
  { id: 'peta', name: 'Peta', symbol: 'P', factor: 1e15 },
  { id: 'tera', name: 'Tera', symbol: 'T', factor: 1e12 },
  { id: 'giga', name: 'Giga', symbol: 'G', factor: 1e9 },
  { id: 'mega', name: 'Mega', symbol: 'M', factor: 1e6 },
  { id: 'kilo', name: 'Kilo', symbol: 'k', factor: 1e3 },
  { id: 'none', name: '', symbol: '', factor: 1 },
  { id: 'centi', name: 'Centi', symbol: 'c', factor: 1e-2 },
  { id: 'milli', name: 'Milli', symbol: 'm', factor: 1e-3 },
  { id: 'micro', name: 'Micro', symbol: 'µ', factor: 1e-6 },
  { id: 'nano', name: 'Nano', symbol: 'n', factor: 1e-9 },
  { id: 'pico', name: 'Pico', symbol: 'p', factor: 1e-12 },
  { id: 'femto', name: 'Femto', symbol: 'f', factor: 1e-15 },
  { id: 'atto', name: 'Atto', symbol: 'a', factor: 1e-18 },
  { id: 'zepto', name: 'Zepto', symbol: 'z', factor: 1e-21 },
  { id: 'yocto', name: 'Yocto', symbol: 'y', factor: 1e-24 },
];

export const BINARY_PREFIXES: Prefix[] = [
  { id: 'exbi', name: 'Exbi', symbol: 'Ei', factor: 1152921504606846976 },
  { id: 'pebi', name: 'Pebi', symbol: 'Pi', factor: 1125899906842624 },
  { id: 'tebi', name: 'Tebi', symbol: 'Ti', factor: 1099511627776 },
  { id: 'gibi', name: 'Gibi', symbol: 'Gi', factor: 1073741824 },
  { id: 'mebi', name: 'Mebi', symbol: 'Mi', factor: 1048576 },
  { id: 'kibi', name: 'Kibi', symbol: 'Ki', factor: 1024 },
];

export const ALL_PREFIXES: Prefix[] = [...PREFIXES, ...BINARY_PREFIXES].sort((a, b) => b.factor - a.factor);

/**
 * Find the optimal SI prefix for a value to minimize displayed digits.
 * The goal is to keep values in the range [1, 1000) when possible.
 * For example: 1500000 J → 1.5 MJ, 0.000001 m → 1 µm
 * 
 * For kg-containing units, the prefix is applied via "handoff" where the 'k' in kg
 * is replaced by the prefix (kg + milli → mg, kg + mega → Mg).
 * This function treats kg values as if they were in grams for prefix calculation.
 * 
 * @param value - The numeric value to find a prefix for
 * @param unitSymbol - The unit symbol (used to detect 'kg' for special handling)
 * @param precision - Optional precision setting to ensure value is displayable
 * @returns Object with the best prefix and the adjusted value
 */
function findBestRangePrefix(absValue: number, nonePrefix: Prefix): Prefix {
  let best = nonePrefix;
  let bestScore = Math.abs(Math.log10(absValue));
  for (const prefix of PREFIXES) {
    if (prefix.id === 'none') continue;
    const adj = absValue / prefix.factor;
    if (adj >= 1 && adj < 1000) {
      const score = Math.abs(Math.log10(adj));
      if (score < bestScore) { bestScore = score; best = prefix; }
    }
  }
  return best;
}

function findPrecisionFallbackPrefix(absValue: number, bestPrefix: Prefix, precision: number): Prefix {
  for (const prefix of PREFIXES) {
    if (prefix.factor >= bestPrefix.factor) continue;
    const rounded = parseFloat((absValue / prefix.factor).toFixed(precision));
    if (rounded !== 0) return prefix;
  }
  return bestPrefix;
}

export function findOptimalPrefix(value: number, unitSymbol = '', precision = 8): { prefix: Prefix; adjustedValue: number } {
  const nonePrefix = PREFIXES.find(p => p.id === 'none')!;
  const containsKg = unitSymbol.includes('kg');
  const effectiveValue = containsKg ? value * 1000 : value;
  const absValue = Math.abs(effectiveValue);

  if (absValue === 0 || !isFinite(absValue)) {
    return { prefix: nonePrefix, adjustedValue: value };
  }

  let bestPrefix = findBestRangePrefix(absValue, nonePrefix);
  const roundedWithBest = parseFloat((effectiveValue / bestPrefix.factor).toFixed(precision));
  if (roundedWithBest === 0 && effectiveValue !== 0) {
    bestPrefix = findPrecisionFallbackPrefix(absValue, bestPrefix, precision);
  }

  return { prefix: bestPrefix, adjustedValue: effectiveValue / bestPrefix.factor };
}

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  factor: number; // Conversion factor to base unit
  offset?: number; // For temperature (e.g. Celsius to Kelvin)
  description?: string;
  allowPrefixes?: boolean;
  mathFunction?: 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan' | 'sqrt' | 'cbrt' | 'root4' | 'log10' | 'log2' | 'ln' | 'exp' | 'abs' | 'sinh' | 'cosh' | 'tanh' | 'asinh' | 'acosh' | 'atanh' | 'floor' | 'ceil' | 'round' | 'trunc' | 'sign' | 'square' | 'cube' | 'pow4'; // For math function units
  isInverse?: boolean; // For photon wavelength: E = constant/λ (inverse relationship)
  unitType?: import('./units/unitType').UnitType;
}

export interface CategoryDefinition {
  id: UnitCategory;
  name: string;
  baseUnit: string;
  baseSISymbol?: string;
  units: UnitDefinition[];
}

type RawCategoryJson = {
  id: string;
  name: string;
  baseUnit: string;
  baseSISymbol?: string;
  units: Array<{
    id: string;
    name: string;
    symbol: string;
    factor: number;
    offset?: number;
    description?: string;
    allowPrefixes?: boolean;
    mathFunction?: string;
    isInverse?: boolean;
    unitType?: string;
  }>;
};

function asCategoryDefinition(raw: RawCategoryJson): CategoryDefinition {
  return raw as unknown as CategoryDefinition;
}

export const CONVERSION_DATA: CategoryDefinition[] = [
  lengthData,
  massData,
  timeData,
  currentData,
  temperatureData,
  amountData,
  intensityData,
  areaData,
  volumeData,
  speedData,
  accelerationData,
  forceData,
  pressureData,
  energyData,
  powerData,
  frequencyData,
  chargeData,
  potentialData,
  capacitanceData,
  resistanceData,
  conductanceData,
  magneticFluxData,
  magneticDensityData,
  inductanceData,
  radioactivityData,
  radiationDoseData,
  equivalentDoseData,
  photonData,
  radioactiveDecayData,
  crossSectionData,
  kinematicViscosityData,
  electricFieldData,
  magneticFieldHData,
  soundIntensityData,
  acousticImpedanceData,
  catalyticData,
  angleData,
  solidAngleData,
  angularVelocityData,
  momentumData,
  angularMomentumData,
  densityData,
  viscosityData,
  surfaceTensionData,
  thermalConductivityData,
  specificHeatData,
  entropyData,
  torqueData,
  flowData,
  luminousFluxData,
  illuminanceData,
  refractivePowerData,
  soundPressureData,
  concentrationData,
  fuelEconomyData,
  lightbulbData,
  fuelData,
  dataData,
  rackGeometryData,
  archaicLengthData,
  archaicMassData,
  archaicVolumeData,
  archaicAreaData,
  archaicEnergyData,
  archaicPowerData,
  shippingData,
  beerWineVolumeData,
  typographyData,
  cookingData,
].map(asCategoryDefinition);

const MATH_FUNCTIONS: Partial<Record<NonNullable<UnitDefinition['mathFunction']>, (v: number) => number>> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  asinh: Math.asinh, acosh: Math.acosh, atanh: Math.atanh,
  sqrt: Math.sqrt, cbrt: Math.cbrt, root4: v => Math.pow(v, 0.25),
  log10: Math.log10, log2: Math.log2, ln: Math.log,
  exp: Math.exp, abs: Math.abs, sign: Math.sign,
  floor: Math.floor, ceil: Math.ceil, round: Math.round, trunc: Math.trunc,
  square: v => v * v, cube: v => v * v * v, pow4: v => Math.pow(v, 4),
};

export function applyMathFunction(value: number, func: UnitDefinition['mathFunction']): number {
  if (!func) return value;
  const fn = MATH_FUNCTIONS[func];
  return fn ? fn(value) : value;
}

function convertTemperature(val: number, fromUnit: UnitDefinition, toUnit: UnitDefinition, toPrefixFactor: number): number {
  const baseValue = (val + (fromUnit.offset || 0)) * fromUnit.factor;
  return ((baseValue / toUnit.factor) - (toUnit.offset || 0)) / toPrefixFactor;
}

function toBaseValue(val: number, unit: UnitDefinition): number {
  return unit.isInverse ? unit.factor / val : val * unit.factor;
}

function fromBaseValue(baseValue: number, unit: UnitDefinition): number {
  return unit.isInverse ? unit.factor / baseValue : baseValue / unit.factor;
}

export function convert(value: number, fromId: string, toId: string, categoryId: UnitCategory, fromPrefixFactor = 1, toPrefixFactor = 1): number {
  const category = CONVERSION_DATA.find((c) => c.id === categoryId);
  if (!category) return 0;
  const fromUnit = category.units.find((u) => u.id === fromId);
  const toUnit = category.units.find((u) => u.id === toId);
  if (!fromUnit || !toUnit) return 0;

  if (categoryId === 'math' && fromUnit.mathFunction) {
    return applyMathFunction(value * fromPrefixFactor, fromUnit.mathFunction);
  }

  const val = value * fromPrefixFactor;
  if (categoryId === 'temperature') return convertTemperature(val, fromUnit, toUnit, toPrefixFactor);

  return fromBaseValue(toBaseValue(val, fromUnit), toUnit) / toPrefixFactor;
}

// Unit parsing result interface
export interface ParsedUnitResult {
  value: number;
  originalValue: number; // The numeric value as parsed from input (before conversion to base unit)
  categoryId: UnitCategory | null;
  unitId: string | null;
  prefixId: string;
  dimensions: Record<string, number>;
}

type SymbolMapEntry = { categoryId: UnitCategory; unitId: string; symbol: string; allowPrefixes: boolean; factor: number };
type SymbolMap = Map<string, SymbolMapEntry>;

function makeEntry(category: CategoryDefinition, unit: UnitDefinition): SymbolMapEntry {
  return { categoryId: category.id as UnitCategory, unitId: unit.id, symbol: unit.symbol, allowPrefixes: unit.allowPrefixes || false, factor: unit.factor };
}

function registerBaseUnits(map: SymbolMap): void {
  for (const category of CONVERSION_DATA) {
    const base = category.units.find(u => !u.mathFunction);
    if (base && base.factor === 1 && !map.has(base.symbol)) map.set(base.symbol, makeEntry(category, base));
  }
}

function registerRemainingUnits(map: SymbolMap): void {
  for (const category of CONVERSION_DATA) {
    for (const unit of category.units) {
      if (!unit.mathFunction && !map.has(unit.symbol)) map.set(unit.symbol, makeEntry(category, unit));
    }
  }
}

// Build a lookup map for quick unit matching.
// Two-pass priority: category base units (factor === 1) win over secondary units elsewhere.
// Within the same tier, first-wins based on CONVERSION_DATA order.
export function buildUnitSymbolMap(): SymbolMap {
  const map: SymbolMap = new Map();
  registerBaseUnits(map);
  registerRemainingUnits(map);
  return map;
}

// Cached unit symbol map
let cachedUnitSymbolMap: ReturnType<typeof buildUnitSymbolMap> | null = null;

function getUnitSymbolMap() {
  if (!cachedUnitSymbolMap) {
    cachedUnitSymbolMap = buildUnitSymbolMap();
  }
  return cachedUnitSymbolMap;
}

const CATEGORY_DIMENSION_MAP: Record<string, Record<string, number>> = {
  length: { length: 1 }, mass: { mass: 1 }, time: { time: 1 },
  current: { current: 1 }, temperature: { temperature: 1 },
  amount: { amount: 1 }, intensity: { intensity: 1 },
  area: { length: 2 }, volume: { length: 3 },
  speed: { length: 1, time: -1 }, acceleration: { length: 1, time: -2 },
  force: { mass: 1, length: 1, time: -2 }, pressure: { mass: 1, length: -1, time: -2 },
  energy: { mass: 1, length: 2, time: -2 }, power: { mass: 1, length: 2, time: -3 },
  frequency: { time: -1 }, charge: { current: 1, time: 1 },
  potential: { mass: 1, length: 2, time: -3, current: -1 },
  capacitance: { mass: -1, length: -2, time: 4, current: 2 },
  resistance: { mass: 1, length: 2, time: -3, current: -2 },
  conductance: { mass: -1, length: -2, time: 3, current: 2 },
  inductance: { mass: 1, length: 2, time: -2, current: -2 },
  magnetic_flux: { mass: 1, length: 2, time: -2, current: -1 },
  magnetic_density: { mass: 1, time: -2, current: -1 },
  radioactivity: { time: -1 }, radiation_dose: { length: 2, time: -2 },
  equivalent_dose: { length: 2, time: -2 }, catalytic: { amount: 1, time: -1 },
  angle: { angle: 1 }, solid_angle: { solid_angle: 1 },
  angular_velocity: { angle: 1, time: -1 },
  momentum: { mass: 1, length: 1, time: -1 },
  angular_momentum: { mass: 1, length: 2, time: -1 },
  luminous_flux: { intensity: 1, solid_angle: 1 },
  illuminance: { intensity: 1, solid_angle: 1, length: -2 },
  luminous_exitance: { intensity: 1, solid_angle: 1, length: -2 },
  luminance: { intensity: 1, length: -2 },
  torque: { mass: 1, length: 2, time: -2 }, density: { mass: 1, length: -3 },
  flow: { length: 3, time: -1 }, viscosity: { mass: 1, length: -1, time: -1 },
  surface_tension: { mass: 1, time: -2 },
  thermal_conductivity: { mass: 1, length: 1, time: -3, temperature: -1 },
  specific_heat: { length: 2, time: -2, temperature: -1 },
  entropy: { mass: 1, length: 2, time: -2, temperature: -1 },
  concentration: { amount: 1, length: -3 },
  data: {}, rack_geometry: {}, shipping: {}, math: {},
  beer_wine_volume: { length: 3 }, refractive_power: { length: -1 },
  sound_pressure: { mass: 1, length: -1, time: -2 }, fuel_economy: { length: -2 },
  lightbulb: {}, photon: { mass: 1, length: 2, time: -2 },
  radioactive_decay: { time: -1 }, cross_section: { length: 2 },
  kinematic_viscosity: { length: 2, time: -1 },
  electric_field: { mass: 1, length: 1, time: -3, current: -1 },
  magnetic_field_h: { current: 1, length: -1 }, sound_intensity: { mass: 1, time: -3 },
  acoustic_impedance: { mass: 1, length: -4, time: -1 },
  fuel: { mass: 1, length: 2, time: -2 },
  archaic_length: { length: 1 }, archaic_mass: { mass: 1 },
  archaic_volume: { length: 3 }, archaic_area: { length: 2 },
  archaic_energy: { mass: 1, length: 2, time: -2 },
  archaic_power: { mass: 1, length: 2, time: -3 },
  typography: { length: 1 }, cooking: { length: 3 },
};

// Get category dimensions for a given category ID
function getCategoryDimensionsForParse(categoryId: UnitCategory): Record<string, number> {
  return CATEGORY_DIMENSION_MAP[categoryId] || {};
}

// Parse unit text and return parsed result
// unitText: the text after the number, e.g., "km", "meter", "µg"
// unitNameLookup: optional Map<lowercaseName, {categoryId, unitId}> for localized name matching
export function parseUnitSymbol(
  unitText: string,
  unitNameLookup?: Map<string, { categoryId: UnitCategory; unitId: string }>
): { categoryId: UnitCategory | null; unitId: string | null; prefixId: string; factor: number } {
  const symbolMap = getUnitSymbolMap();
  const normalizedText = unitText.trim();
  
  if (!normalizedText) {
    return { categoryId: null, unitId: null, prefixId: 'none', factor: 1 };
  }
  
  // 1. Try exact symbol match first (no prefix)
  const exactMatch = symbolMap.get(normalizedText);
  if (exactMatch) {
    return { 
      categoryId: exactMatch.categoryId, 
      unitId: exactMatch.unitId, 
      prefixId: 'none',
      factor: exactMatch.factor
    };
  }
  
  // 2. Try localized name match if provided
  if (unitNameLookup) {
    const nameLower = normalizedText.toLowerCase();
    const nameMatch = unitNameLookup.get(nameLower);
    if (nameMatch) {
      const category = CONVERSION_DATA.find(c => c.id === nameMatch.categoryId);
      const unit = category?.units.find(u => u.id === nameMatch.unitId);
      return {
        categoryId: nameMatch.categoryId,
        unitId: nameMatch.unitId,
        prefixId: 'none',
        factor: unit?.factor || 1
      };
    }
  }
  
  // 3. Try prefix + symbol match
  // Sort prefixes by symbol length (longest first) to match "micro" before "m"
  const sortedPrefixes = [...PREFIXES, ...BINARY_PREFIXES]
    .filter(p => p.id !== 'none' && p.symbol)
    .sort((a, b) => b.symbol.length - a.symbol.length);
  
  for (const prefix of sortedPrefixes) {
    if (normalizedText.startsWith(prefix.symbol)) {
      const remainder = normalizedText.slice(prefix.symbol.length);
      const unitMatch = symbolMap.get(remainder);
      
      if (unitMatch && unitMatch.allowPrefixes) {
        // Check for binary prefix usage - only allow on data category
        const isBinaryPrefix = BINARY_PREFIXES.some(bp => bp.id === prefix.id);
        if (isBinaryPrefix && unitMatch.categoryId !== 'data') {
          continue;
        }
        
        return {
          categoryId: unitMatch.categoryId,
          unitId: unitMatch.unitId,
          prefixId: prefix.id,
          factor: unitMatch.factor * prefix.factor
        };
      }
    }
  }
  
  // 4. No match found
  return { categoryId: null, unitId: null, prefixId: 'none', factor: 1 };
}

// SI base unit symbols mapped to dimension keys
const SI_BASE_UNIT_MAP: Record<string, { dimension: string; factor: number }> = {
  'kg': { dimension: 'mass', factor: 1 },
  'm': { dimension: 'length', factor: 1 },
  's': { dimension: 'time', factor: 1 },
  'A': { dimension: 'current', factor: 1 },
  'K': { dimension: 'temperature', factor: 1 },
  'mol': { dimension: 'amount', factor: 1 },
  'cd': { dimension: 'intensity', factor: 1 },
  'rad': { dimension: 'angle', factor: 1 },
  'sr': { dimension: 'solid_angle', factor: 1 },
  // Common non-SI units accepted for use with SI
  'h': { dimension: 'time', factor: 3600 },      // hour
  'min': { dimension: 'time', factor: 60 },      // minute
  'd': { dimension: 'time', factor: 86400 },     // day
  'mcg': { dimension: 'mass', factor: 1e-9 },    // microgram (medical notation)
};

// SI derived unit symbols mapped to their dimensional formulas
const SI_DERIVED_UNIT_MAP: Record<string, { dimensions: Record<string, number>; factor: number }> = {
  // Mechanical
  'N': { dimensions: { mass: 1, length: 1, time: -2 }, factor: 1 },  // Newton
  'J': { dimensions: { mass: 1, length: 2, time: -2 }, factor: 1 },  // Joule
  'W': { dimensions: { mass: 1, length: 2, time: -3 }, factor: 1 },  // Watt
  'Pa': { dimensions: { mass: 1, length: -1, time: -2 }, factor: 1 },  // Pascal
  'Hz': { dimensions: { time: -1 }, factor: 1 },  // Hertz
  // Electrical
  'V': { dimensions: { mass: 1, length: 2, time: -3, current: -1 }, factor: 1 },  // Volt
  'Ω': { dimensions: { mass: 1, length: 2, time: -3, current: -2 }, factor: 1 },  // Ohm
  'ohm': { dimensions: { mass: 1, length: 2, time: -3, current: -2 }, factor: 1 },  // Ohm (spelled)
  'F': { dimensions: { mass: -1, length: -2, time: 4, current: 2 }, factor: 1 },  // Farad
  'C': { dimensions: { time: 1, current: 1 }, factor: 1 },  // Coulomb
  'S': { dimensions: { mass: -1, length: -2, time: 3, current: 2 }, factor: 1 },  // Siemens
  // Magnetic
  'T': { dimensions: { mass: 1, time: -2, current: -1 }, factor: 1 },  // Tesla
  'Wb': { dimensions: { mass: 1, length: 2, time: -2, current: -1 }, factor: 1 },  // Weber
  'H': { dimensions: { mass: 1, length: 2, time: -2, current: -2 }, factor: 1 },  // Henry
  // Radiometry/Photometry
  'lm': { dimensions: { intensity: 1, solid_angle: 1 }, factor: 1 },  // Lumen
  'lx': { dimensions: { intensity: 1, solid_angle: 1, length: -2 }, factor: 1 },  // Lux
  // Radiation
  'Bq': { dimensions: { time: -1 }, factor: 1 },  // Becquerel
  'Gy': { dimensions: { length: 2, time: -2 }, factor: 1 },  // Gray
  'Sv': { dimensions: { length: 2, time: -2 }, factor: 1 },  // Sievert
  // Chemistry
  'kat': { dimensions: { amount: 1, time: -1 }, factor: 1 },  // Katal
  // Volume (non-SI accepted)
  'L': { dimensions: { length: 3 }, factor: 0.001 },  // Liter = 10⁻³ m³
  'l': { dimensions: { length: 3 }, factor: 0.001 },  // Liter (lowercase)
};

// Superscript to normal digit mapping
const SUPERSCRIPT_MAP: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-',
};

// Convert superscript string to number
function superscriptToNumber(superscript: string): number {
  let normal = '';
  for (const char of superscript) {
    if (SUPERSCRIPT_MAP[char] !== undefined) {
      normal += SUPERSCRIPT_MAP[char];
    }
  }
  return normal ? parseInt(normal, 10) : 1;
}

// Parse exponent from a unit term (handles both superscript and ASCII ^notation)
// Returns [baseSymbol, exponent]
function parseExponent(term: string): [string, number] {
  // Check for ASCII exponent notation: unit^n or unit^-n
  const asciiMatch = term.match(/^(.+?)\^(-?\d+)$/);
  if (asciiMatch) {
    return [asciiMatch[1], parseInt(asciiMatch[2], 10)];
  }
  
  // Check for superscript exponent at the end
  const superscriptRegex = /([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)$/;
  const superMatch = term.match(superscriptRegex);
  if (superMatch) {
    const base = term.slice(0, -superMatch[1].length);
    const exp = superscriptToNumber(superMatch[1]);
    return [base, exp];
  }
  
  // No exponent found, default to 1
  return [term, 1];
}

// Parse a dimensional formula string like "kg²⋅m⁴⋅s⁻⁶" or "kg^2*m^4*s^-6"
// Returns { dimensions, factor } where factor accounts for any prefix conversions
export interface ParsedDimensionalFormula {
  dimensions: Record<string, number>;
  factor: number;
  isValid: boolean;
}

// Helper function to process a single unit term and update dimensions/factor
// signMultiplier: 1 for numerator terms, -1 for denominator terms
function processTerm(
  term: string,
  signMultiplier: number,
  dimensions: Record<string, number>,
  factorRef: { value: number }
): boolean {
  const trimmedTerm = term.trim();
  if (!trimmedTerm) return true;
  
  const [baseSymbol, exponent] = parseExponent(trimmedTerm);
  const effectiveExponent = exponent * signMultiplier;
  
  // First try exact match with SI base units
  if (SI_BASE_UNIT_MAP[baseSymbol]) {
    const { dimension, factor: unitFactor } = SI_BASE_UNIT_MAP[baseSymbol];
    dimensions[dimension] = (dimensions[dimension] || 0) + effectiveExponent;
    factorRef.value *= Math.pow(unitFactor, effectiveExponent);
    return true;
  }
  
  // Try derived units (W, J, N, Pa, V, etc.)
  if (SI_DERIVED_UNIT_MAP[baseSymbol]) {
    const derived = SI_DERIVED_UNIT_MAP[baseSymbol];
    for (const [dim, dimExp] of Object.entries(derived.dimensions)) {
      dimensions[dim] = (dimensions[dim] || 0) + dimExp * effectiveExponent;
    }
    factorRef.value *= Math.pow(derived.factor, effectiveExponent);
    return true;
  }
  
  // Try with SI prefixes on base units
  const sortedPrefixes = [...PREFIXES]
    .filter(p => p.id !== 'none' && p.symbol)
    .sort((a, b) => b.symbol.length - a.symbol.length);
  
  for (const prefix of sortedPrefixes) {
    if (baseSymbol.startsWith(prefix.symbol)) {
      const remainder = baseSymbol.slice(prefix.symbol.length);
      if (SI_BASE_UNIT_MAP[remainder]) {
        const { dimension, factor: unitFactor } = SI_BASE_UNIT_MAP[remainder];
        dimensions[dimension] = (dimensions[dimension] || 0) + effectiveExponent;
        factorRef.value *= Math.pow(prefix.factor * unitFactor, effectiveExponent);
        return true;
      }
      // Also try derived units with prefixes (kW, MW, GJ, etc.)
      if (SI_DERIVED_UNIT_MAP[remainder]) {
        const derived = SI_DERIVED_UNIT_MAP[remainder];
        for (const [dim, dimExp] of Object.entries(derived.dimensions)) {
          dimensions[dim] = (dimensions[dim] || 0) + dimExp * effectiveExponent;
        }
        factorRef.value *= Math.pow(prefix.factor * derived.factor, effectiveExponent);
        return true;
      }
    }
  }
  
  // Special case: 'g' (gram) without prefix
  if (baseSymbol === 'g') {
    dimensions['mass'] = (dimensions['mass'] || 0) + effectiveExponent;
    factorRef.value *= Math.pow(0.001, effectiveExponent); // gram to kg
    return true;
  }
  
  // Special case: prefixed 'g' (gram) like µg, mg, ng
  for (const prefix of sortedPrefixes) {
    if (baseSymbol.startsWith(prefix.symbol) && baseSymbol.slice(prefix.symbol.length) === 'g') {
      dimensions['mass'] = (dimensions['mass'] || 0) + effectiveExponent;
      // prefix.factor converts to base (e.g., µ = 1e-6), then * 0.001 to convert g to kg
      factorRef.value *= Math.pow(prefix.factor * 0.001, effectiveExponent);
      return true;
    }
  }
  
  // Special case: '1' is dimensionless (for "1/s" notation)
  if (baseSymbol === '1') {
    // Contributes nothing to dimensions, factor is 1
    return true;
  }
  
  return false;
}

const parseExpPart = (expPart: string): number => {
  if (!expPart) return 1;
  if (expPart.startsWith('^')) return parseInt(expPart.slice(1), 10);
  return superscriptToNumber(expPart);
};

const parseSqDeg = (text: string): ParsedDimensionalFormula | null => {
  const m = text.match(/^\(?\s*sq\s+deg\s*\)?(\^(-?\d+)|[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]*)$/i);
  if (!m) return null;
  const exp = parseExpPart(m[1]);
  const sqDegToSr = (Math.PI / 180) * (Math.PI / 180);
  return { dimensions: { solid_angle: exp }, factor: Math.pow(sqDegToSr, exp), isValid: true };
};

const parseDeg = (text: string): ParsedDimensionalFormula | null => {
  const m = text.match(/^(°|deg(?:ree)?s?)(\^(-?\d+)|[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]*)$/i);
  if (!m) return null;
  const exp = parseExpPart(m[2]);
  return { dimensions: { angle: exp }, factor: Math.pow(Math.PI / 180, exp), isValid: true };
};

const parseDivisionParts = (text: string): { dimensions: Record<string, number>; factor: number; allValid: boolean } => {
  const dimensions: Record<string, number> = {};
  const factorRef = { value: 1 };
  let allValid = true;
  for (let i = 0; i < text.split('/').length; i++) {
    const part = text.split('/')[i].trim();
    if (!part) continue;
    const signMultiplier = i === 0 ? 1 : -1;
    const terms = part.split(/[⋅·*×]|\s+/).filter(t => t.trim());
    for (const term of terms) {
      if (!processTerm(term, signMultiplier, dimensions, factorRef)) allValid = false;
    }
  }
  for (const key of Object.keys(dimensions)) {
    if (dimensions[key] === 0) delete dimensions[key];
  }
  return { dimensions, factor: factorRef.value, allValid };
};

export function parseDimensionalFormula(formulaText: string): ParsedDimensionalFormula {
  const text = formulaText.trim();
  if (!text) return { dimensions: {}, factor: 1, isValid: false };
  const sqDeg = parseSqDeg(text);
  if (sqDeg) return sqDeg;
  const deg = parseDeg(text);
  if (deg) return deg;
  const { dimensions, factor, allValid } = parseDivisionParts(text);
  return { dimensions, factor, isValid: allValid && Object.keys(dimensions).length > 0 };
}

const DERIVED_UNITS_FOR_DIM_CHECK = ['W', 'J', 'N', 'Pa', 'Hz', 'V', 'Ω', 'ohm', 'F', 'C', 'S', 'T', 'Wb', 'H', 'lm', 'lx', 'Bq', 'Gy', 'Sv', 'kat'];
const SI_UNITS_FOR_DIM_CHECK = ['kg', 'm', 's', 'A', 'K', 'mol', 'cd', 'rad', 'sr'];

const hasDerivedUnitWithExponent = (trimmed: string): boolean =>
  DERIVED_UNITS_FOR_DIM_CHECK.some(unit =>
    new RegExp(`^${unit}(\\^-?\\d+|[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)$`).test(trimmed)
  );

const hasMultipleSIBaseUnits = (trimmed: string): boolean =>
  SI_UNITS_FOR_DIM_CHECK.filter(unit => trimmed.includes(unit)).length >= 2;

// Check if text looks like a dimensional formula (contains SI base units with exponents or separators)
export function looksLikeDimensionalFormula(text: string): boolean {
  const trimmed = text.trim();
  if (/[⋅·×*]/.test(trimmed)) return true;
  if (trimmed.includes('/')) return true;
  if (/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/.test(trimmed)) return true;
  if (/\^-?\d+/.test(trimmed)) return true;
  if (hasDerivedUnitWithExponent(trimmed)) return true;
  if (hasMultipleSIBaseUnits(trimmed)) return true;
  return false;
}

// Normalize compound unit separators (*,·,×,between-token -) to the canonical ⋅
function normalizeCompoundSeparators(unitText: string): string {
  return unitText
    .replace(/[*·×]/g, '⋅')
    .replace(/(?<=[a-zA-Z0-9])[-](?=[a-zA-Z])/g, '⋅');
}

// Map a SymbolMapEntry to the compact result shape used by lookupCompoundUnitSymbol
function mapEntry(e: SymbolMapEntry): { categoryId: UnitCategory; unitId: string } {
  return { categoryId: e.categoryId, unitId: e.unitId };
}

// Attempt a direct symbol lookup in the unit catalog after normalising separators.
// Also handles the lbf→lb alias so "ft⋅lbf" resolves to the torque "ft⋅lb" entry.
// Returns a match if found, null otherwise.
function lookupCompoundUnitSymbol(
  unitText: string
): { categoryId: UnitCategory; unitId: string } | null {
  const normalized = normalizeCompoundSeparators(unitText);
  if (normalized === unitText && !unitText.includes('⋅')) return null;
  const map = getUnitSymbolMap();
  const withLbAlias = normalized.replace(/(^|⋅)lbf(⋅|$)/g, '$1lb$2');
  if (withLbAlias !== normalized) {
    const aliasEntry = map.get(withLbAlias);
    if (aliasEntry) return mapEntry(aliasEntry);
  }
  const entry = map.get(normalized);
  return entry ? mapEntry(entry) : null;
}

// Parse complete text with number and unit
export function parseUnitText(
  text: string,
  unitNameLookup?: Map<string, { categoryId: UnitCategory; unitId: string }>
): ParsedUnitResult {
  const trimmed = text.trim()
    .replace(/\u00A0/g, ' ')  // Replace non-breaking spaces
    .replace(/\u202F/g, ' '); // Replace narrow no-break spaces
  
  if (!trimmed) {
    return { value: 1, originalValue: 1, categoryId: null, unitId: null, prefixId: 'none', dimensions: {} };
  }
  
  // Try to extract number from the beginning
  // Support scientific notation, comma/dot decimal separators
  const numberMatch = trimmed.match(/^([+-]?\d+(?:[.,]\d+)?(?:[eE][+-]?\d+)?)\s*/);
  
  let numValue = 1;
  let unitText = trimmed;
  
  if (numberMatch) {
    const numStr = numberMatch[1].replace(',', '.'); // Normalize decimal separator
    numValue = parseFloat(numStr);
    if (isNaN(numValue)) numValue = 1;
    unitText = trimmed.slice(numberMatch[0].length);
  } else {
    // No number found - default to 1
    numValue = 1;
  }
  
  // Check for bare exponent (like "⁻¹" or "^-1") - apply to the number itself
  const bareExponentMatch = unitText.match(/^(\^-?\d+|[⁻⁺]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/);
  if (bareExponentMatch) {
    const expStr = bareExponentMatch[1];
    let exponent = 1;
    
    if (expStr.startsWith('^')) {
      exponent = parseInt(expStr.slice(1), 10);
    } else {
      // Parse superscript characters
      const superscriptMap: Record<string, string> = {
        '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
        '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
        '⁻': '-', '⁺': '+'
      };
      const normalized = expStr.split('').map(c => superscriptMap[c] || c).join('');
      exponent = parseInt(normalized, 10);
    }
    
    if (!isNaN(exponent)) {
      return {
        value: Math.pow(numValue, exponent),
        originalValue: numValue,
        categoryId: null,
        unitId: null,
        prefixId: 'none',
        dimensions: {}
      };
    }
  }
  
  // If unit text looks like a dimensional formula, first attempt a direct symbol
  // lookup (after normalising separator characters). If a registered unit matches
  // exactly, use its category rather than falling through to dimensional
  // decomposition — this prevents ambiguous dimension strings (e.g. N⋅m which
  // shares dimensions with Joules) from routing to the wrong category.
  if (unitText && looksLikeDimensionalFormula(unitText)) {
    const directMatch = lookupCompoundUnitSymbol(unitText);
    if (directMatch) {
      const matchedCategoryId = directMatch.categoryId;
      const matchedUnitId = directMatch.unitId;
      const category = CONVERSION_DATA.find(c => c.id === matchedCategoryId);
      const unit = category?.units.find(u => u.id === matchedUnitId);
      const unitFactor = unit?.factor ?? 1;
      return {
        value: numValue * unitFactor,
        originalValue: numValue,
        categoryId: matchedCategoryId,
        unitId: matchedUnitId,
        prefixId: 'none',
        dimensions: getCategoryDimensionsForParse(matchedCategoryId)
      };
    }

    const dimResult = parseDimensionalFormula(unitText);
    if (dimResult.isValid) {
      return {
        value: numValue * dimResult.factor,
        originalValue: numValue,
        categoryId: null, // Dimensional formulas don't map to a specific category
        unitId: null,
        prefixId: 'none',
        dimensions: dimResult.dimensions
      };
    }
  }
  
  // Check for degree symbol alone (°) - treat as angle
  if (unitText === '°') {
    return {
      value: numValue * (Math.PI / 180),
      originalValue: numValue,
      categoryId: 'angle',
      unitId: 'rad',
      prefixId: 'none',
      dimensions: { angle: 1 }
    };
  }
  
  // Check for "deg" shorthand (if localized name would start with "deg")
  if (/^deg$/i.test(unitText)) {
    return {
      value: numValue * (Math.PI / 180),
      originalValue: numValue,
      categoryId: 'angle',
      unitId: 'rad',
      prefixId: 'none',
      dimensions: { angle: 1 }
    };
  }
  
  // Check for "sq deg" (solid angle)
  if (/^sq\s*deg$/i.test(unitText)) {
    const sqDegToSr = (Math.PI / 180) * (Math.PI / 180);
    return {
      value: numValue * sqDegToSr,
      originalValue: numValue,
      categoryId: 'solid_angle',
      unitId: 'sr',
      prefixId: 'none',
      dimensions: { solid_angle: 1 }
    };
  }
  
  // Before falling through to symbol matching, try a compound lookup for
  // hyphen-separated compound units like "ft-lb" that would not have been caught
  // by looksLikeDimensionalFormula (which does not treat `-` as a separator).
  if (unitText && /(?<=[a-zA-Z0-9])-(?=[a-zA-Z])/.test(unitText)) {
    const directMatch = lookupCompoundUnitSymbol(unitText);
    if (directMatch) {
      const matchedCategoryId = directMatch.categoryId;
      const matchedUnitId = directMatch.unitId;
      const category = CONVERSION_DATA.find(c => c.id === matchedCategoryId);
      const unit = category?.units.find(u => u.id === matchedUnitId);
      const unitFactor = unit?.factor ?? 1;
      return {
        value: numValue * unitFactor,
        originalValue: numValue,
        categoryId: matchedCategoryId,
        unitId: matchedUnitId,
        prefixId: 'none',
        dimensions: getCategoryDimensionsForParse(matchedCategoryId)
      };
    }
  }

  // Parse the unit part using standard symbol matching
  const unitResult = parseUnitSymbol(unitText, unitNameLookup);
  
  // Get dimensions for the matched category
  const dimensions = unitResult.categoryId 
    ? getCategoryDimensionsForParse(unitResult.categoryId) 
    : {};
  
  // Apply prefix factor to value for matched units
  const adjustedValue = unitResult.categoryId 
    ? numValue * unitResult.factor 
    : numValue;
  
  return {
    value: adjustedValue,
    originalValue: numValue,
    categoryId: unitResult.categoryId,
    unitId: unitResult.unitId,
    prefixId: unitResult.prefixId,
    dimensions
  };
}

// Categories with special ordering that shouldn't be re-sorted
const PRESERVE_ORDER_CATEGORIES = [
  'lightbulb', 'math', 'fuel_economy', 'temperature', 
  'radioactive_decay', 'fuel', 'photon', 'rack_geometry', 'shipping'
];

// Get filtered and sorted units for a category
// Rule: SI base unit first (factor=1 or matches baseSISymbol), then ALL other units sorted by ascending factor
const findSIBaseUnit = (units: UnitDefinition[], baseSISymbol?: string): UnitDefinition | undefined => {
  const baseFactor1 = units.find(u => Math.abs(u.factor - 1) < 1e-10);
  if (baseFactor1) return baseFactor1;
  if (baseSISymbol) return units.find(u => u.symbol === baseSISymbol);
  return undefined;
};

const sortUnitsWithBase = (units: UnitDefinition[], baseUnit: UnitDefinition | undefined): UnitDefinition[] =>
  [...units].sort((a, b) => {
    if (baseUnit) {
      if (a.id === baseUnit.id && b.id !== baseUnit.id) return -1;
      if (a.id !== baseUnit.id && b.id === baseUnit.id) return 1;
    }
    return a.factor - b.factor;
  });

// Special handling for offset/inverse units to preserve data ordering
export function getFilteredSortedUnits(category: string): UnitDefinition[] {
  const catData = CONVERSION_DATA.find(c => c.id === category);
  if (!catData) return [];
  const units = catData.units;
  if (PRESERVE_ORDER_CATEGORIES.includes(category)) return units;
  const hasOffsetUnits = units.some(u => u.offset !== undefined && u.offset !== 0);
  const hasInverseUnits = units.some(u => u.isInverse === true);
  if (hasOffsetUnits || hasInverseUnits) return units;
  return sortUnitsWithBase(units, findSIBaseUnit(units, catData.baseSISymbol));
}
