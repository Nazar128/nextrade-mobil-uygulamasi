import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { View, TextInput, Text, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Modal, StyleSheet } from 'react-native';
import { Package, Tag, Layers, X, ArrowLeft } from 'lucide-react-native';
import { db } from '@/api/firebase';
import { collection, query, getDocs, where, limit } from 'firebase/firestore';
import { useRouter } from 'expo-router';

interface SearchResult { id: string; title: string; type: 'product' | 'brand' | 'category'; targetId: string | number; }

const SearchBar = forwardRef((props, ref) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  useImperativeHandle(ref, () => ({
    openSearch: () => setIsModalVisible(true)
  }));

  const performSearch = useCallback(async (val: string) => {
    if (val.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const searchWords = val.toLowerCase().split(' ').filter(w => w.length > 0);
      const pQuery = query(collection(db, "products"), where("status", "==", "approved"), limit(20));
      const bQuery = query(collection(db, "brands"), limit(10));
      const cQuery = query(collection(db, "categories"), limit(10));
      const [pSnap, bSnap, cSnap] = await Promise.all([getDocs(pQuery), getDocs(bQuery), getDocs(cQuery)]);
      const productResults: SearchResult[] = pSnap.docs.map(doc => ({ ...doc.data() } as any)).filter(p => searchWords.every(word => (p.title || "").toLowerCase().includes(word))).map(p => ({ id: String(p.id), title: p.title || "Ürün", type: 'product', targetId: p.id }));
      const brandResults: SearchResult[] = bSnap.docs.map(doc => doc.data() as any).filter(b => searchWords.some(word => (b.name || "").toLowerCase().includes(word))).map(b => ({ id: b.name, title: b.name, type: 'brand', targetId: b.name }));
      const categoryResults: SearchResult[] = cSnap.docs.map(doc => ({ ...doc.data() } as any)).filter(c => searchWords.some(word => (c.title || "").toLowerCase().includes(word))).map(c => ({ id: String(c.id), title: c.title, type: 'category', targetId: c.id }));
      setResults([...productResults, ...brandResults, ...categoryResults].slice(0, 15));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => { if (searchTerm) performSearch(searchTerm); }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm, performSearch]);

  const handleNavigate = (result: SearchResult) => {
    setIsModalVisible(false);
    setSearchTerm('');
    if (result.type === 'product') router.push(`/product/${result.targetId}`);
    else if (result.type === 'brand') router.push({ pathname: '/(tabs)/search', params: { brand: result.targetId } });
    else router.push(`/category/${result.targetId}`);
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => handleNavigate(item)} activeOpacity={0.7}>
      <View style={styles.resultLeft}>
        <View style={styles.iconContainer}>
          {item.type === 'product' && <Package size={20} color="#60A5FA" />}
          {item.type === 'brand' && <Tag size={20} color="#34D399" />}
          {item.type === 'category' && <Layers size={20} color="#FBBF24" />}
        </View>
        <View>
          <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.resultTypeLabelMobile}>{item.type === 'product' ? 'Ürün' : item.type === 'brand' ? 'Marka' : 'Kategori'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={isModalVisible} animationType="fade" transparent={false} onRequestClose={() => setIsModalVisible(false)}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsModalVisible(false)} hitSlop={20}><ArrowLeft size={24} color="#F1F5F9" /></TouchableOpacity>
          <TextInput style={styles.input} placeholder="Ara..." placeholderTextColor="#64748B" value={searchTerm} onChangeText={setSearchTerm} autoFocus autoCapitalize="none" returnKeyType="search" />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')} hitSlop={15}>
              {loading ? <ActivityIndicator size="small" color="#3B82F6" /> : <X size={20} color="#64748B" />}
            </TouchableOpacity>
          )}
        </View>
        <FlatList data={results} keyExtractor={(item, index) => `${item.id}-${index}`} renderItem={renderItem} contentContainerStyle={styles.listContent} ListEmptyComponent={() => (searchTerm.length >= 2 && !loading ? (<View style={styles.emptyState}><Text style={styles.emptyText}>Sonuç bulunamadı...</Text></View>) : null)} />
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  input: { flex: 1, color: '#F1F5F9', fontSize: 18, marginHorizontal: 12, paddingVertical: 8 },
  listContent: { paddingBottom: 40 },
  resultItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#0F172A' },
  resultLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { padding: 10, backgroundColor: '#0F172A', borderRadius: 10, marginRight: 14 },
  resultTitle: { color: '#E2E8F0', fontSize: 16, fontWeight: '500' },
  resultTypeLabelMobile: { color: '#64748B', fontSize: 12, textTransform: 'uppercase', marginTop: 2, letterSpacing: 1 },
  emptyState: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#64748B', fontStyle: 'italic', fontSize: 16 }
});

export default SearchBar;