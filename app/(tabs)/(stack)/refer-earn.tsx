import React from 'react';
import { View, Text, ScrollView, Pressable, Share, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Gift, Copy, Share2, Users, Wallet, CheckCircle,
  Clock, ChevronRight, Award, TrendingUp
} from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import { hapticNotify } from '@/utils/platform';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Referral {
  id: string;
  friendName: string;
  status: 'pending' | 'completed' | 'rewarded';
  reward: number;
  date: string;
}

const DEMO_REFERRALS: Referral[] = [
  { id: 'r1', friendName: 'Priya S.', status: 'rewarded', reward: 100, date: '12 Oct 2026' },
  { id: 'r2', friendName: 'Rahul M.', status: 'completed', reward: 100, date: '8 Oct 2026' },
  { id: 'r3', friendName: 'Ananya K.', status: 'pending', reward: 100, date: '5 Oct 2026' },
  { id: 'r4', friendName: 'Vikram R.', status: 'rewarded', reward: 100, date: '28 Sep 2026' },
  { id: 'r5', friendName: 'Sneha P.', status: 'rewarded', reward: 100, date: '20 Sep 2026' },
];

export default function ReferEarnScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const user = useAuthStore((s) => s.user);

  // Generate a referral code from user name or default
  const referralCode = React.useMemo(() => {
    const name = user?.full_name || 'FOODIE';
    const code = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5);
    return `${code}100`;
  }, [user?.full_name]);

  const [copied, setCopied] = React.useState(false);
  const [referrals, setReferrals] = React.useState<Referral[]>(DEMO_REFERRALS);

  React.useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('foodmunch-referrals');
      if (saved) setReferrals(JSON.parse(saved));
    })();
  }, []);

  const referralLink = `https://foodmunch.app/r/${referralCode}`;

  const onCopy = () => {
    setCopied(true);
    hapticNotify('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `Hey! I've been using Food Munch for food + grocery delivery and I love it. Use my referral code ${referralCode} to get ₹100 off your first order. Download: ${referralLink}`,
        url: referralLink,
      });
    } catch (e) {}
  };

  const completedCount = referrals.filter(r => r.status === 'rewarded').length;
  const pendingCount = referrals.filter(r => r.status === 'pending').length;
  const totalEarned = referrals.filter(r => r.status === 'rewarded').reduce((s, r) => s + r.reward, 0);

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
        <Text className="text-[22px] font-extrabold tracking-tight" style={{ color: colors.text }}>Refer & Earn</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Hero gradient card */}
        <View
          className="rounded-2xl p-6 mb-5"
          style={{ backgroundColor: colors.warning, elevation: 6, shadowColor: colors.warning, shadowOpacity: 0.3, shadowRadius: 12 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Gift size={22} color="#fff" />
              <Text className="text-white text-base font-bold ml-2">Earn ₹100 per friend</Text>
            </View>
            <Award size={22} color="#fff" />
          </View>
          <Text className="text-white text-2xl font-bold mt-3">Give ₹100, Get ₹100</Text>
          <Text className="text-white/85 text-xs mt-1 leading-4">
            Your friend gets ₹100 off their first order. You get ₹100 in your wallet when they place their first order. Win-win!
          </Text>

          {/* Referral code box */}
          <View className="mt-4 rounded-xl p-3 flex-row items-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <View className="flex-1">
              <Text className="text-white/75 text-[10px] uppercase tracking-wide font-semibold">Your Referral Code</Text>
              <Text className="text-white text-lg font-bold tracking-wider mt-0.5">{referralCode}</Text>
            </View>
            <Pressable onPress={onCopy} className="flex-row items-center px-3 py-2 rounded-lg" style={{ backgroundColor: '#fff' }}>
              {copied ? (
                <>
                  <CheckCircle size={13} color={colors.success} />
                  <Text className="text-success text-xs font-semibold ml-1" style={{ color: colors.success }}>Copied</Text>
                </>
              ) : (
                <>
                  <Copy size={13} color={colors.warning} />
                  <Text className="text-xs font-semibold ml-1" style={{ color: colors.warning }}>Copy</Text>
                </>
              )}
            </Pressable>
          </View>

          <Pressable
            onPress={onShare}
            className="mt-3 rounded-xl py-3 flex-row items-center justify-center"
            style={{ backgroundColor: '#fff' }}
          >
            <Share2 size={16} color={colors.warning} />
            <Text className="text-base font-bold ml-2" style={{ color: colors.warning }}>Share with Friends</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View className="flex-row mb-5">
          <StatCard icon={<Users size={16} color={colors.primary} />} value={String(referrals.length)} label="Friends Invited" colors={colors} />
          <StatCard icon={<CheckCircle size={16} color={colors.success} />} value={String(completedCount)} label="Completed" colors={colors} />
          <StatCard icon={<Wallet size={16} color={colors.warning} />} value={`₹${totalEarned}`} label="Total Earned" colors={colors} />
        </View>

        {/* How it works */}
        <SectionTitle colors={colors}>How It Works</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <StepRow step="1" title="Share your code" desc="Send your referral code to friends via WhatsApp, SMS, or social media" colors={colors} />
          <Divider colors={colors} />
          <StepRow step="2" title="Friend signs up" desc="They download Food Munch and enter your code at signup for ₹100 off" colors={colors} />
          <Divider colors={colors} />
          <StepRow step="3" title="You both earn" desc="When they place their first order, ₹100 is added to your wallet" colors={colors} />
        </View>

        {/* Pending */}
        {pendingCount > 0 && (
          <View className="rounded-2xl p-3 mb-5 flex-row items-center" style={{ backgroundColor: colors.warningLight }}>
            <Clock size={18} color={colors.warning} />
            <Text className="text-xs ml-2 flex-1" style={{ color: colors.text }}>
              <Text style={{ color: colors.warning, fontWeight: '700' }}>{pendingCount} friend{pendingCount > 1 ? 's' : ''}</Text>
              {' '}
              yet to place their first order. You'll earn ₹{pendingCount * 100} when they do!
            </Text>
          </View>
        )}

        {/* Referral history */}
        <SectionTitle colors={colors}>Your Referrals</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          {referrals.length === 0 ? (
            <View className="items-center py-8 px-4">
              <Users size={32} color={colors.textMuted} />
              <Text className="text-sm font-semibold mt-2" style={{ color: colors.text }}>No referrals yet</Text>
              <Text className="text-xs mt-1 text-center" style={{ color: colors.textMuted }}>Share your code to start earning rewards.</Text>
            </View>
          ) : (
            referrals.map((r, idx) => (
              <View key={r.id}>
                {idx > 0 && <Divider colors={colors} />}
                <View className="flex-row items-center px-4 py-3">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: r.status === 'rewarded' ? colors.successLight : r.status === 'completed' ? colors.infoLight : colors.warningLight }}
                  >
                    <Text className="text-base font-bold" style={{ color: r.status === 'rewarded' ? colors.success : r.status === 'completed' ? colors.info : colors.warning }}>
                      {r.friendName[0]}
                    </Text>
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-sm font-medium" style={{ color: colors.text }}>{r.friendName}</Text>
                    <Text className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>{r.date}</Text>
                  </View>
                  <View className="items-end">
                    {r.status === 'rewarded' ? (
                      <View className="flex-row items-center">
                        <CheckCircle size={12} color={colors.success} />
                        <Text className="text-xs font-bold ml-1" style={{ color: colors.success }}>+₹{r.reward}</Text>
                      </View>
                    ) : r.status === 'completed' ? (
                      <Text className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: colors.infoLight, color: colors.info }}>Processing</Text>
                    ) : (
                      <Text className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: colors.warningLight, color: colors.warning }}>Pending</Text>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Terms */}
        <Pressable
          onPress={() => Alert.alert(
            'Terms & Conditions',
            '• Referral code must be applied at signup.\n• Referral reward credited after friend\'s first completed order.\n• Minimum order value ₹199.\n• Reward valid for 30 days from credit.\n• Self-referrals not allowed.\n• Food Munch reserves the right to modify or cancel the program.'
          )}
          className="flex-row items-center justify-center mt-2"
        >
          <Text className="text-[11px]" style={{ color: colors.textMuted }}>View terms & conditions</Text>
          <ChevronRight size={12} color={colors.textMuted} />
        </Pressable>
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

function StatCard({ icon, value, label, colors }: { icon: React.ReactNode; value: string; label: string; colors: any }) {
  return (
    <View className="flex-1 mx-1 rounded-xl p-3 items-center" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
      <View className="mb-1">{icon}</View>
      <Text className="text-lg font-bold" style={{ color: colors.text }}>{value}</Text>
      <Text className="text-[10px] text-center" style={{ color: colors.textMuted }}>{label}</Text>
    </View>
  );
}

function StepRow({ step, title, desc, colors }: { step: string; title: string; desc: string; colors: any }) {
  return (
    <View className="flex-row items-center px-4 py-3">
      <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary }}>
        <Text className="text-white text-sm font-bold">{step}</Text>
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-sm font-semibold" style={{ color: colors.text }}>{title}</Text>
        <Text className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>{desc}</Text>
      </View>
    </View>
  );
}

function Divider({ colors }: { colors: any }) {
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 60 }} />;
}
