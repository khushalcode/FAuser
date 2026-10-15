import React from 'react';
import {
  View, Text, ScrollView, Pressable, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft, Star, Heart, Share2, Clock, Minus, Plus, ShoppingBag, ChevronRight
} from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { api } from '@/lib/api';
import type { Product, Store, Review } from '@/lib/types';
import { useCartStore } from '@/store/cart';
import { useUserStore } from '@/store/user';
import { ProductCard } from '@/components/ProductCard';
import {
  formatCurrency, formatDiscountPercent, effectivePrice, formatDate, truncate
} from '@/utils/format';
import { hapticImpact, hapticNotify } from '@/utils/platform';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [store, setStore] = React.useState<Store | null>(null);
  const [related, setRelated] = React.useState<Product[]>([]);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [quantity, setQuantity] = React.useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const toggleFav = useUserStore((s) => s.toggleFavourite);
  const isFav = useUserStore((s) => s.favouriteProductIds.includes(id || ''));

  React.useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      const p = await api.getProduct(id);
      setProduct(p || null);
      if (p) {
        const [s, rel, rev] = await Promise.all([
          api.getStore(p.store_id),
          api.getRelatedProducts(p.id),
          api.getProductReviews(p.id)
        ]);
        setStore(s || null);
        setRelated(rel);
        setReviews(rev);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading || !product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <Header onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const effPrice = effectivePrice(product.price, product.discount_price);
  const discountPct = formatDiscountPercent(product.price, product.discount_price);
  const isFood = !product.brand && product.prep_time_minutes !== undefined;
  const accent = isFood ? colors.warning : colors.primary;
  const coverLight = isFood ? colors.warningLight : colors.primaryLight;
  const coverEmoji = isFood ? '🍽️' : '🛒';

  const onAddToCart = (qty?: number) => {
    if (!store) return;
    const res = addItem(product, store, qty ?? quantity);
    if (!res.added && res.reason) {
      Alert.alert(
        'Replace cart items?',
        res.reason,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace',
            style: 'destructive',
            onPress: () => {
              useCartStore.getState().clear();
              addItem(product, store, qty ?? quantity);
              hapticNotify('success');
            }
          }
        ]
      );
      return;
    }
    hapticNotify('success');
  };

  const onBuyNow = () => {
    onAddToCart(1);
    router.push('/checkout');
  };

  const onShare = async () => {
    try {
      const Share = await import('react-native').then(m => m.Share);
      await Share.share({ message: `Check out ${product.name} on Food Munch! Just ${formatCurrency(effPrice)}` });
    } catch (e) {}
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Header
        onBack={() => router.back()}
        onShare={onShare}
        onFav={() => { hapticImpact('light'); toggleFav(product.id); }}
        isFav={isFav}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View
          className="h-72 items-center justify-center"
          style={{ backgroundColor: coverLight }}
        >
          <Text className="text-7xl">{coverEmoji}</Text>
          {discountPct > 0 && (
            <View
              className="absolute top-3 left-3 px-2.5 py-1 rounded-md"
              style={{ backgroundColor: colors.error }}
            >
              <Text className="text-white text-xs font-bold">{discountPct}% OFF</Text>
            </View>
          )}
          {isFood && (
            <View
              className="absolute top-3 right-3 w-5 h-5 rounded items-center justify-center"
              style={{ backgroundColor: '#fff', borderColor: product.is_veg ? colors.success : colors.error, borderWidth: 1.5 }}
            >
              <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: product.is_veg ? colors.success : colors.error }} />
            </View>
          )}
        </View>

        <View className="bg-white px-5 py-4" style={{ backgroundColor: colors.surfaceElevated }}>
          {product.brand && (
            <Text className="text-[11px] text-muted uppercase tracking-wide font-medium" style={{ color: colors.textMuted }}>
              {product.brand}
            </Text>
          )}
          <Text className="text-textmain text-[22px] font-extrabold tracking-tight mt-0.5" style={{ color: colors.text }}>{product.name}</Text>
          <Text className="text-muted text-sm mt-1" style={{ color: colors.textMuted }}>{product.unit}{isFood && product.prep_time_minutes ? ` • ${product.prep_time_minutes} min prep` : ''}</Text>

          <View className="flex-row items-center mt-2.5">
            <View className="flex-row items-center px-2 py-1 rounded-md mr-2" style={{ backgroundColor: colors.primaryLight }}>
              <Star size={12} color={colors.primary} fill={colors.primary} />
              <Text className="text-primary text-xs font-bold ml-0.5" style={{ color: colors.primary }}>{product.rating.toFixed(1)}</Text>
            </View>
            <Text className="text-muted text-xs" style={{ color: colors.textMuted }}>{product.reviews_count} ratings</Text>
            {isFood && (
              <View className="ml-auto flex-row items-center px-2 py-1 rounded-md" style={{ backgroundColor: colors.warningLight }}>
                <Clock size={11} color={colors.warning} />
                <Text className="text-warning text-xs font-semibold ml-0.5" style={{ color: colors.warning }}>{product.prep_time_minutes} min</Text>
              </View>
            )}
          </View>

          <View className="flex-row items-end mt-3">
            <Text className="text-textmain text-2xl font-bold" style={{ color: colors.text }}>{formatCurrency(effPrice)}</Text>
            {product.discount_price && (
              <>
                <Text className="text-muted text-sm line-through ml-2 mb-0.5" style={{ color: colors.textMuted }}>{formatCurrency(product.price)}</Text>
                <Text className="text-success text-xs font-bold ml-2 mb-1" style={{ color: colors.success }}>You save {formatCurrency(product.price - effPrice)}</Text>
              </>
            )}
          </View>
        </View>

        {/* About */}
        <View className="bg-white px-5 py-4 mt-2 border-t border-line" style={{ backgroundColor: colors.surfaceElevated, borderTopColor: colors.border }}>
          <Text className="text-textmain font-bold text-sm" style={{ color: colors.text }}>About this item</Text>
          <Text className="text-muted text-sm mt-2 leading-5" style={{ color: colors.textMuted }}>
            {product.description}
          </Text>

          {product.tags.length > 0 && (
            <View className="flex-row flex-wrap mt-3">
              {product.tags.map((t) => (
                <View key={t} className="px-2 py-1 rounded-md mr-1.5 mb-1" style={{ backgroundColor: accent + '15' }}>
                  <Text className="text-xs font-medium" style={{ color: accent }}>#{t}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Highlights */}
          <View className="mt-3 p-3 rounded-xl2" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row justify-between">
              <Text className="text-muted text-xs" style={{ color: colors.textMuted }}>Stock</Text>
              <Text className="text-textmain text-xs font-semibold" style={{ color: colors.text }}>{product.stock > 20 ? 'In stock' : `Only ${product.stock} left`}</Text>
            </View>
            <View className="flex-row justify-between mt-1.5">
              <Text className="text-muted text-xs" style={{ color: colors.textMuted }}>Sold by</Text>
              <Pressable onPress={() => store && router.push(`/store/${store.id}`)} className="flex-row items-center">
                <Text className="text-primary text-xs font-semibold" style={{ color: colors.primary }}>{store?.name}</Text>
                <ChevronRight size={11} color={colors.primary} />
              </Pressable>
            </View>
            {product.barcode && (
              <View className="flex-row justify-between mt-1.5">
                <Text className="text-muted text-xs" style={{ color: colors.textMuted }}>Barcode</Text>
                <Text className="text-textmain text-xs" style={{ color: colors.text }}>{product.barcode}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Reviews */}
        <View className="bg-white px-5 py-4 mt-2 border-t border-line" style={{ backgroundColor: colors.surfaceElevated, borderTopColor: colors.border }}>
          <Text className="text-textmain font-bold text-sm mb-3" style={{ color: colors.text }}>Ratings & Reviews</Text>
          {reviews.length === 0 ? (
            <Text className="text-muted text-sm" style={{ color: colors.textMuted }}>No reviews yet. Be the first to review!</Text>
          ) : (
            reviews.map((r) => (
              <View key={r.id} className="pb-3 mb-3 border-b border-lineLight" style={{ borderBottomColor: colors.borderLight }}>
                <View className="flex-row items-center justify-between">
                  <Text className="text-textmain text-sm font-semibold" style={{ color: colors.text }}>{r.customer_name}</Text>
                  <View className="flex-row items-center px-1.5 py-0.5 rounded-md" style={{ backgroundColor: colors.primaryLight }}>
                    <Star size={10} color={colors.primary} fill={colors.primary} />
                    <Text className="text-primary text-[11px] font-bold ml-0.5" style={{ color: colors.primary }}>{r.rating}</Text>
                  </View>
                </View>
                <Text className="text-muted text-xs mt-1.5" style={{ color: colors.textMuted }}>{r.comment}</Text>
                <Text className="text-subtle text-[10px] mt-1" style={{ color: colors.textSubtle }}>{formatDate(r.created_at)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Related */}
        {related.length > 0 && store && (
          <View className="mt-2 pb-32">
            <View className="px-5 py-4 bg-white border-t border-line" style={{ backgroundColor: colors.surfaceElevated, borderTopColor: colors.border }}>
              <Text className="text-textmain font-bold text-sm" style={{ color: colors.text }}>You may also like</Text>
            </View>
            <View className="px-5 pt-2 flex-row flex-wrap justify-between">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} store={store} variant="grid" />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky bottom bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-3 pb-4 border-t border-line"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center bg-surface rounded-xl2 overflow-hidden border border-line" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <Pressable onPress={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 items-center justify-center">
              <Minus size={14} color={colors.primaryDark} strokeWidth={3} />
            </Pressable>
            <Text className="font-bold text-textmain" style={{ width: 32, textAlign: 'center', color: colors.text }}>{quantity}</Text>
            <Pressable onPress={() => setQuantity((q) => q + 1)} className="w-10 h-10 items-center justify-center">
              <Plus size={14} color={colors.primaryDark} strokeWidth={3} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => onAddToCart()}
            className="flex-1 ml-3 rounded-xl2 py-3 items-center flex-row justify-center active:opacity-90"
            style={{ backgroundColor: colors.primaryLight }}
          >
            <ShoppingBag size={15} color={colors.primary} />
            <Text className="text-primary font-semibold text-sm ml-1.5" style={{ color: colors.primary }}>Add to Cart</Text>
            <Text className="text-primary font-bold text-sm ml-2" style={{ color: colors.primary }}>• {formatCurrency(effPrice * quantity)}</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={onBuyNow}
          className="mt-2.5 rounded-xl2 py-3 items-center active:opacity-90"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-semibold text-sm">Buy Now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Header({
  onBack, onShare, onFav, isFav
}: {
  onBack: () => void;
  onShare?: () => void;
  onFav?: () => void;
  isFav?: boolean;
}) {
  const colors = useThemeColors();
  return (
    <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-4 pt-2">
      <Pressable onPress={onBack} className="w-9 h-9 rounded-full items-center justify-center bg-white" style={{ backgroundColor: colors.surfaceElevated, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 }}>
        <ArrowLeft size={18} color={colors.text} />
      </Pressable>
      <View className="flex-row">
        {onShare && (
          <Pressable onPress={onShare} className="w-9 h-9 rounded-full items-center justify-center bg-white mr-2" style={{ backgroundColor: colors.surfaceElevated, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 }}>
            <Share2 size={16} color={colors.text} />
          </Pressable>
        )}
        {onFav && (
          <Pressable onPress={onFav} className="w-9 h-9 rounded-full items-center justify-center bg-white" style={{ backgroundColor: colors.surfaceElevated, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 }}>
            <Heart size={16} color={isFav ? colors.error : colors.text} fill={isFav ? colors.error : 'transparent'} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
