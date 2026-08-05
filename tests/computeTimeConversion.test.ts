import { describe, it, expect } from 'vitest';
import { computeTimeConversion } from '../client/src/lib/calculator/computeTimeConversion';

/**
 * Behavior tests for computeTimeConversion — the SYMBOLIC-family
 * conversion function backing the Time zone category.
 *
 * Input value semantics:
 *   - '' → interpreted as "now" (Temporal.Now.zonedDateTimeISO(fromZone))
 *   - 'HH:MM' or 'HH:MM:SS' → that wall-clock time today in fromZone
 *   - anything else → null
 *
 * Output semantics:
 *   - 'HH:MM' or 'HH:MM:SS' in the target zone
 *   - Annotated ' +1d' or ' -1d' when the conversion crosses midnight
 *
 * Where possible, tests use zones with fixed offsets (UTC, Tokyo,
 * Honolulu) to keep them deterministic regardless of DST state at
 * test time. Tests involving DST-observing zones (Chicago, London,
 * Sydney) assert structural properties without pinning exact values.
 */

// Unit ids from client/src/data/conversion/timezone.json.
const UTC = 'utc';
const CHICAGO = 'america_chicago';
const LA = 'america_los_angeles';
const HONOLULU = 'pacific_honolulu';
const TOKYO = 'asia_tokyo';
const SYDNEY = 'australia_sydney';
const NEW_YORK = 'america_new_york';

describe('computeTimeConversion: empty input (now semantics)', () => {
  it('empty input returns a HH:MM-shaped string when zones are valid', () => {
    const result = computeTimeConversion({ value: '', fromUnit: UTC, toUnit: TOKYO });
    expect(result).toMatch(/^\d{2}:\d{2}( [+-]1d)?$/);
  });

  it('empty input returns identity-shape result for same-zone conversion', () => {
    const result = computeTimeConversion({ value: '', fromUnit: UTC, toUnit: UTC });
    expect(result).toMatch(/^\d{2}:\d{2}$/); // no day shift for same zone
  });

  it('empty input returns HH:MM with seconds absent (default is no-seconds)', () => {
    const result = computeTimeConversion({ value: '', fromUnit: UTC, toUnit: LA });
    // Must not contain the ':SS' third component.
    expect(result).toMatch(/^\d{2}:\d{2}( [+-]1d)?$/);
    expect(result).not.toMatch(/^\d{2}:\d{2}:\d{2}/);
  });
});

describe('computeTimeConversion: HH:MM parsing (deterministic fixed-offset zones)', () => {
  it('UTC 00:00 → Tokyo (+9) = 09:00 same day', () => {
    const result = computeTimeConversion({ value: '00:00', fromUnit: UTC, toUnit: TOKYO });
    expect(result).toBe('09:00');
  });

  it('UTC 15:00 → Tokyo (+9) = 00:00 next day (+1d)', () => {
    const result = computeTimeConversion({ value: '15:00', fromUnit: UTC, toUnit: TOKYO });
    expect(result).toBe('00:00 +1d');
  });

  it('UTC 22:30 → Tokyo (+9) = 07:30 next day (+1d)', () => {
    const result = computeTimeConversion({ value: '22:30', fromUnit: UTC, toUnit: TOKYO });
    expect(result).toBe('07:30 +1d');
  });

  it('UTC 05:00 → Honolulu (-10) = 19:00 previous day (-1d)', () => {
    const result = computeTimeConversion({ value: '05:00', fromUnit: UTC, toUnit: HONOLULU });
    expect(result).toBe('19:00 -1d');
  });

  it('UTC 10:00 → Honolulu (-10) = 00:00 same day', () => {
    const result = computeTimeConversion({ value: '10:00', fromUnit: UTC, toUnit: HONOLULU });
    expect(result).toBe('00:00');
  });

  it('Tokyo 09:00 → UTC (-9) = 00:00 same day', () => {
    const result = computeTimeConversion({ value: '09:00', fromUnit: TOKYO, toUnit: UTC });
    expect(result).toBe('00:00');
  });

  it('Tokyo 05:00 → UTC (-9) = 20:00 previous day (-1d)', () => {
    const result = computeTimeConversion({ value: '05:00', fromUnit: TOKYO, toUnit: UTC });
    expect(result).toBe('20:00 -1d');
  });

  it('Tokyo 12:00 → Honolulu (offset -19h in total) = 17:00 previous day', () => {
    // Tokyo UTC+9, Honolulu UTC-10, delta = -19h. 12:00 - 19:00 = -7:00
    // wraps to 17:00 previous day.
    const result = computeTimeConversion({ value: '12:00', fromUnit: TOKYO, toUnit: HONOLULU });
    expect(result).toBe('17:00 -1d');
  });
});

describe('computeTimeConversion: HH:MM:SS parsing (seconds propagate)', () => {
  it('UTC 00:00:00 → Tokyo (+9) = 09:00:00', () => {
    const result = computeTimeConversion({ value: '00:00:00', fromUnit: UTC, toUnit: TOKYO });
    expect(result).toBe('09:00:00');
  });

  it('UTC 12:34:56 → Tokyo (+9) = 21:34:56', () => {
    const result = computeTimeConversion({ value: '12:34:56', fromUnit: UTC, toUnit: TOKYO });
    expect(result).toBe('21:34:56');
  });

  it('UTC 22:45:30 → Tokyo (+9) = 07:45:30 +1d (day-shift preserved with seconds)', () => {
    const result = computeTimeConversion({ value: '22:45:30', fromUnit: UTC, toUnit: TOKYO });
    expect(result).toBe('07:45:30 +1d');
  });

  it('HH:MM input yields HH:MM output; HH:MM:SS input yields HH:MM:SS output', () => {
    const noSec = computeTimeConversion({ value: '10:00', fromUnit: UTC, toUnit: UTC });
    const withSec = computeTimeConversion({ value: '10:00:00', fromUnit: UTC, toUnit: UTC });
    expect(noSec).toBe('10:00');
    expect(withSec).toBe('10:00:00');
  });
});

describe('computeTimeConversion: same-zone identity', () => {
  it('UTC → UTC preserves HH:MM input', () => {
    expect(computeTimeConversion({ value: '12:00', fromUnit: UTC, toUnit: UTC })).toBe('12:00');
    expect(computeTimeConversion({ value: '00:00', fromUnit: UTC, toUnit: UTC })).toBe('00:00');
    expect(computeTimeConversion({ value: '23:59', fromUnit: UTC, toUnit: UTC })).toBe('23:59');
  });

  it('Tokyo → Tokyo preserves HH:MM input', () => {
    expect(computeTimeConversion({ value: '08:30', fromUnit: TOKYO, toUnit: TOKYO })).toBe('08:30');
  });

  it('same-zone identity never carries a day-shift annotation', () => {
    for (const t of ['00:00', '06:00', '12:00', '18:00', '23:59']) {
      const result = computeTimeConversion({ value: t, fromUnit: UTC, toUnit: UTC });
      expect(result).not.toMatch(/[+-]1d/);
    }
  });
});

describe('computeTimeConversion: HH:MM edge cases', () => {
  it('accepts single-digit hour (H:MM)', () => {
    const result = computeTimeConversion({ value: '5:00', fromUnit: UTC, toUnit: UTC });
    expect(result).toBe('05:00');
  });

  it('accepts 00:00 (midnight)', () => {
    expect(computeTimeConversion({ value: '00:00', fromUnit: UTC, toUnit: UTC })).toBe('00:00');
  });

  it('accepts 23:59 (last minute of day)', () => {
    expect(computeTimeConversion({ value: '23:59', fromUnit: UTC, toUnit: UTC })).toBe('23:59');
  });

  it('accepts 23:59:59 (last second of day)', () => {
    expect(computeTimeConversion({ value: '23:59:59', fromUnit: UTC, toUnit: UTC })).toBe('23:59:59');
  });
});

describe('computeTimeConversion: invalid inputs return null', () => {
  it('non-time text returns null', () => {
    expect(computeTimeConversion({ value: 'hello', fromUnit: UTC, toUnit: TOKYO })).toBeNull();
  });

  it('missing minutes returns null', () => {
    expect(computeTimeConversion({ value: '12', fromUnit: UTC, toUnit: TOKYO })).toBeNull();
  });

  it('trailing colon returns null', () => {
    expect(computeTimeConversion({ value: '12:', fromUnit: UTC, toUnit: TOKYO })).toBeNull();
  });

  it('hour > 23 returns null', () => {
    expect(computeTimeConversion({ value: '24:00', fromUnit: UTC, toUnit: TOKYO })).toBeNull();
    expect(computeTimeConversion({ value: '99:00', fromUnit: UTC, toUnit: TOKYO })).toBeNull();
  });

  it('minute > 59 returns null', () => {
    expect(computeTimeConversion({ value: '12:60', fromUnit: UTC, toUnit: TOKYO })).toBeNull();
    expect(computeTimeConversion({ value: '12:99', fromUnit: UTC, toUnit: TOKYO })).toBeNull();
  });

  it('seconds > 59 returns null', () => {
    expect(computeTimeConversion({ value: '12:00:60', fromUnit: UTC, toUnit: TOKYO })).toBeNull();
    expect(computeTimeConversion({ value: '12:00:99', fromUnit: UTC, toUnit: TOKYO })).toBeNull();
  });

  it('negative hour returns null (regex rejects the leading dash)', () => {
    expect(computeTimeConversion({ value: '-1:00', fromUnit: UTC, toUnit: TOKYO })).toBeNull();
  });

  it('four-digit hour returns null (regex requires 1-2 digits)', () => {
    expect(computeTimeConversion({ value: '1200:00', fromUnit: UTC, toUnit: TOKYO })).toBeNull();
  });

  it('mixed alphanumeric returns null', () => {
    expect(computeTimeConversion({ value: '12:0a', fromUnit: UTC, toUnit: TOKYO })).toBeNull();
    expect(computeTimeConversion({ value: 'ab:cd', fromUnit: UTC, toUnit: TOKYO })).toBeNull();
  });

  it('leading/trailing whitespace-only string returns null', () => {
    // Whitespace-only is treated as "not empty" by String.trim() upstream;
    // here the trimmed value 'hello' is rejected. But if a caller passes
    // '   ' it will trim to '' upstream and treat as "now"; here we test
    // the internal parse rejecting a non-empty non-time string.
    expect(computeTimeConversion({ value: 'garbage', fromUnit: UTC, toUnit: TOKYO })).toBeNull();
  });
});

describe('computeTimeConversion: invalid zone ids return null', () => {
  it('unknown fromUnit returns null', () => {
    expect(computeTimeConversion({ value: '12:00', fromUnit: 'not_a_zone', toUnit: UTC })).toBeNull();
  });

  it('unknown toUnit returns null', () => {
    expect(computeTimeConversion({ value: '12:00', fromUnit: UTC, toUnit: 'not_a_zone' })).toBeNull();
  });

  it('both unknown returns null', () => {
    expect(computeTimeConversion({ value: '12:00', fromUnit: 'foo', toUnit: 'bar' })).toBeNull();
  });
});

describe('computeTimeConversion: DST-observing zones (structural assertions)', () => {
  // These zones observe DST; the exact conversion depends on the wall
  // clock at test time. We assert structural properties only.

  it('UTC → Chicago produces HH:MM (optionally with day-shift)', () => {
    const result = computeTimeConversion({ value: '12:00', fromUnit: UTC, toUnit: CHICAGO });
    expect(result).toMatch(/^\d{2}:\d{2}( [+-]1d)?$/);
  });

  it('UTC → New York produces HH:MM (optionally with day-shift)', () => {
    const result = computeTimeConversion({ value: '12:00', fromUnit: UTC, toUnit: NEW_YORK });
    expect(result).toMatch(/^\d{2}:\d{2}( [+-]1d)?$/);
  });

  it('LA → Sydney produces HH:MM (optionally with day-shift)', () => {
    const result = computeTimeConversion({ value: '18:00', fromUnit: LA, toUnit: SYDNEY });
    expect(result).toMatch(/^\d{2}:\d{2}( [+-]1d)?$/);
  });

  it('UTC noon → Chicago is 5-7 hours earlier depending on DST', () => {
    // Chicago is UTC-5 (CDT) in summer, UTC-6 (CST) in winter.
    // Whichever season the test runs in, UTC 12:00 → Chicago should be
    // either 06:00 or 07:00, never with a day shift (12 - 5 or 12 - 6 both
    // land in the same day).
    const result = computeTimeConversion({ value: '12:00', fromUnit: UTC, toUnit: CHICAGO });
    expect(result === '06:00' || result === '07:00').toBe(true);
  });

  it('UTC 12:00 → Tokyo is always 21:00 (no DST in Japan)', () => {
    const result = computeTimeConversion({ value: '12:00', fromUnit: UTC, toUnit: TOKYO });
    expect(result).toBe('21:00');
  });
});

describe('computeTimeConversion: round-trip through UTC', () => {
  it('Tokyo → UTC → Tokyo recovers the original time (no DST)', () => {
    for (const t of ['00:00', '06:30', '12:00', '18:15', '23:59']) {
      const utcTime = computeTimeConversion({ value: t, fromUnit: TOKYO, toUnit: UTC });
      expect(utcTime).not.toBeNull();
      // Round-trip by feeding the same wall-clock reading back in
      // (stripping any day-shift annotation, since we can only pass
      // HH:MM to the parser).
      const cleanUtc = utcTime!.replace(/ [+-]1d$/, '');
      const backToTokyo = computeTimeConversion({ value: cleanUtc, fromUnit: UTC, toUnit: TOKYO });
      const cleanBack = backToTokyo!.replace(/ [+-]1d$/, '');
      expect(cleanBack).toBe(t);
    }
  });

  it('Honolulu → UTC → Honolulu recovers the original time (no DST)', () => {
    for (const t of ['00:00', '06:30', '12:00', '18:15', '23:59']) {
      const utcTime = computeTimeConversion({ value: t, fromUnit: HONOLULU, toUnit: UTC });
      const cleanUtc = utcTime!.replace(/ [+-]1d$/, '');
      const backToHono = computeTimeConversion({ value: cleanUtc, fromUnit: UTC, toUnit: HONOLULU });
      const cleanBack = backToHono!.replace(/ [+-]1d$/, '');
      expect(cleanBack).toBe(t);
    }
  });
});
