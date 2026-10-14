/**
 * OffersStrip — horizontal scrolling row of small offer cards (Zomato-style).
 * Each card: icon + offer title + small description.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/theme/colors';

export interface OfferItem {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  bg: string;
  fg: string;
}

const DEFAULT_OFFERS: OfferItem[] = [
  { id: 'o1', emoji: '🎉', title: '50% OFF', subtitle: 'First order · WELCOME50', bg: '#D1FADF', fg: '#027A48' },
  { id: 'o2', emoji: '🛵', title: 'FREE DEL', subtitle: 'Orders above ₹149', bg: '#DBEAFE', fg: '#1D4ED8' },
  { id: 'o3', emoji: '💰', title: '₹100 OFF', subtitle: 'Above ₹399 · SAVE100', bg: '#FEF3C7', fg: '#B45309' },
  { id: 'o4', emoji: '💳', title: '20% CB', subtitle: 'Paytm payment', bg: '#EDE9FE', fg: '#6D28D9' },
  { id: 'o5', emoji: '🔥', title: 'Weekend', subtitle: '25% off · WEEKEND25', bg: '#FCE7F3', fg: '#BE185D' },
  { id: 'o6', emoji: '⚡', title: 'Express', subtitle: '15 min delivery', bg: '#CFFAFE', fg: '#0E7490' },
];

interface Props {
  offers?: OfferItem[];
  onPress?: (offer: OfferItem) => void;
}

export function OffersStrip({ offers = DEFAULT_OFFERS, onPress }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>🎁 Offers for you</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {offers.map((o) => (
          <Pressable
            key={o.id}
            onPress={() => onPress?.(o)}
            style={[styles.card, { backgroundColor: o.bg }]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.emoji}>{o.emoji}</Text>
              <Text style={[styles.title2, { color: o.fg }]}>{o.title}</Text>
            </View>
            <Text style={[styles.subtitle2, { color: o.fg }]} numberOfLines={2}>{o.subtitle}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 22 },
  header: { paddingHorizontal: 16, marginBottom: 10 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  scroll: { paddingHorizontal: 16, paddingBottom: 8 },
  card: {
    width: 130,
    marginRight: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  emoji: { fontSize: 18, marginRight: 4 },
  title2: { fontSize: 14, fontWeight: '800' },
  subtitle2: { fontSize: 10, fontWeight: '500', opacity: 0.85 },
});

export default OffersStrip;
