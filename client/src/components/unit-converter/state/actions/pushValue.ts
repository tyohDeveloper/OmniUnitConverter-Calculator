import type { CalcValue } from '@/lib/units/shared-types';
import type { RpnAction } from '../rpnReducer';
export const pushValue = (v: CalcValue): RpnAction =>
  ({ type: 'PUSH_VALUE', payload: v });
