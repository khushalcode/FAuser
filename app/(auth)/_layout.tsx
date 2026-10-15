import React from 'react';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/auth';
import { useUserStore } from '@/store/user';
import { useThemeColors } from '@/store/theme';

export default function AuthLayout() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loadProfile = useUserStore((s) => s.loadProfile);
  const colors = useThemeColors();
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    // In mock mode, we allow guest browsing — user is null but routes still work.
    // Real users go straight to tabs.
    if (user) {
      loadProfile();
      router.replace('/(tabs)');
    } else {
      setChecking(false);
    }
  }, [user]);

  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="phone-login" />
      <Stack.Screen name="verify-otp" />
    </Stack>
  );
}
