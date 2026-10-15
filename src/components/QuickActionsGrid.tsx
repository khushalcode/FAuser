/**
 * QuickActionsGrid — 4-tile quick action grid (Reorder, Wallet, Offers, Support).
 *
 * Dark-mode aware — text label adapts. Action tile background/foreground are
 * pastel accent tints (kept as theme-aware *Light tokens) with matching
 * saturated accent foregrounds.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';
import { Pressable } from '@/components/SafePressable';
import { RefreshCw, Wallet, Tag, MessageCircle } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';

interface Action {
  id: string;
  label: string;
  emoji: string;
  bg: string;
  fg: string;
  icon?: React.ReactNode;
}

interface Props {
  onPress?: (action: Action) => void;
}

export function QuickActionsGrid({ onPress }: Props) {
  const colors = useThemeColors();
  const ACTIONS: Action[] = [
    { id: 'reorder', label: 'Reorder', emoji: '🔄', bg: colors.primaryLight, fg: colors.primary },
    { id: 'wallet', label: 'Wallet', emoji: '💰', bg: colors.warningLight, fg: colors.warning },
    { id: 'offers', label: 'Offers', emoji: '🎁', bg: colors.pinkLight, fg: colors.pink },
    { id: 'help', label: 'Help', emoji: '💬', bg: colors.infoLight, fg: colors.info },
  ];

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
          <Text style={[styles.label, { color: colors.text }]}>{a.label}</Text>
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
  },
});

export default QuickActionsGrid;
