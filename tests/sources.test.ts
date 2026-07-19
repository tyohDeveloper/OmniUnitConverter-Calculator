import { describe, it, expect } from 'vitest';
import { CONVERSION_DATA } from '../client/src/lib/conversion-data';
import { formatSiEquivalent } from '../client/src/lib/units/formatSiEquivalent';
import { formatSiFactor } from '../client/src/lib/units/formatSiFactor';
import { DEFINING_RELATIONS } from '../client/src/lib/units/definingRelations';
import { CONVERSION_FUNCTIONS } from '../client/src/lib/units/conversionFunctionRegistry';

describe('sources reference data', () => {
  it('every unit has a valid https sourceUrl', () => {
    for (const cat of CONVERSION_DATA) {
      for (const u of cat.units) {
        expect(u.sourceUrl, `${cat.id}:${u.id} missing sourceUrl`).toBeTruthy();
        expect(u.sourceUrl!.startsWith('https://'), `${cat.id}:${u.id} bad url ${u.sourceUrl}`).toBe(true);
      }
    }
  });

  it('formatSiEquivalent renders a non-empty string for every unit in every category', () => {
    for (const cat of CONVERSION_DATA) {
      const base = cat.units.find(
        u => u.factor === 1 && !u.offset && !u.conversionFunction && !u.mathFunction && !u.isInverse,
      );
      const baseSym = base?.symbol || cat.baseSISymbol || '';
      for (const u of cat.units) {
        const s = formatSiEquivalent(u, baseSym);
        expect(typeof s, `${cat.id}:${u.id}`).toBe('string');
        expect(s.length, `${cat.id}:${u.id} empty`).toBeGreaterThan(0);
      }
    }
  });

  it('every non-linear conversionFunction unit has a defining relation', () => {
    for (const cat of CONVERSION_DATA) {
      for (const u of cat.units) {
        if (!u.conversionFunction) continue;
        const pair = CONVERSION_FUNCTIONS[u.conversionFunction];
        if (pair?.linear) continue;
        expect(DEFINING_RELATIONS[u.conversionFunction], `${cat.id}:${u.id} missing relation`).toBeTruthy();
      }
    }
  });
});

describe('formatSiFactor', () => {
  it('formats plain factors', () => {
    expect(formatSiFactor(0.3048)).toBe('0.3048');
    expect(formatSiFactor(1)).toBe('1');
    expect(formatSiFactor(1000)).toBe('1000');
  });
  it('uses scientific notation for extreme magnitudes', () => {
    expect(formatSiFactor(1.602176634e-19)).toBe('1.602177 × 10^−19');
    expect(formatSiFactor(9.4607e15)).toBe('9.4607 × 10^15');
  });
});

describe('formatSiEquivalent', () => {
  const find = (catId: string, unitId: string) => {
    const cat = CONVERSION_DATA.find(c => c.id === catId)!;
    return cat.units.find(u => u.id === unitId)!;
  };

  it('linear unit', () => {
    expect(formatSiEquivalent(find('length', 'ft'), 'm')).toBe('1 ft = 0.3048 m');
  });
  it('offset unit (Celsius)', () => {
    expect(formatSiEquivalent(find('temperature', 'c'), 'K')).toBe('x °C = (x + 273.15) K');
  });
  it('offset+scale unit (Fahrenheit)', () => {
    const s = formatSiEquivalent(find('temperature', 'f'), 'K');
    expect(s).toContain('x °F = (x + 459.67)');
    expect(s).toContain('K');
  });
  it('non-linear dB unit uses defining relation', () => {
    expect(formatSiEquivalent(find('power', 'dbm'), 'W')).toBe('P = 1 mW × 10^(x/10)');
  });
  it('base unit shows factor 1', () => {
    expect(formatSiEquivalent(find('length', 'm'), 'm')).toBe('1 m = 1 m');
  });
});
