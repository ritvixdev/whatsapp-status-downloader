import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert,
  Platform,
  Linking,
  Share,
  ActivityIndicator,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  RefreshCw, 
  DownloadCloud, 
  CheckSquare, 
  X, 
  Share2, 
  CheckCheck 
} from 'lucide-react-native';
import { useMediaStore, MediaItem } from '@/store/media-store';
import { 
  getWhatsAppStatusMedia, 
  requestStoragePermission, 
  checkStoragePermission,
  downloadMedia
} from '@/utils/file-system';
import MediaGrid from '@/components/MediaGrid';
import PermissionRequest from '@/components/PermissionRequest';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import StatusBar from '@/components/StatusBar';
import * as Haptics from 'expo-haptics';
import EmptyState from '@/components/EmptyState';
import MediaTypeFilter from '@/components/MediaTypeFilter';
import Text from '@/components/Text';
import { LinearGradient } from 'expo-linear-gradient';

export default function StatusScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const { statusMedia, setStatusMedia, addDownloadedMedia, isDownloaded } = useMediaStore();
  const [refreshing, setRefreshing] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [isLoading, setIsLoading] = useState(true);
  const [showBatchDownload, setShowBatchDownload] = useState(false);
  const [mediaType, setMediaType] = useState<'all' | 'image' | 'video'>('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Animation for the batch download button
  const batchDownloadAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (showBatchDownload) {
      Animated.spring(batchDownloadAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 7
      }).start();
    } else {
      Animated.timing(batchDownloadAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [showBatchDownload]);

  const checkPermission = useCallback(async () => {
    if (Platform.OS === 'web') {
      setPermissionStatus('granted');
      return true;
    }
    
    try {
      const hasPermission = await checkStoragePermission();
      console.log('Permission status:', hasPermission ? 'granted' : 'denied');
      setPermissionStatus(hasPermission ? 'granted' : 'denied');
      return hasPermission;
    } catch (error) {
      console.error('Error checking permission:', error);
      setPermissionStatus('denied');
      return false;
    }
  }, []);

  const loadStatusMedia = useCallback(async () => {
    try {
      setIsLoading(true);
      const hasPermission = await checkPermission();
      
      if (hasPermission) {
        console.log('Loading status media...');
        const media = await getWhatsAppStatusMedia();
        console.log(`Loaded ${media.length} status media items`);
        setStatusMedia(media);
      }
    } catch (error) {
      console.error('Error loading status media:', error);
      Alert.alert('Error', 'Failed to load status media. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [checkPermission, setStatusMedia]);

  const handleRequestPermission = async () => {
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    };
    
    hapticFeedback();
    
    if (permissionStatus === 'denied' && Platform.OS === 'android') {
      Alert.alert(
        'Storage Permission Required',
        'To access WhatsApp status media, please grant storage permission in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => Linking.openSettings() 
          }
        ]
      );
    } else {
      const granted = await requestStoragePermission();
      setPermissionStatus(granted ? 'granted' : 'denied');
      
      if (granted) {
        loadStatusMedia();
      }
    }
  };

  const handleRefresh = useCallback(async () => {
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };
    
    hapticFeedback();
    
    setRefreshing(true);
    await loadStatusMedia();
    setRefreshing(false);
  }, [loadStatusMedia]);

  useEffect(() => {
    checkPermission().then(hasPermission => {
      if (hasPermission) {
        loadStatusMedia();
      }
    });
  }, [checkPermission, loadStatusMedia]);

  const handleMediaPress = (item: MediaItem) => {
    if (selectionMode) {
      toggleItemSelection(item.id);
    } else {
      router.push(`/media/${item.id}`);
    }
  };

  const toggleBatchDownload = () => {
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };
    
    hapticFeedback();
    
    setShowBatchDownload(!showBatchDownload);
  };

  const handleDownload = async (item: MediaItem) => {
    if (isDownloaded(item.id)) return;
    
    try {
      const localUri = await downloadMedia(item);
      if (localUri) {
        addDownloadedMedia({ ...item, localUri });
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        Alert.alert('Success', 'Media saved to downloads');
      }
    } catch (error) {
      console.error('Error downloading media:', error);
      Alert.alert('Error', 'Failed to download media');
    }
  };

  const handleShare = async (item: MediaItem) => {
    if (Platform.OS === 'web') {
      Alert.alert('Sharing not available on web');
      return;
    }
    
    try {
      const result = await Share.share({
        url: item.uri,
        title: 'Share Status',
        message: 'Check out this WhatsApp status!',
      });
      
      if (result.action === Share.sharedAction) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error('Error sharing media:', error);
      Alert.alert('Error', 'Failed to share media');
    }
  };

  // Multi-selection functions
  const toggleSelectionMode = () => {
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    };
    
    hapticFeedback();
    
    setSelectionMode(!selectionMode);
    setSelectedItems([]);
  };

  const toggleItemSelection = (id: string) => {
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };
    
    hapticFeedback();
    
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    };
    
    hapticFeedback();
    
    // If all items are already selected, deselect all
    if (selectedItems.length === filteredMedia.length) {
      setSelectedItems([]);
    } else {
      // Otherwise, select all filtered items
      setSelectedItems(filteredMedia.map(item => item.id));
    }
  };

  const handleMultiDownload = async () => {
    if (selectedItems.length === 0) return;
    
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    };
    
    hapticFeedback();
    
    const selectedMedia = statusMedia.filter(item => selectedItems.includes(item.id));
    let successCount = 0;
    
    for (const item of selectedMedia) {
      if (!isDownloaded(item.id)) {
        try {
          const localUri = await downloadMedia(item);
          if (localUri) {
            addDownloadedMedia({ ...item, localUri });
            successCount++;
          }
        } catch (error) {
          console.error('Error downloading media:', error);
        }
      }
    }
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Alert.alert('Batch Download Complete', `Successfully downloaded ${successCount} items.`);
    setSelectionMode(false);
    setSelectedItems([]);
  };

  const handleMultiShare = async () => {
    if (selectedItems.length === 0) return;
    
    if (Platform.OS === 'web') {
      Alert.alert('Sharing not available on web');
      return;
    }
    
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    };
    
    hapticFeedback();
    
    if (selectedItems.length === 1) {
      const item = statusMedia.find(item => item.id === selectedItems[0]);
      if (item) {
        handleShare(item);
      }
    } else {
      Alert.alert('Multi-Share', 'Sharing multiple items at once is not supported on all devices.');
    }
    
    setSelectionMode(false);
    setSelectedItems([]);
  };

  // Filter media based on selected type
  const filteredMedia = statusMedia.filter(item => {
    if (mediaType === 'all') return true;
    return item.type === mediaType;
  });

  // Animation styles for batch download button
  const batchDownloadStyle = {
    transform: [
      {
        translateY: batchDownloadAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [100, 0]
        })
      }
    ],
    opacity: batchDownloadAnim
  };

  // If permission is not granted, show permission request screen
  if (permissionStatus !== 'granted' && Platform.OS !== 'web') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.statusBackground }]}>
        <StatusBar />
        <PermissionRequest
          onRequestPermission={handleRequestPermission}
          permissionStatus={permissionStatus}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.statusBackground }]}>
      <StatusBar />
      
      <View style={styles.header}>
        <MediaTypeFilter 
          selectedType={mediaType}
          onSelectType={setMediaType}
        />
        
        <View style={styles.headerButtons}>
          {selectionMode ? (
            <>
              <TouchableOpacity 
                style={[styles.headerButton, { backgroundColor: colors.military.primary }]} 
                onPress={handleSelectAll}
                activeOpacity={0.7}
              >
                <CheckCheck size={20} color="white" />
              </TouchableOpacity>
              
              <Text style={[styles.selectionCount, { color: colors.text }]}>
                {selectedItems.length} selected
              </Text>
              
              <TouchableOpacity 
                style={[styles.headerButton, { backgroundColor: colors.danger }]} 
                onPress={toggleSelectionMode}
                activeOpacity={0.7}
              >
                <X size={20} color="white" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.headerButton, { backgroundColor: colors.military.secondary }]} 
                onPress={toggleSelectionMode}
                activeOpacity={0.7}
              >
                <CheckSquare size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.headerButton, { backgroundColor: colors.military.primary }]} 
                onPress={toggleBatchDownload}
                activeOpacity={0.7}
              >
                <DownloadCloud size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.headerButton, { backgroundColor: colors.primary }]} 
                onPress={handleRefresh}
                disabled={refreshing || isLoading}
                activeOpacity={0.7}
              >
                <RefreshCw size={20} color="white" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      
      {selectionMode && selectedItems.length > 0 && (
        <View style={styles.selectionActionsContainer}>
          <LinearGradient
            colors={[colors.military.primary, colors.military.secondary]}
            style={styles.selectionActions}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity 
              style={styles.selectionAction}
              onPress={handleMultiDownload}
              activeOpacity={0.7}
            >
              <DownloadCloud size={24} color="white" />
              <Text style={styles.selectionActionText}>Download</Text>
            </TouchableOpacity>
            
            {Platform.OS !== 'web' && (
              <TouchableOpacity 
                style={styles.selectionAction}
                onPress={handleMultiShare}
                activeOpacity={0.7}
              >
                <Share2 size={24} color="white" />
                <Text style={styles.selectionActionText}>Share</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>
      )}
      
      {showBatchDownload && (
        <Animated.View style={[styles.batchDownloadContainer, batchDownloadStyle]}>
          <TouchableOpacity
            style={styles.batchDownloadButton}
            onPress={() => {
              const itemsToDownload = filteredMedia.filter(item => !isDownloaded(item.id));
              if (itemsToDownload.length === 0) {
                Alert.alert('No new media', 'All media has already been downloaded.');
                setShowBatchDownload(false);
                return;
              }
              
              Alert.alert(
                'Download All',
                `Download all ${itemsToDownload.length} items?`,
                [
                  { text: 'Cancel', style: 'cancel', onPress: () => setShowBatchDownload(false) },
                  { 
                    text: 'Download', 
                    onPress: async () => {
                      setShowBatchDownload(false);
                      let successCount = 0;
                      setIsLoading(true);
                      
                      for (const item of itemsToDownload) {
                        try {
                          const localUri = await downloadMedia(item);
                          if (localUri) {
                            addDownloadedMedia({ ...item, localUri });
                            successCount++;
                          }
                        } catch (error) {
                          console.error('Error in batch download:', error);
                        }
                      }
                      
                      setIsLoading(false);
                      if (Platform.OS !== 'web') {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      }
                      
                      Alert.alert('Download Complete', `Successfully downloaded ${successCount} items.`);
                    }
                  }
                ]
              );
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.military.primary, colors.military.secondary]}
              style={styles.batchDownloadGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <DownloadCloud size={20} color="white" />
              <Text style={styles.batchDownloadText}>
                Download All {filteredMedia.filter(item => !isDownloaded(item.id)).length} Items
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Scanning for status media...
          </Text>
        </View>
      ) : statusMedia.length === 0 ? (
        <EmptyState
          title="No Status Media Found"
          description="Make sure WhatsApp is installed and you've viewed some status updates recently."
          actionLabel="Refresh"
          onAction={handleRefresh}
        />
      ) : (
        <MediaGrid
          data={filteredMedia}
          onMediaPress={handleMediaPress}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          emptyText={
            mediaType === 'all'
              ? "No WhatsApp status media found. Make sure WhatsApp is installed and you've viewed some status updates recently."
              : `No ${mediaType} files found in your status.`
          }
          showActions={true}
          onDownload={handleDownload}
          onShare={handleShare}
          selectionMode={selectionMode}
          selectedItems={selectedItems}
          onToggleSelection={toggleItemSelection}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectionCount: {
    marginRight: 'auto',
    fontWeight: '600',
    fontSize: 15,
  },
  selectionActionsContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderRadius: 16,
  },
  selectionAction: {
    alignItems: 'center',
    gap: 8,
  },
  selectionActionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  batchDownloadContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  batchDownloadButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  batchDownloadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    gap: 8,
  },
  batchDownloadText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});