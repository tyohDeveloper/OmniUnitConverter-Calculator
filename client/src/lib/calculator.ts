import { NON_SI_UNITS_CATALOG } from './units/shared-types';

export interface DimensionalFormula {
  length?: number;
  mass?: number;
  time?: number;
  current?: number;
  temperature?: number;
  amount?: number;
  intensity?: number;
  angle?: number;
  solid_angle?: number;
}

export interface CalcValue {
  value: number;
  dimensions: DimensionalFormula;
}

export interface DerivedUnitInfo {
  symbol: string;
  category: string;
  unitId: string;
  dimensions: DimensionalFormula;
  allowPrefixes: boolean;
}

export interface CategoryDimensionInfo {
  name: string;
  dimensions: DimensionalFormula;
  isBase: boolean;
}

export const SI_DERIVED_UNITS: DerivedUnitInfo[] = [
  { symbol: 'N', category: 'force', unitId: 'n', dimensions: { mass: 1, length: 1, time: -2 }, allowPrefixes: true },
  { symbol: 'Pa', category: 'pressure', unitId: 'pa', dimensions: { mass: 1, length: -1, time: -2 }, allowPrefixes: true },
  { symbol: 'J', category: 'energy', unitId: 'j', dimensions: { mass: 1, length: 2, time: -2 }, allowPrefixes: true },
  { symbol: 'W', category: 'power', unitId: 'w', dimensions: { mass: 1, length: 2, time: -3 }, allowPrefixes: true },
  { symbol: 'C', category: 'charge', unitId: 'c', dimensions: { current: 1, time: 1 }, allowPrefixes: true },
  { symbol: 'V', category: 'potential', unitId: 'v', dimensions: { mass: 1, length: 2, time: -3, current: -1 }, allowPrefixes: true },
  { symbol: 'F', category: 'capacitance', unitId: 'f', dimensions: { mass: -1, length: -2, time: 4, current: 2 }, allowPrefixes: true },
  { symbol: 'Ω', category: 'resistance', unitId: 'ohm', dimensions: { mass: 1, length: 2, time: -3, current: -2 }, allowPrefixes: true },
  { symbol: 'S', category: 'conductance', unitId: 's', dimensions: { mass: -1, length: -2, time: 3, current: 2 }, allowPrefixes: true },
  { symbol: 'Wb', category: 'magnetic_flux', unitId: 'wb', dimensions: { mass: 1, length: 2, time: -2, current: -1 }, allowPrefixes: true },
  { symbol: 'T', category: 'magnetic_density', unitId: 't', dimensions: { mass: 1, time: -2, current: -1 }, allowPrefixes: true },
  { symbol: 'H', category: 'inductance', unitId: 'h', dimensions: { mass: 1, length: 2, time: -2, current: -2 }, allowPrefixes: true },
  { symbol: 'lm', category: 'luminous_flux', unitId: 'lm', dimensions: { intensity: 1, solid_angle: 1 }, allowPrefixes: true },
  { symbol: 'lx', category: 'illuminance', unitId: 'lx', dimensions: { intensity: 1, solid_angle: 1, length: -2 }, allowPrefixes: true },
  { symbol: 'Bq', category: 'radioactivity', unitId: 'bq', dimensions: { time: -1 }, allowPrefixes: true },
  { symbol: 'Gy', category: 'absorbed_dose', unitId: 'gy', dimensions: { length: 2, time: -2 }, allowPrefixes: true },
  { symbol: 'Sv', category: 'equivalent_dose', unitId: 'sv', dimensions: { length: 2, time: -2 }, allowPrefixes: true },
  { symbol: 'kat', category: 'catalytic', unitId: 'kat', dimensions: { amount: 1, time: -1 }, allowPrefixes: true },
  { symbol: 'rad', category: 'angle', unitId: 'rad', dimensions: { angle: 1 }, allowPrefixes: true },
  { symbol: 'sr', category: 'solid_angle', unitId: 'sr', dimensions: { solid_angle: 1 }, allowPrefixes: true },
  // Photon energy-equivalents (via Planck relations E = hν and E = hc/λ)
  { symbol: 'ν', category: 'photon', unitId: 'photon_freq', dimensions: { mass: 1, length: 2, time: -2 }, allowPrefixes: true },
  { symbol: 'λ', category: 'photon', unitId: 'photon_wavelength', dimensions: { mass: 1, length: 2, time: -2 }, allowPrefixes: true },
];

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
  
  fuel_economy: { name: 'Fuel Economy', dimensions: { length: -2 }, isBase: false },
  lightbulb: { name: 'Lightbulb Efficiency', dimensions: { intensity: 1, solid_angle: 1 }, isBase: false },
  
  data: { name: 'Data/Information', dimensions: {}, isBase: false },
  math: { name: 'Math Functions', dimensions: {}, isBase: false },
};

export const dimensionsEqual = (d1: DimensionalFormula, d2: DimensionalFormula): boolean => {
  const keys1 = Object.keys(d1) as (keyof DimensionalFormula)[];
  const keys2 = Object.keys(d2) as (keyof DimensionalFormula)[];
  
  const nonZeroKeys1 = keys1.filter(k => d1[k] !== 0 && d1[k] !== undefined);
  const nonZeroKeys2 = keys2.filter(k => d2[k] !== 0 && d2[k] !== undefined);
  
  if (nonZeroKeys1.length !== nonZeroKeys2.length) return false;
  
  for (const key of nonZeroKeys1) {
    if ((d1[key] || 0) !== (d2[key] || 0)) return false;
  }
  
  return true;
};

export const isDimensionless = (d: DimensionalFormula): boolean => {
  return Object.keys(d).filter(k => d[k as keyof DimensionalFormula] !== 0).length === 0;
};

// Categories to exclude from cross-domain matching (archaic, specialty, other)
const EXCLUDED_CROSS_DOMAIN_CATEGORIES = [
  'archaic_length', 'archaic_mass', 'archaic_volume', 'archaic_area', 'archaic_energy', 'archaic_power',
  'typography', 'cooking', 'beer_wine_volume', 'fuel', 'fuel_economy', 'lightbulb', 'rack_geometry', 'shipping',
  'data', 'math'
];

export const findCrossDomainMatches = (
  dimensions: DimensionalFormula, 
  _currentCategory?: string
): string[] => {
  const matches: string[] = [];
  
  if (isDimensionless(dimensions)) return matches;
  
  for (const [catId, info] of Object.entries(CATEGORY_DIMENSIONS)) {
    // Skip base quantities (they ARE the base dimensions, not derived quantities)
    if (info.isBase) continue;
    
    // Skip archaic, specialty, and other excluded categories
    if (EXCLUDED_CROSS_DOMAIN_CATEGORIES.includes(catId)) continue;
    
    if (isDimensionless(info.dimensions)) continue;
    
    if (dimensionsEqual(dimensions, info.dimensions)) {
      matches.push(info.name);
    }
  }
  
  return matches;
};

export const isValidSymbolRepresentation = (symbol: string): boolean => {
  if (!symbol || symbol === '1') return true;
  
  const baseUnitPatterns = ['kg', 'm', 's', 'A', 'K', 'mol', 'cd', 'rad', 'sr'];
  
  const parts = symbol.split('⋅');
  
  const extractBaseUnit = (part: string): string => {
    return part.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, '');
  };
  
  const baseUnitsFound: string[] = [];
  for (const part of parts) {
    const baseUnit = extractBaseUnit(part);
    if (baseUnitPatterns.includes(baseUnit)) {
      if (baseUnitsFound.includes(baseUnit)) {
        return false;
      }
      baseUnitsFound.push(baseUnit);
    }
  }
  
  return true;
};

export const countUnits = (symbol: string): number => {
  if (!symbol || symbol === '1') return 0;
  return symbol.split('⋅').length;
};

export const multiplyDimensions = (
  d1: DimensionalFormula, 
  d2: DimensionalFormula
): DimensionalFormula => {
  const result: DimensionalFormula = { ...d1 };
  for (const [dim, exp] of Object.entries(d2)) {
    const key = dim as keyof DimensionalFormula;
    result[key] = (result[key] || 0) + (exp || 0);
    if (result[key] === 0) delete result[key];
  }
  return result;
};

export const divideDimensions = (
  d1: DimensionalFormula, 
  d2: DimensionalFormula
): DimensionalFormula => {
  const result: DimensionalFormula = { ...d1 };
  for (const [dim, exp] of Object.entries(d2)) {
    const key = dim as keyof DimensionalFormula;
    result[key] = (result[key] || 0) - (exp || 0);
    if (result[key] === 0) delete result[key];
  }
  return result;
};

export const formatDimensions = (dims: DimensionalFormula): string => {
  const superscripts: Record<string, string> = {
    '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
  };
  
  const toSuperscript = (n: number): string => {
    return n.toString().split('').map(c => superscripts[c] || c).join('');
  };
  
  const baseSymbols: Record<string, string> = {
    length: 'm',
    mass: 'kg',
    time: 's',
    current: 'A',
    temperature: 'K',
    amount: 'mol',
    intensity: 'cd',
    angle: 'rad',
    solid_angle: 'sr'
  };
  
  const order: (keyof DimensionalFormula)[] = [
    'mass', 'length', 'time', 'current', 'temperature', 'amount', 'intensity', 'angle', 'solid_angle'
  ];
  
  const positive: string[] = [];
  const negative: string[] = [];
  
  for (const dim of order) {
    const exp = dims[dim];
    if (exp && exp !== 0) {
      const symbol = baseSymbols[dim];
      const part = exp === 1 ? symbol : `${symbol}${toSuperscript(exp)}`;
      if (exp > 0) {
        positive.push(part);
      } else {
        negative.push(part);
      }
    }
  }
  
  return [...positive, ...negative].join('⋅');
};

// Convert a number to superscript string
export const toSuperscript = (n: number): string => {
  const superscripts: Record<string, string> = {
    '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
  };
  return n.toString().split('').map(c => superscripts[c] || c).join('');
};

// Result type for derived unit power detection
export interface DerivedUnitPowerMatch {
  symbol: string;        // e.g., "W²" or "J³"
  baseSymbol: string;    // e.g., "W" or "J"
  power: number;         // e.g., 2 or 3
  category: string;      // e.g., "power" or "energy"
}

// Check if dimensions are an integer power of a known SI derived unit
// For example, kg²⋅m⁴⋅s⁻⁶ = W² (power dimensions * 2)
export const findDerivedUnitPower = (dimensions: DimensionalFormula): DerivedUnitPowerMatch | null => {
  if (isDimensionless(dimensions)) return null;
  
  // Get all non-zero dimension exponents
  const dimEntries = Object.entries(dimensions).filter(([, exp]) => exp !== 0 && exp !== undefined) as [keyof DimensionalFormula, number][];
  if (dimEntries.length === 0) return null;
  
  // For each SI derived unit, check if the dimensions are an integer multiple
  for (const derivedUnit of SI_DERIVED_UNITS) {
    // Skip photon units (special case)
    if (derivedUnit.category === 'photon') continue;
    
    const unitDims = derivedUnit.dimensions;
    const unitEntries = Object.entries(unitDims).filter(([, exp]) => exp !== 0 && exp !== undefined) as [keyof DimensionalFormula, number][];
    
    if (unitEntries.length === 0) continue;
    
    // Check if the input dimensions have the same dimension keys (with different exponents)
    const inputKeys = dimEntries.map(([k]) => k);
    const unitKeysSet = new Set(unitEntries.map(([k]) => k));
    
    if (inputKeys.length !== unitKeysSet.size) continue;
    
    let keysMatch = true;
    for (let i = 0; i < inputKeys.length; i++) {
      if (!unitKeysSet.has(inputKeys[i])) {
        keysMatch = false;
        break;
      }
    }
    if (!keysMatch) continue;
    
    // Check if all exponents are the same integer multiple
    let power: number | null = null;
    let isMultiple = true;
    
    for (const [dim, inputExp] of dimEntries) {
      const unitExp = unitDims[dim] || 0;
      if (unitExp === 0) {
        isMultiple = false;
        break;
      }
      
      const ratio = inputExp / unitExp;
      
      // Must be an integer and greater than 1 (powers of 1 are just the unit itself)
      if (!Number.isInteger(ratio) || ratio <= 1) {
        isMultiple = false;
        break;
      }
      
      if (power === null) {
        power = ratio;
      } else if (power !== ratio) {
        isMultiple = false;
        break;
      }
    }
    
    if (isMultiple && power !== null && power > 1) {
      return {
        symbol: `${derivedUnit.symbol}${toSuperscript(power)}`,
        baseSymbol: derivedUnit.symbol,
        power,
        category: derivedUnit.category
      };
    }
  }
  
  return null;
};

// ============================================================================
// SI Representation Generation
// Pure functions for generating all valid SI unit representations for dimensions
// ============================================================================

// SI representation for calculator dropdown
export interface SIRepresentation {
  displaySymbol: string;      // How to display, e.g., "W", "J⋅s⁻¹", "kg⋅m²⋅s⁻³"
  derivedUnits: string[];     // List of derived unit symbols used (e.g., ["J", "s⁻¹"])
  depth: number;              // Number of derived units used (0 = raw base units)
  crossDomainMatches?: string[]; // Categories from other domains with same dimensions
}

// Sort SI derived units by complexity (most base dimensions consumed first)
export const SI_UNITS_BY_COMPLEXITY: DerivedUnitInfo[] = [...SI_DERIVED_UNITS].sort((a, b) => {
  const aSum = Object.values(a.dimensions).reduce((sum, exp) => sum + Math.abs(exp || 0), 0);
  const bSum = Object.values(b.dimensions).reduce((sum, exp) => sum + Math.abs(exp || 0), 0);
  return bSum - aSum; // Most complex first
});

// Core SI derived units for general purpose compositions
// Exclude units that resolve to a single SI base unit (Hz, Bq → s⁻¹)
export const GENERAL_SI_DERIVED: DerivedUnitInfo[] = SI_UNITS_BY_COMPLEXITY.filter(u => 
  !['Hz', 'Bq'].includes(u.symbol)
);

// Specialty/rare derived units - sorted after main path units
export const SPECIALTY_DERIVED_UNITS = new Set([
  'Gy',   // Gray - absorbed radiation dose
  'Sv',   // Sievert - equivalent radiation dose  
  'Bq',   // Becquerel - radioactivity
  'kat',  // katal - catalytic activity
  'lm',   // lumen - luminous flux
  'lx',   // lux - illuminance
  'rad',  // radian - plane angle (less common in compositions)
  'sr',   // steradian - solid angle
  'ν',    // photon frequency
  'λ',    // photon wavelength
]);

// Check if dimensions are empty (all zeros or undefined)
export const isDimensionEmpty = (dims: DimensionalFormula): boolean => {
  return Object.values(dims).every(v => v === 0 || v === undefined);
};

// Subtract derived unit dimensions from target dimensions
export const subtractDimensions = (dims: DimensionalFormula, derived: DimensionalFormula): DimensionalFormula => {
  const result: DimensionalFormula = { ...dims };
  for (const [dim, derivedExp] of Object.entries(derived)) {
    const key = dim as keyof DimensionalFormula;
    result[key] = (result[key] || 0) - derivedExp;
    if (result[key] === 0) delete result[key];
  }
  return result;
};

// Check if composition is valid (all SI base dimension remainders are valid)
export const isValidSIComposition = (target: DimensionalFormula, derived: DimensionalFormula): boolean => {
  // All SI base dimension remainders are valid
  return true;
};

// Format dimensions with derived unit + remaining base units
export const formatSIComposition = (derivedSymbols: string[], remainingDims: DimensionalFormula): string => {
  const parts: string[] = [];
  
  // Add remaining positive base dimensions first
  const positiveDims: DimensionalFormula = {};
  const negativeDims: DimensionalFormula = {};
  for (const [dim, exp] of Object.entries(remainingDims)) {
    if (exp > 0) positiveDims[dim as keyof DimensionalFormula] = exp;
    else if (exp < 0) negativeDims[dim as keyof DimensionalFormula] = exp;
  }
  
  const positiveBase = formatDimensions(positiveDims);
  if (positiveBase) parts.push(positiveBase);
  
  // Add derived units in order
  parts.push(...derivedSymbols);
  
  // Add remaining negative base dimensions last
  const negativeBase = formatDimensions(negativeDims);
  if (negativeBase) parts.push(negativeBase);
  
  return parts.join('⋅');
};

// Sum of absolute exponents in expression
export const sumAbsExponents = (symbol: string): number => {
  if (!symbol || symbol === '1') return 0;
  let sum = 0;
  const parts = symbol.split('⋅');
  for (const part of parts) {
    const expMatch = part.match(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+$/);
    if (expMatch) {
      const superscriptMap: Record<string, string> = {
        '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
        '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
        '⁻': '-', '⁺': '+'
      };
      const expStr = expMatch[0].split('').map(c => superscriptMap[c] || c).join('');
      const exp = parseInt(expStr, 10);
      sum += Math.abs(isNaN(exp) ? 1 : exp);
    } else {
      sum += 1;
    }
  }
  return sum;
};

// Generate all SI representations for given dimensions
// Key constraint: Only ONE derived unit per composition (plus base units)
export const generateSIRepresentations = (
  dimensions: DimensionalFormula,
  getDimensionSignature: (dims: DimensionalFormula) => string,
  PREFERRED_REPRESENTATIONS: Record<string, { displaySymbol: string; isSI: boolean }>
): SIRepresentation[] => {
  if (isDimensionEmpty(dimensions)) {
    return [{ displaySymbol: '1', derivedUnits: [], depth: 0 }];
  }
  
  const representations: SIRepresentation[] = [];
  const seenSymbols = new Set<string>();
  
  // 1. Try each general-purpose derived unit that can form a valid composition
  for (const derivedUnit of GENERAL_SI_DERIVED) {
    if (isValidSIComposition(dimensions, derivedUnit.dimensions)) {
      const remaining = subtractDimensions(dimensions, derivedUnit.dimensions);
      
      // For SINGLE-dimension derived units (rad, sr), skip if remaining has same dimension
      const derivedDimCount = Object.keys(derivedUnit.dimensions).filter(
        k => derivedUnit.dimensions[k as keyof DimensionalFormula] !== 0
      ).length;
      
      if (derivedDimCount === 1) {
        const derivedDimKey = Object.keys(derivedUnit.dimensions).find(
          k => derivedUnit.dimensions[k as keyof DimensionalFormula] !== 0
        ) as keyof DimensionalFormula;
        if (remaining[derivedDimKey] !== undefined && remaining[derivedDimKey] !== 0) {
          continue;
        }
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
  }
  
  // 2. Always add raw base unit representation
  const rawSymbol = formatDimensions(dimensions);
  if (rawSymbol && !seenSymbols.has(rawSymbol) && isValidSymbolRepresentation(rawSymbol)) {
    representations.push({
      displaySymbol: rawSymbol,
      derivedUnits: [],
      depth: 0
    });
  }
  
  // Get the base unit term count to use as the maximum complexity threshold
  const baseTermCount = rawSymbol ? countUnits(rawSymbol) : 0;
  
  // Filter out representations with more terms than the base unit expression
  const filteredRepresentations = baseTermCount === 0 
    ? representations 
    : representations.filter(rep => {
        if (rep.depth === 0) return true;
        return countUnits(rep.displaySymbol) <= baseTermCount;
      });
  
  // Helper: Check if representation uses a specialty derived unit
  const usesSpecialtyUnit = (rep: SIRepresentation): boolean => {
    if (!rep.derivedUnits || rep.derivedUnits.length === 0) return false;
    return rep.derivedUnits.some(u => SPECIALTY_DERIVED_UNITS.has(u));
  };
  
  // Sort: (1) pure base units last, (2) fewest units, (3) lowest sum of abs exponents, 
  //       (4) main-path units before specialty, (5) alphabetically
  filteredRepresentations.sort((a, b) => {
    const aIsRaw = a.depth === 0;
    const bIsRaw = b.depth === 0;
    if (aIsRaw && !bIsRaw) return 1;
    if (!aIsRaw && bIsRaw) return -1;
    
    const aUnits = countUnits(a.displaySymbol);
    const bUnits = countUnits(b.displaySymbol);
    if (aUnits !== bUnits) return aUnits - bUnits;
    
    const aExpSum = sumAbsExponents(a.displaySymbol);
    const bExpSum = sumAbsExponents(b.displaySymbol);
    if (aExpSum !== bExpSum) return aExpSum - bExpSum;
    
    const aIsSpecialty = usesSpecialtyUnit(a);
    const bIsSpecialty = usesSpecialtyUnit(b);
    if (aIsSpecialty && !bIsSpecialty) return 1;
    if (!aIsSpecialty && bIsSpecialty) return -1;
    
    return a.displaySymbol.localeCompare(b.displaySymbol);
  });
  
  // Promote "perfect match" SI derived unit to index 0
  const perfectMatchIndex = filteredRepresentations.findIndex(rep => {
    if (rep.derivedUnits.length !== 1) return false;
    if (rep.displaySymbol !== rep.derivedUnits[0]) return false;
    const siUnit = SI_DERIVED_UNITS.find(u => u.symbol === rep.derivedUnits[0]);
    return siUnit !== undefined;
  });
  
  if (perfectMatchIndex > 0) {
    const [perfectMatch] = filteredRepresentations.splice(perfectMatchIndex, 1);
    filteredRepresentations.unshift(perfectMatch);
  }
  
  // 3. Check for preferred representation override
  const dimSignature = getDimensionSignature(dimensions);
  const preferred = PREFERRED_REPRESENTATIONS[dimSignature];
  if (preferred) {
    const existingIndex = filteredRepresentations.findIndex(
      rep => rep.displaySymbol === preferred.displaySymbol
    );
    
    if (existingIndex > 0) {
      const [existing] = filteredRepresentations.splice(existingIndex, 1);
      filteredRepresentations.unshift(existing);
    } else if (existingIndex === -1) {
      filteredRepresentations.unshift({
        displaySymbol: preferred.displaySymbol,
        derivedUnits: preferred.isSI ? [preferred.displaySymbol.split('⋅')[0]] : [],
        depth: preferred.isSI ? 1 : 0
      });
    }
  }
  
  // 4. Add cross-domain matches to each representation
  for (const rep of filteredRepresentations) {
    let excludeCategory: string | undefined;
    if (rep.derivedUnits && rep.derivedUnits.length > 0) {
      const firstDerivedSymbol = rep.derivedUnits[0];
      const derivedUnitInfo = SI_DERIVED_UNITS.find(u => u.symbol === firstDerivedSymbol);
      if (derivedUnitInfo) {
        excludeCategory = derivedUnitInfo.category;
      }
    }
    
    const crossMatches = findCrossDomainMatches(dimensions, excludeCategory);
    if (crossMatches.length > 0) {
      rep.crossDomainMatches = crossMatches;
    }
  }
  
  return filteredRepresentations;
};

// Check if addition/subtraction is valid between two values
export const canAddSubtract = (
  v1: CalcValue | null, 
  v2: CalcValue | null
): boolean => {
  if (!v1 || !v2) return false;
  // Can add/subtract if: same dimensions, or either is dimensionless (math)
  return dimensionsEqual(v1.dimensions, v2.dimensions) || 
         isDimensionless(v1.dimensions) || 
         isDimensionless(v2.dimensions);
};

// Check if derived unit can be factored out of dimensions
export const canFactorOut = (dimensions: DimensionalFormula, derivedUnit: DerivedUnitInfo): boolean => {
  for (const key of Object.keys(derivedUnit.dimensions) as (keyof DimensionalFormula)[]) {
    const dimValue = dimensions[key] || 0;
    const derivedValue = derivedUnit.dimensions[key] || 0;
    
    // Check if the derived unit dimension has the same sign and magnitude <= target dimension
    if (derivedValue > 0 && dimValue < derivedValue) return false;
    if (derivedValue < 0 && dimValue > derivedValue) return false;
    if (derivedValue !== 0 && dimValue === 0) return false;
  }
  return true;
};

// Check if remaining dimensions introduce new dimensional types
export const hasOnlyOriginalDimensions = (original: DimensionalFormula, remaining: DimensionalFormula): boolean => {
  for (const key of Object.keys(remaining) as (keyof DimensionalFormula)[]) {
    // If the remaining has a dimension that the original doesn't have, reject
    if (remaining[key] !== 0 && original[key] === undefined) {
      return false;
    }
  }
  return true;
};

// Normalizable derived unit for greedy decomposition
export interface NormalizableDerivedUnit {
  symbol: string;
  dimensions: DimensionalFormula;
  exponentSum: number; // Sum of absolute values of exponents (complexity score)
}

// Standard SI derived units catalog for normalization (sorted by complexity - more base units consumed first)
// Only includes the 22 named SI derived units, NOT combinations like Wh
export const NORMALIZABLE_DERIVED_UNITS: NormalizableDerivedUnit[] = [
  // Sorted by exponentSum descending (most complex first)
  // Note: Hz and Bq both have { time: -1 }, using Hz as it's the general SI unit for frequency
  // Gy and Sv both have { length: 2, time: -2 }, using Gy as it's the base radiation unit
  { symbol: 'F', dimensions: { mass: -1, length: -2, time: 4, current: 2 }, exponentSum: 9 },
  { symbol: 'Ω', dimensions: { mass: 1, length: 2, time: -3, current: -2 }, exponentSum: 8 },
  { symbol: 'S', dimensions: { mass: -1, length: -2, time: 3, current: 2 }, exponentSum: 8 },
  { symbol: 'V', dimensions: { mass: 1, length: 2, time: -3, current: -1 }, exponentSum: 7 },
  { symbol: 'H', dimensions: { mass: 1, length: 2, time: -2, current: -2 }, exponentSum: 7 },
  { symbol: 'Wb', dimensions: { mass: 1, length: 2, time: -2, current: -1 }, exponentSum: 6 },
  { symbol: 'W', dimensions: { mass: 1, length: 2, time: -3 }, exponentSum: 6 },
  { symbol: 'J', dimensions: { mass: 1, length: 2, time: -2 }, exponentSum: 5 },
  { symbol: 'lx', dimensions: { intensity: 1, solid_angle: 1, length: -2 }, exponentSum: 4 },
  { symbol: 'Gy', dimensions: { length: 2, time: -2 }, exponentSum: 4 },
  { symbol: 'Pa', dimensions: { mass: 1, length: -1, time: -2 }, exponentSum: 4 },
  { symbol: 'N', dimensions: { mass: 1, length: 1, time: -2 }, exponentSum: 4 },
  { symbol: 'T', dimensions: { mass: 1, time: -2, current: -1 }, exponentSum: 4 },
  { symbol: 'C', dimensions: { current: 1, time: 1 }, exponentSum: 2 },
  { symbol: 'kat', dimensions: { amount: 1, time: -1 }, exponentSum: 2 },
  { symbol: 'lm', dimensions: { intensity: 1, solid_angle: 1 }, exponentSum: 2 },
  // Hz removed: prefer s⁻¹ (base unit representation) over Hz (derived unit) when normalizing
].sort((a, b) => b.exponentSum - a.exponentSum);

// Check if a derived unit can be factored out from remaining dimensions (for normalization)
export const canApplyDerivedUnit = (remaining: DimensionalFormula, derived: DimensionalFormula): boolean => {
  for (const [dim, derivedExp] of Object.entries(derived)) {
    const remainingExp = remaining[dim as keyof DimensionalFormula] || 0;
    // The derived unit's exponent must have the same sign and not exceed the remaining magnitude
    if (derivedExp > 0) {
      if (remainingExp < derivedExp) return false;
    } else if (derivedExp < 0) {
      if (remainingExp > derivedExp) return false;
    }
  }
  return true;
};

// Subtract derived unit dimensions from remaining (for normalization)
export const subtractDerivedUnit = (remaining: DimensionalFormula, derived: DimensionalFormula): DimensionalFormula => {
  const result: DimensionalFormula = { ...remaining };
  for (const [dim, derivedExp] of Object.entries(derived)) {
    const key = dim as keyof DimensionalFormula;
    result[key] = (result[key] || 0) - derivedExp;
    if (result[key] === 0) delete result[key];
  }
  return result;
};

// Greedy normalization: decompose dimensions into derived units + base units
export const normalizeDimensions = (dims: DimensionalFormula): string => {
  if (isDimensionEmpty(dims)) return '';
  
  let remaining = { ...dims };
  const usedUnits: Map<string, number> = new Map(); // symbol -> exponent count
  
  // Greedy loop: keep finding derived units that consume the most exponents
  let foundMatch = true;
  while (foundMatch && !isDimensionEmpty(remaining)) {
    foundMatch = false;
    
    // Find the best derived unit (first one that fits, since list is sorted by complexity)
    for (const derivedUnit of NORMALIZABLE_DERIVED_UNITS) {
      if (canApplyDerivedUnit(remaining, derivedUnit.dimensions)) {
        // Apply this derived unit
        remaining = subtractDerivedUnit(remaining, derivedUnit.dimensions);
        usedUnits.set(derivedUnit.symbol, (usedUnits.get(derivedUnit.symbol) || 0) + 1);
        foundMatch = true;
        break; // Restart the loop to find the next best match
      }
    }
  }
  
  // Build the result symbol
  const parts: string[] = [];
  
  // Sort derived units alphabetically by symbol
  const sortedDerivedUnits = Array.from(usedUnits.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  
  // Add remaining base unit dimensions (positive exponents first)
  const remainingSymbol = formatDimensions(remaining);
  if (remainingSymbol) {
    // Split positive and negative parts
    const positiveDims: DimensionalFormula = {};
    const negativeDims: DimensionalFormula = {};
    for (const [dim, exp] of Object.entries(remaining)) {
      if (exp > 0) positiveDims[dim as keyof DimensionalFormula] = exp;
      else if (exp < 0) negativeDims[dim as keyof DimensionalFormula] = exp;
    }
    
    // Add positive base units first
    const positiveSymbol = formatDimensions(positiveDims);
    if (positiveSymbol) parts.push(positiveSymbol);
    
    // Add derived units (sorted alphabetically)
    sortedDerivedUnits.forEach(([symbol, count]) => {
      if (count === 1) {
        parts.push(symbol);
      } else {
        parts.push(symbol + toSuperscript(count));
      }
    });
    
    // Add negative base units last
    const negativeSymbol = formatDimensions(negativeDims);
    if (negativeSymbol) parts.push(negativeSymbol);
  } else {
    // Only derived units (sorted alphabetically)
    sortedDerivedUnits.forEach(([symbol, count]) => {
      if (count === 1) {
        parts.push(symbol);
      } else {
        parts.push(symbol + toSuperscript(count));
      }
    });
  }
  
  return parts.join('⋅') || formatDimensions(dims);
};

// Alternative representation for calculator result display
export interface AlternativeRepresentation {
  displaySymbol: string;
  category: string | null;
  unitId: string | null;
  isHybrid: boolean;
  components: {
    derivedUnit?: DerivedUnitInfo;
    remainingDimensions?: DimensionalFormula;
  };
}

// Generate alternative representations for complex dimensions
// Ordering: (1) Normalized SI unit, (2) Bare base units, (3) SI units alphabetically, (4) Non-SI units alphabetically
// SI and non-SI units are never mixed in the same expression
export const generateAlternativeRepresentations = (dimensions: DimensionalFormula): AlternativeRepresentation[] => {
  const alternatives: AlternativeRepresentation[] = [];
  const seenSymbols = new Set<string>();
  
  // 1. First: Normalized SI unit (using greedy decomposition into derived units)
  const normalizedSymbol = normalizeDimensions(dimensions);
  if (normalizedSymbol) {
    alternatives.push({
      displaySymbol: normalizedSymbol,
      category: null,
      unitId: null,
      isHybrid: false,
      components: {}
    });
    seenSymbols.add(normalizedSymbol);
  }
  
  // 2. Second: Bare base units representation (if different from normalized)
  const rawSymbol = formatDimensions(dimensions);
  if (rawSymbol && !seenSymbols.has(rawSymbol)) {
    alternatives.push({
      displaySymbol: rawSymbol,
      category: null,
      unitId: null,
      isHybrid: false,
      components: {}
    });
    seenSymbols.add(rawSymbol);
  }
  
  // 3. Third: SI derived units that exactly match, sorted alphabetically
  const siExactMatches: AlternativeRepresentation[] = [];
  for (const derivedUnit of SI_DERIVED_UNITS) {
    if (dimensionsEqual(derivedUnit.dimensions, dimensions) && !seenSymbols.has(derivedUnit.symbol)) {
      siExactMatches.push({
        displaySymbol: derivedUnit.symbol,
        category: derivedUnit.category,
        unitId: derivedUnit.unitId,
        isHybrid: false,
        components: { derivedUnit }
      });
      seenSymbols.add(derivedUnit.symbol);
    }
  }
  // Sort SI matches alphabetically
  siExactMatches.sort((a, b) => a.displaySymbol.localeCompare(b.displaySymbol));
  alternatives.push(...siExactMatches);
  
  // 4. Fourth: SI hybrid representations (derived unit + base units), sorted alphabetically
  const siHybrids: AlternativeRepresentation[] = [];
  for (const derivedUnit of SI_DERIVED_UNITS) {
    if (canFactorOut(dimensions, derivedUnit)) {
      const remaining = subtractDimensions(dimensions, derivedUnit.dimensions);
      
      // Verify remaining dimensions don't introduce new dimensional types
      if (!hasOnlyOriginalDimensions(dimensions, remaining)) {
        continue;
      }
      
      // For SINGLE-dimension derived units (rad, sr), skip if remaining has same dimension
      // This prevents "rad⋅rad⁻²" instead of properly combined "rad⁻¹"
      // Multi-dimension units (W, J, N) are fine since remaining produces different symbols
      const derivedDimCount = Object.keys(derivedUnit.dimensions).filter(
        k => derivedUnit.dimensions[k as keyof DimensionalFormula] !== 0
      ).length;
      
      if (derivedDimCount === 1) {
        const derivedDimKey = Object.keys(derivedUnit.dimensions).find(
          k => derivedUnit.dimensions[k as keyof DimensionalFormula] !== 0
        ) as keyof DimensionalFormula;
        if (remaining[derivedDimKey] !== undefined && remaining[derivedDimKey] !== 0) {
          continue; // Skip - would create duplicate like rad⋅rad⁻²
        }
      }
      
      // Only create hybrid if there's something remaining
      if (Object.keys(remaining).length > 0) {
        const positiveRemaining: DimensionalFormula = {};
        const negativeRemaining: DimensionalFormula = {};
        
        for (const [dim, exp] of Object.entries(remaining)) {
          if (exp > 0) {
            positiveRemaining[dim as keyof DimensionalFormula] = exp;
          } else if (exp < 0) {
            negativeRemaining[dim as keyof DimensionalFormula] = exp;
          }
        }
        
        // Build hybrid symbol: positive_remaining, derived_unit, negative_remaining
        const parts: string[] = [];
        if (Object.keys(positiveRemaining).length > 0) {
          parts.push(formatDimensions(positiveRemaining));
        }
        parts.push(derivedUnit.symbol);
        if (Object.keys(negativeRemaining).length > 0) {
          parts.push(formatDimensions(negativeRemaining));
        }
        
        const hybridSymbol = parts.join('⋅');
        
        // Validate: reject if duplicate base units detected
        if (!seenSymbols.has(hybridSymbol) && isValidSymbolRepresentation(hybridSymbol)) {
          siHybrids.push({
            displaySymbol: hybridSymbol,
            category: null,
            unitId: null,
            isHybrid: true,
            components: {
              derivedUnit,
              remainingDimensions: remaining
            }
          });
          seenSymbols.add(hybridSymbol);
        }
      }
    }
  }
  // Sort SI hybrids alphabetically
  siHybrids.sort((a, b) => a.displaySymbol.localeCompare(b.displaySymbol));
  alternatives.push(...siHybrids);
  
  // 5. Fifth: Non-SI units that exactly match, sorted alphabetically
  // Note: Non-SI units are never mixed with SI in hybrid representations
  const nonSIExactMatches: AlternativeRepresentation[] = [];
  for (const nonSIUnit of NON_SI_UNITS_CATALOG) {
    if (dimensionsEqual(nonSIUnit.dimensions, dimensions) && !seenSymbols.has(nonSIUnit.symbol)) {
      nonSIExactMatches.push({
        displaySymbol: nonSIUnit.symbol,
        category: nonSIUnit.category,
        unitId: nonSIUnit.unitId,
        isHybrid: false,
        components: { derivedUnit: nonSIUnit }
      });
      seenSymbols.add(nonSIUnit.symbol);
    }
  }
  // Sort non-SI matches alphabetically
  nonSIExactMatches.sort((a, b) => a.displaySymbol.localeCompare(b.displaySymbol));
  alternatives.push(...nonSIExactMatches);
  
  return alternatives;
};

export const getDerivedUnit = (dims: DimensionalFormula): string => {
  const dimsStr = JSON.stringify(dims);
  
  const derivedUnits: Record<string, string> = {
    // Base units
    [JSON.stringify({ length: 1 })]: 'm',
    [JSON.stringify({ mass: 1 })]: 'kg',
    [JSON.stringify({ time: 1 })]: 's',
    [JSON.stringify({ current: 1 })]: 'A',
    [JSON.stringify({ temperature: 1 })]: 'K',
    [JSON.stringify({ amount: 1 })]: 'mol',
    [JSON.stringify({ intensity: 1 })]: 'cd',
    [JSON.stringify({ angle: 1 })]: 'rad',
    [JSON.stringify({ solid_angle: 1 })]: 'sr',
    // Derived units
    [JSON.stringify({ length: 2 })]: 'm²',
    [JSON.stringify({ length: 3 })]: 'm³',
    [JSON.stringify({ time: -1 })]: 's⁻¹',
    [JSON.stringify({ length: 1, time: -1 })]: 'm/s',
    [JSON.stringify({ length: 1, time: -2 })]: 'm/s²',
    [JSON.stringify({ mass: 1, length: 1, time: -2 })]: 'N',
    [JSON.stringify({ mass: 1, length: -1, time: -2 })]: 'Pa',
    [JSON.stringify({ mass: 1, length: 2, time: -2 })]: 'J',
    [JSON.stringify({ mass: 1, length: 2, time: -3 })]: 'W',
    [JSON.stringify({ current: 1, time: 1 })]: 'C',
    [JSON.stringify({ mass: 1, length: 2, time: -3, current: -1 })]: 'V',
    [JSON.stringify({ mass: -1, length: -2, time: 4, current: 2 })]: 'F',
    [JSON.stringify({ mass: 1, length: 2, time: -3, current: -2 })]: 'Ω',
    [JSON.stringify({ mass: -1, length: -2, time: 3, current: 2 })]: 'S',
    [JSON.stringify({ mass: 1, length: 2, time: -2, current: -2 })]: 'H',
    [JSON.stringify({ mass: 1, length: 2, time: -2, current: -1 })]: 'Wb',
    [JSON.stringify({ mass: 1, time: -2, current: -1 })]: 'T',
    [JSON.stringify({ intensity: 1, solid_angle: 1, length: -2 })]: 'lx',
    [JSON.stringify({ mass: 1, length: -3 })]: 'kg/m³',
    [JSON.stringify({ length: 3, time: -1 })]: 'm³/s',
    [JSON.stringify({ mass: 1, length: -1, time: -1 })]: 'Pa⋅s',
    [JSON.stringify({ mass: 1, time: -2 })]: 'N/m',
    [JSON.stringify({ length: -1 })]: 'm⁻¹',
    [JSON.stringify({ amount: 1, time: -1 })]: 'kat',
    [JSON.stringify({ intensity: 1, solid_angle: 1 })]: 'lm'
  };

  return derivedUnits[dimsStr] || '';
};
