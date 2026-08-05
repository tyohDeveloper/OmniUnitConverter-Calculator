import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import type { CalcValue } from '@/lib/units/calcValue';
import type { SIRepresentation } from '@/lib/si-representations/siRepresentation';
import type { applyPrefixToKgUnit } from '@/lib/units/applyPrefixToKgUnit';
import type { RpnUnaryOp as RpnUnaryOpLib } from '@/lib/calculator/applyRpnUnary';
import type { RpnBinaryOp as RpnBinaryOpLib } from '@/lib/calculator/applyRpnBinary';

/**
 * Public surface of useCalculatorController. Extracted from the hook
 * file so the hook body can shrink toward the file-length cap
 * without losing this documentation-relevant type.
 *
 * Council-02: re-export the lib's op types so any future op added
 * to lib/calculator/rpnOps/* is instantly visible here.
 *
 * Grouped by responsibility:
 *   - Simple-mode state (calculatorMode, calcValues, calcOp1/2, ...)
 *   - RPN state (rpnStack, previousRpnStack, rpnResultPrefix, ...)
 *   - Field-clear + copy handlers
 *   - Mode switching (Simple <-> RPN)
 *   - RPN operations (unary, binary, canApply, stack ops)
 *   - Display formatters (getRpnResultDisplay, getCalcResultDisplay)
 *   - Passthroughs (generateSIRepresentations, applyPrefixToKgUnit,
 *     formatNumberWithSeparators, t)
 */
export type RpnUnaryOp = RpnUnaryOpLib;
export type RpnBinaryOp = RpnBinaryOpLib;

export interface UseCalculatorControllerReturn {
  calculatorMode: 'simple' | 'rpn';
  shiftActive: boolean;
  calculatorPrecision: number;
  calcValues: Array<CalcValue | null>;
  calcOp1: '+' | '-' | '*' | '/' | null;
  calcOp2: '+' | '-' | '*' | '/' | null;
  resultPrefix: string;
  selectedAlternative: number;
  preserveSourceUnit: boolean;
  rpnStack: Array<CalcValue | null>;
  previousRpnStack: Array<CalcValue | null>;
  rpnResultPrefix: string;
  rpnSelectedAlternative: number;
  rpnXEditing: boolean;
  rpnXEditValue: string;

  setShiftActive: (v: boolean) => void;
  setCalculatorPrecision: (v: number) => void;
  setCalcOp1: (v: '+' | '-' | '*' | '/' | null) => void;
  setCalcOp2: (v: '+' | '-' | '*' | '/' | null) => void;
  setResultPrefix: (v: string) => void;
  setSelectedAlternative: (v: number) => void;
  togglePreserveSourceUnit: () => void;
  setRpnStack: (v: Array<CalcValue | null> | ((prev: Array<CalcValue | null>) => Array<CalcValue | null>)) => void;
  setRpnXEditing: (v: boolean) => void;
  setRpnXEditValue: (v: string) => void;

  clearCalculator: () => void;
  clearField1: () => void;
  clearField2: () => void;
  clearField3: () => void;
  clearRpnStack: () => void;
  copyCalcField: (index: number) => void;
  copyCalcResult: () => void;
  copyRpnField: (index: number) => void;
  copyRpnResult: () => void;
  switchToRpn: () => void;
  switchToSimple: () => void;
  applyRpnUnary: (op: RpnUnaryOp) => void;
  applyRpnBinary: (op: RpnBinaryOp) => void;
  canApplyRpnBinary: (op: RpnBinaryOp) => boolean;
  pushToRpnStack: () => void;
  dropRpnStack: () => void;
  undoRpnStack: () => void;
  pullFromPane: () => void;
  pasteToRpnStack: () => Promise<void>;
  swapRpnXY: () => void;
  recallLastX: () => void;
  pushRpnConstant: (value: number) => void;
  saveRpnStackForUndo: () => void;
  setRpnResultPrefix: (v: string) => void;
  setRpnSelectedAlternative: (v: number) => void;
  getRpnResultDisplay: () => { formattedValue: string; unitSymbol: string } | null;
  getCalcResultDisplay: () => { formattedValue: string; unitSymbol: string } | null;
  generateSIRepresentations: (dimensions: DimensionalFormula, sourceCategory?: string) => SIRepresentation[];
  applyPrefixToKgUnit: typeof applyPrefixToKgUnit;
  formatNumberWithSeparators: (num: number, precision: number) => string;
  t: (key: string) => string;
}
