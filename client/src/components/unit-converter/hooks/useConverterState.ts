import { useRef } from 'react';
import type { UnitCategory } from '@/lib/units/types';
import { useConverterContext } from '../context/ConverterContext';

export interface UseConverterStateReturn {
  inputRef: React.RefObject<HTMLInputElement | null>;
  activeCategory: UnitCategory;
  setActiveCategory: (value: UnitCategory) => void;
  fromUnit: string;
  setFromUnit: (value: string) => void;
  toUnit: string;
  setToUnit: (value: string) => void;
  fromPrefix: string;
  setFromPrefix: (value: string) => void;
  toPrefix: string;
  setToPrefix: (value: string) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  result: number | null;
  setResult: (value: number | null) => void;
  precision: number;
  setPrecision: (value: number) => void;
  comparisonMode: boolean;
  setComparisonMode: (value: boolean) => void;
}

export function useConverterState(): UseConverterStateReturn {
  const { state, dispatch, inputRef } = useConverterContext();
  const s = state.converter;

  return {
    inputRef,
    activeCategory: s.activeCategory,
    setActiveCategory: (v) => dispatch({ domain: 'converter', type: 'SET_ACTIVE_CATEGORY', payload: v }),
    fromUnit: s.fromUnit,
    setFromUnit: (v) => dispatch({ domain: 'converter', type: 'SET_FROM_UNIT', payload: v }),
    toUnit: s.toUnit,
    setToUnit: (v) => dispatch({ domain: 'converter', type: 'SET_TO_UNIT', payload: v }),
    fromPrefix: s.fromPrefix,
    setFromPrefix: (v) => dispatch({ domain: 'converter', type: 'SET_FROM_PREFIX', payload: v }),
    toPrefix: s.toPrefix,
    setToPrefix: (v) => dispatch({ domain: 'converter', type: 'SET_TO_PREFIX', payload: v }),
    inputValue: s.inputValue,
    setInputValue: (v) => dispatch({ domain: 'converter', type: 'SET_INPUT_VALUE', payload: v }),
    result: s.result,
    setResult: (v) => dispatch({ domain: 'converter', type: 'SET_RESULT', payload: v }),
    precision: s.precision,
    setPrecision: (v) => dispatch({ domain: 'converter', type: 'SET_PRECISION', payload: v }),
    comparisonMode: s.comparisonMode,
    setComparisonMode: (v) => dispatch({ domain: 'converter', type: 'SET_COMPARISON_MODE', payload: v }),
  };
}
