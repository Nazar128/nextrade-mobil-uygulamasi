import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform} from 'react-native';
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, CheckCircle2, AlertCircle, X } from 'lucide-react-native';
import { Image } from 'expo-image';
interface BannerState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Genel Destek',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<BannerState>({
    show: false,
    type: 'success',
    message: ''
  });

  useEffect(() => {
    if (banner.show) {
      const timer = setTimeout(() => setBanner(prev => ({ ...prev, show: false })), 5000);
      return () => clearTimeout(timer);
    }
  }, [banner.show]);

  const onSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      setBanner({ show: true, type: 'error', message: 'Lütfen tüm alanları doldurun.' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://your-nextjs-app.vercel.app/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, recaptcha: "MOBILE_VERIFIED" }),
      });

      const responseText = await response.text();

      if (responseText.startsWith("<!DOCTYPE") || responseText.startsWith("<html")) {
        throw new Error("Sunucu yapılandırma hatası (HTML dönüldü).");
      }

      const data = JSON.parse(responseText);

      if (response.ok) {
        setBanner({ show: true, type: 'success', message: 'Mesajınız başarıyla iletildi!' });
        setFormData({ name: '', email: '', subject: 'Genel Destek', message: '' });
      } else {
        throw new Error(data.message || "Hata oluştu");
      }
    } catch (error: any) {
      setBanner({ show: true, type: 'error', message: error.message || 'Bağlantı hatası.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {banner.show && (
            <View style={[styles.banner, banner.type === 'success' ? styles.bannerSuccess : styles.bannerError]}>
              {banner.type === 'success' ? <CheckCircle2 size={24} color="#10b981" /> : <AlertCircle size={24} color="#ef4444" />}
              <Text style={[styles.bannerText, banner.type === 'success' ? {color: '#10b981'} : {color: '#ef4444'}]}>{banner.message}</Text>
              <TouchableOpacity onPress={() => setBanner(prev => ({ ...prev, show: false }))}>
                <X size={20} color={banner.type === 'success' ? "#10b981" : "#ef4444"} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>BİZE <Text style={styles.blueText}>ULAŞIN</Text></Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MessageSquare color="#60a5fa" size={24} />
              <Text style={styles.cardTitle}>Mesaj Gönderin</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Ad Soyad</Text>
              <TextInput 
                style={styles.input}
                placeholder="Nazar Kalçık"
                placeholderTextColor="#475569"
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>E-Posta</Text>
              <TextInput 
                style={styles.input}
                placeholder="nazar@example.com"
                placeholderTextColor="#475569"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Mesajınız</Text>
              <TextInput 
                style={[styles.input, styles.textArea]}
                placeholder="Nasıl yardımcı olabiliriz?"
                placeholderTextColor="#475569"
                multiline
                numberOfLines={5}
                value={formData.message}
                onChangeText={(text) => setFormData({...formData, message: text})}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, loading && { opacity: 0.6 }]} 
              onPress={onSubmit}
              disabled={loading}
            >
              <Text style={styles.submitText}>{loading ? "GÖNDERİLİYOR..." : "GÖNDER"}</Text>
              {!loading && <Send color="#fff" size={20} />}
            </TouchableOpacity>
          </View>

          <View style={styles.infoList}>
            <ContactInfo icon={<Phone size={28} color="#3b82f6" />} label="TELEFON" value="+90 (212) 000 00 00" bgColor="rgba(59, 130, 246, 0.1)" />
            <ContactInfo icon={<Mail size={28} color="#10b981" />} label="E-POSTA" value="destek@nextrade.com" bgColor="rgba(16, 185, 129, 0.1)" />
            <ContactInfo icon={<MapPin size={28} color="#a855f7" />} label="MERKEZ OFİS" value="Teknoloji Vadisi, İstanbul" bgColor="rgba(168, 85, 247, 0.1)" />
          </View>

          <View style={styles.imageCard}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1000' }} style={styles.mapImage} contentFit="cover" transition={500}  cachePolicy="disk"  />
            <View style={styles.imageOverlay}>
              <Globe size={14} color="#fff" />
              <Text style={styles.overlayText}>Global Operasyon Merkezi</Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ContactInfo({ icon, label, value, bgColor }: { icon: any, label: string, value: string, bgColor: string }) {
  return (
    <View style={styles.infoItem}>
      <View style={[styles.infoIconBox, { backgroundColor: bgColor }]}>{icon}</View>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>// {label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { padding: 20 },
  banner: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, marginBottom: 20, borderWidth: 1, gap: 12 },
  bannerSuccess: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)' },
  bannerError: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)' },
  bannerText: { flex: 1, fontWeight: 'bold', fontSize: 15 },
  headerSection: { alignItems: 'center', marginVertical: 35 },
  headerTitle: { color: '#fff', fontSize: 36, fontWeight: '900', letterSpacing: -1.5, textTransform: 'uppercase' },
  blueText: { color: '#3b82f6' },
  card: { backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: 35, padding: 25, borderWidth: 1, borderColor: '#1e293b', marginBottom: 25 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 25 },
  cardTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  formGroup: { marginBottom: 22 },
  label: { color: '#94a3b8', fontSize: 14, marginBottom: 8, marginLeft: 6, fontWeight: '600' },
  input: { backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: 20, padding: 18, color: '#fff', borderWidth: 1, borderColor: '#334155', fontSize: 16 },
  textArea: { height: 130, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#1d4ed8', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 20, borderRadius: 20, gap: 12, marginTop: 10 },
  submitText: { color: '#fff', fontWeight: '900', fontSize: 17, letterSpacing: 1 },
  infoList: { gap: 15, marginBottom: 25 },
  infoItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: 18, borderRadius: 28, borderWidth: 1, borderColor: '#1e293b', gap: 18 },
  infoIconBox: { padding: 14, borderRadius: 20 },
  infoTextContainer: { flex: 1 },
  infoLabel: { color: '#475569', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  infoValue: { color: '#fff', fontSize: 17, fontWeight: '700', marginTop: 2 },
  imageCard: { height: 200, borderRadius: 35, overflow: 'hidden', borderWidth: 1, borderColor: '#1e293b', position: 'relative' },
  mapImage: { width: '100%', height: '100%', opacity: 0.5 },
  imageOverlay: { position: 'absolute', bottom: 15, right: 15, backgroundColor: 'rgba(15, 23, 42, 0.9)', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 100, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  overlayText: { color: '#fff', fontSize: 12, fontWeight: '600' }
});