import { DerivedEntry, Entry, MonthlySummary } from '../types';

export const COMMISSION_RATE = 0.025;
export const WHT_RATE = 0.1;

/** Rounds to 2 decimal places, avoiding floating point drift. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Computes derived figures (commission, wht, netCommission, balance) for every
 * entry, in chronological order, starting the running balance from
 * openingBalance. Nothing here is persisted — call this whenever entries
 * or openingBalance change.
 */
export function computeDerivedEntries(entries: Entry[], openingBalance: number): DerivedEntry[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let runningBalance = openingBalance;

  return sorted.map((entry) => {
    const commission = round2(entry.purchase * COMMISSION_RATE);
    const wht = round2(commission * WHT_RATE);
    const netCommission = round2(commission - wht);
    runningBalance = round2(runningBalance + entry.purchase - entry.sales);

    return {
      ...entry,
      commission,
      wht,
      netCommission,
      balance: runningBalance,
    };
  });
}

/** Groups chronologically-sorted derived entries into monthly summaries, most recent first. */
export function computeMonthlySummaries(derivedEntries: DerivedEntry[]): MonthlySummary[] {
  const byMonth = new Map<string, DerivedEntry[]>();

  for (const entry of derivedEntries) {
    const month = entry.date.slice(0, 7);
    const bucket = byMonth.get(month);
    if (bucket) {
      bucket.push(entry);
    } else {
      byMonth.set(month, [entry]);
    }
  }

  const summaries: MonthlySummary[] = [];
  for (const [month, entriesInMonth] of byMonth.entries()) {
    // entriesInMonth are already in chronological order since derivedEntries is sorted.
    const last = entriesInMonth[entriesInMonth.length - 1];
    const totals = entriesInMonth.reduce(
      (acc, e) => {
        acc.totalPurchase = round2(acc.totalPurchase + e.purchase);
        acc.totalSales = round2(acc.totalSales + e.sales);
        acc.totalCommission = round2(acc.totalCommission + e.commission);
        acc.totalWht = round2(acc.totalWht + e.wht);
        acc.totalNetCommission = round2(acc.totalNetCommission + e.netCommission);
        return acc;
      },
      {
        totalPurchase: 0,
        totalSales: 0,
        totalCommission: 0,
        totalWht: 0,
        totalNetCommission: 0,
      }
    );

    summaries.push({
      month,
      daysLogged: entriesInMonth.length,
      ...totals,
      closingBalance: last.balance,
    });
  }

  summaries.sort((a, b) => b.month.localeCompare(a.month));
  return summaries;
}

/** Returns the current float balance: the balance of the most recent entry, or openingBalance if none. */
export function computeCurrentBalance(derivedEntries: DerivedEntry[], openingBalance: number): number {
  if (derivedEntries.length === 0) return openingBalance;
  return derivedEntries[derivedEntries.length - 1].balance;
}

export interface DailySeries {
  purchase: number[];
  sales: number[];
  /** Balance as of each day, forward-filled from the most recent logged entry (or openingBalance before any entry). */
  balance: number[];
}

/**
 * Builds daily purchase/sales/balance series for a list of dates (ascending, YYYY-MM-DD).
 * Days with no logged entry contribute 0 purchase/sales and carry the prior balance forward.
 */
export function buildDailySeries(
  derivedEntries: DerivedEntry[],
  dates: string[],
  openingBalance: number
): DailySeries {
  const byDate = new Map(derivedEntries.map((e) => [e.date, e]));

  // Balance immediately before the first date in `dates`: the most recent entry strictly before it.
  let carryBalance = openingBalance;
  for (const e of derivedEntries) {
    if (dates.length > 0 && e.date < dates[0]) {
      carryBalance = e.balance;
    }
  }

  const purchase: number[] = [];
  const sales: number[] = [];
  const balance: number[] = [];

  for (const date of dates) {
    const entry = byDate.get(date);
    if (entry) {
      purchase.push(entry.purchase);
      sales.push(entry.sales);
      carryBalance = entry.balance;
      balance.push(carryBalance);
    } else {
      purchase.push(0);
      sales.push(0);
      balance.push(carryBalance);
    }
  }

  return { purchase, sales, balance };
}
