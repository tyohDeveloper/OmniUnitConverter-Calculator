import { describe, it, expect } from 'vitest';
import { formatCalcValueDisplay } from '../client/src/lib/calculator/formatCalcValueDisplay';

/**
 * Regression coverage for the divide-vs-siToDisplay unification
 * (Option A of the calc-display-formula-inconsistency task, resolved
 * 2026-08-05).
 *
 * Prior to the fix, formatCalcValueDisplay used
 *   displayValue = siValue / kgResult.effectivePrefixFactor
 * which was correct for kg's baked prefix and for prefix='none', but
 * wrong for:
 *   1. Powered prefixes (km² should divide by 10⁶, not 10³)
 *   2. Temperature offsets (K → °C requires subtract-offset, not just
 *      scale)
 *   3. Inverse units (photon wavelength ≠ simple divide)
 *   4. Non-mass base units with a non-'none' prefix (e.g. km, ms)
 *
 * All simple-mode CalcValue producers set prefix: 'none', so the
 * simple-mode field path never actually hit these cases. The bug was
 * reachable via RPN paste, which is the only CalcValue producer that
 * writes a non-'none' prefix; after `push`, that value could be
 * copied from Y/S2/S3 or displayed in the RPN row, both of which
 * used the divide formula.
 *
 * The identity formatter (returns the number as a string) is used so
 * the tests assert on the raw numeric displayValue, not locale
 * formatting.
 */

const identityFormatter = (n: number, _p: number): string => String(n);

describe('formatCalcValueDisplay', () => {
  describe('powered-prefix correctness (previously wrong)', () => {
    it('km² divides by 10⁶, not 10³', () => {
      // 1 km² = 1e6 m². Given siValue 1e6, prefix=kilo, expect 1.
      const { displayValue } = formatCalcValueDisplay(1e6, 'm²', 'kilo', 6, identityFormatter);
      expect(displayValue).toBeCloseTo(1, 9);
    });

    it('mm³ multiplies siValue by 10⁹', () => {
      // 1 m³ = 1e9 mm³. Given siValue 1 m³, prefix=milli, expect 1e9.
      const { displayValue } = formatCalcValueDisplay(1, 'm³', 'milli', 0, identityFormatter);
      expect(displayValue).toBeCloseTo(1e9, 0);
    });

    it('cm² multiplies siValue by 10⁴', () => {
      // 1 m² = 1e4 cm². Given siValue 1 m², prefix=centi, expect 1e4.
      const { displayValue } = formatCalcValueDisplay(1, 'm²', 'centi', 0, identityFormatter);
      expect(displayValue).toBeCloseTo(1e4, 0);
    });
  });

  describe('temperature offsets (previously wrong for non-none prefix)', () => {
    it('K → °C at 273.15 K yields 0 °C', () => {
      const { displayValue } = formatCalcValueDisplay(273.15, '°C', 'none', 2, identityFormatter);
      expect(displayValue).toBeCloseTo(0, 6);
    });

    it('K → °C at 373.15 K yields 100 °C', () => {
      const { displayValue } = formatCalcValueDisplay(373.15, '°C', 'none', 2, identityFormatter);
      expect(displayValue).toBeCloseTo(100, 6);
    });

    it('K → °F at 273.15 K yields 32 °F', () => {
      const { displayValue } = formatCalcValueDisplay(273.15, '°F', 'none', 2, identityFormatter);
      expect(displayValue).toBeCloseTo(32, 6);
    });
  });

  describe('kg (baked-prefix special case, was already correct)', () => {
    it('kg with prefix=none returns siValue unchanged', () => {
      const { displayValue } = formatCalcValueDisplay(2.5, 'kg', 'none', 3, identityFormatter);
      expect(displayValue).toBeCloseTo(2.5, 9);
    });

    it('g (kg → g via prefix=none on symbol g) shows siValue × 1000', () => {
      const { displayValue } = formatCalcValueDisplay(1, 'g', 'none', 0, identityFormatter);
      expect(displayValue).toBeCloseTo(1000, 6);
    });
  });

  describe('prefix=none coincidence with old formula (should not regress)', () => {
    it('m with prefix=none returns siValue', () => {
      const { displayValue } = formatCalcValueDisplay(42, 'm', 'none', 2, identityFormatter);
      expect(displayValue).toBeCloseTo(42, 9);
    });

    it('m² with prefix=none returns siValue', () => {
      const { displayValue } = formatCalcValueDisplay(1e6, 'm²', 'none', 0, identityFormatter);
      expect(displayValue).toBeCloseTo(1e6, 0);
    });

    it('s with prefix=none returns siValue', () => {
      const { displayValue } = formatCalcValueDisplay(3.14, 's', 'none', 2, identityFormatter);
      expect(displayValue).toBeCloseTo(3.14, 6);
    });
  });

  describe('non-mass base unit with prefix (previously wrong for RPN paste)', () => {
    it('km divides siValue by 10³', () => {
      const { displayValue } = formatCalcValueDisplay(1000, 'm', 'kilo', 3, identityFormatter);
      expect(displayValue).toBeCloseTo(1, 9);
    });

    it('ms multiplies siValue by 10³', () => {
      const { displayValue } = formatCalcValueDisplay(1, 's', 'milli', 0, identityFormatter);
      expect(displayValue).toBeCloseTo(1000, 6);
    });
  });

  describe('unitSymbol composition (single-sourced via composeUnitDisplaySymbol)', () => {
    it('km emits "km"', () => {
      const { unitSymbol } = formatCalcValueDisplay(1000, 'm', 'kilo', 0, identityFormatter);
      expect(unitSymbol).toBe('km');
    });

    it('ms emits "ms"', () => {
      const { unitSymbol } = formatCalcValueDisplay(1, 's', 'milli', 0, identityFormatter);
      expect(unitSymbol).toBe('ms');
    });

    it('kg-baked-prefix case: applies prefix into the symbol itself', () => {
      // kg with prefix=none is just "kg" (base symbol).
      const { unitSymbol } = formatCalcValueDisplay(1, 'kg', 'none', 0, identityFormatter);
      expect(unitSymbol).toBe('kg');
    });

    it('°C with prefix=none emits "°C"', () => {
      const { unitSymbol } = formatCalcValueDisplay(273.15, '°C', 'none', 0, identityFormatter);
      expect(unitSymbol).toBe('°C');
    });
  });

  describe('formattedValue uses caller-supplied formatter', () => {
    it('routes displayValue through the formatter with the given precision', () => {
      const withPrecision = (n: number, p: number): string => n.toFixed(p);
      const { formattedValue } = formatCalcValueDisplay(1000, 'm', 'kilo', 4, withPrecision);
      // displayValue = 1, formatted with precision 4 → "1.0000"
      expect(formattedValue).toBe('1.0000');
    });
  });
});
