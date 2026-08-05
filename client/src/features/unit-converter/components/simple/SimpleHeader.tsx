import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CommonFieldWidth, RpnBtnWidth } from '@/components/unit-converter/constants';
import type { UseCalculatorControllerReturn } from '@/components/unit-converter/hooks/useCalculatorControllerReturn';

interface SimpleHeaderProps {
  controller: UseCalculatorControllerReturn;
}

/**
 * Header row of the Simple calculator: mode-switch label (toggles to
 * RPN), precision selector, clear button, and preserve-source-unit
 * switch. Structurally parallel to RpnHeader but with different
 * click handlers, labels, and testids; the two are not merged into a
 * shared component because unifying them would introduce a variant
 * prop that hides real behavioral differences (Simple always allows
 * switching to RPN; RPN's switch is conditional on lockRpnMode).
 */
export function SimpleHeader({ controller }: SimpleHeaderProps) {
  const {
    calculatorPrecision, setCalculatorPrecision,
    preserveSourceUnit, togglePreserveSourceUnit,
    clearCalculator, switchToRpn,
    t,
  } = controller;

  return (
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
  );
}
