import React from 'react';
import { StyleSheet, View, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Image } from 'expo-image';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Platform } from 'react-native';

interface ImageViewerProps {
  uri: string;
  onSingleTap?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_SCALE = 1;
const MAX_SCALE = 5;

const ImageViewer: React.FC<ImageViewerProps> = ({ uri, onSingleTap }) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const lastTap = useSharedValue(0);

  const handleSingleTap = () => {
    if (onSingleTap) {
      onSingleTap();
    }
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < MIN_SCALE) {
        scale.value = withTiming(MIN_SCALE);
        savedScale.value = MIN_SCALE;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow panning when zoomed in
      if (scale.value > 1) {
        // Calculate max pan distance based on current scale
        const maxX = (scale.value * SCREEN_WIDTH - SCREEN_WIDTH) / 2;
        const maxY = (scale.value * SCREEN_HEIGHT - SCREEN_HEIGHT) / 2;
        
        // Limit panning to the bounds of the image
        translateX.value = Math.min(maxX, Math.max(-maxX, savedTranslateX.value + e.translationX));
        translateY.value = Math.min(maxY, Math.max(-maxY, savedTranslateY.value + e.translationY));
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(1)
    .onStart(() => {
      const now = Date.now();
      if (now - lastTap.value < 300) {
        // Double tap detected, handled by doubleTapGesture
        return;
      }
      lastTap.value = now;
    })
    .onEnd(() => {
      const now = Date.now();
      if (now - lastTap.value > 250) {
        // This is a single tap
        runOnJS(handleSingleTap)();
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      if (scale.value > 1) {
        // Reset to normal size
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        // Zoom to 2x at the tap position
        scale.value = withTiming(2);
        savedScale.value = 2;
      }
    });

  // For web compatibility
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={handleSingleTap}>
          <Image
            source={{ uri }}
            style={styles.image}
            contentFit="contain"
          />
        </TouchableWithoutFeedback>
      </View>
    );
  }

  const composed = Gesture.Simultaneous(
    Gesture.Exclusive(doubleTapGesture, tapGesture),
    Gesture.Simultaneous(pinchGesture, panGesture)
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <Image
            source={{ uri }}
            style={styles.image}
            contentFit="contain"
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default ImageViewer;