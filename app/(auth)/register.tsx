import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { auth, db } from '@/api/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { User, Mail, Phone, Lock, UserPlus, ShieldCheck } from 'lucide-react-native';

export default function RegisterScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'customer'
    });

    const handleRegister = async () => {
        if (formData.password !== formData.confirmPassword) {
            Alert.alert("Hata", "Şifreler eşleşmiyor!");
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                fullName: formData.displayName,
                phone: formData.phone,
                email: formData.email,
                role: formData.role,
                createdAt: serverTimestamp()
            });

            Alert.alert("Başarılı", "Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.");
            router.replace("/(auth)/login");
        } catch (error: any) {
            Alert.alert("Kayıt Hatası", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.titleText}>Hesap Oluştur</Text>
                    <Text style={styles.subtitleText}>Premium alışveriş deneyimine katılın.</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Ad Soyad</Text>
                    <View style={styles.inputWrapper}>
                        <User color="#9ca3af" size={18} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="John Doe"
                            placeholderTextColor="#6b7280"
                            onChangeText={(text) => setFormData({ ...formData, displayName: text })}
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Telefon</Text>
                    <View style={styles.inputWrapper}>
                        <Phone color="#9ca3af" size={18} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="05XX XXX XX XX"
                            placeholderTextColor="#6b7280"
                            keyboardType="phone-pad"
                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>E-Posta</Text>
                    <View style={styles.inputWrapper}>
                        <Mail color="#9ca3af" size={18} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="mail@example.com"
                            placeholderTextColor="#6b7280"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Üyelik Tipi</Text>
                    <View style={styles.roleContainer}>
                        <TouchableOpacity 
                            style={[styles.roleButton, formData.role === 'customer' && styles.roleButtonActive]}
                            onPress={() => setFormData({...formData, role: 'customer'})}
                        >
                            <Text style={[styles.roleButtonText, formData.role === 'customer' && styles.roleButtonTextActive]}>Müşteri</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.roleButton, formData.role === 'seller' && styles.roleButtonActive]}
                            onPress={() => setFormData({...formData, role: 'seller'})}
                        >
                            <Text style={[styles.roleButtonText, formData.role === 'seller' && styles.roleButtonTextActive]}>Satıcı</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Şifre</Text>
                    <View style={styles.inputWrapper}>
                        <Lock color="#9ca3af" size={18} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#6b7280"
                            secureTextEntry
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Şifre Tekrar</Text>
                    <View style={styles.inputWrapper}>
                        <Lock color="#9ca3af" size={18} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#6b7280"
                            secureTextEntry
                            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.button, loading && { opacity: 0.7 }]} 
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <UserPlus color="white" size={20} />
                    <Text style={styles.buttonText}>{loading ? "Kaydediliyor..." : "Kayıt Ol"}</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Zaten üye misiniz? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                        <Text style={styles.linkText}>Giriş Yap</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#111111',
        justifyContent: 'center',
        padding: 24,
        paddingVertical: 20,
    },
    card: {
        width: '100%',
        backgroundColor: '#1a1a1a',
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: '#374151',
    },
    header: {
        marginBottom: 20,
    },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    subtitleText: {
        color: '#9ca3af',
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 6,
    },
    label: {
        color: '#e5e7eb',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 6,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#374151',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: 'white',
        fontSize: 13,
    },
    roleContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    roleButton: {
        flex: 1,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#374151',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    roleButtonActive: {
        backgroundColor: '#4b5563',
        borderColor: '#6b7280',
    },
    roleButtonText: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: '600',
    },
    roleButtonTextActive: {
        color: 'white',
    },
    button: {
        backgroundColor: '#4b5563',
        height: 52,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        gap: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: '#6b7280',
        fontSize: 14,
    },
    linkText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
});