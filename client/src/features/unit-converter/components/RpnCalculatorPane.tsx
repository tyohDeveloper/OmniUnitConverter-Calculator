import { Card } from '@/components/ui/card';
import { CALC_CONTENT_HEIGHT } from '@/components/unit-converter/constants';
import type { UseCalculatorControllerReturn } from '@/components/unit-converter/hooks/useCalculatorControllerReturn';
import { useRpnXEditField } from '@/components/unit-converter/hooks/useRpnXEditField';
import type { CalculatorFlash } from './CalculatorPane';
import { RpnHeader } from './rpn/RpnHeader';
import { RpnStackRowS3 } from './rpn/RpnStackRowS3';
import { RpnStackRowS2 } from './rpn/RpnStackRowS2';
import { RpnStackRowY } from './rpn/RpnStackRowY';
import { RpnXRegisterRow } from './rpn/RpnXRegisterRow';
import { RpnBottomRow } from './rpn/RpnBottomRow';

interface RpnCalculatorPaneProps {
  controller: UseCalculatorControllerReturn;
  flash: CalculatorFlash;
  lockRpnMode?: boolean;
}

// The RPN calculator pane, composed of a header + four stack rows +
// a bottom row of shared actions. Each row lives in ./rpn/ and receives
// the controller (plus its slice of the flash bag) so that the parent
// itself owns no state — it is purely a layout composition. Formatting
// comes from controller.formatNumberWithSeparators, so this pane no
// longer needs the numberFormat prop the pre-split version declared but
// never used.
export function RpnCalculatorPane({ controller, flash, lockRpnMode = false }: RpnCalculatorPaneProps) {
  const { calculatorMode } = controller;

  // The X edit-field hook lives here (not in RpnXRegisterRow) so that every
  // row's operation buttons can share handleRpnButtonMouseDown — the
  // mechanism that keeps the X input focused across button presses.
  const xEdit = useRpnXEditField(controller, lockRpnMode);
  const onOpButtonMouseDown = xEdit.handleRpnButtonMouseDown;

  return (
    <Card className="w-full p-6 bg-card border-border/50">
      {calculatorMode === 'rpn' && (
        <RpnHeader controller={controller} lockRpnMode={lockRpnMode} xEdit={xEdit} />
      )}

      {/* Fixed-height container to prevent flicker on mode switch */}
      <div style={{ height: CALC_CONTENT_HEIGHT, overflowY: 'auto' }}>
        {calculatorMode === 'rpn' && (
          <div className="space-y-2">
            <RpnStackRowS3 controller={controller} flashRpnField1={flash.rpnField1} onOpButtonMouseDown={onOpButtonMouseDown} />
            <RpnStackRowS2 controller={controller} flashRpnField2={flash.rpnField2} onOpButtonMouseDown={onOpButtonMouseDown} />
            <RpnStackRowY controller={controller} flashRpnField3={flash.rpnField3} onOpButtonMouseDown={onOpButtonMouseDown} />
            <RpnXRegisterRow
              controller={controller}
              flashRpnResult={flash.rpnResult}
              lockRpnMode={lockRpnMode}
              xEdit={xEdit}
            />
            <RpnBottomRow controller={controller} onOpButtonMouseDown={onOpButtonMouseDown} />
          </div>
        )}
      </div>
    </Card>
  );
}
