import { Button } from '@/components/ui/button';
import { formatDimensions } from '@/lib/unit-symbols/formatDimensions';
import { CalculatorFieldDisplay } from '@/components/unit-converter/components/CalculatorFieldDisplay';
import { CommonFieldWidth, RpnBtnWidth } from '@/components/unit-converter/constants';
import type {
  UseCalculatorControllerReturn, RpnUnaryOp,
} from '@/components/unit-converter/hooks/useCalculatorController';

interface RpnStackRowS2Props {
  controller: UseCalculatorControllerReturn;
  flashRpnField2: boolean;
}

/**
 * s2 row (second from top): the stack[1] register plus its 8-button
 * grid. Trigonometric and hyperbolic primitives (sin/asin, cos/acos,
 * tan/atan, sinh/asinh, cosh/acosh, tanh/atanh), floor/ceil, and one
 * constant (e / e⁻¹).
 */
export function RpnStackRowS2({ controller, flashRpnField2 }: RpnStackRowS2Props) {
  const {
    shiftActive, setShiftActive,
    calculatorPrecision,
    rpnStack,
    preserveSourceUnit,
    copyRpnField,
    applyRpnUnary,
    pushRpnConstant,
    applyPrefixToKgUnit,
    formatNumberWithSeparators,
  } = controller;

  type S2Button =
    | { id: string; shiftId?: string; label: string; shiftLabel: string; op: RpnUnaryOp; shiftOp: RpnUnaryOp }
    | { id: string; shiftId?: string; label: string; shiftLabel: string; isConstant: true; value: number; shiftValue: number };

  const s2Buttons: S2Button[] = [
    { id: 'sin', shiftId: 'asin', label: 'sin', shiftLabel: 'asin', op: 'sin', shiftOp: 'asin' },
    { id: 'cos', shiftId: 'acos', label: 'cos', shiftLabel: 'acos', op: 'cos', shiftOp: 'acos' },
    { id: 'tan', shiftId: 'atan', label: 'tan', shiftLabel: 'atan', op: 'tan', shiftOp: 'atan' },
    { id: 'sinh', shiftId: 'asinh', label: 'sinh', shiftLabel: 'asinh', op: 'sinh', shiftOp: 'asinh' },
    { id: 'cosh', shiftId: 'acosh', label: 'cosh', shiftLabel: 'acosh', op: 'cosh', shiftOp: 'acosh' },
    { id: 'tanh', shiftId: 'atanh', label: 'tanh', shiftLabel: 'atanh', op: 'tanh', shiftOp: 'atanh' },
    { id: 'floor', shiftId: 'ceil', label: '⌊x⌋', shiftLabel: '⌈x⌉', op: 'floor', shiftOp: 'ceil' },
    { id: 'e', label: 'ℯ', shiftLabel: 'ℯ⁻¹', isConstant: true, value: Math.E, shiftValue: 1 / Math.E },
  ];

  return (
    <div
      className="grid gap-2 items-center"
      style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
    >
      <CalculatorFieldDisplay
        value={rpnStack[1]}
        onClick={() => copyRpnField(1)}
        isFlashing={flashRpnField2}
        formatDimensions={formatDimensions}
        applyPrefixToKgUnit={applyPrefixToKgUnit}
        formatNumberWithSeparators={formatNumberWithSeparators}
        precision={calculatorPrecision}
        testId="rpn-field-s2"
        preserveSourceUnit={preserveSourceUnit}
      />
      {s2Buttons.map((btn, i) => {
        const hasOp = 'op' in btn;
        const isConstant = 'isConstant' in btn;
        const currentOp = hasOp ? (shiftActive ? btn.shiftOp : btn.op) : undefined;
        const isDisabled = hasOp && !rpnStack[3];
        const activeId = shiftActive && btn.shiftId ? btn.shiftId : btn.id;
        return (
          <Button
            key={`s2-btn-${i}`}
            variant="ghost"
            size="sm"
            data-testid={`button-rpn-${activeId}`}
            className={`text-xs font-mono w-full border !border-border/30 ${isDisabled ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent'}`}
            onClick={() => {
              if (isConstant && 'value' in btn) {
                if (shiftActive && 'shiftValue' in btn) {
                  pushRpnConstant(btn.shiftValue);
                } else {
                  pushRpnConstant(btn.value);
                }
              } else if (currentOp) {
                applyRpnUnary(currentOp);
              }
              setShiftActive(false);
            }}
            disabled={isDisabled}
          >
            {shiftActive ? btn.shiftLabel : btn.label}
          </Button>
        );
      })}
    </div>
  );
}
