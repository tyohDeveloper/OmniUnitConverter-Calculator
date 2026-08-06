import type { DimensionalFormula } from './dimensionalFormula';

/**
 * A numeric value together with its dimensional signature and
 * (optional) display metadata.
 *
 *   value        — the SI-base numeric value
 *   dimensions   — the dimensional formula (m, kg, s, ... powers)
 *   prefix       — SI-prefix id ('none', 'kilo', 'milli', ...) applied
 *                  to the base symbol when the value came in with a
 *                  prefix intact (RPN paste is the only writer today)
 *   sourceCategory — category-flavored SI representations: when the
 *                  value came from a specific category, the SI-
 *                  representation generator will surface that
 *                  category's derived symbols first
 *   originalUnit / originalValue — display cache used by
 *                  CalculatorFieldDisplay when preserveSourceUnit is
 *                  on. Not a history: the RPN alt/prefix selector
 *                  overwrites these whenever the user changes the
 *                  display target. See useCalculatorRpnSelection.
 */
export interface CalcValue {
  value: number;
  dimensions: DimensionalFormula;
  prefix: string;
  sourceCategory?: string;
  originalUnit?: string;
  originalValue?: number;
}
