import React from 'react';
import { motion } from 'framer-motion';
import { parseUnitText } from '@/lib/conversion-data';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { testId } from '@/lib/test-utils';
import { FIELD_HEIGHT, CommonFieldWidth } from '@/components/unit-converter/constants';
import { dimensionsToExponents } from '@/lib/units/dimensionsToExponents';
import type { NumberFormat } from '@/lib/formatting';
import { getMatchingPhysicalQuantities } from '@/lib/units/categoryDimensions';

interface DirectPaneProps {
  activeTab: string;
  directValue: string;
  directExponents: Record<string, number>;
  precision: number;
  numberFormat: NumberFormat;
  flashDirectCopy: boolean;
  setDirectValue: (val: string) => void;
  setDirectExponents: (val: Record<string, number>) => void;
  t: (key: string) => string;
  formatResultValue: (num: number, precision: number) => string;
  formatForClipboard: (num: number, precision: number) => string;
  parseNumberWithFormat: (str: string) => number;
  buildDirectUnitSymbol: () => string;
  buildDirectDimensions: () => Record<string, number>;
  onCopyAndPushToCalculator: (value: number, dims: Record<string, number>) => void;
  onQuantityClick: (quantityName: string) => void;
}

export function DirectPane({
  activeTab,
  directValue,
  directExponents,
  precision,
  numberFormat,
  flashDirectCopy,
  setDirectValue,
  setDirectExponents,
  t,
  formatResultValue,
  formatForClipboard,
  parseNumberWithFormat,
  buildDirectUnitSymbol,
  buildDirectDimensions,
  onCopyAndPushToCalculator,
  onQuantityClick,
}: DirectPaneProps) {
  const clearExponents = () => setDirectExponents({
    m: 0, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0
  });

  const currentDimensions = buildDirectDimensions();
  const matchingQuantities = getMatchingPhysicalQuantities(currentDimensions);

  const handleCopyAndPush = () => {
    const numValue = parseNumberWithFormat(directValue);
    if (isNaN(numValue) || !directValue) return;
    const unitSymbol = buildDirectUnitSymbol();
    const valueStr = formatForClipboard(numValue, precision);
    const textToCopy = unitSymbol ? `${valueStr} ${unitSymbol}` : valueStr;
    navigator.clipboard.writeText(textToCopy);
    const dims = buildDirectDimensions();
    onCopyAndPushToCalculator(numValue, dims);
  };

  const handleBlurParse = (text: string) => {
    if (!text) return;

    const hasUnitPart = /[a-zA-Z°⋅·×\^⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/.test(text);
    if (hasUnitPart) {
      const parsed = parseUnitText(text);
      if (parsed.value && (Object.keys(parsed.dimensions).length > 0 || parsed.categoryId)) {
        setDirectValue(parsed.value.toString());

        setDirectExponents(dimensionsToExponents(parsed.dimensions));
      }
    }
  };

  const superscripts: Record<number, string> = {
    1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵',
    [-1]: '⁻¹', [-2]: '⁻²', [-3]: '⁻³', [-4]: '⁻⁴', [-5]: '⁻⁵'
  };

  return (
    <Card
      className={`w-full p-6 md:p-8 bg-card border-border/50 shadow-xl relative overflow-hidden col-start-1 row-start-1 transition-opacity duration-150 ${
        activeTab === 'custom' ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      <div className="flex flex-col gap-6 relative z-10">
        {/* Top row: Value input, Result display, and buttons */}
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-mono uppercase text-muted-foreground">{t('Value')}</Label>
            <Input
              type="text"
              inputMode="text"
              value={directValue}
              onChange={(e) => setDirectValue(e.target.value)}
              onBlur={(e) => handleBlurParse(e.target.value.trim())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              className="font-mono px-4 bg-background/50 border-border focus:border-accent focus:ring-accent/20 transition-all text-start"
              style={{ height: FIELD_HEIGHT, fontSize: '0.875rem', width: CommonFieldWidth }}
              placeholder="0"
              {...testId('custom-input-value')}
            />
          </div>

          {/* Result display */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-mono uppercase text-muted-foreground">{t('Result')}</Label>
            <motion.button
              type="button"
              aria-label={t('Copy result')}
              className="px-4 bg-background/50 border border-border rounded-md font-mono text-primary cursor-pointer hover:bg-background/70 flex items-center justify-between gap-4 text-left"
              style={{ height: FIELD_HEIGHT, minWidth: CommonFieldWidth }}
              data-testid="custom-display-result"
              onClick={handleCopyAndPush}
              animate={{
                opacity: flashDirectCopy ? [1, 0.3, 1] : 1,
                scale: flashDirectCopy ? [1, 1.02, 1] : 1
              }}
              transition={{ duration: 0.3 }}
            >
              {(() => {
                const numValue = parseNumberWithFormat(directValue);
                const unitSymbol = buildDirectUnitSymbol();
                if (isNaN(numValue) || !directValue) return <span>...</span>;
                return (
                  <>
                    <span>{formatResultValue(numValue, precision)}</span>
                    <span className="text-muted-foreground">{unitSymbol}</span>
                  </>
                );
              })()}
            </motion.button>
          </div>

          {/* Copy button inline with result */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyAndPush}
            data-testid="button-custom-copy"
            className="text-xs hover:text-accent gap-2 border !border-border/30"
            style={{ height: FIELD_HEIGHT }}
          >
            <Copy className="w-3 h-3" />
            <motion.span
              animate={{
                opacity: flashDirectCopy ? [1, 0.3, 1] : 1,
                scale: flashDirectCopy ? [1, 1.1, 1] : 1
              }}
              transition={{ duration: 0.3 }}
            >
              {t('Copy')}
            </motion.span>
          </Button>

        </div>

        {/* Unit selector grid */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-mono uppercase text-muted-foreground">{t('Dimensions')}</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearExponents}
              data-testid="button-custom-clear-dimensions"
              className="text-xs hover:text-accent border !border-border/30"
              style={{ height: FIELD_HEIGHT }}
            >
              {t('Clear Dimensions')}
            </Button>
          </div>
          {([
            { unit: 'm', quantity: 'Length' },
            { unit: 'kg', quantity: 'Mass' },
            { unit: 's', quantity: 'Time' },
            { unit: 'A', quantity: 'Electric Current' },
            { unit: 'K', quantity: 'Temperature' },
            { unit: 'mol', quantity: 'Amount of Substance' },
            { unit: 'cd', quantity: 'Luminous Intensity' },
            { unit: 'rad', quantity: 'Plane Angle' },
            { unit: 'sr', quantity: 'Solid Angle' }
          ] as const).map(({ unit, quantity }) => (
            <div key={unit} className="flex items-center gap-2">
              <span className="text-xs w-32 text-right text-muted-foreground truncate" title={t(quantity)}>{t(quantity)}</span>
              <div className="flex gap-0">
                {[5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5].map((exp) => {
                  const label = exp === 0 ? '-' : `${unit}${superscripts[exp] || ''}`;
                  const isSelected = directExponents[unit] === exp;
                  return (
                    <button
                      key={exp}
                      onClick={() => setDirectExponents({ ...directExponents, [unit]: exp })}
                      className={`w-12 h-7 text-xs font-mono border transition-all text-center shrink-0 ${
                        isSelected
                          ? 'bg-accent text-accent-foreground border-accent'
                          : 'bg-background/30 border-border/50 hover:bg-muted/50 text-muted-foreground'
                      } ${exp === 5 ? 'rounded-l' : ''} ${exp === -5 ? 'rounded-r' : ''}`}
                      {...testId(`custom-exp-${unit}-${exp}`)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Physical quantity labels below Dimensions block */}
        {matchingQuantities.length > 0 && (
          <div className="flex flex-col gap-2">
            {matchingQuantities.slice(0, 3).map((quantity) => (
              <button
                key={quantity}
                className="flex items-center px-3 py-1.5 rounded-md text-xs font-mono text-accent bg-accent/5 border border-accent/20 cursor-pointer hover:bg-accent/15 hover:border-accent/50 hover:shadow-sm active:bg-accent/25 transition-all duration-150 text-left w-fit"
                onClick={() => onQuantityClick(quantity)}
                {...testId('custom-physical-quantity-label')}
                data-quantity-id={quantity.toLowerCase().replace(/\s+/g, '-')}
              >
                {quantity}
              </button>
            ))}
            {matchingQuantities.length > 3 && (
              <span className="text-xs font-mono text-muted-foreground">…</span>
            )}
          </div>
        )}

      </div>
    </Card>
  );
}
