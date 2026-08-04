const SUPERSCRIPTS: Record<number, string> = {
  1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵',
  [-1]: '⁻¹', [-2]: '⁻²', [-3]: '⁻³', [-4]: '⁻⁴', [-5]: '⁻⁵'
};

const BASE_UNITS = ['m', 'kg', 's', 'A', 'K', 'mol', 'cd', 'rad', 'sr'] as const;

export const buildDirectUnitSymbol = (
  exponents: Record<string, number>
): string => {
  const parts: string[] = [];
  for (const unit of BASE_UNITS) {
    const exp = exponents[unit] ?? 0;
    if (exp !== 0) {
      parts.push(exp === 1 ? unit : `${unit}${SUPERSCRIPTS[exp] || ''}`);
    }
  }
  return parts.join('·') || '';
};
