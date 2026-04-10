import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, TextInput, ActivityIndicator, Modal, Image } from 'react-native';
import { Plus, Search, X, UploadCloud } from 'lucide-react-native';
import { db, storage } from "@/api/firebase";
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker';
import { CampaignCard } from '@/components/CampaignCard';
import AboutSettings from '@/components/AboutSettings';
import LegalManager from '@/components/LegalManager';

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'about' | 'support'>('campaigns');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "", period: "", status: "Aktif", description: "", discount: ""
  });

  useEffect(() => {
    const q = query(collection(db, "campaigns"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!formData.title) return;
    setUploading(true);
    try {
      let imageUrl = selectedImage;
      if (selectedImage && selectedImage.startsWith('file://')) {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const storageRef = ref(storage, `campaigns/${Date.now()}.jpg`);
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
      }
      const payload = { ...formData, image: imageUrl, updatedAt: new Date() };
      if (editingId) {
        await updateDoc(doc(db, "campaigns", editingId), payload);
      } else {
        await addDoc(collection(db, "campaigns"), { ...payload, clicks: "0", createdAt: new Date() });
      }
      closeModal();
    } catch (e) { console.error(e); } finally { setUploading(false); }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setSelectedImage(null);
    setFormData({ title: "", period: "", status: "Aktif", description: "", discount: "" });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>İÇERİK <Text style={{color: '#64748b'}}>YÖNETİMİ</Text></Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity onPress={() => setActiveTab('campaigns')}><Text style={[styles.tabText, activeTab === 'campaigns' && styles.tabActive]}>Kampanyalar</Text></TouchableOpacity>
            <Text style={styles.divider}>/</Text>
            <TouchableOpacity onPress={() => setActiveTab('about')}><Text style={[styles.tabText, activeTab === 'about' && styles.tabActive]}>Hakkımızda</Text></TouchableOpacity>
            <Text style={styles.divider}>/</Text>
            <TouchableOpacity onPress={() => setActiveTab('support')}><Text style={[styles.tabText, activeTab === 'support' && styles.tabActive]}>Destek</Text></TouchableOpacity>
          </View>
        </View>
        {activeTab === 'campaigns' && (
          <TouchableOpacity style={styles.addButton} onPress={() => setIsModalOpen(true)}>
            <Plus size={16} color="black" strokeWidth={3} />
            <Text style={styles.addButtonText}>YENİ</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'campaigns' && (
          <View>
            <View style={styles.searchWrapper}>
              <Search size={14} color="#475569" />
              <TextInput style={styles.searchInput} placeholder="Kampanya ara..." placeholderTextColor="#475569" onChangeText={setSearchTerm} />
            </View>
            {loading ? <ActivityIndicator color="#3b82f6" /> : campaigns.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map(camp => (
              <CampaignCard key={camp.id} {...camp} onEdit={() => {
                setEditingId(camp.id);
                setFormData({ title: camp.title, period: camp.period, status: camp.status, description: camp.description || "", discount: camp.discount || "" });
                setSelectedImage(camp.image);
                setIsModalOpen(true);
              }} />
            ))}
          </View>
        )}
        {activeTab === 'about' && <AboutSettings />}
        {activeTab === 'support' && <LegalManager />}
      </ScrollView>

      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? "DÜZENLE" : "YENİ KAMPANYA"}</Text>
              <TouchableOpacity onPress={closeModal}><X size={20} color="#64748b" /></TouchableOpacity>
            </View>
            <ScrollView style={{padding: 20}}>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {selectedImage ? <Image source={{uri: selectedImage}} style={styles.previewImg} /> : (
                  <View style={{alignItems: 'center'}}><UploadCloud size={24} color="#475569"/><Text style={styles.pickerText}>Görsel Seç</Text></View>
                )}
              </TouchableOpacity>
              <TextInput style={styles.modalInput} placeholder="Kampanya Başlığı" placeholderTextColor="#475569" value={formData.title} onChangeText={t => setFormData({...formData, title: t})} />
              <View style={{flexDirection: 'row', gap: 10}}>
                <TextInput style={[styles.modalInput, {flex: 1}]} placeholder="İndirim %" placeholderTextColor="#475569" value={formData.discount} onChangeText={t => setFormData({...formData, discount: t})} keyboardType="numeric" />
                <TextInput style={[styles.modalInput, {flex: 1}]} placeholder="Dönem" placeholderTextColor="#475569" value={formData.period} onChangeText={t => setFormData({...formData, period: t})} />
              </View>
              <TextInput style={[styles.modalInput, {height: 80}]} multiline placeholder="Açıklama" placeholderTextColor="#475569" value={formData.description} onChangeText={t => setFormData({...formData, description: t})} />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={uploading}>
                {uploading ? <ActivityIndicator color="black" /> : <Text style={styles.saveBtnText}>{editingId ? "GÜNCELLE" : "YAYINLA"}</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
  headerTitle: { color: '#3b82f6', fontSize: 24, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', gap: 10, marginTop: 5, alignItems: 'center' },
  tabText: { color: '#475569', fontSize: 11, fontWeight: 'bold' },
  tabActive: { color: '#3b82f6' },
  divider: { color: '#1e293b' },
  addButton: { backgroundColor: 'white', flexDirection: 'row', padding: 10, borderRadius: 15, gap: 5, alignItems: 'center' },
  addButtonText: { fontWeight: '900', fontSize: 10, color: 'black' },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', paddingHorizontal: 15, borderRadius: 12, marginBottom: 20 },
  searchInput: { flex: 1, color: 'white', height: 45, marginLeft: 10 },
  scrollContent: { padding: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0f172a', height: '85%', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  modalTitle: { color: 'white', fontWeight: 'bold' },
  imagePicker: { height: 150, backgroundColor: '#020617', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#1e293b' },
  previewImg: { width: '100%', height: '100%' },
  pickerText: { color: '#475569', fontSize: 10, fontWeight: 'bold', marginTop: 5 },
  modalInput: { backgroundColor: '#020617', borderRadius: 12, padding: 15, color: 'white', marginBottom: 15, borderWidth: 1, borderColor: '#1e293b' },
  saveBtn: { backgroundColor: 'white', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  saveBtnText: { fontWeight: 'bold', color: 'black' }
});