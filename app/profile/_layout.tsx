import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '@/api/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export function ProfileDrawerContent(props: any) {
  const router = useRouter();
  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View style={styles.pHeader}>
        <View style={styles.avatarLarge}>
          <Ionicons name="person" size={24} color="white" />
        </View>
        <Text style={styles.pTitle}>HESABIM</Text>
      </View>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <TouchableOpacity onPress={handleLogout} style={styles.pLogout}>
        <Ionicons name="log-out-outline" size={20} color="#94a3b8" />
        <Text style={styles.pLogoutText}>ÇIKIŞ YAP</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ProfileLayout() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (role !== 'customer' && role !== 'admin'))) {
      router.replace('/login');
    }
  }, [user, role, loading]);

  if (loading || !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <ProfileDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#6366f1',
          drawerActiveBackgroundColor: 'rgba(99, 102, 241, 0.1)',
          drawerActiveTintColor: '#818cf8',
          drawerInactiveTintColor: '#94a3b8',
          drawerLabelStyle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
        }}
      >
        <Drawer.Screen name="page" options={{ drawerLabel: 'Profilim', title: 'PROFİL BİLGİLERİ', drawerIcon: ({color}) => <Ionicons name="person-outline" size={18} color={color} /> }} />
<Drawer.Screen name="orders" options={{ drawerLabel: 'Siparişlerim', title: 'SİPARİŞLERİM', drawerIcon: ({color}) => <Ionicons name="bag-handle-outline" size={18} color={color} /> }} />
<Drawer.Screen name="wishlist" options={{ drawerLabel: 'Favorilerim', title: 'FAVORİ LİSTEM', drawerIcon: ({color}) => <Ionicons name="heart-outline" size={18} color={color} /> }} />
<Drawer.Screen name="addresses" options={{ drawerLabel: 'Adreslerim', title: 'ADRES YÖNETİMİ', drawerIcon: ({color}) => <Ionicons name="location-outline" size={18} color={color} /> }} />
<Drawer.Screen name="followedStores" options={{ drawerLabel: 'Takip Ettiklerim', title: 'TAKİP EDİLEN MAĞAZALAR', drawerIcon: ({color}) => <Ionicons name="ribbon-outline" size={18} color={color} /> }} />
<Drawer.Screen name="settings" options={{ drawerLabel: 'Güvenlik & Ayarlar', title: 'HESAP AYARLARI', drawerIcon: ({color}) => <Ionicons name="shield-checkmark-outline" size={18} color={color} /> }} />
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