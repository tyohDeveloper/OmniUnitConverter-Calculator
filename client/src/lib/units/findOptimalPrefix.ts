import type { Prefix } from './prefix';
import { PREFIXES } from './prefixes';

function pickBestPrefix(absValue: number, nonePrefix: Prefix, prefixPower: number): Prefix {
  let bestPrefix = nonePrefix;
  let bestScore = Math.abs(Math.log10(absValue));
  for (const prefix of PREFIXES) {
    if (prefix.id === 'none') continue;
    const adjustedAbs = absValue / Math.pow(prefix.factor, prefixPower);
    if (adjustedAbs >= 1 && adjustedAbs < Math.pow(1000, prefixPower)) {
      const score = Math.abs(Math.log10(adjustedAbs));
      if (score < bestScore) { bestScore = score; bestPrefix = prefix; }
    }
  }
  return bestPrefix;
}

function resolveUnderflow(absValue: number, bestPrefix: Prefix, precision: number, prefixPower: number): Prefix {
  const adjustedWithBest = absValue / Math.pow(bestPrefix.factor, prefixPower);
  const roundedWithBest = parseFloat(adjustedWithBest.toFixed(precision));
  if (roundedWithBest !== 0) return bestPrefix;
  for (const prefix of PREFIXES) {
    if (prefix.factor >= bestPrefix.factor) continue;
    const adjusted = absValue / Math.pow(prefix.factor, prefixPower);
    if (parseFloat(adjusted.toFixed(precision)) !== 0) return prefix;
  }
  return bestPrefix;
}

export function findOptimalPrefix(
  value: number,
  unitSymbol: string = '',
  precision: number = 8,
  prefixPower: number = 1
): { prefix: Prefix; adjustedValue: number } {
  const nonePrefix = PREFIXES.find(p => p.id === 'none')!;
  const effectiveValue = unitSymbol.includes('kg') ? value * 1000 : value;
  const absValue = Math.abs(effectiveValue);
  if (absValue === 0 || !isFinite(absValue)) {
    return { prefix: nonePrefix, adjustedValue: value };
  }
  const bestPrefix = resolveUnderflow(
    absValue,
    pickBestPrefix(absValue, nonePrefix, prefixPower),
    precision,
    prefixPower
  );
  return { prefix: bestPrefix, adjustedValue: effectiveValue / Math.pow(bestPrefix.factor, prefixPower) };
}
