import type { NumberFormat } from '@/lib/formatting';
import type { SupportedLanguage } from '@/lib/localization';
import type { PasteStatus, PendingPasteUnit } from '../state/uiPrefsReducer';
import { useConverterContext } from '../context/ConverterContext';
import * as actions from '../state/actions/uiActions';

// EXCEPTION [architecture-standards §3.2]: type-and-function co-location.
// Return type sits with its factory; the interface is the hook's contract.
export interface UseUiPrefsStateReturn {
  numberFormat: NumberFormat;
  setNumberFormat: (v: NumberFormat) => void;
  language: SupportedLanguage;
  setLanguage: (v: SupportedLanguage) => void;
  activeTab: string;
  setActiveTab: (v: string) => void;
  directValue: string;
  setDirectValue: (v: string) => void;
  directExponents: Record<string, number>;
  setDirectExponents: (v: Record<string, number>) => void;
  pendingPasteUnit: PendingPasteUnit | null;
  setPendingPasteUnit: (v: PendingPasteUnit | null) => void;
  converterPasteStatus: PasteStatus;
  setConverterPasteStatus: (v: PasteStatus) => void;
  customPasteStatus: PasteStatus;
  setCustomPasteStatus: (v: PasteStatus) => void;
}

/**
 * Reader/writer surface for the uiPrefs reducer slice.
 *
 * Mirrors useConverterState's shape: exposes each field of the slice
 * as a value + setter pair. The setters are thin dispatch shims — no
 * logic, no side effects — so this hook contains no orchestration.
 * When a consumer needs to read AND write a uiPrefs field, this is
 * the file to look in; when only reading, prefer this over pulling
 * state.uiPrefs directly out of the context so refactors of the slice
 * shape stay contained.
 *
 * Setters are intentionally not wrapped in useCallback: the enclosing
 * dispatch identity is stable across renders (React guarantees that
 * for useReducer), and the setters here are freshly created each
 * render but with dependency-free logic. If a downstream memoized
 * effect ever needs one of these setters in a dep array, wrap it at
 * the call site.
 */
export function useUiPrefsState(): UseUiPrefsStateReturn {
  const { state, dispatch } = useConverterContext();
  const s = state.uiPrefs;
  return {
    numberFormat: s.numberFormat,
    setNumberFormat: (v) => dispatch({ domain: 'uiPrefs', ...actions.setNumberFormat(v) }),
    language: s.language as SupportedLanguage,
    setLanguage: (v) => dispatch({ domain: 'uiPrefs', ...actions.setLanguage(v) }),
    activeTab: s.activeTab,
    setActiveTab: (v) => dispatch({ domain: 'uiPrefs', ...actions.setActiveTab(v) }),
    directValue: s.directValue,
    setDirectValue: (v) => dispatch({ domain: 'uiPrefs', ...actions.setDirectValue(v) }),
    directExponents: s.directExponents,
    setDirectExponents: (v) => dispatch({ domain: 'uiPrefs', ...actions.setDirectExponents(v) }),
    pendingPasteUnit: s.pendingPasteUnit,
    setPendingPasteUnit: (v) => dispatch({ domain: 'uiPrefs', ...actions.setPendingPasteUnit(v) }),
    converterPasteStatus: s.converterPasteStatus,
    setConverterPasteStatus: (v) => dispatch({ domain: 'uiPrefs', ...actions.setConverterPasteStatus(v) }),
    customPasteStatus: s.customPasteStatus,
    setCustomPasteStatus: (v) => dispatch({ domain: 'uiPrefs', ...actions.setCustomPasteStatus(v) }),
  };
}
