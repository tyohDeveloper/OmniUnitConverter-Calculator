import { describe, it, expect } from 'vitest';
import { buildRpnEntryFromText } from '../client/src/lib/calculator/buildRpnEntryFromText';
import { generateSIRepresentations as generateSIRepresentationsLib } from '../client/src/lib/si-representations/generateSIRepresentations';
import { getDimensionSignature } from '../client/src/lib/units/getDimensionSignature';
import { PREFERRED_REPRESENTATIONS } from '../client/src/lib/units/preferredRepresentations';
import type { DimensionalFormula } from '../client/src/lib/units/dimensionalFormula';

const genSI = (dimensions: DimensionalFormula, sourceCategory?: string) =>
  generateSIRepresentationsLib(dimensions, getDimensionSignature, PREFERRED_REPRESENTATIONS, sourceCategory);

describe('buildRpnEntryFromText (shared Smart Paste / X-commit builder)', () => {
  it('returns null on empty input', () => {
    expect(buildRpnEntryFromText('', genSI)).toBeNull();
    expect(buildRpnEntryFromText('   ', genSI)).toBeNull();
  });

  it('parses a plain number with no unit', () => {
    const r = buildRpnEntryFromText('42', genSI);
    expect(r).toBeTruthy();
    expect(r!.entry.value).toBe(42);
    expect(r!.entry.dimensions).toEqual({});
    expect(r!.entry.prefix).toBe('none');
    expect(r!.autoAlt).toBe(0);
    expect(r!.autoPrefix).toBe('none');
  });

  it('parses "101.3J" (no space) as 101.3 joules with origin metadata', () => {
    const r = buildRpnEntryFromText('101.3J', genSI);
    expect(r).toBeTruthy();
    expect(r!.entry.value).toBeCloseTo(101.3);
    expect(r!.entry.originalUnit).toBe('J');
    expect(r!.entry.originalValue).toBeCloseTo(101.3);
    expect(r!.entry.sourceCategory).toBeTruthy();
    // Auto-selects the J representation among the SI alternatives.
    const reps = genSI(r!.entry.dimensions, r!.entry.sourceCategory);
    expect(reps[r!.autoAlt]?.displaySymbol).toBe('J');
  });

  it('parses a prefixed unit into SI base and auto-selects the prefix', () => {
    const r = buildRpnEntryFromText('3 km', genSI);
    expect(r).toBeTruthy();
    expect(r!.entry.value).toBe(3000);
    expect(r!.entry.dimensions.length).toBe(1);
    expect(r!.entry.originalUnit).toBe('km');
    expect(r!.entry.originalValue).toBe(3);
    expect(r!.autoPrefix).toBe('kilo');
  });

  it('flattens the dimensions record, dropping zero-valued keys', () => {
    const r = buildRpnEntryFromText('9.8 m·s⁻²', genSI);
    expect(r).toBeTruthy();
    const keys = Object.keys(r!.entry.dimensions).sort();
    expect(keys).toEqual(['length', 'time']);
    expect(r!.entry.dimensions.length).toBe(1);
    expect(r!.entry.dimensions.time).toBe(-2);
  });
});
