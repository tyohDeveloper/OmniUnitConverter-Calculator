import { useCallback } from 'react';
import type { CalcValue } from '@/lib/units/calcValue';
import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import type { SIRepresentation } from '@/lib/si-representations/siRepresentation';
import { PREFIXES } from '@/lib/units/prefixes';
import { formatDimensions } from '@/lib/unit-symbols/formatDimensions';
import { siToDisplay as siToDisplayLib } from '@/lib/unit-symbols/siToDisplay';
import { applyPrefixToKgUnit as applyPrefixToKgUnitLib } from '@/lib/units/applyPrefixToKgUnit';

interface UseCalculatorDisplayFormattersArgs {
  calcValues: Array<CalcValue | null>;
  rpnStack: Array<CalcValue | null>;
  selectedAlternative: number;
  rpnSelectedAlternative: number;
  resultPrefix: string;
  rpnResultPrefix: string;
  calculatorPrecision: number;
  generateSIRepresentations: (dimensions: DimensionalFormula, sourceCategory?: string) => SIRepresentation[];
  formatNumberWithSeparators: (num: number, precision: number) => string;
}

interface DisplayFormat { formattedValue: string; unitSymbol: string; }

function formatDisplay(
  val: CalcValue,
  symbol: string,
  displayValue: number,
  prefix: string,
  calculatorPrecision: number,
  formatNumberWithSeparators: (n: number, p: number) => string,
): DisplayFormat {
  const kgResult = applyPrefixToKgUnitLib(symbol, prefix);
  const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
  const prefixData = PREFIXES.find(p => p.id === prefix);
  const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
  return { formattedValue, unitSymbol: prefixSymbol + kgResult.displaySymbol };
}

function rpnResultDisplay(
  val: CalcValue,
  siReps: SIRepresentation[],
  rpnSelectedAlternative: number,
  rpnResultPrefix: string,
  calculatorPrecision: number,
  formatNumberWithSeparators: (n: number, p: number) => string,
): DisplayFormat {
  const currentSymbol = siReps[rpnSelectedAlternative]?.displaySymbol || formatDimensions(val.dimensions);
  if (currentSymbol === '1' || !currentSymbol) return { formattedValue: formatNumberWithSeparators(val.value, calculatorPrecision), unitSymbol: '' };
  const displayValue = siToDisplayLib(val.value, currentSymbol, rpnResultPrefix);
  return formatDisplay(val, currentSymbol, displayValue, rpnResultPrefix, calculatorPrecision, formatNumberWithSeparators);
}

function calcResultDisplay(
  val: CalcValue,
  siReps: SIRepresentation[],
  selectedAlternative: number,
  resultPrefix: string,
  calculatorPrecision: number,
  formatNumberWithSeparators: (n: number, p: number) => string,
): DisplayFormat {
  const currentSymbol = siReps[selectedAlternative]?.displaySymbol || formatDimensions(val.dimensions);
  const kgResult = applyPrefixToKgUnitLib(currentSymbol, resultPrefix);
  const displayValue = val.value / kgResult.effectivePrefixFactor;
  return formatDisplay(val, currentSymbol, displayValue, resultPrefix, calculatorPrecision, formatNumberWithSeparators);
}

/**
 * Formats the currently-selected SI alternative for the top of the
 * RPN stack and the calculator result field. Both getters return
 * null when there's no value; the RPN getter's empty-symbol case
 * (dimensionless intermediate results) preserves the numeric-only
 * display path via a short-circuit in the helper.
 */
export function useCalculatorDisplayFormatters(args: UseCalculatorDisplayFormattersArgs) {
  const { calcValues, rpnStack, selectedAlternative, rpnSelectedAlternative,
          resultPrefix, rpnResultPrefix, calculatorPrecision,
          generateSIRepresentations, formatNumberWithSeparators } = args;

  const getRpnResultDisplay = useCallback(() => {
    if (!rpnStack[3]) return null;
    const val = rpnStack[3];
    const siReps = generateSIRepresentations(val.dimensions, val.sourceCategory);
    return rpnResultDisplay(val, siReps, rpnSelectedAlternative, rpnResultPrefix, calculatorPrecision, formatNumberWithSeparators);
  }, [rpnStack, rpnSelectedAlternative, rpnResultPrefix, calculatorPrecision, generateSIRepresentations, formatNumberWithSeparators]);

  const getCalcResultDisplay = useCallback(() => {
    if (!calcValues[3]) return null;
    const val = calcValues[3];
    const siReps = generateSIRepresentations(val.dimensions, val.sourceCategory);
    return calcResultDisplay(val, siReps, selectedAlternative, resultPrefix, calculatorPrecision, formatNumberWithSeparators);
  }, [calcValues, selectedAlternative, resultPrefix, calculatorPrecision, generateSIRepresentations, formatNumberWithSeparators]);

  return { getRpnResultDisplay, getCalcResultDisplay };
}
