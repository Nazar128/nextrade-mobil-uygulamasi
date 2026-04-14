import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert } from "react-native";
import { Settings, Palette, Check, Save } from "lucide-react-native";
import { useTheme } from '@/context/ThemeContext';

const themes = [
  { id: "dark", name: "Koyu", color: "#030712" },
  { id: "navy", name: "Lacivert", color: "#0a0f1c" },
  { id: "purple", name: "Mor Gece", color: "#120c21" },
  { id: "blue", name: "Açık Mavi", color: "#152337" },
  { id: "gray", name: "Modern Gri", color: "#111827" },
];

const SettingsPage = () => {
  const { theme, themeId, changeTheme } = useTheme();
  const [selectedThemeId, setSelectedThemeId] = useState(themeId);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await changeTheme(selectedThemeId);
      setTimeout(() => {
        setIsSaving(false);
        Alert.alert("Başarılı", "Görünüm tercihleri tüm platforma uygulandı!");
      }, 800);
    } catch (error) {
      setIsSaving(false);
      Alert.alert("Hata", "Ayarlar kaydedilemedi.");
    }
  };

  const previewBg = themes.find(t => t.id === selectedThemeId)?.color || theme.bg;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: previewBg }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollPadding}>
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: theme.primary }]}>
            <Settings size={28} color="#ffffff" />
          </View>
          <View>
            <Text style={[styles.title, { color: theme.primary }]}>AYARLAR</Text>
            <Text style={[styles.subTitle, { color: theme.text, opacity: 0.6 }]}>NexTrade arayüz stilini yönet</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Palette size={18} color={theme.primary} />
            <Text style={[styles.sectionHeaderText, { color: theme.text }]}>Görünüm Teması</Text>
          </View>

          <View style={styles.themeGrid}>
            {themes.map((t) => (
              <TouchableOpacity 
                key={t.id} 
                onPress={() => setSelectedThemeId(t.id)}
                style={[styles.themeCard, selectedThemeId === t.id && { borderColor: theme.primary, backgroundColor: `${theme.primary}20` }]}
              >
                <View style={[styles.colorDot, { backgroundColor: t.color, borderColor: theme.border }]}>
                  {selectedThemeId === t.id && <Check size={14} color={t.id === "blue" ? "#000" : "#fff"} />}
                </View>
                <Text style={[styles.themeName, { color: theme.text }]}>{t.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleSave} 
          disabled={isSaving}
          style={[styles.saveBtn, { backgroundColor: theme.primary }, isSaving && { opacity: 0.6 }]}
        >
          {isSaving ? (
            <Text style={styles.btnText}>UYGULANIYOR...</Text>
          ) : (
            <>
              <Save size={18} color="#fff" />
              <Text style={styles.btnText}>KAYDET VE UYGULA</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollPadding: { padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 20, marginBottom: 40 },
  iconBox: { padding: 12, borderRadius: 20 },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  subTitle: { fontSize: 12, fontWeight: '600' },
  section: { borderRadius: 32, padding: 24, borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  sectionHeaderText: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  themeCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 20, borderWidth: 2, borderColor: 'transparent', alignItems: 'center' },
  colorDot: { width: 32, height: 32, borderRadius: 16, marginBottom: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  themeName: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  saveBtn: { marginTop: 32, height: 64, borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  btnText: { color: '#ffffff', fontSize: 12, fontWeight: '900', letterSpacing: 1 }
});

export default SettingsPage;