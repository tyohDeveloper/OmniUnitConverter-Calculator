import { motion } from 'framer-motion';
import { FIELD_HEIGHT, CommonFieldWidth } from '@/components/unit-converter/constants';
import type { UseCalculatorControllerReturn } from '@/components/unit-converter/hooks/useCalculatorControllerReturn';
import { useRpnXEditField } from '@/components/unit-converter/hooks/useRpnXEditField';
import { useConverterContext } from '@/components/unit-converter/context/ConverterContext';
import { RpnXRegisterSelectors } from './RpnXRegisterSelectors';

interface RpnXRegisterRowProps {
  controller: UseCalculatorControllerReturn;
  flashRpnResult: boolean;
  lockRpnMode: boolean;
}

/**
 * The X-register row (bottom of the RPN stack): the editable/tap-to-edit
 * value display plus its prefix and alternative-representation selectors
 * (in ./RpnXRegisterSelectors). This row owns the mode-switch behaviors
 * around Enter (commit-and-keep-focus in locked mode, commit-and-hand-
 * off-to-active-pane otherwise) and the iOS WebKit Done-key blur
 * workaround.
 *
 * The useRpnXEditField hook lives here (not in the parent pane) because
 * its state — the edit-mode ref plumbing — is entirely local to this
 * row and its selectors. The selectors receive the two refs they need
 * (rpnXInputRef, suppressXBlurRef) as props.
 */
export function RpnXRegisterRow({ controller, flashRpnResult, lockRpnMode }: RpnXRegisterRowProps) {
  const {
    calculatorPrecision,
    rpnStack,
    rpnXEditing, setRpnXEditing,
    rpnXEditValue, setRpnXEditValue,
    getRpnResultDisplay,
    formatNumberWithSeparators, t,
  } = controller;

  const {
    rpnXInputRef, suppressXBlurRef, committedXTextRef, enterCommitKeepFocusRef,
    commitRpnXValue,
  } = useRpnXEditField(controller);

  const { state: appState, inputRef: converterInputRef, customValueInputRef } = useConverterContext();
  const activeTab = appState.uiPrefs.activeTab;

  return (
    <div
      className="grid gap-2 items-center"
      style={{ gridTemplateColumns: `${CommonFieldWidth} 50px 1fr` }}
    >
      {rpnXEditing ? (
        <input
          ref={rpnXInputRef}
          type="text"
          autoFocus
          data-testid="rpn-x-input"
          value={rpnXEditValue}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            committedXTextRef.current = null;
            setRpnXEditValue(e.target.value);
          }}
          onBlur={() => {
            // Suppress commit when the user clicked one of the adjacent
            // prefix/alt selectors — the selector interaction clears this flag
            // and restores focus to the input.
            if (suppressXBlurRef.current) return;
            // Enter just committed in locked RPN mode: keep edit mode
            // alive (iOS WebKit's Done key blurs before we can refocus;
            // exiting here would unmount the input).
            if (enterCommitKeepFocusRef.current) return;
            // Skip commit if Enter already committed this exact text.
            if (rpnXEditValue !== committedXTextRef.current) {
              commitRpnXValue();
            }
            committedXTextRef.current = null;
            setRpnXEditing(false);
            setRpnXEditValue('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (lockRpnMode) {
                // Dedicated RPN section: commit but keep the input
                // focused and editable, with the text selected so the
                // next keystrokes replace it.
                e.preventDefault();
                if (rpnXEditValue !== committedXTextRef.current) {
                  commitRpnXValue();
                  committedXTextRef.current = rpnXEditValue;
                }
                // Guard against the native blur (iOS WebKit Done key)
                // unmounting the input before we can refocus it.
                enterCommitKeepFocusRef.current = true;
                requestAnimationFrame(() => {
                  const input = rpnXInputRef.current;
                  if (input) {
                    input.focus();
                    input.select();
                  }
                  enterCommitKeepFocusRef.current = false;
                });
              } else {
                // Converter/Custom tabs: commit via blur, then hand
                // focus to the primary entry field of the active tab.
                e.preventDefault();
                e.currentTarget.blur();
                const target = activeTab === 'custom' ? customValueInputRef : converterInputRef;
                requestAnimationFrame(() => {
                  const input = target.current;
                  if (input) {
                    input.focus();
                    input.select();
                  }
                });
              }
            } else if (e.key === 'Escape') {
              committedXTextRef.current = null;
              setRpnXEditing(false);
              setRpnXEditValue('');
            }
          }}
          className="px-3 bg-muted/20 border border-accent rounded-md text-sm font-mono text-primary font-bold"
          style={{ height: FIELD_HEIGHT }}
          placeholder={t("Enter value or 'value unit'")}
        />
      ) : (
        <motion.button
          type="button"
          aria-label={t('Edit X register')}
          className="px-3 bg-muted/20 border border-accent/50 rounded-md flex items-center justify-between cursor-text hover:bg-muted/40 active:bg-muted/60 text-left"
          style={{ height: FIELD_HEIGHT, pointerEvents: 'auto' }}
          data-testid="rpn-x-field"
          onClick={() => {
            const display = getRpnResultDisplay();
            const currentText = display ? `${display.formattedValue}${display.unitSymbol ? ' ' + display.unitSymbol : ''}` : '';
            setRpnXEditValue(currentText);
            setRpnXEditing(true);
          }}
          animate={{
            opacity: flashRpnResult ? [1, 0.3, 1] : 1,
            scale: flashRpnResult ? [1, 1.02, 1] : 1
          }}
          transition={{ duration: 0.3 }}
        >
          {(() => {
            const xVal = rpnStack[3];
            // X register always shows source/selected unit — it is the
            // active editing register and always reflects the chosen unit.
            // preserveSourceUnit only controls the stacked (Y/Z/T) registers.
            const useSource = xVal?.originalUnit != null && xVal?.originalValue != null;
            const display = useSource
              ? { formattedValue: formatNumberWithSeparators(xVal!.originalValue!, calculatorPrecision), unitSymbol: xVal!.originalUnit! }
              : getRpnResultDisplay();
            return (
              <>
                <span className="text-sm font-mono text-primary font-bold truncate" data-testid="text-rpn-x-value">
                  {display?.formattedValue || ''}
                </span>
                <span className="text-xs font-mono text-muted-foreground ms-2 shrink-0" data-testid="text-rpn-x-unit">
                  {display?.unitSymbol || ''}
                </span>
              </>
            );
          })()}
        </motion.button>
      )}
      <RpnXRegisterSelectors
        controller={controller}
        rpnXInputRef={rpnXInputRef}
        suppressXBlurRef={suppressXBlurRef}
      />
    </div>
  );
}
