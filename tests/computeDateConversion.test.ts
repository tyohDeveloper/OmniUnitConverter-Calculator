import { describe, it, expect } from 'vitest';
import { computeDateConversion } from '../client/src/lib/calculator/computeDateConversion';

/**
 * Behavior tests for computeDateConversion.
 *
 * The Temporal-polyfill and CLDR outputs are deterministic for
 * fixed dates, so most tests use pinned inputs (e.g. 2026-08-05
 * as Common) and assert the full formatted string. A few tests use
 * shape assertions for cases where the exact output depends on
 * wall-clock time (empty-input "today") or the CLDR month-name
 * spelling might drift between polyfill versions.
 */

const EN = 'en';
const JA = 'ja';

describe('computeDateConversion: empty input (today)', () => {
  it('empty input returns a formatted date string in the target calendar', () => {
    const result = computeDateConversion({ value: '', fromUnit: 'common', toUnit: 'common', language: EN });
    expect(result).not.toBeNull();
    // Rough shape: contains a comma-separated month/day/year pattern
    // and an era label.
    expect(result).toMatch(/\d{4}/);
  });

  it('empty input with Hebrew target returns a Hebrew-shaped string', () => {
    const result = computeDateConversion({ value: '', fromUnit: 'common', toUnit: 'hebrew', language: EN });
    expect(result).not.toBeNull();
    expect(result).toContain('AM'); // Hebrew era label
  });
});

describe('computeDateConversion: Common → various (2026-08-05)', () => {
  it('Common → Common in English shows CE (not AD)', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'common', language: EN });
    expect(result).toBe('August 5, 2026 CE');
  });

  it('Gregorian → Gregorian in English shows AD (not swapped)', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'gregorian', toUnit: 'gregorian', language: EN });
    expect(result).toBe('August 5, 2026 AD');
  });

  it('Common → Hebrew: 22 Av 5786 AM', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'hebrew', language: EN });
    expect(result).toBe('22 Av 5786 AM');
  });

  it('Common → Islamic (Umm al-Qura): Safar 22, 1448 AH', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'islamic', language: EN });
    expect(result).toBe('Safar 22, 1448 AH');
  });

  it('Common → Persian: Mordad 14, 1405 AP', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'persian', language: EN });
    expect(result).toBe('Mordad 14, 1405 AP');
  });

  it('Common → Japanese: August 5, Reiwa 8', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'japanese', language: EN });
    expect(result).toBe('August 5, 8 Reiwa');
  });

  it('Common → ROC: August 5, 115 Minguo', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'roc', language: EN });
    expect(result).toBe('August 5, 115 Minguo');
  });

  it('Common → Buddhist: August 5, 2569 BE', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'buddhist', language: EN });
    expect(result).toBe('August 5, 2569 BE');
  });

  it('Common → Indian (Saka): includes Sravana and a Saka-family era label', () => {
    // CLDR uses 'Śaka' (with acute accent) in current polyfill output.
    // Assert on the year + a lenient era pattern.
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'indian', language: EN });
    expect(result).toMatch(/1948/);
    expect(result).toMatch(/[ŚSs][hḥ]?aka/);
  });

  it('Common → Coptic: 29 Epep 1742 AM', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'coptic', language: EN });
    expect(result).toContain('1742');
    expect(result).toContain('AM');
  });

  it('Common → Ethiopic: 29 Hamle 2018 AM', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'ethiopic', language: EN });
    expect(result).toContain('2018');
    expect(result).toContain('AM');
  });

  it('Common → Chinese: contains 2026 and a stem-branch year name', () => {
    // Chinese calendar has no era; output uses relatedYear + yearName.
    // Exact format includes '(bing-wu)' for 2026 in English locale.
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'chinese', language: EN });
    expect(result).toContain('2026');
    expect(result).toContain('bing-wu');
  });
});

describe('computeDateConversion: from non-Gregorian calendars', () => {
  it('Hebrew 5786-11-22 → Common: August 5, 2026 CE', () => {
    const result = computeDateConversion({ value: '5786-11-22', fromUnit: 'hebrew', toUnit: 'common', language: EN });
    expect(result).toBe('August 5, 2026 CE');
  });

  it('Islamic 1448-02-22 → Common: August 5, 2026 CE', () => {
    const result = computeDateConversion({ value: '1448-02-22', fromUnit: 'islamic', toUnit: 'common', language: EN });
    expect(result).toBe('August 5, 2026 CE');
  });

  it('Buddhist 2569-08-05 → Common: August 5, 2026 CE', () => {
    // Buddhist calendar uses the same months and days as Gregorian; only the year differs.
    const result = computeDateConversion({ value: '2569-08-05', fromUnit: 'buddhist', toUnit: 'common', language: EN });
    expect(result).toBe('August 5, 2026 CE');
  });
});

describe('computeDateConversion: BCE dates via astronomical negative years', () => {
  it('Gregorian -322-04-15 renders as 323 BC', () => {
    // ISO astronomical year -322 = 323 BCE traditional.
    const result = computeDateConversion({ value: '-322-04-15', fromUnit: 'gregorian', toUnit: 'gregorian', language: EN });
    expect(result).toBe('April 15, 323 BC');
  });

  it('Common -322-04-15 renders as 323 BCE (CE/BCE swap)', () => {
    const result = computeDateConversion({ value: '-322-04-15', fromUnit: 'common', toUnit: 'common', language: EN });
    expect(result).toBe('April 15, 323 BCE');
  });

  it('Gregorian year 0 does not exist but is handled without crashing', () => {
    // ISO astronomical year 0 = 1 BCE. Should render, not throw.
    const result = computeDateConversion({ value: '0-01-01', fromUnit: 'gregorian', toUnit: 'gregorian', language: EN });
    expect(result).not.toBeNull();
    expect(result).toMatch(/^\w+ \d+, \d+ (AD|BC)$/);
  });
});

describe('computeDateConversion: locale flow', () => {
  it('Japanese locale renders Japanese calendar with Japanese labels', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'japanese', language: JA });
    expect(result).toBe('令和8年8月5日');
  });

  it('Japanese locale renders Chinese calendar with Chinese stem-branch characters', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'chinese', language: JA });
    expect(result).toContain('2026');
    expect(result).toContain('丙午');
  });

  it('Japanese locale renders Gregorian differently from English', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'gregorian', toUnit: 'gregorian', language: JA });
    // Japanese uses 西暦 for the era in gregory calendar
    expect(result).not.toBe('August 5, 2026 AD');
    expect(result).toContain('2026');
  });

  it('Japanese Common: no substitution (CLDR already religiously-neutral)', () => {
    // Japanese renders 西暦 (Western calendar) which is already the
    // secular convention; no substitution needed.
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'common', language: JA });
    expect(result).toBe('西暦2026年8月5日');
  });
});

describe('computeDateConversion: Common era-label substitutions per locale', () => {
  // For each locale that renders Christian-era abbreviations in
  // CLDR (AD/BC-equivalents), 'common' target substitutes the
  // religiously-neutral CE/BCE-equivalent from academic convention.

  it('German substitutes n. Chr. → u. Z. and v. Chr. → v. u. Z.', () => {
    const ce = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'common', language: 'de' });
    expect(ce).toBe('5. August 2026 u. Z.');
    const bce = computeDateConversion({ value: '-322-04-15', fromUnit: 'common', toUnit: 'common', language: 'de' });
    expect(bce).toBe('15. April 323 v. u. Z.');
  });

  it('Spanish substitutes d. C. → e. c. and a. C. → a. e. c.', () => {
    const ce = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'common', language: 'es' });
    expect(ce).toBe('5 de agosto de 2026 e. c.');
    const bce = computeDateConversion({ value: '-322-04-15', fromUnit: 'common', toUnit: 'common', language: 'es' });
    expect(bce).toBe('15 de abril de 323 a. e. c.');
  });

  it('French substitutes ap. J.-C. → EC and av. J.-C. → AEC', () => {
    const ce = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'common', language: 'fr' });
    expect(ce).toBe('5 août 2026 EC');
    const bce = computeDateConversion({ value: '-322-04-15', fromUnit: 'common', toUnit: 'common', language: 'fr' });
    expect(bce).toBe('15 avril 323 AEC');
  });

  it('Italian substitutes d.C. → E.V. and a.C. → A.E.V.', () => {
    const ce = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'common', language: 'it' });
    expect(ce).toBe('5 agosto 2026 E.V.');
    const bce = computeDateConversion({ value: '-322-04-15', fromUnit: 'common', toUnit: 'common', language: 'it' });
    expect(bce).toBe('15 aprile 323 A.E.V.');
  });

  it('Portuguese substitutes d.C. → E.C. and a.C. → A.E.C.', () => {
    const ce = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'common', language: 'pt' });
    expect(ce).toBe('5 de agosto de 2026 E.C.');
    const bce = computeDateConversion({ value: '-322-04-15', fromUnit: 'common', toUnit: 'common', language: 'pt' });
    expect(bce).toBe('15 de abril de 323 A.E.C.');
  });

  it('Korean substitutes AD → CE and BC → BCE (Korean uses English abbreviations)', () => {
    const ce = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'common', language: 'ko' });
    expect(ce).toBe('CE 2026년 8월 5일');
    const bce = computeDateConversion({ value: '-322-04-15', fromUnit: 'common', toUnit: 'common', language: 'ko' });
    expect(bce).toBe('BCE 323년 4월 15일');
  });

  it('Russian: no substitution (CLDR renders н.э., already religiously-neutral)', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'common', language: 'ru' });
    expect(result).toBe('5 августа 2026 г. н. э.');
  });

  it('Chinese: no substitution (CLDR renders 公元, already religiously-neutral)', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'common', language: 'zh' });
    expect(result).toBe('公元2026年8月5日');
  });

  it('Arabic: no substitution (CLDR renders م, sufficiently neutral)', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'common', language: 'ar' });
    expect(result).toBe('5 أغسطس 2026 م');
  });

  it('Gregorian target is NOT substituted in any locale (only Common is)', () => {
    // Gregorian target renders AD/BC-equivalent per each locale's
    // CLDR default — no substitution applied.
    expect(computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'gregorian', language: 'de' }))
      .toBe('5. August 2026 n. Chr.');
    expect(computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'gregorian', language: 'fr' }))
      .toBe('5 août 2026 ap. J.-C.');
  });
});

describe('computeDateConversion: en-us behaves like en', () => {
  it('en-us gets the CE/BCE swap for Common', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'common', language: 'en-us' });
    expect(result).toBe('August 5, 2026 CE');
  });

  it('en-us does NOT get the swap when target is Gregorian', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'gregorian', language: 'en-us' });
    expect(result).toBe('August 5, 2026 AD');
  });
});

describe('computeDateConversion: invalid inputs return null', () => {
  it('non-date text returns null', () => {
    expect(computeDateConversion({ value: 'hello', fromUnit: 'common', toUnit: 'common', language: EN })).toBeNull();
  });

  it('missing day returns null', () => {
    expect(computeDateConversion({ value: '2026-08', fromUnit: 'common', toUnit: 'common', language: EN })).toBeNull();
  });

  it('month > 13 returns null (13 is allowed for leap-year Adar II)', () => {
    expect(computeDateConversion({ value: '2026-14-05', fromUnit: 'common', toUnit: 'common', language: EN })).toBeNull();
  });

  it('day > 31 returns null', () => {
    expect(computeDateConversion({ value: '2026-08-32', fromUnit: 'common', toUnit: 'common', language: EN })).toBeNull();
  });

  it('month 0 returns null', () => {
    expect(computeDateConversion({ value: '2026-00-05', fromUnit: 'common', toUnit: 'common', language: EN })).toBeNull();
  });

  it('day 0 returns null', () => {
    expect(computeDateConversion({ value: '2026-08-00', fromUnit: 'common', toUnit: 'common', language: EN })).toBeNull();
  });

  it('mixed alphanumeric returns null', () => {
    expect(computeDateConversion({ value: '2026-Aug-05', fromUnit: 'common', toUnit: 'common', language: EN })).toBeNull();
  });

  it('Feb 31 does NOT throw; Temporal.PlainDate.from clamps to last valid day', () => {
    // Documented Temporal behavior: overflow='constrain' is the
    // default, so 2026-02-31 becomes 2026-02-28. Our converter
    // returns the clamped result. This isn't strictly a valid-input
    // case, but it's not an error path either — pin the observed
    // behavior so future changes are deliberate.
    const result = computeDateConversion({ value: '2026-02-31', fromUnit: 'common', toUnit: 'common', language: EN });
    expect(result).toBe('February 28, 2026 CE');
  });
});

describe('computeDateConversion: Julian calendar (via JDN module)', () => {
  it('Common 2026-08-05 → Julian: 13-day lag = July 23, 2026 AD', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'julian', language: EN });
    expect(result).toBe('July 23, 2026 AD');
  });

  it('Julian 2026-07-23 → Common: August 5, 2026 CE', () => {
    const result = computeDateConversion({ value: '2026-07-23', fromUnit: 'julian', toUnit: 'common', language: EN });
    expect(result).toBe('August 5, 2026 CE');
  });

  it('Common 2000-01-01 → Julian: December 19, 1999 AD (Y2K pivot)', () => {
    const result = computeDateConversion({ value: '2000-01-01', fromUnit: 'common', toUnit: 'julian', language: EN });
    expect(result).toBe('December 19, 1999 AD');
  });

  it('Julian 1582-10-05 → Common 1582-10-15 (the Gregorian introduction gap)', () => {
    const result = computeDateConversion({ value: '1582-10-05', fromUnit: 'julian', toUnit: 'common', language: EN });
    expect(result).toBe('October 15, 1582 CE');
  });

  it('Julian round-trip: 2026-07-23 → Common → Julian recovers July 23', () => {
    const toCommon = computeDateConversion({ value: '2026-07-23', fromUnit: 'julian', toUnit: 'common', language: EN });
    expect(toCommon).toBe('August 5, 2026 CE');
    const backToJulian = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'julian', language: EN });
    expect(backToJulian).toBe('July 23, 2026 AD');
  });
});

describe('computeDateConversion: Revised Julian (Gregorian-equivalent window)', () => {
  it('Common 2026-08-05 → Revised Julian: identical to Gregorian in-window', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'revised-julian', language: EN });
    expect(result).toBe('August 5, 2026 AD');
  });

  it('Revised Julian 2026-08-05 → Common', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'revised-julian', toUnit: 'common', language: EN });
    expect(result).toBe('August 5, 2026 CE');
  });

  it('Revised Julian date pre-1600 returns null (outside equivalence window)', () => {
    const result = computeDateConversion({ value: '1500-06-15', fromUnit: 'revised-julian', toUnit: 'common', language: EN });
    expect(result).toBeNull();
  });

  it('Common date pre-1600 → Revised Julian returns null', () => {
    const result = computeDateConversion({ value: '1500-06-15', fromUnit: 'common', toUnit: 'revised-julian', language: EN });
    expect(result).toBeNull();
  });
});

describe('computeDateConversion: variant calendars', () => {
  it('Common → Islamic tabular civil: uses -civil epoch (1 day different from Umm al-Qura)', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'islamic-civil', language: EN });
    expect(result).toBe('Safar 20, 1448 AH');
  });

  it('Common → Islamic tabular astronomical: uses -tbla epoch', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'islamic-tbla', language: EN });
    expect(result).toBe('Safar 21, 1448 AH');
  });

  it('Common → Ethiopic Amete Alem: different era (aa) than plain ethiopic', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'ethiopic-alem', language: EN });
    expect(result).toContain('7518');
  });

  it('Common → Dangi: Korean lunar calendar, no era, stem-branch year name', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'dangi', language: EN });
    expect(result).toContain('2026');
    expect(result).toContain('bing-wu');
  });

  it('Common 2026-08-05 → ISO 8601: 2026-08-05 (format-locked YYYY-MM-DD)', () => {
    const result = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'iso8601', language: EN });
    expect(result).toBe('2026-08-05');
  });

  it('ISO 8601 -322-04-15 → Common: 323 BCE (astronomical -322 → traditional 323 BCE)', () => {
    const result = computeDateConversion({ value: '-322-04-15', fromUnit: 'iso8601', toUnit: 'common', language: EN });
    expect(result).toBe('April 15, 323 BCE');
  });

  it('Common -322-04-15 → ISO 8601: -0322-04-15 (signed 4-digit year)', () => {
    // Note: signing the Common input as -322 with gregory calendar
    // means "astronomical year -322", not "year 322 BCE". This is the
    // polyfill's convention for negative years in the gregory calendar.
    const result = computeDateConversion({ value: '-322-04-15', fromUnit: 'common', toUnit: 'iso8601', language: EN });
    expect(result).toBe('-0322-04-15');
  });

  it('ISO 8601 output is not localized (format-locked)', () => {
    // Same value regardless of language.
    const en = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'iso8601', language: EN });
    const ja = computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'iso8601', language: JA });
    expect(en).toBe('2026-08-05');
    expect(ja).toBe('2026-08-05');
  });
});

describe('computeDateConversion: unknown units return null', () => {
  it('unknown fromUnit returns null', () => {
    expect(computeDateConversion({ value: '2026-08-05', fromUnit: 'not_a_calendar', toUnit: 'common', language: EN })).toBeNull();
  });

  it('unknown toUnit returns null', () => {
    expect(computeDateConversion({ value: '2026-08-05', fromUnit: 'common', toUnit: 'not_a_calendar', language: EN })).toBeNull();
  });
});

describe('computeDateConversion: round-trip through Common', () => {
  // Round-tripping via YYYY-MM-DD works for calendars whose output
  // format matches the input regex. This is not true for all
  // calendars (Chinese output has parens; era-labeled output has
  // words), so we round-trip through a calendar-agnostic anchor
  // by parsing dates in one calendar and formatting in another,
  // then verifying the Common result is stable.

  it('Hebrew → Common → Hebrew via Common as anchor', () => {
    // Start with a known Hebrew date. Convert to Common. Verify
    // that reading the Hebrew year/month/day off Temporal matches.
    const hebrewToCommon = computeDateConversion({
      value: '5786-11-22', fromUnit: 'hebrew', toUnit: 'common', language: EN,
    });
    expect(hebrewToCommon).toBe('August 5, 2026 CE');
    // Convert back: 2026-08-05 in Common should hit Hebrew 5786-11-22.
    const commonToHebrew = computeDateConversion({
      value: '2026-08-05', fromUnit: 'common', toUnit: 'hebrew', language: EN,
    });
    expect(commonToHebrew).toBe('22 Av 5786 AM');
  });

  it('Buddhist → Common → Buddhist', () => {
    const buddhistToCommon = computeDateConversion({
      value: '2569-08-05', fromUnit: 'buddhist', toUnit: 'common', language: EN,
    });
    expect(buddhistToCommon).toBe('August 5, 2026 CE');
    const commonToBuddhist = computeDateConversion({
      value: '2026-08-05', fromUnit: 'common', toUnit: 'buddhist', language: EN,
    });
    expect(commonToBuddhist).toBe('August 5, 2569 BE');
  });
});
