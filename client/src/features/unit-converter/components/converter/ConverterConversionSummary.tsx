import { motion } from 'framer-motion';
import { convert } from '@/lib/conversion-data';
import { PREFIXES } from '@/lib/units/prefixes';
import { prefixPowerFactor } from '@/lib/units/prefixPowerFactor';
import { Button } from '@/components/ui/button';
import { Copy, Info } from 'lucide-react';
import type { UseConverterControllerReturn } from '@/components/unit-converter/hooks/useConverterControllerReturn';
import type { CategoryDefinition } from '@/lib/units/unitDefinition';
import type { ConverterFlash } from '../ConverterPane';

interface ConverterConversionSummaryProps {
  controller: UseConverterControllerReturn;
  flash: Pick<ConverterFlash, 'copyResult' | 'conversionRatio'>;
  categoryData: CategoryDefinition;
}

/**
 * Description + conversion-ratio + copy button trio that sits between
 * the output section and the comparison panel.
 *
 *   - The `to` unit's description (if any) appears at the top.
 *   - When result is non-null, a "1 unit = X unit" conversion-ratio
 *     button displays the pairing at unit scale and copies the same
 *     ratio when clicked. This is the "copy conversion factor" affordance.
 *   - A separate Copy button on the right copies the current result.
 */
export function ConverterConversionSummary({
  controller, flash, categoryData,
}: ConverterConversionSummaryProps) {
  const {
    activeCategory,
    fromUnit, toUnit,
    fromPrefix, toPrefix,
    result, precision,
    copyResult, copyConversionRatio,
    refocusInput,
    t,
    formatResultValue, formatDMS, formatFtIn,
  } = controller;

  const fromUnitData = categoryData.units.find(u => u.id === fromUnit);
  const toUnitData = categoryData.units.find(u => u.id === toUnit);
  const fromPrefixData = PREFIXES.find(p => p.id === fromPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
  const toPrefixData = PREFIXES.find(p => p.id === toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];

  const oneUnitConverted = (fromUnitData && toUnitData)
    ? convert(1, fromUnit, toUnit, activeCategory,
        prefixPowerFactor(fromPrefixData.factor, fromUnitData.prefixPower),
        prefixPowerFactor(toPrefixData.factor, toUnitData.prefixPower))
    : null;

  const oneUnitFormatted = oneUnitConverted !== null && toUnitData
    ? (toUnit === 'deg_dms'
        ? formatDMS(oneUnitConverted)
        : toUnit === 'ft_in'
          ? formatFtIn(oneUnitConverted)
          : `${formatResultValue(oneUnitConverted, precision)} ${toPrefixData.id !== 'none' ? toPrefixData.symbol : ''}${toUnitData.symbol}`)
    : '';

  return (
    <div className="grid sm:grid-cols-[1fr_auto] gap-2 items-start">
      <div className="space-y-2">
        {toUnitData?.description && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="w-3 h-3" /> {toUnitData.description}
          </p>
        )}
        {result !== null && fromUnitData && toUnitData && (
          <motion.button
            type="button"
            aria-label={t('Copy conversion ratio')}
            className="w-full text-left p-2 rounded bg-muted/20 border border-border/50 cursor-pointer hover:bg-muted/40 active:bg-muted/60"
            data-testid="display-factor"
            onClick={copyConversionRatio}
            animate={{
              opacity: flash.conversionRatio ? [1, 0.3, 1] : 1,
              scale: flash.conversionRatio ? [1, 1.02, 1] : 1
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-xs font-mono text-muted-foreground flex gap-2 items-center">
              <span className="text-foreground font-bold">
                {formatResultValue(1, 0)} {fromPrefixData.id !== 'none' ? fromPrefixData.symbol : ''}{fromUnitData.symbol}
              </span>
              <span>=</span>
              <span className="text-foreground font-bold">
                {oneUnitFormatted}
              </span>
            </div>
          </motion.button>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => { copyResult(); refocusInput(); }}
        onBlur={refocusInput}
        className="text-xs hover:text-accent gap-2 border !border-border/30"
      >
        <Copy className="w-3 h-3" aria-hidden="true" />
        <motion.span
          animate={{
            opacity: flash.copyResult ? [1, 0.3, 1] : 1,
            scale: flash.copyResult ? [1, 1.1, 1] : 1
          }}
          transition={{ duration: 0.3 }}
        >
          {t('Copy')}
        </motion.span>
      </Button>
    </div>
  );
}
