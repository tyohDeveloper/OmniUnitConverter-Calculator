const SUPERSCRIPT_MAP: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  '⁻': '-', '⁺': '+'
};

export const sumAbsExponents = (symbol: string): number => {
  if (!symbol || symbol === '1') return 0;
  let sum = 0;
  const parts = symbol.split('⋅');
  for (const part of parts) {
    const expMatch = part.match(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+$/);
    if (expMatch) {
      const expStr = expMatch[0].split('').map(c => SUPERSCRIPT_MAP[c] || c).join('');
      const exp = parseInt(expStr, 10);
      sum += Math.abs(isNaN(exp) ? 1 : exp);
    } else {
      sum += 1;
    }
  }
  return sum;
};
