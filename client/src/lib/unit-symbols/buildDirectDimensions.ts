import type { DimensionalFormula } from '../units/dimensionalFormula';

const KEY_MAP: Record<string, keyof DimensionalFormula> = {
  'm': 'length', 'kg': 'mass', 's': 'time', 'A': 'current',
  'K': 'temperature', 'mol': 'amount', 'cd': 'intensity',
  'rad': 'angle', 'sr': 'solid_angle'
};

export const buildDirectDimensions = (
  exponents: Record<string, number>
): DimensionalFormula => {
  const dims: DimensionalFormula = {};
  for (const [unit, dimKey] of Object.entries(KEY_MAP)) {
    const exp = exponents[unit] ?? 0;
    if (exp !== 0) {
      dims[dimKey] = exp;
    }
  }
  return dims;
};
