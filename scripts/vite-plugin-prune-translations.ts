import fs from "fs";
import path from "path";
import type { Plugin } from "vite";

/**
 * Build-only plugin that shrinks the single-file bundle by pruning redundant
 * localization entries before they are inlined:
 *
 *  - en.json: drops entries whose value equals the key (runtime falls back
 *    to the key itself via `en[key] ?? key`).
 *  - other languages: drops entries whose value equals the English
 *    resolution `en[key] ?? key` (runtime falls back to English).
 *
 * Source JSON files stay complete; only the production bundle is pruned.
 * Dev server and vitest are unaffected (`apply: "build"`).
 */
export function pruneTranslations(): Plugin {
  const dirPattern = /[\\/]data[\\/]localization[\\/](units|ui)[\\/]([a-z-]+)\.json$/;
  const enCache = new Map<string, Record<string, string>>();

  function loadEnglish(jsonPath: string): Record<string, string> {
    const dir = path.dirname(jsonPath);
    let en = enCache.get(dir);
    if (!en) {
      en = JSON.parse(fs.readFileSync(path.join(dir, "en.json"), "utf8"));
      enCache.set(dir, en!);
    }
    return en!;
  }

  return {
    name: "prune-translations",
    enforce: "pre",
    apply: "build",
    transform(code, id) {
      const match = id.match(dirPattern);
      if (!match) return null;
      const lang = match[2];
      const entries: Record<string, string> = JSON.parse(code);
      const en = loadEnglish(id.split("?")[0]);
      const pruned: Record<string, string> = {};
      for (const [key, value] of Object.entries(entries)) {
        const fallback = lang === "en" ? key : (en[key] ?? key);
        if (value !== fallback) pruned[key] = value;
      }
      return { code: JSON.stringify(pruned), map: null };
    },
  };
}
