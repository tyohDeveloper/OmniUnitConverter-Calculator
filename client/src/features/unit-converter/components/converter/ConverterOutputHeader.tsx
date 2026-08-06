import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CommonFieldWidth } from '@/components/unit-converter/constants';
import { CATEGORY_FAMILIES } from '@/lib/units/categoryFamilies';
import type { UseConverterControllerReturn } from '@/components/unit-converter/hooks/useConverterControllerReturn';

interface ConverterOutputHeaderProps {
  controller: UseConverterControllerReturn;
}

/**
 * The header strip above the output section: "To" label, precision
 * selector, and the "Compare All" toggle. Split out from
 * ConverterOutputSection because it's a distinct visual concern (a
 * control strip, not a value display) with its own precision-selector
 * refocus behavior.
 */
export function ConverterOutputHeader({ controller }: ConverterOutputHeaderProps) {
  const {
    activeCategory,
    precision, setPrecision,
    comparisonMode, setComparisonMode,
    refocusInput,
    t,
  } = controller;

  const isSymbolic = CATEGORY_FAMILIES[activeCategory] === 'SYMBOLIC';

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-between" style={{ width: CommonFieldWidth }}>
        <Label className="text-xs font-mono uppercase text-muted-foreground">{t('To')}</Label>
        {!isSymbolic && (
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">{t('Precision')}</Label>
            <Select
              value={precision.toString()}
              onValueChange={(val) => { setPrecision(parseInt(val)); refocusInput(); }}
              onOpenChange={(open) => { if (!open) refocusInput(); }}
            >
              <SelectTrigger data-testid="select-precision" className="h-10 w-[70px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                  <SelectItem key={n} value={n.toString()} className="text-xs">
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="w-[50px] shrink-0" />
      <div className="flex-1 min-w-0 flex justify-end">
        {!isSymbolic && (
          <Button
            variant={comparisonMode ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`h-6 px-2 text-[10px] font-mono uppercase ${comparisonMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground border !border-border/30'}`}
            data-testid="button-comparison-mode"
          >
            {t('Compare All')}
          </Button>
        )}
      </div>
    </div>
  );
}
