import type { CalcValue } from '@/lib/units/shared-types';
import type { UnitCategory } from '@/lib/units/types';
import { useConverterContext } from '../context/ConverterContext';

export interface UseCalculatorStateReturn {
  calculatorMode: 'simple' | 'rpn';
  setCalculatorMode: (value: 'simple' | 'rpn') => void;
  shiftActive: boolean;
  setShiftActive: (value: boolean) => void;
  calculatorPrecision: number;
  setCalculatorPrecision: (value: number) => void;
  calcValues: Array<CalcValue | null>;
  setCalcValues: (value: Array<CalcValue | null> | ((prev: Array<CalcValue | null>) => Array<CalcValue | null>)) => void;
  calcOp1: '+' | '-' | '*' | '/' | null;
  setCalcOp1: (value: '+' | '-' | '*' | '/' | null) => void;
  calcOp2: '+' | '-' | '*' | '/' | null;
  setCalcOp2: (value: '+' | '-' | '*' | '/' | null) => void;
  resultUnit: string | null;
  setResultUnit: (value: string | null) => void;
  resultCategory: UnitCategory | null;
  setResultCategory: (value: UnitCategory | null) => void;
  resultPrefix: string;
  setResultPrefix: (value: string) => void;
  selectedAlternative: number;
  setSelectedAlternative: (value: number) => void;
}

export function useCalculatorState(): UseCalculatorStateReturn {
  const { state, dispatch } = useConverterContext();
  const s = state.calculator;

  return {
    calculatorMode: s.calculatorMode,
    setCalculatorMode: (v) => dispatch({ domain: 'calculator', type: 'SET_CALCULATOR_MODE', payload: v }),
    shiftActive: s.shiftActive,
    setShiftActive: (v) => dispatch({ domain: 'calculator', type: 'SET_SHIFT_ACTIVE', payload: v }),
    calculatorPrecision: s.calculatorPrecision,
    setCalculatorPrecision: (v) => dispatch({ domain: 'calculator', type: 'SET_CALCULATOR_PRECISION', payload: v }),
    calcValues: s.calcValues,
    setCalcValues: (v) => typeof v === 'function'
      ? dispatch({ domain: 'calculator', type: 'UPDATE_CALC_VALUES', payload: v })
      : dispatch({ domain: 'calculator', type: 'SET_CALC_VALUES', payload: v }),
    calcOp1: s.calcOp1,
    setCalcOp1: (v) => dispatch({ domain: 'calculator', type: 'SET_CALC_OP1', payload: v }),
    calcOp2: s.calcOp2,
    setCalcOp2: (v) => dispatch({ domain: 'calculator', type: 'SET_CALC_OP2', payload: v }),
    resultUnit: s.resultUnit,
    setResultUnit: (v) => dispatch({ domain: 'calculator', type: 'SET_RESULT_UNIT', payload: v }),
    resultCategory: s.resultCategory,
    setResultCategory: (v) => dispatch({ domain: 'calculator', type: 'SET_RESULT_CATEGORY', payload: v }),
    resultPrefix: s.resultPrefix,
    setResultPrefix: (v) => dispatch({ domain: 'calculator', type: 'SET_RESULT_PREFIX', payload: v }),
    selectedAlternative: s.selectedAlternative,
    setSelectedAlternative: (v) => dispatch({ domain: 'calculator', type: 'SET_SELECTED_ALTERNATIVE', payload: v }),
  };
}
