import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, StatusBar } from "react-native";
import { Search } from "lucide-react-native";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/api/firebase";
import { TimeStats } from "@/components/TimeStats";
import { OrderMainChart } from "@/components/OrderMainChart";
import { SellerPerformance } from "@/components/SellerPerformance";
import { OrderRow } from "@/components/OrderRow";
import { OrderDetailsModal } from "@/components/OrderDetailsModal";

export default function OrdersPage() {
  const [period, setPeriod] = useState('Haftalık');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(data);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
    avgTicket: orders.length > 0 ? (orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0) / orders.length) : 0,
    activeSellers: new Set(orders.map(o => o.items?.[0]?.brand)).size
  };

  const filteredOrders = orders.filter(o => 
    o.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.address?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <View style={styles.loadingArea}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>SİPARİŞ <Text style={styles.textGray}>YÖNETİMİ</Text></Text>
            <View style={styles.liveBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.liveText}>Canlı Sistem Verileri</Text>
            </View>
          </View>
        </View>

        <View style={styles.periodTabs}>
          {['Haftalık', 'Aylık', 'Yıllık'].map((p) => (
            <TouchableOpacity key={p} onPress={() => setPeriod(p)} style={[styles.tabBtn, period === p && styles.tabBtnActive]}>
              <Text style={[styles.tabText, period === p && styles.tabTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TimeStats stats={stats} />

        <View style={styles.chartCard}><OrderMainChart orders={orders} /></View>
        
        <View style={styles.sellerCard}><SellerPerformance orders={orders} /></View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Sistemdeki Son İşlemler</Text>
          <View style={styles.searchBox}>
            <Search size={16} color="#475569" style={styles.searchIcon} />
            <TextInput 
              placeholder="Sipariş veya Müşteri Ara..." 
              placeholderTextColor="#475569"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>

          <View style={styles.tableCard}>
            {filteredOrders.map((order) => (
              <OrderRow 
                key={order.id} 
                order={order} 
                onOpenDetail={() => { setSelectedOrder(order); setIsModalOpen(true); }}
              />
            ))}
          </View>
        </View>

      </ScrollView>

      <OrderDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} order={selectedOrder} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712' },
  loadingArea: { flex: 1, backgroundColor: '#030712', justifyContent: 'center', alignItems: 'center' },
  scrollPadding: { padding: 20 },
  header: { marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#2563eb', letterSpacing: -1.5 },
  textGray: { color: '#334155' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginRight: 6 },
  liveText: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  periodTabs: { flexDirection: 'row', backgroundColor: '#111827', padding: 4, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#1f2937' },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabBtnActive: { backgroundColor: '#2563eb' },
  tabText: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase' },
  tabTextActive: { color: '#ffffff' },
  chartCard: { backgroundColor: 'rgba(17, 24, 39, 0.5)', padding: 20, borderRadius: 32, borderWidth: 1, borderColor: '#1f2937', marginBottom: 24 },
  sellerCard: { backgroundColor: 'rgba(17, 24, 39, 0.5)', padding: 20, borderRadius: 32, borderWidth: 1, borderColor: '#1f2937', marginBottom: 24 },
  listSection: { marginBottom: 40 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, paddingLeft: 4 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderRadius: 16, borderWidth: 1, borderColor: '#1f2937', paddingHorizontal: 12, marginBottom: 20 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 45, color: '#ffffff', fontSize: 12, fontWeight: '700' },
  tableCard: { backgroundColor: '#111827', borderRadius: 24, borderWidth: 1, borderColor: '#1f2937', overflow: 'hidden' }
});