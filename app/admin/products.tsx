import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator } from "react-native";
import { Search, ShieldCheck } from "lucide-react-native";
import { db } from "@/api/firebase"; 
import { onSnapshot, collection, query, where, doc, updateDoc, getDocs } from "firebase/firestore";
import { AuditRow } from "@/components/AuditRow";
import { ProductPreviewModal } from "@/components/ProductPreviewModal";

export default function ProductAuditPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const catSnap = await getDocs(collection(db, "categories"));
      const cats = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCategoryData(cats);
    };
    fetchCategories();

    const q = query(collection(db, "products"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const resolveCategoryNames = (productId: any) => {
    const mainCat = categoryData.find(c => String(c.id) === String(productId.categoryId));
    let subCatName = "";
    if (mainCat && mainCat.subCategories) {
      const sub = mainCat.subCategories.find((s: any) => String(s.id) === String(productId.subCategoryId));
      subCatName = sub ? sub.title : "";
    }
    return {
      main: mainCat ? mainCat.title : "Bilinmiyor",
      sub: subCatName
    };
  };

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, "products", id), { status: "approved", approvedAt: new Date().toISOString() });
      setIsModalOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, "products", id), { status: "rejected", rejectedAt: new Date().toISOString() });
      setIsModalOpen(false);
    } catch (e) { console.error(e); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>ÜRÜN <Text style={styles.titleBold}>DENETİMİ</Text></Text>
            <View style={styles.subtitleRow}>
              <ShieldCheck size={12} color="#3b82f6" />
              <Text style={styles.subtitle}>Onay Bekleyenler</Text>
            </View>
          </View>
          <View style={styles.countBadge}><Text style={styles.countText}>{products.length}</Text></View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={16} color="#64748b" />
            <TextInput style={styles.searchInput} placeholder="Ürün ara..." placeholderTextColor="#475569" onChangeText={setSearchTerm} />
          </View>
        </View>

        <View style={styles.listSection}>
          {loading ? <ActivityIndicator color="#1d4ed8" /> : products.filter(p => p.title?.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => {
            const catInfo = resolveCategoryNames(product);
            return (
              <AuditRow 
                key={product.id} 
                product={{...product, categoryTitle: catInfo.main}} 
                onPreview={() => { setSelectedProduct({...product, ...catInfo}); setIsModalOpen(true); }} 
                onReject={handleReject}
              />
            );
          })}
        </View>
      </ScrollView>
      <ProductPreviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={selectedProduct} onApprove={handleApprove} onReject={handleReject} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { color: '#64748b', fontSize: 20, fontWeight: '300' },
  titleBold: { color: '#1d4ed8', fontWeight: 'bold' },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  subtitle: { color: '#475569', fontSize: 11 },
  countBadge: { backgroundColor: '#1d4ed8', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  countText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  searchSection: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#020617' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderRadius: 12, paddingHorizontal: 12, height: 45, borderWidth: 1, borderColor: '#1e293b' },
  searchInput: { flex: 1, marginLeft: 10, color: 'white' },
  listSection: { padding: 20 }
});