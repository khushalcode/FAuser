/**
 * StatsStrip — small horizontal strip showing app-wide stats.
 * "4.6★ rated · 2M+ orders · 15 min avg delivery"
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

interface Props {
  stats?: { label: string; value: string; emoji?: string }[];
}

const DEFAULT_STATS = [
  { label: 'Rating', value: '4.6★', emoji: '⭐' },
  { label: 'Orders', value: '2M+', emoji: '📦' },
  { label: 'Delivery', value: '15 min', emoji: '⚡' },
  { label: 'Cities', value: '500+', emoji: '📍' },
];

export function StatsStrip({ stats = DEFAULT_STATS }: Props) {
  return (
    <View style={styles.wrap}>
      {stats.map((s, i) => (
        <React.Fragment key={i}>
          <View style={styles.cell}>
            <Text style={styles.emoji}>{s.emoji}</Text>
            <Text style={styles.value}>{s.value}</Text>
            <Text style={styles.label}>{s.label}</Text>
          </View>
          {i < stats.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  emoji: { fontSize: 14, marginBottom: 2 },
  value: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  label: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.borderLight,
  },
});

export default StatsStrip;
