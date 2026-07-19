const REGIONAL_COUNTING_LABELS: Record<string, string> = {
  sen: '千',
  wan: '万',
  zhao: '兆',
  kei: '京',
  yi: '亿',
  oku: '億',
  lakh: 'lakh',
  crore: 'crore',
  arab: 'arab',
  kharab: 'kharab',
};

export function regionalCountingSuffix(unitId: string): string {
  const label = REGIONAL_COUNTING_LABELS[unitId];
  if (!label) return '';
  return /^[a-z]/i.test(label) ? ` ${label}` : label;
}
