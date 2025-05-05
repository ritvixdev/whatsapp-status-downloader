import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Image, RefreshCw } from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import Text from '@/components/Text';
import { LinearGradient } from 'expo-linear-gradient';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction
}) => {
  const { theme } = useThemeStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.iconBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {icon || <Image size={40} color="white" />}
        </LinearGradient>
      </View>
      
      <Text variant="title" style={styles.title}>
        {title}
      </Text>
      
      <Text variant="body" color={colors.secondaryText} style={styles.description}>
        {description}
      </Text>
      
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onAction}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <RefreshCw size={16} color="white" />
            <Text style={styles.buttonText}>
              {actionLabel}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptyState;