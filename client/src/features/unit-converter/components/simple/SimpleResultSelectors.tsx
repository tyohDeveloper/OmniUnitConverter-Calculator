import { PREFIXES } from '@/lib/units/prefixes';
import { isDimensionEmpty } from '@/lib/dimensions/isDimensionEmpty';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UseCalculatorControllerReturn } from '@/components/unit-converter/hooks/useCalculatorControllerReturn';

interface SimpleResultSelectorsProps {
  controller: UseCalculatorControllerReturn;
}

/**
 * The prefix + SI-representation selectors that sit next to the Simple
 * calculator's result field. Three rendering paths:
 *
 *   1. Result value is set AND has non-empty dimensions: two enabled
 *      Select controls (prefix + alternative representation).
 *   2. Result value is set but dimensions are empty (dimensionless):
 *      two disabled selects rendering "-".
 *   3. Result value is null: two disabled selects rendering empty
 *      placeholders (kept structurally distinct from case 2 to avoid
 *      layout shift on state change).
 *
 * Sibling to the RPN version (RpnXRegisterSelectors) which has the
 * same three-branch shape but adds focus-management ref handling
 * because the RPN X-register is an editable input. This Simple version
 * has no editable input so no focus dance is needed.
 */
export function SimpleResultSelectors({ controller }: SimpleResultSelectorsProps) {
  const {
    calcValues,
    resultPrefix, setResultPrefix,
    selectedAlternative, setSelectedAlternative,
    generateSIRepresentations, t,
  } = controller;

  const resultVal = calcValues[3];

  if (resultVal && !isDimensionEmpty(resultVal.dimensions)) {
    const siReps = generateSIRepresentations(resultVal.dimensions, resultVal.sourceCategory);
    // Note: the pre-split version computed a `currentSymbol` const from
    // `siReps[selectedAlternative]?.displaySymbol || formatDimensions(...)`
    // but never used it. Dead code, dropped in this extraction.
    return (
      <>
        <Select
          value={resultPrefix}
          onValueChange={(val) => setResultPrefix(val)}
        >
          <SelectTrigger data-testid="select-calc-result-prefix" className="h-10 w-[50px] text-xs shrink-0">
            <SelectValue placeholder={t('Prefix')} />
          </SelectTrigger>
          <SelectContent className="max-h-[50vh]">
            {PREFIXES.map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-xs font-mono">
                {p.symbol || '-'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedAlternative.toString()}
          onValueChange={(val) => { setSelectedAlternative(parseInt(val)); setResultPrefix('none'); }}
        >
          <SelectTrigger data-testid="select-calc-result-unit" className="h-10 flex-1 min-w-0 text-xs">
            <SelectValue placeholder={t('Select SI representation')} />
          </SelectTrigger>
          <SelectContent className="max-h-[50vh]">
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

  // Cases 2 and 3: result is empty or dimensionless. Two disabled
  // selects for layout stability. Only the second Select's value
  // differs between the two cases; kept as a single branch to avoid
  // duplication.
  const secondValue = resultVal ? 'unitless' : 'empty';
  return (
    <>
      <Select value="none" disabled>
        <SelectTrigger className="h-10 w-[50px] text-xs opacity-50 cursor-not-allowed shrink-0">
          <SelectValue placeholder="-" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none" className="text-xs">-</SelectItem>
        </SelectContent>
      </Select>
      <Select value={secondValue} disabled>
        <SelectTrigger className="h-10 flex-1 min-w-0 text-xs opacity-50 cursor-not-allowed">
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={secondValue} className="text-xs"></SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
