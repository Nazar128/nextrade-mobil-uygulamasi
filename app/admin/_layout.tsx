import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '@/api/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

function CustomDrawerContent(props: any) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "contactMessages"), where("status", "==", "unread"));
    const unsubscribe = onSnapshot(q, (snapshot) => setUnreadCount(snapshot.size));
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#020617' }}>
      <View style={styles.drawerHeader}>
        <View style={styles.logoBox}>
          <Ionicons name="sparkles" size={22} color="white" />
        </View>
      </View>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={styles.drawerFooter}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>NK</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.profileName}>NAZAR K.</Text>
            <Text style={styles.profileRole}>Root Admin</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={18} color="#e11d48" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function AdminLayout() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || role !== 'admin')) {
      router.replace('/login');
    }
  }, [user, role, loading]);

  if (loading || !user || role !== 'admin') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: '#020617', borderBottomWidth: 1, borderBottomColor: '#0f172a' },
          headerTintColor: '#3b82f6',
          drawerStyle: { width: 280 },
          drawerActiveBackgroundColor: 'rgba(29, 78, 216, 0.1)',
          drawerActiveTintColor: '#3b82f6',
          drawerInactiveTintColor: '#64748b',
          drawerLabelStyle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
        }}
      >
        <Drawer.Screen name="settings" options={{ drawerLabel: 'Ayarlar', title: 'AYARLAR', drawerIcon: ({color}) => <Ionicons name="settings-outline" size={18} color={color} /> }} />
        <Drawer.Screen name="users" options={{ drawerLabel: 'Kullanıcılar', title: 'KULLANICILAR', drawerIcon: ({color}) => <Ionicons name="people-outline" size={18} color={color} /> }} />
        <Drawer.Screen name="orders" options={{ drawerLabel: 'Siparişler', title: 'SİPARİŞLER', drawerIcon: ({color}) => <Ionicons name="cart-outline" size={18} color={color} /> }} />
        <Drawer.Screen name="products" options={{ drawerLabel: 'Ürünler', title: 'ÜRÜNLER', drawerIcon: ({color}) => <Ionicons name="cube-outline" size={18} color={color} /> }} />
        <Drawer.Screen name="messages" options={{ drawerLabel: 'Mesajlar', title: 'MESAJLAR', drawerIcon: ({color}) => <Ionicons name="mail-outline" size={18} color={color} /> }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
    drawerHeader: { padding: 30, paddingTop: 50 },
    logoBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1d4ed8', alignItems: 'center', justifyContent: 'center' },
    drawerFooter: { padding: 16, borderTopWidth: 1, borderTopColor: '#0f172a' },
    profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b' },
    avatar: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' },
    avatarText: { color: 'white', fontSize: 10, fontWeight: '900' },
    profileName: { color: '#f1f5f9', fontSize: 11, fontWeight: '700' },
    profileRole: { color: '#64748b', fontSize: 8, fontWeight: '500' },
    logoutBtn: { padding: 4 },
    pHeader: { padding: 30, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#1e293b', marginBottom: 10 },
    avatarLarge: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    pTitle: { color: 'white', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
    pLogout: { flexDirection: 'row', alignItems: 'center', padding: 25, gap: 10, borderTopWidth: 1, borderTopColor: '#1e293b' },
    pLogoutText: { color: '#94a3b8', fontSize: 11, fontWeight: '700' }
  });