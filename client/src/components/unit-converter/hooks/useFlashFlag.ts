import { useState, useCallback, useRef, useEffect } from 'react';

export type FlashFlagTuple = [boolean, () => void];

export function useFlashFlag(duration: number = 300): FlashFlagTuple {
  const [isFlashing, setIsFlashing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const flash = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsFlashing(true);
    timeoutRef.current = setTimeout(() => {
      setIsFlashing(false);
    }, duration);
  }, [duration]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
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

export function useAllFlashFlags(duration: number = 300): FlashFlags {
  return {
    copyResult: useFlashFlag(duration),
    copyCalc: useFlashFlag(duration),
    calcField1: useFlashFlag(duration),
    calcField2: useFlashFlag(duration),
    calcField3: useFlashFlag(duration),
    fromBaseFactor: useFlashFlag(duration),
    fromSIBase: useFlashFlag(duration),
    toBaseFactor: useFlashFlag(duration),
    toSIBase: useFlashFlag(duration),
    conversionRatio: useFlashFlag(duration),
    rpnField1: useFlashFlag(duration),
    rpnField2: useFlashFlag(duration),
    rpnField3: useFlashFlag(duration),
    rpnResult: useFlashFlag(duration),
    directCopy: useFlashFlag(duration),
  };
}
