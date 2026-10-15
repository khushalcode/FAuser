/**
 * LiveDeliveryTracker — animated card showing a live delivery progress
 * with a moving scooter icon along a dotted route. Adds delight to the
 * home screen by visualizing the "8-minute delivery" promise.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing, Platform, Dimensions } from 'react-native';
import { Bike, MapPin, Clock, ChevronRight } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function LiveDeliveryTracker() {
  const colors = useThemeColors();
  const router = useRouter();
  const scooterX = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(scooterX, {
        toValue: 1,
        duration: 3200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    loop.start();
    return () => loop.stop();
  }, [scooterX]);

  const trackPad = 12;
  const trackWidth = SCREEN_WIDTH - 32 - trackPad * 2 - 24; // padding + icon
  const scooterTranslate = scooterX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackWidth],
  });

  return (
    <Pressable
      onPress={() => router.push('/orders')}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.pulseDot, { backgroundColor: colors.primary }]} />
        <Text style={[styles.label, { color: colors.textMuted }]}>
          LIVE DELIVERY
        </Text>
        <View style={{ flex: 1 }} />
        <View style={[styles.etaPill, { backgroundColor: colors.primaryLight }]}>
          <Clock size={10} color={colors.primary} strokeWidth={3} />
          <Text style={[styles.etaText, { color: colors.primary }]}>8 min</Text>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        Biryani Blues is on the way to your home
      </Text>

      {/* Route visualization */}
      <View style={styles.routeWrap}>
        {/* Dotted line */}
        <View style={[styles.dottedLine, { borderColor: colors.border }]} />
        {/* Moving scooter */}
        <Animated.View
          style={[
            styles.scooterWrap,
            {
              transform: [{ translateX: scooterTranslate }],
            },
          ]}
        >
          <View style={[styles.scooterCircle, { backgroundColor: colors.primary }]}>
            <Bike size={14} color="#fff" strokeWidth={2.5} />
          </View>
        </Animated.View>
        {/* Start dot */}
        <View style={[styles.endDot, { backgroundColor: colors.primary, left: 0 }]} />
        {/* End pin */}
        <View style={[styles.endPinWrap, { right: 0 }]}>
          <MapPin size={16} color={colors.textMuted} strokeWidth={2.5} fill={colors.surfaceAlt} />
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={[styles.bottomText, { color: colors.textMuted }]}>
          Order #FM-2026-0014 · 2 items · ₹348
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.trackText, { color: colors.primary }]}>Track order</Text>
          <ChevronRight size={12} color={colors.primary} strokeWidth={3} />
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  etaText: {
    fontSize: 10,
    fontWeight: '800',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: -0.2,
  },
  routeWrap: {
    position: 'relative',
    height: 36,
    marginTop: 12,
    marginBottom: 8,
    justifyContent: 'center',
  },
  dottedLine: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 0,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  scooterWrap: {
    position: 'absolute',
    left: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  scooterCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  endDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
    top: '50%',
    marginTop: -5,
  },
  endPinWrap: {
    position: 'absolute',
    top: '50%',
    marginTop: -8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomText: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  trackText: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 2,
  },
});

export default LiveDeliveryTracker;
