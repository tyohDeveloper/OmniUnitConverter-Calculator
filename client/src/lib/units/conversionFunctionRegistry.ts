/**
 * Registry of named conversion function pairs.
 *
 * A unit JSON may reference an entry by name via `conversionFunction`; the
 * convert pipeline then dispatches to `toBase`/`fromBase` instead of the
 * plain multiplicative factor. Functions are code-defined only — JSON stays
 * data-only and may reference them by name.
 *
 * One-way entries (`oneWay: true`, no `fromBase`) back the math category's
 * `mathFunction` units and may NOT be referenced via `conversionFunction`.
 * Entries with `linear: true` are safe for factor-based consumers
 * (comparison mode, smart paste, calculator); non-linear invertible pairs
 * are excluded from those consumers like math-function units.
 *
 * Paper-size semantics: within a series (ISO A, ISO B, JIS B) conversions
 * use SHEET-COUNT semantics — each size is exactly half the previous one
 * (2 A1 = 1 A0, 4 A2 = 1 A0), so ratios are exact powers of two. The series
 * anchor is size 0's millimetre area, whose dimensions seed the standard's
 * floor(previous/√2) halving rule ((w,h) → (floor(h/2), w)). Cross-series
 * and US conversions go through these mm-derived anchor areas in m².
 */
import { DB_LEVEL_PAIRS } from './dbLevelPairs';

export interface ConversionFunctionPair {
  toBase: (value: number) => number;
  fromBase?: (value: number) => number;
  oneWay?: boolean;
  linear?: boolean;
}

const MATH_ONE_WAY: Record<string, (v: number) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  asinh: Math.asinh, acosh: Math.acosh, atanh: Math.atanh,
  sqrt: Math.sqrt, cbrt: Math.cbrt, root4: v => Math.pow(v, 0.25),
  log10: Math.log10, log2: Math.log2, ln: Math.log,
  exp: Math.exp, abs: Math.abs, sign: Math.sign,
  floor: Math.floor, ceil: Math.ceil, round: Math.round, trunc: Math.trunc,
  square: v => v * v, cube: v => v * v * v, pow4: v => Math.pow(v, 4),
};

// Size-0 sheet dimensions in millimetres per series; count = number of sizes.
const PAPER_SERIES: Record<string, { widthMm: number; heightMm: number; count: number }> = {
  a: { widthMm: 841, heightMm: 1189, count: 11 },
  b: { widthMm: 1000, heightMm: 1414, count: 11 },
  jis_b: { widthMm: 1030, heightMm: 1456, count: 9 },
};

function makePaperPair(anchorAreaM2: number, index: number): ConversionFunctionPair {
  // Division by 2**index is exact in IEEE-754, so within-series ratios are
  // exact powers of two (sheet-count semantics).
  const area = anchorAreaM2 / 2 ** index;
  return { toBase: v => v * area, fromBase: v => v / area, linear: true };
}

// Logarithmic-scale pairs, POWER-RATIO convention: the base value is the
// plain dimensionless power ratio. 1 B = 10 dB, 1 Np = 2/ln10 B (power
// sense), 1 decade = 1 B, 1 stop (EV) = log10(2) B. Non-linear — these are
// excluded from factor-based consumers via isNonLinearUnit().
const LOG_SCALE_PAIRS: Record<string, ConversionFunctionPair> = {
  log_decibel: { toBase: v => 10 ** (v / 10), fromBase: v => 10 * Math.log10(v) },
  log_bel: { toBase: v => 10 ** v, fromBase: v => Math.log10(v) },
  log_neper: { toBase: v => Math.exp(2 * v), fromBase: v => Math.log(v) / 2 },
  log_stop: { toBase: v => 2 ** v, fromBase: v => Math.log2(v) },
  log_decade: { toBase: v => 10 ** v, fromBase: v => Math.log10(v) },
  // pH → hydrogen-ion molar concentration (mol/L): [H⁺] = 10^(−pH)
  ph_concentration: { toBase: v => 10 ** -v, fromBase: v => -Math.log10(v) },
  // L/100 km ↔ km/L (base): reciprocal, self-inverse (km/L = 100 / (L/100 km))
  fuel_l_per_100km: { toBase: v => 100 / v, fromBase: v => 100 / v },
};

function buildRegistry(): Record<string, ConversionFunctionPair> {
  const registry: Record<string, ConversionFunctionPair> = {};
  for (const [name, fn] of Object.entries(MATH_ONE_WAY)) {
    registry[name] = { toBase: fn, oneWay: true };
  }
  for (const [series, spec] of Object.entries(PAPER_SERIES)) {
    const anchorAreaM2 = (spec.widthMm * spec.heightMm) / 1e6;
    for (let n = 0; n < spec.count; n++) {
      registry[`paper_${series}${n}`] = makePaperPair(anchorAreaM2, n);
    }
  }
  Object.assign(registry, LOG_SCALE_PAIRS);
  Object.assign(registry, DB_LEVEL_PAIRS);
  return registry;
}

export const CONVERSION_FUNCTIONS: Record<string, ConversionFunctionPair> = buildRegistry();
