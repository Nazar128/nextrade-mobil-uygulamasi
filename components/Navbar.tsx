import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from "react-native";
import { Info, ShoppingCart, User, Search } from "lucide-react-native";
import { usePathname, useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import SearchBar from "./SearchBar";
import { Image } from 'expo-image';
import { auth } from "@/api/firebase";

const Navbar = () => {
  const { theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const searchBarRef = useRef<any>(null);
  const user = auth.currentUser;

  const getIconColor = (path: string) => {
    return pathname === path ? theme.primary : "#94a3b8";
  };

  const handleProfilePress = () => {
    if (user) {
      router.push("/profile");
    } else {
      router.push("/login");
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.push("/")} activeOpacity={0.8}>
          <Image 
            source={require("@/assets/images/logo.png")} 
            style={styles.logo} 
            contentFit="contain" 
            transition={500}  
            cachePolicy="disk" 
          />
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
                <Text style={styles.badgeText}></Text>
              </View>
            </View>
          </TouchableOpacity>
        
          <TouchableOpacity 
            style={[styles.profileButton, {  borderColor: `${theme.primary}40` }]} 
            onPress={handleProfilePress}
          >
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.profileAvatar} />
            ) : (
              <User size={18} color={theme.primary} strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    borderBottomWidth: 1, 
    paddingTop: Platform.OS === "android" ? 35 : 0 
  },
  container: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 20, 
    height: 70 
  },
  logo: { 
    width: 140, 
    height: 35 
  },
  rightSection: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12 
  },
  iconButton: { 
    position: "relative", 
    padding: 4 
  },
  badge: { 
    position: "absolute", 
    top: -4, 
    right: -8, 
    borderRadius: 10, 
    minWidth: 16, 
    height: 16, 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 1.5 
  },
  badgeText: { 
    color: "#FFF", 
    fontSize: 8, 
    fontWeight: "900" 
  },
  profileButton: { 
    padding: 7, 
    borderRadius: 14, 
    borderWidth: 1,
    overflow: "hidden",
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center"
  },
  profileAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 12
  }
});

export default Navbar;