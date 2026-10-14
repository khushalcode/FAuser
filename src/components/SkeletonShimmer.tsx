import { Platform } from 'react-native';
/**
 * SkeletonShimmer — premium grey loading block with a shimmer sweep.
 * Uses the React Native Animated API (no extra deps required) so it works
 * in Expo Go out of the box.
 *
 * Two exports:
 *   - <SkeletonShimmer /> — single block (width/height/radius configurable)
 *   - <SkeletonGrid /> — a 2-column grid of product-card skeletons used by
 *     the home screen while sections are loading.
 */
import React from 'react';
import { View, Animated, Easing, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  /** Tint of the skeleton block. Defaults to a neutral grey. */
  color?: string;
}

export function SkeletonShimmer({
  width = '100%',
  height = 16,
  radius = 8,
  style,
  color
}: SkeletonProps) {
  const translateX = React.useRef(new Animated.Value(-1)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration: 1100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: Platform.OS !== 'web'
      })
    );
    loop.start();
    return () => loop.stop();
  }, [translateX]);

  return (
    <View
      style={[
        styles.wrap,
        {
          width: width as any,
          height: height as any,
          borderRadius: radius,
          backgroundColor: color || colors.surfaceAlt
        },
        style
      ]}
    >
      <Animated.View
        style={[
          styles.sweep,
          {
            transform: [
              {
                translateX: translateX.interpolate({
                  inputRange: [-1, 1],
                  outputRange: [-300, 300]
                })
              }
            ]
          }
        ]}
      />
    </View>
  );
}

/** 2-column grid of product-card skeletons — used between sections. */
export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.card}>
          <SkeletonShimmer width="100%" height={120} radius={12} />
          <SkeletonShimmer width="60%" height={10} style={{ marginTop: 8 }} />
          <SkeletonShimmer width="100%" height={10} style={{ marginTop: 6 }} />
          <SkeletonShimmer width="40%" height={10} style={{ marginTop: 6 }} />
          <View style={styles.row}>
            <SkeletonShimmer width="35%" height={14} />
            <SkeletonShimmer width={32} height={28} radius={8} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Horizontal carousel of card skeletons — used by section loaders. */
export function SkeletonRow({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.rowWrap}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.rowCard}>
          <SkeletonShimmer width={140} height={120} radius={12} />
          <SkeletonShimmer width={100} height={10} style={{ marginTop: 8 }} />
          <SkeletonShimmer width={70} height={10} style={{ marginTop: 6 }} />
          <SkeletonShimmer width={60} height={14} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  );
}

/** Bestseller-tile skeleton — 3x2 grid of square tints. */
export function SkeletonBestsellers() {
  return (
    <View style={styles.grid3}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={styles.bsTile}>
          <SkeletonShimmer width={48} height={48} radius={24} />
          <SkeletonShimmer width="70%" height={10} style={{ marginTop: 8 }} />
          <SkeletonShimmer width="50%" height={8} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    position: 'relative'
  },
  sweep: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 300,
    backgroundColor: 'rgba(255,255,255,0.45)',
    transform: [{ skewX: '-20deg' }]
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  rowWrap: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10
  },
  rowCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  grid3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10
  },
  bsTile: {
    width: '31.5%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt
  }
});

export default SkeletonShimmer;
