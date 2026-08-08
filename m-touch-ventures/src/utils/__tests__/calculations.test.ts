import { Entry } from '../../types';
import {
  buildDailySeries,
  computeCurrentBalance,
  computeDerivedEntries,
  computeMonthlySummaries,
  round2,
} from '../calculations';

const entry = (date: string, purchase: number, sales: number): Entry => ({
  id: date,
  date,
  purchase,
  sales,
});

describe('round2', () => {
  it('rounds to two decimals', () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(2.344)).toBe(2.34);
    expect(round2(10)).toBe(10);
  });

  it('avoids binary floating point drift', () => {
    // 0.1 + 0.2 === 0.30000000000000004 in IEEE 754.
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });
});

describe('computeDerivedEntries', () => {
  it('derives commission, WHT and net commission per entry', () => {
    const [derived] = computeDerivedEntries([entry('2026-01-10', 1000, 600)], 0);

    expect(derived.commission).toBe(25); // 1000 * 0.025
    expect(derived.wht).toBe(2.5); // 25 * 0.10
    expect(derived.netCommission).toBe(22.5); // 25 - 2.50
  });

  it('starts the running balance from the opening balance', () => {
    const [derived] = computeDerivedEntries([entry('2026-01-10', 1000, 600)], 500);

    // 500 opening + 1000 bought - 600 sold
    expect(derived.balance).toBe(900);
  });

  it('accumulates the balance across entries in date order', () => {
    const derived = computeDerivedEntries(
      [entry('2026-01-10', 1000, 600), entry('2026-01-11', 200, 500)],
      0
    );

    expect(derived.map((e) => e.balance)).toEqual([400, 100]);
  });

  it('sorts unordered entries chronologically before accumulating', () => {
    const derived = computeDerivedEntries(
      [entry('2026-01-11', 200, 500), entry('2026-01-10', 1000, 600)],
      0
    );

    expect(derived.map((e) => e.date)).toEqual(['2026-01-10', '2026-01-11']);
    expect(derived.map((e) => e.balance)).toEqual([400, 100]);
  });

  it('lets the balance go negative when sales outrun available float', () => {
    const [derived] = computeDerivedEntries([entry('2026-01-10', 0, 300)], 100);

    expect(derived.balance).toBe(-200);
  });

  it('returns an empty list for no entries', () => {
    expect(computeDerivedEntries([], 100)).toEqual([]);
  });

  it('does not mutate the caller’s array', () => {
    const entries = [entry('2026-01-11', 200, 500), entry('2026-01-10', 1000, 600)];
    computeDerivedEntries(entries, 0);

    expect(entries.map((e) => e.date)).toEqual(['2026-01-11', '2026-01-10']);
  });
});

describe('computeCurrentBalance', () => {
  it('falls back to the opening balance when there are no entries', () => {
    expect(computeCurrentBalance([], 250)).toBe(250);
  });

  it('uses the balance of the most recent entry', () => {
    const derived = computeDerivedEntries(
      [entry('2026-01-10', 1000, 600), entry('2026-01-11', 200, 500)],
      0
    );

    expect(computeCurrentBalance(derived, 0)).toBe(100);
  });
});

describe('computeMonthlySummaries', () => {
  const derived = computeDerivedEntries(
    [
      entry('2026-01-10', 1000, 600),
      entry('2026-01-20', 500, 300),
      entry('2026-02-05', 800, 200),
    ],
    0
  );
  const summaries = computeMonthlySummaries(derived);

  it('returns one row per calendar month, most recent first', () => {
    expect(summaries.map((s) => s.month)).toEqual(['2026-02', '2026-01']);
  });

  it('counts the days logged in each month', () => {
    expect(summaries[1].daysLogged).toBe(2);
    expect(summaries[0].daysLogged).toBe(1);
  });

  it('sums each field over the month', () => {
    const january = summaries[1];

    expect(january.totalPurchase).toBe(1500);
    expect(january.totalSales).toBe(900);
    expect(january.totalCommission).toBe(37.5); // 25 + 12.50
    expect(january.totalWht).toBe(3.75); // 2.50 + 1.25
    expect(january.totalNetCommission).toBe(33.75); // 22.50 + 11.25
  });

  it('uses the last entry of the month as the closing balance', () => {
    // Jan: 0 + 1000-600 = 400, then + 500-300 = 600
    expect(summaries[1].closingBalance).toBe(600);
    // Feb carries on: 600 + 800-200 = 1200
    expect(summaries[0].closingBalance).toBe(1200);
  });

  it('returns nothing when there are no entries', () => {
    expect(computeMonthlySummaries([])).toEqual([]);
  });

  it('keeps months in separate buckets across a year boundary', () => {
    const acrossYears = computeMonthlySummaries(
      computeDerivedEntries([entry('2025-12-31', 100, 0), entry('2026-01-01', 100, 0)], 0)
    );

    expect(acrossYears.map((s) => s.month)).toEqual(['2026-01', '2025-12']);
  });
});

describe('buildDailySeries', () => {
  const derived = computeDerivedEntries(
    [entry('2026-01-02', 1000, 600), entry('2026-01-04', 500, 300)],
    0
  );
  const dates = ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05'];

  it('reports zero purchase and sales on days with no entry', () => {
    const series = buildDailySeries(derived, dates, 0);

    expect(series.purchase).toEqual([0, 1000, 0, 500, 0]);
    expect(series.sales).toEqual([0, 600, 0, 300, 0]);
  });

  it('carries the balance forward across days with no entry', () => {
    const series = buildDailySeries(derived, dates, 0);

    // opening 0, then 400 on the 2nd, held through the 3rd, 600 on the 4th, held.
    expect(series.balance).toEqual([0, 400, 400, 600, 600]);
  });

  it('seeds the balance from the last entry before the window', () => {
    const series = buildDailySeries(derived, ['2026-01-03'], 0);

    expect(series.balance).toEqual([400]);
  });

  it('uses the opening balance when no entry precedes the window', () => {
    const series = buildDailySeries([], ['2026-01-03'], 750);

    expect(series.balance).toEqual([750]);
  });

  it('handles an empty date range', () => {
    expect(buildDailySeries(derived, [], 0)).toEqual({ purchase: [], sales: [], balance: [] });
  });
});
