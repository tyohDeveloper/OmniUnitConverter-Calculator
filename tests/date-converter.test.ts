import { describe, it, expect } from 'vitest';
import { CALENDAR_IDS } from '../client/src/lib/calendar/calendarIds';
import { CALENDAR_ERAS } from '../client/src/lib/calendar/calendarEras';
import { makeCalendarDate } from '../client/src/lib/calendar/makeCalendarDate';
import { isoToCalendarFields } from '../client/src/lib/calendar/isoToCalendarFields';
import { listCalendarMonths } from '../client/src/lib/calendar/listCalendarMonths';
import { formatCalendarDate } from '../client/src/lib/calendar/formatCalendarDate';
import { calendarDisplayName } from '../client/src/lib/calendar/calendarDisplayName';
import {
  CONVERSION_DATA, parseUnitText,
  getFilteredSortedUnits, getComparisonUnits, isNonUnitCategory,
} from '../client/src/lib/conversion-data';
import { CATEGORY_DIMENSIONS } from '../client/src/lib/calculator';
import { UI_TRANSLATIONS, SUPPORTED_LANGUAGES } from '../client/src/lib/localization';

describe('Date converter: calendar conversions', () => {
  it('known reference date converts correctly across calendars', () => {
    const iso = '2023-09-02';
    const expected: Record<string, [number, number]> = {
      buddhist: [2566, 2],   // BE = CE + 543
      roc: [112, 2],         // Minguo = CE - 1911
      persian: [1402, 11],   // 11 Shahrivar 1402
      indian: [1945, 11],    // 11 Bhadra 1945 Saka
      coptic: [1739, 27],    // 27 Misra 1739
      hebrew: [5783, 16],    // 16 Elul 5783
      'islamic-umalqura': [1445, 17], // 17 Safar 1445
      'islamic': [1445, 17],
      'islamic-rgsa': [1445, 17],
    };
    for (const [cal, [year, day]] of Object.entries(expected)) {
      const f = isoToCalendarFields(iso, cal);
      const y = f.eraYear ?? f.year;
      expect(y, `${cal} year`).toBe(year);
      expect(f.day, `${cal} day`).toBe(day);
    }
  });

  it('round-trips every calendar back to the same ISO date', () => {
    for (const iso of ['2023-09-02', '1999-12-31', '2024-02-29']) {
      for (const cal of CALENDAR_IDS) {
        const fields = isoToCalendarFields(iso, cal);
        const result = makeCalendarDate(fields);
        expect(result.ok, `${cal} from ${iso}: ${result.ok ? '' : result.error}`).toBe(true);
        if (result.ok) expect(result.isoDate, `${cal} round-trip of ${iso}`).toBe(iso);
      }
    }
  });

  it('handles Hebrew leap month (Adar I, 5784)', () => {
    const months = listCalendarMonths({ calendar: 'hebrew', year: 5784 }, 'en-GB');
    expect(months.length).toBe(13);
    const result = makeCalendarDate({ calendar: 'hebrew', year: 5784, month: 6, day: 1 });
    expect(result.ok && result.isoDate).toBe('2024-02-10'); // 1 Adar I 5784
    expect(months[5].monthCode).toBe('M05L');
  });

  it('handles Chinese leap month year (2023 has leap month 2)', () => {
    const f = isoToCalendarFields('2023-04-15', 'chinese');
    expect(f.month).toBe(3); // ordinal 3rd month is the leap 2nd month
    const months = listCalendarMonths({ calendar: 'chinese', year: f.year }, 'en-GB');
    expect(months.length).toBe(13);
    expect(months[2].monthCode).toBe('M02L');
    const back = makeCalendarDate(f);
    expect(back.ok && back.isoDate).toBe('2023-04-15');
  });

  it('handles Japanese and ROC eras', () => {
    const reiwa = makeCalendarDate({ calendar: 'japanese', era: 'reiwa', eraYear: 5, month: 9, day: 2 });
    expect(reiwa.ok && reiwa.isoDate).toBe('2023-09-02');
    const showa = makeCalendarDate({ calendar: 'japanese', era: 'showa', eraYear: 64, month: 1, day: 7 });
    expect(showa.ok && showa.isoDate).toBe('1989-01-07'); // last day of Shōwa
    const roc = makeCalendarDate({ calendar: 'roc', era: 'roc', eraYear: 112, month: 1, day: 1 });
    expect(roc.ok && roc.isoDate).toBe('2023-01-01');
    const bce = makeCalendarDate({ calendar: 'gregory', era: 'bce', eraYear: 44, month: 3, day: 15 });
    expect(bce.ok).toBe(true); // Ides of March, 44 BCE
  });

  it('rejects invalid dates with an error instead of silently constraining', () => {
    const feb30 = makeCalendarDate({ calendar: 'gregory', era: 'ce', eraYear: 2023, month: 2, day: 30 });
    expect(feb30.ok).toBe(false);
    const badMonth = makeCalendarDate({ calendar: 'iso8601', year: 2023, month: 14, day: 1 });
    expect(badMonth.ok).toBe(false);
    const nonLeapHebrew = makeCalendarDate({ calendar: 'hebrew', year: 5783, month: 13, day: 1 });
    expect(nonLeapHebrew.ok).toBe(false); // 5783 has only 12 months
    const nanYear = makeCalendarDate({ calendar: 'iso8601', month: 1, day: 1 });
    expect(nanYear.ok).toBe(false);
  });

  it('era calendars list eras with valid Temporal era codes', () => {
    for (const [cal, eras] of Object.entries(CALENDAR_ERAS)) {
      for (const era of eras) {
        const r = makeCalendarDate({ calendar: cal, era, eraYear: 1, month: 1, day: 1 });
        expect(r.ok, `${cal}/${era}: ${r.ok ? '' : r.error}`).toBe(true);
      }
    }
  });
});

describe('Date converter: localization', () => {
  it('formats dates per-locale via Intl', () => {
    expect(formatCalendarDate('2023-09-02', 'iso8601', 'en-GB')).toContain('September');
    expect(formatCalendarDate('2023-09-02', 'japanese', 'ja')).toContain('令和');
    expect(formatCalendarDate('2023-09-02', 'hebrew', 'en-GB')).toContain('Elul');
  });

  it('localizes month names including leap months', () => {
    const months = listCalendarMonths({ calendar: 'hebrew', year: 5784 }, 'en-GB');
    const labels = months.map(m => m.label);
    expect(labels).toContain('Adar I');
    expect(labels).toContain('Adar II');
  });

  it('covers the full Intl-supported calendar set', () => {
    const supported = (Intl as unknown as { supportedValuesOf(k: string): string[] }).supportedValuesOf('calendar');
    for (const cal of supported) {
      expect(CALENDAR_IDS as readonly string[], `missing calendar "${cal}"`).toContain(cal);
    }
  });

  it('provides a display name for every calendar', () => {
    for (const cal of CALENDAR_IDS) {
      expect(calendarDisplayName(cal, 'en-GB').length).toBeGreaterThan(0);
      expect(calendarDisplayName(cal, 'zh').length).toBeGreaterThan(0);
    }
  });

  it('all 12 languages have the Date UI keys', () => {
    const keys = ['Date', 'date-subtitle', 'Calendar', 'Era', 'Year', 'Month', 'Day', 'All calendars', 'date-error-year', 'date-error-day', 'date-error-invalid'];
    for (const lang of SUPPORTED_LANGUAGES) {
      for (const key of keys) {
        expect(UI_TRANSLATIONS[lang][key], `"${key}" missing in "${lang}"`).toBeDefined();
      }
    }
  });
});

describe('Date category: exclusion guards', () => {
  it('is a non-unit category and has no entry in CONVERSION_DATA', () => {
    expect(isNonUnitCategory('date')).toBe(true);
    expect(CONVERSION_DATA.find(c => (c.id as string) === 'date')).toBeUndefined();
  });

  it('is excluded from the calculator dimension map', () => {
    expect((CATEGORY_DIMENSIONS as Record<string, unknown>)['date']).toBeUndefined();
  });

  it('smart paste never matches date text or routes to the date category', () => {
    for (const text of ['2023-09-02', '15 January 2024', '2023/09/02', '1 date', '5 reiwa']) {
      const parsed = parseUnitText(text);
      expect(parsed.categoryId, `"${text}" must not resolve to a category`).not.toBe('date');
    }
    expect(parseUnitText('2023-09-02').unitId).toBeNull();
  });

  it('unit lists and comparison mode return empty for date', () => {
    expect(getFilteredSortedUnits('date')).toEqual([]);
    expect(getComparisonUnits('date', 'anything')).toEqual([]);
  });
});
