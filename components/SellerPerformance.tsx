import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
export const SellerPerformance = ({ orders }: any) => {
  const stores = orders.reduce((acc: any, curr: any) => {
    const storeName = curr.storeName || "NexTrade";
    acc[storeName] = (acc[storeName] || 0) + 1;
    return acc;
  }, {});

  const performanceData = Object.entries(stores).map(([name, count]) => ({
    name,
    count: count as number,
    rating: 5.0
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mağaza Performansı</Text>
      <View style={styles.list}>
        {performanceData.map((seller, i) => (
          <View key={i} style={styles.card}>
            <View>
              <Text style={styles.sellerName}>{seller.name}</Text>
              <Text style={styles.orderCount}>{seller.count} Toplam Sipariş</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Star size={10} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.ratingText}>{seller.rating.toFixed(1)}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { paddingVertical: 20 },
  title: { color: '#ffffff', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 },
  list: { gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'rgba(3, 7, 18, 0.5)', borderWidth: 1, borderColor: '#1f2937', borderRadius: 16 },
  sellerName: { color: '#ffffff', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  orderCount: { color: '#64748b', fontSize: 10, fontWeight: '700', marginTop: 4 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 4 },
  ratingText: { color: '#f59e0b', fontSize: 11, fontWeight: '900' }
});