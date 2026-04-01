import type { ConverterState } from '../converterReducer';
export const selectActiveCategory = (s: ConverterState) => s.activeCategory;
