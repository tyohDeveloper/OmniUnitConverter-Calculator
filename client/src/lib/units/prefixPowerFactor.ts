/**
 * Compute the effective numeric factor of an SI prefix applied to a unit whose
 * prefixed symbol is raised to a power (e.g. km² = (10³ m)² → 10⁶ m²,
 * km³ = (10³ m)³ → 10⁹ m³). Linear units (power 1 or undefined) are unchanged.
 */
export function prefixPowerFactor(prefixFactor: number, prefixPower?: number): number {
  return prefixPower && prefixPower !== 1 ? Math.pow(prefixFactor, prefixPower) : prefixFactor;
}
