import type { ConversionFunctionPair } from './conversionFunctionRegistry';

// Absolute decibel-referenced levels. Power quantities use 10·log10 with a
// fixed reference power in watts; field (amplitude) quantities — voltage and
// sound pressure — use 20·log10 with a reference in the category base unit.
// Non-linear like LOG_SCALE_PAIRS; excluded from factor-based consumers.
function makeDbPowerPair(refWatts: number): ConversionFunctionPair {
  return { toBase: v => refWatts * 10 ** (v / 10), fromBase: v => 10 * Math.log10(v / refWatts) };
}

function makeDbFieldPair(ref: number): ConversionFunctionPair {
  return { toBase: v => ref * 10 ** (v / 20), fromBase: v => 20 * Math.log10(v / ref) };
}

export const DB_LEVEL_PAIRS: Record<string, ConversionFunctionPair> = {
  db_microwatt: makeDbPowerPair(1e-6),
  db_milliwatt: makeDbPowerPair(1e-3),
  db_watt: makeDbPowerPair(1),
  db_kilowatt: makeDbPowerPair(1e3),
  db_microvolt: makeDbFieldPair(1e-6),
  db_volt: makeDbFieldPair(1),
  // dBu reference: sqrt(0.6) V ≈ 0.7746 V (1 mW into 600 Ω)
  db_unloaded: makeDbFieldPair(Math.sqrt(0.6)),
  // dB SPL reference: 20 µPa (threshold of human hearing in air)
  db_spl: makeDbFieldPair(20e-6),
  // dB re 1 µPa (underwater acoustics reference)
  db_micropascal: makeDbFieldPair(1e-6),
};
