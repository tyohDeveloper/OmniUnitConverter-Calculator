# Fix Converter Unit Dropdown Scroll

## What & Why
The "To" unit dropdown in the converter pane doesn't scroll far enough when there are many units (e.g. Archaic Length), causing units like "league" at the bottom of the list to be unreachable. The same can affect the "From" unit dropdown and the prefix dropdowns.

The root cause: Radix's Select uses `position="popper"` by default, and in that mode the inner viewport is height-constrained to `--radix-select-trigger-height` (the trigger button's pixel height), not the available popup space. This means even though the outer content div has `max-h` and `overflow-y-auto`, the viewport clips the list too aggressively.

## Done looks like
- Opening the "To" (or "From") unit dropdown for Archaic Length shows all units and scrolls smoothly to the bottom of the list.
- "league" and any other bottom-of-list unit can be selected.
- Scroll up/down buttons (or native scroll) work for any category with many units.
- No visual regression in other dropdowns (prefix, From unit).

## Out of scope
- Changing which units are available in Archaic Length or any other category.
- Any other converter pane changes.

## Tasks
1. **Fix dropdown scroll mode** — Switch the From unit, To unit, and prefix `SelectContent` components in `ConverterPane.tsx` from the default `position="popper"` to `position="item-aligned"`. This removes the viewport height constraint that causes the scroll to be too shallow. Verify the dropdown is scrollable across all items in Archaic Length (and other long lists) without cutting off entries.

## Relevant files
- `client/src/features/unit-converter/components/ConverterPane.tsx:352-391`
- `client/src/components/ui/select.tsx:70-99`
