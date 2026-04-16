import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Linking, ScrollView } from "react-native";
import { Camera, BriefcaseBusiness, SquareTerminal, Send } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Image } from 'expo-image';
type UserRole = "guest" | "customer" | "seller";

const mockUser = {
  role: "customer" as UserRole
};

const Footer = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const role = mockUser.role;

  if (route.name.includes("Admin") || route.name.includes("Seller")) {
    return null;
  }

  return (
    <View style={styles.footerContainer}>
      <View style={styles.brandSection}>
        <Image source={require("@/assets/images/logo.png")} style={styles.logo} resizeMode="contain" contentFit="cover" transition={500}  cachePolicy="disk" />
        <Text style={styles.brandDescription}>Modern e-ticaret deneyimi.</Text>
      </View>

      <View style={styles.gridSection}>
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Menü</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}><Text style={styles.link}>Ana Sayfa</Text></TouchableOpacity>
          {role === "guest" && (
            <>
              <TouchableOpacity onPress={() => navigation.navigate("Cart")}><Text style={styles.link}>Sepet</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}><Text style={styles.link}>Giriş Yap</Text></TouchableOpacity>
            </>
          )}
          {role === "customer" && (
            <>
              <TouchableOpacity onPress={() => navigation.navigate("Cart")}><Text style={styles.link}>Sepetim</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Orders")}><Text style={styles.link}>Siparişlerim</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Profile")}><Text style={styles.link}>Profilim</Text></TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.column}>
          <Text style={styles.columnTitle}>Kurumsal</Text>
          <TouchableOpacity onPress={() => navigation.navigate("About")}><Text style={styles.link}>Hakkımızda</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Contact")}><Text style={styles.link}>İletişim</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Privacy")}><Text style={styles.link}>Gizlilik</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.newsletterSection}>
        <Text style={styles.columnTitle}>Bültene Katıl</Text>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Email adresiniz" placeholderTextColor="#94a3b8" />
          <TouchableOpacity style={styles.sendButton}>
            <Send size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.socialSection}>
        <Text style={styles.columnTitle}>Bizi Takip Edin</Text>
        <View style={styles.socialIcons}>
          <TouchableOpacity onPress={() => Linking.openURL("https://instagram.com")} style={styles.iconCircle}><Camera size={20} color="#FFF" /></TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL("https://linkedin.com")} style={styles.iconCircle}><BriefcaseBusiness size={20} color="#FFF" /></TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL("https://github.com")} style={styles.iconCircle}><SquareTerminal size={20} color="#FFF" /></TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Text style={styles.copyrightText}>© 2026 Tüm Hakları Saklıdır.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: { backgroundColor: "#0f172a", padding: 24, paddingTop: 40, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },
  brandSection: { alignItems: "center", marginBottom: 32 },
  logo: { width: 180, height: 45, marginBottom: 8 },
  brandDescription: { color: "#94a3b8", fontSize: 14 },
  gridSection: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  column: { flex: 1 },
  columnTitle: { color: "#FFF", fontSize: 16, fontWeight: "bold", marginBottom: 16 },
  link: { color: "#cbd5e1", fontSize: 14, marginBottom: 12 },
  newsletterSection: { marginBottom: 32 },
  inputContainer: { flexDirection: "row", backgroundColor: "#1e293b", borderRadius: 12, padding: 4 },
  input: { flex: 1, color: "#FFF", paddingHorizontal: 12, fontSize: 14 },
  sendButton: { backgroundColor: "#3b82f6", padding: 12, borderRadius: 10 },
  socialSection: { alignItems: "center", marginBottom: 32 },
  socialIcons: { flexDirection: "row", gap: 16 },
  iconCircle: { backgroundColor: "#1e293b", padding: 12, borderRadius: 50, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  bottomBar: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 20, alignItems: "center" },
  copyrightText: { color: "#64748b", fontSize: 12 }
});

export default Footer;