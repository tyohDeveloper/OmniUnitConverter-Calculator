import type { ReactElement } from 'react';
import { SelectGroup, SelectItem, SelectLabel } from '@/components/ui/select';
import type { UnitDefinition } from '@/lib/units/unitDefinition';

/**
 * Renders the date_calendar dropdown items with "Primary" and
 * "Variants" section headers. Primary calendars are the 13 that
 * appear before the 6 variants in the registry; the split is
 * determined by unit id membership in the variants set.
 *
 * Calendar unit symbols are polyfill backend ids (implementation
 * detail) so we render just the localized name, not the symbol.
 */

const VARIANT_CALENDAR_IDS = new Set([
  'revised-julian', 'islamic-civil', 'islamic-tbla',
  'ethiopic-alem', 'dangi', 'iso8601',
]);

type TranslateFn = (name: string) => string;

export function renderCalendarGroupedItems(
  units: UnitDefinition[],
  translateUnitName: TranslateFn,
  t: TranslateFn,
): ReactElement {
  const primary = units.filter(u => !VARIANT_CALENDAR_IDS.has(u.id));
  const variants = units.filter(u => VARIANT_CALENDAR_IDS.has(u.id));
  return (
    <>
      <SelectGroup>
        <SelectLabel className="text-xs text-muted-foreground/70 px-2 pt-1">
          {t('Primary')}
        </SelectLabel>
        {primary.map(u => (
          <SelectItem key={u.id} value={u.id} className="font-mono text-sm">
            <span className="font-bold">{translateUnitName(u.name)}</span>
          </SelectItem>
        ))}
      </SelectGroup>
      {variants.length > 0 && (
        <SelectGroup>
          <SelectLabel className="text-xs text-muted-foreground/70 px-2 pt-2">
            {t('Variants')}
          </SelectLabel>
          {variants.map(u => (
            <SelectItem key={u.id} value={u.id} className="font-mono text-sm">
              <span className="font-bold">{translateUnitName(u.name)}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      )}
    </>
  );
}
