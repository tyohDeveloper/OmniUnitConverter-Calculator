import type { UseCalculatorControllerReturn } from '@/components/unit-converter/hooks/useCalculatorControllerReturn';
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
  flash: CalculatorFlash;
  lockRpnMode?: boolean;
}

// Council-09: CalculatorPane is now a mode dispatcher. Simple and RPN
// live in their own files under 250 lines each (SimpleCalculatorPane
// and RpnCalculatorPane). Behaviour is unchanged.
//
// numberFormat was declared here and forwarded to both children in the
// pre-audit version, but neither child ever used it (both consulted
// controller.formatNumberWithSeparators instead). Removed in audit
// step 4 along with the dead prop on SimpleCalculatorPane.
export function CalculatorPane({ controller, flash, lockRpnMode = false }: CalculatorPaneProps) {
  if (controller.calculatorMode === 'rpn') {
    return <RpnCalculatorPane controller={controller} flash={flash} lockRpnMode={lockRpnMode} />;
  }
  return <SimpleCalculatorPane controller={controller} flash={flash} />;
}
