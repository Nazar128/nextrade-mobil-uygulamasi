import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { X, UserPlus, Mail, ShieldCheck, Send } from 'lucide-react-native';
import { db, auth } from '../api/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';

export const AddUserModal = ({ visible, onClose }: any) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({ displayName: '', email: '', role: 'Müşteri' });

  const handleSubmit = async () => {
    if (!user.email || !user.displayName) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "users"), {
        ...user,
        status: "Aktif",
        createdAt: serverTimestamp(),
      });
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert("Başarılı", "Kullanıcı eklendi ve şifre sıfırlama maili gönderildi.");
      onClose();
    } catch (error: any) {
      Alert.alert("Hata", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}><UserPlus size={20} color="#6366f1" /> DAVET ET</Text>
            <TouchableOpacity onPress={onClose}><X size={24} color="#64748b" /></TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Kullanıcıya şifre oluşturma bağlantısı gönderilecektir.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>AD SOYAD</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nazar Kalçık" 
              placeholderTextColor="#475569" 
              onChangeText={(v) => setUser({...user, displayName: v})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-POSTA</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="email-address" 
              placeholder="nazar@nextrade.com" 
              placeholderTextColor="#475569"
              onChangeText={(v) => setUser({...user, email: v})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>YETKİ ROLÜ</Text>
            <View style={styles.roleContainer}>
              {['Müşteri', 'Satıcı', 'Admin'].map((r) => (
                <TouchableOpacity 
                  key={r} 
                  style={[styles.roleBtn, user.role === r && styles.roleBtnActive]} 
                  onPress={() => setUser({...user, role: r})}
                >
                  <Text style={[styles.roleBtnText, user.role === r && styles.roleBtnTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity disabled={loading} onPress={handleSubmit} style={styles.submitBtn}>
            {loading ? <ActivityIndicator color="white" /> : <><Text style={styles.submitBtnText}>Davet Gönder</Text><Send size={18} color="white"/></>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0f172a', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, borderTopWidth: 1, borderTopColor: '#1e293b' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  infoBox: { backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.2)' },
  infoText: { color: '#94a3b8', fontSize: 11, textAlign: 'center' },
  inputGroup: { marginBottom: 15 },
  label: { color: '#64748b', fontSize: 10, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#020617', borderRadius: 15, height: 50, paddingHorizontal: 15, color: 'white', borderWidth: 1, borderColor: '#1e293b' },
  roleContainer: { flexDirection: 'row', gap: 10 },
  roleBtn: { flex: 1, height: 45, backgroundColor: '#020617', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' },
  roleBtnActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  roleBtnText: { color: '#64748b', fontSize: 12, fontWeight: 'bold' },
  roleBtnTextActive: { color: 'white' },
  submitBtn: { backgroundColor: '#4f46e5', height: 55, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});