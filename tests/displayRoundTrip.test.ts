import { describe, it, expect } from 'vitest';
import { displayToSI } from '../client/src/lib/unit-symbols/displayToSI';
import { siToDisplay } from '../client/src/lib/unit-symbols/siToDisplay';

/**
 * Round-trip invariants for the (displayToSI, siToDisplay) pair.
 *
 * These functions are the "unit-symbol arithmetic" primitives that
 * back every calculator display path and the converter's own compute
 * step. §1.6 (single-sourced computation) makes each function a
 * single source of truth for its direction of the transform, but the
 * two functions are algebraic inverses of each other — a change to
 * one without a matching change to the other would produce a display
 * that disagrees with the input parser (or the reverse).
 *
 * These tests pin the algebraic invariant f⁻¹∘f = id in both
 * directions, across every non-trivial branch of both functions:
 *
 *   - Regular linear units (m, s, W, …)
 *   - kg baked-prefix (kg, g, mg, kg⋅m⁻³ composite)
 *   - Temperature with offset (°C, °F, °Ré)
 *   - Inverse units (photon λ, radioactive decay τ)
 *   - Powered prefixes (m² with prefixPower=2, m³ with prefixPower=3)
 *   - Composite / unknown symbols (m²·s⁻¹) that fall through the
 *     lookup null branch
 *
 * If either function's formula drifts in isolation, at least one of
 * these round-trips will fail.
 *
 * Absolute tolerance: 1e-9 for most cases, relaxed to 1e-6 for
 * temperature (subtraction near-cancellation) and to a relative
 * tolerance for values that legitimately span many orders of
 * magnitude (photon wavelength).
 */

const EPS_TIGHT = 1e-9;
const EPS_TEMP = 1e-6;

// Absolute-error assertion. For values close to zero, this is what
// you want. For values spanning orders of magnitude, use expectRel.
function expectClose(actual: number, expected: number, eps: number, label: string): void {
  expect(Math.abs(actual - expected), `${label}: |${actual} - ${expected}| > ${eps}`).toBeLessThan(eps);
}

// Relative-error assertion for values that legitimately span orders
// of magnitude (photon wavelength, atomic-scale quantities).
function expectRel(actual: number, expected: number, relEps: number, label: string): void {
  const denom = Math.max(Math.abs(expected), 1e-300);
  expect(Math.abs(actual - expected) / denom, `${label}: rel err ${Math.abs(actual - expected) / denom} > ${relEps}`).toBeLessThan(relEps);
}

// Assert round-trip in both directions for a (symbol, prefix) pair.
function assertRoundTrip(symbol: string, prefix: string, displayValues: number[], eps = EPS_TIGHT): void {
  for (const d of displayValues) {
    const si = displayToSI(d, symbol, prefix);
    const backToDisplay = siToDisplay(si, symbol, prefix);
    expectClose(backToDisplay, d, eps, `d→si→d(${symbol}, ${prefix}, ${d})`);

    const si2 = displayToSI(backToDisplay, symbol, prefix);
    expectClose(si2, si, Math.max(eps, Math.abs(si) * 1e-12), `si→d→si(${symbol}, ${prefix}, ${d})`);
  }
}

describe('displayToSI / siToDisplay — round-trip invariants', () => {
  describe('regular linear units', () => {
    it('m with various prefixes', () => {
      for (const pfx of ['none', 'kilo', 'milli', 'mega', 'nano']) {
        assertRoundTrip('m', pfx, [1, 42, 0.5, 1e-6, 1e12]);
      }
    });
    it('s with various prefixes', () => {
      for (const pfx of ['none', 'milli', 'micro', 'nano', 'pico']) {
        assertRoundTrip('s', pfx, [1, 3.14, 60, 86400]);
      }
    });
    it('N (Newton, SI derived, factor 1)', () => {
      assertRoundTrip('N', 'none', [1, 9.81, 1e6]);
      assertRoundTrip('N', 'kilo', [1, 9.81, 100]);
    });
    it('W (Watt, SI derived, factor 1)', () => {
      assertRoundTrip('W', 'none', [1, 100, 1e9]);
      assertRoundTrip('W', 'mega', [1, 100, 1e-3]);
    });
  });

  describe('kg baked-prefix special case', () => {
    it('kg with prefix=none is identity', () => {
      assertRoundTrip('kg', 'none', [1, 2.5, 1e-6, 1e6]);
    });
    it('kg with prefix=kilo is also identity (no double-kilo)', () => {
      // §applyPrefixToKgUnit: kg+kilo returns effectivePrefixFactor=1
      // (there is no "kilo-kilogram"), so the round-trip is 1 kg = 1 kg.
      assertRoundTrip('kg', 'kilo', [1, 2.5, 1e-6]);
    });
    it('kg with milli prefix (mg): 1 mg = 1e-6 kg round-trips', () => {
      assertRoundTrip('kg', 'milli', [1, 0.001, 1e6]);
    });
    it('kg with mega prefix (Mg): 1 Mg = 1000 kg round-trips', () => {
      assertRoundTrip('kg', 'mega', [1, 2.5]);
    });
    it('composite kg⋅m⁻³ (density) round-trips with milli', () => {
      assertRoundTrip('kg⋅m⁻³', 'milli', [1, 500, 1e-3]);
    });
  });

  describe('temperature (offset-aware)', () => {
    it('°C round-trips at freezing, boiling, and cryogenic', () => {
      assertRoundTrip('°C', 'none', [0, 100, -273.15, -40, 25], EPS_TEMP);
    });
    it('°F round-trips at freezing, boiling, and cryogenic', () => {
      assertRoundTrip('°F', 'none', [32, 212, -40, 98.6], EPS_TEMP);
    });
    it('°Ré round-trips', () => {
      assertRoundTrip('°Ré', 'none', [0, 80, -40], EPS_TEMP);
    });
  });

  describe('inverse units', () => {
    it('photon λ (wavelength ↔ energy)', () => {
      // λ is inversely related to energy; test with values that
      // stay in the numerically well-conditioned range for double.
      const symbol = 'λ';
      for (const d of [1e-9, 5e-7, 1e-6]) {
        const si = displayToSI(d, symbol, 'none');
        const back = siToDisplay(si, symbol, 'none');
        expectRel(back, d, 1e-12, `λ round-trip at ${d}`);
      }
    });
    it('radioactive decay τ (s) round-trips', () => {
      assertRoundTrip('τ (s)', 'none', [1, 60, 3600, 1e-6]);
    });
  });

  describe('powered prefixes (m² prefixPower=2, m³ prefixPower=3)', () => {
    it('m² × {none, centi, kilo}', () => {
      assertRoundTrip('m²', 'none', [1, 1e4, 1e6, 0.5]);
      assertRoundTrip('m²', 'centi', [1, 1e4, 100]);
      assertRoundTrip('m²', 'kilo', [1e6, 1, 100]);
    });
    it('m³ × {none, milli, kilo}', () => {
      assertRoundTrip('m³', 'none', [1, 1e9, 0.001]);
      assertRoundTrip('m³', 'milli', [1, 1000]);
      assertRoundTrip('m³', 'kilo', [1e9, 1]);
    });
    it('regression: km² and km³ compute correctly (previously wrong)', () => {
      // 1 km² = 1,000,000 m² (prefix squared)
      expect(displayToSI(1, 'm²', 'kilo')).toBeCloseTo(1e6, 6);
      expect(siToDisplay(1e6, 'm²', 'kilo')).toBeCloseTo(1, 9);
      // 1 km³ = 1,000,000,000 m³ (prefix cubed)
      expect(displayToSI(1, 'm³', 'kilo')).toBeCloseTo(1e9, 0);
      expect(siToDisplay(1e9, 'm³', 'kilo')).toBeCloseTo(1, 9);
    });
  });

  describe('composite / unknown symbol fallthrough', () => {
    it('unknown symbol scales by prefix only', () => {
      // m²·s⁻¹ is a composite that isn't in CONVERSION_DATA as an
      // individual unit. lookupUnitForSymbol returns null, so both
      // fns fall through to the prefix-only branch (prefixPower
      // defaults to 1).
      assertRoundTrip('m²·s⁻¹', 'centi', [1, 100, 0.01]);
      assertRoundTrip('m²·s⁻¹', 'kilo', [1, 1e-3]);
      assertRoundTrip('m²·s⁻¹', 'none', [1, 42]);
    });
    it('fully unknown symbol also round-trips (defensive)', () => {
      // A symbol that doesn't exist anywhere in the catalog. The
      // functions should still be exact inverses via the null
      // lookup path.
      assertRoundTrip('xyz_never_defined', 'milli', [1, 5, 1e3]);
    });
  });

  describe('SI-base identity when prefix=none, factor=1, offset=0', () => {
    // For a unit that is exactly the SI base (factor 1, no offset,
    // linear, not inverse, not kg-with-baked-prefix), prefix=none is
    // the identity transform in both directions. This is a trivial
    // consequence of the algebra but worth pinning since it's the
    // hot path for simple-mode field display.
    it('m is identity', () => {
      expect(siToDisplay(42, 'm', 'none')).toBe(42);
      expect(displayToSI(42, 'm', 'none')).toBe(42);
    });
    it('s is identity', () => {
      expect(siToDisplay(3.14, 's', 'none')).toBe(3.14);
      expect(displayToSI(3.14, 's', 'none')).toBe(3.14);
    });
    it('K is identity (temperature SI base)', () => {
      expect(siToDisplay(273.15, 'K', 'none')).toBe(273.15);
      expect(displayToSI(273.15, 'K', 'none')).toBe(273.15);
    });
  });
});
