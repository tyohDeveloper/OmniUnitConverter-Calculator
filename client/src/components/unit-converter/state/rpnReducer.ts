import type { CalcValue } from '@/lib/units/shared-types';

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
    case 'SAVE_AND_UPDATE_STACK': {
      const newStack = action.payload([...state.rpnStack]);
      return {
        ...state,
        previousRpnStack: [...state.rpnStack],
        rpnStack: newStack,
        rpnResultPrefix: 'none',
        rpnSelectedAlternative: 0,
      };
    }
    case 'PUSH_VALUE': {
      const newStack = [...state.rpnStack];
      newStack[3] = newStack[2];
      newStack[2] = newStack[1];
      newStack[1] = newStack[0];
      newStack[0] = action.payload;
      return {
        ...state,
        previousRpnStack: [...state.rpnStack],
        rpnStack: newStack,
        rpnResultPrefix: 'none',
        rpnSelectedAlternative: 0,
      };
    }
    case 'DROP_VALUE': {
      const newStack = [...state.rpnStack];
      newStack[0] = newStack[1];
      newStack[1] = newStack[2];
      newStack[2] = newStack[3];
      newStack[3] = null;
      return {
        ...state,
        previousRpnStack: [...state.rpnStack],
        rpnStack: newStack,
        rpnResultPrefix: 'none',
        rpnSelectedAlternative: 0,
      };
    }
    case 'SWAP_XY': {
      if (state.rpnStack[0] === null || state.rpnStack[1] === null) return state;
      const newStack = [...state.rpnStack];
      const temp = newStack[0];
      newStack[0] = newStack[1];
      newStack[1] = temp;
      return {
        ...state,
        previousRpnStack: [...state.rpnStack],
        rpnStack: newStack,
        rpnResultPrefix: 'none',
        rpnSelectedAlternative: 0,
      };
    }
    case 'CLEAR_STACK':
      return {
        ...state,
        previousRpnStack: [...state.rpnStack],
        rpnStack: [null, null, null, null],
        lastX: null,
        rpnXEditing: false,
        rpnXEditValue: '',
        rpnResultPrefix: 'none',
        rpnSelectedAlternative: 0,
      };
    case 'UNDO_STACK':
      return { ...state, rpnStack: [...state.previousRpnStack] };
    case 'RECALL_LAST_X': {
      if (state.lastX === null) return state;
      const newStack = [...state.rpnStack];
      newStack[3] = newStack[2];
      newStack[2] = newStack[1];
      newStack[1] = newStack[0];
      newStack[0] = state.lastX;
      return {
        ...state,
        previousRpnStack: [...state.rpnStack],
        rpnStack: newStack,
        rpnResultPrefix: 'none',
        rpnSelectedAlternative: 0,
      };
    }
    default:
      return state;
  }
}
