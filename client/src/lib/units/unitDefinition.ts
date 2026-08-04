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
   * When present, marks this category as a *specialist* of another
   * category (the "primary"). Two use cases:
   *
   *   1. Archaic sets: archaic_length is a specialist of length —
   *      same physical dimension, decluttered into its own category
   *      so obscure historical units don't crowd the main length
   *      dropdown.
   *
   *   2. Named-standard locals: paper_sizes, rack_geometry, shipping,
   *      lightbulb, cooking, beer_wine_volume, typography — units
   *      that are named discrete standards but underlyingly a
   *      familiar SI quantity (paper_sizes are areas, rack_geometry
   *      are lengths, etc.).
   *
   *   3. Special subsets: fuel (energy content), equivalent_dose
   *      (a per-body-effect refinement of radiation_dose), etc.
   *
   * Consumers use this to skip specialist categories in cross-domain
   * matching against their primary (so that opening "length" doesn't
   * surface every archaic-length unit as a cross-match) and, in
   * future, to surface "see also" hints on the primary's page.
   *
   * Every referenced value MUST itself be a primary (no chains).
   * validateCategoryJson enforces this at load time.
   */
  primaryCategory?: UnitCategory;
}
