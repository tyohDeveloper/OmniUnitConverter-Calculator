import type { CalcValue } from '@/lib/units/shared-types';
import type { RpnAction } from '../rpnReducer';
export const saveAndUpdateStack = (
  updater: (stack: Array<CalcValue | null>) => Array<CalcValue | null>
): RpnAction => ({ type: 'SAVE_AND_UPDATE_STACK', payload: updater });
