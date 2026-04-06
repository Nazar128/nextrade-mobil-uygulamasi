import React, { useState, useEffect } from "react";
import {View,Text,TextInput,TouchableOpacity,ScrollView,StyleSheet,ActivityIndicator,Alert,KeyboardAvoidingView,Platform,} from "react-native";
import { db, auth } from "@/api/firebase";
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

type AddressFormData = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  address: string;
};
type SavedAddress = AddressFormData & {
  id: string;
  title?: string;
  displayName?: string;
};
type AddressFormProps = {
  onNext?: (data: AddressFormData) => void;
};
type Errors = Partial<Record<keyof AddressFormData, boolean>>;
export const AddressForm = ({ onNext }: AddressFormProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<AddressFormData>({
    fullName: "",
    phone: "",
    email: "",
    city: "",
    district: "",
    address: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchInitialData(currentUser.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);
  const fetchInitialData = async (userId: string) => {
    try {
      const userSnap = await getDoc(doc(db, "users", userId));
      if (userSnap.exists()) {
        const userData = userSnap.data() as Partial<{
          displayName: string;
          email: string;
          phone: string;
        }>;
        setFormData((prev) => ({
          ...prev,
          fullName: userData.displayName || "",
          email: userData.email || "",
          phone: userData.phone || "",
        }));
      }
      const addressRef = collection(db, "users", userId, "addresses");
      const q = query(addressRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const addressesData: SavedAddress[] = querySnapshot.docs.map((d) => {
        const data = d.data() as Partial<SavedAddress>;
        return {
          id: d.id,
          fullName: data.fullName || "",
          phone: data.phone || "",
          email: data.email || "",
          city: data.city || "",
          district: data.district || "",
          address: data.address || "",
          title: data.title,
          displayName: data.displayName,
        };
      });

      setSavedAddresses(addressesData);
      if (addressesData.length > 0) {
        applyAddressToForm(addressesData[0]);
      }
    } catch (error) {
      console.error("Firestore Hatası:", error);
    } finally {
      setLoading(false);
    }
  };
  const applyAddressToForm = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setFormData({
      fullName: addr.displayName || addr.fullName || "",
      phone: addr.phone || "",
      email: addr.email || "",
      city: addr.city || "",
      district: addr.district || "",
      address: addr.address || "",
    });
    setErrors({});
  };
  const validate = () => {
    const newErrors: Errors = {};
    if (!formData.fullName.trim()) newErrors.fullName = true;
    if (!formData.phone || formData.phone.length < 10) newErrors.phone = true;
    if (!formData.email.includes("@")) newErrors.email = true;
    if (!formData.city.trim()) newErrors.city = true;
    if (!formData.district.trim()) newErrors.district = true;
    if (!formData.address.trim()) newErrors.address = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert("Eksik Bilgi", "Lütfen tüm alanları doldurun.");
      return;
    }
    setSubmitting(true);
    try {
      if (user && !selectedAddressId) {
        const addressRef = collection(db, "users", user.uid, "addresses");
        await addDoc(addressRef, {
          displayName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          district: formData.district,
          address: formData.address,
          title: "Ev",
          createdAt: new Date().toISOString(),
        });
      }
      onNext?.(formData);
    } catch {
      Alert.alert("Hata", "Adres kaydedilirken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>TESLIMAT BILGILERI</Text>
          <View style={styles.accent} />
        </View>
        {savedAddresses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kayitli Adreslerim</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {savedAddresses.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => applyAddressToForm(item)}
                  style={[styles.card, selectedAddressId === item.id ? styles.cardActive : styles.cardInactive]}
                >
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title || "Adres"}
                  </Text>
                  <Text style={styles.cardSub} numberOfLines={1}>
                    {item.city} / {item.district}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => {
                  setSelectedAddressId(null);
                  setFormData({
                    fullName: user?.displayName || "",
                    phone: "",
                    email: user?.email || "",
                    city: "",
                    district: "",
                    address: "",
                  });
                }}
                style={styles.addCard}
              >
                <Text style={styles.addText}>+ Yeni Ekle</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
        <View style={styles.form}>
          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput
            style={[styles.input, errors.fullName && styles.error]}
            value={formData.fullName}
            onChangeText={(v: string) => setFormData({ ...formData, fullName: v })}
            placeholderTextColor="#444"
          />
          <Text style={styles.label}>Telefon</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.error]}
            value={formData.phone}
            keyboardType="phone-pad"
            onChangeText={(v: string) => setFormData({ ...formData, phone: v })}
            placeholderTextColor="#444"
          />
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={[styles.input, errors.email && styles.error]}
            value={formData.email}
            autoCapitalize="none"
            onChangeText={(v: string) => setFormData({ ...formData, email: v })}
            placeholderTextColor="#444"
          />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Sehir</Text>
              <TextInput
                style={[styles.input, errors.city && styles.error]}
                value={formData.city}
                onChangeText={(v: string) => setFormData({ ...formData, city: v })}
                placeholderTextColor="#444"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Ilce</Text>
              <TextInput
                style={[styles.input, errors.district && styles.error]}
                value={formData.district}
                onChangeText={(v: string) => setFormData({ ...formData, district: v })}
                placeholderTextColor="#444"
              />
            </View>
          </View>
          <Text style={styles.label}>Acik Adres</Text>
          <TextInput
            style={[styles.area, errors.address && styles.error]}
            value={formData.address}
            multiline
            onChangeText={(v: string) => setFormData({ ...formData, address: v })}
            placeholderTextColor="#444"
          />
          <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={styles.btn}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>DEVAM ET</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 25 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "900" },
  accent: { height: 4, width: 30, backgroundColor: "#2563eb", marginTop: 6, borderRadius: 2 },
  section: { marginBottom: 25 },
  sectionTitle: { color: "#666", fontSize: 10, fontWeight: "800", marginBottom: 12, textTransform: "uppercase" },
  card: { width: 140, padding: 16, borderRadius: 18, marginRight: 12, borderWidth: 2 },
  cardActive: { borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,0.1)" },
  cardInactive: { borderColor: "#222", backgroundColor: "#111" },
  cardTitle: { color: "#2563eb", fontSize: 12, fontWeight: "bold" },
  cardSub: { color: "#fff", fontSize: 11, marginTop: 4 },
  addCard: {width: 140, borderRadius: 18,borderStyle: "dashed",borderWidth: 2,borderColor: "#333",justifyContent: "center",alignItems: "center",},
  addText: { color: "#666", fontSize: 11, fontWeight: "700" },
  form: { gap: 14 },
  label: { color: "#666", fontSize: 10, fontWeight: "800", marginBottom: 6, marginLeft: 4, textTransform: "uppercase" },
  input: { backgroundColor: "#111", borderRadius: 12, padding: 14, color: "#fff", borderWidth: 1, borderColor: "#222" },
  area: {backgroundColor: "#111",borderRadius: 12,padding: 14,color: "#fff",borderWidth: 1,borderColor: "#222",minHeight: 90,textAlignVertical: "top",},
  error: { borderColor: "#ef4444" },
  row: { flexDirection: "row" },
  btn: { backgroundColor: "#2563eb", padding: 18, borderRadius: 16, alignItems: "center", marginTop: 10 },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 14 },
});