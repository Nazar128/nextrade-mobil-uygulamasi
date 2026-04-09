"use client";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, SafeAreaView } from "react-native";
import { db, auth } from "@/api/firebase";
import { collection, query, getDocs, where, orderBy, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Store, Clock, LayoutGrid, List as ListIcon, ShoppingBag, Heart, ArrowRight } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface Product {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  sellerName: string;
  sellerId: string;
  createdAt: any;
}

interface FollowedStore {
  id: string;
  displayName: string;
  email: string;
  status: string;
}

export default function FollowedStoresPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<FollowedStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchFollowedData(user.uid);
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchFollowedData = async (userId: string) => {
    setIsLoading(true);
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      const followedIds = userDoc.data()?.followedStores || [];

      if (followedIds.length === 0) {
        setProducts([]);
        setStores([]);
        return;
      }

      const storesData: FollowedStore[] = [];
      for (const storeId of followedIds) {
        const sDoc = await getDoc(doc(db, "users", storeId));
        if (sDoc.exists()) {
          const data = sDoc.data();
          storesData.push({ 
            id: sDoc.id, 
            displayName: data.displayName || "Mağaza",
            email: data.email,
            status: data.status 
          });
        }
      }
      setStores(storesData);

      const productsQuery = query(
        collection(db, "products"),
        where("sellerId", "in", followedIds),
        orderBy("createdAt", "desc")
      );

      const pSnapshot = await getDocs(productsQuery);
      const pData = pSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      
      setProducts(pData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.heartIconBox}>
              <Heart size={24} color="#fff" fill="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Takip Ettiklerim</Text>
              <Text style={styles.headerSubtitle}>FAVORİ MAĞAZALAR VE ÜRÜNLER</Text>
            </View>
          </View>
          
          <View style={styles.viewToggle}>
            <TouchableOpacity 
              onPress={() => setViewMode("grid")}
              style={[styles.toggleBtn, viewMode === "grid" && styles.toggleBtnActive]}
            >
              <LayoutGrid size={18} color={viewMode === "grid" ? "#fff" : "#64748b"} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setViewMode("list")}
              style={[styles.toggleBtn, viewMode === "list" && styles.toggleBtnActive]}
            >
              <ListIcon size={18} color={viewMode === "list" ? "#fff" : "#64748b"} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TAKİP EDİLEN MAĞAZALAR</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storesScroll}>
            {stores.map(store => (
              <TouchableOpacity key={store.id} style={styles.storeCard}>
                <View style={styles.logoContainer}>
                  <View style={styles.initialsContainer}>
                    <Text style={styles.initialsText}>{store.displayName.charAt(0).toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.storeName} numberOfLines={1}>{store.displayName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={16} color="#2563eb" />
            <Text style={styles.sectionTitle}>Son Yüklenenler</Text>
          </View>

          {products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Store size={40} color="#1e293b" />
              <Text style={styles.emptyTitle}>Henüz paylaşım yok</Text>
              <Text style={styles.emptySubtitle}>Takip ettiğin mağazaların ürünleri burada görünecek.</Text>
            </View>
          ) : (
            <View style={viewMode === "grid" ? styles.gridContainer : styles.listContainer}>
              {products.map((product) => (
                <View 
                  key={product.id} 
                  style={[
                    styles.productCard, 
                    viewMode === "list" && styles.productCardList
                  ]}
                >
                  <View style={[styles.imageWrapper, viewMode === "list" && styles.imageWrapperList]}>
                    <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>YENİ</Text>
                    </View>
                  </View>

                  <View style={[styles.productContent, viewMode === "list" && styles.productContentList]}>
                    <View style={styles.sellerRow}>
                      <Store size={10} color="#2563eb" />
                      <Text style={styles.sellerName}>{product.sellerName}</Text>
                    </View>
                    <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
                    
                    <View style={styles.priceRow}>
                      <View>
                        {product.oldPrice && <Text style={styles.oldPrice}>{product.oldPrice.toLocaleString()} TL</Text>}
                        <Text style={styles.currentPrice}>{product.price.toLocaleString()} <Text style={styles.currency}>TL</Text></Text>
                      </View>
                      <TouchableOpacity style={styles.cartBtn}>
                        <ShoppingBag size={18} color="#fff" />
                        <View style={styles.cartArrow}>
                          <ArrowRight size={8} color="#2563eb" />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loaderContainer: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 20, paddingVertical: 25, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 15 },
  heartIconBox: { width: 50, height: 50, borderRadius: 18, backgroundColor: "#2563eb", justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "900" },
  headerSubtitle: { color: "#475569", fontSize: 9, fontWeight: "800", letterSpacing: 1, marginTop: 2 },
  viewToggle: { flexDirection: "row", backgroundColor: "#0f172a", padding: 5, borderRadius: 15, borderWidth: 1, borderColor: "#1e293b" },
  toggleBtn: { padding: 8, borderRadius: 10 },
  toggleBtnActive: { backgroundColor: "#2563eb" },
  section: { marginTop: 10 },
  sectionLabel: { color: "#475569", fontSize: 10, fontWeight: "900", letterSpacing: 2, paddingHorizontal: 20, marginBottom: 15 },
  storesScroll: { paddingHorizontal: 20, gap: 15 },
  storeCard: { alignItems: "center", gap: 8, width: 75 },
  logoContainer: { width: 70, height: 70, borderRadius: 25, borderWidth: 2, borderColor: "#1e293b", padding: 3, overflow: "hidden", backgroundColor: "#0f172a" },
  initialsContainer: { width: "100%", height: "100%", borderRadius: 22, backgroundColor: "#2563eb", justifyContent: "center", alignItems: "center" },
  initialsText: { color: "#fff", fontSize: 24, fontWeight: "900" },
  storeName: { color: "#fff", fontSize: 10, fontWeight: "800", textAlign: "center" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, marginTop: 25, marginBottom: 20 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "900" },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 15, gap: 15 },
  listContainer: { paddingHorizontal: 20, gap: 15 },
  productCard: { backgroundColor: "#0f172a", borderRadius: 30, padding: 12, width: (width - 45) / 2, borderWidth: 1, borderColor: "#1e293b" },
  productCardList: { width: "100%", flexDirection: "row", gap: 15, padding: 15 },
  imageWrapper: { width: "100%", aspectRatio: 0.9, borderRadius: 22, overflow: "hidden", backgroundColor: "#1e293b" },
  imageWrapperList: { width: 110, height: 110, aspectRatio: 1 },
  productImage: { width: "100%", height: "100%" },
  newBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "rgba(37, 99, 235, 0.9)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  newBadgeText: { color: "#fff", fontSize: 8, fontWeight: "900" },
  productContent: { marginTop: 12, flex: 1 },
  productContentList: { marginTop: 0, justifyContent: "space-between" },
  sellerRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  sellerName: { color: "#2563eb", fontSize: 9, fontWeight: "900" },
  productTitle: { color: "#fff", fontSize: 14, fontWeight: "700", lineHeight: 18 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 10 },
  oldPrice: { color: "#475569", fontSize: 10, textDecorationLine: "line-through", fontWeight: "700" },
  currentPrice: { color: "#fff", fontSize: 18, fontWeight: "900" },
  currency: { fontSize: 11, color: "#475569" },
  cartBtn: { width: 44, height: 44, backgroundColor: "#2563eb", borderRadius: 15, justifyContent: "center", alignItems: "center" },
  cartArrow: { position: "absolute", top: -2, right: -2, width: 14, height: 14, backgroundColor: "#fff", borderRadius: 7, justifyContent: "center", alignItems: "center" },
  emptyContainer: { paddingVertical: 60, alignItems: "center", backgroundColor: "rgba(255,255,255,0.02)", marginHorizontal: 20, borderRadius: 30, borderStyle: "dashed", borderWidth: 1, borderColor: "#1e293b" },
  emptyTitle: { color: "#fff", fontSize: 16, fontWeight: "900", marginTop: 15 },
  emptySubtitle: { color: "#475569", fontSize: 12, textAlign: "center", marginTop: 8, paddingHorizontal: 40 }
});