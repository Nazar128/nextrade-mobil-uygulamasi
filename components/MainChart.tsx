import React from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export const MainChart = ({ data }: { data: any[] }) => {
  const screenWidth = Dimensions.get("window").width;
  const hasData = data && data.length > 0 && data.some(d => (d.satis || 0) > 0 || (d.ziyaret || 0) > 0);

  if (!hasData) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.title}>PERFORMANS ANALİZİ</Text>
        <ActivityIndicator color="#6366f1" />
        <Text style={styles.loadingText}>Veriler senkronize ediliyor...</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: "#0f172a",
    backgroundGradientTo: "#0f172a",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#6366f1" },
    fillShadowGradient: "#6366f1",
    fillShadowGradientOpacity: 0.2,
  };

  const chartData = {
    labels: data.map(d => d.name),
    datasets: [
      { data: data.map(d => d.satis || 0), color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`, strokeWidth: 2 },
      { data: data.map(d => d.ziyaret || 0), color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, strokeWidth: 2 }
    ]
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PERFORMANS ANALİZİ</Text>
      <LineChart data={chartData} width={screenWidth - 60} height={220} chartConfig={chartConfig} bezier style={styles.chart} withInnerLines={false} withOuterLines={false} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#0f172a' },
  emptyContainer: { height: 250, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 10, fontWeight: '900', color: '#64748b', letterSpacing: 1.5, marginBottom: 16, alignSelf: 'flex-start' },
  chart: { borderRadius: 16, marginLeft: -16 },
  loadingText: { color: '#475569', fontSize: 11, marginTop: 10 },
});