"use client";
import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ShoppingCart, Trash2, Check, ArrowRight } from "lucide-react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width / 2) - 20;

type Props = {
  product: any;
  onRemove: (id: string | number) => void;
};

const FavoriteProductCard = ({ product, onRemove }: Props) => {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  
  const displayImage = product.imageUrl || product.image;
  const displayTitle = product.productTitle || product.title || "İsimsiz Ürün";
  const productId = String(product.productId || product.id);

  const handleAddToCart = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <View style={styles.container}>
      {showToast && (
        <View style={styles.toast}>
          <View style={styles.toastLeft}>
            <View style={styles.checkBadge}><Check size={10} color="#fff" /></View>
            <Text style={styles.toastText}>EKLENDİ</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/shoppingCart")} style={styles.toastBtn}>
            <ArrowRight size={14} color="#2563eb" />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => router.push(`/product/${productId}`)}
        style={styles.card}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: displayImage }} style={styles.image} contentFit="cover" transition={500} />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.category}>{product.category || "GENEL"}</Text>
          <Text style={styles.title} numberOfLines={1}>{displayTitle}</Text>
          <Text style={styles.price}>₺{Number(product.price).toLocaleString('tr-TR')}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={handleAddToCart} style={styles.addBtn}>
            <ShoppingCart size={16} color="#000" />
            <Text style={styles.addBtnText}>EKLE</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => onRemove(product.id)} style={styles.removeBtn}>
            <Trash2 size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: CARD_WIDTH, margin: 8, paddingTop: 40 },
  card: { backgroundColor: '#0f172a', borderRadius: 30, padding: 15, paddingTop: 60, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  imageContainer: { position: 'absolute', top: -40, alignSelf: 'center', width: 110, height: 110, borderRadius: 25, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: '#1e293b' },
  image: { width: '100%', height: '100%' },
  infoContainer: { alignItems: 'center', marginBottom: 15 },
  category: { fontSize: 8, fontWeight: '900', color: '#ec4899', letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 14, fontWeight: '700', color: '#fff', textAlign: 'center' },
  price: { fontSize: 18, fontWeight: '900', color: '#fff', marginTop: 5, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 8 },
  addBtn: { flex: 1, height: 45, backgroundColor: '#fff', borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  addBtnText: { fontSize: 11, fontWeight: '900', color: '#000' },
  removeBtn: { width: 45, height: 45, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  toast: { position: 'absolute', top: -10, left: 10, right: 10, zIndex: 100, backgroundColor: '#2563eb', borderRadius: 15, padding: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  toastLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkBadge: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 3, borderRadius: 10 },
  toastText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  toastBtn: { backgroundColor: '#fff', padding: 5, borderRadius: 8 }
});

export default FavoriteProductCard;