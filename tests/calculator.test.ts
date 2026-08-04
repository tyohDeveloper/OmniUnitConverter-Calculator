import { describe, it, expect } from 'vitest';
// §3.8: no barrels. Every symbol imported from its owner file.
import { dimensionsEqual } from '../client/src/lib/dimensions/dimensionsEqual';
import { isDimensionless } from '../client/src/lib/dimensions/isDimensionless';
import { multiplyDimensions } from '../client/src/lib/dimensions/multiplyDimensions';
import { divideDimensions } from '../client/src/lib/dimensions/divideDimensions';
import { findCrossDomainMatches } from '../client/src/lib/si-representations/findCrossDomainMatches';
import { isValidSymbolRepresentation } from '../client/src/lib/unit-symbols/isValidSymbolRepresentation';
import { countUnits } from '../client/src/lib/unit-symbols/countUnits';
import { formatDimensions } from '../client/src/lib/unit-symbols/formatDimensions';
import { SI_DERIVED_UNITS } from '../client/src/lib/units/siDerivedUnitsCatalog';
import { CATEGORY_DIMENSIONS } from '../client/src/lib/units/categoryDimensions';
import type { DimensionalFormula } from '../client/src/lib/units/dimensionalFormula';

describe('Dimensional Formula Operations', () => {
  describe('dimensionsEqual', () => {
    it('should return true for identical dimensions', () => {
      const d1: DimensionalFormula = { mass: 1, length: 2, time: -2 };
      const d2: DimensionalFormula = { mass: 1, length: 2, time: -2 };
      expect(dimensionsEqual(d1, d2)).toBe(true);
    });

    it('should return true for equivalent dimensions with different key orders', () => {
      const d1: DimensionalFormula = { length: 2, mass: 1, time: -2 };
      const d2: DimensionalFormula = { mass: 1, time: -2, length: 2 };
      expect(dimensionsEqual(d1, d2)).toBe(true);
    });

    it('should return false for different dimensions', () => {
      const d1: DimensionalFormula = { mass: 1, length: 2, time: -2 };
      const d2: DimensionalFormula = { mass: 1, length: 1, time: -2 };
      expect(dimensionsEqual(d1, d2)).toBe(false);
    });

    it('should return false for different number of dimensions', () => {
      const d1: DimensionalFormula = { mass: 1, length: 2 };
      const d2: DimensionalFormula = { mass: 1, length: 2, time: -2 };
      expect(dimensionsEqual(d1, d2)).toBe(false);
    });

    it('should treat zero exponents as non-existent', () => {
      const d1: DimensionalFormula = { mass: 1, length: 0 };
      const d2: DimensionalFormula = { mass: 1 };
      expect(dimensionsEqual(d1, d2)).toBe(true);
    });

    it('should return true for empty dimensions', () => {
      const d1: DimensionalFormula = {};
      const d2: DimensionalFormula = {};
      expect(dimensionsEqual(d1, d2)).toBe(true);
    });

    it('should match Energy dimensions (kg⋅m²⋅s⁻²)', () => {
      const energy: DimensionalFormula = { mass: 1, length: 2, time: -2 };
      const joule = SI_DERIVED_UNITS.find(u => u.symbol === 'J')!;
      expect(dimensionsEqual(energy, joule.dimensions)).toBe(true);
    });

    it('should match Frequency dimensions (s⁻¹) with Becquerel', () => {
      const frequency: DimensionalFormula = { time: -1 };
      const bq = SI_DERIVED_UNITS.find(u => u.symbol === 'Bq')!;
      expect(dimensionsEqual(frequency, bq.dimensions)).toBe(true);
    });
  });

  describe('isDimensionless', () => {
    it('should return true for empty dimensions', () => {
      expect(isDimensionless({})).toBe(true);
    });

    it('should return true for all-zero dimensions', () => {
      expect(isDimensionless({ mass: 0, length: 0 })).toBe(true);
    });

    it('should return false for non-empty dimensions', () => {
      expect(isDimensionless({ mass: 1 })).toBe(false);
    });

    it('should return false for Energy dimensions', () => {
      expect(isDimensionless({ mass: 1, length: 2, time: -2 })).toBe(false);
    });
  });

  describe('multiplyDimensions', () => {
    it('should multiply Force × Length = Energy/Torque dimensions', () => {
      const force: DimensionalFormula = { mass: 1, length: 1, time: -2 };
      const length: DimensionalFormula = { length: 1 };
      const result = multiplyDimensions(force, length);
      expect(dimensionsEqual(result, { mass: 1, length: 2, time: -2 })).toBe(true);
    });

    it('should multiply Energy × Time = Angular Momentum dimensions', () => {
      const energy: DimensionalFormula = { mass: 1, length: 2, time: -2 };
      const time: DimensionalFormula = { time: 1 };
      const result = multiplyDimensions(energy, time);
      expect(dimensionsEqual(result, { mass: 1, length: 2, time: -1 })).toBe(true);
    });

    it('should cancel out inverse dimensions', () => {
      const velocity: DimensionalFormula = { length: 1, time: -1 };
      const time: DimensionalFormula = { time: 1 };
      const result = multiplyDimensions(velocity, time);
      expect(dimensionsEqual(result, { length: 1 })).toBe(true);
    });

    it('should handle empty dimensions', () => {
      const mass: DimensionalFormula = { mass: 1 };
      const empty: DimensionalFormula = {};
      const result = multiplyDimensions(mass, empty);
      expect(dimensionsEqual(result, { mass: 1 })).toBe(true);
    });
  });

  describe('divideDimensions', () => {
    it('should divide Energy / Time = Power dimensions', () => {
      const energy: DimensionalFormula = { mass: 1, length: 2, time: -2 };
      const time: DimensionalFormula = { time: 1 };
      const result = divideDimensions(energy, time);
      expect(dimensionsEqual(result, { mass: 1, length: 2, time: -3 })).toBe(true);
    });

    it('should divide Force / Area = Pressure dimensions', () => {
      const force: DimensionalFormula = { mass: 1, length: 1, time: -2 };
      const area: DimensionalFormula = { length: 2 };
      const result = divideDimensions(force, area);
      expect(dimensionsEqual(result, { mass: 1, length: -1, time: -2 })).toBe(true);
    });

    it('should divide Length / Time = Speed dimensions', () => {
      const length: DimensionalFormula = { length: 1 };
      const time: DimensionalFormula = { time: 1 };
      const result = divideDimensions(length, time);
      expect(dimensionsEqual(result, { length: 1, time: -1 })).toBe(true);
    });
  });
});

describe('Cross-Domain Matching', () => {
  describe('findCrossDomainMatches', () => {
    it('should find all matching categories for Energy dimensions (including Energy)', () => {
      const energyDims: DimensionalFormula = { mass: 1, length: 2, time: -2 };
      const matches = findCrossDomainMatches(energyDims, 'energy');
      expect(matches).toContain('Energy');
      expect(matches).toContain('Torque');
      expect(matches).toContain('Photon Energy');
    });

    it('should find all matching categories for Torque dimensions (including Torque)', () => {
      const torqueDims: DimensionalFormula = { mass: 1, length: 2, time: -2 };
      const matches = findCrossDomainMatches(torqueDims, 'torque');
      expect(matches).toContain('Energy');
      expect(matches).toContain('Torque');
      expect(matches).toContain('Photon Energy');
    });

    it('should find all matching categories for Frequency dimensions (including Frequency)', () => {
      const frequencyDims: DimensionalFormula = { time: -1 };
      const matches = findCrossDomainMatches(frequencyDims, 'frequency');
      expect(matches).toContain('Frequency');
      expect(matches).toContain('Radioactivity');
      expect(matches).toContain('Radioactive Decay');
    });

    it('should find all matching categories for Pressure dimensions (including Pressure)', () => {
      const pressureDims: DimensionalFormula = { mass: 1, length: -1, time: -2 };
      const matches = findCrossDomainMatches(pressureDims, 'pressure');
      expect(matches).toContain('Pressure');
      expect(matches).toContain('Sound Pressure');
    });

    it('finds Radiation Dose and Equivalent Dose for absorbed-dose dimensions; Absorbed Dose itself has no JSON so is skipped by the family filter', () => {
      const doseDims: DimensionalFormula = { length: 2, time: -2 };
      const matches = findCrossDomainMatches(doseDims, 'absorbed_dose');
      expect(matches).toContain('Radiation Dose');
      expect(matches).toContain('Equivalent Dose');
      // Absorbed Dose is a ghost CATEGORY_DIMENSIONS entry (no JSON,
      // undefined family) so the family-based filter skips it.
      expect(matches).not.toContain('Absorbed Dose');
    });

    it('should return empty array for base quantity dimensions (no derived categories exist)', () => {
      const lengthDims: DimensionalFormula = { length: 1 };
      const matches = findCrossDomainMatches(lengthDims, 'length');
      // Length is a base quantity (isBase: true), so it's excluded
      // No other derived category has pure { length: 1 } dimensions
      expect(matches).toHaveLength(0);
      expect(matches).not.toContain('Length');
    });

    it('should return empty array for dimensionless quantities', () => {
      const matches = findCrossDomainMatches({}, 'math');
      expect(matches).toHaveLength(0);
    });

    it('should NOT include Fuel Energy in cross-domain matches (excluded category)', () => {
      const energyDims: DimensionalFormula = { mass: 1, length: 2, time: -2 };
      const matches = findCrossDomainMatches(energyDims, 'energy');
      expect(matches).not.toContain('Fuel Energy');
    });

    it('should not include base quantities in matches', () => {
      const lengthDims: DimensionalFormula = { length: 1 };
      const matches = findCrossDomainMatches(lengthDims);
      const baseNames = ['Length', 'Mass', 'Time', 'Electric Current', 'Temperature', 
                         'Amount of Substance', 'Luminous Intensity', 'Plane Angle', 'Solid Angle'];
      for (const baseName of baseNames) {
        expect(matches).not.toContain(baseName);
      }
    });
  });

  describe('CATEGORY_DIMENSIONS coverage', () => {
    it('should have all SI derived unit categories mapped', () => {
      const siCategories = ['frequency', 'force', 'pressure', 'energy', 'power', 
                           'charge', 'potential', 'capacitance', 'resistance', 
                           'conductance', 'magnetic_flux', 'magnetic_density', 
                           'inductance', 'radioactivity', 'absorbed_dose', 'equivalent_dose'];
      for (const cat of siCategories) {
        expect(CATEGORY_DIMENSIONS[cat]).toBeDefined();
      }
    });

    it('should have correct dimensions for Energy category', () => {
      expect(dimensionsEqual(
        CATEGORY_DIMENSIONS.energy.dimensions,
        { mass: 1, length: 2, time: -2 }
      )).toBe(true);
    });

    it('should have correct dimensions for Power category', () => {
      expect(dimensionsEqual(
        CATEGORY_DIMENSIONS.power.dimensions,
        { mass: 1, length: 2, time: -3 }
      )).toBe(true);
    });

    it('should have correct dimensions for Pressure category', () => {
      expect(dimensionsEqual(
        CATEGORY_DIMENSIONS.pressure.dimensions,
        { mass: 1, length: -1, time: -2 }
      )).toBe(true);
    });

    it('should mark base quantities as isBase: true', () => {
      const baseCategories = ['length', 'mass', 'time', 'current', 'temperature', 
                              'amount', 'intensity', 'angle', 'solid_angle'];
      for (const cat of baseCategories) {
        expect(CATEGORY_DIMENSIONS[cat].isBase).toBe(true);
      }
    });

    it('should mark derived quantities as isBase: false', () => {
      const derivedCategories = ['energy', 'power', 'force', 'pressure', 'torque'];
      for (const cat of derivedCategories) {
        expect(CATEGORY_DIMENSIONS[cat].isBase).toBe(false);
      }
    });
  });
});

describe('Symbol Representation Validation', () => {
  describe('isValidSymbolRepresentation', () => {
    it('should accept single SI unit symbols', () => {
      expect(isValidSymbolRepresentation('J')).toBe(true);
      expect(isValidSymbolRepresentation('W')).toBe(true);
      expect(isValidSymbolRepresentation('N')).toBe(true);
    });

    it('should accept base unit compositions', () => {
      expect(isValidSymbolRepresentation('kg⋅m²⋅s⁻²')).toBe(true);
      expect(isValidSymbolRepresentation('m⋅s⁻¹')).toBe(true);
      expect(isValidSymbolRepresentation('A⋅s')).toBe(true);
    });

    it('should accept hybrid compositions', () => {
      expect(isValidSymbolRepresentation('N⋅m')).toBe(true);
      expect(isValidSymbolRepresentation('J⋅s⁻¹')).toBe(true);
      expect(isValidSymbolRepresentation('W⋅m⁻²')).toBe(true);
    });

    it('should reject duplicate base units', () => {
      expect(isValidSymbolRepresentation('rad⋅rad⁻²')).toBe(false);
      expect(isValidSymbolRepresentation('m⋅m²')).toBe(false);
      expect(isValidSymbolRepresentation('s⋅s⁻¹')).toBe(false);
    });

    it('should accept dimensionless (1)', () => {
      expect(isValidSymbolRepresentation('1')).toBe(true);
    });

    it('should accept empty string', () => {
      expect(isValidSymbolRepresentation('')).toBe(true);
    });

    it('should accept complex valid compositions', () => {
      expect(isValidSymbolRepresentation('kg⋅m⋅s⁻²')).toBe(true);
      expect(isValidSymbolRepresentation('V⋅A⁻¹')).toBe(true);
    });
  });

  describe('countUnits', () => {
    it('should count single units correctly', () => {
      expect(countUnits('J')).toBe(1);
      expect(countUnits('W')).toBe(1);
      expect(countUnits('kg')).toBe(1);
    });

    it('should count multiple units correctly', () => {
      expect(countUnits('kg⋅m²⋅s⁻²')).toBe(3);
      expect(countUnits('N⋅m')).toBe(2);
      expect(countUnits('J⋅s⁻¹')).toBe(2);
    });

    it('should return 0 for dimensionless', () => {
      expect(countUnits('1')).toBe(0);
      expect(countUnits('')).toBe(0);
    });

    it('should count complex expressions correctly', () => {
      expect(countUnits('kg⋅m⋅s⁻¹⋅A⁻¹')).toBe(4);
    });
  });
});

describe('Dimension Formatting', () => {
  describe('formatDimensions', () => {
    it('should format Energy dimensions correctly', () => {
      const energy: DimensionalFormula = { mass: 1, length: 2, time: -2 };
      expect(formatDimensions(energy)).toBe('kg⋅m²⋅s⁻²');
    });

    it('should format Force dimensions correctly', () => {
      const force: DimensionalFormula = { mass: 1, length: 1, time: -2 };
      expect(formatDimensions(force)).toBe('kg⋅m⋅s⁻²');
    });

    it('should format Velocity dimensions correctly', () => {
      const velocity: DimensionalFormula = { length: 1, time: -1 };
      expect(formatDimensions(velocity)).toBe('m⋅s⁻¹');
    });

    it('should format Charge dimensions correctly', () => {
      const charge: DimensionalFormula = { current: 1, time: 1 };
      expect(formatDimensions(charge)).toBe('s⋅A');
    });

    it('should format single dimensions correctly', () => {
      expect(formatDimensions({ mass: 1 })).toBe('kg');
      expect(formatDimensions({ length: 2 })).toBe('m²');
      expect(formatDimensions({ time: -1 })).toBe('s⁻¹');
    });

    it('should return empty string for dimensionless', () => {
      expect(formatDimensions({})).toBe('');
    });

    it('should format Power dimensions correctly', () => {
      const power: DimensionalFormula = { mass: 1, length: 2, time: -3 };
      expect(formatDimensions(power)).toBe('kg⋅m²⋅s⁻³');
    });

    it('should format complex dimensions with proper ordering', () => {
      const complex: DimensionalFormula = { time: -3, length: 2, mass: 1, current: -1 };
      const result = formatDimensions(complex);
      expect(result).toContain('kg');
      expect(result).toContain('m²');
      expect(result).toContain('s⁻³');
      expect(result).toContain('A⁻¹');
    });
  });
});

describe('SI Derived Units Catalog', () => {
  it('should have all named SI derived units including Hz (canonical catalog)', () => {
    // Hz is included in the canonical SI_DERIVED_UNITS catalog.
    // Internal calculator logic that needs to exclude Hz uses GENERAL_SI_DERIVED filter.
    const expectedSymbols = ['Hz', 'N', 'Pa', 'J', 'W', 'C', 'V', 'F', 'Ω', 'S', 
                             'Wb', 'T', 'H', 'lm', 'lx', 'Bq', 'Gy', 'Sv', 'kat', 'rad', 'sr'];
    for (const symbol of expectedSymbols) {
      expect(SI_DERIVED_UNITS.find(u => u.symbol === symbol)).toBeDefined();
    }
  });

  it('should NOT contain CGS units (St, rayl)', () => {
    expect(SI_DERIVED_UNITS.find(u => u.symbol === 'St')).toBeUndefined();
    expect(SI_DERIVED_UNITS.find(u => u.symbol === 'rayl')).toBeUndefined();
  });

  it('should have correct dimensions for Joule', () => {
    const joule = SI_DERIVED_UNITS.find(u => u.symbol === 'J')!;
    expect(dimensionsEqual(joule.dimensions, { mass: 1, length: 2, time: -2 })).toBe(true);
  });

  it('should have correct dimensions for Watt', () => {
    const watt = SI_DERIVED_UNITS.find(u => u.symbol === 'W')!;
    expect(dimensionsEqual(watt.dimensions, { mass: 1, length: 2, time: -3 })).toBe(true);
  });

  it('should have correct dimensions for Newton', () => {
    const newton = SI_DERIVED_UNITS.find(u => u.symbol === 'N')!;
    expect(dimensionsEqual(newton.dimensions, { mass: 1, length: 1, time: -2 })).toBe(true);
  });

  it('should have correct dimensions for Pascal', () => {
    const pascal = SI_DERIVED_UNITS.find(u => u.symbol === 'Pa')!;
    expect(dimensionsEqual(pascal.dimensions, { mass: 1, length: -1, time: -2 })).toBe(true);
  });

  it('should have correct dimensions for Volt', () => {
    const volt = SI_DERIVED_UNITS.find(u => u.symbol === 'V')!;
    expect(dimensionsEqual(volt.dimensions, { mass: 1, length: 2, time: -3, current: -1 })).toBe(true);
  });

  it('should have correct dimensions for Ohm', () => {
    const ohm = SI_DERIVED_UNITS.find(u => u.symbol === 'Ω')!;
    expect(dimensionsEqual(ohm.dimensions, { mass: 1, length: 2, time: -3, current: -2 })).toBe(true);
  });

  it('should have rad and sr for geometric units', () => {
    const rad = SI_DERIVED_UNITS.find(u => u.symbol === 'rad')!;
    const sr = SI_DERIVED_UNITS.find(u => u.symbol === 'sr')!;
    expect(dimensionsEqual(rad.dimensions, { angle: 1 })).toBe(true);
    expect(dimensionsEqual(sr.dimensions, { solid_angle: 1 })).toBe(true);
  });
});
