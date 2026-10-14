/**
 * Supabase Realtime subscription helpers + 3-second polling fallback.
 *
 * Each helper returns an unsubscribe function. When Supabase is not
 * configured (mock mode) the helpers return a no-op unsubscribe so the
 * UI can call them unconditionally.
 *
 * ORDER TRACKING: The order-detail screen uses BOTH realtime AND a 3-second
 * polling loop (`startOrderPolling`). Realtime fires instantly when the
 * backend updates a row; polling is the safety net (and is what powers the
 * mock-mode "live" feel).
 *
 * Used by:
 *   - app/order/[id].tsx      → subscribeToOrder + startOrderPolling
 *   - app/notifications.tsx   → subscribeToNotifications
 *   - app/chat.tsx            → subscribeToChatMessages
 *   - app/(tabs)/cart.tsx     → subscribeToCart
 */
import { supabase, isSupabaseConfigured } from './supabase';
import { useAuthStore } from '@/store/auth';
import type { AppNotification, Order, ChatMessage } from './types';

export type Unsubscribe = () => void;
const noop: Unsubscribe = () => {};

/** Resolve the current user's database UUID (cached lookup). */
async function resolveUserId(): Promise<string | null> {
  if (!supabase) return null;
  const fbUser = useAuthStore.getState().firebaseUser;
  if (!fbUser?.uid) return null;
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('firebase_uid', fbUser.uid)
    .single();
  return data?.id || null;
}

async function resolveCustomerId(): Promise<string | null> {
  if (!supabase) return null;
  const userId = await resolveUserId();
  if (!userId) return null;
  const { data } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id || null;
}

/**
 * Subscribe to live updates of a single order's status (and other fields).
 * The callback fires with the updated order row on every postgres changes
 * event for that order.
 */
export function subscribeToOrder(
  orderId: string,
  callback: (order: Order) => void
): Unsubscribe {
  if (!isSupabaseConfigured || !supabase) return noop;

  const channel = supabase
    .channel(`order:${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      },
      (payload: any) => {
        if (payload?.new) {
          callback(payload.new as Order);
        }
      }
    )
    .subscribe();

  return () => {
    try {
      supabase?.removeChannel(channel);
    } catch (e) {
      /* ignore */
    }
  };
}

/**
 * Subscribe to live delivery-man location updates (for the order-tracking
 * map). Fires with the updated delivery_men row.
 */
export function subscribeToDeliveryManLocation(
  deliveryManId: string | null | undefined,
  callback: (loc: { latitude?: number; longitude?: number }) => void
): Unsubscribe {
  if (!isSupabaseConfigured || !supabase || !deliveryManId) return noop;

  const channel = supabase
    .channel(`dm-loc:${deliveryManId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'delivery_men',
        filter: `id=eq.${deliveryManId}`
      },
      (payload: any) => {
        if (payload?.new) {
          callback({
            latitude: payload.new.latitude ?? undefined,
            longitude: payload.new.longitude ?? undefined
          });
        }
      }
    )
    .subscribe();

  return () => {
    try {
      supabase?.removeChannel(channel);
    } catch (e) {
      /* ignore */
    }
  };
}

/**
 * Start a 3-second polling loop that re-fetches an order. This is the
 * REAL-TIME TRACKING mechanism required by the spec — every 3 seconds the
 * order row (and the live delivery-man location when on_the_way) is
 * re-fetched and passed to `callback`.
 *
 * Returns an unsubscribe / stop function.
 */
export function startOrderPolling(
  orderId: string,
  callback: (order: Order | undefined) => void,
  intervalMs = 3000
): Unsubscribe {
  let cancelled = false;
  // Lazy import to avoid circular dependency with api.ts
  let api: typeof import('./api').api | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    api = require('./api').api;
  } catch (e) {
    console.warn('[realtime] could not load api module for polling', e);
  }

  const tick = async () => {
    if (cancelled || !api) return;
    try {
      const o = await api.pollOrder(orderId);
      if (!cancelled) callback(o);
    } catch (e) {
      console.warn('[realtime] pollOrder failed', e);
    }
  };

  // Fire immediately + every intervalMs.
  tick();
  const handle = setInterval(tick, intervalMs);

  return () => {
    cancelled = true;
    clearInterval(handle);
  };
}

/**
 * Subscribe to new notifications for the current user.
 * The callback receives the new notification row.
 */
export function subscribeToNotifications(
  userId: string | null,
  callback: (notification: AppNotification) => void
): Unsubscribe {
  if (!isSupabaseConfigured || !supabase || !userId) return noop;

  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload: any) => {
        if (payload?.new) {
          callback(payload.new as AppNotification);
        }
      }
    )
    .subscribe();

  return () => {
    try {
      supabase?.removeChannel(channel);
    } catch (e) {
      /* ignore */
    }
  };
}

/**
 * Subscribe to live chat messages in a conversation.
 * `conversationId` can be a chat_conversations.id, or 'support' which
 * resolves to the most recent customer_support conversation.
 */
export function subscribeToChatMessages(
  conversationId: string,
  callback: (message: ChatMessage) => void
): Unsubscribe {
  if (!isSupabaseConfigured || !supabase) return noop;

  // For 'support' we resolve dynamically; for direct IDs we subscribe immediately.
  let channel: any = null;
  let cancelled = false;

  const setup = async (convId: string) => {
    if (cancelled || !supabase) return;
    channel = supabase
      .channel(`chat:${convId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${convId}`
        },
        async (payload: any) => {
          if (!payload?.new) return;
          // Determine sender direction
          const userId = await resolveUserId();
          callback({
            id: payload.new.id,
            thread_id: payload.new.conversation_id,
            sender: payload.new.sender_id === userId ? 'me' : 'them',
            text: payload.new.message,
            created_at: payload.new.created_at
          });
        }
      )
      .subscribe();
  };

  if (conversationId === 'support') {
    // Find the most recent support conversation
    supabase
      .from('chat_conversations')
      .select('id')
      .eq('type', 'customer_support')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }: any) => {
        if (data && data[0]?.id) setup(data[0].id);
      });
  } else {
    setup(conversationId);
  }

  return () => {
    cancelled = true;
    if (channel) {
      try {
        supabase?.removeChannel(channel);
      } catch (e) {
        /* ignore */
      }
    }
  };
}

/**
 * Subscribe to cart item changes for the current customer (sync across devices).
 * Calls back with INSERT / UPDATE / DELETE events as a unified action.
 */
export function subscribeToCart(
  customerId: string | null,
  callback: (event: { type: 'INSERT' | 'UPDATE' | 'DELETE'; row: any }) => void
): Unsubscribe {
  if (!isSupabaseConfigured || !supabase || !customerId) return noop;

  const channel = supabase
    .channel(`cart:${customerId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cart_items',
        filter: `customer_id=eq.${customerId}`
      },
      (payload: any) => {
        if (!payload) return;
        callback({
          type: payload.eventType,
          row: payload.new || payload.old
        });
      }
    )
    .subscribe();

  return () => {
    try {
      supabase?.removeChannel(channel);
    } catch (e) {
      /* ignore */
    }
  };
}

/** Subscribe to all order changes for a customer (used by Orders list). */
export function subscribeToCustomerOrders(
  customerId: string | null,
  callback: (order: Order) => void
): Unsubscribe {
  if (!isSupabaseConfigured || !supabase || !customerId) return noop;

  const channel = supabase
    .channel(`customer-orders:${customerId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `customer_id=eq.${customerId}`
      },
      (payload: any) => {
        if (payload?.new) callback(payload.new as Order);
      }
    )
    .subscribe();

  return () => {
    try {
      supabase?.removeChannel(channel);
    } catch (e) {
      /* ignore */
    }
  };
}

/**
 * Check if realtime is connected (for showing a "Live" indicator).
 * Returns true when Supabase is configured AND at least one channel is open.
 * For UI usage, prefer useRealtimeStatus() below.
 */
export function isRealtimeConnected(): boolean {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const channels = (supabase as any).realtime?._channels || {};
    return Object.keys(channels).length > 0;
  } catch {
    return false;
  }
}

export { isSupabaseConfigured, resolveCustomerId, resolveUserId };
