import React, { createContext, useContext, useReducer, useRef, type ReactNode } from 'react';
import { converterReducer, converterInitialState, type ConverterState, type ConverterAction } from '../state/converterReducer';
import { calculatorReducer, calculatorInitialState, type CalculatorState, type CalculatorAction } from '../state/calculatorReducer';
import { rpnReducer, rpnInitialState, type RpnState, type RpnAction } from '../state/rpnReducer';
import { uiPrefsReducer, uiPrefsInitialState, type UiPrefsState, type UiPrefsAction } from '../state/uiPrefsReducer';
import { useAllFlashFlags, type FlashFlags } from '../hooks/useFlashFlag';
import { FLASH_DURATION_MS } from '../constants';

export type AppAction =
  | ({ domain: 'converter' } & ConverterAction)
  | ({ domain: 'calculator' } & CalculatorAction)
  | ({ domain: 'rpn' } & RpnAction)
  | ({ domain: 'uiPrefs' } & UiPrefsAction);

export interface AppState {
  converter: ConverterState;
  calculator: CalculatorState;
  rpn: RpnState;
  uiPrefs: UiPrefsState;
}

export interface ConverterContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  flash: FlashFlags;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const ConverterContext = createContext<ConverterContextValue | null>(null);

export function useConverterContext(): ConverterContextValue {
  const context = useContext(ConverterContext);
  if (!context) {
    throw new Error('useConverterContext must be used within a ConverterProvider');
  }
  return context;
}

const initialState: AppState = {
  converter: converterInitialState,
  calculator: calculatorInitialState,
  rpn: rpnInitialState,
  uiPrefs: uiPrefsInitialState,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.domain) {
    case 'converter': {
      const { domain: _d, ...converterAction } = action;
      return { ...state, converter: converterReducer(state.converter, converterAction as ConverterAction) };
    }
    case 'calculator': {
      const { domain: _d, ...calculatorAction } = action;
      return { ...state, calculator: calculatorReducer(state.calculator, calculatorAction as CalculatorAction) };
    }
    case 'rpn': {
      const { domain: _d, ...rpnAction } = action;
      return { ...state, rpn: rpnReducer(state.rpn, rpnAction as RpnAction) };
    }
    case 'uiPrefs': {
      const { domain: _d, ...uiPrefsAction } = action;
      return { ...state, uiPrefs: uiPrefsReducer(state.uiPrefs, uiPrefsAction as UiPrefsAction) };
    }
  }
}

interface ConverterProviderProps {
  children: ReactNode;
}

export function ConverterProvider({ children }: ConverterProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const flash = useAllFlashFlags(FLASH_DURATION_MS);
  const inputRef = useRef<HTMLInputElement>(null);

  const value: ConverterContextValue = {
    state,
    dispatch,
    flash,
    inputRef,
  };

  return (
    <ConverterContext.Provider value={value}>
      {children}
    </ConverterContext.Provider>
  );
}

export { ConverterContext };
