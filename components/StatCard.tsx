import React from 'react';
import { View, Text, StyleSheet, Dimensions, ViewStyle } from 'react-native';

const { width } = Dimensions.get('window');

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: { value: string; isPositive: boolean };
  color?: string;
  style?: ViewStyle;
}

export const StatCard = ({ label, value, icon, subtitle, trend, color = '#3b82f6', style }: StatCardProps) => (
  <View style={[styles.card, style]}>
    <View style={styles.header}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        {React.isValidElement(icon) 
          ? React.cloneElement(icon as React.ReactElement<any>, { 
              size: 18, 
              color: color 
            }) 
          : icon}
      </View>
      {trend && (
        <View style={[styles.trendBadge, { backgroundColor: trend.isPositive ? '#10b98120' : '#ef444420' }]}>
          <Text style={[styles.trendText, { color: trend.isPositive ? '#10b981' : '#ef4444' }]}>
            {trend.value}
          </Text>
        </View>
      )}
    </View>

    <View style={styles.content}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: '#0f172a', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#1e293b', justifyContent: 'space-between', minHeight: 110,},
  header: {flexDirection: 'row',justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,},
  iconContainer: {padding: 8,borderRadius: 12, alignItems: 'center',justifyContent: 'center',},
  trendBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,},
  trendText: { fontSize: 9, fontWeight: 'bold', },
  content: { gap: 2,},
  label: { color: '#64748b', fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5,},
  valueRow: {flexDirection: 'row',alignItems: 'baseline',gap: 4,flexWrap: 'wrap',},
  value: {color: 'white',fontSize: 20,fontWeight: 'bold',},
  subtitle: {color: '#475569',fontSize: 8,fontStyle: 'italic',},
});