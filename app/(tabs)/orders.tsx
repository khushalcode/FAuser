import React from 'react';
import {
  View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Package, ChevronRight, RefreshCw, MapPin, Bike, Wifi } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { subscribeToCustomerOrders, isSupabaseConfigured } from '@/lib/realtime';
import type { Order } from '@/lib/types';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { formatCurrency, formatDate, truncate } from '@/utils/format';
import { hapticNotify } from '@/utils/platform';

type Tab = 'active' | 'past';

export default function OrdersScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = React.useState<Tab>('active');
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [live, setLive] = React.useState(false);
  const clearCart = useCartStore((s) => s.clear);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const o = await api.getOrders({ status: tab === 'active' ? 'active' : 'past' });
      setOrders(o);
    } catch (e) {
      console.warn('[orders] load failed', e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  React.useEffect(() => {
    load();
    // Subscribe to live order updates (status changes, new orders, etc.)
    if (isSupabaseConfigured && user?.id) {
      const unsub = subscribeToCustomerOrders(user.id, (updated) => {
        setOrders((prev) => {
          const idx = prev.findIndex((o) => o.id === updated.id);
          if (idx === -1) {
            // New order — only insert if it matches the current tab filter
            const isActive = ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'on_the_way'].includes(updated.status);
            if ((tab === 'active' && isActive) || (tab === 'past' && !isActive)) {
              return [updated, ...prev];
            }
            return prev;
          }
          const next = [...prev];
          next[idx] = { ...next[idx], ...updated };
          return next;
        });
        setLive(true);
        hapticNotify('success');
        setTimeout(() => setLive(false), 3000);
      });
      return () => unsub();
    }
  }, [load, user?.id, tab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const reorder = async (order: Order) => {
    Alert.alert(
      'Reorder items?',
      `Add ${order.item_count} item(s) from ${order.store_name} to your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add to Cart',
          onPress: async () => {
            const items = await api.reorder(order.id);
            // For preview: clear & re-add first item (full cross-store flow handled in real app)
            clearCart();
            // Show a small confirmation
            hapticNotify('success');
            Alert.alert('Added to cart', `${items.length} item(s) from ${order.store_name} have been added.`, [
              { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') }
            ]);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View className="px-5 pt-2 pb-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-textmain text-[22px] font-extrabold tracking-tight">My Orders</Text>
            <Text className="text-muted text-sm mt-0.5">Track and manage your orders</Text>
          </View>
          {isSupabaseConfigured && (
            <View className="flex-row items-center px-2 py-1 rounded-md" style={{ backgroundColor: live ? colors.successLight : colors.surfaceAlt }}>
              <Wifi size={10} color={live ? colors.success : colors.textSubtle} />
              <Text className="text-[10px] font-bold ml-1" style={{ color: live ? colors.success : colors.textSubtle }}>
                {live ? 'LIVE' : 'LIVE'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View className="px-5 mb-2">
        <View className="flex-row bg-surface rounded-xl2 p-1 border border-line">
          {(['active', 'past'] as Tab[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className="flex-1 py-2.5 rounded-xl items-center"
              style={{ backgroundColor: tab === t ? '#fff' : 'transparent', elevation: tab === t ? 2 : 0, shadowColor: '#0F172A', shadowOpacity: tab === t ? 0.08 : 0, shadowRadius: 4 }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: tab === t ? colors.primary : colors.textMuted }}
              >
                {t === 'active' ? 'Active' : 'Past'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.surfaceAlt }}
          >
            <Package size={36} color={colors.textMuted} />
          </View>
          <Text className="text-textmain font-bold text-base">
            {tab === 'active' ? 'No active orders' : 'No past orders'}
          </Text>
          <Text className="text-muted text-sm mt-1 text-center">
            {tab === 'active'
              ? 'Your active orders will appear here once you place them.'
              : 'Your past orders will appear here after delivery.'}
          </Text>
          <Pressable
            onPress={() => router.replace('/(tabs)')}
            className="mt-5 rounded-xl2 px-6 py-3"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-semibold text-sm">Start Shopping</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/order/${item.id}`)}
              className="bg-white rounded-xl2 border border-line p-4 active:opacity-80"
              style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
            >
              <View className="flex-row items-center justify-between mb-2.5">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-xl2 items-center justify-center mr-2.5"
                    style={{ backgroundColor: colors.primaryLight }}
                  >
                    <Text className="text-xl">🛍️</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-textmain font-semibold text-sm" numberOfLines={1}>{item.store_name}</Text>
                    <Text className="text-muted text-[11px]">#{item.order_code} • {formatDate(item.created_at, true)}</Text>
                  </View>
                </View>
                <OrderStatusBadge status={item.status} size="sm" />
              </View>

              <Text className="text-muted text-xs" numberOfLines={1}>
                {item.items.map((it) => `${it.quantity}× ${it.name}`).join(', ')}
              </Text>

              <View className="flex-row items-center mt-2.5">
                <View className="flex-row items-center mr-3">
                  <Bike size={12} color={colors.textMuted} />
                  <Text className="text-muted text-[11px] ml-0.5">₹{item.delivery_fee} delivery</Text>
                </View>
                <View className="flex-row items-center">
                  <MapPin size={12} color={colors.textMuted} />
                  <Text className="text-muted text-[11px] ml-0.5">{truncate(item.delivery_address, 25)}</Text>
                </View>
              </View>

              <View className="h-px bg-line my-3" />

              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-muted text-[11px]">{item.item_count} item{item.item_count > 1 ? 's' : ''}</Text>
                  <Text className="text-textmain font-bold text-base">{formatCurrency(item.total)}</Text>
                </View>
                <View className="flex-row">
                  {tab === 'past' && (
                    <Pressable
                      onPress={() => reorder(item)}
                      className="flex-row items-center px-3 py-2 rounded-lg mr-2 border border-line"
                    >
                      <RefreshCw size={13} color={colors.text} />
                      <Text className="ml-1 text-textmain text-xs font-semibold">Reorder</Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => router.push(`/order/${item.id}`)}
                    className="flex-row items-center px-3 py-2 rounded-lg"
                    style={{ backgroundColor: colors.primaryLight }}
                  >
                    <Text className="text-primary text-xs font-semibold mr-0.5">
                      {tab === 'active' ? 'Track' : 'Details'}
                    </Text>
                    <ChevronRight size={13} color={colors.primary} />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
