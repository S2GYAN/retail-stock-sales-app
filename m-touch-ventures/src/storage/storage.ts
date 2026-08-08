import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS, Entry, Settings } from '../types';

const ENTRIES_KEY = '@mtouch/entries';
const SETTINGS_KEY = '@mtouch/settings';

export async function loadEntries(): Promise<Entry[]> {
  try {
    const raw = await AsyncStorage.getItem(ENTRIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export async function saveEntries(entries: Entry[]): Promise<void> {
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.removeMany([ENTRIES_KEY, SETTINGS_KEY]);
}
