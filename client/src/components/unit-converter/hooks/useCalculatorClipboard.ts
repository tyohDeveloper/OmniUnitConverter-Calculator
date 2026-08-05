import { useCallback } from 'react';
import type { CalcValue } from '@/lib/units/calcValue';
import { PREFIXES } from '@/lib/units/prefixes';
import { formatDimensions } from '@/lib/unit-symbols/formatDimensions';
import { applyPrefixToKgUnit as applyPrefixToKgUnitLib } from '@/lib/units/applyPrefixToKgUnit';
import { fixPrecision } from '@/lib/calculator/fixPrecision';
import { cleanNumber } from '@/lib/calculator/cleanNumber';

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

function fieldValueSymbol(val: CalcValue): { unitSymbol: string; displayValue: number } {
  const baseUnitSymbol = formatDimensions(val.dimensions);
  const kgResult = applyPrefixToKgUnitLib(baseUnitSymbol, val.prefix);
  const displayValue = val.value / kgResult.effectivePrefixFactor;
  const prefixData = PREFIXES.find(p => p.id === val.prefix);
  const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
  return { unitSymbol: prefixSymbol + kgResult.displaySymbol, displayValue };
}

function writeClipboardText(value: string, unit: string): void {
  navigator.clipboard.writeText(unit ? `${value} ${unit}` : value);
}

function doCopyCalcField(
  val: CalcValue, calculatorPrecision: number,
  fieldIndex: number,
  flashers: [() => void, () => void, () => void],
): void {
  const { unitSymbol, displayValue } = fieldValueSymbol(val);
  writeClipboardText(cleanNumber(fixPrecision(displayValue), calculatorPrecision), unitSymbol);
  flashers[fieldIndex]?.();
}

function doCopyRpnField(
  val: CalcValue, calculatorPrecision: number,
  formatNumberWithSeparators: (n: number, p: number) => string,
  index: number,
  flashers: [() => void, () => void, () => void],
): void {
  const { unitSymbol, displayValue } = fieldValueSymbol(val);
  const cleanValue = formatNumberWithSeparators(displayValue, calculatorPrecision).replace(/,/g, '');
  writeClipboardText(cleanValue, unitSymbol);
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
    const val = a.calcValues[i]; if (val) doCopyCalcField(val, a.calculatorPrecision, i, calcFlashers);
  }, [a.calcValues, a.calculatorPrecision, calcFlashers]);
  const copyRpnResult = useCallback(() => {
    const d = a.getRpnResultDisplay(); if (!d) return;
    writeClipboardText(d.formattedValue.replace(/,/g, ''), d.unitSymbol); a.triggerFlashRpnResult();
  }, [a.getRpnResultDisplay, a.triggerFlashRpnResult]);
  const copyRpnField = useCallback((i: number) => {
    const val = a.rpnStack[i]; if (val) doCopyRpnField(val, a.calculatorPrecision, a.formatNumberWithSeparators, i, rpnFlashers);
  }, [a.rpnStack, a.calculatorPrecision, a.formatNumberWithSeparators, rpnFlashers]);
  return { copyCalcResult, copyCalcField, copyRpnResult, copyRpnField };
}
