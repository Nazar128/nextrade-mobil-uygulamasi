"use client";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, SafeAreaView, TextInput, Alert, FlatList } from 'react-native';
import { db } from "@/api/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { Mail, Trash2, X, Sparkles, HelpCircle, ChevronRight, Hash, Check } from 'lucide-react-native';

export default function AdminMessages() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMsg, setSelectedMsg] = useState<any | null>(null);
    const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
    const [faqDraft, setFaqDraft] = useState({ question: '', answer: '', category: 'Genel' });

    useEffect(() => {
        const q = query(collection(db, "contactMessages"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const openMessage = async (msg: any) => {
        if (!msg) return;
        setSelectedMsg(msg);
        if (msg.status === 'unread') {
            try {
                await updateDoc(doc(db, "contactMessages", msg.id), { status: 'read' });
            } catch (err) {}
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert("Mesajı Sil", "Bu mesajı silmek istediğinize emin misiniz?", [
            { text: "Vazgeç", style: "cancel" },
            { text: "Sil", style: "destructive", onPress: async () => {
                try {
                    await deleteDoc(doc(db, "contactMessages", id));
                    setSelectedMsg(null);
                } catch (err) {}
            }}
        ]);
    };

    const saveAsFAQ = async () => {
        if (!faqDraft.question || !faqDraft.answer || !selectedMsg) return;
        try {
            await addDoc(collection(db, "faqs"), {
                ...faqDraft,
                order: 0,
                status: 'published',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            await updateDoc(doc(db, "contactMessages", selectedMsg.id), { 
                isConvertedToFAQ: true 
            });

            setSelectedMsg((prev: any) => ({ ...prev, isConvertedToFAQ: true }));
            setIsFAQModalOpen(false);
            Alert.alert("Başarılı", "SSS Eklendi.");
        } catch (e) {}
    };

    const renderMessageItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            onPress={() => openMessage(item)} 
            style={[styles.messageCard, item.status === 'unread' && styles.unreadBorder]}
        >
            <View style={styles.cardHeader}>
                <View style={styles.userInfoContainer}>
                    <Text style={styles.userName} numberOfLines={1}>{item.name || 'İsimsiz'}</Text>
                    <Text style={styles.userEmail} numberOfLines={1}>{item.email || 'E-posta yok'}</Text>
                </View>
                <View style={{flexDirection: 'row', gap: 5}}>
                    {item.isConvertedToFAQ && (
                        <View style={styles.faqBadge}><Check size={8} color="#10b981" /><Text style={styles.faqBadgeText}>SSS</Text></View>
                    )}
                    {item.status === 'unread' && (
                        <View style={styles.newBadge}><Text style={styles.newBadgeText}>YENİ</Text></View>
                    )}
                </View>
            </View>
            <View style={styles.subjectRow}>
                <Hash size={12} color="#475569" />
                <Text style={styles.subjectText} numberOfLines={1}>{item.subject || 'Konu Belirtilmemiş'}</Text>
            </View>
            <View style={styles.arrowContainer}>
                <ChevronRight size={16} color="#334155" />
            </View>
        </TouchableOpacity>
    );

    if (loading) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator color="#2563eb" size="large" />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Gelen <Text style={{color: '#475569'}}>Kutusu</Text></Text>
                    <Text style={styles.subtitle}>{messages.length} AKTİF MESAJ</Text>
                </View>
                <View style={styles.headerIcon}><Mail size={20} color="#2563eb" /></View>
            </View>

            <FlatList 
                data={messages}
                renderItem={renderMessageItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 20 }}
                ListEmptyComponent={<Text style={{color: '#475569', textAlign: 'center', marginTop: 50}}>Henüz mesaj yok.</Text>}
            />

            <Modal visible={!!selectedMsg} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    {selectedMsg && (
                        <View style={styles.detailModal}>
                            <View style={styles.modalTop}>
                                <View style={styles.iconCircle}><Mail size={20} color="#2563eb" /></View>
                                <TouchableOpacity onPress={() => setSelectedMsg(null)}><X size={24} color="#475569" /></TouchableOpacity>
                            </View>
                            
                            <Text style={styles.modalName}>{selectedMsg.name}</Text>
                            <Text style={styles.modalEmail}>{selectedMsg.email}</Text>
                            
                            <ScrollView style={styles.messageContentBox}>
                                <Text style={styles.messageContentText}>{selectedMsg.message}</Text>
                            </ScrollView>

                            <TouchableOpacity 
                                style={[styles.faqButton, selectedMsg.isConvertedToFAQ && styles.faqButtonDisabled]}
                                disabled={selectedMsg.isConvertedToFAQ}
                                onPress={() => {
                                    setFaqDraft({ 
                                        question: selectedMsg.subject || '', 
                                        answer: selectedMsg.message || '', 
                                        category: 'Genel' 
                                    });
                                    setIsFAQModalOpen(true);
                                }}
                            >
                                {selectedMsg.isConvertedToFAQ ? (
                                    <>
                                        <Check size={16} color="#10b981" />
                                        <Text style={[styles.faqButtonText, {color: '#10b981'}]}>SSS'YE EKLENDİ</Text>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} color="white" />
                                        <Text style={styles.faqButtonText}>SSS'YE DÖNÜŞTÜR</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            
                            <View style={styles.bottomRow}>
                                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(selectedMsg.id)}>
                                    <Trash2 size={18} color="#ef4444" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedMsg(null)}>
                                    <Text style={styles.closeButtonText}>KAPAT</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </Modal>

            <Modal visible={isFAQModalOpen} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.faqModal}>
                        <View style={styles.modalTop}>
                            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                                <HelpCircle size={18} color="#2563eb" />
                                <Text style={styles.faqTitle}>SSS TASLAĞI</Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsFAQModalOpen(false)}><X size={24} color="#475569" /></TouchableOpacity>
                        </View>

                        <TextInput 
                            style={styles.input}
                            value={faqDraft.question}
                            onChangeText={(t) => setFaqDraft({...faqDraft, question: t})}
                            placeholder="Soru..."
                            placeholderTextColor="#475569"
                        />

                        <TextInput 
                            style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
                            value={faqDraft.answer}
                            onChangeText={(t) => setFaqDraft({...faqDraft, answer: t})}
                            placeholder="Cevap..."
                            placeholderTextColor="#475569"
                            multiline
                        />

                        <TouchableOpacity style={styles.saveButton} onPress={saveAsFAQ}>
                            <Text style={styles.saveButtonText}>KAYDET</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    loadingContainer: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1, borderColor: '#0f172a' },
    headerTitle: { color: '#2563eb', fontSize: 24, fontWeight: '900' },
    subtitle: { color: '#475569', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
    headerIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' },
    messageCard: { backgroundColor: '#0f172a', borderRadius: 20, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b' },
    unreadBorder: { borderColor: '#2563eb' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    userInfoContainer: { flex: 1, marginRight: 10 },
    userName: { color: 'white', fontSize: 15, fontWeight: 'bold' },
    userEmail: { color: '#475569', fontSize: 11 },
    newBadge: { backgroundColor: '#2563eb', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    newBadgeText: { color: 'white', fontSize: 9, fontWeight: '900' },
    faqBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 3 },
    faqBadgeText: { color: '#10b981', fontSize: 9, fontWeight: '900' },
    subjectRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 20 },
    subjectText: { color: '#94a3b8', fontSize: 12, fontStyle: 'italic' },
    arrowContainer: { position: 'absolute', right: 15, bottom: 15 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
    detailModal: { backgroundColor: '#0f172a', borderRadius: 28, padding: 20, borderWidth: 1, borderColor: '#1e293b' },
    modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    iconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(37, 99, 235, 0.1)', justifyContent: 'center', alignItems: 'center' },
    modalName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    modalEmail: { color: '#475569', fontSize: 12, marginBottom: 15 },
    messageContentBox: { backgroundColor: '#020617', borderRadius: 15, padding: 15, maxHeight: 150, marginBottom: 20 },
    messageContentText: { color: '#94a3b8', fontSize: 14, lineHeight: 20 },
    faqButton: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 10 },
    faqButtonDisabled: { backgroundColor: '#020617', borderWidth: 1, borderColor: '#10b981' },
    faqButtonText: { color: 'white', fontSize: 11, fontWeight: '900' },
    bottomRow: { flexDirection: 'row', gap: 10 },
    deleteButton: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' },
    closeButton: { flex: 1, height: 50, borderRadius: 14, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
    closeButtonText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
    faqModal: { backgroundColor: '#0f172a', borderRadius: 28, padding: 20, borderWidth: 1, borderColor: '#2563eb' },
    faqTitle: { color: 'white', fontSize: 12, fontWeight: '900' },
    input: { backgroundColor: '#020617', borderRadius: 14, padding: 15, color: 'white', fontSize: 14, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b' },
    saveButton: { backgroundColor: 'white', paddingVertical: 14, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    saveButtonText: { color: 'black', fontSize: 12, fontWeight: '900' }
});