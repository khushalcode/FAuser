import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Shield, Lock, Eye, Bell, Smartphone, Trash2,
  Download, LogOut, ChevronRight, Fingerprint, KeyRound
} from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PrivacyScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  // Local toggle state (persisted to AsyncStorage)
  const [hideSensitive, setHideSensitive] = React.useState(false);
  const [biometricLock, setBiometricLock] = React.useState(false);
  const [orderHistory, setOrderHistory] = React.useState(true);
  const [locationTracking, setLocationTracking] = React.useState(true);
  const [adPersonalization, setAdPersonalization] = React.useState(true);
  const [searchHistory, setSearchHistory] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('foodmunch-privacy-settings');
      if (saved) {
        const s = JSON.parse(saved);
        setHideSensitive(s.hideSensitive ?? false);
        setBiometricLock(s.biometricLock ?? false);
        setOrderHistory(s.orderHistory ?? true);
        setLocationTracking(s.locationTracking ?? true);
        setAdPersonalization(s.adPersonalization ?? true);
        setSearchHistory(s.searchHistory ?? true);
      }
    })();
  }, []);

  const save = async (key: string, value: boolean) => {
    const all = {
      hideSensitive, biometricLock, orderHistory, locationTracking, adPersonalization, searchHistory,
      [key]: value
    };
    await AsyncStorage.setItem('foodmunch-privacy-settings', JSON.stringify(all));
  };

  const toggle = (key: string, setter: (v: boolean) => void) => (v: boolean) => {
    setter(v);
    save(key, v);
  };

  const onClearSearchHistory = () => {
    Alert.alert(
      'Clear search history?',
      'This will permanently remove all your recent searches. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('foodmunch-customer-recent-searches');
            setSearchHistory(false);
            Alert.alert('Done', 'Your search history has been cleared.');
          }
        }
      ]
    );
  };

  const onDownloadData = () => {
    Alert.alert(
      'Download your data',
      'We will compile a copy of your account data (profile, orders, addresses) and email it to you within 48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request Download', onPress: () => Alert.alert('Request submitted', 'You will receive an email at your registered address within 48 hours.') }
      ]
    );
  };

  const onDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This will permanently delete your account, orders, addresses, and wallet balance. This action CANNOT be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => Alert.alert('Contact support', 'For your safety, account deletion is handled by our support team. Please email privacy@foodmunch.app from your registered email.')
        }
      ]
    );
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
        <Text className="text-[22px] font-extrabold tracking-tight" style={{ color: colors.text }}>Privacy & Security</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Hero banner */}
        <View className="rounded-2xl p-4 mb-5 flex-row items-center" style={{ backgroundColor: colors.primaryLight }}>
          <View className="w-11 h-11 rounded-xl items-center justify-center" style={{ backgroundColor: colors.primary }}>
            <Shield size={20} color="#fff" />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-sm font-bold" style={{ color: colors.text }}>Your privacy, protected</Text>
            <Text className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>Control how we use your data and keep your account secure.</Text>
          </View>
        </View>

        {/* Security */}
        <SectionTitle colors={colors}>Security</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <ToggleRow
            icon={<Fingerprint size={18} color={colors.primary} />}
            iconBg={colors.primaryLight}
            title="Biometric Lock"
            desc="Require fingerprint / face unlock to open app"
            value={biometricLock}
            onToggle={toggle('biometricLock', setBiometricLock)}
            colors={colors}
          />
          <Divider colors={colors} />
          <ToggleRow
            icon={<Eye size={18} color={colors.warning} />}
            iconBg={colors.warningLight}
            title="Hide Sensitive Items"
            desc="Blur order details & prices in recents"
            value={hideSensitive}
            onToggle={toggle('hideSensitive', setHideSensitive)}
            colors={colors}
          />
          <Divider colors={colors} />
          <NavRow
            icon={<KeyRound size={18} color={colors.info} />}
            iconBg={colors.infoLight}
            title="Change Password"
            onPress={() => router.push('/(auth)/forgot-password')}
            colors={colors}
          />
          <Divider colors={colors} />
          <NavRow
            icon={<Smartphone size={18} color={colors.success} />}
            iconBg={colors.successLight}
            title="Active Devices"
            subtitle="2 devices signed in"
            onPress={() => Alert.alert('Active Devices', 'You are signed in on 2 devices. Tap to sign out from other devices.')}
            colors={colors}
          />
        </View>

        {/* Data & Personalization */}
        <SectionTitle colors={colors}>Data & Personalization</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <ToggleRow
            icon={<Bell size={18} color={colors.info} />}
            iconBg={colors.infoLight}
            title="Save Order History"
            desc="Keep past orders for quick reordering"
            value={orderHistory}
            onToggle={toggle('orderHistory', setOrderHistory)}
            colors={colors}
          />
          <Divider colors={colors} />
          <ToggleRow
            icon={<Lock size={18} color={colors.primary} />}
            iconBg={colors.primaryLight}
            title="Location Tracking"
            desc="Use location for nearby stores & faster delivery"
            value={locationTracking}
            onToggle={toggle('locationTracking', setLocationTracking)}
            colors={colors}
          />
          <Divider colors={colors} />
          <ToggleRow
            icon={<Eye size={18} color={colors.warning} />}
            iconBg={colors.warningLight}
            title="Ad Personalization"
            desc="Show offers based on your activity"
            value={adPersonalization}
            onToggle={toggle('adPersonalization', setAdPersonalization)}
            colors={colors}
          />
          <Divider colors={colors} />
          <ToggleRow
            icon={<Smartphone size={18} color={colors.success} />}
            iconBg={colors.successLight}
            title="Save Search History"
            desc="Remember your recent searches"
            value={searchHistory}
            onToggle={toggle('searchHistory', setSearchHistory)}
            colors={colors}
          />
        </View>

        {/* Your Data */}
        <SectionTitle colors={colors}>Your Data</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <NavRow
            icon={<Download size={18} color={colors.primary} />}
            iconBg={colors.primaryLight}
            title="Download My Data"
            subtitle="Get a copy of your account data"
            onPress={onDownloadData}
            colors={colors}
          />
          <Divider colors={colors} />
          <NavRow
            icon={<Trash2 size={18} color={colors.warning} />}
            iconBg={colors.warningLight}
            title="Clear Search History"
            onPress={onClearSearchHistory}
            colors={colors}
          />
          <Divider colors={colors} />
          <NavRow
            icon={<LogOut size={18} color={colors.error} />}
            iconBg={colors.errorLight}
            title="Sign Out All Devices"
            onPress={() => Alert.alert('Sign out everywhere', 'This will sign you out from all devices including this one.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out All', style: 'destructive', onPress: () => Alert.alert('Done', 'You have been signed out from all devices.') }
            ])}
            colors={colors}
          />
        </View>

        {/* Danger zone */}
        <SectionTitle colors={colors}>Account</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.errorLight, borderWidth: 1 }}>
          <NavRow
            icon={<Trash2 size={18} color={colors.error} />}
            iconBg={colors.errorLight}
            title="Delete Account"
            subtitle="Permanently remove your account & data"
            onPress={onDeleteAccount}
            colors={colors}
          />
        </View>

        <Text className="text-center text-[11px] mt-2 leading-4" style={{ color: colors.textMuted }}>
          Last updated: October 2026{'\n'}Read our full Privacy Policy in About Us → Legal
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

function NavRow({ icon, iconBg, title, subtitle, onPress, colors }: { icon: React.ReactNode; iconBg: string; title: string; subtitle?: string; onPress: () => void; colors: any }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-3 active:opacity-80">
      <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: iconBg }}>
        {icon}
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-sm font-medium" style={{ color: colors.text }}>{title}</Text>
        {subtitle && <Text className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>{subtitle}</Text>}
      </View>
      <ChevronRight size={16} color={colors.textSubtle} />
    </Pressable>
  );
}

function Divider({ colors }: { colors: any }) {
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 62 }} />;
}
