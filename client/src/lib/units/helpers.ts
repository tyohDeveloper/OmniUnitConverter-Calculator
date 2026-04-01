export { PREFIX_EXPONENTS, EXPONENT_TO_PREFIX } from './prefixExponents';
export { GRAM_TO_KG_UNIT_PAIRS, KG_TO_GRAM_UNIT_PAIRS, normalizeMassUnit } from './normalizeMassUnit';
export type { MassDisplayResult } from './normalizeMassDisplay';
export { normalizeMassDisplay } from './normalizeMassDisplay';
export { normalizeMassValue } from './normalizeMassValue';
export { applyPrefixToKgUnit } from './applyPrefixToKgUnit';
export { getDimensionSignature } from './shared-types';
export { dimensionsEqual } from '../calculator/dimensionsEqual';
export { findCrossDomainMatches } from '../calculator/findCrossDomainMatches';
export { toTitleCase } from './toTitleCase';
export { applyRegionalSpelling } from './applyRegionalSpelling';
export { buildDimensionalSymbol } from './buildDimensionalSymbol';
export { findBestPrefix } from './findBestPrefix';

export type { CategoryDimensionInfo, PreferredRepresentation } from './shared-types';
export { CATEGORY_DIMENSIONS, EXCLUDED_CROSS_DOMAIN_CATEGORIES, PREFERRED_REPRESENTATIONS } from './shared-types';
