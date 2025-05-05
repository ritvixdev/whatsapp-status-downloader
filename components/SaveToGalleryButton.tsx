import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, Platform, View, Alert } from 'react-native';
import { Save, Check } from 'lucide-react-native';
import { MediaItem } from '@/store/media-store';
import { saveToGallery } from '@/utils/file-system';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withDelay,
  withTiming,
  Easing
} from 'react-native-reanimated';

interface SaveToGalleryButtonProps {
  media: MediaItem;
  size?: number;
}

const SaveToGalleryButton: React.FC<SaveToGalleryButtonProps> = ({ media, size = 24 }) => {
  const { theme } = useThemeStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Animation values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);
  const successOpacity = useSharedValue(0);
  
  // Success animation ref
  const successAnimationTimeout = useRef<NodeJS.Timeout | null>(null);

  // Not available on web
  if (Platform.OS === 'web') {
    return null;
  }

  const handleSave = async () => {
    if (saved || saving) return;
    
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    };
    
    hapticFeedback();
    
    // Start save animation
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    rotation.value = withSequence(
      withTiming(0.1, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
    
    setSaving(true);
    
    try {
      const success = await saveToGallery(media.localUri || media.uri);
      if (success) {
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
        
        setSaved(true);
        
        Alert.alert('Success', 'Media saved to gallery');
        
        // Reset saved status after 2 seconds
        successAnimationTimeout.current = setTimeout(() => {
          // Animate back to normal state
          successOpacity.value = withTiming(0, { duration: 200 }, () => {
            opacity.value = withTiming(1, { duration: 200 });
          });
          setSaved(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving to gallery:', error);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      Alert.alert('Error', 'Failed to save to gallery');
      
      // Reset animation on error
      opacity.value = 1;
      successOpacity.value = 0;
    } finally {
      setSaving(false);
    }
  };

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  const saveIconStyle = useAnimatedStyle(() => {
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

  return (
    <Animated.View style={[styles.button, buttonStyle]}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={handleSave}
        disabled={saving || saved}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[
            saved ? colors.success : colors.military.accent, 
            saved ? colors.success : colors.military.secondary
          ]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {saving ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <View style={styles.iconContainer}>
              <Animated.View style={saveIconStyle}>
                <Save size={size} color="white" />
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

export default SaveToGalleryButton;