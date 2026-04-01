import type { DimensionalFormula } from './shared-types';

const SI_SYMBOLS: Record<keyof DimensionalFormula, string> = {
  length: 'm', mass: 'kg', time: 's', current: 'A',
  temperature: 'K', amount: 'mol', intensity: 'cd',
  angle: 'rad', solid_angle: 'sr',
};

const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻'
};

const toSuperscript = (n: number): string =>
  String(n).split('').map(c => SUPERSCRIPTS[c] || c).join('');

const termSymbol = (dim: string, exp: number): string => {
  const symbol = SI_SYMBOLS[dim as keyof DimensionalFormula] || dim;
  return exp === 1 ? symbol : `${symbol}${toSuperscript(exp)}`;
};

export const buildDimensionalSymbol = (dims: DimensionalFormula): string => {
  const positiveTerms = Object.entries(dims)
    .filter(([_, exp]) => exp !== undefined && exp > 0)
    .sort(([a], [b]) => a.localeCompare(b));
  const negativeTerms = Object.entries(dims)
    .filter(([_, exp]) => exp !== undefined && exp < 0)
    .sort(([a], [b]) => a.localeCompare(b));
  const parts = [
    ...positiveTerms.map(([dim, exp]) => termSymbol(dim, exp!)),
    ...negativeTerms.map(([dim, exp]) => termSymbol(dim, exp!)),
  ];
  return parts.join('⋅');
};
