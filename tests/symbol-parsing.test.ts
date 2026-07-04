import { describe, it, expect } from 'vitest';
import {
  parseUnitText,
  buildUnitSymbolMap,
  CONVERSION_DATA,
  PREFIXES,
} from '../client/src/lib/conversion-data';

describe('Symbol Conflict Prevention', () => {
  describe('buildUnitSymbolMap critical uniqueness', () => {
    it('should not have conflicting symbols for time units vs radioactive decay', () => {
      const timeCategory = CONVERSION_DATA.find(c => c.id === 'time');
      const decayCategory = CONVERSION_DATA.find(c => c.id === 'radioactive_decay');
      
      const timeSymbols = new Set(timeCategory?.units.map(u => u.symbol) || []);
      const decaySymbols = new Set(decayCategory?.units.map(u => u.symbol) || []);
      
      const conflicts: string[] = [];
      timeSymbols.forEach(sym => {
        if (decaySymbols.has(sym)) {
          conflicts.push(`Symbol "${sym}" exists in both time and radioactive_decay`);
        }
      });
      
      expect(conflicts).toEqual([]);
    });

    it('should not have conflicting symbols for time units vs archaic volume', () => {
      const timeCategory = CONVERSION_DATA.find(c => c.id === 'time');
      const volumeCategory = CONVERSION_DATA.find(c => c.id === 'archaic_volume');
      
      const timeSymbols = new Set(timeCategory?.units.map(u => u.symbol) || []);
      const volumeSymbols = new Set(volumeCategory?.units.map(u => u.symbol) || []);
      
      const conflicts: string[] = [];
      timeSymbols.forEach(sym => {
        if (volumeSymbols.has(sym)) {
          conflicts.push(`Symbol "${sym}" exists in both time and archaic_volume`);
        }
      });
      
      expect(conflicts).toEqual([]);
    });

    it('should not have Poise symbol "P" conflicting with Peta prefix', () => {
      const viscosity = CONVERSION_DATA.find(c => c.id === 'viscosity');
      const poise = viscosity?.units.find(u => u.id === 'poise');
      
      expect(poise?.symbol).not.toBe('P');
      expect(poise?.symbol).toBe('Po');
    });

    it('buildUnitSymbolMap should have time symbols mapping to time category (not overwritten)', () => {
      const symbolMap = buildUnitSymbolMap();
      
      const criticalTimeSymbols = ['s', 'min', 'h', 'd'];
      for (const sym of criticalTimeSymbols) {
        const mapped = symbolMap.get(sym);
        expect(mapped?.categoryId).toBe('time');
      }
    });

    it('buildUnitSymbolMap should not have "P" as a unit symbol (would conflict with Peta)', () => {
      const symbolMap = buildUnitSymbolMap();
      const mapped = symbolMap.get('P');
      expect(mapped).toBeUndefined();
    });
  });

  describe('Critical symbol mappings', () => {
    const symbolMap = buildUnitSymbolMap();

    it('"s" should map to Second (time), not Half-life', () => {
      const result = symbolMap.get('s');
      expect(result).toBeDefined();
      expect(result?.categoryId).toBe('time');
      expect(result?.unitId).toBe('s');
    });

    it('"min" should map to Minute (time), not Minim (volume)', () => {
      const result = symbolMap.get('min');
      expect(result).toBeDefined();
      expect(result?.categoryId).toBe('time');
      expect(result?.unitId).toBe('min');
    });

    it('"h" should map to Hour (time)', () => {
      const result = symbolMap.get('h');
      expect(result).toBeDefined();
      expect(result?.categoryId).toBe('time');
      expect(result?.unitId).toBe('h');
    });

    it('"d" should map to Day (time)', () => {
      const result = symbolMap.get('d');
      expect(result).toBeDefined();
      expect(result?.categoryId).toBe('time');
      expect(result?.unitId).toBe('d');
    });

    it('Half-life units should use t½ prefix symbols', () => {
      const halfLifeS = symbolMap.get('t½(s)');
      const halfLifeMin = symbolMap.get('t½(min)');
      const halfLifeH = symbolMap.get('t½(h)');
      const halfLifeD = symbolMap.get('t½(d)');
      const halfLifeY = symbolMap.get('t½(y)');

      expect(halfLifeS?.categoryId).toBe('radioactive_decay');
      expect(halfLifeMin?.categoryId).toBe('radioactive_decay');
      expect(halfLifeH?.categoryId).toBe('radioactive_decay');
      expect(halfLifeD?.categoryId).toBe('radioactive_decay');
      expect(halfLifeY?.categoryId).toBe('radioactive_decay');
    });

    it('"Po" should map to Poise (viscosity), not conflict with P prefix', () => {
      const result = symbolMap.get('Po');
      expect(result).toBeDefined();
      expect(result?.categoryId).toBe('viscosity');
      expect(result?.unitId).toBe('poise');
    });

    it('"P" should NOT be in the unit symbol map (reserved for Peta prefix)', () => {
      const result = symbolMap.get('P');
      expect(result).toBeUndefined();
    });

    it('"minim" should map to Minim (archaic_volume)', () => {
      const result = symbolMap.get('minim');
      expect(result).toBeDefined();
      expect(result?.categoryId).toBe('archaic_volume');
      expect(result?.unitId).toBe('minim');
    });
  });
});

describe('parseUnitText', () => {
  describe('originalValue field', () => {
    it('should return originalValue equal to input number for simple units', () => {
      const result = parseUnitText('15 min');
      expect(result.originalValue).toBe(15);
      expect(result.categoryId).toBe('time');
      expect(result.unitId).toBe('min');
    });

    it('should return value converted to base unit', () => {
      const result = parseUnitText('15 min');
      expect(result.value).toBe(15 * 60);
    });

    it('originalValue should differ from value for non-base units', () => {
      const result = parseUnitText('2 h');
      expect(result.originalValue).toBe(2);
      expect(result.value).toBe(2 * 3600);
    });

    it('originalValue and value should be equal for base units (factor=1)', () => {
      const result = parseUnitText('5 s');
      expect(result.originalValue).toBe(5);
      expect(result.value).toBe(5);
    });

    it('should handle scientific notation in input', () => {
      const result = parseUnitText('1.5e3 m');
      expect(result.originalValue).toBe(1500);
      expect(result.categoryId).not.toBeNull();
    });

    it('should return originalValue=1 for empty input', () => {
      const result = parseUnitText('');
      expect(result.originalValue).toBe(1);
      expect(result.value).toBe(1);
    });

    it('should handle negative numbers correctly', () => {
      const result = parseUnitText('-5 m');
      expect(result.originalValue).toBe(-5);
      expect(result.value).toBe(-5);
      expect(result.categoryId).not.toBeNull();
    });

    it('should handle decimal numbers correctly', () => {
      const result = parseUnitText('3.14159 m');
      expect(result.originalValue).toBeCloseTo(3.14159);
      expect(result.categoryId).not.toBeNull();
    });

    it('should handle negative scientific notation', () => {
      const result = parseUnitText('-2.5e-3 m');
      expect(result.originalValue).toBeCloseTo(-0.0025);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle only whitespace input', () => {
      const result = parseUnitText('   ');
      expect(result.categoryId).toBeNull();
    });

    it('should handle unit without number (defaults to 1)', () => {
      const result = parseUnitText('m');
      expect(result.originalValue).toBe(1);
      expect(result.categoryId).not.toBeNull();
    });

    it('should handle number-only input (no unit)', () => {
      const result = parseUnitText('42');
      expect(result.originalValue).toBe(42);
      expect(result.categoryId).toBeNull();
    });

    it('should handle unknown unit symbols', () => {
      const result = parseUnitText('5 xyz');
      expect(result.originalValue).toBe(5);
      expect(result.categoryId).toBeNull();
    });

    it('should not parse standalone prefix as a unit', () => {
      const result = parseUnitText('P');
      expect(result.unitId).toBeNull();
    });
  });

  describe('Time unit parsing (symbol conflict regression)', () => {
    it('should parse "3 s" as 3 seconds in Time category', () => {
      const result = parseUnitText('3 s');
      expect(result.categoryId).toBe('time');
      expect(result.unitId).toBe('s');
      expect(result.originalValue).toBe(3);
      expect(result.value).toBe(3);
    });

    it('should parse "15 min" as 15 minutes in Time category', () => {
      const result = parseUnitText('15 min');
      expect(result.categoryId).toBe('time');
      expect(result.unitId).toBe('min');
      expect(result.originalValue).toBe(15);
      expect(result.value).toBe(900);
    });

    it('should parse "2 h" as 2 hours in Time category', () => {
      const result = parseUnitText('2 h');
      expect(result.categoryId).toBe('time');
      expect(result.unitId).toBe('h');
      expect(result.originalValue).toBe(2);
      expect(result.value).toBe(7200);
    });

    it('should parse "1 d" as 1 day in Time category', () => {
      const result = parseUnitText('1 d');
      expect(result.categoryId).toBe('time');
      expect(result.unitId).toBe('d');
      expect(result.originalValue).toBe(1);
      expect(result.value).toBe(86400);
    });
  });

  describe('Viscosity unit parsing (Poise symbol conflict)', () => {
    it('should parse "12 Po" as 12 Poise in Viscosity category', () => {
      const result = parseUnitText('12 Po');
      expect(result.categoryId).toBe('viscosity');
      expect(result.unitId).toBe('poise');
      expect(result.originalValue).toBe(12);
    });

    it('should parse "5 cP" as Centipoise in Viscosity category', () => {
      const result = parseUnitText('5 cP');
      expect(result.categoryId).toBe('viscosity');
      expect(result.unitId).toBe('cp');
      expect(result.originalValue).toBe(5);
    });
  });

  describe('Archaic volume unit parsing (Minim symbol conflict)', () => {
    it('should parse "10 minim" as Minim in Archaic Volume category', () => {
      const result = parseUnitText('10 minim');
      expect(result.categoryId).toBe('archaic_volume');
      expect(result.unitId).toBe('minim');
      expect(result.originalValue).toBe(10);
    });
  });

  describe('Prefix handling with units', () => {
    it('should parse "2.5 MHz" with Mega prefix for frequency', () => {
      const result = parseUnitText('2.5 MHz');
      expect(result.categoryId).toBe('frequency');
      expect(result.prefixId).toBe('mega');
      expect(result.originalValue).toBe(2.5);
    });

    it('should parse units with kilo prefix', () => {
      const result = parseUnitText('5 kN');
      expect(result.categoryId).toBe('force');
      expect(result.prefixId).toBe('kilo');
      expect(result.originalValue).toBe(5);
    });

    it('should parse "3 µs" with micro prefix for time', () => {
      const result = parseUnitText('3 µs');
      expect(result.categoryId).toBe('time');
      expect(result.prefixId).toBe('micro');
      expect(result.originalValue).toBe(3);
    });
  });

  describe('Dimensional formula parsing', () => {
    it('should parse "10 kg⋅m⁻³" as dimensional formula with mass and length', () => {
      const result = parseUnitText('10 kg⋅m⁻³');
      expect(result.originalValue).toBe(10);
      expect(result.dimensions).toHaveProperty('mass', 1);
      expect(result.dimensions).toHaveProperty('length', -3);
    });

    it('should parse "5 m⋅s⁻¹" as speed dimensions', () => {
      const result = parseUnitText('5 m⋅s⁻¹');
      expect(result.originalValue).toBe(5);
      expect(result.dimensions).toHaveProperty('length', 1);
      expect(result.dimensions).toHaveProperty('time', -1);
    });
  });

  describe('Angle parsing', () => {
    it('should parse "90°" as angle in radians', () => {
      const result = parseUnitText('90°');
      expect(result.categoryId).toBe('angle');
      expect(result.originalValue).toBe(90);
      expect(result.value).toBeCloseTo(Math.PI / 2, 10);
    });

    it('should parse "180 deg" as angle in radians', () => {
      const result = parseUnitText('180 deg');
      expect(result.categoryId).toBe('angle');
      expect(result.originalValue).toBe(180);
      expect(result.value).toBeCloseTo(Math.PI, 10);
    });
  });
});

describe('CONVERSION_DATA Symbol Verification', () => {
  describe('Radioactive Decay category', () => {
    const radioactiveDecay = CONVERSION_DATA.find(c => c.id === 'radioactive_decay');

    it('should have half-life units with t½ prefix symbols', () => {
      const halfLifeUnits = radioactiveDecay?.units.filter(u => u.id.startsWith('half_'));
      
      expect(halfLifeUnits).toBeDefined();
      expect(halfLifeUnits?.length).toBeGreaterThan(0);
      
      for (const unit of halfLifeUnits || []) {
        expect(unit.symbol).toMatch(/^t½\(/);
      }
    });

    it('should have half_s with symbol t½(s)', () => {
      const halfS = radioactiveDecay?.units.find(u => u.id === 'half_s');
      expect(halfS?.symbol).toBe('t½(s)');
    });

    it('should have half_min with symbol t½(min)', () => {
      const halfMin = radioactiveDecay?.units.find(u => u.id === 'half_min');
      expect(halfMin?.symbol).toBe('t½(min)');
    });
  });

  describe('Viscosity category', () => {
    const viscosity = CONVERSION_DATA.find(c => c.id === 'viscosity');

    it('should have Poise with symbol Po (not P)', () => {
      const poise = viscosity?.units.find(u => u.id === 'poise');
      expect(poise?.symbol).toBe('Po');
    });
  });

  describe('Archaic Volume category', () => {
    const archaicVolume = CONVERSION_DATA.find(c => c.id === 'archaic_volume');

    it('should have Minim with symbol minim (not min)', () => {
      const minim = archaicVolume?.units.find(u => u.id === 'minim');
      expect(minim?.symbol).toBe('minim');
    });
  });

  describe('Time category baseline', () => {
    const time = CONVERSION_DATA.find(c => c.id === 'time');

    it('should have Second with symbol s', () => {
      const second = time?.units.find(u => u.id === 's');
      expect(second?.symbol).toBe('s');
    });

    it('should have Minute with symbol min', () => {
      const minute = time?.units.find(u => u.id === 'min');
      expect(minute?.symbol).toBe('min');
    });

    it('should have Hour with symbol h', () => {
      const hour = time?.units.find(u => u.id === 'h');
      expect(hour?.symbol).toBe('h');
    });

    it('should have Day with symbol d', () => {
      const day = time?.units.find(u => u.id === 'd');
      expect(day?.symbol).toBe('d');
    });
  });
});

describe('Unitless ratio symbol disambiguation', () => {
  const symbolMap = buildUnitSymbolMap();

  it('"%" maps to unitless percent (not concentration)', () => {
    const result = symbolMap.get('%');
    expect(result?.categoryId).toBe('unitless');
    expect(result?.unitId).toBe('percent');
  });

  it('"ppm" maps to unitless (not concentration)', () => {
    const result = symbolMap.get('ppm');
    expect(result?.categoryId).toBe('unitless');
    expect(result?.unitId).toBe('ppm');
  });

  it('"ppb" maps to unitless (not concentration)', () => {
    expect(symbolMap.get('ppb')?.categoryId).toBe('unitless');
  });

  it('"ppt" maps to unitless (not concentration)', () => {
    expect(symbolMap.get('ppt')?.categoryId).toBe('unitless');
  });

  it('"‰" maps to unitless permille (not concentration)', () => {
    const result = symbolMap.get('‰');
    expect(result?.categoryId).toBe('unitless');
    expect(result?.unitId).toBe('permille');
  });

  it('parseUnitText routes "1 ppm" to unitless', () => {
    const result = parseUnitText('1 ppm');
    expect(result.categoryId).toBe('unitless');
    expect(result.unitId).toBe('ppm');
  });

  it('parseUnitText routes "5 %" to unitless', () => {
    const result = parseUnitText('5 %');
    expect(result.categoryId).toBe('unitless');
    expect(result.unitId).toBe('percent');
  });

  it('counting words like "doz" route to unitless', () => {
    const result = parseUnitText('12 doz');
    expect(result.categoryId).toBe('unitless');
    expect(result.unitId).toBe('dozen');
  });
});

describe('Time full-word aliases', () => {
  const cases: Array<[string, string]> = [
    ['1 decade', 'dec'],
    ['3 decades', 'dec'],
    ['1 century', 'cent'],
    ['2 centuries', 'cent'],
    ['1 millennium', 'kyr'],
    ['2 millennia', 'kyr'],
    ['2 millenniums', 'kyr'],
    ['1 eon', 'eon'],
    ['4 eons', 'eon'],
    ['1 aeon', 'eon'],
  ];

  for (const [input, unitId] of cases) {
    it(`routes "${input}" to time ${unitId}`, () => {
      const result = parseUnitText(input);
      expect(result.categoryId).toBe('time');
      expect(result.unitId).toBe(unitId);
    });
  }

  it('is case-insensitive ("2 Centuries")', () => {
    const result = parseUnitText('2 Centuries');
    expect(result.categoryId).toBe('time');
    expect(result.unitId).toBe('cent');
  });

  it('preserves canonical symbol parsing ("1 dec")', () => {
    const result = parseUnitText('1 dec');
    expect(result.categoryId).toBe('time');
    expect(result.unitId).toBe('dec');
  });
});
