import type { CalcValue } from '@/lib/units/calcValue';
import type { UnitCategory } from '@/lib/units/unitCategory';
import { useConverterContext } from '../context/ConverterContext';
import * as actions from '../state/actions/calculatorActions';

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
  preserveSourceUnit: boolean;
  togglePreserveSourceUnit: () => void;
  // Council-10: atomic recalc; replaces the controller-side useEffect+ref.
  recalculateSimple: () => void;
}

export function useCalculatorState(): UseCalculatorStateReturn {
  const { state, dispatch } = useConverterContext();
  const s = state.calculator;

  return {
    calculatorMode: s.calculatorMode,
    setCalculatorMode: (v) => dispatch({ domain: 'calculator', ...actions.setCalculatorMode(v) }),
    shiftActive: s.shiftActive,
    setShiftActive: (v) => dispatch({ domain: 'calculator', ...actions.setShiftActive(v) }),
    calculatorPrecision: s.calculatorPrecision,
    setCalculatorPrecision: (v) => dispatch({ domain: 'calculator', ...actions.setCalculatorPrecision(v) }),
    calcValues: s.calcValues,
    setCalcValues: (v) => typeof v === 'function'
      ? dispatch({ domain: 'calculator', ...actions.updateCalcValues(v) })
      : dispatch({ domain: 'calculator', ...actions.setCalcValues(v) }),
    calcOp1: s.calcOp1,
    setCalcOp1: (v) => dispatch({ domain: 'calculator', ...actions.setCalcOp1(v) }),
    calcOp2: s.calcOp2,
    setCalcOp2: (v) => dispatch({ domain: 'calculator', ...actions.setCalcOp2(v) }),
    resultUnit: s.resultUnit,
    setResultUnit: (v) => dispatch({ domain: 'calculator', ...actions.setResultUnit(v) }),
    resultCategory: s.resultCategory,
    setResultCategory: (v) => dispatch({ domain: 'calculator', ...actions.setResultCategory(v) }),
    resultPrefix: s.resultPrefix,
    setResultPrefix: (v) => dispatch({ domain: 'calculator', ...actions.setResultPrefix(v) }),
    selectedAlternative: s.selectedAlternative,
    setSelectedAlternative: (v) => dispatch({ domain: 'calculator', ...actions.setSelectedAlternative(v) }),
    preserveSourceUnit: s.preserveSourceUnit,
    togglePreserveSourceUnit: () => dispatch({ domain: 'calculator', ...actions.togglePreserveSourceUnit() }),
    recalculateSimple: () => dispatch({ domain: 'calculator', ...actions.recalculateSimple() }),
  };
}
