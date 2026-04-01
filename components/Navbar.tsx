import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from "react-native";
import { Info, ShoppingCart, User, Search } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const Navbar = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} activeOpacity={0.8}>
          <Image source={require("@/assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>

        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Search")}>
            <Search size={22} color="#FFF" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("About")}>
            <Info size={22} color={route.name === "About" ? "#3b82f6" : "#94a3b8"} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Cart")}>
            <View>
              <ShoppingCart size={22} color={route.name === "Cart" ? "#3b82f6" : "#94a3b8"} strokeWidth={2} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate("Profile")}>
            <User size={18} color="#FFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "rgba(15, 23, 42, 0.95)", borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.1)", paddingTop: Platform.OS === "android" ? 30 : 0 },
  container: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 60 },
  logo: { width: 120, height: 35 },
  rightSection: { flexDirection: "row", alignItems: "center", gap: 18 },
  iconButton: { position: "relative", padding: 4 },
  badge: { position: "absolute", top: -5, right: -10, backgroundColor: "#3b82f6", borderRadius: 10, minWidth: 16, height: 16, justifyContent: "center", alignItems: "center", borderWidth: 1.5, borderColor: "#0f172a" },
  badgeText: { color: "#FFF", fontSize: 8, fontWeight: "900" },
  profileButton: { backgroundColor: "rgba(59, 130, 246, 0.2)", padding: 8, borderRadius: 12, borderWidth: 1, borderColor: "rgba(59, 130, 246, 0.3)" }
});

export default Navbar;