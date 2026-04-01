import type { CalcValue } from '@/lib/units/shared-types';
import type { RpnAction } from '../rpnReducer';
export const setLastX = (v: CalcValue | null): RpnAction =>
  ({ type: 'SET_LAST_X', payload: v });
