import React, { useRef } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from "react-native";
import { Info, ShoppingCart, User, Search } from "lucide-react-native";
import { usePathname, useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const { theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const searchBarRef = useRef<any>(null);

  const getIconColor = (path: string) => {
    return pathname === path ? theme.primary : "#94a3b8";
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.push("/")} activeOpacity={0.8}>
          <Image source={require("@/assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>

        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.iconButton} onPress={() => searchBarRef.current?.openSearch()}>
            <Search size={22} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>

          <SearchBar ref={searchBarRef} />

          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/about")}>
            <Info size={22} color={getIconColor("/about")} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/shoppingCart")}>
            <View>
              <ShoppingCart size={22} color={getIconColor("/shoppingCart")} strokeWidth={2} />
              <View style={[styles.badge, { backgroundColor: theme.primary, borderColor: theme.bg }]}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.profileButton, { backgroundColor: `${theme.primary}20`, borderColor: `${theme.primary}40` }]} 
            onPress={() => router.push("/login")}
          >
            <User size={18} color={theme.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { borderBottomWidth: 1, paddingTop: Platform.OS === "android" ? 30 : 0 },
  container: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 65 },
  logo: { width: 100, height: 28 },
  rightSection: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconButton: { position: "relative", padding: 6 },
  badge: { position: "absolute", top: -4, right: -8, borderRadius: 10, minWidth: 16, height: 16, justifyContent: "center", alignItems: "center", borderWidth: 1.5 },
  badgeText: { color: "#FFF", fontSize: 8, fontWeight: "900" },
  profileButton: { padding: 7, borderRadius: 12, borderWidth: 1 }
});

export default Navbar;