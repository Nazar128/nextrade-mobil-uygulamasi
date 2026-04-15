import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Hammer, Cog, Clock } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function MaintenancePage() {
  return (
    <View style={styles.container}>
      <View style={styles.glowContainer}>
        <View style={styles.glow} />
        <View style={styles.iconBox}>
          <Hammer size={64} color="#2563eb" />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          SİZE DAHA İYİ BİR{'\n'}
          <Text style={styles.highlight}>NEXTRADE</Text>{'\n'}
          HAZIRLIYORUZ
        </Text>
        
        <Text style={styles.description}>
          Sistem güncellemeleri nedeniyle kısa bir süreliğine kapalıyız.
        </Text>

        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Clock size={16} color="rgba(255,255,255,0.6)" />
            <Text style={styles.badgeText}>YAKINDA BURADAYIZ</Text>
          </View>
          <View style={styles.badge}>
            <Cog size={16} color="rgba(255,255,255,0.6)" />
            <Text style={styles.badgeText}>TEKNİK GÜNCELLEME</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>NEXTRADE INFRASTRUCTURE V2.4.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0d10', alignItems: 'center', justifyContent: 'center', padding: 24 },
  glowContainer: { position: 'relative', marginBottom: 48, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 200, height: 200, backgroundColor: 'rgba(37, 99, 235, 0.2)', borderRadius: 100 },
  iconBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 32, borderRadius: 48 },
  content: { alignItems: 'center', width: '100%' },
  title: { fontSize: 32, fontWeight: '900', color: 'white', textAlign: 'center', letterSpacing: -1, lineHeight: 36 },
  highlight: { color: '#2563eb' },
  description: { fontSize: 14, fontWeight: '700', color: '#6b7280', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 2, marginTop: 24, maxWidth: 280 },
  badgeRow: { flexDirection: 'column', gap: 12, marginTop: 40, width: '100%', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 16 },
  badgeText: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  footer: { position: 'absolute', bottom: 48 },
  footerText: { fontSize: 9, color: '#374151', fontWeight: '900', letterSpacing: 5, textAlign: 'center' }
});