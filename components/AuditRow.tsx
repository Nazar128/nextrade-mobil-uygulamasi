import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Package } from "lucide-react-native";
import { Image } from 'expo-image';
export const AuditRow = ({ product, onPreview, onReject }: any) => {
  const img = product.images?.[0] || product.image;
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.imgWrap}>
          {img ? <Image source={{ uri: img }} style={styles.img} contentFit="cover" transition={500}  cachePolicy="disk"  /> : <Package size={20} color="#1e293b" />}
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{product.title}</Text>
          <Text style={styles.cat}>{product.categoryTitle}</Text>
        </View>
        <Text style={styles.price}>{product.price} TL</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onPreview} style={styles.btnIncele}><Text style={styles.btnInceleText}>İNCELE</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => onReject(product.id)} style={styles.btnRed}><Text style={styles.btnRedText}>RED</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#0f172a', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  imgWrap: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#020617', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  img: { width: '100%', height: '100%' },
  info: { flex: 1 },
  name: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  cat: { color: '#3b82f6', fontSize: 11 },
  price: { color: 'white', fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btnIncele: { flex: 2, backgroundColor: 'white', height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  btnInceleText: { color: 'black', fontSize: 10, fontWeight: '900' },
  btnRed: { flex: 1, backgroundColor: '#f43f5e15', height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f43f5e30' },
  btnRedText: { color: '#f43f5e', fontSize: 10, fontWeight: '900' }
});