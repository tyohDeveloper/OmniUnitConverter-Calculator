# Smart Paste: Better Unrecognised Notice

## What & Why
When Smart Paste can't identify a unit, the only feedback is the button label briefly changing to "Not recognised" for 2 seconds. This is easy to miss and gives the user no useful information about what went wrong or what to do next. A clearer, more descriptive notice will reduce confusion.

## Done looks like
- When Smart Paste fails to recognise a unit, a small informative message appears near the button (e.g. a popover or inline label below the button) with a friendly message such as "Couldn't recognise a unit to convert" or similar natural phrasing
- The message does NOT display any clipboard contents — only the fixed error message
- The message is visible long enough to read (at least 3 seconds) before auto-dismissing
- A suggestion is included pointing the user toward Custom Entry as a fallback, e.g. "Couldn't recognise a unit — try Custom Entry"
- The button itself may still flash red / show "Not recognised" as before, but the new notice is the primary feedback
- The same improvement applies to both the Converter pane and the Custom Entry pane Smart Paste buttons

## Out of scope
- Displaying clipboard contents in the message
- Changing how successful Smart Paste works
- Auto-filling Custom Entry with the unrecognised text
- Modifying the clipboard parsing logic (covered by Task #31)

## Tasks
1. Design and implement the improved unrecognised notice — a popover or inline label near the Smart Paste button that shows a friendly fixed message (e.g. "Couldn't recognise a unit — try Custom Entry") when the paste fails, visible for ~3 seconds before auto-dismissing. No clipboard contents are shown.
2. Apply the same notice pattern to both the converter and custom Smart Paste buttons so the experience is consistent.

## Relevant files
- `client/src/features/unit-converter/app/UnitConverterApp.tsx:476-525`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx:1280-1310`
- `client/src/features/unit-converter/components/ConverterPane.tsx:115-130,450-456`
