import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, 
  ActivityIndicator, Dimensions, SafeAreaView 
} from 'react-native';
import { db, auth } from "@/api/firebase";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Store, ArrowLeft, ShieldCheck, Mail, Calendar, 
  Star, Package, UserPlus, UserMinus, Users 
} from 'lucide-react-native';
import { onAuthStateChanged } from "firebase/auth";
import ProductCard from '@/components/ProductCard';

const { width } = Dimensions.get('window');

export default function StoreProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!id) return;
    const storeRef = doc(db, "users", id as string);
    const unsubscribe = onSnapshot(storeRef, (doc) => {
      if (doc.exists()) {
        setSeller(doc.data());
      }
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!id || !currentUser) return;
    const checkFollowStatus = async () => {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const followedStores = userSnap.data().followedStores || [];
        setIsFollowing(followedStores.includes(id));
      }
    };
    checkFollowStatus();
  }, [id, currentUser]);

  useEffect(() => {
    if (!id) return;
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("sellerId", "==", String(id)));
        const pSnap = await getDocs(q);
        const allProducts = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProducts(allProducts.filter((p: any) => p.status === "approved"));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!currentUser || !id || followLoading) return;
    setFollowLoading(true);

    const userRef = doc(db, "users", currentUser.uid);
    const storeRef = doc(db, "users", id as string);

    try {
      if (isFollowing) {
        await updateDoc(userRef, { followedStores: arrayRemove(id) });
        await updateDoc(storeRef, { followers: arrayRemove(currentUser.uid) });
        setIsFollowing(false);
      } else {
        await updateDoc(userRef, { followedStores: arrayUnion(id) });
        await updateDoc(storeRef, { followers: arrayUnion(currentUser.uid) });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );

  if (!seller) return (
    <View style={styles.centerContainer}>
      <Text style={styles.errorText}>MAĞAZA BULUNAMADI</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color="#64748b" />
          <Text style={styles.backText}>GERİ</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>STORE PROFILE</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              {seller.photoURL ? (
                <Image source={{ uri: seller.photoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Store size={48} color="#1e293b" />
                </View>
              )}
            </View>
            {seller.status === "Aktif" && (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={16} color="white" />
              </View>
            )}
          </View>

          <Text style={styles.displayName}>{seller.displayName}</Text>

          <TouchableOpacity 
            onPress={handleFollowToggle}
            disabled={followLoading || !currentUser}
            style={[
              styles.followBtn,
              isFollowing ? styles.unfollowBtn : styles.followBtnActive
            ]}
          >
            {followLoading ? (
              <ActivityIndicator size="small" color={isFollowing ? "#ef4444" : "white"} />
            ) : (
              <>
                {isFollowing ? <UserMinus size={16} color="#ef4444" /> : <UserPlus size={16} color="white" />}
                <Text style={[styles.followBtnText, isFollowing && { color: '#ef4444' }]}>
                  {isFollowing ? "TAKİBİ BIRAK" : "MAĞAZAYI TAKİP ET"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.description}>
            {seller.description || "Doğrulanmış NexTrade satıcısı."}
          </Text>

          <View style={styles.contactRow}>
            <View style={styles.contactBadge}>
              <Mail size={12} color="#3b82f6" />
              <Text style={styles.contactText} numberOfLines={1}>{seller.email}</Text>
            </View>
            <View style={styles.contactBadge}>
              <Calendar size={12} color="#3b82f6" />
              <Text style={styles.contactText}>2024 ÜYESİ</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {[
            { icon: <Package size={20} color="#3b82f6" />, label: "ENVANTER", value: `${products.length}` },
            { icon: <Star size={20} color="#3b82f6" />, label: "PUAN", value: "4.9" },
            { icon: <Users size={20} color="#3b82f6" />, label: "TAKİPÇİ", value: seller.followers?.length || 0 }
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <View style={styles.statIcon}>{stat.icon}</View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.collectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.dot} />
            <Text style={styles.sectionTitle}>KOLEKSİYON</Text>
          </View>
          <Text style={styles.resultCount}>{products.length} ÜRÜN</Text>
        </View>

        <View style={styles.productGrid}>
          {products.map((item) => (
            <View key={item.id} style={styles.productCardWrapper}>
              <ProductCard product={item} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  centerContainer: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#475569', fontSize: 10, letterSpacing: 2, fontWeight: 'bold' },
  nav: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingHorizontal: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { color: '#64748b', fontSize: 10, fontWeight: 'bold' },
  navTitle: { color: 'rgba(255,255,255,0.1)', fontSize: 10, fontWeight: '900', letterSpacing: 3 },
  scrollBody: { paddingBottom: 40 },
  profileHeader: { alignItems: 'center', paddingTop: 40, padding: 20 },
  avatarWrapper: { marginBottom: 20 },
  avatarContainer: { width: 120, height: 120, borderRadius: 40, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  verifiedBadge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#2563eb', padding: 8, borderRadius: 15, borderWidth: 3, borderColor: '#020617' },
  displayName: { color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: -1, marginBottom: 15 },
  followBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 16, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 12 },
  followBtnActive: { backgroundColor: '#2563eb', borderColor: '#3b82f6' },
  unfollowBtn: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
  followBtnText: { color: 'white', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  description: { color: '#94a3b8', textAlign: 'center', fontSize: 14, lineHeight: 22, marginTop: 20, paddingHorizontal: 20 },
  contactRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  contactBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', maxWidth: 180 },
  contactText: { color: '#64748b', fontSize: 10, fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', padding: 20, gap: 12, marginTop: 40 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statIcon: { marginBottom: 8, opacity: 0.5 },
  statValue: { color: 'white', fontSize: 18, fontWeight: '900' },
  statLabel: { color: '#475569', fontSize: 8, fontWeight: 'bold', marginTop: 2 },
  collectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 40, marginBottom: 20 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 4, height: 4, backgroundColor: '#2563eb', borderRadius: 2 },
  sectionTitle: { color: '#94a3b8', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  resultCount: { color: '#475569', fontSize: 9, fontWeight: 'bold' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12 },
  productCardWrapper: { width: '50%', padding: 8 }
});