import React from 'react';
import { motion } from 'framer-motion';
import type { CalcValue } from '@/lib/units/calcValue';
import { formatDimensions } from '@/lib/unit-symbols/formatDimensions';
import { formatCalcValueDisplay } from '@/lib/calculator/formatCalcValueDisplay';
import { FIELD_HEIGHT } from '../constants';

// §1.6: the display formula is single-sourced in
// lib/calculator/formatCalcValueDisplay, which uses composeUnit
// DisplaySymbol under the hood. The previous version accepted
// formatDimensions and applyPrefixToKgUnit as props (prop-drilled
// from every caller); those are pure lib fns and belong to the
// view's own imports, not the caller's prop bag.

interface CalculatorFieldDisplayProps {
  value: CalcValue | null;
  onClick?: () => void;
  ariaLabel?: string;
  isFlashing?: boolean;
  isResult?: boolean;
  formatNumberWithSeparators: (value: number, precision: number) => string;
  precision: number;
  width?: string;
  className?: string;
  testId?: string;
  preserveSourceUnit?: boolean;
}

export function CalculatorFieldDisplay({
  value,
  onClick,
  ariaLabel,
  isFlashing = false,
  isResult = false,
  formatNumberWithSeparators,
  precision,
  width,
  className = '',
  testId,
  preserveSourceUnit = false,
}: CalculatorFieldDisplayProps) {
  const baseClass = isResult 
    ? 'px-3 bg-muted/20 border border-accent/50 rounded-md flex items-center justify-between select-none'
    : 'px-3 bg-muted/30 border border-border/50 rounded-md flex items-center justify-between select-none';
  
  const interactiveClass = value 
    ? (isResult
        ? 'cursor-pointer hover:bg-accent/15 active:bg-accent/25 hover:border-accent/70 hover:shadow-sm transition-all duration-150'
        : 'cursor-pointer hover:bg-accent/10 active:bg-accent/20 hover:border-l-accent hover:border-l-2 hover:shadow-sm transition-all duration-150')
    : '';

  const useSourceDisplay = preserveSourceUnit && value?.originalUnit != null && value?.originalValue != null;

  const displayData = value
    ? useSourceDisplay
      ? {
          formattedValue: formatNumberWithSeparators(value.originalValue!, precision),
          unitSymbol: value.originalUnit!,
        }
      : formatCalcValueDisplay(value.value, formatDimensions(value.dimensions), value.prefix, precision, formatNumberWithSeparators)
    : null;

  const content = (
    <>
      <span className={`text-sm font-mono truncate ${isResult ? 'text-primary font-bold' : 'text-foreground'}`}>
        {displayData?.formattedValue || ''}
      </span>
      <span className="text-xs font-mono text-muted-foreground ml-2 shrink-0">
        {displayData?.unitSymbol || ''}
      </span>
    </>
  );

  const motionProps = {
    className: `${baseClass} ${interactiveClass} ${className}`,
    style: { height: FIELD_HEIGHT, width, pointerEvents: 'auto' as const },
    animate: {
      opacity: isFlashing ? [1, 0.3, 1] : 1,
      scale: isFlashing ? [1, 1.02, 1] : 1,
    },
    transition: { duration: 0.3 },
    'data-testid': testId,
  };

  if (value && onClick) {
    return (
      <motion.button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        {...motionProps}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.div {...motionProps}>
      {content}
    </motion.div>
  );
}
