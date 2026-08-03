/**
 * Council-05: enforce unique data-testid values across the source tree.
 *
 * Static testid literals (`data-testid="foo"` and `testId('foo')`) must be
 * globally unique. Any duplicate is a bug: two elements with the same
 * testid make Playwright/Vitest queries ambiguous.
 *
 * Dynamic testids that include a domain key
 * (`data-testid={\`foo-${x}\`}` or `testId(\`foo-${x}\`)`) are exempt from
 * this check because the key differentiates instances at render time.
 * Uniqueness of the rendered artifact is separately enforced by
 * verify-build.mjs (council-04) once that lands.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'fs';
import { resolve, join } from 'path';

const SRC_ROOT = resolve(__dirname, '../client/src');

function collectTsxFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) collectTsxFiles(full, acc);
    else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) acc.push(full);
  }
  return acc;
}

function extractStaticTestIds(source: string): string[] {
  const ids: string[] = [];
  const attrMatches = source.match(/data-testid="[a-z][a-z0-9-]*"/g) ?? [];
  attrMatches.forEach(m => {
    const v = m.match(/data-testid="([a-z][a-z0-9-]*)"/);
    if (v) ids.push(v[1]);
  });
  // testId('literal') / testId("literal") — deliberately excludes template literals.
  const helperMatches = source.match(/testId\(\s*['"][a-z][a-z0-9-]*['"]\s*\)/g) ?? [];
  helperMatches.forEach(m => {
    const v = m.match(/testId\(\s*['"]([a-z][a-z0-9-]*)['"]\s*\)/);
    if (v) ids.push(v[1]);
  });
  return ids;
}

describe('data-testid uniqueness (council-05)', () => {
  const files = collectTsxFiles(SRC_ROOT);
  const perFileIds = new Map<string, string[]>();
  const allIds: { file: string; id: string }[] = [];

  for (const file of files) {
    const src = readFileSync(file, 'utf-8');
    const ids = extractStaticTestIds(src);
    perFileIds.set(file, ids);
    for (const id of ids) allIds.push({ file, id });
  }

  it('emits a nonempty set of static testids (sanity check)', () => {
    expect(allIds.length).toBeGreaterThan(20);
  });

  it('every static data-testid value is globally unique', () => {
    const counts: Record<string, string[]> = {};
    allIds.forEach(({ file, id }) => {
      if (!counts[id]) counts[id] = [];
      counts[id].push(file);
    });
    const duplicates: string[] = [];
    Object.keys(counts).forEach(id => {
      const homes = counts[id];
      if (homes.length > 1) {
        duplicates.push(`  ${id}\n${homes.map((h: string) => '    ' + h).join('\n')}`);
      }
    });
    expect(duplicates, `Duplicate static testids:\n${duplicates.join('\n')}`).toHaveLength(0);
  });

  it('every static testid follows the {role}-{area?}-{name}[-{key}] grammar', () => {
    // Grammar per architecture-standards §4.2. Roles enumerated there.
    const ROLE_PREFIXES = new Set([
      'button', 'select', 'input', 'display', 'text', 'switch',
      'checkbox', 'slider', 'panel', 'backdrop', 'tab',
      // Data-cell prefixes used by the sources page and comparison rows.
      'sources', 'comparison',
      // Existing legacy prefixes retained under the additive-only rule
      // (§4.6). These are historical and remain valid; new IDs should
      // prefer the canonical roles above.
      'calc', 'rpn', 'custom',
    ]);
    const bad: string[] = [];
    for (const { file, id } of allIds) {
      const prefix = id.split('-')[0];
      if (!ROLE_PREFIXES.has(prefix)) {
        bad.push(`${file}: '${id}' has unrecognized role prefix '${prefix}'`);
      }
    }
    expect(bad, `Testids violating §4.2 grammar:\n${bad.join('\n')}`).toHaveLength(0);
  });
});
