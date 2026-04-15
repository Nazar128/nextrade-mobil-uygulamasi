import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Package, AlertCircle, CheckCircle } from 'lucide-react-native';
import { db, auth } from '@/api/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function ManagerStats() {
  const [statsData, setStatsData] = useState({
    total: 0,
    critical: 0,
    active: 0,
    loading: true
  });

  useEffect(() => {
    const sellerId = auth.currentUser?.uid;
    if (!sellerId) return;

    const q = query(collection(db, "products"), where("sellerId", "==", sellerId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = snapshot.size;
      let critical = 0;
      let active = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.stock <= 5) critical++;
        if (data.status === 'active') active++;
      });

      setStatsData({ total, critical, active, loading: false });
    });

    return () => unsubscribe();
  }, []);

  if (statsData.loading) {
    return <ActivityIndicator color="#3b82f6" style={{ marginVertical: 20 }} />;
  }

  const stats = [
    { label: "Toplam Envanter", value: statsData.total, icon: <Package size={20} color="#60a5fa" />, bg: "rgba(59, 130, 246, 0.1)" },
    { label: "Kritik Stok", value: statsData.critical, icon: <AlertCircle size={20} color="#fbbf24" />, bg: "rgba(245, 158, 11, 0.1)" },
    { label: "Satıştaki Ürünler", value: statsData.active, icon: <CheckCircle size={20} color="#34d399" />, bg: "rgba(16, 185, 129, 0.1)" },
  ];

  return (
    <View style={styles.grid}>
      {stats.map((stat, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.info}>
            <Text style={styles.label}>{stat.label}</Text>
            <Text style={styles.value}>{stat.value}</Text>
          </View>
          <View style={[styles.iconContainer, { backgroundColor: stat.bg }]}>
            {stat.icon}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 16, paddingHorizontal: 4 },
  card: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937', padding: 24, borderRadius: 32, flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, gap: 4 },
  label: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5, color: '#6b7280' },
  value: { fontSize: 28, fontWeight: '900', color: '#ffffff' },
  iconContainer: { padding: 16, borderRadius: 16 }
});