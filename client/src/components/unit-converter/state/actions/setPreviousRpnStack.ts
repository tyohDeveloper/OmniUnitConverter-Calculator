import type { CalcValue } from '@/lib/units/shared-types';
import type { RpnAction } from '../rpnReducer';
export const setPreviousRpnStack = (v: Array<CalcValue | null>): RpnAction =>
  ({ type: 'SET_PREVIOUS_RPN_STACK', payload: v });
