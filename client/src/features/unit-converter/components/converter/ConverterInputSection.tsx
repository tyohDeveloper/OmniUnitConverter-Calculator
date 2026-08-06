import { motion } from 'framer-motion';
import { PREFIXES, ALL_PREFIXES } from '@/lib/units/prefixes';
import { formatDimensions } from '@/lib/unit-symbols/formatDimensions';
import { KG_TO_GRAM_UNIT_PAIRS, normalizeMassUnit } from '@/lib/units/normalizeMassUnit';
import { CATEGORY_FAMILIES } from '@/lib/units/categoryFamilies';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { renderCalendarGroupedItems } from './renderCalendarGroupedItems';
import { Info } from 'lucide-react';
import { testId } from '@/lib/test-utils';
import { FIELD_HEIGHT, CommonFieldWidth } from '@/components/unit-converter/constants';
import type { UseConverterControllerReturn } from '@/components/unit-converter/hooks/useConverterControllerReturn';
import type { CategoryDefinition } from '@/lib/units/unitDefinition';
import type { UnitDefinition } from '@/lib/units/unitDefinition';
import type { ConverterFlash } from '../ConverterPane';

interface ConverterInputSectionProps {
  controller: UseConverterControllerReturn;
  flash: Pick<ConverterFlash, 'fromBaseFactor' | 'fromSIBase'>;
  categoryData: CategoryDefinition;
  filteredUnits: UnitDefinition[];
}

/**
 * The "From" side of the converter: value entry field + prefix
 * dropdown + unit dropdown + base-factor / SI-base display buttons +
 * unit description. Mirror-image (but not identical) to
 * ConverterOutputSection — the input side has an editable text field
 * and refocus behavior; the output side has a copyable display and no
 * refocus.
 */
export function ConverterInputSection({ controller, flash, categoryData, filteredUnits }: ConverterInputSectionProps) {
  const {
    activeCategory,
    fromUnit, setFromUnit,
    fromPrefix, setFromPrefix,
    inputValue,
    inputRef,
    copyFromBaseFactor, copyFromSIBase,
    handleInputChange, handleInputKeyDown, handleInputBlur,
    refocusInput,
    t, translateUnitName,
    formatFactor,
    getPlaceholder, getCategoryDimensions,
  } = controller;

  const fromUnitData = categoryData.units.find(u => u.id === fromUnit);
  const fromPrefixData = PREFIXES.find(p => p.id === fromPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
  const isSymbolic = CATEGORY_FAMILIES[activeCategory] === 'SYMBOLIC';

  return (
    <div className="grid gap-2">
      <Label className="text-xs font-mono uppercase text-muted-foreground">{t('From')}</Label>
      <div className="flex flex-col gap-2">
        {/* Row 1: Input, Prefix, Unit Selector */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            inputMode={isSymbolic ? 'text' : 'decimal'}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            className="font-mono px-4 bg-background/50 border-border focus:border-accent focus:ring-accent/20 transition-all text-start"
            style={{ height: FIELD_HEIGHT, fontSize: '0.875rem', width: CommonFieldWidth }}
            placeholder={getPlaceholder()}
            {...testId('input-value')}
          />

          {!isSymbolic && (
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
              <SelectTrigger data-testid="select-from-prefix" className="w-[50px] bg-background/30 border-border font-medium disabled:opacity-50 disabled:cursor-not-allowed shrink-0" style={{ height: FIELD_HEIGHT }}>
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
          )}

          <Select
            value={fromUnit}
            onValueChange={(val) => { setFromUnit(val); setFromPrefix('none'); refocusInput(); }}
            onOpenChange={(open) => { if (!open) refocusInput(); }}
          >
            <SelectTrigger data-testid="select-from-unit" className="flex-1 min-w-0 bg-background/30 border-border font-medium" style={{ height: FIELD_HEIGHT }}>
              <span data-testid="display-from-unit-name" className="truncate"><SelectValue placeholder={t('Unit')} /></span>
            </SelectTrigger>
            <SelectContent position="item-aligned" className="max-h-[50vh]">
              {activeCategory === 'date_calendar'
                ? renderCalendarGroupedItems(filteredUnits, translateUnitName, t)
                : filteredUnits.map((u) => (
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

        {/* Row 2: Base Factor, Spacer, SI Base Units — numeric only */}
        {!isSymbolic && (
        <div className="flex gap-2">
          <motion.button
            type="button"
            aria-label={t('Copy base factor')}
            className={`px-3 rounded bg-muted/20 border border-border/50 flex flex-col justify-center text-left ${fromUnitData ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : 'cursor-default'}`}
            style={{ height: FIELD_HEIGHT, width: CommonFieldWidth }}
            onClick={copyFromBaseFactor}
            disabled={!fromUnitData}
            animate={{
              opacity: flash.fromBaseFactor ? [1, 0.3, 1] : 1,
              scale: flash.fromBaseFactor ? [1, 1.02, 1] : 1
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('Base Factor')}</div>
            <div className="font-mono text-sm text-foreground/80 truncate" title={fromUnitData ? (fromUnitData.factor * fromPrefixData.factor).toString() : ''}>
              {fromUnitData ? formatFactor(fromUnitData.factor * fromPrefixData.factor) : '-'}
            </div>
          </motion.button>
          <div className="w-[50px] shrink-0" />
          <motion.button
            type="button"
            aria-label={t('Copy SI base units')}
            className={`px-3 rounded bg-muted/20 border border-border/50 flex flex-col justify-center flex-1 min-w-0 text-left ${formatDimensions(getCategoryDimensions(activeCategory)) ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : 'cursor-default'}`}
            style={{ height: FIELD_HEIGHT }}
            onClick={copyFromSIBase}
            disabled={!formatDimensions(getCategoryDimensions(activeCategory))}
            animate={{
              opacity: flash.fromSIBase ? [1, 0.3, 1] : 1,
              scale: flash.fromSIBase ? [1, 1.02, 1] : 1
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('SI Base Units')}</div>
            <div className="font-mono text-sm text-foreground/80 truncate">
              {formatDimensions(getCategoryDimensions(activeCategory)) || '-'}
            </div>
          </motion.button>
        </div>
        )}
      </div>

      {fromUnitData?.description && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="w-3 h-3" /> {fromUnitData.description}
        </p>
      )}
    </div>
  );
}
