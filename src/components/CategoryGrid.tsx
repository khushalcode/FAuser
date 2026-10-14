/**
 * CategoryGrid — reusable 4-column grid of mint-green category tiles.
 * Used for "Grocery & Kitchen", "Snacks & Drinks" etc. on the home screen.
 *
 * Each tile: icon/emoji + category name below. Tap → navigates to category.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import type { Category } from '@/lib/types';
import { colors } from '@/theme/colors';
import { useRouter } from 'expo-router';

interface Props {
  title: string;
  subtitle?: string;
  categories: Category[];
  /** Tile background colour — defaults to mint green (#E8F5E9). */
  tileBg?: string;
  /** Optional emoji overrides keyed by slug. */
  emojiFor?: (slug: string) => string | undefined;
  onSeeAll?: () => void;
  onTilePress?: (category: Category) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = 16;
const GAP = 10;
const COLS = 4;
const TILE_SIZE = (SCREEN_WIDTH - H_PAD * 2 - GAP * (COLS - 1)) / COLS;

const FALLBACK_EMOJIS: Record<string, string> = {
  // Food
  'biryani': '🍛',
  'pizza': '🍕',
  'burgers': '🍔',
  'north-indian': '🍽️',
  'south-indian': '🥞',
  'chinese': '🥡',
  'desserts': '🍰',
  'beverages': '🧃',
  // Grocery — spec's 15 + extras
  'vegetables-fruits': '🥬',
  'atta-rice-dal': '🌾',
  'dairy-bread-eggs': '🥛',
  'bakery-biscuits': '🍞',
  'chips-namkeen': '🍿',
  'drinks-juices': '🥤',
  'ice-creams': '🍦',
  'sweets-chocolates': '🍫',
  'chicken-meat-fish': '🍗',
  'oil-ghee-masala': '🫙',
  'dry-fruits': '🥜',
  'instant-food': '🍜',
  'sauces-spreads': '🥫',
  'tea-coffee': '☕',
  'paan-corner': '🍃',
  'frozen-foods': '🧊',
  'personal-care': '🧴',
  'household': '🧽',
  // Legacy aliases (kept for back-compat with seeded data)
  'fruits-vegetables': '🥬',
  'dairy-eggs': '🥛',
  'snacks': '🍿',
  'packaged-beverages': '🥤'
};

export function CategoryGrid({
  title,
  subtitle,
  categories,
  tileBg = '#E8F5E9',
  emojiFor,
  onSeeAll,
  onTilePress
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

      <View style={styles.grid}>
        {categories.map((cat) => {
          const emoji =
            (emojiFor && emojiFor(cat.slug)) ||
            FALLBACK_EMOJIS[cat.slug] ||
            '🛒';
          return (
            <Pressable
              key={cat.id}
              onPress={() =>
                onTilePress
                  ? onTilePress(cat)
                  : router.push(`/search?q=${encodeURIComponent(cat.name)}`)
              }
              style={[styles.tile, { backgroundColor: tileBg }]}
            >
              <View style={styles.tileIcon}>
                {cat.icon_url ? (
                  <Image source={typeof cat.icon_url === "string" ? { uri: cat.icon_url } : cat.icon_url} style={styles.tileImg} contentFit="contain" />
                ) : (
                  <Text style={styles.tileEmoji}>{emoji}</Text>
                )}
              </View>
              <Text style={styles.tileName} numberOfLines={2}>
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
    paddingHorizontal: H_PAD,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: H_PAD,
    gap: GAP
  },
  tile: {
    width: TILE_SIZE,
    marginBottom: 0,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tileIcon: {
    width: TILE_SIZE - 16,
    height: TILE_SIZE - 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tileImg: {
    width: '80%',
    height: '80%'
  },
  tileEmoji: {
    fontSize: 30
  },
  tileName: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 12,
    minHeight: 24
  }
});

export default CategoryGrid;
