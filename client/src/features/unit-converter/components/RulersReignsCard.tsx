import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { testId } from '@/lib/test-utils';
import { lookupRulers } from '@/lib/eras/lookupRulers';
import type { Ruler, RulerRegion } from '@/lib/eras/types';
import rulersReignsJson from '@/data/eras/rulersReigns.json';

const RULER_REGIONS = rulersReignsJson.regions as RulerRegion[];

interface RulersReignsCardProps {
  t: (key: string) => string;
  astro: number | null;
}

function slug(name: string): string {
  return name.replace(/\W+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

export function RulersReignsCard({ t, astro }: RulersReignsCardProps) {
  const [regionId, setRegionId] = useState('persia');
  const region = RULER_REGIONS.find(r => r.id === regionId)!;
  const hit = astro === null
    ? { rulers: [] as Ruler[], gapNote: null }
    : lookupRulers(astro, region);

  const fmt = (y: number) => y < 0 ? `${-y} ${t('BCE')}` : `${y} ${t('CE')}`;

  return (
    <Card className="w-full p-6 bg-card border-border/50 space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground font-bold">
          {t('Rulers & Reigns')}
        </h3>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{t('rulers-region-label')}</Label>
          <Select value={regionId} onValueChange={setRegionId}>
            <SelectTrigger className="w-[200px] text-sm" {...testId('select-rulers-region')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RULER_REGIONS.map(r => (
                <SelectItem key={r.id} value={r.id} className="text-sm" {...testId(`option-rulers-region-${r.id}`)}>
                  {t(r.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <a
        href={region.sourceUrl} target="_blank" rel="noopener noreferrer"
        className="inline-block text-xs font-mono uppercase text-foreground font-bold hover:text-accent underline decoration-dotted underline-offset-2"
        {...testId('link-rulers-source')}
      >
        {t(region.name)}
      </a>
      {hit.gapNote && (
        <p className="text-xs text-accent" {...testId('text-rulers-gap')}>{t(hit.gapNote)}</p>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {region.dynasties.map(dynasty => (
          <div key={dynasty.name} className="space-y-1" {...testId(`section-rulers-${slug(dynasty.name)}`)}>
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80 font-bold border-b border-border/30 pb-1">
              {t(dynasty.name)}
            </h4>
            <table className="w-full text-xs">
              <tbody>
                {dynasty.rulers.map(r => {
                  const isActive = hit.rulers.includes(r);
                  return (
                    <tr
                      key={r.name}
                      className={isActive ? 'text-accent font-medium' : 'text-muted-foreground'}
                      {...testId(`row-ruler-${region.id}-${slug(r.name)}`)}
                    >
                      <td className="py-0.5 pe-2">
                        {r.name}{r.epithet ? ` ${t(r.epithet)}` : ''}
                      </td>
                      <td className="py-0.5 font-mono whitespace-nowrap">
                        {r.circa ? `${t('ca.')} ` : ''}{fmt(r.start)} – {fmt(r.end)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      {region.note && (
        <p className="text-xs text-muted-foreground" {...testId('text-rulers-region-note')}>{t(region.note)}</p>
      )}
      <p className="text-xs text-muted-foreground">{t('rulers-curated-note')}</p>
    </Card>
  );
}
