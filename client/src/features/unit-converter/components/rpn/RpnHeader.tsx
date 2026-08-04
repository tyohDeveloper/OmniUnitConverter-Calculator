import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CommonFieldWidth, RpnBtnWidth } from '@/components/unit-converter/constants';
import type { UseCalculatorControllerReturn } from '@/components/unit-converter/hooks/useCalculatorController';

interface RpnHeaderProps {
  controller: UseCalculatorControllerReturn;
  lockRpnMode: boolean;
}

/**
 * Header row of the RPN calculator: mode-switch label (toggles back to
 * Simple unless lockRpnMode), precision selector, clear button, and the
 * preserve-source-unit switch.
 */
export function RpnHeader({ controller, lockRpnMode }: RpnHeaderProps) {
  const {
    calculatorPrecision, setCalculatorPrecision,
    preserveSourceUnit, togglePreserveSourceUnit,
    clearRpnStack, switchToSimple,
    t,
  } = controller;

  return (
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
  );
}
