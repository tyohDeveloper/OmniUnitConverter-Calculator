// Era codes offered for input, for calendars where the conventional year
// numbering is era-based. Codes match Temporal's era codes.
// Calendars absent from this map use a plain (signed) calendar year input.
export const CALENDAR_ERAS: Record<string, string[]> = {
  'gregory': ['ce', 'bce'],
  'japanese': ['reiwa', 'heisei', 'showa', 'taisho', 'meiji', 'ce', 'bce'],
  'roc': ['roc', 'roc-inverse'],
};
