import React from 'react';
import {
  View, Text, TextInput, Pressable, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert, Animated, Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Phone, ChevronLeft, ChevronRight, Shield, Lock } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import { hapticNotify } from '@/utils/platform';

const COUNTRIES = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
];

export default function PhoneLoginScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const isLoading = useAuthStore((s) => s.isLoading);
  const clearError = useAuthStore((s) => s.clearError);

  const [phone, setPhone] = React.useState('');
  const [countryIdx, setCountryIdx] = React.useState(0);
  const country = COUNTRIES[countryIdx];

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web', easing: Easing.out(Easing.ease) }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  const isValid = phone.replace(/\D/g, '').length >= 10;

  const onSendOtp = async () => {
    if (!isValid) {
      Alert.alert('Invalid phone', 'Please enter a valid 10-digit phone number.');
      return;
    }
    let normalized = phone.trim();
    if (!normalized.startsWith('+')) {
      const digits = normalized.replace(/\D/g, '');
      if (digits.length === 10) normalized = country.code + digits;
      else if (digits.length === 12 && digits.startsWith('91')) normalized = '+' + digits;
    }

    try {
      const result = await sendOtp(normalized);
      hapticNotify('success');
      router.push({
        pathname: '/verify-otp',
        params: { phone: normalized, mockOtp: result.mockOtp || '' }
      });
    } catch (e: any) {
      Alert.alert('OTP send failed', e?.message || 'Please try again.');
    }
  };

  const onAutofill = () => {
    setPhone('9876543210');
    clearError();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingTop: 40,
            paddingBottom: 60,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={{
              position: 'absolute', top: 16, left: 16,
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronLeft size={20} color="#fff" />
          </Pressable>

          {/* Decorative circles */}
          <View style={{ position: 'absolute', right: -40, top: -20, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.08)' }} />

          <Animated.View style={{ alignItems: 'center', transform: [{ scale: scaleAnim }], opacity: fadeAnim }}>
            <View
              style={{
                width: 96, height: 96, borderRadius: 48,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Phone size={40} color="#fff" />
            </View>
            <Text className="text-white text-2xl font-black text-center">Verify your number</Text>
            <Text className="text-white/90 text-sm mt-2 text-center px-4">
              Enter your mobile number to receive an OTP
            </Text>
          </Animated.View>
        </View>

        <Animated.View style={{ opacity: fadeAnim }} className="px-6 pt-6 flex-1">
          {/* Country picker + phone */}
          <Text className="text-textmain text-sm font-medium mb-1.5" style={{ color: colors.text }}>Mobile Number</Text>
          <View className="flex-row items-center bg-surface rounded-xl px-3.5 py-3 border border-line" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
            <Pressable
              onPress={() => setCountryIdx((countryIdx + 1) % COUNTRIES.length)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 20 }}>{country.flag}</Text>
              <Text className="text-textmain text-sm font-semibold ml-1.5 mr-1" style={{ color: colors.text }}>{country.code}</Text>
              <ChevronRight size={12} color={colors.textMuted} style={{ transform: [{ rotate: '90deg' }] }} />
            </Pressable>
            <View style={{ width: 1, height: 20, backgroundColor: colors.border, marginHorizontal: 8 }} />
            <TextInput
              value={phone}
              onChangeText={(t) => { setPhone(t.replace(/[^0-9]/g, '').slice(0, 10)); clearError(); }}
              placeholder="98765 43210"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              className="flex-1 text-sm text-textmain"
              style={{ color: colors.text }}
              autoFocus
            />
          </View>
          <Text className="text-muted text-[11px] mt-2" style={{ color: colors.textMuted }}>
            We'll send you a 6-digit code via SMS. Standard message rates may apply.
          </Text>

          <Pressable
            onPress={onSendOtp}
            disabled={!isValid || isLoading}
            style={({ pressed }) => [{
              marginTop: 20,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              backgroundColor: isValid && !isLoading ? colors.primary : colors.border,
              opacity: pressed ? 0.9 : 1,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text className="text-white font-semibold text-base mr-2">Send OTP</Text>
                <ChevronRight size={18} color="#fff" />
              </>
            )}
          </Pressable>

          {/* Autofill demo */}
          <Pressable
            onPress={onAutofill}
            style={{
              marginTop: 12,
              paddingVertical: 10,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
              borderStyle: 'dashed',
              borderRadius: 12,
            }}
          >
            <Text className="text-muted text-xs font-medium" style={{ color: colors.textMuted }}>
              Autofill demo number ({country.code} 98765 43210)
            </Text>
          </Pressable>

          {/* Privacy reassurance */}
          <View
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 16,
              backgroundColor: colors.primaryLight,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Lock size={14} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600', marginLeft: 6 }}>
                Your data is safe
              </Text>
            </View>
            <Text style={{ color: colors.primary, fontSize: 11, opacity: 0.8, marginTop: 4 }}>
              We never share your number with anyone. It's only used for order updates and OTP verification.
            </Text>
          </View>

          <View className="flex-row items-center justify-center mt-6 mb-8">
            <Text className="text-muted text-sm" style={{ color: colors.textMuted }}>Prefer email? </Text>
            <Link href="/login">
              <Text className="text-primary text-sm font-semibold" style={{ color: colors.primary }}>Sign in with email</Text>
            </Link>
          </View>

          {/* Trust badges */}
          <View className="flex-row justify-around mb-6">
            <View className="items-center">
              <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
                <Shield size={14} color={colors.primary} />
              </View>
              <Text className="text-[10px] text-muted mt-1 font-medium" style={{ color: colors.textMuted }}>Secure</Text>
            </View>
            <View className="items-center">
              <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
                <Lock size={14} color={colors.primary} />
              </View>
              <Text className="text-[10px] text-muted mt-1 font-medium" style={{ color: colors.textMuted }}>Encrypted</Text>
            </View>
            <View className="items-center">
              <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
                <Phone size={14} color={colors.primary} />
              </View>
              <Text className="text-[10px] text-muted mt-1 font-medium" style={{ color: colors.textMuted }}>24×7</Text>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
