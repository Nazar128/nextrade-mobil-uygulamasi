"use client";
import React, { useState, useEffect } from 'react';
import { StyleSheet,  Text,  View, TouchableOpacity,  ScrollView,  Modal,  TextInput,  ActivityIndicator, Image,  Dimensions, SafeAreaView} from 'react-native';
import { db, auth } from "@/api/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Package, ChevronRight, Clock, CheckCircle2, Truck,  Box, Search, X, CreditCard, MapPin } from 'lucide-react-native';
const { width } = Dimensions.get('window');

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const qOrders = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
          setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });

        return () => unsubscribeOrders();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'shipped':
        return { label: "Kargoda", color: "#22d3ee", icon: <Truck size={18} color="#22d3ee" /> };
      case 'delivered':
        return { label: "Teslim Edildi", color: "#4ade80", icon: <CheckCircle2 size={18} color="#4ade80" /> };
      case 'pending':
      default:
        return { label: "Hazırlanıyor", color: "#fbbf24", icon: <Clock size={18} color="#fbbf24" /> };
    }
  };
  const filteredOrders = orders.filter(o => 
    o.orderId?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );
  const formatDate = (date: any) => {
    if (!date) return "Tarih Belirsiz";
    const d = date?.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.toLocaleDateString('tr-TR');
  };
  if (loading) return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#06b6d4" />
      <Text style={styles.loaderText}>YÜKLENİYOR</Text>
    </View>
  );
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>HESABIM — İŞLEM GEÇMİŞİ</Text>
          <Text style={styles.headerTitle}>Siparişlerim</Text>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            placeholder="Sipariş ID ile ara..."
            placeholderTextColor="#64748b"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>SİPARİŞ BULUNAMADI</Text>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const config = getStatusConfig(order.status);
            return (
              <TouchableOpacity 
                key={order.id} 
                style={styles.orderCard}
                onPress={() => setSelectedOrder(order)}
                activeOpacity={0.8}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.iconBox, { borderColor: config.color + '33' }]}>
                    <Box size={24} color={config.color} />
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.orderIdRow}>
                      <Text style={styles.orderId}>#{order.orderId}</Text>
                      <View style={[styles.statusBadge, { borderColor: config.color + '33' }]}>
                        <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.dateText}>{formatDate(order.createdAt)}</Text>
                  </View>
                  <ChevronRight size={20} color="#475569" />
                </View>
                <View style={styles.cardBottom}>
                  <View>
                    <Text style={styles.statLabel}>İÇERİK</Text>
                    <Text style={styles.statValue}>{order.items?.length || 0} Ürün</Text>
                  </View>
                  <View>
                    <Text style={styles.statLabel}>TOPLAM</Text>
                    <Text style={styles.statValue}>{order.totalAmount?.toLocaleString('tr-TR')} TL</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      <Modal visible={!!selectedOrder} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>SİPARİŞ ÖZETİ</Text>
                <Text style={styles.modalOrderId}>#{selectedOrder?.orderId}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedOrder(null)} style={styles.closeBtn}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <MapPin size={18} color="#06b6d4" />
                  <Text style={styles.detailHeaderText}>TESLİMAT BİLGİSİ</Text>
                </View>
                <Text style={styles.addressName}>{selectedOrder?.address?.fullName}</Text>
                <Text style={styles.addressText}>{selectedOrder?.address?.address}</Text>
                <Text style={styles.addressText}>{selectedOrder?.address?.district} / {selectedOrder?.address?.city}</Text>
                <Text style={styles.phoneText}>{selectedOrder?.address?.phone}</Text>
              </View>
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <CreditCard size={18} color="#a855f7" />
                  <Text style={styles.detailHeaderText}>ÖDEME DETAYI</Text>
                </View>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Yöntem</Text>
                  <Text style={styles.paymentValue}>{selectedOrder?.payment?.method}</Text>
                </View>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Toplam</Text>
                  <Text style={styles.totalValue}>{selectedOrder?.totalAmount?.toLocaleString('tr-TR')} TL</Text>
                </View>
              </View>
              <View style={styles.productsSection}>
                <View style={styles.detailHeader}>
                  <Package size={18} color="#f59e0b" />
                  <Text style={styles.detailHeaderText}>ÜRÜNLER</Text>
                </View>
                {selectedOrder?.items?.map((item: any, idx: number) => (
                  <View key={idx} style={styles.productItem}>
                    <Image source={{ uri: item.imageUrl || item.image }} style={styles.productImg} />
                    <View style={styles.productInfo}>
                      <Text style={styles.productBrand}>{item.brand}</Text>
                      <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.productQty}>Adet: {item.quantity}</Text>
                    </View>
                    <Text style={styles.productPrice}>{(item.price * item.quantity).toLocaleString('tr-TR')} TL</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.closeAction} onPress={() => setSelectedOrder(null)}>
              <Text style={styles.closeActionText}>KAPAT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 20 },
  loaderContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  loaderText: { color: '#fff', fontSize: 10, fontWeight: '900', marginTop: 15, letterSpacing: 5 },
  header: { marginBottom: 25 },
  headerSubtitle: { color: '#06b6d4', fontSize: 10, fontWeight: '900', letterSpacing: 4, marginBottom: 8 },
  headerTitle: { color: '#fff', fontSize: 42, fontWeight: '900', letterSpacing: -1 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f1115', borderRadius: 20, borderWidth: 1, borderColor: '#1e293b', paddingHorizontal: 15, marginBottom: 20 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 55, color: '#fff', fontSize: 14 },
  emptyContainer: { padding: 60, borderRadius: 30, borderStyle: 'dashed', borderWidth: 2, borderColor: '#1e293b', alignItems: 'center' },
  emptyText: { color: '#475569', fontWeight: '900', letterSpacing: 2 },
  orderCard: { backgroundColor: '#0f1115', borderRadius: 30, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#1e293b' },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1 },
  cardInfo: { flex: 1 },
  orderIdRow: { flexDirection: 'row', alignItems: 'center' },
  orderId: { color: '#fff', fontSize: 18, fontWeight: '900', marginRight: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 8, fontWeight: '900' },
  dateText: { color: '#475569', fontSize: 11, fontWeight: '700', marginTop: 2 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 15 },
  statLabel: { color: '#475569', fontSize: 8, fontWeight: '900', letterSpacing: 2 },
  statValue: { color: '#e2e8f0', fontSize: 14, fontWeight: '800', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0c0d10', borderTopLeftRadius: 40, borderTopRightRadius: 40, height: '92%', borderTopWidth: 1, borderTopColor: '#1e293b', padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  modalOrderId: { color: '#06b6d4', fontSize: 12, fontWeight: '700' },
  closeBtn: { padding: 10 },
  modalBody: { flex: 1 },
  detailCard: { backgroundColor: '#16191d', borderRadius: 25, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#1e293b' },
  detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  detailHeaderText: { color: '#fff', fontSize: 10, fontWeight: '900', marginLeft: 10, letterSpacing: 2 },
  addressName: { color: '#fff', fontSize: 15, fontWeight: '800', marginBottom: 5 },
  addressText: { color: '#64748b', fontSize: 13, lineHeight: 18 },
  phoneText: { color: '#06b6d4', fontSize: 12, fontWeight: '700', marginTop: 10 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  paymentLabel: { color: '#64748b', fontSize: 13 },
  paymentValue: { color: '#fff', fontSize: 13, fontWeight: '700' },
  totalValue: { color: '#fff', fontSize: 16, fontWeight: '900' },
  productsSection: { marginBottom: 30 },
  productItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16191d', padding: 12, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#1e293b' },
  productImg: { width: 60, height: 60, borderRadius: 12, marginRight: 15 },
  productInfo: { flex: 1 },
  productBrand: { color: '#06b6d4', fontSize: 8, fontWeight: '900' },
  productTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  productQty: { color: '#475569', fontSize: 11 },
  productPrice: { color: '#fff', fontSize: 14, fontWeight: '900' },
  closeAction: { backgroundColor: '#fff', borderRadius: 20, padding: 18, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  closeActionText: { color: '#000', fontWeight: '900', letterSpacing: 2 }
});