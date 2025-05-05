import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { Download, Check } from 'lucide-react-native';
import { useMediaStore, MediaItem } from '@/store/media-store';
import { downloadMedia } from '@/utils/file-system';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withDelay,
  withTiming,
  Easing,
  runOnJS
} from 'react-native-reanimated';

interface DownloadButtonProps {
  media: MediaItem;
  size?: number;
  onDownloadComplete?: () => void;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ 
  media, 
  size = 24,
  onDownloadComplete
}) => {
  const { theme } = useThemeStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const { addDownloadedMedia, isDownloaded } = useMediaStore();
  const [downloading, setDownloading] = useState(false);
  const downloaded = isDownloaded(media.id);
  
  // Animation values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);
  const successOpacity = useSharedValue(0);
  
  // Success animation ref
  const successAnimationTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleDownload = async () => {
    if (downloaded || downloading) return;
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Start download animation
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    rotation.value = withSequence(
      withTiming(0.1, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
    
    setDownloading(true);
    
    try {
      const localUri = await downloadMedia(media);
      if (localUri) {
        addDownloadedMedia({ ...media, localUri });
        
        // Success animation
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        // Animate to success state
        opacity.value = withTiming(0, { duration: 200 }, () => {
          successOpacity.value = withTiming(1, { duration: 200 });
        });
        
        scale.value = withSequence(
          withTiming(0.8, { duration: 100 }),
          withTiming(1.2, { duration: 200 }),
          withTiming(1, { duration: 150 })
        );
        
        // Callback if provided
        if (onDownloadComplete) {
          runOnJS(onDownloadComplete)();
        }
      }
    } catch (error) {
      console.error('Error downloading media:', error);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      // Reset animation on error
      opacity.value = 1;
      successOpacity.value = 0;
    } finally {
      setDownloading(false);
    }
  };

  const downloadIconStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: opacity.value },
        { rotate: `${rotation.value * 360}deg` }
      ]
    };
  });

  const successIconStyle = useAnimatedStyle(() => {
    return {
      opacity: successOpacity.value,
      transform: [
        { scale: successOpacity.value }
      ],
      position: 'absolute',
    };
  });

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  if (downloaded) {
    return (
      <Animated.View style={[styles.button, buttonStyle]}>
        <LinearGradient
          colors={[colors.success, colors.success]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Check size={size} color="white" />
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.button, buttonStyle]}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={handleDownload}
        disabled={downloading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.military.primary, colors.military.secondary]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {downloading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <View style={styles.iconContainer}>
              <Animated.View style={downloadIconStyle}>
                <Download size={size} color="white" />
              </Animated.View>
              <Animated.View style={successIconStyle}>
                <Check size={size} color="white" />
              </Animated.View>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  touchable: {
    width: '100%',
    height: '100%',
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default DownloadButton;