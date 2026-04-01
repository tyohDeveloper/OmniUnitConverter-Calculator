import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useFlashFlag, useAllFlashFlags } from '../client/src/components/unit-converter/hooks/useFlashFlag';
import { useRpnStack } from '../client/src/components/unit-converter/hooks/useRpnStack';
import { useConverterState } from '../client/src/components/unit-converter/hooks/useConverterState';
import { useCalculatorState } from '../client/src/components/unit-converter/hooks/useCalculatorState';
import { ConverterProvider } from '../client/src/components/unit-converter/context/ConverterContext';
import type { CalcValue } from '../client/src/lib/units/shared-types';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(ConverterProvider, null, children);

describe('useFlashFlag', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with isFlashing = false', () => {
    const { result } = renderHook(() => useFlashFlag());
    const [isFlashing] = result.current;
    expect(isFlashing).toBe(false);
  });

  it('should set isFlashing to true when flash is called', () => {
    const { result } = renderHook(() => useFlashFlag());
    
    act(() => {
      result.current[1]();
    });
    
    expect(result.current[0]).toBe(true);
  });

  it('should reset isFlashing to false after default duration (300ms)', () => {
    const { result } = renderHook(() => useFlashFlag());
    
    act(() => {
      result.current[1]();
    });
    
    expect(result.current[0]).toBe(true);
    
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(result.current[0]).toBe(false);
  });

  it('should respect custom duration', () => {
    const { result } = renderHook(() => useFlashFlag(500));
    
    act(() => {
      result.current[1]();
    });
    
    expect(result.current[0]).toBe(true);
    
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(result.current[0]).toBe(true);
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    expect(result.current[0]).toBe(false);
  });

  it('should reset timer when flash is called while already flashing', () => {
    const { result } = renderHook(() => useFlashFlag(300));
    
    act(() => {
      result.current[1]();
    });
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    expect(result.current[0]).toBe(true);
    
    act(() => {
      result.current[1]();
    });
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    expect(result.current[0]).toBe(true);
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current[0]).toBe(false);
  });

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { result, unmount } = renderHook(() => useFlashFlag());
    
    act(() => {
      result.current[1]();
    });
    
    unmount();
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});

describe('useAllFlashFlags', () => {
  it('should return all expected flash flag keys', () => {
    const { result } = renderHook(() => useAllFlashFlags());
    
    const expectedKeys = [
      'copyResult', 'copyCalc', 'calcField1', 'calcField2', 'calcField3',
      'fromBaseFactor', 'fromSIBase', 'toBaseFactor', 'toSIBase',
      'conversionRatio', 'rpnField1', 'rpnField2', 'rpnField3',
      'rpnResult', 'directCopy'
    ];
    
    expectedKeys.forEach(key => {
      expect(result.current).toHaveProperty(key);
      expect(Array.isArray(result.current[key as keyof typeof result.current])).toBe(true);
      expect(result.current[key as keyof typeof result.current]).toHaveLength(2);
    });
  });

  it('should have independent flash states for each flag', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useAllFlashFlags());
    
    act(() => {
      result.current.copyResult[1]();
    });
    
    expect(result.current.copyResult[0]).toBe(true);
    expect(result.current.copyCalc[0]).toBe(false);
    expect(result.current.rpnResult[0]).toBe(false);
    
    vi.useRealTimers();
  });
});

describe('useRpnStack (wiring tests)', () => {
  const createTestValue = (value: number, dims: Record<string, number> = {}): CalcValue => ({
    value,
    dimensions: dims,
    prefix: 'none'
  });

  describe('initial state wiring', () => {
    it('should expose initial empty stack from context', () => {
      const { result } = renderHook(() => useRpnStack(), { wrapper });
      expect(result.current.rpnStack).toEqual([null, null, null, null]);
    });

    it('should expose null lastX from context', () => {
      const { result } = renderHook(() => useRpnStack(), { wrapper });
      expect(result.current.lastX).toBeNull();
    });

    it('should expose default prefix "none" from context', () => {
      const { result } = renderHook(() => useRpnStack(), { wrapper });
      expect(result.current.rpnResultPrefix).toBe('none');
    });

    it('should expose rpnXEditing = false from context', () => {
      const { result } = renderHook(() => useRpnStack(), { wrapper });
      expect(result.current.rpnXEditing).toBe(false);
    });
  });

  describe('push/pop wiring via context dispatch', () => {
    it('should dispatch pushValue and reflect in context state', () => {
      const { result } = renderHook(() => useRpnStack(), { wrapper });
      const v = createTestValue(42);
      
      act(() => { result.current.pushValue(v); });
      
      expect(result.current.rpnStack[0]).toEqual(v);
    });

    it('should dispatch dropValue and shift stack down', () => {
      const { result } = renderHook(() => useRpnStack(), { wrapper });
      const v1 = createTestValue(1);
      const v2 = createTestValue(2);
      
      act(() => {
        result.current.pushValue(v1);
        result.current.pushValue(v2);
      });
      act(() => { result.current.dropValue(); });
      
      expect(result.current.rpnStack[0]).toEqual(v1);
    });

    it('should dispatch swapXY and reflect swap in context state', () => {
      const { result } = renderHook(() => useRpnStack(), { wrapper });
      const v1 = createTestValue(1);
      const v2 = createTestValue(2);
      
      act(() => {
        result.current.pushValue(v1);
        result.current.pushValue(v2);
      });
      act(() => { result.current.swapXY(); });
      
      expect(result.current.rpnStack[0]).toEqual(v1);
      expect(result.current.rpnStack[1]).toEqual(v2);
    });

    it('should dispatch clearStack and reset context state', () => {
      const { result } = renderHook(() => useRpnStack(), { wrapper });
      
      act(() => { result.current.pushValue(createTestValue(1)); });
      act(() => { result.current.clearStack(); });
      
      expect(result.current.rpnStack).toEqual([null, null, null, null]);
    });

    it('should dispatch undoStack and restore previous state', () => {
      const { result } = renderHook(() => useRpnStack(), { wrapper });
      const v1 = createTestValue(1);
      
      act(() => { result.current.pushValue(v1); });
      const stackAfterPush = [...result.current.rpnStack];
      act(() => { result.current.pushValue(createTestValue(2)); });
      act(() => { result.current.undoStack(); });
      
      expect(result.current.rpnStack).toEqual(stackAfterPush);
    });

    it('should dispatch recallLastX and push lastX onto stack', () => {
      const { result } = renderHook(() => useRpnStack(), { wrapper });
      const lastXValue = createTestValue(99);
      
      act(() => { result.current.setLastX(lastXValue); });
      act(() => { result.current.recallLastX(); });
      
      expect(result.current.rpnStack[0]).toEqual(lastXValue);
    });

    it('recallLastX is a no-op when lastX is null', () => {
      const { result } = renderHook(() => useRpnStack(), { wrapper });
      
      act(() => { result.current.recallLastX(); });
      
      expect(result.current.rpnStack).toEqual([null, null, null, null]);
    });

    it('should dispatch saveAndUpdateStack and save previous', () => {
      const { result } = renderHook(() => useRpnStack(), { wrapper });
      const v = createTestValue(1);
      
      act(() => { result.current.pushValue(v); });
      const currentStack = [...result.current.rpnStack];
      act(() => { result.current.saveAndUpdateStack(() => [null, null, null, null]); });
      
      expect(result.current.previousRpnStack).toEqual(currentStack);
    });
  });

  describe('setter wiring', () => {
    it('should dispatch setRpnResultPrefix', () => {
      const { result } = renderHook(() => useRpnStack(), { wrapper });
      act(() => { result.current.setRpnResultPrefix('k'); });
      expect(result.current.rpnResultPrefix).toBe('k');
    });

    it('should dispatch setRpnSelectedAlternative', () => {
      const { result } = renderHook(() => useRpnStack(), { wrapper });
      act(() => { result.current.setRpnSelectedAlternative(2); });
      expect(result.current.rpnSelectedAlternative).toBe(2);
    });

    it('should dispatch setRpnXEditing', () => {
      const { result } = renderHook(() => useRpnStack(), { wrapper });
      act(() => { result.current.setRpnXEditing(true); });
      expect(result.current.rpnXEditing).toBe(true);
    });

    it('should dispatch setRpnXEditValue', () => {
      const { result } = renderHook(() => useRpnStack(), { wrapper });
      act(() => { result.current.setRpnXEditValue('3.14'); });
      expect(result.current.rpnXEditValue).toBe('3.14');
    });

    it('should dispatch setLastX', () => {
      const { result } = renderHook(() => useRpnStack(), { wrapper });
      const v = createTestValue(7);
      act(() => { result.current.setLastX(v); });
      expect(result.current.lastX).toEqual(v);
    });
  });
});

describe('useConverterState (wiring tests)', () => {
  describe('initial state wiring', () => {
    it('should expose activeCategory = "length" from context', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      expect(result.current.activeCategory).toBe('length');
    });

    it('should expose fromUnit = "" from context', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      expect(result.current.fromUnit).toBe('');
    });

    it('should expose fromPrefix = "none" from context', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      expect(result.current.fromPrefix).toBe('none');
    });

    it('should expose inputValue = "1" from context', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      expect(result.current.inputValue).toBe('1');
    });

    it('should expose result = null from context', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      expect(result.current.result).toBeNull();
    });

    it('should expose precision = 4 from context', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      expect(result.current.precision).toBe(4);
    });

    it('should expose comparisonMode = false from context', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      expect(result.current.comparisonMode).toBe(false);
    });

    it('should expose an inputRef from context', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      expect(result.current.inputRef).toBeDefined();
      expect(result.current.inputRef).toHaveProperty('current');
    });
  });

  describe('dispatch wiring', () => {
    it('setActiveCategory dispatches and updates context state', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      act(() => { result.current.setActiveCategory('mass'); });
      expect(result.current.activeCategory).toBe('mass');
    });

    it('setFromUnit dispatches and updates context state', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      act(() => { result.current.setFromUnit('meter'); });
      expect(result.current.fromUnit).toBe('meter');
    });

    it('setToUnit dispatches and updates context state', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      act(() => { result.current.setToUnit('foot'); });
      expect(result.current.toUnit).toBe('foot');
    });

    it('setFromPrefix dispatches and updates context state', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      act(() => { result.current.setFromPrefix('k'); });
      expect(result.current.fromPrefix).toBe('k');
    });

    it('setToPrefix dispatches and updates context state', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      act(() => { result.current.setToPrefix('m'); });
      expect(result.current.toPrefix).toBe('m');
    });

    it('setInputValue dispatches and updates context state', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      act(() => { result.current.setInputValue('42'); });
      expect(result.current.inputValue).toBe('42');
    });

    it('setResult dispatches and updates context state', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      act(() => { result.current.setResult(3.14159); });
      expect(result.current.result).toBe(3.14159);
    });

    it('setResult can be reset to null', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      act(() => { result.current.setResult(100); });
      act(() => { result.current.setResult(null); });
      expect(result.current.result).toBeNull();
    });

    it('setPrecision dispatches and updates context state', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      act(() => { result.current.setPrecision(8); });
      expect(result.current.precision).toBe(8);
    });

    it('setComparisonMode dispatches and updates context state', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      act(() => { result.current.setComparisonMode(true); });
      expect(result.current.comparisonMode).toBe(true);
      act(() => { result.current.setComparisonMode(false); });
      expect(result.current.comparisonMode).toBe(false);
    });

    it('multiple state changes dispatch correctly to context', () => {
      const { result } = renderHook(() => useConverterState(), { wrapper });
      act(() => {
        result.current.setActiveCategory('temperature');
        result.current.setFromUnit('celsius');
        result.current.setToUnit('fahrenheit');
        result.current.setInputValue('100');
        result.current.setResult(212);
        result.current.setPrecision(2);
      });
      expect(result.current.activeCategory).toBe('temperature');
      expect(result.current.fromUnit).toBe('celsius');
      expect(result.current.toUnit).toBe('fahrenheit');
      expect(result.current.inputValue).toBe('100');
      expect(result.current.result).toBe(212);
      expect(result.current.precision).toBe(2);
    });
  });
});

describe('useCalculatorState (wiring tests)', () => {
  describe('initial state wiring', () => {
    it('should expose calculatorMode = "rpn" from context', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      expect(result.current.calculatorMode).toBe('rpn');
    });

    it('should expose shiftActive = false from context', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      expect(result.current.shiftActive).toBe(false);
    });

    it('should expose calculatorPrecision = 4 from context', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      expect(result.current.calculatorPrecision).toBe(4);
    });

    it('should expose calcValues = [null,null,null,null] from context', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      expect(result.current.calcValues).toEqual([null, null, null, null]);
    });

    it('should expose calcOp1 = null from context', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      expect(result.current.calcOp1).toBeNull();
    });

    it('should expose resultPrefix = "none" from context', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      expect(result.current.resultPrefix).toBe('none');
    });

    it('should expose selectedAlternative = 0 from context', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      expect(result.current.selectedAlternative).toBe(0);
    });
  });

  describe('dispatch wiring', () => {
    it('setCalculatorMode dispatches and updates context', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      act(() => { result.current.setCalculatorMode('simple'); });
      expect(result.current.calculatorMode).toBe('simple');
    });

    it('setShiftActive dispatches and updates context', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      act(() => { result.current.setShiftActive(true); });
      expect(result.current.shiftActive).toBe(true);
    });

    it('setCalculatorPrecision dispatches and updates context', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      act(() => { result.current.setCalculatorPrecision(6); });
      expect(result.current.calculatorPrecision).toBe(6);
    });

    it('setCalcOp1 dispatches and updates context', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      act(() => { result.current.setCalcOp1('+'); });
      expect(result.current.calcOp1).toBe('+');
    });

    it('setCalcOp2 dispatches and updates context', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      act(() => { result.current.setCalcOp2('-'); });
      expect(result.current.calcOp2).toBe('-');
    });

    it('setResultUnit dispatches and updates context', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      act(() => { result.current.setResultUnit('meter'); });
      expect(result.current.resultUnit).toBe('meter');
    });

    it('setResultCategory dispatches and updates context', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      act(() => { result.current.setResultCategory('length'); });
      expect(result.current.resultCategory).toBe('length');
    });

    it('setResultPrefix dispatches and updates context', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      act(() => { result.current.setResultPrefix('k'); });
      expect(result.current.resultPrefix).toBe('k');
    });

    it('setSelectedAlternative dispatches and updates context', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      act(() => { result.current.setSelectedAlternative(2); });
      expect(result.current.selectedAlternative).toBe(2);
    });

    it('setCalcValues dispatches and updates context', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      const newValues: Array<CalcValue | null> = [
        { value: 10, dimensions: {}, prefix: 'none' },
        { value: 20, dimensions: {}, prefix: 'none' },
        null,
        null,
      ];
      act(() => { result.current.setCalcValues(newValues); });
      expect(result.current.calcValues).toEqual(newValues);
    });

    it('setCalcValues supports functional updater pattern', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      const v1: CalcValue = { value: 5, dimensions: {}, prefix: 'none' };
      act(() => {
        result.current.setCalcValues([v1, null, null, null]);
      });
      act(() => {
        result.current.setCalcValues(prev => {
          const next = [...prev];
          next[1] = { value: 10, dimensions: {}, prefix: 'none' };
          return next;
        });
      });
      expect(result.current.calcValues[0]).toEqual(v1);
      expect(result.current.calcValues[1]?.value).toBe(10);
    });

    it('full state reset via dispatch', () => {
      const { result } = renderHook(() => useCalculatorState(), { wrapper });
      act(() => {
        result.current.setCalculatorMode('simple');
        result.current.setShiftActive(true);
        result.current.setCalculatorPrecision(8);
        result.current.setCalcOp1('+');
        result.current.setCalcOp2('-');
        result.current.setResultUnit('second');
        result.current.setResultCategory('time');
        result.current.setResultPrefix('m');
        result.current.setSelectedAlternative(3);
      });
      act(() => {
        result.current.setCalculatorMode('rpn');
        result.current.setShiftActive(false);
        result.current.setCalculatorPrecision(4);
        result.current.setCalcOp1(null);
        result.current.setCalcOp2(null);
        result.current.setCalcValues([null, null, null, null]);
        result.current.setResultUnit(null);
        result.current.setResultCategory(null);
        result.current.setResultPrefix('none');
        result.current.setSelectedAlternative(0);
      });
      expect(result.current.calculatorMode).toBe('rpn');
      expect(result.current.shiftActive).toBe(false);
      expect(result.current.calculatorPrecision).toBe(4);
      expect(result.current.calcOp1).toBeNull();
      expect(result.current.calcOp2).toBeNull();
      expect(result.current.calcValues).toEqual([null, null, null, null]);
      expect(result.current.resultUnit).toBeNull();
      expect(result.current.resultCategory).toBeNull();
      expect(result.current.resultPrefix).toBe('none');
      expect(result.current.selectedAlternative).toBe(0);
    });
  });
});
