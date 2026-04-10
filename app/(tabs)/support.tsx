import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { HelpCircle, ShieldCheck, FileText, ChevronDown } from 'lucide-react-native';
import { db } from "@/api/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('sss');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [legalData, setLegalData] = useState({
    privacy: { title: 'Dijital Veri Gizliliği', content: '' },
    terms: { title: 'Hizmet Kullanım Sözleşmesi', content: '' }
  });

  useEffect(() => {
    const unsubPrivacy = onSnapshot(doc(db, "legal", "privacy"), (doc) => {
      if (doc.exists()) setLegalData(prev => ({ ...prev, privacy: doc.data() as any }));
    });
    const unsubTerms = onSnapshot(doc(db, "legal", "terms"), (doc) => {
      if (doc.exists()) setLegalData(prev => ({ ...prev, terms: doc.data() as any }));
    });
    return () => { unsubPrivacy(); unsubTerms(); };
  }, []);

  const faqs = [
    { q: "Global Satıcı Ekosistemine Nasıl Katılırım?", a: "Marketplace platformumuzda satıcı olmak için..." },
    { q: "Lojistik ve Teslimat Süreçleri Nasıl Yönetiliyor?", a: "Platformumuz, 'Smart-Route' teknolojisi ile..." },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>DESTEK & <Text style={styles.blueText}>HUKUK</Text></Text>
          <Text style={styles.description}>Şeffaflık, dijital ekosistemimizin temel taşıdır.</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsWrapper} contentContainerStyle={styles.tabsContainer}>
          {[
            { id: 'sss', label: 'S.S.S', icon: <HelpCircle size={18} color={activeTab === 'sss' ? "#FFF" : "#64748B"} /> },
            { id: 'gizlilik', label: 'Gizlilik', icon: <ShieldCheck size={18} color={activeTab === 'gizlilik' ? "#FFF" : "#64748B"} /> },
            { id: 'sartlar', label: 'Koşullar', icon: <FileText size={18} color={activeTab === 'sartlar' ? "#FFF" : "#64748B"} /> },
          ].map((tab) => (
            <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id)} style={[styles.tabButton, activeTab === tab.id && styles.activeTabButton]}>
              {tab.icon}
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.contentCard}>
          {activeTab === 'sss' && (
            <View>
              <Text style={styles.sectionTitle}>Operasyonel Detaylar</Text>
              {faqs.map((faq, index) => (
                <View key={index} style={styles.faqItem}>
                  <TouchableOpacity onPress={() => setOpenFaq(openFaq === index ? null : index)} style={styles.faqHeader}>
                    <Text style={[styles.faqQuestion, openFaq === index && styles.activeFaqText]}>{faq.q}</Text>
                    <ChevronDown size={20} color={openFaq === index ? "#3B82F6" : "#64748B"} style={{ transform: [{ rotate: openFaq === index ? '180deg' : '0deg' }] }} />
                  </TouchableOpacity>
                  {openFaq === index && <Text style={styles.faqAnswer}>{faq.a}</Text>}
                </View>
              ))}
            </View>
          )}

          {(activeTab === 'gizlilik' || activeTab === 'sartlar') && (
            <View>
              <Text style={styles.contentTitle}>{activeTab === 'gizlilik' ? legalData.privacy.title : legalData.terms.title}</Text>
              <Text style={styles.contentText}>{activeTab === 'gizlilik' ? legalData.privacy.content : legalData.terms.content}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617' },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { padding: 24, borderLeftWidth: 4, borderLeftColor: '#2563EB', marginHorizontal: 20, marginTop: 20 },
  title: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  blueText: { color: '#3B82F6' },
  description: { color: '#94A3B8', fontSize: 16, marginTop: 8, fontWeight: '300' },
  tabsWrapper: { marginVertical: 20, maxHeight: 60 },
  tabsContainer: { paddingHorizontal: 20, gap: 10 },
  tabButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B', gap: 8 },
  activeTabButton: { backgroundColor: '#1E293B', borderColor: '#3B82F6' },
  tabLabel: { color: '#64748B', fontWeight: 'bold', fontSize: 14 },
  activeTabLabel: { color: '#FFF' },
  contentCard: { marginHorizontal: 20, backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: '#1E293B' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  faqItem: { backgroundColor: '#0F172A', borderRadius: 20, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#1E293B' },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  faqQuestion: { color: '#E2E8F0', fontWeight: '700', flex: 1, marginRight: 10 },
  activeFaqText: { color: '#3B82F6' },
  faqAnswer: { color: '#94A3B8', padding: 16, paddingTop: 0, lineHeight: 22, fontSize: 14 },
  contentTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1E293B', paddingBottom: 8 },
  contentText: { color: '#94A3B8', fontSize: 15, lineHeight: 24, fontWeight: '300' }
});