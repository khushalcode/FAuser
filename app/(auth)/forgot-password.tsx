import React from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  Easing
} from 'react-native';
import { Pressable } from '@/components/SafePressable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Mail, ChevronLeft, CheckCircle, Phone, Key } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { useAuthStore } from '@/store/auth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const reset = useAuthStore((s) => s.resetPassword);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web', easing: Easing.out(Easing.ease) }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  const onReset = async () => {
    if (!email) {
      Alert.alert('Enter email', 'Please enter your registered email address.');
      return;
    }
    try {
      await reset(email);
      setSent(true);
    } catch (e: any) {
      Alert.alert('Failed', e?.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Amber hero */}
        <View
          style={{
            backgroundColor: '#F59E0B',
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
          <View style={{ position: 'absolute', right: 60, top: 100, width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)' }} />

          <Animated.View style={{ alignItems: 'center', transform: [{ scale: scaleAnim }], opacity: fadeAnim }}>
            <View
              style={{
                width: 96, height: 96, borderRadius: 48,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              {sent ? <CheckCircle size={40} color="#fff" /> : <Key size={40} color="#fff" />}
            </View>
            <Text className="text-white text-2xl font-black text-center">
              {sent ? 'Check your email' : 'Forgot password?'}
            </Text>
            <Text className="text-white/90 text-sm mt-2 text-center px-4">
              {sent
                ? "We've sent a reset link to your registered email."
                : "No worries — we'll email you reset instructions."}
            </Text>
          </Animated.View>
        </View>

        <Animated.View style={{ opacity: fadeAnim }} className="px-6 pt-6 flex-1">
          {!sent ? (
            <>
              <Text className="text-textmain text-sm font-medium mb-1.5" style={{ color: colors.text }}>Email Address</Text>
              <View className="flex-row items-center bg-surface rounded-xl px-3.5 py-3 border border-line" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
                <Mail size={18} color={colors.textMuted} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 ml-2.5 text-sm text-textmain"
                  style={{ color: colors.text }}
                />
              </View>

              <Pressable
                onPress={onReset}
                disabled={isLoading || !email.includes('@')}
                style={({ pressed }) => [{
                  marginTop: 20,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  backgroundColor: '#F59E0B',
                  opacity: isLoading || !email.includes('@') ? 0.5 : pressed ? 0.9 : 1,
                  shadowColor: '#F59E0B',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-base">Send Reset Link</Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => router.push('/phone-login')}
                style={{
                  marginTop: 12,
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceElevated,
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Phone size={16} color={colors.text} />
                <Text className="text-textmain font-medium text-sm ml-2" style={{ color: colors.text }}>Reset via Phone OTP instead</Text>
              </Pressable>
            </>
          ) : (
            <>
              {/* Success state */}
              <View
                style={{
                  marginTop: 8,
                  padding: 20,
                  borderRadius: 16,
                  backgroundColor: colors.successLight,
                  alignItems: 'center',
                }}
              >
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={32} color="#fff" />
                </View>
                <Text style={{ marginTop: 12, fontSize: 14, fontWeight: '700', color: colors.success }}>
                  Email sent successfully 🎉
                </Text>
                <Text style={{ marginTop: 4, fontSize: 12, color: colors.success, opacity: 0.8, textAlign: 'center' }}>
                  We've sent a reset link to{'\n'}
                  <Text style={{ fontWeight: '700' }}>{email}</Text>
                </Text>
                <Text style={{ marginTop: 8, fontSize: 11, color: colors.success, opacity: 0.7, textAlign: 'center' }}>
                  Check your inbox and spam folder. The link is valid for 30 minutes.
                </Text>
              </View>

              <Pressable
                onPress={() => router.replace('/login')}
                style={({ pressed }) => [{
                  marginTop: 20,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.9 : 1,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }]}
              >
                <Text className="text-white font-semibold text-base">Back to Login</Text>
              </Pressable>
            </>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 16 }}>
            <Text className="text-muted text-sm" style={{ color: colors.textMuted }}>Remember your password? </Text>
            <Link href="/login">
              <Text className="text-primary text-sm font-semibold" style={{ color: colors.primary }}>Sign In</Text>
            </Link>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
