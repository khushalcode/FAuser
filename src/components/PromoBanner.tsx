/**
 * PromoBanner — full-width promotional banner with title, subtitle and
 * "Shop now" button. Can also be a brand ad.
 *
 * Layout:
 *   - Background: themed gradient colour + large illustrative emoji
 *   - Title (bold) + subtitle
 *   - "Shop now" pill button (emerald when default)
 *   - Brand label visible when brand is supplied (e.g. "Kellogg's")
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import type { PromoBannerData } from '@/data/mock-data';
import { colors } from '@/theme/colors';
import { useRouter } from 'expo-router';

interface Props {
  banner: PromoBannerData;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function PromoBanner({ banner }: Props) {
  const router = useRouter();
  const [c1, c2] = banner.gradient;

  return (
    <View style={styles.section}>
      <Pressable
        onPress={() =>
          banner.tag
            ? router.push(`/search?q=${encodeURIComponent(banner.tag)}`)
            : router.push('/search')
        }
        style={({ pressed }) => [
          styles.banner,
          {
            backgroundColor: c1,
            shadowColor: c2,
            shadowOpacity: 0.35,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
            opacity: pressed ? 0.92 : 1
          }
        ]}
      >
        {/* Decorative tint overlay (gradient hint) */}
        <View style={[styles.overlay, { backgroundColor: c2, opacity: 0.55 }]} />

        <View style={styles.content}>
          <View style={{ flex: 1 }}>
            {banner.brand ? (
              <View style={styles.brandBadge}>
                <Text style={styles.brandText}>{banner.brand}</Text>
              </View>
            ) : null}
            <Text style={styles.title} numberOfLines={2}>
              {banner.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {banner.subtitle}
            </Text>
            <View style={styles.ctaBtn}>
              <Text style={styles.ctaText}>{banner.ctaText}</Text>
            </View>
          </View>
          <Text style={styles.heroEmoji}>{banner.heroEmoji}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 22,
    paddingHorizontal: 16
  },
  banner: {
    borderRadius: 18,
    padding: 16,
    overflow: 'hidden',
    position: 'relative'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: '50%',
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  brandBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    marginBottom: 6
  },
  brandText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.4,
    textTransform: 'uppercase'
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.3,
    lineHeight: 22
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.92)',
    marginTop: 4
  },
  ctaBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    marginTop: 10
  },
  ctaText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '800',
    letterSpacing: 0.3
  },
  heroEmoji: {
    fontSize: 56,
    marginLeft: 12
  }
});

export default PromoBanner;
