import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeightUnit } from '@/types/exercise';

interface SettingsStore {
  weightUnit: WeightUnit;
  defaultRestSecs: number;
  userName: string;
  activeWorkoutId: number | null;
  isLoaded: boolean;

  setWeightUnit: (unit: WeightUnit) => void;
  setDefaultRestSecs: (secs: number) => void;
  setUserName: (name: string) => void;
  setActiveWorkoutId: (id: number | null) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

const STORAGE_KEY = '@reptracker_settings';

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  weightUnit: 'kg',
  defaultRestSecs: 90,
  userName: 'Athlete',
  activeWorkoutId: null,
  isLoaded: false,

  setWeightUnit: (unit) => {
    set({ weightUnit: unit });
    get().saveSettings();
  },

  setDefaultRestSecs: (secs) => {
    set({ defaultRestSecs: secs });
    get().saveSettings();
  },

  setUserName: (name) => {
    set({ userName: name });
    get().saveSettings();
  },

  setActiveWorkoutId: (id) => {
    set({ activeWorkoutId: id });
    get().saveSettings();
  },

  loadSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        set({ ...data, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  saveSettings: async () => {
    const { weightUnit, defaultRestSecs, userName, activeWorkoutId } = get();
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ weightUnit, defaultRestSecs, userName, activeWorkoutId }),
      );
    } catch {}
  },
}));
