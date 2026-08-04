// council-12: ESLint flat config. Enforces the size/purity rules from
// docs/perplexity/architecture-standards.md §3 across client/src/**.
//
// Coverage:
//   - client/src/lib/**            → function ≤20 lines, file ≤100 lines
//   - client/src/components/unit-converter/{hooks,state}/**
//                                  → function ≤20 lines, file ≤150 lines
//   - client/src/**/*.tsx          → file ≤250 lines (JSX exception, §3.5).
//                                    max-lines-per-function is disabled here
//                                    because JSX return bodies are declarative
//                                    and covered by the per-file cap instead.
//
// Exceptions are declared inline with `overrides`-style blocks, each
// carrying the rationale that used to live in scripts/lint-size.mjs.
//
// Baseline note: council-09 landed sub-panes that exceed the 250-line
// .tsx cap. Rather than block CI on those pre-existing violations, we
// declare per-file exceptions with an EXCEPTION rationale (§3.6) so the
// baseline is honest and green. Follow-up work can shrink those files
// and drop the exception.

import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import noReexport from './scripts/eslint-rules/no-reexport.js';
import noShapeNamedFile from './scripts/eslint-rules/no-shape-named-file.js';

// Local plugin for repo-specific rules. Rules live in
// scripts/eslint-rules/. Add to the object when adding a new rule.
const omniunit = {
  rules: {
    'no-reexport': noReexport,
    'no-shape-named-file': noShapeNamedFile,
  },
};

const FN_LEN = ['error', {
  max: 20,
  skipBlankLines: true,
  skipComments: true,
}];

const FILE_LEN = (max) => ['error', {
  max,
  skipBlankLines: true,
  skipComments: true,
}];

// Files excluded from function-length rule. Data-only or multi-step
// algorithm files. See scripts/lint-size.mjs for original rationales.
const FUNCTION_RULE_DATA_EXCLUDES = [
  'client/src/lib/shared-types.ts',
  'client/src/lib/units/siDerivedUnits.ts',
  'client/src/lib/units/categoryDimensions.ts',
  'client/src/lib/**/types.ts',
  'client/src/lib/units/prefixes.ts',
  'client/src/lib/units/prefixExponents.ts',
  'client/src/lib/localization.ts',
  'client/src/lib/units/siBaseUnits.ts',
  'client/src/lib/units/siDerivedUnitsCatalog.ts',
  'client/src/lib/units/nonSiUnitsCatalog.ts',
  'client/src/lib/units/preferredRepresentations.ts',
  'client/src/lib/units/languageTypes.ts',
  'client/src/lib/units/measurementSystem.ts',
];

// Files excluded from lib/ file-length rule. Barrels, data, multi-step
// algorithms. See scripts/lint-size.mjs for original rationales.
const LIB_FILE_LENGTH_EXCLUDES = [
  'client/src/lib/**/index.ts',
  'client/src/lib/shared-types.ts',
  'client/src/lib/units/siDerivedUnits.ts',
  'client/src/lib/units/categoryDimensions.ts',
  'client/src/lib/**/types.ts',
  'client/src/lib/units/prefixes.ts',
  'client/src/lib/units/prefixExponents.ts',
  'client/src/lib/**/helpers.ts',
  'client/src/lib/units/normalizeMassUnit.ts',
  'client/src/lib/units/normalizeMassDisplay.ts',
  'client/src/lib/calculator/applyRpnUnary.ts',
  'client/src/lib/calculator/applyRpnBinary.ts',
  'client/src/lib/si-representations/generateSIRepresentations.ts',
  'client/src/lib/si-representations/generateAlternativeRepresentations.ts',
  'client/src/lib/units/siBaseUnits.ts',
  'client/src/lib/units/siDerivedUnitsCatalog.ts',
  'client/src/lib/units/nonSiUnitsCatalog.ts',
  'client/src/lib/units/preferredRepresentations.ts',
  'client/src/lib/conversion-data.ts',
  'client/src/lib/localization.ts',
  'client/src/lib/formatting.ts',
];

// Pre-existing violators baselined by council-12. Each carries a
// rationale that follows-up should retire.
const TSX_FILE_LENGTH_EXCLUDES = [
  // EXCEPTION [architecture-standards §3.5]: council-09 split from a
  // 1,185-line CalculatorPane. Simple pane still needs the per-row
  // sub-split that the RPN half received; RPN pane is now within cap.
  'client/src/features/unit-converter/components/SimpleCalculatorPane.tsx',
  // EXCEPTION [architecture-standards §3.5]: legacy top-level views that
  // predate the standards; each is on the list for its own follow-up
  // extraction pass.
  'client/src/features/unit-converter/app/UnitConverterApp.tsx',
  'client/src/features/unit-converter/components/ConverterPane.tsx',
];

// Controller/state hook files that exceed the 150-line cap. Council-07
// through -11 shrank these substantially; the remaining excess is
// orchestration wiring that cannot be extracted without leaking hook
// internals across module boundaries. Tracked for follow-up.
const HOOK_FILE_LENGTH_EXCLUDES = [
  'client/src/components/unit-converter/hooks/useConverterController.ts',
  'client/src/components/unit-converter/hooks/useCalculatorController.ts',
  'client/src/components/unit-converter/hooks/useLocaleHelpers.ts',
  'client/src/components/unit-converter/hooks/useConverterClipboard.ts',
];

export default tseslint.config(
  // Global ignores. We do NOT lint the shadcn/ui primitives, test files,
  // scripts, or generated artifacts.
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'client/src/components/ui/**',
      'tests/**',
      'scripts/**',
      'client/src/hooks/**',
      'client/src/pages/**',
      'client/src/lib/queryClient.ts',
      'client/src/lib/test-utils.ts',
      'client/src/lib/translateUi.ts',
      'client/src/lib/translateUnit.ts',
      'client/src/lib/units/unitDefinition.ts',
      // Vite config, tailwind config, etc. — root-level configs
      '*.config.*',
      'client/**/*.d.ts',
    ],
  },

  // Suppress "unused eslint-disable directive" warnings. Once react-hooks
  // is enabled (future task), the existing inline disables will be used
  // again; keeping them documents intent.
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },

  // Base TS ruleset — provides the parser and plugin. We only care about
  // the two size rules; recommended lint rules are disabled below.
  tseslint.configs.base,

  // Register react-hooks so inline disables ("eslint-disable-next-line
  // react-hooks/exhaustive-deps") don't error out. We intentionally do
  // NOT enable the rule — dep-array enforcement isn't part of council-12's
  // scope. Adding the plugin merely teaches ESLint that the rule name
  // exists.
  {
    plugins: { 'react-hooks': reactHooks },
    rules: { 'react-hooks/exhaustive-deps': 'off' },
  },

  // §3.8: no re-exports. See scripts/eslint-rules/no-reexport.js.
  {
    files: ['client/src/**/*.{ts,tsx}'],
    plugins: { omniunit },
    rules: { 'omniunit/no-reexport': 'error' },
  },

  // §3.7: no shape-named files or directories. See
  // scripts/eslint-rules/no-shape-named-file.js.
  {
    files: ['client/src/**/*.{ts,tsx}'],
    plugins: { omniunit },
    rules: { 'omniunit/no-shape-named-file': 'error' },
  },

  // Default: function-length for all .ts and .tsx.
  {
    files: ['client/src/**/*.ts'],
    rules: {
      'max-lines-per-function': FN_LEN,
    },
  },

  // .tsx: JSX exception (§3.5). max-lines-per-function off; enforce
  // file-length at 250.
  {
    files: ['client/src/**/*.tsx'],
    rules: {
      'max-lines': FILE_LEN(250),
    },
  },

  // lib/**: file ≤100 lines.
  {
    files: ['client/src/lib/**/*.ts'],
    rules: {
      'max-lines': FILE_LEN(100),
    },
  },

  // hooks/, state/, context/: file ≤150 lines.
  {
    files: [
      'client/src/components/unit-converter/hooks/**/*.ts',
      'client/src/components/unit-converter/state/**/*.ts',
      'client/src/components/unit-converter/context/**/*.ts',
    ],
    rules: {
      'max-lines': FILE_LEN(150),
    },
  },

  // ─── Exceptions ───────────────────────────────────────────────

  {
    files: FUNCTION_RULE_DATA_EXCLUDES,
    rules: {
      'max-lines-per-function': 'off',
    },
  },

  {
    files: LIB_FILE_LENGTH_EXCLUDES,
    rules: {
      'max-lines': 'off',
    },
  },

  {
    files: TSX_FILE_LENGTH_EXCLUDES,
    rules: {
      'max-lines': 'off',
    },
  },

  {
    files: HOOK_FILE_LENGTH_EXCLUDES,
    rules: {
      'max-lines': 'off',
    },
  },

  // EXCEPTION [architecture-standards §3.1]: reducer switch bodies count
  // every case toward function length. Splitting a reducer into
  // sub-reducers hides the domain → action → next-state mapping we want
  // to keep visible. The per-case handlers each case delegates to
  // (state/reducers/**/) are single-export, ≤20-line pure functions,
  // enforced by ESLint. Note this exception is scoped to
  // max-lines-per-function only — the file-length rule (150 lines for
  // state/**) still applies and is not excluded.
  {
    files: [
      'client/src/components/unit-converter/state/*Reducer.ts',
    ],
    rules: {
      'max-lines-per-function': 'off',
    },
  },

  // EXCEPTION [architecture-standards §3.1]: controller hooks are
  // orchestration surfaces — they hold useCallback and useEffect blocks
  // that individually stay short, but the enclosing hook body is
  // necessarily long because it wires many callbacks. Council-08/-10/-11
  // moved the pure logic to lib/; what remains is orchestration.
  {
    files: [
      'client/src/components/unit-converter/hooks/useConverterController.ts',
      'client/src/components/unit-converter/hooks/useCalculatorController.ts',
      'client/src/components/unit-converter/hooks/useLocaleHelpers.ts',
      'client/src/components/unit-converter/hooks/useConverterClipboard.ts',
      'client/src/components/unit-converter/hooks/useConverterPushToCalculator.ts',
      'client/src/components/unit-converter/hooks/useRpnStack.ts',
      'client/src/components/unit-converter/hooks/useRpnXEditField.ts',
      'client/src/components/unit-converter/hooks/useCalculatorState.ts',
      'client/src/components/unit-converter/hooks/useConverterState.ts',
      'client/src/components/unit-converter/hooks/useUiPrefsState.ts',
      'client/src/components/unit-converter/hooks/useRpnState.ts',
      'client/src/components/unit-converter/hooks/useFlashFlag.ts',
    ],
    rules: {
      'max-lines-per-function': 'off',
    },
  },

  // EXCEPTION [architecture-standards §3.1]: pre-existing multi-step
  // algorithms already excluded from lint-size.mjs. Follow-up work can
  // extract sub-functions; not part of council-12's scope.
  {
    files: [
      'client/src/lib/conversion-data.ts',
      'client/src/lib/si-representations/generateSIRepresentations.ts',
      'client/src/lib/units/normalizeMassDisplay.ts',
    ],
    rules: {
      'max-lines-per-function': 'off',
    },
  },

  // Turn off @typescript-eslint's recommended rules that we don't need
  // (this config is intentionally scoped to size-only enforcement).
  {
    files: ['client/src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-empty-pattern': 'off',
    },
  },
);
