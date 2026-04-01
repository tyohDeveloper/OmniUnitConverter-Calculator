#!/usr/bin/env node
/**
 * verify-build.mjs
 *
 * Verifies the production single-file HTML build:
 *   1. Build output exists and is non-empty
 *   2. Output is a single HTML file (vite-plugin-singlefile)
 *   3. No "/*!" license block comments in inlined JS
 *   4. No excessive HTML comments
 *   5. Output size within absolute ceiling (2 MB)
 *   6. Gzip size does not exceed recorded baseline by more than 5%
 *
 * Run after `npm run build`.
 * Baseline stored in scripts/build-baseline.json (committed).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT, 'dist', 'public', 'index.html');
const BASELINE_FILE = path.join(ROOT, 'scripts', 'build-baseline.json');

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const GZIP_HEADROOM_RATIO = 1.05;

let hasErrors = false;

function error(msg) {
  console.error(`BUILD ERROR: ${msg}`);
  hasErrors = true;
}

if (!fs.existsSync(OUTPUT_FILE)) {
  error(`Output file not found: ${OUTPUT_FILE}`);
  process.exit(1);
}

const content = fs.readFileSync(OUTPUT_FILE, 'utf8');
const sizeBytes = Buffer.byteLength(content, 'utf8');
const gzipSize = zlib.gzipSync(content).length;

console.log(`Build output: ${OUTPUT_FILE}`);
console.log(`  Raw size:  ${(sizeBytes / 1024).toFixed(1)} kB`);
console.log(`  Gzip size: ${(gzipSize / 1024).toFixed(1)} kB`);

if (sizeBytes === 0) error('Output file is empty.');
if (sizeBytes > MAX_SIZE_BYTES) {
  error(`Output file is ${(sizeBytes / 1024).toFixed(1)} kB, exceeds absolute ceiling of ${MAX_SIZE_BYTES / 1024} kB.`);
}

if (fs.existsSync(BASELINE_FILE)) {
  const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
  const gzipCeiling = Math.ceil(baseline.gzipBytes * GZIP_HEADROOM_RATIO);
  console.log(`  Baseline:  ${(baseline.gzipBytes / 1024).toFixed(1)} kB gzip (recorded ${baseline.recordedAt})`);
  console.log(`  Ceiling:   ${(gzipCeiling / 1024).toFixed(1)} kB gzip (baseline × ${GZIP_HEADROOM_RATIO})`);
  if (gzipSize > gzipCeiling) {
    error(`Gzip size ${(gzipSize / 1024).toFixed(1)} kB exceeds baseline ceiling of ${(gzipCeiling / 1024).toFixed(1)} kB — bundle regressed.`);
  }
} else {
  console.warn('  Warning: no baseline file found at scripts/build-baseline.json — skipping size regression check.');
}

const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
if (!scriptMatch || scriptMatch.length === 0) {
  error('No inlined <script> tag found — single-file plugin may not have run.');
}

const scriptContent = (scriptMatch || []).join('');
const blockCommentMatches = scriptContent.match(/\/\*![\s\S]*?\*\//g) || [];
if (blockCommentMatches.length > 0) {
  error(`Found ${blockCommentMatches.length} license/block comment(s) in inlined JS (/*! ... */) — bundle is not fully minified.`);
}

const htmlCommentCount = (content.match(/<!--(?!DOCTYPE)[^>]+-->/g) || []).length;
if (htmlCommentCount > 3) {
  error(`Found ${htmlCommentCount} HTML comments in output — expected minimal comments from template only.`);
}

if (!hasErrors) {
  console.log('Build verification passed: output is valid, minimized, and within size limits.');
} else {
  console.error('\nBuild verification failed. Fix the issues above.');
  process.exit(1);
}
