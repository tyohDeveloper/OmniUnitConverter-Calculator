import type { NumberFormat } from './units/numberFormat';
import type { SupportedLanguage } from './localization';
export type { NumberFormat };

export interface NumberFormatConfig {
  name: string;
  thousands: string;
  decimal: string;
  useArabicNumerals?: boolean;
  myriad?: boolean;
  traditionalScript?: 'ja' | 'ko' | 'zh';
}

export const NUMBER_FORMATS: Record<NumberFormat, NumberFormatConfig> = {
  'uk': { name: 'English', thousands: ',', decimal: '.' },
  'south-asian': { name: 'South Asian (Indian)', thousands: ',', decimal: '.' },
  'europe-latin': { name: 'World', thousands: ' ', decimal: ',' },
  'swiss': { name: 'Swiss', thousands: "'", decimal: '.' },
  'arabic-latin': { name: 'Arabic (Latin)', thousands: ',', decimal: '.' },
  'east-asian': { name: 'East Asian', thousands: ',', decimal: '.', myriad: true },
  'period': { name: 'Period', thousands: '', decimal: '.' },
  'comma': { name: 'Comma', thousands: '', decimal: ',' },
  'traditional': { name: 'Traditional', thousands: ',', decimal: '.' },
};

const TRADITIONAL_CONFIGS: Partial<Record<SupportedLanguage, NumberFormatConfig>> = {
  ar: { name: 'Traditional', thousands: ',', decimal: '.', useArabicNumerals: true },
  de: { name: 'Traditional', thousands: '.', decimal: ',' },
  es: { name: 'Traditional', thousands: '.', decimal: ',' },
  it: { name: 'Traditional', thousands: '.', decimal: ',' },
  pt: { name: 'Traditional', thousands: '.', decimal: ',' },
  fr: { name: 'Traditional', thousands: '\u202F', decimal: ',' },
  ru: { name: 'Traditional', thousands: '\u00A0', decimal: ',' },
  ja: { name: 'Traditional', thousands: '', decimal: '.', myriad: true, traditionalScript: 'ja' },
  ko: { name: 'Traditional', thousands: '', decimal: '.', myriad: true, traditionalScript: 'ko' },
  zh: { name: 'Traditional', thousands: '', decimal: '.', myriad: true, traditionalScript: 'zh' },
};

const TRADITIONAL_DEFAULT: NumberFormatConfig = { name: 'Traditional', thousands: ',', decimal: '.' };

export const getTraditionalConfig = (locale: SupportedLanguage): NumberFormatConfig =>
  TRADITIONAL_CONFIGS[locale] ?? TRADITIONAL_DEFAULT;

export const toArabicNumerals = (str: string): string => {
  const arabicMap: Record<string, string> = {
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
  };
  return str.split('').map(c => arabicMap[c] || c).join('');
};

export const toJapaneseNumerals = (str: string): string => {
  const map: Record<string, string> = {
    '0': '〇', '1': '一', '2': '二', '3': '三', '4': '四',
    '5': '五', '6': '六', '7': '七', '8': '八', '9': '九'
  };
  return str.split('').map(c => map[c] || c).join('');
};

export const toKoreanNumerals = (str: string): string => {
  const map: Record<string, string> = {
    '0': '공', '1': '일', '2': '이', '3': '삼', '4': '사',
    '5': '오', '6': '육', '7': '칠', '8': '팔', '9': '구'
  };
  return str.split('').map(c => map[c] || c).join('');
};

const splitMyriadGroups = (absStr: string): string[] => {
  const groups: string[] = [];
  let s = absStr;
  while (s.length > 0) {
    groups.unshift(s.slice(-4));
    s = s.slice(0, -4);
  }
  return groups;
};

const CJK_UNITS: Record<'ja' | 'ko' | 'zh', string[]> = {
  ko: ['', '만', '억', '조'],
  zh: ['', '万', '亿', '兆'],
  ja: ['', '万', '億', '兆'],
};

export const toCJKMyriadString = (integerStr: string, script: 'ja' | 'ko' | 'zh'): string => {
  const units = CJK_UNITS[script];
  const toNumerals = script === 'ko' ? toKoreanNumerals : toJapaneseNumerals;
  const absStr = integerStr.replace(/^-/, '');
  const sign = integerStr.startsWith('-') ? '-' : '';
  const groups = splitMyriadGroups(absStr);
  const parts: string[] = [];
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const unitIndex = groups.length - 1 - i;
    if (parseInt(g, 10) === 0) continue;
    const unitMarker = unitIndex < units.length ? units[unitIndex] : '';
    parts.push(toNumerals(g) + unitMarker);
  }
  if (parts.length === 0) return toNumerals('0');
  return sign + parts.join('');
};

export const toLatinNumerals = (str: string): string => {
  const latinMap: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  return str.split('').map(c => latinMap[c] || c).join('');
};

const roundScaled = (scaled: number, multiplier: number): number => {
  const nearestInt = Math.round(scaled);
  if (Math.abs(scaled - nearestInt) < 1e-10) return nearestInt / multiplier;
  const floor = Math.floor(scaled);
  const fraction = scaled - floor;
  if (Math.abs(fraction - 0.5) < 1e-10) {
    return (floor % 2 === 0 ? floor : floor + 1) / multiplier;
  }
  return Math.round(scaled) / multiplier;
};

export const roundToNearestEven = (num: number, precision: number): number => {
  const absNum = Math.abs(num);
  if ((absNum > 1e15 || (absNum < 1e-15 && absNum > 0)) && precision === 0) {
    return Math.round(num);
  }
  const multiplier = Math.pow(10, precision);
  return roundScaled(num * multiplier, multiplier);
};

export const toFixedBanker = (num: number, precision: number): string => {
  const rounded = roundToNearestEven(num, precision);
  return rounded.toFixed(precision);
};

export const formatFtIn = (decimalFeet: number, precision: number): string => {
  const sign = decimalFeet < 0 ? "-" : "";
  const absVal = Math.abs(decimalFeet);
  const ft = Math.floor(absVal);
  const inches = (absVal - ft) * 12;
  const inFixed = toFixedBanker(inches, precision);
  return `${sign}${ft}'${inFixed}"`;
};

export const fixPrecision = (num: number): number => {
  if (num === 0) return 0;
  if (!isFinite(num)) return num;
  
  // Use JavaScript's full 17 significant digit precision
  // to preserve as much user-entered precision as possible
  const result = parseFloat(num.toPrecision(17));
  return result;
};

export const cleanNumber = (num: number, precision: number): string => {
  const fixed = fixPrecision(num);
  
  // For small values, extend precision to show meaningful digits
  let effectivePrecision = precision;
  const absNum = Math.abs(fixed);
  if (absNum > 0 && absNum < 1) {
    const magnitude = Math.floor(Math.log10(absNum));
    const neededDecimals = Math.abs(magnitude) + precision;
    effectivePrecision = Math.min(neededDecimals, 12);
  }
  
  // Use precision directly - no magnitude-based limiting for large numbers
  const formatted = toFixedBanker(fixed, effectivePrecision);
  const cleaned = formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
  return cleaned;
};

const applyThousandsSeparator = (integer: string, formatKey: NumberFormat, format: NumberFormatConfig): string => {
  if (!format.thousands) return integer;
  if (formatKey === 'south-asian') {
    const reversed = integer.split('').reverse().join('');
    let result = '';
    for (let i = 0; i < reversed.length; i++) {
      if (i === 3 || (i > 3 && (i - 3) % 2 === 0)) result += format.thousands;
      result += reversed[i];
    }
    return result.split('').reverse().join('');
  }
  if (format.myriad) return integer.replace(/\B(?=(\d{4})+(?!\d))/g, format.thousands);
  return integer.replace(/\B(?=(\d{3})+(?!\d))/g, format.thousands);
};

const formatCJK = (integer: string, decimal: string | undefined, format: NumberFormatConfig): string => {
  const script = format.traditionalScript!;
  const cjkInteger = toCJKMyriadString(integer, script);
  if (!decimal) return cjkInteger;
  const toNumerals = script === 'ko' ? toKoreanNumerals : toJapaneseNumerals;
  return `${cjkInteger}${format.decimal}${toNumerals(decimal)}`;
};

export const formatNumberWithSeparators = (
  num: number,
  precision: number,
  formatKey: NumberFormat,
  locale?: SupportedLanguage
): string => {
  const format = formatKey === 'traditional' && locale
    ? getTraditionalConfig(locale)
    : NUMBER_FORMATS[formatKey];
  const cleaned = cleanNumber(num, precision);
  const [integer, decimal] = cleaned.split('.');
  if (format.traditionalScript) return formatCJK(integer, decimal, format);
  const formattedInteger = applyThousandsSeparator(integer, formatKey, format);
  let result = decimal ? `${formattedInteger}${format.decimal}${decimal}` : formattedInteger;
  if (format.useArabicNumerals) result = toArabicNumerals(result);
  return result;
};

export const stripSeparators = (formattedValue: string, formatKey: NumberFormat): string => {
  const format = NUMBER_FORMATS[formatKey];
  let result = formattedValue;
  
  if (format.useArabicNumerals) {
    result = toLatinNumerals(result);
  }
  
  if (format.thousands) {
    result = result.split(format.thousands).join('');
  }
  
  if (format.decimal !== '.') {
    result = result.replace(format.decimal, '.');
  }
  
  return result;
};

export const formatForClipboard = (num: number, precision: number, formatKey: NumberFormat): string => {
  const format = NUMBER_FORMATS[formatKey];
  const cleaned = cleanNumber(num, precision);
  
  if (format.decimal !== '.') {
    return cleaned.replace('.', format.decimal);
  }
  return cleaned;
};

export const toTitleCase = (str: string): string => {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// Parse a number string with a specific format (converts separators and returns a float)
export const parseNumberWithFormat = (str: string, formatKey: NumberFormat): number => {
  // Always convert Arabic numerals to Latin first (in case input has them)
  let cleaned = toLatinNumerals(str);
  const format = NUMBER_FORMATS[formatKey];
  // Remove thousands separator
  if (format.thousands) {
    cleaned = cleaned.split(format.thousands).join('');
  }
  // Replace decimal separator with period for parsing
  if (format.decimal !== '.') {
    cleaned = cleaned.replace(format.decimal, '.');
  }
  return parseFloat(cleaned);
};

// Format a number with a specific format (adds separators and converts numerals)
export const formatNumberWithFormat = (num: number, formatKey: NumberFormat): string => {
  if (isNaN(num) || !isFinite(num)) return '';
  const format = NUMBER_FORMATS[formatKey];
  const [integer, decimal] = num.toString().split('.');
  const formattedInteger = applyThousandsSeparator(integer, formatKey, format);
  let result = decimal ? `${formattedInteger}${format.decimal}${decimal}` : formattedInteger;
  if (format.useArabicNumerals) result = toArabicNumerals(result);
  return result;
};
