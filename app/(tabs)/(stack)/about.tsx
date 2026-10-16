import React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Info, Shield, FileText, Mail, Phone, Globe,
  Award, Heart, Users, Zap
} from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';

export default function AboutScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-2 pb-3 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: colors.surface, borderColor: colors.borderLight, borderWidth: 1 }}
        >
          <ArrowLeft size={18} color={colors.text} />
        </Pressable>
        <Text className="text-[22px] font-extrabold tracking-tight" style={{ color: colors.text }}>About Us</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Brand hero */}
        <View
          className="rounded-2xl p-6 items-center mb-5"
          style={{ backgroundColor: colors.primary, elevation: 4, shadowColor: colors.primary, shadowOpacity: 0.25, shadowRadius: 10 }}
        >
          <View className="w-16 h-16 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <Zap size={30} color="#fff" fill="#fff" />
          </View>
          <Text className="text-white text-2xl font-bold">Food Munch</Text>
          <Text className="text-white/85 text-xs mt-1">Food + Grocery delivered in minutes</Text>
          <View className="mt-3 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <Text className="text-white text-[11px] font-semibold">Version 1.2.0</Text>
          </View>
        </View>

        {/* Story */}
        <SectionTitle colors={colors}>Our Story</SectionTitle>
        <View className="rounded-2xl p-4 mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="text-sm leading-5" style={{ color: colors.text }}>
            Food Munch began with a simple idea: make fresh food and everyday groceries reachable in minutes, not hours. What started as a tiny neighbourhood pilot in Indore has grown into a full quick-commerce platform serving thousands of households across India.{'\n\n'}
            We partner with local restaurants, trusted grocery brands, and a fleet of dedicated delivery partners to bring everything you need — from hot biryani to your weekly atta and dal — right to your doorstep, usually in under 15 minutes.{'\n\n'}
            Our mission is to save you time so you can spend it on the things that matter. Every order placed on Food Munch supports a local store, a delivery partner, and a supply chain built for speed without compromising on quality.
          </Text>
        </View>

        {/* What we offer */}
        <SectionTitle colors={colors}>What We Offer</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <FeatureRow icon={<Zap size={18} color={colors.primary} />} iconBg={colors.primaryLight} title="Lightning Delivery" desc="8-minute grocery, 25-minute food delivery" colors={colors} />
          <Divider colors={colors} />
          <FeatureRow icon={<Heart size={18} color={colors.error} />} iconBg={colors.errorLight} title="Fresh Every Time" desc="Quality-checked produce & sealed packaging" colors={colors} />
          <Divider colors={colors} />
          <FeatureRow icon={<Award size={18} color={colors.warning} />} iconBg={colors.warningLight} title="Food Munch Gold" desc="Free delivery, exclusive offers & cashback" colors={colors} />
          <Divider colors={colors} />
          <FeatureRow icon={<Users size={18} color={colors.info} />} iconBg={colors.infoLight} title="Local Partners" desc="Supporting 500+ local stores & restaurants" colors={colors} />
        </View>

        {/* Legal links */}
        <SectionTitle colors={colors}>Legal</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <LinkRow icon={<FileText size={18} color={colors.primary} />} iconBg={colors.primaryLight} title="Terms of Service" onPress={() => openLink('https://foodmunch.app/terms')} colors={colors} />
          <Divider colors={colors} />
          <LinkRow icon={<Shield size={18} color={colors.primary} />} iconBg={colors.primaryLight} title="Privacy Policy" onPress={() => openLink('https://foodmunch.app/privacy')} colors={colors} />
          <Divider colors={colors} />
          <LinkRow icon={<FileText size={18} color={colors.primary} />} iconBg={colors.primaryLight} title="Refund & Cancellation" onPress={() => openLink('https://foodmunch.app/refunds')} colors={colors} />
          <Divider colors={colors} />
          <LinkRow icon={<Info size={18} color={colors.primary} />} iconBg={colors.primaryLight} title="Cookie Policy" onPress={() => openLink('https://foodmunch.app/cookies')} colors={colors} />
        </View>

        {/* Contact */}
        <SectionTitle colors={colors}>Contact Us</SectionTitle>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
          <LinkRow icon={<Mail size={18} color={colors.info} />} iconBg={colors.infoLight} title="support@foodmunch.app" subtitle="Email support · 24/7" onPress={() => openLink('mailto:support@foodmunch.app')} colors={colors} />
          <Divider colors={colors} />
          <LinkRow icon={<Phone size={18} color={colors.success} />} iconBg={colors.successLight} title="+91 1800-123-4567" subtitle="Toll-free helpline · 9 AM–9 PM" onPress={() => openLink('tel:+9118001234567')} colors={colors} />
          <Divider colors={colors} />
          <LinkRow icon={<Globe size={18} color={colors.warning} />} iconBg={colors.warningLight} title="www.foodmunch.app" subtitle="Visit our website" onPress={() => openLink('https://foodmunch.app')} colors={colors} />
        </View>

        {/* Social impact */}
        <SectionTitle colors={colors}>Our Impact</SectionTitle>
        <View className="flex-row flex-wrap mb-5">
          <StatCard value="2M+" label="Orders Delivered" colors={colors} />
          <StatCard value="500+" label="Partner Stores" colors={colors} />
          <StatCard value="15 min" label="Avg Delivery" colors={colors} />
          <StatCard value="4.6★" label="Customer Rating" colors={colors} />
        </View>

        <Text className="text-center text-[11px] mt-4" style={{ color: colors.textMuted }}>
          Made with ❤️ in India • © 2026 Food Munch Technologies Pvt. Ltd.
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

function FeatureRow({ icon, iconBg, title, desc, colors }: { icon: React.ReactNode; iconBg: string; title: string; desc: string; colors: any }) {
  return (
    <View className="flex-row items-center px-4 py-3">
      <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: iconBg }}>
        {icon}
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-sm font-semibold" style={{ color: colors.text }}>{title}</Text>
        <Text className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>{desc}</Text>
      </View>
    </View>
  );
}

function LinkRow({ icon, iconBg, title, subtitle, onPress, colors }: { icon: React.ReactNode; iconBg: string; title: string; subtitle?: string; onPress: () => void; colors: any }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-3 active:opacity-80">
      <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: iconBg }}>
        {icon}
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-sm font-medium" style={{ color: colors.text }}>{title}</Text>
        {subtitle && <Text className="text-[11px] mt-0.5" style={{ color: colors.textMuted }}>{subtitle}</Text>}
      </View>
    </Pressable>
  );
}

function StatCard({ value, label, colors }: { value: string; label: string; colors: any }) {
  return (
    <View className="w-1/2 p-1.5">
      <View className="rounded-xl p-3 items-center" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }}>
        <Text className="text-lg font-bold" style={{ color: colors.primary }}>{value}</Text>
        <Text className="text-[10px] mt-0.5 text-center" style={{ color: colors.textMuted }}>{label}</Text>
      </View>
    </View>
  );
}

function Divider({ colors }: { colors: any }) {
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 62 }} />;
}
