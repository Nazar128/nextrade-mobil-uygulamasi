"use client";
import { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Dimensions, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { db } from "@/api/firebase";
import { collection, query, where, orderBy, onSnapshot, limit, QueryConstraint, getDocs } from "firebase/firestore";
import { PackageX } from 'lucide-react-native'; 
import ProductCard from '@/components/ProductCard';
import { ProductFilters } from '@/components/ProductFilters';

const CategoryPage = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const { id, brand, gender, minPrice, maxPrice, rating, inStock, discounted, sort } = params;
    const numericId = Number(id); 

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryInfo, setCategoryInfo] = useState<{ type: 'main' | 'sub', title: string } | null>(null);

    const activeBrand = (brand as string) || 'all';
    const activeGender = (gender as string) || 'all';
    const activeMinPrice = (minPrice as string) || '';
    const activeMaxPrice = (maxPrice as string) || '';
    const activeRating = Number(rating) || 0;
    const activeInStock = inStock === 'true';
    const activeDiscounted = discounted === 'true';
    const activeSort = (sort as string) || 'createdAt';

    const updateURL = (newParams: any) => {
        router.setParams({ ...newParams });
    };

    useEffect(() => {
        if (!numericId) return;
        const detectCategoryType = async () => {
            try {
                const catsSnap = await getDocs(collection(db, "categories"));
                let detected = null;
                for (const doc of catsSnap.docs) {
                    const data = doc.data();
                    if (Number(data.id) === numericId) {
                        detected = { type: 'main', title: data.title };
                        break;
                    }
                    const sub = data.subCategories?.find((s: any) => Number(s.id) === numericId);
                    if (sub) {
                        detected = { type: 'sub', title: sub.title };
                        break;
                    }
                }
                setCategoryInfo(detected as any);
            } catch (error) { console.error(error); }
        };
        detectCategoryType();
    }, [numericId]);

    useEffect(() => {
        if (!categoryInfo || !numericId) return;
        setLoading(true);

        const constraints: QueryConstraint[] = [
            where(categoryInfo.type === 'main' ? "categoryId" : "subCategoryId", "==", numericId),
            where("status", "==", "approved")
        ];

        if (activeBrand !== 'all') constraints.push(where("brand", "==", activeBrand));
        if (activeGender !== 'all') constraints.push(where("gender", "==", activeGender));
        if (activeInStock) constraints.push(where("inStock", "==", true));
        if (activeRating > 0) constraints.push(where("rating", ">=", activeRating));
        if (activeMinPrice) constraints.push(where("price", ">=", Number(activeMinPrice)));
        if (activeMaxPrice) constraints.push(where("price", "<=", Number(activeMaxPrice)));

        if (activeSort === 'price-asc') constraints.push(orderBy("price", "asc"));
        else if (activeSort === 'price-desc') constraints.push(orderBy("price", "desc"));
        else constraints.push(orderBy("createdAt", "desc"));

        constraints.push(limit(40));

        const q = query(collection(db, "products"), ...constraints);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                price: Number(doc.data().price),
                oldPrice: doc.data().oldPrice ? Number(doc.data().oldPrice) : null
            }));
            if (activeDiscounted) data = data.filter(p => p.oldPrice && p.oldPrice > p.price);
            setProducts(data);
            setLoading(false);
        }, () => setLoading(false));

        return () => unsubscribe();
    }, [categoryInfo, numericId, activeBrand, activeGender, activeMinPrice, activeMaxPrice, activeRating, activeInStock, activeDiscounted, activeSort]);

    if (loading) {
        return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#3b82f6" /></View>;
    }

    return (
        <View style={styles.mainContainer}>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                numColumns={2}
                ListHeaderComponent={() => (
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerTitle}>{categoryInfo?.title || 'Kategori'}</Text>
                        <ProductFilters 
                            filters={{ brands: ['Oakley', 'Nike', 'Adidas', 'Ray-Ban', 'Prada', 'Apple', 'Samsung'], genders: ['Erkek', 'Kadın', 'Unisex'] }}
                            state={{ selectedBrands: activeBrand === 'all' ? [] : [activeBrand], selectedGenders: activeGender === 'all' ? [] : [activeGender], minPrice: activeMinPrice, maxPrice: activeMaxPrice, minRating: activeRating, onlyInStock: activeInStock, onlyDiscounted: activeDiscounted }}
                            setState={{
                                setSelectedBrands: (val: string) => updateURL({ brand: activeBrand === val ? 'all' : val }),
                                setSelectedGenders: (val: string) => updateURL({ gender: activeGender === val ? 'all' : val }),
                                setMinPrice: (val: string) => updateURL({ minPrice: val }),
                                setMaxPrice: (val: string) => updateURL({ maxPrice: val }),
                                setMinRating: (val: number) => updateURL({ rating: val }),
                                setOnlyInStock: (val: boolean) => updateURL({ inStock: String(val) }),
                                setOnlyDiscounted: (val: boolean) => updateURL({ discounted: String(val) })
                            }}
                            resetFilters={() => router.setParams({ brand: 'all', gender: 'all', minPrice: '', maxPrice: '', rating: '0', inStock: 'false', discounted: 'false' })}
                        />
                    </View>
                )}
                renderItem={({ item }) => <ProductCard product={item} />}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <PackageX size={48} color="#64748b" />
                        <Text style={styles.emptyText}>Bu kategoride kriterlere uygun ürün bulunamadı.</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#000' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    headerContainer: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
    listContent: { paddingHorizontal: 8, paddingBottom: 20 },
    emptyContainer: { marginTop: 100, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, paddingVertical: 40, marginHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed' },
    emptyText: { color: '#64748b', textAlign: 'center', marginTop: 16, fontSize: 14 }
});

export default CategoryPage;