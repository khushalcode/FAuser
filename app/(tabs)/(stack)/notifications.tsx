import React from 'react';
import {
  View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Tag, Package, MessageSquare, Settings, CheckCheck, Wifi } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { api } from '@/lib/api';
import { subscribeToNotifications, isSupabaseConfigured } from '@/lib/realtime';
import { useAuthStore } from '@/store/auth';
import { showLocalNotification } from '@/lib/notifications';
import type { AppNotification } from '@/lib/types';
import { timeAgo } from '@/utils/format';
import { hapticNotify } from '@/utils/platform';

export default function NotificationsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const colors = useThemeColors();
  const [items, setItems] = React.useState<AppNotification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [live, setLive] = React.useState(false);

  const load = React.useCallback(async () => {
    const n = await api.getNotifications();
    setItems(n);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
    // Subscribe to realtime new notifications
    if (isSupabaseConfigured && user?.id) {
      const unsub = subscribeToNotifications(user.id, (notification) => {
        setItems((prev) => [notification, ...prev]);
        setLive(true);
        hapticNotify('success');
        // Show a local push (works even without FCM)
        showLocalNotification(notification.title, notification.body, notification.data as any);
        setTimeout(() => setLive(false), 3000);
      });
      return () => unsub();
    }
  }, [load, user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const markAll = async () => {
    await api.markAllNotificationsRead();
    hapticNotify('success');
    await load();
  };

  const onTap = (n: AppNotification) => {
    if (!n.is_read) api.markNotificationRead(n.id, true);
    if (n.type === 'order' && n.data?.order_id) {
      router.push(`/order/${n.data.order_id as string}`);
    } else if (n.type === 'promo') {
      router.push('/coupons');
    } else if (n.type === 'chat') {
      router.push('/chat');
    }
  };

  const iconFor = (n: AppNotification) => {
    switch (n.type) {
      case 'order': return <Package size={16} color={colors.primary} />;
      case 'promo': return <Tag size={16} color={colors.warning} />;
      case 'chat': return <MessageSquare size={16} color={colors.info} />;
      default: return <Settings size={16} color={colors.textMuted} />;
    }
  };
  const bgFor = (n: AppNotification) => {
    switch (n.type) {
      case 'order': return colors.primaryLight;
      case 'promo': return colors.warningLight;
      case 'chat': return colors.infoLight;
      default: return colors.surfaceAlt;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View className="px-5 pt-2 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="w-10 h-10 rounded-2xl items-center justify-center bg-surface border border-lineLight mr-3" style={{ backgroundColor: colors.surface, borderColor: colors.borderLight }}>
            <ArrowLeft size={18} color={colors.text} />
          </Pressable>
          <View>
            <Text className="text-textmain text-[22px] font-extrabold tracking-tight" style={{ color: colors.text }}>Notifications</Text>
            {isSupabaseConfigured && (
              <View className="flex-row items-center mt-0.5">
                <Wifi size={9} color={live ? colors.success : colors.textSubtle} />
                <Text
                  className="text-[10px] font-semibold ml-1"
                  style={{ color: live ? colors.success : colors.textSubtle }}
                >
                  {live ? 'LIVE — syncing' : 'Realtime on'}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Pressable
          onPress={markAll}
          className="flex-row items-center px-3 py-1.5 rounded-md"
          style={{ backgroundColor: colors.primaryLight }}
        >
          <CheckCheck size={12} color={colors.primary} />
          <Text className="text-primary text-xs font-semibold ml-1" style={{ color: colors.primary }}>Mark all read</Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full items-center justify-center" style={{ backgroundColor: colors.surfaceAlt }}>
            <Bell size={36} color={colors.textMuted} />
          </View>
          <Text className="text-textmain font-bold text-sm mt-3" style={{ color: colors.text }}>No notifications</Text>
          <Text className="text-muted text-xs mt-1" style={{ color: colors.textMuted }}>You'll see order updates and offers here.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onTap(item)}
              className="bg-white rounded-xl2 border p-3.5 flex-row active:opacity-80"
              style={{
                backgroundColor: item.is_read ? colors.surfaceElevated : colors.primary50,
                borderColor: item.is_read ? colors.border : colors.primary + '60',
                borderWidth: item.is_read ? 1 : 1.5,
              }}
            >
              <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: bgFor(item) }}>
                {iconFor(item)}
              </View>
              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-textmain font-semibold text-sm flex-1" style={{ color: colors.text }} numberOfLines={1}>{item.title}</Text>
                  <Text className="text-muted text-[10px] ml-2" style={{ color: colors.textMuted }}>{timeAgo(item.created_at)}</Text>
                </View>
                <Text className="text-muted text-xs mt-0.5" style={{ color: colors.textMuted }} numberOfLines={3}>{item.body}</Text>
              </View>
              {!item.is_read && (
                <View className="w-2 h-2 rounded-full ml-2 mt-2" style={{ backgroundColor: colors.primary }} />
              )}
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
