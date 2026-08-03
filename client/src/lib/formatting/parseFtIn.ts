import { parseNumberWithFormat } from '../formatting';
import type { NumberFormat } from '../formatting';

/**
 * Council-08: pure parser for foot-inch ("5'6\"") strings.
 *
 * Extracted from useConverterController.ts. Normalizes ' and " to ':',
 * then splits on ':' into up to 2 numeric parts.
 */
export function parseFtIn(ftIn: string, format: NumberFormat): number {
  const cleaned = ftIn.replace(/['"]/g, ':');
  if (!cleaned.includes(':')) return parseNumberWithFormat(cleaned, format);
  const parts = cleaned.split(':').map(p => parseNumberWithFormat(p, format));
  let val = 0;
  if (parts.length > 0) val += parts[0];
  if (parts.length > 1) val += (parts[0] >= 0 ? parts[1] : -parts[1]) / 12;
  return val;
}
