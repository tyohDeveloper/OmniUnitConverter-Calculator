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
 * - SI_QUANTITY: a real physical quantity with SI dimensions. Its
 *   units convert by linear scaling (with optional offset for
 *   affine cases like Celsius→Kelvin) or by a bidirectional named
 *   conversionFunction pair (paper_sizes, logarithmic-like log_*).
 *   Includes archaics, named-standard locals, radiation cluster,
 *   fuel, photon, and every other dimensioned category.
 *
 * - DIMENSIONLESS_RATIO: units are pure numerical ratios or named
 *   counting groups (ppm, %, dozen, gross). Dimensions: {} but
 *   distinct from NUMERIC_FUNCTION — units still relate by a scalar
 *   factor.
 *
 * - NUMERIC_FUNCTION: not really a conversion at all; the "units"
 *   are math functions or operators applied to a number. Included
 *   in the category framework for UI uniformity. logarithmic and
 *   (defunct) math live here.
 *
 * - SYMBOLIC: reserved for future non-numeric conversions (dates,
 *   calendar systems, number bases, timezones). Value type will
 *   need a widened conversion signature; no category uses this yet.
 */
export type CategoryFamily =
  | 'SI_QUANTITY'
  | 'DIMENSIONLESS_RATIO'
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
