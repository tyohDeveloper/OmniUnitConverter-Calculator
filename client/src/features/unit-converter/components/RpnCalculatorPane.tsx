import React from 'react';
import { motion } from 'framer-motion';
import { PREFIXES } from '@/lib/conversion-data';
import { isSymbolSI } from '@/lib/calculator/isSymbolSI';
import type { DimensionalFormula } from '@/lib/units/dimensionalFormula';
import { formatDimensions } from '@/lib/calculator/formatDimensions';
import { isDimensionEmpty } from '@/lib/calculator/isDimensionEmpty';
import type { NumberFormat } from '@/lib/formatting';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Copy, ClipboardPaste } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CalculatorFieldDisplay } from '@/components/unit-converter/components/CalculatorFieldDisplay';
import {
  FIELD_HEIGHT, CommonFieldWidth, OperatorBtnWidth, ClearBtnWidth,
  RpnBtnWidth, CALC_CONTENT_HEIGHT
} from '@/components/unit-converter/constants';
import type { UseCalculatorControllerReturn, RpnUnaryOp, RpnBinaryOp } from '@/components/unit-converter/hooks/useCalculatorController';
import { useRpnXEditField } from '@/components/unit-converter/hooks/useRpnXEditField';
import { useConverterContext } from '@/components/unit-converter/context/ConverterContext';
import type { CalculatorFlash } from './CalculatorPane';

interface RpnCalculatorPaneProps {
  controller: UseCalculatorControllerReturn;
  numberFormat: NumberFormat;
  flash: CalculatorFlash;
  lockRpnMode?: boolean;
}

// Council-09: RPN half of the former CalculatorPane. The X-register
// focus/blur choreography (including the iOS WebKit Done-key workaround)
// lives in the useRpnXEditField hook.
export function RpnCalculatorPane({ controller, numberFormat, flash, lockRpnMode = false }: RpnCalculatorPaneProps) {
  const {
    calculatorMode,
    shiftActive, setShiftActive,
    calculatorPrecision, setCalculatorPrecision,
    rpnStack, setRpnStack,
    previousRpnStack,
    rpnResultPrefix, setRpnResultPrefix,
    rpnSelectedAlternative, setRpnSelectedAlternative,
    rpnXEditing, setRpnXEditing,
    rpnXEditValue, setRpnXEditValue,
    preserveSourceUnit, togglePreserveSourceUnit,
    clearRpnStack,
    copyRpnField, copyRpnResult,
    switchToSimple,
    applyRpnUnary, applyRpnBinary, canApplyRpnBinary,
    pushToRpnStack, dropRpnStack, undoRpnStack, pullFromPane,
    pasteToRpnStack, swapRpnXY, recallLastX, pushRpnConstant,
    saveRpnStackForUndo,
    getRpnResultDisplay,
    generateSIRepresentations, applyPrefixToKgUnit,
    formatNumberWithSeparators, t,
  } = controller;

  const {
    rpnField1: flashRpnField1,
    rpnField2: flashRpnField2,
    rpnField3: flashRpnField3,
    rpnResult: flashRpnResult,
  } = flash;

  const {
    rpnXInputRef, suppressXBlurRef, committedXTextRef, enterCommitKeepFocusRef,
    commitRpnXValue,
  } = useRpnXEditField(controller);

  const { state: appState, inputRef: converterInputRef, customValueInputRef } = useConverterContext();
  const activeTab = appState.uiPrefs.activeTab;

  return (
    <Card className="w-full p-6 bg-card border-border/50">
      {/* RPN Calculator Header */}
      {calculatorMode === 'rpn' && (
        <div
          className="grid gap-2 mb-4 items-center"
          style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
        >
          <div className="flex items-center justify-between" style={{ width: CommonFieldWidth, maxWidth: CommonFieldWidth }}>
            <Label
              data-testid="button-switch-to-simple"
              className={`text-xs font-mono uppercase text-foreground px-2 py-1 rounded border border-border/30 ${lockRpnMode ? '' : 'cursor-pointer hover:text-accent transition-colors'}`}
              onClick={lockRpnMode ? undefined : () => switchToSimple()}
            >
              {t('CALCULATOR - RPN') + (lockRpnMode ? '' : ' ⇅')}
            </Label>
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-foreground">{t('Precision')}</Label>
              <Select
                value={calculatorPrecision.toString()}
                onValueChange={(val) => setCalculatorPrecision(parseInt(val))}
              >
                <SelectTrigger data-testid="select-rpn-precision" className="h-8 w-[50px] text-xs">
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
            onClick={clearRpnStack}
            data-testid="button-clear-rpn"
            className="text-xs text-foreground hover:text-accent border !border-border/30"
            style={{ gridColumn: 'span 2' }}
          >
            {t('Clear calculator')}
          </Button>
          <div
            style={{ gridColumn: 'span 6' }}
            className="flex items-center gap-2 pl-1"
          >
            <Switch
              id="rpn-preserve-source-unit"
              data-testid="button-rpn-preserve-source-unit"
              checked={preserveSourceUnit}
              onCheckedChange={() => togglePreserveSourceUnit()}
            />
            <label
              htmlFor="rpn-preserve-source-unit"
              className="text-xs text-muted-foreground cursor-pointer select-none"
            >
              {t('Keep source units')}
            </label>
          </div>
        </div>
      )}

      {/* Fixed-height container to prevent flicker on mode switch */}
      <div style={{ height: CALC_CONTENT_HEIGHT, overflowY: 'auto' }}>
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
                testId="rpn-field-s3"
                preserveSourceUnit={preserveSourceUnit}
              />
              {(() => {
                const s3Buttons: Array<{ id: string; shiftId?: string; label: string; shiftLabel: string; op?: RpnUnaryOp; shiftOp?: RpnUnaryOp; binaryOp?: RpnBinaryOp; tooltip?: string; shiftTooltip?: string } | { id: string; shiftId?: string; label: string; shiftLabel: string; isConstant: true; value: number; shiftValue: number; tooltip?: string; shiftTooltip?: string }> = [
                  { id: 'square', shiftId: 'sqrt', label: 'x²ᵤ', shiftLabel: '√ᵤ', op: 'square', shiftOp: 'sqrt' },
                  { id: 'inv', shiftId: 'pow', label: '1/x', shiftLabel: 'yˣ', op: 'recip', binaryOp: 'pow' },
                  { id: 'neg', shiftId: 'abs', label: '+/−', shiftLabel: 'ABS', op: 'neg', shiftOp: 'abs', tooltip: t('rpn-tooltip-negate'), shiftTooltip: t('rpn-tooltip-abs') },
                  { id: 'exp', shiftId: 'ln', label: 'eˣ', shiftLabel: 'ln', op: 'exp', shiftOp: 'ln' },
                  { id: 'pow10', shiftId: 'log', label: '10ˣ', shiftLabel: 'log₁₀', op: 'pow10', shiftOp: 'log10' },
                  { id: 'pow2', shiftId: 'log2', label: '2ˣ', shiftLabel: 'log₂', op: 'pow2', shiftOp: 'log2' },
                  { id: 'rnd', shiftId: 'trunc', label: 'rnd', shiftLabel: 'trunc', op: 'rnd', shiftOp: 'trunc', tooltip: t('rpn-tooltip-rnd'), shiftTooltip: t('rpn-tooltip-trunc') },
                  { id: 'pi', label: 'π', shiftLabel: 'π⁻¹', isConstant: true, value: Math.PI, shiftValue: 1 / Math.PI },
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
                  const activeId = shiftActive && btn.shiftId ? btn.shiftId : btn.id;
                  const buttonEl = (
                    <Button
                      key={`s3-btn-${i}`}
                      variant="ghost"
                      size="sm"
                      data-testid={`button-rpn-${activeId}`}
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
                        setShiftActive(false);
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
                testId="rpn-field-s2"
                preserveSourceUnit={preserveSourceUnit}
              />
              {(() => {
                const s2Buttons: Array<{ id: string; shiftId?: string; label: string; shiftLabel: string; op: RpnUnaryOp; shiftOp: RpnUnaryOp } | { id: string; shiftId?: string; label: string; shiftLabel: string; isConstant: true; value: number; shiftValue: number }> = [
                  { id: 'sin', shiftId: 'asin', label: 'sin', shiftLabel: 'asin', op: 'sin', shiftOp: 'asin' },
                  { id: 'cos', shiftId: 'acos', label: 'cos', shiftLabel: 'acos', op: 'cos', shiftOp: 'acos' },
                  { id: 'tan', shiftId: 'atan', label: 'tan', shiftLabel: 'atan', op: 'tan', shiftOp: 'atan' },
                  { id: 'sinh', shiftId: 'asinh', label: 'sinh', shiftLabel: 'asinh', op: 'sinh', shiftOp: 'asinh' },
                  { id: 'cosh', shiftId: 'acosh', label: 'cosh', shiftLabel: 'acosh', op: 'cosh', shiftOp: 'acosh' },
                  { id: 'tanh', shiftId: 'atanh', label: 'tanh', shiftLabel: 'atanh', op: 'tanh', shiftOp: 'atanh' },
                  { id: 'floor', shiftId: 'ceil', label: '⌊x⌋', shiftLabel: '⌈x⌉', op: 'floor', shiftOp: 'ceil' },
                  { id: 'e', label: 'ℯ', shiftLabel: 'ℯ⁻¹', isConstant: true, value: Math.E, shiftValue: 1 / Math.E },
                ];
                return s2Buttons.map((btn, i) => {
                  const hasOp = 'op' in btn;
                  const isConstant = 'isConstant' in btn;
                  const currentOp = hasOp ? (shiftActive ? btn.shiftOp : btn.op) : undefined;
                  const isDisabled = hasOp && !rpnStack[3];
                  const activeId = shiftActive && btn.shiftId ? btn.shiftId : btn.id;
                  return (
                    <Button
                      key={`s2-btn-${i}`}
                      variant="ghost"
                      size="sm"
                      data-testid={`button-rpn-${activeId}`}
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
                        setShiftActive(false);
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
                testId="rpn-field-y"
                preserveSourceUnit={preserveSourceUnit}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid={shiftActive ? 'button-rpn-drop' : 'button-rpn-enter'}
                    className={`text-xs font-mono w-full border !border-border/30 ${shiftActive && !rpnStack[3] ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent'}`}
                    style={{ gridColumn: 'span 2' }}
                    disabled={shiftActive && !rpnStack[3]}
                    onClick={() => { shiftActive ? dropRpnStack() : pushToRpnStack(); setShiftActive(false); }}
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
                    data-testid={shiftActive ? 'button-rpn-pull' : 'button-rpn-undo'}
                    className={`text-xs font-mono w-full border !border-border/30 ${shiftActive ? 'text-foreground hover:text-accent' : (!previousRpnStack.some(v => v !== null) ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent')}`}
                    disabled={!shiftActive && !previousRpnStack.some(v => v !== null)}
                    onClick={() => { shiftActive ? pullFromPane() : undoRpnStack(); setShiftActive(false); }}
                  >
                    {shiftActive ? 'PULL' : 'UNDO'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{shiftActive ? t('rpn-tooltip-pull') : t('rpn-tooltip-undo')}</TooltipContent>
              </Tooltip>
              {(() => {
                const yBinaryButtons: Array<{ id: string; label: string; shiftLabel: string; op: RpnBinaryOp; shiftOp: RpnBinaryOp }> = [
                  { id: 'mul', label: '×ᵤ', shiftLabel: '×', op: 'mulUnit', shiftOp: 'mul' },
                  { id: 'div', label: '÷ᵤ', shiftLabel: '÷', op: 'divUnit', shiftOp: 'div' },
                  { id: 'add', label: '+ᵤ', shiftLabel: '+', op: 'addUnit', shiftOp: 'add' },
                  { id: 'sub', label: '−ᵤ', shiftLabel: '−', op: 'subUnit', shiftOp: 'sub' },
                ];
                return yBinaryButtons.map((btn, i) => {
                  const currentOp = shiftActive ? btn.shiftOp : btn.op;
                  const isDisabled = !canApplyRpnBinary(currentOp);
                  return (
                    <Button
                      key={`y-bin-${i}`}
                      variant="ghost"
                      size="sm"
                      data-testid={`button-rpn-${btn.id}`}
                      className={`text-xs font-mono w-full border !border-border/30 ${isDisabled ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent'}`}
                      onClick={() => { applyRpnBinary(currentOp); setShiftActive(false); }}
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
                    data-testid={shiftActive ? 'button-rpn-swap' : 'button-rpn-lastx'}
                    className="text-xs font-mono w-full border !border-border/30 text-foreground hover:text-accent"
                    onClick={() => { shiftActive ? swapRpnXY() : recallLastX(); setShiftActive(false); }}
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
                  ref={rpnXInputRef}
                  type="text"
                  autoFocus
                  data-testid="rpn-x-input"
                  value={rpnXEditValue}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    committedXTextRef.current = null;
                    setRpnXEditValue(e.target.value);
                  }}
                  onBlur={() => {
                    // Suppress commit when the user clicked one of the adjacent
                    // prefix/alt selectors — the selector interaction clears this flag
                    // and restores focus to the input.
                    if (suppressXBlurRef.current) return;
                    // Enter just committed in locked RPN mode: keep edit mode
                    // alive (iOS WebKit's Done key blurs before we can refocus;
                    // exiting here would unmount the input).
                    if (enterCommitKeepFocusRef.current) return;
                    // Skip commit if Enter already committed this exact text.
                    if (rpnXEditValue !== committedXTextRef.current) {
                      commitRpnXValue();
                    }
                    committedXTextRef.current = null;
                    setRpnXEditing(false);
                    setRpnXEditValue('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (lockRpnMode) {
                        // Dedicated RPN section: commit but keep the input
                        // focused and editable, with the text selected so the
                        // next keystrokes replace it.
                        e.preventDefault();
                        if (rpnXEditValue !== committedXTextRef.current) {
                          commitRpnXValue();
                          committedXTextRef.current = rpnXEditValue;
                        }
                        // Guard against the native blur (iOS WebKit Done key)
                        // unmounting the input before we can refocus it.
                        enterCommitKeepFocusRef.current = true;
                        requestAnimationFrame(() => {
                          const input = rpnXInputRef.current;
                          if (input) {
                            input.focus();
                            input.select();
                          }
                          enterCommitKeepFocusRef.current = false;
                        });
                      } else {
                        // Converter/Custom tabs: commit via blur, then hand
                        // focus to the primary entry field of the active tab.
                        e.preventDefault();
                        e.currentTarget.blur();
                        const target = activeTab === 'custom' ? customValueInputRef : converterInputRef;
                        requestAnimationFrame(() => {
                          const input = target.current;
                          if (input) {
                            input.focus();
                            input.select();
                          }
                        });
                      }
                    } else if (e.key === 'Escape') {
                      committedXTextRef.current = null;
                      setRpnXEditing(false);
                      setRpnXEditValue('');
                    }
                  }}
                  className="px-3 bg-muted/20 border border-accent rounded-md text-sm font-mono text-primary font-bold"
                  style={{ height: FIELD_HEIGHT }}
                  placeholder={t("Enter value or 'value unit'")}
                />
              ) : (
                <motion.button
                  type="button"
                  aria-label={t('Edit X register')}
                  className="px-3 bg-muted/20 border border-accent/50 rounded-md flex items-center justify-between cursor-text hover:bg-muted/40 active:bg-muted/60 text-left"
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
                    const xVal = rpnStack[3];
                    // X register always shows source/selected unit — it is the
                    // active editing register and always reflects the chosen unit.
                    // preserveSourceUnit only controls the stacked (Y/Z/T) registers.
                    const useSource = xVal?.originalUnit != null && xVal?.originalValue != null;
                    const display = useSource
                      ? { formattedValue: formatNumberWithSeparators(xVal!.originalValue!, calculatorPrecision), unitSymbol: xVal!.originalUnit! }
                      : getRpnResultDisplay();
                    return (
                      <>
                        <span className="text-sm font-mono text-primary font-bold truncate" data-testid="text-rpn-x-value">
                          {display?.formattedValue || ''}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground ms-2 shrink-0" data-testid="text-rpn-x-unit">
                          {display?.unitSymbol || ''}
                        </span>
                      </>
                    );
                  })()}
                </motion.button>
              )}
              {rpnStack[3] && !isDimensionEmpty(rpnStack[3].dimensions) ? (
                (() => {
                  const siReps = generateSIRepresentations(rpnStack[3]!.dimensions, rpnStack[3]!.sourceCategory);
                  const currentAltSymbol = siReps[rpnSelectedAlternative]?.displaySymbol || '';
                  const prefixEnabled = isSymbolSI(currentAltSymbol);
                  return (
                    <>
                      <Select
                        value={rpnResultPrefix}
                        disabled={!prefixEnabled}
                        onValueChange={(val) => {
                          setRpnResultPrefix(val);
                          suppressXBlurRef.current = false;
                          if (rpnXEditing) requestAnimationFrame(() => rpnXInputRef.current?.focus());
                        }}
                      >
                        <SelectTrigger
                          data-testid="select-rpn-result-prefix"
                          className={`h-10 text-xs${!prefixEnabled ? ' opacity-40 cursor-not-allowed' : ''}`}
                          onMouseDown={(e) => {
                            if (rpnXEditing && prefixEnabled) {
                              e.preventDefault();
                              suppressXBlurRef.current = true;
                            }
                          }}
                        >
                          <SelectValue placeholder={t('Prefix')} />
                        </SelectTrigger>
                        <SelectContent
                          className="max-h-[50vh]"
                          onCloseAutoFocus={(e) => {
                            if (rpnXEditing) {
                              e.preventDefault();
                              suppressXBlurRef.current = false;
                              rpnXInputRef.current?.focus();
                            }
                          }}
                        >
                          {PREFIXES.map((p) => (
                            <SelectItem key={p.id} value={p.id} className="text-xs font-mono">
                              {p.symbol || '-'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={rpnSelectedAlternative.toString()}
                        onValueChange={(val) => {
                          setRpnSelectedAlternative(parseInt(val));
                          suppressXBlurRef.current = false;
                          if (rpnXEditing) requestAnimationFrame(() => rpnXInputRef.current?.focus());
                        }}
                      >
                        <SelectTrigger
                          data-testid="select-rpn-result-unit"
                          className="h-10 text-xs"
                          onMouseDown={(e) => {
                            if (rpnXEditing) {
                              e.preventDefault();
                              suppressXBlurRef.current = true;
                            }
                          }}
                        >
                          <SelectValue placeholder={t('Select SI representation')} />
                        </SelectTrigger>
                        <SelectContent
                          className="max-h-[50vh]"
                          onCloseAutoFocus={(e) => {
                            if (rpnXEditing) {
                              e.preventDefault();
                              suppressXBlurRef.current = false;
                              rpnXInputRef.current?.focus();
                            }
                          }}
                        >
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
                  data-testid="button-rpn-clear-x"
                  onClick={() => {
                    if (!rpnStack[3]) return;
                    saveRpnStackForUndo();
                    setRpnStack(prev => {
                      const newStack = [...prev];
                      newStack[3] = { ...prev[3]!, value: 0 };
                      return newStack;
                    });
                    setShiftActive(false);
                  }}
                  className="text-xs text-foreground hover:text-accent border !border-border/30"
                >
                  {t('Clear x')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="button-rpn-clear-unit"
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
                    setShiftActive(false);
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
              <span style={{ gridColumn: 'span 4' }}></span>
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-rpn-paste"
                onClick={() => { pasteToRpnStack(); setShiftActive(false); }}
                className="text-xs text-foreground hover:text-accent gap-1 border !border-border/30"
                style={{ gridColumn: 'span 2' }}
              >
                <ClipboardPaste className="w-3 h-3" />
                {t('Smart Paste')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-rpn-copy-result"
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
