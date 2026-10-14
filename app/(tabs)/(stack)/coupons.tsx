import React from 'react';
import {
  View, Text, FlatList, Pressable, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Tag, Check, Clock, X } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/cart';
import type { Coupon } from '@/lib/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { hapticNotify } from '@/utils/platform';

type Tab = 'available' | 'used' | 'expired';

export default function CouponsScreen() {
  const router = useRouter();
  const [tab, setTab] = React.useState<Tab>('available');
  const [coupons, setCoupons] = React.useState<Coupon[]>([]);
  const [loading, setLoading] = React.useState(true);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);
  const subtotal = useCartStore((s) => s.subtotal());

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const c = await api.getCoupons(tab);
      setCoupons(c);
      setLoading(false);
    })();
  }, [tab]);

  const onApply = (coupon: Coupon) => {
    if (subtotal < coupon.minimum_order) {
      hapticNotify('warning');
      return;
    }
    applyCoupon(coupon);
    hapticNotify('success');
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View className="px-5 pt-2 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-2xl items-center justify-center bg-surface border border-lineLight mr-3">
          <ArrowLeft size={18} color={colors.text} />
        </Pressable>
        <Text className="text-textmain text-[22px] font-extrabold tracking-tight">Coupons & Offers</Text>
      </View>

      {/* Tabs */}
      <View className="px-5 mb-3">
        <View className="flex-row bg-surface rounded-xl2 p-1 border border-line">
          {(['available', 'used', 'expired'] as Tab[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className="flex-1 py-2.5 rounded-xl items-center"
              style={{ backgroundColor: tab === t ? '#fff' : 'transparent', elevation: tab === t ? 2 : 0, shadowColor: '#0F172A', shadowOpacity: tab === t ? 0.08 : 0, shadowRadius: 4 }}
            >
              <Text className="text-sm font-semibold capitalize" style={{ color: tab === t ? colors.primary : colors.textMuted }}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : coupons.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full items-center justify-center" style={{ backgroundColor: colors.surfaceAlt }}>
            <Tag size={36} color={colors.textMuted} />
          </View>
          <Text className="text-textmain font-bold text-sm mt-3 capitalize">No {tab} coupons</Text>
          <Text className="text-muted text-xs mt-1 text-center">
            {tab === 'available' ? 'Check back later for new offers!' : `You have no ${tab} coupons yet.`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => {
            const canApply = tab === 'available' && subtotal >= item.minimum_order;
            const isApplied = appliedCoupon?.id === item.id;
            const accent = colors.primary;

            return (
              <View className="bg-white rounded-xl2 border border-line overflow-hidden" style={{ shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
                {/* Top color strip */}
                <View style={{ height: 4, backgroundColor: accent }} />

                <View className="p-4">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-textmain font-bold text-sm">{item.title}</Text>
                      <Text className="text-muted text-xs mt-0.5">{item.description}</Text>
                    </View>
                    <View className="px-2 py-1 rounded-md" style={{ backgroundColor: accent + '15' }}>
                      <Text className="text-[10px] font-bold uppercase" style={{ color: accent }}>
                        {'FOOD MUNCH'}
                      </Text>
                    </View>
                  </View>

                  {/* Coupon code */}
                  <View className="flex-row items-center mt-3 border border-dashed rounded-lg p-2.5" style={{ borderColor: colors.border }}>
                    <Tag size={14} color={colors.primary} />
                    <Text className="ml-1.5 text-textmain text-sm font-bold tracking-wider">{item.code}</Text>
                    <View className="ml-auto flex-row items-center">
                      <Clock size={11} color={colors.textMuted} />
                      <Text className="text-muted text-[10px] ml-0.5">Exp {formatDate(item.end_date)}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between mt-2.5">
                    <Text className="text-muted text-[11px]">
                      Min order: {formatCurrency(item.minimum_order)}
                      {item.maximum_discount && ` • Max ₹${item.maximum_discount} off`}
                    </Text>

                    {tab === 'available' && (
                      isApplied ? (
                        <View className="flex-row items-center px-3 py-1.5 rounded-md" style={{ backgroundColor: colors.successLight }}>
                          <Check size={12} color={colors.success} />
                          <Text className="text-success text-xs font-semibold ml-1">Applied</Text>
                        </View>
                      ) : (
                        <Pressable
                          onPress={() => onApply(item)}
                          disabled={!canApply}
                          className="px-3 py-1.5 rounded-md"
                          style={{ backgroundColor: canApply ? colors.primary : colors.border }}
                        >
                          <Text className="text-xs font-semibold" style={{ color: canApply ? '#fff' : colors.textMuted }}>
                            {canApply ? 'Apply' : `Min ${formatCurrency(item.minimum_order)}`}
                          </Text>
                        </Pressable>
                      )
                    )}

                    {tab === 'used' && (
                      <View className="flex-row items-center px-2 py-1 rounded-md" style={{ backgroundColor: colors.surfaceAlt }}>
                        <Check size={11} color={colors.textMuted} />
                        <Text className="text-muted text-xs ml-1">Used</Text>
                      </View>
                    )}

                    {tab === 'expired' && (
                      <View className="flex-row items-center px-2 py-1 rounded-md" style={{ backgroundColor: colors.errorLight }}>
                        <X size={11} color={colors.error} />
                        <Text className="text-error text-xs ml-1">Expired</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
