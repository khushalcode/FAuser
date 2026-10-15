import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Star, Clock, Bike, MapPin, BadgePercent, Zap } from 'lucide-react-native';
import type { Store } from '@/lib/types';
import { useThemeColors } from '@/store/theme';
import { formatCurrency, truncate } from '@/utils/format';
import { useRouter } from 'expo-router';
import { getStoreImage } from '@/utils/images';

interface Props {
  store: Store;
  variant?: 'horizontal' | 'card' | 'list';
  /** Show promoted badge */
  promoted?: boolean;
  /** Distance from user */
  distance?: string;
  /** Offer text e.g. "50% OFF up to ₹100" */
  offer?: string;
}

/** Pick a small accent color + emoji based on the loose store_type hint. */
function storeVisual(store: Store, colors: any): { accent: string; light: string; emoji: string } {
  const t = (store.store_type || '').toLowerCase();
  if (t.includes('grocery') || t.includes('super') || t.includes('mart')) {
    return { accent: colors.primary, light: colors.primaryLight, emoji: '🏪' };
  }
  if (t.includes('cafe') || t.includes('coffee')) {
    return { accent: '#8B5CF6', light: colors.purpleLight, emoji: '☕' };
  }
  // Default — restaurant
  return { accent: colors.warning, light: colors.warningLight, emoji: '🍽️' };
}

export function StoreCard({ store, variant = 'horizontal', promoted, distance, offer }: Props) {
  const router = useRouter();
  const colors = useThemeColors();
  const { accent, light } = storeVisual(store, colors);
  const freeDelivery = store.delivery_fee === 0;
  const deliveryLabel = freeDelivery ? 'FREE' : formatCurrency(store.delivery_fee);

  if (variant === 'list') {
    return (
      <Pressable
        onPress={() => router.push(`/store/${store.id}`)}
        className="flex-row rounded-xl2 border p-3 mb-2.5 active:opacity-80"
        style={{
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        <View className="relative">
          <View
            className="w-16 h-16 rounded-xl2 items-center justify-center overflow-hidden"
            style={{ backgroundColor: light }}
          >
            <Image source={getStoreImage(store.id)} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          </View>
          {!store.is_open && (
            <View className="absolute inset-0 bg-black/50 rounded-xl2 items-center justify-center">
              <Text className="text-white text-[9px] font-bold">CLOSED</Text>
            </View>
          )}
        </View>
        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <Text
              className="font-semibold text-sm flex-1"
              style={{ color: colors.text }}
              numberOfLines={1}
            >
              {store.name}
            </Text>
            <View
              className="flex-row items-center px-1.5 py-0.5 rounded-md"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <Star size={11} color={colors.primary} fill={colors.primary} />
              <Text
                className="text-[11px] font-bold ml-0.5"
                style={{ color: colors.primary }}
              >
                {store.rating.toFixed(1)}
              </Text>
            </View>
          </View>
          <Text
            className="text-[11px] mt-0.5"
            style={{ color: colors.textMuted }}
            numberOfLines={1}
          >
            {truncate(store.address, 38)}
          </Text>
          <View className="flex-row items-center mt-1.5">
            <View className="flex-row items-center mr-3">
              <Clock size={11} color={colors.textMuted} />
              <Text className="text-[11px] ml-0.5" style={{ color: colors.textMuted }}>
                {store.delivery_time_minutes} min
              </Text>
            </View>
            <View className="flex-row items-center mr-3">
              <Bike size={11} color={freeDelivery ? colors.primary : colors.textMuted} />
              <Text
                className="text-[11px] ml-0.5"
                style={{
                  color: freeDelivery ? colors.primary : colors.textMuted,
                  fontWeight: freeDelivery ? '600' : '400',
                }}
              >
                {deliveryLabel}
              </Text>
            </View>
            {distance && (
              <View className="flex-row items-center">
                <MapPin size={11} color={colors.textMuted} />
                <Text className="text-[11px] ml-0.5" style={{ color: colors.textMuted }}>
                  {distance}
                </Text>
              </View>
            )}
          </View>
          {(offer || freeDelivery) && (
            <View className="flex-row items-center mt-1.5">
              {offer ? (
                <View
                  className="flex-row items-center px-1.5 py-0.5 rounded-md mr-2"
                  style={{ backgroundColor: colors.warningLight }}
                >
                  <BadgePercent size={10} color={colors.warning} />
                  <Text
                    className="text-[10px] font-bold ml-0.5"
                    style={{ color: colors.warning }}
                  >
                    {offer}
                  </Text>
                </View>
              ) : null}
              {freeDelivery && (
                <View
                  className="flex-row items-center px-1.5 py-0.5 rounded-md"
                  style={{ backgroundColor: colors.primaryLight }}
                >
                  <Text
                    className="text-[10px] font-bold"
                    style={{ color: colors.primary }}
                  >
                    FREE DELIVERY
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => router.push(`/store/${store.id}`)}
      className="w-64 rounded-xl2 border mr-3 active:opacity-80"
      style={{
        backgroundColor: colors.surfaceElevated,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 1,
      }}
    >
      <View className="relative">
        <View
          className="w-full h-28 rounded-t-xl2 items-center justify-center overflow-hidden"
          style={{ backgroundColor: light }}
        >
          <Image source={getStoreImage(store.id)} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        </View>
        {/* Top badges */}
        <View className="absolute top-2 left-2 right-2 flex-row justify-between">
          {store.store_type ? (
            <View
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: accent + '20' }}
            >
              <Text
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: accent }}
              >
                {store.store_type}
              </Text>
            </View>
          ) : null}
          {promoted && (
            <View className="px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#101828' }}>
              <Text className="text-white text-[9px] font-bold">PROMOTED</Text>
            </View>
          )}
        </View>
        {/* Rating chip */}
        <View
          className="absolute bottom-2 right-2 flex-row items-center px-1.5 py-0.5 rounded-md"
          style={{ backgroundColor: colors.primary }}
        >
          <Star size={10} color="#fff" fill="#fff" />
          <Text
            className="text-[11px] font-bold ml-0.5"
            style={{ color: '#fff' }}
          >
            {store.rating.toFixed(1)}
          </Text>
        </View>
        {/* Free delivery ribbon */}
        {freeDelivery && (
          <View
            className="absolute bottom-2 left-2 flex-row items-center px-1.5 py-0.5 rounded-md"
            style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
          >
            <Zap size={9} color={colors.primary} fill={colors.primary} />
            <Text
              className="text-[9px] font-bold ml-0.5"
              style={{ color: colors.primary }}
            >
              FREE DEL
            </Text>
          </View>
        )}
        {!store.is_open && (
          <View className="absolute inset-0 bg-black/40 rounded-t-xl2 items-center justify-center">
            <Text className="text-white font-bold text-sm">CLOSED</Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <Text
          className="font-semibold text-sm"
          style={{ color: colors.text }}
          numberOfLines={1}
        >
          {store.name}
        </Text>
        <Text
          className="text-[11px] mt-0.5"
          style={{ color: colors.textMuted }}
          numberOfLines={2}
        >
          {store.description}
        </Text>

        <View className="flex-row items-center mt-2 flex-wrap">
          <View className="flex-row items-center mr-2">
            <Clock size={11} color={colors.textMuted} />
            <Text className="text-[11px] ml-0.5" style={{ color: colors.textMuted }}>
              {store.delivery_time_minutes} min
            </Text>
          </View>
          <View className="flex-row items-center mr-2">
            <Bike size={11} color={freeDelivery ? colors.primary : colors.textMuted} />
            <Text
              className="text-[11px] ml-0.5"
              style={{
                color: freeDelivery ? colors.primary : colors.textMuted,
                fontWeight: freeDelivery ? '600' : '400',
              }}
            >
              {deliveryLabel}
            </Text>
          </View>
          {distance && (
            <View className="flex-row items-center">
              <MapPin size={11} color={colors.textMuted} />
              <Text className="text-[11px] ml-0.5" style={{ color: colors.textMuted }}>
                {distance}
              </Text>
            </View>
          )}
        </View>

        {offer && (
          <View
            className="mt-2 flex-row items-center px-2 py-1.5 rounded-md"
            style={{ backgroundColor: colors.warningLight }}
          >
            <BadgePercent size={12} color={colors.warning} />
            <Text
              className="text-[10px] font-bold ml-1"
              style={{ color: colors.warning }}
            >
              {offer}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default StoreCard;
