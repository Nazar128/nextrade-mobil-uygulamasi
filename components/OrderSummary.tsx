import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { db, auth } from "@/api/firebase";
import { doc, setDoc, onSnapshot, Unsubscribe } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Image } from 'expo-image';
type CartItem = {
  id: string;
  image: string;
  title: string;
  brand: string;
  price: number;
  quantity: number;
};
type AddressData = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  address: string;
};
type PaymentMethod = {
  method: "CARD" | "COD";
  token?: string;
  last4?: string;
  label?: string;
};
type OrderSummaryProps = {
  isFinalStep: boolean;
  addressData: AddressData | null;
  paymentMethod: PaymentMethod | null;
};
const OrderSummary = ({ isFinalStep, addressData, paymentMethod }: OrderSummaryProps) => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    const loadCart = async () => {
      try {
        const localCartRaw = await AsyncStorage.getItem("cart");
        const localCart = (JSON.parse(localCartRaw || "[]") as CartItem[]).map((item) => ({
          ...item,
          price: Number(item.price),
          quantity: Number(item.quantity),
        }));

        if (auth.currentUser) {
          const cartRef = doc(db, "carts", auth.currentUser.uid);
          unsubscribe = onSnapshot(
            cartRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data() as { items?: CartItem[] };
                const remoteItems = (data.items || []).map((item) => ({
                  ...item,
                  price: Number(item.price),
                  quantity: Number(item.quantity),
                }));
                setCartItems(remoteItems.length > 0 ? remoteItems : localCart);
              } else {
                setCartItems(localCart);
              }
              setLoading(false);
            },
            () => {
              setCartItems(localCart);
              setLoading(false);
            }
          );
        } else {
          setCartItems(localCart);
          setLoading(false);
        }
      } catch {
        setCartItems([]);
        setLoading(false);
      }
    };
    loadCart();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 5000 || cartItems.length === 0 ? 0 : 150;
  const total = subtotal + shipping;
  const handleConfirmOrder = async () => {
    if (!isFinalStep || !paymentMethod || !addressData) return;

    try {
      const orderId = `ORD-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
      const orderData = {
        orderId,
        userId: auth.currentUser?.uid || "guest",
        items: cartItems,
        address: addressData,
        payment: {
          type: paymentMethod.method,
          transactionId: paymentMethod.token || "COD_PENDING",
          last4: paymentMethod.last4 || null,
        },
        totalAmount: total,
        status: paymentMethod.method === "CARD" ? "paid" : "pending",
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "orders", orderId), orderData);

      if (auth.currentUser) {
        await setDoc(doc(db, "carts", auth.currentUser.uid), { items: [] });
      }

      await AsyncStorage.removeItem("cart");
      router.push({ pathname: "/success", params: { orderId } });
    } catch {
      Alert.alert("Hata", "Siparis olusturulurken bir sorun olustu.");
    }
  };

  if (loading) {
    return <ActivityIndicator size="small" color="#666" style={{ padding: 20 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Siparis Ozeti</Text>

      <View style={styles.itemsList}>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <View>
                <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" transition={500}  cachePolicy="disk"  />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.quantity}</Text>
                </View>
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.itemBrand}>{item.brand}</Text>
              </View>
            </View>
            <Text style={styles.itemPrice}>{(item.price * item.quantity).toLocaleString("tr-TR")} TL</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Ara Toplam</Text>
          <Text style={styles.priceValue}>{subtotal.toLocaleString("tr-TR")} TL</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Kargo</Text>
          <Text style={[styles.priceValue, shipping === 0 && styles.freeShipping]}>
            {shipping === 0 ? "Ucretsiz" : `${shipping} TL`}
          </Text>
        </View>

        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Toplam</Text>
          <Text style={styles.totalValue}>{total.toLocaleString("tr-TR")} TL</Text>
        </View>
      </View>

      <TouchableOpacity onPress={handleConfirmOrder} disabled={!isFinalStep} style={[styles.confirmBtn, !isFinalStep && styles.disabledBtn]}>
        <Text style={[styles.confirmBtnText, !isFinalStep && styles.disabledBtnText]}>
          {isFinalStep ? "Siparisi Onayla" : "Odemeyi Dogrulayin"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 32, padding: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  title: { color: "#fff", fontSize: 18, fontWeight: "800", marginBottom: 20 },
  itemsList: { gap: 16, marginBottom: 20 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  itemImage: { width: 48, height: 48, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)" },
  badge: { position: "absolute", top: -6, right: -6, backgroundColor: "#2563eb", borderRadius: 10, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  itemDetails: { marginLeft: 12, flex: 1 },
  itemTitle: { color: "#fff", fontSize: 13, fontWeight: "700" },
  itemBrand: { color: "#666", fontSize: 10, fontWeight: "800", textTransform: "uppercase", marginTop: 2 },
  itemPrice: { color: "#fff", fontSize: 13, fontWeight: "900", marginLeft: 8 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginBottom: 20 },
  priceContainer: { gap: 10 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceLabel: { color: "#666", fontSize: 13, fontWeight: "600" },
  priceValue: { color: "#fff", fontSize: 13, fontWeight: "700" },
  freeShipping: { color: "#22c55e", fontWeight: "800" },
  totalRow: { marginTop: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)" },
  totalLabel: { color: "#fff", fontSize: 16, fontWeight: "600" },
  totalValue: { color: "#3b82f6", fontSize: 22, fontWeight: "900" },
  confirmBtn: { backgroundColor: "#16a34a", padding: 18, borderRadius: 20, marginTop: 24, alignItems: "center", shadowColor: "#16a34a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3,shadowRadius: 8,},
  disabledBtn: { backgroundColor: "rgba(255,255,255,0.05)", shadowOpacity: 0 },
  confirmBtnText: { color: "#fff", fontWeight: "900", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
  disabledBtnText: { color: "#444" },
});

export default OrderSummary;