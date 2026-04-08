import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { db, auth, storage } from "@/api/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from "firebase/auth";
import { Camera, ShieldCheck, Mail, Phone, Lock, User as UserIcon, Zap, Loader2, KeyRound } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function MobileDashboardPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [userData, setUserData] = useState({
    displayName: "",
    email: "",
    phone: "",
    role: "user",
    createdAt: "",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300"
  });
  const [security, setSecurity] = useState({ currentPassword: "", newPassword: "" });
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          let dateString = "Mart 2026";
          if (data.createdAt?.toDate) {
            dateString = data.createdAt.toDate().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
          }
          setUserData({
            displayName: data.displayName || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            role: data.role || "user",
            createdAt: dateString,
            profileImage: data.profileImage || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300"
          });
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("İzin Gerekli", "Galeriye erişim izni vermeniz gerekiyor.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled && auth.currentUser) {
      setUploadingImage(true);
      try {
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `profiles/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        await updateDoc(doc(db, "users", auth.currentUser.uid), { profileImage: downloadURL });
        await updateProfile(auth.currentUser, { photoURL: downloadURL });
        setUserData(prev => ({ ...prev, profileImage: downloadURL }));
      } catch (error) {
        Alert.alert("Hata", "Görsel yüklenemedi.");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleUpdateProfile = async () => {
    const user = auth.currentUser;
    if (!user || !security.currentPassword) {
      Alert.alert("Doğrulama Gerekli", "Mevcut şifrenizi girin.");
      return;
    }
    setIsSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email!, security.currentPassword);
      await reauthenticateWithCredential(user, credential);
      if (security.newPassword) await updatePassword(user, security.newPassword);
      await updateDoc(doc(db, "users", user.uid), {
        displayName: userData.displayName,
        phone: userData.phone
      });
      await updateProfile(user, { displayName: userData.displayName });
      setIsEditing(false);
      setSecurity({ currentPassword: "", newPassword: "" });
      Alert.alert("Başarılı", "Profiliniz güncellendi.");
    } catch (error: any) {
      Alert.alert("Hata", "İşlem başarısız oldu.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <View style={styles.loaderFull}>
      <Loader2 size={48} color="#06b6d4" />
      <Text style={styles.loaderText}>SİSTEM HAZIRLANIYOR</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.headerCard}>
            <View style={styles.profileSection}>
              <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
                <View style={styles.avatarGradient}>
                  <View style={styles.avatarInner}>
                    {uploadingImage ? <ActivityIndicator color="#fff" /> : <Image source={{ uri: userData.profileImage }} style={styles.avatarImg} />}
                    <View style={styles.cameraIcon}><Camera size={14} color="#fff" /></View>
                  </View>
                </View>
                <View style={styles.shieldBadge}><ShieldCheck size={14} color="#22c55e" fill="#22c55e" /></View>
              </TouchableOpacity>
              <View style={styles.infoBox}>
                <Text style={styles.roleText}>{userData.role === 'admin' ? 'YÖNETİCİ' : 'MÜŞTERİ'} PROFİLİ</Text>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{userData.displayName || "Kullanıcı"}</Text>
                  <View style={styles.zapIcon}><Zap size={14} color="#22d3ee" fill="#22d3ee" /></View>
                </View>
                <Text style={styles.dateText}>Üyelik Tarihi: {userData.createdAt}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.toggleBtn} onPress={() => setIsEditing(!isEditing)}>
              <Text style={styles.toggleBtnText}>{isEditing ? "DÜZENLEMEYİ KAPAT" : "PROFİLİ GÜNCELLE"}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {isEditing && (
          <View style={styles.formArea}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>HESAP DETAYLARI</Text>
              <InputGroup label="İsim Soyisim" icon={<UserIcon size={18} color="#94a3b8" />} value={userData.displayName} onChangeText={(t: string) => setUserData({...userData, displayName: t})} />
              <InputGroup label="Telefon" icon={<Phone size={18} color="#94a3b8" />} value={userData.phone} onChangeText={(t: string) => setUserData({...userData, phone: t})} keyboardType="phone-pad" />
              <InputGroup label="E-Posta" icon={<Mail size={18} color="#94a3b8" />} value={userData.email} editable={false} />
            </View>
            <View style={styles.card}>
              <Text style={[styles.cardLabel, { color: '#a855f7' }]}>GÜVENLİK ONAYI</Text>
              <InputGroup label="Mevcut Şifre" icon={<KeyRound size={18} color="#94a3b8" />} secureTextEntry placeholder="Şifrenizi girin" value={security.currentPassword} onChangeText={(t: string) => setSecurity({...security, currentPassword: t})} />
              <View style={styles.separator} />
              <InputGroup label="Yeni Şifre" icon={<Lock size={18} color="#94a3b8" />} secureTextEntry placeholder="Zorunlu değil" value={security.newPassword} onChangeText={(t: string) => setSecurity({...security, newPassword: t})} />
              <TouchableOpacity style={styles.submitBtn} onPress={handleUpdateProfile} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>GÜNCELLEMEYİ TAMAMLA</Text>}
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => {router.push("/profile/addresses")}}><Text>Adreslerim</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => {router.push("/profile/orders")}}><Text>SiparişLerim</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => {router.push("/profile/wishlist")}}><Text>FAVORİLERİM</Text></TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputGroup({ label, icon, placeholder, value, onChangeText, editable = true, secureTextEntry = false, keyboardType = "default" }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, !editable && { opacity: 0.3 }]}>
        <View style={styles.icon}>{icon}</View>
        <TextInput style={styles.field} value={value} onChangeText={onChangeText} editable={editable} placeholder={placeholder} placeholderTextColor="#475569" secureTextEntry={secureTextEntry} keyboardType={keyboardType} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  loaderFull: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 15, color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 4 },
  scrollContent: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  headerContainer: { padding: 1, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.1)', shadowColor: "#06b6d4", shadowOpacity: 0.3, shadowRadius: 20 },
  headerCard: { backgroundColor: '#0f1115', borderRadius: 34, padding: 25 },
  profileSection: { alignItems: 'center', marginBottom: 25 },
  avatarGradient: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#06b6d4', padding: 3 },
  avatarInner: { flex: 1, backgroundColor: '#0f1115', borderRadius: 75, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  cameraIcon: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.5)', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', opacity: 0.8 },
  shieldBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#020617', borderRadius: 15, padding: 5, borderWidth: 2, borderColor: '#06b6d4' },
  infoBox: { alignItems: 'center', marginTop: 15 },
  roleText: { color: '#64748b', fontSize: 10, fontWeight: 'bold', letterSpacing: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 5 },
  userName: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  zapIcon: { padding: 5, borderRadius: 10, borderWidth: 1, borderColor: '#22d3ee' },
  dateText: { color: '#475569', fontSize: 14, fontStyle: 'italic' },
  toggleBtn: { backgroundColor: '#0891b2', height: 55, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  toggleBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5 },
  formArea: { marginTop: 20, gap: 15 },
  card: { backgroundColor: '#0f1115', borderRadius: 25, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardLabel: { color: '#06b6d4', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  label: { color: '#475569', fontSize: 10, fontWeight: 'bold', marginBottom: 8, marginLeft: 5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', height: 55 },
  icon: { paddingHorizontal: 15 },
  field: { flex: 1, color: '#fff', fontSize: 15 },
  separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 10 },
  submitBtn: { backgroundColor: '#fff', height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#000', fontWeight: '900', fontSize: 12, letterSpacing: 1.5 }
});