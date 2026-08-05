import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDimensions } from '@/lib/unit-symbols/formatDimensions';
import { CalculatorFieldDisplay } from '@/components/unit-converter/components/CalculatorFieldDisplay';
import { CommonFieldWidth, RpnBtnWidth } from '@/components/unit-converter/constants';
import type {
  UseCalculatorControllerReturn, RpnBinaryOp,
} from '@/components/unit-converter/hooks/useCalculatorControllerReturn';

interface RpnStackRowYProps {
  controller: UseCalculatorControllerReturn;
  flashRpnField3: boolean;
}

/**
 * y row (bottom of stack display, just above the x-register): the
 * stack[2] register plus ENTER/DROP, UNDO/PULL, the four unit-aware
 * binary operators (× ÷ + −, or their unit-preserving variants with
 * SHIFT), and LASTx/SWAP.
 */
export function RpnStackRowY({ controller, flashRpnField3 }: RpnStackRowYProps) {
  const {
    shiftActive, setShiftActive,
    calculatorPrecision,
    rpnStack, previousRpnStack,
    preserveSourceUnit,
    copyRpnField,
    applyRpnBinary, canApplyRpnBinary,
    pushToRpnStack, dropRpnStack, undoRpnStack, pullFromPane,
    swapRpnXY, recallLastX,
    applyPrefixToKgUnit,
    formatNumberWithSeparators, t,
  } = controller;

  const yBinaryButtons: Array<{ id: string; label: string; shiftLabel: string; op: RpnBinaryOp; shiftOp: RpnBinaryOp }> = [
    { id: 'mul', label: '×ᵤ', shiftLabel: '×', op: 'mulUnit', shiftOp: 'mul' },
    { id: 'div', label: '÷ᵤ', shiftLabel: '÷', op: 'divUnit', shiftOp: 'div' },
    { id: 'add', label: '+ᵤ', shiftLabel: '+', op: 'addUnit', shiftOp: 'add' },
    { id: 'sub', label: '−ᵤ', shiftLabel: '−', op: 'subUnit', shiftOp: 'sub' },
  ];

  return (
    <div
      className="grid gap-2 items-center"
      style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
    >
      <CalculatorFieldDisplay
        value={rpnStack[2]}
        onClick={() => copyRpnField(2)}
        isFlashing={flashRpnField3}
        formatDimensions={formatDimensions}
        applyPrefixToKgUnit={applyPrefixToKgUnit}
        formatNumberWithSeparators={formatNumberWithSeparators}
        precision={calculatorPrecision}
        testId="rpn-field-y"
        preserveSourceUnit={preserveSourceUnit}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            data-testid={shiftActive ? 'button-rpn-drop' : 'button-rpn-enter'}
            className={`text-xs font-mono w-full border !border-border/30 ${shiftActive && !rpnStack[3] ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent'}`}
            style={{ gridColumn: 'span 2' }}
            disabled={shiftActive && !rpnStack[3]}
            onClick={() => { shiftActive ? dropRpnStack() : pushToRpnStack(); setShiftActive(false); }}
          >
            {shiftActive ? 'DROP' : 'ENTER'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{shiftActive ? t('rpn-tooltip-drop') : t('rpn-tooltip-enter')}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            data-testid={shiftActive ? 'button-rpn-pull' : 'button-rpn-undo'}
            className={`text-xs font-mono w-full border !border-border/30 ${shiftActive ? 'text-foreground hover:text-accent' : (!previousRpnStack.some(v => v !== null) ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent')}`}
            disabled={!shiftActive && !previousRpnStack.some(v => v !== null)}
            onClick={() => { shiftActive ? pullFromPane() : undoRpnStack(); setShiftActive(false); }}
          >
            {shiftActive ? 'PULL' : 'UNDO'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{shiftActive ? t('rpn-tooltip-pull') : t('rpn-tooltip-undo')}</TooltipContent>
      </Tooltip>
      {yBinaryButtons.map((btn, i) => {
        const currentOp = shiftActive ? btn.shiftOp : btn.op;
        const isDisabled = !canApplyRpnBinary(currentOp);
        return (
          <Button
            key={`y-bin-${i}`}
            variant="ghost"
            size="sm"
            data-testid={`button-rpn-${btn.id}`}
            className={`text-xs font-mono w-full border !border-border/30 ${isDisabled ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent'}`}
            onClick={() => { applyRpnBinary(currentOp); setShiftActive(false); }}
            disabled={isDisabled}
          >
            {shiftActive ? btn.shiftLabel : btn.label}
          </Button>
        );
      })}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            data-testid={shiftActive ? 'button-rpn-swap' : 'button-rpn-lastx'}
            className="text-xs font-mono w-full border !border-border/30 text-foreground hover:text-accent"
            onClick={() => { shiftActive ? swapRpnXY() : recallLastX(); setShiftActive(false); }}
          >
            {shiftActive ? 'SWAP' : 'LASTx'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{shiftActive ? t('rpn-tooltip-swap') : t('rpn-tooltip-lastx')}</TooltipContent>
      </Tooltip>
    </div>
  );
}
