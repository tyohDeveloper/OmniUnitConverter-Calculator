// Astronomical CE year → display parts: 2026 → { year: 2026, era: 'CE' };
// 0 → { year: 1, era: 'BCE' }; −44 → { year: 45, era: 'BCE' }.
export function formatAstronomicalYear(astro: number): { year: number; era: 'CE' | 'BCE' } {
  if (astro >= 1) return { year: astro, era: 'CE' };
  return { year: 1 - astro, era: 'BCE' };
}
