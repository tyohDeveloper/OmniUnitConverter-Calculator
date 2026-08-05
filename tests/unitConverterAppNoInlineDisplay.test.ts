import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Regression guard for the UnitConverterApp keyboard-copy handler
 * (Ctrl-C / Cmd-C when no input has focus).
 *
 * The handler previously reimplemented the CalcValue display formula
 * inline — twice, once for each of the RPN and simple modes — and
 * the simple-mode inline copy used the buggy divide-by-effective
 * PrefixFactor formula (see docs/tasks/calc-display-formula-
 * inconsistency.md, resolved 2026-08-05, deleted). That copy
 * produced wrong clipboard values for any CalcValue with a non-'none'
 * prefix, reachable via RPN paste + RPN\u2192simple mode switch.
 *
 * The fix (commit sequence "final \u00a71.6 pass") delegated the handler
 * to the calc controller's copyCalcResult / copyRpnResult, which
 * route through formatCalcValueDisplay + siToDisplay and produce the
 * correct values in all cases. Behavior correctness is tested in
 * tests/formatCalcValueDisplay.test.ts; this test guards the
 * DELEGATION.
 *
 * If someone later reintroduces inline formula math in
 * UnitConverterApp.tsx (e.g. for a new keyboard shortcut or a copy-
 * on-hover feature), this test fails. The correct response is to
 * route the new feature through the same lib helpers rather than
 * copying the formula.
 *
 * The check is deliberately narrow: it flags exactly the primitives
 * that indicate open-coded display-formula math in the app layer.
 * A false positive here (e.g. a legitimate comment mentioning
 * siToDisplay) is preferable to a silent regression.
 */

const APP_PATH = join(__dirname, '..', 'client', 'src', 'features', 'unit-converter', 'app', 'UnitConverterApp.tsx');

// Primitives that should NOT appear as function calls in UnitConverterApp.
// These are the low-level building blocks of the display formula; a call to
// any of them from the app layer is a §1.6 layering violation.
const FORBIDDEN_CALLS = [
  'applyPrefixToKgUnit',
  'siToDisplay',
  'displayToSI',
  'effectivePrefixFactor',
  'formatDimensions',
  'composeUnitDisplaySymbol',
  'formatCalcValueDisplay',
];

function stripLineCommentsAndImports(src: string): string {
  // Drop import statements (they can legitimately reference these names).
  const lines = src.split('\n');
  const kept: string[] = [];
  let inBlockComment = false;
  for (const raw of lines) {
    let line = raw;
    // Track block-comment state; drop content inside /* ... */.
    if (inBlockComment) {
      const close = line.indexOf('*/');
      if (close === -1) continue;
      line = line.slice(close + 2);
      inBlockComment = false;
    }
    // Handle same-line block comment.
    while (true) {
      const open = line.indexOf('/*');
      if (open === -1) break;
      const close = line.indexOf('*/', open + 2);
      if (close === -1) {
        line = line.slice(0, open);
        inBlockComment = true;
        break;
      }
      line = line.slice(0, open) + line.slice(close + 2);
    }
    // Skip import statements.
    if (/^\s*import\s/.test(line)) continue;
    // Strip line comments.
    const lineCommentIdx = line.indexOf('//');
    if (lineCommentIdx !== -1) line = line.slice(0, lineCommentIdx);
    kept.push(line);
  }
  return kept.join('\n');
}

describe('UnitConverterApp — no inline display-formula math', () => {
  const raw = readFileSync(APP_PATH, 'utf8');
  const stripped = stripLineCommentsAndImports(raw);

  for (const name of FORBIDDEN_CALLS) {
    it(`does not reference ${name} in executable code`, () => {
      // Match `name` as a whole word. This catches call sites, property
      // accesses, and destructures — anything that would use the primitive
      // for math or symbol composition in the app layer.
      const wordBoundary = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`);
      const hit = wordBoundary.test(stripped);
      expect(hit, `UnitConverterApp.tsx references ${name} outside imports/comments. `
        + `Display-formula primitives must not be called directly from the app layer — `
        + `route through the calc controller (copyCalcResult, copyRpnResult) or `
        + `useConverterController instead. See tests/formatCalcValueDisplay.test.ts `
        + `for the invariants those helpers guarantee.`).toBe(false);
    });
  }
});
