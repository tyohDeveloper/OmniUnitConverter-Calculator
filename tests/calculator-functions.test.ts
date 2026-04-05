import { describe, it, expect } from 'vitest';
import {
  dimensionsEqual,
  isDimensionless,
  isDimensionEmpty,
  multiplyDimensions,
  divideDimensions,
  subtractDimensions,
  toSuperscript,
  formatDimensions,
  isValidSymbolRepresentation,
  countUnits,
  sumAbsExponents,
  canAddSubtract,
  canFactorOut,
  hasOnlyOriginalDimensions,
  isValidSIComposition,
  formatSIComposition,
  isRadians,
  fixPrecision,
  buildDirectUnitSymbol,
  buildDirectDimensions,
  applyRpnUnary,
  applyRpnBinary,
} from '../client/src/lib/calculator';
import type { DimensionalFormula } from '../client/src/lib/units/shared-types';

const mkVal = (value: number, dimensions: DimensionalFormula = {}): any => ({
  value, dimensions, prefix: 'none'
});

// ── dimensionsEqual ──────────────────────────────────────────────────────────

describe('dimensionsEqual', () => {
  it('should return true for identical dimensions', () => {
    expect(dimensionsEqual({ length: 1, time: -1 }, { length: 1, time: -1 })).toBe(true);
  });

  it('should return false for different dimensions', () => {
    expect(dimensionsEqual({ length: 1 }, { length: 2 })).toBe(false);
  });

  it('should treat 0-valued keys as absent', () => {
    expect(dimensionsEqual({ length: 1, mass: 0 }, { length: 1 })).toBe(true);
  });

  it('should return true for both empty', () => {
    expect(dimensionsEqual({}, {})).toBe(true);
  });
});

// ── isDimensionless ──────────────────────────────────────────────────────────

describe('isDimensionless', () => {
  it('returns true for empty dims', () => expect(isDimensionless({})).toBe(true));
  it('returns true for all-zero dims', () => expect(isDimensionless({ length: 0 })).toBe(true));
  it('returns false for non-zero dim', () => expect(isDimensionless({ length: 1 })).toBe(false));
});

// ── isDimensionEmpty ─────────────────────────────────────────────────────────

describe('isDimensionEmpty', () => {
  it('returns true for empty', () => expect(isDimensionEmpty({})).toBe(true));
  it('returns false for non-empty', () => expect(isDimensionEmpty({ length: 1 })).toBe(false));
});

// ── multiplyDimensions ───────────────────────────────────────────────────────

describe('multiplyDimensions', () => {
  it('should add exponents', () => {
    const result = multiplyDimensions({ length: 1 }, { length: 1, time: -1 });
    expect(result).toEqual({ length: 2, time: -1 });
  });

  it('should cancel out dimensions', () => {
    const result = multiplyDimensions({ length: 1 }, { length: -1 });
    expect(result.length).toBeFalsy();
  });
});

// ── divideDimensions ─────────────────────────────────────────────────────────

describe('divideDimensions', () => {
  it('should subtract exponents', () => {
    const result = divideDimensions({ length: 2 }, { length: 1 });
    expect(result).toEqual({ length: 1 });
  });

  it('should handle division creating negative exponents', () => {
    const result = divideDimensions({ mass: 1 }, { length: 1, time: 2 });
    expect(result).toEqual({ mass: 1, length: -1, time: -2 });
  });
});

// ── subtractDimensions ───────────────────────────────────────────────────────

describe('subtractDimensions', () => {
  it('should subtract exponents', () => {
    const result = subtractDimensions({ length: 3, time: -1 }, { length: 1 });
    expect(result).toEqual({ length: 2, time: -1 });
  });
});

// ── toSuperscript ────────────────────────────────────────────────────────────

describe('toSuperscript', () => {
  it('converts positive integers', () => expect(toSuperscript(2)).toBe('²'));
  it('converts negative integers', () => expect(toSuperscript(-1)).toBe('⁻¹'));
  it('converts 1 to superscript 1', () => expect(toSuperscript(1)).toBe('¹'));
  it('converts multi-digit', () => expect(toSuperscript(12)).toBe('¹²'));
});

// ── formatDimensions ─────────────────────────────────────────────────────────

describe('formatDimensions', () => {
  it('formats m/s as m⋅s⁻¹', () => {
    const result = formatDimensions({ length: 1, time: -1 });
    expect(result).toContain('m');
    expect(result).toContain('s');
  });

  it('returns empty string for dimensionless', () => {
    expect(formatDimensions({})).toBe('');
  });
});

// ── isValidSymbolRepresentation ──────────────────────────────────────────────

describe('isValidSymbolRepresentation', () => {
  it('returns true for valid symbol', () => expect(isValidSymbolRepresentation('m')).toBe(true));
  it('returns true for empty (treated as dimensionless)', () => expect(isValidSymbolRepresentation('')).toBe(true));
  it('returns true for 1 (dimensionless)', () => expect(isValidSymbolRepresentation('1')).toBe(true));
  it('returns false for duplicate base units', () => expect(isValidSymbolRepresentation('m⋅m')).toBe(false));
});

// ── countUnits ───────────────────────────────────────────────────────────────

describe('countUnits', () => {
  it('counts units in symbol string', () => {
    expect(countUnits('m⋅s⁻¹')).toBe(2);
    expect(countUnits('kg')).toBe(1);
    expect(countUnits('')).toBe(0);
    expect(countUnits('1')).toBe(0);
  });
});

// ── sumAbsExponents ──────────────────────────────────────────────────────────

describe('sumAbsExponents', () => {
  it('sums absolute values of all exponents from symbol string', () => {
    expect(sumAbsExponents('m⋅s⁻²')).toBe(3);
    expect(sumAbsExponents('m³')).toBe(3);
    expect(sumAbsExponents('1')).toBe(0);
    expect(sumAbsExponents('')).toBe(0);
    expect(sumAbsExponents('m')).toBe(1);
  });
});

// ── canAddSubtract ────────────────────────────────────────────────────────────

describe('canAddSubtract', () => {
  it('returns true when dimensions are equal', () => {
    const v1 = mkVal(3, { length: 1 });
    const v2 = mkVal(2, { length: 1 });
    expect(canAddSubtract(v1, v2)).toBe(true);
  });

  it('returns false when dimensions differ', () => {
    const v1 = mkVal(3, { length: 1 });
    const v2 = mkVal(2, { mass: 1 });
    expect(canAddSubtract(v1, v2)).toBe(false);
  });

  it('returns true when one is dimensionless', () => {
    const v1 = mkVal(3, {});
    const v2 = mkVal(2, { mass: 1 });
    expect(canAddSubtract(v1, v2)).toBe(true);
  });

  it('returns false when either value is null', () => {
    expect(canAddSubtract(null, mkVal(2))).toBe(false);
  });
});

// ── isRadians ────────────────────────────────────────────────────────────────

describe('isRadians', () => {
  it('returns true for pure angle dimension', () => {
    expect(isRadians({ angle: 1 })).toBe(true);
  });

  it('returns false when angle has extra dimensions', () => {
    expect(isRadians({ angle: 1, length: 1 })).toBe(false);
  });

  it('returns false for non-angle dim', () => {
    expect(isRadians({ length: 1 })).toBe(false);
  });

  it('returns false for angle exponent != 1', () => {
    expect(isRadians({ angle: 2 })).toBe(false);
  });
});

// ── fixPrecision ─────────────────────────────────────────────────────────────

describe('fixPrecision', () => {
  it('returns 0 for 0', () => expect(fixPrecision(0)).toBe(0));
  it('cleans floating point artifact', () => {
    const result = fixPrecision(0.1 + 0.2);
    expect(result).toBeCloseTo(0.3, 10);
  });
  it('preserves Infinity', () => expect(fixPrecision(Infinity)).toBe(Infinity));
  it('preserves -Infinity', () => expect(fixPrecision(-Infinity)).toBe(-Infinity));
});

// ── buildDirectUnitSymbol ────────────────────────────────────────────────────

describe('buildDirectUnitSymbol', () => {
  it('builds m/s symbol', () => {
    const result = buildDirectUnitSymbol({ m: 1, s: -1 });
    expect(result).toContain('m');
    expect(result).toContain('s');
  });

  it('returns empty string for all zeros', () => {
    expect(buildDirectUnitSymbol({ m: 0, kg: 0 })).toBe('');
  });

  it('adds superscript for exponent 2', () => {
    const result = buildDirectUnitSymbol({ m: 2 });
    expect(result).toBe('m²');
  });
});

// ── buildDirectDimensions ────────────────────────────────────────────────────

describe('buildDirectDimensions', () => {
  it('maps m to length', () => {
    expect(buildDirectDimensions({ m: 1 })).toEqual({ length: 1 });
  });

  it('maps kg to mass', () => {
    expect(buildDirectDimensions({ kg: 1 })).toEqual({ mass: 1 });
  });

  it('maps m and s correctly', () => {
    expect(buildDirectDimensions({ m: 1, s: -1 })).toEqual({ length: 1, time: -1 });
  });

  it('ignores zero exponents', () => {
    expect(buildDirectDimensions({ m: 0, kg: 1 })).toEqual({ mass: 1 });
  });
});

// ── applyRpnUnary ────────────────────────────────────────────────────────────

describe('applyRpnUnary', () => {
  it('square: doubles exponents and squares value', () => {
    const result = applyRpnUnary(mkVal(3, { length: 1 }), 'square');
    expect(result?.value).toBe(9);
    expect(result?.dimensions).toEqual({ length: 2 });
  });

  it('sqrt: halves exponents (ceiling) and square roots value', () => {
    const result = applyRpnUnary(mkVal(9, { length: 2 }), 'sqrt');
    expect(result?.value).toBe(3);
    expect(result?.dimensions).toEqual({ length: 1 });
  });

  it('sqrt of negative returns null', () => {
    expect(applyRpnUnary(mkVal(-4), 'sqrt')).toBeNull();
  });

  it('cbrt: ceilings exponents by 3', () => {
    const result = applyRpnUnary(mkVal(27, { length: 3 }), 'cbrt');
    expect(result?.value).toBeCloseTo(3);
    expect(result?.dimensions).toEqual({ length: 1 });
  });

  it('neg: negates value', () => {
    const result = applyRpnUnary(mkVal(5), 'neg');
    expect(result?.value).toBe(-5);
  });

  it('abs: absolute value', () => {
    const result = applyRpnUnary(mkVal(-5, { mass: 1 }), 'abs');
    expect(result?.value).toBe(5);
    expect(result?.dimensions).toEqual({ mass: 1 });
  });

  it('recip: inverts value and negates exponents', () => {
    const result = applyRpnUnary(mkVal(2, { length: 1 }), 'recip');
    expect(result?.value).toBe(0.5);
    expect(result?.dimensions).toEqual({ length: -1 });
  });

  it('recip of zero returns null', () => {
    expect(applyRpnUnary(mkVal(0), 'recip')).toBeNull();
  });

  it('sin of radians returns dimensionless', () => {
    const result = applyRpnUnary(mkVal(0, { angle: 1 }), 'sin');
    expect(result?.dimensions).toEqual({});
  });

  it('sin of non-radians preserves dimensions', () => {
    const result = applyRpnUnary(mkVal(0, { length: 1 }), 'sin');
    expect(result?.dimensions).toEqual({ length: 1 });
  });

  it('asin of dimensionless returns angle', () => {
    const result = applyRpnUnary(mkVal(0, {}), 'asin');
    expect(result?.dimensions).toEqual({ angle: 1 });
  });

  it('asin out of range returns null', () => {
    expect(applyRpnUnary(mkVal(2), 'asin')).toBeNull();
  });

  it('ln of positive value works', () => {
    const result = applyRpnUnary(mkVal(Math.E), 'ln');
    expect(result?.value).toBeCloseTo(1);
  });

  it('ln of non-positive returns null', () => {
    expect(applyRpnUnary(mkVal(0), 'ln')).toBeNull();
  });

  it('floor truncates at precision', () => {
    const result = applyRpnUnary(mkVal(3.7), 'floor', 0);
    expect(result?.value).toBe(3);
  });

  it('ceil rounds up at precision', () => {
    const result = applyRpnUnary(mkVal(3.2), 'ceil', 0);
    expect(result?.value).toBe(4);
  });

  it('cleans up zero exponents in output', () => {
    const result = applyRpnUnary(mkVal(4, { length: 2, mass: 0 }), 'sqrt');
    expect(result?.dimensions).not.toHaveProperty('mass');
  });
});

// ── applyRpnBinary ───────────────────────────────────────────────────────────

describe('applyRpnBinary', () => {
  it('mul: multiplies values, uses x dimensions', () => {
    const result = applyRpnBinary(mkVal(3), mkVal(4, { length: 1 }), 'mul');
    expect(result?.value).toBe(12);
    expect(result?.dimensions).toEqual({ length: 1 });
  });

  it('div: divides, returns null on divide by zero', () => {
    expect(applyRpnBinary(mkVal(6), mkVal(0), 'div')).toBeNull();
    const result = applyRpnBinary(mkVal(6), mkVal(3), 'div');
    expect(result?.value).toBe(2);
  });

  it('mulUnit: multiplies values and adds exponents', () => {
    const result = applyRpnBinary(
      mkVal(2, { length: 1 }),
      mkVal(3, { time: -1 }),
      'mulUnit'
    );
    expect(result?.value).toBe(6);
    expect(result?.dimensions).toEqual({ length: 1, time: -1 });
  });

  it('divUnit: divides values and subtracts exponents', () => {
    const result = applyRpnBinary(
      mkVal(6, { length: 2 }),
      mkVal(3, { length: 1 }),
      'divUnit'
    );
    expect(result?.value).toBe(2);
    expect(result?.dimensions).toEqual({ length: 1 });
  });

  it('divUnit by zero returns null', () => {
    expect(applyRpnBinary(mkVal(1, { length: 1 }), mkVal(0, { length: 1 }), 'divUnit')).toBeNull();
  });

  it('addUnit: adds compatible dimensions', () => {
    const result = applyRpnBinary(
      mkVal(3, { length: 1 }),
      mkVal(2, { length: 1 }),
      'addUnit'
    );
    expect(result?.value).toBe(5);
    expect(result?.dimensions).toEqual({ length: 1 });
  });

  it('addUnit with incompatible dimensions returns null', () => {
    const result = applyRpnBinary(
      mkVal(3, { length: 1 }),
      mkVal(2, { mass: 1 }),
      'addUnit'
    );
    expect(result).toBeNull();
  });

  it('pow: raises y to x power, multiplies y dimensions by x', () => {
    const result = applyRpnBinary(
      mkVal(4, { length: 1 }),
      mkVal(2, {}),
      'pow'
    );
    expect(result?.value).toBe(16);
    expect(result?.dimensions).toEqual({ length: 2 });
  });

  it('pow with dimensional exponent returns null', () => {
    const result = applyRpnBinary(
      mkVal(4, { length: 1 }),
      mkVal(2, { mass: 1 }),
      'pow'
    );
    expect(result).toBeNull();
  });

  it('subUnit: subtracts compatible', () => {
    const result = applyRpnBinary(
      mkVal(10, { length: 1 }),
      mkVal(3, { length: 1 }),
      'subUnit'
    );
    expect(result?.value).toBe(7);
  });
});

// ── formatSIComposition ───────────────────────────────────────────────────────

describe('formatSIComposition', () => {
  it('places derived symbol before remaining positive base dimension', () => {
    expect(formatSIComposition(['N'], { length: 1 })).toBe('N⋅m');
  });

  it('places derived symbol before multiple remaining positive base dimensions', () => {
    expect(formatSIComposition(['N'], { length: 1, mass: 1 })).toBe('N⋅kg⋅m');
  });

  it('places derived symbol before negative base dimensions', () => {
    expect(formatSIComposition(['W'], { length: -2 })).toBe('W⋅m⁻²');
  });

  it('renders derived symbol alone when no remaining dimensions', () => {
    expect(formatSIComposition(['N'], {})).toBe('N');
  });

  it('places derived symbol before both positive and negative remaining dims', () => {
    expect(formatSIComposition(['Pa'], { length: 1, time: -1 })).toBe('Pa⋅m⋅s⁻¹');
  });
});
