import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";

export const SettingToggle = ({ label, isActive, onToggle }: any) => (
  <View style={styles.toggleItem}>
    <Text style={styles.toggleLabel}>{label}</Text>
    <Switch
      trackColor={{ false: "#e2e8f0", true: "#1d4ed8" }}
      thumbColor="#ffffff"
      onValueChange={onToggle}
      value={isActive}
    />
  </View>
);

const styles = StyleSheet.create({
  toggleItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", minHeight: 75 },
  toggleLabel: { fontSize: 11, fontWeight: "700", color: "#64748b", textTransform: "uppercase" }
});