import { describe, it, expect } from 'vitest';
import { convert, CONVERSION_DATA, isNonLinearUnit, getComparisonUnits } from '../client/src/lib/conversion-data';
import { CONVERSION_FUNCTIONS } from '../client/src/lib/units/conversionFunctionRegistry';

const logCat = CONVERSION_DATA.find(c => c.id === 'logarithmic')!;
const dataCat = CONVERSION_DATA.find(c => c.id === 'data')!;
const concCat = CONVERSION_DATA.find(c => c.id === 'concentration')!;

describe('Logarithmic Scales category', () => {
  it('exists with ratio base and dB/EV/Np/B/decade units', () => {
    expect(logCat).toBeDefined();
    const ids = logCat.units.map(u => u.id);
    expect(ids).toEqual(['ratio', 'db', 'stop', 'neper', 'bel', 'decade']);
  });

  it('converts among log units linearly: 1 B = 10 dB', () => {
    expect(convert(1, 'bel', 'db', 'logarithmic')).toBeCloseTo(10, 12);
    expect(convert(30, 'db', 'bel', 'logarithmic')).toBeCloseTo(3, 12);
  });

  it('1 Np ≈ 8.685889638 dB (power-ratio sense)', () => {
    expect(convert(1, 'neper', 'db', 'logarithmic')).toBeCloseTo(20 / Math.LN10, 9);
    expect(convert(1, 'neper', 'db', 'logarithmic')).toBeCloseTo(8.685889638, 8);
  });

  it('1 decade = 10 dB = 1 B = log₂10 ≈ 3.3219 stops', () => {
    expect(convert(1, 'decade', 'db', 'logarithmic')).toBeCloseTo(10, 12);
    expect(convert(1, 'decade', 'bel', 'logarithmic')).toBeCloseTo(1, 12);
    expect(convert(1, 'decade', 'stop', 'logarithmic')).toBeCloseTo(Math.log2(10), 12);
  });

  it('converts to/from the dimensionless power ratio', () => {
    expect(convert(20, 'db', 'ratio', 'logarithmic')).toBeCloseTo(100, 10);
    expect(convert(1000, 'ratio', 'db', 'logarithmic')).toBeCloseTo(30, 12);
    expect(convert(3, 'stop', 'ratio', 'logarithmic')).toBeCloseTo(8, 12);
    expect(convert(1, 'neper', 'ratio', 'logarithmic')).toBeCloseTo(Math.exp(2), 12);
  });

  it('round-trips dB ↔ Np ↔ EV', () => {
    for (const v of [0.5, 3, 17.25]) {
      const np = convert(v, 'db', 'neper', 'logarithmic');
      expect(convert(np, 'neper', 'db', 'logarithmic')).toBeCloseTo(v, 10);
      const ev = convert(v, 'db', 'stop', 'logarithmic');
      expect(convert(ev, 'stop', 'db', 'logarithmic')).toBeCloseTo(v, 10);
    }
  });

  it('log units are non-linear and excluded from factor-based consumers', () => {
    for (const unit of logCat.units) {
      if (unit.id === 'ratio') {
        expect(isNonLinearUnit(unit)).toBe(false);
      } else {
        expect(isNonLinearUnit(unit)).toBe(true);
      }
    }
  });

  it('JSON factors match pair.toBase(1) for all log units', () => {
    for (const unit of logCat.units) {
      if (!unit.conversionFunction) continue;
      expect(unit.factor).toBe(CONVERSION_FUNCTIONS[unit.conversionFunction].toBase(1));
    }
  });
});

describe('pH in concentration category', () => {
  const ph = concCat.units.find(u => u.id === 'ph')!;

  it('exists and is non-linear', () => {
    expect(ph).toBeDefined();
    expect(isNonLinearUnit(ph)).toBe(true);
  });

  it('pH 7 = 1e-7 mol/L; pH 0 = 1 mol/L', () => {
    expect(convert(7, 'ph', 'mol_l', 'concentration')).toBeCloseTo(1e-7, 20);
    expect(convert(0, 'ph', 'mol_l', 'concentration')).toBeCloseTo(1, 12);
  });

  it('mol/L → pH inverts correctly and round-trips', () => {
    expect(convert(1e-3, 'mol_l', 'ph', 'concentration')).toBeCloseTo(3, 12);
    const molL = convert(4.5, 'ph', 'mol_l', 'concentration');
    expect(convert(molL, 'mol_l', 'ph', 'concentration')).toBeCloseTo(4.5, 10);
  });
});

describe('Information-entropy units in data category', () => {
  it('shannon equals one bit', () => {
    expect(convert(1, 'shannon', 'bit', 'data')).toBeCloseTo(1, 12);
  });

  it('1 hartley = log₂10 shannon ≈ 3.3219 Sh; dit equals hartley', () => {
    expect(convert(1, 'hartley', 'shannon', 'data')).toBeCloseTo(Math.log2(10), 12);
    expect(convert(1, 'dit', 'hartley', 'data')).toBeCloseTo(1, 12);
  });

  it('1 nat = log₂e shannon ≈ 1.4427 Sh', () => {
    expect(convert(1, 'nat', 'shannon', 'data')).toBeCloseTo(Math.log2(Math.E), 12);
  });

  it('1 deciban = 0.1 hartley', () => {
    expect(convert(1, 'deciban', 'hartley', 'data')).toBeCloseTo(0.1, 12);
  });

  it('entropy units are plain linear factor units (not excluded)', () => {
    for (const id of ['shannon', 'nat', 'hartley', 'deciban', 'dit']) {
      const unit = dataCat.units.find(u => u.id === id)!;
      expect(unit).toBeDefined();
      expect(isNonLinearUnit(unit)).toBe(false);
      expect(unit.conversionFunction).toBeUndefined();
      expect(unit.allowPrefixes).toBeUndefined();
    }
  });

  it('entropy symbols do not collide with storage units', () => {
    const symbols = dataCat.units.map(u => u.symbol);
    expect(new Set(symbols).size).toBe(symbols.length);
  });
});

describe('Comparison mode excludes non-linear units', () => {
  it('logarithmic category comparison list only offers the linear ratio unit', () => {
    const ids = getComparisonUnits('logarithmic', 'db').map(u => u.id);
    expect(ids).toEqual(['ratio']);
  });

  it('concentration comparison list omits pH', () => {
    const ids = getComparisonUnits('concentration', 'mol_l').map(u => u.id);
    expect(ids).not.toContain('ph');
    expect(ids).toContain('ppm');
  });

  it('returns an empty list for unknown categories', () => {
    expect(getComparisonUnits('nope', 'x')).toEqual([]);
  });

  it('excludes the source unit itself and keeps linear units elsewhere', () => {
    const ids = getComparisonUnits('data', 'b').map(u => u.id);
    expect(ids).not.toContain('b');
    expect(ids).toEqual(expect.arrayContaining(['bit', 'shannon', 'nat', 'hartley', 'deciban', 'dit']));
  });
});

describe('Exclusion of non-linear log units from factor-based consumers', () => {
  it('registry pairs for log scales lack the linear flag', () => {
    for (const name of ['log_decibel', 'log_bel', 'log_neper', 'log_stop', 'log_decade', 'ph_concentration']) {
      const pair = CONVERSION_FUNCTIONS[name];
      expect(pair, `missing ${name}`).toBeDefined();
      expect(pair.fromBase).toBeDefined();
      expect(pair.linear).toBeUndefined();
      expect(pair.oneWay).toBeUndefined();
    }
  });
});
