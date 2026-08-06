import { Temporal } from '@/lib/temporal/temporal';
import { CATEGORY_FAMILIES } from '../units/categoryFamilies';
import type { UnitCategory } from '../units/unitCategory';

/**
 * The initial input-field value when the user switches to a category.
 *
 * Numeric categories default to '1' so the first cell of a
 * conversion table produces a meaningful result. SYMBOLIC categories
 * default to the current instant expressed in each category's natural
 * shape, so the user immediately sees a plausible input and can edit
 * from there:
 *
 *   - `timezone` \u2192 current time formatted as 'HH:MM'
 *   - `date_calendar` \u2192 today's date formatted as 'YYYY-MM-DD'
 *
 * The value is a snapshot at the moment of category switch \u2014 it does
 * NOT live-update. Users who want the current moment as of \"now\" can
 * simply clear the field (empty means \"now\" for both symbolic
 * categories).
 *
 * New SYMBOLIC categories added later fall through to '' by default;
 * add a case here if the category has a natural default shape.
 */
export function defaultInputValueForCategory(category: UnitCategory): string {
  if (CATEGORY_FAMILIES[category] !== 'SYMBOLIC') return '1';
  switch (category) {
    case 'timezone':
      return formatCurrentTimeHHMM();
    case 'date_calendar':
      return formatCurrentDateYYYYMMDD();
    default:
      return '';
  }
}

// ─── Local helpers ───

function formatCurrentTimeHHMM(): string {
  try {
    const now = Temporal.Now.zonedDateTimeISO();
    return `${String(now.hour).padStart(2, '0')}:${String(now.minute).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

function formatCurrentDateYYYYMMDD(): string {
  try {
    const today = Temporal.Now.plainDateISO();
    return `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
  } catch {
    return '';
  }
}
