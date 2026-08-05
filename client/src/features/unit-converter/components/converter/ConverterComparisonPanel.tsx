import { motion, AnimatePresence } from 'framer-motion';
import { getComparisonUnits } from '@/lib/conversion-data';
import { PREFIXES } from '@/lib/units/prefixes';
import { buildComparisonRows } from '@/lib/calculator/buildComparisonRows';
import type { UseConverterControllerReturn } from '@/components/unit-converter/hooks/useConverterControllerReturn';
import type { CategoryDefinition } from '@/lib/units/unitDefinition';

interface ConverterComparisonPanelProps {
  controller: UseConverterControllerReturn;
  categoryData: CategoryDefinition;
}

/**
 * The comparison panel that appears below the output section when the
 * user toggles "Compare All". Renders one clickable row per comparable
 * unit in the current category, showing the input value converted into
 * each. Clicking a row swaps that unit into the "To" slot and closes
 * the panel.
 *
 * Uses buildComparisonRows (council-07 extraction) for the math; this
 * component owns only the layout, the click handler, and the framer-
 * motion open/close animation.
 */
export function ConverterComparisonPanel({
  controller, categoryData,
}: ConverterComparisonPanelProps) {
  const {
    activeCategory,
    fromUnit,
    fromPrefix,
    setToUnit, setToPrefix,
    inputValue,
    result, precision, comparisonMode, setComparisonMode,
    formatNumberWithSeparators, t, translateUnitName,
  } = controller;

  const fromUnitData = categoryData.units.find(u => u.id === fromUnit);
  const fromPrefixData = PREFIXES.find(p => p.id === fromPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];

  return (
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
              <span className="uppercase">{t('Compare')}</span>{' '}
              <span>{inputValue}</span>
              {' '}{fromPrefixData.id !== 'none' ? fromPrefixData.symbol : ''}{fromUnitData.symbol}
            </div>
            <div className="grid gap-1 max-h-64 overflow-y-auto">
              {/* Council-07: comparison math extracted to lib/calculator/buildComparisonRows. */}
              {buildComparisonRows({
                units: getComparisonUnits(activeCategory, fromUnit),
                inputValue: parseFloat(inputValue) || 0,
                fromUnit,
                activeCategory,
                fromPrefixFactor: fromPrefixData.factor,
                fromPrefixPower: fromUnitData?.prefixPower,
                precision,
                nonePrefix: PREFIXES.find(p => p.id === 'none')!,
              }).map(row => (
                <button
                  type="button"
                  key={row.unitId}
                  className="w-full flex items-center px-2 py-1 rounded hover:bg-muted/20 cursor-pointer text-left"
                  onClick={() => {
                    setToUnit(row.unitId);
                    setToPrefix('none');
                    setComparisonMode(false);
                  }}
                  data-testid={`comparison-row-${row.unitId}`}
                >
                  <span className="text-xs text-muted-foreground font-mono w-36 shrink-0">
                    {row.displaySymbol}
                  </span>
                  <span className="text-xs text-muted-foreground flex-1 truncate px-1" data-testid={`comparison-name-${row.unitId}`}>
                    {translateUnitName(row.unitName)}
                  </span>
                  <span className="text-sm font-mono text-foreground shrink-0">
                    {formatNumberWithSeparators(row.displayValue, precision)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
