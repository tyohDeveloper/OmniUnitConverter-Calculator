import React from 'react';
import type { NumberFormat } from '@/lib/units/numberFormat';
import type { UseCalculatorControllerReturn } from '@/components/unit-converter/hooks/useCalculatorController';
import { SimpleCalculatorPane } from './SimpleCalculatorPane';
import { RpnCalculatorPane } from './RpnCalculatorPane';

export interface CalculatorFlash {
  calcField1: boolean;
  calcField2: boolean;
  calcField3: boolean;
  copyCalc: boolean;
  rpnField1: boolean;
  rpnField2: boolean;
  rpnField3: boolean;
  rpnResult: boolean;
}

interface CalculatorPaneProps {
  controller: UseCalculatorControllerReturn;
  numberFormat: NumberFormat;
  flash: CalculatorFlash;
  lockRpnMode?: boolean;
}

// Council-09: CalculatorPane is now a mode dispatcher. Simple and RPN
// live in their own files under 250 lines each (SimpleCalculatorPane and
// RpnCalculatorPane). Behaviour is unchanged.
export function CalculatorPane({ controller, numberFormat, flash, lockRpnMode = false }: CalculatorPaneProps) {
  if (controller.calculatorMode === 'rpn') {
    return <RpnCalculatorPane controller={controller} flash={flash} lockRpnMode={lockRpnMode} />;
  }
  return <SimpleCalculatorPane controller={controller} numberFormat={numberFormat} flash={flash} />;
}
