import { useCallback } from 'react';
import type { CalcValue } from '@/lib/units/calcValue';
import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import type { SIRepresentation } from '@/lib/si-representations/siRepresentation';
import { formatDimensions } from '@/lib/unit-symbols/formatDimensions';
import { formatCalcValueDisplay } from '@/lib/calculator/formatCalcValueDisplay';

// §1.6: both simple-mode and RPN result displays route through
// formatCalcValueDisplay, which uses siToDisplay under the hood
// (offset-/inverse-/prefixPower-aware).
// The RPN path has one extra branch: dimensionless intermediate
// results (symbol '1' or empty) short-circuit to the raw siValue
// with no unit label, so the display doesn't show a stray '1'.

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
  const { formattedValue, unitSymbol } = formatCalcValueDisplay(
    val.value, currentSymbol, rpnResultPrefix, calculatorPrecision, formatNumberWithSeparators,
  );
  return { formattedValue, unitSymbol };
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
  const { formattedValue, unitSymbol } = formatCalcValueDisplay(
    val.value, currentSymbol, resultPrefix, calculatorPrecision, formatNumberWithSeparators,
  );
  return { formattedValue, unitSymbol };
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
