import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { X, User, Store, Package, CreditCard, MapPin, Truck } from 'lucide-react-native';
export const OrderDetailsModal = ({ order, isOpen, onClose }: any) => {
  if (!isOpen || !order) return null;
  const currentStatus = order.status || "pending";
  const getStatusLabel = (status: string) => {
    if (status === 'delivered') return { text: 'TESLİM EDİLDİ', color: '#10b981' };
    if (status === 'shipped') return { text: 'KARGODA', color: '#3b82f6' };
    return { text: 'HAZIRLANIYOR', color: '#f59e0b' };
  };
  const statusInfo = getStatusLabel(currentStatus);
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Sipariş Analizi</Text>
                <Text style={[styles.orderIdText, { color: statusInfo.color }]}>
                  {order.orderId} — {statusInfo.text}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <View style={styles.sectionLabel}>
                  <User size={14} color="#3b82f6" /><Text style={styles.sectionLabelText}>Müşteri Profili</Text>
                </View>
                <Text style={styles.whiteTitle}>{order.address?.fullName}</Text>
                <Text style={styles.subText}>{order.address?.email}</Text>
                <View style={styles.locationBox}>
                  <MapPin size={12} color="#3b82f6" />
                  <Text style={styles.locationText}>{order.address?.district}, {order.address?.city}</Text>
                </View>
              </View>
              <View style={styles.section}>
                <View style={styles.sectionLabel}>
                  <Store size={14} color="#a855f7" /><Text style={[styles.sectionLabelText, { color: '#a855f7' }]}>Mağaza Bilgisi</Text>
                </View>
                <Text style={styles.whiteTitle}>NexTrade</Text>
                <Text style={styles.subText}>Mağaza Sahibi: Nazar Kalçık</Text>
              </View>
              <View style={styles.section}>
                <View style={styles.sectionLabel}>
                  <Package size={14} color="#10b981" /><Text style={[styles.sectionLabelText, { color: '#10b981' }]}>Ürün İçeriği</Text>
                </View>
                {order.items?.map((item: any, idx: number) => (
                  <View key={idx} style={styles.itemCard}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <View style={styles.itemRow}>
                      <Text style={styles.itemSub}>Miktar: {item.quantity}</Text>
                      <Text style={styles.itemPrice}>{item.price.toLocaleString()} TL</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.section}>
                <View style={styles.sectionLabel}>
                  <CreditCard size={14} color="#f59e0b" /><Text style={[styles.sectionLabelText, { color: '#f59e0b' }]}>Finansal Özet</Text>
                </View>
                <View style={styles.financeBox}>
                  <View style={styles.financeRow}><Text style={styles.finLabel}>Yöntem:</Text><Text style={styles.finValue}>{order.payment?.method}</Text></View>
                  <View style={styles.totalRow}><Text style={styles.totalLabel}>Genel Toplam:</Text><Text style={styles.totalValue}>{order.totalAmount.toLocaleString()} TL</Text></View>
                </View>
              </View>
            </ScrollView>
            <View style={styles.footer}>
              <TouchableOpacity style={styles.primaryBtn}><Text style={styles.btnText}>FATURA GÖRÜNTÜLE</Text></TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn}><Truck size={16} color="#cbd5e1" /><Text style={styles.secondaryBtnText}>TAKİP</Text></TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.95)', justifyContent: 'center', padding: 16 },
  safeArea: { flex: 1, justifyContent: 'center' },
  modalContent: { backgroundColor: '#111827', borderRadius: 32, borderWidth: 1, borderColor: '#1f2937', overflow: 'hidden', maxHeight: '90%' },
  header: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#1f2937', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 },
  orderIdText: { fontSize: 10, fontWeight: '900', marginTop: 4 },
  closeBtn: { padding: 8, backgroundColor: '#1f2937', borderRadius: 12 },
  body: { padding: 24 },
  section: { marginBottom: 32 },
  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionLabelText: { fontSize: 10, fontWeight: '900', color: '#3b82f6', letterSpacing: 1.5, textTransform: 'uppercase' },
  whiteTitle: { color: '#ffffff', fontSize: 14, fontWeight: '900', textTransform: 'uppercase' },
  subText: { fontSize: 12, color: '#64748b', fontWeight: '500', marginTop: 2 },
  locationBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  locationText: { fontSize: 10, color: '#94a3b8', fontWeight: '800' },
  itemCard: { backgroundColor: '#030712', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1f2937', marginBottom: 8 },
  itemTitle: { color: '#ffffff', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  itemSub: { fontSize: 10, color: '#64748b', fontWeight: '700' },
  itemPrice: { fontSize: 10, color: '#3b82f6', fontWeight: '900' },
  financeBox: { backgroundColor: '#030712', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1f2937' },
  financeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  finLabel: { fontSize: 10, color: '#475569', fontWeight: '800' },
  finValue: { fontSize: 10, color: '#cbd5e1', fontWeight: '800' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#1f2937', paddingTop: 12 },
  totalLabel: { fontSize: 12, color: '#ffffff', fontWeight: '900' },
  totalValue: { fontSize: 14, color: '#10b981', fontWeight: '900' },
  footer: { padding: 20, backgroundColor: 'rgba(17, 24, 39, 0.8)', borderTopWidth: 1, borderTopColor: '#1f2937', flexDirection: 'row', gap: 12 },
  primaryBtn: { flex: 2, backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  btnText: { color: '#ffffff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  secondaryBtn: { flex: 1, backgroundColor: '#1f2937', paddingVertical: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  secondaryBtnText: { color: '#cbd5e1', fontSize: 10, fontWeight: '900' }
});