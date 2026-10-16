import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Store as StoreIcon, ChevronRight, Bike, Star } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { Pressable as SafePressable } from '@/components/SafePressable';
import { api } from '@/lib/api';
import type { Store } from '@/lib/types';

interface RestaurantsDeliveringBannerProps {
  onPress?: () => void;
}

/**
 * "X Restaurants Delivering To You" banner — shows a count of open
 * stores near the user + a horizontal preview of store cards.
 * Inspired by reference app recordings.
 */
export function RestaurantsDeliveringBanner({ onPress }: RestaurantsDeliveringBannerProps) {
  const router = useRouter();
  const colors = useThemeColors();
  const [stores, setStores] = React.useState<Store[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const s = await api.getStores();
        setStores(s.filter(st => st.is_open !== false).slice(0, 8));
      } catch (e) {}
    })();
  }, []);

  const count = stores.length || 7; // fallback

  return (
    <View style={{ marginHorizontal: 16, marginTop: 14 }}>
      {/* Count banner */}
      <SafePressable
        onPress={() => onPress?.() || router.push('/search')}
        style={{
          borderRadius: 16,
          backgroundColor: colors.primaryLight,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View style={{
          width: 44, height: 44, borderRadius: 12,
          backgroundColor: colors.primary,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <StoreIcon size={22} color="#fff" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>
            {count} Restaurants Delivering To You
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Bike size={11} color={colors.primary} />
            <Text style={{ color: colors.textMuted, fontSize: 11, marginLeft: 3 }}>
              Open now • 8 min avg delivery
            </Text>
          </View>
        </View>
        <View style={{
          backgroundColor: colors.primary, borderRadius: 20,
          paddingHorizontal: 12, paddingVertical: 6,
          flexDirection: 'row', alignItems: 'center',
        }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>See all</Text>
          <ChevronRight size={12} color="#fff" />
        </View>
      </SafePressable>

      {/* Horizontal store preview */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingRight: 16 }}
      >
        {stores.slice(0, 6).map((store) => (
          <SafePressable
            key={store.id}
            onPress={() => router.push(`/store/${store.id}`)}
            style={{
              width: 140,
              marginRight: 10,
              borderRadius: 14,
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
            }}
          >
            <View style={{
              height: 70,
              backgroundColor: colors.surfaceAlt,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <StoreIcon size={28} color={colors.textSubtle} />
            </View>
            <View style={{ padding: 8 }}>
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }} numberOfLines={1}>
                {store.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                <View style={{
                  backgroundColor: colors.successLight, borderRadius: 4,
                  paddingHorizontal: 4, paddingVertical: 1,
                  flexDirection: 'row', alignItems: 'center',
                }}>
                  <Star size={8} color={colors.success} fill={colors.success} />
                  <Text style={{ color: colors.success, fontSize: 9, fontWeight: '700', marginLeft: 2 }}>
                    {store.rating?.toFixed(1) || '4.0'}
                  </Text>
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 9, marginLeft: 4 }}>
                  {store.delivery_time_minutes || 8} min
                </Text>
              </View>
              <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '600', marginTop: 3 }}>
                FREE DELIVERY
              </Text>
            </View>
          </SafePressable>
        ))}
      </ScrollView>
    </View>
  );
}
