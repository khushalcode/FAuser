/**
 * ProductGridSection — section title + 2-column grid of ProductCards.
 *
 * Layout:
 *   - Section title (e.g. "Stock up on crunchy snacks") on the left
 *   - "See all ▸" on the right of the title
 *   - 2-column grid of premium ProductCards
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import type { Product, Store } from '@/lib/types';
import { useThemeColors } from '@/store/theme';
import { ProductCard } from './ProductCard';
import { SkeletonShimmer } from './SkeletonShimmer';
import { useRouter } from 'expo-router';

interface Props {
  title: string;
  subtitle?: string;
  emoji?: string;
  products: Product[];
  store?: Store;
  /** How many products to render in the grid (default 6). */
  limit?: number;
  onSeeAll?: () => void;
  isLoading?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function ProductGridSection({
  title,
  subtitle,
  emoji,
  products,
  store,
  limit = 6,
  onSeeAll,
  isLoading = false
}: Props) {
  const router = useRouter();
  const colors = useThemeColors();
  const items = products.slice(0, limit);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {emoji ? `${emoji}  ` : ''}{title}
          </Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        {onSeeAll && (
          <Pressable onPress={onSeeAll} style={styles.seeAll}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
            <ChevronRight size={13} color={colors.primary} strokeWidth={2.5} />
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={styles.grid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <SkeletonShimmer width="100%" height={120} radius={12} />
              <SkeletonShimmer width="60%" height={10} style={{ marginTop: 8 }} />
              <SkeletonShimmer width="100%" height={10} style={{ marginTop: 6 }} />
              <SkeletonShimmer width="40%" height={10} style={{ marginTop: 6 }} />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.grid}>
          {items.map((p) => (
            <View key={p.id} style={styles.cell}>
              <ProductCard product={p} store={store} variant="grid" />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const H_PAD = 16;
const GAP = 10;

const styles = StyleSheet.create({
  section: {
    marginTop: 22
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    marginBottom: 12
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
    lineHeight: 22
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 2
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: H_PAD,
    gap: GAP
  },
  cell: {
    width: (SCREEN_WIDTH - H_PAD * 2 - GAP) / 2
  },
  skeletonCard: {
    width: (SCREEN_WIDTH - H_PAD * 2 - GAP) / 2,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1
  }
});

export default ProductGridSection;
