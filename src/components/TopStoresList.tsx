/**
 * TopStoresList — vertical list of top-rated restaurants (Zomato-style list cards).
 * Each card: cover image + name + cuisine + rating + delivery time + offers + distance.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Image } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Star, Clock, MapPin, Bike, BadgePercent, Zap } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import type { Store } from '@/lib/types';
import { formatCurrency } from '@/utils/format';
import { getStoreImage } from '@/utils/images';

interface Props {
  stores: Store[];
  onPress?: (store: Store) => void;
}

export function TopStoresList({ stores, onPress }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🍽️ Top Restaurants Near You</Text>
          <Text style={styles.subtitle}>Curated picks from your area</Text>
        </View>
        <Pressable>
          <Text style={styles.seeAll}>See all →</Text>
        </Pressable>
      </View>
      <View style={styles.listWrap}>
        {stores.map((s) => (
          <StoreListCard key={s.id} store={s} onPress={() => onPress?.(s)} />
        ))}
      </View>
    </View>
  );
}

function StoreListCard({ store, onPress }: { store: Store; onPress: () => void }) {
  const freeDelivery = store.delivery_fee === 0;
  const deliveryLabel = freeDelivery ? 'FREE' : formatCurrency(store.delivery_fee);
  // Deterministic distance based on store id
  const distance = ((store.id.charCodeAt(store.id.length - 1) % 5) + 1) + '.' + ((store.id.charCodeAt(2) % 9)) + ' km';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.imageWrap}>
        {getStoreImage(store.id) ? (
          <ExpoImage source={getStoreImage(store.id)} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 32 }}>🍽️</Text>
          </View>
        )}
        {/* Rating chip */}
        <View style={styles.ratingChip}>
          <Star size={10} color="#fff" fill="#fff" />
          <Text style={styles.ratingText}>{store.rating.toFixed(1)}</Text>
        </View>
        {/* Free delivery ribbon */}
        {freeDelivery && (
          <View style={styles.freeDelRibbon}>
            <Zap size={9} color={colors.primary} fill={colors.primary} />
            <Text style={styles.freeDelText}>FREE DEL</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{store.name}</Text>
          <View style={[styles.typeBadge, store.store_type === 'Grocery' ? { backgroundColor: colors.primaryLight } : { backgroundColor: colors.warningLight }]}>
            <Text style={[styles.typeText, store.store_type === 'Grocery' ? { color: colors.primary } : { color: colors.warning }]}>
              {store.store_type?.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.cuisine} numberOfLines={1}>{store.description}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={11} color={colors.textMuted} />
            <Text style={styles.metaText}>{store.delivery_time_minutes} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Bike size={11} color={freeDelivery ? colors.primary : colors.textMuted} />
            <Text style={[styles.metaText, freeDelivery && { color: colors.primary, fontWeight: '600' }]}>{deliveryLabel}</Text>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={11} color={colors.textMuted} />
            <Text style={styles.metaText}>{distance}</Text>
          </View>
        </View>

        <View style={styles.offerRow}>
          <View style={styles.offerBadge}>
            <BadgePercent size={10} color={colors.warning} />
            <Text style={styles.offerText}>50% OFF up to ₹100</Text>
          </View>
          <View style={[styles.offerBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.offerText, { color: colors.primary }]}>WELCOME50</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 22 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  seeAll: { fontSize: 12, fontWeight: '600', color: colors.primary },
  listWrap: { paddingHorizontal: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 120 },
  ratingChip: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: { color: '#fff', fontSize: 11, fontWeight: '700', marginLeft: 3 },
  freeDelRibbon: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freeDelText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 3,
  },
  body: { padding: 12 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cuisine: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 4,
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  offerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  offerText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.warning,
    marginLeft: 3,
  },
});

export default TopStoresList;
