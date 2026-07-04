import { describe, it, expect } from 'vitest';
import {
  parseUnitText,
  CONVERSION_DATA,
} from '../client/src/lib/conversion-data';
import { findCategoryByDimensions } from '../client/src/lib/calculator/findCategoryByDimensions';

/**
 * Smart Paste and Localization Tests
 * 
 * Tests for the smart paste functionality including:
 * - Number parsing with various formats
 * - Multilingual support
 * - Malformed input handling
 * - originalValue propagation
 * - Dimensional formula parsing
 */

describe('Smart Paste - Number Parsing', () => {
  describe('Standard Number Formats', () => {
    it('should parse integer values', () => {
      const result = parseUnitText('42 s');
      expect(result.originalValue).toBe(42);
      expect(result.categoryId).toBe('time');
    });

    it('should parse decimal values', () => {
      const result = parseUnitText('3.14159 s');
      expect(result.originalValue).toBeCloseTo(3.14159, 5);
    });

    it('should parse negative values', () => {
      const result = parseUnitText('-5.5 s');
      expect(result.originalValue).toBe(-5.5);
    });

    it('should parse values with leading zeros', () => {
      const result = parseUnitText('0.123 s');
      expect(result.originalValue).toBeCloseTo(0.123, 5);
    });

    it('should parse values with trailing zeros', () => {
      const result = parseUnitText('5.00 s');
      expect(result.originalValue).toBe(5);
    });
  });

  describe('Scientific Notation', () => {
    it('should parse positive exponent (e notation)', () => {
      const result = parseUnitText('1.5e3 s');
      expect(result.originalValue).toBe(1500);
    });

    it('should parse negative exponent', () => {
      const result = parseUnitText('2.5e-3 s');
      expect(result.originalValue).toBeCloseTo(0.0025, 10);
    });

    it('should parse uppercase E notation', () => {
      const result = parseUnitText('3E8 s');
      expect(result.originalValue).toBe(3e8);
    });

    it('should parse explicit positive exponent', () => {
      const result = parseUnitText('1.0e+6 N');
      expect(result.originalValue).toBe(1e6);
    });

    it('should parse very small scientific notation', () => {
      const result = parseUnitText('6.626e-34 s');
      expect(result.originalValue).toBeCloseTo(6.626e-34, 40);
    });

    it('should parse very large scientific notation', () => {
      const result = parseUnitText('2.998e+8 s');
      expect(result.originalValue).toBeCloseTo(2.998e8, -3);
    });
  });

  describe('Whitespace Handling', () => {
    it('should handle no space between number and unit', () => {
      const result = parseUnitText('5s');
      expect(result.originalValue).toBe(5);
      expect(result.categoryId).toBe('time');
    });

    it('should handle multiple spaces between number and unit', () => {
      const result = parseUnitText('10   s');
      expect(result.originalValue).toBe(10);
      expect(result.categoryId).toBe('time');
    });

    it('should handle leading whitespace', () => {
      const result = parseUnitText('  15 N');
      expect(result.originalValue).toBe(15);
      expect(result.categoryId).toBe('force');
    });

    it('should handle trailing whitespace', () => {
      const result = parseUnitText('20 s  ');
      expect(result.originalValue).toBe(20);
      expect(result.categoryId).toBe('time');
    });
  });
});

describe('Smart Paste - Unit Recognition', () => {
  describe('SI Base Units', () => {
    it('should recognize second', () => {
      const result = parseUnitText('1 s');
      expect(result.categoryId).toBe('time');
      expect(result.unitId).toBe('s');
    });

    it('should recognize ampere', () => {
      const result = parseUnitText('1 A');
      expect(result.categoryId).toBe('current');
      expect(result.unitId).toBe('a');
    });

    it('should recognize kelvin', () => {
      const result = parseUnitText('1 K');
      expect(result.categoryId).toBe('temperature');
      expect(result.unitId).toBe('k');
    });

    it('should recognize minute', () => {
      const result = parseUnitText('5 min');
      expect(result.categoryId).toBe('time');
      expect(result.unitId).toBe('min');
    });

    it('should recognize hour', () => {
      const result = parseUnitText('2 h');
      expect(result.categoryId).toBe('time');
      expect(result.unitId).toBe('h');
    });
  });

  describe('Common Derived Units', () => {
    it('should recognize Newton', () => {
      const result = parseUnitText('10 N');
      expect(result.categoryId).toBe('force');
    });

    it('should recognize Hertz', () => {
      const result = parseUnitText('440 Hz');
      expect(result.categoryId).toBe('frequency');
    });

    it('should recognize Ohm', () => {
      const result = parseUnitText('100 Ω');
      expect(result.categoryId).toBe('resistance');
    });

    it('should recognize Coulomb', () => {
      const result = parseUnitText('1 C');
      expect(result.categoryId).toBe('charge');
    });

    it('should recognize Volt', () => {
      const result = parseUnitText('12 V');
      expect(result.categoryId).toBe('potential');
    });
  });

  describe('Units with Prefixes', () => {
    it('should recognize megahertz (MHz)', () => {
      const result = parseUnitText('2.4 MHz');
      expect(result.categoryId).toBe('frequency');
      expect(result.prefixId).toBe('mega');
    });

    it('should recognize kilonewton (kN)', () => {
      const result = parseUnitText('5 kN');
      expect(result.categoryId).toBe('force');
      expect(result.prefixId).toBe('kilo');
      expect(result.originalValue).toBe(5);
    });

    it('should recognize nanosecond (ns)', () => {
      const result = parseUnitText('10 ns');
      expect(result.categoryId).toBe('time');
      expect(result.prefixId).toBe('nano');
    });

    it('should recognize microsecond (µs)', () => {
      const result = parseUnitText('500 µs');
      expect(result.categoryId).toBe('time');
      expect(result.prefixId).toBe('micro');
    });

    it('should recognize kilojoule (kJ)', () => {
      const result = parseUnitText('4.2 kJ');
      // May parse to energy or archaic_energy depending on symbol map order
      expect(result.prefixId).toBe('kilo');
      expect(result.originalValue).toBeCloseTo(4.2);
    });

    it('should parse value correctly with prefix', () => {
      const result = parseUnitText('3 MHz');
      expect(result.originalValue).toBe(3);
      expect(result.prefixId).toBe('mega');
    });
  });
});

describe('Smart Paste - Dimensional Formulas', () => {
  describe('Single Dimension', () => {
    it('should parse m² as area dimensions', () => {
      const result = parseUnitText('10 m²');
      expect(result.dimensions.length).toBe(2);
    });

    it('should parse m³ as volume dimensions', () => {
      const result = parseUnitText('5 m³');
      expect(result.dimensions.length).toBe(3);
    });

    it('should parse s⁻¹ as frequency dimensions', () => {
      const result = parseUnitText('50 s⁻¹');
      expect(result.dimensions.time).toBe(-1);
    });
  });

  describe('Multiple Dimensions', () => {
    it('should parse kg⋅m⁻³ as density', () => {
      const result = parseUnitText('1000 kg⋅m⁻³');
      expect(result.dimensions.mass).toBe(1);
      expect(result.dimensions.length).toBe(-3);
    });

    it('should parse m⋅s⁻¹ as speed', () => {
      const result = parseUnitText('300 m⋅s⁻¹');
      expect(result.dimensions.length).toBe(1);
      expect(result.dimensions.time).toBe(-1);
    });

    it('should parse kg⋅m⋅s⁻² as force', () => {
      const result = parseUnitText('9.8 kg⋅m⋅s⁻²');
      expect(result.dimensions.mass).toBe(1);
      expect(result.dimensions.length).toBe(1);
      expect(result.dimensions.time).toBe(-2);
    });

    it('should parse kg⋅m²⋅s⁻² as energy', () => {
      const result = parseUnitText('1 kg⋅m²⋅s⁻²');
      expect(result.dimensions.mass).toBe(1);
      expect(result.dimensions.length).toBe(2);
      expect(result.dimensions.time).toBe(-2);
    });
  });

  describe('Alternative Separators', () => {
    it('should parse with middle dot (·)', () => {
      const result = parseUnitText('5 m·s⁻¹');
      expect(result.dimensions.length).toBe(1);
      expect(result.dimensions.time).toBe(-1);
    });

    it('should parse with multiplication sign (×)', () => {
      const result = parseUnitText('10 kg×m');
      // May or may not be recognized depending on parser
      expect(result.originalValue).toBe(10);
    });
  });
});

describe('Smart Paste - Angle Units', () => {
  it('should parse degree symbol (°)', () => {
    const result = parseUnitText('90°');
    expect(result.categoryId).toBe('angle');
    expect(result.originalValue).toBe(90);
  });

  it('should parse "deg" abbreviation', () => {
    const result = parseUnitText('180 deg');
    expect(result.categoryId).toBe('angle');
    expect(result.originalValue).toBe(180);
  });

  it('should parse radians', () => {
    const result = parseUnitText('3.14159 rad');
    expect(result.categoryId).toBe('angle');
    expect(result.originalValue).toBeCloseTo(3.14159, 4);
  });
});

describe('Smart Paste - originalValue Propagation', () => {
  describe('Value vs originalValue Difference', () => {
    it('should have different value and originalValue for converted units', () => {
      const result = parseUnitText('1 min');
      expect(result.originalValue).toBe(1);
      expect(result.value).toBe(60); // Converted to seconds (base unit)
    });

    it('should have same value and originalValue for base units', () => {
      const result = parseUnitText('5 s');
      expect(result.originalValue).toBe(5);
      expect(result.value).toBe(5);
    });

    it('should convert hours properly', () => {
      const result = parseUnitText('2 h');
      expect(result.originalValue).toBe(2);
      expect(result.value).toBe(7200); // 2 hours = 7200 seconds
    });

    it('should convert days properly', () => {
      const result = parseUnitText('1 d');
      expect(result.originalValue).toBe(1);
      expect(result.value).toBe(86400); // 1 day = 86400 seconds
    });
  });

  describe('Prefix Applied Values', () => {
    it('should apply prefix to value but not originalValue', () => {
      const result = parseUnitText('5 km');
      expect(result.originalValue).toBe(5);
      // value should be 5000 (5 * 1000) in base unit
      expect(result.value).toBe(5000);
    });

    it('should handle milli prefix', () => {
      const result = parseUnitText('500 mm');
      expect(result.originalValue).toBe(500);
      expect(result.value).toBeCloseTo(0.5, 10);
    });
  });
});

describe('Smart Paste - Malformed Input Handling', () => {
  describe('Empty and Invalid Inputs', () => {
    it('should handle empty string', () => {
      const result = parseUnitText('');
      expect(result.originalValue).toBe(1);
      expect(result.categoryId).toBeNull();
    });

    it('should handle only whitespace', () => {
      const result = parseUnitText('   ');
      expect(result.categoryId).toBeNull();
    });

    it('should handle unknown unit', () => {
      const result = parseUnitText('5 xyz');
      expect(result.originalValue).toBe(5);
      expect(result.categoryId).toBeNull();
    });

    it('should handle number only', () => {
      const result = parseUnitText('42');
      expect(result.originalValue).toBe(42);
      expect(result.categoryId).toBeNull();
    });

    it('should handle unit only (no number)', () => {
      const result = parseUnitText('m');
      expect(result.originalValue).toBe(1);
      expect(result.categoryId).not.toBeNull();
    });
  });

  describe('Malformed Numbers', () => {
    it('should handle double decimal point', () => {
      const result = parseUnitText('5.5.5 m');
      // Parser should handle gracefully
      expect(typeof result.originalValue).toBe('number');
    });

    it('should handle letters in number', () => {
      const result = parseUnitText('5abc m');
      // Should parse what it can
      expect(typeof result.originalValue).toBe('number');
    });

    it('should handle special characters', () => {
      const result = parseUnitText('5@#$ m');
      expect(typeof result.originalValue).toBe('number');
    });
  });

  describe('Edge Case Units', () => {
    it('should not match standalone prefix as unit', () => {
      const result = parseUnitText('P');
      // "P" is a prefix (Peta), not a unit
      expect(result.unitId).toBeNull();
    });

    it('should not match "k" as a unit', () => {
      const result = parseUnitText('5 k');
      // "k" is a prefix (kilo), not a unit
      expect(result.unitId).toBeNull();
    });

    it('should handle very long input', () => {
      const longInput = '12345678901234567890 N';
      const result = parseUnitText(longInput);
      expect(result.categoryId).toBe('force');
    });
  });
});

describe('Smart Paste - Special Cases', () => {
  describe('Half-Life Units (Symbol Conflict Prevention)', () => {
    it('should parse "s" as seconds, not half-life', () => {
      const result = parseUnitText('3 s');
      expect(result.categoryId).toBe('time');
      expect(result.unitId).toBe('s');
    });

    it('should parse half-life with t½ prefix', () => {
      const result = parseUnitText('5 t½(s)');
      expect(result.categoryId).toBe('radioactive_decay');
    });
  });

  describe('Poise Symbol (Po not P)', () => {
    it('should parse "Po" as Poise', () => {
      const result = parseUnitText('10 Po');
      expect(result.categoryId).toBe('viscosity');
      expect(result.unitId).toBe('poise');
    });

    it('should not parse "P" as Poise', () => {
      const result = parseUnitText('10 P');
      // "P" should not map to a unit
      expect(result.unitId).toBeNull();
    });
  });

  describe('Minim Symbol (minim not min)', () => {
    it('should parse "min" as minute', () => {
      const result = parseUnitText('30 min');
      expect(result.categoryId).toBe('time');
      expect(result.unitId).toBe('min');
    });

    it('should parse "minim" as minim volume', () => {
      const result = parseUnitText('5 minim');
      expect(result.categoryId).toBe('archaic_volume');
      expect(result.unitId).toBe('minim');
    });
  });

  describe('Symbol Priority — base unit wins over secondary unit', () => {
    it('should route "eV" to photon energy, not plain energy', () => {
      const result = parseUnitText('23 eV');
      expect(result.categoryId).toBe('photon');
      expect(result.unitId).toBe('eV');
    });

    it('should route "23eV" (no space) to photon energy', () => {
      const result = parseUnitText('23eV');
      expect(result.categoryId).toBe('photon');
      expect(result.unitId).toBe('eV');
    });

    it('should route "eV" with prefix (keV) to photon energy with kilo prefix', () => {
      const result = parseUnitText('5 keV');
      expect(result.categoryId).toBe('photon');
      expect(result.prefixId).toBe('kilo');
    });
  });

  describe('Symbol Priority — archaic length wins over shipping for "li"', () => {
    it('should route "li" to archaic_length, not shipping', () => {
      const result = parseUnitText('7 li');
      expect(result.categoryId).toBe('archaic_length');
      expect(result.unitId).toBe('link');
    });
  });
});

describe('Symbol Priority — Base Unit Wins', () => {
  it('should route "eV" to Photon Energy, not plain Energy', () => {
    const result = parseUnitText('23eV');
    expect(result.categoryId).toBe('photon');
    expect(result.unitId).toBe('eV');
    expect(result.originalValue).toBe(23);
  });

  it('should route "li" to Archaic Length, not Shipping', () => {
    const result = parseUnitText('7li');
    expect(result.categoryId).toBe('archaic_length');
    expect(result.unitId).toBe('link');
    expect(result.originalValue).toBe(7);
  });

  it('should route "MeV" (mega-electronvolt) to Photon Energy', () => {
    const result = parseUnitText('5 MeV');
    expect(result.categoryId).toBe('photon');
    expect(result.prefixId).toBe('mega');
    expect(result.originalValue).toBe(5);
  });
});

describe('Unit Symbol Uniqueness', () => {
  it('should not have duplicate symbols across categories (critical symbols)', () => {
    const criticalSymbols = ['s', 'min', 'h', 'd', 'Po'];
    const symbolCategories = new Map<string, string[]>();
    
    for (const category of CONVERSION_DATA) {
      for (const unit of category.units) {
        if (!unit.mathFunction && criticalSymbols.includes(unit.symbol)) {
          const existing = symbolCategories.get(unit.symbol) || [];
          existing.push(category.id);
          symbolCategories.set(unit.symbol, existing);
        }
      }
    }
    
    // These critical symbols should only appear in one category
    expect(symbolCategories.get('s')?.length).toBe(1); // time only
    expect(symbolCategories.get('min')?.length).toBe(1); // time only
    expect(symbolCategories.get('h')?.length).toBe(1); // time only
    expect(symbolCategories.get('d')?.length).toBe(1); // time only
    expect(symbolCategories.get('Po')?.length).toBe(1); // viscosity only
  });
});

describe('Smart Paste - Division and Compound Units', () => {
  describe('Division Expressions', () => {
    it('should parse "J/s" as power dimensions', () => {
      const result = parseUnitText('657 J/s');
      expect(result.originalValue).toBe(657);
      expect(result.dimensions).toEqual({ mass: 1, length: 2, time: -3 });
    });

    it('should parse "m/s" as velocity dimensions', () => {
      const result = parseUnitText('10 m/s');
      expect(result.originalValue).toBe(10);
      expect(result.dimensions).toEqual({ length: 1, time: -1 });
    });

    it('should parse "kg/m³" as density dimensions', () => {
      const result = parseUnitText('1000 kg/m³');
      expect(result.originalValue).toBe(1000);
      expect(result.dimensions).toEqual({ mass: 1, length: -3 });
    });

    it('should parse "N/m²" as pressure dimensions', () => {
      const result = parseUnitText('101325 N/m²');
      expect(result.originalValue).toBe(101325);
      expect(result.dimensions).toEqual({ mass: 1, length: -1, time: -2 });
    });

    it('should parse "141/s" as frequency dimensions', () => {
      const result = parseUnitText('141/s');
      expect(result.originalValue).toBe(141);
      expect(result.dimensions).toEqual({ time: -1 });
    });
  });

  describe('Negative Exponents', () => {
    it('should parse "s^-1" as frequency dimensions', () => {
      const result = parseUnitText('141 s^-1');
      expect(result.originalValue).toBe(141);
      expect(result.dimensions).toEqual({ time: -1 });
    });

    it('should parse superscript "s⁻¹" as frequency dimensions', () => {
      const result = parseUnitText('141 s⁻¹');
      expect(result.originalValue).toBe(141);
      expect(result.dimensions).toEqual({ time: -1 });
    });
  });

  describe('Multiplication Expressions', () => {
    it('should parse "J*s" as action dimensions', () => {
      const result = parseUnitText('123 J*s');
      expect(result.originalValue).toBe(123);
      expect(result.dimensions).toEqual({ mass: 1, length: 2, time: -1 });
    });

    it('should parse "N⋅m" as torque dimensions', () => {
      const result = parseUnitText('50 N⋅m');
      expect(result.originalValue).toBe(50);
      expect(result.dimensions).toEqual({ mass: 1, length: 2, time: -2 });
    });
  });

  describe('Core Category Priority (First-Wins)', () => {
    it('should parse "yd" as length, not shipping', () => {
      const result = parseUnitText('2.7432 yd');
      expect(result.categoryId).toBe('length');
      expect(result.dimensions).toEqual({ length: 1 });
    });

    it('should parse "m" as length, not typography', () => {
      const result = parseUnitText('5 m');
      expect(result.categoryId).toBe('length');
      expect(result.dimensions).toEqual({ length: 1 });
    });

    it('should parse "rad" as angle, not radiation dose', () => {
      const result = parseUnitText('3.14159 rad');
      expect(result.categoryId).toBe('angle');
      expect(result.originalValue).toBeCloseTo(3.14159, 4);
    });
  });

  describe('Multi-Division Expressions', () => {
    it('should parse "kg/m/s" with multiple denominators', () => {
      const result = parseUnitText('kg/m/s');
      expect(result.dimensions).toEqual({ mass: 1, length: -1, time: -1 });
    });

    it('should parse "N·m/s²" with mixed operators', () => {
      const result = parseUnitText('N·m/s²');
      expect(result.dimensions).toEqual({ mass: 1, length: 2, time: -4 });
    });

    it('should parse "kg/m³/s" correctly', () => {
      const result = parseUnitText('kg/m³/s');
      expect(result.dimensions).toEqual({ mass: 1, length: -3, time: -1 });
    });

    it('should parse "J/kg/K" as specific heat capacity', () => {
      const result = parseUnitText('J/kg/K');
      expect(result.dimensions).toEqual({ length: 2, time: -2, temperature: -1 });
    });
  });

  describe('Bare Exponents (mathematical)', () => {
    it('should parse "141⁻¹" as reciprocal', () => {
      const result = parseUnitText('141⁻¹');
      expect(result.originalValue).toBe(141);
      expect(result.value).toBeCloseTo(1/141, 10);
      expect(result.dimensions).toEqual({});
    });

    it('should parse "141^-1" as reciprocal', () => {
      const result = parseUnitText('141^-1');
      expect(result.originalValue).toBe(141);
      expect(result.value).toBeCloseTo(1/141, 10);
      expect(result.dimensions).toEqual({});
    });

    it('should parse "2²" as squared', () => {
      const result = parseUnitText('2²');
      expect(result.originalValue).toBe(2);
      expect(result.value).toBe(4);
    });

    it('should parse "10^3" as cubed', () => {
      const result = parseUnitText('10^3');
      expect(result.originalValue).toBe(10);
      expect(result.value).toBe(1000);
    });
  });

  describe('All Multiplication Operators with Units', () => {
    it('should parse "141 J⋅s⁻¹" (middle dot)', () => {
      const result = parseUnitText('141 J⋅s⁻¹');
      expect(result.originalValue).toBe(141);
      expect(result.dimensions).toEqual({ mass: 1, length: 2, time: -3 });
    });

    it('should parse "141 J×s⁻¹" (multiplication sign)', () => {
      const result = parseUnitText('141 J×s⁻¹');
      expect(result.originalValue).toBe(141);
      expect(result.dimensions).toEqual({ mass: 1, length: 2, time: -3 });
    });

    it('should parse "141 J*s⁻¹" (asterisk)', () => {
      const result = parseUnitText('141 J*s⁻¹');
      expect(result.originalValue).toBe(141);
      expect(result.dimensions).toEqual({ mass: 1, length: 2, time: -3 });
    });
  });

  describe('Negative Numbers with Units', () => {
    it('should parse "-5 m" as negative length', () => {
      const result = parseUnitText('-5 m');
      expect(result.originalValue).toBe(-5);
      expect(result.categoryId).toBe('length');
      expect(result.dimensions).toEqual({ length: 1 });
    });

    it('should parse "-10 J/s" as negative power', () => {
      const result = parseUnitText('-10 J/s');
      expect(result.originalValue).toBe(-10);
      expect(result.dimensions).toEqual({ mass: 1, length: 2, time: -3 });
    });

    it('should parse "-3.14 rad" as negative angle', () => {
      const result = parseUnitText('-3.14 rad');
      expect(result.originalValue).toBe(-3.14);
      expect(result.categoryId).toBe('angle');
    });
  });

  describe('European Decimal Notation', () => {
    it('should parse "3,14 m" with comma decimal', () => {
      const result = parseUnitText('3,14 m');
      expect(result.originalValue).toBeCloseTo(3.14, 2);
      expect(result.categoryId).toBe('length');
    });

    it('should parse "2,5 kg" with comma decimal', () => {
      const result = parseUnitText('2,5 kg');
      expect(result.originalValue).toBeCloseTo(2.5, 1);
      expect(result.categoryId).toBe('mass');
    });
  });

  describe('Zero Exponent', () => {
    it('should parse "m⁰" as dimensionless (contributes nothing)', () => {
      const result = parseUnitText('5 m⁰');
      expect(result.originalValue).toBe(5);
      expect(result.dimensions).toEqual({});
    });

    it('should parse "s^0" as dimensionless', () => {
      const result = parseUnitText('10 s^0');
      expect(result.originalValue).toBe(10);
      expect(result.dimensions).toEqual({});
    });
  });

  describe('Prefixed Units in Formulas', () => {
    it('should parse "km/h" as velocity with prefix', () => {
      const result = parseUnitText('100 km/h');
      expect(result.originalValue).toBe(100);
      expect(result.dimensions).toEqual({ length: 1, time: -1 });
    });

    it('should parse "µg/L" with micro prefix', () => {
      const result = parseUnitText('50 µg/L');
      expect(result.originalValue).toBe(50);
      expect(result.dimensions).toEqual({ mass: 1, length: -3 });
    });

    it('should parse "mN⋅m" (millinewton-meter)', () => {
      const result = parseUnitText('25 mN⋅m');
      expect(result.originalValue).toBe(25);
      expect(result.dimensions).toEqual({ mass: 1, length: 2, time: -2 });
    });
  });

  describe('1/unit Notation (Reciprocal Units)', () => {
    it('should parse "1/s" as frequency', () => {
      const result = parseUnitText('50 1/s');
      expect(result.originalValue).toBe(50);
      expect(result.dimensions).toEqual({ time: -1 });
    });

    it('should parse "1/m" as wavenumber', () => {
      const result = parseUnitText('100 1/m');
      expect(result.originalValue).toBe(100);
      expect(result.dimensions).toEqual({ length: -1 });
    });
  });

  describe('Complex SI Derived Units', () => {
    it('should parse "kg⋅m²⋅s⁻³⋅A⁻¹" as volt dimensions', () => {
      const result = parseUnitText('12 kg⋅m²⋅s⁻³⋅A⁻¹');
      expect(result.originalValue).toBe(12);
      expect(result.dimensions).toEqual({ mass: 1, length: 2, time: -3, current: -1 });
    });

    it('should parse "kg⋅m⋅s⁻²" as force (newton) dimensions', () => {
      const result = parseUnitText('9.8 kg⋅m⋅s⁻²');
      expect(result.originalValue).toBeCloseTo(9.8, 1);
      expect(result.dimensions).toEqual({ mass: 1, length: 1, time: -2 });
    });

    it('should parse "kg⋅m²⋅s⁻²" as energy (joule) dimensions', () => {
      const result = parseUnitText('1000 kg⋅m²⋅s⁻²');
      expect(result.originalValue).toBe(1000);
      expect(result.dimensions).toEqual({ mass: 1, length: 2, time: -2 });
    });
  });

  describe('Whitespace Variations', () => {
    it('should handle non-breaking space (U+00A0)', () => {
      const result = parseUnitText('141\u00A0s⁻¹');
      expect(result.originalValue).toBe(141);
      expect(result.dimensions).toEqual({ time: -1 });
    });

    it('should handle narrow no-break space (U+202F)', () => {
      const result = parseUnitText('50\u202Fm');
      expect(result.originalValue).toBe(50);
      expect(result.categoryId).toBe('length');
    });

    it('should handle multiple spaces', () => {
      const result = parseUnitText('25   kg');
      expect(result.originalValue).toBe(25);
      expect(result.categoryId).toBe('mass');
    });
  });

  describe('Case Sensitivity', () => {
    it('should distinguish "kg" (kilogram) from potential uppercase', () => {
      const result = parseUnitText('5 kg');
      expect(result.categoryId).toBe('mass');
      expect(result.dimensions).toEqual({ mass: 1 });
    });

    it('should recognize "Hz" correctly (case-sensitive)', () => {
      const result = parseUnitText('60 Hz');
      expect(result.categoryId).toBe('frequency');
      expect(result.dimensions).toEqual({ time: -1 });
    });

    it('should recognize "Pa" (pascal) correctly', () => {
      const result = parseUnitText('101325 Pa');
      expect(result.categoryId).toBe('pressure');
    });
  });

  describe('Standalone Derived Units', () => {
    it('should parse "W" (watt) alone', () => {
      const result = parseUnitText('100 W');
      expect(result.categoryId).toBe('power');
      expect(result.dimensions).toEqual({ mass: 1, length: 2, time: -3 });
    });

    it('should parse "N" (newton) alone', () => {
      const result = parseUnitText('9.8 N');
      expect(result.categoryId).toBe('force');
      expect(result.dimensions).toEqual({ mass: 1, length: 1, time: -2 });
    });

    it('should parse "J" (joule) alone', () => {
      const result = parseUnitText('4184 J');
      expect(result.categoryId).toBe('energy');
      expect(result.dimensions).toEqual({ mass: 1, length: 2, time: -2 });
    });

    it('should parse "V" (volt) alone', () => {
      const result = parseUnitText('12 V');
      expect(result.categoryId).toBe('potential');
      expect(result.dimensions).toEqual({ mass: 1, length: 2, time: -3, current: -1 });
    });
  });

  describe('Medical/Pharmaceutical Units', () => {
    it('should parse "mcg" as microgram (mass category)', () => {
      const result = parseUnitText('500 mcg');
      expect(result.originalValue).toBe(500);
      expect(result.categoryId).toBe('mass');
      expect(result.unitId).toBe('mcg');
      expect(result.dimensions).toEqual({ mass: 1 });
    });

    it('should parse "mcg" in dimensional formula', () => {
      const result = parseUnitText('10 mcg/L');
      expect(result.originalValue).toBe(10);
      expect(result.dimensions).toEqual({ mass: 1, length: -3 });
    });

    it('should convert mcg correctly (1 mcg = 1e-9 kg)', () => {
      const result = parseUnitText('1000000 mcg');
      expect(result.value).toBeCloseTo(0.001, 6); // 1,000,000 mcg = 1 g = 0.001 kg
    });
  });
});

describe('findCategoryByDimensions - Compound Unit Routing', () => {
  describe('Basic dimension matching', () => {
    it('routes { length: 1 } to "length"', () => {
      expect(findCategoryByDimensions({ length: 1 })).toBe('length');
    });

    it('routes { mass: 1 } to "mass"', () => {
      expect(findCategoryByDimensions({ mass: 1 })).toBe('mass');
    });

    it('routes { time: 1 } to "time"', () => {
      expect(findCategoryByDimensions({ time: 1 })).toBe('time');
    });

    it('routes acceleration { length: 1, time: -2 } to "acceleration"', () => {
      expect(findCategoryByDimensions({ length: 1, time: -2 })).toBe('acceleration');
    });

    it('routes force { mass: 1, length: 1, time: -2 } to "force"', () => {
      expect(findCategoryByDimensions({ mass: 1, length: 1, time: -2 })).toBe('force');
    });

    it('routes power { mass: 1, length: 2, time: -3 } to "power"', () => {
      expect(findCategoryByDimensions({ mass: 1, length: 2, time: -3 })).toBe('power');
    });
  });

  describe('First-match disambiguation (energy wins over torque)', () => {
    it('routes { mass: 1, length: 2, time: -2 } to "energy" (not torque)', () => {
      const result = findCategoryByDimensions({ mass: 1, length: 2, time: -2 });
      expect(result).toBe('energy');
    });
  });

  describe('Excluded / archaic / local categories are never returned', () => {
    it('does not return "archaic_length" for { length: 1 } — returns "length" instead', () => {
      const result = findCategoryByDimensions({ length: 1 });
      expect(result).not.toBe('archaic_length');
      expect(result).toBe('length');
    });

    it('does not return "cooking" for { length: 3 } — returns "volume" instead', () => {
      const result = findCategoryByDimensions({ length: 3 });
      expect(result).not.toBe('cooking');
      expect(result).toBe('volume');
    });

    it('does not return "data" or "math" (dimensionless) — returns null', () => {
      expect(findCategoryByDimensions({})).toBeNull();
    });
  });

  describe('Compound expressions parsed by parseUnitText feed correctly', () => {
    it('"45N·m" parses to torque (direct symbol match before dimensional decomposition)', () => {
      const parsed = parseUnitText('45N·m');
      expect(parsed.dimensions).toMatchObject({ mass: 1, length: 2, time: -2 });
      expect(parsed.categoryId).toBe('torque');
      expect(parsed.unitId).toBe('nm');
    });

    it('"9.8 m/s²" parses to acceleration dimensions and routes to "acceleration"', () => {
      const parsed = parseUnitText('9.8 m/s²');
      expect(parsed.dimensions).toMatchObject({ length: 1, time: -2 });
      const catId = findCategoryByDimensions(parsed.dimensions as Parameters<typeof findCategoryByDimensions>[0]);
      expect(catId).toBe('acceleration');
    });

    it('"127.2342 J/s" parses to power dimensions and routes to "power"', () => {
      const parsed = parseUnitText('127.2342 J/s');
      expect(parsed.dimensions).toMatchObject({ mass: 1, length: 2, time: -3 });
      const catId = findCategoryByDimensions(parsed.dimensions as Parameters<typeof findCategoryByDimensions>[0]);
      expect(catId).toBe('power');
    });

    it('"100 Pa" parses to pressure dimensions and routes to "pressure"', () => {
      const parsed = parseUnitText('100 Pa');
      expect(parsed.dimensions).toMatchObject({ mass: 1, length: -1, time: -2 });
      const catId = findCategoryByDimensions(parsed.dimensions as Parameters<typeof findCategoryByDimensions>[0]);
      expect(catId).toBe('pressure');
    });
  });

  describe('CONVERSION_DATA has baseUnit for all routable categories', () => {
    it('every non-excluded category returned by findCategoryByDimensions has a baseUnit in CONVERSION_DATA', () => {
      const testDims = [
        { length: 1 }, { mass: 1 }, { time: 1 }, { length: 2 }, { length: 3 },
        { length: 1, time: -1 }, { length: 1, time: -2 }, { mass: 1, length: 1, time: -2 },
        { mass: 1, length: -1, time: -2 }, { mass: 1, length: 2, time: -2 },
        { mass: 1, length: 2, time: -3 },
      ];
      for (const dims of testDims) {
        const catId = findCategoryByDimensions(dims);
        if (catId) {
          const catData = CONVERSION_DATA.find(c => c.id === catId);
          expect(catData).toBeDefined();
          expect(catData!.baseUnit).toBeTruthy();
        }
      }
    });
  });

  describe('Compound unit symbol match routes before dimensional decomposition', () => {
    it('"N*m" routes to torque, not energy', () => {
      const parsed = parseUnitText('N*m');
      expect(parsed.categoryId).toBe('torque');
      expect(parsed.unitId).toBe('nm');
      expect(parsed.dimensions).toEqual({ mass: 1, length: 2, time: -2 });
    });

    it('"N·m" (middle dot) routes to torque, not energy', () => {
      const parsed = parseUnitText('N·m');
      expect(parsed.categoryId).toBe('torque');
      expect(parsed.unitId).toBe('nm');
    });

    it('"N⋅m" (dot operator) routes to torque, not energy', () => {
      const parsed = parseUnitText('N⋅m');
      expect(parsed.categoryId).toBe('torque');
      expect(parsed.unitId).toBe('nm');
    });

    it('"10 N*m" with numeric prefix routes to torque', () => {
      const parsed = parseUnitText('10 N*m');
      expect(parsed.categoryId).toBe('torque');
      expect(parsed.unitId).toBe('nm');
      expect(parsed.originalValue).toBe(10);
    });

    it('"ft*lb" routes to torque', () => {
      const parsed = parseUnitText('ft*lb');
      expect(parsed.categoryId).toBe('torque');
      expect(parsed.unitId).toBe('ftlb');
    });

    it('"ft·lb" routes to torque', () => {
      const parsed = parseUnitText('ft·lb');
      expect(parsed.categoryId).toBe('torque');
      expect(parsed.unitId).toBe('ftlb');
    });

    it('"ft-lb" (hyphen separator) routes to torque', () => {
      const parsed = parseUnitText('ft-lb');
      expect(parsed.categoryId).toBe('torque');
      expect(parsed.unitId).toBe('ftlb');
    });

    it('pure energy symbols (J) still route to energy', () => {
      const parsed = parseUnitText('J');
      expect(parsed.categoryId).toBe('energy');
    });

    it('pure energy symbols (kJ) still route to energy', () => {
      const parsed = parseUnitText('kJ');
      expect(parsed.categoryId).toBe('energy');
    });

    it('"ft·lbf" (foot-pound-force) routes to torque via lbf→lb alias', () => {
      const parsed = parseUnitText('ft·lbf');
      expect(parsed.categoryId).toBe('torque');
      expect(parsed.unitId).toBe('ftlb');
    });

    it('"ft*lbf" routes to torque via lbf→lb alias', () => {
      const parsed = parseUnitText('ft*lbf');
      expect(parsed.categoryId).toBe('torque');
      expect(parsed.unitId).toBe('ftlb');
    });

    it('"ft-lbf" (hyphen separator) routes to torque via lbf→lb alias', () => {
      const parsed = parseUnitText('ft-lbf');
      expect(parsed.categoryId).toBe('torque');
      expect(parsed.unitId).toBe('ftlb');
    });

    it('ambiguous dimension-only string (kg·m²/s²) falls back to dimensional decomposition', () => {
      const parsed = parseUnitText('kg·m²/s²');
      expect(parsed.categoryId).toBeNull();
      expect(parsed.dimensions).toEqual({ mass: 1, length: 2, time: -2 });
    });
  });

  describe('Symbol route takes priority over dimension route', () => {
    it('"5 MeV" has a specific categoryId (photon) — dimension route must NOT override it', () => {
      const parsed = parseUnitText('5 MeV');
      expect(parsed.categoryId).toBe('photon');
      expect(parsed.unitId).toBeTruthy();
      // Dimension route would return 'energy' for the same dims; symbol route must win
      const dimCatId = findCategoryByDimensions(parsed.dimensions as Parameters<typeof findCategoryByDimensions>[0]);
      expect(dimCatId).toBe('energy');
      // Confirm the symbol route (categoryId) differs from dimension route result
      expect(parsed.categoryId).not.toBe(dimCatId);
    });

    it('"9.8 N" has specific categoryId (force) — dimension route agrees in this case', () => {
      const parsed = parseUnitText('9.8 N');
      expect(parsed.categoryId).toBe('force');
      const dimCatId = findCategoryByDimensions(parsed.dimensions as Parameters<typeof findCategoryByDimensions>[0]);
      expect(dimCatId).toBe('force');
    });
  });

  describe('Graceful fallback when dimensions have no non-excluded match', () => {
    it('truly dimensionless input {} returns null', () => {
      expect(findCategoryByDimensions({})).toBeNull();
    });

    it('data/math dimensions (empty) return null since those categories are excluded', () => {
      // Both data and math have dimensions:{} and are in EXCLUDED_CROSS_DOMAIN_CATEGORIES
      const result = findCategoryByDimensions({});
      expect(result).toBeNull();
    });

    it('unusual combination that has no standard category match returns null', () => {
      // e.g. time^3 is not a standard physical quantity
      const result = findCategoryByDimensions({ time: 3 });
      expect(result).toBeNull();
    });

    it('{ length: -2 } (fuel_economy dimensions) returns null — fuel_economy is excluded', () => {
      // fuel_economy has dimensions { length: -2 } but is in EXCLUDED_CROSS_DOMAIN_CATEGORIES
      const result = findCategoryByDimensions({ length: -2 });
      expect(result).toBeNull();
    });
  });
});

describe('Smart Paste - Unitless Numbers (counting words & ratio symbols)', () => {
  describe('Counting words', () => {
    it('should parse "12 doz" as unitless dozen', () => {
      const result = parseUnitText('12 doz');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('dozen');
      expect(result.originalValue).toBe(12);
    });

    it('should parse "3 score" as unitless score', () => {
      const result = parseUnitText('3 score');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('score');
      expect(result.originalValue).toBe(3);
    });

    it('should parse "2 gross" as unitless gross', () => {
      const result = parseUnitText('2 gross');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('gross');
      expect(result.originalValue).toBe(2);
    });

    it('should parse "1 myriad" as unitless myriad', () => {
      const result = parseUnitText('1 myriad');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('myriad');
      expect(result.originalValue).toBe(1);
    });
  });

  describe('Shared ratio symbols resolve to unitless', () => {
    it('should parse "5 %" as unitless percent', () => {
      const result = parseUnitText('5 %');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('percent');
      expect(result.originalValue).toBe(5);
    });

    it('should parse "5%" (no space) as unitless percent', () => {
      const result = parseUnitText('5%');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('percent');
      expect(result.originalValue).toBe(5);
    });

    it('should parse "1 ppm" as unitless parts-per-million', () => {
      const result = parseUnitText('1 ppm');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('ppm');
      expect(result.originalValue).toBe(1);
    });

    it('should parse "10 ppb" as unitless parts-per-billion', () => {
      const result = parseUnitText('10 ppb');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('ppb');
      expect(result.originalValue).toBe(10);
    });

    it('should parse "2 ppt" as unitless parts-per-trillion', () => {
      const result = parseUnitText('2 ppt');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('ppt');
      expect(result.originalValue).toBe(2);
    });

    it('should parse "3 ‰" as unitless permille', () => {
      const result = parseUnitText('3 ‰');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('permille');
      expect(result.originalValue).toBe(3);
    });
  });

  describe('Asian counting words (romanized)', () => {
    it('should parse "5 wan" as unitless wan', () => {
      const result = parseUnitText('5 wan');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('wan');
      expect(result.originalValue).toBe(5);
      expect(result.value).toBe(50000);
    });

    it('should parse "2 lakh" as unitless lakh', () => {
      const result = parseUnitText('2 lakh');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('lakh');
      expect(result.originalValue).toBe(2);
      expect(result.value).toBe(200000);
    });

    it('should parse "1 crore" as unitless crore', () => {
      const result = parseUnitText('1 crore');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('crore');
      expect(result.originalValue).toBe(1);
      expect(result.value).toBe(10000000);
    });

    it('should parse plural "3 lakhs" as unitless lakh', () => {
      const result = parseUnitText('3 lakhs');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('lakh');
      expect(result.originalValue).toBe(3);
    });

    it('should parse plural "2 crores" as unitless crore', () => {
      const result = parseUnitText('2 crores');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('crore');
      expect(result.originalValue).toBe(2);
    });

    it('should parse alternate spelling "4 lac" as unitless lakh', () => {
      const result = parseUnitText('4 lac');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('lakh');
      expect(result.originalValue).toBe(4);
    });

    it('should be case-insensitive ("5 Wan", "2 LAKH")', () => {
      expect(parseUnitText('5 Wan').unitId).toBe('wan');
      expect(parseUnitText('2 LAKH').unitId).toBe('lakh');
    });

    it('should parse "3 yi" as unitless yi', () => {
      const result = parseUnitText('3 yi');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('yi');
      expect(result.originalValue).toBe(3);
      expect(result.value).toBe(300000000);
    });

    it('should parse "2 oku" as unitless oku', () => {
      const result = parseUnitText('2 oku');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('oku');
      expect(result.originalValue).toBe(2);
      expect(result.value).toBe(200000000);
    });

    it('should parse "1 arab" as unitless arab', () => {
      const result = parseUnitText('1 arab');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('arab');
      expect(result.originalValue).toBe(1);
      expect(result.value).toBe(1000000000);
    });

    it('should parse "4 kharab" as unitless kharab', () => {
      const result = parseUnitText('4 kharab');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('kharab');
      expect(result.originalValue).toBe(4);
      expect(result.value).toBe(400000000000);
    });

    it('should parse "5 man" (Japanese romanization) as unitless wan', () => {
      const result = parseUnitText('5 man');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('wan');
      expect(result.originalValue).toBe(5);
      expect(result.value).toBe(50000);
    });

    it('should parse plurals "2 arabs" and "3 kharabs"', () => {
      expect(parseUnitText('2 arabs').unitId).toBe('arab');
      expect(parseUnitText('3 kharabs').unitId).toBe('kharab');
    });

    it('should be case-insensitive for new words ("3 Yi", "2 OKU", "1 Arab")', () => {
      expect(parseUnitText('3 Yi').unitId).toBe('yi');
      expect(parseUnitText('2 OKU').unitId).toBe('oku');
      expect(parseUnitText('1 Arab').unitId).toBe('arab');
    });
  });

  describe('Asian counting words (native scripts)', () => {
    it('should parse "5 万" as unitless wan', () => {
      const result = parseUnitText('5 万');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('wan');
      expect(result.originalValue).toBe(5);
      expect(result.value).toBe(50000);
    });

    it('should parse "5万" (no space) as unitless wan', () => {
      const result = parseUnitText('5万');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('wan');
      expect(result.value).toBe(50000);
    });

    it('should parse "2 लाख" as unitless lakh', () => {
      const result = parseUnitText('2 लाख');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('lakh');
      expect(result.value).toBe(200000);
    });

    it('should parse "1 करोड़" as unitless crore', () => {
      const result = parseUnitText('1 करोड़');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('crore');
      expect(result.value).toBe(10000000);
    });

    it('should parse "3 亿" as unitless yi', () => {
      const result = parseUnitText('3 亿');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('yi');
      expect(result.value).toBe(300000000);
    });

    it('should parse "3亿" (no space) as unitless yi', () => {
      const result = parseUnitText('3亿');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('yi');
      expect(result.value).toBe(300000000);
    });

    it('should parse "2 億" as unitless oku', () => {
      const result = parseUnitText('2 億');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('oku');
      expect(result.value).toBe(200000000);
    });

    it('should parse "1 अरब" as unitless arab', () => {
      const result = parseUnitText('1 अरब');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('arab');
      expect(result.value).toBe(1000000000);
    });

    it('should parse "1 खरब" as unitless kharab', () => {
      const result = parseUnitText('1 खरब');
      expect(result.categoryId).toBe('unitless');
      expect(result.unitId).toBe('kharab');
      expect(result.value).toBe(100000000000);
    });
  });
});
