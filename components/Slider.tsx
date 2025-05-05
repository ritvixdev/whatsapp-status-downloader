import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface SliderProps {
  value: number;
  onSlidingStart?: () => void;
  onSlidingComplete?: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
}

const Slider: React.FC<SliderProps> = ({
  value = 0,
  onSlidingStart,
  onSlidingComplete,
  minimumTrackTintColor = '#007AFF',
  maximumTrackTintColor = '#EBEBEB',
  thumbTintColor = '#007AFF',
}) => {
  const width = useSharedValue(value);
  const isSeeking = useSharedValue(false);
  const trackWidth = useRef(0);
  const { width: screenWidth } = Dimensions.get('window');

  // Update width when value changes from parent
  useEffect(() => {
    if (!isSeeking.value) {
      width.value = value;
    }
  }, [value, isSeeking.value]);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isSeeking.value = true;
      if (onSlidingStart) {
        runOnJS(onSlidingStart)();
      }
    })
    .onUpdate((e) => {
      // Calculate new position based on the current track width
      const currentTrackWidth = trackWidth.current || screenWidth;
      const newValue = Math.max(0, Math.min(1, width.value + e.translationX / currentTrackWidth));
      width.value = newValue;
    })
    .onEnd(() => {
      isSeeking.value = false;
      if (onSlidingComplete) {
        runOnJS(onSlidingComplete)(width.value);
      }
    });

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      isSeeking.value = true;
      if (onSlidingStart) {
        runOnJS(onSlidingStart)();
      }
    })
    .onEnd((e) => {
      // Calculate position based on tap location
      const currentTrackWidth = trackWidth.current || screenWidth;
      const newValue = Math.max(0, Math.min(1, e.x / currentTrackWidth));
      width.value = withTiming(newValue, { duration: 100 });
      
      isSeeking.value = false;
      if (onSlidingComplete) {
        runOnJS(onSlidingComplete)(newValue);
      }
    });

  const gesture = Gesture.Race(panGesture, tapGesture);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${width.value * 100}%`,
      backgroundColor: minimumTrackTintColor,
    };
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: width.value * (trackWidth.current || 0) },
        { scale: isSeeking.value ? 1.2 : 1 }
      ],
      backgroundColor: thumbTintColor,
      shadowOpacity: isSeeking.value ? 0.3 : 0.2,
    };
  });

  // Function to measure track width
  const onTrackLayout = (event: any) => {
    if (event && event.nativeEvent) {
      trackWidth.current = event.nativeEvent.layout.width;
    }
  };

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.container}>
        <View 
          style={[styles.track, { backgroundColor: maximumTrackTintColor }]}
          onLayout={onTrackLayout}
        >
          <Animated.View style={[styles.progress, progressStyle]} />
        </View>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
    transform: [{ translateX: -8 }],
  },
});

export default Slider;