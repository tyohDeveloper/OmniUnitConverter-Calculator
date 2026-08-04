import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { FIELD_HEIGHT, CommonFieldWidth } from '@/components/unit-converter/constants';
import type { UseCalculatorControllerReturn } from '@/components/unit-converter/hooks/useCalculatorController';
import { SimpleResultSelectors } from './SimpleResultSelectors';

interface SimpleResultFieldProps {
  controller: UseCalculatorControllerReturn;
  isFlashing: boolean;
}

/**
 * The Simple calculator's result field (Field 4): a motion.button that
 * shows the current result value + unit and copies it on click, plus
 * the prefix/alt-representation selectors (in ./SimpleResultSelectors),
 * plus a small Copy button on its own row below.
 *
 * The result value is null-tolerant: when no result is computed yet,
 * the button is disabled and the selectors render disabled placeholders.
 * The result display always shows the original unit when the CalcValue
 * carries one (preserveSourceUnit toggles apply only to the mid-stack
 * fields, not this result row).
 */
export function SimpleResultField({ controller, isFlashing }: SimpleResultFieldProps) {
  const {
    calcValues, calculatorPrecision,
    copyCalcResult, getCalcResultDisplay,
    formatNumberWithSeparators, t,
  } = controller;

  const cv = calcValues[3];
  // Note: the pre-split version showed original unit whenever the CalcValue
  // carried one, independent of the preserveSourceUnit toggle. That toggle
  // only affects the middle stack fields (rows 1-3), not the result display.
  // Behavior preserved here.
  const useSource = cv?.originalUnit != null && cv?.originalValue != null;
  const display = useSource
    ? { formattedValue: formatNumberWithSeparators(cv!.originalValue!, calculatorPrecision), unitSymbol: cv!.originalUnit! }
    : getCalcResultDisplay();

  return (
    <>
      <div className="flex gap-2 items-center" style={{ width: '100%' }}>
        <motion.button
          type="button"
          aria-label={t('Copy result')}
          disabled={!cv}
          className={`px-3 bg-muted/20 border border-accent/50 rounded-md flex items-center justify-between select-none shrink-0 text-left ${cv ? 'cursor-pointer hover:bg-accent/15 active:bg-accent/25 hover:border-accent/70 hover:shadow-sm transition-all duration-150' : ''}`}
          style={{ height: FIELD_HEIGHT, width: CommonFieldWidth, pointerEvents: 'auto' }}
          onClick={() => cv && copyCalcResult()}
          data-testid="calc-result"
          animate={{
            opacity: isFlashing ? [1, 0.3, 1] : 1,
            scale: isFlashing ? [1, 1.02, 1] : 1
          }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-sm font-mono text-primary font-bold truncate">
            {display?.formattedValue || ''}
          </span>
          <span className="text-xs font-mono text-muted-foreground ms-2 shrink-0">
            {display?.unitSymbol || ''}
          </span>
        </motion.button>
        <SimpleResultSelectors controller={controller} />
      </div>

      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          data-testid="button-copy-calc-result"
          onClick={copyCalcResult}
          disabled={!cv}
          className="text-xs text-muted-foreground hover:text-foreground gap-2 shrink-0 border !border-border/30"
        >
          <Copy className="w-3 h-3" />
          <motion.span
            animate={{
              opacity: isFlashing ? [1, 0.3, 1] : 1,
              scale: isFlashing ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 0.3 }}
          >
            {t('Copy')}
          </motion.span>
        </Button>
      </div>
    </>
  );
}
