import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, SafeAreaView, 
  StyleSheet, StatusBar, ScrollView 
} from 'react-native';
import { LayoutDashboard, Plus, X, Settings, Package } from 'lucide-react-native';
import MultiStepFormMobile from '@/components/MultiStepForm';
import ProductListMobile from '@/components/ProductList';
import ManagerStats from '@/components/ManagerStats'; 
import StoreSettings from '@/components/StoreSettings';  

export default function SellerManagerMobile() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'settings'>('inventory');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const openAddForm = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEditForm = (product: any) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <LayoutDashboard color="#6366f1" size={28} />
          <Text style={styles.headerTitle}>YÖNETİM <Text style={styles.headerSubTitle}>PANELİ</Text></Text>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity 
            onPress={() => {setActiveTab('inventory'); setIsFormOpen(false);}}
            style={[styles.tabItem, activeTab === 'inventory' && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, activeTab === 'inventory' && styles.tabTextActive]}>Envanter</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {setActiveTab('settings'); setIsFormOpen(false);}}
            style={[styles.tabItem, activeTab === 'settings' && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>Ayarlar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {activeTab === 'inventory' ? (
          <View style={{ flex: 1 }}>
            {!isFormOpen ? (
              <>
                <ProductListMobile onEdit={openEditForm} />
                <TouchableOpacity style={styles.fab} onPress={openAddForm}>
                  <Plus color="#fff" size={30} />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.modalOverlay}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>
                      {editingProduct ? 'ÜRÜNÜ DÜZENLE' : 'YENİ ÜRÜN EKLE'}
                    </Text>
                    <Text style={styles.modalSub}>NexTrade Envanter Yönetimi</Text>
                  </View>
                  <TouchableOpacity onPress={() => setIsFormOpen(false)} style={styles.closeBtn}>
                    <X color="#ef4444" size={24} />
                  </TouchableOpacity>
                </View>
                <MultiStepFormMobile 
                  initialData={editingProduct} 
                  onSuccess={() => setIsFormOpen(false)} 
                />
              </View>
            )}
          </View>
        ) : (
          <StoreSettings />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 20, paddingTop: 10 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  headerTitle: { color: '#4f46e5', fontSize: 26, fontWeight: '900', marginLeft: 10, letterSpacing: -1 },
  headerSubTitle: { color: '#475569' },
  tabBar: { flexDirection: 'row', backgroundColor: '#020617', borderRadius: 20, padding: 6, borderWidth: 1, borderColor: '#1e293b' },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 15 },
  tabItemActive: { backgroundColor: '#1e293b' },
  tabText: { color: '#64748b', fontWeight: 'bold', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  content: { flex: 1, paddingHorizontal: 20 },
  fab: { 
    position: 'absolute', bottom: 30, right: 0, 
    backgroundColor: '#4f46e5', width: 65, height: 65, 
    borderRadius: 22, justifyContent: 'center', alignItems: 'center',
    shadowColor: "#4f46e5", shadowOpacity: 0.5, shadowRadius: 15, elevation: 10, zIndex: 10
  },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0f172a', zIndex: 99 },
  modalHeader: { 
    paddingVertical: 20, marginBottom: 20, flexDirection: 'row', 
    justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#1e293b'
  },
  modalTitle: { color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: -0.5 },
  modalSub: { color: '#475569', fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  closeBtn: { padding: 5, backgroundColor: '#ef44441a', borderRadius: 12 }
});