import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// ─────────────────────────────────────────────────────────────────────────────
// MAINTENANCE NOTE
// The English strings in this file (help-para-1 through help-para-5,
// help-github-note, help-llm-note) are the canonical source of truth.
// All other language versions in localization.ts are machine-translated from
// those English strings. If a translation seems wrong, switch the UI language
// to 'en' to read the original. To update the text, edit the English value in
// localization.ts first, then re-translate the other languages from that.
// ─────────────────────────────────────────────────────────────────────────────

interface HelpSectionProps {
  t: (key: string) => string;
  language: string;
}

export default function HelpSection({ t, language }: HelpSectionProps) {
  const machineTranslatedNotice = language !== 'en' && language !== 'en-us'
    ? t('help-machine-translated')
    : '';

  return (
    <Card className="w-full p-6 bg-card border-border/50">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-mono uppercase text-muted-foreground">
            {t("Help")}
          </Label>
          {machineTranslatedNotice && (
            <p className="text-xs text-amber-600/80 dark:text-amber-400/70 italic leading-relaxed">
              {machineTranslatedNotice}
            </p>
          )}
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>{t('help-para-1')}</p>
            <p>{t('help-para-2')}</p>
            <p>{t('help-para-3')}</p>
            <p>{t('help-para-4')}</p>
            <p>{t('help-para-5')}</p>
            <p>{t('help-github-note')}</p>
            <p className="text-xs text-muted-foreground/70">
              GitHub:{" "}
              <a
                href="https://github.com/tyohDeveloper/New-units"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                https://github.com/tyohDeveloper/New-units
              </a>
            </p>
            <p className="text-xs text-muted-foreground/70">{t('help-llm-note')}</p>
          </div>
        </div>
        <div className="border-t border-border/30 pt-4">
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            Copyright © 2025 David Hoyt. MIT License — Permission is hereby
            granted, free of charge, to any person obtaining a copy of this
            software and associated documentation files, to deal in the Software
            without restriction, including without limitation the rights to use,
            copy, modify, merge, publish, distribute, sublicense, and/or sell
            copies of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT
            WARRANTY OF ANY KIND.
          </p>
        </div>
      </div>
    </Card>
  );
}
