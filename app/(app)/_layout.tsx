import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import * as Haptics from 'expo-haptics';
import { TouchableOpacity, Platform } from 'react-native';
import { useNotifications } from '@/api/notifications';

function TabBarIcon({ name, color }: { name: any; color: string; focused: boolean }) {
  // Scaling icon for active state using Reanimated ideally, but static standard scale for simplicity here
  return <MaterialCommunityIcons name={name} size={26} color={color} style={{ marginBottom: -3 }} />;
}

export default function AppLayout() {
  const { data: notificationsData } = useNotifications();
  const unreadCount = notificationsData?.unreadCount ?? 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Turn off router headers globally to avoid double-headers
        headerStyle: {
          backgroundColor: Colors.brand.white,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border.divider,
        },
        headerTitleStyle: {
          fontFamily: 'Inter_600SemiBold',
          color: Colors.text.primary,
        },
        tabBarActiveTintColor: Colors.brand.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: Colors.brand.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border.divider,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
        },
        tabBarButton: (props: any) => (
          <TouchableOpacity
            {...props}
            onPress={(e) => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              if (props.onPress) props.onPress(e);
            }}
          />
        )
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          headerShown: false, // Map view controls its own header
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? "map-marker-radius" : "map-marker-radius-outline"} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? "calendar-check" : "calendar-blank"} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="charging"
        options={{
          title: 'Charging',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? "flash" : "flash-outline"} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? "bell" : "bell-outline"} color={color} focused={focused} />,
          tabBarBadge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? "account-circle" : "account-circle-outline"} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
