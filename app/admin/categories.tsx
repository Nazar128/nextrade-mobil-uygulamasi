"use client";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Dimensions, SafeAreaView, Alert } from 'react-native';
import { db} from "@/api/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { Plus, Trash2, ChevronRight, Layers, FolderTree, X, Send, Calendar } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCatTitle, setNewCatTitle] = useState("");
    const [activeSubInput, setActiveSubInput] = useState<string | null>(null);
    const [subTitle, setSubTitle] = useState("");

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
            const catData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCategories(catData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleAddCategory = async () => {
        if (!newCatTitle.trim()) return;
        try {
            await addDoc(collection(db, "categories"), { title: newCatTitle, subCategories: [], createdAt: new Date() });
            setNewCatTitle("");
            setIsModalOpen(false);
        } catch (error) { console.error(error); }
    };

    const handleAddSubCategory = async (parentId: string) => {
        if (!subTitle.trim()) return;
        try {
            const catRef = doc(db, "categories", parentId);
            await updateDoc(catRef, { subCategories: arrayUnion({ id: Date.now().toString(), title: subTitle }) });
            setSubTitle("");
            setActiveSubInput(null);
        } catch (error) { console.error(error); }
    };

    const handleDeleteSubCategory = (parentId: string, subItem: any) => {
        Alert.alert("Silme Onayı", `"${subItem.title}" alt kategorisini silmek istediğinize emin misiniz?`, [
            { text: "İptal", style: "cancel" },
            { text: "Sil", style: "destructive", onPress: async () => {
                const catRef = doc(db, "categories", parentId);
                await updateDoc(catRef, { subCategories: arrayRemove(subItem) });
            }}
        ]);
    };

    const handleDeleteCategory = (id: string) => {
        Alert.alert("Dikkat", "Ana kategoriyi ve tüm alt dallarını silmek üzeresiniz. Onaylıyor musunuz?", [
            { text: "Vazgeç", style: "cancel" },
            { text: "Kategoriyi Sil", style: "destructive", onPress: async () => {
                await deleteDoc(doc(db, "categories", id));
            }}
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <View style={{ marginBottom: 30 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <FolderTree size={28} color="#6366f1" />
                        <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>Kategori Yönetimi</Text>
                    </View>
                    <TouchableOpacity onPress={() => setIsModalOpen(true)} style={{ backgroundColor: '#6366f1', padding: 15, borderRadius: 12, marginTop: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                        <Plus size={20} color="white" />
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>ANA KATEGORİ EKLE</Text>
                    </TouchableOpacity>
                </View>

                {loading ? ( <ActivityIndicator color="#6366f1" /> ) : (
                    categories.map((cat) => (
                        <View key={cat.id} style={styles.card}>
                            <View style={styles.content}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <View style={{ width: 45, height: 45, backgroundColor: '#020617', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' }}>
                                            <Layers size={20} color="#6366f1" />
                                        </View>
                                        <View>
                                            <Text style={styles.title}>{cat.title}</Text>
                                            <Text style={styles.periodText}>{cat.subCategories?.length || 0} Alt Kategori</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDeleteCategory(cat.id)} style={{ padding: 8 }}>
                                        <Trash2 size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>

                                <View style={{ backgroundColor: '#020617', borderRadius: 16, padding: 10, marginBottom: 15, borderWidth: 1, borderColor: '#1e293b' }}>
                                    {cat.subCategories?.map((sub: any) => (
                                        <View key={sub.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 0.5, borderBottomColor: '#1e293b' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <ChevronRight size={14} color="#6366f1" />
                                                <Text style={{ color: '#cbd5e1', fontSize: 13 }}>{sub.title}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => handleDeleteSubCategory(cat.id, sub)}>
                                                <X size={14} color="#475569" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>

                                {activeSubInput === cat.id ? (
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        <TextInput 
                                            style={[styles.input, { flex: 1, height: 45, marginBottom: 0 }]} 
                                            placeholder="Alt kategori..." 
                                            placeholderTextColor="#475569"
                                            value={subTitle}
                                            onChangeText={setSubTitle}
                                        />
                                        <TouchableOpacity onPress={() => handleAddSubCategory(cat.id)} style={{ width: 45, height: 45, backgroundColor: '#6366f1', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                                            <Send size={16} color="white" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setActiveSubInput(null)} style={{ width: 45, height: 45, backgroundColor: '#1e293b', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                                            <X size={16} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity onPress={() => setActiveSubInput(cat.id)} style={styles.actionBtn}>
                                        <Text style={{ color: '#6366f1', fontSize: 11, fontWeight: 'bold' }}>+ YENİ ALT KATEGORİ</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            <Modal visible={isModalOpen} animationType="fade" transparent={true}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: '#0f172a', borderRadius: 24, padding: 25, borderWidth: 1, borderColor: '#1e293b' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}><Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Ana Kategori Oluştur</Text><TouchableOpacity onPress={() => setIsModalOpen(false)}><X size={24} color="#64748b" /></TouchableOpacity></View>
                        <Text style={styles.statLabel}>KATEGORİ BAŞLIĞI</Text>
                        <TextInput style={styles.input} placeholder="Örn: Elektronik" placeholderTextColor="#475569" value={newCatTitle} onChangeText={setNewCatTitle} />
                        <TouchableOpacity onPress={handleAddCategory} style={{ backgroundColor: '#6366f1', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>KAYDET</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  card: { backgroundColor: '#0f172a', borderRadius: 20, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#1e293b' },
  content: { padding: 15 },
  title: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  periodText: { color: '#64748b', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  statLabel: { color: '#475569', fontSize: 8, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: '#020617', borderRadius: 12, padding: 15, color: 'white', marginBottom: 20, borderWidth: 1, borderColor: '#1e293b' },
  actionBtn: { width: '100%', height: 45, backgroundColor: '#020617', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1e293b', borderStyle: 'dashed' }
});