"use client";
import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TextInput, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, StyleSheet, Platform 
} from 'react-native';
import { db, auth } from "@/api/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { MessageSquare, Send, CheckCircle2, Loader2 } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export default function SellerQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [sending, setSending] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const q = query(
          collection(db, "questions"),
          where("sellerId", "==", currentUser.uid)
        );

        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setQuestions(data.sort((a: any, b: any) => 
            (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          ));
          setLoading(false);
        }, () => setLoading(false));

        return () => unsubscribeFirestore();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleReply = async (questionId: string) => {
    const answer = replyText[questionId];
    if (!answer?.trim()) return;

    setSending(questionId);
    try {
      const questionRef = doc(db, "questions", questionId);
      await updateDoc(questionRef, {
        answer: answer.trim(),
        answeredAt: new Date().toISOString()
      });
      Toast.show({ type: 'success', text1: 'Başarılı', text2: 'Cevabınız iletildi.' });
      setReplyText({ ...replyText, [questionId]: '' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Bir sorun oluştu.' });
    } finally {
      setSending(null);
    }
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>SORU & CEVAP <Text style={styles.headerTitleAccent}>YÖNETİMİ</Text></Text>
            <Text style={styles.headerSubtitle}>Müşteri sorularını yanıtlayın.</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{questions.filter(q => !q.answer).length} Bekleyen</Text>
          </View>
        </View>

        <View style={styles.listContainer}>
          {questions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MessageSquare size={48} color="#334155" />
              <Text style={styles.emptyText}>Henüz soru yok.</Text>
            </View>
          ) : (
            questions.map((q) => (
              <View key={q.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productTag}>{q.productTitle?.toUpperCase()}</Text>
                    <Text style={styles.userNameText}>{q.userName} sordu:</Text>
                  </View>
                  <Text style={styles.dateText}>
                    {q.createdAt?.seconds ? new Date(q.createdAt.seconds * 1000).toLocaleDateString('tr-TR') : ''}
                  </Text>
                </View>

                <View style={styles.questionBox}>
                  <Text style={styles.questionText}>{q.question}</Text>
                </View>

                {q.answer ? (
                  <View style={styles.answerBox}>
                    <CheckCircle2 size={16} color="#22c55e" />
                    <View style={{ marginLeft: 8, flex: 1 }}>
                      <Text style={styles.answerLabel}>CEVABINIZ:</Text>
                      <Text style={styles.answerText}>{q.answer}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Yanıtınızı yazın..."
                      placeholderTextColor="#64748b"
                      multiline
                      value={replyText[q.id] || ''}
                      onChangeText={(text) => setReplyText({ ...replyText, [q.id]: text })}
                    />
                    <TouchableOpacity 
                      onPress={() => handleReply(q.id)}
                      disabled={sending === q.id || !replyText[q.id]?.trim()}
                      style={[styles.sendButton, (!replyText[q.id]?.trim()) && { opacity: 0.5 }]}
                    >
                      {sending === q.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Send size={14} color="#fff" />
                          <Text style={styles.sendButtonText}>Cevapla</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  loadingContainer: { flex: 1, backgroundColor: '#09090b', justifyContent: 'center', alignItems: 'center' },
  scrollView: { paddingHorizontal: 20, paddingTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#2563eb' },
  headerTitleAccent: { color: '#94a3b8' },
  headerSubtitle: { color: '#64748b', fontSize: 12, marginTop: 4 },
  badge: { backgroundColor: 'rgba(37, 99, 235, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.2)' },
  badgeText: { color: '#60a5fa', fontSize: 10, fontWeight: '700' },
  listContainer: { paddingBottom: 40 },
  emptyContainer: { paddingVertical: 60, alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 24, borderWidth: 1, borderColor: '#1e293b' },
  emptyText: { color: '#64748b', marginTop: 12, fontWeight: '600' },
  card: { backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 24, padding: 20, marginBottom: 16,  borderColor: '#1e293b' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  productTag: { fontSize: 9, fontWeight: '900', color: '#3b82f6', letterSpacing: 1 },
  userNameText: { color: '#f1f5f9', fontSize: 14, fontWeight: '600', marginTop: 2 },
  dateText: { color: '#475569', fontSize: 10 },
  questionBox: { backgroundColor: 'rgba(2, 6, 23, 0.5)', padding: 12, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#334155', marginBottom: 16 },
  questionText: { color: '#cbd5e1', fontSize: 13, lineHeight: 20 },
  answerBox: { backgroundColor: 'rgba(34, 197, 94, 0.05)', padding: 12, borderRadius: 12, flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.1)' },
  answerLabel: { fontSize: 9, fontWeight: '900', color: '#22c55e', marginBottom: 2 },
  answerText: { color: '#94a3b8', fontSize: 13 },
  inputWrapper: { position: 'relative' },
  textInput: { backgroundColor: 'rgba(2, 6, 23, 0.8)', borderRadius: 12, padding: 12, color: '#f1f5f9', fontSize: 13, minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#1e293b' },
  sendButton: { position: 'absolute', bottom: 8, right: 8, backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  sendButtonText: { color: '#fff', fontSize: 11, fontWeight: '700', marginLeft: 6 }
});