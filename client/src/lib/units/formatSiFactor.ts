/**
 * Format a conversion factor for the Sources reference table: up to 10
 * significant digits, trailing zeros trimmed, scientific notation for very
 * large/small magnitudes.
 */
export function formatSiFactor(n: number): string {
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e7 || abs < 1e-4) {
    const s = n.toExponential(6).replace(/\.?0+e/, 'e');
    return s.replace('e+', ' × 10^').replace('e-', ' × 10^−').replace('e', ' × 10^');
  }
  const s = n.toPrecision(10);
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}
