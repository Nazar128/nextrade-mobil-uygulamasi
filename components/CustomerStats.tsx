import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { db } from "@/api/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Package, Heart, Star, MapPin } from 'lucide-react-native';

interface StatsProps { userId: string; }

export default function CustomerStats({ userId }: StatsProps) {
    const [stats, setStats] = useState({ activeOrders: 0, favorites: 0, addresses: 0, points: 0 });

    useEffect(() => {
        if (!userId) return;
        const ordersRef = collection(db, "orders");
        const activeStatuses = ["Pending", "Processing", "Shipped", "pending", "processing", "shipped"];
        const activeOrdersQuery = query(ordersRef, where("userId", "==", userId), where("status", "in", activeStatuses));
        const unsubOrders = onSnapshot(activeOrdersQuery, (snapshot) => { setStats(prev => ({ ...prev, activeOrders: snapshot.size })); });

        const favRef = collection(db, "users", userId, "favorites");
        const unsubfav = onSnapshot(favRef, (snapshot) => { setStats(prev => ({ ...prev, favorites: snapshot.size })); });

        const addrRef = collection(db, "users", userId, "addresses");
        const unsubAddr = onSnapshot(addrRef, (snapshot) => { setStats(prev => ({ ...prev, addresses: snapshot.size })); });

        const completedStatuses = ["Delivered", "delivered"];
        const completedOrdersQuery = query(ordersRef, where("userId", "==", userId), where("status", "in", completedStatuses));
        const unsubPoints = onSnapshot(completedOrdersQuery, (snapshot) => { setStats(prev => ({ ...prev, points: snapshot.size * 10 })); });

        return () => { unsubOrders(); unsubfav(); unsubAddr(); unsubPoints(); };
    }, [userId]);

    return (
        <View style={styles.grid}>
            <StatCard label='Aktif Sipariş' value={stats.activeOrders.toString().padStart(2, '0')} icon={<Package />} theme="cyan" />
            <StatCard label='Favorilerim' value={stats.favorites.toString().padStart(2, '0')} icon={<Heart />} theme="pink" />
            <StatCard label='Hesap Puanı' value={stats.points.toString()} icon={<Star />} theme="yellow" />
            <StatCard label='Adreslerim' value={stats.addresses.toString().padStart(2, '0')} icon={<MapPin />} theme="purple" />
        </View>
    );
}

function StatCard({ label, value, icon, theme }: any) {
    const themeStyles: any = {
        cyan: { border: '#22d3ee33', text: '#22d3ee', bg: '#22d3ee0d' },
        pink: { border: '#f472b633', text: '#f472b6', bg: '#f472b60d' },
        yellow: { border: '#facc1533', text: '#facc15', bg: '#facc150d' },
        purple: { border: '#c084fc33', text: '#c084fc', bg: '#c084fc0d' }
    };
    const currentTheme = themeStyles[theme];

    return (
        <View style={[styles.card, { borderColor: currentTheme.border, backgroundColor: currentTheme.bg }]}>
            <View style={styles.iconWrapper}>{React.cloneElement(icon, { size: 24, color: currentTheme.text })}</View>
            <View style={styles.content}>
                <Text style={styles.valueText}>{value}</Text>
                <Text style={styles.labelText}>{label}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 8 },
    card: { width: '48%', padding: 24, borderRadius: 32, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 16, height: 160 },
    iconWrapper: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    content: { alignItems: 'center' },
    valueText: { fontSize: 32, fontWeight: '900', color: '#ffffff', letterSpacing: -1 },
    labelText: { fontSize: 9, fontWeight: 'bold', color: '#64748b', letterSpacing: 1.5, marginTop: 4, textAlign: 'center' }
});