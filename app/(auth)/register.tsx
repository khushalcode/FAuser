import React from 'react';
import {
  View, Text, TextInput, Pressable, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert, ScrollView, Animated, Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Mail, Lock, User, Phone, Eye, EyeOff, ShoppingBasket, Gift, ChevronLeft, Check } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import { hapticNotify } from '@/utils/platform';

export default function RegisterScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const signUp = useAuthStore((s) => s.signUpWithEmail);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [showPwd, setShowPwd] = React.useState(false);
  const [agree, setAgree] = React.useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web', easing: Easing.out(Easing.ease) }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: Platform.OS !== 'web', easing: Easing.out(Easing.ease) }),
    ]).start();
  }, []);

  const passwordStrength = React.useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
  }, [password]);

  const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength];
  const strengthColor = [colors.border, colors.error, colors.warning, colors.info, colors.success][passwordStrength];

  const onRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Missing fields', 'Please fill in name, email and password.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password mismatch', 'Password and confirm password do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (!agree) {
      Alert.alert('Terms', 'Please accept the Terms of Service to continue.');
      return;
    }
    try {
      await signUp(email, password, fullName);
      hapticNotify('success');
      router.replace('/(tabs)');
    } catch (e: any) {
      hapticNotify('error');
      Alert.alert('Sign up failed', e?.message || 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Hero header */}
          <Animated.View style={{ opacity: fadeAnim }}>
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
              {/* Back button */}
              <Pressable
                onPress={() => router.push('/login')}
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
              <View style={{ position: 'absolute', right: 50, top: 100, width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)' }} />

              <View className="items-center mb-3">
                <Animated.View
                  className="w-16 h-16 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <ShoppingBasket size={32} color="#fff" />
                </Animated.View>
              </View>
              <Text className="text-white text-2xl font-black text-center">Create your account 🎉</Text>
              <Text className="text-white/90 text-sm mt-2 text-center px-2">
                Join 2M+ Food Munch users and get ₹100 off on your first order.
              </Text>

              {/* Welcome bonus chip */}
              <View className="flex-row items-center justify-center mt-4">
                <View
                  style={{
                    backgroundColor: '#FBBF24',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Gift size={12} color="#78350F" />
                  <Text style={{ color: '#78350F', fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>
                    Welcome bonus: ₹100 wallet cashback
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Form */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="px-6 pt-6">
            {error && (
              <View className="mb-4 p-3 rounded-xl" style={{ backgroundColor: colors.errorLight }}>
                <Text className="text-sm" style={{ color: colors.error }}>{error}</Text>
              </View>
            )}

            <Field label="Full Name" icon={<User size={18} color={colors.textMuted} />} colors={colors}>
              <TextInput
                value={fullName}
                onChangeText={(t) => { setFullName(t); clearError(); }}
                placeholder="Aarav Sharma"
                placeholderTextColor={colors.textMuted}
                className="flex-1 ml-2.5 text-sm text-textmain"
                style={{ color: colors.text }}
              />
            </Field>

            <Field label="Email Address" icon={<Mail size={18} color={colors.textMuted} />} colors={colors}>
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
            </Field>

            <Field label="Phone Number" icon={<Phone size={18} color={colors.textMuted} />} colors={colors}>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 98000 00000"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                className="flex-1 ml-2.5 text-sm text-textmain"
                style={{ color: colors.text }}
              />
            </Field>

            <Field label="Password" icon={<Lock size={18} color={colors.textMuted} />} colors={colors}>
              <TextInput
                value={password}
                onChangeText={(t) => { setPassword(t); clearError(); }}
                placeholder="Create a strong password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPwd}
                className="flex-1 ml-2.5 text-sm text-textmain"
                style={{ color: colors.text }}
              />
              <Pressable onPress={() => setShowPwd(!showPwd)} hitSlop={8}>
                {showPwd ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
              </Pressable>
            </Field>

            {/* Password strength meter */}
            {password.length > 0 && (
              <View className="mb-4 -mt-2">
                <View className="flex-row mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      style={{
                        flex: 1,
                        height: 3,
                        marginRight: 4,
                        borderRadius: 2,
                        backgroundColor: passwordStrength >= i ? strengthColor : colors.borderLight,
                      }}
                    />
                  ))}
                </View>
                <Text className="text-[10px]" style={{ color: strengthColor }}>{strengthLabel}</Text>
              </View>
            )}

            <Field label="Confirm Password" icon={<Lock size={18} color={colors.textMuted} />} colors={colors}>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Re-enter password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPwd}
                className="flex-1 ml-2.5 text-sm text-textmain"
                style={{ color: colors.text }}
              />
              {confirm && confirm === password && (
                <View style={{ marginRight: 4 }}>
                  <Check size={16} color={colors.success} />
                </View>
              )}
            </Field>

            {/* T&C */}
            <Pressable
              onPress={() => setAgree(!agree)}
              style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 8, marginBottom: 16 }}
            >
              <View
                style={{
                  width: 20, height: 20, borderRadius: 6,
                  borderWidth: 2, borderColor: agree ? colors.primary : colors.border,
                  backgroundColor: agree ? colors.primary : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                  marginRight: 10, marginTop: 2,
                }}
              >
                {agree && <Check size={12} color="#fff" />}
              </View>
              <Text className="text-xs text-muted flex-1 leading-4" style={{ color: colors.textMuted }}>
                I agree to the{' '}
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Privacy Policy</Text>
              </Text>
            </Pressable>

            {/* Register button */}
            <Pressable
              onPress={onRegister}
              disabled={isLoading || !agree}
              style={({ pressed }) => [{
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                backgroundColor: colors.primary,
                opacity: isLoading || !agree ? 0.5 : pressed ? 0.9 : 1,
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
                <Text className="text-white font-semibold text-base">Create Account</Text>
              )}
            </Pressable>

            <View className="flex-row items-center justify-center mt-6 mb-8">
              <Text className="text-muted text-sm" style={{ color: colors.textMuted }}>Already have an account? </Text>
              <Link href="/login">
                <Text className="text-primary text-sm font-semibold" style={{ color: colors.primary }}>Sign In</Text>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, icon, colors, children }: { label: string; icon: React.ReactNode; colors: any; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="text-textmain text-sm font-medium mb-1.5" style={{ color: colors.text }}>{label}</Text>
      <View className="flex-row items-center bg-surface rounded-xl px-3.5 py-3 border border-line" style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}>
        {icon}
        {children}
      </View>
    </View>
  );
}
