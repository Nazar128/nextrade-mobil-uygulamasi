"use client";
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, KeyboardTypeOptions, FlatList, Dimensions, ScrollView } from 'react-native';
import { db, auth } from "@/api/firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { MapPin, Plus, Trash2, Edit2, Home, Briefcase, X, User, Phone, GraduationCap, Sun } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 50) / 2;

interface Address {
  id: string; title: string; displayName: string; phone: string; email: string; city: string; district: string; address: string;
}

interface ModalInputProps {
  label: string; value: string; onChangeText: (text: string) => void; placeholder?: string; keyboardType?: KeyboardTypeOptions;
}

export default function AddressesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [formData, setFormData] = useState({
    title: '', displayName: '', phone: '', email: '', city: '', district: '', address: ''
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        const q = query(collection(db, "users", user.uid, "adreslerim"), orderBy("createdAt", "desc"));
        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          setAddresses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Address[]);
          setLoading(false);
        });
        return () => unsubscribeFirestore();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const openModal = (address: Address | null = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        title: address.title || '', displayName: address.displayName || '', phone: address.phone || '',
        email: address.email || '', city: address.city || '', district: address.district || '', address: address.address || ''
      });
    } else {
      setEditingAddress(null);
      setFormData({ title: '', displayName: '', phone: '', email: '', city: '', district: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!userId) return;
    const data = { ...formData, updatedAt: serverTimestamp() };
    try {
      if (editingAddress) {
        await updateDoc(doc(db, "users", userId, "adreslerim", editingAddress.id), data);
      } else {
        await addDoc(collection(db, "users", userId, "adreslerim"), { ...data, createdAt: serverTimestamp() });
      }
      setIsModalOpen(false);
    } catch (error) {
      Alert.alert("Hata", "İşlem gerçekleştirilemedi.");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Sil", "Bu adresi silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => {
          try { await deleteDoc(doc(db, "users", userId!, "adreslerim", id)); } 
          catch (error) { Alert.alert("Hata", "Silme işlemi başarısız."); }
        } 
      }
    ]);
  };

  const getIcon = (title: string) => {
    const t = title?.toLowerCase() || "";
    if (t.includes('ev')) return <Home size={18} color="#60a5fa" />;
    if (t.includes('iş')) return <Briefcase size={18} color="#a855f7" />;
    if (t.includes('yurt')) return <GraduationCap size={18} color="#eab308" />;
    if (t.includes('yazlık')) return <Sun size={18} color="#f97316" />;
    return <MapPin size={18} color="#60a5fa" />;
  };

  const renderAddressCard = ({ item }: { item: Address }) => (
    <View style={styles.card}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>{getIcon(item.title)}</View>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => openModal(item)} style={styles.actionBtn}><Edit2 size={14} color="#60a5fa" /></TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}><Trash2 size={14} color="#ef4444" /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>{item.district}</Text></View>
          <View style={styles.infoRow}>
            <MapPin size={12} color="#3b82f6" />
            <Text style={styles.cityText} numberOfLines={1}>{item.city}</Text>
          </View>
          <Text style={styles.addressText}>{item.address}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}><User size={10} color="#475569" /><Text style={styles.footerText} numberOfLines={1}>{item.displayName}</Text></View>
          <View style={styles.footerItem}><Phone size={10} color="#475569" /><Text style={styles.footerText} numberOfLines={1}>{item.phone}</Text></View>
        </View>
      </ScrollView>
    </View>
  );

  if (loading) return (
    <View style={styles.loadingCenter}><ActivityIndicator size="large" color="#2563eb" /></View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderAddressCard}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Adres<Text style={{ color: '#94a3b8' }}>lerim</Text></Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
              <View style={styles.plusCircle}><Plus size={24} color="#64748b" /></View>
              <Text style={styles.addButtonText}>YENİ ADRES</Text>
            </TouchableOpacity>
          </>
        }
        contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />

      <Modal visible={isModalOpen} animationType="slide" transparent={true} onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingAddress ? 'DÜZENLE' : 'YENİ KAYIT'}</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}><X size={24} color="#fff" /></TouchableOpacity>
            </View>
            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              <ModalInput label="Başlık" value={formData.title} onChangeText={(text) => setFormData(prev => ({...prev, title: text}))} placeholder="Ev, İş..." />
              <ModalInput label="Ad Soyad" value={formData.displayName} onChangeText={(text) => setFormData(prev => ({...prev, displayName: text}))} placeholder="Ad Soyad" />
              <ModalInput label="Telefon" value={formData.phone} onChangeText={(text) => setFormData(prev => ({...prev, phone: text}))} placeholder="05XX..." keyboardType="phone-pad" />
              <ModalInput label="E-Posta" value={formData.email} onChangeText={(text) => setFormData(prev => ({...prev, email: text}))} placeholder="mail@example.com" keyboardType="email-address" />
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}><ModalInput label="Şehir" value={formData.city} onChangeText={(text) => setFormData(prev => ({...prev, city: text}))} /></View>
                <View style={{ flex: 1 }}><ModalInput label="İlçe" value={formData.district} onChangeText={(text) => setFormData(prev => ({...prev, district: text}))} /></View>
              </View>
              <Text style={styles.label}>TAM ADRES</Text>
              <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={4} value={formData.address} onChangeText={(text) => setFormData(prev => ({...prev, address: text}))} placeholderTextColor="#475569" />
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{editingAddress ? 'GÜNCELLE' : 'KAYDET'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ModalInput({ label, value, onChangeText, placeholder, keyboardType = 'default' }: ModalInputProps) {
  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#475569" keyboardType={keyboardType} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingCenter: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  header: { marginTop: 40, marginBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#2563eb' },
  addButton: { height: 100, borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#1e293b', backgroundColor: 'rgba(255,255,255,0.02)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  plusCircle: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' },
  addButtonText: { color: '#64748b', marginTop: 8, fontWeight: '900', letterSpacing: 1, fontSize: 10 },
  card: { backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: 20, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#1e293b', width: COLUMN_WIDTH, height: 220 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  iconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '900' },
  badge: { alignSelf: 'flex-start', backgroundColor: 'rgba(59,130,246,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginVertical: 4, borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)' },
  badgeText: { color: '#3b82f6', fontSize: 9, fontWeight: '800' },
  actionButtons: { flexDirection: 'row' },
  actionBtn: { padding: 4, marginLeft: 2 },
  cardBody: { flex: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  cityText: { color: '#cbd5e1', fontWeight: '700', fontSize: 11, marginLeft: 4 },
  addressText: { color: '#64748b', fontSize: 10, lineHeight: 14 },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 8, marginTop: 8 },
  footerItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  footerText: { color: '#475569', fontSize: 9, fontWeight: '800', marginLeft: 4, flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0c0d10', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, height: '85%', borderTopWidth: 1, borderTopColor: '#1e293b' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  formScroll: { flex: 1 },
  label: { color: '#475569', fontSize: 9, fontWeight: '900', marginBottom: 6, letterSpacing: 1 },
  input: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, padding: 12, color: '#fff', fontSize: 13 },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', marginBottom: 5 },
  saveButton: { backgroundColor: '#fff', borderRadius: 15, padding: 15, alignItems: 'center', marginTop: 15, marginBottom: 30 },
  saveButtonText: { color: '#000', fontWeight: '900', letterSpacing: 1, fontSize: 12 }
});