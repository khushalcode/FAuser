/**
 * MembershipCard — FoodMunch Gold membership promo card.
 * Gold gradient + member perks + CTA button.
 *
 * Per dark-mode spec: the gold gradient + brown ink text stay identical in
 * both modes (colorful banners don't switch).
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Crown, Sparkles, ChevronRight } from 'lucide-react-native';

interface Props {
  onPress?: () => void;
}

export function MembershipCard({ onPress }: Props) {
  return (
    <View style={styles.outer}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}
      >
        {/* Decorative */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <View style={styles.header}>
          <View style={styles.crownWrap}>
            <Crown size={18} color="#78350F" fill="#FBBF24" />
          </View>
          <View style={styles.headerText}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>FoodMunch Gold</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>NEW</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>Unlock free delivery + 2x cashback</Text>
          </View>
        </View>

        <View style={styles.perksRow}>
          <View style={styles.perk}>
            <Text style={styles.perkEmoji}>🚚</Text>
            <Text style={styles.perkText}>Free delivery</Text>
          </View>
          <View style={styles.perkDivider} />
          <View style={styles.perk}>
            <Text style={styles.perkEmoji}>💰</Text>
            <Text style={styles.perkText}>2x cashback</Text>
          </View>
          <View style={styles.perkDivider} />
          <View style={styles.perk}>
            <Text style={styles.perkEmoji}>⚡</Text>
            <Text style={styles.perkText}>Priority</Text>
          </View>
        </View>

        <View style={styles.ctaRow}>
          <View>
            <Text style={styles.price}>₹299</Text>
            <Text style={styles.priceSub}>3 months · then ₹99/mo</Text>
          </View>
          <View style={styles.ctaBtn}>
            <Text style={styles.ctaText}>Join now</Text>
            <ChevronRight size={14} color="#78350F" strokeWidth={3} />
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { paddingHorizontal: 16 },
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#FBBF24',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  decorCircle1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  decorCircle2: {
    position: 'absolute',
    right: 40,
    top: 80,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  crownWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerText: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#78350F',
  },
  activeBadge: {
    backgroundColor: '#78350F',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  activeText: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: '#78350F',
    opacity: 0.8,
    marginTop: 2,
  },
  perksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  perk: {
    flex: 1,
    alignItems: 'center',
  },
  perkEmoji: { fontSize: 18, marginBottom: 2 },
  perkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#78350F',
  },
  perkDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(120,53,15,0.15)',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 20,
    fontWeight: '900',
    color: '#78350F',
  },
  priceSub: {
    fontSize: 10,
    color: '#78350F',
    opacity: 0.7,
    marginTop: 2,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#78350F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FBBF24',
    marginRight: 4,
  },
});

export default MembershipCard;
