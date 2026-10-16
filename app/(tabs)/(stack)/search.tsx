import React from 'react';
import {
  View, Text, FlatList, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Switch, LayoutAnimation, Alert, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft, Search, X, TrendingUp, Store as StoreIcon, Package,
  Mic, Leaf, Clock, Sparkles, ChevronRight, RefreshCw
} from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { api } from '@/lib/api';
import { useUserStore } from '@/store/user';
import type { Store, Product } from '@/lib/types';
import { StoreCard } from '@/components/StoreCard';
import { ProductCard } from '@/components/ProductCard';
import { recentSearches as RECENT, trendingSearches as TRENDING } from '@/data/mock-data';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_KEY = 'foodmunch-customer-recent-searches';
const POPULAR_ITEMS = ['milk', 'bread', 'eggs', 'bananas', 'atta', 'rice', 'oil', 'chips', 'cola', 'biscuits'];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const colors = useThemeColors();
  const [query, setQuery] = React.useState(params.q || '');
  const [tab, setTab] = React.useState<'products' | 'stores'>('products');
  const [results, setResults] = React.useState<{ stores: Store[]; products: Product[] }>({ stores: [], products: [] });
  const [loading, setLoading] = React.useState(false);
  const [recent, setRecent] = React.useState<string[]>(RECENT);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [vegOnly, setVegOnly] = React.useState(false);
  const [listening, setListening] = React.useState(false);

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
      let res = await api.search(query);
      // Apply veg filter
      if (vegOnly) {
        res = {
          ...res,
          products: res.products.filter(p => p.is_veg === true || p.tags?.includes('veg')),
        };
      }
      setResults(res);
      setHasSearched(true);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query, vegOnly]);

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

  const onVoiceSearch = () => {
    setListening(true);
    // Simulate voice search — in production this would use expo-speech-recognition
    setTimeout(() => {
      setListening(false);
      Alert.alert(
        'Voice Search',
        'Voice search requires microphone permission. Would you like to enable it?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setListening(false) },
          { text: 'Type instead', onPress: () => {} }
        ]
      );
    }, 1500);
  };

  // "Did you mean?" — find closest matches from popular items
  const didYouMean = React.useMemo(() => {
    if (!query.trim() || results.products.length > 0 || results.stores.length > 0) return [];
    const q = query.toLowerCase().trim();
    return POPULAR_ITEMS.filter(item => {
      // simple fuzzy: shares a substring or has Levenshtein-ish similarity
      return item.includes(q) || q.includes(item) ||
        item.split('').some(c => q.includes(c) && q.length > 2);
    }).slice(0, 4);
  }, [query, results]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Search bar */}
        <View className="px-5 pt-2 pb-3 flex-row items-center">
          <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-2xl items-center justify-center bg-surface border border-lineLight mr-3" style={{ backgroundColor: colors.surface, borderColor: colors.borderLight }}>
            <ArrowLeft size={18} color={colors.text} />
          </Pressable>
          <View className="flex-1 flex-row items-center bg-surface rounded-xl2 px-3.5 py-2.5 border border-line" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <Search size={18} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              autoFocus
              onSubmitEditing={onSubmit}
              placeholder="Search for atta, dal, coke and more..."
              placeholderTextColor={colors.textMuted}
              className="flex-1 ml-2 text-sm text-textmain"
              style={{ color: colors.text }}
              returnKeyType="search"
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery('')}>
                <X size={16} color={colors.textMuted} />
              </Pressable>
            ) : (
              <Pressable onPress={onVoiceSearch} className="ml-1">
                <Mic size={18} color={listening ? colors.error : colors.primary} fill={listening ? colors.error : 'none'} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Veg toggle + voice status */}
        {listening ? (
          <View className="mx-5 mb-3 p-3 rounded-xl2 flex-row items-center" style={{ backgroundColor: colors.errorLight }}>
            <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.error }} />
            <Text className="text-sm font-medium" style={{ color: colors.error }}>Listening...</Text>
            <Pressable onPress={() => setListening(false)} className="ml-auto">
              <X size={16} color={colors.error} />
            </Pressable>
          </View>
        ) : (
          <View className="px-5 mb-2 flex-row items-center justify-between">
            <Pressable
              onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setVegOnly(!vegOnly); }}
              className="flex-row items-center"
            >
              <View
                className="flex-row items-center px-3 py-1.5 rounded-full border"
                style={{
                  backgroundColor: vegOnly ? colors.successLight : colors.surface,
                  borderColor: vegOnly ? colors.success : colors.border,
                }}
              >
                <Leaf size={13} color={vegOnly ? colors.success : colors.textMuted} fill={vegOnly ? colors.success : 'none'} />
                <Text className="text-xs font-semibold ml-1.5" style={{ color: vegOnly ? colors.success : colors.textMuted }}>
                  VEG ONLY
                </Text>
              </View>
            </Pressable>
            {vegOnly && (
              <Text className="text-[11px]" style={{ color: colors.textMuted }}>Showing vegetarian items only</Text>
            )}
          </View>
        )}

        {!hasSearched ? (
          // Suggestions
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
            {/* Reorder banner */}
            <View className="rounded-2xl p-4 mb-5 flex-row items-center" style={{ backgroundColor: colors.primaryLight }}>
              <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: colors.primary }}>
                <RefreshCw size={18} color="#fff" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-sm font-bold" style={{ color: colors.text }}>Reordering will be easy</Text>
                <Text className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>Your past purchases appear here for quick reorder.</Text>
              </View>
            </View>

            {recent.length > 0 && (
              <View className="mb-5">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <Clock size={14} color={colors.textMuted} />
                    <Text className="text-textmain text-sm font-bold ml-1.5" style={{ color: colors.text }}>Recent Searches</Text>
                  </View>
                  <Pressable onPress={clearRecent}>
                    <Text className="text-muted text-xs" style={{ color: colors.textMuted }}>Clear</Text>
                  </Pressable>
                </View>
                <View className="flex-row flex-wrap">
                  {recent.map((r) => (
                    <Pressable
                      key={r}
                      onPress={() => pickSuggestion(r)}
                      className="flex-row items-center px-3 py-1.5 rounded-full mr-2 mb-2 border border-line"
                      style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
                    >
                      <Clock size={11} color={colors.textMuted} />
                      <Text className="text-textmain text-xs ml-1.5" style={{ color: colors.text }}>{r}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <TrendingUp size={14} color={colors.warning} />
                <Text className="text-textmain text-sm font-bold ml-1.5" style={{ color: colors.text }}>Trending Searches</Text>
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
                    <Text className="text-warning text-xs font-medium ml-1" style={{ color: colors.warning }}>{t}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Popular items */}
            <View>
              <View className="flex-row items-center mb-2">
                <Sparkles size={14} color={colors.info} />
                <Text className="text-textmain text-sm font-bold ml-1.5" style={{ color: colors.text }}>Popular Items</Text>
              </View>
              <View className="flex-row flex-wrap">
                {POPULAR_ITEMS.map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => pickSuggestion(p)}
                    className="px-3 py-1.5 rounded-full mr-2 mb-2"
                    style={{ backgroundColor: colors.infoLight }}
                  >
                    <Text className="text-xs font-medium capitalize" style={{ color: colors.info }}>{p}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        ) : (
          // Results
          <>
            <View className="px-5 mb-2">
              <View className="flex-row bg-surface rounded-xl2 p-1 border border-line" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                {(['products', 'stores'] as const).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setTab(t)}
                    className="flex-1 py-2.5 rounded-xl items-center flex-row justify-center"
                    style={{ backgroundColor: tab === t ? colors.surfaceElevated : 'transparent', elevation: tab === t ? 2 : 0, shadowColor: '#000', shadowOpacity: tab === t ? 0.08 : 0, shadowRadius: 4 }}
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
                <Text className="text-xs mt-2" style={{ color: colors.textMuted }}>Searching for "{query}"...</Text>
              </View>
            ) : tab === 'products' ? (
              results.products.length === 0 ? (
                <EmptyState query={query} didYouMean={didYouMean} onPick={pickSuggestion} vegOnly={vegOnly} colors={colors} />
              ) : (
                <FlatList
                  data={results.products}
                  keyExtractor={(i) => i.id}
                  numColumns={2}
                  contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                  columnWrapperStyle={{ justifyContent: 'space-between' }}
                  ListHeaderComponent={vegOnly ? (
                    <View className="mb-2 px-1 flex-row items-center">
                      <Leaf size={12} color={colors.success} fill={colors.success} />
                      <Text className="text-[11px] ml-1.5" style={{ color: colors.success }}>{results.products.length} vegetarian items found</Text>
                    </View>
                  ) : null}
                  renderItem={({ item }) => <ProductCard product={item} variant="grid" />}
                />
              )
            ) : results.stores.length === 0 ? (
              <EmptyState query={query} didYouMean={didYouMean} onPick={pickSuggestion} vegOnly={vegOnly} colors={colors} />
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

function EmptyState({ query, didYouMean, onPick, vegOnly, colors }: { query: string; didYouMean: string[]; onPick: (q: string) => void; vegOnly: boolean; colors: any }) {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View className="flex-1 items-center justify-center py-12">
        <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: colors.surfaceAlt }}>
          <Search size={36} color={colors.textMuted} />
        </View>
        <Text className="font-bold text-base" style={{ color: colors.text }}>No results for "{query}"</Text>
        <Text className="text-xs mt-2 text-center" style={{ color: colors.textMuted }}>
          {vegOnly
            ? "We couldn't find vegetarian items matching your search. Try a different keyword or turn off the VEG filter."
            : "Try a different keyword, check the spelling, or browse popular items below."}
        </Text>
      </View>

      {/* Did you mean? */}
      {didYouMean.length > 0 && (
        <View className="mb-5">
          <View className="flex-row items-center mb-2">
            <Sparkles size={14} color={colors.info} />
            <Text className="text-sm font-bold ml-1.5" style={{ color: colors.text }}>Did you mean?</Text>
          </View>
          <View className="flex-row flex-wrap">
            {didYouMean.map((s) => (
              <Pressable
                key={s}
                onPress={() => onPick(s)}
                className="flex-row items-center px-3 py-1.5 rounded-full mr-2 mb-2 border"
                style={{ backgroundColor: colors.infoLight, borderColor: colors.info }}
              >
                <ChevronRight size={11} color={colors.info} />
                <Text className="text-xs font-semibold capitalize ml-0.5" style={{ color: colors.info }}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Browse popular */}
      <View>
        <Text className="text-sm font-bold mb-2" style={{ color: colors.text }}>Browse Popular</Text>
        <View className="flex-row flex-wrap">
          {POPULAR_ITEMS.map((p) => (
            <Pressable
              key={p}
              onPress={() => onPick(p)}
              className="px-3 py-1.5 rounded-full mr-2 mb-2"
              style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}
            >
              <Text className="text-xs font-medium capitalize" style={{ color: colors.text }}>{p}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Help link */}
      <Pressable
        onPress={() => {}}
        className="mt-6 py-3 items-center"
      >
        <Text className="text-xs" style={{ color: colors.textMuted }}>
          Can't find what you're looking for?{' '}
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Chat with us</Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}
