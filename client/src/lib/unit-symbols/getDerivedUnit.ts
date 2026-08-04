import type { DimensionalFormula } from '../units/dimensionalFormula';

const DERIVED_UNIT_MAP: Record<string, string> = {
  [JSON.stringify({ length: 1 })]: 'm',
  [JSON.stringify({ mass: 1 })]: 'kg',
  [JSON.stringify({ time: 1 })]: 's',
  [JSON.stringify({ current: 1 })]: 'A',
  [JSON.stringify({ temperature: 1 })]: 'K',
  [JSON.stringify({ amount: 1 })]: 'mol',
  [JSON.stringify({ intensity: 1 })]: 'cd',
  [JSON.stringify({ angle: 1 })]: 'rad',
  [JSON.stringify({ solid_angle: 1 })]: 'sr',
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
  [JSON.stringify({ intensity: 1, solid_angle: 1 })]: 'lm',
};

export const getDerivedUnit = (dims: DimensionalFormula): string => {
  return DERIVED_UNIT_MAP[JSON.stringify(dims)] || '';
};
