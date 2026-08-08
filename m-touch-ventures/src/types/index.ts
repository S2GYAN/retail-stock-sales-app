export interface Entry {
  id: string;
  /** ISO date string, YYYY-MM-DD */
  date: string;
  /** Amount of electricity credit/float bought that day, in GHS */
  purchase: number;
  /** Amount sold to customers that day, in GHS */
  sales: number;
}

export interface Settings {
  businessName: string;
  /** Starting float balance before any entries, in GHS */
  openingBalance: number;
  /** Balance below which a low-balance warning is shown, in GHS */
  lowBalanceThreshold: number;
}

/** An entry with all derived (recomputed, never stored) figures attached. */
export interface DerivedEntry extends Entry {
  commission: number;
  wht: number;
  netCommission: number;
  /** Running float balance as of this entry, chronologically. */
  balance: number;
}

export interface MonthlySummary {
  /** YYYY-MM */
  month: string;
  daysLogged: number;
  totalPurchase: number;
  totalSales: number;
  totalCommission: number;
  totalWht: number;
  totalNetCommission: number;
  closingBalance: number;
}

export const DEFAULT_SETTINGS: Settings = {
  businessName: 'M-Touch Ventures',
  openingBalance: 0,
  lowBalanceThreshold: 200,
};
