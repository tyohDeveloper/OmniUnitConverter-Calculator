import { describe, it, expect } from 'vitest';
import { ERA_SCHEMES } from '../client/src/lib/eras/eraSchemes';
import { toAstronomicalYear } from '../client/src/lib/eras/toAstronomicalYear';
import { fromAstronomicalYear } from '../client/src/lib/eras/fromAstronomicalYear';
import { formatAstronomicalYear } from '../client/src/lib/eras/formatAstronomicalYear';
import { historicalYearToAstronomical } from '../client/src/lib/eras/historicalYearToAstronomical';
import { lookupEraTable } from '../client/src/lib/eras/lookupEraTable';
import { lookupPeriods } from '../client/src/lib/eras/lookupPeriods';
import type { EraTable, Civilization } from '../client/src/lib/eras/types';
import japaneseErasJson from '../client/src/data/eras/japaneseEras.json';
import historicalPeriodsJson from '../client/src/data/eras/historicalPeriods.json';

const JAPANESE = japaneseErasJson as EraTable;
const CIVS = historicalPeriodsJson.civilizations as Civilization[];

const scheme = (id: string) => {
  const s = ERA_SCHEMES.find(x => x.id === id);
  if (!s) throw new Error(`missing scheme ${id}`);
  return s;
};

describe('Era schemes data', () => {
  it('includes all Tier 1 + Tier 2 schemes', () => {
    const ids = ERA_SCHEMES.map(s => s.id);
    for (const id of ['gregorian', 'buddhist', 'minguo', 'juche', 'hebrew', 'byzantine',
      'auc', 'saka', 'vikram', 'holocene', 'ethiopian', 'solar_hijri', 'hijri']) {
      expect(ids, `missing scheme ${id}`).toContain(id);
    }
  });

  it('every scheme has a source URL', () => {
    for (const s of ERA_SCHEMES) expect(s.sourceUrl, s.id).toMatch(/^https:\/\//);
  });

  it('non-Jan-1 schemes carry a note key for the ±1 indicator', () => {
    for (const s of ERA_SCHEMES) {
      if (!s.newYearJan1) expect(s.note, `${s.id} needs a note`).toBeTruthy();
    }
  });
});

describe('Fixed-offset conversion (astronomical hub)', () => {
  it('2026 CE in each Tier 1 scheme', () => {
    expect(fromAstronomicalYear(2026, scheme('buddhist'))).toBe(2569);
    expect(fromAstronomicalYear(2026, scheme('minguo'))).toBe(115);
    expect(fromAstronomicalYear(2026, scheme('juche'))).toBe(115);
    expect(fromAstronomicalYear(2026, scheme('hebrew'))).toBe(5786);
    expect(fromAstronomicalYear(2026, scheme('byzantine'))).toBe(7534);
    expect(fromAstronomicalYear(2026, scheme('auc'))).toBe(2779);
    expect(fromAstronomicalYear(2026, scheme('saka'))).toBe(1948);
    expect(fromAstronomicalYear(2026, scheme('vikram'))).toBe(2083);
    expect(fromAstronomicalYear(2026, scheme('holocene'))).toBe(12026);
    expect(fromAstronomicalYear(2026, scheme('ethiopian'))).toBe(2019);
    expect(fromAstronomicalYear(2026, scheme('solar_hijri'))).toBe(1405);
  });

  it('round-trips through the astronomical hub for every offset scheme', () => {
    for (const s of ERA_SCHEMES.filter(x => x.kind === 'offset')) {
      for (const astro of [-1000, 0, 1, 1912, 2026]) {
        expect(toAstronomicalYear(fromAstronomicalYear(astro, s), s), s.id).toBe(astro);
      }
    }
  });

  it('gregorian scheme is the identity', () => {
    expect(toAstronomicalYear(2026, scheme('gregorian'))).toBe(2026);
    expect(fromAstronomicalYear(-43, scheme('gregorian'))).toBe(-43);
  });
});

describe('BCE / year-0 handling', () => {
  it('astronomical 0 is 1 BCE and −44 is 45 BCE', () => {
    expect(formatAstronomicalYear(0)).toEqual({ year: 1, era: 'BCE' });
    expect(formatAstronomicalYear(-44)).toEqual({ year: 45, era: 'BCE' });
    expect(formatAstronomicalYear(1)).toEqual({ year: 1, era: 'CE' });
    expect(formatAstronomicalYear(2026)).toEqual({ year: 2026, era: 'CE' });
  });

  it('historical signed year → astronomical (no year zero)', () => {
    expect(historicalYearToAstronomical(-1)).toBe(0);
    expect(historicalYearToAstronomical(-100)).toBe(-99);
    expect(historicalYearToAstronomical(100)).toBe(100);
  });

  it('Holocene era of 1 BCE (astro 0) is 10000 HE', () => {
    expect(fromAstronomicalYear(0, scheme('holocene'))).toBe(10000);
  });
});

describe('Hijri lunar approximation', () => {
  it('622 CE is approximately AH 0/1 (epoch)', () => {
    const ah = fromAstronomicalYear(622, scheme('hijri'));
    expect(Math.abs(ah)).toBeLessThanOrEqual(1);
  });

  it('2026 CE ≈ AH 1447 (±1, drift-tolerant)', () => {
    const ah = fromAstronomicalYear(2026, scheme('hijri'));
    expect(Math.abs(ah - 1447)).toBeLessThanOrEqual(1);
  });

  it('inverse formula round-trips within ±1 year', () => {
    for (const astro of [700, 1000, 1500, 2000, 2026]) {
      const back = toAstronomicalYear(fromAstronomicalYear(astro, scheme('hijri')), scheme('hijri'));
      expect(Math.abs(back - astro)).toBeLessThanOrEqual(1);
    }
  });
});

describe('Japanese era-table lookup (generic piecewise)', () => {
  it('boundary years map to the era starting that year', () => {
    expect(lookupEraTable(1868, JAPANESE)).toEqual({ eraName: 'Meiji', eraYear: 1 });
    expect(lookupEraTable(1912, JAPANESE)).toEqual({ eraName: 'Taishō', eraYear: 1 });
    expect(lookupEraTable(1926, JAPANESE)).toEqual({ eraName: 'Shōwa', eraYear: 1 });
    expect(lookupEraTable(1989, JAPANESE)).toEqual({ eraName: 'Heisei', eraYear: 1 });
    expect(lookupEraTable(2019, JAPANESE)).toEqual({ eraName: 'Reiwa', eraYear: 1 });
  });

  it('mid-era years count from the era start (start = year 1)', () => {
    expect(lookupEraTable(1911, JAPANESE)).toEqual({ eraName: 'Meiji', eraYear: 44 });
    expect(lookupEraTable(1988, JAPANESE)).toEqual({ eraName: 'Shōwa', eraYear: 63 });
    expect(lookupEraTable(2026, JAPANESE)).toEqual({ eraName: 'Reiwa', eraYear: 8 });
  });

  it('years before the first era return null', () => {
    expect(lookupEraTable(1867, JAPANESE)).toBeNull();
    expect(lookupEraTable(-100, JAPANESE)).toBeNull();
  });

  it('works with an arbitrary era table (pure data addition)', () => {
    const table: EraTable = {
      id: 'x', name: 'X', sourceUrl: 'https://example.com',
      eras: [{ name: 'Alpha', start: 100 }, { name: 'Beta', start: 200 }],
    };
    expect(lookupEraTable(150, table)).toEqual({ eraName: 'Alpha', eraYear: 51 });
    expect(lookupEraTable(200, table)).toEqual({ eraName: 'Beta', eraYear: 1 });
  });
});

describe('Historical period lookup', () => {
  const periodFor = (astro: number, civId: string) =>
    lookupPeriods(astro, CIVS).find(r => r.civilization.id === civId)?.period ?? null;

  it('1500 BCE (astro −1499) is New Kingdom Egypt and Shang China', () => {
    expect(periodFor(-1499, 'egypt')?.name).toBe('New Kingdom');
    expect(periodFor(-1499, 'china')?.name).toBe('Shang Dynasty');
  });

  it('700 CE is Tang China and Classic Maya', () => {
    expect(periodFor(700, 'china')?.name).toBe('Tang Dynasty');
    expect(periodFor(700, 'maya')?.name).toBe('Classic Period');
  });

  it('no match returns null (2026 CE in all three)', () => {
    expect(periodFor(2026, 'egypt')).toBeNull();
    expect(periodFor(2026, 'china')).toBeNull();
    expect(periodFor(2026, 'maya')).toBeNull();
  });

  it('BCE bounds honour the no-year-zero convention (30 BCE ends Ptolemaic)', () => {
    expect(periodFor(historicalYearToAstronomical(-30), 'egypt')?.name).toBe('Ptolemaic Period');
    expect(periodFor(31, 'egypt')).toBeNull();
  });

  it('every civilization has sourced, ordered periods', () => {
    for (const civ of CIVS) {
      expect(civ.sourceUrl).toMatch(/^https:\/\//);
      expect(civ.periods.length).toBeGreaterThan(0);
      for (const p of civ.periods) {
        expect(historicalYearToAstronomical(p.start), `${civ.id}/${p.name}`)
          .toBeLessThan(historicalYearToAstronomical(p.end));
      }
    }
  });
});
