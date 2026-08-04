import { Card } from '@/components/ui/card';
import { CALC_CONTENT_HEIGHT } from '@/components/unit-converter/constants';
import type { UseCalculatorControllerReturn } from '@/components/unit-converter/hooks/useCalculatorController';
import type { CalculatorFlash } from './CalculatorPane';
import { SimpleHeader } from './simple/SimpleHeader';
import { SimpleField1Row } from './simple/SimpleField1Row';
import { SimpleField2Row } from './simple/SimpleField2Row';
import { SimpleField3Row } from './simple/SimpleField3Row';
import { SimpleResultField } from './simple/SimpleResultField';

interface SimpleCalculatorPaneProps {
  controller: UseCalculatorControllerReturn;
  flash: CalculatorFlash;
}

// The Simple calculator pane: header + 3 field rows + result field.
// Each part lives in ./simple/ and receives the shared controller plus
// its slice of the flash bag. Pure layout composition.
//
// Design note on why the 3 field rows are separate files rather than
// one parameterized SimpleFieldRow: every data-testid must appear as a
// literal-string JSX attribute for the build verifier's manifest check
// to find it in the compiled artifact. Passing testids as props (or
// building them via template literals) compiles to variable-referring
// shapes that the verifier can't correlate to manifest entries. Each
// field row therefore inlines its own literal testids, at the cost of
// modest duplication between Field 2 and Field 3.
//
// numberFormat prop removed in audit step 4 — both this pane and its
// sibling RpnCalculatorPane declared it but never used it.
export function SimpleCalculatorPane({ controller, flash }: SimpleCalculatorPaneProps) {
  const { calculatorMode } = controller;

  return (
    <Card className="w-full p-6 bg-card border-border/50">
      {calculatorMode === 'simple' && <SimpleHeader controller={controller} />}

      {/* Fixed-height container to prevent flicker on mode switch */}
      <div style={{ height: CALC_CONTENT_HEIGHT, overflowY: 'auto' }}>
        {calculatorMode === 'simple' && (
          <div className="space-y-3">
            <SimpleField1Row controller={controller} isFlashing={flash.calcField1} />
            <SimpleField2Row controller={controller} isFlashing={flash.calcField2} />
            <SimpleField3Row controller={controller} isFlashing={flash.calcField3} />
            <SimpleResultField controller={controller} isFlashing={flash.copyCalc} />
          </div>
        )}
      </div>
    </Card>
  );
}
