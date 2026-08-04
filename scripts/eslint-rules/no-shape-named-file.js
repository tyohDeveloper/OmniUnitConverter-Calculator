/**
 * ESLint rule: no-shape-named-file
 *
 * Enforces architecture-standards §3.7. Files and directories must be
 * named for the domain they own, not for a technical shape ("helpers",
 * "utils", "misc", "common"…). The reader must be able to guess whether
 * a change belongs in a given file from the file name alone.
 *
 * What the rule flags:
 *
 *   - A file whose base name (case-insensitive, without extension) is
 *     one of a prohibited shape-name list.
 *   - A hook file whose base name starts with `use` and continues with
 *     a shape name (`useHelpers.ts`, `useSetters.tsx`).
 *   - A file whose path contains a directory segment matching the
 *     prohibited shape-name list.
 *
 * Design decisions on what is NOT prohibited:
 *
 *   - `ui/` (as in `components/ui/`) is a domain (the visual layer),
 *     not a shape.
 *   - `hooks/` is the React-idiomatic organizing convention and names
 *     a domain-adjacent concept (functions that run inside a component
 *     render). Both are widely established elsewhere.
 *   - `lib/` at the top of `client/src/` is a project-layout convention
 *     that names "the pure code" — allowed.
 *
 * Exception: a file carrying "EXCEPTION [architecture-standards §3.7]"
 * in its first 30 lines is allowed. Use this for third-party
 * boilerplate (e.g., shadcn/ui's `lib/utils.ts` housing `cn()`).
 */

// prettier-ignore
const PROHIBITED_BASE_NAMES = new Set([
  'helpers', 'helper',
  'utils', 'util',
  'misc',
  'common',
  'shared',
  'handlers', 'handler',
  'setters', 'setter',
  'getters', 'getter',
  'stuff',
  'things',
  'lib',   // as a file name, not a directory — 'lib.ts' is meaningless
  'index', // 'index.ts' invites barrel behavior; consumers should import the file that owns each symbol
  'types', // types spanning multiple domains belong with their function
]);

// Same list without 'index' and 'types' — these are only leaf-name
// prohibitions; a directory named 'types/' is fine (it names the
// "type files" domain, which is often a well-scoped choice), and
// 'index/' isn't a common directory pattern anyway.
const PROHIBITED_DIR_SEGMENTS = new Set([
  'helpers', 'helper',
  'utils', 'util',
  'misc',
  'common',
  'shared',
  'handlers', 'handler',
  'setters', 'setter',
  'getters', 'getter',
  'stuff',
  'things',
]);

// Shape names in hook form (`useShape.ts`). Matches case-insensitively
// on the character after `use`, so `useHelpers`, `useHandlers`, and
// `useUtils` all trigger.
const HOOK_SHAPE_PATTERN =
  /^use(Helpers?|Utils?|Misc|Common|Shared|Handlers?|Setters?|Getters?|Stuff|Things)$/i;

const EXCEPTION_MARKER = /EXCEPTION\s*\[architecture-standards\s*§?3\.7\]/;

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Files and directories named for domain, not shape (§3.7)',
    },
    schema: [],
    messages: {
      shapeFile:
        'File name "{{name}}" describes a technical shape, not a responsibility. §3.7 requires files to name the domain they own. Rename to a domain name (e.g., what the file does or owns) or, for boilerplate that must retain its conventional name, add "// EXCEPTION [architecture-standards §3.7]" naming the reason.',
      shapeHook:
        'Hook name "{{name}}" describes a technical shape ("a bag of {{shape}}"), not a responsibility. §3.7 requires hooks to name the domain they own (e.g., useConverterClipboard, useLocaleHelpers). If splitting by shape is unavoidable, add "// EXCEPTION [architecture-standards §3.7]" naming the reason.',
      shapeDir:
        'Path contains a directory segment "{{segment}}" that describes a technical shape, not a domain. §3.7 requires directories to name the domain they own. Rename the directory to describe what its files do.',
    },
  },
  create(context) {
    return {
      Program(node) {
        const filename = context.filename || context.getFilename();
        if (!filename || filename === '<input>' || filename === '<text>') return;

        // Check the exception marker before doing any reporting.
        const src = context.sourceCode || context.getSourceCode();
        const firstLines = src.getText().split('\n').slice(0, 30).join('\n');
        if (EXCEPTION_MARKER.test(firstLines)) return;

        // Normalize path and pull leaf + directory segments. We report
        // on the leaf first because that's usually the most actionable
        // fix; directory issues are broader.
        const parts = filename.replace(/\\/g, '/').split('/');
        const leaf = parts[parts.length - 1];
        const baseName = leaf.replace(/\.(ts|tsx|js|jsx|mjs|cjs)$/i, '');
        const baseLower = baseName.toLowerCase();

        // 1) Leaf file name is a bare shape name.
        if (PROHIBITED_BASE_NAMES.has(baseLower)) {
          context.report({ node, messageId: 'shapeFile', data: { name: leaf } });
          return;
        }

        // 2) Hook file named after a shape ('useHelpers', 'useSetters').
        const hookMatch = baseName.match(HOOK_SHAPE_PATTERN);
        if (hookMatch) {
          context.report({
            node,
            messageId: 'shapeHook',
            data: { name: leaf, shape: hookMatch[1].toLowerCase() },
          });
          return;
        }

        // 3) Any directory segment on the path is a shape name.
        //    Only look inside client/src/ — node_modules, dist,
        //    generated code, and top-level project directories aren't
        //    the codebase we're governing.
        const clientIdx = parts.lastIndexOf('src');
        if (clientIdx === -1) return;
        const inside = parts.slice(clientIdx + 1, -1); // dir segments only
        for (const segment of inside) {
          if (PROHIBITED_DIR_SEGMENTS.has(segment.toLowerCase())) {
            context.report({
              node,
              messageId: 'shapeDir',
              data: { segment },
            });
            return;
          }
        }
      },
    };
  },
};
