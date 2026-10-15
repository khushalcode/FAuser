/**
 * RecentlyViewedStrip — horizontal scroll of recently viewed products.
 * Each item: small product card with image, name, price.
 *
 * Dark-mode aware — card surface, border, text all adapt.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Star } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import type { Product } from '@/lib/types';
import { formatCurrency, effectivePrice } from '@/utils/format';
import { getProductImage } from '@/utils/images';

interface Props {
  products: Product[];
  onPress?: (product: Product) => void;
}

export function RecentlyViewedStrip({ products, onPress }: Props) {
  const colors = useThemeColors();
  if (products.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>👀 Recently Viewed</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Pick up where you left off
          </Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {products.map((p) => {
          const price = effectivePrice(p.price, p.discount_price);
          const isFood = !p.brand && p.prep_time_minutes !== undefined;
          return (
            <Pressable
              key={p.id}
              onPress={() => onPress?.(p)}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <View style={styles.imageWrap}>
                {getProductImage(p.name) ? (
                  <ExpoImage source={getProductImage(p.name)} style={styles.image} contentFit="cover" />
                ) : (
                  <View style={[styles.image, { backgroundColor: isFood ? colors.warningLight : colors.primaryLight, alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 28 }}>{isFood ? '🍽️' : '🛒'}</Text>
                  </View>
                )}
                <View style={[styles.ratingChip, { backgroundColor: colors.primary }]}>
                  <Star size={8} color="#fff" fill="#fff" />
                  <Text style={styles.ratingText}>{p.rating.toFixed(1)}</Text>
                </View>
              </View>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{p.name}</Text>
              <Text style={[styles.unit, { color: colors.textMuted }]} numberOfLines={1}>{p.unit}</Text>
              <Text style={[styles.price, { color: colors.text }]}>{formatCurrency(price)}</Text>
            </Pressable>
          );
        })}
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
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2 },
  scroll: { paddingHorizontal: 16, paddingBottom: 8 },
  card: {
    width: 120,
    marginRight: 10,
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 6,
  },
  image: { width: '100%', height: '100%' },
  ratingChip: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
    marginLeft: 2,
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 13,
    minHeight: 26,
  },
  unit: {
    fontSize: 9,
    marginTop: 2,
  },
  price: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
});

export default RecentlyViewedStrip;
