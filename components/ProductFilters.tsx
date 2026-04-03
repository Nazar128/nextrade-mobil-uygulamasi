"use client";
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, StyleSheet, Dimensions, Platform } from 'react-native';
import { SlidersHorizontal, Check, Percent, Box, Star, X } from 'lucide-react-native';

interface FiltersProps {
  filters: { brands: string[]; genders: string[]; };
  state: any;
  setState: any;
  resetFilters: () => void;
}

export const ProductFilters = ({ filters, state, setState, resetFilters }: FiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const [tempBrands, setTempBrands] = useState<string[]>(state.selectedBrands);
  const [tempGenders, setTempGenders] = useState<string[]>(state.selectedGenders);
  const [tempMinPrice, setTempMinPrice] = useState(state.minPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState(state.maxPrice);
  const [tempInStock, setTempInStock] = useState(state.onlyInStock);
  const [tempDiscounted, setTempDiscounted] = useState(state.onlyDiscounted);
  const [tempRating, setTempRating] = useState(state.minRating);

  useEffect(() => {
    if (isOpen) {
      setTempBrands(state.selectedBrands);
      setTempGenders(state.selectedGenders);
      setTempMinPrice(state.minPrice);
      setTempMaxPrice(state.maxPrice);
      setTempInStock(state.onlyInStock);
      setTempDiscounted(state.onlyDiscounted);
      setTempRating(state.minRating);
    }
  }, [isOpen]);

  const handleApply = () => {
    setState.setOnlyInStock(tempInStock);
    setState.setOnlyDiscounted(tempDiscounted);
    setState.setMinPrice(tempMinPrice);
    setState.setMaxPrice(tempMaxPrice);
    setState.setMinRating(tempRating);

    if (JSON.stringify(tempBrands) !== JSON.stringify(state.selectedBrands)) {
        state.selectedBrands.forEach((b: string) => setState.setSelectedBrands(b));
        tempBrands.forEach((b: string) => setState.setSelectedBrands(b));
    }

    if (JSON.stringify(tempGenders) !== JSON.stringify(state.selectedGenders)) {
        state.selectedGenders.forEach((g: string) => setState.setSelectedGenders(g));
        tempGenders.forEach((g: string) => setState.setSelectedGenders(g));
    }

    setIsOpen(false);
  };

  const toggleTempBrand = (brand: string) => {
    setTempBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const toggleTempGender = (gender: string) => {
    setTempGenders(prev => prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.openButton} onPress={() => setIsOpen(true)}>
        <SlidersHorizontal size={18} color="#FFF" />
        <Text style={styles.openButtonText}>Filtreleri Gör</Text>
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}><SlidersHorizontal size={16} color="#3b82f6" /><Text style={styles.headerTitle}>FİLTRELER</Text></View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={resetFilters}><Text style={styles.resetText}>TEMİZLE</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeIcon}><X size={24} color="#FFF" /></TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
            <View style={styles.quickFilters}>
              <TouchableOpacity style={styles.switchRow} onPress={() => setTempInStock(!tempInStock)}>
                <View style={styles.switchLabelRow}><Box size={14} color="#3b82f6" /><Text style={styles.switchLabel}>STOKTAKİLER</Text></View>
                <View style={[styles.checkbox, tempInStock && styles.checkboxActive]}>{tempInStock && <Check size={12} color="#FFF" strokeWidth={4} />}</View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.switchRow} onPress={() => setTempDiscounted(!tempDiscounted)}>
                <View style={styles.switchLabelRow}><Percent size={14} color="#3b82f6" /><Text style={styles.switchLabel}>İNDİRİMLİ</Text></View>
                <View style={[styles.checkbox, tempDiscounted && styles.checkboxActive]}>{tempDiscounted && <Check size={12} color="#FFF" strokeWidth={4} />}</View>
              </TouchableOpacity>
            </View>

            <FilterSection title="Fiyat Aralığı (₺)">
              <View style={styles.priceInputRow}>
                <TextInput style={styles.priceInput} placeholder="Min" placeholderTextColor="#475569" keyboardType="numeric" value={tempMinPrice} onChangeText={setTempMinPrice} />
                <View style={styles.priceDivider} />
                <TextInput style={styles.priceInput} placeholder="Max" placeholderTextColor="#475569" keyboardType="numeric" value={tempMaxPrice} onChangeText={setTempMaxPrice} />
              </View>
            </FilterSection>

            {filters.brands?.length > 0 && (
              <FilterSection title="Markalar">
                <View style={styles.brandList}>
                  {filters.brands.map((brand) => (
                    <TouchableOpacity key={brand} style={styles.brandItem} onPress={() => toggleTempBrand(brand)}>
                      <View style={[styles.squareCheck, tempBrands.includes(brand) && styles.squareCheckActive]}>{tempBrands.includes(brand) && <Check size={12} color="#FFF" strokeWidth={4} />}</View>
                      <Text style={[styles.brandText, tempBrands.includes(brand) && styles.textWhite]}>{brand}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </FilterSection>
            )}

            <FilterSection title="Cinsiyet">
              <View style={styles.badgeRow}>
                {filters.genders.map((g) => (
                  <TouchableOpacity key={g} onPress={() => toggleTempGender(g)} style={[styles.badge, tempGenders.includes(g) && styles.badgeActive]}>
                    <Text style={[styles.badgeText, tempGenders.includes(g) && styles.textWhite]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FilterSection>

            <FilterSection title="Minimum Puan">
              <View style={styles.ratingRow}>
                {[3, 4, 4.5].map((r) => (
                  <TouchableOpacity key={r} onPress={() => setTempRating(tempRating === r ? 0 : r)} style={[styles.ratingButton, tempRating === r && styles.ratingButtonActive]}>
                    <Text style={[styles.ratingButtonText, tempRating === r && styles.textWhite]}>{r}+</Text>
                    <Star size={10} color={tempRating === r ? "#FFF" : "#64748b"} fill={tempRating === r ? "#FFF" : "transparent"} />
                  </TouchableOpacity>
                ))}
              </View>
            </FilterSection>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Sonuçları Uygula</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const FilterSection = ({ title, children }: any) => (
  <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>
);

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 16 },
  openButton: { backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 8 },
  openButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalContainer: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingTop: Platform.OS === 'ios' ? 60 : 20 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  resetText: { color: '#64748b', fontSize: 10, fontWeight: 'bold', textDecorationLine: 'underline' },
  closeIcon: { padding: 4 },
  scrollContent: { flex: 1 },
  scrollInner: { padding: 20, paddingBottom: 40 },
  quickFilters: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 16, gap: 16, marginBottom: 32 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '900' },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  section: { marginBottom: 32, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 24 },
  sectionTitle: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' },
  priceInputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  priceInput: { flex: 1, backgroundColor: '#0f172a', borderRadius: 12, padding: 12, color: '#FFF', fontSize: 14, fontWeight: 'bold', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  priceDivider: { width: 10, height: 1, backgroundColor: '#1e293b' },
  brandList: { gap: 12 },
  brandItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  squareCheck: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  squareCheckActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  brandText: { color: '#64748b', fontSize: 14, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  badgeActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  badgeText: { color: '#94a3b8', fontSize: 12, fontWeight: '900' },
  ratingRow: { flexDirection: 'row', gap: 8 },
  ratingButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 12, borderRadius: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  ratingButtonActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  ratingButtonText: { color: '#64748b', fontSize: 12, fontWeight: '900' },
  footer: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  applyButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 16, alignItems: 'center' },
  applyButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  textWhite: { color: '#FFF' }
});