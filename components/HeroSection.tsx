import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image,Animated, ActivityIndicator } from "react-native";
import { ArrowRight, ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { db } from "@/api/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FlashList } from "@shopify/flash-list";
const { width } = Dimensions.get("window");
const HERO_HEIGHT = 420;

const HeroSection = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const flashListRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const q = query(
          collection(db, "campaigns"),
          where("status", "==", "Aktif")
        );
        const querySnapshot = await getDocs(q);
        const fetchedData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(fetchedData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroData();
  }, []);

  useEffect(() => {
    if (data.length <= 1) return;
    let timer = setInterval(() => {
      if (selectedIndex < data.length - 1) {
        flashListRef.current?.scrollToIndex({ index: selectedIndex + 1, animated: true });
      } else {
        flashListRef.current?.scrollToIndex({ index: 0, animated: true });
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [selectedIndex, data]);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setSelectedIndex(viewableItems[0].index);
    }
  }).current;

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const scale = scrollX.interpolate({
      inputRange: [(index - 1) * width, index * width, (index + 1) * width],
      outputRange: [1, 1.05, 1],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.slide}>
        <Animated.View style={[styles.imageContainer, { transform: [{ scale }] }]}>
          <Image source={{ uri: item.image }} style={styles.image}  />
          <View style={styles.overlay} />
        </Animated.View>
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.85)", "rgba(0, 0, 0, 0.4)", "rgba(0, 0, 0, 0.1)", "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
       
        />
        <View style={styles.content}>
          <View style={styles.badge}>
            <View style={styles.pulseDot} />
            <Text style={styles.badgeText}>Yeni Sezon Fırsatları</Text>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.mainButton}>
              <Text style={styles.mainButtonText}>{item.buttonText || "İncele"}</Text>
              <ArrowRight size={16} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailButton}>
              <Text style={styles.detailButtonText}>Detaylar</Text>
              <ChevronRight size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountLabel}>İNDİRİM</Text>
            <Text style={styles.discountValue}>%{item.discount}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  }

  if (data.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlashList
        ref={flashListRef}
        data={data}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={16}
      />
      <View style={styles.pagination}>
        {data.map((_, index) => {
          const dotWidth = scrollX.interpolate({
            inputRange: [(index - 1) * width, index * width, (index + 1) * width],
            outputRange: [8, 30, 8],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  backgroundColor: selectedIndex === index ? "#FFF" : "rgba(255,255,255,0.3)",
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: width, height: HERO_HEIGHT, backgroundColor: "#000", marginTop: 10 },
  slide: { width: width, height: HERO_HEIGHT, position: "relative", overflow: "hidden" },
  imageContainer: { ...StyleSheet.absoluteFillObject, borderRadius: 12, marginHorizontal: 15, overflow: 'hidden' },
  image: { width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
  
  content: { position: "absolute", zIndex: 10, left: 35, right: 35, bottom: 65 },
  badge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", marginBottom: 12 },
  badgeText: { color: "#FFF", fontSize: 10, fontWeight: "600" },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFF", marginRight: 6 },
  title: { fontSize: 28, fontWeight: "900", color: "#FFF", lineHeight: 32, marginBottom: 8 },
  description: { fontSize: 14, color: "#cbd5e1", lineHeight: 20, marginBottom: 20, maxWidth: "85%" },
  buttonRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  mainButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, gap: 6 },
  mainButtonText: { color: "#000", fontWeight: "bold", fontSize: 13 },
  detailButton: { flexDirection: "row", alignItems: "center", gap: 2 },
  detailButtonText: { color: "#FFF", fontWeight: "600", fontSize: 13 },
  discountBadge: { position: "absolute", bottom: 40, right: 35, width: 75, height: 75, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", justifyContent: "center", alignItems: "center" },
  discountLabel: { color: "rgba(255,255,255,0.4)", fontSize: 8, fontWeight: "bold" },
  discountValue: { color: "#FFF", fontSize: 20, fontWeight: "900" },
  pagination: { position: "absolute", bottom: 25, left: 0, right: 0, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  dot: { height: 4, borderRadius: 2 }
});

export default HeroSection;