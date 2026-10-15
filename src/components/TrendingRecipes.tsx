/**
 * TrendingRecipes — horizontal scroll of recipe idea cards.
 * Encourages users to discover new dishes by showing trending recipe
 * cards with a real food image, prep time, and a "Order ingredients" CTA.
 */
import React from 'react';
import {
  View, Text, Pressable, StyleSheet, Dimensions, FlatList
} from 'react-native';
import { Image } from 'expo-image';
import { Clock, Flame, ChevronRight } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_W = SCREEN_WIDTH * 0.62;

interface Recipe {
  id: string;
  title: string;
  image: any;
  prepTime: string;
  spiceLevel: 'Mild' | 'Medium' | 'Spicy';
  popularity: string;
}

const RECIPES: Recipe[] = [
  {
    id: 'r1',
    title: 'Paneer Butter Masala',
    image: require('../../assets/images/food/curry.jpg'),
    prepTime: '30 min',
    spiceLevel: 'Medium',
    popularity: '4.7★ · 12k cooks',
  },
  {
    id: 'r2',
    title: 'Margherita Pizza',
    image: require('../../assets/images/food/pizza.jpg'),
    prepTime: '25 min',
    spiceLevel: 'Mild',
    popularity: '4.8★ · 18k cooks',
  },
  {
    id: 'r3',
    title: 'Hakka Noodles',
    image: require('../../assets/images/food/noodles.jpg'),
    prepTime: '20 min',
    spiceLevel: 'Spicy',
    popularity: '4.5★ · 9k cooks',
  },
  {
    id: 'r4',
    title: 'Masala Dosa',
    image: require('../../assets/images/food/dosa.jpg'),
    prepTime: '40 min',
    spiceLevel: 'Medium',
    popularity: '4.9★ · 22k cooks',
  },
  {
    id: 'r5',
    title: 'Chole Bhature',
    image: require('../../assets/images/food/chole.jpg'),
    prepTime: '45 min',
    spiceLevel: 'Spicy',
    popularity: '4.6★ · 8k cooks',
  },
];

export function TrendingRecipes() {
  const colors = useThemeColors();
  const router = useRouter();

  const renderItem = ({ item, index }: { item: Recipe; index: number }) => {
    const spiceColor =
      item.spiceLevel === 'Spicy' ? colors.error :
      item.spiceLevel === 'Medium' ? colors.warning :
      colors.success;
    return (
      <Pressable
        key={item.id}
        onPress={() => router.push(`/search?q=${encodeURIComponent(item.title)}`)}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
            marginLeft: index === 0 ? 16 : 0,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <View style={styles.imageWrap}>
          <Image source={item.image} style={styles.image} contentFit="cover" transition={150} />
          <View style={[styles.spicePill, { backgroundColor: spiceColor }]}>
            <Flame size={9} color="#fff" strokeWidth={2.5} />
            <Text style={styles.spiceText}>{item.spiceLevel}</Text>
          </View>
        </View>
        <View style={styles.body}>
          <Text style={[styles.recipeTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.metaRow}>
            <Clock size={10} color={colors.textMuted} strokeWidth={2.5} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {item.prepTime}
            </Text>
            <Text style={[styles.dot, { color: colors.textSubtle }]}>·</Text>
            <Text style={[styles.metaText, { color: colors.textMuted }]} numberOfLines={1}>
              {item.popularity}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push(`/search?q=${encodeURIComponent(item.title)}`)}
            style={({ pressed }) => [
              styles.ctaBtn,
              {
                backgroundColor: colors.primaryLight,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[styles.ctaText, { color: colors.primary }]}>
              Order ingredients
            </Text>
            <ChevronRight size={11} color={colors.primary} strokeWidth={3} />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Trending recipes</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Cook tonight's dinner with these crowd favorites
          </Text>
        </View>
      </View>
      <FlatList
        horizontal
        data={RECIPES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 22,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  listContent: {
    paddingRight: 16,
  },
  card: {
    width: CARD_W,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    height: 110,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  spicePill: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  spiceText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  body: {
    padding: 10,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '500',
  },
  dot: {
    fontSize: 10,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
  },
  ctaText: {
    fontSize: 11,
    fontWeight: '800',
  },
});

export default TrendingRecipes;
