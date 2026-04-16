import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { db } from "@/api/firebase";
import { collection, query, where, limit, getDocs, orderBy } from "firebase/firestore";
import ProductCard from "./ProductCard";
import { FlashList } from "@shopify/flash-list";
const { width } = Dimensions.get("window");
const FeaturedProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const flashListRef = React.useRef<any>(null);
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("status", "==", "approved"),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Featured Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const scrollToIndex = (direction: "next" | "prev") => {
    if (!flashListRef.current) return;
    flashListRef.current.scrollToOffset({
      offset: direction === "next" ? width * 0.8 : 0,
      animated: true,
    });
  };

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
        <View>
          <Text style={styles.subTitle}>KEŞFETMEYE BAŞLA</Text>
          <Text style={styles.title}>Öne Çıkan Ürünler</Text>
        </View>

        <View style={styles.navButtons}>
          <TouchableOpacity onPress={() => scrollToIndex("prev")} style={styles.navButton}>
            <ChevronLeft size={20} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scrollToIndex("next")} style={styles.navButton}>
            <ChevronRight size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlashList
        ref={flashListRef}
        data={products}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width * 0.7 + 16}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard product={item} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: { paddingVertical: 30, paddingHorizontal: 16,  backgroundColor: "#0f172a" },
  loaderContainer: { height: 200, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "center", alignItems: "flex-end", paddingHorizontal: 20, marginBottom: 20 },
  subTitle: { color: "#3b82f6", fontSize: 10, fontWeight: "bold", letterSpacing: 2, marginBottom: 4 },
  title: { color: "#FFF", fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  navButtons: { flexDirection: "row", gap: 8 },
  navButton: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)" },
  listContent: { paddingHorizontal: 4 ,justifyContent: "center", alignItems: "center"},
  cardWrapper: { width: width * 0.7, marginRight: 2}
});

export default FeaturedProducts;