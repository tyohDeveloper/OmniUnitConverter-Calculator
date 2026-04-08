# Fix Quantities Sidebar Sticky Scroll

## What & Why
The quantities (category) sidebar uses `sticky top-0 h-fit`. This works when the page is short, but when the Help section is visible the page becomes very tall and the sidebar stays permanently "stuck" at the top. Because the sidebar has no maximum height or internal scroll, categories near the bottom of the list become unreachable — the user can only access them by scrolling far enough to reach the natural end of the page, which is now beyond the bottom of the viewport.

## Done looks like
- All category buttons in the sidebar are always reachable, regardless of whether the Help section is visible.
- The sidebar scrolls internally when its content is taller than the viewport.
- The sidebar still sticks to the top of the viewport as the user scrolls down the page.
- The visible selected category does not jump or disappear when the Help section appears or disappears.

## Out of scope
- Changes to the Help section itself.
- Any change to the main content layout or the calculator pane.

## Tasks
1. **Constrain sidebar height and enable internal scroll** — Add `max-h-screen overflow-y-auto` (or equivalent, e.g. `max-h-[calc(100vh-Xpx)]` to account for any page padding) to the sticky sidebar `<nav>` element so that it caps at viewport height and scrolls internally when the category list overflows.

## Relevant files
- `client/src/features/unit-converter/app/UnitConverterApp.tsx:1333-1368`
