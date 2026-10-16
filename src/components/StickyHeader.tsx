/**
 * StickyHeader — collapsible header for the home screen.
 *
 * States:
 *   - EXPANDED (scrollY ≈ 0): brand wordmark + delivery location + wallet
 *     + profile avatar + "8 mins" delivery badge + rotating search bar
 *   - COLLAPSED (scrollY > 90): only search bar (collapsed placeholder) +
 *     tab row stay pinned
 *
 * Animations:
 *   - Smooth height shrink on scroll (interpolated from scrollY)
 *   - Search placeholder changes from rotating → "Search for atta, dal,
 *     coke and more" when collapsed
 *   - Fade/scale of the brand row as header collapses
 */
import React from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated, Switch, ScrollView
} from 'react-native';
import { Image } from 'expo-image';
import { MapPin, ChevronDown, Wallet, Bell, LayoutGrid } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { SearchBar } from './SearchBar';
import type { TabItem } from './TabRow';
import { useUserStore } from '@/store/user';
import { useAuthStore } from '@/store/auth';
import { formatCurrency } from '@/utils/format';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  scrollY: Animated.Value;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  /** Per-tab header tint (top colour). Can be a plain string OR an
   *  Animated.Interpolation for smooth colour blend on tab switch. */
  headerTint: Animated.Value | any | string;
  /** Per-tab accent (used for the wallet / location dot). */
  accent?: string;
  deliveryMinutes?: number;
  defaultAddressLabel?: string;
  walletBalance?: number;
  onWalletPress?: () => void;
  onProfilePress?: () => void;
  onBellPress?: () => void;
  onAddressPress?: () => void;
  /** Reports the real rendered height so the screen can offset its content. */
  onHeightChange?: (h: number) => void;
}

export function StickyHeader({
  scrollY,
  tabs,
  activeTab,
  onTabChange,
  headerTint,
  accent,
  deliveryMinutes = 8,
  defaultAddressLabel = 'Home',
  walletBalance,
  onWalletPress,
  onProfilePress,
  onBellPress,
  onAddressPress,
  onHeightChange
}: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const wa = useUserStore((s) => s.walletBalance);
  const balance = walletBalance ?? wa ?? 0;
  const colors = useThemeColors();

  // 0 = expanded, 1 = collapsed
  const collapse = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  const brandOpacity = collapse.interpolate({
    inputRange: [0, 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });
  const brandTranslateY = collapse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -16],
    extrapolate: 'clamp'
  });

  const [veg, setVeg] = React.useState(false);

  return (
    <Animated.View
      onLayout={(e) => onHeightChange?.(Math.ceil(e.nativeEvent.layout.height))}
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + 4,
          backgroundColor: colors.background,
          shadowOpacity: collapse.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.25],
            extrapolate: 'clamp'
          })
        }
      ]}
    >
      {/* Top row — location pill + wallet + bell + avatar */}
      <Animated.View
        style={[
          styles.topRow,
          { opacity: brandOpacity, transform: [{ translateY: brandTranslateY }] }
        ]}
      >
        <Pressable
          onPress={onAddressPress}
          style={styles.locBlock}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={[styles.locIcon, { backgroundColor: colors.primaryLight }]}>
            <MapPin size={15} color={colors.primary} strokeWidth={2.4} />
          </View>
          <View style={{ flexShrink: 1 }}>
            <View style={styles.locTitleRow}>
              <Text style={[styles.locTitle, { color: colors.text }]} numberOfLines={1}>
                {defaultAddressLabel}
              </Text>
              <ChevronDown size={14} color={colors.text} />
            </View>
            <Text style={[styles.locSub, { color: colors.textMuted }]} numberOfLines={1}>
              {deliveryMinutes} mins · Food Munch
            </Text>
          </View>
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            onPress={onWalletPress || (() => router.push('/wallet'))}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          >
            <Wallet size={17} color={colors.text} strokeWidth={2.1} />
            {balance > 0 && (
              <View style={[styles.walletPill, { backgroundColor: colors.primary }]}>
                <Text style={styles.walletPillText}>{formatCurrency(balance, false)}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={onBellPress || (() => router.push('/notifications'))}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          >
            <Bell size={17} color={colors.text} strokeWidth={2.1} />
            <View style={[styles.bellDot, { backgroundColor: colors.primary, borderColor: colors.surfaceAlt }]} />
          </Pressable>
          <Pressable
            onPress={onProfilePress || (() => router.push('/(tabs)/profile'))}
            style={[styles.avatarBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.avatarText}>
              {(user?.full_name?.[0] || 'G').toUpperCase()}
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Search + VEG toggle */}
      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
          <SearchBar readOnly rotating collapsed={false} />
        </View>
        <View style={[styles.vegBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <View style={styles.vegLabelRow}>
            <View style={styles.vegDot} />
            <Text style={[styles.vegLabel, { color: colors.text }]}>VEG</Text>
          </View>
          <Switch
            value={veg}
            onValueChange={setVeg}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
            style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }], marginVertical: -6 }}
          />
        </View>
      </View>

      {/* Round chip row (replaces underline tabs) */}
      <View style={styles.chipRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
        >
          {tabs.map((t) => {
            const active = t.key === activeTab;
            const img = TAB_IMAGES[t.key];
            return (
              <Pressable key={t.key} onPress={() => onTabChange(t.key)} style={styles.chip}>
                <View
                  style={[
                    styles.chipCircle,
                    {
                      backgroundColor: colors.surfaceAlt,
                      borderColor: active ? colors.primary : colors.border,
                      borderWidth: active ? 2 : 1
                    }
                  ]}
                >
                  {img ? (
                    <Image source={img} style={styles.chipImg} contentFit="cover" />
                  ) : (
                    <LayoutGrid size={20} color={active ? colors.primary : colors.textMuted} />
                  )}
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.chipLabel,
                    {
                      color: active ? colors.primary : colors.textMuted,
                      fontWeight: active ? '700' : '500'
                    }
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Animated.View>
  );
}

const TAB_IMAGES: Record<string, any> = {
  restaurants: require('../../assets/images/stores/burger.jpg'),
  grocery: require('../../assets/images/categories/vegetables.jpg'),
  sweets: require('../../assets/images/food/sweets.jpg'),
  bakery: require('../../assets/images/food/bakery.jpg')
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    shadowColor: '#000',
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6
  },
  locBlock: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 8 },
  locIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  locTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  locTitle: { fontSize: 15, fontWeight: '800', maxWidth: 150 },
  locSub: { fontSize: 11, marginTop: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center'
  },
  walletPill: {
    position: 'absolute', bottom: -3, right: -4,
    paddingHorizontal: 4, paddingVertical: 1, borderRadius: 6
  },
  walletPillText: { fontSize: 8, fontWeight: '800', color: '#fff' },
  bellDot: {
    position: 'absolute', top: 8, right: 9, width: 8, height: 8,
    borderRadius: 4, borderWidth: 1.5
  },
  avatarBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '900', color: '#fff' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 6
  },
  vegBox: {
    width: 62, height: 46, borderRadius: 14, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center'
  },
  vegLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  vegDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  vegLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  chipRow: { paddingTop: 4, paddingBottom: 8 },
  chip: { alignItems: 'center', width: 64 },
  chipCircle: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
  },
  chipImg: { width: '100%', height: '100%' },
  chipLabel: { fontSize: 10.5, marginTop: 4 }
});

export default StickyHeader;
