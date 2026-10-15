/**
 * CashbackBanner — promotional banner for wallet cashback offer.
 *
 * Uses a fixed purple gradient — kept identical in both light/dark mode
 * per design spec (colorful banners don't switch).
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface Props {
  onPress?: () => void;
}

export function CashbackBanner({ onPress }: Props) {
  return (
    <View style={styles.outer}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}
      >
        <View style={styles.decorCircle} />
        <View style={styles.leftEmoji}>
          <Text style={styles.emoji}>💰</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>Get up to ₹200 cashback</Text>
          <Text style={styles.subtitle}>Pay via Paytm & get cashback on orders above ₹499</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>USE CODE:</Text>
            <Text style={styles.code}>PAYTM200</Text>
          </View>
        </View>
        <View style={styles.ctaBtn}>
          <Text style={styles.ctaText}>Apply</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { paddingHorizontal: 16 },
  card: {
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  decorCircle: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  leftEmoji: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  emoji: { fontSize: 22 },
  body: { flex: 1 },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  codeLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginRight: 6,
  },
  code: {
    fontSize: 11,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ctaBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 10,
  },
  ctaText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '800',
  },
});

export default CashbackBanner;
