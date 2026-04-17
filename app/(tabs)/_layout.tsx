import React from "react";
import { View, StyleSheet } from "react-native";
import { Slot } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import Toast from "react-native-toast-message";
import Navbar from "@/components/Navbar";

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <View style={[styles.mainWrapper, { backgroundColor: theme.bg }]}>
      <Navbar />
      
      <View style={styles.content}>
        <Slot />
      </View>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { 
    flex: 1 
  },
  content: { 
    flex: 1 
  }
});