import { describe, it, expect } from 'vitest';
import { parseRpnXInput } from '../client/src/lib/calculator/parseRpnXInput';

describe('parseRpnXInput (council-07)', () => {
  it('returns null on empty input', () => {
    expect(parseRpnXInput('')).toBeNull();
    expect(parseRpnXInput('   ')).toBeNull();
  });

  it('parses a plain number with no unit', () => {
    const r = parseRpnXInput('42');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(42);
    expect(r!.dimensions).toEqual({});
    expect(r!.prefix).toBe('none');
  });

  it('parses a value with a base SI unit', () => {
    const r = parseRpnXInput('5 m');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(5);
    expect(r!.dimensions.length).toBe(1);
    expect(r!.prefix).toBe('none');
  });

  it('parses a value with a prefixed unit into SI base', () => {
    // parseUnitText normalizes 3 km -> 3000 m; prefix is returned as-is.
    // The helper we're testing is a thin wrapper around parseUnitText, so
    // this assertion pins the exact contract (value=3000, dimensions.length=1).
    const r = parseRpnXInput('3 km');
    expect(r).toBeTruthy();
    expect(r!.value).toBe(3000);
    expect(r!.dimensions.length).toBe(1);
  });

  it('flattens the dimensions record, dropping zero-valued keys', () => {
    const r = parseRpnXInput('9.8 m·s⁻²');
    expect(r).toBeTruthy();
    // Only length and time should be present; mass/current/etc dropped.
    const keys = Object.keys(r!.dimensions).sort();
    expect(keys).toEqual(['length', 'time']);
    expect(r!.dimensions.length).toBe(1);
    expect(r!.dimensions.time).toBe(-2);
  });
});
