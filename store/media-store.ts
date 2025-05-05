import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MediaItem {
  id: string;
  uri: string;
  type: 'image' | 'video';
  filename: string;
  timestamp: number;
  isDownloaded: boolean;
  localUri?: string;
}

interface MediaState {
  statusMedia: MediaItem[];
  downloadedMedia: MediaItem[];
  setStatusMedia: (media: MediaItem[]) => void;
  addDownloadedMedia: (media: MediaItem) => void;
  removeDownloadedMedia: (id: string) => void;
  isDownloaded: (id: string) => boolean;
  clearAllDownloads: () => void;
}

export const useMediaStore = create<MediaState>()(
  persist(
    (set, get) => ({
      statusMedia: [],
      downloadedMedia: [],
      setStatusMedia: (media) => set({ statusMedia: media }),
      addDownloadedMedia: (media) => {
        const updatedMedia = { ...media, isDownloaded: true };
        set((state) => ({
          downloadedMedia: [...state.downloadedMedia, updatedMedia],
        }));
      },
      removeDownloadedMedia: (id) => {
        set((state) => ({
          downloadedMedia: state.downloadedMedia.filter((item) => item.id !== id),
        }));
      },
      isDownloaded: (id) => {
        return get().downloadedMedia.some((item) => item.id === id);
      },
      clearAllDownloads: () => {
        set({ downloadedMedia: [] });
      },
    }),
    {
      name: 'media-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);