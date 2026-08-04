const BASE_UNIT_PATTERNS = ['kg', 'm', 's', 'A', 'K', 'mol', 'cd', 'rad', 'sr'];

const extractBaseUnit = (part: string): string => {
  return part.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, '');
};

export const isValidSymbolRepresentation = (symbol: string): boolean => {
  if (!symbol || symbol === '1') return true;

  const parts = symbol.split('⋅');
  const baseUnitsFound: string[] = [];

  for (const part of parts) {
    const baseUnit = extractBaseUnit(part);
    if (BASE_UNIT_PATTERNS.includes(baseUnit)) {
      if (baseUnitsFound.includes(baseUnit)) return false;
      baseUnitsFound.push(baseUnit);
    }
  }

  return true;
};
