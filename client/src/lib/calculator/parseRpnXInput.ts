import { parseUnitText } from '../conversion-data';
import type { CalcValue } from '../units/calcValue';

/**
 * Council-07: pure parse of the RPN X-register edit field.
 *
 * Returns a CalcValue if the text parses, null if the text is empty or
 * unparseable. The caller (a controller action) is responsible for
 * dispatching the stack update.
 *
 * Extracted verbatim from the commitRpnXValue closure that lived inside
 * CalculatorPane.tsx (§1.1 forbids parsing/text-processing inside JSX).
 */
export function parseRpnXInput(text: string): CalcValue | null {
  if (!text.trim()) return null;
  const parsed = parseUnitText(text);
  const dims: Record<string, number> = {};
  if (parsed.dimensions.length) dims.length = parsed.dimensions.length;
  if (parsed.dimensions.mass) dims.mass = parsed.dimensions.mass;
  if (parsed.dimensions.time) dims.time = parsed.dimensions.time;
  if (parsed.dimensions.current) dims.current = parsed.dimensions.current;
  if (parsed.dimensions.temperature) dims.temperature = parsed.dimensions.temperature;
  if (parsed.dimensions.amount) dims.amount = parsed.dimensions.amount;
  if (parsed.dimensions.intensity) dims.intensity = parsed.dimensions.intensity;
  if (parsed.dimensions.angle) dims.angle = parsed.dimensions.angle;
  if (parsed.dimensions.solid_angle) dims.solid_angle = parsed.dimensions.solid_angle;
  return {
    value: parsed.value,
    dimensions: dims,
    prefix: parsed.prefixId || 'none',
  };
}
