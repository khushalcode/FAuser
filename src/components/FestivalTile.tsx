/**
 * FestivalTile — festive banner with themed background color + 4 sub-tiles.
 *
 * Examples:
 *   - Orange-yellow for Navratri (Flowers & Pooja Needs, Fasting Essentials, Dandiya Ready, Kids Mela)
 *   - Red for Durga Pujo (Sondesh & Sweets, Pooja Thali, Flowers & Garlands, Dhak & Decor)
 *
 * Tap sub-tile → navigates to filtered products (via tag).
 */
import React from 'react';
import {
  View, Text, Pressable, StyleSheet, Dimensions
} from 'react-native';
import type { FestivalTileData } from '@/data/mock-data';
import { colors } from '@/theme/colors';
import { useRouter } from 'expo-router';

interface Props {
  tile: FestivalTileData;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = 16;

export function FestivalTile({ tile }: Props) {
  const router = useRouter();
  const [c1, c2] = tile.gradient;

  return (
    <View style={styles.section}>
      <View
        style={[
          styles.banner,
          {
            backgroundColor: c1,
            // CSS-style gradient isn't supported natively; use a layered tint.
            shadowColor: c2,
            shadowOpacity: 0.4,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4
          }
        ]}
      >
        {/* Decorative tint overlay (subtle gradient hint) */}
        <View style={[styles.overlay, { backgroundColor: c2, opacity: 0.55 }]} />

        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{tile.title}</Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {tile.subtitle}
            </Text>
          </View>
          <Text style={styles.heroEmoji}>{tile.heroEmoji}</Text>
        </View>

        <View style={styles.subTiles}>
          {tile.subTiles.map((s) => (
            <Pressable
              key={s.id}
              onPress={() =>
                s.tag
                  ? router.push(`/search?q=${encodeURIComponent(s.tag)}`)
                  : router.push('/search')
              }
              style={({ pressed }) => [
                styles.subTile,
                { opacity: pressed ? 0.85 : 1 }
              ]}
            >
              <View style={styles.subTileEmoji}>
                <Text style={styles.emoji}>{s.emoji}</Text>
              </View>
              <Text style={styles.subTileLabel} numberOfLines={2}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 22,
    paddingHorizontal: H_PAD
  },
  banner: {
    borderRadius: 18,
    padding: 14,
    overflow: 'hidden',
    position: 'relative'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: '40%',
    borderTopLeftRadius: 80,
    borderBottomLeftRadius: 80
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.2
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.92)',
    marginTop: 2
  },
  heroEmoji: {
    fontSize: 38,
    marginLeft: 8
  },
  subTiles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  subTile: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center'
  },
  subTileEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  emoji: {
    fontSize: 22
  },
  subTileLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 11
  }
});

export default FestivalTile;
