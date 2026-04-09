#!/usr/bin/env node
/**
 * lint-size.mjs
 *
 * Enforces structural size rules on pure-function library files:
 *
 *   FUNCTION LENGTH (all lib/ files, except listed data files):
 *     - Max 20 lines per exported or module-level function body
 *
 *   EXPORT COUNT (lib/calculator/, lib/units/, and lib/ root):
 *     - Max 1 exported function/const per file
 *     - Known multi-export files excluded with rationale comments below
 *
 *   FILE LENGTH (lib/calculator/ and lib/units/ only):
 *     - Max 100 lines per pure-function file
 *     - Known data/barrel files excluded with rationale comments below
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LIB_ROOT = path.join(ROOT, 'client', 'src', 'lib');

const EXPORT_COUNT_RULE_DIRS = [
  path.join(LIB_ROOT, 'calculator'),
  path.join(LIB_ROOT, 'units'),
  LIB_ROOT,
];

/**
 * Files excluded from export-count rule.
 * Each exclusion must have a stated reason.
 *
 * - index.ts:                   barrel re-export file
 * - shared-types.ts:            re-export barrel (post-split compatibility shim)
 * - siDerivedUnits.ts:          data-only, no functions
 * - categoryDimensions.ts:      data-only, no functions (canonical home post-split)
 * - types.ts:                   type definitions only (re-export shim post-split)
 * - prefixes.ts:                data-only
 * - prefixExponents.ts:         data-only
 * - helpers.ts:                 re-export barrel aggregating canonical helpers
 * - normalizeMassUnit.ts:       exports type + function (type cannot be in a separate .d.ts file)
 * - normalizeMassDisplay.ts:    exports type + function (same reason as above)
 * - applyRpnUnary.ts:           exports type + function (type is co-located with its function)
 * - applyRpnBinary.ts:          exports type + function (same reason as above)
 * - generateSIRepresentations.ts:          exports multiple steps of a single algorithm
 * - generateAlternativeRepresentations.ts: exports multiple steps of a single algorithm
 * - conversion-data.ts:         central data + utility module; refactoring into single-export
 *                               files would fragment related data and conversions across 20+ files
 * - localization.ts:            re-exports + constants barrel; not a function file
 * - formatting.ts:              public API module; exports multiple related formatters
 * - queryClient.ts:             React Query client utilities (apiRequest + getQueryFn are coupled)
 * - test-utils.ts:              test helper utilities; not production logic
 * - translateUi.ts:             translation data + accessor (data and function are coupled)
 * - translateUnit.ts:           translation data + accessor (data and function are coupled)
 * - siBaseUnits.ts:             data-only constants (SI_BASE_UNIT_SYMBOLS, SI_BASE_TO_DIMENSION,
 *                               DIMENSION_TO_SI_SYMBOL are strongly coupled and always imported together)
 * - siDerivedUnitsCatalog.ts:   data-only, single array constant
 * - nonSiUnitsCatalog.ts:       data-only, single array constant
 * - preferredRepresentations.ts: exports interface + constant (co-located by design)
 * - languageTypes.ts:           exports constant + derived type (co-located by design)
 * - unitDefinition.ts:          type definitions only (UnitDefinition + CategoryDefinition are coupled)
 * - measurementSystem.ts:       data-only const object + derived type (co-located by design)
 */
const EXPORT_RULE_EXCLUDES = new Set([
  'index.ts', 'shared-types.ts', 'siDerivedUnits.ts', 'categoryDimensions.ts',
  'types.ts', 'prefixes.ts', 'prefixExponents.ts', 'helpers.ts',
  'normalizeMassUnit.ts', 'normalizeMassDisplay.ts',
  'applyRpnUnary.ts', 'applyRpnBinary.ts',
  'generateSIRepresentations.ts', 'generateAlternativeRepresentations.ts',
  'conversion-data.ts', 'localization.ts', 'formatting.ts',
  'queryClient.ts', 'test-utils.ts', 'translateUi.ts', 'translateUnit.ts',
  'siBaseUnits.ts', 'siDerivedUnitsCatalog.ts', 'nonSiUnitsCatalog.ts',
  'preferredRepresentations.ts', 'languageTypes.ts', 'unitDefinition.ts',
  'measurementSystem.ts',
]);

/**
 * Files excluded from file-length rule (lib/calculator/ and lib/units/ only).
 *
 * - index.ts, types.ts, *.ts data files: aggregation/type-only, not pure-function files
 * - normalizeDimensions.ts:    complex multi-step algorithm with necessary helper functions
 * - findDerivedUnitPower.ts:   iterates all SI units, multiple helper stubs in same file
 * - getDerivedUnit.ts:         similar multi-step lookup
 * - applyRpnUnary.ts:          25+ op dispatch requires multiple sub-dispatch functions
 * - applyRpnBinary.ts:         10 op dispatch with helpers
 * - generateSIRepresentations.ts:          multi-pass algorithm
 * - generateAlternativeRepresentations.ts: multi-pass algorithm with multiple helpers
 */
const FILE_LENGTH_EXCLUDES = new Set([
  'index.ts', 'shared-types.ts', 'siDerivedUnits.ts', 'categoryDimensions.ts',
  'types.ts', 'prefixes.ts', 'prefixExponents.ts', 'helpers.ts',
  'normalizeMassUnit.ts', 'normalizeMassDisplay.ts',
  'applyRpnUnary.ts', 'applyRpnBinary.ts',
  'generateSIRepresentations.ts', 'generateAlternativeRepresentations.ts',
  'normalizeDimensions.ts', 'findDerivedUnitPower.ts', 'getDerivedUnit.ts',
  'siBaseUnits.ts', 'siDerivedUnitsCatalog.ts', 'nonSiUnitsCatalog.ts',
  'preferredRepresentations.ts',
]);

/**
 * Files excluded from function-length rule.
 *
 * - Data-only files: no functions, only constants/types
 * - localization.ts: constants + re-exports, `translate` function is ≤20 lines;
 *   the parser's brace-based termination is confused by array literals in this file
 */
const FUNCTION_RULE_DATA_EXCLUDES = new Set([
  'shared-types.ts', 'siDerivedUnits.ts', 'categoryDimensions.ts',
  'types.ts', 'prefixes.ts', 'prefixExponents.ts',
  'localization.ts',
  'siBaseUnits.ts', 'siDerivedUnitsCatalog.ts', 'nonSiUnitsCatalog.ts',
  'preferredRepresentations.ts', 'languageTypes.ts',
  'measurementSystem.ts',
]);

const MAX_FUNCTION_LINES = 20;
const MAX_FILE_LINES = 100;
const FILE_LENGTH_APPLIES_DIRS = [
  path.join(LIB_ROOT, 'calculator'),
  path.join(LIB_ROOT, 'units'),
];

function getFilesRecursive(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...getFilesRecursive(fullPath));
    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) results.push(fullPath);
  }
  return results;
}

function countExportedFunctions(lines) {
  return lines.filter(l => /^export (const|function) \w+/.test(l)).length;
}

/**
 * Detects functions that exceed maxLines.
 *
 * Tracks { } and [ ] as scope openers/closers.
 * A function ends only after at least one scope-opener has been seen
 * (bodyOpened = true) AND the depth returns to 0.
 * This correctly handles multi-line arrow/parameter signatures before the body '{'.
 */
function findFunctionViolations(lines, maxLines) {
  const violations = [];
  let fnStart = -1;
  let inFn = false;
  let bodyOpened = false;
  let braceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isFnDecl =
      /^export const \w+\s*=\s*/.test(line) ||
      /^export function \w+/.test(line) ||
      /^const \w+\s*=\s*\(/.test(line) ||
      /^function \w+/.test(line);

    if (isFnDecl && !inFn) {
      fnStart = i;
      braceDepth = 0;
      bodyOpened = false;
      inFn = true;
    }

    if (inFn) {
      for (const c of line) {
        if (c === '{' || c === '[') { braceDepth++; bodyOpened = true; }
        else if (c === '}' || c === ']') { braceDepth--; }
      }
      if (bodyOpened && braceDepth === 0) {
        const fnLines = i - fnStart + 1;
        if (fnLines > maxLines) {
          violations.push({ line: fnStart + 1, fnLines });
        }
        inFn = false;
        fnStart = -1;
        bodyOpened = false;
      }
    }
  }
  return violations;
}

const files = getFilesRecursive(LIB_ROOT);
let hasErrors = false;

for (const filePath of files) {
  const relPath = path.relative(ROOT, filePath);
  const fileName = path.basename(filePath);
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');

  if (!FUNCTION_RULE_DATA_EXCLUDES.has(fileName)) {
    const fnViolations = findFunctionViolations(lines, MAX_FUNCTION_LINES);
    for (const v of fnViolations) {
      console.error(`LINT ERROR [function-length]: ${relPath}:${v.line} — function is ${v.fnLines} lines (max ${MAX_FUNCTION_LINES})`);
      hasErrors = true;
    }
  }

  const inExportCountDir = EXPORT_COUNT_RULE_DIRS.some(d => {
    const fileDir = path.dirname(filePath);
    return fileDir === d || fileDir.startsWith(d + path.sep);
  });
  if (inExportCountDir && !EXPORT_RULE_EXCLUDES.has(fileName)) {
    const exportCount = countExportedFunctions(lines);
    if (exportCount > 1) {
      console.error(`LINT ERROR [export-count]: ${relPath} — exports ${exportCount} functions (max 1 per file)`);
      hasErrors = true;
    }
  }

  const inFileLengthDir = FILE_LENGTH_APPLIES_DIRS.some(d => filePath.startsWith(d));
  if (inFileLengthDir && !FILE_LENGTH_EXCLUDES.has(fileName)) {
    if (lines.length > MAX_FILE_LINES) {
      console.error(`LINT ERROR [file-length]: ${relPath} — ${lines.length} lines (max ${MAX_FILE_LINES})`);
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  console.error('\nLint failed. Fix the violations above before merging.');
  process.exit(1);
} else {
  console.log('Lint passed: all lib/ files comply with size rules (function-length, export-count, file-length).');
}
