import type { CalcValue } from './types';
import { dimensionsEqual } from '../dimensions/dimensionsEqual';
import { isDimensionless } from '../dimensions/isDimensionless';

export const canAddSubtract = (
  v1: CalcValue | null,
  v2: CalcValue | null
): boolean => {
  if (!v1 || !v2) return false;
  return dimensionsEqual(v1.dimensions, v2.dimensions) ||
    isDimensionless(v1.dimensions) ||
    isDimensionless(v2.dimensions);
};
