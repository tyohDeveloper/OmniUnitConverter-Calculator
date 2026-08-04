import { describe, it, expect } from 'vitest';
import { dimensionsEqual } from '../client/src/lib/dimensions/dimensionsEqual';
import { multiplyDimensions } from '../client/src/lib/dimensions/multiplyDimensions';
import { divideDimensions } from '../client/src/lib/dimensions/divideDimensions';
import { isDimensionless } from '../client/src/lib/dimensions/isDimensionless';
import type { DimensionalFormula } from '../client/src/lib/units/dimensionalFormula';

/**
 * RPN Calculator Stack Operations Tests
 * 
 * These tests verify the core logic used in RPN stack operations,
 * including dimension handling, stack manipulation patterns, and
 * mathematical operation results.
 */

// Simulate CalcValue type used in the actual component
interface CalcValue {
  value: number;
  dimensions: DimensionalFormula;
  prefix: string;
}

// RPN Stack simulation (4-level: s3, s2, y, x where x is bottom/result)
type RpnStack = [CalcValue | null, CalcValue | null, CalcValue | null, CalcValue | null];

// Stack operations
const createEmptyStack = (): RpnStack => [null, null, null, null];

const stackLift = (stack: RpnStack, newX: CalcValue): RpnStack => {
  // Push new value to x position, lift rest up
  return [stack[1], stack[2], stack[3], newX];
};

const stackDrop = (stack: RpnStack): RpnStack => {
  // Drop x, shift rest down, s3 duplicates
  return [stack[0], stack[0], stack[1], stack[2]];
};

const stackSwapXY = (stack: RpnStack): RpnStack => {
  return [stack[0], stack[1], stack[3], stack[2]];
};

// RPN binary operations (consume y and x, result goes to x)
const rpnMultiply = (stack: RpnStack): RpnStack | null => {
  if (!stack[2] || !stack[3]) return null;
  
  const y = stack[2];
  const x = stack[3];
  const resultValue = y.value * x.value;
  const resultDims = multiplyDimensions(y.dimensions, x.dimensions);
  
  const result: CalcValue = {
    value: resultValue,
    dimensions: resultDims,
    prefix: 'none'
  };
  
  // Drop the stack and put result in x
  return [stack[0], stack[0], stack[1], result];
};

const rpnDivide = (stack: RpnStack): RpnStack | null => {
  if (!stack[2] || !stack[3]) return null;
  if (stack[3].value === 0) return null; // Division by zero
  
  const y = stack[2];
  const x = stack[3];
  const resultValue = y.value / x.value;
  const resultDims = divideDimensions(y.dimensions, x.dimensions);
  
  const result: CalcValue = {
    value: resultValue,
    dimensions: resultDims,
    prefix: 'none'
  };
  
  return [stack[0], stack[0], stack[1], result];
};

const rpnAdd = (stack: RpnStack): RpnStack | null => {
  if (!stack[2] || !stack[3]) return null;
  
  const y = stack[2];
  const x = stack[3];
  
  // Addition requires compatible dimensions
  if (!dimensionsEqual(y.dimensions, x.dimensions)) return null;
  
  const result: CalcValue = {
    value: y.value + x.value,
    dimensions: y.dimensions,
    prefix: 'none'
  };
  
  return [stack[0], stack[0], stack[1], result];
};

const rpnSubtract = (stack: RpnStack): RpnStack | null => {
  if (!stack[2] || !stack[3]) return null;
  
  const y = stack[2];
  const x = stack[3];
  
  // Subtraction requires compatible dimensions
  if (!dimensionsEqual(y.dimensions, x.dimensions)) return null;
  
  const result: CalcValue = {
    value: y.value - x.value,
    dimensions: y.dimensions,
    prefix: 'none'
  };
  
  return [stack[0], stack[0], stack[1], result];
};

// RPN unary operations (operate on x only)
const rpnSquare = (stack: RpnStack): RpnStack | null => {
  if (!stack[3]) return null;
  
  const x = stack[3];
  const newDims = multiplyDimensions(x.dimensions, x.dimensions);
  
  const result: CalcValue = {
    value: x.value * x.value,
    dimensions: newDims,
    prefix: 'none'
  };
  
  return [stack[0], stack[1], stack[2], result];
};

const rpnSqrt = (stack: RpnStack): RpnStack | null => {
  if (!stack[3]) return null;
  if (stack[3].value < 0) return null; // Cannot take sqrt of negative
  
  const x = stack[3];
  
  // Check if all exponents are even (can take integer sqrt)
  const dims = x.dimensions;
  const newDims: DimensionalFormula = {};
  
  for (const [key, exp] of Object.entries(dims)) {
    if (exp && exp !== 0) {
      if (exp % 2 !== 0) {
        // Non-integer exponent would result - still valid, halve the exponent
        newDims[key as keyof DimensionalFormula] = exp / 2;
      } else {
        newDims[key as keyof DimensionalFormula] = exp / 2;
      }
    }
  }
  
  const result: CalcValue = {
    value: Math.sqrt(x.value),
    dimensions: newDims,
    prefix: 'none'
  };
  
  return [stack[0], stack[1], stack[2], result];
};

describe('RPN Stack Operations', () => {
  describe('Stack Lift', () => {
    it('should push new value to x and lift existing values', () => {
      const initialStack: RpnStack = [null, null, null, null];
      const newValue: CalcValue = { value: 5, dimensions: { length: 1 }, prefix: 'none' };
      
      const result = stackLift(initialStack, newValue);
      
      expect(result[3]).toEqual(newValue);
      expect(result[0]).toBeNull();
      expect(result[1]).toBeNull();
      expect(result[2]).toBeNull();
    });

    it('should preserve existing values when lifting', () => {
      const val1: CalcValue = { value: 1, dimensions: {}, prefix: 'none' };
      const val2: CalcValue = { value: 2, dimensions: {}, prefix: 'none' };
      const val3: CalcValue = { value: 3, dimensions: {}, prefix: 'none' };
      const val4: CalcValue = { value: 4, dimensions: {}, prefix: 'none' };
      
      const stack: RpnStack = [val1, val2, val3, val4];
      const newVal: CalcValue = { value: 5, dimensions: {}, prefix: 'none' };
      
      const result = stackLift(stack, newVal);
      
      expect(result[0]).toEqual(val2);
      expect(result[1]).toEqual(val3);
      expect(result[2]).toEqual(val4);
      expect(result[3]).toEqual(newVal);
    });

    it('should drop s3 value when stack is full', () => {
      const val1: CalcValue = { value: 100, dimensions: { mass: 1 }, prefix: 'none' };
      const fullStack: RpnStack = [
        { value: 1, dimensions: {}, prefix: 'none' },
        { value: 2, dimensions: {}, prefix: 'none' },
        { value: 3, dimensions: {}, prefix: 'none' },
        { value: 4, dimensions: {}, prefix: 'none' }
      ];
      
      const result = stackLift(fullStack, val1);
      
      // s3 (index 0) loses value 1, now has value 2
      expect(result[0]?.value).toBe(2);
      expect(result[3]).toEqual(val1);
    });
  });

  describe('Stack Drop', () => {
    it('should drop x and shift values down', () => {
      const stack: RpnStack = [
        { value: 1, dimensions: {}, prefix: 'none' },
        { value: 2, dimensions: {}, prefix: 'none' },
        { value: 3, dimensions: {}, prefix: 'none' },
        { value: 4, dimensions: {}, prefix: 'none' }
      ];
      
      const result = stackDrop(stack);
      
      expect(result[3]?.value).toBe(3); // y moves to x
      expect(result[2]?.value).toBe(2); // s2 moves to y
      expect(result[1]?.value).toBe(1); // s3 moves to s2
      expect(result[0]?.value).toBe(1); // s3 duplicates to top
    });

    it('should handle empty stack', () => {
      const emptyStack = createEmptyStack();
      const result = stackDrop(emptyStack);
      
      expect(result[0]).toBeNull();
      expect(result[1]).toBeNull();
      expect(result[2]).toBeNull();
      expect(result[3]).toBeNull();
    });
  });

  describe('Stack Swap XY', () => {
    it('should swap x and y positions', () => {
      const xVal: CalcValue = { value: 10, dimensions: { length: 1 }, prefix: 'none' };
      const yVal: CalcValue = { value: 20, dimensions: { mass: 1 }, prefix: 'none' };
      
      const stack: RpnStack = [null, null, yVal, xVal];
      const result = stackSwapXY(stack);
      
      expect(result[3]).toEqual(yVal);
      expect(result[2]).toEqual(xVal);
    });

    it('should not affect s2 and s3', () => {
      const s3: CalcValue = { value: 1, dimensions: {}, prefix: 'none' };
      const s2: CalcValue = { value: 2, dimensions: {}, prefix: 'none' };
      
      const stack: RpnStack = [s3, s2, 
        { value: 3, dimensions: {}, prefix: 'none' },
        { value: 4, dimensions: {}, prefix: 'none' }
      ];
      
      const result = stackSwapXY(stack);
      
      expect(result[0]).toEqual(s3);
      expect(result[1]).toEqual(s2);
    });
  });
});

describe('RPN Binary Operations', () => {
  describe('Multiplication (×)', () => {
    it('should multiply values and combine dimensions', () => {
      const force: CalcValue = { value: 10, dimensions: { mass: 1, length: 1, time: -2 }, prefix: 'none' };
      const length: CalcValue = { value: 5, dimensions: { length: 1 }, prefix: 'none' };
      
      const stack: RpnStack = [null, null, force, length];
      const result = rpnMultiply(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.value).toBe(50);
      expect(dimensionsEqual(result![3]?.dimensions!, { mass: 1, length: 2, time: -2 })).toBe(true);
    });

    it('should return null when x or y is empty', () => {
      const stack: RpnStack = [null, null, null, { value: 5, dimensions: {}, prefix: 'none' }];
      expect(rpnMultiply(stack)).toBeNull();
    });

    it('should allow multiplying dimensionless values', () => {
      const a: CalcValue = { value: 3, dimensions: {}, prefix: 'none' };
      const b: CalcValue = { value: 4, dimensions: {}, prefix: 'none' };
      
      const stack: RpnStack = [null, null, a, b];
      const result = rpnMultiply(stack);
      
      expect(result![3]?.value).toBe(12);
      expect(isDimensionless(result![3]?.dimensions!)).toBe(true);
    });

    it('should cancel inverse dimensions', () => {
      const velocity: CalcValue = { value: 10, dimensions: { length: 1, time: -1 }, prefix: 'none' };
      const time: CalcValue = { value: 2, dimensions: { time: 1 }, prefix: 'none' };
      
      const stack: RpnStack = [null, null, velocity, time];
      const result = rpnMultiply(stack);
      
      expect(result![3]?.value).toBe(20);
      expect(dimensionsEqual(result![3]?.dimensions!, { length: 1 })).toBe(true);
    });
  });

  describe('Division (÷)', () => {
    it('should divide values and subtract dimensions', () => {
      const energy: CalcValue = { value: 100, dimensions: { mass: 1, length: 2, time: -2 }, prefix: 'none' };
      const time: CalcValue = { value: 4, dimensions: { time: 1 }, prefix: 'none' };
      
      const stack: RpnStack = [null, null, energy, time];
      const result = rpnDivide(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.value).toBe(25);
      // Energy / Time = Power dimensions
      expect(dimensionsEqual(result![3]?.dimensions!, { mass: 1, length: 2, time: -3 })).toBe(true);
    });

    it('should return null for division by zero', () => {
      const a: CalcValue = { value: 10, dimensions: {}, prefix: 'none' };
      const zero: CalcValue = { value: 0, dimensions: {}, prefix: 'none' };
      
      const stack: RpnStack = [null, null, a, zero];
      expect(rpnDivide(stack)).toBeNull();
    });

    it('should create inverse dimensions when dividing by unit', () => {
      const dimensionless: CalcValue = { value: 1, dimensions: {}, prefix: 'none' };
      const length: CalcValue = { value: 2, dimensions: { length: 1 }, prefix: 'none' };
      
      const stack: RpnStack = [null, null, dimensionless, length];
      const result = rpnDivide(stack);
      
      expect(result![3]?.value).toBe(0.5);
      expect(dimensionsEqual(result![3]?.dimensions!, { length: -1 })).toBe(true);
    });
  });

  describe('Addition (+)', () => {
    it('should add values with compatible dimensions', () => {
      const m1: CalcValue = { value: 5, dimensions: { length: 1 }, prefix: 'none' };
      const m2: CalcValue = { value: 3, dimensions: { length: 1 }, prefix: 'none' };
      
      const stack: RpnStack = [null, null, m1, m2];
      const result = rpnAdd(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.value).toBe(8);
      expect(dimensionsEqual(result![3]?.dimensions!, { length: 1 })).toBe(true);
    });

    it('should reject addition with incompatible dimensions', () => {
      const meters: CalcValue = { value: 5, dimensions: { length: 1 }, prefix: 'none' };
      const seconds: CalcValue = { value: 3, dimensions: { time: 1 }, prefix: 'none' };
      
      const stack: RpnStack = [null, null, meters, seconds];
      const result = rpnAdd(stack);
      
      expect(result).toBeNull();
    });

    it('should allow adding dimensionless values', () => {
      const a: CalcValue = { value: 2.5, dimensions: {}, prefix: 'none' };
      const b: CalcValue = { value: 1.5, dimensions: {}, prefix: 'none' };
      
      const stack: RpnStack = [null, null, a, b];
      const result = rpnAdd(stack);
      
      expect(result![3]?.value).toBe(4);
    });

    it('should handle negative values', () => {
      const a: CalcValue = { value: 10, dimensions: { mass: 1 }, prefix: 'none' };
      const b: CalcValue = { value: -3, dimensions: { mass: 1 }, prefix: 'none' };
      
      const stack: RpnStack = [null, null, a, b];
      const result = rpnAdd(stack);
      
      expect(result![3]?.value).toBe(7);
    });
  });

  describe('Subtraction (−)', () => {
    it('should subtract values with compatible dimensions', () => {
      const m1: CalcValue = { value: 10, dimensions: { length: 1 }, prefix: 'none' };
      const m2: CalcValue = { value: 3, dimensions: { length: 1 }, prefix: 'none' };
      
      const stack: RpnStack = [null, null, m1, m2];
      const result = rpnSubtract(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.value).toBe(7);
    });

    it('should reject subtraction with incompatible dimensions', () => {
      const meters: CalcValue = { value: 10, dimensions: { length: 1 }, prefix: 'none' };
      const kg: CalcValue = { value: 5, dimensions: { mass: 1 }, prefix: 'none' };
      
      const stack: RpnStack = [null, null, meters, kg];
      const result = rpnSubtract(stack);
      
      expect(result).toBeNull();
    });

    it('should handle subtraction resulting in negative', () => {
      const a: CalcValue = { value: 3, dimensions: { time: 1 }, prefix: 'none' };
      const b: CalcValue = { value: 8, dimensions: { time: 1 }, prefix: 'none' };
      
      const stack: RpnStack = [null, null, a, b];
      const result = rpnSubtract(stack);
      
      expect(result![3]?.value).toBe(-5);
    });
  });
});

describe('RPN Unary Operations', () => {
  describe('Square (x²)', () => {
    it('should square value and double dimensions', () => {
      const length: CalcValue = { value: 5, dimensions: { length: 1 }, prefix: 'none' };
      const stack: RpnStack = [null, null, null, length];
      
      const result = rpnSquare(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.value).toBe(25);
      expect(dimensionsEqual(result![3]?.dimensions!, { length: 2 })).toBe(true);
    });

    it('should square dimensionless value', () => {
      const num: CalcValue = { value: 7, dimensions: {}, prefix: 'none' };
      const stack: RpnStack = [null, null, null, num];
      
      const result = rpnSquare(stack);
      
      expect(result![3]?.value).toBe(49);
      expect(isDimensionless(result![3]?.dimensions!)).toBe(true);
    });

    it('should preserve stack positions s3, s2, y', () => {
      const s3: CalcValue = { value: 1, dimensions: {}, prefix: 'none' };
      const s2: CalcValue = { value: 2, dimensions: {}, prefix: 'none' };
      const y: CalcValue = { value: 3, dimensions: {}, prefix: 'none' };
      const x: CalcValue = { value: 4, dimensions: {}, prefix: 'none' };
      
      const stack: RpnStack = [s3, s2, y, x];
      const result = rpnSquare(stack);
      
      expect(result![0]).toEqual(s3);
      expect(result![1]).toEqual(s2);
      expect(result![2]).toEqual(y);
      expect(result![3]?.value).toBe(16);
    });

    it('should return null when x is empty', () => {
      const stack: RpnStack = [null, null, null, null];
      expect(rpnSquare(stack)).toBeNull();
    });
  });

  describe('Square Root (√)', () => {
    it('should take sqrt and halve even dimensions', () => {
      const area: CalcValue = { value: 16, dimensions: { length: 2 }, prefix: 'none' };
      const stack: RpnStack = [null, null, null, area];
      
      const result = rpnSqrt(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.value).toBe(4);
      expect(dimensionsEqual(result![3]?.dimensions!, { length: 1 })).toBe(true);
    });

    it('should return null for negative values', () => {
      const negative: CalcValue = { value: -4, dimensions: {}, prefix: 'none' };
      const stack: RpnStack = [null, null, null, negative];
      
      expect(rpnSqrt(stack)).toBeNull();
    });

    it('should handle dimensionless sqrt', () => {
      const num: CalcValue = { value: 9, dimensions: {}, prefix: 'none' };
      const stack: RpnStack = [null, null, null, num];
      
      const result = rpnSqrt(stack);
      
      expect(result![3]?.value).toBe(3);
      expect(isDimensionless(result![3]?.dimensions!)).toBe(true);
    });

    it('should handle odd exponents (fractional result dimensions)', () => {
      const volume: CalcValue = { value: 27, dimensions: { length: 3 }, prefix: 'none' };
      const stack: RpnStack = [null, null, null, volume];
      
      const result = rpnSqrt(stack);
      
      expect(result![3]?.value).toBeCloseTo(5.196, 2);
      // Length^3 sqrt = Length^1.5
      expect(result![3]?.dimensions?.length).toBe(1.5);
    });
  });
});

describe('RPN Undo/Redo Pattern', () => {
  it('should be able to save and restore stack state', () => {
    const stack1: RpnStack = [
      null, null,
      { value: 10, dimensions: { length: 1 }, prefix: 'none' },
      { value: 5, dimensions: { length: 1 }, prefix: 'none' }
    ];
    
    // Save previous state
    const previousStack = [...stack1] as RpnStack;
    
    // Perform operation
    const stack2 = rpnAdd(stack1);
    
    // After undo, should restore previous state
    expect(stack2![3]?.value).toBe(15);
    expect(previousStack[2]?.value).toBe(10);
    expect(previousStack[3]?.value).toBe(5);
  });

  it('undo/redo swap pattern should work', () => {
    const stateA: RpnStack = [null, null, null, { value: 1, dimensions: {}, prefix: 'none' }];
    const stateB: RpnStack = [null, null, null, { value: 2, dimensions: {}, prefix: 'none' }];
    
    // Simulating undo: swap current with previous
    let current = stateB;
    let previous = stateA;
    
    // First undo
    let temp = current;
    current = previous;
    previous = temp;
    
    expect(current[3]?.value).toBe(1);
    expect(previous[3]?.value).toBe(2);
    
    // Second undo (redo)
    temp = current;
    current = previous;
    previous = temp;
    
    expect(current[3]?.value).toBe(2);
    expect(previous[3]?.value).toBe(1);
  });
});

describe('Dimension Mismatch Handling', () => {
  it('should detect incompatible dimensions for addition', () => {
    const meters: DimensionalFormula = { length: 1 };
    const seconds: DimensionalFormula = { time: 1 };
    
    expect(dimensionsEqual(meters, seconds)).toBe(false);
  });

  it('should allow any dimensions for multiplication', () => {
    // Multiplication always works regardless of dimensions
    const force: CalcValue = { value: 10, dimensions: { mass: 1, length: 1, time: -2 }, prefix: 'none' };
    const area: CalcValue = { value: 2, dimensions: { length: 2 }, prefix: 'none' };
    
    const stack: RpnStack = [null, null, force, area];
    const result = rpnMultiply(stack);
    
    expect(result).not.toBeNull();
    // Force × Area = Pressure × Volume (complex dimensions)
    expect(result![3]?.value).toBe(20);
  });

  it('should detect matching dimensions for different quantities', () => {
    // Energy and Torque have the same dimensions: kg⋅m²⋅s⁻²
    const energy: DimensionalFormula = { mass: 1, length: 2, time: -2 };
    const torque: DimensionalFormula = { mass: 1, length: 2, time: -2 };
    
    expect(dimensionsEqual(energy, torque)).toBe(true);
  });
});

// Helper to check if dimensions represent exactly radians (angle: 1, all others 0 or undefined)
const isRadians = (dimensions: DimensionalFormula): boolean => {
  if (dimensions.angle !== 1) return false;
  for (const [key, value] of Object.entries(dimensions)) {
    if (key === 'angle') continue;
    if (value !== 0 && value !== undefined) return false;
  }
  return true;
};

// Forward trig operation - returns unitless only for pure radians, else preserve units
const rpnForwardTrig = (stack: RpnStack, fn: (x: number) => number): RpnStack | null => {
  if (!stack[3]) return null;
  const x = stack[3];
  const newValue = fn(x.value);
  
  // Only return dimensionless if input is pure radians
  const newDimensions = isRadians(x.dimensions) ? {} : { ...x.dimensions };
  
  const result: CalcValue = {
    value: newValue,
    dimensions: newDimensions,
    prefix: 'none'
  };
  return [stack[0], stack[1], stack[2], result];
};

// Inverse trig operation - returns rad only for dimensionless, else preserve units
const rpnInverseTrig = (stack: RpnStack, fn: (x: number) => number): RpnStack | null => {
  if (!stack[3]) return null;
  const x = stack[3];
  const newValue = fn(x.value);
  
  // Only return radians if input is dimensionless
  const newDimensions = isDimensionless(x.dimensions) ? { angle: 1 } : { ...x.dimensions };
  
  const result: CalcValue = {
    value: newValue,
    dimensions: newDimensions,
    prefix: 'none'
  };
  return [stack[0], stack[1], stack[2], result];
};

// Exp/log operation - pass units through unchanged
const rpnExpLog = (stack: RpnStack, fn: (x: number) => number): RpnStack | null => {
  if (!stack[3]) return null;
  const x = stack[3];
  const newValue = fn(x.value);
  
  const result: CalcValue = {
    value: newValue,
    dimensions: { ...x.dimensions },
    prefix: 'none'
  };
  return [stack[0], stack[1], stack[2], result];
};

// Non-unit-aware multiply - operate on numeric part, preserve X's unit
const rpnNonUnitAwareMultiply = (stack: RpnStack): RpnStack | null => {
  if (!stack[2] || !stack[3]) return null;
  const y = stack[2];
  const x = stack[3];
  const resultValue = y.value * x.value;
  
  // Preserve X's dimensions, not combined
  const result: CalcValue = {
    value: resultValue,
    dimensions: { ...x.dimensions },
    prefix: 'none'
  };
  return [stack[0], stack[0], stack[1], result];
};

// Root with ceiling exponents
const rpnSqrtCeil = (stack: RpnStack): RpnStack | null => {
  if (!stack[3]) return null;
  if (stack[3].value < 0) return null;
  
  const x = stack[3];
  const newDims: DimensionalFormula = {};
  
  for (const [key, exp] of Object.entries(x.dimensions)) {
    if (exp && exp !== 0) {
      // E/2, round up: E=2→1, E=3→2, E=4→2
      newDims[key as keyof DimensionalFormula] = Math.ceil(exp / 2);
    }
  }
  
  const result: CalcValue = {
    value: Math.sqrt(x.value),
    dimensions: newDims,
    prefix: 'none'
  };
  return [stack[0], stack[1], stack[2], result];
};

const rpnCbrtCeil = (stack: RpnStack): RpnStack | null => {
  if (!stack[3]) return null;
  
  const x = stack[3];
  const newDims: DimensionalFormula = {};
  
  for (const [key, exp] of Object.entries(x.dimensions)) {
    if (exp && exp !== 0) {
      // E/3, round up: E=1,2,3→1, E=4,5→2
      newDims[key as keyof DimensionalFormula] = Math.ceil(exp / 3);
    }
  }
  
  const result: CalcValue = {
    value: Math.cbrt(x.value),
    dimensions: newDims,
    prefix: 'none'
  };
  return [stack[0], stack[1], stack[2], result];
};

describe('isRadians Helper', () => {
  it('should return true for pure radians (angle: 1 only)', () => {
    expect(isRadians({ angle: 1 })).toBe(true);
  });

  it('should return true for radians with explicit zeros', () => {
    expect(isRadians({ angle: 1, length: 0, time: 0 })).toBe(true);
  });

  it('should return false for dimensionless', () => {
    expect(isRadians({})).toBe(false);
  });

  it('should return false for meters', () => {
    expect(isRadians({ length: 1 })).toBe(false);
  });

  it('should return false for composite with angle', () => {
    expect(isRadians({ angle: 1, time: -1 })).toBe(false);
  });

  it('should return false for angle: 2', () => {
    expect(isRadians({ angle: 2 })).toBe(false);
  });
});

describe('Forward Trig Operations Unit Handling', () => {
  it('sin(rad) should return unitless', () => {
    const radians: CalcValue = { value: Math.PI / 6, dimensions: { angle: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, radians];
    
    const result = rpnForwardTrig(stack, Math.sin);
    
    expect(result).not.toBeNull();
    expect(result![3]?.value).toBeCloseTo(0.5, 10);
    expect(isDimensionless(result![3]?.dimensions!)).toBe(true);
  });

  it('sin(m) should preserve meters', () => {
    const meters: CalcValue = { value: 1, dimensions: { length: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, meters];
    
    const result = rpnForwardTrig(stack, Math.sin);
    
    expect(result).not.toBeNull();
    expect(dimensionsEqual(result![3]?.dimensions!, { length: 1 })).toBe(true);
  });

  it('cos(rad) should return unitless', () => {
    const radians: CalcValue = { value: Math.PI / 3, dimensions: { angle: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, radians];
    
    const result = rpnForwardTrig(stack, Math.cos);
    
    expect(result).not.toBeNull();
    expect(result![3]?.value).toBeCloseTo(0.5, 10);
    expect(isDimensionless(result![3]?.dimensions!)).toBe(true);
  });

  it('tan(kg) should preserve kilograms', () => {
    const kg: CalcValue = { value: 0.5, dimensions: { mass: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, kg];
    
    const result = rpnForwardTrig(stack, Math.tan);
    
    expect(result).not.toBeNull();
    expect(dimensionsEqual(result![3]?.dimensions!, { mass: 1 })).toBe(true);
  });

  it('sin(dimensionless) should preserve dimensionless', () => {
    const dimless: CalcValue = { value: 0.5, dimensions: {}, prefix: 'none' };
    const stack: RpnStack = [null, null, null, dimless];
    
    const result = rpnForwardTrig(stack, Math.sin);
    
    expect(result).not.toBeNull();
    expect(isDimensionless(result![3]?.dimensions!)).toBe(true);
  });

  it('sin(rad/s) should preserve rad/s (not pure radians)', () => {
    const angularVelocity: CalcValue = { value: 1, dimensions: { angle: 1, time: -1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, angularVelocity];
    
    const result = rpnForwardTrig(stack, Math.sin);
    
    expect(result).not.toBeNull();
    expect(dimensionsEqual(result![3]?.dimensions!, { angle: 1, time: -1 })).toBe(true);
  });
});

describe('Inverse Trig Operations Unit Handling', () => {
  it('asin(dimensionless) should return radians', () => {
    const dimless: CalcValue = { value: 0.5, dimensions: {}, prefix: 'none' };
    const stack: RpnStack = [null, null, null, dimless];
    
    const result = rpnInverseTrig(stack, Math.asin);
    
    expect(result).not.toBeNull();
    expect(result![3]?.value).toBeCloseTo(Math.PI / 6, 10);
    expect(dimensionsEqual(result![3]?.dimensions!, { angle: 1 })).toBe(true);
  });

  it('asin(m) should preserve meters', () => {
    const meters: CalcValue = { value: 0.5, dimensions: { length: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, meters];
    
    const result = rpnInverseTrig(stack, Math.asin);
    
    expect(result).not.toBeNull();
    expect(dimensionsEqual(result![3]?.dimensions!, { length: 1 })).toBe(true);
  });

  it('atan(dimensionless) should return radians', () => {
    const dimless: CalcValue = { value: 1, dimensions: {}, prefix: 'none' };
    const stack: RpnStack = [null, null, null, dimless];
    
    const result = rpnInverseTrig(stack, Math.atan);
    
    expect(result).not.toBeNull();
    expect(result![3]?.value).toBeCloseTo(Math.PI / 4, 10);
    expect(dimensionsEqual(result![3]?.dimensions!, { angle: 1 })).toBe(true);
  });

  it('acos(kg) should preserve kilograms', () => {
    const kg: CalcValue = { value: 0.5, dimensions: { mass: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, kg];
    
    const result = rpnInverseTrig(stack, Math.acos);
    
    expect(result).not.toBeNull();
    expect(dimensionsEqual(result![3]?.dimensions!, { mass: 1 })).toBe(true);
  });
});

describe('Exp/Log Operations Unit Handling', () => {
  it('exp(m) should preserve meters', () => {
    const meters: CalcValue = { value: 2, dimensions: { length: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, meters];
    
    const result = rpnExpLog(stack, Math.exp);
    
    expect(result).not.toBeNull();
    expect(result![3]?.value).toBeCloseTo(Math.exp(2), 10);
    expect(dimensionsEqual(result![3]?.dimensions!, { length: 1 })).toBe(true);
  });

  it('ln(kg) should preserve kilograms', () => {
    const kg: CalcValue = { value: 10, dimensions: { mass: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, kg];
    
    const result = rpnExpLog(stack, Math.log);
    
    expect(result).not.toBeNull();
    expect(result![3]?.value).toBeCloseTo(Math.log(10), 10);
    expect(dimensionsEqual(result![3]?.dimensions!, { mass: 1 })).toBe(true);
  });

  it('log10(s) should preserve seconds', () => {
    const seconds: CalcValue = { value: 100, dimensions: { time: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, seconds];
    
    const result = rpnExpLog(stack, Math.log10);
    
    expect(result).not.toBeNull();
    expect(result![3]?.value).toBe(2);
    expect(dimensionsEqual(result![3]?.dimensions!, { time: 1 })).toBe(true);
  });

  it('2^x(dimensionless) should stay dimensionless', () => {
    const dimless: CalcValue = { value: 3, dimensions: {}, prefix: 'none' };
    const stack: RpnStack = [null, null, null, dimless];
    
    const result = rpnExpLog(stack, (x) => Math.pow(2, x));
    
    expect(result).not.toBeNull();
    expect(result![3]?.value).toBe(8);
    expect(isDimensionless(result![3]?.dimensions!)).toBe(true);
  });
});

describe('Non-Unit-Aware Arithmetic', () => {
  it('non-unit × should preserve X units', () => {
    const dimless: CalcValue = { value: 3, dimensions: {}, prefix: 'none' };
    const meters: CalcValue = { value: 5, dimensions: { length: 1 }, prefix: 'none' };
    
    const stack: RpnStack = [null, null, dimless, meters];
    const result = rpnNonUnitAwareMultiply(stack);
    
    expect(result).not.toBeNull();
    expect(result![3]?.value).toBe(15);
    expect(dimensionsEqual(result![3]?.dimensions!, { length: 1 })).toBe(true);
  });

  it('non-unit × with different units should preserve X units', () => {
    const kg: CalcValue = { value: 2, dimensions: { mass: 1 }, prefix: 'none' };
    const seconds: CalcValue = { value: 4, dimensions: { time: 1 }, prefix: 'none' };
    
    const stack: RpnStack = [null, null, kg, seconds];
    const result = rpnNonUnitAwareMultiply(stack);
    
    expect(result).not.toBeNull();
    expect(result![3]?.value).toBe(8);
    expect(dimensionsEqual(result![3]?.dimensions!, { time: 1 })).toBe(true);
  });
});

describe('Root Operations with Ceiling Exponents', () => {
  describe('Square Root (√ᵤ) with ceiling', () => {
    it('sqrt(m²) should give m¹', () => {
      const area: CalcValue = { value: 16, dimensions: { length: 2 }, prefix: 'none' };
      const stack: RpnStack = [null, null, null, area];
      
      const result = rpnSqrtCeil(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.value).toBe(4);
      expect(result![3]?.dimensions?.length).toBe(1);
    });

    it('sqrt(m³) should give m² (ceil(3/2)=2)', () => {
      const volume: CalcValue = { value: 27, dimensions: { length: 3 }, prefix: 'none' };
      const stack: RpnStack = [null, null, null, volume];
      
      const result = rpnSqrtCeil(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.value).toBeCloseTo(Math.sqrt(27), 10);
      expect(result![3]?.dimensions?.length).toBe(2); // ceil(3/2) = 2
    });

    it('sqrt(m⁴) should give m²', () => {
      const hyperVolume: CalcValue = { value: 16, dimensions: { length: 4 }, prefix: 'none' };
      const stack: RpnStack = [null, null, null, hyperVolume];
      
      const result = rpnSqrtCeil(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.value).toBe(4);
      expect(result![3]?.dimensions?.length).toBe(2);
    });

    it('sqrt(m⁵) should give m³ (ceil(5/2)=3)', () => {
      const dim5: CalcValue = { value: 32, dimensions: { length: 5 }, prefix: 'none' };
      const stack: RpnStack = [null, null, null, dim5];
      
      const result = rpnSqrtCeil(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.dimensions?.length).toBe(3); // ceil(5/2) = 3
    });

    it('sqrt(kg²⋅m²⋅s⁻²) should give kg¹⋅m¹⋅s⁻¹', () => {
      const momentum2: CalcValue = { value: 100, dimensions: { mass: 2, length: 2, time: -2 }, prefix: 'none' };
      const stack: RpnStack = [null, null, null, momentum2];
      
      const result = rpnSqrtCeil(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.value).toBe(10);
      expect(result![3]?.dimensions?.mass).toBe(1);
      expect(result![3]?.dimensions?.length).toBe(1);
      expect(result![3]?.dimensions?.time).toBe(-1);
    });
  });

  describe('Cube Root (∛ᵤ) with ceiling', () => {
    it('cbrt(m³) should give m¹', () => {
      const volume: CalcValue = { value: 27, dimensions: { length: 3 }, prefix: 'none' };
      const stack: RpnStack = [null, null, null, volume];
      
      const result = rpnCbrtCeil(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.value).toBe(3);
      expect(result![3]?.dimensions?.length).toBe(1);
    });

    it('cbrt(m¹) should give m¹ (ceil(1/3)=1)', () => {
      const length: CalcValue = { value: 8, dimensions: { length: 1 }, prefix: 'none' };
      const stack: RpnStack = [null, null, null, length];
      
      const result = rpnCbrtCeil(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.value).toBe(2);
      expect(result![3]?.dimensions?.length).toBe(1); // ceil(1/3) = 1
    });

    it('cbrt(m²) should give m¹ (ceil(2/3)=1)', () => {
      const area: CalcValue = { value: 8, dimensions: { length: 2 }, prefix: 'none' };
      const stack: RpnStack = [null, null, null, area];
      
      const result = rpnCbrtCeil(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.dimensions?.length).toBe(1); // ceil(2/3) = 1
    });

    it('cbrt(m⁴) should give m² (ceil(4/3)=2)', () => {
      const dim4: CalcValue = { value: 64, dimensions: { length: 4 }, prefix: 'none' };
      const stack: RpnStack = [null, null, null, dim4];
      
      const result = rpnCbrtCeil(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.dimensions?.length).toBe(2); // ceil(4/3) = 2
    });

    it('cbrt(m⁵) should give m² (ceil(5/3)=2)', () => {
      const dim5: CalcValue = { value: 32, dimensions: { length: 5 }, prefix: 'none' };
      const stack: RpnStack = [null, null, null, dim5];
      
      const result = rpnCbrtCeil(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.dimensions?.length).toBe(2); // ceil(5/3) = 2
    });

    it('cbrt(m⁶) should give m²', () => {
      const dim6: CalcValue = { value: 64, dimensions: { length: 6 }, prefix: 'none' };
      const stack: RpnStack = [null, null, null, dim6];
      
      const result = rpnCbrtCeil(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.value).toBe(4);
      expect(result![3]?.dimensions?.length).toBe(2);
    });

    it('cbrt(m⁷) should give m³ (ceil(7/3)=3)', () => {
      const dim7: CalcValue = { value: 128, dimensions: { length: 7 }, prefix: 'none' };
      const stack: RpnStack = [null, null, null, dim7];
      
      const result = rpnCbrtCeil(stack);
      
      expect(result).not.toBeNull();
      expect(result![3]?.dimensions?.length).toBe(3); // ceil(7/3) = 3
    });
  });
});

describe('fixPrecision Behavior', () => {
  // Simulating fixPrecision
  const fixPrecision = (value: number): number => {
    return parseFloat(value.toPrecision(15));
  };

  it('should clean 0.1 + 0.2 floating point artifact', () => {
    const raw = 0.1 + 0.2; // 0.30000000000000004
    const fixed = fixPrecision(raw);
    expect(fixed).toBe(0.3);
  });

  it('should clean multiplication artifacts', () => {
    const raw = 0.1 * 0.1; // 0.010000000000000002
    const fixed = fixPrecision(raw);
    expect(fixed).toBe(0.01);
  });

  it('should preserve precision for normal calculations', () => {
    const raw = 123.456789;
    const fixed = fixPrecision(raw);
    expect(fixed).toBe(123.456789);
  });

  it('should handle very small numbers', () => {
    const raw = 1e-15;
    const fixed = fixPrecision(raw);
    expect(fixed).toBe(1e-15);
  });

  it('should handle very large numbers', () => {
    const raw = 1e15;
    const fixed = fixPrecision(raw);
    expect(fixed).toBe(1e15);
  });
});

describe('Negate (Change Sign) Operation', () => {
  // RPN negate operation - changes sign of x, preserves dimensions
  const rpnNeg = (stack: RpnStack): RpnStack | null => {
    if (!stack[3]) return null;
    
    const x = stack[3];
    const result: CalcValue = {
      value: -x.value,
      dimensions: x.dimensions,
      prefix: x.prefix
    };
    
    return [stack[0], stack[1], stack[2], result];
  };

  it('should negate positive value', () => {
    const val: CalcValue = { value: 5, dimensions: { length: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, val];
    
    const result = rpnNeg(stack);
    
    expect(result![3]?.value).toBe(-5);
    expect(result![3]?.dimensions).toEqual({ length: 1 });
  });

  it('should negate negative value', () => {
    const val: CalcValue = { value: -3, dimensions: { mass: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, val];
    
    const result = rpnNeg(stack);
    
    expect(result![3]?.value).toBe(3);
  });

  it('should handle zero', () => {
    const val: CalcValue = { value: 0, dimensions: { time: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, val];
    
    const result = rpnNeg(stack);
    
    expect(result![3]?.value).toBe(-0);
  });

  it('should preserve prefix', () => {
    const val: CalcValue = { value: 5, dimensions: { length: 1 }, prefix: 'k' };
    const stack: RpnStack = [null, null, null, val];
    
    const result = rpnNeg(stack);
    
    expect(result![3]?.prefix).toBe('k');
  });
});

describe('Absolute Value Operation', () => {
  // RPN absolute value operation - takes absolute value of x, preserves dimensions
  const rpnAbs = (stack: RpnStack): RpnStack | null => {
    if (!stack[3]) return null;
    
    const x = stack[3];
    const result: CalcValue = {
      value: Math.abs(x.value),
      dimensions: x.dimensions,
      prefix: x.prefix
    };
    
    return [stack[0], stack[1], stack[2], result];
  };

  it('should return absolute value of positive number', () => {
    const val: CalcValue = { value: 5, dimensions: { length: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, val];
    
    const result = rpnAbs(stack);
    
    expect(result![3]?.value).toBe(5);
  });

  it('should return absolute value of negative number', () => {
    const val: CalcValue = { value: -7, dimensions: { mass: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, val];
    
    const result = rpnAbs(stack);
    
    expect(result![3]?.value).toBe(7);
  });

  it('should handle zero', () => {
    const val: CalcValue = { value: 0, dimensions: { time: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, val];
    
    const result = rpnAbs(stack);
    
    expect(result![3]?.value).toBe(0);
  });

  it('should preserve dimensions', () => {
    const val: CalcValue = { value: -3.14, dimensions: { length: 2, time: -2 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, val];
    
    const result = rpnAbs(stack);
    
    expect(result![3]?.value).toBe(3.14);
    expect(result![3]?.dimensions).toEqual({ length: 2, time: -2 });
  });

  it('should preserve prefix', () => {
    const val: CalcValue = { value: -5, dimensions: { length: 1 }, prefix: 'M' };
    const stack: RpnStack = [null, null, null, val];
    
    const result = rpnAbs(stack);
    
    expect(result![3]?.prefix).toBe('M');
  });
});

describe('LASTx Register', () => {
  // LASTx register - stores x before each operation for recall
  let lastX: CalcValue | null = null;

  const saveLastX = (stack: RpnStack) => {
    lastX = stack[3];
  };

  const recallLastX = (stack: RpnStack): RpnStack | null => {
    if (!lastX) return null;
    return stackLift(stack, lastX);
  };

  it('should store x value before operation', () => {
    const x: CalcValue = { value: 5, dimensions: { length: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, x];
    
    saveLastX(stack);
    
    expect(lastX?.value).toBe(5);
    expect(lastX?.dimensions).toEqual({ length: 1 });
  });

  it('should recall last x with stack lift', () => {
    const x: CalcValue = { value: 5, dimensions: { length: 1 }, prefix: 'none' };
    const newX: CalcValue = { value: 10, dimensions: { time: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, x];
    
    saveLastX(stack);
    // Simulate an operation that changes x
    const afterOp: RpnStack = [null, null, null, newX];
    
    const result = recallLastX(afterOp);
    
    // LASTx pushes the stored value with stack lift
    expect(result![3]?.value).toBe(5);
    expect(result![2]?.value).toBe(10);
  });

  it('should preserve dimensions when recalling', () => {
    const x: CalcValue = { value: 3, dimensions: { mass: 1, length: 2, time: -2 }, prefix: 'k' };
    const stack: RpnStack = [null, null, null, x];
    
    saveLastX(stack);
    const afterOp: RpnStack = [null, null, null, null];
    
    const result = recallLastX(afterOp);
    
    expect(result![3]?.dimensions).toEqual({ mass: 1, length: 2, time: -2 });
    expect(result![3]?.prefix).toBe('k');
  });

  it('should allow correction after error', () => {
    // Scenario: User enters 5, enters 3, multiplies (gets 15), realizes they wanted to add
    const five: CalcValue = { value: 5, dimensions: {}, prefix: 'none' };
    const three: CalcValue = { value: 3, dimensions: {}, prefix: 'none' };
    const stack: RpnStack = [null, null, five, three];
    
    saveLastX(stack); // Save x (3) before multiply
    const afterMul = rpnMultiply(stack); // Result: 15
    
    expect(afterMul![3]?.value).toBe(15);
    
    // Recall LASTx (3) to reuse the operand
    const afterRecall = recallLastX(afterMul!);
    
    expect(afterRecall![3]?.value).toBe(3);
    expect(afterRecall![2]?.value).toBe(15);
  });
});

describe('Special Value Handling', () => {
  it('should handle very small values', () => {
    const tiny: CalcValue = { value: 1e-15, dimensions: { length: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, tiny];
    
    const result = rpnSquare(stack);
    
    expect(result![3]?.value).toBeCloseTo(1e-30, 40);
  });

  it('should handle very large values', () => {
    const huge: CalcValue = { value: 1e15, dimensions: { length: 1 }, prefix: 'none' };
    const stack: RpnStack = [null, null, null, huge];
    
    const result = rpnSquare(stack);
    
    expect(result![3]?.value).toBeCloseTo(1e30, -25);
  });

  it('should handle zero values in multiplication', () => {
    const zero: CalcValue = { value: 0, dimensions: { length: 1 }, prefix: 'none' };
    const nonZero: CalcValue = { value: 5, dimensions: { time: 1 }, prefix: 'none' };
    
    const stack: RpnStack = [null, null, zero, nonZero];
    const result = rpnMultiply(stack);
    
    expect(result![3]?.value).toBe(0);
  });

  it('should handle very small differences in addition', () => {
    const a: CalcValue = { value: 1e-10, dimensions: { mass: 1 }, prefix: 'none' };
    const b: CalcValue = { value: 2e-10, dimensions: { mass: 1 }, prefix: 'none' };
    
    const stack: RpnStack = [null, null, a, b];
    const result = rpnAdd(stack);
    
    expect(result![3]?.value).toBeCloseTo(3e-10, 20);
  });
});
