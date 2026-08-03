import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

export type FlashFlagTuple = [boolean, () => void];

/**
 * Standalone flag with its own state and timer. Retained for callers that
 * only need one flash; useAllFlashFlags below prefers the consolidated
 * map-hook.
 */
export function useFlashFlag(duration: number = 300): FlashFlagTuple {
  const [isFlashing, setIsFlashing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const flash = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsFlashing(true);
    timeoutRef.current = setTimeout(() => setIsFlashing(false), duration);
  }, [duration]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return [isFlashing, flash];
}

export interface FlashFlags {
  copyResult: FlashFlagTuple;
  copyCalc: FlashFlagTuple;
  calcField1: FlashFlagTuple;
  calcField2: FlashFlagTuple;
  calcField3: FlashFlagTuple;
  fromBaseFactor: FlashFlagTuple;
  fromSIBase: FlashFlagTuple;
  toBaseFactor: FlashFlagTuple;
  toSIBase: FlashFlagTuple;
  conversionRatio: FlashFlagTuple;
  rpnField1: FlashFlagTuple;
  rpnField2: FlashFlagTuple;
  rpnField3: FlashFlagTuple;
  rpnResult: FlashFlagTuple;
  directCopy: FlashFlagTuple;
}

const FLASH_KEYS: Array<keyof FlashFlags> = [
  'copyResult', 'copyCalc',
  'calcField1', 'calcField2', 'calcField3',
  'fromBaseFactor', 'fromSIBase', 'toBaseFactor', 'toSIBase', 'conversionRatio',
  'rpnField1', 'rpnField2', 'rpnField3', 'rpnResult',
  'directCopy',
];

/**
 * Council-14: consolidated flash flags. Previously this hook instantiated
 * 15 separate useFlashFlag calls (15 useState, 15 useRef, 15 useEffect
 * teardowns). Now it holds a single boolean-per-key map and a single
 * timers-per-key map. Public shape (FlashFlags with FlashFlagTuple values)
 * is preserved so consumers do not change.
 */
export function useAllFlashFlags(duration: number = 300): FlashFlags {
  const [flags, setFlags] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    FLASH_KEYS.forEach(k => { init[k] = false; });
    return init;
  });
  const timersRef = useRef<Record<string, NodeJS.Timeout | null>>({});

  const triggerFlash = useCallback((key: keyof FlashFlags) => {
    const existing = timersRef.current[key];
    if (existing) clearTimeout(existing);
    setFlags(prev => ({ ...prev, [key]: true }));
    timersRef.current[key] = setTimeout(() => {
      setFlags(prev => ({ ...prev, [key]: false }));
      timersRef.current[key] = null;
    }, duration);
  }, [duration]);

  useEffect(() => {
    return () => {
      const timers = timersRef.current;
      Object.keys(timers).forEach(k => {
        const t = timers[k];
        if (t) clearTimeout(t);
      });
    };
  }, []);

  // Assemble the FlashFlags shape once per render. The tuples are stable
  // per key because triggerFlash is memoized and each entry only depends
  // on the key it was created for.
  return useMemo<FlashFlags>(() => {
    const out: Partial<Record<keyof FlashFlags, FlashFlagTuple>> = {};
    FLASH_KEYS.forEach(k => {
      out[k] = [flags[k] ?? false, () => triggerFlash(k)];
    });
    return out as FlashFlags;
  }, [flags, triggerFlash]);
}
