import { toSuperscriptExponent } from '../unit-symbols/toSuperscriptExponent';

/**
 * Format a conversion factor for the Sources reference table: up to 10
 * significant digits, trailing zeros trimmed, superscript scientific
 * notation for very large/small magnitudes ("1.602177⋅10⁻¹⁹"). A mantissa
 * of exactly 1 is dropped ("10⁻⁶" instead of "1⋅10⁻⁶").
 */
export function formatSiFactor(n: number): string {
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e7 || abs < 1e-4) {
    const s = n.toExponential(6).replace(/\.?0+e/, 'e');
    const [mantissa, exp] = s.split('e');
    const power = `10${toSuperscriptExponent(String(parseInt(exp, 10)))}`;
    return mantissa === '1' ? power : mantissa === '-1' ? `−${power}` : `${mantissa}⋅${power}`;
  }
  const s = n.toPrecision(10);
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}
