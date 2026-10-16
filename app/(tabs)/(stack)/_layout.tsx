/**
 * (stack) — nested Stack that lives INSIDE the tab navigator.
 *
 * Every secondary screen (product, store, search, checkout, order tracking,
 * wallet, coupons, addresses, favourites, chat, notifications) is rendered here,
 * so the bottom tab bar stays visible on every screen while push/back
 * behaves like a normal stack. URLs are unchanged (route groups are not part
 * of the path), so all existing router.push('/wallet') etc. calls still work.
 */
import React from 'react';
import { Stack } from 'expo-router';
import { useThemeColors } from '@/store/theme';

export default function StackLayout() {
  const colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background }
      }}
    />
  );
}
