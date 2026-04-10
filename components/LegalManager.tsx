import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { db } from "@/api/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ShieldCheck, FileText, Clock, AlertCircle, Save } from 'lucide-react-native';

export default function LegalManager() {
  const [activeSubTab, setActiveSubTab] = useState<'privacy' | 'terms'>('privacy');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({ title: '', content: '', updatedAt: null });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const docId = activeSubTab === 'privacy' ? 'privacy' : 'terms';
      try {
        const snap = await getDoc(doc(db, "legal", docId));
        if (snap.exists()) {
          setData(snap.data() as any);
        } else {
          setData({ title: activeSubTab === 'privacy' ? 'Gizlilik Politikası' : 'Kullanım Koşulları', content: '', updatedAt: null });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeSubTab]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const docId = activeSubTab === 'privacy' ? 'privacy' : 'terms';
      const updatePayload = { ...data, updatedAt: new Date().toISOString() };
      await setDoc(doc(db, "legal", docId), updatePayload);
      Alert.alert("Başarılı", "İçerik başarıyla güncellendi.");
    } catch (error) {
      Alert.alert("Hata", "Güncelleme başarısız oldu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.tabContainer}>
          <View style={styles.tabRow}>
            <TouchableOpacity onPress={() => setActiveSubTab('privacy')} style={[styles.tabButton, activeSubTab === 'privacy' && styles.activeTab]}>
              <ShieldCheck size={16} color={activeSubTab === 'privacy' ? "#FFF" : "#64748B"} />
              <Text style={[styles.tabText, activeSubTab === 'privacy' && styles.activeTabText]}>GİZLİLİK</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveSubTab('terms')} style={[styles.tabButton, activeSubTab === 'terms' && styles.activeTab]}>
              <FileText size={16} color={activeSubTab === 'terms' ? "#FFF" : "#64748B"} />
              <Text style={[styles.tabText, activeSubTab === 'terms' && styles.activeTabText]}>ŞARTLAR</Text>
            </TouchableOpacity>
          </View>
          {data.updatedAt && (
            <View style={styles.updateInfo}>
              <Clock size={12} color="#64748B" />
              <Text style={styles.updateText}>Son: {new Date(data.updatedAt).toLocaleDateString('tr-TR')}</Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#3B82F6" size="large" />
            <Text style={styles.loadingText}>VERİLER ÇEKİLİYOR</Text>
          </View>
        ) : (
          <ScrollView style={styles.formContainer} contentContainerStyle={styles.scrollPadding}>
            <View style={styles.editorCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>SAYFA BAŞLIĞI</Text>
                <TextInput style={styles.titleInput} value={data.title} onChangeText={(text) => setData({ ...data, title: text })} placeholderTextColor="#475569" placeholder="Başlık..." />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>İÇERİK METNİ</Text>
                <TextInput style={styles.contentInput} value={data.content} onChangeText={(text) => setData({ ...data, content: text })} multiline placeholderTextColor="#475569" placeholder="İçerik..." textAlignVertical="top" />
              </View>

              <View style={styles.infoBox}>
                <AlertCircle size={14} color="#3B82F6" />
                <Text style={styles.infoText}>Değişiklikler anında yayına yansır.</Text>
              </View>
            </View>
          </ScrollView>
        )}

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveButton}>
            {saving ? <ActivityIndicator color="#000" /> : <><Save size={18} color="#000" /><Text style={styles.saveButtonText}>YAYINLA</Text></>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617' },
  container: { flex: 1 },
  tabContainer: { padding: 16, backgroundColor: '#0F172A', borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  tabRow: { flexDirection: 'row', backgroundColor: '#020617', borderRadius: 20, padding: 4, gap: 4 },
  tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 16, gap: 8 },
  activeTab: { backgroundColor: '#2563EB' },
  tabText: { color: '#64748B', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  activeTabText: { color: '#FFF' },
  updateInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, gap: 6 },
  updateText: { color: '#64748B', fontSize: 10, fontStyle: 'italic' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 15 },
  loadingText: { color: '#64748B', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  formContainer: { flex: 1 },
  scrollPadding: { padding: 16, paddingBottom: 100 },
  editorCard: { backgroundColor: '#0F172A', borderRadius: 32, padding: 20, borderWidth: 1, borderColor: '#1E293B' },
  inputGroup: { marginBottom: 20 },
  label: { color: '#64748B', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 8, marginLeft: 4 },
  titleInput: { backgroundColor: '#020617', color: '#FFF', borderRadius: 16, padding: 16, fontSize: 14, borderWidth: 1, borderColor: '#1E293B' },
  contentInput: { backgroundColor: '#020617', color: '#CBD5E1', borderRadius: 20, padding: 16, fontSize: 13, borderWidth: 1, borderColor: '#1E293B', minHeight: 300, lineHeight: 20 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, opacity: 0.7 },
  infoText: { color: '#64748B', fontSize: 10, fontStyle: 'italic' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#020617', borderTopWidth: 1, borderTopColor: '#1E293B' },
  saveButton: { backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 100, gap: 10 },
  saveButtonText: { color: '#000', fontWeight: '900', fontSize: 12, letterSpacing: 1 }
});