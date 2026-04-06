import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import Shopping from '@/components/Shopping';
import { useRouter } from 'expo-router';

const CartPage = () => {
  const router = useRouter();
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => router.push("/")} style={styles.backButton}>
                        <ArrowLeft size={18} color="#6b7280" />
                        <Text style={styles.backText}>Mağazaya Dön</Text>
                    </TouchableOpacity>
                    <View style={styles.titleWrapper}>
                        <Text style={styles.title}>
                            SEPETİM <Text style={styles.dot}>.</Text>
                        </Text>
                    </View>
                </View>
                <Shopping />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0a' },
    scrollContent: { paddingHorizontal: 16, paddingVertical: 32 },
    headerContainer: { marginBottom: 48 },
    backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    backText: { color: '#6b7280', marginLeft: 8, fontWeight: '500' },
    titleWrapper: { flexDirection: 'row', alignItems: 'center' },
    title: { fontSize: 36, fontWeight: '900', color: '#ffffff', letterSpacing: -1.5 },
    dot: { color: '#2563eb' }
});

export default CartPage;