import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';

interface TextProps extends RNTextProps {
  variant?: 'body' | 'title' | 'subtitle' | 'caption';
  color?: string;
}

const Text: React.FC<TextProps> = ({ 
  style, 
  variant = 'body', 
  color,
  children,
  ...props 
}) => {
  const { theme } = useThemeStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const textColor = color || colors.text;
  
  return (
    <RNText 
      style={[
        styles[variant],
        { color: textColor },
        style
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default Text;