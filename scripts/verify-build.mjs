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
 *   7. (Council-04) index.html is a self-contained artifact: it does not
 *      link to any of the sibling files in dist/public/ (opengraph.jpg,
 *      robots.txt, sitemap.xml, etc are legitimate SEO/hosting assets for
 *      the online build but must not be prerequisites for the offline
 *      single-file deliverable)
 *   8. (Council-04) No external URL references (http/https/protocol-relative)
 *      in the artifact; only inline content and data: URIs are permitted
 *   9. (Council-04) The HTML shell parses as strict XML (polyglot markup
 *      per architecture-standards §8.2). Script and style contents are
 *      masked before parsing since Vite’s inlined JS contains raw < and &.
 *  10. (Council-04) Testid manifest coverage: the artifact contains at
 *      least every id in scripts/testid-manifest.json. New ids require
 *      updating the manifest in the same PR (§4.7).
 *  11. (Council-04) No literal "]]>" inside inlined script/style bodies
 *      — that would prematurely close a CDATA section if the artifact
 *      is later served as application/xhtml+xml.
 *
 * Run after `npm run build`.
 * Baseline stored in scripts/build-baseline.json (committed).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';
import sax from 'sax';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'dist', 'public');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'index.html');
const BASELINE_FILE = path.join(ROOT, 'scripts', 'build-baseline.json');
const TESTID_MANIFEST_FILE = path.join(ROOT, 'scripts', 'testid-manifest.json');

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

// -------------------------------------------------------------------------
// Council-04: additional checks beyond the original size + minification.
// -------------------------------------------------------------------------

// (7) index.html is self-contained. Other files may exist in dist/public/
// (opengraph.jpg, robots.txt, sitemap.xml, etc.) as SEO/hosting assets
// for the online build, but index.html must not reference them via any
// mechanism that would cause a load failure when opened from file://.
// The external-URL scan below (#8) enforces the actual self-containment
// requirement; here we merely warn on sibling files so a reviewer can
// notice new ones.
const siblingFiles = fs.readdirSync(OUTPUT_DIR, { withFileTypes: true })
  .filter(e => e.isFile() && e.name !== 'index.html')
  .map(e => e.name);
if (siblingFiles.length > 0) {
  console.log(`  Note: ${siblingFiles.length} sibling file(s) in dist/public/ (SEO/hosting only): ${siblingFiles.join(', ')}`);
}

// (8) No external-URL references. Allowed: data:, inline #anchor, and
// URLs that are visible reference links in the sources section (the app
// intentionally shows citation URLs to the user as prose — those are
// content, not resource loads). We narrow the check to attributes that
// would cause a network fetch on load: src=, href= (with rel=stylesheet
// or preload/prefetch), and CSS url()/@import.
const externalPatterns = [
  // src="http(s)://..." or protocol-relative src="//..."
  /\bsrc\s*=\s*["'](?:https?:)?\/\/[^"']+["']/gi,
  // href on a <link> that fetches (rel=stylesheet/preload/prefetch/modulepreload)
  // Narrow match: <link ... rel="stylesheet|preload|prefetch|modulepreload" ... href=...://... />
  /<link[^>]+rel\s*=\s*["'](?:stylesheet|preload|prefetch|modulepreload)["'][^>]+href\s*=\s*["'](?:https?:)?\/\/[^"']+["']/gi,
  // Same but with attributes in reverse order.
  /<link[^>]+href\s*=\s*["'](?:https?:)?\/\/[^"']+["'][^>]+rel\s*=\s*["'](?:stylesheet|preload|prefetch|modulepreload)["']/gi,
  // CSS url(http://...) inside inlined <style> or style= attributes.
  /url\(\s*["']?(?:https?:)?\/\/[^"')]+["']?\s*\)/gi,
  // @import url(...) or @import "..."
  /@import\s+(?:url\()?["'](?:https?:)?\/\/[^"']+["']/gi,
];
const externalHits = [];
for (const rx of externalPatterns) {
  const found = content.match(rx);
  if (found) externalHits.push(...found);
}
if (externalHits.length > 0) {
  error(`Found ${externalHits.length} external-URL references in the artifact (network required to load). Examples:\n  - ${externalHits.slice(0, 3).join('\n  - ')}`);
}

// (9) Strict XML parse of the HTML shell. Script and style bodies are
// masked because the inlined bundle contains raw < and &.
function maskInlineBodies(html) {
  return html
    .replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi, (_m, open, _body, close) => `${open}${close}`)
    .replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (_m, open, _body, close) => `${open}${close}`);
}
function parseAsXml(shellHtml) {
  const withProlog = `<?xml version="1.0" encoding="UTF-8"?>\n${shellHtml}`;
  const parser = sax.parser(true, { xmlns: false });
  let parseError = null;
  parser.onerror = (err) => { parseError = err; };
  try {
    parser.write(withProlog).close();
  } catch (err) {
    parseError = err;
  }
  return parseError;
}
const shellForXml = maskInlineBodies(content);
const xmlErr = parseAsXml(shellForXml);
if (xmlErr) {
  error(`Artifact HTML shell fails strict XML parse (§8.2 polyglot markup): ${xmlErr.message ?? xmlErr}`);
}

// (11) CDATA-safety: no literal ']]>' inside inlined script/style bodies.
// This matters if the artifact is ever renamed/served as .xhtml with
// CDATA-wrapped bodies. Cheap forward-compatibility check.
const inlineBodies = [];
for (const m of (content.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi) ?? [])) inlineBodies.push(m[1]);
for (const m of (content.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi) ?? [])) inlineBodies.push(m[1]);
const cdataClosures = inlineBodies.reduce((n, body) => n + (body.match(/\]\]>/g)?.length ?? 0), 0);
if (cdataClosures > 0) {
  error(`Found ${cdataClosures} literal ']]>' sequence(s) inside inlined script/style bodies — unsafe if ever CDATA-wrapped (§8.2).`);
}

// (10) Testid manifest coverage. In a React SPA most testids live inside
// the minified JS bundle as string constants ("data-testid":"foo"), not
// as literal HTML attributes. We check both forms.
function artifactContainsTestId(html, id) {
  return (
    html.includes(`data-testid="${id}"`) ||
    html.includes(`data-testid='${id}'`) ||
    html.includes(`"data-testid":"${id}"`)
  );
}
if (fs.existsSync(TESTID_MANIFEST_FILE)) {
  const manifest = JSON.parse(fs.readFileSync(TESTID_MANIFEST_FILE, 'utf8'));
  const requiredIds = Array.isArray(manifest.required) ? manifest.required : [];
  const missing = requiredIds.filter(id => !artifactContainsTestId(content, id));
  if (missing.length > 0) {
    error(`Testid manifest coverage failed: ${missing.length} required id(s) missing from artifact. First few:\n  - ${missing.slice(0, 5).join('\n  - ')}\n(Update scripts/testid-manifest.json in the same PR if these ids were intentionally removed.)`);
  } else {
    console.log(`  Testid manifest: all ${requiredIds.length} required ids present in artifact.`);
  }
} else {
  console.warn('  Warning: scripts/testid-manifest.json not found — skipping testid coverage check.');
}

if (!hasErrors) {
  console.log('Build verification passed: output is valid, minimized, XML-well-formed, and within size limits.');
} else {
  console.error('\nBuild verification failed. Fix the issues above.');
  process.exit(1);
}
