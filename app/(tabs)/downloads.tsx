import React, { useState, useCallback, useEffect } from 'react';
import { 
  StyleSheet, 
  SafeAreaView, 
  View, 
  TouchableOpacity, 
  Alert,
  Platform,
  Share,
  ActivityIndicator,
  Animated,
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Trash2, 
  CheckSquare, 
  X, 
  Share2, 
  FolderCog, 
  CheckCheck,
  Download
} from 'lucide-react-native';
import { useMediaStore, MediaItem } from '@/store/media-store';
import MediaGrid from '@/components/MediaGrid';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import StatusBar from '@/components/StatusBar';
import * as Haptics from 'expo-haptics';
import EmptyState from '@/components/EmptyState';
import MediaTypeFilter, { MediaFilterType } from '@/components/MediaTypeFilter';
import Text from '@/components/Text';
import { useSettingsStore } from '@/store/settings-store';
import { useFocusEffect } from 'expo-router';
import { deleteDownloadedMedia, getSaveDirectory } from '@/utils/file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef } from 'react';

export default function DownloadsScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  const { downloadedMedia, removeDownloadedMedia, clearAllDownloads } = useMediaStore();
  const { saveDirectory, setSaveDirectory } = useSettingsStore();
  const [mediaType, setMediaType] = useState<MediaFilterType>('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation refs
  const selectionAnim = useRef(new Animated.Value(0)).current;
  const emptyAnim = useRef(new Animated.Value(0)).current;
  
  // Animate selection actions
  useEffect(() => {
    if (selectionMode && selectedItems.length > 0) {
      Animated.spring(selectionAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 7
      }).start();
    } else {
      Animated.timing(selectionAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [selectionMode, selectedItems]);
  
  // Animate empty state
  useEffect(() => {
    if (downloadedMedia.length === 0) {
      Animated.timing(emptyAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else {
      emptyAnim.setValue(0);
    }
  }, [downloadedMedia.length]);

  // Load save directory when screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadSaveDirectory = async () => {
        const dir = await getSaveDirectory();
        setSaveDirectory(dir);
      };
      loadSaveDirectory();
    }, [])
  );

  const handleMediaPress = (item: MediaItem) => {
    if (selectionMode) {
      toggleItemSelection(item.id);
    } else {
      router.push(`/media/${item.id}`);
    }
  };

  const handleClearAll = () => {
    if (downloadedMedia.length === 0) return;
    
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    };
    
    hapticFeedback();
    
    Alert.alert(
      'Clear All Downloads',
      'Are you sure you want to remove all downloaded media? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            // Remove all downloaded media
            for (const item of downloadedMedia) {
              if (item.localUri) {
                await deleteDownloadedMedia(item.localUri);
              }
            }
            clearAllDownloads();
            
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            setIsLoading(false);
          }
        }
      ]
    );
  };

  const handleDelete = async (item: MediaItem) => {
    console.log('Delete initiated for item:', item.id);
    
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    };
    
    hapticFeedback();
    
    Alert.alert(
      'Delete Media',
      'Are you sure you want to remove this media from your downloads?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            console.log('Delete confirmed for item:', item.id);
            setIsLoading(true);
            try {
              if (item.localUri) {
                console.log('Deleting file:', item.localUri);
                const success = await deleteDownloadedMedia(item.localUri);
                console.log('Delete success:', success);
              }
              removeDownloadedMedia(item.id);
              
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              
              Alert.alert('Success', 'Media deleted successfully');
            } catch (error) {
              console.error('Error deleting file:', error);
              Alert.alert('Error', 'Failed to delete the file');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleShare = async (item: MediaItem) => {
    if (Platform.OS === 'web') {
      Alert.alert('Sharing not available on web');
      return;
    }
    
    try {
      const result = await Share.share({
        url: item.localUri || item.uri,
        title: 'Share Media',
        message: 'Check out this media!',
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

  const handleMultiDelete = async () => {
    if (selectedItems.length === 0) return;
    
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    };
    
    hapticFeedback();
    
    Alert.alert(
      'Delete Selected Items',
      `Are you sure you want to delete ${selectedItems.length} selected items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            let successCount = 0;
            let failCount = 0;
            
            for (const id of selectedItems) {
              const item = downloadedMedia.find(item => item.id === id);
              if (item && item.localUri) {
                try {
                  const success = await deleteDownloadedMedia(item.localUri);
                  if (success) {
                    successCount++;
                  } else {
                    failCount++;
                  }
                  removeDownloadedMedia(item.id);
                } catch (error) {
                  console.error('Error deleting file:', error);
                  failCount++;
                }
              }
            }
            
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            
            if (failCount > 0) {
              Alert.alert(
                'Deletion Complete',
                `Successfully deleted ${successCount} items. Failed to delete ${failCount} items.`
              );
            } else {
              Alert.alert(
                'Deletion Complete',
                `Successfully deleted ${successCount} items.`
              );
            }
            
            setSelectionMode(false);
            setSelectedItems([]);
            setIsLoading(false);
          }
        }
      ]
    );
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
      const item = downloadedMedia.find(item => item.id === selectedItems[0]);
      if (item) {
        handleShare(item);
      }
    } else {
      Alert.alert('Multi-Share', 'Sharing multiple items at once is not supported on all devices.');
    }
    
    setSelectionMode(false);
    setSelectedItems([]);
  };

  const handleChangeSaveLocation = () => {
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };
    
    hapticFeedback();
    
    router.push('/folder-selection');
  };

  // Filter media based on selected type
  const filteredMedia = downloadedMedia.filter(item => {
    if (mediaType === 'all') return true;
    return item.type === mediaType;
  });
  
  // Animation styles
  const selectionActionsStyle = {
    transform: [
      {
        translateY: selectionAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [100, 0]
        })
      }
    ],
    opacity: selectionAnim
  };
  
  const emptyStateStyle = {
    opacity: emptyAnim,
    transform: [
      {
        translateY: emptyAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0]
        })
      }
    ]
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.downloadBackground }]}>
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
              {downloadedMedia.length > 0 && (
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
                    onPress={handleChangeSaveLocation}
                    activeOpacity={0.7}
                  >
                    <FolderCog size={20} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.headerButton, { backgroundColor: colors.danger }]} 
                    onPress={handleClearAll}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={20} color="white" />
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </View>
      
      {saveDirectory && (
        <TouchableOpacity 
          style={[styles.saveLocationBar, { 
            backgroundColor: colors.card,
            borderColor: colors.border
          }]}
          onPress={handleChangeSaveLocation}
          activeOpacity={0.7}
        >
          <View style={styles.saveLocationContent}>
            <Text variant="caption" color={colors.secondaryText}>Save Location:</Text>
            <Text 
              numberOfLines={1} 
              ellipsizeMode="middle" 
              style={[styles.saveLocationText, { color: colors.text }]}
            >
              {saveDirectory}
            </Text>
          </View>
          <FolderCog size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
      
      {/* Selection Actions - Animated */}
      {selectionMode && selectedItems.length > 0 && (
        <Animated.View 
          style={[
            styles.selectionActionsContainer, 
            selectionActionsStyle,
            { bottom: insets.bottom + 20 }
          ]}
        >
          <LinearGradient
            colors={[colors.military.primary, colors.military.secondary]}
            style={styles.selectionActions}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
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
            
            <TouchableOpacity 
              style={styles.selectionAction}
              onPress={handleMultiDelete}
              activeOpacity={0.7}
            >
              <Trash2 size={24} color="white" />
              <Text style={styles.selectionActionText}>Delete</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      )}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Processing...
          </Text>
        </View>
      ) : downloadedMedia.length === 0 ? (
        <Animated.View style={[{ flex: 1 }, emptyStateStyle]}>
          <EmptyState
            title="No Downloads Yet"
            description="Save status media to see them here. Go to the Status tab to find and download media."
            icon={<Download size={40} color="white" />}
          />
        </Animated.View>
      ) : (
        <MediaGrid
          data={filteredMedia}
          onMediaPress={handleMediaPress}
          emptyText={
            mediaType === 'all'
              ? "No downloaded media yet. Save status media to see them here."
              : `No downloaded ${mediaType} files found.`
          }
          showActions={true}
          onShare={handleShare}
          onDelete={handleDelete}
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
  saveLocationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  saveLocationContent: {
    flex: 1,
  },
  saveLocationText: {
    marginTop: 2,
    fontSize: 13,
  },
  selectionCount: {
    marginRight: 'auto',
    fontWeight: '600',
    fontSize: 15,
  },
  selectionActionsContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
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
});