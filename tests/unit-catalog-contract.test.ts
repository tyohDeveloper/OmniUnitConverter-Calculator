// Contract tests for the unit catalog data. Ensures the underlying data
// files (SI derived, non-SI, category dimensions, preferred representations,
// SI base) contain the expected units and structure. Renamed from
// shared-types.test.ts per §3.7/3.8 — the old barrel is gone, and this file
// was never actually testing 'shared types', it was testing catalog contents.
import { describe, it, expect } from 'vitest';
import type { DimensionalFormula } from '../client/src/lib/units/dimensionalFormula';
import type { CalcValue } from '../client/src/lib/units/calcValue';
import type { DerivedUnitInfo } from '../client/src/lib/units/derivedUnitInfo';
import { SI_DERIVED_UNITS } from '../client/src/lib/units/siDerivedUnitsCatalog';
import { NON_SI_UNITS_CATALOG } from '../client/src/lib/units/nonSiUnitsCatalog';
import {
  CATEGORY_DIMENSIONS,
  EXCLUDED_CROSS_DOMAIN_CATEGORIES,
  type CategoryDimensionInfo,
} from '../client/src/lib/units/categoryDimensions';
import {
  PREFERRED_REPRESENTATIONS,
  type PreferredRepresentation,
} from '../client/src/lib/units/preferredRepresentations';
import { getDimensionSignature } from '../client/src/lib/units/getDimensionSignature';
import {
  SI_BASE_UNIT_SYMBOLS,
  SI_BASE_TO_DIMENSION,
  DIMENSION_TO_SI_SYMBOL,
} from '../client/src/lib/units/siBaseUnits';

describe('unit catalog', () => {
  describe('SI_DERIVED_UNITS', () => {
    it('should be an array', () => {
      expect(Array.isArray(SI_DERIVED_UNITS)).toBe(true);
    });

    it('should contain expected SI derived units', () => {
      const symbols = SI_DERIVED_UNITS.map(u => u.symbol);
      expect(symbols).toContain('Hz');
      expect(symbols).toContain('N');
      expect(symbols).toContain('Pa');
      expect(symbols).toContain('J');
      expect(symbols).toContain('W');
      expect(symbols).toContain('V');
      expect(symbols).toContain('Ω');
      expect(symbols).toContain('F');
      expect(symbols).toContain('H');
      expect(symbols).toContain('T');
      expect(symbols).toContain('Wb');
      expect(symbols).toContain('C');
      expect(symbols).toContain('S');
      expect(symbols).toContain('lm');
      expect(symbols).toContain('lx');
      expect(symbols).toContain('Bq');
      expect(symbols).toContain('Gy');
      expect(symbols).toContain('Sv');
      expect(symbols).toContain('kat');
      expect(symbols).toContain('rad');
      expect(symbols).toContain('sr');
    });

    it('should have correct structure for each unit', () => {
      SI_DERIVED_UNITS.forEach(unit => {
        expect(unit).toHaveProperty('symbol');
        expect(unit).toHaveProperty('category');
        expect(unit).toHaveProperty('unitId');
        expect(unit).toHaveProperty('dimensions');
        expect(unit).toHaveProperty('allowPrefixes');
        expect(typeof unit.symbol).toBe('string');
        expect(typeof unit.category).toBe('string');
        expect(typeof unit.unitId).toBe('string');
        expect(typeof unit.dimensions).toBe('object');
        expect(typeof unit.allowPrefixes).toBe('boolean');
      });
    });

    it('should have correct dimensions for Newton (force)', () => {
      const newton = SI_DERIVED_UNITS.find(u => u.symbol === 'N');
      expect(newton).toBeDefined();
      expect(newton!.dimensions).toEqual({ mass: 1, length: 1, time: -2 });
    });

    it('should have correct dimensions for Joule (energy)', () => {
      const joule = SI_DERIVED_UNITS.find(u => u.symbol === 'J');
      expect(joule).toBeDefined();
      expect(joule!.dimensions).toEqual({ mass: 1, length: 2, time: -2 });
    });

    it('should have correct dimensions for Watt (power)', () => {
      const watt = SI_DERIVED_UNITS.find(u => u.symbol === 'W');
      expect(watt).toBeDefined();
      expect(watt!.dimensions).toEqual({ mass: 1, length: 2, time: -3 });
    });
  });

  describe('NON_SI_UNITS_CATALOG', () => {
    it('should be an array', () => {
      expect(Array.isArray(NON_SI_UNITS_CATALOG)).toBe(true);
    });

    it('should contain expected CGS and Imperial units', () => {
      const symbols = NON_SI_UNITS_CATALOG.map(u => u.symbol);
      expect(symbols).toContain('dyn');
      expect(symbols).toContain('erg');
      expect(symbols).toContain('cal');
      expect(symbols).toContain('BTU');
      expect(symbols).toContain('Ba');
      expect(symbols).toContain('atm');
      expect(symbols).toContain('bar');
      expect(symbols).toContain('psi');
      expect(symbols).toContain('hp');
      expect(symbols).toContain('Po');
      expect(symbols).toContain('St');
      expect(symbols).toContain('G');
      expect(symbols).toContain('Mx');
      expect(symbols).toContain('Oe');
    });

    it('should have correct structure for each unit', () => {
      NON_SI_UNITS_CATALOG.forEach(unit => {
        expect(unit).toHaveProperty('symbol');
        expect(unit).toHaveProperty('category');
        expect(unit).toHaveProperty('unitId');
        expect(unit).toHaveProperty('dimensions');
        expect(unit).toHaveProperty('allowPrefixes');
      });
    });

    it('should have correct dimensions for dyne (CGS force)', () => {
      const dyne = NON_SI_UNITS_CATALOG.find(u => u.symbol === 'dyn');
      expect(dyne).toBeDefined();
      expect(dyne!.dimensions).toEqual({ mass: 1, length: 1, time: -2 });
    });

    it('should have correct dimensions for erg (CGS energy)', () => {
      const erg = NON_SI_UNITS_CATALOG.find(u => u.symbol === 'erg');
      expect(erg).toBeDefined();
      expect(erg!.dimensions).toEqual({ mass: 1, length: 2, time: -2 });
    });
  });

  describe('CATEGORY_DIMENSIONS', () => {
    it('should be an object', () => {
      expect(typeof CATEGORY_DIMENSIONS).toBe('object');
    });

    it('should contain all SI base quantities', () => {
      expect(CATEGORY_DIMENSIONS).toHaveProperty('length');
      expect(CATEGORY_DIMENSIONS).toHaveProperty('mass');
      expect(CATEGORY_DIMENSIONS).toHaveProperty('time');
      expect(CATEGORY_DIMENSIONS).toHaveProperty('current');
      expect(CATEGORY_DIMENSIONS).toHaveProperty('temperature');
      expect(CATEGORY_DIMENSIONS).toHaveProperty('amount');
      expect(CATEGORY_DIMENSIONS).toHaveProperty('intensity');
      expect(CATEGORY_DIMENSIONS).toHaveProperty('angle');
      expect(CATEGORY_DIMENSIONS).toHaveProperty('solid_angle');
    });

    it('should contain derived mechanical quantities', () => {
      expect(CATEGORY_DIMENSIONS).toHaveProperty('area');
      expect(CATEGORY_DIMENSIONS).toHaveProperty('volume');
      expect(CATEGORY_DIMENSIONS).toHaveProperty('speed');
      expect(CATEGORY_DIMENSIONS).toHaveProperty('acceleration');
      expect(CATEGORY_DIMENSIONS).toHaveProperty('force');
      expect(CATEGORY_DIMENSIONS).toHaveProperty('pressure');
      expect(CATEGORY_DIMENSIONS).toHaveProperty('energy');
      expect(CATEGORY_DIMENSIONS).toHaveProperty('power');
    });

    it('should mark base quantities with isBase: true', () => {
      expect(CATEGORY_DIMENSIONS.length.isBase).toBe(true);
      expect(CATEGORY_DIMENSIONS.mass.isBase).toBe(true);
      expect(CATEGORY_DIMENSIONS.time.isBase).toBe(true);
    });

    it('should mark derived quantities with isBase: false', () => {
      expect(CATEGORY_DIMENSIONS.area.isBase).toBe(false);
      expect(CATEGORY_DIMENSIONS.energy.isBase).toBe(false);
      expect(CATEGORY_DIMENSIONS.power.isBase).toBe(false);
    });

    it('should have correct structure for each category', () => {
      Object.entries(CATEGORY_DIMENSIONS).forEach(([key, info]) => {
        expect(info).toHaveProperty('name');
        expect(info).toHaveProperty('dimensions');
        expect(info).toHaveProperty('isBase');
        expect(typeof info.name).toBe('string');
        expect(typeof info.dimensions).toBe('object');
        expect(typeof info.isBase).toBe('boolean');
      });
    });

    it('should have correct dimensions for energy', () => {
      expect(CATEGORY_DIMENSIONS.energy.dimensions).toEqual({ mass: 1, length: 2, time: -2 });
    });

    it('should have correct dimensions for power', () => {
      expect(CATEGORY_DIMENSIONS.power.dimensions).toEqual({ mass: 1, length: 2, time: -3 });
    });

    it('should have correct dimensions for force', () => {
      expect(CATEGORY_DIMENSIONS.force.dimensions).toEqual({ mass: 1, length: 1, time: -2 });
    });
  });

  describe('EXCLUDED_CROSS_DOMAIN_CATEGORIES', () => {
    it('should be an array', () => {
      expect(Array.isArray(EXCLUDED_CROSS_DOMAIN_CATEGORIES)).toBe(true);
    });

    // Archaic and named-standard specialists (typography, cooking,
    // beer_wine_volume, fuel, lightbulb, rack_geometry, shipping,
    // paper_sizes, and the six archaics) are no longer in this list.
    // They're excluded from cross-domain matches via primaryCategory
    // metadata instead — see the primaryCategory tests in
    // json-integrity.test.ts and the behavioral tests below.

    it('should contain fuel_economy (dimensionally unique non-specialist)', () => {
      expect(EXCLUDED_CROSS_DOMAIN_CATEGORIES).toContain('fuel_economy');
    });

    it('should contain dimensionless categories (findCategoryByDimensions has no dimensionless guard)', () => {
      expect(EXCLUDED_CROSS_DOMAIN_CATEGORIES).toContain('data');
      expect(EXCLUDED_CROSS_DOMAIN_CATEGORIES).toContain('math');
      expect(EXCLUDED_CROSS_DOMAIN_CATEGORIES).toContain('logarithmic');
      expect(EXCLUDED_CROSS_DOMAIN_CATEGORIES).toContain('unitless');
    });

    it('should NOT contain retired specialists (covered by primaryCategory)', () => {
      const retired = [
        'archaic_length', 'archaic_mass', 'archaic_area',
        'archaic_volume', 'archaic_energy', 'archaic_power',
        'typography', 'cooking', 'beer_wine_volume', 'fuel',
        'lightbulb', 'rack_geometry', 'shipping', 'paper_sizes',
      ];
      for (const catId of retired) {
        expect(
          EXCLUDED_CROSS_DOMAIN_CATEGORIES,
          `${catId} should be dropped from EXCLUDED_CROSS_DOMAIN_CATEGORIES; primaryCategory covers it`,
        ).not.toContain(catId);
      }
    });
  });

  describe('PREFERRED_REPRESENTATIONS', () => {
    it('should be an object', () => {
      expect(typeof PREFERRED_REPRESENTATIONS).toBe('object');
    });

    it('should have correct structure for each representation', () => {
      Object.entries(PREFERRED_REPRESENTATIONS).forEach(([key, rep]) => {
        expect(rep).toHaveProperty('displaySymbol');
        expect(rep).toHaveProperty('isSI');
        expect(rep).toHaveProperty('allowPrefixes');
        expect(typeof rep.displaySymbol).toBe('string');
        expect(typeof rep.isSI).toBe('boolean');
        expect(typeof rep.allowPrefixes).toBe('boolean');
      });
    });

    it('should have Stokes for kinematic viscosity dimensions', () => {
      const kinematicViscosity = PREFERRED_REPRESENTATIONS['length:2,time:-1'];
      expect(kinematicViscosity).toBeDefined();
      expect(kinematicViscosity.displaySymbol).toBe('St');
      expect(kinematicViscosity.isSI).toBe(false);
    });

    it('should have Gray for radiation dose dimensions', () => {
      const radiationDose = PREFERRED_REPRESENTATIONS['length:2,time:-2'];
      expect(radiationDose).toBeDefined();
      expect(radiationDose.displaySymbol).toBe('Gy');
      expect(radiationDose.isSI).toBe(true);
    });
  });

  describe('getDimensionSignature', () => {
    it('should return empty string for empty dimensions', () => {
      expect(getDimensionSignature({})).toBe('');
    });

    it('should return sorted dimension string', () => {
      const dims: DimensionalFormula = { mass: 1, length: 2, time: -2 };
      expect(getDimensionSignature(dims)).toBe('length:2,mass:1,time:-2');
    });

    it('should filter out zero exponents', () => {
      const dims: DimensionalFormula = { mass: 1, length: 0, time: -2 };
      expect(getDimensionSignature(dims)).toBe('mass:1,time:-2');
    });

    it('should be consistent regardless of input order', () => {
      const dims1: DimensionalFormula = { time: -2, length: 2, mass: 1 };
      const dims2: DimensionalFormula = { mass: 1, length: 2, time: -2 };
      expect(getDimensionSignature(dims1)).toBe(getDimensionSignature(dims2));
    });
  });

  describe('SI_BASE_UNIT_SYMBOLS', () => {
    it('should contain all 9 SI base unit symbols', () => {
      expect(SI_BASE_UNIT_SYMBOLS).toContain('m');
      expect(SI_BASE_UNIT_SYMBOLS).toContain('kg');
      expect(SI_BASE_UNIT_SYMBOLS).toContain('s');
      expect(SI_BASE_UNIT_SYMBOLS).toContain('A');
      expect(SI_BASE_UNIT_SYMBOLS).toContain('K');
      expect(SI_BASE_UNIT_SYMBOLS).toContain('mol');
      expect(SI_BASE_UNIT_SYMBOLS).toContain('cd');
      expect(SI_BASE_UNIT_SYMBOLS).toContain('rad');
      expect(SI_BASE_UNIT_SYMBOLS).toContain('sr');
    });

    it('should have exactly 9 symbols', () => {
      expect(SI_BASE_UNIT_SYMBOLS).toHaveLength(9);
    });
  });

  describe('SI_BASE_TO_DIMENSION', () => {
    it('should map all base unit symbols to dimensions', () => {
      expect(SI_BASE_TO_DIMENSION.m).toBe('length');
      expect(SI_BASE_TO_DIMENSION.kg).toBe('mass');
      expect(SI_BASE_TO_DIMENSION.s).toBe('time');
      expect(SI_BASE_TO_DIMENSION.A).toBe('current');
      expect(SI_BASE_TO_DIMENSION.K).toBe('temperature');
      expect(SI_BASE_TO_DIMENSION.mol).toBe('amount');
      expect(SI_BASE_TO_DIMENSION.cd).toBe('intensity');
      expect(SI_BASE_TO_DIMENSION.rad).toBe('angle');
      expect(SI_BASE_TO_DIMENSION.sr).toBe('solid_angle');
    });
  });

  describe('DIMENSION_TO_SI_SYMBOL', () => {
    it('should map all dimensions to SI symbols', () => {
      expect(DIMENSION_TO_SI_SYMBOL.length).toBe('m');
      expect(DIMENSION_TO_SI_SYMBOL.mass).toBe('kg');
      expect(DIMENSION_TO_SI_SYMBOL.time).toBe('s');
      expect(DIMENSION_TO_SI_SYMBOL.current).toBe('A');
      expect(DIMENSION_TO_SI_SYMBOL.temperature).toBe('K');
      expect(DIMENSION_TO_SI_SYMBOL.amount).toBe('mol');
      expect(DIMENSION_TO_SI_SYMBOL.intensity).toBe('cd');
      expect(DIMENSION_TO_SI_SYMBOL.angle).toBe('rad');
      expect(DIMENSION_TO_SI_SYMBOL.solid_angle).toBe('sr');
    });
  });

  describe('Type consistency', () => {
    it('CalcValue should have required properties', () => {
      const calcValue: CalcValue = {
        value: 42,
        dimensions: { length: 1 },
        prefix: 'k'
      };
      expect(calcValue.value).toBe(42);
      expect(calcValue.dimensions).toEqual({ length: 1 });
      expect(calcValue.prefix).toBe('k');
    });

    it('DerivedUnitInfo should have required properties', () => {
      const unitInfo: DerivedUnitInfo = {
        symbol: 'N',
        category: 'force',
        unitId: 'n',
        dimensions: { mass: 1, length: 1, time: -2 },
        allowPrefixes: true
      };
      expect(unitInfo.symbol).toBe('N');
      expect(unitInfo.category).toBe('force');
    });

    it('CategoryDimensionInfo should have required properties', () => {
      const catInfo: CategoryDimensionInfo = {
        name: 'Test',
        dimensions: { length: 1 },
        isBase: false
      };
      expect(catInfo.name).toBe('Test');
      expect(catInfo.isBase).toBe(false);
    });

    it('PreferredRepresentation should have required properties', () => {
      const rep: PreferredRepresentation = {
        displaySymbol: 'St',
        isSI: false,
        allowPrefixes: true
      };
      expect(rep.displaySymbol).toBe('St');
      expect(rep.isSI).toBe(false);
    });
  });
});
