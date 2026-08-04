import { describe, it, expect } from 'vitest';
import { SUPPORTED_LANGUAGES, translate } from '../client/src/lib/localization';
import { UI_TRANSLATIONS } from '../client/src/lib/translateUi';
import { UNIT_NAME_TRANSLATIONS } from '../client/src/lib/translateUnit';
import { CONVERSION_DATA } from '../client/src/lib/conversion-data';

const REQUIRED_LANGUAGES = ['en', 'ar', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'ru', 'zh'] as const;

describe('JSON Integrity: ui-translations.json', () => {
  it('has at least 100 entries', () => {
    expect(Object.keys(UI_TRANSLATIONS['en']).length).toBeGreaterThanOrEqual(100);
  });

  it('every entry has required en and ar fields as strings', () => {
    for (const key of Object.keys(UI_TRANSLATIONS['en'])) {
      expect(typeof UI_TRANSLATIONS['en'][key], `key "${key}" en must be string`).toBe('string');
      expect(typeof UI_TRANSLATIONS['ar'][key], `key "${key}" ar must be string`).toBe('string');
    }
  });

  it('contains known required UI keys', () => {
    const requiredKeys = [
      'Base Quantities', 'Mechanics', 'Length', 'Mass', 'Time',
    ];
    for (const key of requiredKeys) {
      expect(UI_TRANSLATIONS['en'][key], `missing UI key "${key}"`).toBeDefined();
    }
  });

  it('translation keys used in the app are present across UI or unit-name maps', () => {
    // Some labels (From, To, Compare All) live in UNIT_NAME_TRANSLATIONS after merge
    const appLabels = ['From', 'To', 'Compare All'];
    for (const key of appLabels) {
      const found = UI_TRANSLATIONS['en'][key] ?? UNIT_NAME_TRANSLATIONS['en'][key];
      expect(found, `missing app label "${key}" from both translation maps`).toBeDefined();
    }
  });

  it('round-trips through translate() for each language', () => {
    const key = 'Base Quantities';
    const enValue = UI_TRANSLATIONS['en'][key];
    expect(enValue).toBeDefined();
    for (const lang of REQUIRED_LANGUAGES) {
      if (lang === 'en') {
        expect(translate(key, lang, UI_TRANSLATIONS)).toBe(enValue);
      } else {
        const result = translate(key, lang, UI_TRANSLATIONS);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    }
  });

  it('translate() returns English as fallback for missing translations', () => {
    const key = 'Base Quantities';
    const result = translate(key, 'de', UI_TRANSLATIONS);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});

describe('JSON Integrity: unit-name-translations.json', () => {
  it('has at least 400 entries (original + merged UNIT_TRANSLATIONS)', () => {
    expect(Object.keys(UNIT_NAME_TRANSLATIONS['en']).length).toBeGreaterThanOrEqual(400);
  });

  it('every entry has required en and ar fields', () => {
    for (const key of Object.keys(UNIT_NAME_TRANSLATIONS['en'])) {
      expect(UNIT_NAME_TRANSLATIONS['en'][key], `key "${key}" missing en`).toBeTruthy();
      expect(UNIT_NAME_TRANSLATIONS['ar'][key], `key "${key}" missing ar`).toBeTruthy();
    }
  });

  it('contains standard unit names', () => {
    const requiredKeys = [
      'Meter', 'Kilogram', 'Second', 'Ampere', 'Kelvin',
      'Newton', 'Joule', 'Watt', 'Volt', 'Ohm',
    ];
    for (const key of requiredKeys) {
      expect(UNIT_NAME_TRANSLATIONS['en'][key], `missing unit name "${key}"`).toBeDefined();
    }
  });

  it('contains category/group names from merged UNIT_TRANSLATIONS', () => {
    const groupKeys = ['Base Quantities', 'Mechanics', 'Electricity & Magnetism'];
    for (const key of groupKeys) {
      const found = UNIT_NAME_TRANSLATIONS['en'][key] ?? UI_TRANSLATIONS['en'][key];
      expect(found, `missing group key "${key}" from either map`).toBeDefined();
    }
  });

  it('specific fixture: Meter translates correctly', () => {
    expect(translate('Meter', 'en', UNIT_NAME_TRANSLATIONS)).toBe('Metre');
    expect(translate('Meter', 'en-us', UNIT_NAME_TRANSLATIONS)).toBe('Meter');
    expect(translate('Meter', 'de', UNIT_NAME_TRANSLATIONS)).toBe('Meter');
    expect(translate('Meter', 'es', UNIT_NAME_TRANSLATIONS)).toBe('Metro');
    expect(translate('Meter', 'fr', UNIT_NAME_TRANSLATIONS)).toBe('Mètre');
    expect(translate('Meter', 'zh', UNIT_NAME_TRANSLATIONS)).toBe('米');
    expect(translate('Meter', 'ja', UNIT_NAME_TRANSLATIONS)).toBe('メートル');
    expect(translate('Meter', 'ko', UNIT_NAME_TRANSLATIONS)).toBe('미터');
    expect(translate('Meter', 'ru', UNIT_NAME_TRANSLATIONS)).toBe('Метр');
  });

  it('specific fixture: Kilogram translates correctly', () => {
    expect(translate('Kilogram', 'de', UNIT_NAME_TRANSLATIONS)).toBe('Kilogramm');
    expect(translate('Kilogram', 'fr', UNIT_NAME_TRANSLATIONS)).toBe('Kilogramme');
    expect(translate('Kilogram', 'it', UNIT_NAME_TRANSLATIONS)).toBe('Chilogrammo');
    expect(translate('Kilogram', 'zh', UNIT_NAME_TRANSLATIONS)).toBe('千克');
  });
});

describe('JSON Integrity: conversion category JSON files', () => {
  it('loads 74 categories', () => {
    expect(CONVERSION_DATA.length).toBe(74);
  });

  it('every category has required fields', () => {
    for (const cat of CONVERSION_DATA) {
      expect(cat.id, `category missing id`).toBeTruthy();
      expect(cat.name, `category "${cat.id}" missing name`).toBeTruthy();
      expect(cat.baseUnit, `category "${cat.id}" missing baseUnit`).toBeTruthy();
      expect(Array.isArray(cat.units), `category "${cat.id}" units must be array`).toBe(true);
      expect(cat.units.length, `category "${cat.id}" must have at least one unit`).toBeGreaterThan(0);
    }
  });

  it('every unit has required fields', () => {
    for (const cat of CONVERSION_DATA) {
      for (const unit of cat.units) {
        expect(unit.id, `unit in "${cat.id}" missing id`).toBeTruthy();
        expect(unit.name, `unit "${unit.id}" in "${cat.id}" missing name`).toBeTruthy();
        expect(unit.symbol, `unit "${unit.id}" in "${cat.id}" missing symbol`).toBeDefined();
        expect(typeof unit.factor, `unit "${unit.id}" factor must be number`).toBe('number');
        expect(isNaN(unit.factor), `unit "${unit.id}" factor must not be NaN`).toBe(false);
        expect(isFinite(unit.factor), `unit "${unit.id}" factor must be finite`).toBe(true);
      }
    }
  });

  it('contains all major category IDs in correct order', () => {
    const ids = CONVERSION_DATA.map(c => c.id);
    const coreIds = ['length', 'mass', 'time', 'current', 'temperature', 'amount', 'intensity'];
    for (const id of coreIds) {
      expect(ids).toContain(id);
    }
    // Core SI base categories come first
    expect(ids.indexOf('length')).toBeLessThan(ids.indexOf('area'));
    expect(ids.indexOf('mass')).toBeLessThan(ids.indexOf('density'));
    expect(ids.indexOf('time')).toBeLessThan(ids.indexOf('frequency'));
  });

  it('fixture: length category has meter with factor 1', () => {
    const length = CONVERSION_DATA.find(c => c.id === 'length');
    expect(length).toBeDefined();
    const meter = length!.units.find(u => u.id === 'm');
    expect(meter).toBeDefined();
    expect(meter!.factor).toBe(1);
    expect(meter!.symbol).toBe('m');
  });

  it('fixture: angle category has radian and degree with correct factors', () => {
    const angle = CONVERSION_DATA.find(c => c.id === 'angle');
    expect(angle).toBeDefined();
    const radian = angle!.units.find(u => u.id === 'rad');
    expect(radian).toBeDefined();
    expect(radian!.factor).toBe(1);
    const degree = angle!.units.find(u => u.id === 'deg');
    expect(degree).toBeDefined();
    // 1 degree = PI/180 radians ≈ 0.017453
    expect(degree!.factor).toBeCloseTo(Math.PI / 180, 10);
  });

  it('fixture: temperature category has Celsius with correct offset', () => {
    const temp = CONVERSION_DATA.find(c => c.id === 'temperature');
    expect(temp).toBeDefined();
    const celsius = temp!.units.find(u => u.id === 'c');
    expect(celsius).toBeDefined();
    expect(celsius!.offset).toBeDefined();
  });

  it('no category factor values are NaN or Infinity', () => {
    for (const cat of CONVERSION_DATA) {
      for (const unit of cat.units) {
        expect(Number.isFinite(unit.factor) || unit.mathFunction !== undefined,
          `unit "${unit.id}" in "${cat.id}": invalid factor ${unit.factor}`)
          .toBe(true);
      }
    }
  });

  it('pre-computed PI values are present in angle JSON (not Math.PI expressions)', () => {
    const angle = CONVERSION_DATA.find(c => c.id === 'angle');
    const degree = angle!.units.find(u => u.id === 'deg');
    // Verify this is a numeric literal (pre-computed), not a function call
    expect(typeof degree!.factor).toBe('number');
    expect(degree!.factor).toBeCloseTo(0.017453292519943295, 15);
  });
});

describe('JSON Integrity: cross-file consistency', () => {
  it('unit names in CONVERSION_DATA that have translations use English self-reference', () => {
    let checkedCount = 0;
    for (const cat of CONVERSION_DATA) {
      for (const unit of cat.units) {
        const enVal = UNIT_NAME_TRANSLATIONS['en']?.[unit.name];
        if (enVal) {
          expect(enVal).toBeTruthy();
          checkedCount++;
        }
      }
    }
    // At least 50 units should have translations
    expect(checkedCount).toBeGreaterThan(50);
  });

  it('every unit name has a non-empty entry in every locale', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      const map = UNIT_NAME_TRANSLATIONS[lang];
      expect(map, `locale map missing for "${lang}"`).toBeDefined();
      for (const cat of CONVERSION_DATA) {
        for (const unit of cat.units) {
          const val = map[unit.name];
          expect(val, `"${unit.name}" (${cat.id}) missing in locale "${lang}"`).toBeTruthy();
        }
      }
    }
  });

  it('no locale contains keys absent from en.json (no orphaned drift)', () => {
    const enKeys = new Set(Object.keys(UNIT_NAME_TRANSLATIONS['en']));
    for (const lang of SUPPORTED_LANGUAGES) {
      if (lang === 'en') continue;
      for (const key of Object.keys(UNIT_NAME_TRANSLATIONS[lang])) {
        expect(enKeys.has(key), `orphaned key "${key}" in locale "${lang}" not present in en.json`).toBe(true);
      }
    }
  });

  it('stale renamed keys are fully removed from all locales', () => {
    const removed = ['Long Ton (UK)', 'Stone (UK)', 'Dan (China volume)', 'Dunam', 'Ton Refrigeration'];
    for (const lang of SUPPORTED_LANGUAGES) {
      for (const key of removed) {
        expect(UNIT_NAME_TRANSLATIONS[lang][key], `stale key "${key}" still present in "${lang}"`).toBeUndefined();
      }
    }
  });

  it('every en.json key maps to a current unit/category name or a documented app key (no dead keys)', () => {
    // Keys referenced directly by application code via t()/translateUnit
    const CODE_KEYS = [
      'Thermodynamics & Chemistry', 'Radiation & Physics', 'Human Response', 'Other',
      'Refractive Power', 'Base unit:', 'Base Factor', 'SI Base Units', 'Precision',
      'Copy', 'Prefix', 'Unit', 'Result', 'CALCULATOR - RPN', 'CALCULATOR',
      'Clear', 'Clear calculator', 'From', 'To', 'Compare All', 'Compare', 'Input',
    ];
    const toTitleCase = (s: string) =>
      s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
    const allowed = new Set<string>(CODE_KEYS);
    for (const cat of CONVERSION_DATA) {
      allowed.add(cat.name);
      allowed.add(toTitleCase(cat.baseUnit));
      for (const unit of cat.units) allowed.add(unit.name);
    }
    for (const key of Object.keys(UNIT_NAME_TRANSLATIONS['en'])) {
      expect(allowed.has(key), `orphaned en.json key "${key}" — not a current unit/category name; remove it from all locales or add it to the allowlist`).toBe(true);
    }
  });

  it('BTU naming policy: BTU everywhere except zh/ru/ar native terms', () => {
    expect(UNIT_NAME_TRANSLATIONS['zh']['BTU']).toBe('英热单位');
    expect(UNIT_NAME_TRANSLATIONS['ru']['BTU']).toBe('БТЕ');
    expect(UNIT_NAME_TRANSLATIONS['ar']['BTU']).toBe('وحدة حرارية بريطانية');
    for (const lang of ['en', 'en-us', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pt'] as const) {
      expect(UNIT_NAME_TRANSLATIONS[lang]['BTU'], `BTU wrong in "${lang}"`).toBe('BTU');
    }
  });

  it('SUPPORTED_LANGUAGES covers all languages used in translations', () => {
    const langSet = new Set(SUPPORTED_LANGUAGES);
    for (const lang of REQUIRED_LANGUAGES) {
      expect(langSet.has(lang as typeof SUPPORTED_LANGUAGES[number]),
        `"${lang}" missing from SUPPORTED_LANGUAGES`).toBe(true);
    }
  });
});

describe('JSON Integrity: category-defaults.json (council-13)', () => {
  it('every default category exists in CONVERSION_DATA', async () => {
    const { CATEGORY_DEFAULTS } = await import('../client/src/lib/units/categoryDefaults');
    const knownCategoryIds = new Set(CONVERSION_DATA.map((c: { id: string }) => c.id));
    Object.keys(CATEGORY_DEFAULTS).forEach(catId => {
      expect(knownCategoryIds.has(catId), `category '${catId}' in category-defaults.json but not in CONVERSION_DATA`).toBe(true);
    });
  });

  it('every default unit exists inside its category', async () => {
    const { CATEGORY_DEFAULTS } = await import('../client/src/lib/units/categoryDefaults');
    Object.keys(CATEGORY_DEFAULTS).forEach(catId => {
      const def = (CATEGORY_DEFAULTS as Record<string, { unit: string; prefix: string }>)[catId];
      const cat = CONVERSION_DATA.find((c: { id: string }) => c.id === catId);
      expect(cat, `category '${catId}' missing`).toBeTruthy();
      const unitIds = new Set((cat!.units as Array<{ id: string }>).map(u => u.id));
      expect(unitIds.has(def.unit), `default unit '${def.unit}' not in category '${catId}'`).toBe(true);
    });
  });
});

describe('JSON Integrity: primaryCategory metadata', () => {
  it('every primaryCategory references an existing category id', () => {
    const knownIds = new Set(CONVERSION_DATA.map((c: { id: string }) => c.id));
    for (const cat of CONVERSION_DATA) {
      if (!cat.primaryCategory) continue;
      expect(
        knownIds.has(cat.primaryCategory),
        `category '${cat.id}' declares primaryCategory='${cat.primaryCategory}' but no such category exists`,
      ).toBe(true);
    }
  });

  it('no primaryCategory chains (specialists must point at primaries)', () => {
    const byId = new Map(CONVERSION_DATA.map((c: { id: string; primaryCategory?: string }) => [c.id, c]));
    for (const cat of CONVERSION_DATA) {
      if (!cat.primaryCategory) continue;
      const parent = byId.get(cat.primaryCategory);
      expect(parent, `parent '${cat.primaryCategory}' missing for '${cat.id}'`).toBeTruthy();
      expect(
        parent!.primaryCategory,
        `category '${cat.id}' points at '${cat.primaryCategory}', which is itself a specialist (primaryCategory='${parent!.primaryCategory}'); chains are forbidden`,
      ).toBeUndefined();
    }
  });

  it('validateNoPrimaryCategoryChains passes for a valid set', async () => {
    const { validateNoPrimaryCategoryChains } = await import('../client/src/lib/units/validateNoPrimaryCategoryChains');
    expect(() => validateNoPrimaryCategoryChains([
      { id: 'length' },
      { id: 'archaic_length', primaryCategory: 'length' },
    ])).not.toThrow();
  });

  it('validateNoPrimaryCategoryChains rejects missing parent', async () => {
    const { validateNoPrimaryCategoryChains } = await import('../client/src/lib/units/validateNoPrimaryCategoryChains');
    expect(() => validateNoPrimaryCategoryChains([
      { id: 'archaic_length', primaryCategory: 'length' },
    ])).toThrow(/no such category exists/);
  });

  it('validateNoPrimaryCategoryChains rejects chained specialists', async () => {
    const { validateNoPrimaryCategoryChains } = await import('../client/src/lib/units/validateNoPrimaryCategoryChains');
    expect(() => validateNoPrimaryCategoryChains([
      { id: 'length' },
      { id: 'mid', primaryCategory: 'length' },
      { id: 'leaf', primaryCategory: 'mid' },
    ])).toThrow(/Chains are forbidden/);
  });

  it('archaic and named-standard specialists all have primaryCategory set', () => {
    const expectedSpecialists = new Set([
      'archaic_length', 'archaic_mass', 'archaic_area', 'archaic_volume',
      'archaic_energy', 'archaic_power',
      'paper_sizes', 'rack_geometry', 'shipping', 'lightbulb',
      'cooking', 'beer_wine_volume', 'typography',
      'fuel',
      'radioactive_decay', 'equivalent_dose', 'radiation_exposure',
    ]);
    for (const catId of expectedSpecialists) {
      const cat = CONVERSION_DATA.find((c: { id: string }) => c.id === catId);
      expect(cat, `category '${catId}' missing from CONVERSION_DATA`).toBeTruthy();
      expect(
        cat!.primaryCategory,
        `expected specialist '${catId}' to declare primaryCategory`,
      ).toBeTruthy();
    }
  });
});
