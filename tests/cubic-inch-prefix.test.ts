import { describe, it, expect } from 'vitest';
import { CONVERSION_DATA, convert, parseUnitText } from '../client/src/lib/conversion-data';
import { findOptimalPrefix } from '../client/src/lib/units/findOptimalPrefix';
import { prefixPowerFactor } from '../client/src/lib/units/prefixPowerFactor';
import { displayToSI } from '../client/src/lib/unit-symbols/displayToSI';
import { siToDisplay } from '../client/src/lib/unit-symbols/siToDisplay';

const volume = CONVERSION_DATA.find(c => c.id === 'volume')!;
const area = CONVERSION_DATA.find(c => c.id === 'area')!;

describe('Cubic Inch unit', () => {
  it('exists in the volume category with the exact factor', () => {
    const in3 = volume.units.find(u => u.id === 'in3')!;
    expect(in3).toBeDefined();
    expect(in3.name).toBe('Cubic Inch');
    expect(in3.symbol).toBe('in³');
    expect(in3.factor).toBe(0.000016387064);
    expect(in3.unitType).toBe('US_COMMON');
  });

  it('converts 1 ft³ to exactly 1728 in³', () => {
    expect(convert(1, 'ft3', 'in3', 'volume')).toBeCloseTo(1728, 0);
  });

  it('converts 1 in³ to m³', () => {
    expect(convert(1, 'in3', 'm3', 'volume')).toBeCloseTo(0.000016387064, 12);
  });

  it('converts 1 in³ to liters (≈0.016387064 L)', () => {
    expect(convert(1, 'in3', 'l', 'volume')).toBeCloseTo(0.016387064, 9);
  });

  it('round-trips in³ → L → in³', () => {
    const liters = convert(5, 'in3', 'l', 'volume');
    expect(convert(liters, 'l', 'in3', 'volume')).toBeCloseTo(5, 8);
  });

  it('has localized names in all 12 language files', async () => {
    const langs = ['ar', 'de', 'en', 'en-us', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'ru', 'zh'];
    for (const lang of langs) {
      const data = await import(`../client/src/data/localization/units/${lang}.json`);
      expect(data.default['Cubic Inch'], `missing Cubic Inch in ${lang}.json`).toBeTruthy();
    }
  });
});

describe('Prefixed square/cubic meter dimensionality', () => {
  it('m² and m³ declare prefixPower 2 and 3', () => {
    expect(area.units.find(u => u.id === 'm2')!.prefixPower).toBe(2);
    expect(volume.units.find(u => u.id === 'm3')!.prefixPower).toBe(3);
  });

  it('prefixPowerFactor squares/cubes the prefix factor', () => {
    expect(prefixPowerFactor(1e3, 2)).toBe(1e6);
    expect(prefixPowerFactor(1e3, 3)).toBe(1e9);
    expect(prefixPowerFactor(1e-2, 3)).toBeCloseTo(1e-6, 12);
    expect(prefixPowerFactor(1e3, 1)).toBe(1e3);
    expect(prefixPowerFactor(1e3, undefined)).toBe(1e3);
  });

  it('1 km² = 1,000,000 m²', () => {
    const kiloFactor = prefixPowerFactor(1e3, 2);
    expect(convert(1, 'm2', 'm2', 'area', kiloFactor, 1)).toBeCloseTo(1e6, 3);
  });

  it('1 km³ = 1,000,000,000 m³', () => {
    const kiloFactor = prefixPowerFactor(1e3, 3);
    expect(convert(1, 'm3', 'm3', 'volume', kiloFactor, 1)).toBeCloseTo(1e9, 0);
  });

  it('1 cm³ = 1 mL (0.001 L)', () => {
    const centiFactor = prefixPowerFactor(1e-2, 3);
    expect(convert(1, 'm3', 'l', 'volume', centiFactor, 1)).toBeCloseTo(0.001, 9);
  });

  it('round-trips km² → in² → km²', () => {
    const kiloFactor = prefixPowerFactor(1e3, 2);
    const sqIn = convert(2.5, 'm2', 'sqin', 'area', kiloFactor, 1);
    expect(convert(sqIn, 'sqin', 'm2', 'area', 1, kiloFactor)).toBeCloseTo(2.5, 6);
  });

  it('findOptimalPrefix picks kilo for 2,000,000 m² (2 km²)', () => {
    const { prefix, adjustedValue } = findOptimalPrefix(2e6, 'm²', 8, 2);
    expect(prefix.id).toBe('kilo');
    expect(adjustedValue).toBeCloseTo(2, 8);
  });

  it('findOptimalPrefix picks kilo for 5e9 m³ (5 km³)', () => {
    const { prefix, adjustedValue } = findOptimalPrefix(5e9, 'm³', 8, 3);
    expect(prefix.id).toBe('kilo');
    expect(adjustedValue).toBeCloseTo(5, 6);
  });

  it('calculator displayToSI/siToDisplay use squared/cubed prefixes for m²/m³', () => {
    expect(displayToSI(1, 'm²', 'kilo')).toBeCloseTo(1e6, 3);
    expect(displayToSI(1, 'm³', 'kilo')).toBeCloseTo(1e9, 0);
    expect(siToDisplay(1e6, 'm²', 'kilo')).toBeCloseTo(1, 8);
    expect(siToDisplay(1e9, 'm³', 'kilo')).toBeCloseTo(1, 8);
    expect(siToDisplay(displayToSI(7, 'm³', 'centi'), 'm³', 'centi')).toBeCloseTo(7, 8);
  });
});

describe('Smart Paste recognition of cubic inch and prefixed m²/m³', () => {
  it('parses "10 in³" to the volume category', () => {
    const parsed = parseUnitText('10 in³');
    expect(parsed.categoryId).toBe('volume');
    expect(parsed.unitId).toBe('in3');
    expect(parsed.originalValue).toBe(10);
    expect(parsed.value).toBeCloseTo(10 * 0.000016387064, 12);
  });

  it('parses "3 cubic inch" (name, case-insensitive) to the volume category', () => {
    const parsed = parseUnitText('3 cubic inch');
    expect(parsed.categoryId).toBe('volume');
    expect(parsed.unitId).toBe('in3');
    expect(parsed.value).toBeCloseTo(3 * 0.000016387064, 12);

    const upper = parseUnitText('3 Cubic Inch');
    expect(upper.unitId).toBe('in3');
  });

  it('parses "2 km²" with a squared prefix factor (2e6 m²)', () => {
    const parsed = parseUnitText('2 km²');
    expect(parsed.categoryId).toBe('area');
    expect(parsed.unitId).toBe('m2');
    expect(parsed.prefixId).toBe('kilo');
    expect(parsed.value).toBeCloseTo(2e6, 3);
  });

  it('parses "4 cm³" with a cubed prefix factor (4e-6 m³)', () => {
    const parsed = parseUnitText('4 cm³');
    expect(parsed.categoryId).toBe('volume');
    expect(parsed.unitId).toBe('m3');
    expect(parsed.prefixId).toBe('centi');
    expect(parsed.value).toBeCloseTo(4e-6, 12);
  });

  it('still parses linear prefixed units correctly (2 km = 2000 m)', () => {
    const parsed = parseUnitText('2 km');
    expect(parsed.categoryId).toBe('length');
    expect(parsed.unitId).toBe('m');
    expect(parsed.prefixId).toBe('kilo');
    expect(parsed.value).toBeCloseTo(2000, 6);
  });
});
