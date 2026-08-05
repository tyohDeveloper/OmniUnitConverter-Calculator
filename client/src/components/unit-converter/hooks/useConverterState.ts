import { useRef } from 'react';
import type { UnitCategory } from '@/lib/units/unitCategory';
import { useConverterContext } from '../context/ConverterContext';
import * as actions from '../state/actions/converterActions';

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
  symbolicResult: string | null;
  setSymbolicResult: (value: string | null) => void;
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
    setActiveCategory: (v) => dispatch({ domain: 'converter', ...actions.setActiveCategory(v) }),
    fromUnit: s.fromUnit,
    setFromUnit: (v) => dispatch({ domain: 'converter', ...actions.setFromUnit(v) }),
    toUnit: s.toUnit,
    setToUnit: (v) => dispatch({ domain: 'converter', ...actions.setToUnit(v) }),
    fromPrefix: s.fromPrefix,
    setFromPrefix: (v) => dispatch({ domain: 'converter', ...actions.setFromPrefix(v) }),
    toPrefix: s.toPrefix,
    setToPrefix: (v) => dispatch({ domain: 'converter', ...actions.setToPrefix(v) }),
    inputValue: s.inputValue,
    setInputValue: (v) => dispatch({ domain: 'converter', ...actions.setInputValue(v) }),
    result: s.result,
    setResult: (v) => dispatch({ domain: 'converter', ...actions.setResult(v) }),
    symbolicResult: s.symbolicResult,
    setSymbolicResult: (v) => dispatch({ domain: 'converter', ...actions.setSymbolicResult(v) }),
    precision: s.precision,
    setPrecision: (v) => dispatch({ domain: 'converter', ...actions.setPrecision(v) }),
    comparisonMode: s.comparisonMode,
    setComparisonMode: (v) => dispatch({ domain: 'converter', ...actions.setComparisonMode(v) }),
  };
}
