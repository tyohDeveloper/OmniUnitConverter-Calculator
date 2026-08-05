import { composeUnitDisplaySymbol } from '../units/composeUnitDisplaySymbol';

export interface CalcValueDisplay {
  formattedValue: string;
  unitSymbol: string;
  /** Pre-format numeric display value (already prefix-adjusted). */
  displayValue: number;
}

/**
 * Format a calculator value (SI-base numeric + declared unit symbol +
 * prefix id) for display or clipboard. Single-sourced per
 * architecture-standards §1.6.
 *
 * Uses the simple kg-aware formula:
 *   displayValue = siValue / kgResult.effectivePrefixFactor
 *
 * This is the "field-value" formula shared by the simple-mode
 * calculator field (CalculatorFieldDisplay.tsx), the simple-mode
 * result-field getter (useCalculatorDisplayFormatters.calcResult
 * Display), and the clipboard field-copy handler (useCalculator
 * Clipboard.doCopyCalcField / doCopyRpnField). It handles kg's
 * baked-prefix case correctly but does NOT handle temperature
 * offsets, inverse units, or arbitrary composite symbols the way
 * siToDisplay does. Callers that need the full transform (currently
 * the RPN result display and the RPN origin-meta computation) call
 * siToDisplay directly and use only composeUnitDisplaySymbol from
 * this helper's stack.
 *
 * The divergence between this helper's formula and siToDisplay for
 * conceptually the same step is a §1.6 exception. See docs/tasks/
 * calc-display-formula-inconsistency.md for the resolution plan.
 */
export function formatCalcValueDisplay(
  siValue: number,
  baseSymbol: string,
  prefixId: string,
  precision: number,
  formatNumberWithSeparators: (num: number, precision: number) => string,
): CalcValueDisplay {
  const { unitSymbol, kgResult } = composeUnitDisplaySymbol(baseSymbol, prefixId);
  const displayValue = siValue / kgResult.effectivePrefixFactor;
  return {
    formattedValue: formatNumberWithSeparators(displayValue, precision),
    unitSymbol,
    displayValue,
  };
}
