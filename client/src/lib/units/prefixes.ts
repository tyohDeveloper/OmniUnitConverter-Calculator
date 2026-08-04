import type { Prefix } from './prefix';

// Prefix is owned by ./prefix.ts. Consumers import from there directly
// (§3.8: no re-exports).

export const PREFIXES: Prefix[] = [
  { id: 'yotta', name: 'Yotta', symbol: 'Y', factor: 1e24 },
  { id: 'zetta', name: 'Zetta', symbol: 'Z', factor: 1e21 },
  { id: 'exa', name: 'Exa', symbol: 'E', factor: 1e18 },
  { id: 'peta', name: 'Peta', symbol: 'P', factor: 1e15 },
  { id: 'tera', name: 'Tera', symbol: 'T', factor: 1e12 },
  { id: 'giga', name: 'Giga', symbol: 'G', factor: 1e9 },
  { id: 'mega', name: 'Mega', symbol: 'M', factor: 1e6 },
  { id: 'kilo', name: 'Kilo', symbol: 'k', factor: 1e3 },
  { id: 'none', name: '', symbol: '', factor: 1 },
  { id: 'centi', name: 'Centi', symbol: 'c', factor: 1e-2 },
  { id: 'milli', name: 'Milli', symbol: 'm', factor: 1e-3 },
  { id: 'micro', name: 'Micro', symbol: 'µ', factor: 1e-6 },
  { id: 'nano', name: 'Nano', symbol: 'n', factor: 1e-9 },
  { id: 'pico', name: 'Pico', symbol: 'p', factor: 1e-12 },
  { id: 'femto', name: 'Femto', symbol: 'f', factor: 1e-15 },
  { id: 'atto', name: 'Atto', symbol: 'a', factor: 1e-18 },
  { id: 'zepto', name: 'Zepto', symbol: 'z', factor: 1e-21 },
  { id: 'yocto', name: 'Yocto', symbol: 'y', factor: 1e-24 },
];

export const BINARY_PREFIXES: Prefix[] = [
  { id: 'exbi', name: 'Exbi', symbol: 'Ei', factor: 1152921504606846976 },
  { id: 'pebi', name: 'Pebi', symbol: 'Pi', factor: 1125899906842624 },
  { id: 'tebi', name: 'Tebi', symbol: 'Ti', factor: 1099511627776 },
  { id: 'gibi', name: 'Gibi', symbol: 'Gi', factor: 1073741824 },
  { id: 'mebi', name: 'Mebi', symbol: 'Mi', factor: 1048576 },
  { id: 'kibi', name: 'Kibi', symbol: 'Ki', factor: 1024 },
];

export const ALL_PREFIXES: Prefix[] = [...PREFIXES, ...BINARY_PREFIXES].sort((a, b) => b.factor - a.factor);

