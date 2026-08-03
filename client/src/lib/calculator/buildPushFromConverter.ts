import type { CalcValue } from '../units/calcValue';

/**
 * Council-08e: pure stack transform used by "push from converter to
 * calculator" flows.
 *
 * Semantics: the new entry is placed at the X (bottom) register; the
 * previous X, Y, Z shift UP to Y, Z, T; the previous T is dropped. This
 * is the "push into X, discard top" motion the converter/direct panes
 * use when they send a computed value into the RPN stack. It is
 * intentionally different from useRpnStack.pushValue, which shifts DOWN
 * (new value becomes T).
 */
export function buildPushFromConverter(
  prev: Array<CalcValue | null>,
  entry: CalcValue,
): Array<CalcValue | null> {
  const ns: Array<CalcValue | null> = [...prev];
  ns[0] = prev[1];
  ns[1] = prev[2];
  ns[2] = prev[3];
  ns[3] = entry;
  return ns;
}
