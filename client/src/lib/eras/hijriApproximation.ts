// Islamic lunar Hijri approximation (task-level, ±1 year; drifts over
// centuries because the lunar year is ~11 days shorter):
//   AH ≈ (CE − 622) × 1.030690, inverse CE ≈ AH / 1.030690 + 622.
// The astronomical CE year is used as the hub (year 0 = 1 BCE).
const HIJRI_FACTOR = 1.030690;
const HIJRI_EPOCH_CE = 622;

export const hijriApproximation = {
  fromAstronomical: (astro: number): number =>
    Math.round((astro - HIJRI_EPOCH_CE) * HIJRI_FACTOR),
  toAstronomical: (ah: number): number =>
    Math.round(ah / HIJRI_FACTOR + HIJRI_EPOCH_CE),
};
