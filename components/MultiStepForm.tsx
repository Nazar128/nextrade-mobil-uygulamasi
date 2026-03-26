import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  Image, StyleSheet, Alert, ActivityIndicator 
} from 'react-native';
import { 
  Package, DollarSign, CheckCircle2, 
  ChevronRight, ChevronLeft, UploadCloud, Hash, FileText 
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '@/api/firebase';;
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";

export default function MultiStepForm({ onSuccess, initialData }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(initialData?.imageUrl || null);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    price: initialData?.price?.toString() || '',
    stock: initialData?.stock?.toString() || '',
    description: initialData?.description || '',
    brand: initialData?.brand || '',
    color: initialData?.color || '',
    category: initialData?.category || 'Genel',
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.stock) {
      Alert.alert("Hata", "Lütfen zorunlu alanları doldurun.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Oturum bulunamadı");

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sellerId: user.uid,
        imageUrl: image || "https://via.placeholder.com/150",
        status: initialData ? initialData.status : 'pending',
        updatedAt: serverTimestamp(),
      };

      if (initialData?.id) {
        await updateDoc(doc(db, "products", initialData.id), productData);
        Alert.alert("Başarılı", "Ürün güncellendi.");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
        });
        Alert.alert("Başarılı", "Ürün onaya gönderildi.");
      }
      
      onSuccess();
    } catch (error) {
      console.error(error);
      Alert.alert("Hata", "İşlem sırasında bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: "TEMEL", icon: Package },
    { id: 2, name: "DETAY", icon: Hash },
    { id: 3, name: "ONAY", icon: CheckCircle2 }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.stepIndicator}>
        <View style={styles.progressLine} />
        {steps.map((s) => (
          <View key={s.id} style={styles.stepItem}>
            <View style={[
              styles.iconCircle, 
              step >= s.id ? styles.activeCircle : styles.inactiveCircle
            ]}>
              <s.icon size={20} color={step >= s.id ? "#fff" : "#4b5563"} />
            </View>
            <Text style={[styles.stepText, step >= s.id && styles.activeStepText]}>{s.name}</Text>
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.formContent}>
        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}><FileText size={18} color="#6366f1" /> Ürün Bilgileri</Text>
            <TextInput 
              style={styles.input}
              placeholder="Ürün Başlığı *"
              placeholderTextColor="#4b5563"
              value={formData.title}
              onChangeText={(txt) => setFormData({...formData, title: txt})}
            />
            <TextInput 
              style={styles.input}
              placeholder="Marka"
              placeholderTextColor="#4b5563"
              value={formData.brand}
              onChangeText={(txt) => setFormData({...formData, brand: txt})}
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}><DollarSign size={18} color="#6366f1" /> Fiyat & Stok</Text>
            <View style={styles.row}>
              <TextInput 
                style={[styles.input, { flex: 1, marginRight: 10 }]}
                placeholder="Fiyat *"
                keyboardType="numeric"
                placeholderTextColor="#4b5563"
                value={formData.price}
                onChangeText={(txt) => setFormData({...formData, price: txt})}
              />
              <TextInput 
                style={[styles.input, { flex: 1 }]}
                placeholder="Stok *"
                keyboardType="numeric"
                placeholderTextColor="#4b5563"
                value={formData.stock}
                onChangeText={(txt) => setFormData({...formData, stock: txt})}
              />
            </View>
            <TextInput 
              style={styles.input}
              placeholder="Renk"
              placeholderTextColor="#4b5563"
              value={formData.color}
              onChangeText={(txt) => setFormData({...formData, color: txt})}
            />
          </View>
        )}

        {step === 3 && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <>
                  <UploadCloud color="#6366f1" size={40} />
                  <Text style={styles.uploadText}>Görsel Seçmek İçin Dokun</Text>
                </>
              )}
            </TouchableOpacity>
            <TextInput 
              style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
              placeholder="Ürün Açıklaması..."
              multiline
              placeholderTextColor="#4b5563"
              value={formData.description}
              onChangeText={(txt) => setFormData({...formData, description: txt})}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.backButton, step === 1 && { opacity: 0 }]} 
          onPress={() => step > 1 && setStep(s => s - 1)}
          disabled={loading}
        >
          <ChevronLeft color="#94a3b8" />
          <Text style={styles.backButtonText}>GERİ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={step === 3 ? handleSubmit : () => setStep(s => s + 1)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {step === 3 ? (initialData ? 'GÜNCELLE' : 'ONAYA GÖNDER') : 'İLERLE'}
              </Text>
              <ChevronRight color="#fff" size={20} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  stepIndicator: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30, position: 'relative', paddingTop: 20 },
  progressLine: { position: 'absolute', top: 42, left: '15%', right: '15%', height: 1, backgroundColor: '#1e293b' },
  stepItem: { alignItems: 'center', zIndex: 1 },
  iconCircle: { width: 45, height: 45, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, backgroundColor: '#0f172a' },
  activeCircle: { backgroundColor: '#4f46e5', borderColor: '#818cf8' },
  inactiveCircle: { backgroundColor: '#0f172a', borderColor: '#1e293b' },
  stepText: { fontSize: 10, color: '#4b5563', marginTop: 8, fontWeight: '900' },
  activeStepText: { color: '#818cf8' },
  formContent: { flex: 1 },
  section: { gap: 15 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  input: { backgroundColor: '#020617', borderWidth: 1, borderColor: '#1e293b', padding: 16, borderRadius: 18, color: '#fff' },
  row: { flexDirection: 'row' },
  uploadArea: { borderStyle: 'dashed', borderWidth: 2, borderColor: '#1e293b', borderRadius: 30, padding: 20, alignItems: 'center', backgroundColor: '#020617', marginBottom: 20, height: 200, justifyContent: 'center', overflow: 'hidden' },
  uploadText: { color: '#94a3b8', marginTop: 10, fontSize: 12 },
  previewImage: { width: '100%', height: '100%', borderRadius: 20 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#1e293b', alignItems: 'center' },
  nextButton: { backgroundColor: '#4f46e5', padding: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center', marginLeft: 10 },
  nextButtonText: { color: '#fff', fontWeight: '900', marginRight: 10 },
  backButton: { flexDirection: 'row', alignItems: 'center', padding: 18, flex: 0.4 },
  backButtonText: { color: '#94a3b8', fontWeight: '900', marginLeft: 5 }
});