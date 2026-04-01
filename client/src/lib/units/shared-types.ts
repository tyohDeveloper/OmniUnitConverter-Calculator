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
  prefix: string;
}

export interface DerivedUnitInfo {
  symbol: string;
  category: string;
  unitId: string;
  dimensions: DimensionalFormula;
  allowPrefixes: boolean;
}

export type NumberFormat = 
  | 'uk' 
  | 'south-asian'
  | 'europe-latin' 
  | 'swiss'
  | 'arabic'
  | 'arabic-latin'
  | 'east-asian'
  | 'period' 
  | 'comma';

export const SI_DERIVED_UNITS: DerivedUnitInfo[] = [
  { symbol: 'Hz', category: 'frequency', unitId: 'hz', dimensions: { time: -1 }, allowPrefixes: true },
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
  { symbol: 'Gy', category: 'radiation_dose', unitId: 'gy', dimensions: { length: 2, time: -2 }, allowPrefixes: true },
  { symbol: 'Sv', category: 'equivalent_dose', unitId: 'sv', dimensions: { length: 2, time: -2 }, allowPrefixes: true },
  { symbol: 'kat', category: 'catalytic', unitId: 'kat', dimensions: { amount: 1, time: -1 }, allowPrefixes: true },
  { symbol: 'rad', category: 'angle', unitId: 'rad', dimensions: { angle: 1 }, allowPrefixes: true },
  { symbol: 'sr', category: 'solid_angle', unitId: 'sr', dimensions: { solid_angle: 1 }, allowPrefixes: true },
  // Photon energy-equivalents (via Planck relations E = hν and E = hc/λ)
  { symbol: 'ν', category: 'photon', unitId: 'photon_freq', dimensions: { mass: 1, length: 2, time: -2 }, allowPrefixes: true },
  { symbol: 'λ', category: 'photon', unitId: 'photon_wavelength', dimensions: { mass: 1, length: 2, time: -2 }, allowPrefixes: true },
];

export const ISO_LANGUAGES = [
  'ar', 'bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'fi', 'fr', 'he', 'hi', 
  'hr', 'hu', 'id', 'it', 'ja', 'ko', 'lt', 'lv', 'nl', 'no', 'pl', 'pt', 
  'ro', 'ru', 'sk', 'sl', 'sv', 'th', 'tr', 'uk', 'vi', 'zh', 'zh_TW'
] as const;

export type SupportedLanguageCode = typeof ISO_LANGUAGES[number];

export const SI_BASE_UNIT_SYMBOLS = ['m', 'kg', 's', 'A', 'K', 'mol', 'cd', 'rad', 'sr'] as const;

export type SIBaseUnitSymbol = typeof SI_BASE_UNIT_SYMBOLS[number];

export const SI_BASE_TO_DIMENSION: Record<SIBaseUnitSymbol, keyof DimensionalFormula> = {
  m: 'length',
  kg: 'mass',
  s: 'time',
  A: 'current',
  K: 'temperature',
  mol: 'amount',
  cd: 'intensity',
  rad: 'angle',
  sr: 'solid_angle',
};

export const DIMENSION_TO_SI_SYMBOL: Record<keyof DimensionalFormula, string> = {
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

export const NON_SI_UNITS_CATALOG: DerivedUnitInfo[] = [
  { symbol: 'dyn', category: 'force', unitId: 'dyn', dimensions: { mass: 1, length: 1, time: -2 }, allowPrefixes: true },
  { symbol: 'erg', category: 'energy', unitId: 'erg', dimensions: { mass: 1, length: 2, time: -2 }, allowPrefixes: true },
  { symbol: 'cal', category: 'energy', unitId: 'cal', dimensions: { mass: 1, length: 2, time: -2 }, allowPrefixes: true },
  { symbol: 'BTU', category: 'energy', unitId: 'btu', dimensions: { mass: 1, length: 2, time: -2 }, allowPrefixes: false },
  { symbol: 'Ba', category: 'pressure', unitId: 'barye', dimensions: { mass: 1, length: -1, time: -2 }, allowPrefixes: true },
  { symbol: 'atm', category: 'pressure', unitId: 'atm', dimensions: { mass: 1, length: -1, time: -2 }, allowPrefixes: false },
  { symbol: 'bar', category: 'pressure', unitId: 'bar', dimensions: { mass: 1, length: -1, time: -2 }, allowPrefixes: true },
  { symbol: 'psi', category: 'pressure', unitId: 'psi', dimensions: { mass: 1, length: -1, time: -2 }, allowPrefixes: false },
  { symbol: 'erg⋅s⁻¹', category: 'power', unitId: 'erg_per_s', dimensions: { mass: 1, length: 2, time: -3 }, allowPrefixes: false },
  { symbol: 'hp', category: 'power', unitId: 'hp', dimensions: { mass: 1, length: 2, time: -3 }, allowPrefixes: false },
  { symbol: 'Po', category: 'viscosity', unitId: 'poise', dimensions: { mass: 1, length: -1, time: -1 }, allowPrefixes: true },
  { symbol: 'St', category: 'kinematic_viscosity', unitId: 'stokes', dimensions: { length: 2, time: -1 }, allowPrefixes: true },
  { symbol: 'rayl', category: 'acoustic_impedance', unitId: 'rayl', dimensions: { mass: 1, length: -2, time: -1 }, allowPrefixes: true },
  { symbol: 'G', category: 'magnetic_density', unitId: 'gauss', dimensions: { mass: 1, time: -2, current: -1 }, allowPrefixes: true },
  { symbol: 'Mx', category: 'magnetic_flux', unitId: 'maxwell', dimensions: { mass: 1, length: 2, time: -2, current: -1 }, allowPrefixes: true },
  { symbol: 'Oe', category: 'magnetic_field_h', unitId: 'oersted', dimensions: { current: 1, length: -1 }, allowPrefixes: true },
  { symbol: 'ft²', category: 'area', unitId: 'ft2', dimensions: { length: 2 }, allowPrefixes: false },
  { symbol: 'ac', category: 'area', unitId: 'acre', dimensions: { length: 2 }, allowPrefixes: false },
  { symbol: 'gal', category: 'volume', unitId: 'gal', dimensions: { length: 3 }, allowPrefixes: false },
  { symbol: 'ft³', category: 'volume', unitId: 'ft3', dimensions: { length: 3 }, allowPrefixes: false },
];

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

export const getDimensionSignature = (dims: DimensionalFormula): string => {
  const entries = Object.entries(dims)
    .filter(([_, exp]) => exp !== 0)
    .sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([dim, exp]) => `${dim}:${exp}`).join(',');
};

