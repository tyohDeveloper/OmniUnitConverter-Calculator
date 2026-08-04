import type { CalcValue } from '@/lib/units/calcValue';
import { applyPushValue } from './reducers/rpn/applyPushValue';
import { applySaveAndUpdateStack } from './reducers/rpn/applySaveAndUpdateStack';
import { applyDropValue } from './reducers/rpn/applyDropValue';
import { applySwapXY } from './reducers/rpn/applySwapXY';
import { applyRecallLastX } from './reducers/rpn/applyRecallLastX';
import { applyClearStack } from './reducers/rpn/applyClearStack';

export interface RpnState {
  rpnStack: Array<CalcValue | null>;
  previousRpnStack: Array<CalcValue | null>;
  lastX: CalcValue | null;
  rpnResultPrefix: string;
  rpnSelectedAlternative: number;
  rpnXEditing: boolean;
  rpnXEditValue: string;
}

export const rpnInitialState: RpnState = {
  rpnStack: [null, null, null, null],
  previousRpnStack: [null, null, null, null],
  lastX: null,
  rpnResultPrefix: 'none',
  rpnSelectedAlternative: 0,
  rpnXEditing: false,
  rpnXEditValue: '',
};

export type RpnAction =
  | { type: 'SET_RPN_STACK'; payload: Array<CalcValue | null> }
  | { type: 'UPDATE_RPN_STACK'; payload: (prev: Array<CalcValue | null>) => Array<CalcValue | null> }
  | { type: 'SET_PREVIOUS_RPN_STACK'; payload: Array<CalcValue | null> }
  | { type: 'SET_LAST_X'; payload: CalcValue | null }
  | { type: 'SET_RPN_RESULT_PREFIX'; payload: string }
  | { type: 'SET_RPN_SELECTED_ALTERNATIVE'; payload: number }
  | { type: 'SET_RPN_X_EDITING'; payload: boolean }
  | { type: 'SET_RPN_X_EDIT_VALUE'; payload: string }
  | { type: 'PUSH_VALUE'; payload: CalcValue }
  | { type: 'DROP_VALUE' }
  | { type: 'SWAP_XY' }
  | { type: 'CLEAR_STACK' }
  | { type: 'UNDO_STACK' }
  | { type: 'RECALL_LAST_X' }
  | { type: 'SAVE_AND_UPDATE_STACK'; payload: (stack: Array<CalcValue | null>) => Array<CalcValue | null> };

export function rpnReducer(state: RpnState, action: RpnAction): RpnState {
  switch (action.type) {
    case 'SET_RPN_STACK':
      return { ...state, rpnStack: action.payload };
    case 'UPDATE_RPN_STACK':
      return { ...state, rpnStack: action.payload(state.rpnStack) };
    case 'SET_PREVIOUS_RPN_STACK':
      return { ...state, previousRpnStack: action.payload };
    case 'SET_LAST_X':
      return { ...state, lastX: action.payload };
    case 'SET_RPN_RESULT_PREFIX':
      return { ...state, rpnResultPrefix: action.payload };
    case 'SET_RPN_SELECTED_ALTERNATIVE':
      return { ...state, rpnSelectedAlternative: action.payload };
    case 'SET_RPN_X_EDITING':
      return { ...state, rpnXEditing: action.payload };
    case 'SET_RPN_X_EDIT_VALUE':
      return { ...state, rpnXEditValue: action.payload };
    case 'SAVE_AND_UPDATE_STACK':
      return applySaveAndUpdateStack(state, action.payload);
    case 'PUSH_VALUE':
      return applyPushValue(state, action.payload);
    case 'DROP_VALUE':
      return applyDropValue(state);
    case 'SWAP_XY':
      return applySwapXY(state);
    case 'CLEAR_STACK':
      return applyClearStack(state);
    case 'UNDO_STACK':
      return { ...state, rpnStack: [...state.previousRpnStack] };
    case 'RECALL_LAST_X':
      return applyRecallLastX(state);
    default:
      return state;
  }
}
