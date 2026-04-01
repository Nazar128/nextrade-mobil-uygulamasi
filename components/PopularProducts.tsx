import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { Sparkles } from "lucide-react-native";
import { db } from "@/api/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import ProductCard from "./ProductCard";

const PopularProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("status", "==", "approved"),
          where("rating", ">=", 4.7),
          orderBy("rating", "desc"),
          limit(4)
        );
        const querySnapshot = await getDocs(q);
        setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Popular Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <View style={styles.iconBox}>
            <Sparkles size={20} color="#3b82f6" />
          </View>
          <Text style={styles.title}>
            <Text style={styles.titleBlue}>POPÜLER</Text> ÜRÜNLER
          </Text>
        </View>
        
        <TouchableOpacity>
          <Text style={styles.seeAll}>HEPSİNİ GÖR</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: { paddingVertical: 30, paddingHorizontal: 16, backgroundColor: "#0f172a" },
  loaderContainer: { height: 200, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  titleGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBox: { padding: 10, backgroundColor: "rgba(59, 130, 246, 0.1)", borderRadius: 14 },
  title: { fontSize: 20, fontWeight: "900", color: "#FFF", letterSpacing: -0.5 },
  titleBlue: { color: "#3b82f6" },
  seeAll: { fontSize: 10, fontWeight: "bold", color: "#64748b", letterSpacing: 1, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)", paddingBottom: 2 },
  row: { justifyContent: "space-between" },
  listContainer: { paddingBottom: 10 }
});

export default PopularProducts;