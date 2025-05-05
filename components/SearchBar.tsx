import React from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChangeText, 
  placeholder = 'Search media...',
  onClear
}) => {
  const { theme } = useThemeStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;

  const handleClear = () => {
    onChangeText('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: colors.card,
        borderColor: colors.border
      }
    ]}>
      <Search size={20} color={colors.secondaryText} />
      <TextInput
        style={[
          styles.input, 
          { 
            color: colors.text,
            placeholderTextColor: colors.secondaryText
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <X size={18} color={colors.secondaryText} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchBar;