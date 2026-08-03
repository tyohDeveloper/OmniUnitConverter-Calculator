# Consolidate useAllFlashFlags Into a Single Flag-Map Hook

> **Source.** Generated from the model-council architecture pass in `docs/perplexity/`. See [architecture-pass-council-synthesis.md](../perplexity/architecture-pass-council-synthesis.md) and [architecture-standards.md](../perplexity/architecture-standards.md).
> **Priority.** P2. Small cleanup, symptomatic of ad-hoc growth in the transient-UI layer.
> **Standards reference.** §2 (state discipline — "Transient UI state" class).

## What & Why
`client/src/components/unit-converter/hooks/useFlashFlag.ts:48-65` (`useAllFlashFlags`) instantiates **15 separate `useFlashFlag` hook instances**, one per flash target. GPT 5.6 Sol flagged this in the council pass: it works, but it is 15 timers, 15 state cells, and 15 identical setup/teardown paths where one flag-map + one timer per active key would do.

## Done looks like
- A single `useFlashFlagMap()` hook manages all flash states in one `Record<string, boolean>` (or a small reducer slice), with one `triggerFlash(key)` action.
- The 15 individual hook instances collapse into one map instance.
- Existing consumers read the map the same way (or via a compatibility shim).
- `tests/hooks.test.ts` retains behavioral coverage of every flash target.
- The `FlashFlags` type at `ConverterContext.tsx:6` is preserved as the public contract; internal implementation is what changes.

## Out of scope
- Any change to which events trigger flashes or how long they last (`FLASH_DURATION_MS` stays as-is).
- Moving flash state into the main reducer (transient UI state is legitimately hook-owned per §2).

## Tasks
1. **Introduce `useFlashFlagMap`.** New file `client/src/components/unit-converter/hooks/useFlashFlagMap.ts` (single export, ≤50 lines). Manages a `Record<string, number>` of active-timer IDs and a `Record<string, boolean>` of flag states.
2. **Rewrite `useAllFlashFlags`.** Now returns an object shaped like the current `FlashFlags` interface, delegating to the map hook.
3. **Update tests.** `tests/hooks.test.ts` covers concurrent flashes, overlapping triggers, and cleanup.
4. **Delete the 15 individual `useFlashFlag` calls** in `useAllFlashFlags`. The single-key `useFlashFlag` may remain if any other caller uses it; otherwise delete it too.

## Relevant files
- `client/src/components/unit-converter/hooks/useFlashFlag.ts`
- `client/src/components/unit-converter/hooks/useFlashFlagMap.ts` (new)
- `client/src/components/unit-converter/context/ConverterContext.tsx`
- `tests/hooks.test.ts`
