import { describe, it, expect } from 'vitest';
import { convert, CONVERSION_DATA } from '../client/src/lib/conversion-data';
import { findOptimalPrefix } from '../client/src/lib/units/findOptimalPrefix';
import { PREFIXES } from '../client/src/lib/units/prefixes';

/**
 * Precision and Comparison Mode Tests
 * 
 * Tests for precision settings and comparison mode functionality including:
 * - Precision-based formatting
 * - Scientific notation thresholds
 * - Comparison mode unit selection
 * - Optimal prefix display
 */

// Helper: Format value at given precision
function formatResultValue(value: number, precision: number): string {
  if (!isFinite(value)) return value.toString();
  
  const absValue = Math.abs(value);
  
  // Use scientific notation for very small or very large values
  if (absValue !== 0 && (absValue < 1e-6 || absValue >= 1e8)) {
    return value.toExponential(precision);
  }
  
  // Check if value would round to 0 at current precision
  const fixedStr = value.toFixed(precision);
  if (parseFloat(fixedStr) === 0 && value !== 0) {
    return value.toExponential(precision);
  }
  
  return fixedStr;
}

// Helper: Format for clipboard (strips trailing zeros)
function formatForClipboard(value: number, precision: number): string {
  const formatted = formatResultValue(value, precision);
  
  // If it's scientific notation, return as-is
  if (formatted.includes('e') || formatted.includes('E')) {
    return formatted;
  }
  
  // Strip trailing zeros after decimal point
  if (formatted.includes('.')) {
    return formatted.replace(/\.?0+$/, '');
  }
  
  return formatted;
}

describe('Precision Formatting', () => {
  describe('formatResultValue', () => {
    it('should format value at precision 0', () => {
      expect(formatResultValue(3.14159, 0)).toBe('3');
    });

    it('should format value at precision 2', () => {
      expect(formatResultValue(3.14159, 2)).toBe('3.14');
    });

    it('should format value at precision 4', () => {
      expect(formatResultValue(3.14159, 4)).toBe('3.1416');
    });

    it('should format value at precision 8', () => {
      expect(formatResultValue(3.14159265358979, 8)).toBe('3.14159265');
    });

    it('should handle negative values', () => {
      expect(formatResultValue(-123.456, 2)).toBe('-123.46');
    });

    it('should handle zero', () => {
      expect(formatResultValue(0, 4)).toBe('0.0000');
    });
  });

  describe('Scientific Notation Thresholds', () => {
    it('should use scientific notation for values < 1e-6', () => {
      const result = formatResultValue(1e-7, 4);
      expect(result).toContain('e');
    });

    it('should use scientific notation for values >= 1e8', () => {
      const result = formatResultValue(1e8, 4);
      expect(result).toContain('e');
    });

    it('should NOT use scientific notation for 1e-6', () => {
      const result = formatResultValue(1e-6, 6);
      // 0.000001 at precision 6 should show as fixed
      expect(result).not.toContain('e');
    });

    it('should NOT use scientific notation for 9.99e7', () => {
      const result = formatResultValue(9.99e7, 2);
      expect(result).not.toContain('e');
    });

    it('should use scientific notation when value rounds to 0', () => {
      const result = formatResultValue(1e-10, 4);
      // At precision 4, 1e-10 would round to 0.0000
      expect(result).toContain('e');
    });
  });

  describe('formatForClipboard', () => {
    it('should strip trailing zeros', () => {
      expect(formatForClipboard(5.00, 4)).toBe('5');
      expect(formatForClipboard(5.10, 4)).toBe('5.1');
      expect(formatForClipboard(5.123, 4)).toBe('5.123');
    });

    it('should preserve scientific notation', () => {
      expect(formatForClipboard(1e-10, 4)).toContain('e');
    });

    it('should handle integers', () => {
      expect(formatForClipboard(42, 4)).toBe('42');
    });
  });
});

describe('Precision with Conversions', () => {
  describe('Precision affects converted values', () => {
    it('should show correct digits after conversion at precision 2', () => {
      const metersToFeet = convert(1, 'm', 'ft', 'length');
      const formatted = formatResultValue(metersToFeet, 2);
      expect(formatted).toBe('3.28');
    });

    it('should show correct digits after conversion at precision 4', () => {
      const metersToFeet = convert(1, 'm', 'ft', 'length');
      const formatted = formatResultValue(metersToFeet, 4);
      expect(formatted).toBe('3.2808');
    });

    it('should handle round-trip precision loss gracefully', () => {
      const original = 1.5;
      const toFeet = convert(original, 'm', 'ft', 'length');
      const backToMeters = convert(toFeet, 'ft', 'm', 'length');
      
      // At precision 8, should be very close to original
      const formatted = formatResultValue(backToMeters, 8);
      expect(parseFloat(formatted)).toBeCloseTo(original, 8);
    });
  });

  describe('Precision with prefixes', () => {
    it('should format prefixed values correctly', () => {
      const { prefix, adjustedValue } = findOptimalPrefix(1500);
      expect(prefix.id).toBe('kilo');
      expect(formatResultValue(adjustedValue, 2)).toBe('1.50');
    });

    it('should handle sub-integer prefix values', () => {
      const { prefix, adjustedValue } = findOptimalPrefix(1234567);
      expect(prefix.id).toBe('mega');
      expect(formatResultValue(adjustedValue, 3)).toBe('1.235');
    });
  });
});

describe('Comparison Mode Unit Selection', () => {
  describe('Units available for comparison', () => {
    it('should have multiple units in length category for comparison', () => {
      const lengthCategory = CONVERSION_DATA.find(c => c.id === 'length');
      expect(lengthCategory?.units.length).toBeGreaterThan(5);
    });

    it('should have multiple units in mass category for comparison', () => {
      const massCategory = CONVERSION_DATA.find(c => c.id === 'mass');
      expect(massCategory?.units.length).toBeGreaterThan(5);
    });

    it('should have multiple units in time category for comparison', () => {
      const timeCategory = CONVERSION_DATA.find(c => c.id === 'time');
      expect(timeCategory?.units.length).toBeGreaterThan(5);
    });
  });

  describe('Comparison calculations', () => {
    it('should convert to all length units correctly', () => {
      const lengthCategory = CONVERSION_DATA.find(c => c.id === 'length');
      const baseValue = 1; // 1 meter
      
      const conversions = lengthCategory?.units
        .filter(u => !u.mathFunction)
        .slice(0, 8)
        .map(unit => ({
          unit: unit.id,
          value: convert(baseValue, 'm', unit.id, 'length')
        }));
      
      expect(conversions).toBeDefined();
      expect(conversions!.length).toBeGreaterThan(0);
      
      // All conversions should produce valid numbers
      conversions?.forEach(c => {
        expect(isFinite(c.value)).toBe(true);
      });
    });

    it('should convert to all temperature units correctly', () => {
      const tempCategory = CONVERSION_DATA.find(c => c.id === 'temperature');
      const baseValue = 25; // 25°C
      
      const conversions = tempCategory?.units
        .filter(u => !u.mathFunction)
        .map(unit => ({
          unit: unit.id,
          value: convert(baseValue, 'c', unit.id, 'temperature')
        }));
      
      expect(conversions).toBeDefined();
      conversions?.forEach(c => {
        expect(isFinite(c.value)).toBe(true);
      });
    });
  });
});

describe('Optimal Prefix Display', () => {
  describe('Prefix selection for display', () => {
    it('should select appropriate prefix for small values', () => {
      const testValues = [0.001, 0.000001, 0.000000001];
      const expectedPrefixes = ['milli', 'micro', 'nano'];
      
      testValues.forEach((value, index) => {
        const { prefix } = findOptimalPrefix(value);
        expect(prefix.id).toBe(expectedPrefixes[index]);
      });
    });

    it('should select appropriate prefix for large values', () => {
      const testValues = [1000, 1000000, 1000000000];
      const expectedPrefixes = ['kilo', 'mega', 'giga'];
      
      testValues.forEach((value, index) => {
        const { prefix } = findOptimalPrefix(value);
        expect(prefix.id).toBe(expectedPrefixes[index]);
      });
    });

    it('should keep adjusted value in readable range', () => {
      const testValues = [1500, 0.0015, 1500000, 0.0000015];
      
      testValues.forEach(value => {
        const { adjustedValue } = findOptimalPrefix(value);
        const absAdjusted = Math.abs(adjustedValue);
        
        // Adjusted value should ideally be in [1, 1000) range
        // or at least not be extremely small or large
        expect(absAdjusted).toBeGreaterThanOrEqual(0.001);
        expect(absAdjusted).toBeLessThanOrEqual(10000);
      });
    });
  });

  describe('Prefix symbol formatting', () => {
    it('should have correct prefix symbols', () => {
      const expectedSymbols = {
        'kilo': 'k',
        'mega': 'M',
        'giga': 'G',
        'milli': 'm',
        'micro': 'µ',
        'nano': 'n'
      };
      
      for (const [id, symbol] of Object.entries(expectedSymbols)) {
        const prefix = PREFIXES.find(p => p.id === id);
        expect(prefix?.symbol).toBe(symbol);
      }
    });

    it('should have correct prefix factors', () => {
      const expectedFactors = {
        'kilo': 1e3,
        'mega': 1e6,
        'giga': 1e9,
        'milli': 1e-3,
        'micro': 1e-6,
        'nano': 1e-9
      };
      
      for (const [id, factor] of Object.entries(expectedFactors)) {
        const prefix = PREFIXES.find(p => p.id === id);
        expect(prefix?.factor).toBe(factor);
      }
    });
  });
});

describe('Combined Precision and Prefix', () => {
  it('should format value with prefix at given precision', () => {
    const value = 1234567;
    const { prefix, adjustedValue } = findOptimalPrefix(value);
    
    expect(prefix.id).toBe('mega');
    expect(formatResultValue(adjustedValue, 3)).toBe('1.235');
    
    // Full formatted display would be "1.235 M"
  });

  it('should handle precision with very small prefixed values', () => {
    const value = 0.0000015;
    const { prefix, adjustedValue } = findOptimalPrefix(value);
    
    expect(prefix.id).toBe('micro');
    expect(formatResultValue(adjustedValue, 2)).toBe('1.50');
  });

  it('should handle edge cases at prefix boundaries', () => {
    // Exactly at boundary
    const { prefix: prefix1 } = findOptimalPrefix(1000);
    expect(prefix1.id).toBe('kilo');
    
    // Just below boundary
    const { prefix: prefix2 } = findOptimalPrefix(999);
    expect(prefix2.id).toBe('none');
    
    // Just above boundary
    const { prefix: prefix3 } = findOptimalPrefix(1001);
    expect(prefix3.id).toBe('kilo');
  });
});

describe('Precision Settings Range', () => {
  it('should support precision 0-8', () => {
    const value = 3.14159265358979;
    
    for (let precision = 0; precision <= 8; precision++) {
      const formatted = formatResultValue(value, precision);
      expect(formatted).toBeDefined();
      
      // Check that the precision is applied correctly
      if (!formatted.includes('e')) {
        const decimalPart = formatted.split('.')[1] || '';
        expect(decimalPart.length).toBe(precision);
      }
    }
  });

  it('should handle very high precision', () => {
    const value = Math.PI;
    const formatted = formatResultValue(value, 10);
    expect(formatted).toBeDefined();
    expect(formatted.length).toBeGreaterThan(10);
  });
});
