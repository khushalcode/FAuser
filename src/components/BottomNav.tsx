/**
 * BottomNav — persistent bottom tab bar, shown on EVERY screen.
 *
 *   - Sits in normal layout flow (not absolute), so screen content and sticky
 *     CTAs end exactly above it — nothing is ever hidden behind the bar.
 *   - Active tab gets a soft green pill + bold label.
 *   - Secondary screens (product, store, wallet, checkout...) highlight the
 *     tab they belong to, so it always feels like one tabbed app.
 *   - Hides itself while the keyboard is open.
 *   - Routes are unchanged: Home, Categories, Cart, Orders, Account.
 */
import React from 'react';
import { View, Pressable, Text, StyleSheet, Platform, Keyboard } from 'react-native';
import { Home, LayoutGrid, ShoppingCart, ClipboardList, User } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';

type TabKey = 'home' | 'categories' | 'cart' | 'orders' | 'profile';

interface Props {
  /** Cart item count for badge */
  cartCount?: number;
  /** Active orders count for badge */
  activeOrders?: number;
}

/** Map any pathname to the tab it belongs to. */
function tabForPath(path: string): TabKey {
  if (path.startsWith('/categories')) return 'categories';
  if (path.startsWith('/cart') || path.startsWith('/checkout') || path.startsWith('/coupons')) return 'cart';
  if (path.startsWith('/orders') || path.startsWith('/order/')) return 'orders';
  if (
    path.startsWith('/profile') ||
    path.startsWith('/wallet') ||
    path.startsWith('/favourites') ||
    path.startsWith('/address') ||
    path.startsWith('/notifications') ||
    path.startsWith('/chat')
  ) {
    return 'profile';
  }
  // '/', '/index', '/search', '/product/..', '/store/..'
  return 'home';
}

const TABS: { key: TabKey; label: string; route: string; Icon: any }[] = [
  { key: 'home', label: 'Home', route: '/(tabs)', Icon: Home },
  { key: 'categories', label: 'Categories', route: '/(tabs)/categories', Icon: LayoutGrid },
  { key: 'cart', label: 'Cart', route: '/(tabs)/cart', Icon: ShoppingCart },
  { key: 'orders', label: 'Orders', route: '/(tabs)/orders', Icon: ClipboardList },
  { key: 'profile', label: 'Account', route: '/(tabs)/profile', Icon: User }
];

export function BottomNav({ cartCount = 0, activeOrders = 0 }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);

  React.useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const a = Keyboard.addListener(showEvt, () => setKeyboardOpen(true));
    const b = Keyboard.addListener(hideEvt, () => setKeyboardOpen(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);

  if (keyboardOpen) return null;

  const current = tabForPath(pathname || '/');

  const go = (route: string) => {
    // replace: switching tabs should not pile up history
    router.replace(route as any);
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map(({ key, label, route, Icon }) => {
        const active = current === key;
        const badge = key === 'cart' ? cartCount : key === 'orders' ? activeOrders : 0;
        const color = active ? colors.primary700 : colors.textMuted;
        return (
          <Pressable
            key={key}
            onPress={() => go(route)}
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.7 : 1 }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={label}
          >
            <View style={[styles.iconPill, active && styles.iconPillActive]}>
              <Icon
                size={21}
                color={color}
                strokeWidth={active ? 2.4 : 2}
                fill={active ? colors.primary200 : 'transparent'}
              />
              {badge > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, { color, fontWeight: active ? '800' : '600' }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: '#101828',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconPill: {
    width: 52,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  iconPillActive: {
    backgroundColor: colors.primary100
  },
  label: {
    fontSize: 11,
    marginTop: 3,
    letterSpacing: 0.1
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: 4,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fff'
  }
});

export default BottomNav;
