import { CONVERSION_DATA } from '../conversion-data';

/**
 * Extended parser for the Time zone converter's value field.
 * Accepts 'HH:MM', 'HH:MM:SS', 'HH:MM ZONE', 'HH:MM:SS ZONE',
 * or ''. Anything else → both fields null.
 *
 * Zone resolution: ABBREVIATIONS table first (UTC, EST, CST, JST,
 * etc.), then case-insensitive symbol match against registered
 * timezone units ('America/Chicago' == 'america/new york' etc.).
 *
 * Ambiguous abbreviations resolve against our registered set: IST
 * → asia_kolkata (only IST zone shipped), EST → america_new_york.
 *
 * Failure mode: if the time parses but the zone token is unknown,
 * time is set and zoneUnitId is null — the UI updates the value
 * field but leaves the from-zone dropdown alone.
 */
export interface ParsedTimeWithZone {
  time: string | null;
  zoneUnitId: string | null;
}

// Common short-code abbreviations that map to registered zones.
// The values are unit IDs from client/src/data/conversion/timezone.json.
// Both standard-time and daylight-time abbreviations map to the same
// IANA zone, which handles both automatically via its rule table.
const ABBREVIATIONS: Readonly<Record<string, string>> = {
  UTC: 'utc',
  GMT: 'europe_london',
  Z: 'utc',
  // North American zones
  EST: 'america_new_york', EDT: 'america_new_york',
  CST: 'america_chicago', CDT: 'america_chicago',
  MST: 'america_denver', MDT: 'america_denver',
  PST: 'america_los_angeles', PDT: 'america_los_angeles',
  AKST: 'america_anchorage', AKDT: 'america_anchorage',
  HST: 'pacific_honolulu',
  // European zones
  BST: 'europe_london',
  CET: 'europe_paris', CEST: 'europe_paris',
  MSK: 'europe_moscow',
  // Other zones with registered entries
  SAST: 'africa_johannesburg',
  GST: 'asia_dubai',
  IST: 'asia_kolkata',     // India Standard Time (ambiguous with Ireland/Israel;
                            //   only Kolkata is in our registered set)
  CST_CN: 'asia_shanghai', // Explicit disambiguation from US Central
  JST: 'asia_tokyo',
  AEST: 'australia_sydney', AEDT: 'australia_sydney',
  NZST: 'pacific_auckland', NZDT: 'pacific_auckland',
  BRT: 'america_sao_paulo', BRST: 'america_sao_paulo',
};

const TIME_WITH_ZONE_RE = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s+(.+?))?$/;

export function parseTimeWithZone(raw: string): ParsedTimeWithZone {
  const trimmed = raw.trim();
  if (trimmed === '') return { time: null, zoneUnitId: null };
  const match = TIME_WITH_ZONE_RE.exec(trimmed);
  if (!match) return { time: null, zoneUnitId: null };
  const h = Number(match[1]);
  const m = Number(match[2]);
  const s = match[3] !== undefined ? Number(match[3]) : null;
  if (h > 23 || m > 59 || (s !== null && s > 59)) {
    return { time: null, zoneUnitId: null };
  }
  const time = formatTime(h, m, s);
  const zoneToken = match[4]?.trim();
  const zoneUnitId = zoneToken ? resolveZoneToken(zoneToken) : null;
  return { time, zoneUnitId };
}

// ─── Local helpers ───

function formatTime(h: number, m: number, s: number | null): string {
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  if (s === null) return `${hh}:${mm}`;
  return `${hh}:${mm}:${String(s).padStart(2, '0')}`;
}

function resolveZoneToken(token: string): string | null {
  const upper = token.toUpperCase();
  const abbr = ABBREVIATIONS[upper];
  if (abbr) return abbr;
  return resolveIanaZone(token);
}

function resolveIanaZone(token: string): string | null {
  const normalized = token.replace(/\s+/g, '_').toLowerCase();
  const cat = CONVERSION_DATA.find(c => c.id === 'timezone');
  if (!cat) return null;
  const match = cat.units.find(u => u.symbol.toLowerCase() === normalized);
  return match ? match.id : null;
}
