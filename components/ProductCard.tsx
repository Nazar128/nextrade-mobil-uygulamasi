import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Animated,
  Platform 
} from "react-native";
import { ShoppingCart, Star, Heart, ArrowRight, CheckCircle2 } from "lucide-react-native";
import { db, auth } from "@/api/firebase";
import { doc, setDoc, deleteDoc, onSnapshot, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "@firebase/auth";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 24;

const ProductCard = ({ product }: { product: any }) => {
  const navigation = useNavigation<any>();
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  
  const scaleAnim = new Animated.Value(1);
  const toastAnim = new Animated.Value(-100);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser || !product?.id) {
      setIsFavorite(false);
      return;
    }

    const productIdStr = String(product.id);
    const favRef = doc(db, "users", currentUser.uid, "favorites", productIdStr);
    
    const unsubscribe = onSnapshot(favRef, (docSnap) => {
      setIsFavorite(docSnap.exists());
    }, (err) => console.error("Firestore Hatası:", err));
    
    return () => unsubscribe();
  }, [currentUser, product?.id]);

  const toggleFavorite = async () => {
    if (!currentUser) return;

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    const productIdStr = String(product.id);
    const favRef = doc(db, "users", currentUser.uid, "favorites", productIdStr);

    try {
      if (isFavorite) {
        await deleteDoc(favRef);
      } else {
        await setDoc(favRef, {
          productId: productIdStr,
          productTitle: product.title || "İsimsiz Ürün",
          price: product.price || 0,
          imageUrl: product.imageUrl || product.image || "https://via.placeholder.com/150",
          addedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Favori hatası:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!currentUser) return;

    const cartRef = doc(db, "users", currentUser.uid, "cart", "currentCart");
    
    try {
      const cartSnap = await getDoc(cartRef);
      const cartItem = {
        id: String(product.id),
        title: product.title,
        price: Number(product.price),
        image: product.imageUrl || product.image,
        quantity: 1
      };

      if (cartSnap.exists()) {
        await updateDoc(cartRef, {
          items: arrayUnion(cartItem)
        });
      } else {
        await setDoc(cartRef, { items: [cartItem] });
      }

      triggerToast();
    } catch (error) {
      console.error("Sepet hatası:", error);
    }
  };

  const triggerToast = () => {
    setShowToast(true);
    Animated.spring(toastAnim, { toValue: 20, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(toastAnim, { toValue: -100, duration: 300, useNativeDriver: true }).start(() => setShowToast(false));
    }, 2500);
  };

  if (!product) return null;

  return (
    <View style={styles.container}>
      {showToast && (
        <Animated.View style={[styles.toast, { transform: [{ translateY: toastAnim }] }]}>
          <View style={styles.toastContent}>
            <CheckCircle2 size={16} color="#FFF" />
            <Text style={styles.toastText}>Sepete Eklendi</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
            <ArrowRight size={16} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      )}

   
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.imageUrl || product.image || "https://via.placeholder.com/150" }} 
            style={styles.image}
          />
          <TouchableOpacity style={styles.favButton} onPress={toggleFavorite}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Heart 
                size={20} 
                color={isFavorite ? "#ef4444" : "#FFF"} 
                fill={isFavorite ? "#ef4444" : "transparent"} 
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>{product.brand || "NexTrade"}</Text>
            <View style={styles.ratingBox}>
              <Star size={10} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.ratingText}>{product.rating || "5.0"}</Text>
            </View>
          </View>
          <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        </View>
      

      <View style={styles.footer}>
        <Text style={styles.price}>₺{Number(product.price).toLocaleString('tr-TR')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <ShoppingCart size={16} color="#0f172a" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { width: CARD_WIDTH, backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: 24, padding: 12, margin: 8, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)", ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }, android: { elevation: 4 } }) },
    imageContainer: { height: 160, borderRadius: 20, overflow: "hidden", marginBottom: 10, backgroundColor: "#0f172a" },
    image: { width: "100%", height: "100%", resizeMode: "cover" },
    favButton: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(15, 23, 42, 0.6)", padding: 8, borderRadius: 12 },
    infoContainer: { paddingHorizontal: 4 },
    brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
    brandText: { fontSize: 10, color: "#3b82f6", fontWeight: "900", letterSpacing: 1 },
    ratingBox: { flexDirection: "row", alignItems: "center", gap: 4 },
    ratingText: { fontSize: 10, color: "#94a3b8", fontWeight: "700" },
    title: { fontSize: 14, fontWeight: "bold", color: "#FFF", height: 36 },
    footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingHorizontal: 4 },
    price: { fontSize: 18, fontWeight: "900", color: "#FFF" },
    addButton: { backgroundColor: "#FFF", padding: 10, borderRadius: 12 },
    toast: { position: "absolute", top: 0, left: 10, right: 10, zIndex: 100, backgroundColor: "#3b82f6", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 16 },
    toastContent: { flexDirection: "row", alignItems: "center", gap: 8 },
    toastText: { color: "#FFF", fontSize: 12, fontWeight: "bold" }
  });

export default ProductCard;