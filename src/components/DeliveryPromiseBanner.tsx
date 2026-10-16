/**
 * DeliveryPromiseBanner — highlights the 8-minute delivery promise with
 * an animated countdown ring and trust signals. Reassures users about
 * speed and reliability.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { Pressable } from '@/components/SafePressable';
import { Zap, Shield, Clock } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { useRouter } from 'expo-router';

export function DeliveryPromiseBanner() {
  const colors = useThemeColors();
  const router = useRouter();
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const ringScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const ringOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  return (
    <Pressable
      onPress={() => router.push('/search')}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      {/* Left: pulsing icon with ring */}
      <View style={styles.iconWrap}>
        <Animated.View
          style={[
            styles.pulseRing,
            {
              backgroundColor: colors.primary,
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
        <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
          <Zap size={22} color="#fff" fill="#fff" strokeWidth={2.2} />
        </View>
      </View>

      {/* Center: promise text */}
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.text }]}>
          Delivery in <Text style={{ color: colors.primary }}>8 minutes</Text>
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={2}>
          From cart to doorstep — fast, fresh, contactless.
        </Text>

        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
            <Clock size={9} color={colors.primary} strokeWidth={3} />
            <Text style={[styles.badgeText, { color: colors.primary }]}>8 min avg</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.infoLight }]}>
            <Shield size={9} color={colors.info} strokeWidth={2.5} />
            <Text style={[styles.badgeText, { color: colors.info }]}>100% safe</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconWrap: {
    position: 'relative',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
});

export default DeliveryPromiseBanner;
