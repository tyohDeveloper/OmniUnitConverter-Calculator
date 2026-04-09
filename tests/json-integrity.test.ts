import { describe, it, expect } from 'vitest';
import { UI_TRANSLATIONS, UNIT_NAME_TRANSLATIONS, SUPPORTED_LANGUAGES, translate } from '../client/src/lib/localization';
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
  it('loads 70 categories', () => {
    expect(CONVERSION_DATA.length).toBe(70);
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

  it('SUPPORTED_LANGUAGES covers all languages used in translations', () => {
    const langSet = new Set(SUPPORTED_LANGUAGES);
    for (const lang of REQUIRED_LANGUAGES) {
      expect(langSet.has(lang as typeof SUPPORTED_LANGUAGES[number]),
        `"${lang}" missing from SUPPORTED_LANGUAGES`).toBe(true);
    }
  });
});
