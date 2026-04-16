import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, 
  StyleSheet, Modal, ActivityIndicator, Alert, ScrollView 
} from 'react-native';
import { 
  Edit3, Trash2, MessageSquare, X, Star, 
  CheckCircle2, Calendar, Image as ImageIcon 
} from 'lucide-react-native';
import { collection, query, where, onSnapshot, deleteDoc, doc, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from '@/api/firebase';
import ManagerStats from '@/components/ManagerStats';
import { FlashList } from "@shopify/flash-list";
import { Image } from 'expo-image';
export default function ProductListMobile({ onEdit }: { onEdit: (p: any) => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "products"), where("sellerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openReviews = async (product: any) => {
    setSelectedProduct(product);
    setLoadingReviews(true);
    try {
      const q = query(
        collection(db, "reviews"), 
        where("productId", "==", String(product.id)),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setProductReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleDelete = (productId: string) => {
    Alert.alert("Ürünü Sil", "Bu ürünü silmek istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      { 
        text: "Sil", 
        style: "destructive", 
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "products", productId));
          } catch (err) { console.error(err); }
        } 
      }
    ]);
  };

  const maskName = (name: any) => {
    if (typeof name !== 'string' || !name || name.trim() === "" || name === "Müşteri") {
      return "M*****";
    }
    
    try {
      const parts = name.trim().split(" ");
      return parts.map(p => {
        if (!p || p.length === 0) return "*";
        return p[0] + "*".repeat(Math.max(1, p.length - 1));
      }).join(" ");
    } catch (e) {
      return "M*****";
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#6366f1" size="large" /></View>;

  return (
    <View style={styles.container}>
      <FlashList
        data={products}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={() => (
          <>
            <ManagerStats />
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>ÜRÜN PORTFÖYÜ</Text>
            </View>
          </>
        )}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.cardHeader}>
              <View style={styles.imgContainer}>
                <Image source={{ uri: item.imageUrl }} style={styles.productImg} contentFit="cover" transition={500}  cachePolicy="disk"  />
                <View style={[styles.statusDot, { backgroundColor: item.status === 'pending' ? '#f59e0b' : '#10b981' }]} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.productStatus}>{item.status === 'pending' ? 'İnceleme' : 'Satışta'}</Text>
              </View>
              <Text style={styles.priceText}>{item.price} ₺</Text>
            </View>
            <View style={styles.cardFooter}>
               <View style={styles.stockSection}>
                  <Text style={[styles.stockText, { color: item.stock < 5 ? '#f59e0b' : '#10b981' }]}>Stok: {item.stock}</Text>
               </View>
               <View style={styles.actionButtons}>
                 <TouchableOpacity onPress={() => openReviews(item)} style={styles.actionBtn}><MessageSquare size={18} color="#f59e0b" /></TouchableOpacity>
                 <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionBtn}><Edit3 size={18} color="#6366f1" /></TouchableOpacity>
                 <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}><Trash2 size={18} color="#f87171" /></TouchableOpacity>
               </View>
            </View>
          </View>
        )}
      />

      <Modal visible={!!selectedProduct} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Değerlendirmeler</Text>
              <TouchableOpacity onPress={() => setSelectedProduct(null)} style={styles.closeBtn}>
                <X color="#94a3b8" size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 20 }}>
              {loadingReviews ? <ActivityIndicator color="#6366f1" /> : productReviews.map((rev) => (
                <View key={rev.id} style={styles.reviewCard}>
                  <Text style={styles.userName}>{maskName(rev.userName)}</Text>
                  <Text style={styles.commentText}>{rev.comment}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionHeader: { marginVertical: 20, borderLeftWidth: 4, borderLeftColor: '#6366f1', paddingLeft: 12 },
  sectionLabel: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  productCard: { backgroundColor: '#1e293b66', borderRadius: 24, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  imgContainer: { position: 'relative' },
  productImg: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#020617' },
  statusDot: { position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#0f172a' },
  productInfo: { flex: 1, marginLeft: 12 },
  productTitle: { color: '#f8fafc', fontWeight: 'bold', fontSize: 15 },
  productStatus: { color: '#64748b', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  priceText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 12 },
  stockSection: { flex: 1 },
  stockText: { fontSize: 12, fontWeight: 'bold' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 38, height: 38, backgroundColor: '#0f172a', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0f172a', height: '80%', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  modalHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  modalTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  closeBtn: { padding: 5 },
  reviewCard: { backgroundColor: '#1e293b', padding: 15, borderRadius: 15, marginBottom: 10 },
  userName: { color: '#fff', fontWeight: 'bold', fontSize: 13, marginBottom: 5 },
  commentText: { color: '#94a3b8', fontSize: 12, fontStyle: 'italic' }
});