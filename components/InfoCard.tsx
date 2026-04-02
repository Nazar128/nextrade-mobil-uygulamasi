import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const InfoCard = ({ icon, title, description }: InfoCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 32, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  iconContainer: { backgroundColor: '#EFF6FF', padding: 12, borderRadius: 16, alignSelf: 'flex-start', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#020617', marginBottom: 8 },
  description: { fontSize: 14, color: '#E2E8F0', lineHeight: 20 }
});

export default InfoCard;