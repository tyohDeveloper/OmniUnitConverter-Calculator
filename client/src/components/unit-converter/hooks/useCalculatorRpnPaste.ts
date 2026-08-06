import { useCallback } from 'react';
import type { CalcValue } from '@/lib/units/calcValue';
import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import type { SIRepresentation } from '@/lib/si-representations/siRepresentation';
import { buildRpnEntryFromText } from '@/lib/calculator/buildRpnEntryFromText';

interface UseCalculatorRpnPasteArgs {
  saveRpnStackForUndo: () => void;
  setRpnStack: (v: Array<CalcValue | null> | ((prev: Array<CalcValue | null>) => Array<CalcValue | null>)) => void;
  setRpnResultPrefixRaw: (v: string) => void;
  setRpnSelectedAlternativeRaw: (v: number) => void;
  generateSIRepresentations: (dimensions: DimensionalFormula, sourceCategory?: string) => SIRepresentation[];
}

async function doPasteToRpnStack(args: UseCalculatorRpnPasteArgs): Promise<void> {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) return;
    // Entry construction (parse + origin metadata + SI auto-selection,
    // including the SYMBOLIC-category rejection) is single-sourced in
    // lib/calculator/buildRpnEntryFromText, shared with the X-register
    // commit path.
    const built = buildRpnEntryFromText(text, args.generateSIRepresentations);
    if (!built) return;
    const { entry: newEntry, autoAlt, autoPrefix } = built;
    args.saveRpnStackForUndo();
    args.setRpnStack(prev => { const ns = [...prev]; ns[0] = prev[1]; ns[1] = prev[2]; ns[2] = prev[3]; ns[3] = newEntry; return ns; });
    args.setRpnResultPrefixRaw(autoPrefix);
    args.setRpnSelectedAlternativeRaw(autoAlt);
  } catch (err) {
    console.error('Failed to read clipboard:', err);
  }
}

/**
 * Read clipboard, parse it via parseUnitText, push the result to
 * the RPN stack, and auto-select the SI representation that matches
 * the parsed unit's symbol (with its prefix when applicable).
 *
 * Split from useCalculatorController for §3.7 domain focus. All
 * behavior byte-identical to the previous inline implementation.
 */
export function useCalculatorRpnPaste(args: UseCalculatorRpnPasteArgs) {
  const pasteToRpnStack = useCallback(
    () => doPasteToRpnStack(args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [args.saveRpnStackForUndo, args.setRpnStack, args.setRpnResultPrefixRaw, args.setRpnSelectedAlternativeRaw, args.generateSIRepresentations],
  );
  return { pasteToRpnStack };
}
