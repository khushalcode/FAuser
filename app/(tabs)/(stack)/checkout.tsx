import React from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, MapPin, Plus, Clock, CreditCard, Wallet, Banknote,
  Smartphone, Tag, CheckCircle2, ChevronRight, ShoppingBag, Bike,
  ShieldCheck, Zap, AlertTriangle, Navigation
} from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { useCartStore } from '@/store/cart';
import { useUserStore } from '@/store/user';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { payWithRazorpay, isRazorpayConfigured } from '@/lib/payments';
import type { PaymentMethod, Order, CustomerAddress, DeliveryArea } from '@/lib/types';
import { formatCurrency } from '@/utils/format';
import { hapticNotify } from '@/utils/platform';

export default function CheckoutScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const items = useCartStore((s) => s.items);
  const storeId = useCartStore((s) => s.storeId);
  const storeName = useCartStore((s) => s.storeName);
  const subtotal = useCartStore((s) => s.subtotal());
  const discount = useCartStore((s) => s.discount());
  const tax = useCartStore((s) => s.tax());
  const total = useCartStore((s) => s.total());
  const walletApplied = useCartStore((s) => s.walletApplied);
  const setWalletApplied = useCartStore((s) => s.setWalletApplied);
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);
  const clear = useCartStore((s) => s.clear);

  const addresses = useUserStore((s) => s.addresses);
  const selectedAddressId = useUserStore((s) => s.selectedAddressId);
  const setSelectedAddress = useUserStore((s) => s.setSelectedAddress);
  const walletBalance = useUserStore((s) => s.walletBalance);
  const loadAddresses = useUserStore((s) => s.loadAddresses);
  const loadWallet = useUserStore((s) => s.loadWallet);

  const authUser = useAuthStore((s) => s.user);

  const [schedule, setSchedule] = React.useState<'now' | 'later'>('now');
  const [payment, setPayment] = React.useState<PaymentMethod>('cash');
  const [note, setNote] = React.useState('');
  const [placing, setPlacing] = React.useState(false);
  const [paying, setPaying] = React.useState(false);
  const [deliveryArea, setDeliveryArea] = React.useState<DeliveryArea | null>(null);
  const [checkingPincode, setCheckingPincode] = React.useState(false);
  const [useWallet, setUseWallet] = React.useState(false);

  React.useEffect(() => {
    loadAddresses();
    loadWallet();
  }, []);

  const selectedAddr: CustomerAddress | undefined =
    addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  // Pincode serviceability check — runs when the selected address or store changes.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!storeId || !selectedAddr?.pincode) {
        setDeliveryArea(null);
        return;
      }
      setCheckingPincode(true);
      try {
        const area = await api.getDeliveryArea(storeId, selectedAddr.pincode);
        if (!cancelled) setDeliveryArea(area);
      } catch (e) {
        if (!cancelled) setDeliveryArea(null);
      } finally {
        if (!cancelled) setCheckingPincode(false);
      }
    })();
    return () => { cancelled = true; };
  }, [storeId, selectedAddr?.pincode]);

  // Delivery fee — overridden by pincode-specific fee when available.
  const effectiveDeliveryFee = deliveryArea?.delivery_fee ?? 30;
  const finalTotal = total - (useWallet ? Math.min(walletBalance, total) : 0);

  // Keep the cart's walletApplied in sync so the place-order flow sees the right value.
  React.useEffect(() => {
    if (useWallet) {
      setWalletApplied(Math.min(walletBalance, total));
    } else {
      setWalletApplied(0);
    }
  }, [useWallet, walletBalance, total, setWalletApplied]);

  if (items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <ShoppingBag size={48} color={colors.textMuted} />
          <Text className="text-textmain font-bold text-base mt-3" style={{ color: colors.text }}>Your cart is empty</Text>
          <Pressable
            onPress={() => router.replace('/(tabs)')}
            className="mt-4 rounded-xl2 px-6 py-3"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-semibold text-sm">Browse items</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const notDeliverable = !!selectedAddr?.pincode && !checkingPincode && !deliveryArea;

  /**
   * Place order → optionally pay with Razorpay → navigate to order tracking.
   */
  const onPlaceOrder = async () => {
    if (!selectedAddr) {
      Alert.alert('Select address', 'Please add or select a delivery address.');
      return;
    }
    if (notDeliverable) {
      Alert.alert(
        'Not deliverable',
        `This store does not deliver to pincode ${selectedAddr.pincode}. Try a different address or store.`
      );
      return;
    }
    if (!storeId || !storeName) return;
    setPlacing(true);
    try {
      // resolve store vendor id
      const store = await api.getStore(storeId);
      const order: Order = await api.placeOrder({
        items,
        storeId,
        storeName,
        vendorId: store?.vendor_id || 'vendor_1',
        deliveryAddress: `${selectedAddr.line1}, ${selectedAddr.line2 ? selectedAddr.line2 + ', ' : ''}${selectedAddr.city} - ${selectedAddr.pincode}`,
        deliveryLatitude: selectedAddr.latitude,
        deliveryLongitude: selectedAddr.longitude,
        note: note || undefined,
        scheduledAt: schedule === 'later' ? new Date(Date.now() + 2 * 3600_000).toISOString() : null,
        paymentMethod: payment,
        subtotal,
        deliveryFee: effectiveDeliveryFee,
        discount,
        tax,
        total,
        walletApplied: useWallet ? Math.min(walletBalance, total) : 0
      });

      clear();
      hapticNotify('success');

      // If payment method is online, run the Razorpay flow now.
      if (payment === 'online') {
        setPaying(true);
        try {
          const paid = await payWithRazorpay({
            orderId: order.id,
            amount: finalTotal,
            customer: {
              name: authUser?.full_name,
              email: authUser?.email,
              phone: authUser?.phone || selectedAddr.phone
            }
          });
          if (paid) {
            hapticNotify('success');
          }
        } catch (e: any) {
          hapticNotify('error');
          Alert.alert(
            'Payment failed',
            e?.message || 'Your order has been placed but payment failed. You can retry payment from the order tracking screen.',
            [{ text: 'OK' }]
          );
        } finally {
          setPaying(false);
        }
      }

      router.replace(`/order/${order.id}`);
    } catch (e: any) {
      Alert.alert('Order failed', e?.message || 'Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View className="px-5 pt-2 pb-3 flex-row items-center">
        <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-2xl items-center justify-center bg-surface border border-lineLight mr-3" style={{ backgroundColor: colors.surface, borderColor: colors.borderLight }}>
          <ArrowLeft size={18} color={colors.text} />
        </Pressable>
        <Text className="text-textmain text-[22px] font-extrabold tracking-tight" style={{ color: colors.text }}>Checkout</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 220 }}>
        {/* Address */}
        <Section title="Delivery Address" colors={colors}>
          {selectedAddr ? (
            <Pressable
              onPress={() => router.push('/address')}
              className="bg-white rounded-xl2 border border-line p-3.5 flex-row active:opacity-80"
              style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
            >
              <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
                <MapPin size={16} color={colors.primary} />
              </View>
              <View className="flex-1 ml-3">
                <View className="flex-row items-center">
                  <Text className="text-textmain font-semibold text-sm" style={{ color: colors.text }}>{selectedAddr.label}</Text>
                  {selectedAddr.is_default && (
                    <View className="ml-2 px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.primaryLight }}>
                      <Text className="text-primary text-[9px] font-bold uppercase" style={{ color: colors.primary }}>Default</Text>
                    </View>
                  )}
                </View>
                <Text className="text-muted text-xs mt-0.5" style={{ color: colors.textMuted }} numberOfLines={2}>
                  {selectedAddr.line1}, {selectedAddr.line2 ? selectedAddr.line2 + ', ' : ''}{selectedAddr.city} - {selectedAddr.pincode}
                </Text>
                <Text className="text-muted text-[11px] mt-0.5" style={{ color: colors.textMuted }}>{selectedAddr.full_name} • {selectedAddr.phone}</Text>
              </View>
              <ChevronRight size={16} color={colors.textSubtle} />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/address/add')}
              className="bg-white rounded-xl2 border border-dashed p-4 items-center"
              style={{ borderColor: colors.primary }}
            >
              <Plus size={18} color={colors.primary} />
              <Text className="text-primary text-sm font-semibold mt-1" style={{ color: colors.primary }}>Add new address</Text>
            </Pressable>
          )}

          {/* Pincode serviceability banner */}
          {selectedAddr?.pincode && (
            <View className="mt-2">
              {checkingPincode ? (
                <View className="flex-row items-center px-1 py-1">
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text className="text-muted text-xs ml-2" style={{ color: colors.textMuted }}>Checking delivery to {selectedAddr.pincode}…</Text>
                </View>
              ) : deliveryArea ? (
                <View className="flex-row items-center px-2 py-1.5 rounded-md" style={{ backgroundColor: colors.successLight }}>
                  <CheckCircle2 size={12} color={colors.success} />
                  <Text className="text-success text-[11px] font-medium ml-1" style={{ color: colors.success }}>
                    Delivers to {selectedAddr.pincode} • {deliveryArea.estimated_minutes} min • {formatCurrency(deliveryArea.delivery_fee)} fee
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center px-2 py-1.5 rounded-md" style={{ backgroundColor: colors.errorLight }}>
                  <AlertTriangle size={12} color={colors.error} />
                  <Text className="text-error text-[11px] font-medium ml-1" style={{ color: colors.error }}>
                    Not deliverable to {selectedAddr.pincode}. Pick another address or store.
                  </Text>
                </View>
              )}
            </View>
          )}
        </Section>

        {/* Schedule */}
        <Section title="Delivery Time" colors={colors}>
          <View className="flex-row bg-surface rounded-xl2 p-1 border border-line" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <Pressable
              onPress={() => setSchedule('now')}
              className="flex-1 py-2.5 rounded-xl flex-row items-center justify-center"
              style={{ backgroundColor: schedule === 'now' ? colors.surfaceElevated : 'transparent', elevation: schedule === 'now' ? 2 : 0, shadowColor: '#000', shadowOpacity: schedule === 'now' ? 0.08 : 0, shadowRadius: 4 }}
            >
              <Clock size={13} color={schedule === 'now' ? colors.primary : colors.textMuted} />
              <Text className="ml-1.5 text-sm font-semibold" style={{ color: schedule === 'now' ? colors.primary : colors.textMuted }}>
                Deliver now
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSchedule('later')}
              className="flex-1 py-2.5 rounded-xl flex-row items-center justify-center"
              style={{ backgroundColor: schedule === 'later' ? colors.surfaceElevated : 'transparent', elevation: schedule === 'later' ? 2 : 0, shadowColor: '#000', shadowOpacity: schedule === 'later' ? 0.08 : 0, shadowRadius: 4 }}
            >
              <Clock size={13} color={schedule === 'later' ? colors.primary : colors.textMuted} />
              <Text className="ml-1.5 text-sm font-semibold" style={{ color: schedule === 'later' ? colors.primary : colors.textMuted }}>
                Schedule (2 hrs later)
              </Text>
            </Pressable>
          </View>
        </Section>

        {/* Notes */}
        <Section title="Delivery Instructions" colors={colors}>
          <View className="bg-white rounded-xl2 border border-line px-3.5 py-2.5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Ring the bell on arrival, leave at door, etc."
              placeholderTextColor={colors.textMuted}
              className="text-sm text-textmain"
              style={{ color: colors.text }}
              multiline
              numberOfLines={2}
            />
          </View>
        </Section>

        {/* Wallet */}
        <Section title="Wallet" colors={colors}>
          <Pressable
            onPress={() => setUseWallet(!useWallet)}
            className="bg-white rounded-xl2 border border-line p-3.5 flex-row items-center active:opacity-80"
            style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
          >
            <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
              <Wallet size={16} color={colors.primary} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-textmain text-sm font-semibold" style={{ color: colors.text }}>Food Munch Wallet</Text>
              <Text className="text-muted text-[11px]" style={{ color: colors.textMuted }}>Balance: {formatCurrency(walletBalance)}</Text>
            </View>
            <View
              className="w-5 h-5 rounded-full items-center justify-center"
              style={{ borderWidth: 1.5, borderColor: useWallet ? colors.primary : colors.border, backgroundColor: useWallet ? colors.primary : 'transparent' }}
            >
              {useWallet && <CheckCircle2 size={11} color="#fff" />}
            </View>
          </Pressable>
          {useWallet && (
            <Text className="text-muted text-[11px] mt-1 px-1" style={{ color: colors.textMuted }}>
              {formatCurrency(Math.min(walletBalance, total))} will be deducted. Payable after wallet: {formatCurrency(finalTotal)}.
            </Text>
          )}
        </Section>

        {/* Payment */}
        <Section title="Payment Method" colors={colors}>
          <View className="bg-white rounded-xl2 border border-line overflow-hidden" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
            <PaymentRow icon={<Banknote size={16} color={colors.success} />} iconBg={colors.successLight} label="Cash on Delivery" sub="Pay when you receive" selected={payment === 'cash'} onPress={() => setPayment('cash')} colors={colors} />
            <Divider colors={colors} />
            <PaymentRow icon={<CreditCard size={16} color={colors.info} />} iconBg={colors.infoLight} label="Credit / Debit Card" sub="Visa, Mastercard, RuPay" selected={payment === 'card'} onPress={() => setPayment('online')} colors={colors} />
            <Divider colors={colors} />
            <PaymentRow icon={<Smartphone size={16} color={colors.warning} />} iconBg={colors.warningLight} label="UPI / Razorpay" sub={isRazorpayConfigured ? 'GPay, PhonePe, Paytm, Cards' : 'Mock mode (test)'} selected={payment === 'online'} onPress={() => setPayment('online')} badge={isRazorpayConfigured ? <RazorpayBadge /> : <MockBadge />} colors={colors} />
          </View>
          {payment === 'online' && (
            <View className="mt-2 flex-row items-center px-1">
              <ShieldCheck size={11} color={colors.success} />
              <Text className="text-muted text-[11px] ml-1" style={{ color: colors.textMuted }}>
                Secured by Razorpay. Your card details are never stored on our servers.
              </Text>
            </View>
          )}
        </Section>

        {/* Coupon */}
        <Section title="Coupon" colors={colors}>
          <Pressable
            onPress={() => router.push('/coupons')}
            className="bg-white rounded-xl2 border border-line p-3.5 flex-row items-center justify-between active:opacity-80"
            style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
          >
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: colors.warningLight }}>
                <Tag size={16} color={colors.warning} />
              </View>
              <View className="ml-3">
                <Text className="text-textmain text-sm font-semibold" style={{ color: colors.text }}>
                  {appliedCoupon ? appliedCoupon.code : 'Apply coupon'}
                </Text>
                <Text className="text-muted text-[11px]" style={{ color: colors.textMuted }}>
                  {appliedCoupon ? appliedCoupon.title : 'Save up to ₹100 on this order'}
                </Text>
              </View>
            </View>
            {appliedCoupon ? (
              <Text className="text-success text-xs font-bold" style={{ color: colors.success }}>− {formatCurrency(discount)}</Text>
            ) : (
              <ChevronRight size={16} color={colors.primary} />
            )}
          </Pressable>
        </Section>

        {/* Order summary */}
        <Section title="Order Summary" colors={colors}>
          <View className="bg-white rounded-xl2 border border-line p-3.5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-muted text-xs" style={{ color: colors.textMuted }}>Store</Text>
              <Text className="text-textmain text-xs font-semibold" style={{ color: colors.text }}>{storeName}</Text>
            </View>
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-muted text-xs" style={{ color: colors.textMuted }}>Items</Text>
              <Text className="text-textmain text-xs font-semibold" style={{ color: colors.text }}>{items.length}</Text>
            </View>
            <View className="h-px bg-line my-2.5" style={{ backgroundColor: colors.borderLight }} />
            <BillRow label="Subtotal" value={formatCurrency(subtotal)} colors={colors} />
            <BillRow label="Delivery fee" value={effectiveDeliveryFee === 0 ? 'FREE' : formatCurrency(effectiveDeliveryFee)} valueColor={effectiveDeliveryFee === 0 ? colors.success : colors.text} colors={colors} />
            {discount > 0 && <BillRow label="Coupon discount" value={`− ${formatCurrency(discount)}`} valueColor={colors.success} colors={colors} />}
            <BillRow label="Taxes (5%)" value={formatCurrency(tax)} colors={colors} />
            {useWallet && walletApplied > 0 && (
              <BillRow label="Wallet applied" value={`− ${formatCurrency(walletApplied)}`} valueColor={colors.success} colors={colors} />
            )}
            <View className="h-px bg-line my-2.5" style={{ backgroundColor: colors.borderLight }} />
            <View className="flex-row justify-between">
              <Text className="text-textmain font-bold text-base" style={{ color: colors.text }}>Total</Text>
              <Text className="text-textmain font-bold text-base" style={{ color: colors.text }}>{formatCurrency(finalTotal)}</Text>
            </View>
          </View>
        </Section>
      </ScrollView>

      {/* Sticky place order bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-3 pb-4 border-t border-line"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 }}
      >
        <View className="flex-row items-center justify-between mb-2.5">
          <View>
            <Text className="text-muted text-[11px]" style={{ color: colors.textMuted }}>Total payable</Text>
            <Text className="text-textmain font-bold text-lg" style={{ color: colors.text }}>{formatCurrency(finalTotal)}</Text>
          </View>
          <View className="flex-row items-center px-2 py-1 rounded-md" style={{ backgroundColor: colors.primaryLight }}>
            <Bike size={11} color={colors.primary} />
            <Text className="text-primary text-[11px] font-semibold ml-0.5" style={{ color: colors.primary }}>
              {deliveryArea ? `${deliveryArea.estimated_minutes} min` : '30-40 min'}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={onPlaceOrder}
          disabled={placing || paying || notDeliverable || checkingPincode}
          className="rounded-xl2 py-3.5 flex-row items-center justify-center active:opacity-90"
          style={{ backgroundColor: (notDeliverable || checkingPincode) ? colors.border : colors.primary }}
        >
          {placing || paying ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text className="text-white font-semibold text-base ml-2">
                {placing ? 'Placing order…' : 'Processing payment…'}
              </Text>
            </>
          ) : (
            <>
              {payment === 'online' ? <Zap size={16} color="#fff" /> : <CheckCircle2 size={16} color="#fff" />}
              <Text className="text-white font-semibold text-base ml-2">
                {notDeliverable
                  ? 'Not deliverable'
                  : checkingPincode
                    ? 'Checking pincode…'
                    : payment === 'online'
                      ? `Pay ${formatCurrency(finalTotal)} & Place Order`
                      : 'Place Order'}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Section({ title, colors, children }: { title: string; colors: any; children: React.ReactNode }) {
  return (
    <View className="px-5 mt-4">
      <Text className="text-textmain text-sm font-bold mb-2" style={{ color: colors.text }}>{title}</Text>
      {children}
    </View>
  );
}

function BillRow({ label, value, valueColor, colors }: { label: string; value: string; valueColor?: string; colors: any }) {
  return (
    <View className="flex-row justify-between mb-1.5">
      <Text className="text-muted text-sm" style={{ color: colors.textMuted }}>{label}</Text>
      <Text className="text-textmain text-sm font-medium" style={{ color: valueColor || colors.text }}>{value}</Text>
    </View>
  );
}

function PaymentRow({
  icon, iconBg, label, sub, selected, onPress, badge, colors
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
  badge?: React.ReactNode;
  colors: any;
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-3.5 py-3 active:opacity-80">
      <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: iconBg }}>
        {icon}
      </View>
      <View className="flex-1 ml-3">
        <View className="flex-row items-center">
          <Text className="text-textmain text-sm font-medium" style={{ color: colors.text }}>{label}</Text>
          {badge}
        </View>
        <Text className="text-muted text-[11px]" style={{ color: colors.textMuted }}>{sub}</Text>
      </View>
      <View
        className="w-5 h-5 rounded-full items-center justify-center"
        style={{ borderWidth: 1.5, borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : 'transparent' }}
      >
        {selected && <CheckCircle2 size={11} color="#fff" />}
      </View>
    </Pressable>
  );
}

function RazorpayBadge() {
  const colors = useThemeColors();
  return (
    <View className="ml-2 px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.primaryLight }}>
      <Text className="text-primary text-[8px] font-bold uppercase" style={{ color: colors.primary }}>Razorpay</Text>
    </View>
  );
}

function MockBadge() {
  const colors = useThemeColors();
  return (
    <View className="ml-2 px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.warningLight }}>
      <Text className="text-warning text-[8px] font-bold uppercase" style={{ color: colors.warning }}>Mock</Text>
    </View>
  );
}

function Divider({ colors }: { colors: any }) {
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 60 }} />;
}
