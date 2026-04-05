# Test Help Section GitHub Link

## What & Why
Add a Vitest test that verifies the help-section component contains a link pointing to the correct GitHub repository URL. This ensures the link won't silently break if the file is edited in the future.

## Done looks like
- A new test file exists at `tests/help-section.test.ts`
- The test reads the help-section source file and asserts that the GitHub URL `https://github.com/tyohDeveloper/OmniUnitConverter-Calculator` appears as both the `href` attribute and the visible link text
- The test passes when running the existing test suite

## Out of scope
- Testing any other content in the help section
- End-to-end browser rendering tests

## Tasks
1. Create `tests/help-section.test.ts` with a test that reads `client/src/components/help-section.tsx` as a string and asserts the URL `https://github.com/tyohDeveloper/OmniUnitConverter-Calculator` is present in both the `href` and the anchor text.

## Relevant files
- `client/src/components/help-section.tsx`
- `tests/localization.test.ts`
