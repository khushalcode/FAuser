/**
 * ProductCard — premium Blinkit-style food product card.
 *
 * Features:
 *   - Product image with dot-indicator carousel (multiple images)
 *   - Veg / non-veg square dot indicator (only on food items)
 *   - Heart/wishlist icon — top right, filled red when favourited,
 *     with a scale-bounce animation on tap.
 *   - Green outlined ADD button (bottom right) — morphs into a
 *     quantity stepper (- 1 +) with a smooth layout animation.
 *   - Weight chip (grey rounded) showing the unit
 *   - Bold price + struck-through MRP + colourful discount tag
 *   - 2-line ellipsis name
 *   - Star rating with Indian-style count (lac / crore)
 *   - Delivery time ("8 mins") with clock icon, grey
 *   - Green "See more like this ▸" pill at bottom
 *
 * Connects to the cart + favourites Zustand stores directly.
 */
import React from 'react';
import {
  View, Text, Pressable, StyleSheet, LayoutAnimation, UIManager, Platform, Animated
} from 'react-native';
import { Image } from 'expo-image';
import { Star, Plus, Heart, Minus, Clock, ChevronRight } from 'lucide-react-native';
import type { Product, Store } from '@/lib/types';
import { useThemeColors, useIsDark } from '@/store/theme';
import {
  formatCurrency,
  formatDiscountPercent,
  effectivePrice,
  formatIndianCount,
  formatDeliveryTime
} from '@/utils/format';
import { useCartStore } from '@/store/cart';
import { useUserStore } from '@/store/user';
import { api } from '@/lib/api';
import { hapticImpact } from '@/utils/platform';
import { useRouter } from 'expo-router';
import { getProductImage } from '@/utils/images';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  product: Product;
  store?: Store;
  /** 'grid' (2-col), 'horizontal' (carousel), 'list' (full width) */
  variant?: 'grid' | 'horizontal' | 'list';
  /** When true the "See more like this" pill is hidden (used in carousels). */
  hideSeeMore?: boolean;
  /** Override delivery time (mins). Defaults to store's delivery_time_minutes or 8. */
  deliveryMinutes?: number;
}

/** Discount tag style — green for % OFF, orange for Price Drop, blue for Lowest in 30 days. */
function discountTagFor(product: Product): { label: string; bg: string; fg: string } | null {
  if (!product.discount_price || product.discount_price >= product.price) return null;
  const pct = formatDiscountPercent(product.price, product.discount_price);
  if (pct <= 0) return null;
  // Decide which tag style to show.
  const tags = product.tags || [];
  if (tags.includes('price-drop')) {
    return { label: 'Price Drop', bg: '#FFEDD5', fg: '#C2410C' };
  }
  if (tags.includes('lowest-30')) {
    return { label: 'Lowest in 30 days', bg: '#DBEAFE', fg: '#1D4ED8' };
  }
  return { label: `${pct}% OFF`, bg: '#D1FADF', fg: '#027A48' };
}

/** Visual hint based on whether this is a prepared meal or packaged item. */
function productVisual(product: Product, isDark: boolean): { light: string; emoji: string } {
  const isFood = !product.brand && product.prep_time_minutes !== undefined;
  return {
    light: isFood
      ? (isDark ? '#3A2A0A' : '#FEF3C7')
      : (isDark ? '#0B3A24' : '#ECFDF3'),
    emoji: isFood ? '🍽️' : '🛒'
  };
}

export function ProductCard({
  product,
  store,
  variant = 'horizontal',
  hideSeeMore = false,
  deliveryMinutes
}: Props) {
  const router = useRouter();
  const colors = useThemeColors();
  const isDark = useIsDark();
  const addItem = useCartStore((s) => s.addItem);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const cartItem = useCartStore((s) =>
    s.items.find((i) => i.product_id === product.id)
  );
  const toggleFav = useUserStore((s) => s.toggleFavourite);
  const isFav = useUserStore((s) => s.favouriteProductIds.includes(product.id));

  // Use local images via require() — no remote URLs
  const localImage = getProductImage(product.name);
  const images = product.images && product.images.length > 0
    ? product.images
    : [localImage];
  const [adding, setAdding] = React.useState(false);

  // Heart bounce animation
  const heartScale = React.useRef(new Animated.Value(1)).current;
  // Add-button morph animation
  const [showStepper, setShowStepper] = React.useState(!!cartItem);

  React.useEffect(() => {
    // Keep stepper state in sync with cart.
    if (cartItem && !showStepper) setShowStepper(true);
    if (!cartItem && showStepper) setShowStepper(false);
  }, [cartItem]);

  const effPrice = effectivePrice(product.price, product.discount_price);
  const discountPct = formatDiscountPercent(product.price, product.discount_price);
  const { light, emoji } = productVisual(product, isDark);
  const tag = discountTagFor(product);
  const qty = cartItem?.quantity || 0;
  const deliveryMins = deliveryMinutes ?? store?.delivery_time_minutes ?? 8;

  const onAdd = async () => {
    if (!store) return;
    hapticImpact('light');
    setAdding(true);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    addItem(product, store, 1);
    // Persist to server (no-op in mock mode).
    api.upsertCartItem(product.id, store.id, effPrice, 1).catch(() => {});
    setTimeout(() => setAdding(false), 600);
  };

  const onIncrement = () => {
    hapticImpact('light');
    increment(product.id);
    if (store) {
      api.upsertCartItem(product.id, store.id, effPrice, qty + 1).catch(() => {});
    }
  };

  const onDecrement = () => {
    hapticImpact('light');
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    decrement(product.id);
    if (store) {
      api.upsertCartItem(product.id, store.id, effPrice, Math.max(0, qty - 1)).catch(() => {});
    }
  };

  const onHeart = () => {
    hapticImpact('medium');
    // Bounce animation
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.4, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(heartScale, { toValue: 1, duration: 120, useNativeDriver: Platform.OS !== 'web' })
    ]).start();
    toggleFav(product.id);
    api.toggleFavourite(product.id, isFav).catch(() => {});
  };

  // Width logic per variant
  const cardWidth =
    variant === 'grid' ? '100%' :
    variant === 'list' ? '100%' :
    160;

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      style={[styles.card, { width: cardWidth as any, backgroundColor: colors.background, borderColor: colors.border }]}
      android_ripple={{ color: 'rgba(0,0,0,0.04)', radius: 200 }}
    >
      {/* Image area */}
      <View style={styles.imageWrap}>
        <View style={[styles.imageInner, { backgroundColor: light }]}>
          {images.length > 0 ? (
            <Image
              source={typeof images[0] === 'string' ? { uri: images[0] } : images[0]}
              style={styles.image}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <Text style={styles.imageEmoji}>{emoji}</Text>
          )}
        </View>

        {/* Dot indicators (visual only — full carousel in product detail) */}
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === 0 ? colors.primary : 'rgba(0,0,0,0.18)',
                    width: i === 0 ? 6 : 4
                  }
                ]}
              />
            ))}
          </View>
        )}

        {/* Veg / non-veg square dot — only on food items */}
        {product.is_veg !== undefined && (
          <View
            style={[
              styles.vegDot,
              {
                backgroundColor: colors.background,
                borderColor: product.is_veg ? colors.success : colors.error
              }
            ]}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: product.is_veg ? colors.success : colors.error
              }}
            />
          </View>
        )}

        {/* Heart / wishlist */}
        <Pressable
          onPress={onHeart}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[styles.heartBtn, { backgroundColor: colors.background }]}
        >
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Heart
              size={16}
              color={isFav ? colors.error : colors.textMuted}
              fill={isFav ? colors.error : 'transparent'}
              strokeWidth={2.2}
            />
          </Animated.View>
        </Pressable>

        {/* Discount badge floating on the image bottom-left */}
        {discountPct > 0 && (
          <View style={[styles.discountBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.discountBadgeText}>{discountPct}% OFF</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Weight chip */}
        <View style={[styles.weightChip, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={[styles.weightText, { color: colors.textMuted }]}>{product.unit}</Text>
        </View>

        {/* Brand + name */}
        {product.brand ? (
          <Text style={[styles.brand, { color: colors.textMuted }]} numberOfLines={1}>
            {product.brand}
          </Text>
        ) : null}
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating + delivery */}
        <View style={styles.metaRow}>
          <View style={[styles.ratingPill, { backgroundColor: colors.success }]}>
            <Star size={10} color="#fff" fill="#fff" />
            <Text style={styles.ratingText}>
              {product.rating.toFixed(1)}
            </Text>
          </View>
          <Text style={[styles.metaSub, { color: colors.textMuted }]}>
            ({formatIndianCount(product.reviews_count)})
          </Text>
          <View style={styles.delivery}>
            <Clock size={10} color={colors.textMuted} />
            <Text style={[styles.deliveryText, { color: colors.textMuted }]}>
              {formatDeliveryTime(deliveryMins)}
            </Text>
          </View>
        </View>

        {/* Price + tag + ADD button */}
        <View style={styles.priceRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={styles.priceLine}>
              <Text style={[styles.price, { color: colors.text }]}>{formatCurrency(effPrice)}</Text>
              {product.discount_price ? (
                <Text style={[styles.mrp, { color: colors.textMuted }]}>
                  {formatCurrency(product.price)}
                </Text>
              ) : null}
            </View>
            {tag && (
              <View style={[styles.tag, { backgroundColor: tag.bg }]}>
                <Text style={[styles.tagText, { color: tag.fg }]}>
                  {tag.label}
                </Text>
              </View>
            )}
          </View>

          {/* ADD / stepper button */}
          <View style={styles.addWrap}>
            {!showStepper ? (
              <Pressable
                onPress={onAdd}
                disabled={!store || adding}
                style={[
                  styles.addBtn,
                  {
                    borderColor: (!store || adding) ? colors.border : colors.primary,
                    backgroundColor: colors.background,
                    opacity: (!store || adding) ? 0.55 : 1
                  }
                ]}
              >
                <Text
                  style={[
                    styles.addBtnText,
                    {
                      color: (!store || adding) ? colors.textMuted : colors.primary
                    }
                  ]}
                >
                  {adding ? 'ADDED' : 'ADD'}
                </Text>
              </Pressable>
            ) : (
              <View style={[styles.stepper, { backgroundColor: colors.primaryLight }]}>
                <Pressable onPress={onDecrement} style={styles.stepBtn}>
                  <Minus size={14} color={colors.primary} strokeWidth={3} />
                </Pressable>
                <Text style={[styles.qty, { color: colors.primary }]}>{qty}</Text>
                <Pressable onPress={onIncrement} style={styles.stepBtn}>
                  <Plus size={14} color="#fff" strokeWidth={3} />
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Options text — when product has multiple tags we treat as "variants" */}
        {product.tags && product.tags.length > 2 && (
          <Text style={[styles.options, { color: colors.primary }]}>2 options ›</Text>
        )}

        {/* See more like this */}
        {!hideSeeMore && (
          <Pressable
            onPress={() => router.push(`/search?q=${encodeURIComponent(product.name.split(' ')[0])}`)}
            style={[styles.seeMore, { backgroundColor: colors.primary50 }]}
          >
            <Text style={[styles.seeMoreText, { color: colors.primary }]}>See more like this</Text>
            <ChevronRight size={11} color={colors.primary} strokeWidth={2.5} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const CARD_RADIUS = 14;

const styles = StyleSheet.create({
  card: {
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  imageWrap: {
    position: 'relative',
    padding: 8,
    paddingBottom: 4
  },
  imageInner: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10
  },
  imageEmoji: {
    fontSize: 44,
    opacity: 0.85
  },
  dots: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3
  },
  dot: {
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1
  },
  vegDot: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2
  },
  discountBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3
  },
  body: {
    padding: 10,
    paddingTop: 6
  },
  weightChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4
  },
  weightText: {
    fontSize: 10,
    fontWeight: '600'
  },
  brand: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 1
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
    minHeight: 32
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 2
  },
  ratingText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800'
  },
  metaSub: {
    fontSize: 9
  },
  delivery: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 2
  },
  deliveryText: {
    fontSize: 9,
    fontWeight: '500'
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
    gap: 8
  },
  priceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  mrp: {
    fontSize: 11,
    textDecorationLine: 'line-through'
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2
  },
  addWrap: {
    alignItems: 'flex-end'
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden'
  },
  stepBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qty: {
    minWidth: 24,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 13
  },
  options: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 2
  },
  seeMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 2
  },
  seeMoreText: {
    fontSize: 10,
    fontWeight: '700'
  }
});

export default ProductCard;
