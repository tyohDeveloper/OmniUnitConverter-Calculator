import { describe, it, expect } from 'vitest';
import { CONVERSION_DATA, convert } from '../client/src/lib/conversion-data';
import { CATEGORY_DIMENSIONS } from '../client/src/lib/units/categoryDimensions';

const category = CONVERSION_DATA.find(c => c.id === 'luminance');

describe('Luminance category', () => {
  it('exists with cd/m² as prefixable base and all expected units', () => {
    expect(category).toBeDefined();
    const ids = category!.units.map(u => u.id);
    expect(ids).toEqual(expect.arrayContaining([
      'cd_per_m2', 'nit', 'stilb', 'lambert', 'foot_lambert',
      'apostilb', 'skot', 'bril', 'cd_per_ft2', 'cd_per_in2',
    ]));
    const base = category!.units[0];
    expect(base.id).toBe('cd_per_m2');
    expect(base.factor).toBe(1);
    expect(base.allowPrefixes).toBe(true);
  });

  it('converts stilb and lambert to cd/m² correctly', () => {
    expect(convert(1, 'stilb', 'cd_per_m2', 'luminance')).toBeCloseTo(10000, 8);
    expect(convert(1, 'lambert', 'cd_per_m2', 'luminance')).toBeCloseTo(10000 / Math.PI, 8);
    expect(convert(Math.PI, 'apostilb', 'cd_per_m2', 'luminance')).toBeCloseTo(1, 12);
  });

  it('round-trips foot-lambert ↔ nit', () => {
    const nits = convert(1, 'foot_lambert', 'nit', 'luminance');
    expect(nits).toBeCloseTo(3.4262590996, 8);
    expect(convert(nits, 'nit', 'foot_lambert', 'luminance')).toBeCloseTo(1, 12);
  });

  it('relates skot and bril to apostilb', () => {
    expect(convert(1000, 'skot', 'apostilb', 'luminance')).toBeCloseTo(1000 * 1e-3, 12);
    expect(convert(1e7, 'bril', 'apostilb', 'luminance')).toBeCloseTo(1, 12);
  });

  it('converts cd/ft² and cd/in² via area factors', () => {
    expect(convert(1, 'cd_per_ft2', 'cd_per_m2', 'luminance')).toBeCloseTo(1 / 0.09290304, 8);
    expect(convert(1, 'cd_per_in2', 'cd_per_m2', 'luminance')).toBeCloseTo(1 / 0.00064516, 6);
    expect(convert(1, 'cd_per_in2', 'cd_per_ft2', 'luminance')).toBeCloseTo(144, 8);
  });

  it('supports SI prefixes on cd/m² (kcd/m²)', () => {
    expect(convert(1, 'cd_per_m2', 'cd_per_m2', 'luminance', 1000, 1)).toBeCloseTo(1000, 12);
  });

  it('has correct dimensions for cross-domain analysis', () => {
    expect(CATEGORY_DIMENSIONS.luminance.dimensions).toEqual({ intensity: 1, length: -2 });
  });

  it('every unit has a sourceUrl', () => {
    for (const unit of category!.units) {
      expect(unit.sourceUrl, `${unit.id} missing sourceUrl`).toBeTruthy();
    }
  });
});
