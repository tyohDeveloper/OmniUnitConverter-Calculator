import type { EraScheme } from './types';
import { hijriTabular } from './hijriTabular';

// Convert an astronomical CE year (year 0 = 1 BCE) to a scheme's year
// number. Offset schemes: schemeYear = astro + offset.
export function fromAstronomicalYear(astro: number, scheme: EraScheme): number {
  if (scheme.kind === 'lunar_hijri') return hijriTabular.fromAstronomical(astro);
  return astro + (scheme.offset ?? 0);
}
