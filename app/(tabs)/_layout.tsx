import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Toast from "react-native-toast-message";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.mainWrapper}>
      <Navbar />

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          tabBarInactiveTintColor: "#94a3b8",
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: styles.tabBar,
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
  mainWrapper: { flex: 1, backgroundColor: "#0f172a" },
  tabBar: { 
    backgroundColor: "#1e293b", 
    borderTopWidth: 1, 
    borderTopColor: "rgba(255,255,255,0.1)", 
    height: 60, 
    paddingBottom: 8 
  }
});