import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import 'react-native-reanimated';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { db, auth } from "@/api/firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import MaintenancePage from "@/components/MaintenancePage";

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let unsubSettings: () => void;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        setIsAdmin(userData?.role === "admin");
      } else {
        setIsAdmin(false);
      }

      unsubSettings = onSnapshot(doc(db, "system", "settings"), (snapshot) => {
        if (snapshot.exists()) {
          setIsMaintenance(snapshot.data().maintenanceMode);
        }
        setLoading(false);
      });
    });

    return () => {
      unsubAuth();
      if (unsubSettings) unsubSettings();
    };
  }, []);

  const isAdminPath = pathname.startsWith('/admin');

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0c0d10', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#2563eb" size="large" />
      </View>
    );
  }

  if (isMaintenance && !isAdmin && !isAdminPath) {
    return (
      <ThemeProvider>
        <MaintenancePage />
        <StatusBar style="light" />
      </ThemeProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="seller" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}