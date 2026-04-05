import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONVERSION_DATA, PREFIXES, ALL_PREFIXES, convert, findOptimalPrefix, getFilteredSortedUnits } from '@/lib/conversion-data';
import type { UnitCategory } from '@/lib/conversion-data';
import { toArabicNumerals, NUMBER_FORMATS, type NumberFormat } from '@/lib/formatting';
import { formatDimensions } from '@/lib/calculator/formatDimensions';
import { applyPrefixToKgUnit as applyPrefixToKgUnitLib } from '@/lib/units/applyPrefixToKgUnit';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, ClipboardPaste, Copy, Info } from 'lucide-react';
import { testId } from '@/lib/test-utils';
import { FIELD_HEIGHT, CommonFieldWidth } from '@/components/unit-converter/constants';
import { KG_TO_GRAM_UNIT_PAIRS } from '@/lib/units/normalizeMassUnit';

interface ConverterPaneProps {
  activeTab: string;
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
  inputRef: React.RefObject<HTMLInputElement | null>;
  flashCopyResult: boolean;
  flashFromBaseFactor: boolean;
  flashFromSIBase: boolean;
  flashToBaseFactor: boolean;
  flashToSIBase: boolean;
  flashConversionRatio: boolean;
  setFromUnit: (val: string) => void;
  setToUnit: (val: string) => void;
  setFromPrefix: (val: string) => void;
  setToPrefix: (val: string) => void;
  setInputValue: (val: string) => void;
  setPrecision: (val: number) => void;
  setComparisonMode: (val: boolean) => void;
  swapUnits: () => void;
  copyResult: () => void;
  copyFromBaseFactor: () => void;
  copyFromSIBase: () => void;
  copyToBaseFactor: () => void;
  copyToSIBase: () => void;
  copyConversionRatio: () => void;
  handleInputChange: (val: string) => void;
  handleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleInputBlur: () => void;
  refocusInput: () => void;
  normalizeMassUnit: (unit: string, prefix: string) => { unit: string; prefix: string };
  onSmartPaste: () => Promise<'ok' | 'unrecognised' | 'unavailable'>;
  t: (key: string) => string;
  translateUnitName: (name: string) => string;
  formatFactor: (f: number) => string;
  formatResultValue: (num: number, precision: number) => string;
  formatDMS: (decimal: number) => string;
  formatFtIn: (decimalFeet: number) => string;
  getPlaceholder: () => string;
  getCategoryDimensions: (category: UnitCategory) => { [key: string]: number };
  formatNumberWithSeparators: (num: number, precision: number) => string;
}

export function ConverterPane({
  activeTab,
  activeCategory,
  fromUnit,
  toUnit,
  fromPrefix,
  toPrefix,
  inputValue,
  result,
  precision,
  comparisonMode,
  numberFormat,
  inputRef,
  flashCopyResult,
  flashFromBaseFactor,
  flashFromSIBase,
  flashToBaseFactor,
  flashToSIBase,
  flashConversionRatio,
  setFromUnit,
  setToUnit,
  setFromPrefix,
  setToPrefix,
  setInputValue,
  setPrecision,
  setComparisonMode,
  swapUnits,
  copyResult,
  copyFromBaseFactor,
  copyFromSIBase,
  copyToBaseFactor,
  copyToSIBase,
  copyConversionRatio,
  handleInputChange,
  handleInputKeyDown,
  handleInputBlur,
  refocusInput,
  normalizeMassUnit,
  onSmartPaste,
  t,
  translateUnitName,
  formatFactor,
  formatResultValue,
  formatDMS,
  formatFtIn,
  getPlaceholder,
  getCategoryDimensions,
  formatNumberWithSeparators,
}: ConverterPaneProps) {
  const [pasteStatus, setPasteStatus] = useState<'idle' | 'unrecognised' | 'unavailable'>('idle');
  const pasteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (pasteTimerRef.current) clearTimeout(pasteTimerRef.current); }, []);
  const categoryData = CONVERSION_DATA.find(c => c.id === activeCategory)!;
  const filteredUnits = getFilteredSortedUnits(activeCategory);
  const toFilteredUnits = activeCategory === 'math'
    ? filteredUnits.filter(u => u.id === 'num')
    : filteredUnits;

  const fromUnitData = categoryData.units.find(u => u.id === fromUnit);
  const toUnitData = categoryData.units.find(u => u.id === toUnit);
  const fromPrefixData = PREFIXES.find(p => p.id === fromPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
  const toPrefixData = PREFIXES.find(p => p.id === toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];

  const handleSmartPasteClick = useCallback(async () => {
    const result = await onSmartPaste();
    if (result === 'ok') {
      setPasteStatus('idle');
    } else {
      setPasteStatus(result);
      if (pasteTimerRef.current) clearTimeout(pasteTimerRef.current);
      pasteTimerRef.current = setTimeout(() => setPasteStatus('idle'), 2000);
    }
  }, [onSmartPaste]);

  return (
    <Card
      className={`w-full p-6 md:p-8 bg-card border-border/50 shadow-xl relative overflow-hidden col-start-1 row-start-1 transition-opacity duration-150 ${
        activeTab === 'converter' ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      <div className="grid gap-8 relative z-10">
        {/* Input Section */}
        <div className="grid gap-2">
          <Label className="text-xs font-mono uppercase text-muted-foreground">{t('From')}</Label>
          <div className="flex flex-col gap-2">
            {/* Row 1: Input, Prefix, Unit Selector */}
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleInputKeyDown}
                onBlur={handleInputBlur}
                tabIndex={1}
                className="font-mono px-4 bg-background/50 border-border focus:border-accent focus:ring-accent/20 transition-all text-start"
                style={{ height: FIELD_HEIGHT, fontSize: '0.875rem', width: CommonFieldWidth }}
                placeholder={getPlaceholder()}
                {...testId('input-value')}
              />

              {/* Prefix Dropdown */}
              <Select
                value={fromPrefix}
                onValueChange={(val) => {
                  const normalized = normalizeMassUnit(fromUnit, val);
                  setFromUnit(normalized.unit);
                  setFromPrefix(normalized.prefix);
                  refocusInput();
                }}
                onOpenChange={(open) => { if (!open) refocusInput(); }}
                disabled={!fromUnitData?.allowPrefixes && !KG_TO_GRAM_UNIT_PAIRS[fromUnit]}
              >
                <SelectTrigger tabIndex={2} className="w-[50px] bg-background/30 border-border font-medium disabled:opacity-50 disabled:cursor-not-allowed shrink-0" style={{ height: FIELD_HEIGHT }}>
                  <SelectValue placeholder={t('Prefix')} />
                </SelectTrigger>
                <SelectContent position="item-aligned" className="max-h-[50vh]">
                  {(activeCategory === 'data' ? ALL_PREFIXES : PREFIXES).map((p) => (
                    <SelectItem key={p.id} value={p.id} className="font-mono text-sm">
                      {p.symbol || '-'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={fromUnit}
                onValueChange={(val) => { setFromUnit(val); setFromPrefix('none'); refocusInput(); }}
                onOpenChange={(open) => { if (!open) refocusInput(); }}
              >
                <SelectTrigger tabIndex={3} className="flex-1 min-w-0 bg-background/30 border-border font-medium" style={{ height: FIELD_HEIGHT }}>
                  <SelectValue placeholder={t('Unit')} />
                </SelectTrigger>
                <SelectContent position="item-aligned" className="max-h-[50vh]">
                  {filteredUnits.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="font-mono text-sm">
                      {u.symbol === u.name ? (
                        <span className="font-bold">{u.symbol}</span>
                      ) : (
                        <>
                          <span className="font-bold me-2">{u.symbol}</span>
                          <span className="opacity-70">{translateUnitName(u.name)}</span>
                        </>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Row 2: Base Factor, Spacer, SI Base Units + Smart Paste */}
            <div className="flex gap-2">
              <motion.div
                className={`px-3 rounded bg-muted/20 border border-border/50 select-none flex flex-col justify-center ${fromUnitData ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : ''}`}
                style={{ height: FIELD_HEIGHT, width: CommonFieldWidth }}
                onClick={copyFromBaseFactor}
                animate={{
                  opacity: flashFromBaseFactor ? [1, 0.3, 1] : 1,
                  scale: flashFromBaseFactor ? [1, 1.02, 1] : 1
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('Base Factor')}</div>
                <div className="font-mono text-sm text-foreground/80 truncate" title={fromUnitData ? (fromUnitData.factor * fromPrefixData.factor).toString() : ''}>
                  {fromUnitData ? formatFactor(fromUnitData.factor * fromPrefixData.factor) : '-'}
                </div>
              </motion.div>
              <div className="w-[50px] shrink-0" />
              <motion.div
                className={`px-3 rounded bg-muted/20 border border-border/50 select-none flex flex-col justify-center flex-1 min-w-0 ${formatDimensions(getCategoryDimensions(activeCategory)) ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : ''}`}
                style={{ height: FIELD_HEIGHT }}
                onClick={copyFromSIBase}
                animate={{
                  opacity: flashFromSIBase ? [1, 0.3, 1] : 1,
                  scale: flashFromSIBase ? [1, 1.02, 1] : 1
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('SI Base Units')}</div>
                <div className="font-mono text-sm text-foreground/80 truncate">
                  {formatDimensions(getCategoryDimensions(activeCategory)) || '-'}
                </div>
              </motion.div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSmartPasteClick}
                className={`text-xs gap-2 border !border-border/30 shrink-0 ${pasteStatus === 'unrecognised' || pasteStatus === 'unavailable' ? 'text-destructive hover:text-destructive' : 'hover:text-accent'}`}
                style={{ height: FIELD_HEIGHT }}
                {...testId('button-smart-paste')}
              >
                <ClipboardPaste className="w-3 h-3" />
                <span>
                  {pasteStatus === 'unrecognised' ? t('Not recognised') : pasteStatus === 'unavailable' ? t('Unavailable') : t('Paste')}
                </span>
              </Button>
            </div>
          </div>

          {fromUnitData?.description && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" /> {fromUnitData.description}
            </p>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2">
          <Button
            variant="outline"
            size="icon"
            onClick={swapUnits}
            className="rounded-full w-10 h-10 border-border bg-background hover:border-accent hover:text-accent transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Output Section */}
        <div className="grid gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-between" style={{ width: CommonFieldWidth }}>
              <Label className="text-xs font-mono uppercase text-muted-foreground">{t('To')}</Label>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">{t('Precision')}</Label>
                <Select
                  value={precision.toString()}
                  onValueChange={(val) => { setPrecision(parseInt(val)); refocusInput(); }}
                  onOpenChange={(open) => { if (!open) refocusInput(); }}
                >
                  <SelectTrigger tabIndex={4} className="h-10 w-[70px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <SelectItem key={n} value={n.toString()} className="text-xs">
                        {numberFormat === 'arabic' ? toArabicNumerals(n.toString()) : n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="w-[50px] shrink-0" />
            <div className="flex-1 min-w-0 flex justify-end">
              <Button
                variant={comparisonMode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setComparisonMode(!comparisonMode)}
                className={`h-6 px-2 text-[10px] font-mono uppercase ${comparisonMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground border !border-border/30'}`}
                data-testid="button-comparison-mode"
              >
                {t('Compare All')}
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {/* Row 1: Result, Prefix, Unit Selector */}
            <div className="flex gap-2">
              <motion.div
                className={`px-4 bg-background/50 border border-border rounded-md flex items-center overflow-x-auto text-start justify-start select-none ${result !== null ? 'cursor-pointer hover:bg-background/70 active:bg-background/90' : ''}`}
                style={{ height: FIELD_HEIGHT, width: CommonFieldWidth, pointerEvents: 'auto' }}
                onClick={() => result !== null && copyResult()}
                animate={{
                  opacity: flashCopyResult ? [1, 0.3, 1] : 1,
                  scale: flashCopyResult ? [1, 1.02, 1] : 1
                }}
                transition={{ duration: 0.3 }}
              >
                <span className="font-mono text-primary whitespace-nowrap" style={{ fontSize: '0.875rem' }}>
                  {result !== null
                    ? (toUnit === 'deg_dms'
                        ? formatDMS(result)
                        : toUnit === 'ft_in'
                          ? formatFtIn(result)
                          : formatResultValue(result, precision))
                    : '...'}
                </span>
              </motion.div>

              {/* Prefix Dropdown */}
              <Select
                value={toPrefix}
                onValueChange={(val) => {
                  const normalized = normalizeMassUnit(toUnit, val);
                  setToUnit(normalized.unit);
                  setToPrefix(normalized.prefix);
                }}
                disabled={!toUnitData?.allowPrefixes && !KG_TO_GRAM_UNIT_PAIRS[toUnit]}
              >
                <SelectTrigger className="w-[50px] bg-background/30 border-border font-medium disabled:opacity-50 disabled:cursor-not-allowed shrink-0" style={{ height: FIELD_HEIGHT }}>
                  <SelectValue placeholder={t('Prefix')} />
                </SelectTrigger>
                <SelectContent position="item-aligned" className="max-h-[50vh]">
                  {(activeCategory === 'data' ? ALL_PREFIXES : PREFIXES).map((p) => (
                    <SelectItem key={p.id} value={p.id} className="font-mono text-sm">
                      {p.symbol || '-'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={toUnit} onValueChange={(val) => { setToUnit(val); setToPrefix('none'); }}>
                <SelectTrigger className="flex-1 min-w-0 bg-background/30 border-border font-medium" style={{ height: FIELD_HEIGHT }}>
                  <SelectValue placeholder={t('Unit')} />
                </SelectTrigger>
                <SelectContent position="item-aligned" className="max-h-[50vh]">
                  {toFilteredUnits.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="font-mono text-sm">
                      {u.symbol === u.name ? (
                        <span className="font-bold">{u.symbol}</span>
                      ) : (
                        <>
                          <span className="font-bold me-2">{u.symbol}</span>
                          <span className="opacity-70">{translateUnitName(u.name)}</span>
                        </>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Row 2: Base Factor, Spacer, SI Base Units */}
            <div className="flex gap-2">
              <motion.div
                className={`px-3 rounded bg-muted/20 border border-border/50 select-none flex flex-col justify-center ${toUnitData ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : ''}`}
                style={{ height: FIELD_HEIGHT, width: CommonFieldWidth }}
                onClick={copyToBaseFactor}
                animate={{
                  opacity: flashToBaseFactor ? [1, 0.3, 1] : 1,
                  scale: flashToBaseFactor ? [1, 1.02, 1] : 1
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('Base Factor')}</div>
                <div className="font-mono text-sm text-foreground/80 truncate" title={toUnitData ? (toUnitData.factor * toPrefixData.factor).toString() : ''}>
                  {toUnitData ? formatFactor(toUnitData.factor * toPrefixData.factor) : '-'}
                </div>
              </motion.div>
              <div className="w-[50px] shrink-0" />
              <motion.div
                className={`px-3 rounded bg-muted/20 border border-border/50 select-none flex flex-col justify-center flex-1 min-w-0 ${formatDimensions(getCategoryDimensions(activeCategory)) ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : ''}`}
                style={{ height: FIELD_HEIGHT }}
                onClick={copyToSIBase}
                animate={{
                  opacity: flashToSIBase ? [1, 0.3, 1] : 1,
                  scale: flashToSIBase ? [1, 1.02, 1] : 1
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('SI Base Units')}</div>
                <div className="font-mono text-sm text-foreground/80 truncate">
                  {formatDimensions(getCategoryDimensions(activeCategory)) || '-'}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="grid sm:grid-cols-[1fr_auto] gap-2 items-start">
            <div className="space-y-2">
              {toUnitData?.description && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" /> {toUnitData.description}
                </p>
              )}
              {result !== null && fromUnitData && toUnitData && (
                <motion.div
                  className="p-2 rounded bg-muted/20 border border-border/50 cursor-pointer hover:bg-muted/40 active:bg-muted/60 select-none"
                  onClick={copyConversionRatio}
                  animate={{
                    opacity: flashConversionRatio ? [1, 0.3, 1] : 1,
                    scale: flashConversionRatio ? [1, 1.02, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-xs font-mono text-muted-foreground flex gap-2 items-center">
                    <span className="text-foreground font-bold">
                      {NUMBER_FORMATS[numberFormat].useArabicNumerals ? '١' : '1'} {fromPrefixData.id !== 'none' ? fromPrefixData.symbol : ''}{fromUnitData.symbol}
                    </span>
                    <span>=</span>
                    <span className="text-foreground font-bold">
                      {toUnit === 'deg_dms'
                        ? formatDMS(convert(1, fromUnit, toUnit, activeCategory, fromPrefixData.factor, toPrefixData.factor))
                        : toUnit === 'ft_in'
                          ? formatFtIn(convert(1, fromUnit, toUnit, activeCategory, fromPrefixData.factor, toPrefixData.factor))
                          : `${formatResultValue(convert(1, fromUnit, toUnit, activeCategory, fromPrefixData.factor, toPrefixData.factor), precision)} ${toPrefixData.id !== 'none' ? toPrefixData.symbol : ''}${toUnitData.symbol}`}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => { copyResult(); refocusInput(); }}
              onBlur={refocusInput}
              tabIndex={5}
              className="text-xs hover:text-accent gap-2 border !border-border/30"
            >
              <Copy className="w-3 h-3" />
              <motion.span
                animate={{
                  opacity: flashCopyResult ? [1, 0.3, 1] : 1,
                  scale: flashCopyResult ? [1, 1.1, 1] : 1
                }}
                transition={{ duration: 0.3 }}
              >
                {t('Copy')}
              </motion.span>
            </Button>
          </div>

          {/* Comparison Mode Panel */}
          <AnimatePresence>
            {comparisonMode && result !== null && fromUnitData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                data-testid="comparison-panel"
              >
                <div className="mt-4 p-3 rounded-lg bg-muted/10 border border-border/30">
                  <div className="text-[10px] font-mono text-muted-foreground mb-2">
                    <span className="uppercase">{t('Compare')}</span> {inputValue} {fromPrefixData.id !== 'none' ? fromPrefixData.symbol : ''}{fromUnitData.symbol}
                  </div>
                  <div className="grid gap-1 max-h-64 overflow-y-auto">
                    {(() => {
                      const allUnits = categoryData.units.filter(u => u.id !== fromUnit);

                      return allUnits.map(unit => {
                        const convertedValue = convert(
                          parseFloat(inputValue) || 0,
                          fromUnit,
                          unit.id,
                          activeCategory,
                          fromPrefixData.factor,
                          1
                        );

                        const nonePrefix = PREFIXES.find(p => p.id === 'none')!;
                        let displayPrefix = nonePrefix;
                        let displayValue = convertedValue;

                        if (unit.allowPrefixes && Math.abs(convertedValue) > 0) {
                          const optimal = findOptimalPrefix(convertedValue, unit.symbol, precision);
                          displayPrefix = optimal.prefix;
                          displayValue = optimal.adjustedValue;
                        }

                        const kgResult = applyPrefixToKgUnitLib(unit.symbol, displayPrefix.id);
                        const displaySymbol = kgResult.showPrefix
                          ? `${displayPrefix.symbol}${kgResult.displaySymbol}`
                          : kgResult.displaySymbol;

                        return (
                          <div
                            key={unit.id}
                            className="flex justify-between items-center px-2 py-1 rounded hover:bg-muted/20 cursor-pointer select-none"
                            onClick={() => {
                              navigator.clipboard.writeText(`${displayValue.toFixed(precision)}`);
                            }}
                            data-testid={`comparison-row-${unit.id}`}
                          >
                            <span className="text-xs text-muted-foreground font-mono">
                              {displaySymbol}
                            </span>
                            <span className="text-sm font-mono text-foreground">
                              {formatNumberWithSeparators(displayValue, precision)}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}
