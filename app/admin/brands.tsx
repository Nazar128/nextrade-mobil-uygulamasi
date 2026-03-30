"use client";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Modal, ActivityIndicator, Dimensions, SafeAreaView } from 'react-native';
import { db, storage } from "@/api/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Award, Plus, Trash2, Globe, Image as ImageIcon, X, Calendar } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

export default function BrandsPage() {
    const [brandsList, setBrandsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBrand, setNewBrand] = useState({ name: "" });
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "brands"), orderBy("name", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setBrandsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) { setSelectedImage(result.assets[0].uri); }
    };

    const handleAddBrand = async () => {
        if (!newBrand.name || !selectedImage) return;
        setUploading(true);
        try {
            const response = await fetch(selectedImage);
            const blob = await response.blob();
            const storageRef = ref(storage, `brands/${Date.now()}_logo`);
            const uploadResult = await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(uploadResult.ref);
            await addDoc(collection(db, "brands"), { name: newBrand.name, logo: downloadURL, createdAt: new Date(), isVerified: true });
            setNewBrand({ name: "" });
            setSelectedImage(null);
            setIsModalOpen(false);
        } catch (error) { console.error(error); } finally { setUploading(false); }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <View style={{ marginBottom: 30 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Award size={24} color="#f59e0b" />
                        <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>Marka Yönetimi</Text>
                    </View>
                    <TouchableOpacity onPress={() => setIsModalOpen(true)} style={{ backgroundColor: '#6366f1', padding: 15, borderRadius: 12, marginTop: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                        <Plus size={20} color="white" />
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>YENİ MARKA EKLE</Text>
                    </TouchableOpacity>
                </View>

                {loading ? ( <ActivityIndicator color="#6366f1" /> ) : (
                    brandsList.map((brand) => (
                        <View key={brand.id} style={styles.card}>
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: brand.logo }} style={styles.image} resizeMode="cover" />
                                <View style={styles.overlay} />
                                <View style={[styles.statusBadge, { backgroundColor: '#10b981' }]}><Text style={styles.statusText}>AKTİF</Text></View>
                                <View style={{ position: 'absolute', bottom: 15, left: 15 }}>
                                    <Image source={{ uri: brand.logo }} style={{ width: 50, height: 50, borderRadius: 10, backgroundColor: 'white' }} resizeMode="contain" />
                                </View>
                            </View>
                            <View style={styles.content}>
                                <Text style={styles.title}>{brand.name}</Text>
                                <View style={styles.periodRow}><Calendar size={12} color="#64748b" /><Text style={styles.periodText}>Doğrulanmış Marka</Text></View>
                                <View style={styles.statsRow}>
                                    <View style={styles.statBox}><Text style={styles.statLabel}>DURUM</Text><Text style={styles.statValue}>Verified</Text></View>
                                    <View style={styles.statBox}><Text style={styles.statLabel}>TİP</Text><Text style={styles.statValue}>Global</Text></View>
                                </View>
                                <View style={styles.actions}>
                                    <TouchableOpacity onPress={() => deleteDoc(doc(db, "brands", brand.id))} style={[styles.actionBtn, { borderColor: '#ef4444' }]}><Trash2 size={18} color="#ef4444" /></TouchableOpacity>
                                    <TouchableOpacity style={styles.actionBtn}><Globe size={18} color="#64748b" /></TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            <Modal visible={isModalOpen} animationType="fade" transparent={true}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: '#0f172a', borderRadius: 24, padding: 25, borderWidth: 1, borderColor: '#1e293b' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}><Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Yeni Marka Tanımla</Text><TouchableOpacity onPress={() => setIsModalOpen(false)}><X size={24} color="#64748b" /></TouchableOpacity></View>
                        <Text style={{ color: '#64748b', fontSize: 10, fontWeight: 'bold', marginBottom: 8 }}>MARKA ADI</Text>
                        <TextInput style={{ backgroundColor: '#020617', borderRadius: 12, padding: 15, color: 'white', marginBottom: 20, borderWidth: 1, borderColor: '#1e293b' }} value={newBrand.name} onChangeText={(text) => setNewBrand({...newBrand, name: text})} />
                        <TouchableOpacity onPress={pickImage} style={{ height: 120, backgroundColor: '#020617', borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#1e293b', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                            {selectedImage ? <Image source={{ uri: selectedImage }} style={{ width: '100%', height: '100%', borderRadius: 12 }} /> : <ImageIcon size={30} color="#1e293b" />}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleAddBrand} disabled={uploading} style={{ backgroundColor: '#6366f1', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                            {uploading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold' }}>KAYDET</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  card: { backgroundColor: '#0f172a', borderRadius: 20, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#1e293b' },
  imageContainer: { height: 140, position: 'relative' },
  image: { width: '100%', height: '100%', opacity: 0.5 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2, 6, 23, 0.4)' },
  statusBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  content: { padding: 15 },
  title: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  periodText: { color: '#64748b', fontSize: 10, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', marginVertical: 15, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#1e293b' },
  statBox: { flex: 1 },
  statLabel: { color: '#475569', fontSize: 8, fontWeight: 'bold' },
  statValue: { color: 'white', fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, height: 40, backgroundColor: '#020617', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' }
});