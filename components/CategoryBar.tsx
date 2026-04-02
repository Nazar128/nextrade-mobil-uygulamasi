import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from "@/api/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { ChevronDown, Loader2 } from 'lucide-react-native';

export const CategoryBar = () => {
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const q = query(collection(db, "categories"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategories(data);
            setLoading(false);
        }, (error) => {
            console.error(error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const toggleTab = (id: string) => {
        setActiveTab(activeTab === id ? null : id);
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <Loader2 size={16} color="#3B82F6" />
                <Text style={styles.loaderText}>YÜKLENİYOR...</Text>
            </View>
        );
    }

    const currentCategory = categories.find(c => c.id === activeTab);

    return (
        <View style={styles.mainWrapper}>
            <View style={styles.container}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {categories.map((item) => (
                        <View key={item.id} style={styles.itemWrapper}>
                            <TouchableOpacity
                                onPress={() => toggleTab(item.id)}
                                activeOpacity={0.7}
                                style={[styles.categoryItem, activeTab === item.id && styles.activeCategoryItem]}
                            >
                                <Text style={[styles.categoryText, activeTab === item.id && styles.activeCategoryText]}>
                                    {item.title?.toUpperCase()}
                                </Text>
                                <ChevronDown 
                                    size={12} 
                                    color={activeTab === item.id ? "#fff" : "#93C5FD"} 
                                    style={{ transform: [{ rotate: activeTab === item.id ? '180deg' : '0deg' }] }}
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {activeTab && currentCategory?.subCategories?.length > 0 && (
                <Pressable style={styles.backdrop} onPress={() => setActiveTab(null)}>
                    <View style={styles.dropdownContainer}>
                        <View style={styles.dropdownContent}>
                            <Text style={styles.dropdownHeader}>{currentCategory.title} </Text>
                            {currentCategory.subCategories.map((sub: any, index: number) => (
                                <TouchableOpacity
                                    key={sub.id || index}
                                    style={styles.subItem}
                                    onPress={() => {
                                        setActiveTab(null);
                                        router.push(`/category/${sub.id || activeTab}`);
                                    }}
                                >
                                    <Text style={styles.subItemText}>{sub.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Pressable>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    mainWrapper: { zIndex: 100 },
    container: { backgroundColor: 'rgba(15, 23, 42, 0.9)', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
    loaderContainer: { height: 57, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, backgroundColor: 'rgba(15, 23, 42, 0.4)' },
    loaderText: { fontSize: 10, fontWeight: '900', color: '#64748B', letterSpacing: 1.5, marginLeft: 8 },
    scrollContent: { paddingHorizontal: 10 },
    itemWrapper: { position: 'relative' },
    categoryItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginHorizontal: 4, gap: 4 },
    activeCategoryItem: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    categoryText: { fontSize: 12, fontWeight: '500', color: '#93C5FD', letterSpacing: 1 },
    activeCategoryText: { color: '#fff' },
    backdrop: { position: 'absolute', top: 57, left: 0, right: 0, height: 2000, backgroundColor: 'rgba(0,0,0,0.3)' },
    dropdownContainer: { paddingHorizontal: 15, marginTop: 8 },
    dropdownContent: { backgroundColor: '#020617', borderRadius: 16, padding: 8, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
    dropdownHeader: { fontSize: 9, fontWeight: '700', color: '#64748B', letterSpacing: 1.5, paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 4 },
    subItem: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10 },
    subItemText: { color: '#CBD5E1', fontSize: 14, fontWeight: '600' }
});

export default CategoryBar;