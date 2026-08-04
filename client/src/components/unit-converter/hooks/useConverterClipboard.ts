import { useCallback } from 'react';
import { CONVERSION_DATA, PREFIXES, convert, parseUnitText } from '@/lib/conversion-data';
import type { UnitCategory } from '@/lib/units/unitCategory';
import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import { formatDimensions } from '@/lib/calculator/formatDimensions';
import { findCategoryByDimensions } from '@/lib/calculator/findCategoryByDimensions';
import { prefixPowerFactor } from '@/lib/units/prefixPowerFactor';
import { regionalCountingSuffix } from '@/lib/units/regionalCountingSuffix';
import { dimensionsToExponents } from '@/lib/units/dimensionsToExponents';
import type { UnitType } from '@/lib/units/unitType';
import type { CalcValue } from '@/lib/units/calcValue';
import { PASTE_RESET_TIMEOUT_MS } from '../constants';
import type { PasteStatus, PendingPasteUnit } from '../state/uiPrefsReducer';

// EXCEPTION [architecture-standards §3.2]: type-and-function co-location.
// The hook returns a stable public surface; its types live here.
export interface UseConverterClipboardInput {
  activeCategory: UnitCategory;
  fromUnit: string;
  toUnit: string;
  fromPrefix: string;
  toPrefix: string;
  result: number | null;
  precision: number;
  formatDMS: (v: number) => string;
  formatFtIn: (v: number) => string;
  formatForClipboard: (v: number, p: number) => string;
  getCategoryDimensions: (c: UnitCategory) => { [key: string]: number };
  // Flash triggers — the hook fires them on successful writes so the
  // UI knows to highlight the field that was just copied from.
  triggerFlashCopyResult: () => void;
  triggerFlashFromBaseFactor: () => void;
  triggerFlashFromSIBase: () => void;
  triggerFlashToBaseFactor: () => void;
  triggerFlashToSIBase: () => void;
  triggerFlashConversionRatio: () => void;
  // Paste-side dependencies. Smart paste writes into converter/uiPrefs
  // state, so the hook needs the corresponding writers.
  setActiveCategory: (c: UnitCategory) => void;
  setFromUnit: (u: string) => void;
  setFromPrefix: (p: string) => void;
  setInputValue: (v: string) => void;
  setActiveTab: (v: string) => void;
  setDirectValue: (v: string) => void;
  setDirectExponents: (v: Record<string, number>) => void;
  setPendingPasteUnit: (v: PendingPasteUnit | null) => void;
  setConverterPasteStatus: (v: PasteStatus) => void;
  setCustomPasteStatus: (v: PasteStatus) => void;
  converterPasteTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  customPasteTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
}

export interface UseConverterClipboardReturn {
  // Result-copy: writes the current result to the clipboard, formatted
  // for the target unit. Returns the text that was written and the
  // "new entry" object a downstream push-to-calculator step should
  // consume, so the caller can compose the two operations without
  // this hook needing to know about the calculator stack.
  copyResult: () => CopyResultOutcome | null;
  copyFromBaseFactor: () => void;
  copyFromSIBase: () => void;
  copyToBaseFactor: () => void;
  copyToSIBase: () => void;
  copyConversionRatio: () => void;
  handleConverterSmartPaste: () => Promise<PasteStatus | 'ok'>;
  handleConverterSmartPasteClick: () => Promise<void>;
  handleCustomSmartPasteClick: () => Promise<void>;
}

export interface CopyResultOutcome {
  // The clipboard has already been written; the newEntry field exists
  // so a downstream push-to-calculator step can consume it. It's
  // typed as CalcValue directly so the RPN stack can hold it without
  // widening.
  newEntry: CalcValue;
  // The unit metadata a downstream step needs to auto-select the
  // display prefix/alternative in the RPN result view.
  toUnitSymbol: string;
  toUnitAllowsPrefixes: boolean;
  toPrefixId: string;
  toPrefixSymbol: string;
}

/**
 * Clipboard read/write surface for the converter.
 *
 * Owns every read from and write to `navigator.clipboard.*` that the
 * converter performs. That's the domain, and it's the reason to look
 * in this file: any bug involving "the clipboard didn't get what I
 * expected" or "smart paste dropped my value" lives here.
 *
 * copyResult is deliberately split-brained: it performs the clipboard
 * write itself (that's clipboard's job), and it returns a
 * CopyResultOutcome with everything a downstream push-to-calculator
 * step needs. The controller composes the two — this hook does not
 * know about the calculator or the RPN stack.
 *
 * Smart paste (handleConverterSmartPaste and the two *Click variants)
 * also lives here, because it originates from the clipboard even
 * though its side effects reach across converter, uiPrefs, and
 * direct-pane state. Splitting the read out of the hook would leave
 * "read the clipboard" without a natural home.
 */
export function useConverterClipboard(i: UseConverterClipboardInput): UseConverterClipboardReturn {
  const copyResult = useCallback(
    (): CopyResultOutcome | null => copyResultImpl(i),
    depsForCopyResult(i),
  );

  const copyFromBaseFactor = useCallback(() => copyFromBaseFactorImpl(i),
    [i.activeCategory, i.fromUnit, i.fromPrefix, i.triggerFlashFromBaseFactor]);

  const copyFromSIBase = useCallback(() => copyFromSIBaseImpl(i),
    [i.activeCategory, i.getCategoryDimensions, i.triggerFlashFromSIBase]);

  const copyToBaseFactor = useCallback(() => copyToBaseFactorImpl(i),
    [i.activeCategory, i.toUnit, i.toPrefix, i.triggerFlashToBaseFactor]);

  const copyToSIBase = useCallback(() => copyToSIBaseImpl(i),
    [i.activeCategory, i.getCategoryDimensions, i.triggerFlashToSIBase]);

  const copyConversionRatio = useCallback(() => copyConversionRatioImpl(i),
    [i.result, i.activeCategory, i.fromUnit, i.toUnit, i.fromPrefix, i.toPrefix, i.precision,
     i.formatForClipboard, i.triggerFlashConversionRatio]);

  const handleConverterSmartPaste = useCallback(
    () => smartPasteConverterImpl(i),
    [i.activeCategory, i.setActiveCategory, i.setFromUnit, i.setFromPrefix, i.setInputValue,
     i.setPendingPasteUnit],
  );

  const handleConverterSmartPasteClick = useCallback(async () => {
    const status = await handleConverterSmartPaste();
    if (status === 'ok') { i.setConverterPasteStatus('idle'); return; }
    i.setConverterPasteStatus(status as PasteStatus);
    if (i.converterPasteTimerRef.current) clearTimeout(i.converterPasteTimerRef.current);
    i.converterPasteTimerRef.current = setTimeout(
      () => i.setConverterPasteStatus('idle'), PASTE_RESET_TIMEOUT_MS,
    );
  }, [handleConverterSmartPaste, i.setConverterPasteStatus, i.converterPasteTimerRef]);

  const handleCustomSmartPasteClick = useCallback(
    () => smartPasteCustomImpl(i),
    [i.setActiveTab, i.setActiveCategory, i.setFromUnit, i.setFromPrefix, i.setInputValue,
     i.setDirectValue, i.setDirectExponents, i.setCustomPasteStatus, i.setPendingPasteUnit,
     i.customPasteTimerRef],
  );

  return {
    copyResult, copyFromBaseFactor, copyFromSIBase, copyToBaseFactor, copyToSIBase,
    copyConversionRatio,
    handleConverterSmartPaste, handleConverterSmartPasteClick, handleCustomSmartPasteClick,
  };
}

// ─── Impls (pushed below the hook so each useCallback body stays ≤20 lines) ───

function depsForCopyResult(i: UseConverterClipboardInput): readonly unknown[] {
  return [
    i.result, i.activeCategory, i.fromUnit, i.toUnit, i.fromPrefix, i.toPrefix, i.precision,
    i.formatDMS, i.formatFtIn, i.formatForClipboard, i.getCategoryDimensions,
    i.triggerFlashCopyResult,
  ];
}

function copyResultImpl(i: UseConverterClipboardInput): CopyResultOutcome | null {
  if (i.result === null) return null;
  const catData = CONVERSION_DATA.find(c => c.id === i.activeCategory);
  const toUnitData = catData?.units.find(u => u.id === i.toUnit);
  const fromUnitData = catData?.units.find(u => u.id === i.fromUnit);
  if (!catData || !toUnitData || !fromUnitData) return null;
  const toPrefixData = PREFIXES.find(p => p.id === i.toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
  const text = renderCopyResultText({ i, toUnitData, toPrefixData });
  navigator.clipboard.writeText(text);
  i.triggerFlashCopyResult();
  return buildCopyResultOutcome({ i, catData, toUnitData, toPrefixData });
}

// The exact text that gets written to the clipboard for the current
// result. Handles the five presentation modes: DMS, ft-in, lightbulb
// (SI-base value with "lm" suffix), unitless with regional counting
// suffix, and the general "value [prefix]unit" form.
function renderCopyResultText(a: {
  i: UseConverterClipboardInput;
  toUnitData: { symbol: string; factor: number; allowPrefixes?: boolean };
  toPrefixData: { id: string; symbol: string; factor: number };
}): string {
  const { i, toUnitData, toPrefixData } = a;
  if (i.toUnit === 'deg_dms') return i.formatDMS(i.result as number);
  if (i.toUnit === 'ft_in') return i.formatFtIn(i.result as number);
  if (i.activeCategory === 'lightbulb') {
    // Lightbulb copies the SI-base value (result * toUnitData.factor *
    // toPrefixData.factor), not the displayed value. All other
    // categories copy the displayed result.
    const valueToCopy = (i.result as number) * toUnitData.factor * (toPrefixData.factor || 1);
    return `${i.formatForClipboard(valueToCopy, i.precision)} lm`;
  }
  if (i.activeCategory === 'unitless' && regionalCountingSuffix(i.toUnit)) {
    return `${i.formatForClipboard(i.result as number, i.precision)}${regionalCountingSuffix(i.toUnit)}`;
  }
  const prefix = (toUnitData.allowPrefixes && toPrefixData.id !== 'none') ? toPrefixData.symbol : '';
  return `${i.formatForClipboard(i.result as number, i.precision)} ${prefix}${toUnitData.symbol}`;
}

// The push-to-calculator payload. The value stored is the SI-base
// equivalent so downstream stack ops see a canonical scalar.
function buildCopyResultOutcome(a: {
  i: UseConverterClipboardInput;
  catData: { id: string; baseSISymbol?: string };
  toUnitData: { symbol: string; factor: number; allowPrefixes?: boolean; unitType?: UnitType };
  toPrefixData: { id: string; symbol: string; factor: number };
}): CopyResultOutcome {
  return {
    newEntry: buildCopyResultEntry(a),
    toUnitSymbol: a.toUnitData.symbol,
    toUnitAllowsPrefixes: a.toUnitData.allowPrefixes ?? false,
    toPrefixId: a.toPrefixData.id,
    toPrefixSymbol: a.toPrefixData.symbol,
  };
}

// The CalcValue that will get pushed onto the RPN or simple stack.
function buildCopyResultEntry(a: {
  i: UseConverterClipboardInput;
  catData: { id: string; baseSISymbol?: string };
  toUnitData: { symbol: string; factor: number; allowPrefixes?: boolean; unitType?: UnitType };
  toPrefixData: { id: string; symbol: string; factor: number };
}): CalcValue {
  const { i, catData, toUnitData, toPrefixData } = a;
  const siBaseValue = (i.result as number) * toUnitData.factor * (toPrefixData?.factor || 1);
  const toPfxSymbol = (toUnitData.allowPrefixes && toPrefixData.id !== 'none') ? toPrefixData.symbol : '';
  const isSpecialUnit = i.toUnit === 'deg_dms' || i.toUnit === 'ft_in';
  return {
    value: siBaseValue,
    dimensions: i.getCategoryDimensions(i.activeCategory),
    prefix: 'none',
    sourceCategory: i.activeCategory,
    siUnit: catData.baseSISymbol,
    originalUnit: isSpecialUnit ? undefined : toPfxSymbol + toUnitData.symbol,
    originalValue: isSpecialUnit ? undefined : (i.result as number),
    unitType: toUnitData.unitType,
  };
}

function copyFromBaseFactorImpl(i: UseConverterClipboardInput): void {
  const catData = CONVERSION_DATA.find(c => c.id === i.activeCategory);
  const u = catData?.units.find(u => u.id === i.fromUnit);
  const p = PREFIXES.find(p => p.id === i.fromPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
  if (!u) return;
  navigator.clipboard.writeText((u.factor * prefixPowerFactor(p.factor, u.prefixPower)).toString());
  i.triggerFlashFromBaseFactor();
}

function copyFromSIBaseImpl(i: UseConverterClipboardInput): void {
  const siBaseUnits = formatDimensions(i.getCategoryDimensions(i.activeCategory));
  if (!siBaseUnits) return;
  navigator.clipboard.writeText(siBaseUnits);
  i.triggerFlashFromSIBase();
}

function copyToBaseFactorImpl(i: UseConverterClipboardInput): void {
  const catData = CONVERSION_DATA.find(c => c.id === i.activeCategory);
  const u = catData?.units.find(u => u.id === i.toUnit);
  const p = PREFIXES.find(p => p.id === i.toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
  if (!u) return;
  navigator.clipboard.writeText((u.factor * prefixPowerFactor(p.factor, u.prefixPower)).toString());
  i.triggerFlashToBaseFactor();
}

function copyToSIBaseImpl(i: UseConverterClipboardInput): void {
  const siBaseUnits = formatDimensions(i.getCategoryDimensions(i.activeCategory));
  if (!siBaseUnits) return;
  navigator.clipboard.writeText(siBaseUnits);
  i.triggerFlashToSIBase();
}

function copyConversionRatioImpl(i: UseConverterClipboardInput): void {
  const catData = CONVERSION_DATA.find(c => c.id === i.activeCategory);
  const fromU = catData?.units.find(u => u.id === i.fromUnit);
  const toU = catData?.units.find(u => u.id === i.toUnit);
  const fromP = PREFIXES.find(p => p.id === i.fromPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
  const toP = PREFIXES.find(p => p.id === i.toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
  if (i.result === null || !fromU || !toU) return;
  const fromPS = (fromU.allowPrefixes && fromP.id !== 'none') ? fromP.symbol : '';
  const toPS = (toU.allowPrefixes && toP.id !== 'none') ? toP.symbol : '';
  const ratio = convert(1, i.fromUnit, i.toUnit, i.activeCategory,
    fromU.allowPrefixes ? prefixPowerFactor(fromP.factor, fromU.prefixPower) : 1,
    toU.allowPrefixes ? prefixPowerFactor(toP.factor, toU.prefixPower) : 1);
  navigator.clipboard.writeText(`1 ${fromPS}${fromU.symbol} = ${i.formatForClipboard(ratio, i.precision)} ${toPS}${toU.symbol}`);
  i.triggerFlashConversionRatio();
}

async function smartPasteConverterImpl(
  i: UseConverterClipboardInput,
): Promise<PasteStatus | 'ok'> {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) return 'unrecognised';
    const parsed = parseUnitText(text);
    if (applyParsedToConverter({ i, parsed })) return 'ok';
    if (applyDimensionsToConverter({ i, parsed })) return 'ok';
    return 'unrecognised';
  } catch {
    return 'unavailable';
  }
}

function applyParsedToConverter(a: {
  i: UseConverterClipboardInput;
  parsed: ReturnType<typeof parseUnitText>;
}): boolean {
  const { i, parsed } = a;
  if (!parsed.categoryId || !parsed.unitId) return false;
  if (parsed.categoryId === i.activeCategory) {
    i.setFromUnit(parsed.unitId);
    i.setFromPrefix(parsed.prefixId || 'none');
  } else {
    i.setPendingPasteUnit({ fromUnit: parsed.unitId, prefixId: parsed.prefixId || 'none' });
    i.setActiveCategory(parsed.categoryId as UnitCategory);
  }
  i.setInputValue(parsed.originalValue.toString());
  return true;
}

function applyDimensionsToConverter(a: {
  i: UseConverterClipboardInput;
  parsed: ReturnType<typeof parseUnitText>;
}): boolean {
  const { i, parsed } = a;
  if (!Object.values(parsed.dimensions).some(v => v !== 0)) return false;
  const catId = findCategoryByDimensions(parsed.dimensions as DimensionalFormula);
  if (!catId) return false;
  const catData = CONVERSION_DATA.find(c => c.id === catId);
  if (!catData) return false;
  i.setActiveCategory(catId as UnitCategory);
  i.setFromUnit(catData.baseUnit);
  i.setFromPrefix('none');
  i.setInputValue(parsed.originalValue.toString());
  return true;
}

async function smartPasteCustomImpl(i: UseConverterClipboardInput): Promise<void> {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) { failCustomPaste(i, 'unrecognised'); return; }
    const parsed = parseUnitText(text);
    if (applyParsedToCustom({ i, parsed })) return;
    if (applyDimensionsToCustom({ i, parsed })) return;
    applyRawToDirectPane({ i, parsed });
  } catch {
    failCustomPaste(i, 'unavailable');
  }
}

function applyParsedToCustom(a: {
  i: UseConverterClipboardInput;
  parsed: ReturnType<typeof parseUnitText>;
}): boolean {
  const { i, parsed } = a;
  if (!parsed.categoryId || !parsed.unitId) return false;
  i.setActiveTab('converter');
  i.setPendingPasteUnit({ fromUnit: parsed.unitId, prefixId: parsed.prefixId || 'none' });
  i.setActiveCategory(parsed.categoryId as UnitCategory);
  i.setInputValue(parsed.originalValue.toString());
  i.setCustomPasteStatus('idle');
  return true;
}

function applyDimensionsToCustom(a: {
  i: UseConverterClipboardInput;
  parsed: ReturnType<typeof parseUnitText>;
}): boolean {
  const { i, parsed } = a;
  if (!Object.values(parsed.dimensions).some(v => v !== 0)) return false;
  const catId = findCategoryByDimensions(parsed.dimensions as DimensionalFormula);
  if (!catId) return false;
  const catData = CONVERSION_DATA.find(c => c.id === catId);
  if (!catData) return false;
  i.setActiveTab('converter');
  i.setActiveCategory(catId as UnitCategory);
  i.setFromUnit(catData.baseUnit);
  i.setFromPrefix('none');
  i.setInputValue(parsed.originalValue.toString());
  i.setCustomPasteStatus('idle');
  return true;
}

function applyRawToDirectPane(a: {
  i: UseConverterClipboardInput;
  parsed: ReturnType<typeof parseUnitText>;
}): void {
  const { i, parsed } = a;
  i.setDirectValue(parsed.value.toString());
  i.setDirectExponents(dimensionsToExponents(parsed.dimensions as DimensionalFormula));
  i.setCustomPasteStatus('idle');
}

function failCustomPaste(i: UseConverterClipboardInput, status: PasteStatus): void {
  i.setCustomPasteStatus(status);
  if (i.customPasteTimerRef.current) clearTimeout(i.customPasteTimerRef.current);
  i.customPasteTimerRef.current = setTimeout(
    () => i.setCustomPasteStatus('idle'), PASTE_RESET_TIMEOUT_MS,
  );
}
