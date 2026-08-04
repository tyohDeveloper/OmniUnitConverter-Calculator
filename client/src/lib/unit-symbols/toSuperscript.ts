const SUPERSCRIPTS: Record<string, string> = {
  '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
};

export const toSuperscript = (n: number): string => {
  return n.toString().split('').map(c => SUPERSCRIPTS[c] || c).join('');
};
