import '../global.css';
import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { colors } from '@/theme/colors';
import { initNotifications, setNotificationNavigationHandler, registerFcmTokenWithBackend } from '@/lib/notifications';
import { useAuthStore } from '@/store/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false
    }
  }
});

export default function RootLayout() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  // Set up notification navigation handler so tapping a push can route the app.
  React.useEffect(() => {
    setNotificationNavigationHandler((route) => {
      try {
        // Use any cast because typed-routes doesn't include dynamic paths cleanly.
        (router as any).push(route);
      } catch (e) {
        console.warn('[layout] notification navigation failed', e);
      }
    });
  }, [router]);

  // Initialize push notifications on app launch + re-register FCM when user changes.
  React.useEffect(() => {
    let cleanup: (() => void) | undefined;
    initNotifications().then((c) => { cleanup = c; }).catch(() => {});
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Re-register FCM token whenever the signed-in user changes
  React.useEffect(() => {
    if (user) {
      registerFcmTokenWithBackend().catch(() => {});
    }
  }, [user?.id]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background }
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
