// Parse free text like "Meiji 33" or "Kāngxī 39" into an era-name part and
// a year count. Returns the name (possibly partial, for autocomplete) and
// the year when a trailing number is present. Also accepts CJK input with
// kanji numeral years (明治三十三年) and 元年 for the first year.
import { kanjiNumeralToInt } from "./kanjiNumeralToInt";

const KANJI_YEAR = /^(.+?)([〇零一二三四五六七八九十百千]+)$/;

function parseKanjiYear(
  trimmed: string,
  hadNen: boolean,
): { namePart: string; eraYear: number } | null {
  if (hadNen && trimmed.length > 1 && trimmed.endsWith("元")) {
    return { namePart: trimmed.slice(0, -1), eraYear: 1 };
  }
  const m = trimmed.match(KANJI_YEAR);
  if (m) {
    const year = kanjiNumeralToInt(m[2]);
    if (year !== null) return { namePart: m[1], eraYear: year };
  }
  return null;
}

export function parseEraYearText(
  text: string,
): { namePart: string; eraYear: number | null } {
  const stripped = text.trim();
  const hadNen = stripped.endsWith("年");
  const trimmed = stripped.replace(/年$/, "");
  const m =
    trimmed.match(/^(.*?)[\s,]+(\d{1,4})$/) ??
    trimmed.match(/^([^\d]*?[\u2E80-\u9FFF\uF900-\uFAFF])(\d{1,4})$/);
  if (m && m[1].trim().length > 0) {
    return { namePart: m[1].trim(), eraYear: parseInt(m[2], 10) };
  }
  const kanji = parseKanjiYear(trimmed, hadNen);
  if (kanji) return kanji;
  return { namePart: trimmed, eraYear: null };
}
