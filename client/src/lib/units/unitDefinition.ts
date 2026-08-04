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

export interface CategoryDefinition {
  id: UnitCategory;
  name: string;
  baseUnit: string;
  baseSISymbol?: string;
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
