import type { CalcValue } from '@/lib/units/shared-types';
import type { RpnAction } from '../rpnReducer';
export const updateRpnStack = (
  updater: (prev: Array<CalcValue | null>) => Array<CalcValue | null>
): RpnAction => ({ type: 'UPDATE_RPN_STACK', payload: updater });
