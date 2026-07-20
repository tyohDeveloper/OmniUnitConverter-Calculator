import type { EraScheme } from './types';
import { hijriApproximation } from './hijriApproximation';

// Convert an astronomical CE year (year 0 = 1 BCE) to a scheme's year
// number. Offset schemes: schemeYear = astro + offset.
export function fromAstronomicalYear(astro: number, scheme: EraScheme): number {
  if (scheme.kind === 'lunar_hijri') return hijriApproximation.fromAstronomical(astro);
  return astro + (scheme.offset ?? 0);
}
