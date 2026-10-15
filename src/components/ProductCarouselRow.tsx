/**
 * ProductCarouselRow — section with title + horizontal scrolling product
 * cards + filter chips below the row.
 *
 *   - Title + optional subtitle (e.g. "Because you bought ice cream cup")
 *   - Horizontal scrolling ProductCards (uses ProductCard)
 *   - Filter chips below the product row (e.g. "All", "Cones", "Cakes",
 *     "Sticks") — active chip has emerald border.
 *   - Tapping a chip filters the products in the row WITHOUT navigating
 *   - "See all products ▸" pill at the end of the carousel with overlapping
 *     circular thumbnails on the left (SeeAllPill)
 */
import React from 'react';
import {
  View, Text, Pressable, StyleSheet, Dimensions, FlatList
} from 'react-native';
import type { Product, Store } from '@/lib/types';
import { useThemeColors } from '@/store/theme';
import { ProductCard } from './ProductCard';
import { SeeAllPill } from './SeeAllPill';
import { SkeletonShimmer } from './SkeletonShimmer';
import { chipToTagMap } from '@/data/mock-data';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getProductImage } from '@/utils/images';

interface Props {
  title: string;
  subtitle?: string;
  emoji?: string;
  products: Product[];
  store?: Store;
  chips: string[];
  /** Title for the See all pill (default: "See all products"). */
  seeAllLabel?: string;
  onSeeAll?: () => void;
  isLoading?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function ProductCarouselRow({
  title,
  subtitle,
  emoji,
  products,
  store,
  chips,
  seeAllLabel = 'See all products',
  onSeeAll,
  isLoading = false
}: Props) {
  const router = useRouter();
  const colors = useThemeColors();
  const [activeChip, setActiveChip] = React.useState('All');

  // Filter products client-side based on the active chip's mapped tags.
  const filtered = React.useMemo(() => {
    if (activeChip === 'All') return products;
    const tags = chipToTagMap[activeChip] || [];
    if (tags.length === 0) return products;
    return products.filter((p) =>
      p.tags.some((t) => tags.includes(t))
    );
  }, [activeChip, products]);

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
        <View style={{ paddingHorizontal: 16 }}>
          <SkeletonShimmer width="100%" height={220} radius={14} />
        </View>
      ) : (
        <FlatList
          horizontal
          data={filtered}
          keyExtractor={(i) => i.id}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          ListFooterComponent={
            <View style={styles.footerPill}>
              <SeeAllPill
                label={seeAllLabel}
                thumbnails={filtered.slice(0, 4).map((p) => getProductImage(p.name))}
                emojiFallbacks={filtered.slice(0, 4).map((p) =>
                  !p.brand && p.prep_time_minutes !== undefined ? '🍽️' : '🛒'
                )}
                onPress={() =>
                  onSeeAll
                    ? onSeeAll()
                    : router.push('/search')
                }
              />
            </View>
          }
          ListEmptyComponent={
            <View style={[styles.empty, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No products in this filter.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={{ width: 160 }}>
              <ProductCard
                product={item}
                store={store}
                variant="horizontal"
                hideSeeMore
              />
            </View>
          )}
        />
      )}

      {/* Filter chips */}
      {!isLoading && chips.length > 0 && (
        <View style={styles.chipsRow}>
          {chips.map((c) => {
            const active = c === activeChip;
            return (
              <Pressable
                key={c}
                onPress={() => setActiveChip(c)}
                style={[
                  styles.chip,
                  { backgroundColor: colors.surfaceAlt },
                  active && { backgroundColor: colors.primary50 },
                  active && { borderColor: colors.primary }
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.textMuted },
                    active && { color: colors.primary, fontWeight: '700' }
                  ]}
                >
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 22
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  footerPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    minWidth: 180
  },
  empty: {
    width: 160,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginHorizontal: 4
  },
  emptyText: {
    fontSize: 11,
    textAlign: 'center',
    padding: 12
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 8,
    flexWrap: 'wrap'
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'transparent'
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600'
  }
});

export default ProductCarouselRow;
