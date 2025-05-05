import React, { useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Platform,
  LayoutChangeEvent
} from 'react-native';
import { Image, Video, Layers } from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import Text from '@/components/Text';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  Easing,
  runOnJS
} from 'react-native-reanimated';

export type MediaFilterType = 'all' | 'image' | 'video';

interface MediaTypeFilterProps {
  selectedType: MediaFilterType;
  onSelectType: (type: MediaFilterType) => void;
}

const MediaTypeFilter: React.FC<MediaTypeFilterProps> = ({ 
  selectedType, 
  onSelectType 
}) => {
  const { theme } = useThemeStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  // Refs to store tab positions and widths
  const tabPositions = useRef<{ [key: string]: number }>({
    all: 0,
    image: 0,
    video: 0
  });
  const tabWidths = useRef<{ [key: string]: number }>({
    all: 0,
    image: 0,
    video: 0
  });
  
  // Animation values for the indicator
  const indicatorWidth = useSharedValue(0);
  const indicatorPosition = useSharedValue(0);
  const isInitialized = useRef(false);
  
  // Update indicator position when selected type changes
  useEffect(() => {
    if (isInitialized.current && tabPositions.current[selectedType] !== undefined) {
      // Animate to the new position
      indicatorPosition.value = withTiming(tabPositions.current[selectedType], {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      });
      
      // Animate to the new width
      indicatorWidth.value = withTiming(tabWidths.current[selectedType], {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      });
    }
  }, [selectedType]);

  const handleSelect = (type: MediaFilterType) => {
    const hapticFeedback = () => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };
    
    hapticFeedback();
    onSelectType(type);
  };
  
  // Handle tab layout to get position and width
  const handleTabLayout = (type: MediaFilterType, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    tabPositions.current[type] = x;
    tabWidths.current[type] = width;
    
    // Initialize indicator position and width for the selected tab
    if (type === selectedType && !isInitialized.current) {
      indicatorPosition.value = x;
      indicatorWidth.value = width;
      isInitialized.current = true;
    }
  };

  // Animated style for the indicator
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      width: indicatorWidth.value,
      transform: [
        { translateX: indicatorPosition.value }
      ]
    };
  });

  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.tabContainer, 
          { backgroundColor: colors.card, borderColor: colors.border }
        ]}
      >
        {/* Animated indicator */}
        <Animated.View 
          style={[
            styles.indicator, 
            { backgroundColor: colors.primary },
            indicatorStyle
          ]}
        />
        
        {/* All tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleSelect('all')}
          activeOpacity={0.7}
          onLayout={(e) => handleTabLayout('all', e)}
        >
          <Layers 
            size={16} 
            color={selectedType === 'all' ? 'white' : colors.secondaryText} 
          />
          <Text 
            style={[
              styles.tabText,
              { color: selectedType === 'all' ? 'white' : colors.secondaryText }
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        {/* Images tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleSelect('image')}
          activeOpacity={0.7}
          onLayout={(e) => handleTabLayout('image', e)}
        >
          <Image 
            size={16} 
            color={selectedType === 'image' ? 'white' : colors.secondaryText} 
          />
          <Text 
            style={[
              styles.tabText,
              { color: selectedType === 'image' ? 'white' : colors.secondaryText }
            ]}
          >
            Images
          </Text>
        </TouchableOpacity>
        
        {/* Videos tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleSelect('video')}
          activeOpacity={0.7}
          onLayout={(e) => handleTabLayout('video', e)}
        >
          <Video 
            size={16} 
            color={selectedType === 'video' ? 'white' : colors.secondaryText} 
          />
          <Text 
            style={[
              styles.tabText,
              { color: selectedType === 'video' ? 'white' : colors.secondaryText }
            ]}
          >
            Videos
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    height: 36,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  indicator: {
    position: 'absolute',
    height: '100%',
    borderRadius: 16,
    zIndex: 0,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    gap: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MediaTypeFilter;