export const countUnits = (symbol: string): number => {
  if (!symbol || symbol === '1') return 0;
  return symbol.split('⋅').length;
};
