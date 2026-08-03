# Move Flow-Significant Refs Into Reducers

> **Source.** Generated from the model-council architecture pass in `docs/perplexity/`. See [architecture-pass-council-synthesis.md](../perplexity/architecture-pass-council-synthesis.md) and [architecture-standards.md](../perplexity/architecture-standards.md).
> **Priority.** P1. Distinguish invisible mutable memory from ephemeral UI mechanics.
> **Standards reference.** §2 (state discipline — "Flow-significant memory" class).

## What & Why
Three refs and useStates in `useConverterController.ts:210-215` encode pending domain intent, not ephemeral UI mechanics:

- `pendingPasteUnitRef` — determines the category/unit selected after a paste completes. This is flow-significant, not just a DOM handle.
- `converterPasteStatus` (`useState`) — visible UI state that tests will want to assert.
- `customPasteStatus` (`useState`) — same.

Timer handles (also refs on the same lines) and DOM refs like `rpnXInputRef` are legitimate ephemeral mechanics and stay put.

## Done looks like
- `pendingPasteUnitRef` becomes a typed reducer field on `uiPrefs` (or a new `transient` slice) with actions `SET_PENDING_PASTE_UNIT` and `CLEAR_PENDING_PASTE_UNIT`.
- `converterPasteStatus` and `customPasteStatus` move to reducer state (per pane) with actions to set/clear.
- Timer IDs stay as refs — this task explicitly does not move them.
- Tests exercise the paste-across-category flow via reducer transitions.

## Out of scope
- The auto-compute effect (council-10).
- The X-register focus refs (they belong in `useRpnXEditField` per council-09).

## Tasks
1. **Add reducer fields and actions.** Decide slice (`uiPrefs` vs. new `transient`); document choice in the standards §2 update.
2. **Update the controller.** Replace `useState`/`useRef` with `useReducer`-backed reads and dispatches.
3. **Update selectors and hook consumers.**
4. **Add reducer tests** for each new transition (`tests/reducers.test.ts`).
5. **Update any E2E tests** that were relying on paste-status timing to use deterministic assertions.

## Relevant files
- `client/src/components/unit-converter/hooks/useConverterController.ts`
- `client/src/components/unit-converter/state/uiPrefsReducer.ts` (or new `transientReducer.ts`)
- `client/src/components/unit-converter/state/actions/*.ts`
- `tests/reducers.test.ts`
