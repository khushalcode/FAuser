import React from 'react';
import {
  View, Text, FlatList, Pressable, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { useUserStore } from '@/store/user';
import { api } from '@/lib/api';
import type { Product, Store } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';

export default function FavouritesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const favIds = useUserStore((s) => s.favouriteProductIds);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [storesMap, setStoresMap] = React.useState<Record<string, Store>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const all = await api.getProducts();
      const favs = all.filter((p) => favIds.includes(p.id));
      setProducts(favs);
      const stores = await api.getStores();
      const map: Record<string, Store> = {};
      stores.forEach((s) => (map[s.id] = s));
      setStoresMap(map);
      setLoading(false);
    })();
  }, [favIds]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View className="px-5 pt-2 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-2xl items-center justify-center bg-surface border border-lineLight mr-3" style={{ backgroundColor: colors.surface, borderColor: colors.borderLight }}>
          <ArrowLeft size={18} color={colors.text} />
        </Pressable>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-textmain text-[22px] font-extrabold tracking-tight" style={{ color: colors.text }}>Your Favourites</Text>
            {!loading && products.length > 0 && (
              <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.errorLight }}>
                <Text className="text-xs font-bold" style={{ color: colors.error }}>{products.length}</Text>
              </View>
            )}
          </View>
          <Text className="text-muted text-xs mt-0.5" style={{ color: colors.textMuted }}>{products.length} saved items</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
          <Text className="text-muted text-xs mt-2" style={{ color: colors.textMuted }}>Loading your favourites...</Text>
        </View>
      ) : products.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 rounded-full items-center justify-center" style={{ backgroundColor: colors.errorLight }}>
            <Heart size={42} color={colors.error} />
          </View>
          <Text className="text-textmain font-bold text-lg mt-4" style={{ color: colors.text }}>No favourites yet</Text>
          <Text className="text-muted text-sm mt-1 text-center" style={{ color: colors.textMuted }}>
            Tap the heart icon on any product to save it here for quick access.
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
      ) : (
        <FlatList
          data={products}
          keyExtractor={(i) => i.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <ProductCard product={item} store={storesMap[item.store_id]} variant="grid" />
          )}
        />
      )}
    </SafeAreaView>
  );
}
