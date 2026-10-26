export function appBasename(): string | undefined {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base.length > 0 ? base : undefined;
}
