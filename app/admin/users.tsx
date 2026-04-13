import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Search, Plus, UserCheck, UserMinus, Users, ShieldCheck } from 'lucide-react-native';
import { db } from '@/api/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { UserManagementCard } from '@/components/UserManagementCard';
import { AddUserModal } from '@/components/AddUserModal';
import { StatCard } from '@/components/StatCard';





export default function UsersScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({ sellers: 0, total: 0, restricted: 0, customers: 0 });
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(docs);
      setStats({
        total: docs.length,
        sellers: docs.filter((u: any) => u.role === 'seller' || u.role === 'Satıcı').length,
        restricted: docs.filter((u: any) => u.status === 'Kısıtlı').length,
        customers: docs.filter((u: any) => u.role === 'customer' || u.role === 'Müşteri').length,
      });
    });
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>KULLANICI <Text style={styles.titleBold}>YÖNETİMİ</Text></Text>
            <Text style={styles.subtitle}>Tüm kayıtları buradan izleyebilirsin.</Text>
          </View>
          <TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.addBtn}>
            <Plus size={18} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBarSection}>
          <View style={styles.searchContainer}>
            <Search size={18} color="#64748b" style={styles.searchIcon} />
            <TextInput 
              placeholder="İsim veya e-posta..."
              placeholderTextColor="#64748b"
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={{ paddingRight: 20 }}>
          <StatCard label="Toplam" value={stats.total} icon={<Users/>} color="#6366f1" subtitle="Tüm Kayıtlar" />
          <StatCard label="Satıcı" value={stats.sellers} icon={<ShieldCheck/>} color="#10b981" subtitle="Mağazalar" />
          <StatCard label="Kısıtlı" value={stats.restricted} icon={<UserMinus/>} color="#f43f5e" subtitle="Erişimsiz" />
          <StatCard label="Müşteri" value={stats.customers} icon={<UserCheck/>} color="#3b82f6" subtitle="Üyeler" />
        </ScrollView>

        <View style={styles.listSection}>
          {filteredUsers.map((item) => (
            <UserManagementCard key={item.id} user={item} />
          ))}
        </View>
      </ScrollView>

      <AddUserModal visible={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { color: '#475569', fontSize: 18, fontWeight: '300' },
  titleBold: { color: '#1d4ed8', fontWeight: 'bold' },
  subtitle: { color: '#64748b', fontSize: 10 },
  addBtn: { backgroundColor: '#4f46e5', width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  searchBarSection: { backgroundColor: '#020617', paddingHorizontal: 20, paddingVertical: 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderRadius: 15, borderWidth: 1, borderColor: '#1e293b', paddingHorizontal: 15 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 45, color: 'white', fontSize: 14 },
  statsScroll: { paddingLeft: 20, marginVertical: 15 },
  listSection: { padding: 20, paddingBottom: 100 }
});