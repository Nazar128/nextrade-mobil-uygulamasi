import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, Dimensions, SafeAreaView } from 'react-native';
import { collection, query, orderBy, limit, onSnapshot, where, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/api/firebase";
import { formatDistanceToNow } from 'date-fns'; 
import { tr } from 'date-fns/locale'; 
import { ShoppingBag, MessageCircle, Star, Bell, X, ArrowRight, ChevronRight } from 'lucide-react-native';

export const ActivityFeed = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(collection(db, "notifications"), where("sellerId", "==", user.uid), orderBy("createdAt", "desc"), limit(15));
        const unsubscribeSnap = onSnapshot(q, (snapshot) => {
          setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });
        return () => unsubscribeSnap();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const getStatusStyle = (type: string) => {
    switch (type) {
      case 'order': return { color: '#10b981', icon: <ShoppingBag size={18} color="white" /> };
      case 'question': return { color: '#3b82f6', icon: <MessageCircle size={18} color="white" /> };
      case 'review': return { color: '#f59e0b', icon: <Star size={18} color="white" /> };
      default: return { color: '#64748b', icon: <Bell size={18} color="white" /> };
    }
  };

  const markAsReadAndDelete = async (notifId: string) => {
    try { await deleteDoc(doc(db, "notifications", notifId)); } catch (error) { console.error(error); }
  };

  const handleNotificationClick = (notif: any) => {
    setSelectedNotif(notif);
    markAsReadAndDelete(notif.id);
  };

  const renderItem = ({ item }: { item: any }) => {
    const style = getStatusStyle(item.type);
    return (
      <TouchableOpacity onPress={() => handleNotificationClick(item)} style={styles.notifCard} activeOpacity={0.7}>
        <View style={[styles.iconContainer, { backgroundColor: style.color }]}>{style.icon}</View>
        <View style={styles.textContainer}>
          <View style={styles.notifHeader}>
            <Text style={styles.notifTitle}>{item.title}</Text>
            <Text style={styles.timeText}>{item.createdAt ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true, locale: tr }) : 'Şimdi'}</Text>
          </View>
          <Text style={styles.messageText} numberOfLines={2}>{item.message}</Text>
        </View>
        <ChevronRight size={16} color="#475569" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.pulseDot} />
        <Text style={styles.headerTitle}>BİLDİRİM SİSTEMİ</Text>
      </View>
      {loading ? (
        <View style={styles.centerContainer}><ActivityIndicator color="#3b82f6" size="small" /></View>
      ) : (
        <FlatList data={notifications} renderItem={renderItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.listContent} ListEmptyComponent={<Text style={styles.emptyText}>Henüz bir bildirim yok.</Text>} />
      )}
      <Modal visible={!!selectedNotif} transparent animationType="slide" onRequestClose={() => setSelectedNotif(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalLabel}>İÇERİK ÖZETİ</Text>
              <TouchableOpacity onPress={() => setSelectedNotif(null)}><X size={24} color="#94a3b8" /></TouchableOpacity>
            </View>
            {selectedNotif && (
              <View style={styles.modalBody}>
                <View style={styles.detailHeader}>
                  <View style={[styles.largeIcon, { backgroundColor: getStatusStyle(selectedNotif.type).color }]}>{getStatusStyle(selectedNotif.type).icon}</View>
                  <View>
                    <Text style={styles.detailTitle}>{selectedNotif.title}</Text>
                    <Text style={styles.detailTime}>{selectedNotif.createdAt ? formatDistanceToNow(selectedNotif.createdAt.toDate(), { addSuffix: true, locale: tr }) : 'Şimdi'}</Text>
                  </View>
                </View>
                <View style={styles.messageBox}><Text style={styles.messageDetailText}>{selectedNotif.message}</Text></View>
                <TouchableOpacity style={styles.actionButton}><Text style={styles.actionButtonText}>DETAYLARI GÖR</Text><ArrowRight size={18} color="white" /></TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 10, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' },
  headerTitle: { fontSize: 12, fontWeight: '900', color: '#94a3b8', letterSpacing: 2 },
  listContent: { padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notifCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b' },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 12 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 13, fontWeight: 'bold', color: '#f1f5f9' },
  timeText: { fontSize: 10, color: '#64748b' },
  messageText: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },
  emptyText: { textAlign: 'center', color: '#475569', marginTop: 40, fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0f172a', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#334155' },
  modalIndicator: { width: 40, height: 4, backgroundColor: '#334155', borderRadius: 2, alignSelf: 'center', marginTop: 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24 },
  modalLabel: { fontSize: 10, fontWeight: '900', color: '#3b82f6', letterSpacing: 1.5 },
  modalBody: { paddingHorizontal: 24 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  largeIcon: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  detailTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  detailTime: { fontSize: 12, color: '#64748b' },
  messageBox: { backgroundColor: '#020617', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#1e293b', marginBottom: 24 },
  messageDetailText: { fontSize: 14, color: '#cbd5e1', lineHeight: 22, fontStyle: 'italic' },
  actionButton: { backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 16, gap: 10 },
  actionButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 }
});