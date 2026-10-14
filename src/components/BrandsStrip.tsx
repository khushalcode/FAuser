/**
 * BrandsStrip — horizontal scrolling row of brand logos (Blinkit-style).
 * Each brand shows: colored circle + brand name + offer badge.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/theme/colors';

export interface BrandItem {
  id: string;
  name: string;
  emoji: string;
  color: string;
  offer?: string;
}

const DEFAULT_BRANDS: BrandItem[] = [
  { id: 'b1', name: 'Amul', emoji: '🥛', color: '#3B82F6', offer: '20% OFF' },
  { id: 'b2', name: 'Nestle', emoji: '🍫', color: '#A855F7', offer: 'Buy 2 Get 1' },
  { id: 'b3', name: 'Haldiram', emoji: '🍿', color: '#F04438', offer: '15% OFF' },
  { id: 'b4', name: 'Britannia', emoji: '🍞', color: '#F59E0B', offer: '₹10 OFF' },
  { id: 'b5', name: 'Maggi', emoji: '🍜', color: '#12B76A', offer: 'Combo' },
  { id: 'b6', name: 'Coca-Cola', emoji: '🥤', color: '#DC2626', offer: 'Pack of 6' },
  { id: 'b7', name: 'Cadbury', emoji: '🍬', color: '#8B5CF6', offer: '20% OFF' },
  { id: 'b8', name: 'Parle', emoji: '🍪', color: '#06B6D4', offer: '₹5 OFF' },
];

interface Props {
  brands?: BrandItem[];
  onPress?: (brand: BrandItem) => void;
}

export function BrandsStrip({ brands = DEFAULT_BRANDS, onPress }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🏛️ Top Brands</Text>
          <Text style={styles.subtitle}>Shop from your favourite brands</Text>
        </View>
        <Pressable onPress={() => onPress?.(brands[0])}>
          <Text style={styles.seeAll}>See all →</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {brands.map((b) => (
          <Pressable
            key={b.id}
            onPress={() => onPress?.(b)}
            style={styles.brandCard}
          >
            <View style={[styles.brandCircle, { backgroundColor: b.color + '22' }]}>
              <Text style={styles.brandEmoji}>{b.emoji}</Text>
            </View>
            <Text style={styles.brandName} numberOfLines={1}>{b.name}</Text>
            {b.offer && (
              <View style={[styles.offerBadge, { backgroundColor: b.color }]}>
                <Text style={styles.offerText}>{b.offer}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 22 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  seeAll: { fontSize: 12, fontWeight: '600', color: colors.primary },
  scroll: { paddingHorizontal: 16, paddingBottom: 8 },
  brandCard: {
    alignItems: 'center',
    marginRight: 14,
    width: 76,
  },
  brandCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  brandEmoji: { fontSize: 28 },
  brandName: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  offerBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  offerText: { fontSize: 9, fontWeight: '700', color: '#fff' },
});

export default BrandsStrip;
