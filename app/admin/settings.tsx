import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { db } from "@/api/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { SettingInput } from "@/components/SettingInput";
import { SettingToggle } from "@/components/SettingToggle";
import { SettingSection } from "@/components/SettingSection";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    shippingLimit: "",
    commissionRate: "",
    maintenanceMode: false,
    storeRegistration: true,
    supportEmail: "",
    apiKey: ""
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const docRef = doc(db, "system", "settings");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setSettings(docSnap.data() as any);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "system", "settings"), settings);
      Alert.alert("Başarılı", "Sistem ayarları güncellendi.");
    } catch (error) {
      Alert.alert("Hata", "Ayarlar kaydedilemedi.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#1d4ed8" /></View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SİSTEM <Text style={styles.headerAccent}>AYARLARI</Text></Text>
        <View style={styles.headerLine} />
      </View>

      <SettingSection title="Finans">
        <SettingInput label="Kargo Alt Limiti" value={settings.shippingLimit} onChange={(val: string) => setSettings({...settings, shippingLimit: val})} />
        <SettingInput label="Komisyon Oranı" value={settings.commissionRate} onChange={(val: string) => setSettings({...settings, commissionRate: val})} />
      </SettingSection>

      <SettingSection title="Erişim">
        <SettingToggle label="Bakım Modu" isActive={settings.maintenanceMode} onToggle={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} />
        <SettingToggle label="Mağaza Kaydı" isActive={settings.storeRegistration} onToggle={() => setSettings({...settings, storeRegistration: !settings.storeRegistration})} />
      </SettingSection>

      <SettingSection title="İletişim">
        <SettingInput label="Destek E-Posta" value={settings.supportEmail} onChange={(val: string) => setSettings({...settings, supportEmail: val})} />
        <SettingInput label="API Servis Anahtarı" type="password" value={settings.apiKey} onChange={(val: string) => setSettings({...settings, apiKey: val})} />
      </SettingSection>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleUpdate} disabled={isSaving} style={[styles.btn, isSaving && {opacity: 0.6}]}>
          <Text style={styles.btnText}>{isSaving ? "GÜNCELLENİYOR..." : "AYARLARI GÜNCELLE"}</Text>
        </TouchableOpacity>
        <Text style={styles.version}>Control Panel v2.4.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scrollContent: { padding: 20, paddingBottom: 60 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { alignItems: "center", marginBottom: 35, marginTop: 10 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#94a3b8", letterSpacing: 3 },
  headerAccent: { color: "#1d4ed8", fontSize: 24 },
  headerLine: { height: 4, width: 40, backgroundColor: "#1d4ed8", borderRadius: 10, marginTop: 8 },
  footer: { alignItems: "center", marginTop: 40, gap: 20 },
  btn: { backgroundColor: "#1e3a8a", paddingHorizontal: 40, paddingVertical: 18, borderRadius: 100, shadowColor: "#1d4ed8", shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },
  btnText: { color: "#ffffff", fontSize: 11, fontWeight: "900", letterSpacing: 2 },
  version: { fontSize: 10, color: "#cbd5e1", fontWeight: "700", letterSpacing: 4, textTransform: "uppercase" }
});