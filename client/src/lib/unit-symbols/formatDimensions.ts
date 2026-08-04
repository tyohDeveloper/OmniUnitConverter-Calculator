import type { DimensionalFormula } from '../units/dimensionalFormula';
import { toSuperscript } from './toSuperscript';

const BASE_SYMBOLS: Record<string, string> = {
  length: 'm', mass: 'kg', time: 's', current: 'A',
  temperature: 'K', amount: 'mol', intensity: 'cd',
  angle: 'rad', solid_angle: 'sr'
};

const DIM_ORDER: (keyof DimensionalFormula)[] = [
  'mass', 'length', 'time', 'current', 'temperature', 'amount', 'intensity', 'angle', 'solid_angle'
];

export const formatDimensions = (dims: DimensionalFormula): string => {
  const positive: string[] = [];
  const negative: string[] = [];

  for (const dim of DIM_ORDER) {
    const exp = dims[dim];
    if (exp && exp !== 0) {
      const symbol = BASE_SYMBOLS[dim];
      const part = exp === 1 ? symbol : `${symbol}${toSuperscript(exp)}`;
      if (exp > 0) positive.push(part);
      else negative.push(part);
    }
  }

  return [...positive, ...negative].join('⋅');
};
