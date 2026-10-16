import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Globe, Eye, Smartphone, Bell, Trash2, ChevronRight,
  Database, Download, Info, Languages, HardDrive, Zap
} from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { useThemeStore } from '@/store/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const themeMode = useThemeStore(s => s.mode);
  const setMode = useThemeStore(s => s.setMode);

  const [language, setLanguage] = React.useState('en');
  const [showLanguagePicker, setShowLanguagePicker] = React.useState(false);
  const [dataSaver, setDataSaver] = React.useState(false);
  const [autoplay, setAutoplay] = React.useState(true);
  const [haptics, setHaptics] = React.useState(true);
  const [analytics, setAnalytics] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('foodmunch-app-settings');
      if (saved) {
        const s = JSON.parse(saved);
        setLanguage(s.language || 'en');
        setDataSaver(s.dataSaver ?? false);
        setAutoplay(s.autoplay ?? true);
        setHaptics(s.haptics ?? true);
        setAnalytics(s.analytics ?? true);
      }
    })();
  }, []);

  const save = (key: string, value: any) => {
    const all = { language, dataSaver, autoplay, haptics, analytics, [key]: value };
    AsyncStorage.setItem('foodmunch-app-settings', JSON.stringify(all));
  };

  const onClearCache = () => {
    Alert.alert(
      'Clear cache?',
      'This will clear cached images and temporary files. Your account, orders, and saved items will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            // Clear non-essential cache
            AsyncStorage.removeItem('foodmunch-customer-recent-searches').catch(() => {});
            Alert.alert('Done', 'Cache cleared successfully. The app may feel faster.');
          }
        }
      ]
    );
  };

  const currentLang = LANGUAGES.find(l => l.code === language);

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
        <Text className="text-[22px] font-extrabold tracking-tight" style={{ color: colors.text }}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Appearance */}
        <SectionTitle colors={colors}>Appearance</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          {(['light', 'dark', 'system'] as const).map((mode, idx) => (
            <View key={mode}>
              {idx > 0 && <Divider colors={colors} />}
              <Pressable
                onPress={() => setMode(mode)}
                className="flex-row items-center px-4 py-3 active:opacity-80"
              >
                <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: mode === 'light' ? colors.warningLight : mode === 'dark' ? colors.surfaceAlt : colors.primaryLight }}>
                  <Text className="text-lg">{mode === 'light' ? '☀️' : mode === 'dark' ? '🌙' : '🌗'}</Text>
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-medium capitalize" style={{ color: colors.text }}>{mode} Mode</Text>
                  <Text className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>
                    {mode === 'light' ? 'Bright and clear' : mode === 'dark' ? 'Easy on the eyes' : 'Follow your device setting'}
                  </Text>
                </View>
                {themeMode === mode && (
                  <View className="w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary }}>
                    <Text className="text-white text-[10px]">✓</Text>
                  </View>
                )}
              </Pressable>
            </View>
          ))}
        </View>

        {/* Language & Region */}
        <SectionTitle colors={colors}>Language & Region</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <Pressable
            onPress={() => setShowLanguagePicker(!showLanguagePicker)}
            className="flex-row items-center px-4 py-3 active:opacity-80"
          >
            <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
              <Languages size={18} color={colors.primary} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-sm font-medium" style={{ color: colors.text }}>App Language</Text>
              <Text className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>{currentLang?.native} ({currentLang?.name})</Text>
            </View>
            <ChevronRight size={16} color={colors.textSubtle} style={{ transform: [{ rotate: showLanguagePicker ? '90deg' : '0deg' }] }} />
          </Pressable>

          {showLanguagePicker && (
            <View style={{ backgroundColor: colors.surface }}>
              {LANGUAGES.map((lang, idx) => (
                <View key={lang.code}>
                  {idx > 0 && <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 62 }} />}
                  <Pressable
                    onPress={() => {
                      setLanguage(lang.code);
                      save('language', lang.code);
                      setShowLanguagePicker(false);
                      Alert.alert('Language updated', `App language set to ${lang.name}. Some content may still be in English.`);
                    }}
                    className="flex-row items-center px-4 py-2.5 active:opacity-80"
                  >
                    <Text className="flex-1 text-sm ml-16" style={{ color: colors.text }}>{lang.native} ({lang.name})</Text>
                    {language === lang.code && (
                      <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold' }}>✓</Text>
                    )}
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Data & Storage */}
        <SectionTitle colors={colors}>Data & Storage</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <ToggleRow
            icon={<Zap size={18} color={colors.warning} />}
            iconBg={colors.warningLight}
            title="Data Saver"
            desc="Lower image quality to save mobile data"
            value={dataSaver}
            onToggle={(v) => { setDataSaver(v); save('dataSaver', v); }}
            colors={colors}
          />
          <Divider colors={colors} />
          <ToggleRow
            icon={<Eye size={18} color={colors.info} />}
            iconBg={colors.infoLight}
            title="Autoplay Videos"
            desc="Auto-play product videos on Wi-Fi"
            value={autoplay}
            onToggle={(v) => { setAutoplay(v); save('autoplay', v); }}
            colors={colors}
          />
          <Divider colors={colors} />
          <Pressable
            onPress={onClearCache}
            className="flex-row items-center px-4 py-3 active:opacity-80"
          >
            <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: colors.errorLight }}>
              <Trash2 size={18} color={colors.error} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-sm font-medium" style={{ color: colors.text }}>Clear Cache</Text>
              <Text className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>Free up space without losing your data</Text>
            </View>
            <ChevronRight size={16} color={colors.textSubtle} />
          </Pressable>
          <Divider colors={colors} />
          <View className="flex-row items-center px-4 py-3">
            <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: colors.surfaceAlt }}>
              <HardDrive size={18} color={colors.textMuted} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-sm font-medium" style={{ color: colors.text }}>App Storage</Text>
              <Text className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>48 MB used</Text>
            </View>
          </View>
        </View>

        {/* Notifications & Haptics */}
        <SectionTitle colors={colors}>Notifications & Feedback</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <NavRow
            icon={<Bell size={18} color={colors.info} />}
            iconBg={colors.infoLight}
            title="Notification Preferences"
            subtitle="Customize push notifications"
            onPress={() => router.push('/notification-preferences')}
            colors={colors}
          />
          <Divider colors={colors} />
          <ToggleRow
            icon={<Smartphone size={18} color={colors.primary} />}
            iconBg={colors.primaryLight}
            title="Haptic Feedback"
            desc="Vibration on button taps"
            value={haptics}
            onToggle={(v) => { setHaptics(v); save('haptics', v); }}
            colors={colors}
          />
        </View>

        {/* Privacy */}
        <SectionTitle colors={colors}>Privacy</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <NavRow
            icon={<Eye size={18} color={colors.warning} />}
            iconBg={colors.warningLight}
            title="Privacy & Security"
            subtitle="Manage your data and security"
            onPress={() => router.push('/privacy')}
            colors={colors}
          />
          <Divider colors={colors} />
          <ToggleRow
            icon={<Database size={18} color={colors.textMuted} />}
            iconBg={colors.surfaceAlt}
            title="Share Usage Analytics"
            desc="Help us improve by sending anonymous data"
            value={analytics}
            onToggle={(v) => { setAnalytics(v); save('analytics', v); }}
            colors={colors}
          />
          <Divider colors={colors} />
          <NavRow
            icon={<Download size={18} color={colors.primary} />}
            iconBg={colors.primaryLight}
            title="Download My Data"
            onPress={() => router.push('/privacy')}
            colors={colors}
          />
        </View>

        {/* About */}
        <SectionTitle colors={colors}>About</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <NavRow
            icon={<Info size={18} color={colors.primary} />}
            iconBg={colors.primaryLight}
            title="About Food Munch"
            subtitle="Version 1.2.0"
            onPress={() => router.push('/about')}
            colors={colors}
          />
          <Divider colors={colors} />
          <NavRow
            icon={<Globe size={18} color={colors.info} />}
            iconBg={colors.infoLight}
            title="Rate the App"
            subtitle="Leave a 5-star review"
            onPress={() => {
              Alert.alert('Rate Food Munch', 'Thank you! Opening Play Store...');
              Linking.openURL('market://details?id=com.foodmunch.customer').catch(() => {});
            }}
            colors={colors}
          />
        </View>

        <Text className="text-center text-[11px] mt-2" style={{ color: colors.textMuted }}>
          Food Munch Customer App{'\n'}Version 1.2.0 • Build 126{'\n'}© 2026 Food Munch Technologies
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
