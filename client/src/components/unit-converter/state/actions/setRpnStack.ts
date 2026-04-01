import type { CalcValue } from '@/lib/units/shared-types';
import type { RpnAction } from '../rpnReducer';
export const setRpnStack = (v: Array<CalcValue | null>): RpnAction =>
  ({ type: 'SET_RPN_STACK', payload: v });
