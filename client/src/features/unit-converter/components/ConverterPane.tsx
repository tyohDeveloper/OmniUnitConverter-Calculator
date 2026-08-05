import { CONVERSION_DATA, getFilteredSortedUnits } from '@/lib/conversion-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft } from 'lucide-react';
import type { UseConverterControllerReturn } from '@/components/unit-converter/hooks/useConverterControllerReturn';
import { ConverterInputSection } from './converter/ConverterInputSection';
import { ConverterOutputHeader } from './converter/ConverterOutputHeader';
import { ConverterOutputSection } from './converter/ConverterOutputSection';
import { ConverterConversionSummary } from './converter/ConverterConversionSummary';
import { ConverterComparisonPanel } from './converter/ConverterComparisonPanel';

export interface ConverterFlash {
  copyResult: boolean;
  fromBaseFactor: boolean;
  fromSIBase: boolean;
  toBaseFactor: boolean;
  toSIBase: boolean;
  conversionRatio: boolean;
}

interface ConverterPaneProps {
  controller: UseConverterControllerReturn;
  flash: ConverterFlash;
}

// The Converter pane: input section, swap button, output section
// (header + fields + summary), and the comparison panel. Each sub-
// section lives in ./converter/ and receives the controller plus its
// slice of the flash bag. The pane itself is pure layout composition
// and owns only the small pieces of derived data (categoryData,
// filtered unit lists) that its children share.
//
// The input and output sections are mirror-image but not identical:
// the input side has an editable text field, refocus-on-selector-close
// behavior, and its own set of flash keys; the output side has a
// copyable display and different flash keys. They are two separate
// components rather than one variant-driven component because
// unifying them would introduce a variant prop that hides real
// behavioral differences.
export function ConverterPane({ controller, flash }: ConverterPaneProps) {
  const {
    activeTab,
    activeCategory,
    swapUnits,
    t,
  } = controller;

  const categoryData = CONVERSION_DATA.find(c => c.id === activeCategory)!;
  const filteredUnits = getFilteredSortedUnits(activeCategory);

  return (
    <Card
      className={`w-full p-6 md:p-8 bg-card border-border/50 shadow-xl relative overflow-hidden col-start-1 row-start-1 transition-opacity duration-150 ${
        activeTab === 'converter' ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      <div className="grid gap-8 relative z-10">
        <ConverterInputSection
          controller={controller}
          flash={{ fromBaseFactor: flash.fromBaseFactor, fromSIBase: flash.fromSIBase }}
          categoryData={categoryData}
          filteredUnits={filteredUnits}
        />

        {/* Swap Button */}
        <div className="flex justify-center -my-2">
          <Button
            variant="outline"
            size="icon"
            onClick={swapUnits}
            data-testid="button-swap"
            aria-label={t('Swap units')}
            className="rounded-full w-10 h-10 border-border bg-background hover:border-accent hover:text-accent transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="grid gap-4">
          <ConverterOutputHeader controller={controller} />
          <ConverterOutputSection
            controller={controller}
            flash={{ copyResult: flash.copyResult, toBaseFactor: flash.toBaseFactor, toSIBase: flash.toSIBase }}
            categoryData={categoryData}
            toFilteredUnits={filteredUnits}
          />
          <ConverterConversionSummary
            controller={controller}
            flash={{ copyResult: flash.copyResult, conversionRatio: flash.conversionRatio }}
            categoryData={categoryData}
          />
          <ConverterComparisonPanel
            controller={controller}
            categoryData={categoryData}
          />
        </div>
      </div>
    </Card>
  );
}
