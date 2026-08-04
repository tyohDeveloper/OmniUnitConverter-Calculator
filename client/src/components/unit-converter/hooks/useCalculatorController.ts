import { useCallback, useEffect } from 'react';
import { CONVERSION_DATA, PREFIXES, parseUnitText } from '@/lib/conversion-data';
import { fixPrecision as fixPrecisionLib, toFixedBanker } from '@/lib/formatting';
import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import type { CalcValue } from '@/lib/units/calcValue';
import { UnitType } from '@/lib/units/unitType';
import { formatDimensions } from '@/lib/unit-symbols/formatDimensions';
import { isDimensionless } from '@/lib/dimensions/isDimensionless';
import { dimensionsEqual } from '@/lib/dimensions/dimensionsEqual';
import { canAddSubtract } from '@/lib/calculator/canAddSubtract';
import { generateSIRepresentations as generateSIRepresentationsLib } from '@/lib/si-representations/generateSIRepresentations';
import { getDimensionSignature } from '@/lib/units/getDimensionSignature';
import { PREFERRED_REPRESENTATIONS } from '@/lib/units/preferredRepresentations';
import { siToDisplay as siToDisplayLib } from '@/lib/unit-symbols/siToDisplay';
import { applyPrefixToKgUnit as applyPrefixToKgUnitLib } from '@/lib/units/applyPrefixToKgUnit';
import { SI_DERIVED_UNITS } from '@/lib/units/siDerivedUnitsCatalog';
import { CATEGORY_DIMENSIONS } from '@/lib/units/categoryDimensions';
import type { SIRepresentation } from '@/lib/si-representations/generateSIRepresentations';
import { applyRpnUnary as applyRpnUnaryLib, type RpnUnaryOp as RpnUnaryOpLib } from '@/lib/calculator/applyRpnUnary';
import { applyRpnBinary as applyRpnBinaryLib, type RpnBinaryOp as RpnBinaryOpLib } from '@/lib/calculator/applyRpnBinary';

import { useConverterContext } from '../context/ConverterContext';
import { useCalculatorState } from './useCalculatorState';
import { useRpnStack } from './useRpnStack';

// Council-02: re-export the lib's op types so any future op added to
// lib/calculator/rpnOps/* is instantly visible here. Keeps a single
// source of truth per architecture-standards §10.1.
export type RpnUnaryOp = RpnUnaryOpLib;
export type RpnBinaryOp = RpnBinaryOpLib;

export interface UseCalculatorControllerReturn {
  calculatorMode: 'simple' | 'rpn';
  shiftActive: boolean;
  calculatorPrecision: number;
  calcValues: Array<CalcValue | null>;
  calcOp1: '+' | '-' | '*' | '/' | null;
  calcOp2: '+' | '-' | '*' | '/' | null;
  resultPrefix: string;
  selectedAlternative: number;
  preserveSourceUnit: boolean;
  rpnStack: Array<CalcValue | null>;
  previousRpnStack: Array<CalcValue | null>;
  rpnResultPrefix: string;
  rpnSelectedAlternative: number;
  rpnXEditing: boolean;
  rpnXEditValue: string;

  setShiftActive: (v: boolean) => void;
  setCalculatorPrecision: (v: number) => void;
  setCalcOp1: (v: '+' | '-' | '*' | '/' | null) => void;
  setCalcOp2: (v: '+' | '-' | '*' | '/' | null) => void;
  setResultPrefix: (v: string) => void;
  setSelectedAlternative: (v: number) => void;
  togglePreserveSourceUnit: () => void;
  setRpnStack: (v: Array<CalcValue | null> | ((prev: Array<CalcValue | null>) => Array<CalcValue | null>)) => void;
  setRpnXEditing: (v: boolean) => void;
  setRpnXEditValue: (v: string) => void;

  clearCalculator: () => void;
  clearField1: () => void;
  clearField2: () => void;
  clearField3: () => void;
  clearRpnStack: () => void;
  copyCalcField: (index: number) => void;
  copyCalcResult: () => void;
  copyRpnField: (index: number) => void;
  copyRpnResult: () => void;
  switchToRpn: () => void;
  switchToSimple: () => void;
  applyRpnUnary: (op: RpnUnaryOp) => void;
  applyRpnBinary: (op: RpnBinaryOp) => void;
  canApplyRpnBinary: (op: RpnBinaryOp) => boolean;
  pushToRpnStack: () => void;
  dropRpnStack: () => void;
  undoRpnStack: () => void;
  pullFromPane: () => void;
  pasteToRpnStack: () => Promise<void>;
  swapRpnXY: () => void;
  recallLastX: () => void;
  pushRpnConstant: (value: number) => void;
  saveRpnStackForUndo: () => void;
  setRpnResultPrefix: (v: string) => void;
  setRpnSelectedAlternative: (v: number) => void;
  getRpnResultDisplay: () => { formattedValue: string; unitSymbol: string } | null;
  getCalcResultDisplay: () => { formattedValue: string; unitSymbol: string } | null;
  generateSIRepresentations: (dimensions: DimensionalFormula, sourceCategory?: string) => SIRepresentation[];
  applyPrefixToKgUnit: typeof applyPrefixToKgUnitLib;
  formatNumberWithSeparators: (num: number, precision: number) => string;
  t: (key: string) => string;
}

export function useCalculatorController(
  formatNumberWithSeparators: (num: number, precision: number) => string,
  t: (key: string) => string,
  activeTab: string,
  result: number | null,
  activeCategory: string,
  toUnit: string,
  toPrefix: string,
  directValue: string,
  buildDirectDimensions: () => Record<string, number>,
  parseNumberWithFormat: (s: string) => number,
): UseCalculatorControllerReturn {
  const { flash } = useConverterContext();
  const calcState = useCalculatorState();
  const rpnState = useRpnStack();

  const {
    calculatorMode, setCalculatorMode,
    shiftActive, setShiftActive,
    calculatorPrecision,
    calcValues, setCalcValues,
    calcOp1, setCalcOp1,
    calcOp2, setCalcOp2,
    resultPrefix, setResultPrefix,
    selectedAlternative, setSelectedAlternative,
    resultCategory, setResultCategory,
    resultUnit, setResultUnit,
    preserveSourceUnit, togglePreserveSourceUnit,
    setCalculatorPrecision,
    recalculateSimple,
  } = calcState;

  const {
    rpnStack, setRpnStack,
    previousRpnStack, setPreviousRpnStack,
    lastX, setLastX,
    rpnResultPrefix, setRpnResultPrefix: setRpnResultPrefixRaw,
    rpnSelectedAlternative, setRpnSelectedAlternative: setRpnSelectedAlternativeRaw,
    rpnXEditing, setRpnXEditing,
    rpnXEditValue, setRpnXEditValue,
  } = rpnState;

  const {
    triggerFlashCopyCalc, triggerFlashCalcField1, triggerFlashCalcField2,
    triggerFlashCalcField3, triggerFlashRpnField1, triggerFlashRpnField2,
    triggerFlashRpnField3, triggerFlashRpnResult,
  } = {
    triggerFlashCopyCalc: flash.copyCalc[1],
    triggerFlashCalcField1: flash.calcField1[1],
    triggerFlashCalcField2: flash.calcField2[1],
    triggerFlashCalcField3: flash.calcField3[1],
    triggerFlashRpnField1: flash.rpnField1[1],
    triggerFlashRpnField2: flash.rpnField2[1],
    triggerFlashRpnField3: flash.rpnField3[1],
    triggerFlashRpnResult: flash.rpnResult[1],
  };

  const generateSIRepresentations = useCallback((dimensions: DimensionalFormula, sourceCategory?: string): SIRepresentation[] => {
    return generateSIRepresentationsLib(dimensions, getDimensionSignature, PREFERRED_REPRESENTATIONS, sourceCategory);
  }, []);

  const applyPrefixToKgUnit = applyPrefixToKgUnitLib;

  const fixPrecision = (num: number): number => {
    if (num === 0) return 0;
    if (!isFinite(num)) return num;
    return parseFloat(num.toPrecision(17));
  };

  const cleanNumber = (num: number, precision: number): string => {
    const fixed = fixPrecision(num);
    let effectivePrecision = precision;
    const absNum = Math.abs(fixed);
    if (absNum > 0 && absNum < 1) {
      effectivePrecision = Math.min(Math.abs(Math.floor(Math.log10(absNum))) + precision, 12);
    }
    const formatted = toFixedBanker(fixed, effectivePrecision);
    return formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
  };

  const saveRpnStackForUndo = useCallback(() => {
    setPreviousRpnStack([...rpnStack]);
  }, [rpnStack, setPreviousRpnStack]);

  const computeOriginMetaForValue = useCallback((val: CalcValue | null, altIndex: number, prefix: string): { originalUnit: string; originalValue: number; unitType: UnitType; sourceCategory: string | undefined } | null => {
    if (!val) return null;
    const siReps = generateSIRepresentations(val.dimensions, val.sourceCategory);
    const rep = siReps[altIndex];
    const symbol = rep?.displaySymbol || formatDimensions(val.dimensions);
    if (!symbol || symbol === '1') return null;
    const kgResult = applyPrefixToKgUnit(symbol, prefix);
    const displayValue = siToDisplayLib(val.value, symbol, prefix);
    const prefixData = PREFIXES.find(p => p.id === prefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    const primaryDerivedUnit = rep?.derivedUnits?.[0];
    const derivedUnitInfo = primaryDerivedUnit ? SI_DERIVED_UNITS.find(u => u.symbol === primaryDerivedUnit) : undefined;
    const sourceCategory = derivedUnitInfo?.category ?? val.sourceCategory;
    return { originalUnit: prefixSymbol + kgResult.displaySymbol, originalValue: displayValue, unitType: UnitType.SI_BASE, sourceCategory };
  }, [generateSIRepresentations]);

  const setRpnSelectedAlternative = useCallback((altIndex: number) => {
    setRpnSelectedAlternativeRaw(altIndex);
    setRpnResultPrefixRaw('none');
    setRpnStack(prev => {
      const ns = [...prev];
      const meta = computeOriginMetaForValue(ns[3], altIndex, 'none');
      if (ns[3] && meta) {
        ns[3] = { ...ns[3], originalUnit: meta.originalUnit, originalValue: meta.originalValue, unitType: meta.unitType, sourceCategory: meta.sourceCategory };
      }
      return ns;
    });
  }, [setRpnSelectedAlternativeRaw, setRpnResultPrefixRaw, computeOriginMetaForValue, setRpnStack]);

  const setRpnResultPrefix = useCallback((prefix: string) => {
    setRpnResultPrefixRaw(prefix);
    setRpnStack(prev => {
      const ns = [...prev];
      const meta = computeOriginMetaForValue(ns[3], rpnSelectedAlternative, prefix);
      if (ns[3] && meta) {
        ns[3] = { ...ns[3], originalUnit: meta.originalUnit, originalValue: meta.originalValue, unitType: meta.unitType, sourceCategory: meta.sourceCategory };
      }
      return ns;
    });
  }, [setRpnResultPrefixRaw, computeOriginMetaForValue, rpnSelectedAlternative, setRpnStack]);

  const clearCalculator = useCallback(() => {
    setCalcValues([null, null, null, null]);
    setCalcOp1(null); setCalcOp2(null);
    setResultUnit(null); setResultCategory(null); setResultPrefix('none');
  }, [setCalcValues, setCalcOp1, setCalcOp2, setResultUnit, setResultCategory, setResultPrefix]);

  const clearField1 = useCallback(() => {
    setCalcValues(prev => { const nv = [...prev]; nv[0] = null; return nv; });
    setCalcOp1(null);
  }, [setCalcValues, setCalcOp1]);

  const clearField2 = useCallback(() => {
    setCalcValues(prev => { const nv = [...prev]; nv[1] = null; return nv; });
    setCalcOp2(null);
  }, [setCalcValues, setCalcOp2]);

  const clearField3 = useCallback(() => {
    setCalcValues(prev => { const nv = [...prev]; nv[2] = null; return nv; });
  }, [setCalcValues]);

  const clearRpnStack = useCallback(() => {
    saveRpnStackForUndo();
    setRpnStack([null, null, null, null]);
    setRpnResultPrefixRaw('none');
    setRpnSelectedAlternativeRaw(0);
  }, [saveRpnStackForUndo, setRpnStack, setRpnResultPrefixRaw, setRpnSelectedAlternativeRaw]);

  const pushToRpnStack = useCallback(() => {
    if (!rpnStack[3]) return;
    saveRpnStackForUndo();
    setRpnStack(prev => { const ns = [...prev]; ns[0] = prev[1]; ns[1] = prev[2]; ns[2] = prev[3]; return ns; });
  }, [rpnStack, saveRpnStackForUndo, setRpnStack]);

  const dropRpnStack = useCallback(() => {
    saveRpnStackForUndo();
    setRpnStack(prev => { const ns = [...prev]; ns[1] = prev[0]; ns[2] = prev[1]; ns[3] = prev[2]; return ns; });
  }, [saveRpnStackForUndo, setRpnStack]);

  const undoRpnStack = useCallback(() => {
    const temp = [...rpnStack];
    setRpnStack([...previousRpnStack]);
    setPreviousRpnStack(temp);
  }, [rpnStack, previousRpnStack, setRpnStack, setPreviousRpnStack]);

  const swapRpnXY = useCallback(() => {
    if (!rpnStack[3] || !rpnStack[2]) return;
    saveRpnStackForUndo();
    setRpnStack(prev => { const ns = [...prev]; ns[3] = prev[2]; ns[2] = prev[3]; return ns; });
  }, [rpnStack, saveRpnStackForUndo, setRpnStack]);

  const recallLastX = useCallback(() => {
    if (!lastX) return;
    saveRpnStackForUndo();
    setRpnStack(prev => { const ns = [...prev]; ns[0] = prev[1]; ns[1] = prev[2]; ns[2] = prev[3]; ns[3] = lastX; return ns; });
  }, [lastX, saveRpnStackForUndo, setRpnStack]);

  const pushRpnConstant = useCallback((value: number) => {
    saveRpnStackForUndo();
    setRpnStack(prev => { const ns = [...prev]; ns[0] = prev[1]; ns[1] = prev[2]; ns[2] = prev[3]; ns[3] = { value, dimensions: {}, prefix: 'none' }; return ns; });
    setRpnResultPrefixRaw('none');
    setRpnSelectedAlternativeRaw(0);
    triggerFlashRpnResult();
  }, [saveRpnStackForUndo, setRpnStack, setRpnResultPrefixRaw, setRpnSelectedAlternativeRaw, triggerFlashRpnResult]);

  const pullFromPane = useCallback(() => {
    let newEntry: CalcValue | null = null;
    if (activeTab === 'converter') {
      if (result !== null) {
        const categoryData = CONVERSION_DATA.find(c => c.id === activeCategory);
        const toUnitData = categoryData?.units.find(u => u.id === toUnit);
        const toPrefixData = PREFIXES.find(p => p.id === toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
        if (toUnitData) {
          const siValue = result * toUnitData.factor * (toPrefixData?.factor || 1);
          const categoryDef = CONVERSION_DATA.find(c => c.id === activeCategory);
          const toPfxSymbol = (toUnitData.allowPrefixes && toPrefixData && toPrefixData.id !== 'none') ? toPrefixData.symbol : '';
          const dims: Record<string, number> = {};
          // Council-03: use the canonical CATEGORY_DIMENSIONS catalog
          // instead of an embedded dimMap literal.
          Object.assign(dims, CATEGORY_DIMENSIONS[activeCategory]?.dimensions ?? {});
          newEntry = {
            value: siValue,
            dimensions: dims,
            prefix: 'none',
            sourceCategory: activeCategory,
            siUnit: categoryDef?.baseSISymbol,
            originalUnit: toPfxSymbol + toUnitData.symbol,
            originalValue: result,
            unitType: toUnitData.unitType,
          };
        }
      }
    } else if (activeTab === 'custom') {
      const numValue = parseNumberWithFormat(directValue);
      if (!isNaN(numValue) && directValue) {
        newEntry = { value: numValue, dimensions: buildDirectDimensions(), prefix: 'none' };
      }
    }
    if (!newEntry) return;
    saveRpnStackForUndo();
    setRpnStack(prev => { const ns = [...prev]; ns[0] = prev[1]; ns[1] = prev[2]; ns[2] = prev[3]; ns[3] = newEntry; return ns; });
    let autoAlt = 0;
    let autoPrefix = 'none';
    if (activeTab === 'converter' && newEntry) {
      const categoryData = CONVERSION_DATA.find(c => c.id === activeCategory);
      const toUnitData = categoryData?.units.find(u => u.id === toUnit);
      const toPrefixData = PREFIXES.find(p => p.id === toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
      if (toUnitData) {
        const siReps = generateSIRepresentations(newEntry.dimensions, activeCategory);
        const matchIdx = siReps.findIndex(rep => rep.displaySymbol === toUnitData.symbol);
        if (matchIdx >= 0) {
          autoAlt = matchIdx;
          autoPrefix = (toUnitData.allowPrefixes && toPrefixData && toPrefixData.id !== 'none') ? toPrefixData.id : 'none';
        }
      }
    }
    setRpnResultPrefixRaw(autoPrefix);
    setRpnSelectedAlternativeRaw(autoAlt);
    triggerFlashRpnResult();
  }, [activeTab, result, activeCategory, toUnit, toPrefix, directValue, buildDirectDimensions,
    parseNumberWithFormat, saveRpnStackForUndo, setRpnStack, setRpnResultPrefixRaw,
    setRpnSelectedAlternativeRaw, triggerFlashRpnResult, generateSIRepresentations]);

  const pasteToRpnStack = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      const parsed = parseUnitText(text);
      const dims: DimensionalFormula = {};
      const dimKeys = ['length', 'mass', 'time', 'current', 'temperature', 'amount', 'intensity', 'angle', 'solid_angle'] as const;
      for (const key of dimKeys) {
        if (parsed.dimensions[key]) dims[key] = parsed.dimensions[key];
      }
      let sourceCategory: string | undefined;
      let siUnit: string | undefined;
      let originalUnit: string | undefined;
      let unitType: UnitType | undefined;
      if (parsed.categoryId) {
        sourceCategory = parsed.categoryId;
        const categoryDef = CONVERSION_DATA.find(c => c.id === parsed.categoryId);
        siUnit = categoryDef?.baseSISymbol;
        if (parsed.unitId && categoryDef) {
          const unitDef = categoryDef.units.find(u => u.id === parsed.unitId);
          if (unitDef) {
            const prefixDef = PREFIXES.find(p => p.id === parsed.prefixId);
            const prefixSymbol = (unitDef.allowPrefixes && prefixDef && prefixDef.id !== 'none') ? prefixDef.symbol : '';
            originalUnit = prefixSymbol + unitDef.symbol;
            unitType = unitDef.unitType;
          }
        }
      }
      const newEntry: CalcValue = {
        value: parsed.value,
        dimensions: dims,
        prefix: parsed.prefixId || 'none',
        sourceCategory,
        siUnit,
        originalUnit,
        originalValue: parsed.originalValue,
        unitType,
      };
      saveRpnStackForUndo();
      setRpnStack(prev => { const ns = [...prev]; ns[0] = prev[1]; ns[1] = prev[2]; ns[2] = prev[3]; ns[3] = newEntry; return ns; });
      let autoAlt = 0;
      let autoPrefix = 'none';
      if (parsed.categoryId && parsed.unitId) {
        const categoryDef = CONVERSION_DATA.find(c => c.id === parsed.categoryId);
        const unitDef = categoryDef?.units.find(u => u.id === parsed.unitId);
        if (unitDef) {
          const siReps = generateSIRepresentations(dims, parsed.categoryId);
          const matchIdx = siReps.findIndex(rep => rep.displaySymbol === unitDef.symbol);
          if (matchIdx >= 0) {
            autoAlt = matchIdx;
            const prefixDef = PREFIXES.find(p => p.id === parsed.prefixId);
            autoPrefix = (unitDef.allowPrefixes && prefixDef && prefixDef.id !== 'none') ? prefixDef.id : 'none';
          }
        }
      }
      setRpnResultPrefixRaw(autoPrefix);
      setRpnSelectedAlternativeRaw(autoAlt);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  }, [saveRpnStackForUndo, setRpnStack, setRpnResultPrefixRaw, setRpnSelectedAlternativeRaw, generateSIRepresentations]);

  // Council-02: RPN unary dispatch delegates to lib/calculator/applyRpnUnary
  // (single source of truth). The controller's only remaining
  // responsibilities are stack orchestration, undo capture, and adding the
  // app-wide CalcValue.prefix field that the lib intentionally omits.
  // Undo capture and lastX are set BEFORE the guard result is checked to
  // preserve exact prior behavior of the inline switch (which called
  // saveRpnStackForUndo/setLastX before any early return).
  const applyRpnUnary = useCallback((op: RpnUnaryOp) => {
    const x = rpnStack[3];
    if (!x) return;
    saveRpnStackForUndo();
    setLastX(x);
    const result = applyRpnUnaryLib(x, op, calculatorPrecision);
    if (!result) return;
    const newEntry: CalcValue = { ...result, prefix: 'none' };
    setRpnStack(prev => { const ns = [...prev]; ns[3] = newEntry; return ns; });
    setRpnResultPrefixRaw('none');
    setRpnSelectedAlternativeRaw(0);
    triggerFlashRpnResult();
  }, [rpnStack, calculatorPrecision, saveRpnStackForUndo, setLastX, setRpnStack, setRpnResultPrefixRaw, setRpnSelectedAlternativeRaw, triggerFlashRpnResult]);

  const canApplyRpnBinary = useCallback((op: RpnBinaryOp): boolean => {
    if (!rpnStack[2] || !rpnStack[3]) return false;
    if (op === 'addUnit' || op === 'subUnit') {
      const y = rpnStack[2]; const x = rpnStack[3];
      return dimensionsEqual(y.dimensions, x.dimensions) || isDimensionless(y.dimensions) || isDimensionless(x.dimensions);
    }
    return true;
  }, [rpnStack]);

  // Council-02: RPN binary dispatch delegates to lib/calculator/applyRpnBinary.
  // Undo capture and lastX are set BEFORE the guard result is checked to
  // preserve exact prior behavior of the inline switch.
  const applyRpnBinary = useCallback((op: RpnBinaryOp) => {
    const y = rpnStack[2]; const x = rpnStack[3];
    if (!y || !x) return;
    saveRpnStackForUndo();
    setLastX(x);
    const result = applyRpnBinaryLib(y, x, op);
    if (!result) return;
    const newEntry: CalcValue = { ...result, prefix: 'none' };
    setRpnStack(prev => {
      const ns = [...prev];
      ns[3] = newEntry;
      ns[2] = prev[1];
      ns[1] = prev[0];
      ns[0] = null;
      return ns;
    });
    setRpnResultPrefixRaw('none');
    setRpnSelectedAlternativeRaw(0);
    triggerFlashRpnResult();
  }, [rpnStack, saveRpnStackForUndo, setLastX, setRpnStack, setRpnResultPrefixRaw, setRpnSelectedAlternativeRaw, triggerFlashRpnResult]);

  const getRpnResultDisplay = useCallback(() => {
    if (!rpnStack[3]) return null;
    const val = rpnStack[3];
    const siReps = generateSIRepresentations(val.dimensions, val.sourceCategory);
    const currentSymbol = siReps[rpnSelectedAlternative]?.displaySymbol || formatDimensions(val.dimensions);
    if (currentSymbol === '1' || !currentSymbol) return { formattedValue: formatNumberWithSeparators(val.value, calculatorPrecision), unitSymbol: '' };
    const kgResult = applyPrefixToKgUnit(currentSymbol, rpnResultPrefix);
    const displayValue = siToDisplayLib(val.value, currentSymbol, rpnResultPrefix);
    const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
    const prefixData = PREFIXES.find(p => p.id === rpnResultPrefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    return { formattedValue, unitSymbol: prefixSymbol + kgResult.displaySymbol };
  }, [rpnStack, rpnSelectedAlternative, rpnResultPrefix, calculatorPrecision, generateSIRepresentations, formatNumberWithSeparators]);

  const getCalcResultDisplay = useCallback(() => {
    if (!calcValues[3]) return null;
    const val = calcValues[3];
    const siReps = generateSIRepresentations(val.dimensions, val.sourceCategory);
    const currentSymbol = siReps[selectedAlternative]?.displaySymbol || formatDimensions(val.dimensions);
    const kgResult = applyPrefixToKgUnit(currentSymbol, resultPrefix);
    const displayValue = val.value / kgResult.effectivePrefixFactor;
    const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
    const prefixData = PREFIXES.find(p => p.id === resultPrefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    return { formattedValue, unitSymbol: prefixSymbol + kgResult.displaySymbol };
  }, [calcValues, selectedAlternative, resultPrefix, calculatorPrecision, generateSIRepresentations, formatNumberWithSeparators]);

  const copyCalcResult = useCallback(() => {
    const display = getCalcResultDisplay();
    if (!display) return;
    navigator.clipboard.writeText(display.unitSymbol ? `${display.formattedValue} ${display.unitSymbol}` : display.formattedValue);
    triggerFlashCopyCalc();
  }, [getCalcResultDisplay, triggerFlashCopyCalc]);

  const copyCalcField = useCallback((fieldIndex: number) => {
    const val = calcValues[fieldIndex];
    if (!val) return;
    const baseUnitSymbol = formatDimensions(val.dimensions);
    const kgResult = applyPrefixToKgUnit(baseUnitSymbol, val.prefix);
    const displayValue = fixPrecision(val.value / kgResult.effectivePrefixFactor);
    const prefixData = PREFIXES.find(p => p.id === val.prefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    const unitSymbol = prefixSymbol + kgResult.displaySymbol;
    const valueStr = cleanNumber(displayValue, calculatorPrecision);
    navigator.clipboard.writeText(unitSymbol ? `${valueStr} ${unitSymbol}` : valueStr);
    if (fieldIndex === 0) triggerFlashCalcField1();
    else if (fieldIndex === 1) triggerFlashCalcField2();
    else if (fieldIndex === 2) triggerFlashCalcField3();
  }, [calcValues, calculatorPrecision, triggerFlashCalcField1, triggerFlashCalcField2, triggerFlashCalcField3]);

  const copyRpnResult = useCallback(() => {
    const display = getRpnResultDisplay();
    if (!display) return;
    const cleanValue = display.formattedValue.replace(/,/g, '');
    navigator.clipboard.writeText(display.unitSymbol ? `${cleanValue} ${display.unitSymbol}` : cleanValue);
    triggerFlashRpnResult();
  }, [getRpnResultDisplay, triggerFlashRpnResult]);

  const copyRpnField = useCallback((index: number) => {
    const val = rpnStack[index];
    if (!val) return;
    const baseUnitSymbol = formatDimensions(val.dimensions);
    const kgResult = applyPrefixToKgUnit(baseUnitSymbol, val.prefix);
    const displayValue = val.value / kgResult.effectivePrefixFactor;
    const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
    const cleanValue = formattedValue.replace(/,/g, '');
    const prefixData = PREFIXES.find(p => p.id === val.prefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    const unitSymbol = prefixSymbol + kgResult.displaySymbol;
    navigator.clipboard.writeText(unitSymbol ? `${cleanValue} ${unitSymbol}` : cleanValue);
    if (index === 0) triggerFlashRpnField1();
    else if (index === 1) triggerFlashRpnField2();
    else if (index === 2) triggerFlashRpnField3();
  }, [rpnStack, calculatorPrecision, formatNumberWithSeparators, triggerFlashRpnField1, triggerFlashRpnField2, triggerFlashRpnField3]);

  const switchToRpn = useCallback(() => {
    saveRpnStackForUndo();
    setRpnStack([null, null, null, calcValues[3]]);
    setRpnResultPrefixRaw('none');
    setRpnSelectedAlternativeRaw(0);
    setCalculatorMode('rpn');
  }, [calcValues, saveRpnStackForUndo, setRpnStack, setRpnResultPrefixRaw, setRpnSelectedAlternativeRaw, setCalculatorMode]);

  const switchToSimple = useCallback(() => {
    setCalcValues([rpnStack[3], null, null, null]);
    setCalcOp1(null); setCalcOp2(null);
    setResultPrefix('none'); setSelectedAlternative(0);
    setCalculatorMode('simple');
  }, [rpnStack, setCalcValues, setCalcOp1, setCalcOp2, setResultPrefix, setSelectedAlternative, setCalculatorMode]);

  // Council-10: computeCalcResult now lives at
  // client/src/lib/calculator/computeCalcResult.ts, and the recalc itself
  // is a single atomic reducer action. The controller-local inputs-ref
  // dedup is gone: the reducer only mutates state when it produces a new
  // result, and calcValues[3] is not in this effect's dep array, so the
  // effect fires exactly when inputs actually change.
  useEffect(() => {
    const v0 = calcValues[0]; const v1 = calcValues[1]; const v2 = calcValues[2];

    if (v0 && v1 && !calcOp1) { setCalcOp1('*'); return; }
    if (v1 && v2 && !calcOp2) { setCalcOp2('*'); return; }
    if (v0 && v1 && (calcOp1 === '+' || calcOp1 === '-') && !canAddSubtract(v0, v1)) { setCalcOp1(null); return; }
    if (v1 && v2 && (calcOp2 === '+' || calcOp2 === '-') && !canAddSubtract(v1, v2)) { setCalcOp2(null); return; }

    if (!v0) {
      setCalcValues(prev => { if (prev[3] === null) return prev; const nv = [...prev]; nv[3] = null; return nv; });
      setResultCategory(null); setResultUnit(null);
      return;
    }

    recalculateSimple();
  }, [calcValues[0], calcValues[1], calcValues[2], calcOp1, calcOp2]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    calculatorMode, shiftActive, calculatorPrecision,
    calcValues, calcOp1, calcOp2,
    resultPrefix, selectedAlternative, preserveSourceUnit,
    rpnStack, previousRpnStack, rpnResultPrefix, rpnSelectedAlternative,
    rpnXEditing, rpnXEditValue,

    setShiftActive, setCalculatorPrecision,
    setCalcOp1, setCalcOp2,
    setResultPrefix, setSelectedAlternative, togglePreserveSourceUnit,
    setRpnStack, setRpnXEditing, setRpnXEditValue,
    setRpnResultPrefix, setRpnSelectedAlternative,

    clearCalculator, clearField1, clearField2, clearField3, clearRpnStack,
    copyCalcField, copyCalcResult, copyRpnField, copyRpnResult,
    switchToRpn, switchToSimple,
    applyRpnUnary, applyRpnBinary, canApplyRpnBinary,
    pushToRpnStack, dropRpnStack, undoRpnStack, pullFromPane,
    pasteToRpnStack, swapRpnXY, recallLastX, pushRpnConstant,
    saveRpnStackForUndo,
    getRpnResultDisplay, getCalcResultDisplay,
    generateSIRepresentations, applyPrefixToKgUnit,
    formatNumberWithSeparators, t,
  };
}
