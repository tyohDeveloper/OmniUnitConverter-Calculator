import { PREFIXES } from './prefixes';

function findPrefix(prefixId: string) {
  return PREFIXES.find(p => p.id === prefixId) || PREFIXES.find(p => p.id === 'none')!;
}

export const applyPrefixToKgUnit = (
  unitSymbol: string,
  prefixId: string
): { displaySymbol: string; effectivePrefixFactor: number; showPrefix: boolean } => {
  const containsKg = unitSymbol.includes('kg');

  if (!containsKg) {
    const prefixData = findPrefix(prefixId);
    return { displaySymbol: unitSymbol, effectivePrefixFactor: prefixData.factor, showPrefix: prefixId !== 'none' };
  }

  if (prefixId === 'none' || prefixId === 'kilo') {
    return { displaySymbol: unitSymbol, effectivePrefixFactor: 1, showPrefix: false };
  }

  const prefixData = findPrefix(prefixId);
  const transformedSymbol = unitSymbol.replace(/kg/g, prefixData.symbol + 'g');
  return { displaySymbol: transformedSymbol, effectivePrefixFactor: 1000 / prefixData.factor, showPrefix: false };
};
