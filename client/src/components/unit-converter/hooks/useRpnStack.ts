import type { CalcValue } from '@/lib/units/shared-types';
import { useConverterContext } from '../context/ConverterContext';

export interface UseRpnStackReturn {
  rpnStack: Array<CalcValue | null>;
  setRpnStack: (value: Array<CalcValue | null> | ((prev: Array<CalcValue | null>) => Array<CalcValue | null>)) => void;
  previousRpnStack: Array<CalcValue | null>;
  setPreviousRpnStack: (value: Array<CalcValue | null>) => void;
  lastX: CalcValue | null;
  setLastX: (value: CalcValue | null) => void;
  rpnResultPrefix: string;
  setRpnResultPrefix: (value: string) => void;
  rpnSelectedAlternative: number;
  setRpnSelectedAlternative: (value: number) => void;
  rpnXEditing: boolean;
  setRpnXEditing: (value: boolean) => void;
  rpnXEditValue: string;
  setRpnXEditValue: (value: string) => void;
  saveAndUpdateStack: (updater: (stack: Array<CalcValue | null>) => Array<CalcValue | null>) => void;
  pushValue: (value: CalcValue) => void;
  dropValue: () => void;
  swapXY: () => void;
  clearStack: () => void;
  undoStack: () => void;
  recallLastX: () => void;
}

export function useRpnStack(): UseRpnStackReturn {
  const { state, dispatch } = useConverterContext();
  const s = state.rpn;

  return {
    rpnStack: s.rpnStack,
    setRpnStack: (v) => typeof v === 'function'
      ? dispatch({ domain: 'rpn', type: 'UPDATE_RPN_STACK', payload: v })
      : dispatch({ domain: 'rpn', type: 'SET_RPN_STACK', payload: v }),
    previousRpnStack: s.previousRpnStack,
    setPreviousRpnStack: (v) => dispatch({ domain: 'rpn', type: 'SET_PREVIOUS_RPN_STACK', payload: v }),
    lastX: s.lastX,
    setLastX: (v) => dispatch({ domain: 'rpn', type: 'SET_LAST_X', payload: v }),
    rpnResultPrefix: s.rpnResultPrefix,
    setRpnResultPrefix: (v) => dispatch({ domain: 'rpn', type: 'SET_RPN_RESULT_PREFIX', payload: v }),
    rpnSelectedAlternative: s.rpnSelectedAlternative,
    setRpnSelectedAlternative: (v) => dispatch({ domain: 'rpn', type: 'SET_RPN_SELECTED_ALTERNATIVE', payload: v }),
    rpnXEditing: s.rpnXEditing,
    setRpnXEditing: (v) => dispatch({ domain: 'rpn', type: 'SET_RPN_X_EDITING', payload: v }),
    rpnXEditValue: s.rpnXEditValue,
    setRpnXEditValue: (v) => dispatch({ domain: 'rpn', type: 'SET_RPN_X_EDIT_VALUE', payload: v }),
    saveAndUpdateStack: (updater) => dispatch({ domain: 'rpn', type: 'SAVE_AND_UPDATE_STACK', payload: updater }),
    pushValue: (v) => dispatch({ domain: 'rpn', type: 'PUSH_VALUE', payload: v }),
    dropValue: () => dispatch({ domain: 'rpn', type: 'DROP_VALUE' }),
    swapXY: () => dispatch({ domain: 'rpn', type: 'SWAP_XY' }),
    clearStack: () => dispatch({ domain: 'rpn', type: 'CLEAR_STACK' }),
    undoStack: () => dispatch({ domain: 'rpn', type: 'UNDO_STACK' }),
    recallLastX: () => dispatch({ domain: 'rpn', type: 'RECALL_LAST_X' }),
  };
}
