import React from 'react';
import {
  View, Text, FlatList, Pressable,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShoppingBag, Tag, Trash2, ArrowRight, Wifi } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { useCartStore } from '@/store/cart';
import { QuantitySelector } from '@/components/QuantitySelector';
import { formatCurrency } from '@/utils/format';
import { hapticNotify } from '@/utils/platform';
import { isSupabaseConfigured } from '@/lib/realtime';

export default function CartScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const items = useCartStore((s) => s.items);
  const storeName = useCartStore((s) => s.storeName);
  const subtotal = useCartStore((s) => s.subtotal());
  const deliveryFee = useCartStore((s) => s.deliveryFee());
  const discount = useCartStore((s) => s.discount());
  const tax = useCartStore((s) => s.tax());
  const total = useCartStore((s) => s.total());
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);

  // Note: when Supabase is configured, the cart_items table can be subscribed
  // to via subscribeToCart(customerId, cb) for live cross-device sync.
  // We surface a "Realtime on" badge here when it's available.
  const realtimeAvailable = isSupabaseConfigured;

  if (items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.surfaceAlt }}
          >
            <ShoppingBag size={42} color={colors.textMuted} />
          </View>
          <Text className="text-textmain text-lg font-bold" style={{ color: colors.text }}>Your cart is empty</Text>
          <Text className="text-muted text-sm mt-1 text-center" style={{ color: colors.textMuted }}>
            Browse our food and grocery stores to add fresh items to your cart.
          </Text>
          <Pressable
            onPress={() => router.replace('/(tabs)')}
            className="mt-5 rounded-xl2 px-6 py-3 flex-row items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-semibold text-sm mr-1.5">Browse items</Text>
            <ArrowRight size={16} color="#fff" />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View className="px-5 pt-2 pb-3 flex-row items-center justify-between">
        <View>
          <View className="flex-row items-center">
            <Text className="text-textmain text-[22px] font-extrabold tracking-tight" style={{ color: colors.text }}>Your Cart</Text>
            {realtimeAvailable && (
              <View className="ml-2 flex-row items-center px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.successLight }}>
                <Wifi size={8} color={colors.success} />
                <Text className="text-success text-[8px] font-bold ml-0.5" style={{ color: colors.success }}>LIVE</Text>
              </View>
            )}
          </View>
          <Text className="text-muted text-xs mt-0.5" style={{ color: colors.textMuted }}>
            {items.length} item{items.length > 1 ? 's' : ''} from {storeName}
          </Text>
        </View>
        <Pressable
          onPress={() => Alert.alert('Clear cart?', 'This will remove all items from your cart.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => { clear(); hapticNotify('warning'); } }
          ])}
          className="w-9 h-9 rounded-full items-center justify-center bg-surface"
          style={{ backgroundColor: colors.surface }}
        >
          <Trash2 size={16} color={colors.error} />
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 220 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View className="flex-row bg-white rounded-xl2 border border-line p-3" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
            <View
              className="w-16 h-16 rounded-xl2 items-center justify-center"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <Text className="text-2xl">🛍️</Text>
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-textmain font-semibold text-sm" style={{ color: colors.text }} numberOfLines={2}>{item.name}</Text>
              <Text className="text-muted text-[11px] mt-0.5" style={{ color: colors.textMuted }}>{item.unit}</Text>
              <Text className="text-textmain font-bold text-sm mt-1" style={{ color: colors.text }}>{formatCurrency(item.price)}</Text>
            </View>
            <View className="items-end justify-between">
              <Pressable onPress={() => removeItem(item.product_id)}>
                <Trash2 size={14} color={colors.textMuted} />
              </Pressable>
              <QuantitySelector
                size="sm"
                quantity={item.quantity}
                onIncrement={() => increment(item.product_id)}
                onDecrement={() => decrement(item.product_id)}
              />
              <Text className="text-textmain font-bold text-sm mt-1" style={{ color: colors.text }}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Sticky bottom checkout panel */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-3 pb-4 border-t border-line"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 }}
      >
        {/* Apply coupon */}
        <Pressable
          onPress={() => router.push('/coupons')}
          className="flex-row items-center justify-between bg-surface rounded-xl2 px-3.5 py-3 border border-line mb-3"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <View className="flex-row items-center">
            <Tag size={16} color={colors.primary} />
            <Text className="ml-2 text-sm font-medium text-textmain" style={{ color: colors.text }}>
              {appliedCoupon ? appliedCoupon.code : 'Apply Coupon'}
            </Text>
          </View>
          {appliedCoupon ? (
            <Text className="text-success text-xs font-bold" style={{ color: colors.success }}>− {formatCurrency(discount)}</Text>
          ) : (
            <ArrowRight size={14} color={colors.primary} />
          )}
        </Pressable>

        {/* Bill details */}
        <View className="mb-3">
          <Row label="Subtotal" value={formatCurrency(subtotal)} />
          <Row label="Delivery fee" value={deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)} valueColor={deliveryFee === 0 ? colors.success : colors.text} />
          {discount > 0 && <Row label="Discount" value={`− ${formatCurrency(discount)}`} valueColor={colors.success} />}
          <Row label="Taxes (5%)" value={formatCurrency(tax)} />
          <View className="h-px bg-line my-2" style={{ backgroundColor: colors.borderLight }} />
          <View className="flex-row justify-between">
            <Text className="text-textmain font-bold text-base" style={{ color: colors.text }}>To Pay</Text>
            <Text className="text-textmain font-bold text-base" style={{ color: colors.text }}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/checkout')}
          className="rounded-xl2 py-3.5 flex-row items-center justify-center active:opacity-90"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-semibold text-base mr-1.5">Proceed to Checkout</Text>
          <ArrowRight size={16} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row justify-between mb-1.5">
      <Text className="text-muted text-sm" style={{ color: colors.textMuted }}>{label}</Text>
      <Text className="text-textmain text-sm font-medium" style={{ color: valueColor || colors.text }}>{value}</Text>
    </View>
  );
}
