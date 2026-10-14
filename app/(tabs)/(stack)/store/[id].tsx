import React from 'react';
import {
  View, Text, ScrollView, Pressable, ActivityIndicator,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft, Star, Clock, Bike, MapPin, Search, Heart, Share2, ShoppingBag
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { api } from '@/lib/api';
import type { Store, Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { formatCurrency } from '@/utils/format';

function storeVisual(store: Store): { accent: string; light: string; emoji: string } {
  const t = (store.store_type || '').toLowerCase();
  if (t.includes('grocery') || t.includes('super') || t.includes('mart')) {
    return { accent: colors.primary, light: colors.primaryLight, emoji: '🏪' };
  }
  if (t.includes('cafe') || t.includes('coffee')) {
    return { accent: '#8B5CF6', light: '#EDE9FE', emoji: '☕' };
  }
  return { accent: colors.warning, light: colors.warningLight, emoji: '🍽️' };
}

export default function StoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [store, setStore] = React.useState<Store | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState('');
  const [activeCat, setActiveCat] = React.useState<string>('all');

  React.useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      const [s, p] = await Promise.all([
        api.getStore(id),
        api.getProducts({ storeId: id })
      ]);
      setStore(s || null);
      setProducts(p);
      // derive categories from products (unified — no module_type filter)
      const catIds = Array.from(new Set(p.map((x) => x.category_id)));
      const all = await api.getCategories();
      setCategories(all.filter((c) => catIds.includes(c.id)));
      setLoading(false);
    })();
  }, [id]);

  if (loading || !store) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const { accent, light, emoji } = storeVisual(store);
  const filtered = products.filter((p) => {
    if (activeCat !== 'all' && p.category_id !== activeCat) return false;
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const onShare = async () => {
    try {
      const Share = await import('react-native').then(m => m.Share);
      await Share.share({ message: `Check out ${store.name} on Food Munch! ${store.address}` });
    } catch (e) {}
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4 pt-2">
        <Pressable onPress={() => router.back()} className="w-9 h-9 rounded-full items-center justify-center bg-white" style={{ elevation: 2, shadowColor: '#0F172A', shadowOpacity: 0.1, shadowRadius: 4 }}>
          <ArrowLeft size={18} color={colors.text} />
        </Pressable>
        <View className="flex-row">
          <Pressable onPress={onShare} className="w-9 h-9 rounded-full items-center justify-center bg-white mr-2" style={{ elevation: 2, shadowColor: '#0F172A', shadowOpacity: 0.1, shadowRadius: 4 }}>
            <Share2 size={16} color={colors.text} />
          </Pressable>
          <Pressable className="w-9 h-9 rounded-full items-center justify-center bg-white" style={{ elevation: 2, shadowColor: '#0F172A', shadowOpacity: 0.1, shadowRadius: 4 }}>
            <Heart size={16} color={colors.error} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover */}
        <View
          className="h-44 items-center justify-center"
          style={{ backgroundColor: light }}
        >
          <Text className="text-6xl">{emoji}</Text>
          {store.store_type ? (
            <View className="absolute top-3 left-3 px-2 py-0.5 rounded-full" style={{ backgroundColor: accent + '20' }}>
              <Text className="text-[10px] font-bold uppercase tracking-wide" style={{ color: accent }}>
                {store.store_type}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Store info */}
        <View className="bg-white px-5 py-4 border-b border-line">
          <Text className="text-textmain text-[22px] font-extrabold tracking-tight">{store.name}</Text>
          <Text className="text-muted text-sm mt-0.5">{store.description}</Text>

          <View className="flex-row items-center mt-3 flex-wrap">
            <View className="flex-row items-center px-2 py-1 rounded-md mr-2 mb-1" style={{ backgroundColor: colors.primaryLight }}>
              <Star size={12} color={colors.primary} fill={colors.primary} />
              <Text className="text-primary text-xs font-bold ml-0.5">{store.rating.toFixed(1)}</Text>
              <Text className="text-primary text-[10px] ml-1">({store.reviews_count})</Text>
            </View>
            <View className="flex-row items-center mr-3 mb-1">
              <Clock size={12} color={colors.textMuted} />
              <Text className="text-muted text-xs ml-0.5">{store.delivery_time_minutes} min</Text>
            </View>
            <View className="flex-row items-center mr-3 mb-1">
              <Bike size={12} color={colors.textMuted} />
              <Text className="text-muted text-xs ml-0.5">{formatCurrency(store.delivery_fee)} delivery</Text>
            </View>
            <View className="flex-row items-center mb-1">
              <ShoppingBag size={12} color={colors.textMuted} />
              <Text className="text-muted text-xs ml-0.5">Min {formatCurrency(store.minimum_order)}</Text>
            </View>
          </View>

          <View className="flex-row items-center mt-3 pt-3 border-t border-lineLight">
            <MapPin size={12} color={colors.textMuted} />
            <Text className="text-muted text-xs ml-1 flex-1">{store.address}</Text>
            {!store.is_open && (
              <Text className="text-xs font-semibold" style={{ color: colors.error }}>Closed now</Text>
            )}
          </View>
        </View>

        {/* Search within store */}
        <View className="px-5 pt-4">
          <View className="flex-row items-center bg-surface rounded-xl2 px-3.5 py-2.5 border border-line">
            <Search size={16} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={`Search in ${store.name}...`}
              placeholderTextColor={colors.textMuted}
              className="flex-1 ml-2 text-sm text-textmain"
            />
          </View>
        </View>

        {/* Category strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}>
          <CatChip label="All" active={activeCat === 'all'} onPress={() => setActiveCat('all')} />
          {categories.map((c) => (
            <CatChip
              key={c.id}
              label={c.name}
              active={activeCat === c.id}
              onPress={() => setActiveCat(c.id)}
            />
          ))}
        </ScrollView>

        {/* Products grid */}
        <View className="px-5 flex-row flex-wrap justify-between pb-32">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} store={store} variant="grid" />
          ))}
        </View>

        {filtered.length === 0 && (
          <View className="items-center py-12">
            <Text className="text-3xl">🔍</Text>
            <Text className="text-textmain font-semibold text-sm mt-2">No items found</Text>
            <Text className="text-muted text-xs">Try a different search or category</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CatChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="px-3.5 py-1.5 rounded-full mr-2"
      style={{ backgroundColor: active ? colors.primary : colors.surface, borderWidth: 1, borderColor: active ? colors.primary : colors.border }}
    >
      <Text className="text-xs font-semibold" style={{ color: active ? '#fff' : colors.textMuted }}>
        {label}
      </Text>
    </Pressable>
  );
}
