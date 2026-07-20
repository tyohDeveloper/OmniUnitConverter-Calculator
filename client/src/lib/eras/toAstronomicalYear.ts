import type { EraScheme } from './types';
import { hijriTabular } from './hijriTabular';

// Convert a year expressed in a scheme to the astronomical CE year
// (year 0 = 1 BCE, −1 = 2 BCE, …). Offset schemes: astro = year − offset.
export function toAstronomicalYear(year: number, scheme: EraScheme): number {
  if (scheme.kind === 'lunar_hijri') return hijriTabular.toAstronomical(year);
  return year - (scheme.offset ?? 0);
}
