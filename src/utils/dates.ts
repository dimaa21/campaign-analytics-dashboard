import type { DatePreset } from '../types';

export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = parseISODate(value);
  return !Number.isNaN(parsed.getTime()) && formatISODate(parsed) === value;
}

export function parseISODate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return new Date(Number.NaN);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function inclusiveDays(from: string, to: string): number {
  const ms = parseISODate(to).getTime() - parseISODate(from).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

export function previousRange(from: string, to: string): { from: string; to: string } {
  const length = inclusiveDays(from, to);
  const end = addDays(parseISODate(from), -1);
  const start = addDays(end, -(length - 1));
  return { from: formatISODate(start), to: formatISODate(end) };
}

export function rangeForPreset(
  preset: Exclude<DatePreset, 'custom'>,
  today: Date,
): { from: string; to: string } {
  const to = formatISODate(today);
  if (preset === 'today') return { from: to, to };
  const length = preset === '7d' ? 7 : 30;
  return { from: formatISODate(addDays(today, -(length - 1))), to };
}

export function clampRange(from: string, to: string): { from: string; to: string } {
  const ordered = from > to ? { from: to, to: from } : { from, to };
  if (inclusiveDays(ordered.from, ordered.to) <= 120) return ordered;
  return { from: formatISODate(addDays(parseISODate(ordered.to), -119)), to: ordered.to };
}

export function formatRangeLabel(from: string, to: string): string {
  const start = parseISODate(from);
  const end = parseISODate(to);
  const dayMonth = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
  const full = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  if (from === to) return full.format(start);
  const startLabel = start.getFullYear() === end.getFullYear() ? dayMonth.format(start) : full.format(start);
  return `${startLabel} – ${full.format(end)}`;
}

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(parseISODate(value));
}

export function formatClock(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(iso));
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}
