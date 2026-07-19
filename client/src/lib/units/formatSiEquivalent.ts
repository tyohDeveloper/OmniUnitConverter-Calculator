import type { UnitDefinition } from './unitDefinition';
import { CONVERSION_FUNCTIONS } from './conversionFunctionRegistry';
import { DEFINING_RELATIONS } from './definingRelations';
import { formatSiFactor } from './formatSiFactor';
import { PAPER_SIZE_DIMENSIONS } from './paperSizeDimensions';

export interface SiEquivalentOptions {
  categoryId?: string;
  baseSISymbol?: string;
}

function offsetRelation(unit: UnitDefinition, sym: string, baseSymbol: string): string {
  const offset = unit.offset ?? 0;
  const off = offset >= 0 ? `+ ${formatSiFactor(offset)}` : `− ${formatSiFactor(-offset)}`;
  const scale = unit.factor === 1 ? '' : `⋅${formatSiFactor(unit.factor)}`;
  return `x ${sym} = (x ${off})${scale} ${baseSymbol}`;
}

function linearRelation(unit: UnitDefinition, sym: string, baseSymbol: string, baseSISymbol?: string): string {
  const isBaseRow = unit.factor === 1 && sym === baseSymbol;
  if (isBaseRow && baseSISymbol && baseSISymbol !== sym) return `${sym} = ${baseSISymbol}`;
  if (baseSymbol === '1' || baseSymbol === '') return `${sym} = ${formatSiFactor(unit.factor)}`;
  return `${sym} = ${formatSiFactor(unit.factor)} ${baseSymbol}`;
}

/**
 * Render a unit's static SI equivalent for the Sources reference table.
 * Linear units: "ft = 0.3048 m". Base rows of derived-unit categories show
 * the base-SI decomposition ("J = kg⋅m²⋅s⁻²"). Offset units (temperature)
 * show the defining relation; paper sizes show physical dimensions;
 * non-linear function units use DEFINING_RELATIONS.
 */
export function formatSiEquivalent(unit: UnitDefinition, baseSymbol: string, options?: SiEquivalentOptions): string {
  const sym = unit.symbol || unit.name;
  if (options?.categoryId === 'paper_sizes' && PAPER_SIZE_DIMENSIONS[unit.id]) {
    return `${sym} = ${PAPER_SIZE_DIMENSIONS[unit.id]}`;
  }
  if (unit.mathFunction) return `y = ${unit.mathFunction}(x)`;
  if (unit.conversionFunction) {
    const relation = DEFINING_RELATIONS[unit.conversionFunction];
    if (relation) return relation;
    const pair = CONVERSION_FUNCTIONS[unit.conversionFunction];
    if (pair && !pair.linear) return '—';
  }
  if (unit.offset) return offsetRelation(unit, sym, baseSymbol);
  if (unit.isInverse) return `${sym} = ${formatSiFactor(unit.factor)} / (x ${baseSymbol})`;
  return linearRelation(unit, sym, baseSymbol, options?.baseSISymbol);
}
