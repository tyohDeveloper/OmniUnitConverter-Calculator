export type { UnitCategory } from './unitCategory';
export type { Prefix } from './prefix';
export type { UnitDefinition, CategoryDefinition } from './unitDefinition';

export { PREFIXES, BINARY_PREFIXES, ALL_PREFIXES } from './prefixes';
export { findOptimalPrefix } from './findOptimalPrefix';
export { prefixPowerFactor } from './prefixPowerFactor';

export type { DimensionalFormula } from './dimensionalFormula';
export type { CalcValue } from './calcValue';
export type { DerivedUnitInfo } from './derivedUnitInfo';
export type { NumberFormat } from './numberFormat';
export type { SupportedLanguageCode } from './languageTypes';
export { ISO_LANGUAGES } from './languageTypes';
export type { SIBaseUnitSymbol } from './siBaseUnits';
export { SI_BASE_UNIT_SYMBOLS, SI_BASE_TO_DIMENSION, DIMENSION_TO_SI_SYMBOL } from './siBaseUnits';
export { SI_DERIVED_UNITS } from './siDerivedUnitsCatalog';
export { NON_SI_UNITS_CATALOG } from './nonSiUnitsCatalog';
export type { CategoryDimensionInfo } from './categoryDimensions';
export { CATEGORY_DIMENSIONS, EXCLUDED_CROSS_DOMAIN_CATEGORIES } from './categoryDimensions';
export type { PreferredRepresentation } from './preferredRepresentations';
export { PREFERRED_REPRESENTATIONS } from './preferredRepresentations';
export { getDimensionSignature } from './getDimensionSignature';

export {
  CONVERSION_DATA,
  convert,
  applyMathFunction,
  parseUnitText,
  parseUnitSymbol,
  buildUnitSymbolMap,
  type ParsedUnitResult,
} from '../conversion-data';

export { PREFIX_EXPONENTS, EXPONENT_TO_PREFIX } from './prefixExponents';
export { GRAM_TO_KG_UNIT_PAIRS, KG_TO_GRAM_UNIT_PAIRS, normalizeMassUnit } from './normalizeMassUnit';
export { normalizeMassValue } from './normalizeMassValue';
export type { MassDisplayResult } from './normalizeMassDisplay';
export { normalizeMassDisplay } from './normalizeMassDisplay';
export { applyPrefixToKgUnit } from './applyPrefixToKgUnit';
export { dimensionsEqual } from '../calculator/dimensionsEqual';
export { findCrossDomainMatches } from '../calculator/findCrossDomainMatches';
export { toTitleCase } from './toTitleCase';
export { buildDimensionalSymbol } from './buildDimensionalSymbol';
