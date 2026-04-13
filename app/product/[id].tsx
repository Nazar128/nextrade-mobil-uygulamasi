"use client";
import ProductDetail from '@/components/ProductDetail';
import { HelpCircle, MessageSquareText, ShieldCheck, Store, ChevronRight } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { db, auth } from "@/api/firebase";
import { collection, query, where, getDocs, setDoc, getDoc, doc, updateDoc, increment } from "firebase/firestore";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import CommentSection from '@/components/CommentSection';
import QuestionSection from '@/components/QuestionSection';

const Page = () => {
    const params = useLocalSearchParams();
    const router = useRouter();
    const selectedId = params.id;
    
    const [activeTab, setActiveTab] = useState('sartlar');
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductData = async () => {
            if (!selectedId) return;
            setLoading(true);
            try {
                const productsRef = collection(db, "products");
                const qNumber = query(productsRef, where("id", "==", Number(selectedId)));
                const querySnapshotNumber = await getDocs(qNumber);

                if (!querySnapshotNumber.empty) {
                    setProduct(querySnapshotNumber.docs[0].data());
                } else {
                    const qString = query(productsRef, where("id", "==", String(selectedId)));
                    const querySnapshotString = await getDocs(qString);
                    if (!querySnapshotString.empty) {
                        setProduct(querySnapshotString.docs[0].data());
                    } else {
                        setProduct(null);
                    }
                }
            } catch (error) {
                console.error(error);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
    }, [selectedId]);

    useEffect(() => {
        if (!product || !selectedId) return;
        const analyticsRef = doc(db, "analytics", "store_stats");
        const reportView = async () => {
            if (auth.currentUser?.uid === product.sellerId) return;
            try {
                const docSnap = await getDoc(analyticsRef);
                if (!docSnap.exists()) {
                    await setDoc(analyticsRef, { totalViews: 1, activeUsers: 1 });
                } else {
                    await updateDoc(analyticsRef, {
                        totalViews: increment(1),
                        activeUsers: increment(1)
                    });
                }
            } catch (error) {
                console.error(error);
            }
        };
        reportView();
        return () => {
            updateDoc(analyticsRef, { activeUsers: increment(-1) }).catch(() => {});
        };
    }, [product, selectedId]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={{ color: '#64748b', marginTop: 10 }}>Ürün yükleniyor...</Text>
            </View>
        );
    }

    if (!product) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Ürün Bulunamadı</Text>
            </View>
        );
    }

    const renderHeader = () => (
        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
            <ProductDetail product={product} />

            <TouchableOpacity 
                onPress={() => router.push("/store/[id]")}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#1e293b',
                    padding: 16,
                    borderRadius: 16,
                    marginTop: 20,
                    borderWidth: 1,
                    borderColor: '#334155'
                }}
            >
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#3b82f622', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                    <Store size={20} color="#3b82f6" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>Satıcı</Text>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>{product.sellerName || 'Mağazayı Gör'}</Text>
                </View>
                <ChevronRight size={20} color="#64748b" />
            </TouchableOpacity>
            
            <View style={{ marginTop: 24 }}>
                <View style={{ flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 12, padding: 4, marginBottom: 16 }}>
                    {[
                        { id: 'comment', label: 'Yorumlar', icon: <MessageSquareText size={16} color={activeTab === 'comment' ? '#60a5fa' : '#64748b'} /> },
                        { id: 'question', label: 'Soru-Cevap', icon: <HelpCircle size={16} color={activeTab === 'question' ? '#60a5fa' : '#64748b'} /> },
                        { id: 'sartlar', label: 'Sözleşme', icon: <ShieldCheck size={16} color={activeTab === 'sartlar' ? '#60a5fa' : '#64748b'} /> },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 12,
                                borderRadius: 8,
                                backgroundColor: activeTab === tab.id ? '#1e293b' : 'transparent',
                                gap: 8
                            }}
                        >
                            {tab.icon}
                            <Text style={{ color: activeTab === tab.id ? '#60a5fa' : '#64748b', fontSize: 12, fontWeight: '600' }}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ backgroundColor: '#0f172a66', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1e293b', marginBottom: 20 }}>
                    {activeTab === 'comment' && (
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <View style={{ width: 3, height: 16, backgroundColor: '#3b82f6', borderRadius: 2 }} />
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Ürün Yorumları</Text>
                            </View>
                            <CommentSection productId={String(selectedId)} product={product} />
                        </View>
                    )}

                    {activeTab === 'question' && (
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <View style={{ width: 3, height: 16, backgroundColor: '#3b82f6', borderRadius: 2 }} />
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Ürün Soru Cevapları</Text>
                            </View>
                            <QuestionSection product={product} />
                        </View>
                    )}

                    {activeTab === 'sartlar' && (
                        <View>
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Hizmet Sözleşmesi</Text>
                            <Text style={{ color: '#94a3b8', fontSize: 14, lineHeight: 22 }}>
                                Platform üzerindeki tüm işlemler yasal mevzuatlara tabidir. Satıcılar, listeledikleri her ürünün orijinalliğini garanti eder.
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <FlatList
            data={[]} 
            renderItem={null}
            ListHeaderComponent={renderHeader}
            style={{ flex: 1, backgroundColor: '#000' }}
            contentContainerStyle={{ paddingBottom: 40 }}
        />
    );
};

export default Page;