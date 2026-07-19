import { describe, it, expect } from 'vitest';
import { CONVERSION_DATA, convert } from '../client/src/lib/conversion-data';
import { CATEGORY_DIMENSIONS } from '../client/src/lib/units/categoryDimensions';

describe('Radiation Exposure category', () => {
  const cat = CONVERSION_DATA.find(c => c.id === 'radiation_exposure');

  it('exists with C/kg base and Roentgen', () => {
    expect(cat).toBeDefined();
    const ids = cat!.units.map(u => u.id);
    expect(ids).toContain('c_per_kg');
    expect(ids).toContain('roentgen');
    const ckg = cat!.units.find(u => u.id === 'c_per_kg')!;
    expect(ckg.factor).toBe(1);
    expect(ckg.allowPrefixes).toBe(true);
    expect(cat!.units.find(u => u.id === 'roentgen')!.factor).toBe(2.58e-4);
  });

  it('converts Roentgen to C/kg exactly', () => {
    expect(convert(1, 'roentgen', 'c_per_kg', 'radiation_exposure')).toBeCloseTo(2.58e-4, 12);
    expect(convert(1000, 'roentgen', 'c_per_kg', 'radiation_exposure')).toBeCloseTo(0.258, 12);
  });

  it('converts C/kg to Roentgen (round trip)', () => {
    expect(convert(2.58e-4, 'c_per_kg', 'roentgen', 'radiation_exposure')).toBeCloseTo(1, 12);
    const rt = convert(convert(7, 'roentgen', 'c_per_kg', 'radiation_exposure'), 'c_per_kg', 'roentgen', 'radiation_exposure');
    expect(rt).toBeCloseTo(7, 10);
  });

  it('supports SI prefixes on C/kg (mC/kg)', () => {
    expect(convert(1, 'roentgen', 'c_per_kg', 'radiation_exposure', 1, 1e-3)).toBeCloseTo(0.258, 12);
  });

  it('has correct dimensions A·s·kg⁻¹', () => {
    expect(CATEGORY_DIMENSIONS.radiation_exposure.dimensions).toEqual({ current: 1, time: 1, mass: -1 });
  });

  it('every unit has a sourceUrl', () => {
    for (const u of cat!.units) {
      expect(u.sourceUrl).toMatch(/^https:\/\//);
    }
  });
});
