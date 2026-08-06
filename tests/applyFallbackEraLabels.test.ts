import { describe, it, expect } from 'vitest';
import { applyFallbackEraLabels } from '@/lib/calculator/applyFallbackEraLabels';

/**
 * applyFallbackEraLabels defends against a class of CLDR output where
 * the era name for Coptic or Ethiopic dates is not localized and shows
 * up as the literal placeholder 'ERA1' (post-epoch) or 'ERA0' (pre-
 * epoch) in Intl.DateTimeFormat output.
 *
 * In the Node version pinned by this repo, CLDR currently renders the
 * conventional AM/AA labels natively for Coptic and Ethiopic, and drops
 * the era label entirely for pre-Diocletian Coptic dates rather than
 * emitting 'ERA0'. So these substitutions are defensive against browser
 * environments (older Chromium, Safari, Firefox) where the CLDR data
 * bundled with the runtime is more limited.
 *
 * The tests below use synthetic 'ERA1'/'ERA0' inputs to exercise the
 * substitution logic directly, independent of whichever CLDR the test
 * runner happens to bundle.
 */

describe('applyFallbackEraLabels: unrecognized calendars are no-ops', () => {
  it('returns input unchanged for gregory', () => {
    expect(applyFallbackEraLabels('August 5, 2026 AD', 'gregory')).toBe('August 5, 2026 AD');
  });

  it('returns input unchanged for hebrew (has its own era labels in CLDR)', () => {
    expect(applyFallbackEraLabels('22 Av 5786 AM', 'hebrew')).toBe('22 Av 5786 AM');
  });

  it('returns input unchanged for islamic-umalqura', () => {
    expect(applyFallbackEraLabels('Safar 22, 1448 AH', 'islamic-umalqura')).toBe('Safar 22, 1448 AH');
  });

  it('returns input unchanged when text contains no placeholders', () => {
    expect(applyFallbackEraLabels('Epep 29, 1742 AM', 'coptic')).toBe('Epep 29, 1742 AM');
  });
});

describe('applyFallbackEraLabels: Coptic', () => {
  it('substitutes ERA1 with AM (Anno Martyrum)', () => {
    expect(applyFallbackEraLabels('Epep 29, 1742 ERA1', 'coptic')).toBe('Epep 29, 1742 AM');
  });

  it('substitutes ERA0 with BD (Before Diocletian)', () => {
    // Pre-Diocletian Coptic dates use the Before Diocletian era in
    // academic convention; 'BD' is the standard abbreviation.
    expect(applyFallbackEraLabels('Baramhat 20, 185 ERA0', 'coptic')).toBe('Baramhat 20, 185 BD');
  });

  it('substitutes both placeholders when both appear (defensive)', () => {
    expect(applyFallbackEraLabels('ERA1 ... ERA0', 'coptic')).toBe('AM ... BD');
  });
});

describe('applyFallbackEraLabels: Ethiopic', () => {
  it('substitutes ERA1 with AM (Amätä Məḥrät, post-incarnation)', () => {
    expect(applyFallbackEraLabels('Hamle 29, 2018 ERA1', 'ethiopic')).toBe('Hamle 29, 2018 AM');
  });

  it('substitutes ERA0 with AA (Amätä Aläm, pre-incarnation)', () => {
    expect(applyFallbackEraLabels('Meskerem 1, 100 ERA0', 'ethiopic')).toBe('Meskerem 1, 100 AA');
  });
});

describe('applyFallbackEraLabels: ethioaa (Amätä Aläm single-era)', () => {
  it('substitutes ERA1 with AA (ethioaa has only the Amätä Aläm era)', () => {
    // The ethioaa calendar is single-era: every year is Amätä Aläm.
    // Whether CLDR labels it ERA1 or ERA0 in a degraded environment,
    // the correct fallback is AA in both cases.
    expect(applyFallbackEraLabels('Hamle 29, 7518 ERA1', 'ethioaa')).toBe('Hamle 29, 7518 AA');
  });

  it('substitutes ERA0 with AA (same era; both placeholders map to AA)', () => {
    expect(applyFallbackEraLabels('Hamle 29, 7518 ERA0', 'ethioaa')).toBe('Hamle 29, 7518 AA');
  });
});

describe('applyFallbackEraLabels: locale-agnostic (Latin-script labels)', () => {
  // The substitutions use Latin-script romanizations across all
  // locales. Rendering 西暦 alongside AM in a Japanese Coptic output
  // is by policy — CLDR has no locale-specific labels for these
  // calendars' eras, and the academic romanizations are the
  // recognized cross-language conventions.
  it('applies substitution regardless of surrounding locale-specific text', () => {
    expect(applyFallbackEraLabels('ERA11742年11月29日', 'coptic')).toBe('AM1742年11月29日');
  });

  it('applies substitution to Arabic RTL text', () => {
    expect(applyFallbackEraLabels('29 أبيب 1742 ERA1', 'coptic')).toBe('29 أبيب 1742 AM');
  });
});
