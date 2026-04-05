# Smart Paste — Phase 2 Backlog

## What & Why
This is a holding task for smart paste ideas that are intentionally deferred from Phase 1. Nothing should be implemented here until Phase 1 is complete and the team decides to proceed.

## Ideas to preserve

### Compound unit navigation ("45N*m" → Torque)
Parsing expressions with `*`, `/`, `⋅`, `×` operators between unit tokens and resolving them to a specific quantity. `parseUnitText` already computes dimensions for compound expressions, but does not resolve them to a converter category. The mapping from dimension signature → category needs to be surfaced as navigation.

### Feet-inches format ("6'7"" → Length, ft_in entry)
Detecting the `D'D"` pattern and routing to the Length converter with the ft_in sub-format selected, populating the entry field with the full string. The app already handles ft_in *display*; parsing it back on paste is the gap.

### Paste-while-focused interception
When the entry field has focus and the user pastes a "value + unit" string (e.g. "12J"), intercept the paste event and treat it as a smart paste navigation rather than literal text insertion. Needs a heuristic so normal numeric editing (pasting "42") is not broken — only fire when the clipboard text contains a recognisable unit suffix.

### Full archaic and specialty unit coverage
Ensuring every archaic and specialty unit symbol (e.g. "minim", "li", "lea", "fur") is covered by `parseUnitText` and routes correctly even when the same abbreviation appears in multiple categories.

## Out of scope
Everything here is out of scope until Phase 1 is delivered and approved.

## Done looks like
N/A — this is a backlog item, not an implementation task.

## Tasks
No tasks. This item exists only to preserve the ideas above for future planning.

## Relevant files
- `client/src/lib/conversion-data.ts`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
- `tests/smart-paste.test.ts`
