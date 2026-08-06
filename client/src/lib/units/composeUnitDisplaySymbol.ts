import { PREFIXES } from './prefixes';
import { applyPrefixToKgUnit } from './applyPrefixToKgUnit';

export interface KgResult {
  displaySymbol: string;
  effectivePrefixFactor: number;
  showPrefix: boolean;
}

export interface ComposedUnitDisplay {
  /** Composed display: prefix symbol + kg-adjusted display symbol. */
  unitSymbol: string;
  /** Raw applyPrefixToKgUnit output; callers may need effectivePrefixFactor. */
  kgResult: KgResult;
}

/**
 * Compose the visible unit symbol for a (baseSymbol, prefixId) pair,
 * accounting for the kg-baked-prefix special case. Single-sourced
 * per architecture-standards §1.6.
 *
 * The kg-adjustment logic lives in applyPrefixToKgUnit; this helper
 * adds the "show / hide prefix symbol" step so all four calculator
 * display sites (CalculatorFieldDisplay, useCalculatorClipboard,
 * useCalculatorDisplayFormatters, useCalculatorRpnSelection) agree
 * on the composed unitSymbol formula:
 *
 *   prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : ''
 *   unitSymbol   = prefixSymbol + kgResult.displaySymbol
 *
 * Callers that also need the value transform (division by effective
 * PrefixFactor, or the full siToDisplay path for temperature /
 * inverse / kg units) either use kgResult.effectivePrefixFactor
 * directly or call siToDisplay themselves. See formatCalcValueDisplay
 * for the packaged simple-mode display transform.
 */
export function composeUnitDisplaySymbol(baseSymbol: string, prefixId: string): ComposedUnitDisplay {
  const kgResult = applyPrefixToKgUnit(baseSymbol, prefixId);
  const prefixData = PREFIXES.find(p => p.id === prefixId);
  const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
  return { unitSymbol: prefixSymbol + kgResult.displaySymbol, kgResult };
}
