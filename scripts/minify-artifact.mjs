#!/usr/bin/env node
/**
 * minify-artifact.mjs
 *
 * Runs the final HTML-shell minimization pass on the Vite build output.
 * Per architecture-standards §14, this executes *after* `vite build` and
 * *before* `verify:build` inside `npm run build`. It never runs in dev.
 *
 * Scope:
 *   - Vite/esbuild has already minified inlined JS. `minifyJS: false` here
 *     keeps that untouched (running Terser again would strip CDATA wrappers
 *     and other structural pieces §8.2 needs).
 *   - This pass targets the HTML shell: inter-tag whitespace, comments,
 *     inlined CSS. XHTML-conformant markup is preserved via
 *     `keepClosingSlash`, `caseSensitive`, and no `useShortDoctype`.
 *   - data-testid attributes are preserved (see §4.4). `html-minifier-terser`
 *     does not strip data-* attributes unless explicitly configured to.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { minify } from 'html-minifier-terser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ARTIFACT = path.join(ROOT, 'dist', 'public', 'index.html');

if (!fs.existsSync(ARTIFACT)) {
  console.error(`MINIFY ERROR: artifact not found at ${ARTIFACT}. Run \`vite build\` first.`);
  process.exit(1);
}

const before = fs.readFileSync(ARTIFACT, 'utf8');
const beforeBytes = Buffer.byteLength(before, 'utf8');
const beforeGzip = zlib.gzipSync(before).length;

/**
 * §14.3 baseline configuration.
 * Changes to any value here must be justified by measurements per §14.4
 * and reviewed against §8.2 (XHTML-conformant markup).
 */
const OPTIONS = {
  collapseWhitespace: true,
  removeComments: true,
  minifyCSS: true,
  minifyJS: false,
  keepClosingSlash: true,
  caseSensitive: true,
  useShortDoctype: false,
  decodeEntities: false,
  html5: true,
  removeAttributeQuotes: false,
  removeEmptyAttributes: false,
  collapseBooleanAttributes: false,
  collapseInlineTagWhitespace: false,
  conservativeCollapse: false,
  preserveLineBreaks: false,
  sortAttributes: false,
  sortClassName: false,
};

const after = await minify(before, OPTIONS);
const afterBytes = Buffer.byteLength(after, 'utf8');
const afterGzip = zlib.gzipSync(after).length;

fs.writeFileSync(ARTIFACT, after, 'utf8');

const rawDelta = beforeBytes - afterBytes;
const gzipDelta = beforeGzip - afterGzip;
console.log(`Minimized: ${ARTIFACT}`);
console.log(`  Raw:  ${(beforeBytes / 1024).toFixed(1)} kB -> ${(afterBytes / 1024).toFixed(1)} kB (-${(rawDelta / 1024).toFixed(1)} kB)`);
console.log(`  Gzip: ${(beforeGzip / 1024).toFixed(1)} kB -> ${(afterGzip / 1024).toFixed(1)} kB (${gzipDelta >= 0 ? '-' : '+'}${Math.abs(gzipDelta / 1024).toFixed(1)} kB)`);

if (afterGzip > beforeGzip) {
  console.error('MINIFY ERROR: gzip size increased after minification. Configuration is broken.');
  process.exit(1);
}
