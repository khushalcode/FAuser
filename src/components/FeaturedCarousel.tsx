/**
 * FeaturedCarousel — horizontal scrolling carousel of blue-bordered cards.
 *
 * Each card:
 *   - 2px solid #2196F3 border
 *   - Tag on top: "Newly Launched" / "Featured" / "Brand in Focus" (colored)
 *   - Product image + name + price inside
 *   - Next card peeks at right edge
 *
 * Smooth horizontal scroll with momentum (decelerationRate="fast").
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import type { Product } from '@/lib/types';
import { colors } from '@/theme/colors';
import { formatCurrency, effectivePrice } from '@/utils/format';
import { getProductImage } from '@/utils/images';
import { useRouter } from 'expo-router';

interface Props {
  title?: string;
  subtitle?: string;
  products: Product[];
  onSeeAll?: () => void;
  /** Override the per-card tag selection. */
  tagFor?: (p: Product) => { label: string; bg: string; fg: string };
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 158;
const PEEK = 14;

function defaultTag(p: Product): { label: string; bg: string; fg: string } {
  if (p.tags.includes('newly-launched')) {
    return { label: 'Newly Launched', bg: '#D1FADF', fg: '#027A48' };
  }
  if (p.brand) {
    return { label: 'Brand in Focus', bg: '#FEF3C7', fg: '#B45309' };
  }
  return { label: 'Featured', bg: '#DBEAFE', fg: '#1D4ED8' };
}

export function FeaturedCarousel({
  title = 'Featured This Week',
  subtitle,
  products,
  onSeeAll,
  tagFor
}: Props) {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {onSeeAll && (
          <Pressable onPress={onSeeAll} style={styles.seeAll}>
            <Text style={styles.seeAllText}>See all</Text>
            <ChevronRight size={13} color={colors.primary} strokeWidth={2.5} />
          </Pressable>
        )}
      </View>

      <FlatList
        horizontal
        data={products}
        keyExtractor={(i) => i.id}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 10}
        snapToAlignment="start"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        renderItem={({ item }) => {
          const tag = tagFor ? tagFor(item) : defaultTag(item);
          const price = effectivePrice(item.price, item.discount_price);
          return (
            <Pressable
              onPress={() => router.push(`/product/${item.id}`)}
              style={styles.card}
            >
              {/* Tag */}
              <View style={[styles.tag, { backgroundColor: tag.bg }]}>
                <Text style={[styles.tagText, { color: tag.fg }]}>
                  {tag.label}
                </Text>
              </View>

              {/* Image */}
              <View style={styles.imageWrap}>
                {getProductImage(item.name) ? (
                  <Image
                    source={getProductImage(item.name)}
                    style={styles.image}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={styles.emoji}>
                    {!item.brand && item.prep_time_minutes !== undefined ? '🍽️' : '🛒'}
                  </Text>
                )}
              </View>

              {/* Body */}
              <View style={styles.body}>
                {item.brand ? (
                  <Text style={styles.brand} numberOfLines={1}>
                    {item.brand}
                  </Text>
                ) : null}
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{formatCurrency(price)}</Text>
                  {item.discount_price ? (
                    <Text style={styles.mrp}>
                      {formatCurrency(item.price)}
                    </Text>
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        }}
      />
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
    color: colors.text,
    letterSpacing: -0.4
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700'
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2196F3',
    overflow: 'hidden',
    marginRight: 0
  },
  tag: {
    alignSelf: 'flex-start',
    margin: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3
  },
  imageWrap: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  emoji: {
    fontSize: 50
  },
  body: {
    padding: 10
  },
  brand: {
    fontSize: 9,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 1
  },
  name: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 14,
    minHeight: 28
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4
  },
  price: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '800'
  },
  mrp: {
    fontSize: 10,
    color: colors.textMuted,
    textDecorationLine: 'line-through'
  }
});

export default FeaturedCarousel;
