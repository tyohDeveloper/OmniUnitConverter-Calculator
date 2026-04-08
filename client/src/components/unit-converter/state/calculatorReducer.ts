import type { CalcValue } from '@/lib/units/calcValue';
import type { UnitCategory } from '@/lib/units/unitCategory';

export interface CalculatorState {
  calculatorMode: 'simple' | 'rpn';
  shiftActive: boolean;
  calculatorPrecision: number;
  calcValues: Array<CalcValue | null>;
  calcOp1: '+' | '-' | '*' | '/' | null;
  calcOp2: '+' | '-' | '*' | '/' | null;
  resultUnit: string | null;
  resultCategory: UnitCategory | null;
  resultPrefix: string;
  selectedAlternative: number;
  preserveSourceUnit: boolean;
}

export const calculatorInitialState: CalculatorState = {
  calculatorMode: 'rpn',
  shiftActive: false,
  calculatorPrecision: 4,
  calcValues: [null, null, null, null],
  calcOp1: null,
  calcOp2: null,
  resultUnit: null,
  resultCategory: null,
  resultPrefix: 'none',
  selectedAlternative: 0,
  preserveSourceUnit: false,
};

export type CalculatorAction =
  | { type: 'SET_CALCULATOR_MODE'; payload: 'simple' | 'rpn' }
  | { type: 'SET_SHIFT_ACTIVE'; payload: boolean }
  | { type: 'SET_CALCULATOR_PRECISION'; payload: number }
  | { type: 'SET_CALC_VALUES'; payload: Array<CalcValue | null> }
  | { type: 'UPDATE_CALC_VALUES'; payload: (prev: Array<CalcValue | null>) => Array<CalcValue | null> }
  | { type: 'SET_CALC_OP1'; payload: '+' | '-' | '*' | '/' | null }
  | { type: 'SET_CALC_OP2'; payload: '+' | '-' | '*' | '/' | null }
  | { type: 'SET_RESULT_UNIT'; payload: string | null }
  | { type: 'SET_RESULT_CATEGORY'; payload: UnitCategory | null }
  | { type: 'SET_RESULT_PREFIX'; payload: string }
  | { type: 'SET_SELECTED_ALTERNATIVE'; payload: number }
  | { type: 'TOGGLE_PRESERVE_SOURCE_UNIT' };

export function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'SET_CALCULATOR_MODE':
      return { ...state, calculatorMode: action.payload };
    case 'SET_SHIFT_ACTIVE':
      return { ...state, shiftActive: action.payload };
    case 'SET_CALCULATOR_PRECISION':
      return { ...state, calculatorPrecision: action.payload };
    case 'SET_CALC_VALUES':
      return { ...state, calcValues: action.payload };
    case 'UPDATE_CALC_VALUES':
      return { ...state, calcValues: action.payload(state.calcValues) };
    case 'SET_CALC_OP1':
      return { ...state, calcOp1: action.payload };
    case 'SET_CALC_OP2':
      return { ...state, calcOp2: action.payload };
    case 'SET_RESULT_UNIT':
      return { ...state, resultUnit: action.payload };
    case 'SET_RESULT_CATEGORY':
      return { ...state, resultCategory: action.payload };
    case 'SET_RESULT_PREFIX':
      return { ...state, resultPrefix: action.payload };
    case 'SET_SELECTED_ALTERNATIVE':
      return { ...state, selectedAlternative: action.payload };
    case 'TOGGLE_PRESERVE_SOURCE_UNIT':
      return { ...state, preserveSourceUnit: !state.preserveSourceUnit };
    default:
      return state;
  }
}
