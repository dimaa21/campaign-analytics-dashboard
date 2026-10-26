export const SAMPLE_MACROS: Record<string, string> = {
  clickid: 'clk_19af7c2e80',
  payout: '46.80',
  status: 'approved',
  offer: 'off-northpeak',
  geo: 'DE',
  campaign: 'cmp-014',
  source: 'tiktok',
};

export const DEFAULT_TEMPLATE =
  'https://tracker.example.test/postback?subid={clickid}&payout={payout}&status={status}&offer={offer}&geo={geo}';

export function applyMacros(template: string, values: Record<string, string>): string {
  return template.replace(/\{([a-z0-9_]+)\}/gi, (token, key: string) => {
    const value = values[key.toLowerCase()];
    return value === undefined ? token : value;
  });
}

export function unresolvedMacros(value: string): string[] {
  const found = new Set<string>();
  for (const match of value.matchAll(/\{([a-z0-9_]+)\}/gi)) {
    const name = match[1];
    if (name) found.add(name.toLowerCase());
  }
  return [...found];
}
