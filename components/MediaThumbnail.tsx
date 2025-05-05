import React from 'react';
import { StyleSheet, TouchableOpacity, View, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Play, Check, Download, Share2, Trash, CheckCircle } from 'lucide-react-native';
import { MediaItem } from '@/store/media-store';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, withSpring } from 'react-native-reanimated';

interface MediaThumbnailProps {
  item: MediaItem;
  onPress: () => void;
  width: number;
  height: number;
  onDownload?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

const MediaThumbnail: React.FC<MediaThumbnailProps> = ({ 
  item, 
  onPress, 
  width, 
  height,
  onDownload,
  onShare,
  onDelete,
  showActions = false,
  selectionMode = false,
  isSelected = false,
  onToggleSelection
}) => {
  const { theme } = useThemeStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  const handleActionPress = (action: () => void | undefined) => {
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };
    
    hapticFeedback();
    action && action();
  };

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 200 }, () => {
      scale.value = withSpring(1);
    });
    
    if (selectionMode && onToggleSelection) {
      onToggleSelection();
    } else {
      onPress();
    }
  };

  const handleLongPress = () => {
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    };
    
    hapticFeedback();
    
    if (onToggleSelection) {
      onToggleSelection();
    }
  };

  const handleDeletePress = () => {
    if (!onDelete) return;
    
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    };
    
    hapticFeedback();
    
    Alert.alert(
      'Delete Media',
      'Are you sure you want to delete this media?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            console.log('Delete confirmed for item:', item.id);
            onDelete();
          }
        }
      ]
    );
  };
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });
  
  const selectionStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isSelected ? 1 : 0, { duration: 200 }),
      transform: [
        { scale: withTiming(isSelected ? 1 : 0.8, { duration: 200 }) }
      ]
    };
  });

  return (
    <Animated.View style={[
      styles.container,
      { width, height, margin: 0 },
      animatedStyle
    ]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={200}
        style={styles.touchable}
      >
        <Image
          source={{ uri: item.localUri || item.uri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          placeholder={{ color: colors.border }}
        />
        
        {item.type === 'video' && (
          <View style={styles.videoIndicator}>
            <Play size={18} color="white" />
          </View>
        )}
        
        {item.isDownloaded && !showActions && !selectionMode && (
          <View style={[styles.downloadedIndicator, { backgroundColor: colors.success }]}>
            <Check size={10} color="white" />
          </View>
        )}

        {selectionMode && (
          <View style={[
            styles.selectionOverlay,
            isSelected ? { backgroundColor: 'rgba(0,0,0,0.4)' } : {}
          ]}>
            <Animated.View style={[
              styles.selectionIndicator, 
              { backgroundColor: colors.primary },
              selectionStyle
            ]}>
              <CheckCircle size={24} color="white" />
            </Animated.View>
          </View>
        )}

        {showActions && !selectionMode && (
          <View style={styles.actionsOverlay}>
            {onDownload && !item.isDownloaded && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.military.primary }]}
                onPress={() => handleActionPress(onDownload)}
              >
                <Download size={16} color="white" />
              </TouchableOpacity>
            )}
            
            {onShare && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.military.secondary }]}
                onPress={() => handleActionPress(onShare)}
              >
                <Share2 size={16} color="white" />
              </TouchableOpacity>
            )}
            
            {onDelete && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.danger }]}
                onPress={handleDeletePress}
              >
                <Trash size={16} color="white" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  touchable: {
    width: '100%',
    height: '100%',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  selectionIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MediaThumbnail;