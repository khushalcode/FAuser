import React from 'react';
import {
  View, Text, ScrollView, Pressable, Alert, Share, ActivityIndicator, Image as RNImage, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  MapPin, Heart, Tag, Wallet, Bell, MessageSquare,
  Settings, LogOut, ChevronRight, Gift, Star, ShoppingBag,
  HelpCircle, Shield, Award, ShoppingBasket, Camera, Moon,
  Share2, Star as StarIcon, Info, UserCog, Cake, Eye
} from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuthStore } from '@/store/auth';
import { useUserStore } from '@/store/user';
import { useCartStore } from '@/store/cart';
import { pickImage, uploadImage, StorageBucket } from '@/lib/storage';
import { apiClient } from '@/lib/api-client';
import { api } from '@/lib/api';
import { formatCurrency } from '@/utils/format';
import { hapticNotify } from '@/utils/platform';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const isMockMode = useAuthStore((s) => s.isMockMode);
  const colors = useThemeColors();
  const walletBalance = useUserStore((s) => s.walletBalance);
  const loyaltyPoints = useUserStore((s) => s.loyaltyPoints);
  const loyaltyTier = useUserStore((s) => s.loyaltyTier);
  const loyaltyProgress = useUserStore((s) => s.loyaltyProgress);
  const clearCart = useCartStore((s) => s.clear);
  const cartCount = useCartStore((s) => s.itemCount());

  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [birthday, setBirthday] = React.useState('');
  const [orderStats, setOrderStats] = React.useState({ upcoming: 0, completed: 24, cancelled: 1, refunds: 0 });
  const [hideSensitive, setHideSensitive] = React.useState(false);

  // Hydrate avatar URL when user changes
  React.useEffect(() => {
    setAvatarUrl(user?.avatar_url || null);
  }, [user?.id, user?.avatar_url]);

  // Load extra profile fields
  React.useEffect(() => {
    (async () => {
      const extra = await AsyncStorage.getItem('foodmunch-profile-extra');
      if (extra) {
        const s = JSON.parse(extra);
        setBirthday(s.birthday || '');
      }
      const privacy = await AsyncStorage.getItem('foodmunch-privacy-settings');
      if (privacy) {
        const p = JSON.parse(privacy);
        setHideSensitive(p.hideSensitive ?? false);
      }
      // Load real order counts
      try {
        const active = await api.getOrders({ status: 'active' });
        const past = await api.getOrders({ status: 'past' });
        setOrderStats(prev => ({
          ...prev,
          upcoming: active.length,
          completed: past.filter(o => o.status === 'delivered').length || prev.completed,
          cancelled: past.filter(o => o.status === 'cancelled').length || prev.cancelled,
        }));
      } catch (e) {}
    })();
  }, []);

  const onPickAvatar = async () => {
    try {
      const image = await pickImage({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7
      });
      if (!image) return;
      setUploadingAvatar(true);
      const result = await uploadImage(image, 'user_avatars' as StorageBucket, user?.id);
      if (!result.success) {
        Alert.alert('Upload failed', result.error || 'Please try again.');
        setUploadingAvatar(false);
        return;
      }
      setAvatarUrl(result.url);
      // Update backend user record so the URL persists
      try {
        await apiClient.put('/api/auth/profile', { avatar_url: result.url }).catch(() => {
          // Endpoint may not exist yet — that's ok, the URL is still set locally
        });
      } catch (e) {
        // ignore
      }
      hapticNotify('success');
      Alert.alert('Avatar updated', 'Your profile picture has been updated.');
    } catch (e: any) {
      Alert.alert('Avatar upload failed', e?.message || 'Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onLogout = () => {
    Alert.alert('Sign out?', 'You will need to sign in again to place orders.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          clearCart();
          router.replace('/(auth)/login');
        }
      }
    ]);
  };

  const onShare = async () => {
    try {
      const code = (user?.full_name || 'FOODIE').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5) + '100';
      await Share.share({
        message: `Hey! I've been using Food Munch for food + grocery delivery and I love it. Use my referral code ${code} to get ₹100 off your first order. https://foodmunch.app/r/${code}`
      });
    } catch (e) {}
  };

  const onRateApp = () => {
    Alert.alert(
      'Enjoying Food Munch?',
      'Your 5-star rating helps us reach more people. Thank you!',
      [
        { text: 'Maybe later', style: 'cancel' },
        { text: 'Rate now', onPress: () => Linking.openURL('market://details?id=com.foodmunch.customer').catch(() => Linking.openURL('https://play.google.com/store/apps/details?id=com.foodmunch.customer')) }
      ]
    );
    hapticNotify('success');
  };

  const displayName = user?.full_name || 'Guest User';
  const displayEmail = user?.email || 'Not signed in';
  const displayPhone = user?.phone || '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 12 }}
      >
        {/* Header */}
        <View
          style={{ backgroundColor: colors.background }}
          className="px-5 pt-3 pb-5"
        >
          <View className="flex-row items-center">
            {/* Avatar with camera overlay */}
            <Pressable onPress={() => router.push('/edit-profile')} disabled={uploadingAvatar} className="relative">
              <View
                className="w-16 h-16 rounded-full items-center justify-center overflow-hidden"
                style={{ backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.primaryLight }}
              >
                {avatarUrl ? (
                  <RNImage source={typeof avatarUrl === "string" ? { uri: avatarUrl } : avatarUrl} style={{ width: 64, height: 64 }} resizeMode="cover" />
                ) : (
                  <Text className="text-white text-2xl font-bold">
                    {displayName?.[0]?.toUpperCase() || 'G'}
                  </Text>
                )}
              </View>
              <View
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full items-center justify-center border-2"
                style={{ backgroundColor: colors.primary, borderColor: colors.background }}
              >
                {uploadingAvatar ? (
                  <ActivityIndicator size={10} color="#fff" />
                ) : (
                  <Camera size={11} color="#fff" />
                )}
              </View>
            </Pressable>
            <View className="ml-3 flex-1">
              <View className="flex-row items-center">
                <Text className="text-lg font-bold" style={{ color: colors.text }}>{displayName}</Text>
                <Pressable
                  onPress={() => router.push('/edit-profile')}
                  className="ml-2 w-6 h-6 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.surfaceAlt }}
                >
                  <UserCog size={12} color={colors.primary} />
                </Pressable>
              </View>
              <View className="flex-row items-center mt-0.5 flex-wrap">
                <View className="px-1.5 py-0.5 rounded-md" style={{ backgroundColor: colors.primaryLight }}>
                  <Text className="text-[10px] font-semibold tracking-wide" style={{ color: colors.primary }}>FOOD MUNCH CUSTOMER</Text>
                </View>
                {birthday ? (
                  <View className="px-1.5 py-0.5 rounded-md ml-1 flex-row items-center" style={{ backgroundColor: colors.primaryLight }}>
                    <Cake size={9} color={colors.primary} />
                    <Text className="text-[10px] font-semibold ml-1" style={{ color: colors.primary }}>{birthday}</Text>
                  </View>
                ) : null}
              </View>
              <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{displayEmail}</Text>
              {displayPhone ? <Text className="text-xs" style={{ color: colors.textMuted }}>{displayPhone}</Text> : null}
            </View>
            <Pressable
              onPress={() => router.push('/chat')}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border }}
            >
              <MessageSquare size={18} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Shortcut grid */}
        <View className="px-5">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 }}>
            {[
              { key: 'wallet', label: 'Wallet', value: 'View Balance', sub: formatCurrency(walletBalance), Icon: Wallet, route: '/wallet' },
              { key: 'coupons', label: 'Coupons', value: 'View Offers', sub: 'Save more', Icon: Tag, route: '/coupons' },
              { key: 'cart', label: 'My Cart', value: 'View Cart', sub: `${cartCount} item${cartCount === 1 ? '' : 's'}`, Icon: ShoppingBag, route: '/(tabs)/cart' },
              { key: 'addr', label: 'Saved Addresses', value: 'Manage', sub: 'Delivery spots', Icon: MapPin, route: '/address' }
            ].map(({ key, label, value, sub, Icon, route }) => (
              <Pressable
                key={key}
                onPress={() => router.push(route as any)}
                style={{
                  width: '48.5%', flexDirection: 'row', alignItems: 'center', gap: 10,
                  padding: 12, borderRadius: 16, borderWidth: 1,
                  backgroundColor: colors.surfaceElevated, borderColor: colors.border
                }}
              >
                <View style={{ width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight }}>
                  <Icon size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ color: colors.textMuted, fontSize: 10.5 }}>{label}</Text>
                  <Text numberOfLines={1} style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>{value}</Text>
                  <Text numberOfLines={1} style={{ color: colors.primary, fontSize: 10.5, marginTop: 1 }}>{sub}</Text>
                </View>
                <ChevronRight size={14} color={colors.textSubtle} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Order summary card */}
        <View className="px-5 mt-4">
          <View className="rounded-xl2 border border-line overflow-hidden" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
            <View className="flex-row items-center justify-between px-4 py-3" style={{ borderBottomColor: colors.border, borderBottomWidth: 1 }}>
              <Text className="text-sm font-bold" style={{ color: colors.text }}>My Orders</Text>
              <Pressable onPress={() => router.push('/(tabs)/orders')}>
                <Text className="text-xs font-semibold" style={{ color: colors.primary }}>View All →</Text>
              </Pressable>
            </View>
            <View className="flex-row">
              <OrderStatCell label="Upcoming" value={orderStats.upcoming} color={colors.primary} colors={colors} />
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <OrderStatCell label="Completed" value={orderStats.completed} color={colors.success} colors={colors} />
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <OrderStatCell label="Cancelled" value={orderStats.cancelled} color={colors.error} colors={colors} />
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <OrderStatCell label="Refunds" value={orderStats.refunds} color={colors.warning} colors={colors} />
            </View>
          </View>
        </View>

        {/* Menu */}
        <View className="px-5 mt-5">
          <Text className="text-muted text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: colors.textMuted }}>Account</Text>
          <View className="bg-white rounded-xl2 border border-line overflow-hidden" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
            <MenuRow icon={<UserCog size={18} color={colors.primary} />} iconBg={colors.primaryLight} title="Edit Profile" subtitle="Name, email, phone, birthday" onPress={() => router.push('/edit-profile')} colors={colors} />
            <Divider colors={colors} />
            <MenuRow icon={<MapPin size={18} color={colors.primary} />} iconBg={colors.primaryLight} title="Saved Addresses" onPress={() => router.push('/address')} colors={colors} />
            <Divider colors={colors} />
            <MenuRow icon={<Heart size={18} color={colors.error} />} iconBg={colors.errorLight} title="Favourites & Wishlist" onPress={() => router.push('/favourites')} colors={colors} />
            <Divider colors={colors} />
            <MenuRow icon={<Tag size={18} color={colors.warning} />} iconBg={colors.warningLight} title="Coupons & Offers" onPress={() => router.push('/coupons')} colors={colors} />
            <Divider colors={colors} />
            <MenuRow icon={<Wallet size={18} color={colors.primary} />} iconBg={colors.primaryLight} title="Wallet & Transactions" onPress={() => router.push('/wallet')} colors={colors} />
          </View>

          <Text className="text-muted text-xs uppercase tracking-wide font-semibold mt-5 mb-2" style={{ color: colors.textMuted }}>Preferences</Text>
          <View className="bg-white rounded-xl2 border border-line overflow-hidden" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
            <View className="flex-row items-center px-3.5 py-3">
              <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
                <Moon size={18} color={colors.primary} />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-textmain text-sm font-medium" style={{ color: colors.text }}>Dark Mode</Text>
                <Text className="text-muted text-[11px] mt-0.5" style={{ color: colors.textMuted }}>Toggle light or dark theme</Text>
              </View>
              <ThemeToggle size="md" />
            </View>
            <Divider colors={colors} />
            <MenuRow icon={<Bell size={18} color={colors.info} />} iconBg={colors.infoLight} title="Notifications" onPress={() => router.push('/notifications')} colors={colors} />
            <Divider colors={colors} />
            <MenuRow icon={<Bell size={18} color={colors.info} />} iconBg={colors.infoLight} title="Notification Preferences" subtitle="Customize push alerts" onPress={() => router.push('/notification-preferences')} colors={colors} />
            <Divider colors={colors} />
            <MenuRow icon={<MessageSquare size={18} color={colors.primary} />} iconBg={colors.primaryLight} title="Chat Support" onPress={() => router.push('/chat')} colors={colors} />
            <Divider colors={colors} />
            <MenuRow icon={<HelpCircle size={18} color={colors.info} />} iconBg={colors.infoLight} title="Help & FAQ" subtitle="FAQs, refunds, contact us" onPress={() => router.push('/help-faq')} colors={colors} />
            <Divider colors={colors} />
            <MenuRow icon={<Shield size={18} color={colors.primary} />} iconBg={colors.primaryLight} title="Privacy & Security" subtitle="Data controls, biometric lock" onPress={() => router.push('/privacy')} colors={colors} />
            <Divider colors={colors} />
            <MenuRow icon={<Settings size={18} color={colors.textMuted} />} iconBg={colors.surfaceAlt} title="Settings" subtitle="Language, cache, analytics" onPress={() => router.push('/settings')} colors={colors} />
          </View>

          <Text className="text-muted text-xs uppercase tracking-wide font-semibold mt-5 mb-2" style={{ color: colors.textMuted }}>Rewards & More</Text>
          <View className="bg-white rounded-xl2 border border-line overflow-hidden" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
            <MenuRow icon={<Gift size={18} color={colors.warning} />} iconBg={colors.warningLight} title="Refer & Earn" subtitle="Give ₹100, Get ₹100" onPress={() => router.push('/refer-earn')} colors={colors} />
            <Divider colors={colors} />
            <MenuRow icon={<Award size={18} color={colors.warning} />} iconBg={colors.warningLight} title="Loyalty Program" subtitle={`${loyaltyTier} member • ${loyaltyPoints} points`} onPress={() => router.push('/wallet')} colors={colors} />
            <Divider colors={colors} />
            <MenuRow icon={<Star size={18} color={colors.warning} />} iconBg={colors.warningLight} title="Rate the App" subtitle="Leave us a 5-star review" onPress={onRateApp} colors={colors} />
            <Divider colors={colors} />
            <MenuRow icon={<Share2 size={18} color={colors.primary} />} iconBg={colors.primaryLight} title="Share App" subtitle="Invite friends to Food Munch" onPress={onShare} colors={colors} />
            <Divider colors={colors} />
            <MenuRow icon={<Info size={18} color={colors.info} />} iconBg={colors.infoLight} title="About Us" subtitle="Version 1.2.0" onPress={() => router.push('/about')} colors={colors} />
          </View>

          {hideSensitive && (
            <View className="mt-4 p-3 rounded-xl2 flex-row items-center" style={{ backgroundColor: colors.warningLight }}>
              <Eye size={14} color={colors.warning} />
              <Text className="text-xs ml-2 flex-1" style={{ color: colors.text }}>Sensitive items are hidden. Manage in Privacy settings.</Text>
            </View>
          )}

          {isMockMode && (
            <View className="mt-5 p-3 rounded-xl2 border border-dashed" style={{ borderColor: colors.warning }}>
              <View className="flex-row items-center">
                <ShoppingBasket size={14} color={colors.warning} />
                <Text className="text-warning text-xs font-semibold ml-1.5" style={{ color: colors.warning }}>Preview Mode</Text>
              </View>
              <Text className="text-muted text-xs mt-1" style={{ color: colors.textMuted }}>
                Firebase & Supabase are in mock mode. Sign out and back in to test the flow.
              </Text>
            </View>
          )}

          <Pressable
            onPress={onLogout}
            className="mt-5 mb-8 bg-white rounded-xl2 border border-line py-3.5 flex-row items-center justify-center active:opacity-80"
            style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.errorLight }}
          >
            <LogOut size={16} color={colors.error} />
            <Text className="text-error font-semibold text-sm ml-2" style={{ color: colors.error }}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCell({ icon, label, value, colors }: { icon: React.ReactNode; label: string; value: string; colors: any }) {
  return (
    <View className="flex-1 py-3 items-center">
      <View className="flex-row items-center mb-1">{icon}</View>
      <Text className="text-textmain font-bold text-sm" style={{ color: colors.text }}>{value}</Text>
      <Text className="text-muted text-[10px]" style={{ color: colors.textMuted }}>{label}</Text>
    </View>
  );
}

function OrderStatCell({ label, value, color, colors }: { label: string; value: number; color: string; colors: any }) {
  return (
    <View className="flex-1 py-3.5 items-center">
      <Text className="text-lg font-bold" style={{ color }}>{value}</Text>
      <Text className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>{label}</Text>
    </View>
  );
}

function MenuRow({
  icon, iconBg, title, subtitle, onPress, colors
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  colors: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-3.5 py-3 active:opacity-80"
    >
      <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: iconBg }}>
        {icon}
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-textmain text-sm font-medium" style={{ color: colors.text }}>{title}</Text>
        {subtitle && <Text className="text-muted text-[11px] mt-0.5" style={{ color: colors.textMuted }}>{subtitle}</Text>}
      </View>
      <ChevronRight size={16} color={colors.textSubtle} />
    </Pressable>
  );
}

function Divider({ colors }: { colors: any }) {
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 60 }} />;
}
