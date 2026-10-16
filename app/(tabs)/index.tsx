import { Platform } from 'react-native';
/**
 * Home screen — dark, orange-accent food-delivery UI (hero, search + VEG,
 * cuisine chips, ₹99 store, brands, restaurants).
 *
 * Sections (in spec order):
 *   1. StickyHeader (collapsible) — logo, location, wallet, profile.
 *      Shrinks on scroll, only search + tabs stay pinned.
 *   2. Search bar — rotating placeholder text every 2s.
 *   3. Tab row — All, Restaurants, Grocery, Sweets, Bakery. Active tab
 *      has underline. Tapping changes header color + shows skeleton
 *      shimmer + fades in content.
 *   4. Hero banner — promotional carousel (auto-rotating, dot indicators).
 *   5. Bestsellers grid — 3×2 category tiles with 2-image collages + "+N
 *      more" badge.
 *   6. Promo banner — "Stock up on snack time!" with Shop now button.
 *   7. Category grid — 4-column mint-green tiles (Grocery & Kitchen).
 *   8. Featured carousel — blue-bordered cards with "Newly Launched" tags.
 *   9. Festival tile — themed banner with 4 sub-tiles.
 *  10. Product carousel row — with filter chips below (All, Cones, Cakes).
 *  11. Another category grid — Snacks & Drinks section.
 *  12. Product grid — 2-column product cards ("Stock up on crunchy snacks").
 *  13. Festival banner — red themed banner (Durga Pujo Bazar).
 *  14. See all products pill — with overlapping circular thumbnails.
 *
 * Floating UI:
 *   - Back-to-top pill (fades in after scroll)
 *   - CartButton (existing, on bottom)
 *
 * Animations:
 *   - Header collapse on scroll
 *   - Tab switch colour blend (Animated colour interpolation)
 *   - Skeleton shimmer while loading
 *   - Fade in sections sequentially after load
 *   - Hero banner auto-rotate + dot indicators
 *   - Back-to-top pill fade
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  ScrollView
} from 'react-native';
import { Pressable } from '@/components/SafePressable';
import { useRouter } from 'expo-router';
import { ChevronUp, ChevronRight, Flame, Tag, Gift } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useThemeColors } from '@/store/theme';
import { api } from '@/lib/api';
import type { Product, Category, Store } from '@/lib/types';
import type {
  BestsellerTile, FestivalTileData, PromoBannerData,
  HeroBannerData, CarouselRowData
} from '@/data/mock-data';
import {
  groceryKitchenSlugs, snacksDrinksSlugs, blinkitDeliveryMinutes
} from '@/data/mock-data';
import { StickyHeader } from '@/components/StickyHeader';
import {
  SkeletonShimmer, SkeletonGrid, SkeletonBestsellers, SkeletonRow
} from '@/components/SkeletonShimmer';
import { BestsellersGrid } from '@/components/BestsellersGrid';
import { CategoryGrid } from '@/components/CategoryGrid';
import { FeaturedCarousel } from '@/components/FeaturedCarousel';
import { FestivalTile } from '@/components/FestivalTile';
import { PromoBanner } from '@/components/PromoBanner';
import { ProductCarouselRow } from '@/components/ProductCarouselRow';
import { ProductGridSection } from '@/components/ProductGridSection';
import { SeeAllPill } from '@/components/SeeAllPill';
import { CartButton } from '@/components/CartButton';
import { BrandsStrip } from '@/components/BrandsStrip';
import { OffersStrip } from '@/components/OffersStrip';
import { LiveOrderBanner } from '@/components/LiveOrderBanner';
import { StatsStrip } from '@/components/StatsStrip';
import { TopStoresList } from '@/components/TopStoresList';
import { MembershipCard } from '@/components/MembershipCard';
import { CashbackBanner } from '@/components/CashbackBanner';
import { QuickActionsGrid } from '@/components/QuickActionsGrid';
import { RecentlyViewedStrip } from '@/components/RecentlyViewedStrip';
import { AppFooter } from '@/components/AppFooter';
import { LiveDeliveryTracker } from '@/components/LiveDeliveryTracker';
import { PromoCodeStrip } from '@/components/PromoCodeStrip';
import { TrendingRecipes } from '@/components/TrendingRecipes';
import { DeliveryPromiseBanner } from '@/components/DeliveryPromiseBanner';
import { ValueMealsBanner } from '@/components/ValueMealsBanner';
import { RestaurantsDeliveringBanner } from '@/components/RestaurantsDeliveringBanner';
import { PopularCuisinesStrip } from '@/components/PopularCuisinesStrip';
import { getProductImage } from '@/utils/images';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'restaurants', label: 'Restaurants' },
  { key: 'grocery', label: 'Grocery' },
  { key: 'sweets', label: 'Sweets' },
  { key: 'bakery', label: 'Bakery' }
];

// Per-tab header tints. Switching tabs smoothly interpolates between these.
const TAB_TINTS: Record<string, string> = {
  all: '#FF7A00', restaurants: '#FF7A00', grocery: '#FF7A00', sweets: '#FF7A00', bakery: '#FF7A00'
};

const TAB_ACCENTS: Record<string, string> = TAB_TINTS;

// Each home section is isolated: if one component throws, only that section
// disappears instead of crashing the whole home screen.
class SectionBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(e: any) {
    console.warn('[home] section crashed', e);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Section({ style, children }: { style?: any; children?: React.ReactNode }) {
  return (
    <SectionBoundary>
      <Animated.View style={style}>{children}</Animated.View>
    </SectionBoundary>
  );
}

const safe = <T,>(p: Promise<T>, fallback: T): Promise<T> =>
  p.catch((e) => {
    console.warn('[home] request failed', e);
    return fallback;
  });

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const scrollRef = React.useRef<any>(null);

  const [activeTab, setActiveTab] = React.useState('all');

  // Data
  const [bestsellers, setBestsellers] = React.useState<BestsellerTile[]>([]);
  const [promoBanners, setPromoBanners] = React.useState<PromoBannerData[]>([]);
  const [groceryCats, setGroceryCats] = React.useState<Category[]>([]);
  const [snacksCats, setSnacksCats] = React.useState<Category[]>([]);
  const [featured, setFeatured] = React.useState<Product[]>([]);
  const [festivalTiles, setFestivalTiles] = React.useState<FestivalTileData[]>([]);
  const [carouselRows, setCarouselRows] = React.useState<CarouselRowData[]>([]);
  const [carouselProducts, setCarouselProducts] = React.useState<Record<string, Product[]>>({});
  const [gridProducts, setGridProducts] = React.useState<Product[]>([]);
  const [heroBanners, setHeroBanners] = React.useState<HeroBannerData[]>([]);
  const [defaultStore, setDefaultStore] = React.useState<Store | undefined>();
  const [allStores, setAllStores] = React.useState<Store[]>([]);
  const [recentlyViewed, setRecentlyViewed] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showBackToTop, setShowBackToTop] = React.useState(false);
  // Real header height (safe-area + brand row + search + tabs), measured on layout.
  const [headerHeight, setHeaderHeight] = React.useState(190);

  // Header tint colour — animated between tab tints.
  const headerTint = React.useRef(new Animated.Value(0)).current; // 0..1 progress between prev & next colour
  const [tintFrom, setTintFrom] = React.useState(TAB_TINTS.all);
  const [tintTo, setTintTo] = React.useState(TAB_TINTS.all);
  const animatedTint = headerTint.interpolate({
    inputRange: [0, 1],
    outputRange: [tintFrom, tintTo]
  });

  // Section fade-in stages — increments every 90ms after load, up to N stages.
  const TOTAL_STAGES = 18;
  const [stage, setStage] = React.useState(0);
  const fadeStage = React.useRef(new Animated.Value(0)).current;

  // Back-to-top pill visibility (animated opacity derived from scrollY)
  const backToTopOpacity = scrollY.interpolate({
    inputRange: [600, 900],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  // -------- Load --------
  const loadAll = React.useCallback(async () => {
    setLoading(true);
    setStage(0);
    try {
      const [
        bs, promos, cats, featuredProds, ftiles, crows, hero,
        groceryProds, snackProds, frozenProds, dessertProds, crunchyProds,
        stores
      ] = await Promise.all([
        safe(api.getBestsellers(), [] as any[]),
        safe(api.getPromoBanners(), [] as any[]),
        safe(api.getCategories(), [] as any[]),
        safe(api.getFeaturedProducts(10), [] as any[]),
        safe(api.getFestivalTiles(), [] as any[]),
        safe(api.getCarouselRows(), [] as any[]),
        safe(api.getHeroBanner('all'), undefined as any),
        safe(api.getProductsByTag('fresh', 6), [] as any[]),
        safe(api.getProductsByTag('snack', 6), [] as any[]),
        safe(api.getProductsByTag('frozen', 10), [] as any[]),
        safe(api.getProductsByTag('dessert', 10), [] as any[]),
        safe(api.getProductsByTag('snack', 6), [] as any[]),
        safe(api.getStores(), [] as any[])
      ]);

      setBestsellers(bs);
      setPromoBanners(promos);
      setAllStores(stores);

      // Grocery & Kitchen categories: use specific slugs or fall back to the
      // first 4 grocery-group categories.
      const gCats = cats.filter((c) => groceryKitchenSlugs.includes(c.slug));
      setGroceryCats(
        gCats.length > 0
          ? gCats
          : cats.filter((c) => c.group === 'grocery').slice(0, 4)
      );
      const sCats = cats.filter((c) => snacksDrinksSlugs.includes(c.slug));
      setSnacksCats(
        sCats.length > 0
          ? sCats
          : cats.filter((c) => c.group === 'grocery').slice(4, 8)
      );
      setFeatured(featuredProds);
      setFestivalTiles(ftiles);
      setCarouselRows(crows);
      setHeroBanners(hero ? [hero] : []);
      setGridProducts(crunchyProds);

      // Recently viewed — use featured + bestsellers as a proxy
      const recent = [...featuredProds.slice(0, 4), ...crunchyProds.slice(0, 4)];
      setRecentlyViewed(recent);

      // Carousel row products — fetch in parallel for each row.
      const cp: Record<string, Product[]> = {};
      await Promise.all(
        crows.map(async (r: any) => {
          cp[r.id] = await safe(api.getProductsForCarouselRow(r, 12), [] as any[]);
        })
      );
      setCarouselProducts(cp);

      // Default store (used to attach cart items to)
      setDefaultStore(stores[0]);
    } catch (e) {
      // Fail gracefully — the section skeletons will remain in place.
      console.warn('[home] loadAll failed', e);
    } finally {
      setLoading(false);
      // Kick off the section-by-section fade-in.
      Animated.timing(fadeStage, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web'
      }).start();
      // Increment stage every 80ms up to TOTAL_STAGES.
      let s = 0;
      const interval = setInterval(() => {
        s += 1;
        setStage(s);
        if (s >= TOTAL_STAGES) clearInterval(interval);
      }, 80);
    }
  }, [fadeStage]);

  React.useEffect(() => {
    loadAll();
  }, [loadAll]);

  // -------- Tab switch --------
  const onTabChange = React.useCallback(async (key: string) => {
    if (key === activeTab) return;
    setTintFrom(TAB_TINTS[activeTab] || TAB_TINTS.all);
    setTintTo(TAB_TINTS[key] || TAB_TINTS.all);
    headerTint.setValue(0);
    Animated.timing(headerTint, {
      toValue: 1,
      duration: 350,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false
    }).start();
    setActiveTab(key);

    try {
      // Pull a fresh hero + maybe filter products by tab.
      const hero = await api.getHeroBanner(key);
      setHeroBanners([hero]);
    } catch (e) {
      // ignore
    }
  }, [activeTab, headerTint]);

  // -------- Back to top --------
  const scrollToTop = React.useCallback(() => {
    try {
      // Animated.ScrollView ref exposes scrollTo directly on RN 0.60+.
      const node = scrollRef.current?.getNode
        ? scrollRef.current.getNode()
        : scrollRef.current;
      node?.scrollTo?.({ x: 0, y: 0, animated: true });
    } catch (e) {
      // ignore
    }
  }, []);

  // -------- Section fade-in helper --------
  const fadeOpacity = (s: number) => ({
    opacity: stage >= s ? 1 : 0,
    transform: [{ translateY: stage >= s ? 0 : 8 }]
  });

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={styles.flex}>
        <Animated.ScrollView
          ref={scrollRef as any}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            {
              // MUST be false: scrollY drives StickyHeader's backgroundColor and
              // shadowOpacity, which the native driver can't animate. Mixing
              // native + JS drivers on one node crashes release APKs.
              useNativeDriver: false,
              listener: (e: any) => {
                const y = e.nativeEvent?.contentOffset?.y ?? 0;
                const next = y > 700;
                setShowBackToTop((prev) => (prev === next ? prev : next));
              }
            }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 28 }}
        >
          {/* Hero banner */}
          <Section style={[styles.heroWrap, fadeOpacity(1)]}>
            {heroBanners.length > 0 ? (
              <HeroCarousel banners={heroBanners} />
            ) : (
              <View style={{ paddingHorizontal: 12 }}>
                <SkeletonShimmer width="100%" height={200} radius={22} />
              </View>
            )}
          </Section>

          {/* Quick filter pills */}
          <Section style={fadeOpacity(1)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {[
                { label: 'Trending Now', Icon: Flame, onPress: () => router.push('/search') },
                { label: '₹99 Store', Icon: Tag, onPress: () => router.push('/search?q=99%20store') },
                { label: 'Buy 1 Get 1 Free', Icon: Gift, onPress: () => router.push('/coupons') }
              ].map(({ label, Icon, onPress }) => (
                <Pressable
                  key={label}
                  onPress={onPress}
                  style={[styles.filterPill, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                >
                  <Icon size={14} color={colors.primary} strokeWidth={2.4} />
                  <Text style={[styles.filterText, { color: colors.text }]}>{label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Section>

          {/* ₹99 Store / value meals */}
          <Section style={fadeOpacity(2)}>
            <ValueMealsBanner />
          </Section>

          {/* Popular cuisines */}
          <Section style={fadeOpacity(3)}>
            <PopularCuisinesStrip />
          </Section>

          {/* Popular brands */}
          <Section style={fadeOpacity(4)}>
            <BrandsStrip onPress={() => router.push('/search')} />
          </Section>

          {/* Restaurants delivering to you */}
          <Section style={fadeOpacity(5)}>
            <RestaurantsDeliveringBanner />
          </Section>
          <Section style={fadeOpacity(5)}>
            {!loading && allStores.length > 0 && (
              <TopStoresList
                stores={allStores.slice(0, 4)}
                onPress={(s) => router.push(`/store/${s.id}`)}
              />
            )}
          </Section>

          {/* Grocery & Kitchen */}
          <Section style={fadeOpacity(6)}>
            {loading ? (
              <View style={styles.section}>
                <View style={styles.skelHeader}>
                  <SkeletonShimmer width={160} height={20} />
                </View>
                <View style={styles.catGridSkel}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonShimmer key={i} width="23%" height={84} radius={14} />
                  ))}
                </View>
              </View>
            ) : (
              <CategoryGrid
                title="Grocery & Kitchen"
                subtitle="Your daily essentials"
                categories={groceryCats}
                onSeeAll={() => router.push('/(tabs)/categories')}
                onTilePress={(c) =>
                  router.push(`/search?q=${encodeURIComponent(c.name)}`)
                }
              />
            )}
          </Section>

          {/* Featured */}
          <Section style={fadeOpacity(7)}>
            {loading ? (
              <View style={styles.section}>
                <View style={styles.skelHeader}>
                  <SkeletonShimmer width={150} height={20} />
                </View>
                <SkeletonRow count={4} />
              </View>
            ) : (
              <FeaturedCarousel
                title="Featured This Week"
                subtitle="Hand-picked launches & bestsellers"
                products={featured}
                onSeeAll={() => router.push('/search')}
              />
            )}
          </Section>

          {/* Admin-configured carousel rows */}
          {carouselRows.map((row, i) => (
            <Section key={row.id} style={fadeOpacity(8 + i)}>
              <ProductCarouselRow
                title={row.title}
                subtitle={row.subtitle}
                emoji={row.emoji}
                products={carouselProducts[row.id] || []}
                store={defaultStore}
                chips={row.chips}
                isLoading={i === 0 ? loading : undefined}
                onSeeAll={() => router.push('/search')}
              />
            </Section>
          ))}

          {/* Coupons */}
          <Section style={fadeOpacity(11)}>
            <PromoCodeStrip />
          </Section>

          {/* Product grid */}
          <Section style={fadeOpacity(12)}>
            {loading ? (
              <View style={styles.section}>
                <View style={styles.skelHeader}>
                  <SkeletonShimmer width={200} height={20} />
                </View>
                <SkeletonGrid count={4} />
              </View>
            ) : (
              <ProductGridSection
                title="Stock up on crunchy snacks"
                subtitle="Chips, namkeen & more — bestsellers in your area"
                emoji="🍿"
                products={gridProducts}
                store={defaultStore}
                limit={6}
                onSeeAll={() => router.push('/search')}
                isLoading={false}
              />
            )}
          </Section>

          {/* Recently viewed */}
          <Section style={fadeOpacity(13)}>
            {!loading && recentlyViewed.length > 0 && (
              <RecentlyViewedStrip
                products={recentlyViewed}
                onPress={(p) => router.push(`/product/${p.id}`)}
              />
            )}
          </Section>

          {/* Section 14: See all products pill at the bottom */}
          <View style={styles.bottomPill}>
            <SeeAllPill
              label="See all products"
              thumbnails={featured.slice(0, 4).map((p) => getProductImage(p.name))}
              emojiFallbacks={['🛒', '🛍️', '🍿', '🥨']}
              onPress={() => router.push('/search')}
            />
          </View>

          {/* NEW: App Footer */}
          <AppFooter version="v1.1.0" />

          {/* Footer spacer */}
          <View style={{ height: 32 }} />
        </Animated.ScrollView>

        {/* Sections 1-3: Sticky Header (collapsible + search + tabs) */}
        <StickyHeader
          scrollY={scrollY}
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={onTabChange}
          headerTint={animatedTint}
          accent={TAB_ACCENTS[activeTab]}
          deliveryMinutes={blinkitDeliveryMinutes}
          defaultAddressLabel="Home"
          onHeightChange={setHeaderHeight}
        />

        {/* Back to top pill (fades in after scroll) */}
        <Animated.View
          pointerEvents={showBackToTop ? 'auto' : 'none'}
          style={[
            styles.backToTop,
            {
              opacity: backToTopOpacity,
              transform: [
                {
                  translateY: backToTopOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }
              ]
            }
          ]}
        >
          <Pressable onPress={scrollToTop} style={[styles.backToTopBtn, { backgroundColor: colors.surfaceElevated }]}>
            <ChevronUp size={14} color={colors.text} strokeWidth={3} />
            <Text style={[styles.backToTopText, { color: colors.text }]}>Top</Text>
          </Pressable>
        </Animated.View>

        {/* Floating cart button */}
        <CartButton />
      </View>
    </View>
  );
}

// -------- Hero Carousel --------
// Auto-rotating promotional carousel with dot indicators.

// Map tab key → local banner image
const HERO_BANNER_IMAGES: Record<string, any> = {
  all: require('../../assets/images/banners/banner1.jpg'),
  restaurants: require('../../assets/images/banners/banner3.jpg'),
  grocery: require('../../assets/images/banners/banner2.jpg'),
  sweets: require('../../assets/images/food/sweets.jpg'),
  bakery: require('../../assets/images/food/bakery.jpg'),
};

function HeroCarousel({ banners }: { banners: HeroBannerData[] }) {
  const router = useRouter();
  const colors = useThemeColors();
  const [idx, setIdx] = React.useState(0);
  const fade = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.ease),
        useNativeDriver: Platform.OS !== 'web'
      }).start(() => {
        setIdx((i) => (i + 1) % banners.length);
        fade.setValue(0);
        Animated.timing(fade, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.ease),
          useNativeDriver: Platform.OS !== 'web'
        }).start();
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [banners.length, fade]);

  const banner = banners[idx] || banners[0];
  if (!banner) return null;
  const heroImage = HERO_BANNER_IMAGES[banner.tab] || HERO_BANNER_IMAGES.all;

  return (
    <View style={styles.heroSection}>
      <Pressable
        onPress={() => router.push('/search')}
        style={({ pressed }: { pressed: boolean }) => [
          styles.heroCard,
          { backgroundColor: colors.surfaceAlt, opacity: pressed ? 0.94 : 1 }
        ]}
      >
        <Image source={heroImage} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
        {/* Dark scrim for legibility */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />

        <Animated.View style={[styles.heroContent, { opacity: fade }]}>
          <View style={[styles.heroTag, { backgroundColor: colors.primary }]}>
            <Text style={styles.heroTagText}>NEW LAUNCH</Text>
          </View>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {banner.title}
          </Text>
          <Text style={styles.heroSubtitle} numberOfLines={2}>
            {banner.subtitle}
          </Text>
          <View style={[styles.heroCta, { backgroundColor: colors.primary }]}>
            <Text style={styles.heroCtaText}>{banner.ctaText}</Text>
            <ChevronRight size={14} color="#fff" strokeWidth={3} style={{ marginLeft: 4 }} />
          </View>
        </Animated.View>

        {banners.length > 1 && (
          <View style={styles.heroDots}>
            {banners.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.heroDot,
                  {
                    backgroundColor: i === idx ? colors.primary : 'rgba(255,255,255,0.4)',
                    width: i === idx ? 18 : 6
                  }
                ]}
              />
            ))}
          </View>
        )}
      </Pressable>
    </View>
  );
}

// -------- Styles --------

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  heroWrap: {
    marginTop: 4
  },
  heroSection: {
    paddingHorizontal: 12
  },
  heroCard: {
    borderRadius: 22,
    overflow: 'hidden',
    minHeight: 200,
    justifyContent: 'flex-end'
  },
  heroContent: {
    padding: 18,
    paddingBottom: 30
  },
  heroTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8
  },
  heroTagText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.6 },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.4,
    lineHeight: 29
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 4
  },
  heroCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    marginTop: 12
  },
  heroCtaText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  heroDots: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  heroDot: {
    height: 6,
    borderRadius: 3
  },
  filterRow: {
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 8
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1
  },
  filterText: { fontSize: 12.5, fontWeight: '600' },
  section: {
    marginTop: 22
  },
  skelHeader: {
    paddingHorizontal: 16,
    marginBottom: 12
  },
  catGridSkel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    gap: 10
  },
  bottomPill: {
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 8
  },
  backToTop: {
    position: 'absolute',
    bottom: 84,
    alignSelf: 'center',
    zIndex: 60
  },
  backToTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4
  },
  backToTopText: {
    fontSize: 11,
    fontWeight: '700'
  }
});