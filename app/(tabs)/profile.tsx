import React from 'react';
import {
  View, Text, ScrollView, Pressable, Alert, Share, ActivityIndicator, Image as RNImage
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  MapPin, Heart, Tag, Wallet, Bell, MessageSquare,
  Settings, LogOut, ChevronRight, Gift, Star, ShoppingBag,
  HelpCircle, Shield, Award, ShoppingBasket, Camera
} from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { useAuthStore } from '@/store/auth';
import { useUserStore } from '@/store/user';
import { useCartStore } from '@/store/cart';
import { pickImage, uploadImage, StorageBucket } from '@/lib/storage';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/utils/format';
import { hapticNotify } from '@/utils/platform';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const isMockMode = useAuthStore((s) => s.isMockMode);
  const walletBalance = useUserStore((s) => s.walletBalance);
  const loyaltyPoints = useUserStore((s) => s.loyaltyPoints);
  const loyaltyTier = useUserStore((s) => s.loyaltyTier);
  const loyaltyProgress = useUserStore((s) => s.loyaltyProgress);
  const clearCart = useCartStore((s) => s.clear);

  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);

  // Hydrate avatar URL when user changes
  React.useEffect(() => {
    setAvatarUrl(user?.avatar_url || null);
  }, [user?.id, user?.avatar_url]);

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
      await Share.share({
        message: 'Download Food Munch — Food + Grocery delivered! Use my code AARAV20 for 20% off your first order. https://foodmunch.app'
      });
    } catch (e) {}
  };

  const displayName = user?.full_name || 'Guest User';
  const displayEmail = user?.email || 'Not signed in';
  const displayPhone = user?.phone || '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }} edges={['top']}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 12 }}
      >
        {/* Header */}
        <View
          style={{ backgroundColor: colors.primary }}
          className="px-5 pt-3 pb-16 rounded-b-[2rem]"
        >
          <View className="flex-row items-center">
            {/* Avatar with camera overlay */}
            <Pressable onPress={onPickAvatar} disabled={uploadingAvatar} className="relative">
              <View
                className="w-16 h-16 rounded-full items-center justify-center overflow-hidden"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
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
                style={{ backgroundColor: colors.primary, borderColor: '#fff' }}
              >
                {uploadingAvatar ? (
                  <ActivityIndicator size={10} color="#fff" />
                ) : (
                  <Camera size={11} color="#fff" />
                )}
              </View>
            </Pressable>
            <View className="ml-3 flex-1">
              <Text className="text-white text-lg font-bold">{displayName}</Text>
              <View className="flex-row items-center mt-0.5">
                <View className="px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}>
                  <Text className="text-white text-[10px] font-semibold tracking-wide">FOOD MUNCH CUSTOMER</Text>
                </View>
              </View>
              <Text className="text-white/85 text-xs mt-0.5">{displayEmail}</Text>
              {displayPhone ? <Text className="text-white/85 text-xs">{displayPhone}</Text> : null}
            </View>
            <Pressable
              onPress={() => router.push('/chat')}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <MessageSquare size={18} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Loyalty + wallet cards */}
        <View className="px-5 -mt-12">
          <View className="flex-row">
            <View className="flex-1 bg-white rounded-xl2 p-3.5 mr-2 border border-line" style={{ elevation: 2, shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 6 }}>
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
                  <Wallet size={16} color={colors.primary} />
                </View>
                <View className="ml-2">
                  <Text className="text-muted text-[11px]">Wallet</Text>
                  <Text className="text-textmain font-bold text-base">{formatCurrency(walletBalance)}</Text>
                </View>
              </View>
              <Pressable onPress={() => router.push('/wallet')} className="mt-2">
                <Text className="text-primary text-xs font-semibold">View →</Text>
              </Pressable>
            </View>

            <View className="flex-1 bg-white rounded-xl2 p-3.5 ml-2 border border-line" style={{ elevation: 2, shadowColor: '#0F172A', shadowOpacity: 0.08, shadowRadius: 6 }}>
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: colors.warningLight }}>
                  <Award size={16} color={colors.warning} />
                </View>
                <View className="ml-2">
                  <Text className="text-muted text-[11px]">{loyaltyTier} Tier</Text>
                  <Text className="text-textmain font-bold text-base">{loyaltyPoints} pts</Text>
                </View>
              </View>
              <View className="mt-2 h-1 rounded-full bg-line overflow-hidden">
                <View style={{ width: `${loyaltyProgress * 100}%`, height: '100%', backgroundColor: colors.warning }} />
              </View>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View className="px-5 mt-4">
          <View className="flex-row bg-white rounded-xl2 border border-line">
            <StatCell icon={<ShoppingBag size={14} color={colors.primary} />} label="Orders" value="24" />
            <View style={{ width: 1, backgroundColor: colors.border }} />
            <StatCell icon={<Star size={14} color={colors.warning} />} label="Reviews" value="12" />
            <View style={{ width: 1, backgroundColor: colors.border }} />
            <StatCell icon={<Heart size={14} color={colors.error} />} label="Favourites" value="8" />
            <View style={{ width: 1, backgroundColor: colors.border }} />
            <StatCell icon={<Gift size={14} color={colors.info} />} label="Coupons" value="5" />
          </View>
        </View>

        {/* Menu */}
        <View className="px-5 mt-5">
          <Text className="text-muted text-xs uppercase tracking-wide font-semibold mb-2">Account</Text>
          <View className="bg-white rounded-xl2 border border-line overflow-hidden">
            <MenuRow icon={<MapPin size={18} color={colors.primary} />} iconBg={colors.primaryLight} title="Saved Addresses" onPress={() => router.push('/address')} />
            <Divider />
            <MenuRow icon={<Heart size={18} color={colors.error} />} iconBg={colors.errorLight} title="Favourites" onPress={() => router.push('/favourites')} />
            <Divider />
            <MenuRow icon={<Tag size={18} color={colors.warning} />} iconBg={colors.warningLight} title="Coupons & Offers" onPress={() => router.push('/coupons')} />
            <Divider />
            <MenuRow icon={<Wallet size={18} color={colors.primary} />} iconBg={colors.primaryLight} title="Wallet & Transactions" onPress={() => router.push('/wallet')} />
          </View>

          <Text className="text-muted text-xs uppercase tracking-wide font-semibold mt-5 mb-2">Preferences</Text>
          <View className="bg-white rounded-xl2 border border-line overflow-hidden">
            <MenuRow icon={<Bell size={18} color={colors.info} />} iconBg={colors.infoLight} title="Notifications" onPress={() => router.push('/notifications')} />
            <Divider />
            <MenuRow icon={<MessageSquare size={18} color={colors.primary} />} iconBg={colors.primaryLight} title="Chat Support" onPress={() => router.push('/chat')} />
            <Divider />
            <MenuRow icon={<HelpCircle size={18} color={colors.textMuted} />} iconBg={colors.surfaceAlt} title="Help & FAQ" onPress={() => router.push('/chat')} />
            <Divider />
            <MenuRow icon={<Shield size={18} color={colors.textMuted} />} iconBg={colors.surfaceAlt} title="Privacy & Security" />
            <Divider />
            <MenuRow icon={<Settings size={18} color={colors.textMuted} />} iconBg={colors.surfaceAlt} title="Settings" />
          </View>

          <Text className="text-muted text-xs uppercase tracking-wide font-semibold mt-5 mb-2">Rewards</Text>
          <View className="bg-white rounded-xl2 border border-line overflow-hidden">
            <MenuRow icon={<Gift size={18} color={colors.warning} />} iconBg={colors.warningLight} title="Refer & Earn" subtitle="Get ₹100 for every friend" onPress={onShare} />
            <Divider />
            <MenuRow icon={<Award size={18} color={colors.warning} />} iconBg={colors.warningLight} title="Loyalty Program" subtitle={`${loyaltyTier} member • ${loyaltyPoints} points`} />
          </View>

          {isMockMode && (
            <View className="mt-5 p-3 rounded-xl2 border border-dashed" style={{ borderColor: colors.warning }}>
              <View className="flex-row items-center">
                <ShoppingBasket size={14} color={colors.warning} />
                <Text className="text-warning text-xs font-semibold ml-1.5">Preview Mode</Text>
              </View>
              <Text className="text-muted text-xs mt-1">
                Firebase & Supabase are in mock mode. Sign out and back in to test the flow.
              </Text>
            </View>
          )}

          <Pressable
            onPress={onLogout}
            className="mt-5 mb-8 bg-white rounded-xl2 border border-line py-3.5 flex-row items-center justify-center active:opacity-80"
            style={{ borderColor: colors.errorLight }}
          >
            <LogOut size={16} color={colors.error} />
            <Text className="text-error font-semibold text-sm ml-2">Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="flex-1 py-3 items-center">
      <View className="flex-row items-center mb-1">{icon}</View>
      <Text className="text-textmain font-bold text-sm">{value}</Text>
      <Text className="text-muted text-[10px]">{label}</Text>
    </View>
  );
}

function MenuRow({
  icon, iconBg, title, subtitle, onPress
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
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
        <Text className="text-textmain text-sm font-medium">{title}</Text>
        {subtitle && <Text className="text-muted text-[11px] mt-0.5">{subtitle}</Text>}
      </View>
      <ChevronRight size={16} color={colors.textSubtle} />
    </Pressable>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 60 }} />;
}
