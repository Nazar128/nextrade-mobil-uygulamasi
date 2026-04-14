import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { CreditCard, Users, Activity, ShoppingBag, Calendar } from 'lucide-react-native';
import { StatCard } from '@/components/StatCard';
import { MainChart } from '@/components/MainChart';
import { ActivityLogs } from '@/components/ActivityLogs';
import { db } from '@/api/firebase';
import { collection, onSnapshot, doc, query, orderBy } from 'firebase/firestore';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  const [range, setRange] = useState('haftalik');
  const [stats, setStats] = useState({ totalRevenue: 0, customerCount: 0, sellerCount: 0, activeSessions: 0, totalOrders: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const unsubAnalytics = onSnapshot(doc(db, "analytics", "store_stats"), (snap) => {
      if (snap.exists()) setStats(p => ({ ...p, activeSessions: Math.max(0, snap.data().activeUsers || 0) }));
    });
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const users = snap.docs.map(d => d.data());
      setStats(p => ({ ...p, customerCount: users.filter(u => u.role === 'customer').length, sellerCount: users.filter(u => u.role === 'seller').length }));
    });
    const unsubOrders = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (snap) => {
      const all = snap.docs.map(d => ({ ...d.data(), totalAmount: Number(d.data().totalAmount || 0), createdAt: d.data().createdAt?.seconds ? d.data().createdAt.seconds * 1000 : new Date(d.data().createdAt).getTime() }));
      setStats(p => ({ ...p, totalRevenue: all.reduce((a, b: any) => a + b.totalAmount, 0), totalOrders: all.length }));
      processChartData(all, range);
    });
    return () => { unsubAnalytics(); unsubUsers(); unsubOrders(); };
  }, [range]);

  const processChartData = (orders: any[], timeRange: string) => {
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    setChartData(days.map((d, i) => ({ name: d, satis: orders.filter(o => new Date(o.createdAt).getDay() === i).reduce((a, b) => a + b.totalAmount, 0), ziyaret: Math.floor(Math.random() * 500) })));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#020617' }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>VERİ <Text style={{ color: '#2563eb' }}>ANALİZ</Text></Text>
            <Text style={styles.subtitle}>Sistem verileri gerçek zamanlı izleniyor.</Text>
          </View>
          <TouchableOpacity style={styles.rangeBtn}>
            <Calendar size={14} color="#64748b" />
            <Text style={styles.rangeText}>{range.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          <StatCard label="Ciro" value={`₺${stats.totalRevenue.toLocaleString()}`} icon={<CreditCard />} color="#818cf8" trend={{ value: '%12', isPositive: true }} />
          <StatCard label="Kullanıcı" value={stats.customerCount + stats.sellerCount} icon={<Users />} color="#10b981" subtitle={`${stats.customerCount}M / ${stats.sellerCount}S`} />
        </View>
        
        <View style={[styles.grid, { marginTop: 12 }]}>
          <StatCard label="Aktif" value={stats.activeSessions} icon={<Activity />} color="#fbbf24" subtitle="Anlık" trend={{ value: 'Canlı', isPositive: true }} />
          <StatCard label="Sipariş" value={stats.totalOrders} icon={<ShoppingBag />} color="#f43f5e" />
        </View>

        <TouchableOpacity onPress={() => {router.push("/admin/orders")}}><Text style={{color:'white'}}>orders</Text></TouchableOpacity>
            

        <View style={styles.chartBox}><MainChart data={chartData} /></View>
        <View style={styles.logsBox}><ActivityLogs /></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  subtitle: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  rangeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#0f172a' },
  rangeText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  grid: { flexDirection: 'row', gap: 12 },
  chartBox: { marginTop: 24 },
  logsBox: { marginTop: 24 }
});