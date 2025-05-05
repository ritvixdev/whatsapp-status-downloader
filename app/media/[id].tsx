import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform,
  StatusBar as RNStatusBar,
  Share,
  Alert,
  Modal
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  ArrowLeft, 
  Share2, 
  Info, 
  X,
  Trash
} from 'lucide-react-native';
import { useMediaStore, MediaItem } from '@/store/media-store';
import VideoPlayer from '@/components/VideoPlayer';
import DownloadButton from '@/components/DownloadButton';
import SaveToGalleryButton from '@/components/SaveToGalleryButton';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import ImageViewer from '@/components/ImageViewer';
import * as Haptics from 'expo-haptics';
import MediaDetails from '@/components/MediaDetails';
import Text from '@/components/Text';
import { deleteDownloadedMedia } from '@/utils/file-system';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  Easing
} from 'react-native-reanimated';

export default function MediaViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useThemeStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const { statusMedia, downloadedMedia, removeDownloadedMedia } = useMediaStore();
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Animation values
  const deleteScale = useSharedValue(1);
  const deleteOpacity = useSharedValue(1);

  useEffect(() => {
    // Find the media item in either status or downloaded media
    const foundInStatus = statusMedia.find(item => item.id === id);
    const foundInDownloads = downloadedMedia.find(item => item.id === id);
    setMedia(foundInStatus || foundInDownloads || null);
  }, [id, statusMedia, downloadedMedia]);

  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  const handleShare = async () => {
    if (!media) return;
    
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    };
    
    hapticFeedback();
    
    try {
      if (Platform.OS === 'web') {
        Alert.alert('Sharing not available on web');
        return;
      }
      
      const result = await Share.share({
        url: media.localUri || media.uri,
        title: 'Share Status Media',
        message: 'Check out this WhatsApp status!',
      });
      
      if (result.action === Share.sharedAction) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error('Error sharing media:', error);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const toggleDetails = () => {
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };
    
    hapticFeedback();
    
    setShowDetails(!showDetails);
  };

  const handleDelete = async () => {
    if (!media || !media.isDownloaded) return;
    
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
            setIsDeleting(true);
            
            // Start delete animation
            deleteScale.value = withSequence(
              withTiming(0.9, { duration: 100 }),
              withTiming(1.1, { duration: 100 })
            );
            
            deleteOpacity.value = withTiming(0, { 
              duration: 300,
              easing: Easing.inOut(Easing.ease)
            });
            
            try {
              if (media.localUri) {
                console.log('Deleting file:', media.localUri);
                const success = await deleteDownloadedMedia(media.localUri);
                console.log('Delete success:', success);
              }
              removeDownloadedMedia(media.id);
              
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              
              // Wait for animation to complete
              setTimeout(() => {
                router.back();
              }, 300);
            } catch (error) {
              console.error('Error deleting file:', error);
              Alert.alert('Error', 'Failed to delete the file');
              setIsDeleting(false);
              
              // Reset animation
              deleteScale.value = 1;
              deleteOpacity.value = 1;
            }
          }
        }
      ]
    );
  };
  
  // Animated styles
  const deleteButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: deleteScale.value }],
      opacity: deleteOpacity.value
    };
  });

  if (!media) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: 'black' }]}>
        <View style={styles.loadingContainer} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <StatusBar style="light" />
      
      {/* Media Content */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.mediaContainer}
        onPress={toggleControls}
      >
        {media.type === 'image' ? (
          <ImageViewer uri={media.localUri || media.uri} onSingleTap={toggleControls} />
        ) : (
          <VideoPlayer uri={media.localUri || media.uri} />
        )}
      </TouchableOpacity>
      
      {/* Header Controls */}
      {showControls && (
        <SafeAreaView style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.infoButton}
            onPress={toggleDetails}
          >
            <Info size={24} color="white" />
          </TouchableOpacity>
        </SafeAreaView>
      )}
      
      {/* Footer Controls */}
      {showControls && (
        <SafeAreaView style={styles.footer}>
          <View style={styles.footerButtons}>
            <DownloadButton media={media} size={24} />
            
            {Platform.OS !== 'web' && <SaveToGalleryButton media={media} size={24} />}
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.military.secondary }]}
              onPress={handleShare}
            >
              <Share2 size={24} color="white" />
            </TouchableOpacity>
            
            {media.isDownloaded && (
              <Animated.View style={deleteButtonStyle}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.danger }]}
                  onPress={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash size={24} color="white" />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </SafeAreaView>
      )}
      
      {/* Media Details Modal */}
      <Modal
        visible={showDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleDetails}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text variant="title">Media Details</Text>
              <TouchableOpacity onPress={toggleDetails}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <MediaDetails media={media} />
            
            <TouchableOpacity
              style={styles.closeButtonContainer}
              onPress={toggleDetails}
            >
              <View style={[styles.closeButton, { backgroundColor: colors.military.primary }]}>
                <Text style={styles.closeButtonText}>Close</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const StatusBar = ({ style = 'light' }) => (
  <View style={styles.statusBar}>
    {Platform.OS === 'android' && (
      <View style={{ height: RNStatusBar.currentHeight, backgroundColor: 'black' }} />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  mediaContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    gap: 16,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  closeButtonContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});