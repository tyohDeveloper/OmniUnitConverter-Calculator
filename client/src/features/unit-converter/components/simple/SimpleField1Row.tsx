import { Button } from '@/components/ui/button';
import { formatDimensions } from '@/lib/unit-symbols/formatDimensions';
import { CalculatorFieldDisplay } from '@/components/unit-converter/components/CalculatorFieldDisplay';
import type { UseCalculatorControllerReturn } from '@/components/unit-converter/hooks/useCalculatorControllerReturn';
import { SimpleFieldRow } from './SimpleFieldRow';

interface SimpleField1RowProps {
  controller: UseCalculatorControllerReturn;
  isFlashing: boolean;
}

/**
 * Field 1 row: display cell + 4 invisible operator-column spacers +
 * clear button. Field 1 has no operators above it, so the op slots
 * are decorative-hidden divs that hold the column layout stable.
 *
 * Testid `button-clear-field-1` is inlined here (not passed as a prop)
 * so the build verifier finds the literal attribute in the compiled
 * artifact; see SimpleFieldRow's file-header doc for the reason.
 */
export function SimpleField1Row({ controller, isFlashing }: SimpleField1RowProps) {
  const {
    calcValues, calculatorPrecision, preserveSourceUnit,
    copyCalcField, applyPrefixToKgUnit,
    formatNumberWithSeparators, t,
    clearField1,
  } = controller;

  return (
    <SimpleFieldRow
      display={
        <CalculatorFieldDisplay
          value={calcValues[0]}
          onClick={() => copyCalcField(0)}
          isFlashing={isFlashing}
          formatDimensions={formatDimensions}
          applyPrefixToKgUnit={applyPrefixToKgUnit}
          formatNumberWithSeparators={formatNumberWithSeparators}
          precision={calculatorPrecision}
          testId="calc-field-1"
          preserveSourceUnit={preserveSourceUnit}
        />
      }
      op1={<div style={{ visibility: 'hidden' }} />}
      op2={<div style={{ visibility: 'hidden' }} />}
      op3={<div style={{ visibility: 'hidden' }} />}
      op4={<div style={{ visibility: 'hidden' }} />}
      clear={
        <Button
          variant="ghost"
          size="sm"
          onClick={clearField1}
          disabled={!calcValues[0]}
          data-testid="button-clear-field-1"
          className="text-xs justify-self-start border !border-border/30"
        >
          {t('Clear')}
        </Button>
      }
    />
  );
}
