import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Svg, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
const { width } = Dimensions.get('window');
export const OrderMainChart = ({ orders }: any) => {
  const chartData = orders.slice(0, 7).reverse().map((o: any) => ({
    name: o.orderId?.substring(4, 9) || '...',
    sales: o.totalAmount || 0
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Satış Hacmi Trendi</Text>
        <View style={styles.liveContainer}>
          <View style={styles.pulseDot} />
          <Text style={styles.liveText}>Canlı Akış</Text>
        </View>
      </View>
      <View style={styles.chartWrapper}>
        <Svg height="220" width={width - 40} viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#2563eb" stopOpacity="0.4" />
              <Stop offset="1" stopColor="#2563eb" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Path
            d="M0,80 Q25,40 50,60 T100,20 L100,100 L0,100 Z"
            fill="url(#grad)"
          />
          <Path
            d="M0,80 Q25,40 50,60 T100,20"
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
          />
        </Svg>
        <View style={styles.xAxis}>
          {chartData.map((d: any, i: number) => (
            <Text key={i} style={styles.xText}>{d.name}</Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 320, width: '100%', paddingVertical: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: '#ffffff', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  liveContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pulseDot: { width: 8, height: 8, backgroundColor: '#3b82f6', borderRadius: 4 },
  liveText: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase' },
  chartWrapper: { flex: 1, position: 'relative' },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingHorizontal: 5 },
  xText: { color: '#475569', fontSize: 10, fontWeight: '900' }
});