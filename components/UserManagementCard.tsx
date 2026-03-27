import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CheckCircle, UserX, Trash2, Shield } from 'lucide-react-native';
import { db } from '../api/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export const UserManagementCard = ({ user }: any) => {
  const handleStatus = async () => {
    const newStatus = user.status === 'Aktif' ? 'Kısıtlı' : 'Aktif';
    await updateDoc(doc(db, "users", user.id), { status: newStatus });
  };

  const handleDelete = () => {
    Alert.alert("Dikkat", `${user.displayName} silinsin mi?`, [
      { text: "İptal" },
      { text: "Sil", style: 'destructive', onPress: async () => await deleteDoc(doc(db, "users", user.id)) }
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user.displayName?.charAt(0) || '?'}</Text></View>
          <View>
            <Text style={styles.name}>{user.displayName || "İsimsiz"}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>
        <View style={[styles.badge, user.status === 'Aktif' ? styles.badgeActive : styles.badgeRestricted]}>
          <Text style={[styles.badgeText, user.status === 'Aktif' ? styles.textActive : styles.textRestricted]}>
            {user.status || 'Aktif'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.roleInfo}>
          <Shield size={14} color="#6366f1" />
          <Text style={styles.roleText}>{user.role}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleStatus} style={styles.actionBtn}>
            {user.status === 'Aktif' ? <UserX size={20} color="#f59e0b" /> : <CheckCircle size={20} color="#10b981" />}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={[styles.actionBtn, styles.deleteBtn]}>
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#0f172a', borderRadius: 20, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center',  borderColor: '#334155' },
  avatarText: { color: 'white', fontWeight: 'bold' },
  name: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  email: { color: '#64748b', fontSize: 11 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeActive: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  badgeRestricted: { backgroundColor: 'rgba(244, 63, 94, 0.1)' },
  badgeText: { fontSize: 9, fontWeight: 'bold' },
  textActive: { color: '#10b981' },
  textRestricted: { color: '#f43f5e' },
  divider: { height: 1, backgroundColor: '#1e293b', marginVertical: 12 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roleInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  roleText: { color: '#94a3b8', fontSize: 12 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { padding: 8, backgroundColor: '#1e293b', borderRadius: 10 },
  deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
});