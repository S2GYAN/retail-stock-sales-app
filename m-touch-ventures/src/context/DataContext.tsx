import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  clearAll,
  loadEntries,
  loadSettings,
  saveEntries,
  saveSettings,
} from '../storage/storage';
import { DEFAULT_SETTINGS, DerivedEntry, Entry, MonthlySummary, Settings } from '../types';
import {
  computeCurrentBalance,
  computeDerivedEntries,
  computeMonthlySummaries,
} from '../utils/calculations';
import { generateId } from '../utils/id';

export interface EntryInput {
  /** Present when editing an existing entry by id; absent when saving by date. */
  id?: string;
  date: string;
  purchase: number;
  sales: number;
}

interface DataContextValue {
  isLoading: boolean;
  entries: Entry[];
  settings: Settings;
  derivedEntries: DerivedEntry[];
  monthlySummaries: MonthlySummary[];
  currentBalance: number;
  /** Saves an entry. If an entry exists for the same date (or matching id), it is updated instead of duplicated. */
  upsertEntry: (input: EntryInput) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
  resetAll: () => Promise<void>;
  entryForDate: (date: string) => Entry | undefined;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    (async () => {
      const [loadedEntries, loadedSettings] = await Promise.all([loadEntries(), loadSettings()]);
      setEntries(loadedEntries);
      setSettings(loadedSettings);
      setIsLoading(false);
    })();
  }, []);

  const entryForDate = useCallback(
    (date: string) => entries.find((e) => e.date === date),
    [entries]
  );

  const upsertEntry = useCallback(
    async (input: EntryInput) => {
      setEntries((prev) => {
        // Another entry already on the target date (not the one being edited, if any).
        const otherEntryOnDate = prev.find((e) => e.date === input.date && e.id !== input.id);
        const editingEntry = input.id ? prev.find((e) => e.id === input.id) : undefined;

        // The entry that should end up holding the saved values: prefer an existing
        // entry already on that date (per "one entry per date"), otherwise the entry
        // being edited (possibly moving it to a new date), otherwise a fresh one.
        const targetId = otherEntryOnDate?.id ?? editingEntry?.id ?? generateId();

        let next = prev
          // Drop the entry being edited if it's being merged into a different entry on the target date.
          .filter((e) => !(editingEntry && otherEntryOnDate && e.id === editingEntry.id))
          .map((e) =>
            e.id === targetId
              ? { id: targetId, date: input.date, purchase: input.purchase, sales: input.sales }
              : e
          );

        if (!next.some((e) => e.id === targetId)) {
          next = [...next, { id: targetId, date: input.date, purchase: input.purchase, sales: input.sales }];
        }

        saveEntries(next);
        return next;
      });
    },
    []
  );

  const deleteEntry = useCallback(async (id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveEntries(next);
      return next;
    });
  }, []);

  const updateSettings = useCallback(async (partial: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(async () => {
    await clearAll();
    setEntries([]);
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  const derivedEntries = useMemo(
    () => computeDerivedEntries(entries, settings.openingBalance),
    [entries, settings.openingBalance]
  );

  const monthlySummaries = useMemo(() => computeMonthlySummaries(derivedEntries), [derivedEntries]);

  const currentBalance = useMemo(
    () => computeCurrentBalance(derivedEntries, settings.openingBalance),
    [derivedEntries, settings.openingBalance]
  );

  const value: DataContextValue = {
    isLoading,
    entries,
    settings,
    derivedEntries,
    monthlySummaries,
    currentBalance,
    upsertEntry,
    deleteEntry,
    updateSettings,
    resetAll,
    entryForDate,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
