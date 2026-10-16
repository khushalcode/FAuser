import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Bell, Package, Tag, MessageSquare, Gift,
  Star, Shield, Volume2, Moon
} from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  const [prefs, setPrefs] = React.useState({
    orderUpdates: true,
    deliveryArrival: true,
    offersPromos: true,
    couponExpiry: true,
    chatReplies: true,
    rewardsLoyalty: true,
    rateRequests: true,
    newStores: false,
    soundEnabled: true,
    doNotDisturb: false,
  });

  React.useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('foodmunch-notification-prefs');
      if (saved) setPrefs(JSON.parse(saved));
    })();
  }, []);

  const toggle = (key: keyof typeof prefs) => (v: boolean) => {
    const next = { ...prefs, [key]: v };
    setPrefs(next);
    AsyncStorage.setItem('foodmunch-notification-prefs', JSON.stringify(next));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View className="px-5 pt-2 pb-3 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: colors.surface, borderColor: colors.borderLight, borderWidth: 1 }}
        >
          <ArrowLeft size={18} color={colors.text} />
        </Pressable>
        <Text className="text-[22px] font-extrabold tracking-tight" style={{ color: colors.text }}>Notification Preferences</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Banner */}
        <View className="rounded-2xl p-4 mb-5 flex-row items-center" style={{ backgroundColor: colors.infoLight }}>
          <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: colors.info }}>
            <Bell size={20} color="#fff" />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-sm font-bold" style={{ color: colors.text }}>Choose what you hear from us</Text>
            <Text className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>You can always change these later.</Text>
          </View>
        </View>

        {/* Orders */}
        <SectionTitle colors={colors}>Orders & Delivery</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <ToggleRow
            icon={<Package size={18} color={colors.primary} />}
            iconBg={colors.primaryLight}
            title="Order Updates"
            desc="Status changes: confirmed, preparing, out for delivery"
            value={prefs.orderUpdates}
            onToggle={toggle('orderUpdates')}
            colors={colors}
          />
          <Divider colors={colors} />
          <ToggleRow
            icon={<Bell size={18} color={colors.success} />}
            iconBg={colors.successLight}
            title="Delivery Arrival Alert"
            desc="Get notified when your order is at your door"
            value={prefs.deliveryArrival}
            onToggle={toggle('deliveryArrival')}
            colors={colors}
          />
          <Divider colors={colors} />
          <ToggleRow
            icon={<Star size={18} color={colors.warning} />}
            iconBg={colors.warningLight}
            title="Rate Your Order"
            desc="Reminders to review past orders"
            value={prefs.rateRequests}
            onToggle={toggle('rateRequests')}
            colors={colors}
          />
        </View>

        {/* Offers */}
        <SectionTitle colors={colors}>Offers & Rewards</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <ToggleRow
            icon={<Tag size={18} color={colors.warning} />}
            iconBg={colors.warningLight}
            title="Offers & Promotions"
            desc="Flash sales, festive deals, and discount alerts"
            value={prefs.offersPromos}
            onToggle={toggle('offersPromos')}
            colors={colors}
          />
          <Divider colors={colors} />
          <ToggleRow
            icon={<Gift size={18} color={colors.info} />}
            iconBg={colors.infoLight}
            title="Coupon Expiry Reminders"
            desc="Heads-up before your coupons expire"
            value={prefs.couponExpiry}
            onToggle={toggle('couponExpiry')}
            colors={colors}
          />
          <Divider colors={colors} />
          <ToggleRow
            icon={<Gift size={18} color={colors.warning} />}
            iconBg={colors.warningLight}
            title="Rewards & Loyalty"
            desc="Points earned, tier upgrades, milestone perks"
            value={prefs.rewardsLoyalty}
            onToggle={toggle('rewardsLoyalty')}
            colors={colors}
          />
          <Divider colors={colors} />
          <ToggleRow
            icon={<Package size={18} color={colors.primary} />}
            iconBg={colors.primaryLight}
            title="New Stores Near You"
            desc="When new restaurants or grocery stores join"
            value={prefs.newStores}
            onToggle={toggle('newStores')}
            colors={colors}
          />
        </View>

        {/* Support */}
        <SectionTitle colors={colors}>Support</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <ToggleRow
            icon={<MessageSquare size={18} color={colors.primary} />}
            iconBg={colors.primaryLight}
            title="Chat Replies"
            desc="When support responds to your queries"
            value={prefs.chatReplies}
            onToggle={toggle('chatReplies')}
            colors={colors}
          />
        </View>

        {/* Sound & DND */}
        <SectionTitle colors={colors}>Sound & Quiet Hours</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <ToggleRow
            icon={<Volume2 size={18} color={colors.info} />}
            iconBg={colors.infoLight}
            title="Notification Sound"
            desc="Play sound for incoming notifications"
            value={prefs.soundEnabled}
            onToggle={toggle('soundEnabled')}
            colors={colors}
          />
          <Divider colors={colors} />
          <ToggleRow
            icon={<Moon size={18} color={colors.primary} />}
            iconBg={colors.primaryLight}
            title="Do Not Disturb (10 PM – 7 AM)"
            desc="Silence non-urgent notifications at night"
            value={prefs.doNotDisturb}
            onToggle={toggle('doNotDisturb')}
            colors={colors}
          />
        </View>

        <Pressable
          onPress={() => Alert.alert('Saved', 'Your notification preferences have been updated.')}
          className="rounded-xl2 py-3.5 items-center mt-2"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-semibold text-base">Save Preferences</Text>
        </Pressable>

        <Text className="text-center text-[11px] mt-4" style={{ color: colors.textMuted }}>
          Critical order updates (payment failures, delivery issues) will always be sent.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ children, colors }: { children: React.ReactNode; colors: any }) {
  return (
    <Text className="text-xs uppercase tracking-wide font-bold mb-2" style={{ color: colors.textMuted }}>
      {children}
    </Text>
  );
}

function ToggleRow({ icon, iconBg, title, desc, value, onToggle, colors }: { icon: React.ReactNode; iconBg: string; title: string; desc: string; value: boolean; onToggle: (v: boolean) => void; colors: any }) {
  return (
    <View className="flex-row items-center px-4 py-3">
      <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: iconBg }}>
        {icon}
      </View>
      <View className="flex-1 ml-3 pr-3">
        <Text className="text-sm font-medium" style={{ color: colors.text }}>{title}</Text>
        <Text className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

function Divider({ colors }: { colors: any }) {
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 62 }} />;
}
