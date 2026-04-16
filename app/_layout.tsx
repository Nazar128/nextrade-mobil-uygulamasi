import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import 'react-native-reanimated';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { db, auth } from "@/api/firebase";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import MaintenancePage from "@/components/MaintenancePage";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const unstable_settings = {
  anchor: '(tabs)',
};

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'a218eeb7-b181-40eb-9db0-931289e63c64',
    })).data;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  return token;
}

export default function RootLayout() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let unsubSettings: () => void;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        setIsAdmin(userData?.role === "admin");

        try {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            await updateDoc(userRef, {
              expoPushToken: token,
              lastLogin: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error(error);
        }
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
      if (unsubAuth) unsubAuth();
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