import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "@/context/ThemeContext";
import Toast from "react-native-toast-message";
import Navbar from "@/components/Navbar";

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <View style={[styles.mainWrapper, { backgroundColor: theme.bg }]}>
      <Navbar />

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: "#94a3b8",
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: [styles.tabBar, { backgroundColor: theme.card, borderTopColor: theme.border }],
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Ana Sayfa",
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Keşfet",
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="paperplane.fill" color={color} />,
          }}
        />
      </Tabs>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  tabBar: { 
    borderTopWidth: 1, 
    height: 60, 
    paddingBottom: 8 
  }
});