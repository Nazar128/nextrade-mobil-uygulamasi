import React from "react";
import { Modal, View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from "react-native";
import { X, Check, AlertCircle } from "lucide-react-native";

export const ProductPreviewModal = ({ isOpen, onClose, product, onApprove, onReject }: any) => {
  if (!isOpen || !product) return null;
  const imgs = Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []);

  const InfoRow = ({ label, value }: any) => {
    if (!value || value === "") return null;
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    );
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>ÜRÜN DETAYLARI</Text>
            <TouchableOpacity onPress={onClose}><X size={24} color="#64748b" /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <ScrollView horizontal pagingEnabled style={styles.gallery}>
              {imgs.map((img: string, i: number) => (
                <Image key={i} source={{ uri: img }} style={styles.galleryImg} resizeMode="contain" />
              ))}
            </ScrollView>

            <View style={styles.padding}>
              <Text style={styles.brandName}>{product.brand}</Text>
              <Text style={styles.productTitle}>{product.title}</Text>
              
              <View style={styles.priceStockCard}>
                <View style={styles.priceStockItem}>
                  <Text style={styles.psLabel}>FİYAT</Text>
                  <Text style={styles.psValue}>{product.price} TL</Text>
                </View>
                <View style={[styles.priceStockItem, { borderLeftWidth: 1, borderColor: '#1e293b' }]}>
                  <Text style={styles.psLabel}>STOK</Text>
                  <Text style={styles.psValue}>{product.stock} Adet</Text>
                </View>
              </View>

              <View style={styles.detailsList}>
                <InfoRow label="Kategori" value={product.main} />
                <InfoRow label="Alt Kategori" value={product.sub} />
                <InfoRow label="Cinsiyet" value={product.gender} />
                <InfoRow label="Renk" value={product.color} />
                <InfoRow label="Desen" value={product.pattern} />
              </View>

              {product.description && (
                <View style={styles.descriptionBox}>
                  <View style={styles.descTitleRow}><AlertCircle size={14} color="#475569"/><Text style={styles.descTitle}>AÇIKLAMA</Text></View>
                  <Text style={styles.descContent}>{product.description}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => onApprove(product.id)} style={styles.btnApprove}><Check size={18} color="black"/><Text style={styles.btnApproveText}>ONAYLA</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => onReject(product.id)} style={styles.btnReject}><Text style={styles.btnRejectText}>REDDET</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'flex-end' },
  content: { height: '94%', backgroundColor: '#0f172a', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  modalHeaderText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  gallery: { height: 320, backgroundColor: '#000' },
  galleryImg: { width: Dimensions.get('window').width, height: 320 },
  padding: { padding: 20 },
  brandName: { color: '#3b82f6', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  productTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 5 },
  priceStockCard: { flexDirection: 'row', backgroundColor: '#020617', borderRadius: 15, marginTop: 20, borderWidth: 1, borderColor: '#1e293b' },
  priceStockItem: { flex: 1, padding: 15, alignItems: 'center' },
  psLabel: { color: '#475569', fontSize: 9, fontWeight: 'bold' },
  psValue: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  detailsList: { marginTop: 25, gap: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  infoLabel: { color: '#64748b', fontSize: 13 },
  infoValue: { color: 'white', fontSize: 13, fontWeight: '500' },
  descriptionBox: { marginTop: 30, backgroundColor: '#020617', padding: 20, borderRadius: 20 },
  descTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  descTitle: { color: '#475569', fontSize: 10, fontWeight: 'bold' },
  descContent: { color: '#94a3b8', fontSize: 14, lineHeight: 22 },
  footer: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#1e293b', paddingBottom: 40 },
  btnApprove: { flex: 2, backgroundColor: 'white', height: 55, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  btnApproveText: { color: 'black', fontWeight: 'bold', fontSize: 15 },
  btnReject: { flex: 1, backgroundColor: '#f43f5e15', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnRejectText: { color: '#f43f5e', fontWeight: 'bold' }
});