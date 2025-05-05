import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { 
  Download, 
  Settings,
  Image
} from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  interpolateColor
} from 'react-native-reanimated';

function TabBarIcon({ name, color, size = 24, focused }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);
  
  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, { 
      damping: 15, 
      stiffness: 120 
    });
    
    opacity.value = withSpring(focused ? 1 : 0.7, {
      damping: 15,
      stiffness: 120
    });
  }, [focused]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value
    };
  });

  let Icon;
  switch (name) {
    case 'status':
      Icon = Image;
      break;
    case 'downloads':
      Icon = Download;
      break;
    case 'settings':
      Icon = Settings;
      break;
    default:
      Icon = Download;
  }

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      <Icon size={size} color={color} />
    </Animated.View>
  );
}

export default function TabLayout() {
  const { theme } = useThemeStore();
  const colors = theme === 'dark' ? Colors.dark : Colors.light;
  
  const handleTabPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Tabs
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={route.name} color={color} focused={focused} />
          ),
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: {
            position: 'absolute',
            borderTopWidth: 0,
            elevation: 0,
            height: Platform.OS === 'ios' ? 85 : 70,
            paddingBottom: Platform.OS === 'ios' ? 28 : 10,
            paddingTop: 10,
            backgroundColor: 'transparent',
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
          },
          tabBarBackground: () => (
            <BlurView
              tint={theme === 'dark' ? 'dark' : 'light'}
              intensity={80}
              style={[
                StyleSheet.absoluteFill,
                { 
                  borderTopRightRadius: 24,
                  borderTopLeftRadius: 24,
                  overflow: 'hidden',
                  backgroundColor: theme === 'dark' 
                    ? 'rgba(18, 18, 18, 0.8)' 
                    : 'rgba(255, 255, 255, 0.8)',
                }
              ]}
            />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            paddingBottom: Platform.OS === 'ios' ? 0 : 4,
          },
          headerStyle: {
            backgroundColor: colors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
          tabBarHideOnKeyboard: true,
        })}
        screenListeners={{
          tabPress: () => handleTabPress(),
        }}
      >
        <Tabs.Screen
          name="status"
          options={{
            title: "Status",
            tabBarLabel: "Status",
          }}
        />
        <Tabs.Screen
          name="downloads"
          options={{
            title: "Downloads",
            tabBarLabel: "Downloads",
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarLabel: "Settings",
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});