"use client";
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity,  ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { Heart, Trash2, ArrowRight } from 'lucide-react-native';
import { db, auth } from "@/api/firebase";
import { collection, onSnapshot, doc, deleteDoc, writeBatch } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import FavoriteProductCard from '@/components/FavoriteProductCard';
import { FlashList } from "@shopify/flash-list";
export default function FavoritesPage({ navigation }: any) {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      if (!loading) setLoading(false);
      return;
    }
    const favRef = collection(db, "users", currentUser.uid, "favorites");
    const unsubscribe = onSnapshot(favRef, (snapshot) => {
      setFavorites(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const removeFavorite = async (id: string | number) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, "users", currentUser.uid, "favorites", String(id)));
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  const clearAll = async () => {
    if (!currentUser || favorites.length === 0) return;
    Alert.alert("Listeyi Temizle", "Favori listenizdeki tüm ürünler silinecek. Emin misiniz?", [
      { text: "İptal", style: "cancel" },
      { text: "Evet, Temizle", style: "destructive", onPress: async () => {
          const batch = writeBatch(db);
          favorites.forEach((fav) => {
            const docRef = doc(db, "users", currentUser.uid, "favorites", String(fav.id));
            batch.delete(docRef);
          });
          await batch.commit();
        }
      }
    ]);
  };

  if (loading) return (
    <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#ec4899" /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.iconContainer}><Heart size={28} color="#f472b6" fill="#f472b6" /></View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>FAVORİLERİM</Text>
            <Text style={styles.subtitle}>Seçtiğin {favorites.length} özel parça.</Text>
          </View>
        </View>
        {favorites.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
            <Trash2 size={16} color="#fff" /><Text style={styles.clearButtonText}>LİSTEYİ SIFIRLA</Text>
          </TouchableOpacity>
        )}
      </View>

      {favorites.length > 0 ? (
        <FlashList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <FavoriteProductCard product={item} onRemove={removeFavorite} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}><Heart size={48} color="rgba(255,255,255,0.1)" /></View>
          <Text style={styles.emptyTitle}>LİSTE ŞU AN BOŞ</Text>
          <TouchableOpacity style={styles.exploreButton} onPress={() => navigation?.navigate('Home')}>
            <Text style={styles.exploreButtonText}>KEŞFETMEYE BAŞLA</Text>
            <ArrowRight size={18} color="#000" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loaderContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 25, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconContainer: { width: 60, height: 60, backgroundColor: '#1e0031', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTextContainer: { marginLeft: 15 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  subtitle: { fontSize: 13, color: '#64748b', fontWeight: '500', fontStyle: 'italic' },
  clearButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b', paddingVertical: 12, borderRadius: 15, gap: 8 },
  clearButtonText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  listContent: { padding: 10 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.02)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: 'rgba(255,255,255,0.3)', letterSpacing: 2, marginBottom: 30, textAlign: 'center' },
  exploreButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 25, paddingVertical: 18, borderRadius: 20, gap: 10 },
  exploreButtonText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 }
});