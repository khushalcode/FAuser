/**
 * BestsellersGrid — 3×2 grid of category tiles with 2-image collages.
 *
 * Each tile:
 *   - 2 product images overlapping at an angle (collage)
 *   - "+N more" badge at bottom of the tile
 *   - Category name at top
 *   - Tap → navigates to category products page
 *
 * Section title: "Bestsellers" with "See all ▸" on the right.
 *
 * Dark-mode aware — section header text + "See all" CTA adapt. Tile tint
 * backgrounds are pastel category colours (kept identical in both modes
 * per design spec) so the tile title + "+N more" badge stay a fixed dark
 * ink for legibility against the always-light pastel surfaces.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import type { BestsellerTile } from '@/data/mock-data';
import { useThemeColors } from '@/store/theme';
import { useRouter } from 'expo-router';

interface Props {
  tiles: BestsellerTile[];
  onSeeAll?: () => void;
  onTilePress?: (tile: BestsellerTile) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_GAP = 10;
const H_PAD = 16;
const TILE_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - TILE_GAP * 2) / 3;

/** Dark ink — tiles are always pastel, so text stays dark in both modes. */
const INK_ON_PASTEL = '#101828';

export function BestsellersGrid({ tiles, onSeeAll, onTilePress }: Props) {
  const router = useRouter();
  const colors = useThemeColors();
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Bestsellers</Text>
        {onSeeAll && (
          <Pressable onPress={onSeeAll} style={styles.seeAll}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
            <ChevronRight size={13} color={colors.primary} strokeWidth={2.5} />
          </Pressable>
        )}
      </View>

      <View style={styles.grid}>
        {tiles.map((tile) => (
          <Pressable
            key={tile.id}
            onPress={() =>
              onTilePress
                ? onTilePress(tile)
                : router.push(`/search?q=${encodeURIComponent(tile.title)}`)
            }
            style={[styles.tile, { backgroundColor: tile.tint }]}
          >
            {/* Title pinned at top */}
            <Text style={[styles.tileTitle, { color: INK_ON_PASTEL }]} numberOfLines={2}>
              {tile.title}
            </Text>

            {/* 2-image collage */}
            <View style={styles.collage}>
              <View style={[styles.collageImg, styles.collageLeft]}>
                {tile.images[0] ? (
                  <Image source={typeof tile.images[0] === "string" ? { uri: tile.images[0] } : tile.images[0]} style={styles.img} contentFit="cover" />
                ) : (
                  <Text style={styles.emoji}>{tile.emojis[0]}</Text>
                )}
              </View>
              <View style={[styles.collageImg, styles.collageRight]}>
                {tile.images[1] ? (
                  <Image source={typeof tile.images[1] === "string" ? { uri: tile.images[1] } : tile.images[1]} style={styles.img} contentFit="cover" />
                ) : (
                  <Text style={styles.emoji}>{tile.emojis[1]}</Text>
                )}
              </View>
            </View>

            {/* +N more badge */}
            <View style={styles.moreBadge}>
              <Text style={[styles.moreText, { color: INK_ON_PASTEL }]}>
                +{tile.moreCount} more
              </Text>
            </View>
          </Pressable>
        ))}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    marginBottom: 12
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4
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
    gap: TILE_GAP
  },
  tile: {
    width: TILE_WIDTH,
    aspectRatio: 0.95,
    borderRadius: 14,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden'
  },
  tileTitle: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 13,
    minHeight: 26
  },
  collage: {
    width: '100%',
    height: TILE_WIDTH - 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  collageImg: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2
  },
  collageLeft: {
    transform: [{ rotate: '-12deg' }, { translateX: -10 }]
  },
  collageRight: {
    transform: [{ rotate: '12deg' }, { translateX: 10 }]
  },
  img: {
    width: '100%',
    height: '100%'
  },
  emoji: {
    fontSize: 22
  },
  moreBadge: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1
  },
  moreText: {
    fontSize: 9,
    fontWeight: '700'
  }
});

export default BestsellersGrid;
