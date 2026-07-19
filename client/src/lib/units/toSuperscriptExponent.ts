const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '-': '⁻', '−': '⁻', '+': '',
};

/**
 * Convert an integer exponent string (e.g. "-19", "3") into Unicode
 * superscript characters: "⁻¹⁹", "³".
 */
export function toSuperscriptExponent(exp: string): string {
  return exp.split('').map((ch) => SUPERSCRIPTS[ch] ?? ch).join('');
}
