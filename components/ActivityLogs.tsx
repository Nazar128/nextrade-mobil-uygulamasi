import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/api/firebase";
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export const ActivityLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const q = query(collection(db, "logs"), orderBy("createdAt", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE_PRODUCT': return '#10b981';
      case 'DELETE_PRODUCT': return '#f43f5e';
      case 'UPDATE_PRODUCT': return '#3b82f6';
      case 'LOGIN': return '#f59e0b';
      case 'REGISTER': return '#3b82f6';
      default: return '#64748b';
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SİSTEM HAREKETLERİ</Text>
      {loading ? (
        <ActivityIndicator color="#6366f1" style={{ padding: 20 }} />
      ) : logs.length === 0 ? (
        <Text style={styles.empty}>Henüz bir hareket kaydedilmedi.</Text>
      ) : (
        logs.map((log) => (
          <View key={log.id} style={styles.logRow}>
            <View style={styles.logMain}>
              <View style={[styles.dot, { backgroundColor: getActionColor(log.action), shadowColor: getActionColor(log.action) }]} />
              <View>
                <Text style={styles.userName}>{log.userName || "Bilinmeyen"}</Text>
                <Text style={styles.details}>{log.details}</Text>
              </View>
            </View>
            <Text style={styles.time}>
              {log.createdAt ? formatDistanceToNow(log.createdAt.toDate(), { addSuffix: true, locale: tr }) : 'Yeni'}
            </Text>
          </View>
        ))
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: { backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(30, 41, 59, 0.6)' },
  title: { fontSize: 10, fontWeight: '900', color: '#64748b', letterSpacing: 1.5, marginBottom: 20 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  logMain: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  dot: { width: 6, height: 6, borderRadius: 3, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4, elevation: 5 },
  userName: { color: '#e2e8f0', fontSize: 12, fontWeight: '700' },
  details: { color: '#64748b', fontSize: 10, marginTop: 2 },
  time: { color: '#475569', fontSize: 9, fontStyle: 'italic' },
  empty: { color: '#475569', fontSize: 11, textAlign: 'center', paddingVertical: 10 }
});