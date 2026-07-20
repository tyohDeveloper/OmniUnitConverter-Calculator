// Convert kanji numerals (三十三, 元, 二〇二〇) into an integer.
// Returns null when the text contains non-numeral characters or is zero.
const DIGITS: Record<string, number> = {
  "〇": 0, "零": 0, "一": 1, "二": 2, "三": 3, "四": 4,
  "五": 5, "六": 6, "七": 7, "八": 8, "九": 9,
};
const UNITS: Record<string, number> = { "十": 10, "百": 100, "千": 1000 };

export function kanjiNumeralToInt(text: string): number | null {
  if (text.length === 0) return null;
  let total = 0;
  let current = 0;
  for (const ch of text) {
    if (ch in DIGITS) {
      current = current * 10 + DIGITS[ch];
    } else if (ch in UNITS) {
      total += (current || 1) * UNITS[ch];
      current = 0;
    } else {
      return null;
    }
  }
  total += current;
  return total > 0 ? total : null;
}
