// Parse free text like "Meiji 33" or "Kāngxī 39" into an era-name part and
// a year count. Returns the name (possibly partial, for autocomplete) and
// the year when a trailing number is present.
export function parseEraYearText(
  text: string,
): { namePart: string; eraYear: number | null } {
  const trimmed = text.trim().replace(/年$/, "");
  const m =
    trimmed.match(/^(.*?)[\s,]+(\d{1,4})$/) ??
    trimmed.match(/^([^\d]*?[\u2E80-\u9FFF\uF900-\uFAFF])(\d{1,4})$/);
  if (m && m[1].trim().length > 0) {
    return { namePart: m[1].trim(), eraYear: parseInt(m[2], 10) };
  }
  return { namePart: trimmed, eraYear: null };
}
