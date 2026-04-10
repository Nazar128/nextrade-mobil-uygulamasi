import React, { useRef } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from "react-native";
import { Info, ShoppingCart, User, Search } from "lucide-react-native";
import { usePathname, useRouter } from "expo-router";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchBarRef = useRef<any>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.push("/")} activeOpacity={0.8}>
          <Image source={require("@/assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => searchBarRef.current?.openSearch()}>
          <Search size={22} color="#FFF" strokeWidth={2} />
        </TouchableOpacity>

        <SearchBar ref={searchBarRef} />

          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/about")}>
            <Info size={22} color={pathname === "/about" ? "#3b82f6" : "#94a3b8"} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/shoppingCart")}>
            <View>
              <ShoppingCart size={22} color={pathname === "/shoppingCart" ? "#3b82f6" : "#94a3b8"} strokeWidth={2} />
              <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileButton} onPress={() => router.push("/login")}>
            <User size={18} color="#FFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "rgba(15, 23, 42, 0.95)", borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.1)", paddingTop: Platform.OS === "android" ? 30 : 0 },
  container: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 60 },
  logo: { width: 110, height: 30 },
  rightSection: { flexDirection: "row", alignItems: "center", gap: 15 },
  iconButton: { position: "relative", padding: 6 },
  badge: { position: "absolute", top: -4, right: -8, backgroundColor: "#3b82f6", borderRadius: 10, minWidth: 15, height: 15, justifyContent: "center", alignItems: "center", borderWidth: 1.5, borderColor: "#0f172a" },
  badgeText: { color: "#FFF", fontSize: 8, fontWeight: "900" },
  profileButton: { backgroundColor: "rgba(59, 130, 246, 0.2)", padding: 7, borderRadius: 10, borderWidth: 1, borderColor: "rgba(59, 130, 246, 0.3)" },
  hiddenSearch: { position: 'absolute', width: 0, height: 0 }
});

export default Navbar;