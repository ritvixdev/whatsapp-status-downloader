import React, { useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform,
  View
} from 'react-native';
import { DownloadCloud } from 'lucide-react-native';
import { useMediaStore, MediaItem } from '@/store/media-store';
import { downloadMedia } from '@/utils/file-system';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import Text from '@/components/Text';
import { LinearGradient } from 'expo-linear-gradient';

interface BatchDownloadButtonProps {
  mediaItems: MediaItem[];
  onComplete?: () => void;
}

const BatchDownloadButton: React.FC<BatchDownloadButtonProps> = ({ 
  mediaItems,
  onComplete
}) => {
  const { theme } = useThemeStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const { addDownloadedMedia, isDownloaded } = useMediaStore();
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Filter out already downloaded items
  const itemsToDownload = mediaItems.filter(item => !isDownloaded(item.id));

  if (itemsToDownload.length === 0) {
    return null;
  }

  const handleBatchDownload = async () => {
    if (downloading) return;
    
    const hapticFeedback = Platform.select({
      web: () => {},
      default: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    });
    
    hapticFeedback();
    
    setDownloading(true);
    setProgress(0);
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < itemsToDownload.length; i++) {
      try {
        const item = itemsToDownload[i];
        const localUri = await downloadMedia(item);
        
        if (localUri) {
          addDownloadedMedia({ ...item, localUri });
          successCount++;
        } else {
          failCount++;
        }
        
        // Update progress
        setProgress(Math.round(((i + 1) / itemsToDownload.length) * 100));
      } catch (error) {
        console.error('Error in batch download:', error);
        failCount++;
      }
    }
    
    setDownloading(false);
    
    const notifyResult = Platform.select({
      web: () => {},
      default: () => Haptics.notificationAsync(
        successCount > 0 
          ? Haptics.NotificationFeedbackType.Success 
          : Haptics.NotificationFeedbackType.Error
      )
    });
    
    notifyResult();
    
    // Show completion alert
    Alert.alert(
      'Batch Download Complete',
      `Successfully downloaded ${successCount} items${failCount > 0 ? `, ${failCount} failed` : ''}.`,
      [{ text: 'OK' }]
    );
    
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleBatchDownload}
        disabled={downloading}
      >
        <LinearGradient
          colors={[colors.military.primary, colors.military.secondary]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {downloading ? (
            <>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.progressText}>{progress}%</Text>
            </>
          ) : (
            <>
              <DownloadCloud size={20} color="white" />
              <Text style={styles.buttonText}>
                Download All ({itemsToDownload.length})
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    width: '100%',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default BatchDownloadButton;