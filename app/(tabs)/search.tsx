import React, { useEffect, useState, useMemo } from 'react';
import { View, Text,TouchableOpacity, Modal, SafeAreaView, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { db } from '@/api/firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';
import ProductCard from '@/components/ProductCard';
import { Filter, X, RotateCcw } from 'lucide-react-native';
import { FlashList } from "@shopify/flash-list";

export default function SearchPage() {
    const { q, brand: brandParam } = useLocalSearchParams();
    const queryTerm = (typeof q === 'string' ? q : '').toLowerCase();

    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    const [onlyInStock, setOnlyInStock] = useState(false);
    const [onlyDiscounted, setOnlyDiscounted] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
    const [minRating, setMinRating] = useState(0);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const qRef = query(collection(db, "products"), where("status", "==", "approved"));
                const querySnapshot = await getDocs(qRef);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllProducts(data);
            } catch (error) {
                console.error("Firebase error:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        return allProducts.filter(p => {
            if (brandParam) {
                if (p.brand !== brandParam) return false;
            } else if (queryTerm) {
                const words = queryTerm.split(' ');
                if (!words.every(w => p.title?.toLowerCase().includes(w))) return false;
            }
            if (onlyInStock && !p.inStock) return false;
            if (onlyDiscounted && (!p.oldPrice || p.oldPrice <= p.price)) return false;
            if (minPrice && p.price < Number(minPrice)) return false;
            if (maxPrice && p.price > Number(maxPrice)) return false;
            if (!brandParam && selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
            if (selectedGenders.length > 0 && !selectedGenders.includes(p.gender)) return false;
            if (minRating > 0 && (p.rating || 0) < minRating) return false;
            return true;
        });
    }, [allProducts, queryTerm, brandParam, onlyInStock, onlyDiscounted, minPrice, maxPrice, selectedBrands, selectedGenders, minRating]);

    const resetFilters = () => {
        setOnlyInStock(false);
        setOnlyDiscounted(false);
        setMinPrice('');
        setMaxPrice('');
        setSelectedBrands([]);
        setSelectedGenders([]);
        setMinRating(0);
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{brandParam ? brandParam : `"${queryTerm}"`}</Text>
                    <Text style={styles.subtitle}>{filteredProducts.length} ürün listeleniyor</Text>
                </View>
                <TouchableOpacity style={styles.filterButton} onPress={() => setIsFilterVisible(true)}>
                    <Filter size={20} color="#fff" />
                    <Text style={styles.filterButtonText}>Filtrele</Text>
                </TouchableOpacity>
            </View>

            <FlashList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                numColumns={2}
                renderItem={({ item }) => <ProductCard product={item} />}
                contentContainerStyle={styles.listContent}
                
            />

            <Modal visible={isFilterVisible} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setIsFilterVisible(false)}><X color="#fff" size={24} /></TouchableOpacity>
                        <Text style={styles.modalTitle}>Filtreler</Text>
                        <TouchableOpacity onPress={resetFilters}><RotateCcw color="#3B82F6" size={20} /></TouchableOpacity>
                    </View>
                    
                    <ScrollView style={styles.modalBody}>
                        <Text style={styles.sectionTitle}>Durum</Text>
                        <TouchableOpacity 
                            style={[styles.chip, onlyInStock && styles.activeChip]} 
                            onPress={() => setOnlyInStock(!onlyInStock)}
                        >
                            <Text style={[styles.chipText, onlyInStock && styles.activeChipText]}>Stokta Olanlar</Text>
                        </TouchableOpacity>

                        <Text style={styles.sectionTitle}>Cinsiyet</Text>
                        <View style={styles.chipGroup}>
                            {['Erkek', 'Kadın', 'Unisex'].map(g => (
                                <TouchableOpacity 
                                    key={g} 
                                    style={[styles.chip, selectedGenders.includes(g) && styles.activeChip]}
                                    onPress={() => setSelectedGenders(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                                >
                                    <Text style={[styles.chipText, selectedGenders.includes(g) && styles.activeChipText]}>{g}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.applyButton} onPress={() => setIsFilterVisible(false)}>
                        <Text style={styles.applyButtonText}>Sonuçları Gör</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    loaderContainer: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: '900', color: '#fff', textTransform: 'uppercase' },
    subtitle: { color: '#64748B', fontSize: 12, marginTop: 4 },
    filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, gap: 8 },
    filterButtonText: { color: '#fff', fontWeight: '600' },
    listContent: { padding: 10 },
    columnWrapper: { justifyContent: 'space-between' },
    modalContainer: { flex: 1, backgroundColor: '#020617' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    modalBody: { flex: 1, padding: 20 },
    sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12, marginTop: 20 },
    chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#1E293B', marginBottom: 10 },
    activeChip: { backgroundColor: '#3B82F6' },
    chipText: { color: '#94A3B8', fontWeight: '500' },
    activeChipText: { color: '#fff' },
    applyButton: { backgroundColor: '#3B82F6', margin: 20, padding: 16, borderRadius: 16, alignItems: 'center' },
    applyButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});