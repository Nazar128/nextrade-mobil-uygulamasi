import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Send, MessageCircle, Clock, ArrowUpDown } from 'lucide-react-native';
import { db, auth } from "@/api/firebase";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const QuestionSection = ({ product }: { product: any }) => {
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [newQuestion, setNewQuestion] = useState('');
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!product?.id) return;
        const pId = Number(product.id);
        const q = query(collection(db, "questions"), where("productId", "==", pId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return () => unsubscribe();
    }, [product?.id]);

    const handleSendQuestion = async () => {
        if (!user || !product?.sellerId || !newQuestion.trim()) return;
        setSending(true);
        try {
            const displayUserName = user.displayName || user.email?.split('@')[0] || "Kullanıcı";
            await addDoc(collection(db, "questions"), {
                productId: Number(product.id),
                productTitle: product.title || "Adsız Ürün",
                sellerId: String(product.sellerId),
                userId: user.uid,
                userName: displayUserName,
                question: newQuestion.trim(),
                answer: null,
                createdAt: serverTimestamp(),
            });
            setNewQuestion('');
            Alert.alert("Başarılı", "Sorunuz iletildi.");
        } catch (error) {
            Alert.alert("Hata", "Soru gönderilemedi.");
        } finally {
            setSending(false);
        }
    };

    const sortedQuestions = useMemo(() => {
        return [...questions].sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        });
    }, [questions, sortBy]);

    if (!product?.id) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <MessageCircle size={16} color="#3b82f6" />
                    <Text style={styles.titleText}>{`Soru & Cevap (${questions.length})`}</Text>
                </View>
                <TouchableOpacity 
                    onPress={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
                    style={styles.sortBtn}
                >
                    <ArrowUpDown size={12} color="#64748b" />
                    <Text style={styles.sortText}>{sortBy === 'newest' ? 'En Yeni' : 'En Eski'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.listWrapper}>
                <ScrollView 
                    nestedScrollEnabled={true} 
                    style={styles.scrollView}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                >
                    {loading ? (
                        <ActivityIndicator style={styles.loader} color="#3b82f6" />
                    ) : sortedQuestions.length > 0 ? (
                        sortedQuestions.map((item) => (
                            <View key={item.id} style={styles.questionCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.userInfo}>
                                        <View style={styles.dot} />
                                        <Text style={styles.userName}>{item.userName}</Text>
                                    </View>
                                    <Text style={styles.dateText}>
                                        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('tr-TR') : ""}
                                    </Text>
                                </View>
                                <Text style={styles.questionText}>{item.question}</Text>
                                {item.answer ? (
                                    <View style={styles.answerContainer}>
                                        <Text style={styles.answerBody}>
                                            <Text style={styles.sellerTag}>{"SATICI YANITI: "}</Text>
                                            {item.answer}
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.waitingContainer}>
                                        <Clock size={10} color="#6366f1" />
                                        <Text style={styles.waitingText}>{"Yanıt bekleniyor..."}</Text>
                                    </View>
                                )}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>{"Henüz soru sorulmamış."}</Text>
                    )}
                </ScrollView>
            </View>

            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={newQuestion}
                    onChangeText={setNewQuestion}
                    placeholder={user ? "Soru sor..." : "Giriş yapın"}
                    placeholderTextColor="#475569"
                    editable={!sending && !!user}
                />
                <TouchableOpacity 
                    onPress={handleSendQuestion}
                    disabled={!newQuestion.trim() || sending || !user}
                    style={styles.sendBtn}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color="#3b82f6" />
                    ) : (
                        <Send size={18} color={newQuestion.trim() && user ? "#3b82f6" : "#475569"} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
    headerTitle: { flexDirection: 'row', alignItems: 'center' },
    titleText: { color: '#cbd5e1', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5, marginLeft: 8 },
    sortBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b' },
    sortText: { color: '#64748b', fontSize: 10, marginLeft: 6 },
    listWrapper: { height: 320, marginVertical: 10 }, 
    scrollView: { flex: 1 },
    listContent: { paddingVertical: 10 },
    questionCard: { backgroundColor: 'rgba(30, 41, 59, 0.2)', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(30, 41, 59, 0.4)' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    userInfo: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#3b82f6', marginRight: 6 },
    userName: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold' },
    dateText: { color: '#475569', fontSize: 10 },
    questionText: { color: '#f1f5f9', fontSize: 13, fontWeight: '500', marginBottom: 12 },
    answerContainer: { backgroundColor: 'rgba(2, 6, 23, 0.4)', padding: 10, borderRadius: 8, borderLeftWidth: 2, borderLeftColor: 'rgba(59, 130, 246, 0.5)' },
    sellerTag: { fontSize: 9, fontWeight: 'bold', color: '#3b82f6' },
    answerBody: { color: '#94a3b8', fontSize: 12, fontStyle: 'italic' },
    waitingContainer: { flexDirection: 'row', alignItems: 'center' },
    waitingText: { color: '#b45309', fontSize: 10, opacity: 0.6, fontStyle: 'italic', marginLeft: 6 },
    loader: { marginTop: 20 },
    emptyText: { textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 40 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, paddingHorizontal: 12, marginBottom: 10 },
    input: { flex: 1, height: 45, color: '#f1f5f9', fontSize: 12 },
    sendBtn: { padding: 8 }
});

export default QuestionSection;