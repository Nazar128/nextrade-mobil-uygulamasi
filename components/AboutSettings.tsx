import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,  ScrollView, Alert } from 'react-native';
import { db, storage } from '@/api/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker';
import { Save, UploadCloud, Trash2 } from 'lucide-react-native';
import { Image } from 'expo-image';
export default function AboutSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    const fetchAbout = async () => {
      const docSnap = await getDoc(doc(db, "corporate", "about"));
      if (docSnap.exists()) setData(docSnap.data());
      setLoading(false);
    };
    fetchAbout();
  }, []);

  const pickImage = async (field: string) => {
    let result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7 });
    if (!result.canceled) {
      setSaving(true);
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `corporate/${field}_${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      setData({ ...data, [field]: url });
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await setDoc(doc(db, "corporate", "about"), data);
    setSaving(false);
    Alert.alert("Başarılı", "Hakkımızda sayfası güncellendi.");
  };

  if (loading) return <ActivityIndicator color="#3b82f6" />;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>HERO GÖRSELİ</Text>
      <TouchableOpacity style={styles.imgBox} onPress={() => pickImage('heroBg')}>
        {data.heroBg ? <Image source={{uri: data.heroBg}} style={styles.fullImg} contentFit="cover" transition={500}  cachePolicy="disk"  /> : <UploadCloud color="#475569" />}
      </TouchableOpacity>

      <Text style={styles.label}>VİZYON & MİSYON</Text>
      <TextInput style={styles.input} placeholder="Vizyon Başlığı" placeholderTextColor="#475569" value={data.visionTitle} onChangeText={t => setData({...data, visionTitle: t})} />
      <TextInput style={[styles.input, {height: 80}]} multiline placeholder="Vizyon Açıklaması" placeholderTextColor="#475569" value={data.visionDesc} onChangeText={t => setData({...data, visionDesc: t})} />
      
      <TouchableOpacity style={[styles.imgBox, {height: 120}]} onPress={() => pickImage('visionImg')}>
        {data.visionImg ? <Image source={{uri: data.visionImg}} style={styles.fullImg} contentFit="cover" transition={500}  cachePolicy="disk"  /> : <Text style={{color: '#475569', fontSize: 10}}>Vizyon Görseli Seç</Text>}
      </TouchableOpacity>

      <Text style={styles.label}>İSTATİSTİKLER</Text>
      <View style={{flexDirection: 'row', gap: 10}}>
        <TextInput style={[styles.input, {flex: 1}]} placeholder="Kullanıcı" placeholderTextColor="#475569" value={data.statsUser} onChangeText={t => setData({...data, statsUser: t})} />
        <TextInput style={[styles.input, {flex: 1}]} placeholder="Ülke" placeholderTextColor="#475569" value={data.statsCountry} onChangeText={t => setData({...data, statsCountry: t})} />
      </View>

      <TouchableOpacity style={styles.mainSaveBtn} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="black" /> : <><Save size={18} color="black"/><Text style={styles.saveBtnText}>TÜMÜNÜ KAYDET</Text></>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15 },
  label: { color: '#3b82f6', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  imgBox: { height: 150, backgroundColor: '#0f172a', borderRadius: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#1e293b' },
  fullImg: { width: '100%', height: '100%' },
  input: { backgroundColor: '#0f172a', borderRadius: 15, padding: 15, color: 'white', borderWidth: 1, borderColor: '#1e293b' },
  mainSaveBtn: { backgroundColor: 'white', height: 55, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: 50 },
  saveBtnText: { fontWeight: 'bold', color: 'black' },
});