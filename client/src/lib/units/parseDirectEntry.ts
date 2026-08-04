import { parseUnitText } from '../conversion-data';
import { dimensionsToExponents } from './dimensionsToExponents';

// EXCEPTION [architecture-standards §3.2]: type-and-function co-location.
export interface DirectEntry {
  value: string;
  exponents: Record<string, number>;
}

/**
 * Council-07 (DirectPane): parse a free-form text entry into a
 * direct-pane {value, exponents} record.
 *
 * Returns null when the text has no unit-like tokens (letters, degrees,
 * middle-dots, multiplication signs, carets, superscripts), or when
 * parseUnitText returns a value+dims combination the DirectPane blur
 * handler used to reject: falsy value, or neither dimensions nor a
 * category. The old handler was a void-returning method on the
 * component; here we return a nullable record so callers can decide
 * how to apply it.
 */
export function parseDirectEntry(text: string): DirectEntry | null {
  if (!text) return null;
  const hasUnitPart = /[a-zA-Z°⋅·×\^⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/.test(text);
  if (!hasUnitPart) return null;
  const parsed = parseUnitText(text);
  const hasDims = Object.keys(parsed.dimensions).length > 0;
  if (!parsed.value || (!hasDims && !parsed.categoryId)) return null;
  return {
    value: parsed.value.toString(),
    exponents: dimensionsToExponents(parsed.dimensions),
  };
}
