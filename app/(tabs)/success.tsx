import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from "@/api/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { CheckCircle, Package, Calendar, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SuccessPage() {
    const { orderId } = useLocalSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (orderId) {
                try {
                    const q = query(collection(db, "orders"), where("orderId", "==", orderId));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) { setOrder(querySnapshot.docs[0].data()); }
                } catch (error) { console.error(error); }
            }
            setLoading(false);
        };
        fetchOrder();
    }, [orderId]);

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.glow} />
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.card}>
                    <View style={styles.iconCircle}>
                        <CheckCircle size={48} color="#fff" />
                    </View>

                    <Text style={styles.title}>SİPARİŞİNİZ ALINDI!</Text>
                    <Text style={styles.subtitle}>Harika bir seçim yaptın, {order?.address?.fullName?.split(' ')[0] || 'Müşterimiz'}!</Text>

                    <View style={styles.infoBox}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoLabelGroup}>
                                <Package size={16} color="#666" />
                                <Text style={styles.infoLabel}>Sipariş No:</Text>
                            </View>
                            <Text style={styles.infoValue}>#{orderId || "---"}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoLabelGroup}>
                                <Calendar size={16} color="#666" />
                                <Text style={styles.infoLabel}>Toplam Tutar:</Text>
                            </View>
                            <Text style={styles.priceValue}>{order?.totalAmount ? `${order.totalAmount.toLocaleString('tr-TR')} TL` : '0 TL'}</Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => router.push('/')} style={styles.mainBtn}>
                            <Text style={styles.mainBtnText}>ALIŞVERİŞE DEVAM ET</Text>
                            <ArrowRight size={18} color="#000" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push('/orders')} style={styles.secBtn}>
                            <Text style={styles.secBtnText}>SİPARİŞİMİ TAKİP ET</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0a' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
    glow: { position: 'absolute', top: '10%', left: '10%', width: 300, height: 300, backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 150 },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 40, padding: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
    iconCircle: { width: 80, height: 80, backgroundColor: '#22c55e', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 25, shadowColor: '#22c55e', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20 },
    title: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 10, letterSpacing: 1 },
    subtitle: { color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 30 },
    infoBox: { width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 25, padding: 20, gap: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    infoLabelGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoLabel: { color: '#666', fontSize: 12, fontWeight: '700' },
    infoValue: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    priceValue: { color: '#4ade80', fontSize: 14, fontWeight: 'bold' },
    actions: { width: '100%', marginTop: 30, gap: 12 },
    mainBtn: { width: '100%', backgroundColor: '#fff', padding: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    mainBtnText: { color: '#000', fontWeight: '900', fontSize: 12 },
    secBtn: { width: '100%', padding: 15, alignItems: 'center' },
    secBtnText: { color: '#666', fontWeight: '800', fontSize: 12, letterSpacing: 1 }
});