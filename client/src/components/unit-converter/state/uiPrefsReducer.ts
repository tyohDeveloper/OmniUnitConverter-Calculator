import type { NumberFormat } from '@/lib/formatting';

export interface UiPrefsState {
  numberFormat: NumberFormat;
  language: string;
  activeTab: string;
  directValue: string;
  directExponents: Record<string, number>;
}

export const uiPrefsInitialState: UiPrefsState = {
  numberFormat: 'uk',
  language: 'en',
  activeTab: 'converter',
  directValue: '1',
  directExponents: {
    m: 0,
    kg: 0,
    s: 0,
    A: 0,
    K: 0,
    mol: 0,
    cd: 0,
    rad: 0,
    sr: 0,
  },
};

export type UiPrefsAction =
  | { type: 'SET_NUMBER_FORMAT'; payload: NumberFormat }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_DIRECT_VALUE'; payload: string }
  | { type: 'SET_DIRECT_EXPONENTS'; payload: Record<string, number> }
  | { type: 'UPDATE_DIRECT_EXPONENTS'; payload: (prev: Record<string, number>) => Record<string, number> };

export function uiPrefsReducer(state: UiPrefsState, action: UiPrefsAction): UiPrefsState {
  switch (action.type) {
    case 'SET_NUMBER_FORMAT':
      return { ...state, numberFormat: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_DIRECT_VALUE':
      return { ...state, directValue: action.payload };
    case 'SET_DIRECT_EXPONENTS':
      return { ...state, directExponents: action.payload };
    case 'UPDATE_DIRECT_EXPONENTS':
      return { ...state, directExponents: action.payload(state.directExponents) };
    default:
      return state;
  }
}
