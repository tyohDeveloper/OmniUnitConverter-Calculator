# Help Section Overlay Panel

## What & Why
The Help section currently lives at the bottom of the main content column, below the calculator pane. This forces users to scroll past all calculator content to reach it, and its presence contributes to unwanted vertical scroll in the app. Moving it to an on-demand overlay panel removes it from the page flow entirely, eliminating that scroll pressure and keeping the help content accessible on request.

## Done looks like
- The Help section no longer appears in the main page layout (no inline rendering below the calculator)
- A standard info button — a flat blue filled circle containing a white "i" — appears to the right of the app title ("OmniUnit & Calculator") in the header
- Clicking the info button opens a Help panel that overlays the app content (covers most of the viewport)
- The Help panel is scrollable so all content remains accessible regardless of screen height
- A standard close mechanism (an "×" / close button, clearly visible) dismisses the panel
- Clicking outside the panel (the backdrop) also closes it
- The panel open/close state is local UI state (no persistence needed)
- The existing `HelpSection` component content is preserved exactly as-is; only its container changes

## Out of scope
- Changing any text or links inside the Help section
- Animations beyond a simple fade or slide (keep it simple)
- Persisting open/closed state between sessions

## Tasks
1. **Add info button to header** — Place a standard blue circle info button (`ⓘ`) to the right of the app title text in the page header. Clicking it toggles the help panel open. Wire up open state (boolean) at the Home page or header level.

2. **Build Help overlay panel** — Create a modal/panel component that wraps the existing `HelpSection`. It should render as a fixed overlay covering most of the viewport, be scrollable internally, and include a visible close button (×) in the top-right corner of the panel. Clicking the backdrop also closes it.

3. **Remove inline HelpSection from main layout** — Delete the `HelpSection` render from the bottom of `UnitConverterApp`'s right column. Ensure no residual spacing or placeholder remains.

## Relevant files
- `client/src/pages/home.tsx`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
- `client/src/components/help-section.tsx`
