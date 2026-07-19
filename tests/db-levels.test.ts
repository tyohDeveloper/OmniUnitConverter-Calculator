import { describe, it, expect } from 'vitest';
import { convert, CONVERSION_DATA, isNonLinearUnit, getComparisonUnits } from '../client/src/lib/conversion-data';
import { CONVERSION_FUNCTIONS } from '../client/src/lib/units/conversionFunctionRegistry';

const powerCat = CONVERSION_DATA.find(c => c.id === 'power')!;
const potentialCat = CONVERSION_DATA.find(c => c.id === 'potential')!;
const soundCat = CONVERSION_DATA.find(c => c.id === 'sound_pressure')!;

const DB_UNIT_IDS = ['dbuw', 'dbm', 'dbw', 'dbkw', 'dbuv', 'dbv', 'dbu', 'dbspl', 'dbupa'];

describe('Absolute dB level units', () => {
  describe('power levels (10·log10, W reference)', () => {
    it('0 dBm = 1 mW = 0.001 W', () => {
      expect(convert(0, 'dbm', 'w', 'power')).toBeCloseTo(0.001, 15);
    });

    it('30 dBm = 1 W = 0 dBW', () => {
      expect(convert(30, 'dbm', 'w', 'power')).toBeCloseTo(1, 12);
      expect(convert(30, 'dbm', 'dbw', 'power')).toBeCloseTo(0, 10);
    });

    it('0 dBW = 1 W; 0 dBkW = 1000 W; 0 dBµW = 1e-6 W', () => {
      expect(convert(0, 'dbw', 'w', 'power')).toBeCloseTo(1, 12);
      expect(convert(0, 'dbkw', 'w', 'power')).toBeCloseTo(1000, 9);
      expect(convert(0, 'dbuw', 'w', 'power')).toBeCloseTo(1e-6, 18);
    });

    it('dBm ↔ dBµW offset is 30 dB; dBW ↔ dBkW offset is 30 dB', () => {
      expect(convert(0, 'dbm', 'dbuw', 'power')).toBeCloseTo(30, 10);
      expect(convert(0, 'dbkw', 'dbw', 'power')).toBeCloseTo(30, 10);
    });

    it('10 W = 10 dBW = 40 dBm', () => {
      expect(convert(10, 'w', 'dbw', 'power')).toBeCloseTo(10, 10);
      expect(convert(10, 'w', 'dbm', 'power')).toBeCloseTo(40, 10);
    });
  });

  describe('voltage levels (20·log10, V reference)', () => {
    it('0 dBV = 1 V; 0 dBµV = 1 µV; 120 dBµV = 0 dBV', () => {
      expect(convert(0, 'dbv', 'v', 'potential')).toBeCloseTo(1, 12);
      expect(convert(0, 'dbuv', 'v', 'potential')).toBeCloseTo(1e-6, 18);
      expect(convert(120, 'dbuv', 'dbv', 'potential')).toBeCloseTo(0, 9);
    });

    it('0 dBu ≈ 0.774597 V (1 mW into 600 Ω)', () => {
      expect(convert(0, 'dbu', 'v', 'potential')).toBeCloseTo(Math.sqrt(0.6), 12);
    });

    it('10 V = 20 dBV', () => {
      expect(convert(10, 'v', 'dbv', 'potential')).toBeCloseTo(20, 10);
    });
  });

  describe('sound pressure levels (20·log10)', () => {
    it('0 dB SPL = 20 µPa; 94 dB SPL ≈ 1 Pa', () => {
      expect(convert(0, 'dbspl', 'pa', 'sound_pressure')).toBeCloseTo(20e-6, 15);
      expect(convert(94, 'dbspl', 'pa', 'sound_pressure')).toBeCloseTo(1.00237, 4);
    });

    it('dB SPL ↔ dB re 1 µPa offset is ~26 dB', () => {
      expect(convert(0, 'dbspl', 'dbupa', 'sound_pressure')).toBeCloseTo(20 * Math.log10(20), 9);
    });

    it('0 dBµPa = 1 µPa', () => {
      expect(convert(0, 'dbupa', 'pa', 'sound_pressure')).toBeCloseTo(1e-6, 15);
    });
  });

  describe('round-trips', () => {
    it('round-trips through the base unit for all dB units', () => {
      const cats = [
        ['power', ['dbuw', 'dbm', 'dbw', 'dbkw']],
        ['potential', ['dbuv', 'dbv', 'dbu']],
        ['sound_pressure', ['dbspl', 'dbupa']],
      ] as const;
      for (const [catId, ids] of cats) {
        const base = catId === 'power' ? 'w' : catId === 'potential' ? 'v' : 'pa';
        for (const id of ids) {
          for (const v of [-12.5, 0, 3, 47.25]) {
            const b = convert(v, id, base, catId);
            expect(convert(b, base, id, catId)).toBeCloseTo(v, 9);
          }
        }
      }
    });
  });

  describe('integration rules', () => {
    it('all dB units are non-linear and excluded from comparison mode', () => {
      const bases: Record<string, string> = { power: 'w', potential: 'v', sound_pressure: 'pa' };
      for (const cat of [powerCat, potentialCat, soundCat]) {
        const comparisonIds = getComparisonUnits(cat.id, bases[cat.id]).map(u => u.id);
        for (const unit of cat.units) {
          if (DB_UNIT_IDS.includes(unit.id)) {
            expect(isNonLinearUnit(unit), unit.id).toBe(true);
            expect(comparisonIds).not.toContain(unit.id);
          }
        }
      }
    });

    it('JSON factors match pair.toBase(1) for all dB units', () => {
      for (const cat of [powerCat, potentialCat, soundCat]) {
        for (const unit of cat.units) {
          if (!unit.conversionFunction || !DB_UNIT_IDS.includes(unit.id)) continue;
          const pair = CONVERSION_FUNCTIONS[unit.conversionFunction];
          expect(pair, unit.conversionFunction).toBeDefined();
          expect(unit.factor).toBeCloseTo(pair.toBase(1), 15);
        }
      }
    });
  });
});
