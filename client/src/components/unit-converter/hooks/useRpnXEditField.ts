import { useEffect, useRef } from 'react';
import { PREFIXES } from '@/lib/units/prefixes';
import { buildRpnEntryFromText } from '@/lib/calculator/buildRpnEntryFromText';
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
  // Set when an RPN operation button was pressed while editing: the next
  // rpnStack change refreshes the edit text from the new X value (selected,
  // ready for a fresh entry). Cleared when the user types/escapes/blurs.
  freshEntryPendingRef: React.MutableRefObject<boolean>;
  commitRpnXValue: () => boolean;
  // Shared onMouseDown for every RPN operation button: keeps focus in the X
  // input (preventDefault), commits any pending typed text before the
  // button's click action runs, and schedules a refocus + select-all so the
  // next keystrokes start a fresh entry. No-op outside locked-RPN editing.
  handleRpnButtonMouseDown: (e: { preventDefault: () => void }) => void;
  // Restore focus to the X input (next frame) with the text selected.
  restoreRpnXFocus: () => void;
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
export function useRpnXEditField(controller: UseCalculatorControllerReturn, lockRpnMode = false): UseRpnXEditFieldReturn {
  const {
    rpnStack, setRpnStack,
    rpnResultPrefix,
    rpnSelectedAlternative,
    rpnXEditing, rpnXEditValue, setRpnXEditValue,
    saveRpnStackForUndo,
    generateSIRepresentations,
    getRpnResultDisplay,
    setRpnResultPrefixRaw, setRpnSelectedAlternativeRaw,
  } = controller;

  const rpnXInputRef = useRef<HTMLInputElement>(null);
  const suppressXBlurRef = useRef(false);
  const committedXTextRef = useRef<string | null>(null);
  const enterCommitKeepFocusRef = useRef(false);
  const freshEntryPendingRef = useRef(false);
  const prevRpnDisplayRef = useRef<{ prefix: string; alt: number } | null>(null);

  const restoreRpnXFocus = () => {
    requestAnimationFrame(() => {
      suppressXBlurRef.current = false;
      const input = rpnXInputRef.current;
      if (input) {
        input.focus();
        input.select();
      }
    });
  };

  // Shared mousedown for RPN operation buttons (same pattern as the
  // prefix/SI selectors: preventDefault so the input never blurs, plus
  // suppress-blur as a safety net, plus a scheduled refocus). Committing
  // here (mousedown) means the click handler's operation runs against the
  // freshly committed X value — React flushes the dispatch between the
  // mousedown and click events.
  const handleRpnButtonMouseDown = (e: { preventDefault: () => void }) => {
    if (!lockRpnMode || !rpnXEditing) return;
    e.preventDefault();
    suppressXBlurRef.current = true;
    if (rpnXEditValue.trim() && rpnXEditValue !== committedXTextRef.current) {
      if (commitRpnXValue()) committedXTextRef.current = rpnXEditValue;
    }
    freshEntryPendingRef.current = true;
    restoreRpnXFocus();
  };

  // After an operation button changed the stack, refresh the edit text from
  // the new X value and select it so typing starts a fresh entry. The flag
  // stays set (not consumed) because a single button press can change the
  // stack twice: once for the mousedown commit, once for the click's op.
  // It is cleared when the user types, escapes, or blurs away.
  useEffect(() => {
    if (!freshEntryPendingRef.current || !rpnXEditing) return;
    const display = getRpnResultDisplay();
    const text = display ? `${display.formattedValue}${display.unitSymbol ? ' ' + display.unitSymbol : ''}` : '';
    setRpnXEditValue(text);
    committedXTextRef.current = text;
    restoreRpnXFocus();
  }, [rpnStack]); // eslint-disable-line react-hooks/exhaustive-deps

  // Commit the current X edit value into the X register. Returns true if a
  // commit happened. Entry construction is shared with Smart Paste
  // (lib/calculator/buildRpnEntryFromText), so typed text like "101.3J"
  // gets the same parse, origin metadata, and SI representation/prefix
  // auto-selection as pasted text. The RAW prefix/alt setters are used so
  // the entry's freshly parsed metadata is not re-stamped from stale state
  // (see the wrapped setters in useCalculatorRpnSelection).
  const commitRpnXValue = (): boolean => {
    const built = buildRpnEntryFromText(rpnXEditValue, generateSIRepresentations);
    if (!built) return false;
    saveRpnStackForUndo();
    setRpnStack(prev => {
      const newStack = [...prev];
      newStack[3] = built.entry;
      return newStack;
    });
    setRpnResultPrefixRaw(built.autoPrefix);
    setRpnSelectedAlternativeRaw(built.autoAlt);
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

  return {
    rpnXInputRef, suppressXBlurRef, committedXTextRef, enterCommitKeepFocusRef,
    freshEntryPendingRef, commitRpnXValue, handleRpnButtonMouseDown, restoreRpnXFocus,
  };
}
