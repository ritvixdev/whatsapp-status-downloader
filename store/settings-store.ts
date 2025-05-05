import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SAVE_DIRECTORY } from '@/utils/file-system';

interface SettingsState {
  saveDirectory: string;
  autoRefresh: boolean;
  notificationsEnabled: boolean;
  setSaveDirectory: (directory: string) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      saveDirectory: DEFAULT_SAVE_DIRECTORY,
      autoRefresh: false,
      notificationsEnabled: true,
      setSaveDirectory: (directory) => set({ saveDirectory: directory }),
      setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);