import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ShoppingBag, DollarSign, Activity, Users, TrendingUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const TimeStats = ({ stats }: any) => {
  const items = [
    { label: "Toplam Sipariş", value: stats.totalOrders, sub: "Sistem geneli", icon: ShoppingBag, color: "#3b82f6" },
    { label: "Toplam Ciro", value: `${stats.totalRevenue?.toLocaleString()} TL`, sub: "Brüt kazanç", icon: DollarSign, color: "#10b981" },
    { label: "Ort. Sepet", value: `${Math.round(stats.avgTicket || 0).toLocaleString()} TL`, sub: "Sipariş başı", icon: Activity, color: "#f59e0b" },
    { label: "Aktif Satıcı", value: stats.activeSellers, sub: "Marka sayısı", icon: Users, color: "#a855f7" },
  ];

  return (
    <View style={styles.grid}>
      {items.map((stat, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.header}>
            <View style={[styles.iconBox, { backgroundColor: '#1f2937' }]}>
              <stat.icon size={20} color={stat.color} />
            </View>
            <View style={styles.badge}>
              <TrendingUp size={10} color="#10b981" />
              <Text style={styles.badgeText}>%12.5</Text>
            </View>
          </View>
          <Text style={styles.label}>{stat.label}</Text>
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.subText}>{stat.sub}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 10 },
  card: { backgroundColor: 'rgba(17, 24, 39, 0.5)', borderWidth: 1, borderColor: '#1f2937', padding: 20, borderRadius: 32, width: (width / 2) - 20, marginBottom: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  iconBox: {  padding: 10, borderRadius: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, gap: 4 },
  badgeText: { fontSize: 9, fontWeight: '900', color: '#10b981', textTransform: 'uppercase' },
  label: { color: '#64748b', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  value: { color: '#ffffff', fontSize: 18, fontWeight: '900', marginTop: 4 },
  subText: { color: '#475569', fontSize: 10, marginTop: 8, fontStyle: 'italic', fontWeight: '500' }
});