import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowUpRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const images: { [key: string]: any } = {
  "kozmetik": require("@/assets/images/kozmetik-.png"),
  "kulaklik": require("@/assets/images/kulaklik-.png"),
  "ayakkabi": require("@/assets/images/ayakkabi-.png"),
  "evyasam": require("@/assets/images/evyasam-.png"),
};

export type Category = {
  id: number;
  title: string;
  imgKey: string;
  bgColor: string;
};

export const categoryData: Category[] = [
  { id: 1, title: "Kozmetik", imgKey: "kozmetik", bgColor: "#FAF5FF" },
  { id: 2, title: "Elektronik", imgKey: "kulaklik", bgColor: "#EFF6FF" },
  { id: 3, title: "Ayakkabı", imgKey: "ayakkabi", bgColor: "#FDF2F8" },
  { id: 4, title: "Ev & Yaşam", imgKey: "evyasam", bgColor: "#F0FDF4" },
];

const CategorySection = () => {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tarzını <Text style={styles.brandText}>Keşfet</Text></Text>
          <Text style={styles.subtitle}>En yeni koleksiyonları ve sana özel seçilmiş kategorileri incele.</Text>
        </View>
        <TouchableOpacity style={styles.allButton} onPress={() => router.push('/categories' as any)}>
          <Text style={styles.allButtonText}>Tüm Kategoriler</Text>
          <ArrowUpRight size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {categoryData.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            activeOpacity={0.9}
            onPress={() => router.push(`/category/${category.id}` as any)}
            style={[
              styles.card,
              { backgroundColor: category.bgColor },
              index === 0 ? styles.bigCard : index === 3 ? styles.wideCard : styles.standardCard
            ]}
          >
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{category.title}</Text>
              <Text style={styles.cardSubtitle}>Koleksiyonu İncele</Text>
            </View>

            <View style={styles.imageWrapper}>
              <Image 
                source={images[category.imgKey]} 
                style={styles.cardImage} 
                resizeMode="contain" 
              />
            </View>

            <View style={styles.iconBadge}>
              <ArrowUpRight size={18} color="#020617" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, paddingVertical: 40 },
  header: { marginBottom: 32 },
  title: { fontSize: 40, fontWeight: '900', color: '#1E293B', letterSpacing: -1 },
  brandText: { color: '#2563EB' },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 8, lineHeight: 22 },
  allButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  allButtonText: { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
  card: { borderRadius: 40, padding: 24, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
  bigCard: { width: '100%', height: 320 },
  wideCard: { width: '100%', height: 180 },
  standardCard: { width: (width - 55) / 2, height: 240 },
  textContainer: { zIndex: 10, marginBottom: 10 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  cardSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
  imageWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  cardImage: { width: '90%', height: '90%' },
  iconBadge: { position: 'absolute', bottom: 15, right: 15, width: 40, height: 40, backgroundColor: '#fff', borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4, zIndex: 10 }
});

export default CategorySection;