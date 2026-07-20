// Normalize an era name for matching: lowercase, strip diacritics
// (Keichō → keicho, Kāngxī → kangxi) so users can type plain ASCII.
export function normalizeEraName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
