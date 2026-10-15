/**
 * CategoryGrid — reusable 4-column grid of category tiles.
 * Used for "Grocery & Kitchen", "Snacks & Drinks" etc. on the home screen.
 *
 * Each tile: real local image + category name below. Tap → navigates to category.
 *
 * Dark-mode aware — backgrounds, text colors, tile tints all adapt.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import type { Category } from '@/lib/types';
import { useThemeColors, useIsDark } from '@/store/theme';
import { getCategoryImage } from '@/utils/images';
import { useRouter } from 'expo-router';

interface Props {
  title: string;
  subtitle?: string;
  categories: Category[];
  /** Tile background colour — defaults to mint green in light mode. */
  tileBg?: string;
  /** Optional image override keyed by slug — return a require()'d image. */
  imageFor?: (slug: string, name: string) => any | undefined;
  onSeeAll?: () => void;
  onTilePress?: (category: Category) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = 16;
const GAP = 10;
const COLS = 4;
const TILE_SIZE = (SCREEN_WIDTH - H_PAD * 2 - GAP * (COLS - 1)) / COLS;

/**
 * Map of category slug → local image require().
 * Every category now ships with a real locally-bundled image.
 */
const CATEGORY_SLUG_IMAGES: Record<string, any> = {
  // Food
  'biryani': require('../../assets/images/food/biryani.jpg'),
  'pizza': require('../../assets/images/food/pizza.jpg'),
  'burgers': require('../../assets/images/food/burger.jpg'),
  'north-indian': require('../../assets/images/food/curry.jpg'),
  'south-indian': require('../../assets/images/food/dosa.jpg'),
  'chinese': require('../../assets/images/food/noodles.jpg'),
  'desserts': require('../../assets/images/food/cake.jpg'),
  'beverages': require('../../assets/images/categories/beverages.jpg'),
  // Grocery
  'vegetables-fruits': require('../../assets/images/categories/fruits.jpg'),
  'atta-rice-dal': require('../../assets/images/categories/snacks.jpg'),
  'dairy-bread-eggs': require('../../assets/images/categories/dairy.jpg'),
  'bakery-biscuits': require('../../assets/images/categories/bakery.jpg'),
  'chips-namkeen': require('../../assets/images/categories/snacks.jpg'),
  'drinks-juices': require('../../assets/images/categories/beverages.jpg'),
  'ice-creams': require('../../assets/images/food/icecream.jpg'),
  'sweets-chocolates': require('../../assets/images/categories/sweets.jpg'),
  'chicken-meat-fish': require('../../assets/images/food/curry.jpg'),
  'oil-ghee-masala': require('../../assets/images/categories/snacks.jpg'),
  'dry-fruits': require('../../assets/images/categories/sweets.jpg'),
  'instant-food': require('../../assets/images/food/noodles.jpg'),
  'sauces-spreads': require('../../assets/images/food/salad.jpg'),
  'tea-coffee': require('../../assets/images/food/coffee.jpg'),
  'paan-corner': require('../../assets/images/categories/vegetables.jpg'),
  'frozen-foods': require('../../assets/images/categories/frozen.jpg'),
  'personal-care': require('../../assets/images/categories/dairy.jpg'),
  'household': require('../../assets/images/categories/bakery.jpg'),
  // Legacy aliases
  'fruits-vegetables': require('../../assets/images/categories/vegetables.jpg'),
  'dairy-eggs': require('../../assets/images/categories/dairy.jpg'),
  'snacks': require('../../assets/images/categories/snacks.jpg'),
  'packaged-beverages': require('../../assets/images/categories/beverages.jpg'),
};

export function CategoryGrid({
  title,
  subtitle,
  categories,
  tileBg,
  imageFor,
  onSeeAll,
  onTilePress
}: Props) {
  const router = useRouter();
  const colors = useThemeColors();
  const isDark = useIsDark();
  const defaultTileBg = isDark ? colors.surfaceAlt : '#E8F5E9';
  const bg = tileBg ?? defaultTileBg;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>
        {onSeeAll && (
          <Pressable onPress={onSeeAll} style={styles.seeAll}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
            <ChevronRight size={13} color={colors.primary} strokeWidth={2.5} />
          </Pressable>
        )}
      </View>

      <View style={styles.grid}>
        {categories.map((cat) => {
          // Pick a real local image: explicit override > slug map > name map.
          const overrideImg = imageFor?.(cat.slug, cat.name);
          const slugImg = CATEGORY_SLUG_IMAGES[cat.slug];
          const nameImg = getCategoryImage(cat.name);
          const img = overrideImg || slugImg || nameImg;
          return (
            <Pressable
              key={cat.id}
              onPress={() =>
                onTilePress
                  ? onTilePress(cat)
                  : router.push(`/search?q=${encodeURIComponent(cat.name)}`)
              }
              style={({ pressed }) => [
                styles.tile,
                {
                  backgroundColor: bg,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <View style={[styles.tileIcon, { backgroundColor: colors.surfaceElevated }]}>
                <Image
                  source={cat.icon_url ? (typeof cat.icon_url === 'string' ? { uri: cat.icon_url } : cat.icon_url) : img}
                  style={styles.tileImg}
                  contentFit="cover"
                  transition={150}
                />
              </View>
              <Text style={[styles.tileName, { color: colors.text }]} numberOfLines={2}>
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
    letterSpacing: -0.4
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center'
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
    borderRadius: (TILE_SIZE - 16) / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tileImg: {
    width: '100%',
    height: '100%'
  },
  tileName: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 12,
    minHeight: 24
  }
});

export default CategoryGrid;
