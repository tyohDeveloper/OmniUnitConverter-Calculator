/**
 * Characterization Tests — Phase 1 Regression Guard
 *
 * These tests document the exact current behavior of key functions with known inputs.
 * They serve as a safety net during subsequent refactoring phases (Phase 2+).
 * Do NOT change expected values unless the behavior change is intentional and reviewed.
 */

import { describe, it, expect } from 'vitest';
import { convert, parseUnitText } from '../client/src/lib/conversion-data';
import { translate, UI_TRANSLATIONS } from '../client/src/lib/localization';
import {
  fixPrecision,
  toFixedBanker,
  cleanNumber,
  formatNumberWithSeparators,
} from '../client/src/lib/formatting';
import {
  getDimensionSignature,
  CATEGORY_DIMENSIONS,
  EXCLUDED_CROSS_DOMAIN_CATEGORIES,
  PREFERRED_REPRESENTATIONS,
} from '../client/src/lib/units/shared-types';
import {
  dimensionsEqual,
  multiplyDimensions,
  divideDimensions,
  subtractDimensions,
  normalizeDimensions,
  type DimensionalFormula,
} from '../client/src/lib/calculator';

// ---------------------------------------------------------------------------
// 1. convert() — unit conversion characterization
//    Unit IDs come from CONVERSION_DATA. Prefix factors applied separately.
// ---------------------------------------------------------------------------
describe('characterization: convert()', () => {
  it('converts 1 m to m (identity)', () => {
    expect(convert(1, 'm', 'm', 'length')).toBeCloseTo(1, 10);
  });

  it('converts 1 mile to meters', () => {
    expect(convert(1, 'mi', 'm', 'length')).toBeCloseTo(1609.344, 4);
  });

  it('converts 1 kg to g (with prefix factor 1000)', () => {
    expect(convert(1, 'kg', 'g', 'mass')).toBeCloseTo(1000, 10);
  });

  it('converts 1 lb to grams', () => {
    expect(convert(1, 'lb', 'g', 'mass')).toBeCloseTo(453.59237, 4);
  });

  it('converts 100 celsius to fahrenheit', () => {
    expect(convert(100, 'c', 'f', 'temperature')).toBeCloseTo(212, 10);
  });

  it('converts 0 celsius to fahrenheit', () => {
    expect(convert(0, 'c', 'f', 'temperature')).toBeCloseTo(32, 10);
  });

  it('converts 0 celsius to kelvin', () => {
    expect(convert(0, 'c', 'k', 'temperature')).toBeCloseTo(273.15, 10);
  });

  it('converts -40 celsius to fahrenheit (crossover point)', () => {
    expect(convert(-40, 'c', 'f', 'temperature')).toBeCloseTo(-40, 10);
  });

  it('converts 1 hour to seconds', () => {
    expect(convert(1, 'h', 's', 'time')).toBeCloseTo(3600, 10);
  });

  it('converts 1 kWh to joules', () => {
    expect(convert(1, 'kwh', 'j', 'energy')).toBeCloseTo(3.6e6, 5);
  });

  it('converts 1 m/s to km/h', () => {
    expect(convert(1, 'mps', 'kmh', 'speed')).toBeCloseTo(3.6, 10);
  });

  it('returns 0 for unknown category', () => {
    expect(convert(1, 'm', 'm', 'nonexistent_category' as any)).toBe(0);
  });

  it('returns 0 for unknown unit ID', () => {
    expect(convert(1, 'nonexistent_unit', 'm', 'length')).toBe(0);
  });

  it('converts same unit to itself (42 m → m)', () => {
    expect(convert(42, 'm', 'm', 'length')).toBeCloseTo(42, 10);
  });

  it('applies prefix factor to input (simulate km = 1000 * m)', () => {
    expect(convert(1, 'm', 'm', 'length', 1000, 1)).toBeCloseTo(1000, 10);
  });

  it('applies prefix factors to output (simulate result in cm = /100)', () => {
    expect(convert(1, 'm', 'm', 'length', 1, 0.01)).toBeCloseTo(100, 10);
  });
});

// ---------------------------------------------------------------------------
// 2. parseUnitText() — characterization
// ---------------------------------------------------------------------------
describe('characterization: parseUnitText()', () => {
  it('parses "42 s" to value 42 with time unit', () => {
    const result = parseUnitText('42 s');
    expect(result.value).toBe(42);
    expect(result.unitId).toBe('s');
    expect(result.categoryId).toBe('time');
  });

  it('parses "3.14 m" to value 3.14 with length unit', () => {
    const result = parseUnitText('3.14 m');
    expect(result.value).toBeCloseTo(3.14, 10);
    expect(result.unitId).toBe('m');
    expect(result.categoryId).toBe('length');
  });

  it('parses empty string with defaults (value 1, null ids)', () => {
    const result = parseUnitText('');
    expect(result.value).toBe(1);
    expect(result.categoryId).toBeNull();
    expect(result.unitId).toBeNull();
  });

  it('parses bare number with no unit (null ids)', () => {
    const result = parseUnitText('42');
    expect(result.value).toBe(42);
    expect(result.categoryId).toBeNull();
    expect(result.unitId).toBeNull();
  });

  it('parses scientific notation "1.5e3 s"', () => {
    const result = parseUnitText('1.5e3 s');
    expect(result.value).toBeCloseTo(1500, 10);
    expect(result.unitId).toBe('s');
  });

  it('parses negative values "-5 m"', () => {
    const result = parseUnitText('-5 m');
    expect(result.value).toBe(-5);
    expect(result.unitId).toBe('m');
  });

  it('parses unit-only "kg" with value defaulting to 1', () => {
    const result = parseUnitText('kg');
    expect(result.value).toBe(1);
    expect(result.unitId).toBe('kg');
    expect(result.categoryId).toBe('mass');
  });

  it('parses "1 J" as energy unit', () => {
    const result = parseUnitText('1 J');
    expect(result.value).toBe(1);
    expect(result.categoryId).toBe('energy');
  });

  it('parses "1 km" and recognizes kilo prefix (value includes prefix factor)', () => {
    const result = parseUnitText('1 km');
    expect(result.value).toBe(1000);
    expect(result.unitId).toBe('m');
    expect(result.categoryId).toBe('length');
    expect(result.prefixId).toBe('kilo');
  });

  it('parses "0" as zero with no unit', () => {
    const result = parseUnitText('0');
    expect(result.value).toBe(0);
    expect(result.categoryId).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 3. translate() — localization characterization
//    UI_TRANSLATIONS keys use title-case (e.g. 'Length', 'Mass')
// ---------------------------------------------------------------------------
describe('characterization: translate()', () => {
  it('returns English for key "Length" in "en" language', () => {
    const result = translate('Length', 'en', UI_TRANSLATIONS);
    expect(result).toBe('Length');
  });

  it('returns English for key "Length" in "en-us" language', () => {
    const result = translate('Length', 'en-us', UI_TRANSLATIONS);
    expect(result).toBe('Length');
  });

  it('returns key itself for unknown translation key', () => {
    const result = translate('nonexistent_key_xyz', 'en', UI_TRANSLATIONS);
    expect(result).toBe('nonexistent_key_xyz');
  });

  it('translates "Mass" key to expected English string', () => {
    const result = translate('Mass', 'en', UI_TRANSLATIONS);
    expect(result).toBe('Mass');
  });

  it('translates "Temperature" key to expected English string', () => {
    const result = translate('Temperature', 'en', UI_TRANSLATIONS);
    expect(result).toBe('Temperature');
  });

  it('translates "Energy" key to expected English string', () => {
    const result = translate('Energy', 'en', UI_TRANSLATIONS);
    expect(result).toBe('Energy');
  });

  it('translates "Base Quantities" to German "de"', () => {
    const result = translate('Base Quantities', 'de', UI_TRANSLATIONS);
    expect(result).toBe('Basisgrößen');
  });

  it('translates "Mechanics" to German "de"', () => {
    const result = translate('Mechanics', 'de', UI_TRANSLATIONS);
    expect(result).toBe('Mechanik');
  });

  it('returns English fallback for missing language key', () => {
    const result = translate('Length', 'fr', UI_TRANSLATIONS);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 4. formatValue — number formatting characterization
// ---------------------------------------------------------------------------
describe('characterization: fixPrecision()', () => {
  it('returns 0 for 0', () => {
    expect(fixPrecision(0)).toBe(0);
  });

  it('returns 42 for 42 (integer)', () => {
    expect(fixPrecision(42)).toBe(42);
  });

  it('resolves floating point imprecision for 0.1 + 0.2', () => {
    const result = fixPrecision(0.1 + 0.2);
    expect(result).toBeCloseTo(0.3, 10);
  });

  it('returns Infinity unchanged', () => {
    expect(fixPrecision(Infinity)).toBe(Infinity);
  });

  it('returns -Infinity unchanged', () => {
    expect(fixPrecision(-Infinity)).toBe(-Infinity);
  });
});

describe('characterization: toFixedBanker()', () => {
  it('rounds 2.5 to 2 (rounds to even — banker rounding)', () => {
    expect(toFixedBanker(2.5, 0)).toBe('2');
  });

  it('rounds 3.5 to 4 (rounds to even — banker rounding)', () => {
    expect(toFixedBanker(3.5, 0)).toBe('4');
  });

  it('formats 1234.5678 to 2 decimal places', () => {
    expect(toFixedBanker(1234.5678, 2)).toBe('1234.57');
  });

  it('pads with zeros when requested precision exceeds significant digits', () => {
    expect(toFixedBanker(1, 3)).toBe('1.000');
  });

  it('formats negative number correctly', () => {
    expect(toFixedBanker(-3.456, 2)).toBe('-3.46');
  });
});

describe('characterization: cleanNumber()', () => {
  it('removes trailing zeros after decimal', () => {
    expect(cleanNumber(1.1, 6)).toBe('1.1');
  });

  it('removes unnecessary decimal point', () => {
    expect(cleanNumber(1.0, 6)).toBe('1');
  });

  it('rounds to 6 decimal precision', () => {
    expect(cleanNumber(1.23456789, 6)).toBe('1.234568');
  });

  it('handles zero', () => {
    expect(cleanNumber(0, 6)).toBe('0');
  });

  it('handles negative numbers', () => {
    expect(cleanNumber(-42.5, 6)).toBe('-42.5');
  });
});

describe('characterization: formatNumberWithSeparators()', () => {
  it('formats with UK style (comma thousands, period decimal)', () => {
    expect(formatNumberWithSeparators(1234567.89, 2, 'uk')).toBe('1,234,567.89');
  });

  it('formats with European style (space thousands, comma decimal)', () => {
    expect(formatNumberWithSeparators(1234567.89, 2, 'europe-latin')).toBe('1 234 567,89');
  });

  it('formats with Swiss style (apostrophe thousands)', () => {
    expect(formatNumberWithSeparators(1234567.89, 2, 'swiss')).toBe("1'234'567.89");
  });

  it('formats with South Asian style (2-2-3 grouping: 12,34,567)', () => {
    expect(formatNumberWithSeparators(1234567, 0, 'south-asian')).toBe('12,34,567');
  });

  it('formats with period format (no thousands separator, period decimal)', () => {
    expect(formatNumberWithSeparators(1234.5, 1, 'period')).toBe('1234.5');
  });

  it('formats with comma format (no thousands separator, comma decimal)', () => {
    expect(formatNumberWithSeparators(1234.5, 1, 'comma')).toBe('1234,5');
  });

  it('formats integer with UK style (no decimal)', () => {
    expect(formatNumberWithSeparators(1000, 0, 'uk')).toBe('1,000');
  });
});

// ---------------------------------------------------------------------------
// 5. RPN Stack dimensional operations — characterization
// ---------------------------------------------------------------------------
describe('characterization: multiplyDimensions()', () => {
  it('multiplies length × length = area', () => {
    const result = multiplyDimensions({ length: 1 }, { length: 1 });
    expect(result).toEqual({ length: 2 });
  });

  it('multiplies force × length = energy', () => {
    const force: DimensionalFormula = { mass: 1, length: 1, time: -2 };
    const length: DimensionalFormula = { length: 1 };
    const result = multiplyDimensions(force, length);
    expect(result).toEqual({ mass: 1, length: 2, time: -2 });
  });

  it('multiplies dimensionless × energy = energy', () => {
    const result = multiplyDimensions({}, { mass: 1, length: 2, time: -2 });
    expect(result).toEqual({ mass: 1, length: 2, time: -2 });
  });

  it('multiplies current × time = charge (C = A⋅s)', () => {
    const result = multiplyDimensions({ current: 1 }, { time: 1 });
    expect(result).toEqual({ current: 1, time: 1 });
  });

  it('removes zero exponents from result (cancellation)', () => {
    const result = multiplyDimensions({ length: 1, time: -1 }, { time: 1 });
    expect(result.time).toBeUndefined();
    expect(result.length).toBe(1);
  });
});

describe('characterization: divideDimensions()', () => {
  it('divides area by length = length', () => {
    const result = divideDimensions({ length: 2 }, { length: 1 });
    expect(result).toEqual({ length: 1 });
  });

  it('divides energy by force = length', () => {
    const energy: DimensionalFormula = { mass: 1, length: 2, time: -2 };
    const force: DimensionalFormula = { mass: 1, length: 1, time: -2 };
    const result = divideDimensions(energy, force);
    expect(result).toEqual({ length: 1 });
  });

  it('divides power by current squared = resistance (Ω = W⋅A⁻²)', () => {
    const power: DimensionalFormula = { mass: 1, length: 2, time: -3 };
    const currentSq: DimensionalFormula = { current: 2 };
    const result = divideDimensions(power, currentSq);
    expect(result).toEqual({ mass: 1, length: 2, time: -3, current: -2 });
  });

  it('divides length by time = speed', () => {
    const result = divideDimensions({ length: 1 }, { time: 1 });
    expect(result).toEqual({ length: 1, time: -1 });
  });
});

describe('characterization: subtractDimensions()', () => {
  it('subtracts force from energy = length', () => {
    const energy: DimensionalFormula = { mass: 1, length: 2, time: -2 };
    const force: DimensionalFormula = { mass: 1, length: 1, time: -2 };
    const result = subtractDimensions(energy, force);
    expect(result).toEqual({ length: 1 });
  });

  it('subtracts empty dims from energy = energy unchanged', () => {
    const energy: DimensionalFormula = { mass: 1, length: 2, time: -2 };
    const result = subtractDimensions(energy, {});
    expect(result).toEqual(energy);
  });
});

// ---------------------------------------------------------------------------
// 6. Dimensional signature & equality — characterization
// ---------------------------------------------------------------------------
describe('characterization: getDimensionSignature()', () => {
  it('returns empty string for empty dimensions', () => {
    expect(getDimensionSignature({})).toBe('');
  });

  it('returns sorted key:value pairs for energy (kg⋅m²⋅s⁻²)', () => {
    const energy: DimensionalFormula = { mass: 1, length: 2, time: -2 };
    expect(getDimensionSignature(energy)).toBe('length:2,mass:1,time:-2');
  });

  it('produces same signature regardless of key insertion order', () => {
    const a = getDimensionSignature({ time: -2, mass: 1, length: 2 });
    const b = getDimensionSignature({ mass: 1, length: 2, time: -2 });
    expect(a).toBe(b);
  });

  it('excludes zero-value dimensions from signature', () => {
    const sig = getDimensionSignature({ length: 1, time: 0 });
    expect(sig).toBe('length:1');
  });

  it('returns signature for single dimension (length)', () => {
    expect(getDimensionSignature({ length: 1 })).toBe('length:1');
  });
});

describe('characterization: dimensionsEqual()', () => {
  it('returns true for identical energy dimensions', () => {
    const energy: DimensionalFormula = { mass: 1, length: 2, time: -2 };
    expect(dimensionsEqual(energy, { ...energy })).toBe(true);
  });

  it('returns false for different exponents', () => {
    expect(dimensionsEqual({ mass: 1, length: 2, time: -2 }, { mass: 1, length: 1, time: -2 })).toBe(false);
  });

  it('treats zero and absent key as equal', () => {
    expect(dimensionsEqual({ length: 1, time: 0 }, { length: 1 })).toBe(true);
  });

  it('returns true for two empty dimensions', () => {
    expect(dimensionsEqual({}, {})).toBe(true);
  });

  it('returns false when one is dimensionless and other is not', () => {
    expect(dimensionsEqual({}, { length: 1 })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 7. normalizeDimensions() — characterization
// ---------------------------------------------------------------------------
describe('characterization: normalizeDimensions()', () => {
  it('normalizes energy (kg⋅m²⋅s⁻²) to J', () => {
    const energy: DimensionalFormula = { mass: 1, length: 2, time: -2 };
    expect(normalizeDimensions(energy)).toBe('J');
  });

  it('normalizes power (kg⋅m²⋅s⁻³) to W', () => {
    const power: DimensionalFormula = { mass: 1, length: 2, time: -3 };
    expect(normalizeDimensions(power)).toBe('W');
  });

  it('normalizes force (kg⋅m⋅s⁻²) to N', () => {
    const force: DimensionalFormula = { mass: 1, length: 1, time: -2 };
    expect(normalizeDimensions(force)).toBe('N');
  });

  it('normalizes electric resistance (kg⋅m²⋅s⁻³⋅A⁻²) to Ω', () => {
    const resistance: DimensionalFormula = { mass: 1, length: 2, time: -3, current: -2 };
    expect(normalizeDimensions(resistance)).toBe('Ω');
  });

  it('normalizes empty dimensions to empty string', () => {
    expect(normalizeDimensions({})).toBe('');
  });

  it('normalizes capacitance (kg⁻¹⋅m⁻²⋅s⁴⋅A²) to F', () => {
    const capacitance: DimensionalFormula = { mass: -1, length: -2, time: 4, current: 2 };
    expect(normalizeDimensions(capacitance)).toBe('F');
  });

  it('normalizes charge (A⋅s) to C', () => {
    const charge: DimensionalFormula = { current: 1, time: 1 };
    expect(normalizeDimensions(charge)).toBe('C');
  });
});

// ---------------------------------------------------------------------------
// 8. CATEGORY_DIMENSIONS canonical data — characterization
// ---------------------------------------------------------------------------
describe('characterization: CATEGORY_DIMENSIONS canonical data', () => {
  it('energy category has correct SI dimensions (J = kg⋅m²⋅s⁻²)', () => {
    const energy = CATEGORY_DIMENSIONS['energy'];
    expect(energy).toBeDefined();
    expect(energy.dimensions).toEqual({ mass: 1, length: 2, time: -2 });
    expect(energy.isBase).toBe(false);
  });

  it('length category is a base dimension with {length: 1}', () => {
    const length = CATEGORY_DIMENSIONS['length'];
    expect(length).toBeDefined();
    expect(length.dimensions).toEqual({ length: 1 });
    expect(length.isBase).toBe(true);
  });

  it('force category has Newton dimensions (kg⋅m⋅s⁻²)', () => {
    const force = CATEGORY_DIMENSIONS['force'];
    expect(force).toBeDefined();
    expect(force.dimensions).toEqual({ mass: 1, length: 1, time: -2 });
  });

  it('all 9 base SI dimensions are present and marked isBase', () => {
    const baseDims = ['length', 'mass', 'time', 'current', 'temperature', 'amount', 'intensity', 'angle', 'solid_angle'];
    for (const dim of baseDims) {
      expect(CATEGORY_DIMENSIONS[dim], `${dim} should exist`).toBeDefined();
      expect(CATEGORY_DIMENSIONS[dim].isBase, `${dim} should be isBase`).toBe(true);
    }
  });

  it('excluded categories are marked as non-base', () => {
    for (const catId of EXCLUDED_CROSS_DOMAIN_CATEGORIES) {
      if (CATEGORY_DIMENSIONS[catId]) {
        expect(CATEGORY_DIMENSIONS[catId].isBase, `${catId} should not be isBase`).toBe(false);
      }
    }
  });

  it('data and math categories have empty dimensions', () => {
    expect(CATEGORY_DIMENSIONS['data'].dimensions).toEqual({});
    expect(CATEGORY_DIMENSIONS['math'].dimensions).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// 9. PREFERRED_REPRESENTATIONS — characterization
// ---------------------------------------------------------------------------
describe('characterization: PREFERRED_REPRESENTATIONS', () => {
  it('has entry for kinematic viscosity (Stokes)', () => {
    const key = 'length:2,time:-1';
    expect(PREFERRED_REPRESENTATIONS[key]).toBeDefined();
    expect(PREFERRED_REPRESENTATIONS[key].displaySymbol).toBe('St');
    expect(PREFERRED_REPRESENTATIONS[key].isSI).toBe(false);
    expect(PREFERRED_REPRESENTATIONS[key].allowPrefixes).toBe(true);
  });

  it('has entry for action / angular momentum (J⋅s)', () => {
    const key = 'length:2,mass:1,time:-1';
    expect(PREFERRED_REPRESENTATIONS[key]).toBeDefined();
    expect(PREFERRED_REPRESENTATIONS[key].displaySymbol).toBe('J⋅s');
    expect(PREFERRED_REPRESENTATIONS[key].isSI).toBe(true);
  });

  it('has entry for equivalent dose (Gy)', () => {
    const key = 'length:2,time:-2';
    expect(PREFERRED_REPRESENTATIONS[key]).toBeDefined();
    expect(PREFERRED_REPRESENTATIONS[key].displaySymbol).toBe('Gy');
  });

  it('each entry has all required fields with correct types', () => {
    for (const [, rep] of Object.entries(PREFERRED_REPRESENTATIONS)) {
      expect(typeof rep.displaySymbol).toBe('string');
      expect(rep.displaySymbol.length).toBeGreaterThan(0);
      expect(typeof rep.isSI).toBe('boolean');
      expect(typeof rep.allowPrefixes).toBe('boolean');
    }
  });

  it('has exactly 5 preferred representations', () => {
    expect(Object.keys(PREFERRED_REPRESENTATIONS)).toHaveLength(5);
  });
});
