import React from 'react';
import { motion } from 'framer-motion';
import { PREFIXES } from '@/lib/conversion-data';
import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import { formatDimensions } from '@/lib/calculator/formatDimensions';
import { isDimensionEmpty } from '@/lib/calculator/isDimensionEmpty';
import { canAddSubtract } from '@/lib/calculator/canAddSubtract';
import type { NumberFormat } from '@/lib/formatting';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Copy } from 'lucide-react';
import { CalculatorFieldDisplay } from '@/components/unit-converter/components/CalculatorFieldDisplay';
import {
  FIELD_HEIGHT, CommonFieldWidth, OperatorBtnWidth, ClearBtnWidth,
  RpnBtnWidth, CALC_CONTENT_HEIGHT
} from '@/components/unit-converter/constants';
import type { UseCalculatorControllerReturn } from '@/components/unit-converter/hooks/useCalculatorController';
import { useConverterContext } from '@/components/unit-converter/context/ConverterContext';
import type { CalculatorFlash } from './CalculatorPane';

interface SimpleCalculatorPaneProps {
  controller: UseCalculatorControllerReturn;
  numberFormat: NumberFormat;
  flash: CalculatorFlash;
}

// Council-09: simple-calculator half of the former CalculatorPane. The
// RPN-only refs/effects/handlers moved to useRpnXEditField + RpnCalculatorPane.
export function SimpleCalculatorPane({ controller, numberFormat, flash }: SimpleCalculatorPaneProps) {
  const {
    calculatorMode,
    calculatorPrecision, setCalculatorPrecision,
    calcValues,
    calcOp1, setCalcOp1,
    calcOp2, setCalcOp2,
    resultPrefix, setResultPrefix,
    selectedAlternative, setSelectedAlternative,
    preserveSourceUnit, togglePreserveSourceUnit,
    clearCalculator, clearField1, clearField2, clearField3,
    copyCalcField, copyCalcResult,
    switchToRpn,
    pullFromPane,
    getCalcResultDisplay,
    generateSIRepresentations, applyPrefixToKgUnit,
    formatNumberWithSeparators, t,
  } = controller;

  const {
    calcField1: flashCalcField1,
    calcField2: flashCalcField2,
    calcField3: flashCalcField3,
    copyCalc: flashCopyCalc,
  } = flash;

  const { state: appState, inputRef: converterInputRef, customValueInputRef } = useConverterContext();
  const activeTab = appState.uiPrefs.activeTab;

  return (
    <Card className="w-full p-6 bg-card border-border/50">
      {/* Simple Calculator Header */}
      {calculatorMode === 'simple' && (
        <div
          className="grid gap-2 mb-4 items-center"
          style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
        >
          <div className="flex items-center justify-between" style={{ width: CommonFieldWidth, maxWidth: CommonFieldWidth }}>
            <Label
              data-testid="button-switch-to-rpn"
              className="text-xs font-mono uppercase text-foreground cursor-pointer hover:text-accent transition-colors px-2 py-1 rounded border border-border/30"
              onClick={() => switchToRpn()}
            >
              {t('CALCULATOR') + ' ⇅'}
            </Label>
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-foreground">{t('Precision')}</Label>
              <Select
                value={calculatorPrecision.toString()}
                onValueChange={(val) => setCalculatorPrecision(parseInt(val))}
              >
                <SelectTrigger data-testid="select-calc-precision" className="h-8 w-[50px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                    <SelectItem key={p} value={p.toString()} className="text-xs">
                      {p}
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
            data-testid="button-clear-calculator"
            className="text-xs text-foreground hover:text-accent border !border-border/30"
            style={{ gridColumn: 'span 2' }}
          >
            {t('Clear calculator')}
          </Button>
          <div style={{ gridColumn: 'span 6' }} className="flex items-center gap-2 pl-1">
            <Switch
              id="simple-preserve-source-unit"
              data-testid="button-simple-preserve-source-unit"
              checked={preserveSourceUnit}
              onCheckedChange={() => togglePreserveSourceUnit()}
            />
            <label
              htmlFor="simple-preserve-source-unit"
              className="text-xs text-muted-foreground cursor-pointer select-none"
            >
              {t('Keep source units')}
            </label>
          </div>
        </div>
      )}

      {/* Fixed-height container to prevent flicker on mode switch */}
      <div style={{ height: CALC_CONTENT_HEIGHT, overflowY: 'auto' }}>
        {/* Simple Calculator Mode */}
        {calculatorMode === 'simple' && (
          <div className="space-y-3">
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
                testId="calc-field-1"
                preserveSourceUnit={preserveSourceUnit}
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
                data-testid="button-clear-field-1"
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
                testId="calc-field-2"
                preserveSourceUnit={preserveSourceUnit}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalcOp1('*')}
                disabled={!calcValues[0] || !calcValues[1]}
                data-testid="button-op1-multiply"
                className={`text-sm w-full border !border-border/30 ${calcOp1 === '*' ? 'text-accent font-bold' : ''}`}
              >
                ×
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalcOp1('/')}
                disabled={!calcValues[0] || !calcValues[1]}
                data-testid="button-op1-divide"
                className={`text-sm w-full border !border-border/30 ${calcOp1 === '/' ? 'text-accent font-bold' : ''}`}
              >
                /
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalcOp1('+')}
                disabled={!canAddSubtract(calcValues[0], calcValues[1])}
                data-testid="button-op1-add"
                className={`text-sm w-full border !border-border/30 ${calcOp1 === '+' ? 'text-accent font-bold' : ''}`}
              >
                +
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalcOp1('-')}
                disabled={!canAddSubtract(calcValues[0], calcValues[1])}
                data-testid="button-op1-subtract"
                className={`text-sm w-full border !border-border/30 ${calcOp1 === '-' ? 'text-accent font-bold' : ''}`}
              >
                −
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearField2}
                disabled={!calcValues[1]}
                data-testid="button-clear-field-2"
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
                testId="calc-field-3"
                preserveSourceUnit={preserveSourceUnit}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalcOp2('*')}
                disabled={!calcValues[1] || !calcValues[2]}
                data-testid="button-op2-multiply"
                className={`text-sm w-full border !border-border/30 ${calcOp2 === '*' ? 'text-accent font-bold' : ''}`}
              >
                ×
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalcOp2('/')}
                disabled={!calcValues[1] || !calcValues[2]}
                data-testid="button-op2-divide"
                className={`text-sm w-full border !border-border/30 ${calcOp2 === '/' ? 'text-accent font-bold' : ''}`}
              >
                /
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalcOp2('+')}
                disabled={!canAddSubtract(calcValues[1], calcValues[2])}
                data-testid="button-op2-add"
                className={`text-sm w-full border !border-border/30 ${calcOp2 === '+' ? 'text-accent font-bold' : ''}`}
              >
                +
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalcOp2('-')}
                disabled={!canAddSubtract(calcValues[1], calcValues[2])}
                data-testid="button-op2-subtract"
                className={`text-sm w-full border !border-border/30 ${calcOp2 === '-' ? 'text-accent font-bold' : ''}`}
              >
                −
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearField3}
                disabled={!calcValues[2]}
                data-testid="button-clear-field-3"
                className="text-xs justify-self-start border !border-border/30"
              >
                {t('Clear')}
              </Button>
            </div>

            {/* Result Field 4 */}
            <div className="flex gap-2 items-center" style={{ width: '100%' }}>
              <motion.button
                type="button"
                aria-label={t('Copy result')}
                disabled={!calcValues[3]}
                className={`px-3 bg-muted/20 border border-accent/50 rounded-md flex items-center justify-between select-none shrink-0 text-left ${calcValues[3] ? 'cursor-pointer hover:bg-accent/15 active:bg-accent/25 hover:border-accent/70 hover:shadow-sm transition-all duration-150' : ''}`}
                style={{ height: FIELD_HEIGHT, width: CommonFieldWidth, pointerEvents: 'auto' }}
                onClick={() => calcValues[3] && copyCalcResult()}
                data-testid="calc-result"
                animate={{
                  opacity: flashCopyCalc ? [1, 0.3, 1] : 1,
                  scale: flashCopyCalc ? [1, 1.02, 1] : 1
                }}
                transition={{ duration: 0.3 }}
              >
                {(() => {
                  const cv = calcValues[3];
                  const useSource = cv?.originalUnit != null && cv?.originalValue != null;
                  const display = useSource
                    ? { formattedValue: formatNumberWithSeparators(cv!.originalValue!, calculatorPrecision), unitSymbol: cv!.originalUnit! }
                    : getCalcResultDisplay();
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
              </motion.button>
              {calcValues[3] && !isDimensionEmpty(calcValues[3].dimensions) ? (
                (() => {
                  const siReps = generateSIRepresentations(calcValues[3]!.dimensions, calcValues[3]!.sourceCategory);
                  const currentSymbol = siReps[selectedAlternative]?.displaySymbol || formatDimensions(calcValues[3]!.dimensions);
                  return (
                    <>
                      <Select
                        value={resultPrefix}
                        onValueChange={(val) => setResultPrefix(val)}
                      >
                        <SelectTrigger data-testid="select-calc-result-prefix" className="h-10 w-[50px] text-xs shrink-0">
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
                        <SelectTrigger data-testid="select-calc-result-unit" className="h-10 flex-1 min-w-0 text-xs">
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
                data-testid="button-copy-calc-result"
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

      </div>
    </Card>
  );
}
