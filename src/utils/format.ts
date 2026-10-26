const integerFormat = new Intl.NumberFormat('en-US');
const compactFormat = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatInteger(value: number): string {
  return integerFormat.format(Math.round(value));
}

export function formatCompact(value: number): string {
  return compactFormat.format(value);
}

export function formatMoney(value: number, digits = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatSignedPercent(value: number, digits = 1): string {
  const scaled = value * 100;
  if (Math.abs(scaled) < 0.05) return `${(0).toFixed(digits)}%`;
  const sign = scaled > 0 ? '+' : '';
  return `${sign}${scaled.toFixed(digits)}%`;
}
