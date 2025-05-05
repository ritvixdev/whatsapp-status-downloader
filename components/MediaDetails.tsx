import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Calendar, FileText, Clock, FileImage, FileVideo } from 'lucide-react-native';
import { MediaItem } from '@/store/media-store';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import Text from '@/components/Text';

interface MediaDetailsProps {
  media: MediaItem;
}

const MediaDetails: React.FC<MediaDetailsProps> = ({ media }) => {
  const { theme } = useThemeStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.card }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FileText size={20} color={colors.primary} />
          <Text variant="subtitle">File Information</Text>
        </View>
        
        <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
          <Text color={colors.secondaryText}>Filename</Text>
          <Text>{media.filename}</Text>
        </View>
        
        <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
          <Text color={colors.secondaryText}>Type</Text>
          <View style={styles.typeContainer}>
            {media.type === 'image' ? (
              <FileImage size={16} color={colors.primary} />
            ) : (
              <FileVideo size={16} color={colors.primary} />
            )}
            <Text>{media.type === 'image' ? 'Image' : 'Video'}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Text color={colors.secondaryText}>Status</Text>
          <Text style={{ color: media.isDownloaded ? colors.success : colors.secondaryText }}>
            {media.isDownloaded ? 'Downloaded' : 'Not Downloaded'}
          </Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Calendar size={20} color={colors.primary} />
          <Text variant="subtitle">Date & Time</Text>
        </View>
        
        <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
          <Text color={colors.secondaryText}>Date</Text>
          <Text>{formatDate(media.timestamp)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text color={colors.secondaryText}>Time</Text>
          <Text>{formatTime(media.timestamp)}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={20} color={colors.primary} />
          <Text variant="subtitle">Time Since Creation</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text color={colors.secondaryText}>Age</Text>
          <Text>{getTimeAgo(media.timestamp)}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

// Helper function to get time ago string
const getTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} years ago`;
  if (interval === 1) return '1 year ago';
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} months ago`;
  if (interval === 1) return '1 month ago';
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days ago`;
  if (interval === 1) return '1 day ago';
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} hours ago`;
  if (interval === 1) return '1 hour ago';
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutes ago`;
  if (interval === 1) return '1 minute ago';
  
  if (seconds < 10) return 'just now';
  return `${Math.floor(seconds)} seconds ago`;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    maxHeight: 300,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

export default MediaDetails;