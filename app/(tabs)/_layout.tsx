/**
 * (tabs) layout — expo-router Tabs with a custom BottomNav.
 *
 * 5 visible tabs: Home, Categories, Cart, Orders, Account.
 * Everything else lives in the hidden `(stack)` tab, which hosts a nested
 * Stack — so the bottom nav is present on EVERY screen of the app.
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { BottomNav } from '@/components/BottomNav';
import { useCartStore } from '@/store/cart';

export default function TabsLayout() {
  const cartCount = useCartStore((s) => s.itemCount());

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{ headerShown: false }}
      tabBar={() => <BottomNav cartCount={cartCount} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="categories" options={{ title: 'Categories' }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart' }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders' }} />
      <Tabs.Screen name="profile" options={{ title: 'Account' }} />
      {/* Hidden: nested stack for every secondary screen */}
      <Tabs.Screen name="(stack)" options={{ href: null }} />
    </Tabs>
  );
}
