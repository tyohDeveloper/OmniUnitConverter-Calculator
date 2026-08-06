import { useEffect, useRef } from 'react';
import { PREFIXES } from '@/lib/units/prefixes';
import { parseRpnXInput } from '@/lib/calculator/parseRpnXInput';
import { reexpressRpnEntry } from '@/lib/calculator/reexpressRpnEntry';
import type { UseCalculatorControllerReturn } from './useCalculatorControllerReturn';

// EXCEPTION [architecture-standards §3.2]: type-and-function co-location.
export interface UseRpnXEditFieldReturn {
  // Ref for the X edit input, used to restore focus after the prefix/alt
  // dropdowns are interacted with while edit mode is active.
  rpnXInputRef: React.RefObject<HTMLInputElement | null>;
  // When true, the next onBlur from the X input should be suppressed because
  // the user clicked one of the adjacent selector controls.
  suppressXBlurRef: React.MutableRefObject<boolean>;
  // Text already committed via Enter (RPN section only). Used so a subsequent
  // blur doesn't double-commit the same value. Cleared on any edit.
  committedXTextRef: React.MutableRefObject<string | null>;
  // Set when Enter just committed in locked RPN mode. If the browser (notably
  // iOS WebKit's Done key) fires a blur right after, we must NOT exit edit
  // mode — the input needs to stay mounted so focus can be restored.
  enterCommitKeepFocusRef: React.MutableRefObject<boolean>;
  commitRpnXValue: () => boolean;
}

/**
 * Council-09: encapsulates the RPN X-register's focus/blur choreography
 * plus the parse/commit/re-express pipeline.
 *
 * Extracted from CalculatorPane.tsx so both the split RpnCalculatorPane
 * and any future consumers can share the exact same focus behaviour
 * (including the iOS WebKit Done-key workaround documented on
 * enterCommitKeepFocusRef).
 */
export function useRpnXEditField(controller: UseCalculatorControllerReturn): UseRpnXEditFieldReturn {
  const {
    rpnStack, setRpnStack,
    rpnResultPrefix, setRpnResultPrefix,
    rpnSelectedAlternative, setRpnSelectedAlternative,
    rpnXEditing, rpnXEditValue, setRpnXEditValue,
    saveRpnStackForUndo,
    generateSIRepresentations,
  } = controller;

  const rpnXInputRef = useRef<HTMLInputElement>(null);
  const suppressXBlurRef = useRef(false);
  const committedXTextRef = useRef<string | null>(null);
  const enterCommitKeepFocusRef = useRef(false);
  const prevRpnDisplayRef = useRef<{ prefix: string; alt: number } | null>(null);

  // Commit the current X edit value into the X register. Returns true if a
  // commit happened. Metadata is computed from the freshly parsed text (not
  // from stale closure state) and applied inside the functional updater.
  // Council-07: parsing lives in lib/calculator/parseRpnXInput. The hook
  // orchestrates the stack update and prefix/alt reset.
  const commitRpnXValue = (): boolean => {
    const newEntry = parseRpnXInput(rpnXEditValue);
    if (!newEntry) return false;
    saveRpnStackForUndo();
    setRpnStack(prev => {
      const newStack = [...prev];
      newStack[3] = newEntry;
      return newStack;
    });
    setRpnResultPrefix('none');
    setRpnSelectedAlternative(0);
    return true;
  };

  // Re-express the typed X-register value when the user changes prefix or
  // alternative while editing. All the guards below match the original
  // CalculatorPane.tsx effect verbatim; if you tweak any of them, check
  // tests/e2e/rpn-focus.e2e.ts first.
  useEffect(() => {
    const prev = prevRpnDisplayRef.current;
    prevRpnDisplayRef.current = { prefix: rpnResultPrefix, alt: rpnSelectedAlternative };
    if (!rpnXEditing || !rpnXEditValue.trim()) return;
    if (rpnXEditValue === committedXTextRef.current) return;
    if (!prev) return;
    if (prev.prefix === rpnResultPrefix && prev.alt === rpnSelectedAlternative) return;
    if (!rpnStack[3] || !rpnStack[3].dimensions) return;

    // Skip DMS and ft-in special composite formats — re-expression doesn't
    // apply cleanly to them.
    //   DMS:   ° followed by a digit (e.g. "1°30'") or contains ′ / ″
    //   ft-in: ' followed by a digit (e.g. "5'6\"")
    // Temperature unit suffixes like "°C" or "°F" are NOT matched because
    // ° is followed by a letter there.
    const rawText = rpnXEditValue.trim();
    if (/°\d|[′″]|'\d/.test(rawText)) return;

    // Require a leading numeric token — rejects non-numeric input ("abc", empty, etc.).
    // Handles optional sign, group separators (commas), decimal point, and exponent.
    const numericMatch = rawText.match(/^-?(\d[\d,]*\.?\d*|\d*\.\d+)([eE][+-]?\d+)?/);
    if (!numericMatch) return;
    const typedNumber = parseFloat(numericMatch[0].replace(/,/g, ''));
    if (isNaN(typedNumber) || !isFinite(typedNumber)) return;

    // Council-07: math lives in lib/calculator/reexpressRpnEntry.
    const result = reexpressRpnEntry({
      typedNumber,
      dimensions: rpnStack[3].dimensions,
      oldPrefix: prev.prefix,
      oldAltIndex: prev.alt,
      newPrefix: rpnResultPrefix,
      newAltIndex: rpnSelectedAlternative,
      siReps: generateSIRepresentations(rpnStack[3].dimensions),
      prefixes: PREFIXES,
    });
    if (!result) return;
    setRpnXEditValue(result.newUnitSymbol ? `${result.newNumber} ${result.newUnitSymbol}` : String(result.newNumber));
  }, [rpnResultPrefix, rpnSelectedAlternative]); // eslint-disable-line react-hooks/exhaustive-deps

  return { rpnXInputRef, suppressXBlurRef, committedXTextRef, enterCommitKeepFocusRef, commitRpnXValue };
}
