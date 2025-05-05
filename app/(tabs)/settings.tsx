import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  SafeAreaView,
  Switch,
  ScrollView,
  Linking,
  Platform,
  Alert
} from 'react-native';
import { 
  Moon, 
  Sun, 
  Info, 
  HelpCircle, 
  Heart, 
  ChevronRight,
  Smartphone,
  Folder,
  Trash,
  RefreshCw,
  Clock,
  Bell,
  Shield,
  Share2,
  Star
} from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';
import { useMediaStore } from '@/store/media-store';
import { requestStoragePermission, getWhatsAppStatusMedia } from '@/utils/file-system';
import Colors from '@/constants/colors';
import Text from '@/components/Text';
import StatusBar from '@/components/StatusBar';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsScreen() {
  const { theme, setTheme } = useThemeStore();
  const { downloadedMedia, setStatusMedia } = useMediaStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  const toggleTheme = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const openStorageSettings = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (Platform.OS === 'android') {
      Linking.openSettings();
    }
  };

  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const granted = await requestStoragePermission();
    if (granted) {
      Alert.alert('Success', 'Storage permission granted');
      // Refresh status media after permission granted
      const media = await getWhatsAppStatusMedia();
      setStatusMedia(media);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      Alert.alert('Permission Denied', 'Please grant storage permission in settings');
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const clearStatusCache = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      'Clear Status Cache',
      'This will clear the cached status media list. Your downloads will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setStatusMedia([]);
            Alert.alert('Success', 'Status cache cleared');
            
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }
        }
      ]
    );
  };

  const refreshStatusMedia = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      'Refresh Status Media',
      'This will scan for new WhatsApp status media.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Refresh', 
          onPress: async () => {
            try {
              const media = await getWhatsAppStatusMedia();
              setStatusMedia(media);
              Alert.alert('Success', `Found ${media.length} status media items`);
              
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch (error) {
              console.error('Error refreshing status media:', error);
              Alert.alert('Error', 'Failed to refresh status media');
              
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              }
            }
          }
        }
      ]
    );
  };

  const toggleAutoRefresh = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setAutoRefresh(!autoRefresh);
    
    if (!autoRefresh) {
      Alert.alert(
        'Auto Refresh',
        'Status media will be automatically refreshed when you open the app.',
        [{ text: 'OK' }]
      );
    }
  };

  const shareApp = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (Platform.OS === 'web') {
      Alert.alert('Sharing not available on web');
      return;
    }
    
    const message = "Check out this awesome WhatsApp Status Saver app!";
    Linking.canOpenURL("whatsapp://send").then(supported => {
      if (supported) {
        return Linking.openURL(`whatsapp://send?text=${message}`);
      } else {
        return Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
      }
    });
  };

  const rateApp = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Alert.alert(
      'Rate This App',
      'Thank you for using our app! Your feedback helps us improve.',
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Rate 5 Stars', onPress: () => {
          // This would normally link to the app store
          Alert.alert('Thank You!', 'We appreciate your support!');
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.settingsBackground }]}>
      <StatusBar />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.profileGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileContent}>
              <View style={styles.profileIcon}>
                <Shield size={40} color="white" />
              </View>
              <Text style={styles.profileTitle}>WhatsApp Status Saver</Text>
              <Text style={styles.profileSubtitle}>Save and manage your status media</Text>
            </View>
          </LinearGradient>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text variant="subtitle" style={styles.sectionTitle}>Appearance</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              {theme === 'dark' ? (
                <Moon size={22} color={colors.primary} />
              ) : (
                <Sun size={22} color={colors.primary} />
              )}
              <Text>Dark Mode</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text variant="subtitle" style={styles.sectionTitle}>Storage & Permissions</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={openStorageSettings}
          >
            <View style={styles.settingLeft}>
              <Smartphone size={22} color={colors.primary} />
              <Text>Storage Settings</Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={requestPermission}
          >
            <View style={styles.settingLeft}>
              <Folder size={22} color={colors.primary} />
              <Text>Request Permission</Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={refreshStatusMedia}
          >
            <View style={styles.settingLeft}>
              <RefreshCw size={22} color={colors.primary} />
              <Text>Refresh Status Media</Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText} />
          </TouchableOpacity>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Clock size={22} color={colors.primary} />
              <Text>Auto Refresh</Text>
            </View>
            <Switch
              value={autoRefresh}
              onValueChange={toggleAutoRefresh}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor="#f4f3f4"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={clearStatusCache}
          >
            <View style={styles.settingLeft}>
              <Trash size={22} color={colors.danger} />
              <Text>Clear Status Cache</Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text variant="subtitle" style={styles.sectionTitle}>About & Support</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Info size={22} color={colors.primary} />
              <Text>Version</Text>
            </View>
            <Text variant="caption" color={colors.secondaryText}>1.0.0</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={shareApp}
          >
            <View style={styles.settingLeft}>
              <Share2 size={22} color={colors.primary} />
              <Text>Share App</Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={rateApp}
          >
            <View style={styles.settingLeft}>
              <Star size={22} color={colors.primary} />
              <Text>Rate App</Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
          >
            <View style={styles.settingLeft}>
              <HelpCircle size={22} color={colors.primary} />
              <Text>Help & Support</Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Text variant="caption" color={colors.secondaryText}>
            Downloaded Items: {downloadedMedia.length}
          </Text>
        </View>

        <View style={styles.footerContainer}>
          <View style={styles.madeWithLove}>
            <Text variant="caption" color={colors.secondaryText}>Made with</Text>
            <Heart size={14} color={colors.danger} fill={colors.danger} />
          </View>
          
          <Text variant="caption" color={colors.secondaryText} style={styles.disclaimer}>
            This app is not affiliated with WhatsApp Inc.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileSection: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileGradient: {
    borderRadius: 16,
  },
  profileContent: {
    padding: 24,
    alignItems: 'center',
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  footerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  madeWithLove: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  disclaimer: {
    textAlign: 'center',
  },
});