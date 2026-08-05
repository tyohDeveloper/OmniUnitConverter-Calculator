import { useCallback } from 'react';
import type { CalcValue } from '@/lib/units/calcValue';
import { formatDimensions } from '@/lib/unit-symbols/formatDimensions';
import { formatCalcValueDisplay } from '@/lib/calculator/formatCalcValueDisplay';
import { fixPrecision } from '@/lib/calculator/fixPrecision';
import { cleanNumber } from '@/lib/calculator/cleanNumber';

// §1.6: unitSymbol + displayValue are computed by formatCalcValue
// Display (which itself uses composeUnitDisplaySymbol). Simple-mode
// field copy uses cleanNumber(fixPrecision(displayValue), ...) for
// a trailing-zero-trimmed, separator-free output; RPN field copy
// uses the locale-aware formattedValue with commas stripped.

interface UseCalculatorClipboardArgs {
  calcValues: Array<CalcValue | null>;
  rpnStack: Array<CalcValue | null>;
  calculatorPrecision: number;
  formatNumberWithSeparators: (num: number, precision: number) => string;
  getCalcResultDisplay: () => { formattedValue: string; unitSymbol: string } | null;
  getRpnResultDisplay: () => { formattedValue: string; unitSymbol: string } | null;
  triggerFlashCopyCalc: () => void;
  triggerFlashCalcField1: () => void;
  triggerFlashCalcField2: () => void;
  triggerFlashCalcField3: () => void;
  triggerFlashRpnResult: () => void;
  triggerFlashRpnField1: () => void;
  triggerFlashRpnField2: () => void;
  triggerFlashRpnField3: () => void;
}

function writeClipboardText(value: string, unit: string): void {
  navigator.clipboard.writeText(unit ? `${value} ${unit}` : value);
}

function doCopyCalcField(
  val: CalcValue, calculatorPrecision: number,
  formatNumberWithSeparators: (n: number, p: number) => string,
  fieldIndex: number,
  flashers: [() => void, () => void, () => void],
): void {
  const { unitSymbol, displayValue } = formatCalcValueDisplay(
    val.value, formatDimensions(val.dimensions), val.prefix, calculatorPrecision, formatNumberWithSeparators,
  );
  writeClipboardText(cleanNumber(fixPrecision(displayValue), calculatorPrecision), unitSymbol);
  flashers[fieldIndex]?.();
}

function doCopyRpnField(
  val: CalcValue, calculatorPrecision: number,
  formatNumberWithSeparators: (n: number, p: number) => string,
  index: number,
  flashers: [() => void, () => void, () => void],
): void {
  const { unitSymbol, formattedValue } = formatCalcValueDisplay(
    val.value, formatDimensions(val.dimensions), val.prefix, calculatorPrecision, formatNumberWithSeparators,
  );
  writeClipboardText(formattedValue.replace(/,/g, ''), unitSymbol);
  flashers[index]?.();
}

/**
 * Clipboard writers for the calculator. Two flavors:
 *   - result copiers (delegate to display formatters)
 *   - field copiers (RPN preserves thousands-separator; simple-mode
 *     uses cleanNumber which trims trailing zeros)
 */
export function useCalculatorClipboard(args: UseCalculatorClipboardArgs) {
  const a = args;
  const calcFlashers: [() => void, () => void, () => void] = [a.triggerFlashCalcField1, a.triggerFlashCalcField2, a.triggerFlashCalcField3];
  const rpnFlashers: [() => void, () => void, () => void] = [a.triggerFlashRpnField1, a.triggerFlashRpnField2, a.triggerFlashRpnField3];
  const copyCalcResult = useCallback(() => {
    const d = a.getCalcResultDisplay(); if (!d) return;
    writeClipboardText(d.formattedValue, d.unitSymbol); a.triggerFlashCopyCalc();
  }, [a.getCalcResultDisplay, a.triggerFlashCopyCalc]);
  const copyCalcField = useCallback((i: number) => {
    const val = a.calcValues[i]; if (val) doCopyCalcField(val, a.calculatorPrecision, a.formatNumberWithSeparators, i, calcFlashers);
  }, [a.calcValues, a.calculatorPrecision, a.formatNumberWithSeparators, calcFlashers]);
  const copyRpnResult = useCallback(() => {
    const d = a.getRpnResultDisplay(); if (!d) return;
    writeClipboardText(d.formattedValue.replace(/,/g, ''), d.unitSymbol); a.triggerFlashRpnResult();
  }, [a.getRpnResultDisplay, a.triggerFlashRpnResult]);
  const copyRpnField = useCallback((i: number) => {
    const val = a.rpnStack[i]; if (val) doCopyRpnField(val, a.calculatorPrecision, a.formatNumberWithSeparators, i, rpnFlashers);
  }, [a.rpnStack, a.calculatorPrecision, a.formatNumberWithSeparators, rpnFlashers]);
  return { copyCalcResult, copyCalcField, copyRpnResult, copyRpnField };
}
