import { motion } from 'framer-motion';
import { PREFIXES, ALL_PREFIXES } from '@/lib/units/prefixes';
import { formatDimensions } from '@/lib/unit-symbols/formatDimensions';
import { regionalCountingSuffix } from '@/lib/units/regionalCountingSuffix';
import { KG_TO_GRAM_UNIT_PAIRS } from '@/lib/units/normalizeMassUnit';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FIELD_HEIGHT, CommonFieldWidth } from '@/components/unit-converter/constants';
import type { UseConverterControllerReturn } from '@/components/unit-converter/hooks/useConverterControllerReturn';
import type { CategoryDefinition } from '@/lib/units/unitDefinition';
import type { UnitDefinition } from '@/lib/units/unitDefinition';
import type { ConverterFlash } from '../ConverterPane';

interface ConverterOutputSectionProps {
  controller: UseConverterControllerReturn;
  flash: Pick<ConverterFlash, 'copyResult' | 'toBaseFactor' | 'toSIBase'>;
  categoryData: CategoryDefinition;
  toFilteredUnits: UnitDefinition[];
}

/**
 * The "To" side of the converter: result display + prefix dropdown +
 * unit dropdown + base-factor / SI-base display buttons. Mirror-image
 * (but not identical) to ConverterInputSection — the output side has a
 * copyable display (not an editable input), and its selectors don't
 * trigger refocusInput.
 */
export function ConverterOutputSection({
  controller, flash, categoryData, toFilteredUnits,
}: ConverterOutputSectionProps) {
  const {
    activeCategory,
    toUnit, setToUnit,
    toPrefix, setToPrefix,
    result, precision,
    copyResult,
    copyToBaseFactor, copyToSIBase,
    normalizeMassUnit, t, translateUnitName,
    formatFactor, formatResultValue,
    formatDMS, formatFtIn,
    getCategoryDimensions,
  } = controller;

  const toUnitData = categoryData.units.find(u => u.id === toUnit);
  const toPrefixData = PREFIXES.find(p => p.id === toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
  const resultSuffix = activeCategory === 'unitless' ? regionalCountingSuffix(toUnit) : '';

  const formattedResultText = result !== null
    ? (toUnit === 'deg_dms'
        ? formatDMS(result)
        : toUnit === 'ft_in'
          ? formatFtIn(result)
          : formatResultValue(result, precision) + resultSuffix)
    : '';

  return (
    <div className="flex flex-col gap-2">
      {/* Row 1: Result, Prefix, Unit Selector */}
      <div className="flex gap-2">
        {/* Dedicated live region — more robust across assistive tech than aria-live on an interactive element */}
        <span
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {formattedResultText}
        </span>
        <motion.button
          type="button"
          aria-label={t('Copy result')}
          className={`px-4 bg-background/50 border border-border rounded-md flex items-center overflow-x-auto text-start justify-start ${result !== null ? 'cursor-pointer hover:bg-background/70 active:bg-background/90' : 'cursor-default'}`}
          style={{ height: FIELD_HEIGHT, width: CommonFieldWidth }}
          onClick={() => result !== null && copyResult()}
          data-testid="display-result"
          disabled={result === null}
          animate={{
            opacity: flash.copyResult ? [1, 0.3, 1] : 1,
            scale: flash.copyResult ? [1, 1.02, 1] : 1
          }}
          transition={{ duration: 0.3 }}
        >
          <span className="font-mono text-primary whitespace-nowrap" style={{ fontSize: '0.875rem' }}>
            {result !== null ? formattedResultText : '...'}
          </span>
        </motion.button>

        <Select
          value={toPrefix}
          onValueChange={(val) => {
            const normalized = normalizeMassUnit(toUnit, val);
            setToUnit(normalized.unit);
            setToPrefix(normalized.prefix);
          }}
          disabled={!toUnitData?.allowPrefixes && !KG_TO_GRAM_UNIT_PAIRS[toUnit]}
        >
          <SelectTrigger data-testid="select-to-prefix" className="w-[50px] bg-background/30 border-border font-medium disabled:opacity-50 disabled:cursor-not-allowed shrink-0" style={{ height: FIELD_HEIGHT }}>
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
          <SelectTrigger data-testid="select-to-unit" className="flex-1 min-w-0 bg-background/30 border-border font-medium" style={{ height: FIELD_HEIGHT }}>
            <span data-testid="display-to-unit-name" className="truncate"><SelectValue placeholder={t('Unit')} /></span>
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
        <motion.button
          type="button"
          aria-label={t('Copy base factor')}
          className={`px-3 rounded bg-muted/20 border border-border/50 flex flex-col justify-center text-left ${toUnitData ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : 'cursor-default'}`}
          style={{ height: FIELD_HEIGHT, width: CommonFieldWidth }}
          onClick={copyToBaseFactor}
          disabled={!toUnitData}
          animate={{
            opacity: flash.toBaseFactor ? [1, 0.3, 1] : 1,
            scale: flash.toBaseFactor ? [1, 1.02, 1] : 1
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('Base Factor')}</div>
          <div className="font-mono text-sm text-foreground/80 truncate" title={toUnitData ? (toUnitData.factor * toPrefixData.factor).toString() : ''}>
            {toUnitData ? formatFactor(toUnitData.factor * toPrefixData.factor) : '-'}
          </div>
        </motion.button>
        <div className="w-[50px] shrink-0" />
        <motion.button
          type="button"
          aria-label={t('Copy SI base units')}
          className={`px-3 rounded bg-muted/20 border border-border/50 flex flex-col justify-center flex-1 min-w-0 text-left ${formatDimensions(getCategoryDimensions(activeCategory)) ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : 'cursor-default'}`}
          style={{ height: FIELD_HEIGHT }}
          onClick={copyToSIBase}
          disabled={!formatDimensions(getCategoryDimensions(activeCategory))}
          animate={{
            opacity: flash.toSIBase ? [1, 0.3, 1] : 1,
            scale: flash.toSIBase ? [1, 1.02, 1] : 1
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('SI Base Units')}</div>
          <div className="font-mono text-sm text-foreground/80 truncate">
            {formatDimensions(getCategoryDimensions(activeCategory)) || '-'}
          </div>
        </motion.button>
      </div>
    </div>
  );
}
