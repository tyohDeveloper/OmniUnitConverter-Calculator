import { Button } from '@/components/ui/button';
import { formatDimensions } from '@/lib/unit-symbols/formatDimensions';
import { canAddSubtract } from '@/lib/calculator/canAddSubtract';
import { CalculatorFieldDisplay } from '@/components/unit-converter/components/CalculatorFieldDisplay';
import type { UseCalculatorControllerReturn } from '@/components/unit-converter/hooks/useCalculatorControllerReturn';
import { SimpleFieldRow } from './SimpleFieldRow';

interface SimpleField2RowProps {
  controller: UseCalculatorControllerReturn;
  isFlashing: boolean;
}

const opBtnClass = (highlighted: boolean) =>
  `text-sm w-full border !border-border/30 ${highlighted ? 'text-accent font-bold' : ''}`;

/**
 * Field 2 row: display cell + 4 op1 operator buttons (multiply,
 * divide, add, subtract) + clear button. Operator buttons control
 * calcOp1 and enable/disable based on the two operands (calcValues[0]
 * and calcValues[1]).
 *
 * All 5 testids (calc-field-2, button-op1-*, button-clear-field-2)
 * are inlined here as literal attributes for the build verifier.
 */
export function SimpleField2Row({ controller, isFlashing }: SimpleField2RowProps) {
  const {
    calcValues, calculatorPrecision, preserveSourceUnit,
    copyCalcField, applyPrefixToKgUnit,
    formatNumberWithSeparators, t,
    calcOp1, setCalcOp1, clearField2,
  } = controller;

  const bothPresent = !!calcValues[0] && !!calcValues[1];
  const addSubEnabled = canAddSubtract(calcValues[0], calcValues[1]);

  return (
    <SimpleFieldRow
      display={
        <CalculatorFieldDisplay
          value={calcValues[1]}
          onClick={() => copyCalcField(1)}
          isFlashing={isFlashing}
          formatDimensions={formatDimensions}
          applyPrefixToKgUnit={applyPrefixToKgUnit}
          formatNumberWithSeparators={formatNumberWithSeparators}
          precision={calculatorPrecision}
          testId="calc-field-2"
          preserveSourceUnit={preserveSourceUnit}
        />
      }
      op1={
        <Button variant="ghost" size="sm" onClick={() => setCalcOp1('*')} disabled={!bothPresent}
                data-testid="button-op1-multiply" className={opBtnClass(calcOp1 === '*')}>×</Button>
      }
      op2={
        <Button variant="ghost" size="sm" onClick={() => setCalcOp1('/')} disabled={!bothPresent}
                data-testid="button-op1-divide" className={opBtnClass(calcOp1 === '/')}>/</Button>
      }
      op3={
        <Button variant="ghost" size="sm" onClick={() => setCalcOp1('+')} disabled={!addSubEnabled}
                data-testid="button-op1-add" className={opBtnClass(calcOp1 === '+')}>+</Button>
      }
      op4={
        <Button variant="ghost" size="sm" onClick={() => setCalcOp1('-')} disabled={!addSubEnabled}
                data-testid="button-op1-subtract" className={opBtnClass(calcOp1 === '-')}>−</Button>
      }
      clear={
        <Button
          variant="ghost"
          size="sm"
          onClick={clearField2}
          disabled={!calcValues[1]}
          data-testid="button-clear-field-2"
          className="text-xs justify-self-start border !border-border/30"
        >
          {t('Clear')}
        </Button>
      }
    />
  );
}
