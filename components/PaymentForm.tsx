import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from "react-native";
import { CreditCard, Truck, ShieldCheck } from "lucide-react-native";

type PaymentResult =
  | null
  | {
      method: "COD" | "CARD";
      label: string;
      token?: string;
      last4?: string;
      brand?: string;
    };

type PaymentFormProps = {
  onBack: () => void;
  onComplete: (result: PaymentResult) => void;
};

type PaymentMethod = "card" | "cod";

type CardData = {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
};

const PaymentForm = ({ onBack, onComplete }: PaymentFormProps) => {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState<CardData>({ number: "", name: "", expiry: "", cvv: "" });
  const [rotateAnim] = useState(new Animated.Value(0));

  const isCardValid =
    cardData.number.replace(/\s/g, "").length === 16 &&
    cardData.name.length > 3 &&
    cardData.expiry.length === 5 &&
    cardData.cvv.length === 3;

  const flipCard = (toValue: number) => {
    Animated.timing(rotateAnim, {
      toValue,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handlePaymentAction = async () => {
    if (method === "cod") {
      onComplete({ method: "COD", label: "Kapida Odeme" });
      return;
    }

    if (!isCardValid) return;

    setIsProcessing(true);
    setTimeout(() => {
      const mockToken = `tok_nextrade_${Math.random().toString(36).slice(2, 11)}`;
      onComplete({
        method: "CARD",
        label: "Kredi Karti",
        token: mockToken,
        last4: cardData.number.replace(/\s/g, "").slice(-4),
        brand: "Visa",
      });
      setIsProcessing(false);
    }, 1500);
  };

  const handleNumberChange = (text: string) => {
    let value = text.replace(/\D/g, "").substring(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardData({ ...cardData, number: value });
  };

  const handleExpiryChange = (text: string) => {
    let value = text.replace(/\D/g, "").substring(0, 4);
    if (value.length > 2) value = `${value.substring(0, 2)}/${value.substring(2)}`;
    setCardData({ ...cardData, expiry: value });
  };

  const frontInterpolate = rotateAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = rotateAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.methodToggle}>
        <TouchableOpacity
          onPress={() => {
            setMethod("card");
            onComplete(null);
          }}
          style={[styles.methodBtn, method === "card" && styles.cardActive]}
        >
          <CreditCard size={24} color={method === "card" ? "#3b82f6" : "#fff"} />
          <Text style={styles.methodTitle}>Kredi Karti</Text>
          <Text style={styles.methodSub}>PCI-DSS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setMethod("cod");
            onComplete({ method: "COD", label: "Kapida Odeme" });
          }}
          style={[styles.methodBtn, method === "cod" && styles.codActive]}
        >
          <Truck size={24} color={method === "cod" ? "#22c55e" : "#fff"} />
          <Text style={styles.methodTitle}>Kapida Odeme</Text>
          <Text style={styles.methodSub}>Nakit/Kart</Text>
        </TouchableOpacity>
      </View>

      {method === "card" ? (
        <View style={styles.cardArea}>
          <View style={styles.cardVisualContainer}>
            <Animated.View style={[styles.cardSide, styles.cardFront, { transform: [{ rotateY: frontInterpolate }] }]}>
              <View style={styles.cardHeader}>
                <View style={styles.chip} />
                <Text style={styles.brandName}>NexTrade</Text>
              </View>
              <Text style={styles.cardNumberText}>{cardData.number || "•••• •••• •••• ••••"}</Text>
              <View style={styles.cardFooter}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardLabel}>KART SAHIBI</Text>
                  <Text style={styles.cardValue} numberOfLines={1}>
                    {cardData.name || "AD SOYAD"}
                  </Text>
                </View>
                <View>
                  <Text style={styles.cardLabel}>SKT</Text>
                  <Text style={styles.cardValue}>{cardData.expiry || "00/00"}</Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View style={[styles.cardSide, styles.cardBack, { transform: [{ rotateY: backInterpolate }] }]}>
              <View style={styles.magStrip} />
              <View style={styles.cvvStrip}>
                <Text style={styles.cvvText}>{cardData.cvv || "***"}</Text>
              </View>
            </Animated.View>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Kart Numarasi"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={cardData.number}
              onChangeText={handleNumberChange}
              onFocus={() => flipCard(0)}
            />
            <TextInput
              style={[styles.input, { textTransform: "uppercase" }]}
              placeholder="Kart Uzerindeki Isim"
              placeholderTextColor="#666"
              value={cardData.name}
              onChangeText={(val: string) => setCardData({ ...cardData, name: val })}
              onFocus={() => flipCard(0)}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="MM/YY"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={cardData.expiry}
                onChangeText={handleExpiryChange}
                onFocus={() => flipCard(0)}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="CVV"
                placeholderTextColor="#666"
                keyboardType="numeric"
                maxLength={3}
                value={cardData.cvv}
                onChangeText={(val: string) => setCardData({ ...cardData, cvv: val.replace(/\D/g, "") })}
                onFocus={() => flipCard(180)}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handlePaymentAction}
            disabled={!isCardValid || isProcessing}
            style={[styles.submitBtn, (!isCardValid || isProcessing) && styles.disabledBtn]}
          >
            {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>DEVAM ET</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.codContainer}>
          <ShieldCheck size={48} color="#22c55e" />
          <Text style={styles.codTitle}>Kapida Odeme Aktif</Text>
          <Text style={styles.codSub}>Teslimat aninda odeme yapabilirsiniz.</Text>
        </View>
      )}

      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backBtnText}>TESLIMAT BILGILERINE DON</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 32, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  methodToggle: { flexDirection: "row", gap: 12, marginBottom: 24 },
  methodBtn: { flex: 1, padding: 16, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", borderWidth: 2, borderColor: "transparent" },
  cardActive: { borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,0.1)" },
  codActive: { borderColor: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)" },
  methodTitle: { color: "#fff", fontSize: 12, fontWeight: "bold", marginTop: 8 },
  methodSub: { color: "#666", fontSize: 10, marginTop: 2 },
  cardArea: {},
  cardVisualContainer: { height: 180, width: "100%", marginBottom: 24 },
  cardSide: { position: "absolute", width: "100%", height: "100%", borderRadius: 20, padding: 20, backfaceVisibility: "hidden" },
  cardFront: { backgroundColor: "#312e81" },
  cardBack: { backgroundColor: "#0f172a", justifyContent: "center" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  chip: { width: 40, height: 30, backgroundColor: "#fbbf24", borderRadius: 4 },
  brandName: { color: "#fff", fontWeight: "900", fontStyle: "italic" },
  cardNumberText: { color: "#fff", fontSize: 18, letterSpacing: 2, marginBottom: 20 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  cardLabel: { color: "rgba(255,255,255,0.5)", fontSize: 8 },
  cardValue: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  magStrip: { width: "100%", height: 40, backgroundColor: "#000", position: "absolute", top: 20 },
  cvvStrip: { backgroundColor: "#fff", height: 35, marginHorizontal: 20, borderRadius: 4, justifyContent: "center", alignItems: "flex-end", paddingHorizontal: 10 },
  cvvText: { fontStyle: "italic", fontWeight: "bold" },
  form: { gap: 12 },
  input: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 14, color: "#fff", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  row: { flexDirection: "row" },
  submitBtn: { backgroundColor: "#3b82f6", padding: 18, borderRadius: 16, alignItems: "center", marginTop: 20 },
  disabledBtn: { opacity: 0.3 },
  submitBtnText: { color: "#fff", fontWeight: "900" },
  codContainer: { padding: 40, alignItems: "center", backgroundColor: "rgba(34,197,94,0.05)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(34,197,94,0.2)" },
  codTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 16 },
  codSub: { color: "#666", textAlign: "center", marginTop: 8 },
  backBtn: { marginTop: 20, padding: 10 },
  backBtnText: { color: "#666", fontSize: 10, fontWeight: "900", textAlign: "center", letterSpacing: 2 },
});

export default PaymentForm;