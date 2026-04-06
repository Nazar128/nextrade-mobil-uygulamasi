import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from "react-native";
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, AlertCircle } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type CartItem = {
  id: string;
  image: string;
  brand: string;
  title: string;
  price: number;
  quantity: number;
};
const Shopping = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartEmpty, setIsCartEmpty] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const savedCart = await AsyncStorage.getItem("cart");
    const items: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
    setCartItems(items);
    setIsCartEmpty(items.length === 0);
  };
  const updateCart = async (newItems: CartItem[]) => {
    setCartItems(newItems);
    setIsCartEmpty(newItems.length === 0);
    await AsyncStorage.setItem("cart", JSON.stringify(newItems));
  };
  const handleQuantity = (id: string, type: "inc" | "dec") => {
    const updatedItems = cartItems.map((item) => {
      if (item.id === id) {
        const newQty = type === "inc" ? item.quantity + 1 : item.quantity - 1;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    });
    updateCart(updatedItems);
  };
  const removeItem = (id: string) => {
    const filteredItems = cartItems.filter((item) => item.id !== id);
    updateCart(filteredItems);
  };
  const subTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subTotal > 5000 || cartItems.length === 0 ? 0 : 150;
  const total = subTotal + shipping;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.listSection}>
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
              </View>
              <View style={styles.info}>
                <Text style={styles.brand}>{item.brand}</Text>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.price}>{(item.price * item.quantity).toLocaleString()} TL</Text>
                <View style={styles.controls}>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity onPress={() => handleQuantity(item.id, "dec")} style={styles.qtyBtn}>
                      <Minus size={16} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => handleQuantity(item.id, "inc")} style={styles.qtyBtn}>
                      <Plus size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <ShoppingBag size={48} color="#2563eb" />
            </View>
            <Text style={styles.emptyTitle}>Sepetin Su An Bos</Text>
            <Text style={styles.emptySubtitle}>Harika urunlerimizi kesfetmek icin magazaya goz atmaya ne dersin?</Text>
            <TouchableOpacity onPress={() => router.push("/")} style={styles.startBtn}>
              <Text style={styles.startBtnText}>Alisverise Basla</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <CreditCard size={20} color="#2563eb" />
          <Text style={styles.summaryTitle}>Siparis Ozeti</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Ara Toplam</Text>
          <Text style={styles.summaryValue}>{subTotal.toLocaleString()} TL</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Kargo</Text>
          <Text style={[styles.summaryValue, shipping === 0 && { color: "#22c55e" }]}>
            {shipping === 0 ? "Bedava" : `${shipping} TL`}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Toplam</Text>
          <Text style={styles.totalValue}>{total.toLocaleString()} TL</Text>
        </View>
        {isCartEmpty ? (
          <View style={styles.alert}>
            <AlertCircle size={18} color="#f59e0b" />
            <Text style={styles.alertText}>Odeme adimina gecebilmek icin sepetinize en az bir urun eklemelisiniz.</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={() => router.push("/checkOut")} style={styles.checkoutBtn}>
            <Text style={styles.checkoutText}>ODEMEYE GEC</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  scrollContent: { paddingVertical: 16 },
  listSection: { paddingHorizontal: 16 },
  card: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 24, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", },
  imageContainer: {width: 90,height: 90, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16,justifyContent: "center", alignItems: "center",},
  image: { width: 70, height: 70 },
  info: { flex: 1, marginLeft: 16, justifyContent: "space-between" },
  brand: { color: "#666", fontSize: 10, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  title: { color: "#fff", fontSize: 16, fontWeight: "700" },
  price: { color: "#2563eb", fontSize: 15, fontWeight: "800" },
  controls: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  qtyRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#000", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", padding: 4,},
  qtyBtn: { padding: 4 },
  qtyText: { color: "#fff", paddingHorizontal: 12, fontWeight: "700" },
  removeBtn: { padding: 8 },
  emptyCard: { alignItems: "center", padding: 40, backgroundColor: "rgba(255,255,255,0.02)",borderRadius: 32, borderStyle: "dashed", borderWidth: 1,borderColor: "rgba(255,255,255,0.1)",},
  emptyIcon: { padding: 20, backgroundColor: "rgba(37,99,235,0.1)", borderRadius: 40, marginBottom: 20 },
  emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 8 },
  emptySubtitle: { color: "#666", textAlign: "center", fontSize: 14, lineHeight: 20 },
  startBtn: { marginTop: 24, backgroundColor: "#fff", paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  startBtnText: { color: "#000", fontWeight: "800" },
  summaryContainer: { margin: 16, padding: 24, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 32, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",},
  summaryHeader: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  summaryTitle: { color: "#fff", fontSize: 18, fontWeight: "800", marginLeft: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  summaryLabel: { color: "#999", fontSize: 14 },
  summaryValue: { color: "#fff", fontWeight: "700", fontSize: 14 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)", marginVertical: 16 },
  totalLabel: { color: "#fff", fontWeight: "800", fontSize: 16 },
  totalValue: { color: "#2563eb", fontSize: 24, fontWeight: "900" },
  alert: { flexDirection: "row", padding: 16, backgroundColor: "rgba(245,158,11,0.1)", borderRadius: 20, marginTop: 24, alignItems: "center",},
  alertText: { flex: 1, color: "#fcd34d", fontSize: 12, marginLeft: 10, lineHeight: 18 },
  checkoutBtn: { backgroundColor: "#2563eb", height: 60, borderRadius: 20, justifyContent: "center", alignItems: "center", marginTop: 24, shadowColor: "#2563eb", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,},
  checkoutText: { color: "#fff", fontWeight: "900", fontSize: 16, letterSpacing: 1 },
});

export default Shopping;