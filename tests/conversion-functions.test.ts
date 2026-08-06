import { describe, it, expect } from 'vitest';
import { convert, CONVERSION_DATA, applyMathFunction, isNonLinearUnit } from '../client/src/lib/conversion-data';
import { CONVERSION_FUNCTIONS } from '../client/src/lib/units/conversionFunctionRegistry';
import { validateCategoryJson } from '../client/src/lib/units/validateCategoryJson';

const baseUnit = { id: 'u', name: 'Unit', symbol: 'u', factor: 1 };
const category = (units: object[]) => ({ id: 'test', name: 'Test', baseUnit: 'unit', family: 'SI_QUANTITY' as const, units });

describe('Conversion function registry', () => {
  it('contains invertible linear paper pairs for all A/B/JIS sizes', () => {
    const names = [
      ...Array.from({ length: 11 }, (_, n) => `paper_a${n}`),
      ...Array.from({ length: 11 }, (_, n) => `paper_b${n}`),
      ...Array.from({ length: 9 }, (_, n) => `paper_jis_b${n}`),
    ];
    for (const name of names) {
      const pair = CONVERSION_FUNCTIONS[name];
      expect(pair, `missing registry entry ${name}`).toBeDefined();
      expect(pair.fromBase, `${name} missing inverse`).toBeDefined();
      expect(pair.linear).toBe(true);
      expect(pair.oneWay).toBeUndefined();
    }
  });

  it('contains one-way math entries backing the math category', () => {
    for (const name of ['sin', 'sqrt', 'log10', 'exp', 'floor']) {
      const pair = CONVERSION_FUNCTIONS[name];
      expect(pair?.oneWay).toBe(true);
      expect(pair?.fromBase).toBeUndefined();
    }
  });

  it('round-trips through every invertible pair', () => {
    for (const [name, pair] of Object.entries(CONVERSION_FUNCTIONS)) {
      if (!pair.fromBase) continue;
      // Non-linear (log-scale) pairs overflow/underflow for huge inputs,
      // so restrict them to a domain-safe value set.
      const values = pair.linear ? [1, 2.5, 0.001, 12345.678] : [0.5, 1, 2.5, 20];
      for (const v of values) {
        const roundTrip = pair.fromBase(pair.toBase(v));
        expect(Math.abs(roundTrip - v) / v, `round trip ${name}(${v})`).toBeLessThan(1e-14);
      }
    }
  });
});

describe('Zod validation of category JSON', () => {
  it('accepts a unit referencing a known invertible pair', () => {
    expect(() => validateCategoryJson(category([{ ...baseUnit, conversionFunction: 'paper_a0' }]))).not.toThrow();
  });

  it('rejects an unknown conversionFunction name', () => {
    expect(() => validateCategoryJson(category([{ ...baseUnit, conversionFunction: 'nope' }])))
      .toThrow(/unknown conversionFunction "nope"/);
  });

  it('rejects a one-way pair referenced via conversionFunction', () => {
    expect(() => validateCategoryJson(category([{ ...baseUnit, conversionFunction: 'sin' }])))
      .toThrow(/no inverse/);
  });

  it('rejects an unknown mathFunction name', () => {
    expect(() => validateCategoryJson(category([{ ...baseUnit, mathFunction: 'bogus' }])))
      .toThrow(/unknown mathFunction/);
  });

  it('all shipped category data passes validation (loaded without throwing)', () => {
    expect(CONVERSION_DATA.length).toBe(76);
  });
});

describe('Paper sizes: exact sheet-count ratios', () => {
  it('A0 → A1 is exactly 2 and A0 → A2 is exactly 4', () => {
    expect(convert(1, 'a0', 'a1', 'paper_sizes')).toBe(2);
    expect(convert(1, 'a0', 'a2', 'paper_sizes')).toBe(4);
  });

  it('within-series ratios are exact powers of two for A, B and JIS B', () => {
    for (const series of ['a', 'b'] as const) {
      for (let n = 1; n <= 10; n++) {
        expect(convert(1, `${series}0`, `${series}${n}`, 'paper_sizes')).toBe(2 ** n);
      }
    }
    for (let n = 1; n <= 8; n++) {
      expect(convert(1, 'jis_b0', `jis_b${n}`, 'paper_sizes')).toBe(2 ** n);
    }
  });

  it('adjacent sizes halve exactly (2 A5 = 1 A4, 2 B3 = 1 B2)', () => {
    expect(convert(1, 'a4', 'a5', 'paper_sizes')).toBe(2);
    expect(convert(2, 'a5', 'a4', 'paper_sizes')).toBe(1);
    expect(convert(1, 'b2', 'b3', 'paper_sizes')).toBe(2);
  });

  it('round-trips return the original value', () => {
    for (const [from, to] of [['a4', 'b4'], ['a0', 'jis_b3'], ['b5', 'us_letter']]) {
      const roundTrip = convert(convert(3.7, from, to, 'paper_sizes'), to, from, 'paper_sizes');
      expect(roundTrip).toBeCloseTo(3.7, 12);
    }
  });

  it('cross-series conversions use mm-derived anchor areas', () => {
    // A0 anchor 841×1189 mm → 0.999949 m²; B0 anchor 1000×1414 mm → 1.414 m²
    expect(convert(1, 'b0', 'a0', 'paper_sizes')).toBeCloseTo(1.414 / 0.999949, 12);
    // US Letter (plain factor) still interoperates: 1 m² of A0 vs Letter area
    expect(convert(1, 'a4', 'us_letter', 'paper_sizes')).toBeCloseTo(0.0624968125 / 0.060322, 10);
  });

  it('JSON factor stays in sync with the registered linear pair (toBase(1))', () => {
    for (const cat of CONVERSION_DATA) {
      for (const unit of cat.units) {
        if (!unit.conversionFunction) continue;
        const pair = CONVERSION_FUNCTIONS[unit.conversionFunction];
        expect(unit.factor, `${cat.id}/${unit.id} factor out of sync`).toBe(pair.toBase(1));
      }
    }
  });

  it('paper units remain linear and included for factor-based consumers', () => {
    const paper = CONVERSION_DATA.find(c => c.id === 'paper_sizes')!;
    for (const unit of paper.units) {
      expect(isNonLinearUnit(unit)).toBe(false);
    }
  });
});

describe('Regression: math and temperature unchanged', () => {
  it('applyMathFunction still works through the shared registry', () => {
    expect(applyMathFunction(Math.PI / 2, 'sin')).toBeCloseTo(1, 12);
    expect(applyMathFunction(16, 'sqrt')).toBe(4);
    expect(applyMathFunction(3, 'cube')).toBe(27);
    expect(applyMathFunction(5, undefined)).toBe(5);
  });

  it('mathFunction units are flagged non-linear for consumer exclusion', () => {
    expect(isNonLinearUnit({ mathFunction: 'sin' })).toBe(true);
    expect(isNonLinearUnit({})).toBe(false);
  });

  it('temperature offset conversions unchanged', () => {
    expect(convert(0, 'c', 'f', 'temperature')).toBeCloseTo(32, 10);
    expect(convert(100, 'c', 'k', 'temperature')).toBeCloseTo(373.15, 10);
  });
});

describe('Fuel economy: L/100 km reciprocal conversion', () => {
  it('converts L/100 km to km/L via the registry (reciprocal)', () => {
    expect(convert(5, 'l_100km', 'km_l', 'fuel_economy')).toBeCloseTo(20, 10);
    expect(convert(10, 'l_100km', 'km_l', 'fuel_economy')).toBeCloseTo(10, 10);
  });

  it('converts km/L to L/100 km (self-inverse)', () => {
    expect(convert(20, 'km_l', 'l_100km', 'fuel_economy')).toBeCloseTo(5, 10);
  });

  it('round-trips L/100 km through mpg (US)', () => {
    const mpg = convert(8, 'l_100km', 'mpg_us', 'fuel_economy');
    expect(mpg).toBeCloseTo(29.40195, 3);
    expect(convert(mpg, 'mpg_us', 'l_100km', 'fuel_economy')).toBeCloseTo(8, 8);
  });

  it('is flagged non-linear so factor-based consumers exclude it', () => {
    expect(isNonLinearUnit({ conversionFunction: 'fuel_l_per_100km' })).toBe(true);
  });
});

describe('Temperature: Réaumur (°Ré)', () => {
  it('0 °Ré = 0 °C and 80 °Ré = 100 °C', () => {
    expect(convert(0, 're', 'c', 'temperature')).toBeCloseTo(0, 10);
    expect(convert(80, 're', 'c', 'temperature')).toBeCloseTo(100, 10);
  });

  it('round-trips through Fahrenheit and Kelvin', () => {
    const f = convert(40, 're', 'f', 'temperature');
    expect(f).toBeCloseTo(122, 10);
    expect(convert(f, 'f', 're', 'temperature')).toBeCloseTo(40, 10);
    expect(convert(0, 'c', 're', 'temperature')).toBeCloseTo(0, 10);
    expect(convert(273.15, 'k', 're', 'temperature')).toBeCloseTo(0, 10);
  });
});
