import type { UnitDefinition } from './unitDefinition';
import { CONVERSION_FUNCTIONS } from './conversionFunctionRegistry';
import { DEFINING_RELATIONS } from './definingRelations';
import { formatSiFactor } from './formatSiFactor';

/**
 * Render a unit's static SI equivalent for the Sources reference table.
 * Linear units: "1 ft = 0.3048 m". Offset units (temperature): the defining
 * relation. Non-linear function units: relation from DEFINING_RELATIONS.
 */
export function formatSiEquivalent(unit: UnitDefinition, baseSymbol: string): string {
  const sym = unit.symbol || unit.name;
  if (unit.mathFunction) return `y = ${unit.mathFunction}(x)`;
  if (unit.conversionFunction) {
    const relation = DEFINING_RELATIONS[unit.conversionFunction];
    if (relation) return relation;
    const pair = CONVERSION_FUNCTIONS[unit.conversionFunction];
    if (pair && !pair.linear) return '—';
  }
  if (unit.offset) {
    const off = unit.offset >= 0 ? `+ ${formatSiFactor(unit.offset)}` : `− ${formatSiFactor(-unit.offset)}`;
    const scale = unit.factor === 1 ? '' : ` × ${formatSiFactor(unit.factor)}`;
    return `x ${sym} = (x ${off})${scale} ${baseSymbol}`;
  }
  if (unit.isInverse) return `y ${baseSymbol} = ${formatSiFactor(unit.factor)} / x ${sym}`;
  return `1 ${sym} = ${formatSiFactor(unit.factor)} ${baseSymbol}`;
}
