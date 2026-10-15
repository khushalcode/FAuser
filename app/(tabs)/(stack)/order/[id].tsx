import React from 'react';
import {
  View, Text, ScrollView, Pressable, ActivityIndicator, Alert, Share, Linking,
  Platform, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft, Phone, MessageSquare, Star, Clock, CheckCircle2,
  Circle, X, RotateCcw, Navigation as NavIcon, MapPin, Store as StoreIcon, Bike
} from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { api } from '@/lib/api';
import {
  subscribeToOrder,
  subscribeToDeliveryManLocation,
  startOrderPolling,
  isSupabaseConfigured
} from '@/lib/realtime';
import {
  subscribeToOrderNotifications,
  showLocalNotification
} from '@/lib/notifications';
import { useCartStore } from '@/store/cart';
import type { Order, OrderStatus, Store } from '@/lib/types';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { formatCurrency, formatDate, formatTime } from '@/utils/format';
import { hapticNotify } from '@/utils/platform';
import Constants from 'expo-constants';

// Google Maps API key — read from app.json extra or env.
const GOOGLE_MAPS_API_KEY =
  (Constants.expoConfig as any)?.extra?.googleMapsApiKey ||
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  '';

// react-native-maps is a native module — only import it on real builds.
// In Expo Go the require will resolve to a stub that throws on render, so we
// lazy-load it inside the map component and fall back to a placeholder.
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Polyline = maps.Polyline;
} catch (e) {
  // Maps not installed (preview without native deps). The screen renders
  // a static placeholder card instead.
}

const TIMELINE: { status: OrderStatus; label: string; emoji: string }[] = [
  { status: 'pending', label: 'Order Placed', emoji: '📝' },
  { status: 'accepted', label: 'Order Accepted', emoji: '✅' },
  { status: 'preparing', label: 'Preparing', emoji: '👨‍🍳' },
  { status: 'ready', label: 'Ready for Pickup', emoji: '📦' },
  { status: 'picked_up', label: 'Picked Up', emoji: '🛍️' },
  { status: 'on_the_way', label: 'On the Way', emoji: '🛵' },
  { status: 'delivered', label: 'Delivered', emoji: '🎉' }
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const [order, setOrder] = React.useState<Order | null>(null);
  const [store, setStore] = React.useState<Store | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [live, setLive] = React.useState(false);
  const [deliveryManLoc, setDeliveryManLoc] = React.useState<{ latitude?: number; longitude?: number }>({});
  const [rating, setRating] = React.useState(0);
  const [lastStatus, setLastStatus] = React.useState<OrderStatus | undefined>(undefined);
  const clearCart = useCartStore((s) => s.clear);

  React.useEffect(() => {
    let unsubRealtime: (() => void) | null = null;
    let unsubPolling: (() => void) | null = null;
    let unsubFcm: (() => void) | null = null;
    let unsubDm: (() => void) | null = null;

    (async () => {
      if (!id) return;
      const o = await api.getOrder(id);
      setOrder(o || null);
      setLastStatus(o?.status);
      setLoading(false);

      if (o) {
        // Fetch the store for the map (store location + cover).
        const s = await api.getStore(o.store_id);
        setStore(s || null);

        // Initial delivery-man location
        const dm = await api.getDeliveryManLocation(o.id);
        if (dm) setDeliveryManLoc({ latitude: dm.latitude, longitude: dm.longitude });
      }

      // 1) Supabase Realtime subscription — fires instantly when the backend
      //    updates the order row.
      if (isSupabaseConfigured && o) {
        unsubRealtime = subscribeToOrder(id, (updated) => {
          setOrder((prev) => ({ ...(prev || ({} as any)), ...updated }));
          setLive(true);
          setTimeout(() => setLive(false), 3000);
        });

        unsubDm = subscribeToDeliveryManLocation(o.delivery_man_id, (loc) => {
          setDeliveryManLoc(loc);
        });
      }

      // 2) 3-second polling — required by the spec, also powers mock mode.
      unsubPolling = startOrderPolling(id, (polled) => {
        if (!polled) return;
        setOrder((prev) => ({ ...(prev || ({} as any)), ...polled }));
        setLive(true);
        setTimeout(() => setLive(false), 1500);

        // Fire a local notification on every status change (mock mode + safety net).
        if (lastStatus && polled.status && polled.status !== lastStatus) {
          const step = TIMELINE.find((t) => t.status === polled.status);
          if (step) {
            showLocalNotification(
              `Order #${polled.order_code} • ${step.label}`,
              step.status === 'delivered'
                ? 'Your order has been delivered. Enjoy!'
                : `Your order status is now "${step.label}".`,
              { type: 'order', order_id: polled.id, order_status: polled.status }
            );
            hapticNotify('success');
          }
        }
        setLastStatus(polled.status);
      }, 3000);

      // 3) FCM subscription — when an order-status push arrives, refresh the
      //    order immediately (don't wait for the next 3s tick).
      unsubFcm = subscribeToOrderNotifications(id, async (data) => {
        try {
          const fresh = await api.pollOrder(id);
          if (fresh) {
            setOrder(fresh);
            setLive(true);
            setTimeout(() => setLive(false), 3000);
            if (data.order_status && data.order_status !== lastStatus) {
              const step = TIMELINE.find((t) => t.status === data.order_status);
              if (step) {
                showLocalNotification(
                  `Order #${fresh.order_code} • ${step.label}`,
                  step.status === 'delivered'
                    ? 'Your order has been delivered. Enjoy!'
                    : `Your order status is now "${step.label}".`,
                  { type: 'order', order_id: fresh.id, order_status: data.order_status }
                );
                hapticNotify('success');
              }
            }
            setLastStatus(data.order_status as OrderStatus);
          }
        } catch (e) {
          console.warn('[order] FCM refresh failed', e);
        }
      });
    })();

    return () => {
      if (unsubRealtime) unsubRealtime();
      if (unsubPolling) unsubPolling();
      if (unsubFcm) unsubFcm();
      if (unsubDm) unsubDm();
    };
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
          <Text className="text-muted text-sm mt-3" style={{ color: colors.textMuted }}>Loading order…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-3">😕</Text>
          <Text className="text-textmain font-bold text-base" style={{ color: colors.text }}>Order not found</Text>
          <Pressable
            onPress={() => router.replace('/(tabs)/orders')}
            className="mt-4 rounded-xl2 px-6 py-3"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-semibold text-sm">View my orders</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentIdx = TIMELINE.findIndex((t) => t.status === order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'rejected';
  const isDelivered = order.status === 'delivered';
  const isActive = ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'on_the_way'].includes(order.status);

  const onCancel = () => {
    Alert.alert('Cancel order?', 'This action cannot be undone.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: async () => {
          const o = await api.cancelOrder(order.id);
          setOrder(o);
          hapticNotify('warning');
        }
      }
    ]);
  };

  const onRate = async () => {
    if (rating === 0) {
      Alert.alert('Select rating', 'Please tap a star to rate.');
      return;
    }
    const o = await api.rateOrder(order.id, rating);
    setOrder(o);
    hapticNotify('success');
    Alert.alert('Thanks for your feedback!', `You rated this order ${rating} star${rating > 1 ? 's' : ''}.`);
  };

  const onReorder = async () => {
    Alert.alert('Reorder items?', `Add ${order.item_count} item(s) from ${order.store_name} to cart?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Add to Cart',
        onPress: async () => {
          const items = await api.reorder(order.id);
          clearCart();
          hapticNotify('success');
          Alert.alert('Added!', 'Items added to cart. Continue to checkout?', [
            { text: 'Keep browsing', onPress: () => router.replace('/(tabs)') },
            { text: 'Go to cart', onPress: () => router.replace('/(tabs)/cart') }
          ]);
        }
      }
    ]);
  };

  // Map coordinates — store + customer + (optional) delivery man.
  const storeLat = store?.latitude;
  const storeLng = store?.longitude;
  const custLat = order.delivery_latitude;
  const custLng = order.delivery_longitude;
  const dmLat = deliveryManLoc.latitude;
  const dmLng = deliveryManLoc.longitude;
  const showMap = isActive && !!MapView && (!!storeLat || !!custLat);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View className="px-5 pt-2 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-2xl items-center justify-center bg-surface border border-lineLight mr-3" style={{ backgroundColor: colors.surface, borderColor: colors.borderLight }}>
            <ArrowLeft size={18} color={colors.text} />
          </Pressable>
          <View>
            <Text className="text-textmain text-lg font-bold" style={{ color: colors.text }}>Order {order.order_code}</Text>
            <Text className="text-muted text-[11px]" style={{ color: colors.textMuted }}>{formatDate(order.created_at, true)}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          {/* Live indicator */}
          <View
            className="flex-row items-center px-2 py-1 rounded-md mr-2"
            style={{ backgroundColor: live ? colors.successLight : colors.surfaceAlt }}
          >
            {live ? <NavIcon size={10} color={colors.success} /> : <Clock size={10} color={colors.textSubtle} />}
            <Text
              className="text-[10px] font-bold ml-1"
              style={{ color: live ? colors.success : colors.textSubtle }}
            >
              {live ? 'LIVE' : 'TRACKING'}
            </Text>
          </View>
          <OrderStatusBadge status={order.status} size="md" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Live map */}
        {showMap && (
          <View className="mx-5 mt-2 rounded-xl2 overflow-hidden border border-line" style={{ borderColor: colors.border, height: 220 }}>
            <LiveMap
              storeLat={storeLat}
              storeLng={storeLng}
              storeName={store?.name}
              custLat={custLat}
              custLng={custLng}
              dmLat={dmLat}
              dmLng={dmLng}
              onTheWay={order.status === 'on_the_way' || order.status === 'picked_up'}
            />
          </View>
        )}

        {/* Status timeline */}
        <View className="mx-5 mt-4 bg-white rounded-xl2 border border-line p-4" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
          {isCancelled ? (
            <View className="items-center py-3">
              <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: colors.errorLight }}>
                <X size={22} color={colors.error} />
              </View>
              <Text className="text-textmain font-bold text-base mt-2" style={{ color: colors.text }}>Order Cancelled</Text>
              <Text className="text-muted text-xs mt-0.5" style={{ color: colors.textMuted }}>Your refund will be processed in 5-7 business days.</Text>
            </View>
          ) : (
            <>
              <View className="flex-row items-center mb-3">
                <Clock size={14} color={colors.primary} />
                <Text className="ml-1.5 text-xs font-semibold" style={{ color: colors.primary }}>
                  {isDelivered ? 'Delivered' : 'Estimated delivery in 25-35 min'}
                </Text>
              </View>

              {/* Progress bar */}
              <View className="flex-row mb-4">
                {TIMELINE.map((step, idx) => {
                  const isDone = idx < currentIdx || isDelivered;
                  const isCurrent = idx === currentIdx && !isDelivered;
                  return (
                    <View
                      key={step.status}
                      style={{
                        flex: 1,
                        height: 4,
                        marginRight: idx < TIMELINE.length - 1 ? 4 : 0,
                        borderRadius: 2,
                        backgroundColor: isDone ? colors.primary : isCurrent ? colors.primary + '80' : colors.border
                      }}
                    />
                  );
                })}
              </View>

              <View>
                {TIMELINE.map((step, idx) => {
                  const isDone = idx < currentIdx || isDelivered;
                  const isCurrent = idx === currentIdx && !isDelivered;
                  return (
                    <View key={step.status} className="flex-row">
                      <View className="items-center">
                        {isDone ? (
                          <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary }}>
                            <CheckCircle2 size={13} color="#fff" />
                          </View>
                        ) : isCurrent ? (
                          <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary }}>
                            <Circle size={10} color="#fff" fill="#fff" />
                          </View>
                        ) : (
                          <View className="w-6 h-6 rounded-full items-center justify-center border-2" style={{ borderColor: colors.border, backgroundColor: colors.surfaceElevated }}>
                            <Circle size={6} color={colors.border} />
                          </View>
                        )}
                        {idx < TIMELINE.length - 1 && (
                          <View style={{ width: 2, height: 24, backgroundColor: isDone ? colors.primary : colors.border }} />
                        )}
                      </View>
                      <View className="ml-3 pb-3">
                        <Text
                          className="text-sm font-semibold"
                          style={{ color: isDone ? colors.text : isCurrent ? colors.primary : colors.textMuted }}
                        >
                          {step.emoji} {step.label}
                        </Text>
                        {isCurrent && (
                          <Text className="text-muted text-[11px] mt-0.5" style={{ color: colors.textMuted }}>In progress…</Text>
                        )}
                        {isDone && step.status === 'pending' && (
                          <Text className="text-muted text-[11px] mt-0.5" style={{ color: colors.textMuted }}>{formatTime(order.created_at)}</Text>
                        )}
                        {isDone && step.status === 'delivered' && order.delivered_at && (
                          <Text className="text-muted text-[11px] mt-0.5" style={{ color: colors.textMuted }}>{formatTime(order.delivered_at)}</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* Delivery man */}
        {!isCancelled && order.delivery_man_name && (
          <View className="mx-5 mt-4 bg-white rounded-xl2 border border-line p-4 flex-row items-center" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
            <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
              <Text className="text-primary font-bold text-base" style={{ color: colors.primary }}>
                {order.delivery_man_name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
              </Text>
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-textmain font-semibold text-sm" style={{ color: colors.text }}>{order.delivery_man_name}</Text>
              <View className="flex-row items-center">
                <Star size={11} color={colors.warning} fill={colors.warning} />
                <Text className="text-muted text-[11px] ml-0.5" style={{ color: colors.textMuted }}>4.8 • Your delivery partner</Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/chat')}
              className="w-10 h-10 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <MessageSquare size={16} color={colors.primary} />
            </Pressable>
            <Pressable
              onPress={() => {
                if (order.customer_phone) Linking.openURL(`tel:${order.customer_phone}`).catch(() => {});
              }}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.successLight }}
            >
              <Phone size={16} color={colors.success} />
            </Pressable>
          </View>
        )}

        {/* Items */}
        <View className="mx-5 mt-4 bg-white rounded-xl2 border border-line p-4" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-textmain font-bold text-sm" style={{ color: colors.text }}>Order Items</Text>
            <Pressable onPress={onReorder} className="flex-row items-center px-2.5 py-1 rounded-md" style={{ backgroundColor: colors.primaryLight }}>
              <RotateCcw size={11} color={colors.primary} />
              <Text className="text-primary text-[11px] font-semibold ml-1" style={{ color: colors.primary }}>Reorder</Text>
            </Pressable>
          </View>

          {order.items.map((it, idx) => (
            <View key={it.product_id + idx} className="flex-row items-center py-2 border-b border-lineLight" style={{ borderBottomColor: colors.borderLight }}>
              <View
                className="w-12 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: colors.primaryLight }}
              >
                <Text className="text-xl">🛍️</Text>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-textmain text-sm font-medium" style={{ color: colors.text }} numberOfLines={1}>{it.name}</Text>
                <Text className="text-muted text-[11px] mt-0.5" style={{ color: colors.textMuted }}>{it.quantity} × {formatCurrency(it.price)} • {it.unit}</Text>
              </View>
              <Text className="text-textmain text-sm font-semibold" style={{ color: colors.text }}>{formatCurrency(it.price * it.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Bill */}
        <View className="mx-5 mt-4 bg-white rounded-xl2 border border-line p-4" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
          <Text className="text-textmain font-bold text-sm mb-3" style={{ color: colors.text }}>Bill Details</Text>
          <BillRow label="Item total" value={formatCurrency(order.subtotal)} colors={colors} />
          <BillRow label="Delivery fee" value={order.delivery_fee === 0 ? 'FREE' : formatCurrency(order.delivery_fee)} valueColor={order.delivery_fee === 0 ? colors.success : colors.text} colors={colors} />
          {order.discount > 0 && <BillRow label="Discount" value={`− ${formatCurrency(order.discount)}`} valueColor={colors.success} colors={colors} />}
          <BillRow label="Taxes" value={formatCurrency(order.tax)} colors={colors} />
          <View className="h-px bg-line my-2.5" style={{ backgroundColor: colors.borderLight }} />
          <View className="flex-row justify-between">
            <Text className="text-textmain font-bold text-base" style={{ color: colors.text }}>Paid ({order.payment_method})</Text>
            <Text className="text-textmain font-bold text-base" style={{ color: colors.text }}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        {/* Delivery address */}
        <View className="mx-5 mt-4 bg-white rounded-xl2 border border-line p-4" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
          <Text className="text-textmain font-bold text-sm mb-2" style={{ color: colors.text }}>Delivery Address</Text>
          <Text className="text-textmain text-sm" style={{ color: colors.text }} numberOfLines={2}>{order.delivery_address}</Text>
          {order.note && (
            <View className="mt-2 p-2 rounded-md" style={{ backgroundColor: colors.surface }}>
              <Text className="text-muted text-xs" style={{ color: colors.textMuted }}>Note: {order.note}</Text>
            </View>
          )}
        </View>

        {/* Rate */}
        {isDelivered && (
          <View className="mx-5 mt-4 bg-white rounded-xl2 border border-line p-4" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
            <Text className="text-textmain font-bold text-sm mb-2" style={{ color: colors.text }}>
              {order.rating ? 'Your Rating' : 'Rate this order'}
            </Text>
            <View className="flex-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => !order.rating && setRating(n)} className="mr-2">
                  <Star size={28} color={colors.warning} fill={(order.rating || rating) >= n ? colors.warning : 'transparent'} />
                </Pressable>
              ))}
            </View>
            {!order.rating && rating > 0 && (
              <Pressable
                onPress={onRate}
                className="mt-3 rounded-xl2 py-2.5 items-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-semibold text-sm">Submit Rating</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Cancel */}
        {!isCancelled && !isDelivered && order.status === 'pending' && (
          <Pressable
            onPress={onCancel}
            className="mx-5 mt-4 mb-8 rounded-xl2 py-3 items-center border"
            style={{ borderColor: colors.error, backgroundColor: colors.surfaceElevated }}
          >
            <Text className="text-error font-semibold text-sm" style={{ color: colors.error }}>Cancel Order</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Live map showing store + delivery-man + customer markers + polyline. */
function LiveMap({
  storeLat, storeLng, storeName, custLat, custLng, dmLat, dmLng, onTheWay
}: {
  storeLat?: number;
  storeLng?: number;
  storeName?: string;
  custLat?: number;
  custLng?: number;
  dmLat?: number;
  dmLng?: number;
  onTheWay?: boolean;
}) {
  const colors = useThemeColors();
  const [polyline, setPolyline] = React.useState<{ latitude: number; longitude: number }[]>([]);

  // Compute initial region that fits all known markers.
  const points: { latitude: number; longitude: number }[] = [];
  if (storeLat && storeLng) points.push({ latitude: storeLat, longitude: storeLng });
  if (custLat && custLng) points.push({ latitude: custLat, longitude: custLng });
  if (dmLat && dmLng) points.push({ latitude: dmLat, longitude: dmLng });

  const region = React.useMemo(() => {
    if (points.length === 0) {
      return { latitude: 12.9716, longitude: 77.5946, latitudeDelta: 0.05, longitudeDelta: 0.05 };
    }
    if (points.length === 1) {
      return { latitude: points[0].latitude, longitude: points[0].longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 };
    }
    const lats = points.map((p) => p.latitude);
    const lngs = points.map((p) => p.longitude);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    const dLat = Math.max(maxLat - minLat, 0.02) * 1.4;
    const dLng = Math.max(maxLng - minLng, 0.02) * 1.4;
    return { latitude: midLat, longitude: midLng, latitudeDelta: dLat, longitudeDelta: dLng };
  }, [points.length]);

  // Fetch a route polyline between store and customer (or delivery man ↔ customer
  // when out for delivery) using the Google Directions API.
  React.useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;
    const origin = onTheWay && dmLat && dmLng
      ? `${dmLat},${dmLng}`
      : storeLat && storeLng ? `${storeLat},${storeLng}` : null;
    const dest = custLat && custLng ? `${custLat},${custLng}` : null;
    if (!origin || !dest) return;
    let cancelled = false;
    fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&key=${GOOGLE_MAPS_API_KEY}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data?.routes?.[0]?.overview_polyline?.points) return;
        const decoded = decodePolyline(data.routes[0].overview_polyline.points);
        setPolyline(decoded);
      })
      .catch((e) => console.warn('[order] directions failed', e));
    return () => { cancelled = true; };
  }, [storeLat, storeLng, custLat, custLng, dmLat, dmLng, onTheWay]);

  if (!MapView) {
    // Fallback placeholder — Maps not installed (Expo Go preview).
    return (
      <View style={{ flex: 1, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
        <MapPin size={36} color={colors.primary} />
        <Text className="text-muted text-xs mt-2" style={{ color: colors.textMuted }}>Live map available in APK build</Text>
      </View>
    );
  }

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={region}
      region={region}
      showsUserLocation={false}
      showsMyLocationButton={false}
      toolbarEnabled={false}
    >
      {storeLat && storeLng && (
        <Marker coordinate={{ latitude: storeLat, longitude: storeLng }} title={storeName || 'Store'}>
          <View style={[mapStyles.marker, { backgroundColor: colors.warning }]}>
            <StoreIcon size={14} color="#fff" />
          </View>
        </Marker>
      )}
      {custLat && custLng && (
        <Marker coordinate={{ latitude: custLat, longitude: custLng }} title="Delivery address">
          <View style={[mapStyles.marker, { backgroundColor: colors.primary }]}>
            <MapPin size={14} color="#fff" />
          </View>
        </Marker>
      )}
      {dmLat && dmLng && (
        <Marker coordinate={{ latitude: dmLat, longitude: dmLng }} title="Delivery partner">
          <View style={[mapStyles.marker, { backgroundColor: colors.warning }]}>
            <Bike size={14} color="#fff" />
          </View>
        </Marker>
      )}
      {polyline.length > 1 && (
        <Polyline
          coordinates={polyline}
          strokeColor={colors.primary}
          strokeWidth={4}
          strokeColors={[colors.primary, colors.primary]}
        />
      )}
    </MapView>
  );
}

/** Decode an encoded polyline string into {latitude, longitude}[] (Google algorithm). */
function decodePolyline(str: string): { latitude: number; longitude: number }[] {
  let index = 0, lat = 0, lng = 0;
  const coordinates: { latitude: number; longitude: number }[] = [];
  while (index < str.length) {
    let b: number, shift = 0, result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    coordinates.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return coordinates;
}

function BillRow({ label, value, valueColor, colors }: { label: string; value: string; valueColor?: string; colors: any }) {
  return (
    <View className="flex-row justify-between mb-1.5">
      <Text className="text-muted text-sm" style={{ color: colors.textMuted }}>{label}</Text>
      <Text className="text-textmain text-sm font-medium" style={{ color: valueColor || colors.text }}>{value}</Text>
    </View>
  );
}

const mapStyles = StyleSheet.create({
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  }
});
