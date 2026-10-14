/**
 * QuickActionsGrid — 4-tile quick action grid (Reorder, Wallet, Offers, Support).
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { RefreshCw, Wallet, Tag, MessageCircle } from 'lucide-react-native';
import { colors } from '@/theme/colors';

interface Action {
  id: string;
  label: string;
  emoji: string;
  bg: string;
  fg: string;
  icon?: React.ReactNode;
}

const ACTIONS: Action[] = [
  { id: 'reorder', label: 'Reorder', emoji: '🔄', bg: colors.primaryLight, fg: colors.primary },
  { id: 'wallet', label: 'Wallet', emoji: '💰', bg: colors.warningLight, fg: colors.warning },
  { id: 'offers', label: 'Offers', emoji: '🎁', bg: '#FCE7F3', fg: '#BE185D' },
  { id: 'help', label: 'Help', emoji: '💬', bg: colors.infoLight, fg: colors.info },
];

interface Props {
  onPress?: (action: Action) => void;
}

export function QuickActionsGrid({ onPress }: Props) {
  return (
    <View style={styles.wrap}>
      {ACTIONS.map((a) => (
        <Pressable
          key={a.id}
          onPress={() => onPress?.(a)}
          style={({ pressed }) => [styles.cell, pressed && { opacity: 0.85 }]}
        >
          <View style={[styles.iconWrap, { backgroundColor: a.bg }]}>
            <Text style={styles.emoji}>{a.emoji}</Text>
          </View>
          <Text style={styles.label}>{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  cell: {
    alignItems: 'center',
    width: '23%',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  emoji: { fontSize: 24 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
});

export default QuickActionsGrid;
