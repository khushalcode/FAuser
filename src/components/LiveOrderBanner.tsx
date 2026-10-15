import { Platform } from 'react-native';
/**
 * LiveOrderBanner — shows a live order status banner at the top of home screen.
 * "Your order from Biryani Blues is on the way — Arriving in 8 mins"
 *
 * The card uses a fixed dark slate background by design (an attention-grabbing
 * live-status card) — kept identical in both light and dark mode so the white
 * text remains legible. Only the brand-emerald accents adapt to the theme.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { useThemeColors } from '@/store/theme';

interface Props {
  storeName: string;
  etaMins: number;
  status: 'preparing' | 'on_the_way' | 'arrived';
  onPress?: () => void;
}

export function LiveOrderBanner({ storeName, etaMins, status, onPress }: Props) {
  const colors = useThemeColors();
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();
  }, []);

  const statusText =
    status === 'preparing' ? `Preparing your order at ${storeName}` :
    status === 'on_the_way' ? `Arriving in ${etaMins} mins from ${storeName}` :
    `${storeName} order delivered!`;

  const emoji = status === 'preparing' ? '👨‍🍳' : status === 'on_the_way' ? '🛵' : '🎉';

  return (
    <View style={styles.outer}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}
      >
        <View style={[styles.leftStrip, { backgroundColor: colors.primary }]}>
          <Animated.View
            style={[
              styles.pulseDot,
              {
                backgroundColor: colors.primary,
                opacity: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 1],
                }),
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.3],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
        <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={[styles.liveLabel, { color: colors.primary }]}>LIVE ORDER</Text>
            <Text style={[styles.statusDot, { color: colors.primary }]}>●</Text>
          </View>
          <Text style={styles.statusText} numberOfLines={1}>{statusText}</Text>
          <View style={styles.ctaRow}>
            <Text style={[styles.ctaText, { color: colors.primary }]}>Track order</Text>
            <Text style={[styles.arrow, { color: colors.primary }]}>→</Text>
          </View>
        </View>
        <View style={styles.etaWrap}>
          <Text style={styles.etaNumber}>{etaMins}</Text>
          <Text style={styles.etaLabel}>min</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { paddingHorizontal: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101828',
    borderRadius: 16,
    paddingVertical: 12,
    paddingRight: 14,
    paddingLeft: 0,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  leftStrip: {
    width: 4,
    height: 50,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginRight: 10,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 21,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  emoji: { fontSize: 22 },
  body: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  liveLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusDot: {
    fontSize: 10,
    marginLeft: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  ctaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ctaText: {
    fontSize: 11,
    fontWeight: '700',
  },
  arrow: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  etaWrap: { alignItems: 'center', marginLeft: 10 },
  etaNumber: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  etaLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    marginTop: -2,
  },
});

export default LiveOrderBanner;
