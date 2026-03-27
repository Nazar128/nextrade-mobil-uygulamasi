import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db } from "@/api/firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Edit2, Trash2, Power, Clock } from 'lucide-react-native';

export const CampaignCard = ({ id, title, image, status, clicks, period, onEdit }: any) => {
  const toggleStatus = async () => {
    try {
      const newStatus = status === 'Aktif' ? 'Pasif' : 'Aktif';
      await updateDoc(doc(db, "campaigns", id), { status: newStatus });
    } catch (error) { console.error(error); }
  };

  const handleDelete = () => {
    Alert.alert("Emin misiniz?", `"${title}" silinecektir.`, [
      { text: "Vazgeç" },
      { text: "Sil", style: 'destructive', onPress: async () => await deleteDoc(doc(db, "campaigns", id)) }
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.overlay} />
        <View style={[styles.statusBadge, { backgroundColor: status === 'Aktif' ? '#065f46' : '#1e293b' }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.periodRow}>
          <Clock size={10} color="#64748b" />
          <Text style={styles.periodText}>{period}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>ETKİLEŞİM</Text>
            <Text style={styles.statValue}>{clicks || 0}</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: '#1e293b', paddingLeft: 15 }]}>
            <Text style={styles.statLabel}>KONUM</Text>
            <Text style={styles.statValue}>Ana Slider</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit()} style={styles.actionBtn}>
            <Edit2 size={16} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleStatus} style={[styles.actionBtn, status === 'Aktif' && { backgroundColor: '#10b98120' }]}>
            <Power size={16} color={status === 'Aktif' ? '#10b981' : '#94a3b8'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
            <Trash2 size={16} color="#f43f5e" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#0f172a', borderRadius: 20, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#1e293b' },
  imageContainer: { height: 140, position: 'relative' },
  image: { width: '100%', height: '100%', opacity: 0.5 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2, 6, 23, 0.4)' },
  statusBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: 'white', fontSize: 9, fontWeight: 'bold' },
  content: { padding: 15 },
  title: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  periodText: { color: '#64748b', fontSize: 10, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', marginVertical: 15, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#1e293b' },
  statBox: { flex: 1 },
  statLabel: { color: '#475569', fontSize: 8, fontWeight: 'bold' },
  statValue: { color: 'white', fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, height: 40, backgroundColor: '#020617', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' }
});