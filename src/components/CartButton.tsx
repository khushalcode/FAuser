import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { ShoppingCart, ChevronRight } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { useCartStore } from '@/store/cart';
import { useThemeColors } from '@/store/theme';
import { formatCurrency } from '@/utils/format';

export function CartButton() {
  const router = useRouter();
  const pathname = usePathname();
  const colors = useThemeColors();
  const itemCount = useCartStore((s) => s.itemCount());
  const total = useCartStore((s) => s.total());

  // Slide-in animation when cart first appears
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.ease),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, []);

  // Hide on cart screen (it has its own checkout button)
  const isOnCartScreen = pathname.includes('/cart');
  if (itemCount === 0 || isOnCartScreen) return null;

  return (
    <Animated.View
      style={{
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [60, 0],
            }),
          },
        ],
        opacity: slideAnim,
      }}
    >
      <Pressable
        onPress={() => router.push('/(tabs)/cart')}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <View style={styles.countBubble}>
          <Text style={styles.countText}>{itemCount}</Text>
        </View>
        <Text style={styles.label}>View Cart</Text>
        <View style={styles.amountWrap}>
          <Text style={styles.amountText}>{formatCurrency(total)}</Text>
        </View>
        <View style={[styles.arrowWrap, { backgroundColor: '#fff' }]}>
          <ChevronRight size={14} color={colors.primary} strokeWidth={3} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    zIndex: 50,
  },
  countBubble: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  countText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
  },
  amountWrap: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },
  amountText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  arrowWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CartButton;
