import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, Modal, 
  StyleSheet, TextInput, ActivityIndicator, Dimensions, SafeAreaView 
} from 'react-native';
import { db } from "@/api/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  AlertCircle, Check, ArrowLeft, Send, 
  PackageSearch, X 
} from 'lucide-react-native';
import { Image } from 'expo-image';
interface ReturnModalProps {
  order: any;
  onClose: () => void;
  visible: boolean;
}

const { width, height } = Dimensions.get('window');

export default function ReturnManagement({ order, onClose, visible }: ReturnModalProps) {
  const [step, setStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [returnReason, setReturnReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [returnCode, setReturnCode] = useState("");

  const reasons = ["Vazgeçtim / İhtiyacım Kalmadı", "Beden / Numara Uygun Değil", "Ürün Hasarlı / Kusurlu Geldi", "Beklediğimden Farklı Kalitede", "Yanlış Ürün Gönderildi", "Diğer"];

  const toggleItem = (productId: string) => {
    setSelectedItems(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const handleCreateReturn = async () => {
    setLoading(true);
    try {
      const generatedCode = `NX-${Math.floor(100000 + Math.random() * 900000)}`;
      const returnData = {
        orderId: order.id,
        orderDisplayId: order.orderId,
        customerId: order.userId,
        items: order.items.filter((item: any) => selectedItems.includes(item.id.toString() || item.title)),
        reason: returnReason === "Diğer" ? otherReason : returnReason,
        status: 'pending',
        returnCode: generatedCode,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "returns"), returnData);
      setReturnCode(generatedCode);
      setStep(3);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>İADE TALEBİ</Text>
              <Text style={styles.orderId}>ORDER: #{order.orderId}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}><X size={24} color="#666" /></TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {step === 1 && (
              <View style={styles.stepContainer}>
                <View style={styles.infoBox}>
                  <AlertCircle size={20} color="#60a5fa" />
                  <Text style={styles.infoText}>İADE EDİLECEK ÜRÜNLERİ SEÇİNİZ</Text>
                </View>
                {order.items.map((item: any, idx: number) => {
                  const itemId = item.id.toString() || item.title;
                  const isSelected = selectedItems.includes(itemId);
                  return (
                    <TouchableOpacity key={idx} onPress={() => toggleItem(itemId)} activeOpacity={0.7} style={[styles.itemCard, isSelected && styles.itemCardSelected]}>
                      <Image source={{ uri: item.imageUrl || item.image }} style={styles.itemImage} contentFit="cover" transition={500}  cachePolicy="disk"  />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                        <Text style={styles.itemPrice}>{item.price.toLocaleString('tr-TR')} TL</Text>
                      </View>
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>{isSelected && <Check size={14} color="white" strokeWidth={4} />}</View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepContainer}>
                <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}><ArrowLeft size={14} color="#666" /><Text style={styles.backButtonText}>GERİ DÖN</Text></TouchableOpacity>
                <Text style={styles.sectionTitle}>NEDEN İADE EDİYORSUNUZ?</Text>
                {reasons.map((r) => (
                  <TouchableOpacity key={r} onPress={() => setReturnReason(r)} style={[styles.reasonButton, returnReason === r && styles.reasonButtonSelected]}>
                    <Text style={[styles.reasonText, returnReason === r && styles.reasonTextSelected]}>{r}</Text>
                  </TouchableOpacity>
                ))}
                {returnReason === "Diğer" && <TextInput placeholder="Detaylı açıklama yazınız..." placeholderTextColor="#444" multiline numberOfLines={4} value={otherReason} onChangeText={setOtherReason} style={styles.textArea} />}
              </View>
            )}

            {step === 3 && (
              <View style={styles.successContainer}>
                <View style={styles.successIconBox}><PackageSearch size={44} color="#22c55e" /></View>
                <Text style={styles.successTitle}>HARİKA!</Text>
                <Text style={styles.successDescription}>İade talebiniz satıcıya iletildi. Ürünleri kargoya verirken kodu belirtmeyi unutmayın.</Text>
                <View style={styles.codeContainer}><Text style={styles.codeLabel}>KARGO İADE KODU</Text><Text style={styles.codeText}>{returnCode}</Text></View>
              </View>
            )}
          </ScrollView>

          {step < 3 && (
            <View style={styles.footer}>
              <TouchableOpacity 
                disabled={(step === 1 && selectedItems.length === 0) || (step === 2 && (!returnReason || (returnReason === "Diğer" && !otherReason))) || loading}
                onPress={step === 1 ? () => setStep(2) : handleCreateReturn}
                style={[styles.mainButton, step === 2 && {backgroundColor: '#2563eb'}]}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={[styles.mainButtonText, step === 2 && {color: 'white'}]}>{step === 1 ? `İLERLE (${selectedItems.length} ÜRÜN)` : "TALEBİ GÖNDER"}</Text>}
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#0c0d10', height: height * 0.9, borderTopLeftRadius: 40, borderTopRightRadius: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  header: { padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '900', letterSpacing: -1 },
  orderId: { color: '#06b6d4', fontSize: 10, marginTop: 4, letterSpacing: 2 },
  closeButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16 },
  content: { padding: 24 },
  stepContainer: { gap: 16 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' },
  infoText: { color: '#bfdbfe', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 16 },
  itemCardSelected: { borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.05)' },
  itemImage: { width: 60, height: 60, borderRadius: 16, backgroundColor: '#1a1b1e' },
  itemInfo: { flex: 1 },
  itemTitle: { color: 'white', fontSize: 14, fontWeight: '700' },
  itemPrice: { color: '#666', fontSize: 12, marginTop: 4 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  backButtonText: { color: '#666', fontSize: 10, fontWeight: '900' },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: '900', marginBottom: 8 },
  reasonButton: { padding: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'transparent', marginBottom: 8 },
  reasonButtonSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  reasonText: { color: '#999', fontSize: 14, fontWeight: '600' },
  reasonTextSelected: { color: 'white' },
  textArea: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 20, color: 'white', fontSize: 14, textAlignVertical: 'top', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginTop: 8 },
  footer: { padding: 24, paddingBottom: 40 },
  mainButton: { backgroundColor: 'white', height: 64, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  mainButtonText: { color: 'black', fontWeight: '900', letterSpacing: 2 },
  successContainer: { alignItems: 'center', paddingVertical: 40 },
  successIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(34, 197, 94, 0.1)', borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { color: 'white', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  successDescription: { color: '#666', textAlign: 'center', fontSize: 12, fontWeight: '600', lineHeight: 18, marginTop: 8, paddingHorizontal: 20 },
  codeContainer: { marginTop: 40, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.2)', padding: 32, borderRadius: 40, alignItems: 'center', width: '100%' },
  codeLabel: { color: '#444', fontSize: 10, fontWeight: '900', letterSpacing: 4, marginBottom: 12 },
  codeText: { color: '#3b82f6', fontSize: 40, fontWeight: '900' }
});