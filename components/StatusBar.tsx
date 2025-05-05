import React from 'react';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { View, Platform, StatusBar as RNStatusBar, StyleSheet } from 'react-native';
import { useThemeStore } from '@/store/theme-store';

interface StatusBarProps {
  style?: 'auto' | 'inverted' | 'light' | 'dark';
}

const StatusBar: React.FC<StatusBarProps> = ({ style = 'auto' }) => {
  const { theme } = useThemeStore();
  
  // Determine the status bar style based on theme and provided style
  let statusBarStyle: 'auto' | 'inverted' | 'light' | 'dark' = style;
  
  if (style === 'auto') {
    statusBarStyle = theme === 'dark' ? 'light' : 'dark';
  } else if (style === 'inverted') {
    statusBarStyle = theme === 'dark' ? 'dark' : 'light';
  }
  
  return (
    <>
      <ExpoStatusBar style={statusBarStyle} />
      {Platform.OS === 'android' && (
        <View style={[
          styles.statusBarPlaceholder, 
          { height: RNStatusBar.currentHeight }
        ]} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  statusBarPlaceholder: {
    width: '100%',
  },
});

export default StatusBar;