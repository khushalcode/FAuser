import { Platform } from 'react-native';
import React from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, ScrollView, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, TrendingUp } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { api } from '@/lib/api';
import type { Category, Store } from '@/lib/types';
import { StoreCard } from '@/components/StoreCard';

const EMOJI: Record<string, string> = {
  biryani: '🍚', pizza: '🍕', burgers: '🍔', 'north-indian': '🍛',
  'south-indian': '🥞', chinese: '🍜', desserts: '🍰', beverages: '🥤',
  'fruits-vegetables': '🥕', 'dairy-eggs': '🥛', 'atta-rice-dal': '🌾',
  snacks: '🍿', 'packaged-beverages': '🥤', 'personal-care': '🧴',
  household: '🧹', 'frozen-foods': '🧊', 'sweets-chocolates': '🍫',
  'chicken-meat-fish': '🍗', 'oil-ghee-masala': '🫗', 'dry-fruits': '🥜',
  'instant-food': '🍜', 'sauces-spreads': '🧴', 'tea-coffee': '☕',
  'paan-corner': '🍃',
};

const GROUPS = [
  { key: 'all', label: 'All', icon: '🛍️' },
  { key: 'food', label: 'Food', icon: '🍲' },
  { key: 'grocery', label: 'Grocery', icon: '🥬' },
] as const;

export default function CategoriesScreen() {
  const router = useRouter();
  const [cats, setCats] = React.useState<Category[]>([]);
  const [stores, setStores] = React.useState<Store[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeGroup, setActiveGroup] = React.useState<'all' | 'food' | 'grocery'>('all');

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: Platform.OS !== 'web'
    }).start();
  }, []);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [c, s] = await Promise.all([api.getCategories(), api.getStores()]);
        setCats(c);
        setStores(s);
      } catch (e) {
        console.warn('[categories] load failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = activeGroup === 'all' ? cats : cats.filter((c) => c.group === activeGroup);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        {/* Header */}
        <View className="px-5 pt-2 pb-3">
          <Text className="text-textmain text-[22px] font-extrabold tracking-tight">All Categories</Text>
          <Text className="text-muted text-sm mt-0.5">Browse all food and grocery categories</Text>
        </View>

        {/* Search bar */}
        <Pressable
          onPress={() => router.push('/search')}
          className="mx-5 mb-3 flex-row items-center bg-surface rounded-xl2 px-3.5 py-3 border border-line"
        >
          <Search size={18} color={colors.textMuted} />
          <Text className="ml-2.5 text-sm" style={{ color: colors.textMuted }}>
            Search categories or items...
          </Text>
        </Pressable>

        {/* Group filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, flexShrink: 0, marginBottom: 12 }}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {GROUPS.map((g) => {
            const active = activeGroup === g.key;
            return (
              <Pressable
                key={g.key}
                onPress={() => setActiveGroup(g.key as 'all' | 'food' | 'grocery')}
                className="flex-row items-center mr-2.5 px-3.5 py-2 rounded-full"
                style={{
                  backgroundColor: active ? colors.primary : colors.surfaceAlt,
                }}
              >
                <Text style={{ fontSize: 14, marginRight: 6 }}>{g.icon}</Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: active ? '#fff' : colors.textMuted,
                  }}
                >
                  {g.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.primary} size="large" />
            <Text className="text-muted text-xs mt-2">Loading categories...</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(i) => i.id}
            numColumns={2}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            ListHeaderComponent={
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                  {activeGroup === 'all' ? '🛍️ All Categories' : activeGroup === 'food' ? '🍲 Food' : '🥬 Grocery'}
                </Text>
              </View>
            }
            ListFooterComponent={
              <View style={{ marginTop: 20 }}>
                {/* Trending stores */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingHorizontal: 4 }}>
                  <TrendingUp size={16} color={colors.warning} />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginLeft: 6 }}>
                    Trending Stores
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginLeft: 6 }}>
                    Most ordered this week
                  </Text>
                </View>
                {stores.slice(0, 5).map((s) => (
                  <StoreCard key={s.id} store={s} variant="list" distance="1.2 km" offer="50% OFF" />
                ))}
              </View>
            }
            renderItem={({ item, index }) => {
              const accent = item.group === 'grocery' ? colors.primary : colors.warning;
              return (
                <Animated.View
                  style={{
                    width: '48%',
                    marginBottom: 12,
                    opacity: fadeAnim,
                    transform: [{
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0],
                      })
                    }],
                  }}
                >
                  <Pressable
                    onPress={() => router.push(`/search?q=${encodeURIComponent(item.name)}`)}
                    className="bg-white rounded-xl2 border border-line p-4 active:opacity-80"
                    style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
                  >
                    <View
                      className="w-14 h-14 rounded-2xl items-center justify-center"
                      style={{ backgroundColor: accent + '15' }}
                    >
                      <Text className="text-3xl">{EMOJI[item.slug] || '📦'}</Text>
                    </View>
                    <Text className="text-textmain font-semibold text-sm mt-2.5" numberOfLines={2}>
                      {item.name}
                    </Text>
                    <View className="flex-row items-center mt-1.5">
                      {item.group && (
                        <View className="px-1.5 py-0.5 rounded mr-1.5" style={{ backgroundColor: accent + '15' }}>
                          <Text className="text-[10px] font-bold uppercase" style={{ color: accent }}>
                            {item.group}
                          </Text>
                        </View>
                      )}
                      <Text className="text-muted text-[11px]">{item.items_count} items</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            }}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}
