import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
export const OrderRow = ({ order, onOpenDetail }: any) => {
  const currentStatus = order.status || "pending";

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'delivered': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)' };
      case 'shipped': return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)' };
      case 'pending': return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' };
      default: return { color: '#64748b', bg: '#0f172a', border: '#1e293b' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'TESLİM EDİLDİ';
      case 'shipped': return 'KARGODA';
      case 'pending': return 'HAZIRLANIYOR';
      default: return 'İŞLENİYOR';
    }
  };

  const statusStyle = getStatusStyles(currentStatus);

  return (
    <TouchableOpacity onPress={onOpenDetail} style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.orderId}>{order.orderId}</Text>
        <Text style={styles.fullName}>{order.address?.fullName}</Text>
        <Text style={styles.city}>{order.address?.city}</Text>
      </View>

      <View style={styles.rightSection}>
        <View style={[styles.badge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
          <Text style={[styles.badgeText, { color: statusStyle.color }]}>{getStatusText(currentStatus)}</Text>
        </View>
        <Text style={styles.amount}>{order.totalAmount?.toLocaleString()} TL</Text>
        <Text style={styles.storeName}>NexTrade</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(31, 41, 55, 0.3)', backgroundColor: 'transparent' },
  leftSection: { flex: 1 },
  orderId: { fontSize: 10, fontWeight: '900', color: '#64748b', marginBottom: 4 },
  fullName: { fontSize: 12, fontWeight: '900', color: '#ffffff', textTransform: 'uppercase' },
  city: { fontSize: 10, fontWeight: '700', color: '#475569', marginTop: 2 },
  rightSection: { alignItems: 'flex-end', justifyContent: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  badgeText: { fontSize: 8, fontWeight: '900' },
  amount: { fontSize: 14, fontWeight: '900', color: '#ffffff' },
  storeName: { fontSize: 9, fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }
});