import { composeUnitDisplaySymbol } from '../units/composeUnitDisplaySymbol';
import { siToDisplay } from '../unit-symbols/siToDisplay';

export interface CalcValueDisplay {
  formattedValue: string;
  unitSymbol: string;
  /** Pre-format numeric display value (already prefix-/offset-/inverse-adjusted). */
  displayValue: number;
}

/**
 * Format a calculator value (SI-base numeric + declared unit symbol +
 * prefix id) for display or clipboard. Single-sourced per
 * architecture-standards §1.6.
 *
 * Uses siToDisplay for the value transform, which correctly handles:
 *   - kg's baked-prefix special case
 *   - temperature offsets (K → °C, K → °F)
 *   - inverse units (photon wavelength etc.)
 *   - powered prefixes (km² = 10⁶ m², not 10³)
 *   - composite SI symbols not in CONVERSION_DATA (fallthrough case)
 *
 * The unit symbol composition (prefix-symbol + kg-adjusted display
 * symbol) is shared with the RPN result path via composeUnitDisplay
 * Symbol. Prior to 2026-08-05 this helper used
 *   displayValue = siValue / kgResult.effectivePrefixFactor
 * which was correct for kg but wrong for the other four cases
 * above. The bug was latent because every simple-mode CalcValue
 * producer sets prefix: 'none' (making the difference vanish), but
 * RPN paste + push could place a non-'none'-prefix value at Y/S2/S3
 * where field-display and clipboard-copy would then show the wrong
 * number. See git log for calc-display-formula-inconsistency.md
 * (deleted at resolution).
 */
export function formatCalcValueDisplay(
  siValue: number,
  baseSymbol: string,
  prefixId: string,
  precision: number,
  formatNumberWithSeparators: (num: number, precision: number) => string,
): CalcValueDisplay {
  const { unitSymbol } = composeUnitDisplaySymbol(baseSymbol, prefixId);
  const displayValue = siToDisplay(siValue, baseSymbol, prefixId);
  return {
    formattedValue: formatNumberWithSeparators(displayValue, precision),
    unitSymbol,
    displayValue,
  };
}
