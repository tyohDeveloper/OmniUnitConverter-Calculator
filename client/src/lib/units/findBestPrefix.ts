import { PREFIXES } from './prefixes';

const scorePrefix = (absValue: number, prefixFactor: number): number => {
  const converted = absValue / prefixFactor;
  if (converted >= 1) {
    const integerPart = Math.floor(converted);
    return integerPart === 0 ? 1 : Math.floor(Math.log10(integerPart)) + 1;
  }
  return 1000 + (1 - converted);
};

export const findBestPrefix = (value: number): string => {
  if (value === 0) return 'none';
  const absValue = Math.abs(value);
  let bestPrefix = 'none';
  let bestScore = Infinity;
  for (const prefix of PREFIXES) {
    const score = scorePrefix(absValue, prefix.factor);
    if (score < bestScore) {
      bestScore = score;
      bestPrefix = prefix.id;
    }
  }
  return bestPrefix;
};
