import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

export const SettingInput = ({ label, placeholder, value, onChange, type = "text" }: any) => (
  <View style={styles.inputItem}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      secureTextEntry={type === "password"}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
      placeholderTextColor="#cbd5e1"
      style={styles.textInput}
    />
  </View>
);

const styles = StyleSheet.create({
  inputItem: { padding: 18, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", minHeight: 85, justifyContent: "center" },
  inputLabel: { fontSize: 10, fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: 6 },
  textInput: { fontSize: 15, color: "#1e293b", fontWeight: "600", padding: 0 }
});