/**
 * StatsStrip — small horizontal strip showing app-wide stats.
 * "4.6★ rated · 2M+ orders · 15 min avg delivery"
 *
 * Dark-mode aware — card surface, border, text colours all adapt.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/store/theme';

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
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.borderLight,
        },
      ]}
    >
      {stats.map((s, i) => (
        <React.Fragment key={i}>
          <View style={styles.cell}>
            <Text style={styles.emoji}>{s.emoji}</Text>
            <Text style={[styles.value, { color: colors.text }]}>{s.value}</Text>
            <Text style={[styles.label, { color: colors.textMuted }]}>{s.label}</Text>
          </View>
          {i < stats.length - 1 && (
            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
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
  },
  label: {
    fontSize: 9,
    marginTop: 1,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 24,
  },
});

export default StatsStrip;
