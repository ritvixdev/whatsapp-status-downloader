import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Folder, Check, Plus, Save, ArrowLeft } from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import Text from '@/components/Text';
import * as FileSystem from 'expo-file-system';
import { getAvailableDirectories, DEFAULT_SAVE_DIRECTORY } from '@/utils/file-system';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store/settings-store';
import { LinearGradient } from 'expo-linear-gradient';

export default function FolderSelectionScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const { saveDirectory, setSaveDirectory } = useSettingsStore();
  const [directories, setDirectories] = useState<string[]>([]);
  const [selectedDirectory, setSelectedDirectory] = useState<string>(saveDirectory || DEFAULT_SAVE_DIRECTORY);
  const [isLoading, setIsLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  useEffect(() => {
    const loadDirectories = async () => {
      try {
        const dirs = await getAvailableDirectories();
        setDirectories(dirs);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading directories:', error);
        setIsLoading(false);
      }
    };
    
    loadDirectories();
  }, []);

  const handleSelectDirectory = (directory: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedDirectory(directory);
  };

  const handleSaveSelection = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Save the selected directory to settings store
    setSaveDirectory(selectedDirectory);
    
    Alert.alert(
      'Save Location Updated',
      'Media will now be saved to the selected location.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleCreateNewFolder = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setShowNewFolderInput(true);
  };

  const handleAddNewFolder = async () => {
    if (!newFolderName.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    try {
      // Create a new folder path
      const docDir = FileSystem.documentDirectory || '';
      const newFolderPath = `${docDir}${newFolderName.trim()}/`;
      
      // Create the directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(newFolderPath);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(newFolderPath, { intermediates: true });
      }
      
      // Add to the list and select it
      setDirectories([...directories, newFolderPath]);
      setSelectedDirectory(newFolderPath);
      setNewFolderName('');
      setShowNewFolderInput(false);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error creating directory:', error);
      Alert.alert('Error', 'Failed to create directory');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading available directories...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text variant="title">Select Save Location</Text>
      </View>
      
      <View style={styles.currentLocationContainer}>
        <Text variant="subtitle" style={styles.currentLocationTitle}>Current Location:</Text>
        <View style={[styles.currentLocationBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Folder size={20} color={colors.primary} />
          <Text 
            numberOfLines={1} 
            ellipsizeMode="middle"
            style={styles.currentLocationPath}
          >
            {saveDirectory || DEFAULT_SAVE_DIRECTORY}
          </Text>
        </View>
      </View>
      
      <FlatList
        data={directories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.directoryItem,
              { 
                backgroundColor: selectedDirectory === item ? colors.primary + '20' : colors.card,
                borderColor: selectedDirectory === item ? colors.primary : colors.border
              }
            ]}
            onPress={() => handleSelectDirectory(item)}
          >
            <View style={styles.directoryInfo}>
              <Folder 
                size={24} 
                color={selectedDirectory === item ? colors.primary : colors.secondaryText} 
              />
              <Text 
                numberOfLines={1} 
                ellipsizeMode="middle"
                style={styles.directoryPath}
              >
                {item}
              </Text>
            </View>
            
            {selectedDirectory === item && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
      
      {showNewFolderInput ? (
        <View style={[styles.newFolderInputContainer, { backgroundColor: colors.card }]}>
          <TextInput
            style={[styles.newFolderInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="Enter folder name"
            placeholderTextColor={colors.secondaryText}
            value={newFolderName}
            onChangeText={setNewFolderName}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.addFolderButton, { backgroundColor: colors.primary }]}
            onPress={handleAddNewFolder}
          >
            <Text style={styles.addFolderButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.createFolderButton, { backgroundColor: colors.card }]}
          onPress={handleCreateNewFolder}
        >
          <Plus size={20} color={colors.primary} />
          <Text>Create New Folder</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        style={styles.saveButtonContainer}
        onPress={handleSaveSelection}
      >
        <LinearGradient
          colors={[colors.military.primary, colors.military.secondary]}
          style={styles.saveButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Save size={20} color="white" />
          <Text style={styles.saveButtonText}>Save Selection</Text>
        </LinearGradient>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  currentLocationContainer: {
    marginBottom: 20,
  },
  currentLocationTitle: {
    marginBottom: 8,
  },
  currentLocationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  currentLocationPath: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  directoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  directoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  directoryPath: {
    flex: 1,
  },
  newFolderInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
    padding: 8,
  },
  newFolderInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
  },
  addFolderButton: {
    padding: 10,
    borderRadius: 8,
  },
  addFolderButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  createFolderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  saveButtonContainer: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});