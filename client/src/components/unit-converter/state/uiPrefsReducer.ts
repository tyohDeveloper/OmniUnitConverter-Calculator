import type { NumberFormat } from '@/lib/formatting';

export type PasteStatus = 'idle' | 'unrecognised' | 'unavailable';
export interface PendingPasteUnit {
  fromUnit: string;
  prefixId: string;
}

export interface UiPrefsState {
  numberFormat: NumberFormat;
  language: string;
  activeTab: string;
  directValue: string;
  directExponents: Record<string, number>;
  // Council-11: flow-significant paste state, moved out of controller refs/useState.
  pendingPasteUnit: PendingPasteUnit | null;
  converterPasteStatus: PasteStatus;
  customPasteStatus: PasteStatus;
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
  pendingPasteUnit: null,
  converterPasteStatus: 'idle',
  customPasteStatus: 'idle',
};

export type UiPrefsAction =
  | { type: 'SET_NUMBER_FORMAT'; payload: NumberFormat }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_DIRECT_VALUE'; payload: string }
  | { type: 'SET_DIRECT_EXPONENTS'; payload: Record<string, number> }
  | { type: 'UPDATE_DIRECT_EXPONENTS'; payload: (prev: Record<string, number>) => Record<string, number> }
  | { type: 'SET_PENDING_PASTE_UNIT'; payload: PendingPasteUnit | null }
  | { type: 'SET_CONVERTER_PASTE_STATUS'; payload: PasteStatus }
  | { type: 'SET_CUSTOM_PASTE_STATUS'; payload: PasteStatus };

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
    case 'SET_PENDING_PASTE_UNIT':
      return { ...state, pendingPasteUnit: action.payload };
    case 'SET_CONVERTER_PASTE_STATUS':
      return { ...state, converterPasteStatus: action.payload };
    case 'SET_CUSTOM_PASTE_STATUS':
      return { ...state, customPasteStatus: action.payload };
    default:
      return state;
  }
}
