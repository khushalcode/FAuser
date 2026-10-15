import React from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
  Easing
} from 'react-native';
import { Pressable } from '@/components/SafePressable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ShoppingBasket, Phone, Wifi, ArrowRight, Shield, Zap, Star } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import { hapticNotify } from '@/utils/platform';
import { firebaseMode, isFirebaseConfigured } from '@/lib/firebase';
import { isApiConfigured } from '@/lib/api-client';

export default function LoginScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const signIn = useAuthStore((s) => s.signInWithEmail);
  const googleSignIn = useAuthStore((s) => s.signInWithGoogle);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = React.useState('aarav.sharma@gmail.com');
  const [password, setPassword] = React.useState('password123');
  const [showPwd, setShowPwd] = React.useState(false);

  const isLiveMode = isFirebaseConfigured && firebaseMode === 'live';

  // Entrance animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  const heroScale = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web', easing: Easing.out(Easing.ease)
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 600, useNativeDriver: Platform.OS !== 'web', easing: Easing.out(Easing.ease)
      }),
      Animated.spring(heroScale, {
        toValue: 1, friction: 6, tension: 80, useNativeDriver: Platform.OS !== 'web'
      })
    ]).start();
  }, []);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter both email and password.');
      return;
    }
    try {
      await signIn(email, password);
      hapticNotify('success');
      router.replace('/(tabs)');
    } catch (e: any) {
      hapticNotify('error');
      Alert.alert('Sign in failed', e?.message || 'Please check your credentials.');
    }
  };

  const onGoogle = async () => {
    try {
      await googleSignIn();
      hapticNotify('success');
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Google sign in failed', e?.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Gradient hero header */}
          <Animated.View
            style={{
              transform: [{ scale: heroScale }],
              opacity: fadeAnim,
            }}
          >
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
              {/* Decorative circles */}
              <View style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <View style={{ position: 'absolute', right: 30, top: 100, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <View style={{ position: 'absolute', left: -30, top: 130, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.06)' }} />

              {/* Logo + Live badge */}
              <View className="flex-row items-center justify-between mb-4">
                <Animated.View
                  className="w-16 h-16 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <ShoppingBasket size={32} color="#fff" />
                </Animated.View>
                {isLiveMode && (
                  <View className="flex-row items-center px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <Wifi size={11} color="#fff" />
                    <Text className="text-white text-[10px] font-bold ml-1 tracking-wide">LIVE</Text>
                  </View>
                )}
              </View>

              <Text className="text-white text-3xl font-black tracking-tight">Food Munch</Text>
              <Text className="text-white/90 text-sm mt-2 leading-5">
                Food + grocery, delivered fresh to your door — in 15 minutes.
              </Text>

              {/* Express delivery stats card */}
              <View
                className="mt-5 flex-row items-center rounded-2xl px-4 py-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <Zap size={20} color="#fff" fill="#fff" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-white text-xs font-bold leading-tight">Express delivery</Text>
                  <Text className="text-white/80 text-[10px] mt-0.5">Get your order in 15-30 mins</Text>
                </View>
                <View className="flex-row">
                  <View className="items-center mr-3">
                    <Text className="text-white text-xs font-bold">500+</Text>
                    <Text className="text-white/70 text-[9px]">cities</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-white text-xs font-bold">2M+</Text>
                    <Text className="text-white/70 text-[9px]">users</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            className="px-6 pt-6 flex-1"
          >
            <Text className="text-textmain text-[22px] font-extrabold tracking-tight" style={{ color: colors.text }}>Welcome back 👋</Text>
            <Text className="text-muted text-sm mt-1" style={{ color: colors.textMuted }}>Sign in to continue ordering your favourites.</Text>

            {/* Demo banner */}
            {!isLiveMode && (
              <View className="mt-3 p-3 rounded-xl flex-row items-center" style={{ backgroundColor: colors.warningLight }}>
                <Zap size={14} color={colors.warning} />
                <Text className="text-xs ml-2 flex-1" style={{ color: colors.warning }}>
                  {isApiConfigured ? 'Preview mode — some features use mock data.' : 'Demo mode — Firebase/Supabase not configured. Any email + password works.'}
                </Text>
              </View>
            )}

            {error && (
              <View className="mt-4 p-3 rounded-xl" style={{ backgroundColor: colors.errorLight }}>
                <Text className="text-sm" style={{ color: colors.error }}>{error}</Text>
              </View>
            )}

            {/* Email */}
            <View className="mt-5">
              <Text className="text-textmain text-sm font-medium mb-1.5" style={{ color: colors.text }}>Email Address</Text>
              <View className="flex-row items-center bg-surface rounded-xl px-3.5 py-3 border border-line" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
                <Mail size={18} color={colors.textMuted} />
                <TextInput
                  value={email}
                  onChangeText={(t) => { setEmail(t); clearError(); }}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 ml-2.5 text-sm text-textmain"
                  style={{ color: colors.text }}
                />
              </View>
            </View>

            {/* Password */}
            <View className="mt-4">
              <Text className="text-textmain text-sm font-medium mb-1.5" style={{ color: colors.text }}>Password</Text>
              <View className="flex-row items-center bg-surface rounded-xl px-3.5 py-3 border border-line" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
                <Lock size={18} color={colors.textMuted} />
                <TextInput
                  value={password}
                  onChangeText={(t) => { setPassword(t); clearError(); }}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPwd}
                  className="flex-1 ml-2.5 text-sm text-textmain"
                  style={{ color: colors.text }}
                />
                <Pressable onPress={() => setShowPwd(!showPwd)} hitSlop={8}>
                  {showPwd ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
                </Pressable>
              </View>
            </View>

            {/* Forgot password */}
            <View className="flex-row justify-end mt-2">
              <Link href="/forgot-password">
                <Text className="text-primary text-sm font-semibold" style={{ color: colors.primary }}>Forgot password?</Text>
              </Link>
            </View>

            {/* Sign In button */}
            <Pressable
              onPress={onLogin}
              disabled={isLoading}
              style={({ pressed }) => [
                {
                  marginTop: 20,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  backgroundColor: colors.primary,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  opacity: isLoading ? 0.6 : pressed ? 0.9 : 1,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-white font-semibold text-base mr-2">Sign In</Text>
                  <ArrowRight size={18} color="#fff" />
                </>
              )}
            </Pressable>

            {/* Divider */}
            <View className="flex-row items-center my-5">
              <View className="flex-1 h-px bg-line" style={{ backgroundColor: colors.borderLight }} />
              <Text className="mx-3 text-muted text-xs font-medium" style={{ color: colors.textMuted }}>OR</Text>
              <View className="flex-1 h-px bg-line" style={{ backgroundColor: colors.borderLight }} />
            </View>

            {/* Login with OTP */}
            <Pressable
              onPress={() => router.push('/phone-login')}
              disabled={isLoading}
              style={({ pressed }) => [{
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.primary,
                backgroundColor: colors.primary50,
                marginBottom: 12,
                opacity: pressed ? 0.8 : 1,
              }]}
            >
              <Phone size={16} color={colors.primary} />
              <Text className="text-primary font-semibold text-sm ml-2" style={{ color: colors.primary }}>Login with Phone OTP</Text>
            </Pressable>

            {/* Google */}
            <Pressable
              onPress={onGoogle}
              disabled={isLoading}
              style={({ pressed }) => [{
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surfaceElevated,
                opacity: pressed ? 0.8 : 1,
              }]}
            >
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#4285F4' }}>G</Text>
              </View>
              <Text className="text-textmain font-medium text-sm" style={{ color: colors.text }}>Sign in with Google</Text>
            </Pressable>

            {/* Register */}
            <View className="flex-row items-center justify-center mt-6">
              <Text className="text-muted text-sm" style={{ color: colors.textMuted }}>Don't have an account? </Text>
              <Link href="/register">
                <Text className="text-primary text-sm font-semibold" style={{ color: colors.primary }}>Register</Text>
              </Link>
            </View>

            {/* Continue as guest */}
            <Pressable onPress={() => router.replace('/(tabs)')} className="items-center mt-3 mb-2">
              <Text className="text-muted text-xs underline" style={{ color: colors.textMuted }}>Continue as guest (browse only)</Text>
            </Pressable>

            {/* Trust badges */}
            <View className="flex-row justify-around mt-6 mb-6 px-4 pt-5 border-t border-lineLight" style={{ borderTopColor: colors.borderLight }}>
              <View className="items-center">
                <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
                  <Shield size={14} color={colors.primary} />
                </View>
                <Text className="text-[10px] text-muted mt-1 font-medium" style={{ color: colors.textMuted }}>Secure</Text>
              </View>
              <View className="items-center">
                <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: colors.warningLight }}>
                  <Zap size={14} color={colors.warning} />
                </View>
                <Text className="text-[10px] text-muted mt-1 font-medium" style={{ color: colors.textMuted }}>Fast</Text>
              </View>
              <View className="items-center">
                <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: colors.infoLight }}>
                  <Star size={14} color={colors.info} />
                </View>
                <Text className="text-[10px] text-muted mt-1 font-medium" style={{ color: colors.textMuted }}>Verified</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
