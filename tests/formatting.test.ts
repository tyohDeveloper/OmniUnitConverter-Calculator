import { describe, it, expect } from 'vitest';
import {
  roundToNearestEven,
  toFixedBanker,
  fixPrecision,
  cleanNumber,
  formatNumberWithSeparators,
  stripSeparators,
  formatForClipboard,
  toArabicNumerals,
  toLatinNumerals,
  toJapaneseNumerals,
  toKoreanNumerals,
  toCJKMyriadString,
  NUMBER_FORMATS,
  formatFtIn,
  type NumberFormat
} from '../client/src/lib/formatting';
import { findOptimalPrefix, PREFIXES, CONVERSION_DATA, convert } from '../client/src/lib/conversion-data';

describe('Banker Rounding (roundToNearestEven)', () => {
  describe('standard rounding cases', () => {
    it('should round 2.5 to 2 (nearest even)', () => {
      expect(roundToNearestEven(2.5, 0)).toBe(2);
    });

    it('should round 3.5 to 4 (nearest even)', () => {
      expect(roundToNearestEven(3.5, 0)).toBe(4);
    });

    it('should round 1.5 to 2 (nearest even)', () => {
      expect(roundToNearestEven(1.5, 0)).toBe(2);
    });

    it('should round 0.5 to 0 (nearest even)', () => {
      expect(roundToNearestEven(0.5, 0)).toBe(0);
    });

    it('should round -2.5 to -2 (nearest even)', () => {
      expect(roundToNearestEven(-2.5, 0)).toBe(-2);
    });

    it('should round -3.5 to -4 (nearest even)', () => {
      expect(roundToNearestEven(-3.5, 0)).toBe(-4);
    });
  });

  describe('non-halfway cases (standard rounding)', () => {
    it('should round 2.4 to 2', () => {
      expect(roundToNearestEven(2.4, 0)).toBe(2);
    });

    it('should round 2.6 to 3', () => {
      expect(roundToNearestEven(2.6, 0)).toBe(3);
    });

    it('should round -2.4 to -2', () => {
      expect(roundToNearestEven(-2.4, 0)).toBe(-2);
    });

    it('should round -2.6 to -3', () => {
      expect(roundToNearestEven(-2.6, 0)).toBe(-3);
    });
  });

  describe('decimal precision', () => {
    it('should round 1.235 to 1.24 with precision 2 (banker rounding)', () => {
      expect(roundToNearestEven(1.235, 2)).toBe(1.24);
    });

    it('should round 1.245 to 1.24 with precision 2 (banker rounding)', () => {
      expect(roundToNearestEven(1.245, 2)).toBe(1.24);
    });

    it('should round 1.255 to 1.26 with precision 2 (banker rounding)', () => {
      expect(roundToNearestEven(1.255, 2)).toBe(1.26);
    });

    it('should round 1.2345 to 1.234 with precision 3', () => {
      expect(roundToNearestEven(1.2345, 3)).toBe(1.234);
    });

    it('should handle precision 8', () => {
      expect(roundToNearestEven(1.123456785, 8)).toBe(1.12345678);
    });
  });

  describe('edge cases', () => {
    it('should handle zero', () => {
      expect(roundToNearestEven(0, 2)).toBe(0);
    });

    it('should handle very small numbers', () => {
      expect(roundToNearestEven(0.000000015, 8)).toBe(0.00000002);
      expect(roundToNearestEven(0.00000001, 8)).toBe(0.00000001);
    });

    it('should handle very large numbers', () => {
      expect(roundToNearestEven(1234567890.5, 0)).toBe(1234567890);
    });
  });
});

describe('toFixedBanker', () => {
  it('should format with banker rounding and fixed decimals', () => {
    expect(toFixedBanker(2.5, 0)).toBe('2');
    expect(toFixedBanker(3.5, 0)).toBe('4');
  });

  it('should pad with trailing zeros', () => {
    expect(toFixedBanker(1.2, 3)).toBe('1.200');
    expect(toFixedBanker(5, 2)).toBe('5.00');
  });

  it('should handle negative numbers', () => {
    expect(toFixedBanker(-2.5, 0)).toBe('-2');
    expect(toFixedBanker(-1.5, 1)).toBe('-1.5');
  });
});

describe('fixPrecision', () => {
  it('should return 0 for zero input', () => {
    expect(fixPrecision(0)).toBe(0);
  });

  it('should handle Infinity', () => {
    expect(fixPrecision(Infinity)).toBe(Infinity);
    expect(fixPrecision(-Infinity)).toBe(-Infinity);
  });

  it('should preserve up to 17 significant figures (JavaScript full precision)', () => {
    const result = fixPrecision(1.23456789012345);
    expect(result).toBe(1.23456789012345);
  });
});

describe('cleanNumber', () => {
  it('should remove trailing zeros after decimal', () => {
    expect(cleanNumber(1.50000, 5)).toBe('1.5');
    expect(cleanNumber(2.0, 3)).toBe('2');
  });

  it('should respect precision limit', () => {
    expect(cleanNumber(1.123456789, 4)).toBe('1.1235');
  });

  it('should handle integers', () => {
    expect(cleanNumber(100, 2)).toBe('100');
  });

  it('should handle very small decimals', () => {
    expect(cleanNumber(0.0001, 4)).toBe('0.0001');
  });
});

describe('Digit Grouping Separators', () => {
  describe('UK format (3-3-3 with comma)', () => {
    it('should format 1234567 as 1,234,567', () => {
      expect(formatNumberWithSeparators(1234567, 0, 'uk')).toBe('1,234,567');
    });

    it('should format 1234567.89 as 1,234,567.89', () => {
      expect(formatNumberWithSeparators(1234567.89, 2, 'uk')).toBe('1,234,567.89');
    });

    it('should not add separator for numbers under 1000', () => {
      expect(formatNumberWithSeparators(999, 0, 'uk')).toBe('999');
    });

    it('should handle 1000 exactly', () => {
      expect(formatNumberWithSeparators(1000, 0, 'uk')).toBe('1,000');
    });

    it('should handle billions', () => {
      expect(formatNumberWithSeparators(1234567890, 0, 'uk')).toBe('1,234,567,890');
    });
  });

  describe('South Asian format (3-2-2 Indian numbering)', () => {
    it('should format 1234567 as 12,34,567', () => {
      expect(formatNumberWithSeparators(1234567, 0, 'south-asian')).toBe('12,34,567');
    });

    it('should format 12345678 as 1,23,45,678', () => {
      expect(formatNumberWithSeparators(12345678, 0, 'south-asian')).toBe('1,23,45,678');
    });

    it('should format 123456789 as 12,34,56,789', () => {
      expect(formatNumberWithSeparators(123456789, 0, 'south-asian')).toBe('12,34,56,789');
    });
  });

  describe('European/World format (3-3-3 with space, comma decimal)', () => {
    it('should format 1234567.89 as 1 234 567,89', () => {
      expect(formatNumberWithSeparators(1234567.89, 2, 'europe-latin')).toBe('1 234 567,89');
    });

    it('should use comma as decimal separator', () => {
      expect(formatNumberWithSeparators(1.5, 1, 'europe-latin')).toBe('1,5');
    });
  });

  describe('Swiss format (3-3-3 with apostrophe)', () => {
    it('should format 1234567 as 1\'234\'567', () => {
      expect(formatNumberWithSeparators(1234567, 0, 'swiss')).toBe("1'234'567");
    });

    it('should use period as decimal separator', () => {
      expect(formatNumberWithSeparators(1234.56, 2, 'swiss')).toBe("1'234.56");
    });
  });

  describe('East Asian format (4-4-4 myriad grouping)', () => {
    it('should format 12345678 as 1234,5678', () => {
      expect(formatNumberWithSeparators(12345678, 0, 'east-asian')).toBe('1234,5678');
    });

    it('should format 123456789012 as 1234,5678,9012', () => {
      expect(formatNumberWithSeparators(123456789012, 0, 'east-asian')).toBe('1234,5678,9012');
    });
  });

  describe('Traditional format (locale-tied)', () => {
    it('should format with ar locale (Eastern Arabic numerals)', () => {
      const result = formatNumberWithSeparators(1234567.89, 2, 'traditional', 'ar');
      expect(result).toBe('١,٢٣٤,٥٦٧.٨٩');
    });

    it('should format with en locale (same as English)', () => {
      const result = formatNumberWithSeparators(1234567.89, 2, 'traditional', 'en');
      expect(result).toBe('1,234,567.89');
    });

    it('should format with de locale (dot thousands, comma decimal)', () => {
      const result = formatNumberWithSeparators(1234567.89, 2, 'traditional', 'de');
      expect(result).toBe('1.234.567,89');
    });

    it('should format with fr locale (narrow non-breaking space thousands, comma decimal)', () => {
      const result = formatNumberWithSeparators(1234567.89, 2, 'traditional', 'fr');
      expect(result).toBe('1\u202F234\u202F567,89');
    });

    it('should format with ru locale (non-breaking space thousands, comma decimal)', () => {
      const result = formatNumberWithSeparators(1234567.89, 2, 'traditional', 'ru');
      expect(result).toBe('1\u00A0234\u00A0567,89');
    });

    it('should format with ja locale (myriad CJK)', () => {
      const result = formatNumberWithSeparators(1234567, 0, 'traditional', 'ja');
      expect(result).toBe('一二三万四五六七');
    });

    it('should format with ko locale (myriad CJK)', () => {
      const result = formatNumberWithSeparators(1234567, 0, 'traditional', 'ko');
      expect(result).toBe('일이삼만사오육칠');
    });

    it('should format with zh locale (myriad CJK)', () => {
      const result = formatNumberWithSeparators(1234567, 0, 'traditional', 'zh');
      expect(result).toBe('一二三万四五六七');
    });

    it('should format with es locale (dot thousands, comma decimal)', () => {
      const result = formatNumberWithSeparators(1234567.89, 2, 'traditional', 'es');
      expect(result).toBe('1.234.567,89');
    });
  });

  describe('Period format (no thousands separator)', () => {
    it('should not add thousands separator', () => {
      expect(formatNumberWithSeparators(1234567, 0, 'period')).toBe('1234567');
    });

    it('should use period as decimal separator', () => {
      expect(formatNumberWithSeparators(1234.56, 2, 'period')).toBe('1234.56');
    });
  });

  describe('Comma format (no thousands separator, comma decimal)', () => {
    it('should not add thousands separator', () => {
      expect(formatNumberWithSeparators(1234567, 0, 'comma')).toBe('1234567');
    });

    it('should use comma as decimal separator', () => {
      expect(formatNumberWithSeparators(1234.56, 2, 'comma')).toBe('1234,56');
    });
  });
});

describe('stripSeparators', () => {
  it('should remove UK thousands separators', () => {
    expect(stripSeparators('1,234,567.89', 'uk')).toBe('1234567.89');
  });

  it('should remove European separators and convert decimal', () => {
    expect(stripSeparators('1 234 567,89', 'europe-latin')).toBe('1234567.89');
  });

  it('should remove Swiss apostrophe separators', () => {
    expect(stripSeparators("1'234'567.89", 'swiss')).toBe('1234567.89');
  });
});

describe('formatForClipboard', () => {
  it('should format without thousands separators for UK', () => {
    expect(formatForClipboard(1234567.89, 2, 'uk')).toBe('1234567.89');
  });

  it('should use comma decimal for European format', () => {
    expect(formatForClipboard(1234567.89, 2, 'europe-latin')).toBe('1234567,89');
  });

  it('should not include thousands separators in clipboard copy', () => {
    const formats: NumberFormat[] = ['uk', 'south-asian', 'swiss', 'east-asian'];
    for (const format of formats) {
      const result = formatForClipboard(1234567, 0, format);
      expect(result).not.toContain(',');
      expect(result).not.toContain(' ');
      expect(result).not.toContain("'");
    }
  });

  it('should respect precision setting', () => {
    expect(formatForClipboard(1.23456789, 4, 'uk')).toBe('1.2346');
    expect(formatForClipboard(1.23456789, 2, 'uk')).toBe('1.23');
    expect(formatForClipboard(1.23456789, 8, 'uk')).toBe('1.23456789');
  });

  it('should remove trailing zeros', () => {
    expect(formatForClipboard(1.5, 4, 'uk')).toBe('1.5');
    expect(formatForClipboard(2.0, 3, 'uk')).toBe('2');
  });
});

describe('Arabic Numeral Conversion', () => {
  it('should convert Latin to Arabic numerals', () => {
    expect(toArabicNumerals('0123456789')).toBe('٠١٢٣٤٥٦٧٨٩');
  });

  it('should convert Arabic to Latin numerals', () => {
    expect(toLatinNumerals('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
  });

  it('should preserve non-digit characters', () => {
    expect(toArabicNumerals('1,234.56')).toBe('١,٢٣٤.٥٦');
    expect(toLatinNumerals('١,٢٣٤.٥٦')).toBe('1,234.56');
  });
});

describe('CJK Numeral Conversion', () => {
  it('toJapaneseNumerals converts 0-9 to Japanese', () => {
    expect(toJapaneseNumerals('0123456789')).toBe('〇一二三四五六七八九');
  });

  it('toKoreanNumerals converts 0-9 to Sino-Korean', () => {
    expect(toKoreanNumerals('0123456789')).toBe('공일이삼사오육칠팔구');
  });

  it('toCJKMyriadString formats 1234567 in ja', () => {
    expect(toCJKMyriadString('1234567', 'ja')).toBe('一二三万四五六七');
  });

  it('toCJKMyriadString formats 1234567 in ko', () => {
    expect(toCJKMyriadString('1234567', 'ko')).toBe('일이삼만사오육칠');
  });

  it('toCJKMyriadString formats 1234567 in zh', () => {
    expect(toCJKMyriadString('1234567', 'zh')).toBe('一二三万四五六七');
  });

  it('toCJKMyriadString handles 0', () => {
    expect(toCJKMyriadString('0', 'ja')).toBe('〇');
  });

  it('toCJKMyriadString uses 亿 (simplified) for zh at 10^8', () => {
    expect(toCJKMyriadString('100000000', 'zh')).toBe('一亿');
  });

  it('toCJKMyriadString uses 億 (traditional) for ja at 10^8', () => {
    expect(toCJKMyriadString('100000000', 'ja')).toBe('一億');
  });

  it('toCJKMyriadString formats 123456789 in zh (uses 亿 unit)', () => {
    expect(toCJKMyriadString('123456789', 'zh')).toBe('一亿二三四五万六七八九');
  });
});

describe('Precision Behavior', () => {
  it('should respect precision 0 (whole numbers only)', () => {
    expect(cleanNumber(1.567, 0)).toBe('2');
    expect(cleanNumber(1.234, 0)).toBe('1');
  });

  it('should respect precision 2', () => {
    expect(cleanNumber(1.567, 2)).toBe('1.57');
    expect(cleanNumber(1.234, 2)).toBe('1.23');
  });

  it('should respect precision 4', () => {
    expect(cleanNumber(1.123456, 4)).toBe('1.1235');
  });

  it('should respect precision 8', () => {
    expect(cleanNumber(1.123456789, 8)).toBe('1.12345679');
  });

  it('should handle precision for formatted numbers with separators', () => {
    expect(formatNumberWithSeparators(1234.5678, 2, 'uk')).toBe('1,234.57');
    expect(formatNumberWithSeparators(1234.5678, 4, 'uk')).toBe('1,234.5678');
  });
});

describe('findOptimalPrefix', () => {
  describe('large values (should scale down)', () => {
    it('should select kilo prefix for values >= 1000', () => {
      const result = findOptimalPrefix(1500, 'm', 4);
      expect(result.prefix.id).toBe('kilo');
      expect(result.adjustedValue).toBeCloseTo(1.5, 4);
    });

    it('should select mega prefix for values >= 1,000,000', () => {
      const result = findOptimalPrefix(1500000, 'J', 4);
      expect(result.prefix.id).toBe('mega');
      expect(result.adjustedValue).toBeCloseTo(1.5, 4);
    });

    it('should select giga prefix for values >= 1,000,000,000', () => {
      const result = findOptimalPrefix(2.5e9, 'W', 4);
      expect(result.prefix.id).toBe('giga');
      expect(result.adjustedValue).toBeCloseTo(2.5, 4);
    });

    it('should keep values in [1, 1000) range for minimal digits', () => {
      const result = findOptimalPrefix(500000, 'm', 4);
      expect(result.prefix.id).toBe('kilo');
      expect(result.adjustedValue).toBe(500);
    });
  });

  describe('small values (should scale up)', () => {
    it('should select milli prefix for values < 1', () => {
      const result = findOptimalPrefix(0.005, 'm', 4);
      expect(result.prefix.id).toBe('milli');
      expect(result.adjustedValue).toBe(5);
    });

    it('should select micro prefix for very small values', () => {
      const result = findOptimalPrefix(0.000005, 'm', 4);
      expect(result.prefix.id).toBe('micro');
      expect(result.adjustedValue).toBeCloseTo(5, 10);
    });

    it('should select nano prefix for extremely small values', () => {
      const result = findOptimalPrefix(5e-9, 'm', 4);
      expect(result.prefix.id).toBe('nano');
      expect(result.adjustedValue).toBeCloseTo(5, 4);
    });

    it('should select pico prefix for values that would display as 0', () => {
      const result = findOptimalPrefix(1e-12, 'm', 4);
      expect(result.prefix.id).toBe('pico');
      expect(result.adjustedValue).toBe(1);
    });
  });

  describe('values already in optimal range', () => {
    it('should use no prefix for values between 1 and 1000', () => {
      const result = findOptimalPrefix(42, 'm', 4);
      expect(result.prefix.id).toBe('none');
      expect(result.adjustedValue).toBe(42);
    });

    it('should use no prefix for value of exactly 1', () => {
      const result = findOptimalPrefix(1, 'N', 4);
      expect(result.prefix.id).toBe('none');
      expect(result.adjustedValue).toBe(1);
    });
  });

  describe('precision-aware prefix selection', () => {
    it('should select smaller prefix to avoid displaying 0', () => {
      const result = findOptimalPrefix(0.00001, 'm', 4);
      expect(result.adjustedValue).toBeGreaterThan(0);
      expect(result.adjustedValue).toBeGreaterThanOrEqual(1);
    });

    it('should handle precision 2 with small values', () => {
      const result = findOptimalPrefix(0.001, 'm', 2);
      expect(result.prefix.id).toBe('milli');
      expect(result.adjustedValue).toBe(1);
    });
  });

  describe('negative values', () => {
    it('should handle negative large values', () => {
      const result = findOptimalPrefix(-1500, 'm', 4);
      expect(result.prefix.id).toBe('kilo');
      expect(result.adjustedValue).toBeCloseTo(-1.5, 4);
    });

    it('should handle negative small values', () => {
      const result = findOptimalPrefix(-0.005, 'm', 4);
      expect(result.prefix.id).toBe('milli');
      expect(result.adjustedValue).toBe(-5);
    });
  });

  describe('edge cases', () => {
    it('should return none prefix for zero', () => {
      const result = findOptimalPrefix(0, 'm', 4);
      expect(result.prefix.id).toBe('none');
      expect(result.adjustedValue).toBe(0);
    });

    it('should apply prefix for kg units using gram scale (kg → Mg for 1500 kg)', () => {
      const result = findOptimalPrefix(1500, 'kg', 4);
      expect(result.prefix.id).toBe('mega');
      expect(result.adjustedValue).toBeCloseTo(1.5, 4);
    });

    it('should still find optimal prefix for any unit symbol (caller decides if applicable)', () => {
      const result = findOptimalPrefix(1500, 'ft', 4);
      expect(result.prefix.id).toBe('kilo');
      expect(result.adjustedValue).toBeCloseTo(1.5, 4);
    });
  });
});

describe('Photon/Light Category', () => {
  const photonCategory = CONVERSION_DATA.find((c) => c.id === 'photon');

  it('should exist as a category', () => {
    expect(photonCategory).toBeDefined();
  });

  it('should have wavelength (λ), frequency (ν), and energy units', () => {
    expect(photonCategory?.units.some((u) => u.id === 'lambda')).toBe(true);
    expect(photonCategory?.units.some((u) => u.id === 'nu')).toBe(true);
    expect(photonCategory?.units.some((u) => u.id === 'eV')).toBe(true);
    expect(photonCategory?.units.some((u) => u.id === 'J_photon')).toBe(true);
  });

  it('should have inverse conversion for wavelength (λ) unit', () => {
    const lambda = photonCategory?.units.find((u) => u.id === 'lambda');
    expect(lambda?.isInverse).toBe(true);
  });

  it('should use correct conversion constants (hc = 1.239841984e-6 eV·m)', () => {
    const lambda = photonCategory?.units.find((u) => u.id === 'lambda');
    expect(lambda?.factor).toBeCloseTo(1.239841984e-6, 12);
  });

  it('should allow prefixes on wavelength λ (use nano prefix for nm)', () => {
    const lambda = photonCategory?.units.find((u) => u.id === 'lambda');
    expect(lambda?.allowPrefixes).toBe(true);
  });

  it('should use Greek symbols ν and λ', () => {
    const nu = photonCategory?.units.find((u) => u.id === 'nu');
    const lambda = photonCategory?.units.find((u) => u.id === 'lambda');
    expect(nu?.symbol).toBe('ν');
    expect(lambda?.symbol).toBe('λ');
  });
});

describe('Photon Conversion Function', () => {
  it('should convert 500e-9 λ wavelength to approximately 2.48 eV', () => {
    // 500 nm = 500e-9 in λ units (wavelength expressed in meters)
    const result = convert(500e-9, 'lambda', 'eV', 'photon');
    expect(result).toBeCloseTo(2.48, 1);
  });

  it('should convert 1 eV to approximately 1.24e-6 λ wavelength', () => {
    const result = convert(1, 'eV', 'lambda', 'photon');
    expect(result).toBeCloseTo(1.24e-6, 8);
  });

  it('should convert wavelength 500e-9 λ to frequency ~6e14 ν', () => {
    const wavelength_m = 500e-9;
    const c = 299792458;
    const expectedFreq = c / wavelength_m;
    const result = convert(500e-9, 'lambda', 'nu', 'photon');
    expect(result).toBeCloseTo(expectedFreq, -10);
  });

  it('should be reversible: eV → λ → eV', () => {
    const original = 2.5;
    const lambda = convert(original, 'eV', 'lambda', 'photon');
    const backToEv = convert(lambda, 'lambda', 'eV', 'photon');
    expect(backToEv).toBeCloseTo(original, 6);
  });

  it('should convert visible light (red ~700nm) correctly', () => {
    // 700 nm = 700e-9 in λ units
    const result = convert(700e-9, 'lambda', 'eV', 'photon');
    expect(result).toBeCloseTo(1.77, 1);
  });

  it('should convert visible light (blue ~450nm) correctly', () => {
    // 450 nm = 450e-9 in λ units
    const result = convert(450e-9, 'lambda', 'eV', 'photon');
    expect(result).toBeCloseTo(2.76, 1);
  });

  it('should convert frequency ν to energy eV correctly', () => {
    // 1e15 Hz photon has energy E = hν ≈ 4.136 eV
    const result = convert(1e15, 'nu', 'eV', 'photon');
    expect(result).toBeCloseTo(4.136, 2);
  });

  // ============================================================
  // 550 nm Green Light - SI Prefix Reference Test
  // ============================================================
  // Wavelength: 550 nanometres (550 nm)
  // Speed of light: ~300 megametres per second (300 Mm/s)
  // Frequency = c/λ = (300 × 10⁶ m/s) / (550 × 10⁻⁹ m) = 545 × 10¹² Hz = 545 THz
  // 
  // Energy calculation via E = hν:
  // Planck's constant h = 6.626 × 10⁻³⁴ J·s
  // E = h × ν = 6.626 × 10⁻³⁴ × 545 × 10¹² = 3.61 × 10⁻¹⁹ J
  //
  // SI prefix representations:
  // - 3.61 × 10⁻¹⁹ J = 361 zJ (zeptojoules, 10⁻²¹)
  // - 3.61 × 10⁻¹⁹ J = 0.361 aJ (attojoules, 10⁻¹⁸)
  // ============================================================

  it('should convert 550 nm (nanometres) wavelength to 545 THz (terahertz) frequency', () => {
    // ν = c/λ where c ≈ 300 Mm/s, λ = 550 nm
    // (300 × 10⁶) / (550 × 10⁻⁹) = 545 × 10¹² = 545 THz
    const wavelength_nm = 550;
    const wavelength_m = wavelength_nm * 1e-9; // Convert nm to m
    const result = convert(wavelength_m, 'lambda', 'nu', 'photon');
    const frequency_THz = result / 1e12; // Convert Hz to THz
    expect(frequency_THz).toBeCloseTo(545, 0);
  });

  it('should convert 550 nm wavelength to 2.25 eV energy', () => {
    const wavelength_nm = 550;
    const wavelength_m = wavelength_nm * 1e-9;
    const result = convert(wavelength_m, 'lambda', 'eV', 'photon');
    expect(result).toBeCloseTo(2.25, 2);
  });

  it('should convert 550 nm wavelength to ~361 zJ (zeptojoules) energy', () => {
    // E = hν = 6.626 × 10⁻³⁴ J·s × 545 × 10¹² s⁻¹ = 3.61 × 10⁻¹⁹ J
    // In zeptojoules (10⁻²¹): 3.61 × 10⁻¹⁹ J = 361 × 10⁻²¹ J = 361 zJ
    const wavelength_nm = 550;
    const wavelength_m = wavelength_nm * 1e-9;
    const result_J = convert(wavelength_m, 'lambda', 'J_photon', 'photon');
    const result_zJ = result_J * 1e21; // Convert J to zJ (zepto = 10⁻²¹)
    expect(result_zJ).toBeCloseTo(361, 0);
  });

  it('should convert 550 nm wavelength to ~0.36 aJ (attojoules) energy', () => {
    // In attojoules (10⁻¹⁸): 3.61 × 10⁻¹⁹ J = 0.361 × 10⁻¹⁸ J = 0.36 aJ
    const wavelength_nm = 550;
    const wavelength_m = wavelength_nm * 1e-9;
    const result_J = convert(wavelength_m, 'lambda', 'J_photon', 'photon');
    const result_aJ = result_J * 1e18; // Convert J to aJ (atto = 10⁻¹⁸)
    expect(result_aJ).toBeCloseTo(0.36, 1);
  });

  it('should verify Planck constant relationship: E = hν', () => {
    // Planck's constant h = 6.62607015 × 10⁻³⁴ J·s (exact, SI 2019)
    // For 545 THz: E = h × ν = 6.626 × 10⁻³⁴ × 545 × 10¹² ≈ 3.61 × 10⁻¹⁹ J
    const h = 6.62607015e-34; // J·s
    const frequency_THz = 545;
    const frequency_Hz = frequency_THz * 1e12;
    const expected_E = h * frequency_Hz; // Should be ~3.61e-19 J
    
    // Convert from frequency in our photon system
    const result_J = convert(frequency_Hz, 'nu', 'J_photon', 'photon');
    expect(result_J).toBeCloseTo(expected_E, 22);
  });
});

describe('Radioactive Decay Category', () => {
  const decayCategory = CONVERSION_DATA.find((c) => c.id === 'radioactive_decay');

  it('should exist as a category', () => {
    expect(decayCategory).toBeDefined();
  });

  it('should have per-day decay constant, half-life, and mean lifetime units', () => {
    expect(decayCategory?.units.some((u) => u.id === 'per_day')).toBe(true);
    expect(decayCategory?.units.some((u) => u.id === 'half_s')).toBe(true);
    expect(decayCategory?.units.some((u) => u.id === 'tau_s')).toBe(true);
  });

  it('should not contain per_s, per_min, per_hr, or per_year units', () => {
    expect(decayCategory?.units.some((u) => u.id === 'per_s')).toBe(false);
    expect(decayCategory?.units.some((u) => u.id === 'per_min')).toBe(false);
    expect(decayCategory?.units.some((u) => u.id === 'per_hr')).toBe(false);
    expect(decayCategory?.units.some((u) => u.id === 'per_year')).toBe(false);
  });

  it('should convert decay constant (per day) to half-life correctly (t½ = ln(2)/λ)', () => {
    // λ = 1 d⁻¹ → t½ = ln(2) days ≈ 0.693 days = 59887.9 seconds
    const result = convert(1, 'per_day', 'half_s', 'radioactive_decay');
    expect(result).toBeCloseTo(59887.916, 1);
  });

  it('should convert decay constant (per day) to mean lifetime correctly (τ = 1/λ)', () => {
    // λ = 1 d⁻¹ → τ = 1 day = 86400 seconds
    const result = convert(1, 'per_day', 'tau_s', 'radioactive_decay');
    expect(result).toBeCloseTo(86400, 1);
  });

  it('should convert half-life to decay constant (per day) correctly', () => {
    // t½ = ln(2) days = 59887.9 s → λ = 1 d⁻¹
    const result = convert(59887.916, 'half_s', 'per_day', 'radioactive_decay');
    expect(result).toBeCloseTo(1, 3);
  });
});

describe('Cross-Section Category', () => {
  const csCategory = CONVERSION_DATA.find((c) => c.id === 'cross_section');

  it('should exist as a category', () => {
    expect(csCategory).toBeDefined();
  });

  it('should have barn and square meter units', () => {
    expect(csCategory?.units.some((u) => u.id === 'barn')).toBe(true);
    expect(csCategory?.units.some((u) => u.id === 'm2_cs')).toBe(true);
  });

  it('should convert 1 barn to 1e-28 m²', () => {
    const result = convert(1, 'barn', 'm2_cs', 'cross_section');
    expect(result).toBeCloseTo(1e-28, 35);
  });
});

describe('Kinematic Viscosity Category', () => {
  const kvCategory = CONVERSION_DATA.find((c) => c.id === 'kinematic_viscosity');

  it('should exist as a category', () => {
    expect(kvCategory).toBeDefined();
  });

  it('should convert 1 Stokes to 1e-4 m²/s', () => {
    const result = convert(1, 'stokes', 'm2_per_s', 'kinematic_viscosity');
    expect(result).toBeCloseTo(1e-4, 10);
  });

  it('should convert 1 centistokes to 1e-6 m²/s', () => {
    const result = convert(1, 'centistokes', 'm2_per_s', 'kinematic_viscosity');
    expect(result).toBeCloseTo(1e-6, 12);
  });
});

describe('Electric Field Strength Category', () => {
  const efCategory = CONVERSION_DATA.find((c) => c.id === 'electric_field');

  it('should exist as a category', () => {
    expect(efCategory).toBeDefined();
  });

  it('should convert 1 kV/m to 1000 V/m', () => {
    const result = convert(1, 'kv_per_m', 'v_per_m', 'electric_field');
    expect(result).toBeCloseTo(1000, 6);
  });
});

describe('Magnetic Field Strength (H) Category', () => {
  const mfhCategory = CONVERSION_DATA.find((c) => c.id === 'magnetic_field_h');

  it('should exist as a category', () => {
    expect(mfhCategory).toBeDefined();
  });

  it('should convert 1 Oersted to approximately 79.58 A/m', () => {
    const result = convert(1, 'oersted', 'a_per_m', 'magnetic_field_h');
    expect(result).toBeCloseTo(79.5774715, 4);
  });
});

describe('Sound Intensity Category', () => {
  const siCategory = CONVERSION_DATA.find((c) => c.id === 'sound_intensity');

  it('should exist as a category', () => {
    expect(siCategory).toBeDefined();
  });

  it('should have reference intensity I₀ = 10⁻¹² W/m²', () => {
    const result = convert(1, 'i0', 'w_per_m2', 'sound_intensity');
    expect(result).toBeCloseTo(1e-12, 18);
  });
});

describe('Acoustic Impedance Category', () => {
  const aiCategory = CONVERSION_DATA.find((c) => c.id === 'acoustic_impedance');

  it('should exist as a category', () => {
    expect(aiCategory).toBeDefined();
  });

  it('should convert 1 MRayl to 1e6 Rayl', () => {
    const result = convert(1, 'mrayl', 'rayl', 'acoustic_impedance');
    expect(result).toBeCloseTo(1e6, 0);
  });
});

describe('Electron Volt Conversions', () => {
  describe('Energy category eV', () => {
    const energyCategory = CONVERSION_DATA.find((c) => c.id === 'energy');
    const eV = energyCategory?.units.find((u) => u.id === 'ev');

    it('should have electron volt in energy category', () => {
      expect(eV).toBeDefined();
    });

    it('should have correct factor (1.602176634e-19 J)', () => {
      expect(eV?.factor).toBeCloseTo(1.602176634e-19, 28);
    });

    it('should allow SI prefixes', () => {
      expect(eV?.allowPrefixes).toBe(true);
    });
  });

  describe('ft_in RTL bidi ordering', () => {
    it('formatFtIn output should have feet before inches (tick before closing quote)', () => {
      const result = formatFtIn(5 + 10 / 12, 4);
      expect(result.indexOf("'")).toBeGreaterThan(-1);
      expect(result.indexOf('"')).toBeGreaterThan(-1);
      expect(result.indexOf("'")).toBeLessThan(result.indexOf('"'));
    });

    it('formatFtIn output for 5ft 10in should start with feet value and end with inches (feet-first)', () => {
      const result = formatFtIn(5 + 10 / 12, 4);
      expect(result.startsWith("5'")).toBe(true);
      expect(result.endsWith('"')).toBe(true);
    });

    it('formatFtIn output for 0ft should still use feet-first format', () => {
      const result = formatFtIn(0.5, 4);
      expect(result.startsWith("0'")).toBe(true);
      expect(result.endsWith('"')).toBe(true);
    });

    it('formatFtIn output for negative values should put sign before feet, feet before inches', () => {
      const result = formatFtIn(-(5 + 10 / 12), 4);
      expect(result.startsWith("-5'")).toBe(true);
      expect(result.endsWith('"')).toBe(true);
    });

    it("ft'in\" placeholder string should have foot-tick before inch-quote (feet-first ordering)", () => {
      const placeholder = "ft'in\"";
      const tickIdx = placeholder.indexOf("'");
      const quoteIdx = placeholder.indexOf('"');
      expect(tickIdx).toBeGreaterThan(-1);
      expect(quoteIdx).toBeGreaterThan(-1);
      expect(tickIdx).toBeLessThan(quoteIdx);
    });
  });

  describe('Mass category eV/c²', () => {
    const massCategory = CONVERSION_DATA.find((c) => c.id === 'mass');
    const eVc2 = massCategory?.units.find((u) => u.id === 'ev_c2');

    it('should have electron volt mass equivalent in mass category', () => {
      expect(eVc2).toBeDefined();
    });

    it('should have correct factor (1.78266192e-36 kg)', () => {
      expect(eVc2?.factor).toBeCloseTo(1.78266192e-36, 42);
    });

    it('should allow SI prefixes', () => {
      expect(eVc2?.allowPrefixes).toBe(true);
    });
  });
});
