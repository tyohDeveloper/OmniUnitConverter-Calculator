import { describe, it, expect, vi } from 'vitest';
import { dispatchSymbolicBlur } from '../client/src/components/unit-converter/hooks/useConverterInputHandlers';

/**
 * Integration tests for the SYMBOLIC blur dispatcher \u2014 the thin glue
 * between the input field and parseTimeWithZone.
 *
 * Invariants verified:
 *   1. Only runs when activeCategory is 'timezone' (no-op for any
 *      other category, including future SYMBOLIC categories that
 *      haven't wired their own blur logic).
 *   2. setInputValue is only called when the normalized time differs
 *      from the raw input \u2014 avoids unnecessary re-render / cursor
 *      jump when the user typed a canonical value like '12:00'.
 *   3. setFromUnit is only called when the parser resolved a zone.
 *   4. When both time and zone resolve, both setters fire.
 *   5. When neither resolves (invalid input), neither setter fires.
 */

describe('dispatchSymbolicBlur: no-op for non-timezone categories', () => {
  it('does nothing when activeCategory is length', () => {
    const setInputValue = vi.fn();
    const setFromUnit = vi.fn();
    dispatchSymbolicBlur('length', '12:00 UTC', setInputValue, setFromUnit);
    expect(setInputValue).not.toHaveBeenCalled();
    expect(setFromUnit).not.toHaveBeenCalled();
  });

  it('does nothing when activeCategory is unitless', () => {
    const setInputValue = vi.fn();
    const setFromUnit = vi.fn();
    dispatchSymbolicBlur('unitless', '12:00 UTC', setInputValue, setFromUnit);
    expect(setInputValue).not.toHaveBeenCalled();
    expect(setFromUnit).not.toHaveBeenCalled();
  });
});

describe('dispatchSymbolicBlur: cursor-jump avoidance', () => {
  it('does NOT call setInputValue when input is already normalized', () => {
    // '12:00' is already the canonical form; no re-render should be
    // triggered on blur.
    const setInputValue = vi.fn();
    const setFromUnit = vi.fn();
    dispatchSymbolicBlur('timezone', '12:00', setInputValue, setFromUnit);
    expect(setInputValue).not.toHaveBeenCalled();
    expect(setFromUnit).not.toHaveBeenCalled();
  });

  it('calls setInputValue when the parser normalizes the input', () => {
    // '5:00' \u2192 '05:00'; the value shape changed, so an update fires.
    const setInputValue = vi.fn();
    const setFromUnit = vi.fn();
    dispatchSymbolicBlur('timezone', '5:00', setInputValue, setFromUnit);
    expect(setInputValue).toHaveBeenCalledWith('05:00');
    expect(setFromUnit).not.toHaveBeenCalled();
  });

  it('calls setInputValue when the trailing zone tag is stripped', () => {
    // '12:00 UTC' parses to time='12:00' and zone='utc'; the time\n    // value passed back to the input is just '12:00' (no zone tag).
    const setInputValue = vi.fn();
    const setFromUnit = vi.fn();
    dispatchSymbolicBlur('timezone', '12:00 UTC', setInputValue, setFromUnit);
    expect(setInputValue).toHaveBeenCalledWith('12:00');
    expect(setFromUnit).toHaveBeenCalledWith('utc');
  });
});

describe('dispatchSymbolicBlur: zone resolution triggers setFromUnit', () => {
  it('recognized abbreviation calls setFromUnit with the mapped id', () => {
    const setInputValue = vi.fn();
    const setFromUnit = vi.fn();
    dispatchSymbolicBlur('timezone', '12:00 CST', setInputValue, setFromUnit);
    expect(setFromUnit).toHaveBeenCalledWith('america_chicago');
  });

  it('full IANA id calls setFromUnit with the mapped id', () => {
    const setInputValue = vi.fn();
    const setFromUnit = vi.fn();
    dispatchSymbolicBlur('timezone', '12:00 America/Chicago', setInputValue, setFromUnit);
    expect(setFromUnit).toHaveBeenCalledWith('america_chicago');
  });

  it('unknown zone does NOT call setFromUnit (dropdown left alone)', () => {
    const setInputValue = vi.fn();
    const setFromUnit = vi.fn();
    dispatchSymbolicBlur('timezone', '12:00 XYZ', setInputValue, setFromUnit);
    // The value gets normalized (time is '12:00' vs raw '12:00 XYZ')
    // but the zone dropdown stays unchanged.
    expect(setInputValue).toHaveBeenCalledWith('12:00');
    expect(setFromUnit).not.toHaveBeenCalled();
  });
});

describe('dispatchSymbolicBlur: invalid input', () => {
  it('completely invalid input triggers no setters', () => {
    const setInputValue = vi.fn();
    const setFromUnit = vi.fn();
    dispatchSymbolicBlur('timezone', 'not a time', setInputValue, setFromUnit);
    expect(setInputValue).not.toHaveBeenCalled();
    expect(setFromUnit).not.toHaveBeenCalled();
  });

  it('out-of-range time triggers no setters', () => {
    const setInputValue = vi.fn();
    const setFromUnit = vi.fn();
    dispatchSymbolicBlur('timezone', '25:00 UTC', setInputValue, setFromUnit);
    expect(setInputValue).not.toHaveBeenCalled();
    expect(setFromUnit).not.toHaveBeenCalled();
  });

  it('empty input triggers no setters', () => {
    const setInputValue = vi.fn();
    const setFromUnit = vi.fn();
    dispatchSymbolicBlur('timezone', '', setInputValue, setFromUnit);
    expect(setInputValue).not.toHaveBeenCalled();
    expect(setFromUnit).not.toHaveBeenCalled();
  });
});

describe('dispatchSymbolicBlur: both fields update in one call', () => {
  it('HH:MM ZONE triggers both setInputValue and setFromUnit', () => {
    const setInputValue = vi.fn();
    const setFromUnit = vi.fn();
    dispatchSymbolicBlur('timezone', '15:30 JST', setInputValue, setFromUnit);
    expect(setInputValue).toHaveBeenCalledWith('15:30');
    expect(setFromUnit).toHaveBeenCalledWith('asia_tokyo');
  });

  it('HH:MM:SS ZONE triggers both, seconds propagate', () => {
    const setInputValue = vi.fn();
    const setFromUnit = vi.fn();
    dispatchSymbolicBlur('timezone', '15:30:45 America/New_York', setInputValue, setFromUnit);
    expect(setInputValue).toHaveBeenCalledWith('15:30:45');
    expect(setFromUnit).toHaveBeenCalledWith('america_new_york');
  });
});
