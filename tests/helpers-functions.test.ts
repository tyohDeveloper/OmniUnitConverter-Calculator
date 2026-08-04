import { describe, it, expect } from 'vitest';
import { PREFIX_EXPONENTS, EXPONENT_TO_PREFIX } from '../client/src/lib/units/prefixExponents';
import {
  GRAM_TO_KG_UNIT_PAIRS, KG_TO_GRAM_UNIT_PAIRS, normalizeMassUnit,
} from '../client/src/lib/units/normalizeMassUnit';
import { getDimensionSignature } from '../client/src/lib/units/getDimensionSignature';
import { dimensionsEqual } from '../client/src/lib/dimensions/dimensionsEqual';
import { toTitleCase } from '../client/src/lib/units/toTitleCase';
import { buildDimensionalSymbol } from '../client/src/lib/units/buildDimensionalSymbol';

// ── PREFIX_EXPONENTS ─────────────────────────────────────────────────────────

describe('PREFIX_EXPONENTS', () => {
  it('kilo should be 3', () => expect(PREFIX_EXPONENTS['kilo']).toBe(3));
  it('milli should be -3', () => expect(PREFIX_EXPONENTS['milli']).toBe(-3));
  it('none should be 0', () => expect(PREFIX_EXPONENTS['none']).toBe(0));
  it('mega should be 6', () => expect(PREFIX_EXPONENTS['mega']).toBe(6));
  it('micro should be -6', () => expect(PREFIX_EXPONENTS['micro']).toBe(-6));
});

// ── EXPONENT_TO_PREFIX ────────────────────────────────────────────────────────

describe('EXPONENT_TO_PREFIX', () => {
  it('3 should be kilo', () => expect(EXPONENT_TO_PREFIX[3]).toBe('kilo'));
  it('-3 should be milli', () => expect(EXPONENT_TO_PREFIX[-3]).toBe('milli'));
  it('0 should be none', () => expect(EXPONENT_TO_PREFIX[0]).toBe('none'));
});

// ── GRAM_TO_KG_UNIT_PAIRS / KG_TO_GRAM_UNIT_PAIRS ────────────────────────────

describe('unit pairs', () => {
  it('g maps to kg', () => expect(GRAM_TO_KG_UNIT_PAIRS['g']).toBe('kg'));
  it('kg maps to g', () => expect(KG_TO_GRAM_UNIT_PAIRS['kg']).toBe('g'));
});

// ── normalizeMassUnit ─────────────────────────────────────────────────────────

describe('normalizeMassUnit', () => {
  it('converts kg with milli prefix to g with milli', () => {
    const result = normalizeMassUnit('kg', 'milli');
    expect(result).toEqual({ unit: 'g', prefix: 'milli' });
  });

  it('keeps kg with no prefix', () => {
    const result = normalizeMassUnit('kg', 'none');
    expect(result).toEqual({ unit: 'kg', prefix: 'none' });
  });

  it('converts g with kilo prefix to kg', () => {
    const result = normalizeMassUnit('g', 'kilo');
    expect(result).toEqual({ unit: 'kg', prefix: 'none' });
  });

  it('keeps g with none prefix', () => {
    const result = normalizeMassUnit('g', 'none');
    expect(result).toEqual({ unit: 'g', prefix: 'none' });
  });
});

// ── getDimensionSignature ─────────────────────────────────────────────────────

describe('getDimensionSignature', () => {
  it('produces sorted signature', () => {
    const sig = getDimensionSignature({ length: 1, time: -1 });
    expect(sig).toBe('length:1,time:-1');
  });

  it('produces empty signature for empty dims', () => {
    expect(getDimensionSignature({})).toBe('');
  });

  it('omits zero exponents', () => {
    expect(getDimensionSignature({ length: 1, mass: 0 })).toBe('length:1');
  });
});

// ── dimensionsEqual ───────────────────────────────────────────────────────────

describe('dimensionsEqual (helpers)', () => {
  it('returns true for same dims', () => {
    expect(dimensionsEqual({ length: 1 }, { length: 1 })).toBe(true);
  });

  it('returns false for different dims', () => {
    expect(dimensionsEqual({ length: 1 }, { mass: 1 })).toBe(false);
  });

  it('treats 0 as absence', () => {
    expect(dimensionsEqual({ length: 1, mass: 0 }, { length: 1 })).toBe(true);
  });
});

// ── toTitleCase ───────────────────────────────────────────────────────────────

describe('toTitleCase', () => {
  it('capitalizes first letter of each word', () => {
    expect(toTitleCase('hello world')).toBe('Hello World');
  });

  it('lowercases rest of each word', () => {
    expect(toTitleCase('SPEED OF LIGHT')).toBe('Speed Of Light');
  });

  it('handles single word', () => {
    expect(toTitleCase('length')).toBe('Length');
  });
});

// ── buildDimensionalSymbol ────────────────────────────────────────────────────

describe('buildDimensionalSymbol', () => {
  it('builds m/s for speed', () => {
    const result = buildDimensionalSymbol({ length: 1, time: -1 });
    expect(result).toContain('m');
    expect(result).toContain('s');
  });

  it('returns empty for no dimensions', () => {
    expect(buildDimensionalSymbol({})).toBe('');
  });

  it('builds m² for area', () => {
    expect(buildDimensionalSymbol({ length: 2 })).toContain('m²');
  });
});

