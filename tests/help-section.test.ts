import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const GITHUB_URL = 'https://github.com/tyohDeveloper/OmniUnitConverter-Calculator';

describe('Help Section GitHub Link', () => {
  const source = readFileSync(
    resolve(__dirname, '../client/src/components/help-section.tsx'),
    'utf-8'
  );

  it('should contain the GitHub URL as an href attribute', () => {
    expect(source).toContain(`href="${GITHUB_URL}"`);
  });

  it('should contain the GitHub URL as visible anchor text', () => {
    const anchorTextPattern = new RegExp(`>\\s*${GITHUB_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<`);
    expect(anchorTextPattern.test(source)).toBe(true);
  });
});
