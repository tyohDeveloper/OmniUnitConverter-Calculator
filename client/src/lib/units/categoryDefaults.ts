import { z } from 'zod';
import defaultsJson from '@/data/conversion/category-defaults.json';

/**
 * Council-13: per-category default unit/prefix.
 *
 * When the user first activates a category, this returns the unit id and
 * prefix id the UI should pre-select. Categories not listed here fall back
 * to sorted[0].id at the call site.
 *
 * If a paste smart-fill provides a target unit, the paste target wins
 * over this table (see UnitConverterApp.tsx useEffect on activeCategory).
 */
const DefaultEntry = z.object({ unit: z.string(), prefix: z.string() });
const DefaultsFile = z.object({ defaults: z.record(DefaultEntry) });

const parsed = DefaultsFile.parse(defaultsJson);

export const CATEGORY_DEFAULTS: Record<string, { unit: string; prefix: string }> = parsed.defaults;
