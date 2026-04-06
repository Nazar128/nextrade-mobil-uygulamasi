"use client";
import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Star, ShoppingCart, Check, ArrowRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface ProductDetailProps {
  product: any;
}

const ProductDetail = ({ product }: ProductDetailProps) => {
  const router = useRouter();
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const addToCart = async () => {
    try {
      const existingCart = await AsyncStorage.getItem('cart');
      let cart = existingCart ? JSON.parse(existingCart) : [];

      const existingIndex = cart.findIndex((item: any) => item.id === product.id);

      if (existingIndex !== -1) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));

      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={{ width: '100%' }}>
      <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
        <View style={{ width: '100%', aspectRatio: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={{ uri: product.imageUrl || "https://via.placeholder.com/600" }}
            style={{ width: '90%', height: '90%', resizeMode: 'contain' }}
          />
          {product.status === "approved" && (
            <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: '#16a34a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 }}>
              <Text style={{ color: '#fff', fontSize: 8, fontWeight: '900' }}>ONAYLI</Text>
            </View>
          )}
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={{ color: '#60a5fa', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' }}>{product.brand}</Text>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>{product.title}</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(250,204,21,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(250,204,21,0.2)' }}>
              <Star size={14} color="#facc15" fill="#facc15" />
              <Text style={{ color: '#facc15', marginLeft: 6, fontWeight: '700', fontSize: 14 }}>{product.rating || 5}</Text>
            </View>
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>{product.salesCount || 0}+ Satış</Text>
          </View>

          <Text style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 20, marginTop: 16 }} numberOfLines={3}>
            {product.description}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 20, gap: 10 }}>
            <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800' }}>₺{Number(product.price).toLocaleString('tr-TR')}</Text>
            {product.oldPrice && (
              <Text style={{ color: '#64748b', fontSize: 18, textDecorationLine: 'underline' }}>
                ₺{Number(product.oldPrice).toLocaleString('tr-TR')}
              </Text>
            )}
          </View>

          <View style={{ marginTop: 24, gap: 12 }}>
            <TouchableOpacity 
              onPress={addToCart} 
              style={{ 
                backgroundColor: added ? '#16a34a' : '#2563eb', 
                height: 56, 
                borderRadius: 16, 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 10 
              }}
            >
              {added ? <Check size={20} color="#fff" /> : <ShoppingCart size={20} color="#fff" />}
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                {added ? 'Eklendi' : 'Sepete Ekle'}
              </Text>
            </TouchableOpacity>

            {added && (
              <TouchableOpacity 
                onPress={() => router.push("/(tabs)/shoppingCart")} 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  height: 56, 
                  borderRadius: 16, 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)'
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Sepete Git</Text>
                <ArrowRight size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={{ marginTop: 24, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Teknik Detaylar</Text>
        <DetailRow label="Kategori" value={product.category} />
        <DetailRow label="Cinsiyet" value={product.gender} />
        <DetailRow label="Stok" value={product.inStock ? `${product.stock} Adet` : "Tükendi"} />
      </View>
    </View>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
    <Text style={{ color: '#64748b', fontSize: 14 }}>{label}</Text>
    <Text style={{ color: '#e2e8f0', fontSize: 14, fontWeight: '500' }}>{value}</Text>
  </View>
);

export default ProductDetail;