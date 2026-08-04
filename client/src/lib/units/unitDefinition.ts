import type { UnitCategory } from './unitCategory';
import type { UnitType } from './unitType';
import type { MeasurementSystem } from './measurementSystem';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  factor: number;
  offset?: number;
  description?: string;
  allowPrefixes?: boolean;
  prefixPower?: number;
  mathFunction?: 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan' | 'sqrt' | 'cbrt' | 'root4' | 'log10' | 'log2' | 'ln' | 'exp' | 'abs' | 'sinh' | 'cosh' | 'tanh' | 'asinh' | 'acosh' | 'atanh' | 'floor' | 'ceil' | 'round' | 'trunc' | 'sign' | 'square' | 'cube' | 'pow4';
  isInverse?: boolean;
  conversionFunction?: string;
  sourceUrl?: string;
  unitType?: UnitType;
  measurementSystem?: MeasurementSystem;
}

/**
 * The conversion "flavor" of a category:
 *
 * - SI_QUANTITY: real physical quantity with SI dimensions (linear
 *   factor + optional affine offset, or named conversionFunction).
 *   Includes archaics, named-standard locals, radiation, fuel, photon.
 * - DIMENSIONLESS_RATIO: pure ratios / counting groups (ppm, %, dozen).
 *   dimensions:{} but units relate by scalar factor.
 * - DATA_QUANTITY: information quantity. Base unit byte, base concept
 *   Shannon bit. Own prefix system (IEC 80000-13 Ki/Mi/Gi plus
 *   commercial-decimal K/M/G abuse). Not a physical quantity.
 * - FUEL_ECONOMY: efficiency ratios. Dimensionally heterogeneous
 *   (km/L is length:-2; km/kWh is length · energy^-1); coherent
 *   semantically but not routable by dimensions alone.
 * - NUMERIC_FUNCTION: units are math functions applied to a number
 *   (logarithmic: dB, EV/stop, phon, decade). Not really a conversion.
 * - SYMBOLIC: reserved for future non-numeric conversions (dates,
 *   calendar systems, number bases). No category uses this yet.
 */
export type CategoryFamily =
  | 'SI_QUANTITY'
  | 'DIMENSIONLESS_RATIO'
  | 'DATA_QUANTITY'
  | 'FUEL_ECONOMY'
  | 'NUMERIC_FUNCTION'
  | 'SYMBOLIC';

export interface CategoryDefinition {
  id: UnitCategory;
  name: string;
  baseUnit: string;
  baseSISymbol?: string;
  family: CategoryFamily;
  units: UnitDefinition[];
  /**
   * Marks this category as a specialist of another category (the
   * "primary") — archaics, named-standard locals, and special subsets.
   * Consumers use it to dedupe specialists against their primary in
   * cross-domain match. Referenced value must be a primary (no chains).
   * Validated at load time. See docs/architecture/categoryMetadata.md.
   */
  primaryCategory?: UnitCategory;
  /**
   * True when this category shares dimensions with a more-familiar
   * primary and should NOT surface in Direct-pane matching or the
   * SI-representations dropdown. Used by suppression filters despite
   * dimensional match. Distinct from primaryCategory: aliases are
   * semantically different concepts sharing dims (radioactivity vs
   * frequency, cross_section vs area, sound_pressure vs pressure).
   */
  hideFromDirectMatch?: boolean;
  /**
   * Optional: names the dimensional-parent primary. Informational
   * only — the current suppression logic reads hideFromDirectMatch,
   * not this field. Optional for orphan aliases (sound_intensity,
   * acoustic_impedance, refractive_power) with no clean parent.
   * Referenced value must be a non-specialist, non-alias primary.
   */
  dimensionalAliasOf?: UnitCategory;
}
