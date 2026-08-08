/**
 * Formats a number of Ghanaian cedis as "GH₵ 1,240.50".
 * Negative values are shown as "-GH₵ 1,240.50".
 */
export function formatGHS(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const sign = safe < 0 ? '-' : '';
  const abs = Math.abs(safe);
  const [whole, fraction] = abs.toFixed(2).split('.');
  const withSeparators = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}GH₵ ${withSeparators}.${fraction}`;
}

/** Formats a percentage change, e.g. "+12.3%" or "-4.0%". Returns "—" when the base is 0. */
export function formatPercentChange(current: number, previous: number): string {
  if (previous === 0) {
    if (current === 0) return '0.0%';
    return current > 0 ? '+100.0%' : '-100.0%';
  }
  const change = ((current - previous) / Math.abs(previous)) * 100;
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}
