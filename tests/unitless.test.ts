import { describe, it, expect } from 'vitest';
import { CONVERSION_DATA, convert, buildUnitSymbolMap } from '../client/src/lib/conversion-data';
import { CATEGORY_DIMENSIONS } from '../client/src/lib/units/categoryDimensions';
import { CATEGORY_FAMILIES } from '../client/src/lib/units/categoryFamilies';
import { SUPPORTED_LANGUAGES } from '../client/src/lib/localization';
import { UI_TRANSLATIONS } from '../client/src/lib/translateUi';
import { UNIT_NAME_TRANSLATIONS } from '../client/src/lib/translateUnit';

const category = CONVERSION_DATA.find(c => c.id === 'unitless');

describe('Unitless Numbers category', () => {
  it('is defined and registered', () => {
    expect(category).toBeDefined();
    expect(category!.name).toBe('Unitless Numbers');
    expect(category!.baseUnit).toBe('Number');
  });

  it('has the base unit (Number, factor 1) listed first', () => {
    expect(category!.units[0].id).toBe('number');
    expect(category!.units[0].factor).toBe(1);
  });

  it('orders non-base units ascending by factor', () => {
    const rest = category!.units.slice(1);
    for (let i = 1; i < rest.length; i++) {
      expect(rest[i].factor).toBeGreaterThanOrEqual(rest[i - 1].factor);
    }
  });

  it('has unique symbols within the category', () => {
    const symbols = category!.units.map(u => u.symbol);
    expect(new Set(symbols).size).toBe(symbols.length);
  });

  it('has unique ids within the category', () => {
    const ids = category!.units.map(u => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('no longer includes Decade or Century (moved to Time)', () => {
    const ids = category!.units.map(u => u.id);
    expect(ids).not.toContain('decade');
    expect(ids).not.toContain('century');
    const names = category!.units.map(u => u.name);
    expect(names).not.toContain('Decade');
    expect(names).not.toContain('Century');
  });

  describe('conversions (value × factor)', () => {
    const c = (v: number, from: string, to: string) => convert(v, from, to, 'unitless');

    it('1 dozen = 12', () => { expect(c(1, 'dozen', 'number')).toBe(12); });
    it("1 baker's dozen = 13", () => { expect(c(1, 'bakers_dozen', 'number')).toBe(13); });
    it('5 % = 0.05', () => { expect(c(5, 'percent', 'number')).toBeCloseTo(0.05, 12); });
    it('1 myriad = 10000', () => { expect(c(1, 'myriad', 'number')).toBe(10000); });
    it('1 wan = 10000', () => { expect(c(1, 'wan', 'number')).toBe(10000); });
    it('1 lakh = 100000', () => { expect(c(1, 'lakh', 'number')).toBe(100000); });
    it('1 crore = 10000000', () => { expect(c(1, 'crore', 'number')).toBe(10000000); });
    it('1 yi = 100000000', () => { expect(c(1, 'yi', 'number')).toBe(100000000); });
    it('1 oku = 100000000', () => { expect(c(1, 'oku', 'number')).toBe(100000000); });
    it('1 arab = 1000000000', () => { expect(c(1, 'arab', 'number')).toBe(1000000000); });
    it('1 kharab = 100000000000', () => { expect(c(1, 'kharab', 'number')).toBe(100000000000); });
    it('1 sen = 1000', () => { expect(c(1, 'sen', 'number')).toBe(1000); });
    it('1 zhao = 1e12', () => { expect(c(1, 'zhao', 'number')).toBe(1e12); });
    it('1 kei = 1e16', () => { expect(c(1, 'kei', 'number')).toBe(1e16); });
    it('cross-unit: 1 zhao = 10000 oku', () => { expect(c(1, 'zhao', 'oku')).toBe(10000); });
    it('cross-unit: 1 kei = 10000 zhao', () => { expect(c(1, 'kei', 'zhao')).toBe(10000); });
    it('cross-unit: 1 wan = 10 sen', () => { expect(c(1, 'wan', 'sen')).toBe(10); });
    it('cross-unit: 1 yi = 10000 wan', () => { expect(c(1, 'yi', 'wan')).toBe(10000); });
    it('cross-unit: 1 arab = 100 crore', () => { expect(c(1, 'arab', 'crore')).toBe(100); });
    it('cross-unit: 1 kharab = 100 arab', () => { expect(c(1, 'kharab', 'arab')).toBe(100); });
    it('1 mole = Avogadro count', () => { expect(c(1, 'mole', 'number')).toBe(6.02214076e23); });
    it('1 caret = 1/24', () => { expect(c(1, 'caret', 'number')).toBeCloseTo(1 / 24, 8); });
    it('1 proof (US) = 0.005', () => { expect(c(1, 'proof_us', 'number')).toBe(0.005); });
    it('1 proof (imperial) = 0.005715', () => { expect(c(1, 'proof_imp', 'number')).toBe(0.005715); });
    it('1 gross = 144', () => { expect(c(1, 'gross', 'number')).toBe(144); });
    it('1 great gross = 1728', () => { expect(c(1, 'great_gross', 'number')).toBe(1728); });
    it('cross-unit: 12 number = 1 dozen', () => { expect(c(12, 'number', 'dozen')).toBe(1); });
    it('cross-unit: 1 gross = 12 dozen', () => { expect(c(1, 'gross', 'dozen')).toBe(12); });
  });

  describe('calculator cross-domain exclusion', () => {
    it('unitless is family=DIMENSIONLESS_RATIO (excluded from cross-domain via family filter, not hardcoded list)', () => {
      expect(CATEGORY_FAMILIES['unitless']).toBe('DIMENSIONLESS_RATIO');
    });

    it('is dimensionless and not a base category', () => {
      expect(CATEGORY_DIMENSIONS['unitless'].dimensions).toEqual({});
      expect(CATEGORY_DIMENSIONS['unitless'].isBase).toBe(false);
    });
  });

  describe('localization coverage', () => {
    it('has category name in all 12 languages', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const val = UI_TRANSLATIONS[lang]?.['Unitless Numbers'];
        expect(val, `category name missing in ${lang}`).toBeTruthy();
      }
    });

    it('has every unit name translated in all 12 languages', () => {
      for (const unit of category!.units) {
        for (const lang of SUPPORTED_LANGUAGES) {
          const val = UNIT_NAME_TRANSLATIONS[lang]?.[unit.name];
          expect(val, `${unit.name} missing in ${lang}`).toBeTruthy();
        }
      }
    });
  });

  describe('symbols', () => {
    it('uses the canonical symbols for the ratio units', () => {
      const sym = (id: string) => category!.units.find(u => u.id === id)?.symbol;
      expect(sym('percent')).toBe('%');
      expect(sym('permille')).toBe('‰');
      expect(sym('ppm')).toBe('ppm');
      expect(sym('ppb')).toBe('ppb');
      expect(sym('ppt')).toBe('ppt');
      expect(sym('permyriad')).toBe('‱');
    });

    it('has symbols that are unique within the unitless category', () => {
      const seen = new Set<string>();
      for (const unit of category!.units) {
        expect(seen.has(unit.symbol), `duplicate symbol ${unit.symbol} within unitless`).toBe(false);
        seen.add(unit.symbol);
      }
    });

    // The ratio symbols (%, ‰, ppm, ppb, ppt) are shared cross-category aliases
    // with the concentration category. For global free-text / smart-paste parsing
    // they are intentionally claimed by the general-purpose unitless category (the
    // dimensionless ratio home) via a priority pass in buildUnitSymbolMap, so that
    // typing "5 %" or "1 ppm" lands in unitless. Concentration's own ratio units
    // remain available when the concentration category is selected directly.
    it('routes the shared ratio symbols to unitless for global parsing', () => {
      const map = buildUnitSymbolMap();
      for (const sym of ['%', '‰', 'ppm', 'ppb', 'ppt']) {
        expect(map.get(sym)?.categoryId, `${sym} should be owned by unitless`).toBe('unitless');
      }
    });
  });
});
