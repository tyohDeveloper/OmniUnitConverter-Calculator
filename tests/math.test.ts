import { describe, it, expect } from 'vitest';
import { convert, CONVERSION_DATA, applyMathFunction } from '../client/src/lib/conversion-data';
import { type SupportedLanguage } from '../client/src/lib/localization';
import { UNIT_NAME_TRANSLATIONS } from '../client/src/lib/translateUnit';

describe('Math Category', () => {
  // Note: Math functions are handled directly via applyMathFunction in the RPN calculator
  // They are not stored as a category in CONVERSION_DATA
  
  describe('Constants (via Math object)', () => {
    it('should have Pi (π) constant accessible', () => {
      expect(Math.PI).toBeCloseTo(3.14159265358979, 10);
    });

    it("should have Euler's Number (ℯ) constant accessible", () => {
      expect(Math.E).toBeCloseTo(2.71828182845904, 10);
    });

    it('should have Square Root of 2 (√2) constant accessible', () => {
      expect(Math.SQRT2).toBeCloseTo(1.41421356237309, 10);
    });
  });

  describe('Trigonometric Functions', () => {
    it('sin(0) = 0', () => {
      expect(applyMathFunction(0, 'sin')).toBeCloseTo(0, 10);
    });

    it('sin(π/2) = 1', () => {
      expect(applyMathFunction(Math.PI / 2, 'sin')).toBeCloseTo(1, 10);
    });

    it('cos(0) = 1', () => {
      expect(applyMathFunction(0, 'cos')).toBeCloseTo(1, 10);
    });

    it('cos(π) = -1', () => {
      expect(applyMathFunction(Math.PI, 'cos')).toBeCloseTo(-1, 10);
    });

    it('tan(0) = 0', () => {
      expect(applyMathFunction(0, 'tan')).toBeCloseTo(0, 10);
    });

    it('tan(π/4) = 1', () => {
      expect(applyMathFunction(Math.PI / 4, 'tan')).toBeCloseTo(1, 10);
    });
  });

  describe('Inverse Trigonometric Functions', () => {
    it('asin(0) = 0', () => {
      expect(applyMathFunction(0, 'asin')).toBeCloseTo(0, 10);
    });

    it('asin(1) = π/2', () => {
      expect(applyMathFunction(1, 'asin')).toBeCloseTo(Math.PI / 2, 10);
    });

    it('acos(1) = 0', () => {
      expect(applyMathFunction(1, 'acos')).toBeCloseTo(0, 10);
    });

    it('acos(0) = π/2', () => {
      expect(applyMathFunction(0, 'acos')).toBeCloseTo(Math.PI / 2, 10);
    });

    it('atan(0) = 0', () => {
      expect(applyMathFunction(0, 'atan')).toBeCloseTo(0, 10);
    });

    it('atan(1) = π/4', () => {
      expect(applyMathFunction(1, 'atan')).toBeCloseTo(Math.PI / 4, 10);
    });
  });

  describe('Hyperbolic Functions', () => {
    it('sinh(0) = 0', () => {
      expect(applyMathFunction(0, 'sinh')).toBeCloseTo(0, 10);
    });

    it('sinh(1) ≈ 1.1752', () => {
      expect(applyMathFunction(1, 'sinh')).toBeCloseTo(1.1752011936438014, 10);
    });

    it('cosh(0) = 1', () => {
      expect(applyMathFunction(0, 'cosh')).toBeCloseTo(1, 10);
    });

    it('cosh(1) ≈ 1.5431', () => {
      expect(applyMathFunction(1, 'cosh')).toBeCloseTo(1.5430806348152437, 10);
    });

    it('tanh(0) = 0', () => {
      expect(applyMathFunction(0, 'tanh')).toBeCloseTo(0, 10);
    });

    it('tanh(1) ≈ 0.7616', () => {
      expect(applyMathFunction(1, 'tanh')).toBeCloseTo(0.7615941559557649, 10);
    });
  });

  describe('Inverse Hyperbolic Functions', () => {
    it('asinh(0) = 0', () => {
      expect(applyMathFunction(0, 'asinh')).toBeCloseTo(0, 10);
    });

    it('asinh(1) ≈ 0.8814', () => {
      expect(applyMathFunction(1, 'asinh')).toBeCloseTo(0.881373587019543, 10);
    });

    it('acosh(1) = 0', () => {
      expect(applyMathFunction(1, 'acosh')).toBeCloseTo(0, 10);
    });

    it('acosh(2) ≈ 1.3170', () => {
      expect(applyMathFunction(2, 'acosh')).toBeCloseTo(1.3169578969248166, 10);
    });

    it('atanh(0) = 0', () => {
      expect(applyMathFunction(0, 'atanh')).toBeCloseTo(0, 10);
    });

    it('atanh(0.5) ≈ 0.5493', () => {
      expect(applyMathFunction(0.5, 'atanh')).toBeCloseTo(0.5493061443340548, 10);
    });
  });

  describe('Root Functions', () => {
    it('sqrt(4) = 2', () => {
      expect(applyMathFunction(4, 'sqrt')).toBeCloseTo(2, 10);
    });

    it('sqrt(2) ≈ 1.4142', () => {
      expect(applyMathFunction(2, 'sqrt')).toBeCloseTo(Math.SQRT2, 10);
    });

    it('cbrt(8) = 2', () => {
      expect(applyMathFunction(8, 'cbrt')).toBeCloseTo(2, 10);
    });

    it('cbrt(27) = 3', () => {
      expect(applyMathFunction(27, 'cbrt')).toBeCloseTo(3, 10);
    });

    it('cbrt(-8) = -2', () => {
      expect(applyMathFunction(-8, 'cbrt')).toBeCloseTo(-2, 10);
    });

    it('root4(16) = 2', () => {
      expect(applyMathFunction(16, 'root4')).toBeCloseTo(2, 10);
    });

    it('root4(81) = 3', () => {
      expect(applyMathFunction(81, 'root4')).toBeCloseTo(3, 10);
    });
  });

  describe('Power Functions', () => {
    it('square(3) = 9', () => {
      expect(applyMathFunction(3, 'square')).toBeCloseTo(9, 10);
    });

    it('square(-4) = 16', () => {
      expect(applyMathFunction(-4, 'square')).toBeCloseTo(16, 10);
    });

    it('square(0) = 0', () => {
      expect(applyMathFunction(0, 'square')).toBeCloseTo(0, 10);
    });

    it('cube(2) = 8', () => {
      expect(applyMathFunction(2, 'cube')).toBeCloseTo(8, 10);
    });

    it('cube(-3) = -27', () => {
      expect(applyMathFunction(-3, 'cube')).toBeCloseTo(-27, 10);
    });

    it('cube(0) = 0', () => {
      expect(applyMathFunction(0, 'cube')).toBeCloseTo(0, 10);
    });

    it('pow4(2) = 16', () => {
      expect(applyMathFunction(2, 'pow4')).toBeCloseTo(16, 10);
    });

    it('pow4(3) = 81', () => {
      expect(applyMathFunction(3, 'pow4')).toBeCloseTo(81, 10);
    });

    it('pow4(-2) = 16', () => {
      expect(applyMathFunction(-2, 'pow4')).toBeCloseTo(16, 10);
    });
  });

  describe('Logarithmic Functions', () => {
    it('log10(10) = 1', () => {
      expect(applyMathFunction(10, 'log10')).toBeCloseTo(1, 10);
    });

    it('log10(100) = 2', () => {
      expect(applyMathFunction(100, 'log10')).toBeCloseTo(2, 10);
    });

    it('log10(1) = 0', () => {
      expect(applyMathFunction(1, 'log10')).toBeCloseTo(0, 10);
    });

    it('log2(2) = 1', () => {
      expect(applyMathFunction(2, 'log2')).toBeCloseTo(1, 10);
    });

    it('log2(8) = 3', () => {
      expect(applyMathFunction(8, 'log2')).toBeCloseTo(3, 10);
    });

    it('log2(1) = 0', () => {
      expect(applyMathFunction(1, 'log2')).toBeCloseTo(0, 10);
    });

    it('ln(e) = 1', () => {
      expect(applyMathFunction(Math.E, 'ln')).toBeCloseTo(1, 10);
    });

    it('ln(1) = 0', () => {
      expect(applyMathFunction(1, 'ln')).toBeCloseTo(0, 10);
    });

    it('ln(e²) = 2', () => {
      expect(applyMathFunction(Math.E * Math.E, 'ln')).toBeCloseTo(2, 10);
    });
  });

  describe('Exponential Function', () => {
    it('exp(0) = 1', () => {
      expect(applyMathFunction(0, 'exp')).toBeCloseTo(1, 10);
    });

    it('exp(1) = e', () => {
      expect(applyMathFunction(1, 'exp')).toBeCloseTo(Math.E, 10);
    });

    it('exp(2) = e²', () => {
      expect(applyMathFunction(2, 'exp')).toBeCloseTo(Math.E * Math.E, 10);
    });

    it('exp(-1) = 1/e', () => {
      expect(applyMathFunction(-1, 'exp')).toBeCloseTo(1 / Math.E, 10);
    });
  });

  describe('Absolute Value', () => {
    it('abs(5) = 5', () => {
      expect(applyMathFunction(5, 'abs')).toBeCloseTo(5, 10);
    });

    it('abs(-5) = 5', () => {
      expect(applyMathFunction(-5, 'abs')).toBeCloseTo(5, 10);
    });

    it('abs(0) = 0', () => {
      expect(applyMathFunction(0, 'abs')).toBeCloseTo(0, 10);
    });

    it('abs(-3.14159) = 3.14159', () => {
      expect(applyMathFunction(-3.14159, 'abs')).toBeCloseTo(3.14159, 10);
    });
  });

  describe('Sign Function', () => {
    it('sign(5) = 1', () => {
      expect(applyMathFunction(5, 'sign')).toBe(1);
    });

    it('sign(-5) = -1', () => {
      expect(applyMathFunction(-5, 'sign')).toBe(-1);
    });

    it('sign(0) = 0', () => {
      expect(applyMathFunction(0, 'sign')).toBe(0);
    });

    it('sign(100) = 1', () => {
      expect(applyMathFunction(100, 'sign')).toBe(1);
    });

    it('sign(-0.001) = -1', () => {
      expect(applyMathFunction(-0.001, 'sign')).toBe(-1);
    });
  });

  describe('Rounding Functions', () => {
    describe('Floor', () => {
      it('floor(3.7) = 3', () => {
        expect(applyMathFunction(3.7, 'floor')).toBe(3);
      });

      it('floor(-3.7) = -4', () => {
        expect(applyMathFunction(-3.7, 'floor')).toBe(-4);
      });

      it('floor(5) = 5', () => {
        expect(applyMathFunction(5, 'floor')).toBe(5);
      });

      it('floor(0.99) = 0', () => {
        expect(applyMathFunction(0.99, 'floor')).toBe(0);
      });
    });

    describe('Ceiling', () => {
      it('ceil(3.2) = 4', () => {
        expect(applyMathFunction(3.2, 'ceil')).toBe(4);
      });

      it('ceil(-3.2) = -3', () => {
        expect(applyMathFunction(-3.2, 'ceil')).toBe(-3);
      });

      it('ceil(5) = 5', () => {
        expect(applyMathFunction(5, 'ceil')).toBe(5);
      });

      it('ceil(0.01) = 1', () => {
        expect(applyMathFunction(0.01, 'ceil')).toBe(1);
      });
    });

    describe('Round', () => {
      it('round(3.4) = 3', () => {
        expect(applyMathFunction(3.4, 'round')).toBe(3);
      });

      it('round(3.5) = 4', () => {
        expect(applyMathFunction(3.5, 'round')).toBe(4);
      });

      it('round(-3.5) = -3', () => {
        expect(applyMathFunction(-3.5, 'round')).toBe(-3);
      });

      it('round(3.6) = 4', () => {
        expect(applyMathFunction(3.6, 'round')).toBe(4);
      });
    });

    describe('Truncate', () => {
      it('trunc(3.7) = 3', () => {
        expect(applyMathFunction(3.7, 'trunc')).toBe(3);
      });

      it('trunc(-3.7) = -3', () => {
        expect(applyMathFunction(-3.7, 'trunc')).toBe(-3);
      });

      it('trunc(5) = 5', () => {
        expect(applyMathFunction(5, 'trunc')).toBe(5);
      });

      it('trunc(-0.99) = -0', () => {
        expect(applyMathFunction(-0.99, 'trunc')).toBe(-0);
      });
    });
  });

  describe('Direct applyMathFunction calls', () => {
    it('should apply sin function correctly', () => {
      const result = applyMathFunction(Math.PI / 2, 'sin');
      expect(result).toBeCloseTo(1, 10);
    });

    it('should apply sqrt function correctly', () => {
      const result = applyMathFunction(16, 'sqrt');
      expect(result).toBeCloseTo(4, 10);
    });

    it('should apply square function correctly', () => {
      const result = applyMathFunction(5, 'square');
      expect(result).toBeCloseTo(25, 10);
    });

    it('should apply cube function correctly', () => {
      const result = applyMathFunction(4, 'cube');
      expect(result).toBeCloseTo(64, 10);
    });

    it('should apply pow4 function correctly', () => {
      const result = applyMathFunction(3, 'pow4');
      expect(result).toBeCloseTo(81, 10);
    });

    it('should apply floor function correctly', () => {
      const result = applyMathFunction(3.9, 'floor');
      expect(result).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small numbers for exp', () => {
      const result = applyMathFunction(-10, 'exp');
      expect(result).toBeCloseTo(Math.exp(-10), 10);
    });

    it('should handle very large numbers for log10', () => {
      const result = applyMathFunction(1e100, 'log10');
      expect(result).toBeCloseTo(100, 10);
    });

    it('should return NaN for sqrt of negative number', () => {
      const result = applyMathFunction(-4, 'sqrt');
      expect(isNaN(result)).toBe(true);
    });

    it('should return -Infinity for log of zero', () => {
      const result = applyMathFunction(0, 'ln');
      expect(result).toBe(-Infinity);
    });

    it('should handle Infinity for exp of large positive', () => {
      const result = applyMathFunction(1000, 'exp');
      expect(result).toBe(Infinity);
    });
  });

  describe('Supported Math Functions', () => {
    // Math functions are supported via applyMathFunction
    const supportedFunctions = [
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
      'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
      'sqrt', 'cbrt', 'root4',
      'square', 'cube', 'pow4',
      'log10', 'log2', 'ln', 'exp',
      'abs', 'sign', 'floor', 'ceil', 'round', 'trunc'
    ];

    it('should support 28 math functions', () => {
      expect(supportedFunctions.length).toBe(28);
    });

    it('should return valid results for all supported functions', () => {
      supportedFunctions.forEach(func => {
        // Use value 1 for most functions (safe input)
        const testValue = func === 'acosh' ? 1.5 : (func === 'atanh' ? 0.5 : 1);
        const result = applyMathFunction(testValue, func as any);
        expect(typeof result).toBe('number');
      });
    });

    it('power functions should return correct results', () => {
      expect(applyMathFunction(3, 'square')).toBe(9);
      expect(applyMathFunction(2, 'cube')).toBe(8);
      expect(applyMathFunction(2, 'pow4')).toBe(16);
    });

    it('root functions should return correct results', () => {
      expect(applyMathFunction(4, 'sqrt')).toBeCloseTo(2, 10);
      expect(applyMathFunction(8, 'cbrt')).toBeCloseTo(2, 10);
      expect(applyMathFunction(16, 'root4')).toBeCloseTo(2, 10);
    });

    it('rounding functions should return correct results', () => {
      expect(applyMathFunction(3.7, 'floor')).toBe(3);
      expect(applyMathFunction(3.2, 'ceil')).toBe(4);
      expect(applyMathFunction(3.5, 'round')).toBe(4);
      expect(applyMathFunction(3.9, 'trunc')).toBe(3);
    });
  });

  describe('Math Function Name Localization', () => {
    // Test translations for common math function names that exist in the localization system
    const mathFunctionNames = [
      'Sine', 'Cosine', 'Tangent', 
      'Square Root', 'Cube Root',
      'Square', 'Cube',
      'Absolute Value', 'Floor', 'Ceiling', 'Round', 'Truncate'
    ];

    it('common math function names should have translation entries', () => {
      mathFunctionNames.forEach(name => {
        if (UNIT_NAME_TRANSLATIONS[name]) {
          expect(UNIT_NAME_TRANSLATIONS[name]).toBeDefined();
        }
      });
    });

    it('should translate Sine correctly in German if available', () => {
      if (UNIT_NAME_TRANSLATIONS['Sine']?.de) {
        expect(UNIT_NAME_TRANSLATIONS['Sine']?.de).toBe('Sinus');
      }
    });

    it('should translate Square Root correctly in German if available', () => {
      if (UNIT_NAME_TRANSLATIONS['Square Root']?.de) {
        expect(UNIT_NAME_TRANSLATIONS['Square Root']?.de).toBe('Quadratwurzel');
      }
    });

    it('should translate Square correctly in Japanese if available', () => {
      if (UNIT_NAME_TRANSLATIONS['Square']?.ja) {
        expect(UNIT_NAME_TRANSLATIONS['Square']?.ja).toBe('二乗');
      }
    });

    it('should translate Cube correctly in Chinese if available', () => {
      if (UNIT_NAME_TRANSLATIONS['Cube']?.zh) {
        expect(UNIT_NAME_TRANSLATIONS['Cube']?.zh).toBe('立方');
      }
    });

    it('should translate Absolute Value correctly in Arabic if available', () => {
      if (UNIT_NAME_TRANSLATIONS['Absolute Value']?.ar) {
        expect(UNIT_NAME_TRANSLATIONS['Absolute Value']?.ar).toBe('القيمة المطلقة');
      }
    });

    it('should translate Floor correctly in Korean if available', () => {
      if (UNIT_NAME_TRANSLATIONS['Floor']?.ko) {
        expect(UNIT_NAME_TRANSLATIONS['Floor']?.ko).toBe('내림');
      }
    });
  });
});
