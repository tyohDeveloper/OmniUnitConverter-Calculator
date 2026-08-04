import { describe, it, expect } from 'vitest';
import { CONVERSION_DATA } from '../client/src/lib/conversion-data';
import { formatSiEquivalent } from '../client/src/lib/units/formatSiEquivalent';
import { formatSiFactor } from '../client/src/lib/units/formatSiFactor';
import { toSuperscriptExponent } from '../client/src/lib/unit-symbols/toSuperscriptExponent';
import { PAPER_SIZE_DIMENSIONS } from '../client/src/lib/units/paperSizeDimensions';
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
        const s = formatSiEquivalent(u, baseSym, { categoryId: cat.id, baseSISymbol: cat.baseSISymbol });
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

  it('no defining relation uses "×"', () => {
    for (const [key, rel] of Object.entries(DEFINING_RELATIONS)) {
      expect(rel.includes('×'), `${key} uses ×`).toBe(false);
    }
  });

  it('every paper size unit has a physical dimension entry', () => {
    const paper = CONVERSION_DATA.find(c => c.id === 'paper_sizes')!;
    for (const u of paper.units) {
      expect(PAPER_SIZE_DIMENSIONS[u.id], `${u.id} missing dimensions`).toBeTruthy();
      expect(PAPER_SIZE_DIMENSIONS[u.id]).toContain('×');
    }
  });
});

describe('toSuperscriptExponent', () => {
  it('converts digits and signs', () => {
    expect(toSuperscriptExponent('3')).toBe('³');
    expect(toSuperscriptExponent('-19')).toBe('⁻¹⁹');
    expect(toSuperscriptExponent('12')).toBe('¹²');
  });
});

describe('formatSiFactor', () => {
  it('formats plain factors', () => {
    expect(formatSiFactor(0.3048)).toBe('0.3048');
    expect(formatSiFactor(1)).toBe('1');
    expect(formatSiFactor(1000)).toBe('1000');
  });
  it('uses superscript scientific notation for extreme magnitudes', () => {
    expect(formatSiFactor(1.602176634e-19)).toBe('1.602177⋅10⁻¹⁹');
    expect(formatSiFactor(9.4607e15)).toBe('9.4607⋅10¹⁵');
  });
  it('drops a mantissa of exactly 1', () => {
    expect(formatSiFactor(1e-6)).toBe('10⁻⁶');
    expect(formatSiFactor(1e12)).toBe('10¹²');
    expect(formatSiFactor(-1e-6)).toBe('−10⁻⁶');
  });
});

describe('formatSiEquivalent', () => {
  const find = (catId: string, unitId: string) => {
    const cat = CONVERSION_DATA.find(c => c.id === catId)!;
    return cat.units.find(u => u.id === unitId)!;
  };

  it('linear unit drops the leading 1', () => {
    expect(formatSiEquivalent(find('length', 'ft'), 'm')).toBe('ft = 0.3048 m');
  });
  it('offset unit (Celsius)', () => {
    expect(formatSiEquivalent(find('temperature', 'c'), 'K')).toBe('x °C = (x + 273.15) K');
  });
  it('offset+scale unit (Fahrenheit) uses ⋅', () => {
    const s = formatSiEquivalent(find('temperature', 'f'), 'K');
    expect(s).toContain('x °F = (x + 459.67)⋅');
    expect(s).toContain('K');
    expect(s.includes('×')).toBe(false);
  });
  it('non-linear dB unit uses cleaned defining relation', () => {
    expect(formatSiEquivalent(find('power', 'dbm'), 'W')).toBe('dBm = mW⋅10^(x/10)');
  });
  it('SI base unit without decomposition shows identity', () => {
    expect(formatSiEquivalent(find('length', 'm'), 'm')).toBe('m = 1 m');
  });
  it('derived base unit shows base-SI decomposition', () => {
    expect(formatSiEquivalent(find('energy', 'j'), 'J', { categoryId: 'energy', baseSISymbol: 'kg⋅m²⋅s⁻²' }))
      .toBe('J = kg⋅m²⋅s⁻²');
  });
  it('unitless units drop the trailing base symbol and use superscripts', () => {
    expect(formatSiEquivalent(find('unitless', 'ppm'), '1', { categoryId: 'unitless' })).toBe('ppm = 10⁻⁶');
  });
  it('inverse units show the actual unit symbols', () => {
    const s = formatSiEquivalent(find('radioactive_decay', 'half_s'), 's⁻¹', { categoryId: 'radioactive_decay' });
    expect(s).toBe('t½(s) = 0.6931471806 / (x s⁻¹)');
  });
  it('paper sizes render as physical dimensions', () => {
    expect(formatSiEquivalent(find('paper_sizes', 'a4'), 'm²', { categoryId: 'paper_sizes' }))
      .toBe('A4 = 210 mm × 297 mm');
  });
});
