# HTML-with-XHTML-Conformant Markup + Final Minimization Pass

> **Source.** Generated from the model-council architecture pass in `docs/perplexity/`. See [architecture-pass-council-synthesis.md](../perplexity/architecture-pass-council-synthesis.md) and [architecture-standards.md](../perplexity/architecture-standards.md).
> **Priority.** P0. Deliverable format compliance.
> **Standards reference.** §8 (single-file offline, XHTML-conformant markup), §14 (final artifact minimization).

## What & Why
The user-stated deliverable is a single file that runs from `file://` with no network, no server, and no packaging — and whose markup meets modern XHTML rules (polyglot). Today the artifact is at `dist/public/index.html` served as `text/html` (correct), but there is no verification that the markup would parse as XML, no CDATA-safety guarantee for inlined JS/CSS, and no final minimization pass that operates on the composed single file.

## Done looks like
- `scripts/verify-build.mjs` strictly XML-parses the artifact after temporarily prepending `<?xml version="1.0" encoding="UTF-8"?>`. Any parse error fails the build.
- Verifier additionally rejects any `src=`, `href=`, `url(…)`, `@import`, or `import(…)` reference to an external URL (`http://`, `https://`, protocol-relative `//`). `data:` URIs are allowed.
- Verifier asserts exactly one file in `dist/public/` after build.
- `npm run build` ends with a final minimization pass (`html-minifier-terser` with the config in §14.3) that operates on Vite's output and produces the shipped artifact. `verify:build` runs after minimization.
- The minifier is configured with `keepClosingSlash: true`, `caseSensitive: true`, `useShortDoctype: false`, and `minifyJS: false` so it does not break §8.2 constraints or strip CDATA wrappers.
- Any inline `<script>` or `<style>` content that could contain literal `<`, `&`, or `]]>` is wrapped in `//<![CDATA[ … //]]>` / `/*<![CDATA[*/ … /*]]>*/`. A verifier check confirms no literal `]]>` appears inside any wrapped block.
- `scripts/build-baseline.json` is updated to record the post-minimization gzip size; the 5% headroom rule continues to apply.

## Out of scope
- Renaming the file to `.xhtml` or serving with an XHTML MIME type (§8.2 explicitly commits to `text/html`).
- Evaluating alternative minimizers (`@swc/html`, `lightningcss`) — separate task, benchmarked per §14.4.

## Tasks
1. **Add `html-minifier-terser` as a devDependency.** Note the shipped-bundle delta (0 bytes, per §7) in the PR body.
2. **Add `scripts/minify-artifact.mjs`.** Reads Vite's `dist/public/index.html`, applies the §14.3 configuration, writes back.
3. **Wire into `package.json`.** `"minify:artifact": "node scripts/minify-artifact.mjs"`; extend the `build` chain: `… && vite build && npm run minify:artifact && npm run verify:build`.
4. **Extend `verify-build.mjs`:**
   - Prepend an XML prolog and pass through a strict XML parser (evaluate `sax`, `fast-xml-parser`, or `htmlparser2` in strict mode — dev-only, size-neutral).
   - Reject external URL patterns as described.
   - Assert single-file output.
   - Assert every `data-testid` value appears exactly once and the total count meets a committed `scripts/testid-manifest.json` (see council-05).
   - Assert no literal `]]>` inside any CDATA-wrapped block.
5. **Update `client/index.html`.** Self-close void elements (`<meta …/>`, `<link …/>`). Verify the current source template doesn't already break XML parsing.
6. **CDATA-wrap inlined content** where minified output could contain `<`, `&`, or comparison operators as text. Vite's inlined `<script type="module">` bodies are the main concern; CSS inside `<style>` too.
7. **Add smoke test.** A Playwright test loads the built artifact from `file://` and asserts the app boots.

## Relevant files
- `scripts/verify-build.mjs`
- `scripts/minify-artifact.mjs` (new)
- `scripts/testid-manifest.json` (new — see council-05)
- `scripts/build-baseline.json`
- `package.json`
- `client/index.html`
- `vite.config.ts` (may need to disable Vite's own HTML minifier if it fights the final pass)
- `tests/e2e/artifact-smoke.e2e.ts` (new)
