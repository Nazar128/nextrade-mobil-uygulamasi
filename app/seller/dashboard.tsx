import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { DollarSign, Package, Star, Eye, ShoppingBag, Users, TrendingUp } from 'lucide-react-native';
import { db, auth } from '@/api/firebase';
import { collection, query, onSnapshot, orderBy, doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { ActivityFeed } from '@/components/ActivityFeed';
import { StatCard } from '@/components/StatCard';

const { width } = Dimensions.get('window');

const DashboardPage = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        todayRevenue: 0,
        pendingOrders: 0,
        views: 0,
        activeUsers: 0
    });

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const analyticsRef = doc(db, "analytics", "store_stats");
                const checkAnalyticsDoc = async () => {
                    try {
                        const docSnap = await getDoc(analyticsRef);
                        if (!docSnap.exists()) {
                            await setDoc(analyticsRef, { totalViews: 0, activeUsers: 0 });
                        }
                    } catch (error) {
                        console.error("Analytics error:", error);
                    }
                };
                checkAnalyticsDoc();

                const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
                const unsubscribeOrders = onSnapshot(q, (snapshot) => {
                    const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    const sellerOrders = allOrders.filter((order: any) => 
                        order.items?.some((item: any) => 
                            item.sellerId === user.uid || 
                            item.sellerName === "NexTrade Mağaza" ||
                            item.brand === "Ray-Ban"
                        )
                    );

                    let totalRev = 0, todayRev = 0, pendingCount = 0;
                    const now = new Date();
                    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

                    sellerOrders.forEach((order: any) => {
                        const amount = Number(order.totalAmount || 0);
                        const orderDate = order.createdAt?.seconds ? order.createdAt.seconds * 1000 : new Date(order.createdAt).getTime();
                        totalRev += amount;
                        if (orderDate >= startOfToday) todayRev += amount;
                        if (order.status === "pending" || order.status === "Pending" || !order.status) pendingCount += 1;
                    });

                    setStats(prev => ({
                        ...prev,
                        totalRevenue: totalRev,
                        totalOrders: sellerOrders.length,
                        todayRevenue: todayRev,
                        pendingOrders: pendingCount
                    }));
                });

                const unsubscribeAnalytics = onSnapshot(analyticsRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setStats(prev => ({
                            ...prev,
                            views: data.totalViews || 0,
                            activeUsers: Math.max(0, data.activeUsers || 0)
                        }));
                    }
                });

                return () => { unsubscribeOrders(); unsubscribeAnalytics(); };
            }
        });
        return () => unsubscribeAuth();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerLabel}>MAĞAZA PERFORMANSI</Text>
                    <Text style={styles.headerSub}>Müşteri Etkileşimi</Text>
                </View>

                <View style={styles.mainStats}>
                    <StatCard
                        label="Toplam Ciro" 
                        value={`₺${stats.totalRevenue.toLocaleString('tr-TR')}`} 
                        icon={<DollarSign size={20} color="#10b981" />} 
                        subtitle="Genel Kazanç"
                    />
                    <StatCard 
                        label="Toplam Sipariş" 
                        value={stats.totalOrders.toString()} 
                        icon={<ShoppingBag size={20} color="#3b82f6" />} 
                        subtitle="Tüm Geçmiş"
                    />
                    <StatCard 
                        label="Mağaza Puanı" 
                        value="4.8" 
                        icon={<Star size={20} color="#f59e0b" />} 
                        subtitle=""
                        
                    />
                </View>

                <View style={styles.dividerContainer}>
                    <Text style={styles.dividerText}>GÜNÜN ÖZETİ</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.gridStats}>
                    <View style={styles.gridRow}>
                        <StatCard 
                            label="Bugünkü Kazanç" 
                            value={`₺${stats.todayRevenue.toLocaleString('tr-TR')}`} 
                            icon={<TrendingUp size={18} color="#34d399" />} 
                           
                            
                        />
                        <StatCard 
                            label="Yeni Sipariş" 
                            value={stats.pendingOrders.toString()} 
                            icon={<Package size={18} color="#fb923c" />} 
                            subtitle="Bekleyen"
                            
                           
                        />
                    </View>
                    <View style={styles.gridRow}>
                        <StatCard 
                            label="Anlık Ziyaretçi" 
                            value={stats.activeUsers.toString()} 
                            icon={<Users size={18} color="#c084fc" />}
                            
                         
                        />
                        <StatCard 
                            label="Görüntüleme" 
                            value={stats.views.toString()} 
                            icon={<Eye size={18} color="#94a3b8" />} 
                           
                        />
                    </View>
                </View>

                <View style={styles.feedSection}>
                    <ActivityFeed />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        SATICI PANELİ V1.0.4 — SON SENKRONİZASYON: {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    scrollContent: { padding: 20 },
    header: { marginBottom: 20 },
    headerLabel: { fontSize: 12, fontWeight: '900', color: '#94a3b8', letterSpacing: 2 },
    headerSub: { fontSize: 11, color: '#475569', fontStyle: 'italic', marginTop: 2 },
    mainStats: { gap: 12, marginBottom: 32 },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    dividerText: { fontSize: 10, fontWeight: 'bold', color: '#3b82f6cc', letterSpacing: 1.5 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#1e293b' },
    gridStats: { gap: 12, marginBottom: 32 },
    gridRow: { flexDirection: 'row', gap: 12 },
    feedSection: { marginBottom: 32 },
    footer: { paddingTop: 20, borderTopWidth: 1, borderTopColor: '#1e293b50', alignItems: 'center' },
    footerText: { fontSize: 9, fontWeight: '600', color: '#334155', letterSpacing: 1 }
});

export default DashboardPage;