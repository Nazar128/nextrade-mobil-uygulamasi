import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet,  ActivityIndicator, Dimensions } from "react-native";
import { TrendingUp } from "lucide-react-native";
import { db } from "@/api/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import ProductCard from "./ProductCard";
import { FlashList } from "@shopify/flash-list";
const { width } = Dimensions.get("window");

const BestSellers = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("status", "==", "approved"),
          orderBy("salesCount", "desc"),
          limit(4)
        );
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("BestSellers Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <TrendingUp size={20} color="#10b981" />
        </View>
        <Text style={styles.title}>
          ÇOK <Text style={styles.titleHighlight}>SATANLAR</Text>
        </Text>
      </View>

      <FlashList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: { paddingVertical: 30, paddingHorizontal: 16, backgroundColor: "#0f172a" },
  loaderContainer: { paddingVertical: 40, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  iconBox: { paddingVertical: 10, paddingHorizontal: 12, backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: 16 },
  title: { fontSize: 24, fontWeight: "900", color: "#FFF", letterSpacing: -1 },
  titleHighlight: { color: "#475569" },
  row: { justifyContent: "space-between", marginBottom: 8 },
  listContainer: { paddingBottom: 20 }
});

export default BestSellers;