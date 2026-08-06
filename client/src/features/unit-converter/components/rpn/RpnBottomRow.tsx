import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, ClipboardPaste } from 'lucide-react';
import { CommonFieldWidth, RpnBtnWidth } from '@/components/unit-converter/constants';
import type { UseCalculatorControllerReturn } from '@/components/unit-converter/hooks/useCalculatorControllerReturn';

interface RpnBottomRowProps {
  controller: UseCalculatorControllerReturn;
  // Shared X-register focus-preservation mousedown (see useRpnXEditField).
  onOpButtonMouseDown: (e: React.MouseEvent) => void;
}

/**
 * Bottom row of the RPN pane: clear-x/clear-unit (both operate on the
 * current X register), the SHIFT modifier toggle, and the Smart Paste
 * and Copy buttons.
 */
export function RpnBottomRow({ controller, onOpButtonMouseDown }: RpnBottomRowProps) {
  const {
    shiftActive, setShiftActive,
    rpnStack, setRpnStack,
    setRpnResultPrefix, setRpnSelectedAlternative,
    saveRpnStackForUndo,
    pasteToRpnStack, copyRpnResult,
    t,
  } = controller;

  return (
    <div
      className="grid gap-2 items-center"
      style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
    >
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          data-testid="button-rpn-clear-x"
          onMouseDown={onOpButtonMouseDown}
          onClick={() => {
            if (!rpnStack[3]) return;
            saveRpnStackForUndo();
            setRpnStack(prev => {
              const newStack = [...prev];
              newStack[3] = { ...prev[3]!, value: 0 };
              return newStack;
            });
            setShiftActive(false);
          }}
          className="text-xs text-foreground hover:text-accent border !border-border/30"
        >
          {t('Clear x')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          data-testid="button-rpn-clear-unit"
          onMouseDown={onOpButtonMouseDown}
          onClick={() => {
            if (!rpnStack[3]) return;
            saveRpnStackForUndo();
            setRpnStack(prev => {
              const newStack = [...prev];
              newStack[3] = { ...prev[3]!, dimensions: {}, prefix: 'none' };
              return newStack;
            });
            setRpnResultPrefix('none');
            setRpnSelectedAlternative(0);
            setShiftActive(false);
          }}
          className="text-xs text-foreground hover:text-accent border !border-border/30"
        >
          {t('Clear unit')}
        </Button>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onMouseDown={onOpButtonMouseDown}
            onClick={() => setShiftActive(!shiftActive)}
            className={`text-xs font-mono border !border-border/30 ${shiftActive ? 'bg-accent !text-accent-foreground' : 'text-foreground hover:text-accent'}`}
            data-testid="button-shift"
            aria-pressed={shiftActive}
          >
            SHIFT
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('rpn-tooltip-shift')}</TooltipContent>
      </Tooltip>
      <span style={{ gridColumn: 'span 4' }}></span>
      <Button
        variant="ghost"
        size="sm"
        data-testid="button-rpn-paste"
        onMouseDown={onOpButtonMouseDown}
        onClick={() => { pasteToRpnStack(); setShiftActive(false); }}
        className="text-xs text-foreground hover:text-accent gap-1 border !border-border/30"
        style={{ gridColumn: 'span 2' }}
      >
        <ClipboardPaste className="w-3 h-3" />
        {t('Smart Paste')}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        data-testid="button-rpn-copy-result"
        onMouseDown={onOpButtonMouseDown}
        onClick={copyRpnResult}
        className="text-xs text-foreground hover:text-accent gap-1 border !border-border/30"
      >
        <Copy className="w-3 h-3" />
        {t('Copy')}
      </Button>
    </div>
  );
}
