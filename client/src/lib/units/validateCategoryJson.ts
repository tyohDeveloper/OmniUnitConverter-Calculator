import { z } from 'zod';
import { CONVERSION_FUNCTIONS } from './conversionFunctionRegistry';

const unitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  symbol: z.string(),
  factor: z.number(),
  offset: z.number().optional(),
  description: z.string().optional(),
  allowPrefixes: z.boolean().optional(),
  prefixPower: z.number().optional(),
  mathFunction: z.string().optional(),
  isInverse: z.boolean().optional(),
  unitType: z.string().optional(),
  measurementSystem: z.string().optional(),
  conversionFunction: z.string().optional(),
  sourceUrl: z.string().url().optional(),
}).superRefine((unit, ctx) => {
  if (unit.mathFunction && !CONVERSION_FUNCTIONS[unit.mathFunction]?.oneWay) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `unit "${unit.id}": unknown mathFunction "${unit.mathFunction}"` });
  }
  if (!unit.conversionFunction) return;
  const pair = CONVERSION_FUNCTIONS[unit.conversionFunction];
  if (!pair) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `unit "${unit.id}": unknown conversionFunction "${unit.conversionFunction}"` });
  } else if (pair.oneWay || !pair.fromBase) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `unit "${unit.id}": conversionFunction "${unit.conversionFunction}" has no inverse (one-way pairs must use mathFunction)` });
  }
});

const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  baseUnit: z.string().min(1),
  baseSISymbol: z.string().optional(),
  units: z.array(unitSchema).min(1),
  primaryCategory: z.string().min(1).optional(),
});

export function validateCategoryJson(raw: unknown): void {
  const result = categorySchema.safeParse(raw);
  if (result.success) return;
  const id = (raw as { id?: string })?.id ?? '(unknown)';
  const details = result.error.issues.map(i => i.message).join('; ');
  throw new Error(`Invalid conversion category JSON "${id}": ${details}`);
}
