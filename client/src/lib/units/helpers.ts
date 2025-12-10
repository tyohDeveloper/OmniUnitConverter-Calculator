import type { DimensionalFormula } from './shared-types';
import { PREFIXES } from './prefixes';

export const PREFIX_EXPONENTS: Record<string, number> = {
  'yotta': 24, 'zetta': 21, 'exa': 18, 'peta': 15, 'tera': 12,
  'giga': 9, 'mega': 6, 'kilo': 3, 'none': 0, 'centi': -2,
  'milli': -3, 'micro': -6, 'nano': -9, 'pico': -12,
  'femto': -15, 'atto': -18, 'zepto': -21, 'yocto': -24
};

export const EXPONENT_TO_PREFIX: Record<number, string> = {
  24: 'yotta', 21: 'zetta', 18: 'exa', 15: 'peta', 12: 'tera',
  9: 'giga', 6: 'mega', 3: 'kilo', 0: 'none', 
  [-2]: 'centi', [-3]: 'milli', [-6]: 'micro', [-9]: 'nano', [-12]: 'pico',
  [-15]: 'femto', [-18]: 'atto', [-21]: 'zepto', [-24]: 'yocto'
};

export const GRAM_TO_KG_UNIT_PAIRS: Record<string, string> = {
  'g': 'kg',
  'gm3': 'kgm3',
  'gms': 'kgms',
  'jgk': 'jkgk',
};

export const KG_TO_GRAM_UNIT_PAIRS: Record<string, string> = {
  'kg': 'g',
  'kgm3': 'gm3',
  'kgms': 'gms',
  'jkgk': 'jgk',
};

export const toTitleCase = (str: string): string => {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

export const applyRegionalSpelling = (unitName: string, language: string): string => {
  if (language !== 'en' && language !== 'en-us') {
    return unitName;
  }
  
  if (language === 'en-us') {
    return unitName
      .replace(/\s*\(Petrol\)/g, '')
      .replace(/\s*\(Paraffin\)/g, '');
  }
  
  return unitName
    .replace(/Gasoline\s*\(Petrol\)/g, 'Petrol')
    .replace(/Kerosene\s*\(Paraffin\)/g, 'Paraffin')
    .replace(/Gasoline/g, 'Petrol')
    .replace(/Kerosene/g, 'Paraffin')
    .replace(/Meter/g, 'Metre')
    .replace(/meter/g, 'metre')
    .replace(/Liter/g, 'Litre')
    .replace(/liter/g, 'litre');
};

export const normalizeMassUnit = (
  unit: string, 
  prefix: string
): { unit: string; prefix: string } => {
  const gEquivalent = KG_TO_GRAM_UNIT_PAIRS[unit];
  if (gEquivalent && prefix !== 'none' && prefix !== 'kilo') {
    return { unit: gEquivalent, prefix };
  }
  
  const kgEquivalent = GRAM_TO_KG_UNIT_PAIRS[unit];
  if (kgEquivalent && prefix === 'kilo') {
    return { unit: kgEquivalent, prefix: 'none' };
  }
  
  return { unit, prefix };
};

export interface MassDisplayResult {
  value: number; 
  unitSymbol: string; 
  prefixSymbol: string;
  normalizedPrefix: string;
  normalizedUnit: string;
  shouldNormalize: boolean;
}

export const normalizeMassDisplay = (
  valueInKg: number, 
  currentPrefix: string, 
  unitId: string | null,
  getUnitInfo: (unitId: string) => { factor: number; symbol: string; allowPrefixes: boolean } | undefined
): MassDisplayResult => {
  const isKgUnit = unitId === 'kg' || unitId === null;
  
  if (!isKgUnit) {
    const prefixData = PREFIXES.find(p => p.id === currentPrefix) || PREFIXES.find(p => p.id === 'none')!;
    const unit = unitId ? getUnitInfo(unitId) : undefined;
    return {
      value: unit ? valueInKg / (unit.factor * (unit.allowPrefixes ? prefixData.factor : 1)) : valueInKg,
      unitSymbol: unit?.symbol || 'kg',
      prefixSymbol: unit?.allowPrefixes ? prefixData.symbol : '',
      normalizedPrefix: currentPrefix,
      normalizedUnit: unitId || 'kg',
      shouldNormalize: false
    };
  }
  
  if (currentPrefix !== 'none' && currentPrefix !== 'kilo') {
    const prefixExp = PREFIX_EXPONENTS[currentPrefix] || 0;
    const combinedExp = prefixExp + 3;
    
    const newPrefix = EXPONENT_TO_PREFIX[combinedExp];
    if (newPrefix) {
      const newPrefixData = PREFIXES.find(p => p.id === newPrefix) || PREFIXES.find(p => p.id === 'none')!;
      const valueInGrams = valueInKg * 1000;
      const displayValue = valueInGrams / newPrefixData.factor;
      return {
        value: displayValue,
        unitSymbol: 'g',
        prefixSymbol: newPrefixData.symbol,
        normalizedPrefix: newPrefix,
        normalizedUnit: 'g',
        shouldNormalize: true
      };
    }
  }
  
  const prefixData = PREFIXES.find(p => p.id === currentPrefix) || PREFIXES.find(p => p.id === 'none')!;
  return {
    value: currentPrefix === 'kilo' ? valueInKg : valueInKg / prefixData.factor,
    unitSymbol: 'kg',
    prefixSymbol: currentPrefix === 'kilo' ? '' : prefixData.symbol,
    normalizedPrefix: currentPrefix === 'kilo' ? 'none' : currentPrefix,
    normalizedUnit: 'kg',
    shouldNormalize: false
  };
};

export const normalizeMassValue = (valueInKg: number): { 
  value: number; 
  unitSymbol: string; 
  prefixSymbol: string;
  prefixId: string;
} => {
  const valueInGrams = valueInKg * 1000;
  const absGrams = Math.abs(valueInGrams);
  
  const prefixOrder = [
    { id: 'yotta', exp: 24 }, { id: 'zetta', exp: 21 }, { id: 'exa', exp: 18 },
    { id: 'peta', exp: 15 }, { id: 'tera', exp: 12 }, { id: 'giga', exp: 9 },
    { id: 'mega', exp: 6 }, { id: 'kilo', exp: 3 }, { id: 'none', exp: 0 },
    { id: 'milli', exp: -3 }, { id: 'micro', exp: -6 }, { id: 'nano', exp: -9 },
    { id: 'pico', exp: -12 }, { id: 'femto', exp: -15 }, { id: 'atto', exp: -18 },
    { id: 'zepto', exp: -21 }, { id: 'yocto', exp: -24 }
  ];
  
  let bestPrefix = { id: 'none', exp: 0 };
  for (const p of prefixOrder) {
    const factor = Math.pow(10, p.exp);
    if (absGrams >= factor) {
      bestPrefix = p;
      break;
    }
  }
  
  if (bestPrefix.id === 'kilo') {
    return {
      value: valueInKg,
      unitSymbol: 'kg',
      prefixSymbol: '',
      prefixId: 'none'
    };
  }
  
  const prefixData = PREFIXES.find(p => p.id === bestPrefix.id) || PREFIXES.find(p => p.id === 'none')!;
  const displayValue = valueInGrams / prefixData.factor;
  
  return {
    value: displayValue,
    unitSymbol: 'g',
    prefixSymbol: prefixData.symbol,
    prefixId: bestPrefix.id
  };
};

export const applyPrefixToKgUnit = (
  unitSymbol: string, 
  prefixId: string
): { displaySymbol: string; effectivePrefixFactor: number; showPrefix: boolean } => {
  const containsKg = unitSymbol.includes('kg');
  
  if (!containsKg) {
    const prefixData = PREFIXES.find(p => p.id === prefixId) || PREFIXES.find(p => p.id === 'none')!;
    return {
      displaySymbol: unitSymbol,
      effectivePrefixFactor: prefixData.factor,
      showPrefix: prefixId !== 'none'
    };
  }
  
  if (prefixId === 'none' || prefixId === 'kilo') {
    return {
      displaySymbol: unitSymbol,
      effectivePrefixFactor: 1,
      showPrefix: false
    };
  }
  
  const prefixData = PREFIXES.find(p => p.id === prefixId) || PREFIXES.find(p => p.id === 'none')!;
  const transformedSymbol = unitSymbol.replace(/kg/g, prefixData.symbol + 'g');
  const effectivePrefixFactor = 1000 / prefixData.factor;
  
  return {
    displaySymbol: transformedSymbol,
    effectivePrefixFactor,
    showPrefix: false
  };
};

export const getDimensionSignature = (dims: DimensionalFormula): string => {
  const entries = Object.entries(dims)
    .filter(([_, exp]) => exp !== 0 && exp !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([dim, exp]) => `${dim}:${exp}`).join(',');
};

export const dimensionsEqual = (a: DimensionalFormula, b: DimensionalFormula): boolean => {
  const normalize = (d: DimensionalFormula): DimensionalFormula => {
    const result: DimensionalFormula = {};
    for (const [key, value] of Object.entries(d)) {
      if (value !== 0 && value !== undefined) {
        result[key as keyof DimensionalFormula] = value;
      }
    }
    return result;
  };
  
  const normA = normalize(a);
  const normB = normalize(b);
  
  const keysA = Object.keys(normA) as (keyof DimensionalFormula)[];
  const keysB = Object.keys(normB) as (keyof DimensionalFormula)[];
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (normA[key] !== normB[key]) return false;
  }
  
  return true;
};

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
  cross_section: { name: 'Cross-Section', dimensions: { length: 2 }, isBase: false },
  photon: { name: 'Photon', dimensions: { mass: 1, length: 2, time: -2 }, isBase: false },
  
  luminous_flux: { name: 'Luminous Flux', dimensions: { intensity: 1, solid_angle: 1 }, isBase: false },
  illuminance: { name: 'Illuminance', dimensions: { intensity: 1, solid_angle: 1, length: -2 }, isBase: false },
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
  beer_wine_volume: { name: 'Beer & Wine Volume', dimensions: { length: 3 }, isBase: false },
  data: { name: 'Data/Information', dimensions: {}, isBase: false },
  fuel_economy: { name: 'Fuel Economy', dimensions: { length: -2 }, isBase: false },
  lightbulb: { name: 'Lightbulb Efficiency', dimensions: { intensity: 1, solid_angle: 1 }, isBase: false },
  rack_geometry: { name: 'Rack Geometry', dimensions: { length: 1 }, isBase: false },
  shipping: { name: 'Shipping Volume', dimensions: { length: 3 }, isBase: false },
  math: { name: 'Math Functions', dimensions: {}, isBase: false },
};

export const EXCLUDED_CROSS_DOMAIN_CATEGORIES = [
  'archaic_length', 'archaic_mass', 'archaic_volume', 'archaic_area', 'archaic_energy', 'archaic_power',
  'typography', 'cooking', 'beer_wine_volume', 'fuel', 'fuel_economy', 'lightbulb', 'rack_geometry', 'shipping',
  'data', 'math'
];

export const findCrossDomainMatches = (
  dimensions: DimensionalFormula, 
  _currentCategory?: string
): string[] => {
  const matches: string[] = [];
  
  if (Object.keys(dimensions).length === 0) return matches;
  
  for (const [catId, info] of Object.entries(CATEGORY_DIMENSIONS)) {
    if (info.isBase) continue;
    if (EXCLUDED_CROSS_DOMAIN_CATEGORIES.includes(catId)) continue;
    if (Object.keys(info.dimensions).length === 0) continue;
    
    if (dimensionsEqual(dimensions, info.dimensions)) {
      matches.push(info.name);
    }
  }
  
  return matches;
};

export interface PreferredRepresentation {
  displaySymbol: string;
  isSI: boolean;
  allowPrefixes: boolean;
}

export const PREFERRED_REPRESENTATIONS: Record<string, PreferredRepresentation> = {
  'length:2,time:-1': { displaySymbol: 'St', isSI: false, allowPrefixes: true },
  'length:2,mass:1,time:-1': { displaySymbol: 'J⋅s', isSI: true, allowPrefixes: true },
  'length:2,time:-2': { displaySymbol: 'Gy', isSI: true, allowPrefixes: true },
  'length:-2,mass:1,time:-1': { displaySymbol: 'Pa⋅s⋅m⁻¹', isSI: true, allowPrefixes: true },
  'mass:1,time:-3': { displaySymbol: 'W⋅m⁻²', isSI: true, allowPrefixes: true },
};

export const buildDimensionalSymbol = (dims: DimensionalFormula): string => {
  const siSymbols: Record<keyof DimensionalFormula, string> = {
    length: 'm',
    mass: 'kg',
    time: 's',
    current: 'A',
    temperature: 'K',
    amount: 'mol',
    intensity: 'cd',
    angle: 'rad',
    solid_angle: 'sr',
  };
  
  const superscripts: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻'
  };
  
  const toSuperscript = (n: number): string => {
    return String(n).split('').map(c => superscripts[c] || c).join('');
  };
  
  const parts: string[] = [];
  
  const positiveTerms = Object.entries(dims)
    .filter(([_, exp]) => exp !== undefined && exp > 0)
    .sort(([a], [b]) => a.localeCompare(b));
    
  const negativeTerms = Object.entries(dims)
    .filter(([_, exp]) => exp !== undefined && exp < 0)
    .sort(([a], [b]) => a.localeCompare(b));
  
  for (const [dim, exp] of positiveTerms) {
    const symbol = siSymbols[dim as keyof DimensionalFormula] || dim;
    parts.push(exp === 1 ? symbol : `${symbol}${toSuperscript(exp!)}`);
  }
  
  for (const [dim, exp] of negativeTerms) {
    const symbol = siSymbols[dim as keyof DimensionalFormula] || dim;
    parts.push(`${symbol}${toSuperscript(exp!)}`);
  }
  
  return parts.join('⋅');
};
