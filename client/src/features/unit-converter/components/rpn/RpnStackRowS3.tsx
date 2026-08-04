import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDimensions } from '@/lib/unit-symbols/formatDimensions';
import { CalculatorFieldDisplay } from '@/components/unit-converter/components/CalculatorFieldDisplay';
import { CommonFieldWidth, RpnBtnWidth } from '@/components/unit-converter/constants';
import type {
  UseCalculatorControllerReturn, RpnUnaryOp, RpnBinaryOp,
} from '@/components/unit-converter/hooks/useCalculatorController';

interface RpnStackRowS3Props {
  controller: UseCalculatorControllerReturn;
  flashRpnField1: boolean;
}

/**
 * s3 row (top of the RPN stack display): the stack[0] register plus its
 * 8-button grid. Buttons alternate label/action based on the SHIFT
 * state. Includes math primitives (x², 1/x, +/−, eˣ, 10ˣ, 2ˣ, rnd) and
 * one constant (π / π⁻¹).
 */
export function RpnStackRowS3({ controller, flashRpnField1 }: RpnStackRowS3Props) {
  const {
    shiftActive, setShiftActive,
    calculatorPrecision,
    rpnStack,
    preserveSourceUnit,
    copyRpnField,
    applyRpnUnary, applyRpnBinary, canApplyRpnBinary,
    pushRpnConstant,
    applyPrefixToKgUnit,
    formatNumberWithSeparators, t,
  } = controller;

  type S3Button =
    | { id: string; shiftId?: string; label: string; shiftLabel: string; op?: RpnUnaryOp; shiftOp?: RpnUnaryOp; binaryOp?: RpnBinaryOp; tooltip?: string; shiftTooltip?: string }
    | { id: string; shiftId?: string; label: string; shiftLabel: string; isConstant: true; value: number; shiftValue: number; tooltip?: string; shiftTooltip?: string };

  const s3Buttons: S3Button[] = [
    { id: 'square', shiftId: 'sqrt', label: 'x²ᵤ', shiftLabel: '√ᵤ', op: 'square', shiftOp: 'sqrt' },
    { id: 'inv', shiftId: 'pow', label: '1/x', shiftLabel: 'yˣ', op: 'recip', binaryOp: 'pow' },
    { id: 'neg', shiftId: 'abs', label: '+/−', shiftLabel: 'ABS', op: 'neg', shiftOp: 'abs', tooltip: t('rpn-tooltip-negate'), shiftTooltip: t('rpn-tooltip-abs') },
    { id: 'exp', shiftId: 'ln', label: 'eˣ', shiftLabel: 'ln', op: 'exp', shiftOp: 'ln' },
    { id: 'pow10', shiftId: 'log', label: '10ˣ', shiftLabel: 'log₁₀', op: 'pow10', shiftOp: 'log10' },
    { id: 'pow2', shiftId: 'log2', label: '2ˣ', shiftLabel: 'log₂', op: 'pow2', shiftOp: 'log2' },
    { id: 'rnd', shiftId: 'trunc', label: 'rnd', shiftLabel: 'trunc', op: 'rnd', shiftOp: 'trunc', tooltip: t('rpn-tooltip-rnd'), shiftTooltip: t('rpn-tooltip-trunc') },
    { id: 'pi', label: 'π', shiftLabel: 'π⁻¹', isConstant: true, value: Math.PI, shiftValue: 1 / Math.PI },
  ];

  return (
    <div
      className="grid gap-2 items-center"
      style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
    >
      <CalculatorFieldDisplay
        value={rpnStack[0]}
        onClick={() => copyRpnField(0)}
        isFlashing={flashRpnField1}
        formatDimensions={formatDimensions}
        applyPrefixToKgUnit={applyPrefixToKgUnit}
        formatNumberWithSeparators={formatNumberWithSeparators}
        precision={calculatorPrecision}
        testId="rpn-field-s3"
        preserveSourceUnit={preserveSourceUnit}
      />
      {s3Buttons.map((btn, i) => {
        const hasOp = 'op' in btn;
        const hasBinaryOp = 'binaryOp' in btn;
        const isConstant = 'isConstant' in btn;
        const currentOp = hasOp ? (shiftActive && btn.shiftOp ? btn.shiftOp : btn.op) : undefined;
        const currentBinaryOp = hasBinaryOp && shiftActive ? btn.binaryOp : undefined;
        const isDisabled = currentBinaryOp
          ? !canApplyRpnBinary(currentBinaryOp)
          : (hasOp && !rpnStack[3]);
        const tooltipText = shiftActive ? btn.shiftTooltip : btn.tooltip;
        const activeId = shiftActive && btn.shiftId ? btn.shiftId : btn.id;
        const buttonEl = (
          <Button
            key={`s3-btn-${i}`}
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
              } else if (currentBinaryOp) {
                applyRpnBinary(currentBinaryOp);
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
        if (tooltipText) {
          return (
            <Tooltip key={`s3-btn-${i}`}>
              <TooltipTrigger asChild>{React.cloneElement(buttonEl, { key: undefined })}</TooltipTrigger>
              <TooltipContent>{tooltipText}</TooltipContent>
            </Tooltip>
          );
        }
        return buttonEl;
      })}
    </div>
  );
}
