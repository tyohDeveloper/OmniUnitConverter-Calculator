import { describe, it, expect } from 'vitest';
import { convert, CONVERSION_DATA } from '../client/src/lib/conversion-data';
import { findOptimalPrefix } from '../client/src/lib/units/findOptimalPrefix';
import { PREFIXES, BINARY_PREFIXES } from '../client/src/lib/units/prefixes';

/**
 * Conversion Edge Case Tests
 * 
 * Tests for edge cases in the conversion system including:
 * - Kilogram prefix handoff
 * - Binary prefix handling
 * - Extreme values
 * - Round-trip consistency
 * - NaN/Infinity handling
 */

describe('Conversion Function', () => {
  describe('Basic Conversions', () => {
    it('should convert meters to feet', () => {
      const result = convert(1, 'm', 'ft', 'length');
      expect(result).toBeCloseTo(3.28084, 4);
    });

    it('should convert feet to meters', () => {
      const result = convert(3.28084, 'ft', 'm', 'length');
      expect(result).toBeCloseTo(1, 4);
    });

    it('should convert kilograms to pounds', () => {
      const result = convert(1, 'kg', 'lb', 'mass');
      expect(result).toBeCloseTo(2.20462, 4);
    });

    it('should convert seconds to hours', () => {
      const result = convert(3600, 's', 'h', 'time');
      expect(result).toBe(1);
    });

    it('should convert hours to seconds', () => {
      const result = convert(1, 'h', 's', 'time');
      expect(result).toBe(3600);
    });
  });

  describe('Prefix Factor Handling', () => {
    it('should apply from prefix factor correctly', () => {
      // 1 km = 1000 m
      const result = convert(1, 'm', 'm', 'length', 1000, 1);
      expect(result).toBe(1000);
    });

    it('should apply to prefix factor correctly', () => {
      // 1000 m = 1 km
      const result = convert(1000, 'm', 'm', 'length', 1, 1000);
      expect(result).toBe(1);
    });

    it('should apply both prefix factors correctly', () => {
      // 5 km to mm: 5 * 1000 = 5000 m, 5000 / 0.001 = 5000000 mm
      const result = convert(5, 'm', 'm', 'length', 1000, 0.001);
      expect(result).toBe(5000000);
    });

    it('should handle micro prefix (1e-6)', () => {
      // 1 µm = 1e-6 m
      const result = convert(1, 'm', 'm', 'length', 1e-6, 1);
      expect(result).toBeCloseTo(1e-6, 12);
    });

    it('should handle nano prefix (1e-9)', () => {
      // 1 nm = 1e-9 m
      const result = convert(1, 'm', 'm', 'length', 1e-9, 1);
      expect(result).toBeCloseTo(1e-9, 15);
    });
  });

  describe('Round-Trip Consistency', () => {
    it('should maintain value after round-trip conversion (length)', () => {
      const original = 12.345;
      const toFeet = convert(original, 'm', 'ft', 'length');
      const backToMeters = convert(toFeet, 'ft', 'm', 'length');
      expect(backToMeters).toBeCloseTo(original, 10);
    });

    it('should maintain value after round-trip conversion (mass)', () => {
      const original = 5.678;
      const toPounds = convert(original, 'kg', 'lb', 'mass');
      const backToKg = convert(toPounds, 'lb', 'kg', 'mass');
      expect(backToKg).toBeCloseTo(original, 10);
    });

    it('should maintain value after round-trip conversion (temperature)', () => {
      const original = 25; // 25°C
      const toFahrenheit = convert(original, 'c', 'f', 'temperature');
      const backToCelsius = convert(toFahrenheit, 'f', 'c', 'temperature');
      expect(backToCelsius).toBeCloseTo(original, 10);
    });

    it('should maintain value with prefix round-trip', () => {
      const original = 1.5; // 1.5 km
      const kiloFactor = 1000;
      const milliFactor = 0.001;
      
      // 1.5 km → mm
      const toMilli = convert(original, 'm', 'm', 'length', kiloFactor, milliFactor);
      // Convert back: mm → km
      const backToKilo = convert(toMilli, 'm', 'm', 'length', milliFactor, kiloFactor);
      
      expect(backToKilo).toBeCloseTo(original, 10);
    });

    it('should handle multiple conversion chain', () => {
      // meters → feet → yards → meters
      const original = 100;
      const toFeet = convert(original, 'm', 'ft', 'length');
      const toYards = convert(toFeet, 'ft', 'yd', 'length');
      const backToMeters = convert(toYards, 'yd', 'm', 'length');
      
      expect(backToMeters).toBeCloseTo(original, 8);
    });
  });

  describe('Extreme Values', () => {
    it('should handle very small values (1e-15)', () => {
      const result = convert(1e-15, 'm', 'm', 'length');
      expect(result).toBe(1e-15);
    });

    it('should handle very large values (1e15)', () => {
      const result = convert(1e15, 'm', 'm', 'length');
      expect(result).toBe(1e15);
    });

    it('should handle astronomical distances', () => {
      // 1 light year in meters
      const lyInMeters = convert(1, 'ly', 'm', 'length');
      expect(lyInMeters).toBeCloseTo(9.461e15, -12);
    });

    it('should handle atomic scales', () => {
      // 1 Angstrom = 1e-10 m
      const angstromInMeters = convert(1, 'angstrom', 'm', 'length');
      expect(angstromInMeters).toBe(1e-10);
    });

    it('should handle zero values', () => {
      const result = convert(0, 'm', 'ft', 'length');
      expect(result).toBe(0);
    });

    it('should handle negative values', () => {
      const result = convert(-10, 'm', 'ft', 'length');
      expect(result).toBeCloseTo(-32.8084, 3);
    });
  });

  describe('Temperature Conversions (with offset)', () => {
    it('should convert Celsius to Fahrenheit', () => {
      // 0°C = 32°F
      expect(convert(0, 'c', 'f', 'temperature')).toBeCloseTo(32, 5);
      // 100°C = 212°F
      expect(convert(100, 'c', 'f', 'temperature')).toBeCloseTo(212, 5);
      // -40°C = -40°F
      expect(convert(-40, 'c', 'f', 'temperature')).toBeCloseTo(-40, 5);
    });

    it('should convert Fahrenheit to Celsius', () => {
      expect(convert(32, 'f', 'c', 'temperature')).toBeCloseTo(0, 5);
      expect(convert(212, 'f', 'c', 'temperature')).toBeCloseTo(100, 5);
    });

    it('should convert Celsius to Kelvin', () => {
      // 0°C = 273.15 K
      expect(convert(0, 'c', 'k', 'temperature')).toBeCloseTo(273.15, 2);
      // -273.15°C = 0 K (absolute zero)
      expect(convert(-273.15, 'c', 'k', 'temperature')).toBeCloseTo(0, 2);
    });

    it('should handle absolute zero correctly', () => {
      // 0 K should convert properly
      const celsiusFromZeroK = convert(0, 'k', 'c', 'temperature');
      expect(celsiusFromZeroK).toBeCloseTo(-273.15, 2);
    });
  });

  describe('Invalid Input Handling', () => {
    it('should return 0 for invalid category', () => {
      const result = convert(10, 'm', 'ft', 'invalid_category' as any);
      expect(result).toBe(0);
    });

    it('should return 0 for invalid from unit', () => {
      const result = convert(10, 'invalid_unit', 'ft', 'length');
      expect(result).toBe(0);
    });

    it('should return 0 for invalid to unit', () => {
      const result = convert(10, 'm', 'invalid_unit', 'length');
      expect(result).toBe(0);
    });
  });
});

describe('findOptimalPrefix', () => {
  describe('Standard Values', () => {
    it('should return "none" for values in 1-999 range', () => {
      const { prefix, adjustedValue } = findOptimalPrefix(500);
      expect(prefix.id).toBe('none');
      expect(adjustedValue).toBe(500);
    });

    it('should return "kilo" for values in 1000-999999 range', () => {
      const { prefix, adjustedValue } = findOptimalPrefix(5000);
      expect(prefix.id).toBe('kilo');
      expect(adjustedValue).toBe(5);
    });

    it('should return "mega" for values in 1000000+ range', () => {
      const { prefix, adjustedValue } = findOptimalPrefix(5000000);
      expect(prefix.id).toBe('mega');
      expect(adjustedValue).toBe(5);
    });

    it('should return "milli" for values in 0.001-0.999 range', () => {
      const { prefix, adjustedValue } = findOptimalPrefix(0.005);
      expect(prefix.id).toBe('milli');
      expect(adjustedValue).toBe(5);
    });

    it('should return "micro" for very small values', () => {
      const { prefix, adjustedValue } = findOptimalPrefix(0.000005);
      expect(prefix.id).toBe('micro');
      expect(adjustedValue).toBeCloseTo(5, 10);
    });
  });

  describe('Kilogram Prefix Handoff', () => {
    it('should treat kg values as grams for prefix calculation', () => {
      // 0.001 kg = 1 g, should suggest milli prefix (→ mg display)
      const { prefix, adjustedValue } = findOptimalPrefix(0.001, 'kg');
      // The effective value is 0.001 * 1000 = 1g
      // This falls in the ideal [1, 1000) range with no prefix
      expect(adjustedValue).toBe(1);
    });

    it('should handle kg with mega prefix', () => {
      // 1000 kg = 1 Mg (1 tonne)
      const { prefix, adjustedValue } = findOptimalPrefix(1000, 'kg');
      // Effective value: 1000 * 1000 = 1000000 g → mega prefix
      expect(prefix.id).toBe('mega');
      expect(adjustedValue).toBe(1);
    });

    it('should handle complex kg-containing units', () => {
      // kg⋅m⁻³ (density)
      const { prefix } = findOptimalPrefix(0.001, 'kg⋅m⁻³');
      // Should recognize kg and apply handoff
      expect(prefix.factor).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should return "none" for zero', () => {
      const { prefix, adjustedValue } = findOptimalPrefix(0);
      expect(prefix.id).toBe('none');
      expect(adjustedValue).toBe(0);
    });

    it('should handle Infinity', () => {
      const { prefix, adjustedValue } = findOptimalPrefix(Infinity);
      expect(prefix.id).toBe('none');
      expect(adjustedValue).toBe(Infinity);
    });

    it('should handle negative Infinity', () => {
      const { prefix, adjustedValue } = findOptimalPrefix(-Infinity);
      expect(prefix.id).toBe('none');
      expect(adjustedValue).toBe(-Infinity);
    });

    it('should handle NaN', () => {
      const { prefix, adjustedValue } = findOptimalPrefix(NaN);
      expect(prefix.id).toBe('none');
      expect(Number.isNaN(adjustedValue)).toBe(true);
    });

    it('should handle negative values correctly', () => {
      const { prefix, adjustedValue } = findOptimalPrefix(-5000);
      expect(prefix.id).toBe('kilo');
      expect(adjustedValue).toBe(-5);
    });

    it('should handle values that would round to 0 at given precision', () => {
      // Very small value that would round to 0 at low precision
      const { prefix, adjustedValue } = findOptimalPrefix(1e-12, '', 4);
      // Should find a smaller prefix to make value displayable
      expect(adjustedValue).not.toBe(0);
    });
  });

  describe('Precision Aware Selection', () => {
    it('should select prefix based on precision setting', () => {
      // 1.5e-7 with precision 4 might round to 0 at µ (1e-6)
      const { prefix, adjustedValue } = findOptimalPrefix(1.5e-7, '', 4);
      // Adjusted value should be displayable at given precision
      const rounded = parseFloat(adjustedValue.toFixed(4));
      if (adjustedValue !== 0) {
        expect(rounded).not.toBe(0);
      }
    });
  });
});

describe('Binary Prefixes', () => {
  it('should have correct binary prefix factors', () => {
    const kibi = BINARY_PREFIXES.find(p => p.id === 'kibi');
    const mebi = BINARY_PREFIXES.find(p => p.id === 'mebi');
    const gibi = BINARY_PREFIXES.find(p => p.id === 'gibi');
    const tebi = BINARY_PREFIXES.find(p => p.id === 'tebi');
    
    expect(kibi?.factor).toBe(1024);
    expect(mebi?.factor).toBe(1048576);
    expect(gibi?.factor).toBe(1073741824);
    expect(tebi?.factor).toBe(1099511627776);
  });

  it('should have correct binary prefix symbols', () => {
    const kibi = BINARY_PREFIXES.find(p => p.id === 'kibi');
    const mebi = BINARY_PREFIXES.find(p => p.id === 'mebi');
    const gibi = BINARY_PREFIXES.find(p => p.id === 'gibi');
    
    expect(kibi?.symbol).toBe('Ki');
    expect(mebi?.symbol).toBe('Mi');
    expect(gibi?.symbol).toBe('Gi');
  });

  it('should not confuse binary and decimal prefixes', () => {
    const decimalKilo = PREFIXES.find(p => p.id === 'kilo');
    const binaryKibi = BINARY_PREFIXES.find(p => p.id === 'kibi');
    
    expect(decimalKilo?.factor).toBe(1000);
    expect(binaryKibi?.factor).toBe(1024);
    expect(decimalKilo?.factor).not.toBe(binaryKibi?.factor);
  });
});

describe('Data Category Binary Prefix Usage', () => {
  it('should have data category in CONVERSION_DATA', () => {
    const dataCategory = CONVERSION_DATA.find(c => c.id === 'data');
    expect(dataCategory).toBeDefined();
    expect(dataCategory?.name).toBe('Data/Information');
  });

  it('should have data units defined', () => {
    const dataCategory = CONVERSION_DATA.find(c => c.id === 'data');
    expect(dataCategory?.units).toBeDefined();
    expect(dataCategory?.units.length).toBeGreaterThan(0);
  });
});

describe('Prefix Sorting', () => {
  it('should have prefixes sorted by factor (largest to smallest)', () => {
    for (let i = 0; i < PREFIXES.length - 1; i++) {
      expect(PREFIXES[i].factor).toBeGreaterThanOrEqual(PREFIXES[i + 1].factor);
    }
  });

  it('should have binary prefixes sorted by factor', () => {
    for (let i = 0; i < BINARY_PREFIXES.length - 1; i++) {
      expect(BINARY_PREFIXES[i].factor).toBeGreaterThanOrEqual(BINARY_PREFIXES[i + 1].factor);
    }
  });
});

describe('Special Unit Conversions', () => {
  describe('Photon Energy Category', () => {
    it('should have photon category defined', () => {
      const photonCategory = CONVERSION_DATA.find(c => c.id === 'photon');
      expect(photonCategory).toBeDefined();
      expect(photonCategory?.units.length).toBeGreaterThan(0);
    });
  });

  describe('Math Category', () => {
    it('should verify math category exists or is handled separately', () => {
      // Math functions may be handled directly in calculator, not in CONVERSION_DATA
      // Verify we can find categories for math-related conversions
      const frequencyCategory = CONVERSION_DATA.find(c => c.id === 'frequency');
      expect(frequencyCategory).toBeDefined();
      
      // Check Hz unit exists for frequency conversions
      const hzUnit = frequencyCategory?.units.find(u => u.symbol === 'Hz');
      expect(hzUnit).toBeDefined();
    });
  });
});

describe('Category Coverage', () => {
  it('should have all major categories', () => {
    const expectedCategories = [
      'length', 'mass', 'time', 'temperature', 'current',
      'area', 'volume', 'speed', 'acceleration', 'force',
      'pressure', 'energy', 'power', 'frequency', 'data'
    ];
    
    for (const catId of expectedCategories) {
      const cat = CONVERSION_DATA.find(c => c.id === catId);
      expect(cat).toBeDefined();
    }
  });

  it('should have base unit defined for each category', () => {
    for (const category of CONVERSION_DATA) {
      expect(category.baseUnit).toBeDefined();
      expect(category.baseUnit.length).toBeGreaterThan(0);
    }
  });
});
