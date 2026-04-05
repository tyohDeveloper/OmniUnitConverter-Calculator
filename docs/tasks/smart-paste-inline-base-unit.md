# Smart Paste inline on Base Unit row

## What & Why
The Smart Paste button currently sits in its own row below the "Base unit:" line, which pushes the converter pane down and wastes vertical space. It should sit on the same line as "Base unit:" (right-aligned), and its label should be renamed back to "Smart Paste" (including the error states: "Not recognised" stays, but the default state says "Smart Paste" instead of "Paste").

## Done looks like
- In the Converter tab, the Smart Paste button appears on the right side of the "Base unit:" line — no extra row below the title block.
- In the Custom Entry tab, the Smart Paste button appears on the right side of the subtitle line — no extra row.
- Button label reads "Smart Paste" in the default/ready state (error states "Not recognised" / "Unavailable" remain unchanged).
- The converter pane is no longer pushed down by an extra button row.

## Out of scope
- Any changes to Smart Paste logic or behaviour.
- Styling changes beyond repositioning and the label text.

## Tasks
1. **Inline the button for the Converter tab** — Remove the standalone `<div className="flex justify-end">` button row that renders after the title block for `activeTab === 'converter'`. Instead, convert the `<p>` containing "Base unit:" into a flex row that shows the base unit text on the left and the Smart Paste button on the right, all on one line. Rename the default label from `t('Paste')` to `t('Smart Paste')`.
2. **Inline the button for the Custom Entry tab** — Apply the same treatment to the `activeTab === 'custom'` title block: put the Smart Paste button on the right side of the subtitle line and remove its standalone row. Rename the default label similarly.

## Relevant files
- `client/src/features/unit-converter/app/UnitConverterApp.tsx:1249-1301`
