import { Temporal } from '@/lib/temporal/temporal';
import { CONVERSION_DATA } from '../conversion-data';

/**
 * Convert a wall-clock time in one IANA time zone to the equivalent
 * wall-clock time in another IANA time zone.
 *
 * Input value semantics:
 *   - Empty string: interpreted as "now" (Temporal.Now.instant()).
 *   - "HH:MM" or "HH:MM:SS": interpreted as that time of day today
 *     in the from-zone. The reference date is today in the from-zone.
 *   - Anything else: null (parse error, no result).
 *
 * Output semantics:
 *   - Same shape as the input (HH:MM or HH:MM:SS in the to-zone).
 *   - If the to-zone's date differs from the from-zone's date (which
 *     happens on any conversion that crosses midnight in the target),
 *     the output is annotated " +1d" or " -1d".
 *   - Seconds are only included when the input had seconds.
 *
 * Returns null when the from/to unit ids can't be resolved to units in
 * the timezone category, when the symbol field isn't a valid IANA zone
 * id, or when parsing fails.
 */
export function computeTimeConversion(input: {
  value: string;
  fromUnit: string;
  toUnit: string;
}): string | null {
  const zones = resolveZoneIds(input.fromUnit, input.toUnit);
  if (!zones) return null;
  const parsed = parseTimeInput(input.value.trim(), zones.from);
  if (!parsed) return null;
  return formatConverted(parsed.zdt, zones.to, parsed.includeSeconds);
}

// ─── Local helpers ───

function resolveZoneIds(fromUnitId: string, toUnitId: string): { from: string; to: string } | null {
  const cat = CONVERSION_DATA.find(c => c.id === 'timezone');
  if (!cat) return null;
  const fromUnit = cat.units.find(u => u.id === fromUnitId);
  const toUnit = cat.units.find(u => u.id === toUnitId);
  if (!fromUnit || !toUnit) return null;
  return { from: fromUnit.symbol, to: toUnit.symbol };
}

// Parses "" (now), "HH:MM", or "HH:MM:SS". Returns a ZonedDateTime in
// the from-zone and whether the input had seconds.
function parseTimeInput(value: string, fromZone: string): { zdt: Temporal.ZonedDateTime; includeSeconds: boolean } | null {
  try {
    if (value === '') {
      return { zdt: Temporal.Now.zonedDateTimeISO(fromZone), includeSeconds: false };
    }
    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value);
    if (!match) return null;
    const h = Number(match[1]);
    const m = Number(match[2]);
    const s = match[3] !== undefined ? Number(match[3]) : 0;
    if (h > 23 || m > 59 || s > 59) return null;
    const today = Temporal.Now.plainDateISO(fromZone);
    const pdt = today.toPlainDateTime({ hour: h, minute: m, second: s });
    const zdt = pdt.toZonedDateTime(fromZone);
    return { zdt, includeSeconds: match[3] !== undefined };
  } catch {
    return null;
  }
}

function formatConverted(fromZdt: Temporal.ZonedDateTime, toZone: string, includeSeconds: boolean): string | null {
  try {
    const toZdt = fromZdt.withTimeZone(toZone);
    const hh = String(toZdt.hour).padStart(2, '0');
    const mm = String(toZdt.minute).padStart(2, '0');
    const timeStr = includeSeconds
      ? `${hh}:${mm}:${String(toZdt.second).padStart(2, '0')}`
      : `${hh}:${mm}`;
    const dayShift = Temporal.PlainDate.compare(
      toZdt.toPlainDate(), fromZdt.toPlainDate(),
    );
    if (dayShift === 0) return timeStr;
    return dayShift > 0 ? `${timeStr} +1d` : `${timeStr} -1d`;
  } catch {
    return null;
  }
}
