import { parseNumberWithFormat } from './parseNumber';
import type { NumberFormat } from '../formatting';

/**
 * Council-08: pure parser for DMS ("degrees:minutes:seconds") strings.
 *
 * Delegates to parseNumberWithFormat when the string has no ':' separator.
 * When it does, splits into up to 3 numeric parts and reconstructs the
 * decimal degree. Minutes and seconds inherit the sign of the degree
 * component (so "-1:30" is -1.5, not -0.5).
 *
 * Extracted from useConverterController.ts to remove parsing from the
 * controller layer per architecture-standards §1.2.
 */
export function parseDMS(dms: string, format: NumberFormat): number {
  if (!dms.includes(':')) return parseNumberWithFormat(dms, format);
  const parts = dms.split(':').map(p => parseNumberWithFormat(p, format));
  let val = 0;
  if (parts.length > 0) val += parts[0];
  if (parts.length > 1) val += (parts[0] >= 0 ? parts[1] : -parts[1]) / 60;
  if (parts.length > 2) val += (parts[0] >= 0 ? parts[2] : -parts[2]) / 3600;
  return val;
}
