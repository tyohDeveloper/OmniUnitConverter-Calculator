import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONVERSION_DATA, getFilteredSortedUnits, parseUnitText } from '@/lib/conversion-data';
import { toTitleCase } from '@/lib/formatting';
import type { NumberFormat } from '@/lib/formatting';
import type { SupportedLanguage } from '@/lib/localization';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ClipboardPaste } from 'lucide-react';
import { testId } from '@/lib/test-utils';
import HelpSection from '@/components/help-section';
import { FIELD_HEIGHT, ISO_LANGUAGES } from '@/components/unit-converter/constants';
import { dimensionsToExponents } from '@/lib/units/dimensionsToExponents';
import { ConverterPane } from '@/features/unit-converter/components/ConverterPane';
import { DirectPane } from '@/features/unit-converter/components/DirectPane';
import { CalculatorPane } from '@/features/unit-converter/components/CalculatorPane';
import { useConverterContext } from '@/components/unit-converter/context/ConverterContext';
import { useConverterController } from '@/components/unit-converter/hooks/useConverterController';
import { useCalculatorController } from '@/components/unit-converter/hooks/useCalculatorController';
import { formatDimensions } from '@/lib/calculator/formatDimensions';
import { siToDisplay } from '@/lib/calculator/siToDisplay';
import { PREFIXES } from '@/lib/conversion-data';
import type { UnitCategory } from '@/lib/conversion-data';

const CATEGORY_GROUPS = [
  { name: 'Base Quantities', categories: ['length', 'mass', 'time', 'current', 'temperature', 'amount', 'intensity'] },
  { name: 'Mechanics', categories: ['area', 'volume', 'speed', 'acceleration', 'force', 'pressure', 'energy', 'power', 'torque', 'flow', 'density', 'viscosity', 'kinematic_viscosity', 'surface_tension', 'frequency', 'angular_velocity', 'momentum', 'angular_momentum'] },
  { name: 'Thermodynamics & Chemistry', categories: ['thermal_conductivity', 'specific_heat', 'entropy', 'concentration'] },
  { name: 'Electricity & Magnetism', categories: ['charge', 'potential', 'capacitance', 'resistance', 'conductance', 'inductance', 'magnetic_flux', 'magnetic_density', 'electric_field', 'magnetic_field_h'] },
  { name: 'Radiation & Physics', categories: ['radioactivity', 'radiation_dose', 'equivalent_dose', 'radioactive_decay', 'cross_section', 'photon', 'catalytic', 'angle', 'solid_angle', 'sound_pressure', 'sound_intensity', 'acoustic_impedance'] },
  { name: 'Human Response', categories: ['luminous_flux', 'illuminance', 'refractive_power'] },
  { name: 'Other', categories: ['math', 'data', 'fuel', 'fuel_economy', 'rack_geometry', 'shipping', 'beer_wine_volume', 'lightbulb', 'paper_sizes', 'typography', 'cooking'] },
  { name: 'Archaic & Regional', categories: ['archaic_length', 'archaic_mass', 'archaic_volume', 'archaic_area', 'archaic_energy', 'archaic_power'] },
];

export default function UnitConverterApp() {
  const { inputRef, flash } = useConverterContext();

  const conv = useConverterController();
  const {
    activeCategory, setActiveCategory,
    fromUnit, toUnit, fromPrefix, toPrefix,
    inputValue, setInputValue,
    result, precision,
    numberFormat, language, activeTab, setActiveTab,
    directValue, directExponents,
    setDirectValue, setDirectExponents,
    converterPasteStatus, customPasteStatus,
    setNumberFormat, setLanguage,
    setFromUnit, setToUnit, setFromPrefix, setToPrefix,
    handleConverterSmartPasteClick, handleCustomSmartPasteClick,
    handleDirectCopyAndPushToCalculator, handleQuantityClick,
    refocusInput, reformatInputValue,
    parseNumberWithFormat, t, translateUnitName,
    formatResultValue,
    formatForClipboard, formatNumberWithSeparators,
    buildDirectUnitSymbol, buildDirectDimensions,
    generateSIRepresentations, applyPrefixToKgUnit,
    pendingPasteUnitRef,
  } = conv;

  const calc = useCalculatorController(
    formatNumberWithSeparators,
    t,
    activeTab,
    result,
    activeCategory,
    toUnit,
    toPrefix,
    directValue,
    buildDirectDimensions,
    parseNumberWithFormat,
  );

  const {
    calculatorMode,
    calcValues,
    resultPrefix, selectedAlternative,
    rpnStack, rpnResultPrefix, rpnSelectedAlternative,
    calculatorPrecision,
  } = calc;

  const categoryData = CONVERSION_DATA.find(c => c.id === activeCategory)!;

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  useEffect(() => {
    const sorted = getFilteredSortedUnits(activeCategory);
    if (sorted.length === 0) return;
    const pending = pendingPasteUnitRef.current;
    pendingPasteUnitRef.current = null;
    if (pending && sorted.some(u => u.id === pending.fromUnit)) {
      setFromUnit(pending.fromUnit);
      setToUnit(pending.fromUnit);
      setFromPrefix(pending.prefixId);
      setToPrefix('none');
    } else if (activeCategory === 'temperature') {
      setFromUnit('k'); setToUnit('k');
      setFromPrefix('none'); setToPrefix('none');
    } else if (activeCategory === 'volume') {
      setFromUnit('l'); setToUnit('l');
      setFromPrefix('none'); setToPrefix('none');
    } else if (activeCategory === 'capacitance') {
      setFromUnit('f'); setToUnit('f');
      setFromPrefix('none'); setToPrefix('none');
    } else if (activeCategory === 'math') {
      setFromUnit('num'); setToUnit('num');
      setFromPrefix('none'); setToPrefix('none');
    } else {
      setFromUnit(sorted[0].id); setToUnit(sorted[0].id);
      setFromPrefix('none'); setToPrefix('none');
    }
  }, [activeCategory]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;
      const activeTagName = activeElement?.tagName?.toLowerCase();
      if (activeTagName === 'input' || activeTagName === 'textarea' || activeElement?.isContentEditable) return;
      const pastedText = e.clipboardData?.getData('text');
      if (!pastedText) return;
      const parsed = parseUnitText(pastedText);
      if (activeTab === 'converter') {
        if (parsed.categoryId && parsed.unitId) {
          if (parsed.categoryId === activeCategory) {
            setFromUnit(parsed.unitId);
            setFromPrefix(parsed.prefixId);
          } else {
            pendingPasteUnitRef.current = { fromUnit: parsed.unitId, prefixId: parsed.prefixId };
            setActiveCategory(parsed.categoryId as UnitCategory);
          }
        }
        setInputValue(parsed.originalValue.toString());
      } else if (activeTab === 'custom') {
        setDirectValue(parsed.value.toString());
        setDirectExponents(dimensionsToExponents(parsed.dimensions));
      }
      e.preventDefault();
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [activeTab, activeCategory]);

  useEffect(() => {
    const toUnitData = categoryData?.units.find(u => u.id === toUnit);
    const toPrefixData = PREFIXES.find(p => p.id === toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];

    const handleKeyboardCopy = (e: KeyboardEvent) => {
      if (!((e.ctrlKey || e.metaKey) && e.key === 'c')) return;
      const activeElement = document.activeElement as HTMLElement;
      const activeTagName = activeElement?.tagName?.toLowerCase();
      const selection = window.getSelection();
      if (activeTagName === 'input' || activeTagName === 'textarea' || activeElement?.isContentEditable) return;
      if (selection && selection.toString().trim()) return;

      if (calculatorMode === 'rpn' && rpnStack[3]) {
        const val = rpnStack[3];
        const siReps = generateSIRepresentations(val.dimensions, val.sourceCategory);
        const currentSymbol = siReps[rpnSelectedAlternative]?.displaySymbol || formatDimensions(val.dimensions);
        const kgResult = applyPrefixToKgUnit(currentSymbol, rpnResultPrefix);
        const displayValue = siToDisplay(val.value, currentSymbol, rpnResultPrefix);
        const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
        const cleanValue = formattedValue.replace(/,/g, '');
        const prefixData = PREFIXES.find(p => p.id === rpnResultPrefix);
        const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
        const unitSymbol = prefixSymbol + kgResult.displaySymbol;
        navigator.clipboard.writeText(unitSymbol ? `${cleanValue} ${unitSymbol}` : cleanValue);
        flash.rpnResult[1]();
        e.preventDefault();
        return;
      }

      if (calculatorMode === 'simple' && calcValues[3]) {
        const val = calcValues[3];
        const siReps = generateSIRepresentations(val.dimensions, val.sourceCategory);
        const currentSymbol = siReps[selectedAlternative]?.displaySymbol || formatDimensions(val.dimensions);
        const kgResult = applyPrefixToKgUnit(currentSymbol, resultPrefix);
        const displayValue = val.value / kgResult.effectivePrefixFactor;
        const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
        const prefixData = PREFIXES.find(p => p.id === resultPrefix);
        const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
        const unitSymbol = prefixSymbol + kgResult.displaySymbol;
        navigator.clipboard.writeText(unitSymbol ? `${formattedValue} ${unitSymbol}` : formattedValue);
        flash.copyCalc[1]();
        e.preventDefault();
        return;
      }

      if (activeTab === 'converter' && result !== null && toUnitData) {
        const unitSymbol = toUnitData.symbol || '';
        const prefixSymbol = (toUnitData.allowPrefixes && toPrefixData?.id !== 'none') ? toPrefixData.symbol : '';
        navigator.clipboard.writeText(`${formatForClipboard(result, precision)} ${prefixSymbol}${unitSymbol}`);
        flash.copyResult[1]();
        e.preventDefault();
        return;
      }

      if (activeTab === 'custom' && directValue) {
        navigator.clipboard.writeText(directValue);
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handleKeyboardCopy);
    return () => document.removeEventListener('keydown', handleKeyboardCopy);
  }, [calculatorMode, rpnStack, calcValues, rpnResultPrefix, rpnSelectedAlternative, resultPrefix, selectedAlternative,
    calculatorPrecision, activeTab, result, toUnit, toPrefix, activeCategory, precision, directValue,
    generateSIRepresentations, applyPrefixToKgUnit, formatNumberWithSeparators, formatForClipboard, categoryData]);


  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:px-8 md:pb-0 md:pt-1 grid md:grid-cols-[260px_1fr] gap-8 md:h-full md:overflow-hidden">
      <nav className={`space-y-2 overflow-y-auto pe-2 -mt-1 pt-1 transition-opacity ${activeTab === 'custom' ? 'opacity-40 pointer-events-none' : ''}`}>
        {CATEGORY_GROUPS.map((group) => (
          <div key={group.name} className="space-y-1">
            <h2 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80 px-2 font-bold">{t(group.name)}</h2>
            <div className="space-y-0">
              {group.categories.map((catId) => {
                const cat = CONVERSION_DATA.find(c => c.id === catId);
                if (!cat) return null;
                const isSelected = activeTab === 'converter' && activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id as UnitCategory); setInputValue('1'); }}
                    disabled={activeTab === 'custom'}
                    data-testid="display-category"
                    data-category-id={cat.id}
                    className={`w-full text-start px-3 py-[1px] rounded-sm text-xs font-medium transition-all duration-200 border-s-2 flex items-center justify-between group ${
                      isSelected
                        ? 'border-accent text-accent'
                        : 'hover:bg-muted/50 border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t(cat.name)}
                    {isSelected && (
                      <motion.div layoutId="active-indicator" className="w-1 h-1 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-4 -mt-1 md:overflow-y-auto md:pr-1">
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <nav aria-label={t('Main tabs')} className="flex gap-2">
              <button
                onClick={() => setActiveTab('converter')}
                aria-current={activeTab === 'converter' ? 'page' : undefined}
                className={`text-sm px-4 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'converter'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                {...testId('tab-converter')}
              >
                {t('Converter')}
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                aria-current={activeTab === 'custom' ? 'page' : undefined}
                className={`text-sm px-4 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'custom'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                {...testId('tab-custom')}
              >
                {t('Custom')}
              </button>
            </nav>
            <div className="flex items-center gap-3">
              <Label className="text-xs text-muted-foreground">{t('Number formatting')}</Label>
              <Select
                value={numberFormat}
                onValueChange={(val) => {
                  const newFormat = val as NumberFormat;
                  const oldFormat = numberFormat;
                  reformatInputValue(oldFormat, newFormat);
                  setNumberFormat(newFormat);
                  refocusInput();
                }}
                onOpenChange={(open) => { if (!open) refocusInput(); }}
              >
                <SelectTrigger className="h-10 w-[180px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uk" className="text-xs">{t('num-format-english')}</SelectItem>
                  <SelectItem value="europe-latin" className="text-xs">{t('num-format-world')}</SelectItem>
                  <SelectItem value="period" className="text-xs">{t('num-format-period')}</SelectItem>
                  <SelectItem value="comma" className="text-xs">{t('num-format-comma')}</SelectItem>
                  <SelectItem value="east-asian" className="text-xs">{t('num-format-east-asian')}</SelectItem>
                  <SelectItem value="south-asian" className="text-xs">{t('num-format-south-asian')}</SelectItem>
                  <SelectItem value="swiss" className="text-xs">{t('num-format-swiss')}</SelectItem>
                  <SelectItem value="traditional" className="text-xs">{t('num-format-traditional')}</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={language}
                onValueChange={(val) => { setLanguage(val as SupportedLanguage); refocusInput(); }}
                onOpenChange={(open) => { if (!open) refocusInput(); }}
              >
                <SelectTrigger className="h-10 w-[75px] text-xs">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent className="max-h-[50vh]">
                  {ISO_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang} className="text-xs">{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {activeTab === 'converter' && (
            <div className="mt-2">
              <h2 className="text-3xl font-bold text-foreground tracking-tight">{t(categoryData.name)}</h2>
              <div className="flex items-center justify-between mt-1">
                <p className="text-muted-foreground text-sm font-mono">
                  {t('Base unit:')} <span className="text-primary">{translateUnitName(toTitleCase(categoryData.baseUnit))}</span>
                </p>
                <div className="flex flex-col items-end gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleConverterSmartPasteClick}
                    className={`text-xs gap-2 border !border-border/30 ${converterPasteStatus === 'unrecognised' || converterPasteStatus === 'unavailable' ? 'text-destructive hover:text-destructive' : 'hover:text-accent'}`}
                    style={{ height: FIELD_HEIGHT }}
                    {...testId('button-smart-paste')}
                  >
                    <ClipboardPaste className="w-3 h-3" />
                    <span>
                      {converterPasteStatus === 'unrecognised' ? t('Not recognised') : converterPasteStatus === 'unavailable' ? t('Unavailable') : t('Smart Paste')}
                    </span>
                  </Button>
                  <AnimatePresence>
                    {converterPasteStatus !== 'idle' && (
                      <motion.p
                        key="converter-paste-notice"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs text-destructive text-right leading-tight"
                        {...testId('text-converter-paste-notice')}
                      >
                        {converterPasteStatus === 'unavailable'
                          ? t('Clipboard unavailable — paste manually')
                          : t("Couldn't recognise a unit — try Custom Entry")}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'custom' && (
            <div className="mt-2">
              <h2 className="text-3xl font-bold text-foreground tracking-tight">{t('Custom Entry')}</h2>
              <div className="flex items-center justify-between mt-1">
                <p className="text-muted-foreground text-sm font-mono">
                  {t('Build dimensional units from SI base units')}
                </p>
                <div className="flex flex-col items-end gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCustomSmartPasteClick}
                    className={`text-xs gap-2 border !border-border/30 ${customPasteStatus === 'unrecognised' || customPasteStatus === 'unavailable' ? 'text-destructive hover:text-destructive' : 'hover:text-accent'}`}
                    style={{ height: FIELD_HEIGHT }}
                    {...testId('button-custom-smart-paste')}
                  >
                    <ClipboardPaste className="w-3 h-3" />
                    <span>
                      {customPasteStatus === 'unrecognised' ? t('Not recognised') : customPasteStatus === 'unavailable' ? t('Unavailable') : t('Smart Paste')}
                    </span>
                  </Button>
                  <AnimatePresence>
                    {customPasteStatus !== 'idle' && (
                      <motion.p
                        key="custom-paste-notice"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs text-destructive text-right leading-tight"
                        {...testId('text-custom-paste-notice')}
                      >
                        {customPasteStatus === 'unavailable'
                          ? t('Clipboard unavailable — paste manually')
                          : t("Couldn't recognise a unit — enter dimensions manually")}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid">
          <ConverterPane
            controller={conv}
            flash={{
              copyResult: flash.copyResult[0],
              fromBaseFactor: flash.fromBaseFactor[0],
              fromSIBase: flash.fromSIBase[0],
              toBaseFactor: flash.toBaseFactor[0],
              toSIBase: flash.toSIBase[0],
              conversionRatio: flash.conversionRatio[0],
            }}
          />

          <DirectPane
            activeTab={activeTab}
            directValue={directValue}
            directExponents={directExponents}
            precision={precision}
            numberFormat={numberFormat}
            flashDirectCopy={flash.directCopy[0]}
            setDirectValue={setDirectValue}
            setDirectExponents={setDirectExponents}
            t={t}
            formatResultValue={formatResultValue}
            formatForClipboard={formatForClipboard}
            parseNumberWithFormat={parseNumberWithFormat}
            buildDirectUnitSymbol={buildDirectUnitSymbol}
            buildDirectDimensions={buildDirectDimensions}
            onCopyAndPushToCalculator={handleDirectCopyAndPushToCalculator}
            onQuantityClick={handleQuantityClick}
          />
        </div>

        <CalculatorPane
          controller={calc}
          numberFormat={numberFormat}
          flash={{
            calcField1: flash.calcField1[0],
            calcField2: flash.calcField2[0],
            calcField3: flash.calcField3[0],
            copyCalc: flash.copyCalc[0],
            rpnField1: flash.rpnField1[0],
            rpnField2: flash.rpnField2[0],
            rpnField3: flash.rpnField3[0],
            rpnResult: flash.rpnResult[0],
          }}
        />

        <HelpSection t={t} language={language} />
      </div>
    </div>
  );
}
