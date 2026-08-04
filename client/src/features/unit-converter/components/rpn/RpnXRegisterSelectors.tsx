import type { MutableRefObject, RefObject } from 'react';
import { PREFIXES } from '@/lib/units/prefixes';
import { isSymbolSI } from '@/lib/unit-symbols/isSymbolSI';
import { isDimensionEmpty } from '@/lib/dimensions/isDimensionEmpty';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UseCalculatorControllerReturn } from '@/components/unit-converter/hooks/useCalculatorController';

interface RpnXRegisterSelectorsProps {
  controller: UseCalculatorControllerReturn;
  rpnXInputRef: RefObject<HTMLInputElement | null>;
  suppressXBlurRef: MutableRefObject<boolean>;
}

/**
 * The prefix + SI-representation selectors that sit next to the
 * X-register editable field. Three rendering paths:
 *
 *   1. Register holds a value with non-empty dimensions: two enabled
 *      Select controls (prefix + alternative representation), each
 *      wired with the focus-preservation dance that keeps the X input
 *      focused when the user opens a dropdown.
 *
 *   2. Register holds a value but has empty dimensions (dimensionless):
 *      two disabled selects rendering "-".
 *
 *   3. Register is empty (null): two disabled selects rendering
 *      empty placeholders. Kept structurally distinct from case 2 to
 *      avoid layout shift on state change.
 *
 * Cases 2 and 3 are visually similar but semantically different, and
 * carry different testids downstream. Keeping the three branches side-
 * by-side matches what the pre-split version did and preserves the
 * exact placeholder + disabled-value contract each branch sends into
 * the DOM.
 */
export function RpnXRegisterSelectors({
  controller,
  rpnXInputRef,
  suppressXBlurRef,
}: RpnXRegisterSelectorsProps) {
  const {
    rpnStack,
    rpnResultPrefix, setRpnResultPrefix,
    rpnSelectedAlternative, setRpnSelectedAlternative,
    rpnXEditing,
    generateSIRepresentations,
    t,
  } = controller;

  const xVal = rpnStack[3];

  if (xVal && !isDimensionEmpty(xVal.dimensions)) {
    const siReps = generateSIRepresentations(xVal.dimensions, xVal.sourceCategory);
    const currentAltSymbol = siReps[rpnSelectedAlternative]?.displaySymbol || '';
    const prefixEnabled = isSymbolSI(currentAltSymbol);
    return (
      <>
        <Select
          value={rpnResultPrefix}
          disabled={!prefixEnabled}
          onValueChange={(val) => {
            setRpnResultPrefix(val);
            suppressXBlurRef.current = false;
            if (rpnXEditing) requestAnimationFrame(() => rpnXInputRef.current?.focus());
          }}
        >
          <SelectTrigger
            data-testid="select-rpn-result-prefix"
            className={`h-10 text-xs${!prefixEnabled ? ' opacity-40 cursor-not-allowed' : ''}`}
            onMouseDown={(e) => {
              if (rpnXEditing && prefixEnabled) {
                e.preventDefault();
                suppressXBlurRef.current = true;
              }
            }}
          >
            <SelectValue placeholder={t('Prefix')} />
          </SelectTrigger>
          <SelectContent
            className="max-h-[50vh]"
            onCloseAutoFocus={(e) => {
              if (rpnXEditing) {
                e.preventDefault();
                suppressXBlurRef.current = false;
                rpnXInputRef.current?.focus();
              }
            }}
          >
            {PREFIXES.map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-xs font-mono">
                {p.symbol || '-'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={rpnSelectedAlternative.toString()}
          onValueChange={(val) => {
            setRpnSelectedAlternative(parseInt(val));
            suppressXBlurRef.current = false;
            if (rpnXEditing) requestAnimationFrame(() => rpnXInputRef.current?.focus());
          }}
        >
          <SelectTrigger
            data-testid="select-rpn-result-unit"
            className="h-10 text-xs"
            onMouseDown={(e) => {
              if (rpnXEditing) {
                e.preventDefault();
                suppressXBlurRef.current = true;
              }
            }}
          >
            <SelectValue placeholder={t('Select SI representation')} />
          </SelectTrigger>
          <SelectContent
            className="max-h-[50vh]"
            onCloseAutoFocus={(e) => {
              if (rpnXEditing) {
                e.preventDefault();
                suppressXBlurRef.current = false;
                rpnXInputRef.current?.focus();
              }
            }}
          >
            {siReps.map((rep, index) => (
              <SelectItem key={index} value={index.toString()} className="text-xs font-mono">
                <span className="font-bold">{rep.displaySymbol}</span>
                {rep.crossDomainMatches && rep.crossDomainMatches.length > 0 && (
                  <span className="ms-2 text-muted-foreground font-normal">
                    ({rep.crossDomainMatches.join(', ')})
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </>
    );
  }

  // Cases 2 and 3: register is empty or dimensionless. Two disabled
  // selects for layout stability.
  const secondValue = xVal ? 'unitless' : 'empty';
  return (
    <>
      <Select value="none" disabled>
        <SelectTrigger className="h-10 text-xs opacity-50 cursor-not-allowed">
          <SelectValue placeholder="-" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none" className="text-xs">-</SelectItem>
        </SelectContent>
      </Select>
      <Select value={secondValue} disabled>
        <SelectTrigger className="h-10 text-xs opacity-50 cursor-not-allowed">
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={secondValue} className="text-xs"></SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
