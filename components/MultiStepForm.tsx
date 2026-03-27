import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  Image, ActivityIndicator, Alert, StyleSheet, Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { db, storage, auth } from "../api/firebase";
import { 
  doc, updateDoc, collection, addDoc, 
  serverTimestamp, onSnapshot 
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { 
  Package, DollarSign, Image as ImageIcon, CheckCircle2, 
  Camera, ChevronRight, ChevronLeft, UploadCloud, 
  Hash, X
} from 'lucide-react-native';

export default function MultiStepMobileForm({ onSuccess, initialData }: any) {
  const [step, setStep] = useState(1);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialData?.sizes || []);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(initialData?.imageUrl || null);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showSubCatModal, setShowSubCatModal] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    categoryId: initialData?.categoryId || '',
    subCategoryId: initialData?.subCategoryId || '',
    price: initialData?.price?.toString() || '',
    stock: initialData?.stock?.toString() || '',
    description: initialData?.description || '',
    brand: initialData?.brand || '',
    color: initialData?.color || '',
    gender: initialData?.gender || 'Unisex',
    pattern: initialData?.pattern || '', 
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
      setDbCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const selectedCategoryData = useMemo(() => 
    dbCategories.find(c => c.id === formData.categoryId) || null
  , [formData.categoryId, dbCategories]);

  const activeSubCategories = useMemo(() => 
    selectedCategoryData?.subCategories || []
  , [selectedCategoryData]);

  const subCatTitle = useMemo(() => {
    const sub = activeSubCategories.find((s: any) => String(s.id) === String(formData.subCategoryId));
    return sub?.title || "Seçilmedi";
  }, [formData.subCategoryId, activeSubCategories]);

  const pickImage = async (useCamera: boolean) => {
    const permission = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = useCamera 
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleFinalSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert("Hata", "Oturum kapalı.");
    if (!formData.title) return Alert.alert("Hata", "Başlık gerekli.");

    setIsUploading(true);
    try {
      let finalImageUrl = imageUri || "";
      if (imageUri && (imageUri.startsWith('file') || imageUri.startsWith('content'))) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const storageRef = ref(storage, `products/${Date.now()}`);
        const uploadTask = await uploadBytesResumable(storageRef, blob);
        finalImageUrl = await getDownloadURL(uploadTask.ref);
      }

      const safeSlug = String(formData.title || "urun").toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      const payload = {
        title: String(formData.title || ""),
        categoryId: String(formData.categoryId || ""),
        subCategoryId: String(formData.subCategoryId || ""),
        category: String(selectedCategoryData?.title || ""),
        price: Number(formData.price) || 0,
        stock: Number(formData.stock) || 0,
        description: String(formData.description || ""),
        brand: String(formData.brand || ""),
        color: String(formData.color || ""),
        gender: String(formData.gender || "Unisex"),
        pattern: String(formData.pattern || ""),
        sizes: selectedSizes,
        imageUrl: finalImageUrl,
        status: "pending",
        updatedAt: serverTimestamp(),
        slug: safeSlug,
        inStock: (Number(formData.stock) || 0) > 0
      };

      if (initialData?.id) {
        await updateDoc(doc(db, "products", initialData.id), payload);
      } else {
        await addDoc(collection(db, "products"), {
          ...payload,
          sellerId: user.uid,
          createdAt: serverTimestamp(),
          salesCount: 0,
          rating: 5
        });
      }
      onSuccess();
    } catch (e: any) {
      Alert.alert("Hata", "İşlem başarısız.");
    } finally { setIsUploading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stepIndicator}>
        <View style={styles.stepWrap}>
          <View style={[styles.circle, step >= 1 && styles.circleAct]}>{step > 1 ? <CheckCircle2 size={16} color="white"/> : <Package size={16} color="white"/>}</View>
          <Text style={styles.stepTxt}>Bilgi</Text>
        </View>
        <View style={styles.line}/>
        <View style={styles.stepWrap}>
          <View style={[styles.circle, step >= 2 && styles.circleAct]}>{step > 2 ? <CheckCircle2 size={16} color="white"/> : <Hash size={16} color="white"/>}</View>
          <Text style={styles.stepTxt}>Detay</Text>
        </View>
        <View style={styles.line}/>
        <View style={styles.stepWrap}>
          <View style={[styles.circle, step >= 3 && styles.circleAct]}><ImageIcon size={16} color="white"/></View>
          <Text style={styles.stepTxt}>Medya</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={styles.sect}>
            <View style={styles.group}>
              <Text style={styles.label}>Ürün Adı</Text>
              <TextInput style={styles.input} value={formData.title} onChangeText={v => setFormData({...formData, title: v})} placeholder="Örn: Deri Ceket"/>
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Kategori Seçimi</Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowCatModal(true)}>
                <Text style={{color: formData.categoryId ? 'white' : '#4b5563'}}>{selectedCategoryData?.title || "Kategori Seç"}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Alt Kategori Seçimi</Text>
              <TouchableOpacity style={[styles.input, !formData.categoryId && {opacity: 0.4}]} onPress={() => formData.categoryId && setShowSubCatModal(true)}>
                <Text style={{color: formData.subCategoryId ? 'white' : '#4b5563'}}>{subCatTitle}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Marka</Text>
              <TextInput style={styles.input} value={formData.brand} onChangeText={v => setFormData({...formData, brand: v})} placeholder="Marka giriniz"/>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.sect}>
            <View style={styles.row}>
              <View style={[styles.group, {flex: 1, marginRight: 10}]}>
                <Text style={styles.label}>Fiyat (₺)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={formData.price} onChangeText={v => setFormData({...formData, price: v})} placeholder="0.00"/>
              </View>
              <View style={[styles.group, {flex: 1}]}>
                <Text style={styles.label}>Stok Sayısı</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={formData.stock} onChangeText={v => setFormData({...formData, stock: v})} placeholder="0"/>
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.group, {flex: 1, marginRight: 10}]}>
                <Text style={styles.label}>Renk</Text>
                <TextInput style={styles.input} value={formData.color} onChangeText={v => setFormData({...formData, color: v})} placeholder="Örn: Siyah"/>
              </View>
              <View style={[styles.group, {flex: 1}]}>
                <Text style={styles.label}>Desen</Text>
                <TextInput style={styles.input} value={formData.pattern} onChangeText={v => setFormData({...formData, pattern: v})} placeholder="Örn: Düz"/>
              </View>
            </View>
            <Text style={styles.label}>Bedenler</Text>
            <View style={styles.sizeWrap}>
              {["S", "M", "L", "XL", "38", "40", "ST"].map(s => (
                <TouchableOpacity key={s} onPress={() => setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} style={[styles.sizeBtn, selectedSizes.includes(s) && styles.sizeBtnAct]}>
                  <Text style={styles.sizeTxt}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.sect}>
            <Text style={styles.label}>Ürün Fotoğrafı</Text>
            <View style={styles.imgArea}>
              {imageUri ? <Image source={{uri: imageUri}} style={styles.fullImg}/> : <UploadCloud size={40} color="#4f46e5"/>}
              <View style={styles.imgBar}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => pickImage(true)}><Camera size={18} color="white"/></TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => pickImage(false)}><ImageIcon size={18} color="white"/></TouchableOpacity>
              </View>
            </View>
            <View style={styles.group}>
              <Text style={styles.label}>Açıklama</Text>
              <TextInput style={[styles.input, {height: 100, textAlignVertical: 'top'}]} multiline value={formData.description} onChangeText={v => setFormData({...formData, description: v})} placeholder="Ürün detaylarını yazın..."/>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => setStep(s => s - 1)} style={[styles.btnBack, step === 1 && {opacity: 0}]} disabled={step === 1}>
            <ChevronLeft color="#9ca3af"/><Text style={{color: '#9ca3af', fontWeight: 'bold'}}>Geri</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={step === 3 ? handleFinalSubmit : () => setStep(s => s + 1)} style={styles.btnNext} disabled={isUploading}>
            {isUploading ? <ActivityIndicator color="white"/> : <><Text style={styles.btnNextTxt}>{step === 3 ? (initialData?.id ? "GÜNCELLE" : "BİTİR") : "İLERLE"}</Text><ChevronRight color="white" size={18}/></>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showCatModal} transparent animationType="slide">
        <View style={styles.mBack}><View style={styles.mSheet}>
            <View style={styles.mHead}><Text style={styles.mTitle}>Kategori Seç</Text><TouchableOpacity onPress={() => setShowCatModal(false)}><X color="white" /></TouchableOpacity></View>
            <FlatList data={dbCategories} renderItem={({item}) => (
              <TouchableOpacity style={styles.mItem} onPress={() => { setFormData({...formData, categoryId: item.id, subCategoryId: ''}); setShowCatModal(false); }}>
                <Text style={styles.mItemTxt}>{item.title}</Text>
              </TouchableOpacity>
            )} />
        </View></View>
      </Modal>

      <Modal visible={showSubCatModal} transparent animationType="slide">
        <View style={styles.mBack}><View style={styles.mSheet}>
            <View style={styles.mHead}><Text style={styles.mTitle}>Alt Kategori Seç</Text><TouchableOpacity onPress={() => setShowSubCatModal(false)}><X color="white" /></TouchableOpacity></View>
            <FlatList data={activeSubCategories} renderItem={({item}) => (
              <TouchableOpacity style={styles.mItem} onPress={() => { setFormData({...formData, subCategoryId: String(item.id)}); setShowSubCatModal(false); }}>
                <Text style={styles.mItemTxt}>{item.title}</Text>
              </TouchableOpacity>
            )} />
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingHorizontal: 20 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
  stepWrap: { alignItems: 'center' },
  circle: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  circleAct: { backgroundColor: '#4f46e5' },
  stepTxt: { color: '#64748b', fontSize: 10, marginTop: 4, fontWeight: 'bold' },
  line: { width: 40, height: 2, backgroundColor: '#1e293b', marginHorizontal: 10, marginTop: -15 },
  sect: { gap: 16 },
  group: { gap: 6 },
  label: { color: '#9ca3af', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  input: { backgroundColor: '#020617', borderRadius: 12, padding: 14, color: 'white', borderWidth: 1, borderColor: '#1e293b' },
  row: { flexDirection: 'row' },
  sizeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sizeBtn: { padding: 10, borderRadius: 10, backgroundColor: '#1e293b', minWidth: 45, alignItems: 'center' },
  sizeBtnAct: { backgroundColor: '#4f46e5' },
  sizeTxt: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  imgArea: { height: 180, backgroundColor: '#020617', borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: '#334155', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fullImg: { width: '100%', height: '100%' },
  imgBar: { flexDirection: 'row', position: 'absolute', bottom: 10, gap: 10 },
  iconBtn: { backgroundColor: '#4f46e5', padding: 8, borderRadius: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, alignItems: 'center', paddingBottom: 20 },
  btnBack: { flexDirection: 'row', alignItems: 'center' },
  btnNext: { backgroundColor: '#4f46e5', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnNextTxt: { color: 'white', fontWeight: 'bold' },
  mBack: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  mSheet: { backgroundColor: '#1e293b', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: '60%' },
  mHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  mTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  mItem: { paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#334155' },
  mItemTxt: { color: 'white' }
});