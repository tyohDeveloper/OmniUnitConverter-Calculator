import type { ReactNode } from 'react';
import {
  CommonFieldWidth, OperatorBtnWidth, ClearBtnWidth,
} from '@/components/unit-converter/constants';

interface SimpleFieldRowProps {
  /** Display cell for the field's CalcValue. Always the leftmost column. */
  display: ReactNode;
  /** Slots for the four operator buttons (or four hidden spacers, for Field 1). */
  op1: ReactNode;
  op2: ReactNode;
  op3: ReactNode;
  op4: ReactNode;
  /** Clear button (rightmost column). */
  clear: ReactNode;
}

/**
 * Layout shell for one row of the Simple calculator's 3-field ladder:
 * value display + 4 operator-slot cells + clear-button cell, all on a
 * shared 6-column grid.
 *
 * This component owns only the grid template and slot placement. Every
 * button (including all data-testid attributes) is rendered by the
 * caller, inline, so each testid appears as a literal-string JSX
 * attribute in the source tree. The build verifier's
 * `"data-testid":"<id>"` search only matches literal-attribute
 * emissions; any indirection through a variable prop compiles the
 * testid to a variable-referring shape that the verifier can't
 * correlate to a manifest entry. That constraint forced the design
 * back from a behavior-owning component to a layout-only shell.
 *
 * For Field 1 (no operators), pass four invisible-spacer divs into the
 * op1-op4 slots. See SimpleCalculatorPane for concrete usage.
 */
export function SimpleFieldRow({ display, op1, op2, op3, op4, clear }: SimpleFieldRowProps) {
  return (
    <div
      className="grid gap-2 items-center"
      style={{ gridTemplateColumns: `${CommonFieldWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${ClearBtnWidth}` }}
    >
      {display}
      {op1}
      {op2}
      {op3}
      {op4}
      {clear}
    </div>
  );
}
