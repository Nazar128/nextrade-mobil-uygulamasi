
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import HeroSection from "@/components/HeroSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import PopularProducts from "@/components/PopularProducts";
import BestSellers from "@/components/BestSellers";
import Footer from "@/components/Footer";
import { Text } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <HeroSection />

      <View style={styles.content}>
        <FeaturedProducts />
        <PopularProducts />
        <BestSellers />
        <Footer />
        
      </View>
      
      <View style={{ height: 80 }} />
      
    </ScrollView>
    
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { gap: 10 }
});