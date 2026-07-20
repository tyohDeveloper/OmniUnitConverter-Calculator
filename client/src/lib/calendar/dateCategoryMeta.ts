// Sidebar/header metadata for the Date category. The Date category is
// deliberately NOT part of CONVERSION_DATA: it has no factor-based units, so
// keeping it out of the unit data excludes it from smart paste, comparison
// mode, the calculator dimension map, and cross-domain matching by
// construction (with explicit guards layered on top in conversion-data.ts).
export const DATE_CATEGORY_META = {
  id: 'date' as const,
  name: 'Date',
  baseUnit: 'day',
  units: [] as never[],
};
