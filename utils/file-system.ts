import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import { MediaItem } from '@/store/media-store';

// Mock data for web platform
const MOCK_STATUS_MEDIA: MediaItem[] = [
  {
    id: '1',
    uri: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    type: 'image',
    filename: 'sunset.jpg',
    timestamp: Date.now() - 3600000,
    isDownloaded: false,
  },
  {
    id: '2',
    uri: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1051&q=80',
    type: 'image',
    filename: 'mountains.jpg',
    timestamp: Date.now() - 7200000,
    isDownloaded: false,
  },
  {
    id: '3',
    uri: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-1.2.1&auto=format&fit=crop&w=1086&q=80',
    type: 'image',
    filename: 'italy.jpg',
    timestamp: Date.now() - 10800000,
    isDownloaded: false,
  },
  {
    id: '4',
    uri: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    type: 'image',
    filename: 'lake.jpg',
    timestamp: Date.now() - 14400000,
    isDownloaded: false,
  },
  {
    id: '5',
    uri: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-1.2.1&auto=format&fit=crop&w=1140&q=80',
    type: 'image',
    filename: 'forest.jpg',
    timestamp: Date.now() - 18000000,
    isDownloaded: false,
  },
  {
    id: '6',
    uri: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1189&q=80',
    type: 'image',
    filename: 'mountains2.jpg',
    timestamp: Date.now() - 21600000,
    isDownloaded: false,
  },
  {
    id: '7',
    uri: 'https://images.unsplash.com/photo-1551632811-561732d1e211?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    type: 'image',
    filename: 'waterfall.jpg',
    timestamp: Date.now() - 25200000,
    isDownloaded: false,
  },
  {
    id: '8',
    uri: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    type: 'image',
    filename: 'mountains3.jpg',
    timestamp: Date.now() - 28800000,
    isDownloaded: false,
  },
  {
    id: '9',
    uri: 'https://images.unsplash.com/photo-1518791841-8ea7642ed6ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    type: 'image',
    filename: 'cat.jpg',
    timestamp: Date.now() - 32400000,
    isDownloaded: false,
  },
  {
    id: '10',
    uri: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
    type: 'video',
    filename: 'nature.mp4',
    timestamp: Date.now() - 36000000,
    isDownloaded: false,
  },
  {
    id: '11',
    uri: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    type: 'video',
    filename: 'ocean.mp4',
    timestamp: Date.now() - 39600000,
    isDownloaded: false,
  },
  {
    id: '12',
    uri: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
    type: 'video',
    filename: 'forest_stream.mp4',
    timestamp: Date.now() - 43200000,
    isDownloaded: false,
  },
];

// Default save directory with fallback
export const DEFAULT_SAVE_DIRECTORY = FileSystem.documentDirectory 
  ? `${FileSystem.documentDirectory}saved_status/` 
  : '/saved_status/';

// Possible WhatsApp status directories
const WHATSAPP_STATUS_DIRS = [
  '/storage/emulated/0/WhatsApp/Media/.Statuses/',
  '/storage/emulated/0/WhatsApp Business/Media/.Statuses/',
  '/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/.Statuses/',
  '/storage/emulated/0/Android/media/com.whatsapp.w4b/WhatsApp Business/Media/.Statuses/',
  '/storage/emulated/0/WhatsApp/Media/WhatsApp Images/Status/',
  '/storage/emulated/0/WhatsApp/Media/WhatsApp Video/Status/',
  '/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Images/Status/',
  '/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Video/Status/',
  '/storage/emulated/0/Android/data/com.whatsapp/files/WhatsApp/Media/.Statuses/',
  '/storage/emulated/0/DCIM/WhatsApp/.Statuses/',
  '/storage/emulated/0/Samsung/WhatsApp/Media/.Statuses/',
  '/storage/emulated/0/MIUI/WhatsApp/Media/.Statuses/',
  '/storage/emulated/0/Huawei/WhatsApp/Media/.Statuses/',
  '/storage/emulated/0/Android/data/com.whatsapp/cache/Status/',
  '/storage/sdcard1/WhatsApp/Media/.Statuses/',
  '/storage/sdcard1/Android/media/com.whatsapp/WhatsApp/Media/.Statuses/',
];

// Check if a file is an image or video based on extension
const isMediaFile = (filename: string): { isMedia: boolean; type: 'image' | 'video' | null } => {
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.endsWith('.jpg') || 
      lowerFilename.endsWith('.jpeg') || 
      lowerFilename.endsWith('.png') || 
      lowerFilename.endsWith('.gif') || 
      lowerFilename.endsWith('.webp')) {
    return { isMedia: true, type: 'image' };
  }
  
  if (lowerFilename.endsWith('.mp4') || 
      lowerFilename.endsWith('.3gp') || 
      lowerFilename.endsWith('.mov') || 
      lowerFilename.endsWith('.avi')) {
    return { isMedia: true, type: 'video' };
  }
  
  return { isMedia: false, type: null };
};

// Request storage permissions
export const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true; // Web doesn't need permissions
  }

  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    
    if (status === MediaLibrary.PermissionStatus.GRANTED) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error requesting storage permission:', error);
    return false;
  }
};

// Check if storage permission is granted
export const checkStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true; // Web doesn't need permissions
  }

  try {
    const { status } = await MediaLibrary.getPermissionsAsync();
    return status === MediaLibrary.PermissionStatus.GRANTED;
  } catch (error) {
    console.error('Error checking storage permission:', error);
    return false;
  }
};

// Get WhatsApp status media
export const getWhatsAppStatusMedia = async (): Promise<MediaItem[]> => {
  // For web, return mock data
  if (Platform.OS === 'web') {
    return MOCK_STATUS_MEDIA;
  }

  try {
    // Check if we have permission
    const hasPermission = await checkStoragePermission();
    if (!hasPermission) {
      console.log('Storage permission not granted');
      return [];
    }

    let allMedia: MediaItem[] = [];
    
    // Try each possible WhatsApp status directory
    for (const dir of WHATSAPP_STATUS_DIRS) {
      try {
        // Check if directory exists
        const dirInfo = await FileSystem.getInfoAsync(dir);
        if (!dirInfo.exists || !dirInfo.isDirectory) {
          continue;
        }
        
        console.log(`Found directory: ${dir}`);
        
        // Read directory contents
        const files = await FileSystem.readDirectoryAsync(dir);
        console.log(`Found ${files.length} files in ${dir}`);
        
        // Process each file
        for (const file of files) {
          const { isMedia, type } = isMediaFile(file);
          
          if (isMedia && type) {
            const filePath = `${dir}${file}`;
            const fileInfo = await FileSystem.getInfoAsync(filePath);
            
            if (fileInfo.exists) {
              const mediaItem: MediaItem = {
                id: filePath,
                uri: `file://${filePath}`,
                type: type,
                filename: file,
                timestamp: fileInfo.modificationTime ? fileInfo.modificationTime * 1000 : Date.now(),
                isDownloaded: false,
              };
              
              allMedia.push(mediaItem);
              console.log(`Added media: ${file}`);
            }
          }
        }
      } catch (error) {
        console.log(`Error reading directory ${dir}:`, error);
        // Continue to next directory
      }
    }
    
    // Sort by timestamp (newest first)
    allMedia.sort((a, b) => b.timestamp - a.timestamp);
    console.log(`Total media found: ${allMedia.length}`);
    
    return allMedia.length > 0 ? allMedia : MOCK_STATUS_MEDIA;
  } catch (error) {
    console.error('Error accessing WhatsApp status media:', error);
    return MOCK_STATUS_MEDIA;
  }
};

// Get current save directory
export const getSaveDirectory = async (): Promise<string> => {
  return DEFAULT_SAVE_DIRECTORY;
};

// Download media
export const downloadMedia = async (media: MediaItem, customDir?: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    // Simulate download on web
    return media.uri;
  }

  try {
    // Use custom directory or default
    const downloadDir = customDir || DEFAULT_SAVE_DIRECTORY;
    
    // Ensure directory exists
    const dirInfo = await FileSystem.getInfoAsync(downloadDir);
    if (!dirInfo.exists || !dirInfo.isDirectory) {
      await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
    }
    
    const localUri = `${downloadDir}${media.filename}`;
    
    // Copy or download the file
    if (media.uri.startsWith('file://')) {
      const sourceUri = media.uri;
      await FileSystem.copyAsync({
        from: sourceUri,
        to: localUri
      });
    } else {
      await FileSystem.downloadAsync(media.uri, localUri);
    }
    
    return localUri;
  } catch (error) {
    console.error('Error downloading media:', error);
    return null;
  }
};

// Save media to device gallery
export const saveToGallery = async (uri: string): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false; // Not supported on web
  }

  try {
    // Ensure uri has file:// prefix
    const fileUri = uri.startsWith('file://') ? uri : `file://${uri}`;
    
    // Check permission
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== MediaLibrary.PermissionStatus.GRANTED) {
      console.log('Media library permission not granted');
      return false;
    }
    
    // Save to media library
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    
    // Try to save to album
    try {
      const album = await MediaLibrary.getAlbumAsync('WhatsApp Status Saver');
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync('WhatsApp Status Saver', asset, false);
      }
    } catch (albumError) {
      console.log('Error saving to album:', albumError);
      // Continue anyway since the asset is already saved to the library
    }
    
    return true;
  } catch (error) {
    console.error('Error saving to gallery:', error);
    return false;
  }
};

// Delete downloaded media
export const deleteDownloadedMedia = async (localUri: string): Promise<boolean> => {
  if (Platform.OS === 'web') {
    console.log('Web platform - simulating delete success');
    return true; // Simulate success on web
  }

  try {
    console.log('Original URI to delete:', localUri);
    
    // Handle different URI formats
    let fileUri = localUri;
    
    // Remove file:// prefix if present
    if (fileUri.startsWith('file://')) {
      fileUri = fileUri.substring(7);
    }
    
    console.log('Normalized URI to delete:', fileUri);
    
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    console.log('File exists check 1:', fileInfo.exists);
    
    if (fileInfo.exists) {
      // Delete the file
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      console.log('File deleted successfully');
      return true;
    }
    
    // Try with file:// prefix if the first attempt failed
    const fileUriWithPrefix = `file://${fileUri}`;
    console.log('Trying with file:// prefix:', fileUriWithPrefix);
    
    const fileInfoWithPrefix = await FileSystem.getInfoAsync(fileUriWithPrefix);
    console.log('File exists check 2:', fileInfoWithPrefix.exists);
    
    if (fileInfoWithPrefix.exists) {
      await FileSystem.deleteAsync(fileUriWithPrefix, { idempotent: true });
      console.log('File deleted successfully with file:// prefix');
      return true;
    }
    
    // Try one more time with the original URI
    console.log('Trying with original URI:', localUri);
    const originalFileInfo = await FileSystem.getInfoAsync(localUri);
    console.log('File exists check 3:', originalFileInfo.exists);
    
    if (originalFileInfo.exists) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
      console.log('File deleted successfully with original URI');
      return true;
    }
    
    console.log('File does not exist, nothing to delete');
    // Return true anyway since the file doesn't exist
    return true;
  } catch (error) {
    console.error('Error deleting media:', error);
    return false;
  }
};

// Get available directories for saving
export const getAvailableDirectories = async (): Promise<string[]> => {
  if (Platform.OS === 'web') {
    return [DEFAULT_SAVE_DIRECTORY]; // Web doesn't have real directories
  }

  try {
    const docDir = FileSystem.documentDirectory || '';
    const cacheDir = FileSystem.cacheDirectory || '';
    
    const directories = [
      DEFAULT_SAVE_DIRECTORY,
      `${docDir}downloads/`,
      `${cacheDir}saved_status/`,
    ];

    // Ensure all directories exist
    for (const dir of directories) {
      try {
        const dirInfo = await FileSystem.getInfoAsync(dir);
        if (!dirInfo.exists || !dirInfo.isDirectory) {
          await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        }
      } catch (error) {
        console.log(`Error creating directory ${dir}:`, error);
      }
    }

    return directories;
  } catch (error) {
    console.error('Error getting available directories:', error);
    return [DEFAULT_SAVE_DIRECTORY];
  }
};