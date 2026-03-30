"use client";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Dimensions, SafeAreaView, Alert } from 'react-native';
import { db } from "@/api/firebase";
import { collection, query, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Trash2, Edit3, Plus, X, Save, HelpCircle, Check, ChevronDown } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function FAQPage() {
    const [faqs, setFaqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        question: '', answer: '', category: 'Genel', order: 0, status: 'published'
    });

    const categories = ['Genel', 'Ödeme', 'Kargo', 'İade', 'Hesap'];

    useEffect(() => {
        const q = query(collection(db, "faqs"), orderBy("order", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setFaqs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async () => {
        if (!formData.question || !formData.answer) {
            Alert.alert("Hata", "Lütfen soru ve cevap alanlarını doldurun.");
            return;
        }
        const data = { ...formData, order: Number(formData.order) || 0, updatedAt: serverTimestamp() };
        try {
            if (editingFaq) {
                await updateDoc(doc(db, "faqs", editingFaq.id), data);
            } else {
                await addDoc(collection(db, "faqs"), { ...data, createdAt: serverTimestamp() });
            }
            closeModal();
        } catch (error) { console.error(error); }
    };

    const handleDelete = (id: string) => {
        Alert.alert("Silme Onayı", "Bu soruyu silmek istediğinizden emin misiniz?", [
            { text: "İptal", style: "cancel" },
            { text: "Sil", style: "destructive", onPress: async () => await deleteDoc(doc(db, "faqs", id)) }
        ]);
    };

    const openModal = (faq: any = null) => {
        if (faq) {
            setEditingFaq(faq);
            setFormData({ 
                question: faq.question, 
                answer: faq.answer, 
                category: faq.category || 'Genel', 
                order: faq.order, 
                status: faq.status || 'published' 
            });
        } else {
            setEditingFaq(null);
            setFormData({ question: '', answer: '', category: 'Genel', order: faqs.length, status: 'published' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setEditingFaq(null); };

    if (loading) return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator color="#6366f1" size="large" />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <View style={{ marginBottom: 30 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <HelpCircle size={28} color="#6366f1" />
                        <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>SSS Yönetimi</Text>
                    </View>
                    <TouchableOpacity onPress={() => openModal()} style={styles.addButton}>
                        <Plus size={20} color="white" />
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>YENİ SORU EKLE</Text>
                    </TouchableOpacity>
                </View>

                {faqs.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <HelpCircle size={48} color="#1e293b" />
                        <Text style={{ color: '#475569', marginTop: 10 }}>Henüz soru eklenmemiş.</Text>
                    </View>
                ) : (
                    faqs.map((f) => (
                        <View key={f.id} style={styles.card}>
                            <View style={styles.content}>
                                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                                    <View style={styles.categoryBadge}><Text style={styles.categoryText}>{f.category.toUpperCase()}</Text></View>
                                    <View style={[styles.statusBadge, { backgroundColor: f.status === 'published' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)' }]}>
                                        {f.status === 'published' ? <Check size={10} color="#10b981" /> : <Edit3 size={10} color="#f59e0b" />}
                                        <Text style={[styles.statusText, { color: f.status === 'published' ? '#10b981' : '#f59e0b' }]}>
                                            {f.status === 'published' ? 'YAYINDA' : 'TASLAK'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.title}>{f.question}</Text>
                                <Text style={styles.answerText} numberOfLines={2}>{f.answer}</Text>
                                <View style={styles.actions}>
                                    <TouchableOpacity onPress={() => openModal(f)} style={styles.actionBtn}><Edit3 size={18} color="#6366f1" /></TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(f.id)} style={[styles.actionBtn, { borderColor: '#ef4444' }]}><Trash2 size={18} color="#ef4444" /></TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            <Modal visible={isModalOpen} animationType="slide" transparent={true} onRequestClose={closeModal}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingFaq ? 'Soruyu Düzenle' : 'Yeni Soru Oluştur'}</Text>
                            <TouchableOpacity onPress={closeModal}><X size={24} color="#64748b" /></TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.statLabel}>KATEGORİ SEÇİN</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                                {categories.map((cat) => (
                                    <TouchableOpacity 
                                        key={cat} 
                                        onPress={() => setFormData({...formData, category: cat})}
                                        style={[styles.catSelectItem, formData.category === cat && styles.catSelectActive]}
                                    >
                                        <Text style={[styles.catSelectText, formData.category === cat && { color: 'white' }]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.statLabel}>SORU METNİ</Text>
                            <TextInput style={styles.input} value={formData.question} onChangeText={(t) => setFormData({...formData, question: t})} placeholder="Soru başlığı..." placeholderTextColor="#475569" />
                            
                            <Text style={styles.statLabel}>CEVAP METNİ</Text>
                            <TextInput style={[styles.input, { height: 120, textAlignVertical: 'top' }]} multiline value={formData.answer} onChangeText={(t) => setFormData({...formData, answer: t})} placeholder="Detaylı cevap..." placeholderTextColor="#475569" />
                            
                            <View style={{ flexDirection: 'row', gap: 15, marginBottom: 25 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.statLabel}>SIRA</Text>
                                    <TextInput style={styles.input} keyboardType="numeric" value={String(formData.order)} onChangeText={(t) => setFormData({...formData, order: Number(t)})} />
                                </View>
                                <View style={{ flex: 2 }}>
                                    <Text style={styles.statLabel}>DURUM</Text>
                                    <TouchableOpacity 
                                        onPress={() => setFormData({...formData, status: formData.status === 'published' ? 'draft' : 'published'})}
                                        style={[styles.input, { alignItems: 'center', justifyContent: 'center', borderColor: formData.status === 'published' ? '#10b981' : '#f59e0b' }]}
                                    >
                                        <Text style={{ color: formData.status === 'published' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                                            {formData.status === 'published' ? 'YAYINDA' : 'TASLAK'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
                                <Save size={20} color="white" /><Text style={styles.saveButtonText}>DEĞİŞİKLİKLERİ KAYDET</Text>
                            </TouchableOpacity>
                            <View style={{ height: 20 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  addButton: { backgroundColor: '#6366f1', padding: 15, borderRadius: 16, marginTop: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  emptyBox: { padding: 50, borderStyle: 'dashed', borderWidth: 2, borderColor: '#1e293b', borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  card: { backgroundColor: '#0f172a', borderRadius: 24, marginBottom: 15, borderWidth: 1, borderColor: '#1e293b', overflow: 'hidden' },
  content: { padding: 20 },
  categoryBadge: { backgroundColor: 'rgba(99, 102, 241, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.2)' },
  categoryText: { color: '#6366f1', fontSize: 10, fontWeight: '900' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 9, fontWeight: 'bold' },
  title: { color: 'white', fontSize: 17, fontWeight: 'bold', marginBottom: 8 },
  answerText: { color: '#64748b', fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  actionBtn: { flex: 1, height: 44, backgroundColor: '#020617', borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0f172a', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 25, maxHeight: '90%', borderTopWidth: 1, borderColor: '#334155' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#475569', fontSize: 9, fontWeight: '900', marginBottom: 10, letterSpacing: 1.5 },
  catSelectItem: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#020617', marginRight: 10, borderWidth: 1, borderColor: '#1e293b' },
  catSelectActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  catSelectText: { color: '#64748b', fontWeight: 'bold', fontSize: 13 },
  input: { backgroundColor: '#020617', borderRadius: 16, padding: 18, color: 'white', marginBottom: 20, borderWidth: 1, borderColor: '#1e293b', fontSize: 15 },
  saveButton: { backgroundColor: '#6366f1', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 12, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  saveButtonText: { color: 'white', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 }
});