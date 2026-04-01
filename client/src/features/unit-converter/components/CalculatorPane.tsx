import React from 'react';
import { motion } from 'framer-motion';
import { parseUnitText, PREFIXES } from '@/lib/conversion-data';
import type { CalcValue, DimensionalFormula } from '@/lib/units/shared-types';
import { formatDimensions, isDimensionEmpty, canAddSubtract } from '@/lib/calculator';
import { toArabicNumerals } from '@/lib/formatting';
import type { NumberFormat } from '@/lib/formatting';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Copy, ClipboardPaste } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CalculatorFieldDisplay } from '@/components/unit-converter/components/CalculatorFieldDisplay';
import {
  FIELD_HEIGHT, CommonFieldWidth, OperatorBtnWidth, ClearBtnWidth,
  RpnBtnWidth, CALC_CONTENT_HEIGHT
} from '@/components/unit-converter/constants';

type RpnUnaryOp =
  | 'square' | 'cube' | 'sqrt' | 'cbrt' | 'recip'
  | 'exp' | 'ln' | 'pow10' | 'log10' | 'pow2' | 'log2'
  | 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan'
  | 'sinh' | 'cosh' | 'tanh' | 'asinh' | 'acosh' | 'atanh'
  | 'rnd' | 'trunc' | 'floor' | 'ceil'
  | 'neg' | 'abs';

type RpnBinaryOp = 'mul' | 'div' | 'add' | 'sub' | 'mulUnit' | 'divUnit' | 'addUnit' | 'subUnit' | 'pow';

interface CalculatorPaneProps {
  calculatorMode: 'simple' | 'rpn';
  shiftActive: boolean;
  calculatorPrecision: number;
  numberFormat: NumberFormat;
  calcValues: Array<CalcValue | null>;
  calcOp1: '+' | '-' | '*' | '/' | null;
  calcOp2: '+' | '-' | '*' | '/' | null;
  resultPrefix: string;
  selectedAlternative: number;
  rpnStack: Array<CalcValue | null>;
  previousRpnStack: Array<CalcValue | null>;
  rpnResultPrefix: string;
  rpnSelectedAlternative: number;
  rpnXEditing: boolean;
  rpnXEditValue: string;
  flashCalcField1: boolean;
  flashCalcField2: boolean;
  flashCalcField3: boolean;
  flashCopyCalc: boolean;
  flashRpnField1: boolean;
  flashRpnField2: boolean;
  flashRpnField3: boolean;
  flashRpnResult: boolean;
  setShiftActive: (val: boolean) => void;
  setCalculatorPrecision: (val: number) => void;
  setCalcOp1: (val: '+' | '-' | '*' | '/' | null) => void;
  setCalcOp2: (val: '+' | '-' | '*' | '/' | null) => void;
  setResultPrefix: (val: string) => void;
  setSelectedAlternative: (val: number) => void;
  setRpnResultPrefix: (val: string) => void;
  setRpnSelectedAlternative: (val: number) => void;
  setRpnXEditing: (val: boolean) => void;
  setRpnXEditValue: (val: string) => void;
  setRpnStack: React.Dispatch<React.SetStateAction<Array<CalcValue | null>>>;
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
  swapRpnXY: () => void;
  recallLastX: () => void;
  pushRpnConstant: (value: number) => void;
  saveRpnStackForUndo: () => void;
  getRpnResultDisplay: () => { formattedValue: string; unitSymbol: string } | null;
  getCalcResultDisplay: () => { formattedValue: string; unitSymbol: string } | null;
  generateSIRepresentations: (dimensions: DimensionalFormula) => Array<{ displaySymbol: string; crossDomainMatches?: string[] }>;
  applyPrefixToKgUnit: (symbol: string, prefixId: string) => { displaySymbol: string; showPrefix: boolean; effectivePrefixFactor: number };
  formatNumberWithSeparators: (num: number, precision: number) => string;
  t: (key: string) => string;
}

export function CalculatorPane({
  calculatorMode,
  shiftActive,
  calculatorPrecision,
  numberFormat,
  calcValues,
  calcOp1,
  calcOp2,
  resultPrefix,
  selectedAlternative,
  rpnStack,
  previousRpnStack,
  rpnResultPrefix,
  rpnSelectedAlternative,
  rpnXEditing,
  rpnXEditValue,
  flashCalcField1,
  flashCalcField2,
  flashCalcField3,
  flashCopyCalc,
  flashRpnField1,
  flashRpnField2,
  flashRpnField3,
  flashRpnResult,
  setShiftActive,
  setCalculatorPrecision,
  setCalcOp1,
  setCalcOp2,
  setResultPrefix,
  setSelectedAlternative,
  setRpnResultPrefix,
  setRpnSelectedAlternative,
  setRpnXEditing,
  setRpnXEditValue,
  setRpnStack,
  clearCalculator,
  clearField1,
  clearField2,
  clearField3,
  clearRpnStack,
  copyCalcField,
  copyCalcResult,
  copyRpnField,
  copyRpnResult,
  switchToRpn,
  switchToSimple,
  applyRpnUnary,
  applyRpnBinary,
  canApplyRpnBinary,
  pushToRpnStack,
  dropRpnStack,
  undoRpnStack,
  pullFromPane,
  swapRpnXY,
  recallLastX,
  pushRpnConstant,
  saveRpnStackForUndo,
  getRpnResultDisplay,
  getCalcResultDisplay,
  generateSIRepresentations,
  applyPrefixToKgUnit,
  formatNumberWithSeparators,
  t,
}: CalculatorPaneProps) {
  return (
    <Card className="w-full p-6 bg-card border-border/50">
      {/* Simple Calculator Header */}
      {calculatorMode === 'simple' && (
        <div
          className="grid gap-2 mb-4 items-center"
          style={{ gridTemplateColumns: `${CommonFieldWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${ClearBtnWidth}` }}
        >
          <div className="flex items-center justify-between" style={{ width: CommonFieldWidth, maxWidth: CommonFieldWidth }}>
            <Label
              className="text-xs font-mono uppercase text-foreground cursor-pointer hover:text-accent transition-colors px-2 py-1 rounded border border-border/30"
              onClick={() => switchToRpn()}
            >
              {t('CALCULATOR') + ' ⇅'}
            </Label>
            <div className="flex items-center gap-1">
              <Label className="text-xs text-foreground">{t('Precision')}</Label>
              <Select
                value={calculatorPrecision.toString()}
                onValueChange={(val) => setCalculatorPrecision(parseInt(val))}
              >
                <SelectTrigger className="h-8 w-[50px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                    <SelectItem key={p} value={p.toString()} className="text-xs">
                      {numberFormat === 'arabic' ? toArabicNumerals(p.toString()) : p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCalculator}
            className="text-xs text-foreground hover:text-accent border !border-border/30"
            style={{ justifySelf: 'start' }}
          >
            {t('Clear calculator')}
          </Button>
          <div />
          <div />
          <div />
          <div />
        </div>
      )}

      {/* RPN Calculator Header */}
      {calculatorMode === 'rpn' && (
        <div
          className="grid gap-2 mb-4 items-center"
          style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
        >
          <div className="flex items-center justify-between" style={{ width: CommonFieldWidth, maxWidth: CommonFieldWidth }}>
            <Label
              className="text-xs font-mono uppercase text-foreground cursor-pointer hover:text-accent transition-colors px-2 py-1 rounded border border-border/30"
              onClick={() => switchToSimple()}
            >
              {t('CALCULATOR - RPN') + ' ⇅'}
            </Label>
            <div className="flex items-center gap-1">
              <Label className="text-xs text-foreground">{t('Precision')}</Label>
              <Select
                value={calculatorPrecision.toString()}
                onValueChange={(val) => setCalculatorPrecision(parseInt(val))}
              >
                <SelectTrigger className="h-8 w-[50px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                    <SelectItem key={p} value={p.toString()} className="text-xs">
                      {numberFormat === 'arabic' ? toArabicNumerals(p.toString()) : p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearRpnStack}
            className="text-xs text-foreground hover:text-accent border !border-border/30"
            style={{ justifySelf: 'start' }}
          >
            {t('Clear calculator')}
          </Button>
          <span style={{ gridColumn: 'span 6' }}></span>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();
                if (!text) return;
                const parsed = parseUnitText(text);
                const dims: Record<string, number> = {};
                if (parsed.dimensions.length) dims.length = parsed.dimensions.length;
                if (parsed.dimensions.mass) dims.mass = parsed.dimensions.mass;
                if (parsed.dimensions.time) dims.time = parsed.dimensions.time;
                if (parsed.dimensions.current) dims.current = parsed.dimensions.current;
                if (parsed.dimensions.temperature) dims.temperature = parsed.dimensions.temperature;
                if (parsed.dimensions.amount) dims.amount = parsed.dimensions.amount;
                if (parsed.dimensions.intensity) dims.intensity = parsed.dimensions.intensity;
                if (parsed.dimensions.angle) dims.angle = parsed.dimensions.angle;
                if (parsed.dimensions.solid_angle) dims.solid_angle = parsed.dimensions.solid_angle;

                const newEntry = {
                  value: parsed.value,
                  dimensions: dims,
                  prefix: parsed.prefixId || 'none'
                };

                saveRpnStackForUndo();
                setRpnStack(prev => {
                  const newStack = [...prev];
                  newStack[0] = prev[1];
                  newStack[1] = prev[2];
                  newStack[2] = prev[3];
                  newStack[3] = newEntry;
                  return newStack;
                });
                setRpnResultPrefix('none');
                setRpnSelectedAlternative(0);
              } catch (err) {
                console.error('Failed to read clipboard:', err);
              }
            }}
            className="text-xs text-foreground hover:text-accent gap-2 border !border-border/30"
          >
            <ClipboardPaste className="w-3 h-3" />
            {t('Paste')}
          </Button>
        </div>
      )}

      {/* Fixed-height container to prevent flicker on mode switch */}
      <div style={{ minHeight: CALC_CONTENT_HEIGHT }}>
        {/* Simple Calculator Mode */}
        {calculatorMode === 'simple' && (
          <div className="space-y-2">
            {/* Field 1 */}
            <div
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${ClearBtnWidth}` }}
            >
              <CalculatorFieldDisplay
                value={calcValues[0]}
                onClick={() => copyCalcField(0)}
                isFlashing={flashCalcField1}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              <div style={{ visibility: 'hidden' }} />
              <div style={{ visibility: 'hidden' }} />
              <div style={{ visibility: 'hidden' }} />
              <div style={{ visibility: 'hidden' }} />
              <Button
                variant="ghost"
                size="sm"
                onClick={clearField1}
                disabled={!calcValues[0]}
                className="text-xs justify-self-start border !border-border/30"
              >
                {t('Clear')}
              </Button>
            </div>

            {/* Field 2 */}
            <div
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${ClearBtnWidth}` }}
            >
              <CalculatorFieldDisplay
                value={calcValues[1]}
                onClick={() => copyCalcField(1)}
                isFlashing={flashCalcField2}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalcOp1('*')}
                disabled={!calcValues[0] || !calcValues[1]}
                className={`text-sm w-full border !border-border/30 ${calcOp1 === '*' ? 'text-accent font-bold' : ''}`}
              >
                ×
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalcOp1('/')}
                disabled={!calcValues[0] || !calcValues[1]}
                className={`text-sm w-full border !border-border/30 ${calcOp1 === '/' ? 'text-accent font-bold' : ''}`}
              >
                /
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalcOp1('+')}
                disabled={!canAddSubtract(calcValues[0], calcValues[1])}
                className={`text-sm w-full border !border-border/30 ${calcOp1 === '+' ? 'text-accent font-bold' : ''}`}
              >
                +
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalcOp1('-')}
                disabled={!canAddSubtract(calcValues[0], calcValues[1])}
                className={`text-sm w-full border !border-border/30 ${calcOp1 === '-' ? 'text-accent font-bold' : ''}`}
              >
                −
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearField2}
                disabled={!calcValues[1]}
                className="text-xs justify-self-start border !border-border/30"
              >
                {t('Clear')}
              </Button>
            </div>

            {/* Field 3 */}
            <div
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${ClearBtnWidth}` }}
            >
              <CalculatorFieldDisplay
                value={calcValues[2]}
                onClick={() => copyCalcField(2)}
                isFlashing={flashCalcField3}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalcOp2('*')}
                disabled={!calcValues[1] || !calcValues[2]}
                className={`text-sm w-full border !border-border/30 ${calcOp2 === '*' ? 'text-accent font-bold' : ''}`}
              >
                ×
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalcOp2('/')}
                disabled={!calcValues[1] || !calcValues[2]}
                className={`text-sm w-full border !border-border/30 ${calcOp2 === '/' ? 'text-accent font-bold' : ''}`}
              >
                /
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalcOp2('+')}
                disabled={!canAddSubtract(calcValues[1], calcValues[2])}
                className={`text-sm w-full border !border-border/30 ${calcOp2 === '+' ? 'text-accent font-bold' : ''}`}
              >
                +
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalcOp2('-')}
                disabled={!canAddSubtract(calcValues[1], calcValues[2])}
                className={`text-sm w-full border !border-border/30 ${calcOp2 === '-' ? 'text-accent font-bold' : ''}`}
              >
                −
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearField3}
                disabled={!calcValues[2]}
                className="text-xs justify-self-start border !border-border/30"
              >
                {t('Clear')}
              </Button>
            </div>

            {/* Result Field 4 */}
            <div className="flex gap-2 items-center" style={{ width: '100%' }}>
              <motion.div
                className={`px-3 bg-muted/20 border border-accent/50 rounded-md flex items-center justify-between select-none shrink-0 ${calcValues[3] ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : ''}`}
                style={{ height: FIELD_HEIGHT, width: CommonFieldWidth, pointerEvents: 'auto' }}
                onClick={() => calcValues[3] && copyCalcResult()}
                animate={{
                  opacity: flashCopyCalc ? [1, 0.3, 1] : 1,
                  scale: flashCopyCalc ? [1, 1.02, 1] : 1
                }}
                transition={{ duration: 0.3 }}
              >
                {(() => {
                  const display = getCalcResultDisplay();
                  return (
                    <>
                      <span className="text-sm font-mono text-primary font-bold truncate">
                        {display?.formattedValue || ''}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground ms-2 shrink-0">
                        {display?.unitSymbol || ''}
                      </span>
                    </>
                  );
                })()}
              </motion.div>
              {calcValues[3] && !isDimensionEmpty(calcValues[3].dimensions) ? (
                (() => {
                  const siReps = generateSIRepresentations(calcValues[3]!.dimensions);
                  const currentSymbol = siReps[selectedAlternative]?.displaySymbol || formatDimensions(calcValues[3]!.dimensions);
                  return (
                    <>
                      <Select
                        value={resultPrefix}
                        onValueChange={(val) => {
                          if (currentSymbol.includes('kg')) {
                            setResultPrefix(val);
                          } else {
                            setResultPrefix(val);
                          }
                        }}
                      >
                        <SelectTrigger className="h-10 w-[50px] text-xs shrink-0">
                          <SelectValue placeholder={t('Prefix')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[50vh]">
                          {PREFIXES.map((p) => (
                            <SelectItem key={p.id} value={p.id} className="text-xs font-mono">
                              {p.symbol || '-'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedAlternative.toString()}
                        onValueChange={(val) => { setSelectedAlternative(parseInt(val)); setResultPrefix('none'); }}
                      >
                        <SelectTrigger className="h-10 flex-1 min-w-0 text-xs">
                          <SelectValue placeholder={t('Select SI representation')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[50vh]">
                          {siReps.map((rep, index) => (
                            <SelectItem key={index} value={index.toString()} className="text-xs font-mono">
                              <span className="font-bold">{rep.displaySymbol}</span>
                              {rep.crossDomainMatches && rep.crossDomainMatches.length > 0 && (
                                <span className="ms-2 text-muted-foreground font-normal">
                                  ({rep.crossDomainMatches.join(', ')})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  );
                })()
              ) : calcValues[3] ? (
                <>
                  <Select value="none" disabled>
                    <SelectTrigger className="h-10 w-[50px] text-xs opacity-50 cursor-not-allowed shrink-0">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">-</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="unitless" disabled>
                    <SelectTrigger className="h-10 flex-1 min-w-0 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unitless" className="text-xs"></SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <Select value="none" disabled>
                    <SelectTrigger className="h-10 w-[50px] text-xs opacity-50 cursor-not-allowed shrink-0">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">-</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="empty" disabled>
                    <SelectTrigger className="h-10 flex-1 min-w-0 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empty" className="text-xs"></SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            {/* Copy button row */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyCalcResult}
                disabled={!calcValues[3]}
                className="text-xs text-muted-foreground hover:text-foreground gap-2 shrink-0 border !border-border/30"
              >
                <Copy className="w-3 h-3" />
                <motion.span
                  animate={{
                    opacity: flashCopyCalc ? [1, 0.3, 1] : 1,
                    scale: flashCopyCalc ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {t('Copy')}
                </motion.span>
              </Button>
            </div>
          </div>
        )}

        {/* RPN Calculator Mode */}
        {calculatorMode === 'rpn' && (
          <div className="space-y-2">
            {/* s3 field (top) with button grid - 8 buttons */}
            <div
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
            >
              <CalculatorFieldDisplay
                value={rpnStack[0]}
                onClick={() => copyRpnField(0)}
                isFlashing={flashRpnField1}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              {(() => {
                const s3Buttons: Array<{ label: string; shiftLabel: string; op?: RpnUnaryOp; shiftOp?: RpnUnaryOp; binaryOp?: RpnBinaryOp; tooltip?: string; shiftTooltip?: string } | { label: string; shiftLabel: string; isConstant: true; value: number; shiftValue: number; tooltip?: string; shiftTooltip?: string }> = [
                  { label: 'x²ᵤ', shiftLabel: '√ᵤ', op: 'square', shiftOp: 'sqrt' },
                  { label: '1/x', shiftLabel: 'yˣ', op: 'recip', binaryOp: 'pow' },
                  { label: '+/−', shiftLabel: 'ABS', op: 'neg', shiftOp: 'abs', tooltip: t('rpn-tooltip-negate'), shiftTooltip: t('rpn-tooltip-abs') },
                  { label: 'eˣ', shiftLabel: 'ln', op: 'exp', shiftOp: 'ln' },
                  { label: '10ˣ', shiftLabel: 'log₁₀', op: 'pow10', shiftOp: 'log10' },
                  { label: '2ˣ', shiftLabel: 'log₂', op: 'pow2', shiftOp: 'log2' },
                  { label: 'rnd', shiftLabel: 'trunc', op: 'rnd', shiftOp: 'trunc', tooltip: t('rpn-tooltip-rnd'), shiftTooltip: t('rpn-tooltip-trunc') },
                  { label: 'π', shiftLabel: 'π⁻¹', isConstant: true, value: Math.PI, shiftValue: 1 / Math.PI },
                ];
                return s3Buttons.map((btn, i) => {
                  const hasOp = 'op' in btn;
                  const hasBinaryOp = 'binaryOp' in btn;
                  const isConstant = 'isConstant' in btn;
                  const currentOp = hasOp ? (shiftActive && btn.shiftOp ? btn.shiftOp : btn.op) : undefined;
                  const currentBinaryOp = hasBinaryOp && shiftActive ? btn.binaryOp : undefined;
                  const isDisabled = currentBinaryOp
                    ? !canApplyRpnBinary(currentBinaryOp)
                    : (hasOp && !rpnStack[3]);
                  const tooltipText = shiftActive ? btn.shiftTooltip : btn.tooltip;
                  const buttonEl = (
                    <Button
                      key={`s3-btn-${i}`}
                      variant="ghost"
                      size="sm"
                      className={`text-xs font-mono w-full border !border-border/30 ${isDisabled ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent'}`}
                      onClick={() => {
                        if (isConstant && 'value' in btn) {
                          if (shiftActive && 'shiftValue' in btn) {
                            pushRpnConstant(btn.shiftValue);
                          } else {
                            pushRpnConstant(btn.value);
                          }
                        } else if (currentBinaryOp) {
                          applyRpnBinary(currentBinaryOp);
                        } else if (currentOp) {
                          applyRpnUnary(currentOp);
                        }
                      }}
                      disabled={isDisabled}
                    >
                      {shiftActive ? btn.shiftLabel : btn.label}
                    </Button>
                  );
                  if (tooltipText) {
                    return (
                      <Tooltip key={`s3-btn-${i}`}>
                        <TooltipTrigger asChild>{React.cloneElement(buttonEl, { key: undefined })}</TooltipTrigger>
                        <TooltipContent>{tooltipText}</TooltipContent>
                      </Tooltip>
                    );
                  }
                  return buttonEl;
                });
              })()}
            </div>

            {/* s2 field with button grid - 8 buttons */}
            <div
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
            >
              <CalculatorFieldDisplay
                value={rpnStack[1]}
                onClick={() => copyRpnField(1)}
                isFlashing={flashRpnField2}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              {(() => {
                const s2Buttons: Array<{ label: string; shiftLabel: string; op: RpnUnaryOp; shiftOp: RpnUnaryOp } | { label: string; shiftLabel: string; isConstant: true; value: number; shiftValue: number }> = [
                  { label: 'sin', shiftLabel: 'asin', op: 'sin', shiftOp: 'asin' },
                  { label: 'cos', shiftLabel: 'acos', op: 'cos', shiftOp: 'acos' },
                  { label: 'tan', shiftLabel: 'atan', op: 'tan', shiftOp: 'atan' },
                  { label: 'sinh', shiftLabel: 'asinh', op: 'sinh', shiftOp: 'asinh' },
                  { label: 'cosh', shiftLabel: 'acosh', op: 'cosh', shiftOp: 'acosh' },
                  { label: 'tanh', shiftLabel: 'atanh', op: 'tanh', shiftOp: 'atanh' },
                  { label: '⌊x⌋', shiftLabel: '⌈x⌉', op: 'floor', shiftOp: 'ceil' },
                  { label: 'ℯ', shiftLabel: 'ℯ⁻¹', isConstant: true, value: Math.E, shiftValue: 1 / Math.E },
                ];
                return s2Buttons.map((btn, i) => {
                  const hasOp = 'op' in btn;
                  const isConstant = 'isConstant' in btn;
                  const currentOp = hasOp ? (shiftActive ? btn.shiftOp : btn.op) : undefined;
                  const isDisabled = hasOp && !rpnStack[3];
                  return (
                    <Button
                      key={`s2-btn-${i}`}
                      variant="ghost"
                      size="sm"
                      className={`text-xs font-mono w-full border !border-border/30 ${isDisabled ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent'}`}
                      onClick={() => {
                        if (isConstant && 'value' in btn) {
                          if (shiftActive && 'shiftValue' in btn) {
                            pushRpnConstant(btn.shiftValue);
                          } else {
                            pushRpnConstant(btn.value);
                          }
                        } else if (currentOp) {
                          applyRpnUnary(currentOp);
                        }
                      }}
                      disabled={isDisabled}
                    >
                      {shiftActive ? btn.shiftLabel : btn.label}
                    </Button>
                  );
                });
              })()}
            </div>

            {/* y field with button grid - 8 buttons */}
            <div
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
            >
              <CalculatorFieldDisplay
                value={rpnStack[2]}
                onClick={() => copyRpnField(2)}
                isFlashing={flashRpnField3}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-xs font-mono w-full border !border-border/30 ${shiftActive && !rpnStack[3] ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent'}`}
                    style={{ gridColumn: 'span 2' }}
                    disabled={shiftActive && !rpnStack[3]}
                    onClick={() => shiftActive ? dropRpnStack() : pushToRpnStack()}
                  >
                    {shiftActive ? 'DROP' : 'ENTER'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{shiftActive ? t('rpn-tooltip-drop') : t('rpn-tooltip-enter')}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-xs font-mono w-full border !border-border/30 ${shiftActive ? 'text-foreground hover:text-accent' : (!previousRpnStack.some(v => v !== null) ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent')}`}
                    disabled={!shiftActive && !previousRpnStack.some(v => v !== null)}
                    onClick={() => shiftActive ? pullFromPane() : undoRpnStack()}
                  >
                    {shiftActive ? 'PULL' : 'UNDO'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{shiftActive ? t('rpn-tooltip-pull') : t('rpn-tooltip-undo')}</TooltipContent>
              </Tooltip>
              {(() => {
                const yBinaryButtons: Array<{ label: string; shiftLabel: string; op: RpnBinaryOp; shiftOp: RpnBinaryOp }> = [
                  { label: '×ᵤ', shiftLabel: '×', op: 'mulUnit', shiftOp: 'mul' },
                  { label: '÷ᵤ', shiftLabel: '÷', op: 'divUnit', shiftOp: 'div' },
                  { label: '+ᵤ', shiftLabel: '+', op: 'addUnit', shiftOp: 'add' },
                  { label: '−ᵤ', shiftLabel: '−', op: 'subUnit', shiftOp: 'sub' },
                ];
                return yBinaryButtons.map((btn, i) => {
                  const currentOp = shiftActive ? btn.shiftOp : btn.op;
                  const isDisabled = !canApplyRpnBinary(currentOp);
                  return (
                    <Button
                      key={`y-bin-${i}`}
                      variant="ghost"
                      size="sm"
                      className={`text-xs font-mono w-full border !border-border/30 ${isDisabled ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent'}`}
                      onClick={() => applyRpnBinary(currentOp)}
                      disabled={isDisabled}
                    >
                      {shiftActive ? btn.shiftLabel : btn.label}
                    </Button>
                  );
                });
              })()}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-mono w-full border !border-border/30 text-foreground hover:text-accent"
                    onClick={() => shiftActive ? swapRpnXY() : recallLastX()}
                  >
                    {shiftActive ? 'SWAP' : 'LASTx'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{shiftActive ? t('rpn-tooltip-swap') : t('rpn-tooltip-lastx')}</TooltipContent>
              </Tooltip>
            </div>

            {/* x field (result) */}
            <div
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} 50px 1fr` }}
            >
              {rpnXEditing ? (
                <input
                  type="text"
                  autoFocus
                  data-testid="rpn-x-input"
                  value={rpnXEditValue}
                  onChange={(e) => setRpnXEditValue(e.target.value)}
                  onBlur={() => {
                    if (rpnXEditValue.trim()) {
                      const parsed = parseUnitText(rpnXEditValue);
                      const dims: Record<string, number> = {};
                      if (parsed.dimensions.length) dims.length = parsed.dimensions.length;
                      if (parsed.dimensions.mass) dims.mass = parsed.dimensions.mass;
                      if (parsed.dimensions.time) dims.time = parsed.dimensions.time;
                      if (parsed.dimensions.current) dims.current = parsed.dimensions.current;
                      if (parsed.dimensions.temperature) dims.temperature = parsed.dimensions.temperature;
                      if (parsed.dimensions.amount) dims.amount = parsed.dimensions.amount;
                      if (parsed.dimensions.intensity) dims.intensity = parsed.dimensions.intensity;
                      if (parsed.dimensions.angle) dims.angle = parsed.dimensions.angle;
                      if (parsed.dimensions.solid_angle) dims.solid_angle = parsed.dimensions.solid_angle;

                      const newEntry = {
                        value: parsed.value,
                        dimensions: dims,
                        prefix: parsed.prefixId || 'none'
                      };

                      saveRpnStackForUndo();
                      setRpnStack(prev => {
                        const newStack = [...prev];
                        newStack[3] = newEntry;
                        return newStack;
                      });
                      setRpnResultPrefix('none');
                      setRpnSelectedAlternative(0);
                    }
                    setRpnXEditing(false);
                    setRpnXEditValue('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    } else if (e.key === 'Escape') {
                      setRpnXEditing(false);
                      setRpnXEditValue('');
                    }
                  }}
                  className="px-3 bg-muted/20 border border-accent rounded-md text-sm font-mono text-primary font-bold"
                  style={{ height: FIELD_HEIGHT }}
                  placeholder={t("Enter value or 'value unit'")}
                />
              ) : (
                <motion.div
                  className="px-3 bg-muted/20 border border-accent/50 rounded-md flex items-center justify-between cursor-text hover:bg-muted/40 active:bg-muted/60"
                  style={{ height: FIELD_HEIGHT, pointerEvents: 'auto' }}
                  data-testid="rpn-x-field"
                  onClick={() => {
                    const display = getRpnResultDisplay();
                    const currentText = display ? `${display.formattedValue}${display.unitSymbol ? ' ' + display.unitSymbol : ''}` : '';
                    setRpnXEditValue(currentText);
                    setRpnXEditing(true);
                  }}
                  animate={{
                    opacity: flashRpnResult ? [1, 0.3, 1] : 1,
                    scale: flashRpnResult ? [1, 1.02, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {(() => {
                    const display = getRpnResultDisplay();
                    return (
                      <>
                        <span className="text-sm font-mono text-primary font-bold truncate">
                          {display?.formattedValue || ''}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground ms-2 shrink-0">
                          {display?.unitSymbol || ''}
                        </span>
                      </>
                    );
                  })()}
                </motion.div>
              )}
              {rpnStack[3] && !isDimensionEmpty(rpnStack[3].dimensions) ? (
                (() => {
                  const siReps = generateSIRepresentations(rpnStack[3]!.dimensions);
                  return (
                    <>
                      <Select
                        value={rpnResultPrefix}
                        onValueChange={(val) => setRpnResultPrefix(val)}
                      >
                        <SelectTrigger className="h-10 text-xs">
                          <SelectValue placeholder={t('Prefix')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[50vh]">
                          {PREFIXES.map((p) => (
                            <SelectItem key={p.id} value={p.id} className="text-xs font-mono">
                              {p.symbol || '-'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={rpnSelectedAlternative.toString()}
                        onValueChange={(val) => { setRpnSelectedAlternative(parseInt(val)); setRpnResultPrefix('none'); }}
                      >
                        <SelectTrigger className="h-10 text-xs">
                          <SelectValue placeholder={t('Select SI representation')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[50vh]">
                          {siReps.map((rep, index) => (
                            <SelectItem key={index} value={index.toString()} className="text-xs font-mono">
                              <span className="font-bold">{rep.displaySymbol}</span>
                              {rep.crossDomainMatches && rep.crossDomainMatches.length > 0 && (
                                <span className="ms-2 text-muted-foreground font-normal">
                                  ({rep.crossDomainMatches.join(', ')})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  );
                })()
              ) : rpnStack[3] ? (
                <>
                  <Select value="none" disabled>
                    <SelectTrigger className="h-10 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">-</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="unitless" disabled>
                    <SelectTrigger className="h-10 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unitless" className="text-xs"></SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <Select value="none" disabled>
                    <SelectTrigger className="h-10 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">-</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="empty" disabled>
                    <SelectTrigger className="h-10 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empty" className="text-xs"></SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            {/* Bottom row */}
            <div
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
            >
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (!rpnStack[3]) return;
                    saveRpnStackForUndo();
                    setRpnStack(prev => {
                      const newStack = [...prev];
                      newStack[3] = { ...prev[3]!, value: 0 };
                      return newStack;
                    });
                  }}
                  className="text-xs text-foreground hover:text-accent border !border-border/30"
                >
                  {t('Clear x')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (!rpnStack[3]) return;
                    saveRpnStackForUndo();
                    setRpnStack(prev => {
                      const newStack = [...prev];
                      newStack[3] = { ...prev[3]!, dimensions: {}, prefix: 'none' };
                      return newStack;
                    });
                    setRpnResultPrefix('none');
                    setRpnSelectedAlternative(0);
                  }}
                  className="text-xs text-foreground hover:text-accent border !border-border/30"
                >
                  {t('Clear unit')}
                </Button>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShiftActive(!shiftActive)}
                    className={`text-xs font-mono border !border-border/30 ${shiftActive ? 'bg-accent !text-accent-foreground' : 'text-foreground hover:text-accent'}`}
                    data-testid="button-shift"
                    aria-pressed={shiftActive}
                  >
                    SHIFT
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('rpn-tooltip-shift')}</TooltipContent>
              </Tooltip>
              <span style={{ gridColumn: 'span 6' }}></span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyRpnResult}
                className="text-xs text-foreground hover:text-accent gap-1 border !border-border/30"
              >
                <Copy className="w-3 h-3" />
                {t('Copy')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
