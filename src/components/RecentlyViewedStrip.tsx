/**
 * RecentlyViewedStrip — horizontal scroll of recently viewed products.
 * Each item: small product card with image, name, price.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Star } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import type { Product } from '@/lib/types';
import { formatCurrency, effectivePrice } from '@/utils/format';
import { getProductImage } from '@/utils/images';

interface Props {
  products: Product[];
  onPress?: (product: Product) => void;
}

export function RecentlyViewedStrip({ products, onPress }: Props) {
  if (products.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>👀 Recently Viewed</Text>
          <Text style={styles.subtitle}>Pick up where you left off</Text>
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
              style={styles.card}
            >
              <View style={styles.imageWrap}>
                {getProductImage(p.name) ? (
                  <ExpoImage source={getProductImage(p.name)} style={styles.image} contentFit="cover" />
                ) : (
                  <View style={[styles.image, { backgroundColor: isFood ? colors.warningLight : colors.primaryLight, alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 28 }}>{isFood ? '🍽️' : '🛒'}</Text>
                  </View>
                )}
                <View style={styles.ratingChip}>
                  <Star size={8} color="#fff" fill="#fff" />
                  <Text style={styles.ratingText}>{p.rating.toFixed(1)}</Text>
                </View>
              </View>
              <Text style={styles.name} numberOfLines={2}>{p.name}</Text>
              <Text style={styles.unit} numberOfLines={1}>{p.unit}</Text>
              <Text style={styles.price}>{formatCurrency(price)}</Text>
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
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  scroll: { paddingHorizontal: 16, paddingBottom: 8 },
  card: {
    width: 120,
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    backgroundColor: colors.primary,
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
    color: colors.text,
    lineHeight: 13,
    minHeight: 26,
  },
  unit: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  price: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
});

export default RecentlyViewedStrip;
