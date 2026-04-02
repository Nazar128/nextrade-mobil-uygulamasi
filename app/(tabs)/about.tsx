import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { db } from '@/api/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AboutHero from '@/components/AboutHero';
import InfoCard from '@/components/InfoCard';
import * as Icons from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function AboutPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docSnap = await getDoc(doc(db, "corporate", "about"));
                if (docSnap.exists()) {
                    setData(docSnap.data());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
        </View>
    );

    return (
        <ScrollView style={styles.main} bounces={false}>
            <AboutHero 
                title={data?.heroTitle} 
                subTitle={data?.heroSubTitle} 
                bgImage={data?.heroBg} 
            />
            
            <View style={styles.infoSection}>
                {data?.features?.map((item: any, index: number) => {
                    const IconComponent = (Icons as any)[item.iconName || 'Zap'];
                    return (
                        <View key={index} style={styles.cardWrapper}>
                            <InfoCard 
                                icon={<IconComponent size={24} color="#2563EB" />} 
                                title={item.title} 
                                description={item.description} 
                            />
                        </View>
                    );
                })}
            </View>

            <View style={styles.visionSection}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: data?.visionImg }} style={styles.visionImage} />
                    <View style={styles.miniDescBadge}>
                        <Text style={styles.miniDescText}>{data?.visionMiniDesc}</Text>
                    </View>
                </View>

                <View style={styles.visionContent}>
                    <Text style={styles.visionTag}>VİZYONUMUZ</Text>
                    <Text style={styles.visionTitle}>{data?.visionTitle}</Text>
                    <Text style={styles.visionDesc}>{data?.visionDesc}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{data?.statsUser}</Text>
                            <Text style={styles.statLabel}>AKTİF KULLANICI</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{data?.statsCountry}</Text>
                            <Text style={styles.statLabel}>ÜLKE ERİŞİMİ</Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        onPress={() => router.push("/")} 
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>EKOSİSTEMİ İNCELE</Text>
                        <Icons.Zap size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
    main: { flex: 1, backgroundColor: '#020617' },
    infoSection: { paddingHorizontal: 20, marginTop: -80, gap: 12 },
    cardWrapper: { marginBottom: 12 },
    visionSection: { padding: 20, marginTop: 60, paddingBottom: 100 },
    imageContainer: { position: 'relative', borderRadius: 32, overflow: 'hidden', marginBottom: 40 },
    visionImage: { width: '100%', height: 400 },
    miniDescBadge: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.7)', padding: 16, borderRadius: 16, borderColor: 'rgba(255,255,255,0.1)' },
    miniDescText: { color: '#fff', fontSize: 13 },
    visionContent: { gap: 20 },
    visionTag: { color: '#3B82F6', fontWeight: 'bold', letterSpacing: 4, fontSize: 12 },
    visionTitle: { color: '#fff', fontSize: 36, fontWeight: 'bold', lineHeight: 42 },
    visionDesc: { color: '#94A3B8', fontSize: 16, lineHeight: 24 },
    statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1E293B', paddingTop: 30, marginTop: 10 },
    statItem: { flex: 1 },
    statValue: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
    statLabel: { color: '#64748B', fontSize: 10, letterSpacing: 1, marginTop: 4 },
    button: { backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 100, gap: 12, marginTop: 20 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});