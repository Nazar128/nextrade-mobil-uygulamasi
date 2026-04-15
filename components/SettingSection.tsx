import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const SettingSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>
      {children}
    </View>
  </View>
);

const styles = StyleSheet.create({
  sectionContainer: { width: "100%", marginBottom: 24, gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: "#94a3b8", letterSpacing: 2, textTransform: "uppercase", paddingLeft: 4 },
  sectionCard: { backgroundColor: "#ffffff", borderRadius: 24, borderWidth: 1, borderColor: "#f1f5f9", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }
});