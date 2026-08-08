/**
 * Rounds to 2 decimal places, correcting for binary floating point
 * representation (plain `toFixed(2)` renders 1.005 as "1.00", because the
 * nearest double to 1.005 is slightly below it).
 *
 * Every money value in the app - both the figures we compute and the figures
 * we display - goes through this, so the ledger and the screen never disagree
 * about a pesewa.
 */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
