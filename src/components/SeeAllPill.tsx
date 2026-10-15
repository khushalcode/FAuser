/**
 * SeeAllPill — Blinkit-style "See all products ▸" pill with overlapping
 * circular thumbnails on the left. Tap navigates to the full product list.
 *
 * Dark-mode aware — default emerald tint auto-brightens in dark mode and the
 * matching shadow colour follows. White text is kept on the emerald surface
 * (works in both modes per design spec).
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';

interface Props {
  label?: string;
  /** Up to 4 image URLs used for the overlapping thumbnails. */
  thumbnails?: any[];
  /** Emoji fallbacks used when image URLs are missing. */
  emojiFallbacks?: string[];
  onPress?: () => void;
  /** Tint of the pill — defaults to emerald (adapts to dark mode). */
  tint?: string;
  /** Foreground (text) colour — defaults to white. */
  fg?: string;
}

export function SeeAllPill({
  label = 'See all products',
  thumbnails = [],
  emojiFallbacks = ['🛒', '🛍️', '🍿', '🥨'],
  onPress,
  tint,
  fg = '#fff'
}: Props) {
  const colors = useThemeColors();
  const tintClr = tint ?? colors.primary;
  const visibleThumbs = thumbnails.slice(0, 4);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        {
          backgroundColor: tintClr,
          shadowColor: tintClr,
          opacity: pressed ? 0.92 : 1
        }
      ]}
    >
      {/* Overlapping circular thumbnails */}
      <View style={styles.thumbs}>
        {visibleThumbs.concat(Array(4 - visibleThumbs.length).fill(undefined)).slice(0, 4).map((url, i) => (
          <View
            key={i}
            style={[
              styles.thumb,
              {
                marginLeft: i === 0 ? 0 : -10,
                backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.4)',
                zIndex: 4 - i
              }
            ]}
          >
            {url ? (
              <Image source={typeof url === 'string' ? { uri: url } : url} style={styles.thumbImg} contentFit="cover" />
            ) : (
              <Text style={styles.thumbEmoji}>{emojiFallbacks[i % emojiFallbacks.length]}</Text>
            )}
          </View>
        ))}
      </View>

      <Text style={[styles.label, { color: fg }]} numberOfLines={1}>{label}</Text>
      <ChevronRight size={16} color={fg} strokeWidth={2.5} />
    </Pressable>
  );
}

const THUMB = 28;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 10,
    paddingLeft: 8,
    paddingRight: 16,
    borderRadius: 999,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  thumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)'
  },
  thumbImg: {
    width: '100%',
    height: '100%'
  },
  thumbEmoji: {
    fontSize: 13
  },
  label: {
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.2
  }
});

export default SeeAllPill;
