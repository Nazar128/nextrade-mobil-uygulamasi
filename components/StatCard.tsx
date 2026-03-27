import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;

interface StatCardProps {
  label: string;
  value: string | number;
  icon: any; 
  subtitle?: string;
  trend?: { value: string; isPositive: boolean };
  color: string;
}

export const StatCard = ({ label, value, icon: Icon, subtitle, trend, color }: StatCardProps) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Icon size={18} color={color} />
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
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    justifyContent: 'space-between',
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  content: {
    gap: 2,
  },
  label: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#475569',
    fontSize: 8,
    fontStyle: 'italic',
  },
});