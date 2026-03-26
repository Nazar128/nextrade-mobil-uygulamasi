import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/api/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Mail, Lock, LogIn } from 'lucide-react-native';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
            return;
        }

        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
                const role = userDoc.data().role;
                if (role === "admin") {
                    router.replace("/admin/page");
                } else if (role === "seller") {
                    router.replace("/seller/page");
                } else {
                    router.replace("/(tabs)");
                }
            } else {
                Alert.alert("Hata", "Kullanıcı verisi bulunamadı!");
            }
        } catch (error: any) {
            Alert.alert("Giriş Başarısız", "Bilgiler hatalı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.titleText}>Giriş Yap</Text>
                    <Text style={styles.subtitleText}>Hesabınıza erişmek için bilgilerinizi girin.</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>E-Posta</Text>
                    <View style={styles.inputWrapper}>
                        <Mail color="#e5e7eb" size={18} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="mail@example.com"
                            placeholderTextColor="#6b7280"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Şifre</Text>
                        <TouchableOpacity>
                            <Text style={styles.forgotText}>Şifremi Unuttum</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputWrapper}>
                        <Lock color="#e5e7eb" size={18} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#6b7280"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.button, loading && { opacity: 0.7 }]} 
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <LogIn color="white" size={20} />
                    <Text style={styles.buttonText}>{loading ? "Giriş Yapılıyor..." : "Giriş Yap"}</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Hesabınız yok mu? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                        <Text style={styles.linkText}>Kaydol</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111111',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#1a1a1a',
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: '#374151',
    },
    header: {
        marginBottom: 30,
    },
    titleText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
    },
    subtitleText: {
        color: '#9ca3af',
        fontSize: 14,
        marginTop: 8,
    },
    inputContainer: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        color: '#e5e7eb',
        fontSize: 12,
        fontWeight: '600',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#374151',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: 'white',
        fontSize: 16,
    },
    forgotText: {
        color: '#3b82f6',
        fontSize: 12,
    },
    button: {
        backgroundColor: '#4b5563',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
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
        marginTop: 24,
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