#!/usr/bin/env node
/**
 * build-testid-manifest.mjs
 *
 * Helper (run manually) that builds scripts/testid-manifest.json from
 * the current built artifact. Not part of `npm run build`.
 *
 * Extracts every literal `data-testid="..."` value that actually appears
 * in dist/public/index.html and writes the sorted list to the manifest.
 * Dynamic testids that are built at runtime from JS template strings
 * (e.g. `display-category-${cat.id}`) do NOT appear as literals in the
 * artifact and are intentionally excluded — the uniqueness/coverage
 * story for those runs at DOM mount time via tests/testids-unique.test.ts.
 *
 * Run: `node scripts/build-testid-manifest.mjs`
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ARTIFACT = path.join(ROOT, 'dist', 'public', 'index.html');
const MANIFEST = path.join(ROOT, 'scripts', 'testid-manifest.json');

if (!fs.existsSync(ARTIFACT)) {
  console.error(`Artifact not found at ${ARTIFACT}. Run \`npm run build\` first.`);
  process.exit(1);
}

const content = fs.readFileSync(ARTIFACT, 'utf8');
const ids = new Set();
// Two forms appear in the shipped artifact:
//   1. Literal attributes  data-testid="foo"  in the HTML shell (rare for
//      a SPA — most React attributes are set at mount time from JS).
//   2. String constants  "data-testid":"foo"  inside the minified JS
//      bundle. React reads these at render time and sets the attribute
//      on the DOM node.
// We collect from both so the manifest reflects everything the mounted
// app will render.
const regexes = [
  /data-testid="([a-z][a-zA-Z0-9_-]*)"/g,
  /data-testid='([a-z][a-zA-Z0-9_-]*)'/g,
  /"data-testid":"([a-z][a-zA-Z0-9_-]*)"/g,
];
for (const rx of regexes) {
  const matches = content.match(rx) ?? [];
  for (const m of matches) {
    const v = m.match(/data-testid["']?[:=]["']([a-z][a-zA-Z0-9_-]*)["']/);
    if (v) ids.add(v[1]);
  }
}
const sorted = Array.from(ids).sort();
const payload = {
  recordedAt: new Date().toISOString().slice(0, 10),
  note: 'Built from dist/public/index.html by scripts/build-testid-manifest.mjs. Verifier fails if any id here is missing from the shipped artifact. To retire an id, remove it here in the same PR as the source change (§4.6 rename manifest).',
  required: sorted,
};
fs.writeFileSync(MANIFEST, JSON.stringify(payload, null, 2) + '\n', 'utf8');
console.log(`Wrote ${MANIFEST}`);
console.log(`  ${sorted.length} required testid(s).`);
