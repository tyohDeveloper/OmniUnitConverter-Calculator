// Day offset of the first day of a tabular Hijri month within its year
// (month 1 → 0). Months alternate 30/29 days: offsets 0, 30, 59, 89, ….
export function hijriMonthStartOffset(month: number): number {
  return Math.ceil(29.5 * (month - 1));
}
