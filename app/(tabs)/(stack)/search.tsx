import React from 'react';
import {
  View, Text, FlatList, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Search, X, TrendingUp, Store as StoreIcon, Package } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { api } from '@/lib/api';
import type { Store, Product } from '@/lib/types';
import { StoreCard } from '@/components/StoreCard';
import { ProductCard } from '@/components/ProductCard';
import { recentSearches as RECENT, trendingSearches as TRENDING } from '@/data/mock-data';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_KEY = 'foodmunch-customer-recent-searches';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = React.useState(params.q || '');
  const [tab, setTab] = React.useState<'products' | 'stores'>('products');
  const [results, setResults] = React.useState<{ stores: Store[]; products: Product[] }>({ stores: [], products: [] });
  const [loading, setLoading] = React.useState(false);
  const [recent, setRecent] = React.useState<string[]>(RECENT);
  const [hasSearched, setHasSearched] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const r = await AsyncStorage.getItem(RECENT_KEY);
      if (r) setRecent(JSON.parse(r));
    })();
  }, []);

  React.useEffect(() => {
    if (!query.trim()) {
      setResults({ stores: [], products: [] });
      setHasSearched(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await api.search(query);
      setResults(res);
      setHasSearched(true);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const saveRecent = async (q: string) => {
    const next = [q, ...recent.filter((r) => r !== q)].slice(0, 8);
    setRecent(next);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  const onSubmit = () => {
    if (query.trim()) saveRecent(query.trim());
  };

  const pickSuggestion = (q: string) => {
    setQuery(q);
    saveRecent(q);
  };

  const clearRecent = async () => {
    setRecent([]);
    await AsyncStorage.removeItem(RECENT_KEY);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Search bar */}
        <View className="px-5 pt-2 pb-3 flex-row items-center">
          <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-2xl items-center justify-center bg-surface border border-lineLight mr-3">
            <ArrowLeft size={18} color={colors.text} />
          </Pressable>
          <View className="flex-1 flex-row items-center bg-surface rounded-xl2 px-3.5 py-2.5 border border-line">
            <Search size={18} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              autoFocus
              onSubmitEditing={onSubmit}
              placeholder="Search stores, dishes, groceries..."
              placeholderTextColor={colors.textMuted}
              className="flex-1 ml-2 text-sm text-textmain"
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')}>
                <X size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        {!hasSearched ? (
          // Suggestions
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
            {recent.length > 0 && (
              <View className="mb-5">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-textmain text-sm font-bold">Recent Searches</Text>
                  <Pressable onPress={clearRecent}>
                    <Text className="text-muted text-xs">Clear</Text>
                  </Pressable>
                </View>
                <View className="flex-row flex-wrap">
                  {recent.map((r) => (
                    <Pressable
                      key={r}
                      onPress={() => pickSuggestion(r)}
                      className="px-3 py-1.5 rounded-full mr-2 mb-2 border border-line bg-white"
                    >
                      <Text className="text-textmain text-xs">{r}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <View>
              <View className="flex-row items-center mb-2">
                <TrendingUp size={14} color={colors.warning} />
                <Text className="text-textmain text-sm font-bold ml-1.5">Trending Searches</Text>
              </View>
              <View className="flex-row flex-wrap">
                {TRENDING.map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => pickSuggestion(t)}
                    className="flex-row items-center px-3 py-1.5 rounded-full mr-2 mb-2"
                    style={{ backgroundColor: colors.warningLight }}
                  >
                    <TrendingUp size={11} color={colors.warning} />
                    <Text className="text-warning text-xs font-medium ml-1">{t}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        ) : (
          // Results
          <>
            <View className="px-5 mb-2">
              <View className="flex-row bg-surface rounded-xl2 p-1 border border-line">
                {(['products', 'stores'] as const).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setTab(t)}
                    className="flex-1 py-2.5 rounded-xl items-center flex-row justify-center"
                    style={{ backgroundColor: tab === t ? '#fff' : 'transparent', elevation: tab === t ? 2 : 0, shadowColor: '#0F172A', shadowOpacity: tab === t ? 0.08 : 0, shadowRadius: 4 }}
                  >
                    {t === 'products' ? <Package size={13} color={tab === t ? colors.primary : colors.textMuted} /> : <StoreIcon size={13} color={tab === t ? colors.primary : colors.textMuted} />}
                    <Text className="ml-1.5 text-sm font-semibold capitalize" style={{ color: tab === t ? colors.primary : colors.textMuted }}>
                      {t} {tab === t ? `(${t === 'products' ? results.products.length : results.stores.length})` : ''}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {loading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : tab === 'products' ? (
              results.products.length === 0 ? (
                <EmptyState query={query} />
              ) : (
                <FlatList
                  data={results.products}
                  keyExtractor={(i) => i.id}
                  numColumns={2}
                  contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                  columnWrapperStyle={{ justifyContent: 'space-between' }}
                  renderItem={({ item }) => <ProductCard product={item} variant="grid" />}
                />
              )
            ) : results.stores.length === 0 ? (
              <EmptyState query={query} />
            ) : (
              <FlatList
                data={results.stores}
                keyExtractor={(i) => i.id}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                renderItem={({ item }) => <StoreCard store={item} variant="list" />}
              />
            )}
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-5xl">🔍</Text>
      <Text className="text-textmain font-bold text-base mt-3">No results for "{query}"</Text>
      <Text className="text-muted text-xs mt-1 text-center">
        Try a different keyword or check the spelling.
      </Text>
    </View>
  );
}
