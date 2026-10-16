import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ShoppingBag, Clock, TrendingUp, ChevronRight } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { Pressable as SafePressable } from '@/components/SafePressable';
import { api } from '@/lib/api';
import type { Product } from '@/lib/types';
import { getProductImage } from '@/utils/images';

interface ValueMealsBannerProps {
  onPress?: () => void;
}

/**
 * "99 Store" / Value Meals banner — inspired by the ₹99 store concept
 * shown in reference app recordings. Shows a hero card + horizontal
 * scroll of budget meal items under ₹99.
 */
export function ValueMealsBanner({ onPress }: ValueMealsBannerProps) {
  const router = useRouter();
  const colors = useThemeColors();
  const [items, setItems] = React.useState<Product[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const all = await api.getProducts();
        const cheap = all.filter(p => p.price <= 99).slice(0, 8);
        setItems(cheap.length >= 4 ? cheap : all.slice(0, 8));
      } catch (e) {}
    })();
  }, []);

  const handlePress = () => {
    onPress?.() || router.push('/search?q=99%20store');
  };

  return (
    <View style={{ marginHorizontal: 16, marginTop: 14 }}>
      {/* Hero header banner */}
      <Pressable onPress={handlePress}>
        <View
          style={{
            borderRadius: 18,
            overflow: 'hidden',
            backgroundColor: '#FF7A00',
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#FF7A00',
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>99 STORE</Text>
              </View>
              <View style={{ backgroundColor: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 }}>
                <Text style={{ color: '#FF7A00', fontSize: 10, fontWeight: '800' }}>FREE DELIVERY</Text>
              </View>
            </View>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', lineHeight: 22 }}>
              Meals at ₹99 + Free Delivery
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 4, lineHeight: 16 }}>
              Budget-friendly eats delivered hot. Snacks, meals & combos under ₹99.
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#FF7A00', fontSize: 12, fontWeight: '700' }}>Explore ₹99 Meals</Text>
                <ChevronRight size={13} color="#FF7A00" />
              </View>
            </View>
          </View>
          <View style={{ width: 70, height: 70, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={32} color="#fff" />
          </View>
        </View>
      </Pressable>

      {/* Horizontal scroll of items */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingRight: 16 }}
      >
        {items.length === 0 ? (
          <View style={{ paddingVertical: 16, paddingHorizontal: 8 }}>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>Loading value meals...</Text>
          </View>
        ) : (
          items.map((item) => (
            <SafePressable
              key={item.id}
              onPress={() => router.push(`/product/${item.id}`)}
              style={{
                width: 120,
                marginRight: 10,
                borderRadius: 14,
                backgroundColor: colors.surfaceElevated,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: 'hidden',
              }}
            >
              <View style={{ height: 80, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                <Image
                  source={getProductImage(item.name)}
                  style={{ width: 70, height: 70 }}
                  contentFit="contain"
                />
              </View>
              <View style={{ padding: 8 }}>
                <Text style={{ color: colors.text, fontSize: 11, fontWeight: '600' }} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '800' }}>
                    ₹{item.price}
                  </Text>
                  {item.discount_price && item.discount_price > 0 && item.discount_price < item.price && (
                    <Text style={{ color: colors.textMuted, fontSize: 10, marginLeft: 4, textDecorationLine: 'line-through' }}>
                      ₹{item.discount_price}
                    </Text>
                  )}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Clock size={9} color={colors.textMuted} />
                  <Text style={{ color: colors.textMuted, fontSize: 9, marginLeft: 2 }}>8 min</Text>
                  {item.rating && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 6 }}>
                      <Text style={{ color: colors.warning, fontSize: 9 }}>★ {item.rating.toFixed(1)}</Text>
                    </View>
                  )}
                </View>
              </View>
            </SafePressable>
          ))
        )}
      </ScrollView>

      {/* Quick filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingTop: 8, paddingRight: 16 }}>
        {['Under ₹49', '₹49-₹99', 'Snacks', 'Beverages', 'Combos'].map((chip) => (
          <SafePressable
            key={chip}
            onPress={() => router.push(`/search?q=${encodeURIComponent(chip)}`)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              marginRight: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <TrendingUp size={10} color={colors.warning} />
            <Text style={{ color: colors.text, fontSize: 11, fontWeight: '600', marginLeft: 4 }}>{chip}</Text>
          </SafePressable>
        ))}
      </ScrollView>
    </View>
  );
}
