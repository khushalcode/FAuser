import React from 'react';
import {
  View, Text, TextInput, Pressable, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert, TextStyle, Animated, Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Link } from 'expo-router';
import { ChevronLeft, ShieldCheck, RefreshCw, MessageCircle, Lock } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import { hapticNotify } from '@/utils/platform';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string; mockOtp?: string }>();
  const colors = useThemeColors();
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [code, setCode] = React.useState(['', '', '', '', '', '']);
  const [seconds, setSeconds] = React.useState(42);
  const inputs = React.useRef<Array<TextInput | null>>([]);
  const mockOtp = params.mockOtp || '';

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web', easing: Easing.out(Easing.ease) }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  React.useEffect(() => {
    if (mockOtp && mockOtp.length === 6) {
      setCode(mockOtp.split(''));
    }
  }, [mockOtp]);

  // Resend timer
  React.useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const fullCode = code.join('');

  const onChangeDigit = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    if (digit && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
    clearError();
    // Auto-verify when complete
    if (next.every((d) => d !== '') && next.join('').length === 6) {
      setTimeout(() => doVerify(next.join('')), 300);
    }
  };

  const onKeyPress = (idx: number, key: string) => {
    if (key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const doVerify = async (codeStr?: string) => {
    const otp = codeStr || fullCode;
    if (otp.length !== 6) {
      Alert.alert('Enter OTP', 'Please enter the 6-digit code sent to your phone.');
      return;
    }
    try {
      await verifyOtp(params.phone, otp);
      hapticNotify('success');
      router.replace('/(tabs)');
    } catch (e: any) {
      hapticNotify('error');
      Alert.alert('Verification failed', e?.message || 'Please try again.');
    }
  };

  const onResend = async () => {
    if (seconds > 0) return;
    const sendOtp = useAuthStore.getState().sendOtp;
    try {
      await sendOtp(params.phone);
      hapticNotify('success');
      setSeconds(42);
      Alert.alert('OTP resent', `A new code was sent to ${params.phone}.`);
    } catch (e: any) {
      Alert.alert('Resend failed', e?.message || 'Please try again.');
    }
  };

  const onAutofill = () => {
    if (mockOtp) {
      setCode(mockOtp.split(''));
    } else {
      setCode(['1', '2', '3', '4', '5', '6']);
    }
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
              <ShieldCheck size={40} color="#fff" />
            </View>
            <Text className="text-white text-2xl font-black text-center">Enter OTP</Text>
            <Text className="text-white/90 text-sm mt-2 text-center px-4">
              We've sent a 6-digit code to{'\n'}
              <Text className="font-bold">{params.phone || 'your phone'}</Text>
            </Text>
          </Animated.View>
        </View>

        <Animated.View style={{ opacity: fadeAnim }} className="px-6 pt-6 flex-1">
          {/* OTP inputs */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            {code.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(ref) => { inputs.current[idx] = ref; }}
                value={digit}
                onChangeText={(val) => onChangeDigit(idx, val)}
                onKeyPress={(e) => onKeyPress(idx, e.nativeEvent.key)}
                keyboardType="phone-pad"
                maxLength={1}
                selectTextOnFocus
                style={{
                  width: 48,
                  height: 56,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: digit ? colors.primary : colors.border,
                  backgroundColor: digit ? colors.primary50 : colors.surfaceElevated,
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: '700',
                  color: colors.text,
                } as TextStyle}
              />
            ))}
          </View>

          {mockOtp && (
            <Pressable
              onPress={onAutofill}
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 12,
                backgroundColor: colors.warningLight,
                borderWidth: 1,
                borderColor: colors.warning,
                borderStyle: 'dashed',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text className="text-xs" style={{ color: colors.warning, fontWeight: '600' }}>
                Tap to autofill demo OTP: <Text style={{ fontFamily: 'monospace', fontWeight: '800' }}>{mockOtp}</Text>
              </Text>
            </Pressable>
          )}

          {error && (
            <View className="mb-4 p-3 rounded-xl" style={{ backgroundColor: colors.errorLight }}>
              <Text className="text-sm" style={{ color: colors.error }}>{error}</Text>
            </View>
          )}

          <Pressable
            onPress={() => doVerify()}
            disabled={fullCode.length !== 6 || isLoading}
            style={({ pressed }) => [{
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              backgroundColor: fullCode.length === 6 && !isLoading ? colors.primary : colors.border,
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
              <Text className="text-white font-semibold text-base">Verify & Continue</Text>
            )}
          </Pressable>

          {/* Resend timer */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
            <Text className="text-muted text-sm" style={{ color: colors.textMuted }}>Didn't receive the code? </Text>
            <Pressable
              onPress={onResend}
              disabled={seconds > 0}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <RefreshCw size={11} color={seconds > 0 ? colors.textMuted : colors.primary} />
              <Text
                style={{
                  color: seconds > 0 ? colors.textMuted : colors.primary,
                  fontSize: 13,
                  fontWeight: '600',
                  marginLeft: 4,
                }}
              >
                {seconds > 0 ? `Resend in 0:${seconds.toString().padStart(2, '0')}` : 'Resend OTP'}
              </Text>
            </Pressable>
          </View>

          {/* Help */}
          <View style={{ marginTop: 24, padding: 16, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center' }}>
            <Lock size={14} color={colors.textMuted} />
            <Text className="text-muted text-xs mt-1 text-center" style={{ color: colors.textMuted }}>
              Having trouble?{' '}
              <Link href="/chat">
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Chat with support</Text>
              </Link>
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 16 }}>
            <Text className="text-muted text-sm" style={{ color: colors.textMuted }}>Want to use email instead? </Text>
            <Link href="/login">
              <Text className="text-primary text-sm font-semibold" style={{ color: colors.primary }}>Sign in</Text>
            </Link>
          </View>

          {/* Trust badges */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={14} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 4, fontWeight: '500' }}>Secure</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                <MessageCircle size={14} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 4, fontWeight: '500' }}>24×7 Help</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={14} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 4, fontWeight: '500' }}>Easy Refunds</Text>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
