import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CONVERSION_DATA } from "@/lib/conversion-data";
import { formatSiEquivalent } from "@/lib/units/formatSiEquivalent";
import { translateUnit } from "@/lib/translateUnit";
import type { SupportedLanguage } from "@/lib/localization";
import type { UnitDefinition } from "@/lib/units/unitDefinition";

interface SourcesSectionProps {
  t: (key: string) => string;
  language: string;
}

function linkLabel(url: string): string {
  if (url.includes("bipm.org")) return "BIPM";
  if (url.includes("nist.gov")) return "NIST";
  if (url.includes("wikipedia.org")) return "Wikipedia";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function baseSymbolFor(units: UnitDefinition[], baseSISymbol?: string): string {
  const base = units.find(
    (u) => u.factor === 1 && !u.offset && !u.conversionFunction && !u.mathFunction && !u.isInverse,
  );
  return base?.symbol || baseSISymbol || "";
}

export default function SourcesSection({ t, language }: SourcesSectionProps) {
  return (
    <Card className="w-full p-6 bg-card border-border/50">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label className="text-xs font-mono uppercase text-muted-foreground">
            {t("Sources")}
          </Label>
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            {t("sources-note")}
          </p>
        </div>
        <table className="w-full text-xs font-mono">
          <tbody>
            {CONVERSION_DATA.map((cat) => {
              const baseSym = baseSymbolFor(cat.units, cat.baseSISymbol);
              return [
                <tr key={`${cat.id}-header`} data-testid={`sources-category-${cat.id}`}>
                  <td colSpan={3} className="pt-4 pb-1">
                    <h3 className="text-sm font-bold text-foreground">{t(cat.name)}</h3>
                  </td>
                </tr>,
                ...cat.units.map((u) => (
                  <tr key={`${cat.id}-${u.id}`} className="align-top" data-testid={`sources-row-${cat.id}-${u.id}`}>
                    <td className="text-right pr-3 py-0.5 whitespace-nowrap text-muted-foreground w-[35%]">
                      {translateUnit(u.name, language as SupportedLanguage)}
                    </td>
                    <td className="text-left pr-3 py-0.5">
                      {formatSiEquivalent(u, baseSym, { categoryId: cat.id, baseSISymbol: cat.baseSISymbol })}
                    </td>
                    <td className="text-left py-0.5 whitespace-nowrap w-[12%]">
                      {u.sourceUrl && (
                        <a
                          href={u.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-muted-foreground hover:text-foreground"
                          data-testid={`sources-link-${cat.id}-${u.id}`}
                        >
                          {linkLabel(u.sourceUrl)}
                        </a>
                      )}
                    </td>
                  </tr>
                )),
              ];
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
