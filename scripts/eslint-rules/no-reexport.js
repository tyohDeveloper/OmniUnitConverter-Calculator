/**
 * ESLint rule: no-reexport
 *
 * Enforces architecture-standards §3.8. A re-export statement
 * (`export { X } from '...'`, `export type { X } from '...'`, or
 * `export * from '...'`) is prohibited whether it stands alone in a
 * barrel file or is mixed with real content in a functional file.
 *
 * Rationale (see §3.8 in docs/perplexity/architecture-standards.md):
 *
 *   1. Every re-export launders the domain of the symbol. A consumer
 *      that imports X from file A doesn't know whether A owns X or
 *      is forwarding X from somewhere else. That defeats the §3.7
 *      "would a reader know where to look" check by construction.
 *
 *   2. Every re-export multiplies refactor cost. When the underlying
 *      file moves, the forwarder needs updating too.
 *
 *   3. A file that legitimately needs a type in its own annotations
 *      can import it (`import type { X } from '...'`) without also
 *      re-exporting it. Consumers wanting X should import from the
 *      file that owns X, not from an intermediary.
 *
 * Exception: files carrying an `EXCEPTION [architecture-standards §3.8]`
 * comment in their first 30 lines are permitted. The comment must
 * name the migration and the removal deadline (this rule doesn't
 * parse the prose; the human reviewer does).
 */

const EXCEPTION_MARKER = /EXCEPTION\s*\[architecture-standards\s*§?3\.8\]/;

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow re-export statements (§3.8)',
    },
    schema: [],
    messages: {
      reexport:
        'Re-export forbidden by architecture-standards §3.8. Consumers should import "{{name}}" from the file that owns it, not from an intermediary. If this is a temporary migration shim, add "// EXCEPTION [architecture-standards §3.8]" at the top of the file with the migration name and removal deadline.',
      reexportStar:
        'Wildcard re-export forbidden by architecture-standards §3.8. Consumers should import individual symbols from the files that own them, not from an intermediary. If this is a temporary migration shim, add "// EXCEPTION [architecture-standards §3.8]" at the top of the file with the migration name and removal deadline.',
    },
  },
  create(context) {
    // Cache the exception check per file — sourceCode is stable within
    // a lint run for one file, so this is cheap.
    let hasException = null;
    function fileHasException() {
      if (hasException !== null) return hasException;
      const src = context.sourceCode || context.getSourceCode();
      const firstLines = src.getText().split('\n').slice(0, 30).join('\n');
      hasException = EXCEPTION_MARKER.test(firstLines);
      return hasException;
    }

    // Track names introduced by ImportDeclarations. When we later see
    // an `export { X }` (no source) that names one of these bindings,
    // that's still a re-forward — the file is claiming ownership of
    // a symbol it merely imported.
    const importedNames = new Set();

    function reportSpecifier(spec) {
      const exportedName = spec.exported && spec.exported.name;
      context.report({
        node: spec,
        messageId: 'reexport',
        data: { name: exportedName || '<unknown>' },
      });
    }

    return {
      ImportDeclaration(node) {
        for (const spec of node.specifiers || []) {
          // ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier
          // all put the local binding name on spec.local.name.
          if (spec.local && spec.local.name) {
            importedNames.add(spec.local.name);
          }
        }
      },
      // `export { X } from '...'`, `export type { X } from '...'`,
      // or `export { X };` where X was imported earlier.
      ExportNamedDeclaration(node) {
        if (fileHasException()) return;
        // Skip `export const/function/interface/type/class X = ...` —
        // those carry a `declaration` field and are inline exports.
        if (node.declaration) return;

        if (node.source) {
          // export { X } from '...'
          for (const spec of node.specifiers || []) reportSpecifier(spec);
          if (!node.specifiers || node.specifiers.length === 0) {
            context.report({ node, messageId: 'reexportStar' });
          }
          return;
        }

        // export { X }; where X was imported earlier is still a re-forward.
        for (const spec of node.specifiers || []) {
          const local = spec.local && spec.local.name;
          if (local && importedNames.has(local)) {
            reportSpecifier(spec);
          }
        }
      },
      // `export * from '...'` or `export * as ns from '...'`
      ExportAllDeclaration(node) {
        if (fileHasException()) return;
        context.report({ node, messageId: 'reexportStar' });
      },
    };
  },
};
