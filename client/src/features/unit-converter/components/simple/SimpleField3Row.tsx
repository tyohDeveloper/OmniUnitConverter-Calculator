import { Button } from '@/components/ui/button';
import { formatDimensions } from '@/lib/unit-symbols/formatDimensions';
import { canAddSubtract } from '@/lib/calculator/canAddSubtract';
import { CalculatorFieldDisplay } from '@/components/unit-converter/components/CalculatorFieldDisplay';
import type { UseCalculatorControllerReturn } from '@/components/unit-converter/hooks/useCalculatorControllerReturn';
import { SimpleFieldRow } from './SimpleFieldRow';

interface SimpleField3RowProps {
  controller: UseCalculatorControllerReturn;
  isFlashing: boolean;
}

const opBtnClass = (highlighted: boolean) =>
  `text-sm w-full border !border-border/30 ${highlighted ? 'text-accent font-bold' : ''}`;

/**
 * Field 3 row: display cell + 4 op2 operator buttons (multiply,
 * divide, add, subtract) + clear button. Operator buttons control
 * calcOp2 and enable/disable based on the two operands (calcValues[1]
 * and calcValues[2]).
 *
 * All 5 testids (calc-field-3, button-op2-*, button-clear-field-3)
 * are inlined here as literal attributes for the build verifier.
 * Duplicative with SimpleField2Row by design: keeping each row's
 * testids literal is worth the modest repetition.
 */
export function SimpleField3Row({ controller, isFlashing }: SimpleField3RowProps) {
  const {
    calcValues, calculatorPrecision, preserveSourceUnit,
    copyCalcField, applyPrefixToKgUnit,
    formatNumberWithSeparators, t,
    calcOp2, setCalcOp2, clearField3,
  } = controller;

  const bothPresent = !!calcValues[1] && !!calcValues[2];
  const addSubEnabled = canAddSubtract(calcValues[1], calcValues[2]);

  return (
    <SimpleFieldRow
      display={
        <CalculatorFieldDisplay
          value={calcValues[2]}
          onClick={() => copyCalcField(2)}
          isFlashing={isFlashing}
          formatDimensions={formatDimensions}
          applyPrefixToKgUnit={applyPrefixToKgUnit}
          formatNumberWithSeparators={formatNumberWithSeparators}
          precision={calculatorPrecision}
          testId="calc-field-3"
          preserveSourceUnit={preserveSourceUnit}
        />
      }
      op1={
        <Button variant="ghost" size="sm" onClick={() => setCalcOp2('*')} disabled={!bothPresent}
                data-testid="button-op2-multiply" className={opBtnClass(calcOp2 === '*')}>×</Button>
      }
      op2={
        <Button variant="ghost" size="sm" onClick={() => setCalcOp2('/')} disabled={!bothPresent}
                data-testid="button-op2-divide" className={opBtnClass(calcOp2 === '/')}>/</Button>
      }
      op3={
        <Button variant="ghost" size="sm" onClick={() => setCalcOp2('+')} disabled={!addSubEnabled}
                data-testid="button-op2-add" className={opBtnClass(calcOp2 === '+')}>+</Button>
      }
      op4={
        <Button variant="ghost" size="sm" onClick={() => setCalcOp2('-')} disabled={!addSubEnabled}
                data-testid="button-op2-subtract" className={opBtnClass(calcOp2 === '-')}>−</Button>
      }
      clear={
        <Button
          variant="ghost"
          size="sm"
          onClick={clearField3}
          disabled={!calcValues[2]}
          data-testid="button-clear-field-3"
          className="text-xs justify-self-start border !border-border/30"
        >
          {t('Clear')}
        </Button>
      }
    />
  );
}
