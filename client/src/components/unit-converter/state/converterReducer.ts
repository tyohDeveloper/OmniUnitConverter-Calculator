import type { UnitCategory } from '@/lib/units/unitCategory';
import { DEFAULT_PRECISION } from '@/components/unit-converter/constants';

export interface ConverterState {
  activeCategory: UnitCategory;
  fromUnit: string;
  toUnit: string;
  fromPrefix: string;
  toPrefix: string;
  inputValue: string;
  result: number | null;
  precision: number;
  comparisonMode: boolean;
}

export const converterInitialState: ConverterState = {
  activeCategory: 'length',
  fromUnit: '',
  toUnit: '',
  fromPrefix: 'none',
  toPrefix: 'none',
  inputValue: '1',
  result: null,
  precision: DEFAULT_PRECISION,
  comparisonMode: false,
};

export type ConverterAction =
  | { type: 'SET_ACTIVE_CATEGORY'; payload: UnitCategory }
  | { type: 'SET_FROM_UNIT'; payload: string }
  | { type: 'SET_TO_UNIT'; payload: string }
  | { type: 'SET_FROM_PREFIX'; payload: string }
  | { type: 'SET_TO_PREFIX'; payload: string }
  | { type: 'SET_INPUT_VALUE'; payload: string }
  | { type: 'SET_RESULT'; payload: number | null }
  | { type: 'SET_PRECISION'; payload: number }
  | { type: 'SET_COMPARISON_MODE'; payload: boolean }
  | { type: 'SWAP_UNITS' };

export function converterReducer(state: ConverterState, action: ConverterAction): ConverterState {
  switch (action.type) {
    case 'SET_ACTIVE_CATEGORY':
      return { ...state, activeCategory: action.payload };
    case 'SET_FROM_UNIT':
      return { ...state, fromUnit: action.payload };
    case 'SET_TO_UNIT':
      return { ...state, toUnit: action.payload };
    case 'SET_FROM_PREFIX':
      return { ...state, fromPrefix: action.payload };
    case 'SET_TO_PREFIX':
      return { ...state, toPrefix: action.payload };
    case 'SET_INPUT_VALUE':
      return { ...state, inputValue: action.payload };
    case 'SET_RESULT':
      return { ...state, result: action.payload };
    case 'SET_PRECISION':
      return { ...state, precision: action.payload };
    case 'SET_COMPARISON_MODE':
      return { ...state, comparisonMode: action.payload };
    case 'SWAP_UNITS':
      return {
        ...state,
        fromUnit: state.toUnit,
        toUnit: state.fromUnit,
        fromPrefix: state.toPrefix,
        toPrefix: state.fromPrefix,
      };
    default:
      return state;
  }
}
