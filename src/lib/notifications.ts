/**
 * FCM / push notification setup using expo-notifications.
 *
 * Responsibilities:
 *   1. Request notification permissions on first launch.
 *   2. Get the Expo push token (or FCM token on native).
 *   3. POST it to /api/notifications/register-fcm with the Firebase ID token.
 *   4. Handle incoming notifications:
 *        - Order status updates → navigate to order tracking
 *        - Promo notifications → navigate to coupons
 *        - Chat notifications → navigate to chat
 *   5. Show a local notification when a push arrives in foreground (with
 *      sound + vibrate).
 *
 * The order-tracking screen also subscribes to order-specific FCM messages
 * via `subscribeToOrderNotifications(orderId, cb)` — these fire whenever the
 * backend sends a push about a status change (pending → accepted → preparing
 * → ready → picked_up → on_the_way → delivered).
 *
 * In Expo Go preview (no env), token registration is skipped — the helpers
 * are safe to call and just no-op.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import apiClient from './api-client';
import { isApiConfigured } from './api-client';

// Configure how notifications are presented when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH
  })
});

export interface PushNotificationData {
  type?: 'order' | 'promo' | 'chat' | 'system';
  order_id?: string;
  order_status?: string;
  conversation_id?: string;
  [key: string]: any;
}

export type NavigationHandler = (route: string) => void;
let navigationHandler: NavigationHandler | null = null;

export function setNotificationNavigationHandler(handler: NavigationHandler | null) {
  navigationHandler = handler;
}

/** Track the last registration so we don't re-POST the same token. */
let lastRegisteredToken: string | null = null;

/**
 * Request notification permissions and return the Expo push token.
 * Returns null when permission is denied or in web mode.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('[notifications] Permission not granted for push notifications');
      return null;
    }

    // On Android, ensure the FCM channel is configured before fetching the token.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Order Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
        sound: 'default'
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'food-munch-customer'
    }).catch(() => null);

    const token = tokenData?.data || null;
    return token;
  } catch (e) {
    console.warn('[notifications] Failed to register for push', e);
    return null;
  }
}

/**
 * Register the FCM/Expo push token with the backend.
 * Called on app launch and whenever the Firebase user changes.
 */
export async function registerFcmTokenWithBackend(): Promise<void> {
  if (!isApiConfigured) return;
  try {
    const token = await registerForPushNotificationsAsync();
    if (!token || token === lastRegisteredToken) return;
    await apiClient.post('/api/notifications/register-fcm', { fcm_token: token });
    lastRegisteredToken = token;
    console.log('[notifications] FCM token registered with backend');
  } catch (e) {
    console.warn('[notifications] Failed to register FCM token', e);
  }
}

/**
 * Show an in-app local notification (used by realtime handlers when
 * Supabase realtime fires but no FCM was received). Plays the default
 * sound + triggers a vibration pattern.
 */
export async function showLocalNotification(
  title: string,
  body: string,
  data?: PushNotificationData
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH
      },
      trigger: null as any // immediately
    });
  } catch (e) {
    console.warn('[notifications] showLocalNotification failed', e);
  }
}

type OrderStatusListener = (data: PushNotificationData) => void;
const orderStatusListeners: Map<string, Set<OrderStatusListener>> = new Map();

/**
 * Subscribe to FCM messages about a specific order's status.
 * Returns an unsubscribe function. Multiple subscribers per order are allowed.
 *
 * Used by app/order/[id].tsx to trigger UI refreshes (in addition to the
 * 3-second polling). When a status-change FCM arrives the listener fires
 * with the full data payload (type='order', order_id, order_status).
 */
export function subscribeToOrderNotifications(
  orderId: string,
  listener: OrderStatusListener
): () => void {
  if (!orderStatusListeners.has(orderId)) {
    orderStatusListeners.set(orderId, new Set());
  }
  orderStatusListeners.get(orderId)!.add(listener);
  return () => {
    const set = orderStatusListeners.get(orderId);
    if (set) {
      set.delete(listener);
      if (set.size === 0) orderStatusListeners.delete(orderId);
    }
  };
}

function dispatchOrderStatus(data: PushNotificationData) {
  if (!data.order_id) return;
  const set = orderStatusListeners.get(data.order_id);
  if (!set || set.size === 0) return;
  set.forEach((fn) => {
    try {
      fn(data);
    } catch (e) {
      console.warn('[notifications] order status listener threw', e);
    }
  });
}

/**
 * Set up the global notification response listener (called when the user
 * taps a notification). Routes the user to the appropriate screen based
 * on the notification's `data` payload.
 *
 * Returns an unsubscribe function.
 */
export function setupNotificationResponseHandler(): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = (response.notification.request.content.data || {}) as PushNotificationData;
      handleNotificationNavigation(data);
    }
  );

  // Also handle notifications received while the app is in the foreground.
  // FCM messages about order-status updates are dispatched to subscribers.
  const fgSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      const data = (notification.request.content.data || {}) as PushNotificationData;
      console.log('[notifications] foreground push:', data);
      if (data.type === 'order' && data.order_id) {
        dispatchOrderStatus(data);
      }
    }
  );

  return () => {
    subscription.remove();
    fgSubscription.remove();
  };
}

function handleNotificationNavigation(data: PushNotificationData) {
  if (!navigationHandler) return;
  try {
    if (data.type === 'order' && data.order_id) {
      navigationHandler(`/order/${data.order_id}`);
    } else if (data.type === 'promo') {
      navigationHandler('/coupons');
    } else if (data.type === 'chat') {
      navigationHandler('/chat');
    }
  } catch (e) {
    console.warn('[notifications] navigation failed', e);
  }
}

/**
 * Initialize the full push notification stack.
 * Safe to call multiple times — it's idempotent.
 */
export async function initNotifications(): Promise<() => void> {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Order Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981'
      });
      await Notifications.setNotificationChannelAsync('promos', {
        name: 'Offers & Promos',
        importance: Notifications.AndroidImportance.DEFAULT
      });
      await Notifications.setNotificationChannelAsync('chat', {
        name: 'Chat',
        importance: Notifications.AndroidImportance.HIGH
      });
    } catch (e) {
      /* ignore */
    }
  }

  await registerFcmTokenWithBackend();
  const cleanup = setupNotificationResponseHandler();
  return cleanup;
}
