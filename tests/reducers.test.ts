import { describe, it, expect } from 'vitest';
import {
  converterReducer,
  converterInitialState,
  type ConverterState,
} from '../client/src/components/unit-converter/state/converterReducer';
import { selectActiveCategory } from '../client/src/components/unit-converter/state/selectors/selectActiveCategory';
import { selectFromUnit } from '../client/src/components/unit-converter/state/selectors/selectFromUnit';
import { selectToUnit } from '../client/src/components/unit-converter/state/selectors/selectToUnit';
import { selectFromPrefix } from '../client/src/components/unit-converter/state/selectors/selectFromPrefix';
import { selectToPrefix } from '../client/src/components/unit-converter/state/selectors/selectToPrefix';
import { selectInputValue } from '../client/src/components/unit-converter/state/selectors/selectInputValue';
import { selectResult } from '../client/src/components/unit-converter/state/selectors/selectResult';
import { selectPrecision } from '../client/src/components/unit-converter/state/selectors/selectPrecision';
import { selectComparisonMode } from '../client/src/components/unit-converter/state/selectors/selectComparisonMode';
import {
  calculatorReducer,
  calculatorInitialState,
  type CalculatorState,
} from '../client/src/components/unit-converter/state/calculatorReducer';
import { selectCalculatorMode } from '../client/src/components/unit-converter/state/selectors/selectCalculatorMode';
import { selectShiftActive } from '../client/src/components/unit-converter/state/selectors/selectShiftActive';
import { selectCalculatorPrecision } from '../client/src/components/unit-converter/state/selectors/selectCalculatorPrecision';
import { selectCalcValues } from '../client/src/components/unit-converter/state/selectors/selectCalcValues';
import { selectCalcOp1 } from '../client/src/components/unit-converter/state/selectors/selectCalcOp1';
import { selectCalcOp2 } from '../client/src/components/unit-converter/state/selectors/selectCalcOp2';
import { selectResultUnit } from '../client/src/components/unit-converter/state/selectors/selectResultUnit';
import { selectResultCategory } from '../client/src/components/unit-converter/state/selectors/selectResultCategory';
import { selectResultPrefix } from '../client/src/components/unit-converter/state/selectors/selectResultPrefix';
import { selectSelectedAlternative } from '../client/src/components/unit-converter/state/selectors/selectSelectedAlternative';
import {
  rpnReducer,
  rpnInitialState,
  type RpnState,
} from '../client/src/components/unit-converter/state/rpnReducer';
import { selectRpnStack } from '../client/src/components/unit-converter/state/selectors/selectRpnStack';
import { selectPreviousRpnStack } from '../client/src/components/unit-converter/state/selectors/selectPreviousRpnStack';
import { selectLastX } from '../client/src/components/unit-converter/state/selectors/selectLastX';
import { selectRpnResultPrefix } from '../client/src/components/unit-converter/state/selectors/selectRpnResultPrefix';
import { selectRpnSelectedAlternative } from '../client/src/components/unit-converter/state/selectors/selectRpnSelectedAlternative';
import { selectRpnXEditing } from '../client/src/components/unit-converter/state/selectors/selectRpnXEditing';
import { selectRpnXEditValue } from '../client/src/components/unit-converter/state/selectors/selectRpnXEditValue';
import {
  uiPrefsReducer,
  uiPrefsInitialState,
  type UiPrefsState,
} from '../client/src/components/unit-converter/state/uiPrefsReducer';
import { selectNumberFormat } from '../client/src/components/unit-converter/state/selectors/selectNumberFormat';
import { selectLanguage } from '../client/src/components/unit-converter/state/selectors/selectLanguage';
import { selectActiveTab } from '../client/src/components/unit-converter/state/selectors/selectActiveTab';
import { selectDirectValue } from '../client/src/components/unit-converter/state/selectors/selectDirectValue';
import { selectDirectExponents } from '../client/src/components/unit-converter/state/selectors/selectDirectExponents';
import type { CalcValue } from '../client/src/lib/units/shared-types';

const makeCalcValue = (value: number): CalcValue => ({
  value,
  dimensions: {},
  prefix: 'none',
});

describe('converterReducer', () => {
  it('returns initial state unchanged for unknown action', () => {
    const state = converterReducer(converterInitialState, { type: 'SET_INPUT_VALUE', payload: '1' });
    expect(state.inputValue).toBe('1');
  });

  it('SET_ACTIVE_CATEGORY updates category', () => {
    const next = converterReducer(converterInitialState, { type: 'SET_ACTIVE_CATEGORY', payload: 'mass' });
    expect(next.activeCategory).toBe('mass');
    expect(next.fromUnit).toBe(converterInitialState.fromUnit);
  });

  it('SET_FROM_UNIT updates fromUnit', () => {
    const next = converterReducer(converterInitialState, { type: 'SET_FROM_UNIT', payload: 'kg' });
    expect(next.fromUnit).toBe('kg');
  });

  it('SET_TO_UNIT updates toUnit', () => {
    const next = converterReducer(converterInitialState, { type: 'SET_TO_UNIT', payload: 'lb' });
    expect(next.toUnit).toBe('lb');
  });

  it('SET_FROM_PREFIX updates fromPrefix', () => {
    const next = converterReducer(converterInitialState, { type: 'SET_FROM_PREFIX', payload: 'k' });
    expect(next.fromPrefix).toBe('k');
  });

  it('SET_TO_PREFIX updates toPrefix', () => {
    const next = converterReducer(converterInitialState, { type: 'SET_TO_PREFIX', payload: 'm' });
    expect(next.toPrefix).toBe('m');
  });

  it('SET_INPUT_VALUE updates inputValue', () => {
    const next = converterReducer(converterInitialState, { type: 'SET_INPUT_VALUE', payload: '42' });
    expect(next.inputValue).toBe('42');
  });

  it('SET_RESULT updates result', () => {
    const next = converterReducer(converterInitialState, { type: 'SET_RESULT', payload: 3.14 });
    expect(next.result).toBe(3.14);
  });

  it('SET_RESULT allows null', () => {
    const withResult: ConverterState = { ...converterInitialState, result: 100 };
    const next = converterReducer(withResult, { type: 'SET_RESULT', payload: null });
    expect(next.result).toBeNull();
  });

  it('SET_PRECISION updates precision', () => {
    const next = converterReducer(converterInitialState, { type: 'SET_PRECISION', payload: 8 });
    expect(next.precision).toBe(8);
  });

  it('SET_COMPARISON_MODE updates comparisonMode', () => {
    const next = converterReducer(converterInitialState, { type: 'SET_COMPARISON_MODE', payload: true });
    expect(next.comparisonMode).toBe(true);
  });

  it('SWAP_UNITS swaps from/to unit and prefix', () => {
    const state: ConverterState = {
      ...converterInitialState,
      fromUnit: 'm',
      toUnit: 'ft',
      fromPrefix: 'k',
      toPrefix: 'none',
    };
    const next = converterReducer(state, { type: 'SWAP_UNITS' });
    expect(next.fromUnit).toBe('ft');
    expect(next.toUnit).toBe('m');
    expect(next.fromPrefix).toBe('none');
    expect(next.toPrefix).toBe('k');
  });

  it('SWAP_UNITS does not mutate the original state', () => {
    const state: ConverterState = { ...converterInitialState, fromUnit: 'm', toUnit: 'ft' };
    const next = converterReducer(state, { type: 'SWAP_UNITS' });
    expect(state.fromUnit).toBe('m');
    expect(next.fromUnit).toBe('ft');
  });

  it('state is immutable: each action returns a new object', () => {
    const next = converterReducer(converterInitialState, { type: 'SET_FROM_UNIT', payload: 'km' });
    expect(next).not.toBe(converterInitialState);
  });
});

describe('converterSelectors', () => {
  it('selectActiveCategory returns activeCategory', () => {
    const state: ConverterState = { ...converterInitialState, activeCategory: 'temperature' };
    expect(selectActiveCategory(state)).toBe('temperature');
  });

  it('selectFromUnit returns fromUnit', () => {
    const state: ConverterState = { ...converterInitialState, fromUnit: 'kg' };
    expect(selectFromUnit(state)).toBe('kg');
  });

  it('selectToUnit returns toUnit', () => {
    const state: ConverterState = { ...converterInitialState, toUnit: 'lb' };
    expect(selectToUnit(state)).toBe('lb');
  });

  it('selectFromPrefix returns fromPrefix', () => {
    const state: ConverterState = { ...converterInitialState, fromPrefix: 'M' };
    expect(selectFromPrefix(state)).toBe('M');
  });

  it('selectToPrefix returns toPrefix', () => {
    const state: ConverterState = { ...converterInitialState, toPrefix: 'mu' };
    expect(selectToPrefix(state)).toBe('mu');
  });

  it('selectInputValue returns inputValue', () => {
    const state: ConverterState = { ...converterInitialState, inputValue: '99' };
    expect(selectInputValue(state)).toBe('99');
  });

  it('selectResult returns result', () => {
    const state: ConverterState = { ...converterInitialState, result: 2.718 };
    expect(selectResult(state)).toBe(2.718);
  });

  it('selectPrecision returns precision', () => {
    const state: ConverterState = { ...converterInitialState, precision: 6 };
    expect(selectPrecision(state)).toBe(6);
  });

  it('selectComparisonMode returns comparisonMode', () => {
    const state: ConverterState = { ...converterInitialState, comparisonMode: true };
    expect(selectComparisonMode(state)).toBe(true);
  });
});

describe('calculatorReducer', () => {
  it('SET_CALCULATOR_MODE updates mode', () => {
    const next = calculatorReducer(calculatorInitialState, { type: 'SET_CALCULATOR_MODE', payload: 'simple' });
    expect(next.calculatorMode).toBe('simple');
  });

  it('SET_SHIFT_ACTIVE updates shiftActive', () => {
    const next = calculatorReducer(calculatorInitialState, { type: 'SET_SHIFT_ACTIVE', payload: true });
    expect(next.shiftActive).toBe(true);
  });

  it('SET_CALCULATOR_PRECISION updates calculatorPrecision', () => {
    const next = calculatorReducer(calculatorInitialState, { type: 'SET_CALCULATOR_PRECISION', payload: 6 });
    expect(next.calculatorPrecision).toBe(6);
  });

  it('SET_CALC_VALUES updates calcValues', () => {
    const vals: Array<CalcValue | null> = [makeCalcValue(1), null, null, null];
    const next = calculatorReducer(calculatorInitialState, { type: 'SET_CALC_VALUES', payload: vals });
    expect(next.calcValues[0]).toEqual(makeCalcValue(1));
  });

  it('UPDATE_CALC_VALUES applies updater against reducer-time state', () => {
    const s0 = { ...calculatorInitialState, calcValues: [makeCalcValue(5), null, null, null] };
    const next = calculatorReducer(s0, {
      type: 'UPDATE_CALC_VALUES',
      payload: (prev) => [prev[0] ? makeCalcValue(prev[0].value * 2) : null, null, null, null],
    });
    expect(next.calcValues[0]?.value).toBe(10);
  });

  it('SET_CALC_OP1 updates calcOp1', () => {
    const next = calculatorReducer(calculatorInitialState, { type: 'SET_CALC_OP1', payload: '+' });
    expect(next.calcOp1).toBe('+');
  });

  it('SET_CALC_OP2 updates calcOp2', () => {
    const next = calculatorReducer(calculatorInitialState, { type: 'SET_CALC_OP2', payload: '*' });
    expect(next.calcOp2).toBe('*');
  });

  it('SET_RESULT_UNIT updates resultUnit', () => {
    const next = calculatorReducer(calculatorInitialState, { type: 'SET_RESULT_UNIT', payload: 'meter' });
    expect(next.resultUnit).toBe('meter');
  });

  it('SET_RESULT_CATEGORY updates resultCategory', () => {
    const next = calculatorReducer(calculatorInitialState, { type: 'SET_RESULT_CATEGORY', payload: 'length' });
    expect(next.resultCategory).toBe('length');
  });

  it('SET_RESULT_PREFIX updates resultPrefix', () => {
    const next = calculatorReducer(calculatorInitialState, { type: 'SET_RESULT_PREFIX', payload: 'k' });
    expect(next.resultPrefix).toBe('k');
  });

  it('SET_SELECTED_ALTERNATIVE updates selectedAlternative', () => {
    const next = calculatorReducer(calculatorInitialState, { type: 'SET_SELECTED_ALTERNATIVE', payload: 2 });
    expect(next.selectedAlternative).toBe(2);
  });

  it('does not mutate original state', () => {
    const next = calculatorReducer(calculatorInitialState, { type: 'SET_SHIFT_ACTIVE', payload: true });
    expect(calculatorInitialState.shiftActive).toBe(false);
    expect(next.shiftActive).toBe(true);
  });

  it('preserves unrelated fields', () => {
    const state: CalculatorState = { ...calculatorInitialState, calculatorPrecision: 8 };
    const next = calculatorReducer(state, { type: 'SET_SHIFT_ACTIVE', payload: true });
    expect(next.calculatorPrecision).toBe(8);
  });
});

describe('calculatorSelectors', () => {
  it('selectCalculatorMode returns calculatorMode', () => {
    const state: CalculatorState = { ...calculatorInitialState, calculatorMode: 'simple' };
    expect(selectCalculatorMode(state)).toBe('simple');
  });

  it('selectShiftActive returns shiftActive', () => {
    const state: CalculatorState = { ...calculatorInitialState, shiftActive: true };
    expect(selectShiftActive(state)).toBe(true);
  });

  it('selectCalculatorPrecision returns calculatorPrecision', () => {
    const state: CalculatorState = { ...calculatorInitialState, calculatorPrecision: 6 };
    expect(selectCalculatorPrecision(state)).toBe(6);
  });

  it('selectCalcValues returns calcValues', () => {
    const vals: Array<CalcValue | null> = [makeCalcValue(5), null, null, null];
    const state: CalculatorState = { ...calculatorInitialState, calcValues: vals };
    expect(selectCalcValues(state)).toEqual(vals);
  });

  it('selectCalcOp1 returns calcOp1', () => {
    const state: CalculatorState = { ...calculatorInitialState, calcOp1: '-' };
    expect(selectCalcOp1(state)).toBe('-');
  });

  it('selectCalcOp2 returns calcOp2', () => {
    const state: CalculatorState = { ...calculatorInitialState, calcOp2: '/' };
    expect(selectCalcOp2(state)).toBe('/');
  });

  it('selectResultUnit returns resultUnit', () => {
    const state: CalculatorState = { ...calculatorInitialState, resultUnit: 'kilogram' };
    expect(selectResultUnit(state)).toBe('kilogram');
  });

  it('selectResultCategory returns resultCategory', () => {
    const state: CalculatorState = { ...calculatorInitialState, resultCategory: 'mass' };
    expect(selectResultCategory(state)).toBe('mass');
  });

  it('selectResultPrefix returns resultPrefix', () => {
    const state: CalculatorState = { ...calculatorInitialState, resultPrefix: 'M' };
    expect(selectResultPrefix(state)).toBe('M');
  });

  it('selectSelectedAlternative returns selectedAlternative', () => {
    const state: CalculatorState = { ...calculatorInitialState, selectedAlternative: 3 };
    expect(selectSelectedAlternative(state)).toBe(3);
  });
});

describe('rpnReducer', () => {
  const v1 = makeCalcValue(1);
  const v2 = makeCalcValue(2);
  const v3 = makeCalcValue(3);

  it('SET_RPN_STACK updates rpnStack', () => {
    const stack = [v1, null, null, null];
    const next = rpnReducer(rpnInitialState, { type: 'SET_RPN_STACK', payload: stack });
    expect(next.rpnStack[0]).toEqual(v1);
  });

  it('UPDATE_RPN_STACK applies updater against reducer-time state', () => {
    const s0 = { ...rpnInitialState, rpnStack: [v1, null, null, null] };
    const next = rpnReducer(s0, {
      type: 'UPDATE_RPN_STACK',
      payload: (prev) => [prev[0] ? makeCalcValue(prev[0].value + 1) : null, null, null, null],
    });
    expect(next.rpnStack[0]?.value).toBe(v1.value + 1);
  });

  it('SET_LAST_X updates lastX', () => {
    const next = rpnReducer(rpnInitialState, { type: 'SET_LAST_X', payload: v1 });
    expect(next.lastX).toEqual(v1);
  });

  it('SET_RPN_RESULT_PREFIX updates rpnResultPrefix', () => {
    const next = rpnReducer(rpnInitialState, { type: 'SET_RPN_RESULT_PREFIX', payload: 'k' });
    expect(next.rpnResultPrefix).toBe('k');
  });

  it('SET_RPN_SELECTED_ALTERNATIVE updates rpnSelectedAlternative', () => {
    const next = rpnReducer(rpnInitialState, { type: 'SET_RPN_SELECTED_ALTERNATIVE', payload: 2 });
    expect(next.rpnSelectedAlternative).toBe(2);
  });

  it('SET_RPN_X_EDITING updates rpnXEditing', () => {
    const next = rpnReducer(rpnInitialState, { type: 'SET_RPN_X_EDITING', payload: true });
    expect(next.rpnXEditing).toBe(true);
  });

  it('SET_RPN_X_EDIT_VALUE updates rpnXEditValue', () => {
    const next = rpnReducer(rpnInitialState, { type: 'SET_RPN_X_EDIT_VALUE', payload: '3.14' });
    expect(next.rpnXEditValue).toBe('3.14');
  });

  it('PUSH_VALUE adds to stack position 0 and shifts others up', () => {
    const next = rpnReducer(rpnInitialState, { type: 'PUSH_VALUE', payload: v1 });
    expect(next.rpnStack[0]).toEqual(v1);
    expect(next.rpnStack[1]).toBeNull();
  });

  it('PUSH_VALUE shifts existing values', () => {
    const s1 = rpnReducer(rpnInitialState, { type: 'PUSH_VALUE', payload: v1 });
    const s2 = rpnReducer(s1, { type: 'PUSH_VALUE', payload: v2 });
    expect(s2.rpnStack[0]).toEqual(v2);
    expect(s2.rpnStack[1]).toEqual(v1);
  });

  it('PUSH_VALUE saves previous stack', () => {
    const s1 = rpnReducer(rpnInitialState, { type: 'PUSH_VALUE', payload: v1 });
    const s2 = rpnReducer(s1, { type: 'PUSH_VALUE', payload: v2 });
    expect(s2.previousRpnStack).toEqual(s1.rpnStack);
  });

  it('PUSH_VALUE resets rpnResultPrefix and rpnSelectedAlternative', () => {
    const state: RpnState = { ...rpnInitialState, rpnResultPrefix: 'k', rpnSelectedAlternative: 3 };
    const next = rpnReducer(state, { type: 'PUSH_VALUE', payload: v1 });
    expect(next.rpnResultPrefix).toBe('none');
    expect(next.rpnSelectedAlternative).toBe(0);
  });

  it('DROP_VALUE removes position 0 and shifts down', () => {
    const s1 = rpnReducer(rpnInitialState, { type: 'PUSH_VALUE', payload: v1 });
    const s2 = rpnReducer(s1, { type: 'PUSH_VALUE', payload: v2 });
    const next = rpnReducer(s2, { type: 'DROP_VALUE' });
    expect(next.rpnStack[0]).toEqual(v1);
    expect(next.rpnStack[1]).toBeNull();
  });

  it('DROP_VALUE sets position 3 to null', () => {
    const s1 = rpnReducer(rpnInitialState, { type: 'PUSH_VALUE', payload: v1 });
    const s2 = rpnReducer(s1, { type: 'PUSH_VALUE', payload: v2 });
    const s3 = rpnReducer(s2, { type: 'PUSH_VALUE', payload: v3 });
    const next = rpnReducer(s3, { type: 'DROP_VALUE' });
    expect(next.rpnStack[3]).toBeNull();
  });

  it('SWAP_XY swaps positions 0 and 1', () => {
    const s1 = rpnReducer(rpnInitialState, { type: 'PUSH_VALUE', payload: v1 });
    const s2 = rpnReducer(s1, { type: 'PUSH_VALUE', payload: v2 });
    const next = rpnReducer(s2, { type: 'SWAP_XY' });
    expect(next.rpnStack[0]).toEqual(v1);
    expect(next.rpnStack[1]).toEqual(v2);
  });

  it('SWAP_XY is a no-op when position 0 or 1 is null', () => {
    const s1 = rpnReducer(rpnInitialState, { type: 'PUSH_VALUE', payload: v1 });
    const next = rpnReducer(s1, { type: 'SWAP_XY' });
    expect(next.rpnStack[0]).toEqual(v1);
    expect(next.rpnStack[1]).toBeNull();
  });

  it('CLEAR_STACK resets stack to all nulls', () => {
    const s1 = rpnReducer(rpnInitialState, { type: 'PUSH_VALUE', payload: v1 });
    const next = rpnReducer(s1, { type: 'CLEAR_STACK' });
    expect(next.rpnStack).toEqual([null, null, null, null]);
  });

  it('CLEAR_STACK clears lastX', () => {
    const state: RpnState = { ...rpnInitialState, lastX: v1 };
    const next = rpnReducer(state, { type: 'CLEAR_STACK' });
    expect(next.lastX).toBeNull();
  });

  it('CLEAR_STACK resets editing state', () => {
    const state: RpnState = { ...rpnInitialState, rpnXEditing: true, rpnXEditValue: '99' };
    const next = rpnReducer(state, { type: 'CLEAR_STACK' });
    expect(next.rpnXEditing).toBe(false);
    expect(next.rpnXEditValue).toBe('');
  });

  it('UNDO_STACK restores previous stack', () => {
    const s1 = rpnReducer(rpnInitialState, { type: 'PUSH_VALUE', payload: v1 });
    const s2 = rpnReducer(s1, { type: 'PUSH_VALUE', payload: v2 });
    const next = rpnReducer(s2, { type: 'UNDO_STACK' });
    expect(next.rpnStack).toEqual(s1.rpnStack);
  });

  it('RECALL_LAST_X pushes lastX onto stack', () => {
    const state: RpnState = { ...rpnInitialState, lastX: v1 };
    const next = rpnReducer(state, { type: 'RECALL_LAST_X' });
    expect(next.rpnStack[0]).toEqual(v1);
  });

  it('RECALL_LAST_X is a no-op when lastX is null', () => {
    const next = rpnReducer(rpnInitialState, { type: 'RECALL_LAST_X' });
    expect(next.rpnStack).toEqual([null, null, null, null]);
  });

  it('RECALL_LAST_X preserves lastX value', () => {
    const state: RpnState = { ...rpnInitialState, lastX: v1 };
    const next = rpnReducer(state, { type: 'RECALL_LAST_X' });
    expect(next.lastX).toEqual(v1);
  });

  it('SAVE_AND_UPDATE_STACK applies updater and saves previous', () => {
    const s1 = rpnReducer(rpnInitialState, { type: 'PUSH_VALUE', payload: v1 });
    const updater = () => [null, null, null, null] as Array<null>;
    const next = rpnReducer(s1, { type: 'SAVE_AND_UPDATE_STACK', payload: updater });
    expect(next.rpnStack).toEqual([null, null, null, null]);
    expect(next.previousRpnStack).toEqual(s1.rpnStack);
  });

  it('does not mutate original state', () => {
    const original = { ...rpnInitialState };
    rpnReducer(rpnInitialState, { type: 'PUSH_VALUE', payload: v1 });
    expect(rpnInitialState.rpnStack).toEqual(original.rpnStack);
  });
});

describe('rpnSelectors', () => {
  it('selectRpnStack returns rpnStack', () => {
    const v = makeCalcValue(42);
    const state: RpnState = { ...rpnInitialState, rpnStack: [v, null, null, null] };
    expect(selectRpnStack(state)[0]).toEqual(v);
  });

  it('selectPreviousRpnStack returns previousRpnStack', () => {
    const v = makeCalcValue(7);
    const state: RpnState = { ...rpnInitialState, previousRpnStack: [v, null, null, null] };
    expect(selectPreviousRpnStack(state)[0]).toEqual(v);
  });

  it('selectLastX returns lastX', () => {
    const v = makeCalcValue(5);
    const state: RpnState = { ...rpnInitialState, lastX: v };
    expect(selectLastX(state)).toEqual(v);
  });

  it('selectRpnResultPrefix returns rpnResultPrefix', () => {
    const state: RpnState = { ...rpnInitialState, rpnResultPrefix: 'M' };
    expect(selectRpnResultPrefix(state)).toBe('M');
  });

  it('selectRpnSelectedAlternative returns rpnSelectedAlternative', () => {
    const state: RpnState = { ...rpnInitialState, rpnSelectedAlternative: 2 };
    expect(selectRpnSelectedAlternative(state)).toBe(2);
  });

  it('selectRpnXEditing returns rpnXEditing', () => {
    const state: RpnState = { ...rpnInitialState, rpnXEditing: true };
    expect(selectRpnXEditing(state)).toBe(true);
  });

  it('selectRpnXEditValue returns rpnXEditValue', () => {
    const state: RpnState = { ...rpnInitialState, rpnXEditValue: '3.14' };
    expect(selectRpnXEditValue(state)).toBe('3.14');
  });
});

describe('uiPrefsReducer', () => {
  it('SET_NUMBER_FORMAT updates numberFormat', () => {
    const next = uiPrefsReducer(uiPrefsInitialState, { type: 'SET_NUMBER_FORMAT', payload: 'period' });
    expect(next.numberFormat).toBe('period');
  });

  it('SET_LANGUAGE updates language', () => {
    const next = uiPrefsReducer(uiPrefsInitialState, { type: 'SET_LANGUAGE', payload: 'de' });
    expect(next.language).toBe('de');
  });

  it('SET_ACTIVE_TAB updates activeTab', () => {
    const next = uiPrefsReducer(uiPrefsInitialState, { type: 'SET_ACTIVE_TAB', payload: 'calculator' });
    expect(next.activeTab).toBe('calculator');
  });

  it('SET_DIRECT_VALUE updates directValue', () => {
    const next = uiPrefsReducer(uiPrefsInitialState, { type: 'SET_DIRECT_VALUE', payload: '3.14' });
    expect(next.directValue).toBe('3.14');
  });

  it('SET_DIRECT_EXPONENTS updates directExponents', () => {
    const exps = { m: 2, kg: 1, s: -2, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0 };
    const next = uiPrefsReducer(uiPrefsInitialState, { type: 'SET_DIRECT_EXPONENTS', payload: exps });
    expect(next.directExponents).toEqual(exps);
  });

  it('UPDATE_DIRECT_EXPONENTS applies updater against reducer-time state', () => {
    const s0 = { ...uiPrefsInitialState, directExponents: { ...uiPrefsInitialState.directExponents, m: 1 } };
    const next = uiPrefsReducer(s0, {
      type: 'UPDATE_DIRECT_EXPONENTS',
      payload: (prev) => ({ ...prev, m: prev.m + 1 }),
    });
    expect(next.directExponents.m).toBe(2);
  });

  it('does not mutate original state', () => {
    const next = uiPrefsReducer(uiPrefsInitialState, { type: 'SET_LANGUAGE', payload: 'fr' });
    expect(uiPrefsInitialState.language).toBe('en');
    expect(next.language).toBe('fr');
  });

  it('preserves unrelated fields', () => {
    const state: UiPrefsState = { ...uiPrefsInitialState, numberFormat: 'comma' };
    const next = uiPrefsReducer(state, { type: 'SET_LANGUAGE', payload: 'es' });
    expect(next.numberFormat).toBe('comma');
  });
});

describe('uiPrefsSelectors', () => {
  it('selectNumberFormat returns numberFormat', () => {
    const state: UiPrefsState = { ...uiPrefsInitialState, numberFormat: 'period' };
    expect(selectNumberFormat(state)).toBe('period');
  });

  it('selectLanguage returns language', () => {
    const state: UiPrefsState = { ...uiPrefsInitialState, language: 'ar' };
    expect(selectLanguage(state)).toBe('ar');
  });

  it('selectActiveTab returns activeTab', () => {
    const state: UiPrefsState = { ...uiPrefsInitialState, activeTab: 'custom' };
    expect(selectActiveTab(state)).toBe('custom');
  });

  it('selectDirectValue returns directValue', () => {
    const state: UiPrefsState = { ...uiPrefsInitialState, directValue: '2.71' };
    expect(selectDirectValue(state)).toBe('2.71');
  });

  it('selectDirectExponents returns directExponents', () => {
    const exps = { m: 1, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0 };
    const state: UiPrefsState = { ...uiPrefsInitialState, directExponents: exps };
    expect(selectDirectExponents(state)).toEqual(exps);
  });
});
