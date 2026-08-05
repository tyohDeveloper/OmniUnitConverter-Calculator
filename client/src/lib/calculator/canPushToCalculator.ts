import { CATEGORY_FAMILIES } from '@/lib/units/categoryFamilies';

/**
 * Gate for pushing a value from the converter into the calculator or
 * RPN stack.
 *
 * The calculator layer is 100% numeric: its stack model, arithmetic,
 * display formulas, prefix selection, and unit-alternative machinery
 * all assume `value: number` end-to-end. SYMBOLIC-family categories
 * (timezones, calendar dates — anything whose "value" is a string
 * rather than a number) don't fit that model.
 *
 * Rather than widen every push site with per-family branches, we gate
 * all pushes here: if the source category is SYMBOLIC, the push is
 * silently dropped. This mirrors the numeric input field's behavior —
 * typing a non-numeric character is silently ignored; the user learns
 * the constraint by trying.
 *
 * When new SYMBOLIC categories are added later (Date, additional
 * calendar variants, etc.), they automatically fall under this gate
 * with zero code changes.
 *
 * @param sourceCategory - The category id of the value being pushed.
 *   May be undefined for direct-pane pushes (dimensional-freeform
 *   entries that never carry a category id). Undefined is treated as
 *   "not SYMBOLIC" and the push is allowed — direct-pane values are
 *   dimensional numeric values by construction, since SYMBOLIC
 *   categories don't participate in the direct pane.
 * @returns true if the push may proceed; false if the source is a
 *   SYMBOLIC category and the push should be silently dropped.
 */
export function canPushToCalculator(sourceCategory: string | undefined): boolean {
  if (sourceCategory === undefined) return true;
  const family = CATEGORY_FAMILIES[sourceCategory];
  return family !== 'SYMBOLIC';
}
