"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, ScrollView, TextInput, TouchableOpacity, 
  Image, ActivityIndicator, SafeAreaView, StyleSheet, 
  Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { 
  Store, Clock, MapPin, Save, Camera, 
  Mail, Info, ShieldCheck, Loader2 
} from 'lucide-react-native';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth, storage } from "@/api/firebase";
import * as ImagePicker from 'expo-image-picker';

export default function StoreSettingsMobile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [storeData, setStoreData] = useState({
    storeName: "",
    email: "",
    description: "",
    address: "",
    city: "",
    imageUrl: "https://via.placeholder.com/150"
  });

  const [days, setDays] = useState([
    { day: "Pazartesi", open: "09:00", close: "19:00", active: true },
    { day: "Salı", open: "09:00", close: "19:00", active: true },
    { day: "Çarşamba", open: "09:00", close: "19:00", active: true },
    { day: "Perşembe", open: "09:00", close: "19:00", active: true },
    { day: "Cuma", open: "09:00", close: "19:00", active: true },
    { day: "Cumartesi", open: "10:00", close: "16:00", active: true },
    { day: "Pazar", open: "00:00", close: "00:00", active: false },
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchStoreData(currentUser.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchStoreData = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStoreData({
          storeName: data.storeName || "",
          email: data.email || auth.currentUser?.email || "",
          description: data.description || "",
          address: data.address || "",
          city: data.city || "",
          imageUrl: data.imageUrl || "https://via.placeholder.com/150"
        });
        if (data.workingHours) setDays(data.workingHours);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && user) {
      handleImageUpload(result.assets[0].uri);
    }
  };

  const handleImageUpload = async (uri: string) => {
    setUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `stores/${user.uid}/logo`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      setStoreData(prev => ({ ...prev, imageUrl: url }));
    } catch (error) {
      Alert.alert("Hata", "Resim yüklenemedi.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...storeData,
        workingHours: days,
        updatedAt: new Date()
      });
      Alert.alert("Başarılı", "Mağaza bilgileri güncellendi.");
    } catch (error) {
      Alert.alert("Hata", "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.cardMain}>
            <View style={styles.banner}>
              <View style={styles.avatarWrapper}>
                <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                  {uploading ? (
                    <ActivityIndicator color="#6366f1" />
                  ) : (
                    <Image source={{ uri: storeData.imageUrl }} style={styles.avatar} />
                  )}
                  <View style={styles.cameraIcon}>
                    <Camera size={16} color="#fff" />
                  </View>
                </TouchableOpacity>
                <View style={styles.titleInfo}>
                  <Text style={styles.storeNameText}>{storeData.storeName || "Mağaza Adı"}</Text>
                  <View style={styles.verifiedBadge}>
                    <ShieldCheck size={12} color="#10b981" />
                    <Text style={styles.verifiedText}>DOĞRULANMIŞ SATICI</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Store size={12} color="#6366f1" />
                  <Text style={styles.labelText}>MAĞAZA ADI</Text>
                </View>
                <TextInput 
                  style={styles.input} 
                  value={storeData.storeName} 
                  onChangeText={(text) => setStoreData({...storeData, storeName: text})}
                  placeholderTextColor="#475569"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Mail size={12} color="#6366f1" />
                  <Text style={styles.labelText}>E-POSTA</Text>
                </View>
                <TextInput 
                  style={styles.input} 
                  value={storeData.email} 
                  onChangeText={(text) => setStoreData({...storeData, email: text})}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Info size={12} color="#6366f1" />
                  <Text style={styles.labelText}>AÇIKLAMA</Text>
                </View>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  value={storeData.description} 
                  onChangeText={(text) => setStoreData({...storeData, description: text})}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          </View>

          <View style={styles.cardHours}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconCircle}>
                <Clock size={20} color="#f59e0b" />
              </View>
              <Text style={styles.sectionTitle}>ÇALIŞMA SAATLERİ</Text>
            </View>
            {days.map((item, idx) => (
              <View key={idx} style={styles.dayRow}>
                <Text style={[styles.dayLabel, !item.active && { color: '#334155' }]}>{item.day}</Text>
                <View style={styles.timeInputs}>
                  <TextInput 
                    style={styles.timeInput} 
                    value={item.open} 
                    editable={item.active}
                    onChangeText={(text) => { const n = [...days]; n[idx].open = text; setDays(n); }}
                  />
                  <Text style={styles.timeDivider}>-</Text>
                  <TextInput 
                    style={styles.timeInput} 
                    value={item.close} 
                    editable={item.active}
                    onChangeText={(text) => { const n = [...days]; n[idx].close = text; setDays(n); }}
                  />
                  <TouchableOpacity 
                    onPress={() => { const n = [...days]; n[idx].active = !n[idx].active; setDays(n); }}
                    style={[styles.statusBtn, item.active ? styles.statusBtnOff : styles.statusBtnOn]}
                  >
                    <Text style={styles.statusBtnText}>{item.active ? 'KAPAT' : 'AÇ'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.cardLocation}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                <MapPin size={20} color="#6366f1" />
              </View>
              <Text style={styles.sectionTitle}>KONUM AYARLARI</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.labelText}>ŞEHİR</Text>
              <TextInput 
                style={styles.input} 
                value={storeData.city} 
                onChangeText={(text) => setStoreData({...storeData, city: text})}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.labelText}>TAM ADRES</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={storeData.address} 
                onChangeText={(text) => setStoreData({...storeData, address: text})}
                multiline
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSave} 
            disabled={saving} 
            style={styles.saveBtn}
          >
            {saving ? <ActivityIndicator color="#fff" /> : (
              <>
                <Save size={18} color="#fff" />
                <Text style={styles.saveBtnText}>GÜNCELLEMELERİ KAYDET</Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  loadingContainer: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  cardMain: { backgroundColor: '#0f172a', borderRadius: 32, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#1e293b' },
  banner: { height: 160, backgroundColor: '#1e1b4b', padding: 20, justifyContent: 'flex-end' },
  avatarWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: -40 },
  avatarContainer: { width: 90, height: 90, borderRadius: 24, backgroundColor: '#0f172a', borderWidth: 4, borderColor: '#0f172a', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  avatar: { width: '100%', height: '100%', objectFit: 'cover' },
  cameraIcon: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.5)', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  titleInfo: { marginLeft: 16, marginBottom: 10 },
  storeNameText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  verifiedText: { color: '#10b981', fontSize: 9, fontWeight: '900', marginLeft: 4, letterSpacing: 1 },
  formSection: { paddingTop: 50, padding: 20 },
  inputGroup: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginLeft: 4 },
  labelText: { color: '#64748b', fontSize: 10, fontWeight: '900', marginLeft: 6, letterSpacing: 1 },
  input: { backgroundColor: '#020617',  borderColor: '#1e293b', borderRadius: 16, padding: 16, color: '#fff', fontSize: 14 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  cardHours: { backgroundColor: '#0f172a', borderRadius: 32, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#1e293b' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  iconCircle: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(245, 158, 11, 0.1)', justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '900', marginLeft: 12 },
  dayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, backgroundColor: 'rgba(2, 6, 23, 0.3)', padding: 10, borderRadius: 16 },
  dayLabel: { color: '#cbd5e1', fontSize: 11, fontWeight: '700', width: 80 },
  timeInputs: { flexDirection: 'row', alignItems: 'center' },
  timeInput: { backgroundColor: '#020617', width: 50, padding: 8, borderRadius: 10, color: '#94a3b8', fontSize: 10, textAlign: 'center', borderWidth: 1, borderColor: '#1e293b' },
  timeDivider: { color: '#334155', marginHorizontal: 4, fontWeight: 'bold' },
  statusBtn: { marginLeft: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusBtnOn: { backgroundColor: 'rgba(99, 102, 241, 0.1)' },
  statusBtnOff: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  statusBtnText: { fontSize: 9, fontWeight: '900', color: '#6366f1' },
  cardLocation: { backgroundColor: '#0f172a', borderRadius: 32, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#1e293b' },
  saveBtn: { backgroundColor: '#4f46e5', padding: 20, borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  saveBtnText: { color: '#fff', fontSize: 12, fontWeight: '900', marginLeft: 10, letterSpacing: 2 }
});