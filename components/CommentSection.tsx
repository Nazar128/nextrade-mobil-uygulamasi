import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, 
  TouchableOpacity, ActivityIndicator, 
  ScrollView, Alert 
} from 'react-native';
import { Star, Camera, ChevronRight, AlertCircle, CheckCircle2, X, ArrowUpDown } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { db, auth, storage } from "@/api/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot, doc, getDoc} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { sendNotification } from "@/lib/notifications";
import { Image } from 'expo-image';
const CommentSection = ({ productId, product }: { productId: string, product: any }) => {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [userRating, setUserRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [checkingOrder, setCheckingOrder] = useState(true);
  const [sending, setSending] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const sortOptions = [
    { key: 'newest', label: 'En Yeni' },
    { key: 'oldest', label: 'En Eski' },
    { key: 'highest', label: 'Yüksek Puan' },
    { key: 'lowest', label: 'Düşük Puan' }
  ];

  useEffect(() => {
    if (!productId) return;
    const q = query(collection(db, "reviews"), where("productId", "==", productId.toString()));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, [productId]);

  useEffect(() => {
    const checkEligibility = async () => {
      const user = auth.currentUser;
      if (!user || !productId) {
        setCanReview(false);
        setCheckingOrder(false);
        return;
      }
      try {
        const hasAlreadyReviewed = comments.some(c => c.userId === user.uid);
        if (hasAlreadyReviewed) {
          setCanReview(false);
          return;
        }
        const q = query(collection(db, "orders"), where("userId", "==", user.uid), where("status", "==", "delivered"));
        const snapshot = await getDocs(q);
        const hasBought = snapshot.docs.some(doc => 
          doc.data().items?.some((item: any) => String(item.id) === String(productId))
        );
        setCanReview(hasBought);
      } catch (error) {
        setCanReview(false);
      } finally {
        setCheckingOrder(false);
      }
    };
    checkEligibility();
  }, [productId, auth.currentUser, comments]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Hata', 'Galeri izni gerekli.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const maskName = (name: string) => {
    if (!name || name === "Müşteri") return "G*** K***";
    const parts = name.trim().split(" ");
    return parts.map(p => p[0] + "***").join(" ");
  };

  const handleAddReview = async () => {
    const user = auth.currentUser;
    if (!user || !canReview || userRating === 0 || !newComment.trim()) return;
    setSending(true);
    try {
      const userDocSnap = await getDoc(doc(db, "users", user.uid));
      let realName = userDocSnap.exists() ? userDocSnap.data().displayName : "Müşteri";
      let imageUrl = "";

      if (imageUri) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const sRef = ref(storage, `reviews/${productId}/${user.uid}_${Date.now()}`);
        await uploadBytes(sRef, blob);
        imageUrl = await getDownloadURL(sRef);
      }

      await addDoc(collection(db, "reviews"), {
        productId: productId.toString(),
        userId: user.uid,
        userName: realName, 
        rating: userRating,
        comment: newComment.trim(),
        reviewImage: imageUrl,
        date: new Date().toLocaleDateString('tr-TR'),
        createdAt: serverTimestamp(),
      });

      if (product?.sellerId) {
        await sendNotification(
          String(product.sellerId),
          'review',
          'YENİ YORUM',
          `"${newComment.trim()}"`
        );
      }

      setNewComment("");
      setUserRating(0);
      setImageUri(null);
      Alert.alert("Başarılı", "Yorumunuz yayınlandı.");
    } catch (error) {
      Alert.alert("Hata", "Yorum gönderilemedi.");
    } finally {
      setSending(false);
    }
  };

  const stats = useMemo(() => {
    if (comments.length === 0) return { total: 0, avg: "0.0" };
    const avg = comments.reduce((acc, curr) => acc + curr.rating, 0) / comments.length;
    return { total: comments.length, avg: avg.toFixed(1) };
  }, [comments]);

  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      const tA = a.createdAt?.seconds || 0;
      const tB = b.createdAt?.seconds || 0;
      if (sortBy === 'newest') return tB - tA;
      if (sortBy === 'oldest') return tA - tB;
      if (sortBy === 'highest') return b.rating - a.rating;
      return a.rating - b.rating;
    });
  }, [comments, sortBy]);

  const cycleSort = () => {
    const currentIndex = sortOptions.findIndex(o => o.key === sortBy);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    setSortBy(sortOptions[nextIndex].key as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsCard}>
        <View>
          <Text style={styles.statsLabel}>DEĞERLENDİRMELER</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={styles.avgText}>{stats.avg}</Text>
            <Text style={styles.totalText}> / 5.0 ({stats.total})</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.sortButton} onPress={cycleSort}>
          <ArrowUpDown size={14} color="#3b82f6" style={{ marginRight: 6 }} />
          <Text style={styles.sortButtonText}>{sortOptions.find(o => o.key === sortBy)?.label}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listWrapper}>
        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator color="#3b82f6" style={{ marginTop: 20 }} />
          ) : sortedComments.length > 0 ? (
            sortedComments.map((item) => (
              <View key={item.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>{maskName(item.userName)[0]}</Text></View>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.userName}>{maskName(item.userName)}</Text>
                        <CheckCircle2 size={12} color="#3b82f6" style={{ marginLeft: 4 }} />
                      </View>
                      <View style={styles.starRow}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} color={i < item.rating ? "#eab308" : "#334155"} fill={i < item.rating ? "#eab308" : "transparent"} />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
                <Text style={styles.commentBody}>{item.comment}</Text>
                {item.reviewImage && <Image source={{ uri: item.reviewImage }} style={styles.reviewImage} contentFit="cover" transition={500}  cachePolicy="disk"  />}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Henüz yorum yok.</Text>
          )}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        {checkingOrder ? (
          <ActivityIndicator size="small" color="#64748b" />
        ) : canReview ? (
          <View>
            <View style={styles.inputActionRow}>
              <View style={styles.starInputRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setUserRating(s)}>
                    <Star size={22} color={s <= userRating ? "#eab308" : "#334155"} fill={s <= userRating ? "#eab308" : "transparent"} />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {imageUri && (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.previewImg} contentFit="cover" transition={500}  cachePolicy="disk"  />
                    <TouchableOpacity onPress={() => setImageUri(null)} style={styles.removeImg}><X size={10} color="#fff" /></TouchableOpacity>
                  </View>
                )}
                <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
                  <Camera size={22} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.textInputRow}>
              <TextInput 
                style={styles.input} 
                placeholder="Paylaş..." 
                placeholderTextColor="#64748b"
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity 
                onPress={handleAddReview} 
                disabled={sending || userRating === 0 || !newComment.trim()}
                style={[styles.sendBtn, { opacity: (sending || userRating === 0 || !newComment.trim()) ? 0.5 : 1 }]}
              >
                {sending ? <ActivityIndicator size="small" color="#fff" /> : <ChevronRight size={24} color="#fff" />}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.lockRow}>
            <AlertCircle size={14} color="#64748b" />
            <Text style={styles.lockText}>Sadece satın alanlar yorum yapabilir.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: 12, borderRadius: 16, marginVertical: 8 },
  statsLabel: { fontSize: 9, color: '#64748b', fontWeight: 'bold' },
  avgText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  totalText: { fontSize: 12, color: '#64748b' },
  sortButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  sortButtonText: { color: '#cbd5e1', fontSize: 11, fontWeight: '600' },
  listWrapper: { height: 280 },
  commentCard: { backgroundColor: 'rgba(30, 41, 59, 0.2)', padding: 10, borderRadius: 14, marginBottom: 8, borderColor: '#1e293b', borderWidth: 1 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(59, 130, 246, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  avatarText: { color: '#3b82f6', fontWeight: 'bold', fontSize: 10 },
  userName: { color: '#e2e8f0', fontSize: 11, fontWeight: 'bold' },
  starRow: { flexDirection: 'row' },
  dateText: { fontSize: 9, color: '#475569' },
  commentBody: { color: '#94a3b8', fontSize: 12, lineHeight: 16 },
  reviewImage: { width: 80, height: 80, borderRadius: 8, marginTop: 8 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 20, fontSize: 12 },
  inputContainer: { backgroundColor: '#0f172a', padding: 12, borderRadius: 20, borderTopWidth: 1, borderTopColor: '#1e293b' },
  inputActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  starInputRow: { flexDirection: 'row', gap: 6 },
  cameraBtn: { marginLeft: 10 },
  textInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.4)', borderRadius: 12, paddingHorizontal: 12, height: 40, color: '#f1f5f9', fontSize: 12 },
  sendBtn: { backgroundColor: '#2563eb', width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  previewContainer: { position: 'relative' },
  previewImg: { width: 35, height: 35, borderRadius: 6 },
  removeImg: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ef4444', borderRadius: 10, padding: 2 },
  lockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 4 },
  lockText: { color: '#64748b', fontSize: 10, fontStyle: 'italic' }
});

export default CommentSection;