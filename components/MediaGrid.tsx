import React from 'react';
import { 
  StyleSheet, 
  FlatList, 
  View, 
  Dimensions, 
  RefreshControl,
  ActivityIndicator,
  Platform
} from 'react-native';
import { MediaItem } from '@/store/media-store';
import MediaThumbnail from './MediaThumbnail';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import { Image } from 'lucide-react-native';
import Text from './Text';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

interface MediaGridProps {
  data: MediaItem[];
  onMediaPress: (item: MediaItem) => void;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  emptyText?: string;
  isLoading?: boolean;
  showActions?: boolean;
  onDownload?: (item: MediaItem) => void;
  onShare?: (item: MediaItem) => void;
  onDelete?: (item: MediaItem) => void;
  selectionMode?: boolean;
  selectedItems?: string[];
  onToggleSelection?: (id: string) => void;
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const MediaGrid: React.FC<MediaGridProps> = ({ 
  data, 
  onMediaPress, 
  onRefresh, 
  refreshing = false,
  emptyText = "No media found",
  isLoading = false,
  showActions = false,
  onDownload,
  onShare,
  onDelete,
  selectionMode = false,
  selectedItems = [],
  onToggleSelection
}) => {
  const { theme } = useThemeStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const numColumns = 3;
  const screenWidth = Dimensions.get('window').width;
  const spacing = 4;
  const itemWidth = (screenWidth - (numColumns + 1) * spacing) / numColumns;

  if (isLoading) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Loading media...
        </Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Image size={64} color={colors.secondaryText} />
        <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
          {emptyText}
        </Text>
      </View>
    );
  }

  const handleItemDownload = (item: MediaItem) => {
    if (onDownload) {
      onDownload(item);
    }
  };

  const handleItemShare = (item: MediaItem) => {
    if (onShare) {
      onShare(item);
    }
  };

  const handleItemDelete = (item: MediaItem) => {
    if (onDelete) {
      onDelete(item);
    }
  };

  const handleItemSelection = (id: string) => {
    if (onToggleSelection) {
      onToggleSelection(id);
    }
  };

  return (
    <AnimatedFlatList
      data={data}
      numColumns={numColumns}
      renderItem={({ item, index }) => {
        // Use different animation delays for a staggered effect
        const delay = Platform.OS === 'web' ? 0 : Math.min(index * 50, 500);
        
        return (
          <Animated.View
            entering={FadeIn.delay(delay).duration(300)}
            layout={Layout.springify()}
          >
            <MediaThumbnail
              item={item}
              onPress={() => onMediaPress(item)}
              width={itemWidth}
              height={itemWidth}
              showActions={showActions}
              onDownload={onDownload ? () => handleItemDownload(item) : undefined}
              onShare={onShare ? () => handleItemShare(item) : undefined}
              onDelete={onDelete ? () => handleItemDelete(item) : undefined}
              selectionMode={selectionMode}
              isSelected={selectedItems.includes(item.id)}
              onToggleSelection={() => handleItemSelection(item.id)}
            />
          </Animated.View>
        );
      }}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background }
      ]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary, colors.secondary]}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ height: spacing }} />}
      columnWrapperStyle={{ gap: spacing }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
    minHeight: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    maxWidth: '80%',
    lineHeight: 22,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default MediaGrid;