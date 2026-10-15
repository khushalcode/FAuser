/**
 * PromoCodeStrip — horizontal scroll of copyable promo codes.
 * Adds a "tap to copy" delight and surfaces active coupons directly
 * on the home screen for higher conversion.
 */
import React from 'react';
import {
  View, Text, Pressable, StyleSheet, Dimensions, Platform
} from 'react-native';
import { Ticket, Copy, Check } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { useRouter } from 'expo-router';
import { hapticNotify } from '@/utils/platform';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PromoCode {
  code: string;
  description: string;
  discount: string;
  gradient: [string, string];
}

const DEFAULT_CODES: PromoCode[] = [
  {
    code: 'FRESH50',
    description: '50% off on first order',
    discount: '₹150 OFF',
    gradient: ['#12B76A', '#027A48'],
  },
  {
    code: 'FREESHIP',
    description: 'Free delivery above ₹199',
    discount: 'FREE DEL',
    gradient: ['#3B82F6', '#1D4ED8'],
  },
  {
    code: 'WELCOME20',
    description: '20% off up to ₹100',
    discount: '20% OFF',
    gradient: ['#8B5CF6', '#6D28D9'],
  },
  {
    code: 'PAYTM200',
    description: '₹200 cashback via Paytm',
    discount: '₹200 BACK',
    gradient: ['#EC4899', '#BE185D'],
  },
];

export function PromoCodeStrip({ codes = DEFAULT_CODES }: { codes?: PromoCode[] }) {
  const colors = useThemeColors();
  const router = useRouter();
  const [copied, setCopied] = React.useState<string | null>(null);

  const onCopy = (code: string) => {
    hapticNotify('success');
    setCopied(code);
    // In a real app we'd write to Clipboard.setString(code);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ticket size={16} color={colors.primary} strokeWidth={2.5} />
          <Text style={[styles.title, { color: colors.text }]}>Active coupons</Text>
        </View>
        <Pressable onPress={() => router.push('/coupons')} style={styles.seeAll}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>All coupons</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.push('/coupons')}
        style={({ pressed }) => [
          styles.scrollHint,
          { opacity: pressed ? 0.92 : 1 },
        ]}
      >
        {codes.map((c, i) => {
          const [c1, c2] = c.gradient;
          const isCopied = copied === c.code;
          return (
            <Pressable
              key={c.code}
              onPress={(e) => {
                e.stopPropagation();
                onCopy(c.code);
              }}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: c1,
                  shadowColor: c2,
                  opacity: pressed ? 0.92 : 1,
                },
              ]}
            >
              {/* Decorative circles */}
              <View style={[styles.decorL, { backgroundColor: colors.background }]} />
              <View style={[styles.decorR, { backgroundColor: colors.background }]} />

              <View style={styles.cardBody}>
                <View>
                  <View style={styles.discountPill}>
                    <Text style={styles.discountText}>{c.discount}</Text>
                  </View>
                  <Text style={styles.codeText}>{c.code}</Text>
                  <Text style={styles.descText} numberOfLines={1}>{c.description}</Text>
                </View>
                <View style={[styles.copyBtn, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
                  {isCopied ? (
                    <Check size={12} color="#fff" strokeWidth={3} />
                  ) : (
                    <Copy size={12} color="#fff" strokeWidth={2.5} />
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </Pressable>
    </View>
  );
}

const CARD_W = SCREEN_WIDTH * 0.7;
const CARD_H = 80;

const styles = StyleSheet.create({
  section: {
    marginTop: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 6,
    letterSpacing: -0.2,
  },
  seeAll: {},
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollHint: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    overflow: 'hidden',
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 14,
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  decorL: {
    position: 'absolute',
    left: -8,
    top: '50%',
    marginTop: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  decorR: {
    position: 'absolute',
    right: -8,
    top: '50%',
    marginTop: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  discountPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginBottom: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  codeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  descText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 10,
    marginTop: 2,
    maxWidth: CARD_W - 80,
  },
  copyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PromoCodeStrip;
