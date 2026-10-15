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
  View, Text, Pressable, StyleSheet, Animated
} from 'react-native';
import { MapPin, ChevronDown, Clock, Wallet, Bell } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { SearchBar } from './SearchBar';
import { TabRow, TabItem } from './TabRow';
import { ThemeToggle } from './ThemeToggle';
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

  return (
    <Animated.View
      onLayout={(e) => onHeightChange?.(Math.ceil(e.nativeEvent.layout.height))}
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + 4,
          backgroundColor: headerTint,
          shadowOpacity: collapse.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.08],
            extrapolate: 'clamp'
          })
        }
      ]}
    >
      {/* Top row — brand + delivery location + wallet + bell + theme + avatar */}
      <View style={styles.topRow}>
        {/* Brand + delivery */}
        <Animated.View
          style={{
            opacity: brandOpacity,
            transform: [{ translateY: brandTranslateY }]
          }}
        >
          <Pressable
            onPress={onAddressPress}
            style={styles.brandBlock}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.brandWordmark}>
              Food <Text style={styles.brandAccent}>Munch</Text>
            </Text>
            <View style={styles.deliveryRow}>
              <View style={styles.deliveryDot}>
                <MapPin size={11} color="#fff" strokeWidth={2.5} />
              </View>
              <Text style={styles.deliveryLabel} numberOfLines={1}>
                Deliver to · {defaultAddressLabel}
              </Text>
              <ChevronDown size={11} color="#fff" opacity={0.9} />
              <View style={styles.deliveryBadge}>
                <Clock size={8} color={colors.primary} strokeWidth={3} />
                <Text style={styles.deliveryBadgeText}>{deliveryMinutes} mins</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Right actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={onWalletPress || (() => router.push('/wallet'))}
            style={styles.iconBtn}
          >
            <Wallet size={17} color="#fff" strokeWidth={2.2} />
            {balance > 0 && (
              <View style={styles.walletPill}>
                <Text style={styles.walletPillText}>{formatCurrency(balance, false)}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={onBellPress || (() => router.push('/notifications'))}
            style={styles.iconBtn}
          >
            <Bell size={17} color="#fff" strokeWidth={2.2} />
            <View style={styles.bellDot} />
          </Pressable>
          {/* Theme toggle — sits on the colored header tint */}
          <View style={styles.themeToggleWrap}>
            <ThemeToggle size="sm" />
          </View>
          <Pressable
            onPress={onProfilePress || (() => router.push('/(tabs)/profile'))}
            style={styles.avatarBtn}
          >
            <Text style={styles.avatarText}>
              {(user?.full_name?.[0] || 'G').toUpperCase()}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <SearchBar
          readOnly
          rotating
          collapsed={false}
        />
      </View>

      {/* Tab row */}
      <View style={[styles.tabRow, { backgroundColor: colors.background }]}>
        <TabRow
          tabs={tabs}
          active={activeTab}
          onChange={onTabChange}
          activeColor={accent}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4
  },
  brandBlock: {
    flex: 1,
    marginRight: 8
  },
  brandWordmark: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.4
  },
  brandAccent: {
    color: 'rgba(255,255,255,0.85)'
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4
  },
  deliveryDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  deliveryLabel: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    maxWidth: 140
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
    marginLeft: 4,
    gap: 2
  },
  deliveryBadgeText: {
    fontSize: 9,
    fontWeight: '800'
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  themeToggleWrap: {
    // Slightly smaller pill on the colored header for visual harmony
    transform: [{ scale: 0.92 }],
  },
  walletPill: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1
  },
  walletPillText: {
    fontSize: 8,
    fontWeight: '800'
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F04438',
    borderWidth: 1.5
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '900'
  },
  searchRow: {
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  tabRow: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14
  }
});

export default StickyHeader;
