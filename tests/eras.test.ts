import { describe, it, expect } from 'vitest';
import { ERA_SCHEMES } from '../client/src/lib/eras/eraSchemes';
import { toAstronomicalYear } from '../client/src/lib/eras/toAstronomicalYear';
import { fromAstronomicalYear } from '../client/src/lib/eras/fromAstronomicalYear';
import { formatAstronomicalYear } from '../client/src/lib/eras/formatAstronomicalYear';
import { historicalYearToAstronomical } from '../client/src/lib/eras/historicalYearToAstronomical';
import { lookupEraTable } from '../client/src/lib/eras/lookupEraTable';
import { reverseLookupEraTable } from '../client/src/lib/eras/reverseLookupEraTable';
import { searchEraNames } from '../client/src/lib/eras/searchEraNames';
import { parseEraYearText } from '../client/src/lib/eras/parseEraYearText';
import { lookupPeriods } from '../client/src/lib/eras/lookupPeriods';
import { lookupRomanConsuls } from '../client/src/lib/eras/lookupRomanConsuls';
import { lookupRulers } from '../client/src/lib/eras/lookupRulers';
import { UI_TRANSLATIONS } from '../client/src/lib/translateUi';
import { hijriTabular } from '../client/src/lib/eras/hijriTabular';
import { gregorianToJdn } from '../client/src/lib/eras/gregorianToJdn';
import { jdnToGregorian } from '../client/src/lib/eras/jdnToGregorian';
import { hijriToJdn } from '../client/src/lib/eras/hijriToJdn';
import { jdnToHijri } from '../client/src/lib/eras/jdnToHijri';
import type { EraTable, YearTable, Civilization, RulerRegion } from '../client/src/lib/eras/types';
import japaneseErasJson from '../client/src/data/eras/japaneseEras.json';
import chineseErasJson from '../client/src/data/eras/chineseEras.json';
import romanConsulsJson from '../client/src/data/eras/romanConsuls.json';
import historicalPeriodsJson from '../client/src/data/eras/historicalPeriods.json';
import rulersReignsJson from '../client/src/data/eras/rulersReigns.json';

const JAPANESE = japaneseErasJson as EraTable;
const CHINESE = chineseErasJson as EraTable;
const CONSULS = romanConsulsJson as YearTable;
const CIVS = historicalPeriodsJson.civilizations as Civilization[];
const RULERS = rulersReignsJson.regions as RulerRegion[];

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

  it('includes the regional expansion schemes', () => {
    const ids = ERA_SCHEMES.map(s => s.id);
    for (const id of ['seleucid', 'yazdegerdi', 'kali_yuga', 'bengali', 'kollam',
      'nepal_sambat', 'chula_sakarat']) {
      expect(ids, `missing scheme ${id}`).toContain(id);
    }
  });

  it('every scheme has a region', () => {
    for (const s of ERA_SCHEMES) expect(s.region, s.id).toBeTruthy();
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

  it('2026 CE in each new regional scheme', () => {
    expect(fromAstronomicalYear(2026, scheme('seleucid'))).toBe(2337);
    expect(fromAstronomicalYear(2026, scheme('yazdegerdi'))).toBe(1395);
    expect(fromAstronomicalYear(2026, scheme('kali_yuga'))).toBe(5128);
    expect(fromAstronomicalYear(2026, scheme('bengali'))).toBe(1433);
    expect(fromAstronomicalYear(2026, scheme('kollam'))).toBe(1202);
    expect(fromAstronomicalYear(2026, scheme('nepal_sambat'))).toBe(1147);
    expect(fromAstronomicalYear(2026, scheme('chula_sakarat'))).toBe(1388);
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

describe('Hijri tabular calendar (exact arithmetic)', () => {
  it('anchor: 1 Muharram AH 1 falls in 622 CE', () => {
    expect(toAstronomicalYear(1, scheme('hijri'))).toBe(622);
    expect(fromAstronomicalYear(622, scheme('hijri'))).toBe(1);
  });

  it('known anchor years (year of 1 Muharram)', () => {
    // 1 Muharram 1447 AH = 26 June 2025; 1448 AH begins 17 June 2026.
    expect(toAstronomicalYear(1447, scheme('hijri'))).toBe(2025);
    expect(toAstronomicalYear(1448, scheme('hijri'))).toBe(2026);
    expect(fromAstronomicalYear(2025, scheme('hijri'))).toBe(1447);
    expect(fromAstronomicalYear(2026, scheme('hijri'))).toBe(1448);
    // 1 Muharram 1000 AH = 19 October 1591 (Gregorian).
    expect(toAstronomicalYear(1000, scheme('hijri'))).toBe(1591);
    // 1 Muharram 1400 AH = 21 November 1979.
    expect(toAstronomicalYear(1400, scheme('hijri'))).toBe(1979);
  });

  it('round-trips exactly through the astronomical hub', () => {
    for (const astro of [622, 700, 1000, 1500, 2000, 2026, 2100]) {
      const back = toAstronomicalYear(fromAstronomicalYear(astro, scheme('hijri')), scheme('hijri'));
      expect(back, `CE ${astro}`).toBe(astro);
    }
    for (const ah of [1, 100, 1000, 1447, 1500]) {
      const ce = toAstronomicalYear(ah, scheme('hijri'));
      // The AH year beginning in that CE year is the same year.
      expect(fromAstronomicalYear(ce, scheme('hijri')), `AH ${ah}`).toBe(ah);
    }
  });

  it('monotonic: consecutive AH years start 0 or 1 CE years apart', () => {
    for (let ah = 1; ah <= 1500; ah++) {
      const diff = toAstronomicalYear(ah + 1, scheme('hijri')) - toAstronomicalYear(ah, scheme('hijri'));
      expect(diff === 0 || diff === 1, `AH ${ah}`).toBe(true);
    }
  });
});

describe('Japanese era-table lookup (generic piecewise)', () => {
  it('boundary years map to the era starting that year', () => {
    expect(lookupEraTable(1868, JAPANESE)).toMatchObject({ eraName: 'Meiji', eraYear: 1 });
    expect(lookupEraTable(1912, JAPANESE)).toMatchObject({ eraName: 'Taishō', eraYear: 1 });
    expect(lookupEraTable(1926, JAPANESE)).toMatchObject({ eraName: 'Shōwa', eraYear: 1 });
    expect(lookupEraTable(1989, JAPANESE)).toMatchObject({ eraName: 'Heisei', eraYear: 1 });
    expect(lookupEraTable(2019, JAPANESE)).toMatchObject({ eraName: 'Reiwa', eraYear: 1 });
  });

  it('mid-era years count from the era start (start = year 1)', () => {
    expect(lookupEraTable(1911, JAPANESE)).toMatchObject({ eraName: 'Meiji', eraYear: 44 });
    expect(lookupEraTable(1988, JAPANESE)).toMatchObject({ eraName: 'Shōwa', eraYear: 63 });
    expect(lookupEraTable(2026, JAPANESE)).toMatchObject({ eraName: 'Reiwa', eraYear: 8 });
  });

  it('years before the first era return null', () => {
    expect(lookupEraTable(-100, JAPANESE)).toBeNull();
  });

  it('works with an arbitrary era table (pure data addition)', () => {
    const table: EraTable = {
      id: 'x', name: 'X', region: 'global', sourceUrl: 'https://example.com',
      eras: [{ name: 'Alpha', start: 100 }, { name: 'Beta', start: 200 }],
    };
    expect(lookupEraTable(150, table)).toEqual({ eraName: 'Alpha', eraYear: 51 });
    expect(lookupEraTable(200, table)).toEqual({ eraName: 'Beta', eraYear: 1 });
  });

  it('honours epoch as the year-counting origin and end as the cutoff', () => {
    const table: EraTable = {
      id: 'x', name: 'X', region: 'global', end: 300, sourceUrl: 'https://example.com',
      eras: [{ name: 'Alpha', start: 100 }, { name: 'Beta', start: 210, epoch: 200 }],
    };
    expect(lookupEraTable(210, table)).toEqual({ eraName: 'Beta', eraYear: 11 });
    expect(lookupEraTable(300, table)?.eraName).toBe('Beta');
    expect(lookupEraTable(301, table)).toBeNull();
  });

  it('surfaces the native-script form when the table entry carries one', () => {
    expect(lookupEraTable(1868, JAPANESE)?.eraNative).toBe('明治');
    expect(lookupEraTable(2026, JAPANESE)?.eraNative).toBe('令和');
    expect(lookupEraTable(1700, CHINESE)?.eraNative).toBe('康熙');
  });

  it('every Japanese and Chinese era entry has a CJK native form', () => {
    for (const table of [JAPANESE, CHINESE]) {
      for (const era of table.eras) {
        expect(era.native, `${table.id}: ${era.name}`).toMatch(/^[\u3400-\u9FFF]+$/);
      }
    }
  });
});

describe('Japanese nengō full table', () => {
  it('covers the classical anchors', () => {
    expect(lookupEraTable(645, JAPANESE)).toMatchObject({ eraName: 'Taika', eraYear: 1 });
    expect(lookupEraTable(1600, JAPANESE)).toMatchObject({ eraName: 'Keichō', eraYear: 5 });
    expect(lookupEraTable(701, JAPANESE)).toMatchObject({ eraName: 'Taihō', eraYear: 1 });
    expect(lookupEraTable(1467, JAPANESE)).toMatchObject({ eraName: 'Ōnin', eraYear: 1 });
    expect(lookupEraTable(1867, JAPANESE)).toMatchObject({ eraName: 'Keiō', eraYear: 3 });
  });

  it('Tenpyō-shōhō counts from its true 749 proclamation via epoch', () => {
    expect(lookupEraTable(749, JAPANESE)).toMatchObject({ eraName: 'Tenpyō-kanpō', eraYear: 1 });
    expect(lookupEraTable(750, JAPANESE)).toMatchObject({ eraName: 'Tenpyō-shōhō', eraYear: 2 });
  });

  it('12th-lunar-month proclamations use the renamed lunar year (verified vs reference tables)', () => {
    // Ten'en proclaimed 973-12-20 (Julian); Ten'en 2 = 974 in all concordances.
    expect(lookupEraTable(973, JAPANESE)).toMatchObject({ eraName: "Ten'en", eraYear: 1 });
    expect(lookupEraTable(974, JAPANESE)).toMatchObject({ eraName: "Ten'en", eraYear: 2 });
    // Shōhō proclaimed Kan'ei 21/12/16 (Jan 1645 Gregorian); Shōhō 2 = 1645.
    expect(lookupEraTable(1644, JAPANESE)).toMatchObject({ eraName: 'Shōhō', eraYear: 1 });
    expect(lookupEraTable(1645, JAPANESE)).toMatchObject({ eraName: 'Shōhō', eraYear: 2 });
  });

  it('obscure-era spot anchors (systematic cross-check, July 2026)', () => {
    expect(lookupEraTable(686, JAPANESE)).toMatchObject({ eraName: 'Shuchō', eraYear: 1 });
    expect(lookupEraTable(848, JAPANESE)).toMatchObject({ eraName: 'Kajō', eraYear: 1 });
    expect(lookupEraTable(1229, JAPANESE)).toMatchObject({ eraName: 'Kanki', eraYear: 1 });
    expect(lookupEraTable(1213, JAPANESE)).toMatchObject({ eraName: 'Kenpō', eraYear: 1 });
    expect(lookupEraTable(1394, JAPANESE)).toMatchObject({ eraName: 'Ōei', eraYear: 1 });
    expect(lookupEraTable(1427, JAPANESE)).toMatchObject({ eraName: 'Ōei', eraYear: 34 });
  });

  it('years before Taika return null', () => {
    expect(lookupEraTable(644, JAPANESE)).toBeNull();
  });

  it('starts are strictly increasing and there are no duplicate era names', () => {
    const names = new Set<string>();
    let prev = -Infinity;
    for (const e of JAPANESE.eras) {
      expect(e.start, e.name).toBeGreaterThan(prev);
      prev = e.start;
      expect(names.has(e.name), `duplicate name ${e.name}`).toBe(false);
      names.add(e.name);
    }
  });
});

describe('Chinese niánhào orthodox table', () => {
  it('covers the dynastic anchors', () => {
    expect(lookupEraTable(-139, CHINESE)).toMatchObject({ eraName: 'Jiànyuán', eraYear: 1, dynasty: 'Western Han' });
    expect(lookupEraTable(1700, CHINESE)).toMatchObject({ eraName: 'Kāngxī', eraYear: 39, dynasty: 'Qing' });
    expect(lookupEraTable(627, CHINESE)).toMatchObject({ eraName: 'Zhēnguàn', eraYear: 1, dynasty: 'Tang' });
    expect(lookupEraTable(1368, CHINESE)).toMatchObject({ eraName: 'Hóngwǔ', eraYear: 1, dynasty: 'Ming' });
    expect(lookupEraTable(1912, CHINESE)).toMatchObject({ eraName: 'Xuāntǒng', eraYear: 4 });
  });

  it('dynastic transitions count from the true era epoch', () => {
    // Sui reunified the south in 589 = Kāihuáng 9 (proclaimed 581).
    expect(lookupEraTable(589, CHINESE)).toMatchObject({ eraName: 'Kāihuáng', eraYear: 9 });
    expect(lookupEraTable(588, CHINESE)).toMatchObject({ eraName: 'Zhēnmíng', eraYear: 2, dynasty: 'Chen' });
    // Yuan absorbed the Song in 1279 = Zhìyuán 16 (proclaimed 1264).
    expect(lookupEraTable(1279, CHINESE)).toMatchObject({ eraName: 'Zhìyuán (Kublai)', eraYear: 16, dynasty: 'Yuan' });
    expect(lookupEraTable(1278, CHINESE)).toMatchObject({ eraName: 'Xiángxīng', eraYear: 1, dynasty: 'Southern Song' });
  });

  it('obscure-era spot anchors (systematic cross-check, July 2026)', () => {
    // Zhānghé 章和 = 87–88 (Yuánhé 元和 ends 87; en-wiki table itself misprints Zhanghe's range).
    expect(lookupEraTable(87, CHINESE)).toMatchObject({ eraName: 'Zhānghé', eraYear: 1 });
    expect(lookupEraTable(86, CHINESE)).toMatchObject({ eraName: 'Yuánhé (Zhang)', eraYear: 3 });
    // Tàishǐ 泰始 of Liu Song Emperor Ming proclaimed 12th lunar month of 465; Tàishǐ 2 = 466.
    expect(lookupEraTable(465, CHINESE)).toMatchObject({ eraName: 'Tàishǐ (Ming)', eraYear: 1 });
    expect(lookupEraTable(466, CHINESE)).toMatchObject({ eraName: 'Tàishǐ (Ming)', eraYear: 2 });
    // Tàixīng 太興 (also romanized Dàxīng 大興), Eastern Jin, 318–321.
    expect(lookupEraTable(318, CHINESE)).toMatchObject({ eraName: 'Tàixīng', eraYear: 1 });
    // Tàihé 太和/大和 (Dàhé) of Tang Wenzong, 827–835.
    expect(lookupEraTable(827, CHINESE)).toMatchObject({ eraName: 'Tàihé (Tang)', eraYear: 1 });
    // Wu Zhou interregnum boundary checks.
    expect(lookupEraTable(690, CHINESE)).toMatchObject({ eraName: 'Tiānshòu', eraYear: 1, dynasty: 'Wu Zhou' });
    expect(lookupEraTable(705, CHINESE)).toMatchObject({ eraName: 'Shénlóng', eraYear: 1, dynasty: 'Tang' });
    // Five Dynasties rapid turnover.
    expect(lookupEraTable(947, CHINESE)).toMatchObject({ eraName: 'Tiānfú (Han)', eraYear: 1, dynasty: 'Later Han' });
    expect(lookupEraTable(936, CHINESE)).toMatchObject({ eraName: 'Tiānfú (Jin)', eraYear: 1, dynasty: 'Later Jin' });
  });

  it('ends in 1912: later years return null', () => {
    expect(CHINESE.end).toBe(1912);
    expect(lookupEraTable(1913, CHINESE)).toBeNull();
    expect(lookupEraTable(2026, CHINESE)).toBeNull();
  });

  it('years before the first niánhào return null', () => {
    expect(lookupEraTable(-140, CHINESE)).toBeNull();
  });

  it('starts are strictly increasing, every era has a dynasty, and names are unique', () => {
    const names = new Set<string>();
    let prev = -Infinity;
    for (const e of CHINESE.eras) {
      expect(e.start, e.name).toBeGreaterThan(prev);
      prev = e.start;
      expect(e.dynasty, e.name).toBeTruthy();
      expect(names.has(e.name), `duplicate name ${e.name}`).toBe(false);
      names.add(e.name);
    }
  });
});

describe('Historical period lookup', () => {
  const periodFor = (astro: number, civId: string) =>
    lookupPeriods(astro, CIVS).find(r => r.civilization.id === civId)?.period ?? null;

  it('1500 BCE (astro −1499) is New Kingdom Egypt and Shang China', () => {
    expect(periodFor(-1499, 'egypt')?.name).toBe('New Kingdom');
    expect(periodFor(-1499, 'china')?.name).toBe('Shang Dynasty');
  });

  it('new civilizations resolve periods', () => {
    expect(periodFor(-2300, 'mesopotamia')?.name).toBe('Akkadian Empire');
    expect(periodFor(-599, 'mesopotamia')?.name).toBe('Neo-Babylonian Empire');
    expect(periodFor(-500, 'persia')?.name).toBe('Achaemenid Empire');
    expect(periodFor(400, 'persia')?.name).toBe('Sasanian Empire');
    expect(periodFor(1250, 'mongol')?.name).toBe('Mongol Empire');
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

  it('African civilizations resolve periods', () => {
    expect(periodFor(-1999, 'kush')?.name).toBe('Kerma Period');
    expect(periodFor(-699, 'kush')?.name).toBe('Napatan Period');
    expect(periodFor(300, 'kush')?.name).toBe('Meroitic Period');
    expect(periodFor(500, 'aksum')?.name).toBe('Kingdom of Aksum');
    expect(periodFor(1000, 'ghana')?.name).toBe('Ghana Empire');
    expect(periodFor(1300, 'mali')?.name).toBe('Mali Empire');
    expect(periodFor(1500, 'songhai')?.name).toBe('Songhai Empire');
    expect(periodFor(1000, 'kanem_bornu')?.name).toBe('Kanem Empire');
    expect(periodFor(1600, 'kanem_bornu')?.name).toBe('Bornu Empire');
    expect(periodFor(1300, 'great_zimbabwe')?.name).toBe('Great Zimbabwe');
    expect(periodFor(1500, 'benin')?.name).toBe('Kingdom of Benin');
    expect(periodFor(1900, 'ethiopia_solomonic')?.name).toBe('Ethiopian Solomonic Dynasty');
    expect(periodFor(1850, 'zulu')?.name).toBe('Zulu Kingdom');
  });

  it('Mesoamerican civilizations resolve periods', () => {
    expect(periodFor(-999, 'olmec')?.name).toBe('Olmec Civilization');
    expect(periodFor(200, 'zapotec')?.name).toBe('Monte Albán Period');
    expect(periodFor(1400, 'zapotec')?.name).toBe('Late Zapotec Period');
    expect(periodFor(300, 'teotihuacan')?.name).toBe('Teotihuacan');
    expect(periodFor(1000, 'toltec')?.name).toBe('Toltec Civilization');
    expect(periodFor(1400, 'aztec')?.name).toBe('Early Mexica Period');
    expect(periodFor(1500, 'aztec')?.name).toBe('Aztec Empire (Triple Alliance)');
  });

  it('Andean civilizations resolve periods', () => {
    expect(periodFor(-499, 'chavin')?.name).toBe('Chavín Culture');
    expect(periodFor(400, 'moche')?.name).toBe('Moche Culture');
    expect(periodFor(400, 'nazca')?.name).toBe('Nazca Culture');
    expect(periodFor(800, 'tiwanaku')?.name).toBe('Tiwanaku');
    expect(periodFor(800, 'wari')?.name).toBe('Wari Empire');
    expect(periodFor(1200, 'chimu')?.name).toBe('Chimú (Chimor)');
    expect(periodFor(1300, 'inca')?.name).toBe('Kingdom of Cusco');
    expect(periodFor(1500, 'inca')?.name).toBe('Inca Empire');
  });

  it('every civilization has a region and sourced, ordered periods', () => {
    const regions = new Set(['africa', 'middle_east', 'south_asia', 'east_asia', 'mesoamerica', 'andean']);
    for (const civ of CIVS) {
      expect(regions.has(civ.region), `${civ.id} region "${civ.region}"`).toBe(true);
    }
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

describe('Hijri date-level conversion (tabular civil)', () => {
  it('epoch: 1 Muharram AH 1 = 19 July 622 CE (proleptic Gregorian)', () => {
    expect(jdnToGregorian(hijriToJdn(1, 1, 1))).toEqual({ year: 622, month: 7, day: 19 });
  });

  it('1 Muharram 1447 AH = 27 June 2025', () => {
    expect(jdnToGregorian(hijriToJdn(1447, 1, 1))).toEqual({ year: 2025, month: 6, day: 27 });
  });

  it('1 Ramadan 1445 AH = 11 March 2024', () => {
    expect(jdnToGregorian(hijriToJdn(1445, 9, 1))).toEqual({ year: 2024, month: 3, day: 11 });
  });

  it('1 January 2000 = 24 Ramadan 1420 AH', () => {
    expect(jdnToHijri(gregorianToJdn(2000, 1, 1))).toEqual({ year: 1420, month: 9, day: 24 });
  });

  it('known JDN anchor: 1 January 2000 = JDN 2451545', () => {
    expect(gregorianToJdn(2000, 1, 1)).toBe(2451545);
  });

  it('Gregorian JDN round-trips across a wide range', () => {
    for (let jdn = 1600000; jdn < 2600000; jdn += 1237) {
      const g = jdnToGregorian(jdn);
      expect(gregorianToJdn(g.year, g.month, g.day)).toBe(jdn);
    }
  });

  it('Hijri JDN round-trips across a wide range', () => {
    for (let jdn = 1948440; jdn < 2600000; jdn += 1237) {
      const h = jdnToHijri(jdn);
      expect(h.month).toBeGreaterThanOrEqual(1);
      expect(h.month).toBeLessThanOrEqual(12);
      expect(h.day).toBeGreaterThanOrEqual(1);
      expect(h.day).toBeLessThanOrEqual(30);
      expect(hijriToJdn(h.year, h.month, h.day)).toBe(jdn);
    }
  });

  it('tabular month lengths alternate 30/29, month 12 has 30 in leap years', () => {
    // AH 1446 is a leap year (355 days), AH 1447 is common (354 days).
    expect(hijriToJdn(1447, 1, 1) - hijriToJdn(1446, 1, 1)).toBe(355);
    expect(hijriToJdn(1448, 1, 1) - hijriToJdn(1447, 1, 1)).toBe(354);
    expect(hijriToJdn(1446, 12, 30)).toBe(hijriToJdn(1447, 1, 1) - 1);
    expect(hijriToJdn(1447, 12, 29)).toBe(hijriToJdn(1448, 1, 1) - 1);
    expect(hijriToJdn(1447, 2, 1) - hijriToJdn(1447, 1, 1)).toBe(30);
    expect(hijriToJdn(1447, 3, 1) - hijriToJdn(1447, 2, 1)).toBe(29);
  });

  it('day-level conversion agrees with the whole-year hijriTabular mapping', () => {
    for (const astro of [622, 1000, 1445, 1900, 2000, 2026, 2100]) {
      const ah = hijriTabular.fromAstronomical(astro);
      expect(jdnToGregorian(hijriToJdn(ah, 1, 1)).year).toBe(astro);
    }
  });
});

describe('Era name reverse lookup', () => {
  it('converts Japanese era + year to astronomical CE', () => {
    expect(reverseLookupEraTable('Meiji', 33, JAPANESE)).toBe(1900);
    expect(reverseLookupEraTable('Keichō', 5, JAPANESE)).toBe(1600);
    expect(reverseLookupEraTable('Reiwa', 1, JAPANESE)).toBe(2019);
  });

  it('is diacritic- and case-insensitive', () => {
    expect(reverseLookupEraTable('keicho', 5, JAPANESE)).toBe(1600);
    expect(reverseLookupEraTable('kangxi', 39, CHINESE)).toBe(1700);
  });

  it('converts Chinese era + year to astronomical CE', () => {
    expect(reverseLookupEraTable('Kāngxī', 39, CHINESE)).toBe(1700);
  });

  it('honors epoch override for transition-year counting', () => {
    // Zhìyuán (Kublai) counted from 1264 but only orthodox from 1279:
    // Zhiyuan 16 = 1279 is valid, Zhiyuan 5 = 1268 belongs to Southern Song.
    expect(reverseLookupEraTable('Zhìyuán (Kublai)', 16, CHINESE)).toBe(1279);
    expect(reverseLookupEraTable('Zhìyuán (Kublai)', 5, CHINESE)).toBeNull();
  });

  it('rejects year counts past the end of an era', () => {
    expect(reverseLookupEraTable('Meiji', 45, JAPANESE)).toBe(1912);
    expect(reverseLookupEraTable('Meiji', 46, JAPANESE)).toBeNull();
    expect(reverseLookupEraTable('Kāngxī', 61, CHINESE)).toBe(1722);
    expect(reverseLookupEraTable('Kāngxī', 62, CHINESE)).toBeNull();
  });

  it('rejects long-range years landing on a later era start', () => {
    // Meiji 152 = 2019 is Reiwa's start year but far outside Meiji's span.
    expect(reverseLookupEraTable('Meiji', 152, JAPANESE)).toBeNull();
    // Taika 1224 = 1868 lands on Meiji's start — also non-adjacent.
    expect(reverseLookupEraTable('Taika', 1224, JAPANESE)).toBeNull();
  });

  it('rejects unknown names and invalid year counts', () => {
    expect(reverseLookupEraTable('Notanera', 1, JAPANESE)).toBeNull();
    expect(reverseLookupEraTable('Meiji', 0, JAPANESE)).toBeNull();
    expect(reverseLookupEraTable('Meiji', 1.5, JAPANESE)).toBeNull();
  });

  it('round-trips forward and reverse lookups across both tables', () => {
    for (const table of [JAPANESE, CHINESE]) {
      for (const astro of [700, 1000, 1400, 1700, 1868, 1900]) {
        const hit = lookupEraTable(astro, table);
        if (!hit) continue;
        expect(reverseLookupEraTable(hit.eraName, hit.eraYear, table)).toBe(astro);
      }
    }
  });
});

describe('Era name autocomplete search', () => {
  it('prefix matches rank before substring matches', () => {
    const results = searchEraNames('kan', [JAPANESE, CHINESE]);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().startsWith('kan')).toBe(true);
  });

  it('matches diacritics-insensitively and carries table metadata', () => {
    const results = searchEraNames('kangxi', [JAPANESE, CHINESE]);
    expect(results[0].name).toBe('Kāngxī');
    expect(results[0].tableId).toBe('chinese');
    expect(results[0].dynasty).toBe('Qing');
  });

  it('returns empty for empty queries and respects the limit', () => {
    expect(searchEraNames('', [JAPANESE, CHINESE])).toEqual([]);
    expect(searchEraNames('a', [JAPANESE, CHINESE], 3).length).toBeLessThanOrEqual(3);
  });
});

describe('Era year text parsing', () => {
  it('splits name and trailing year', () => {
    expect(parseEraYearText('Meiji 33')).toEqual({ namePart: 'Meiji', eraYear: 33 });
    expect(parseEraYearText('Zhìyuán (Kublai) 16')).toEqual({ namePart: 'Zhìyuán (Kublai)', eraYear: 16 });
    expect(parseEraYearText('  Kāngxī, 39 ')).toEqual({ namePart: 'Kāngxī', eraYear: 39 });
  });

  it('returns null year for partial input', () => {
    expect(parseEraYearText('Meiji')).toEqual({ namePart: 'Meiji', eraYear: null });
    expect(parseEraYearText('33')).toEqual({ namePart: '33', eraYear: null });
  });
});

describe('Roman consular dating', () => {
  it('resolves famous consulships (astronomical years)', () => {
    // 59 BCE = astro -58; 63 BCE = astro -62
    expect(lookupRomanConsuls(-58, CONSULS)).toBe('Gaius Julius Caesar & Marcus Calpurnius Bibulus');
    expect(lookupRomanConsuls(-62, CONSULS)).toBe('Marcus Tullius Cicero & Gaius Antonius Hybrida');
    expect(lookupRomanConsuls(-69, CONSULS)).toBe('Gnaeus Pompeius Magnus & Marcus Licinius Crassus');
    expect(lookupRomanConsuls(-42, CONSULS)).toBe('Gaius Vibius Pansa & Aulus Hirtius');
  });

  it('covers the range boundaries', () => {
    expect(lookupRomanConsuls(CONSULS.start, CONSULS)).toBe('Gaius Marius (VI) & Lucius Valerius Flaccus');
    expect(lookupRomanConsuls(CONSULS.end, CONSULS)).toBe('Sextus Pompeius & Sextus Appuleius');
  });

  it('returns null outside the attested range and for non-integers', () => {
    expect(lookupRomanConsuls(CONSULS.start - 1, CONSULS)).toBeNull();
    expect(lookupRomanConsuls(CONSULS.end + 1, CONSULS)).toBeNull();
    expect(lookupRomanConsuls(2026, CONSULS)).toBeNull();
    expect(lookupRomanConsuls(-58.5, CONSULS)).toBeNull();
  });

  it('has exactly one entry per year in range', () => {
    expect(CONSULS.consuls.length).toBe(CONSULS.end - CONSULS.start + 1);
    for (const entry of CONSULS.consuls) expect(entry.trim().length).toBeGreaterThan(0);
  });
});

describe('Rulers & Reigns lookup', () => {
  const region = (id: string) => {
    const r = RULERS.find(x => x.id === id);
    if (!r) throw new Error(`missing rulers region ${id}`);
    return r;
  };

  it('data integrity: ten regions, valid spans, source URLs', () => {
    expect(RULERS.map(r => r.id).sort()).toEqual(
      ['aztec', 'china', 'egypt', 'india', 'inca', 'kush_aksum', 'maya', 'mesopotamia', 'persia', 'rome'].sort()
    );
    for (const r of RULERS) {
      expect(r.sourceUrl).toMatch(/^https:\/\//);
      expect(r.dynasties.length).toBeGreaterThan(0);
      for (const d of r.dynasties) {
        for (const k of d.rulers) {
          expect(k.start, `${k.name} span`).toBeLessThanOrEqual(k.end);
          expect(k.start, `${k.name} year zero`).not.toBe(0);
          expect(k.end, `${k.name} year zero`).not.toBe(0);
        }
      }
    }
  });

  it('finds a single reigning ruler ("in the reign of Xerxes")', () => {
    // 480 BCE = astronomical -479
    const hit = lookupRulers(-479, region('persia'));
    expect(hit.rulers.map(r => r.name)).toEqual(['Xerxes I']);
    expect(hit.gapNote).toBeNull();
  });

  it('handles BCE reign boundaries (signed historical → astronomical)', () => {
    // Cyrus II ends 530 BCE (astro -529); Cambyses II starts the same year.
    const hit = lookupRulers(-529, region('persia'));
    expect(hit.rulers.map(r => r.name).sort()).toEqual(['Cambyses II', 'Cyrus II']);
  });

  it('reports the Persia gap note instead of a false highlight', () => {
    // 300 BCE = astro -299, inside the 330–247 BCE gap
    const hit = lookupRulers(-299, region('persia'));
    expect(hit.rulers).toEqual([]);
    expect(hit.gapNote).toBe('rulers-gap-persia');
  });

  it('returns no rulers and no gap note for uncovered curated years', () => {
    // 900 BCE: before Achaemenids, not an explicit gap
    const hit = lookupRulers(-899, region('persia'));
    expect(hit.rulers).toEqual([]);
    expect(hit.gapNote).toBeNull();
  });

  it('handles Maya concurrent kings across city-states', () => {
    const hit = lookupRulers(683, region('maya'));
    const names = hit.rulers.map(r => r.name).sort();
    expect(names).toEqual(["Jasaw Chan K'awiil I", "K'inich Janaab' Pakal I", "Yuknoom Ch'een II"]);
    for (const r of hit.rulers) expect(r.city).toBeTruthy();
  });

  it('handles a reign spanning the BCE/CE boundary (Augustus)', () => {
    const rome = region('rome');
    expect(lookupRulers(-26, rome).rulers.map(r => r.name)).toEqual(['Augustus']);
    expect(lookupRulers(0, rome).rulers.map(r => r.name)).toEqual(['Augustus']);
    expect(lookupRulers(14, rome).rulers.map(r => r.name).sort()).toEqual(['Augustus', 'Tiberius']);
  });

  it('handles co-regency overlap (Ardashir I / Shapur I)', () => {
    const hit = lookupRulers(241, region('persia'));
    expect(hit.rulers.map(r => r.name).sort()).toEqual(['Ardashir I', 'Shapur I']);
  });

  it('China ends at 1912 (Puyi) and Persia at 651 (Yazdegerd III)', () => {
    expect(lookupRulers(1912, region('china')).rulers.map(r => r.name)).toEqual(['Puyi']);
    expect(lookupRulers(1913, region('china')).rulers).toEqual([]);
    expect(lookupRulers(651, region('persia')).rulers.map(r => r.name)).toEqual(['Yazdegerd III']);
    expect(lookupRulers(652, region('persia')).rulers).toEqual([]);
  });

  it('Mesopotamia: BCE lookups and 539 BCE end (fall to Cyrus)', () => {
    const meso = region('mesopotamia');
    // 700 BCE = astro -699 → Sennacherib
    expect(lookupRulers(-699, meso).rulers.map(r => r.name)).toEqual(['Sennacherib']);
    // 562 BCE = astro -561 → Nebuchadnezzar II's last year
    expect(lookupRulers(-561, meso).rulers.map(r => r.name)).toEqual(['Nebuchadnezzar II']);
    // 539 BCE = astro -538 → Nabonidus final year; 538 BCE → nobody
    expect(lookupRulers(-538, meso).rulers.map(r => r.name)).toEqual(['Nabonidus']);
    expect(lookupRulers(-537, meso).rulers).toEqual([]);
  });

  it('India: Ashoka circa reign and Gupta boundary', () => {
    const india = region('india');
    // 250 BCE = astro -249 → Ashoka
    const hit = lookupRulers(-249, india);
    expect(hit.rulers.map(r => r.name)).toEqual(['Ashoka']);
    expect(hit.rulers[0].circa).toBe(true);
    // 375 CE: Samudragupta end = Chandragupta II start
    expect(lookupRulers(375, india).rulers.map(r => r.name).sort()).toEqual(['Chandragupta II', 'Samudragupta']);
  });

  it('Kush & Aksum: Taharqa, Meroë BCE/CE boundary, Ezana', () => {
    const ka = region('kush_aksum');
    // 680 BCE = astro -679 → Taharqa (also pharaoh in Egypt's Late Period list)
    expect(lookupRulers(-679, ka).rulers.map(r => r.name)).toEqual(['Taharqa']);
    // 20 BCE = astro -19 → Amanirenas
    expect(lookupRulers(-19, ka).rulers.map(r => r.name)).toEqual(['Amanirenas']);
    expect(lookupRulers(340, ka).rulers.map(r => r.name)).toEqual(['Ezana']);
  });

  it('Aztec: Moctezuma II and the 1520–1521 succession, ending Cuauhtémoc', () => {
    const aztec = region('aztec');
    expect(lookupRulers(1510, aztec).rulers.map(r => r.name)).toEqual(['Moctezuma II']);
    expect(lookupRulers(1520, aztec).rulers.map(r => r.name).sort())
      .toEqual(['Cuauhtémoc', 'Cuitláhuac', 'Moctezuma II']);
    expect(lookupRulers(1521, aztec).rulers.map(r => r.name)).toEqual(['Cuauhtémoc']);
    expect(lookupRulers(1522, aztec).rulers).toEqual([]);
  });

  it('Inca: Huáscar/Atahualpa civil-war overlap and Vilcabamba coda', () => {
    const inca = region('inca');
    expect(lookupRulers(1450, inca).rulers.map(r => r.name)).toEqual(['Pachacuti']);
    // Civil war 1529–1532: both reign concurrently
    expect(lookupRulers(1530, inca).rulers.map(r => r.name).sort()).toEqual(['Atahualpa', 'Huáscar']);
    expect(lookupRulers(1533, inca).rulers.map(r => r.name).sort()).toEqual(['Atahualpa', 'Manco Inca Yupanqui']);
    expect(lookupRulers(1572, inca).rulers.map(r => r.name)).toEqual(['Túpac Amaru']);
    expect(lookupRulers(1573, inca).rulers).toEqual([]);
  });

  it('epithets and region/dynasty/note keys have UI translations in all locales', () => {
    const keys = new Set<string>();
    for (const r of RULERS) {
      keys.add(r.name);
      if (r.note) keys.add(r.note);
      for (const g of r.gaps ?? []) keys.add(g.note);
      for (const d of r.dynasties) {
        keys.add(d.name);
        for (const k of d.rulers) if (k.epithet) keys.add(k.epithet);
      }
    }
    for (const lang of Object.keys(UI_TRANSLATIONS)) {
      for (const key of Array.from(keys)) {
        expect(UI_TRANSLATIONS[lang as keyof typeof UI_TRANSLATIONS][key],
          `"${key}" missing in ui locale "${lang}"`).toBeTruthy();
      }
    }
  });
});
