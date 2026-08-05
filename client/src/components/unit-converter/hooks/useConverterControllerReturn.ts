import type { UnitCategory } from '@/lib/units/unitCategory';
import type { NumberFormat } from '@/lib/units/numberFormat';
import type { SupportedLanguage } from '@/lib/localization';
import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import type { SIRepresentation } from '@/lib/si-representations/siRepresentation';
import type { applyPrefixToKgUnit } from '@/lib/units/applyPrefixToKgUnit';
import type { normalizeMassUnit } from '@/lib/units/normalizeMassUnit';

/**
 * Public surface of useConverterController. Extracted from the hook
 * file so the hook body can stay under the file-length cap without
 * losing this documentation-heavy type.
 *
 * The interface groups by responsibility:
 *   - State getters (activeCategory, units, prefixes, values, ...)
 *   - State setters (paired with each getter)
 *   - Action handlers (swap, copy variants, paste variants, ...)
 *   - Locale/format helpers (translators, formatters, parsers)
 *   - Category-metadata helpers (dimensions, direct-mode builders)
 *   - Refs and paste-flow state
 */
export interface UseConverterControllerReturn {
  activeCategory: UnitCategory;
  fromUnit: string;
  toUnit: string;
  fromPrefix: string;
  toPrefix: string;
  inputValue: string;
  result: number | null;
  precision: number;
  comparisonMode: boolean;
  numberFormat: NumberFormat;
  language: SupportedLanguage;
  activeTab: string;
  directValue: string;
  directExponents: Record<string, number>;
  converterPasteStatus: 'idle' | 'unrecognised' | 'unavailable';
  customPasteStatus: 'idle' | 'unrecognised' | 'unavailable';

  setActiveCategory: (v: UnitCategory) => void;
  setFromUnit: (v: string) => void;
  setToUnit: (v: string) => void;
  setFromPrefix: (v: string) => void;
  setToPrefix: (v: string) => void;
  setInputValue: (v: string) => void;
  setPrecision: (v: number) => void;
  setComparisonMode: (v: boolean) => void;
  setNumberFormat: (v: NumberFormat) => void;
  setLanguage: (v: SupportedLanguage) => void;
  setActiveTab: (v: string) => void;
  setDirectValue: (v: string) => void;
  setDirectExponents: (v: Record<string, number>) => void;

  swapUnits: () => void;
  copyResult: () => void;
  copyFromBaseFactor: () => void;
  copyFromSIBase: () => void;
  copyToBaseFactor: () => void;
  copyToSIBase: () => void;
  copyConversionRatio: () => void;
  handleInputChange: (v: string) => void;
  handleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleInputBlur: () => void;
  handleConverterSmartPasteClick: () => Promise<void>;
  handleCustomSmartPasteClick: () => Promise<void>;
  handleDirectCopyAndPushToCalculator: (value: number, dims: Record<string, number>) => void;
  handleQuantityClick: (quantityName: string) => void;
  refocusInput: () => void;
  reformatInputValue: (oldFormat: NumberFormat, newFormat: NumberFormat) => void;

  normalizeMassUnit: typeof normalizeMassUnit;
  parseNumberWithFormat: (str: string) => number;
  t: (key: string) => string;
  translateUnitName: (name: string) => string;
  formatFactor: (f: number) => string;
  formatResultValue: (num: number, precision: number) => string;
  formatDMS: (decimal: number) => string;
  formatFtIn: (decimalFeet: number) => string;
  formatForClipboard: (num: number, precision: number) => string;
  formatNumberWithSeparators: (num: number, precision: number) => string;
  getPlaceholder: () => string;
  getCategoryDimensions: (category: UnitCategory) => { [key: string]: number };
  buildDirectUnitSymbol: () => string;
  buildDirectDimensions: () => Record<string, number>;
  generateSIRepresentations: (dims: DimensionalFormula, sourceCategory?: string) => SIRepresentation[];
  applyPrefixToKgUnit: typeof applyPrefixToKgUnit;

  inputRef: React.RefObject<HTMLInputElement | null>;
  // Council-11: replaces pendingPasteUnitRef. The value now lives in
  // uiPrefs reducer state; consumers dispatch setPendingPasteUnit to update.
  pendingPasteUnit: { fromUnit: string; prefixId: string } | null;
  setPendingPasteUnit: (v: { fromUnit: string; prefixId: string } | null) => void;
}
