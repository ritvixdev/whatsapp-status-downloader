import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { Folder, Lock } from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import Text from '@/components/Text';
import { LinearGradient } from 'expo-linear-gradient';

interface PermissionRequestProps {
  onRequestPermission: () => void;
  permissionStatus: 'granted' | 'denied' | 'undetermined';
}

const PermissionRequest: React.FC<PermissionRequestProps> = ({ 
  onRequestPermission, 
  permissionStatus 
}) => {
  const { theme } = useThemeStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={permissionStatus === 'denied' 
            ? ['#ff6b6b', '#ff8787'] 
            : [colors.primary, colors.secondary]}
          style={styles.iconBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {permissionStatus === 'denied' ? (
            <Lock size={60} color="white" />
          ) : (
            <Folder size={60} color="white" />
          )}
        </LinearGradient>
      </View>
      
      <Text variant="title" style={styles.title}>
        {permissionStatus === 'denied' 
          ? "Storage Access Denied" 
          : "Storage Access Required"}
      </Text>
      
      <Text variant="body" color={colors.secondaryText} style={styles.description}>
        {permissionStatus === 'denied' 
          ? "We need permission to access your storage to find WhatsApp status media. Please enable storage permission in your device settings."
          : "To view WhatsApp status media, we need permission to access your device storage. Your media will never leave your device."}
      </Text>
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onRequestPermission}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>
            {permissionStatus === 'denied' 
              ? "Open Settings" 
              : "Grant Permission"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <View style={[styles.locationContainer, { backgroundColor: colors.card }]}>
        <Text variant="subtitle" style={styles.locationTitle}>
          We look for status media in:
        </Text>
        <Text variant="caption" color={colors.secondaryText} style={styles.locationPath}>
          • Internal Storage / WhatsApp / Media / .Statuses
        </Text>
        <Text variant="caption" color={colors.secondaryText} style={styles.locationPath}>
          • WhatsApp/Media/WhatsApp Images/Status
        </Text>
        <Text variant="caption" color={colors.secondaryText} style={styles.locationPath}>
          • WhatsApp/Media/WhatsApp Video/Status
        </Text>
        <Text variant="caption" color={colors.secondaryText} style={styles.locationPath}>
          • And several other potential locations
        </Text>
      </View>
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
    width: 120,
    height: 120,
    borderRadius: 60,
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
    marginBottom: 32,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  locationContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationTitle: {
    marginBottom: 12,
  },
  locationPath: {
    marginBottom: 8,
  },
});

export default PermissionRequest;