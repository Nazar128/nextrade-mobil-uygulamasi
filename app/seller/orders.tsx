"use client";
import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Modal, 
  ActivityIndicator, SafeAreaView, StyleSheet, Dimensions, Platform 
} from 'react-native';
import { db, auth } from "@/api/firebase";
import { collection, query, onSnapshot, updateDoc, doc, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  Truck, CheckCircle2, Clock, ChevronRight, X, User, ShoppingBag 
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SellerOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const sellerOrders = allOrders.filter((order: any) =>
            order.items?.some((item: any) =>
              item.sellerId === currentUser.uid ||
              item.sellerName === "NexTrade Mağaza" ||
              item.brand === "Ray-Ban"
            )
          );
          setOrders(sellerOrders);
          setLoading(false);
        }, () => setLoading(false));
        return () => unsubscribeFirestore();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setSelectedOrder(null);
    } catch (error) {
      console.error(error);
    }
  };

  const statusMap: any = {
    pending: { label: "BEKLEMEDE", color: "#facc15", bg: "rgba(250, 204, 21, 0.1)", border: "rgba(250, 204, 21, 0.2)" },
    shipped: { label: "KARGODA", color: "#60a5fa", bg: "rgba(96, 165, 250, 0.1)", border: "rgba(96, 165, 250, 0.2)" },
    delivered: { label: "TESLİM EDİLDİ", color: "#4ade80", bg: "rgba(74, 222, 128, 0.1)", border: "rgba(74, 222, 128, 0.2)" }
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>SATIŞ YÖNETİMİ</Text>
          <Text style={styles.headerTitle}>GELEN <Text style={styles.headerTitleAccent}>SİPARİŞLER</Text></Text>
        </View>

        <View style={styles.listContainer}>
          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>HENÜZ SİPARİŞ ALINMADI</Text>
              <Text style={styles.emptySubText}>UID: {user?.uid?.slice(0, 8)}...</Text>
            </View>
          ) : (
            orders.map((order) => {
              const status = statusMap[order.status] || statusMap.pending;
              return (
                <TouchableOpacity key={order.id} onPress={() => setSelectedOrder(order)} activeOpacity={0.8} style={styles.orderCard}>
                  <View style={styles.orderCardLeft}>
                    <View style={[styles.iconBox, { backgroundColor: status.bg, borderColor: status.border }]}>
                      <ShoppingBag size={24} color={status.color} />
                    </View>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderIdText}>#{order.orderId || '0000'}</Text>
                      <View style={styles.statusRow}>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}><Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text></View>
                        <Text style={styles.dateText}>{order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('tr-TR') : 'YENİ'}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.orderCardRight}>
                    <Text style={styles.amountText}>{order.totalAmount?.toLocaleString('tr-TR')} TL</Text>
                    <ChevronRight size={18} color="#4b5563" />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={!!selectedOrder} onRequestClose={() => setSelectedOrder(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View><Text style={styles.modalTitle}>SİPARİŞ DETAYI</Text><Text style={styles.modalOrderId}>#{selectedOrder?.orderId}</Text></View>
              <TouchableOpacity onPress={() => setSelectedOrder(null)} style={styles.closeButton}><X size={24} color="#6b7280" /></TouchableOpacity>
            </View>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity onPress={() => updateStatus(selectedOrder?.id, 'pending')} style={[styles.actionButton, selectedOrder?.status === 'pending' && styles.activePending]}><Clock size={20} color={selectedOrder?.status === 'pending' ? '#eab308' : '#4b5563'} /><Text style={styles.actionButtonText}>HAZIRLA</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => updateStatus(selectedOrder?.id, 'shipped')} style={[styles.actionButton, selectedOrder?.status === 'shipped' && styles.activeShipped]}><Truck size={20} color={selectedOrder?.status === 'shipped' ? '#3b82f6' : '#4b5563'} /><Text style={styles.actionButtonText}>KARGOLA</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => updateStatus(selectedOrder?.id, 'delivered')} style={[styles.actionButton, selectedOrder?.status === 'delivered' && styles.activeDelivered]}><CheckCircle2 size={20} color={selectedOrder?.status === 'delivered' ? '#22c55e' : '#4b5563'} /><Text style={styles.actionButtonText}>TESLİM ET</Text></TouchableOpacity>
            </View>
            <View style={styles.addressSection}>
              <View style={styles.addressHeader}><User size={16} color="#3b82f6" /><Text style={styles.addressHeaderText}>MÜŞTERİ BİLGİLERİ</Text></View>
              <Text style={styles.customerName}>{selectedOrder?.address?.fullName}</Text>
              <Text style={styles.customerPhone}>{selectedOrder?.address?.phone}</Text>
              <Text style={styles.customerAddress}>{selectedOrder?.address?.address}</Text>
              <Text style={styles.customerCity}>{selectedOrder?.address?.district} / {selectedOrder?.address?.city}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedOrder(null)} style={styles.panelCloseBtn}><Text style={styles.panelCloseBtnText}>PANELİ KAPAT</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  loadingContainer: { flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center' },
  scrollView: { paddingHorizontal: 20, paddingTop: 24 },
  header: { marginBottom: 32 },
  headerSubtitle: { color: '#3b82f6', fontSize: 10, fontWeight: '900', letterSpacing: 4, textTransform: 'uppercase' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#94a3b8', letterSpacing: -0.5 },
  headerTitleAccent: { fontSize: 32, color: '#2563eb' },
  listContainer: { paddingBottom: 40 },
  emptyContainer: { paddingVertical: 80, borderWidth: 2, borderColor: 'rgba(255,255,255,0.05)', borderStyle: 'dashed', borderRadius: 48, alignItems: 'center' },
  emptyText: { color: '#6b7280', fontWeight: '700', letterSpacing: 2, fontStyle: 'italic' },
  emptySubText: { fontSize: 10, color: 'rgba(59,130,246,0.5)', marginTop: 16 },
  orderCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 40, padding: 24, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  orderInfo: { marginLeft: 16, flex: 1 },
  orderIdText: { fontSize: 18, fontWeight: '900', color: '#ffffff', fontStyle: 'italic', letterSpacing: -0.5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginRight: 8 },
  statusBadgeText: { fontSize: 9, fontWeight: '900' },
  dateText: { color: '#4b5563', fontSize: 10, fontWeight: '700' },
  orderCardRight: { alignItems: 'flex-end' },
  amountText: { color: '#ffffff', fontWeight: '900', fontSize: 16, marginBottom: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.85)' },
  modalContent: { backgroundColor: '#0c0d10', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', borderTopLeftRadius: 48, borderTopRightRadius: 48, padding: 32, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#ffffff', fontStyle: 'italic' },
  modalOrderId: { color: '#3b82f6', fontSize: 12 },
  closeButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20 },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  actionButton: { flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: 4 },
  activePending: { backgroundColor: 'rgba(234,179,8,0.15)', borderColor: '#eab308' },
  activeShipped: { backgroundColor: 'rgba(59,130,246,0.15)', borderColor: '#3b82f6' },
  activeDelivered: { backgroundColor: 'rgba(34,197,94,0.15)', borderColor: '#22c55e' },
  actionButtonText: { fontSize: 8, fontWeight: '900', color: '#6b7280', marginTop: 8 },
  addressSection: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 32, padding: 24, marginBottom: 32 },
  addressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 8 },
  addressHeaderText: { fontSize: 10, fontWeight: '900', color: '#ffffff', marginLeft: 8, letterSpacing: 1.5 },
  customerName: { color: '#ffffff', fontWeight: '700', fontSize: 18, textTransform: 'uppercase' },
  customerPhone: { color: '#3b82f6', fontSize: 14, marginTop: 4, marginBottom: 12 },
  customerAddress: { color: '#94a3b8', fontSize: 14, fontStyle: 'italic', lineHeight: 20, marginBottom: 8 },
  customerCity: { color: '#ffffff', fontWeight: '900', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  panelCloseBtn: { width: '100%', paddingVertical: 20, backgroundColor: '#ffffff', borderRadius: 20, alignItems: 'center' },
  panelCloseBtnText: { color: '#000000', fontWeight: '900', letterSpacing: 2 }
});