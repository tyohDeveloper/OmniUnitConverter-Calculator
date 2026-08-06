import { describe, it, expect } from 'vitest';
import { parseTimeWithZone } from '../client/src/lib/calculator/parseTimeWithZone';

/**
 * Tests for the extended time-with-zone parser used by the Time zone
 * converter's value field. Covers plain time parsing, abbreviation
 * lookup, full IANA lookup, case/whitespace normalization, ambiguity
 * resolution against our registered zone set, and failure modes.
 */

describe('parseTimeWithZone: plain time (no zone token)', () => {
  it('HH:MM without zone → time set, zoneUnitId null', () => {
    expect(parseTimeWithZone('12:30')).toEqual({ time: '12:30', zoneUnitId: null });
    expect(parseTimeWithZone('00:00')).toEqual({ time: '00:00', zoneUnitId: null });
    expect(parseTimeWithZone('23:59')).toEqual({ time: '23:59', zoneUnitId: null });
  });

  it('HH:MM:SS without zone → time set (with seconds), zoneUnitId null', () => {
    expect(parseTimeWithZone('12:30:45')).toEqual({ time: '12:30:45', zoneUnitId: null });
    expect(parseTimeWithZone('00:00:00')).toEqual({ time: '00:00:00', zoneUnitId: null });
  });

  it('single-digit hour normalized to two-digit', () => {
    expect(parseTimeWithZone('5:00')).toEqual({ time: '05:00', zoneUnitId: null });
    expect(parseTimeWithZone('9:07:03')).toEqual({ time: '09:07:03', zoneUnitId: null });
  });

  it('empty string → both null', () => {
    expect(parseTimeWithZone('')).toEqual({ time: null, zoneUnitId: null });
  });

  it('whitespace-only string → both null (trimmed to empty)', () => {
    expect(parseTimeWithZone('   ')).toEqual({ time: null, zoneUnitId: null });
    expect(parseTimeWithZone('\t\n')).toEqual({ time: null, zoneUnitId: null });
  });
});

describe('parseTimeWithZone: abbreviation lookup', () => {
  it('UTC → utc', () => {
    expect(parseTimeWithZone('12:00 UTC')).toEqual({ time: '12:00', zoneUnitId: 'utc' });
  });

  it('Z (Zulu) → utc', () => {
    expect(parseTimeWithZone('12:00 Z')).toEqual({ time: '12:00', zoneUnitId: 'utc' });
  });

  it('GMT → europe_london', () => {
    expect(parseTimeWithZone('12:00 GMT')).toEqual({ time: '12:00', zoneUnitId: 'europe_london' });
  });

  it('EST and EDT both → america_new_york', () => {
    expect(parseTimeWithZone('12:00 EST').zoneUnitId).toBe('america_new_york');
    expect(parseTimeWithZone('12:00 EDT').zoneUnitId).toBe('america_new_york');
  });

  it('CST and CDT both → america_chicago', () => {
    expect(parseTimeWithZone('12:00 CST').zoneUnitId).toBe('america_chicago');
    expect(parseTimeWithZone('12:00 CDT').zoneUnitId).toBe('america_chicago');
  });

  it('MST and MDT both → america_denver', () => {
    expect(parseTimeWithZone('12:00 MST').zoneUnitId).toBe('america_denver');
    expect(parseTimeWithZone('12:00 MDT').zoneUnitId).toBe('america_denver');
  });

  it('PST and PDT both → america_los_angeles', () => {
    expect(parseTimeWithZone('12:00 PST').zoneUnitId).toBe('america_los_angeles');
    expect(parseTimeWithZone('12:00 PDT').zoneUnitId).toBe('america_los_angeles');
  });

  it('HST → pacific_honolulu', () => {
    expect(parseTimeWithZone('12:00 HST').zoneUnitId).toBe('pacific_honolulu');
  });

  it('JST → asia_tokyo', () => {
    expect(parseTimeWithZone('12:00 JST').zoneUnitId).toBe('asia_tokyo');
  });

  it('IST resolves to asia_kolkata (only registered IST zone)', () => {
    expect(parseTimeWithZone('12:00 IST').zoneUnitId).toBe('asia_kolkata');
  });

  it('BST → europe_london', () => {
    expect(parseTimeWithZone('12:00 BST').zoneUnitId).toBe('europe_london');
  });

  it('CET and CEST both → europe_paris', () => {
    expect(parseTimeWithZone('12:00 CET').zoneUnitId).toBe('europe_paris');
    expect(parseTimeWithZone('12:00 CEST').zoneUnitId).toBe('europe_paris');
  });

  it('AEST and AEDT both → australia_sydney', () => {
    expect(parseTimeWithZone('12:00 AEST').zoneUnitId).toBe('australia_sydney');
    expect(parseTimeWithZone('12:00 AEDT').zoneUnitId).toBe('australia_sydney');
  });

  it('NZST and NZDT both → pacific_auckland', () => {
    expect(parseTimeWithZone('12:00 NZST').zoneUnitId).toBe('pacific_auckland');
    expect(parseTimeWithZone('12:00 NZDT').zoneUnitId).toBe('pacific_auckland');
  });

  it('abbreviations are case-insensitive', () => {
    expect(parseTimeWithZone('12:00 utc').zoneUnitId).toBe('utc');
    expect(parseTimeWithZone('12:00 Utc').zoneUnitId).toBe('utc');
    expect(parseTimeWithZone('12:00 uTc').zoneUnitId).toBe('utc');
    expect(parseTimeWithZone('12:00 est').zoneUnitId).toBe('america_new_york');
  });
});

describe('parseTimeWithZone: full IANA identifier lookup', () => {
  it('America/Chicago → america_chicago', () => {
    expect(parseTimeWithZone('12:00 America/Chicago').zoneUnitId).toBe('america_chicago');
  });

  it('Europe/Berlin → europe_berlin', () => {
    expect(parseTimeWithZone('12:00 Europe/Berlin').zoneUnitId).toBe('europe_berlin');
  });

  it('Asia/Tokyo → asia_tokyo (matches both abbrev and IANA)', () => {
    expect(parseTimeWithZone('12:00 Asia/Tokyo').zoneUnitId).toBe('asia_tokyo');
    expect(parseTimeWithZone('12:00 JST').zoneUnitId).toBe('asia_tokyo');
  });

  it('Pacific/Auckland → pacific_auckland', () => {
    expect(parseTimeWithZone('12:00 Pacific/Auckland').zoneUnitId).toBe('pacific_auckland');
  });

  it('IANA lookup is case-insensitive', () => {
    expect(parseTimeWithZone('12:00 america/chicago').zoneUnitId).toBe('america_chicago');
    expect(parseTimeWithZone('12:00 AMERICA/CHICAGO').zoneUnitId).toBe('america_chicago');
  });

  it('space is treated as underscore in IANA identifier', () => {
    // Users may naturally type 'America/New York' rather than
    // 'America/New_York'; both should work.
    expect(parseTimeWithZone('12:00 America/New York').zoneUnitId).toBe('america_new_york');
    expect(parseTimeWithZone('12:00 America/New_York').zoneUnitId).toBe('america_new_york');
    expect(parseTimeWithZone('12:00 America/Los Angeles').zoneUnitId).toBe('america_los_angeles');
    expect(parseTimeWithZone('12:00 America/Sao Paulo').zoneUnitId).toBe('america_sao_paulo');
  });
});

describe('parseTimeWithZone: unknown zone token (time still parses)', () => {
  it('unknown abbreviation → time set, zoneUnitId null', () => {
    expect(parseTimeWithZone('12:00 XYZ')).toEqual({ time: '12:00', zoneUnitId: null });
  });

  it('unknown IANA-shaped id → time set, zoneUnitId null', () => {
    expect(parseTimeWithZone('12:00 Antarctica/Vostok')).toEqual({ time: '12:00', zoneUnitId: null });
  });

  it('garbage after time → time set, zoneUnitId null', () => {
    expect(parseTimeWithZone('12:00 foo bar baz')).toEqual({ time: '12:00', zoneUnitId: null });
  });
});

describe('parseTimeWithZone: invalid time → both null', () => {
  it('hour > 23 → both null', () => {
    expect(parseTimeWithZone('24:00 UTC')).toEqual({ time: null, zoneUnitId: null });
    expect(parseTimeWithZone('99:00 UTC')).toEqual({ time: null, zoneUnitId: null });
  });

  it('minute > 59 → both null', () => {
    expect(parseTimeWithZone('12:60 UTC')).toEqual({ time: null, zoneUnitId: null });
    expect(parseTimeWithZone('12:99 UTC')).toEqual({ time: null, zoneUnitId: null });
  });

  it('second > 59 → both null', () => {
    expect(parseTimeWithZone('12:00:60 UTC')).toEqual({ time: null, zoneUnitId: null });
  });

  it('missing minutes → both null', () => {
    expect(parseTimeWithZone('12 UTC')).toEqual({ time: null, zoneUnitId: null });
  });

  it('non-numeric characters in time → both null', () => {
    expect(parseTimeWithZone('12:ab UTC')).toEqual({ time: null, zoneUnitId: null });
    expect(parseTimeWithZone('ab:cd UTC')).toEqual({ time: null, zoneUnitId: null });
  });

  it('four-digit hour → both null', () => {
    expect(parseTimeWithZone('1200:00 UTC')).toEqual({ time: null, zoneUnitId: null });
  });

  it('negative hour → both null', () => {
    expect(parseTimeWithZone('-1:00 UTC')).toEqual({ time: null, zoneUnitId: null });
  });

  it('trailing colon → both null', () => {
    expect(parseTimeWithZone('12: UTC')).toEqual({ time: null, zoneUnitId: null });
  });
});

describe('parseTimeWithZone: whitespace handling', () => {
  it('leading/trailing whitespace is trimmed', () => {
    expect(parseTimeWithZone('  12:00 UTC  ')).toEqual({ time: '12:00', zoneUnitId: 'utc' });
    expect(parseTimeWithZone('\t12:00 EST\n')).toEqual({ time: '12:00', zoneUnitId: 'america_new_york' });
  });

  it('multiple internal spaces between time and zone are tolerated', () => {
    expect(parseTimeWithZone('12:00   UTC').zoneUnitId).toBe('utc');
  });
});

describe('parseTimeWithZone: seconds propagate with zone', () => {
  it('HH:MM:SS ZONE → time (with seconds) + zone', () => {
    expect(parseTimeWithZone('12:34:56 UTC')).toEqual({ time: '12:34:56', zoneUnitId: 'utc' });
    expect(parseTimeWithZone('09:07:03 JST')).toEqual({ time: '09:07:03', zoneUnitId: 'asia_tokyo' });
  });
});
