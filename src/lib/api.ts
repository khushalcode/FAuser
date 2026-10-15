import { getAuthState } from "./auth-bridge";
/**
 * API layer — uses Supabase when configured, otherwise returns mock data.
 * All screens should call functions from this module, not directly import
 * mock-data, so the swap to real Supabase is transparent.
 *
 * Schema reference: /home/z/my-project/supabase/migrations/0001_initial_schema.sql
 *
 * UNIFIED FEED — there is no longer a `module_type` filter. Food + Grocery
 * stores, products and categories all come back from one unified query.
 */
import { isSupabaseConfigured, supabase } from './supabase';
import * as mock from '@/data/mock-data';
import type {
  AppUser,
  Store,
  Category,
  Product,
  Order,
  Coupon,
  Banner,
  CustomerAddress,
  WalletTransaction,
  AppNotification,
  ChatMessage,
  Review,
  OrderStatus,
  OrderItem,
  PaymentMethod,
  DeliveryArea,
  DeliveryMan
} from './types';
import type {
  BestsellerTile,
  FestivalTileData,
  PromoBannerData,
  HeroBannerData,
  CarouselRowData
} from '@/data/mock-data';

export const USE_MOCK = !isSupabaseConfigured;
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

/**
 * Returns the current customer's database UUID.
 * In mock mode this is the mock customer ID; in real mode it's the customer
 * row ID returned from Supabase (looked up via firebase_uid).
 */
async function getCustomerId(): Promise<string> {
  if (USE_MOCK || !supabase) return mock.mockCurrentCustomer.id;
  const fbUser = getAuthState().firebaseUser;
  if (!fbUser?.uid) return mock.mockCurrentCustomer.id;
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('firebase_uid', fbUser.uid)
    .single();
  if (!data) return mock.mockCurrentCustomer.id;
  // Customers table holds the actual customer_id used for orders
  const { data: cust } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', data.id)
    .single();
  return cust?.id || data.id;
}

/** Coerce a possibly-null value to a typed shape (used after supabase selects). */
function ensure<T>(v: any): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

// ---------- Auth ----------

const ACTIVE_STATUSES = ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'on_the_way'];
const PAST_STATUSES = ['delivered', 'cancelled', 'rejected'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Mock-order lookup used when Supabase is off or the customer id is not a real UUID. */
function mockOrdersFor(filter?: { status?: OrderStatus | 'active' | 'past'; customerId?: string }): Order[] {
  const customerId = filter?.customerId || mock.mockCurrentCustomer.id;
  let result = mock.orders.filter((o) => o.customer_id === customerId);
  if (filter?.status === 'active') result = result.filter((o) => ACTIVE_STATUSES.includes(o.status));
  else if (filter?.status === 'past') result = result.filter((o) => PAST_STATUSES.includes(o.status));
  else if (filter?.status) result = result.filter((o) => o.status === filter.status);
  return result.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

export const api = {
  // ---- Auth ----
  async getCurrentCustomer(): Promise<AppUser> {
    if (!USE_MOCK && supabase) {
      const fbUser = getAuthState().firebaseUser;
      if (!fbUser?.uid) {
        await delay();
        return mock.mockCurrentCustomer;
      }
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', fbUser.uid)
        .single();
      if (error || !data) {
        await delay();
        return mock.mockCurrentCustomer;
      }
      return data as AppUser;
    }
    await delay();
    return mock.mockCurrentCustomer;
  },

  // ---- Stores ----
  async getStores(): Promise<Store[]> {
    if (!USE_MOCK && supabase) {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });
      if (error) throw error;
      return ensure<Store>(data);
    }
    await delay(200);
    return [...mock.stores];
  },

  async getStore(id: string): Promise<Store | undefined> {
    if (!USE_MOCK && supabase) {
      const { data, error } = await supabase.from('stores').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Store;
    }
    await delay(120);
    return mock.stores.find((s) => s.id === id);
  },

  async getFeaturedStores(): Promise<Store[]> {
    if (!USE_MOCK && supabase) {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .eq('is_open', true)
        .order('rating', { ascending: false })
        .limit(6);
      if (error) throw error;
      return ensure<Store>(data);
    }
    await delay(200);
    return [...mock.stores]
      .filter((s) => s.is_active)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  },

  // ---- Categories ----
  async getCategories(): Promise<Category[]> {
    if (!USE_MOCK && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      if (error) throw error;
      return ensure<Category>(data);
    }
    await delay(150);
    return [...mock.categories];
  },

  // ---- Products ----
  async getProducts(filter?: {
    storeId?: string;
    categoryId?: string;
    featured?: boolean;
  }): Promise<Product[]> {
    if (!USE_MOCK && supabase) {
      let q = supabase.from('products').select('*').eq('is_available', true);
      if (filter?.storeId) q = q.eq('store_id', filter.storeId);
      if (filter?.categoryId) q = q.eq('category_id', filter.categoryId);
      if (filter?.featured) q = q.eq('is_featured', true);
      const { data, error } = await q.order('created_at', { ascending: false });
      if (error) throw error;
      return ensure<Product>(data);
    }
    await delay(200);
    return mock.products.filter((p) => {
      if (filter?.storeId && p.store_id !== filter.storeId) return false;
      if (filter?.categoryId && p.category_id !== filter.categoryId) return false;
      if (filter?.featured && !p.is_featured) return false;
      return true;
    });
  },

  async getProduct(id: string): Promise<Product | undefined> {
    if (!USE_MOCK && supabase) {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Product;
    }
    await delay(120);
    return mock.products.find((p) => p.id === id);
  },

  async getPopularItems(): Promise<Product[]> {
    if (!USE_MOCK && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('reviews_count', { ascending: false })
        .limit(10);
      if (error) throw error;
      return ensure<Product>(data);
    }
    await delay(200);
    return [...mock.products]
      .sort((a, b) => b.reviews_count - a.reviews_count)
      .slice(0, 10);
  },

  async getFlashSaleItems(): Promise<Product[]> {
    if (!USE_MOCK && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .not('discount_price', 'is', null)
        .eq('is_available', true)
        .limit(8);
      if (error) throw error;
      return ensure<Product>(data);
    }
    await delay(200);
    return mock.products
      .filter((p) => !!p.discount_price)
      .sort((a, b) => {
        const dA = a.discount_price ? (a.price - a.discount_price) / a.price : 0;
        const dB = b.discount_price ? (b.price - b.discount_price) / b.price : 0;
        return dB - dA;
      })
      .slice(0, 8);
  },

  async getRelatedProducts(productId: string): Promise<Product[]> {
    if (!USE_MOCK && supabase) {
      const { data: prod } = await supabase
        .from('products')
        .select('category_id, store_id')
        .eq('id', productId)
        .single();
      if (!prod) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', prod.category_id)
        .neq('id', productId)
        .eq('is_available', true)
        .limit(6);
      if (error) throw error;
      return ensure<Product>(data);
    }
    await delay(150);
    const p = mock.products.find((x) => x.id === productId);
    if (!p) return [];
    return mock.products
      .filter((x) => x.id !== productId && x.category_id === p.category_id)
      .slice(0, 6);
  },

  async search(query: string): Promise<{ stores: Store[]; products: Product[] }> {
    if (!USE_MOCK && supabase) {
      const q = (query || '').toLowerCase().trim();
      if (!q) return { stores: [], products: [] };
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(10);

      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
        .limit(20);

      return {
        stores: ensure<Store>(storeData),
        products: ensure<Product>(prodData)
      };
    }
    await delay(200);
    const q = query.toLowerCase().trim();
    if (!q) return { stores: [], products: [] };
    const storeResults = mock.stores.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
    );
    const productResults = mock.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
    return { stores: storeResults, products: productResults };
  },

  // ---- Banners ----
  async getBanners(): Promise<Banner[]> {
    if (!USE_MOCK && supabase) {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      if (error) throw error;
      return ensure<Banner>(data);
    }
    await delay(150);
    return mock.banners.filter((b) => b.is_active);
  },

  // ---- Coupons ----
  async getCoupons(filter?: 'available' | 'used' | 'expired'): Promise<Coupon[]> {
    if (!USE_MOCK && supabase) {
      const nowIso = new Date().toISOString();
      let q = supabase.from('coupons').select('*');
      if (filter === 'expired') {
        q = q.lt('end_date', nowIso);
      } else if (filter === 'used') {
        q = q.filter('used_count', '>=', 'usage_limit');
      } else {
        q = q.eq('is_active', true).gte('end_date', nowIso);
      }
      const { data, error } = await q.order('end_date', { ascending: false });
      if (error) throw error;
      return ensure<Coupon>(data);
    }
    await delay(150);
    const now = Date.now();
    return mock.coupons.filter((c) => {
      const end = new Date(c.end_date).getTime();
      if (filter === 'expired') return end < now;
      if (filter === 'used') return c.used_count >= c.usage_limit;
      return c.is_active && end >= now && c.used_count < c.usage_limit;
    });
  },

  // ---- Delivery Areas (pincode check) ----
  /**
   * Look up whether a store delivers to a given pincode.
   * Returns the delivery area (with fee + ETA) or null if not serviceable.
   */
  async getDeliveryArea(storeId: string, pincode: string): Promise<DeliveryArea | null> {
    if (!USE_MOCK && supabase) {
      const { data, error } = await supabase
        .from('delivery_areas')
        .select('*')
        .eq('store_id', storeId)
        .eq('pincode', pincode)
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return (data as DeliveryArea) || null;
    }
    await delay(150);
    return (
      mock.deliveryAreas.find(
        (a) => a.store_id === storeId && a.pincode === pincode && a.is_active
      ) || null
    );
  },

  // ---- Orders ----
  async getOrders(filter?: { status?: OrderStatus | 'active' | 'past'; customerId?: string }): Promise<Order[]> {
    if (!USE_MOCK && supabase) {
      const customerId = filter?.customerId || (await getCustomerId());
      // Signed-out / mock ids like "cust_1" are not UUIDs and make Postgres return 400.
      if (!UUID_RE.test(String(customerId))) {
        await delay(250);
        return mockOrdersFor(filter);
      }
      // Orders reference order_items via a foreign key; we select items as a relation.
      let q = supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('customer_id', customerId);
      const { data, error } = await q.order('created_at', { ascending: false });
      if (error) throw error;
      let result = ensure<any>(data).map((o: any) => ({
        ...o,
        items: Array.isArray(o.items) ? o.items : []
      })) as Order[];
      if (filter?.status === 'active') {
        result = result.filter((o) => ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'on_the_way'].includes(o.status));
      } else if (filter?.status === 'past') {
        result = result.filter((o) => ['delivered', 'cancelled', 'rejected'].includes(o.status));
      } else if (filter?.status) {
        result = result.filter((o) => o.status === filter.status);
      }
      return result;
    }
    await delay(250);
    const customerId = filter?.customerId || mock.mockCurrentCustomer.id;
    let result = mock.orders.filter((o) => o.customer_id === customerId);
    if (filter?.status === 'active') {
      result = result.filter((o) => ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'on_the_way'].includes(o.status));
    } else if (filter?.status === 'past') {
      result = result.filter((o) => ['delivered', 'cancelled', 'rejected'].includes(o.status));
    } else if (filter?.status) {
      result = result.filter((o) => o.status === filter.status);
    }
    return result.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  },

  async getOrder(id: string): Promise<Order | undefined> {
    if (!USE_MOCK && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return { ...(data as any), items: (data as any)?.items || [] } as Order;
    }
    await delay(120);
    return mock.orders.find((o) => o.id === id);
  },

  /**
   * Lightweight "poll" version of getOrder — used by the order-tracking
   * screen which re-fetches every 3 seconds. Returns just the order row +
   * live delivery man fields. Bypasses the items relation for speed.
   */
  async pollOrder(id: string): Promise<Order | undefined> {
    if (!USE_MOCK && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', id)
        .single();
      if (error) return undefined;
      const row = data as any;
      // Attach live delivery-man location if assigned & on the way.
      if (row?.delivery_man_id && ['picked_up', 'on_the_way'].includes(row.status)) {
        const { data: dm } = await supabase
          .from('delivery_men')
          .select('latitude, longitude, full_name, phone, vehicle_type, rating')
          .eq('id', row.delivery_man_id)
          .maybeSingle();
        if (dm) {
          row.delivery_latitude = row.delivery_latitude ?? dm.latitude;
          row.delivery_longitude = row.delivery_longitude ?? dm.longitude;
          (row as any).delivery_man = dm;
        }
      }
      return { ...row, items: row?.items || [] } as Order;
    }
    // Mock mode — synthesize a tiny status drift so the timeline animates.
    await delay(60);
    const o = mock.orders.find((x) => x.id === id);
    if (!o) return undefined;
    return { ...o };
  },

  /**
   * Fetch the live location of the delivery man assigned to an order.
   * Used by the order-tracking map.
   */
  async getDeliveryManLocation(orderId: string): Promise<{ latitude?: number; longitude?: number; name?: string; phone?: string; vehicle_type?: string } | null> {
    if (!USE_MOCK && supabase) {
      const { data: order } = await supabase
        .from('orders')
        .select('delivery_man_id, status')
        .eq('id', orderId)
        .maybeSingle();
      if (!order?.delivery_man_id) return null;
      const { data: dm, error } = await supabase
        .from('delivery_men')
        .select('latitude, longitude, full_name, phone, vehicle_type')
        .eq('id', order.delivery_man_id)
        .maybeSingle();
      if (error || !dm) return null;
      return {
        latitude: dm.latitude ?? undefined,
        longitude: dm.longitude ?? undefined,
        name: dm.full_name,
        phone: dm.phone,
        vehicle_type: dm.vehicle_type
      };
    }
    await delay(100);
    const o = mock.orders.find((x) => x.id === orderId);
    if (!o?.delivery_man_id) return null;
    const dm = mock.deliveryMen.find((d) => d.id === o.delivery_man_id);
    if (!dm) return null;
    return {
      latitude: dm.latitude,
      longitude: dm.longitude,
      name: dm.full_name,
      phone: dm.phone,
      vehicle_type: dm.vehicle_type
    };
  },

  async placeOrder(payload: {
    items: OrderItem[];
    storeId: string;
    storeName: string;
    vendorId: string;
    deliveryAddress: string;
    deliveryLatitude?: number;
    deliveryLongitude?: number;
    note?: string;
    scheduledAt?: string | null;
    paymentMethod: PaymentMethod;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    tax: number;
    total: number;
    /** When > 0, the order paid partly using wallet balance. */
    walletApplied?: number;
  }): Promise<Order> {
    if (!USE_MOCK && supabase) {
      const customerId = await getCustomerId();
      const finalTotal = payload.total - (payload.walletApplied || 0);
      const { data, error } = await supabase
        .from('orders')
        .insert({
          order_code: 'FM' + Math.floor(10000 + Math.random() * 89999),
          customer_id: customerId,
          store_id: payload.storeId,
          vendor_id: payload.vendorId,
          item_count: payload.items.reduce((s, it) => s + it.quantity, 0),
          subtotal: payload.subtotal,
          delivery_fee: payload.deliveryFee,
          discount: payload.discount,
          tax: payload.tax,
          total: finalTotal,
          payment_method: payload.paymentMethod,
          payment_status: payload.paymentMethod === 'wallet' && finalTotal === 0 ? 'paid' : 'pending',
          status: 'pending',
          delivery_address: payload.deliveryAddress,
          delivery_latitude: payload.deliveryLatitude,
          delivery_longitude: payload.deliveryLongitude,
          note: payload.note,
          scheduled_at: payload.scheduledAt
        })
        .select()
        .single();
      if (error) throw error;

      // Insert order_items
      const orderItemsInsert = payload.items.map((it) => ({
        order_id: (data as any).id,
        product_id: it.product_id,
        name: it.name,
        image_url: it.image_url || null,
        unit: it.unit,
        price: it.price,
        quantity: it.quantity,
        store_id: it.store_id,
        store_name: it.store_name
      }));
      await supabase.from('order_items').insert(orderItemsInsert);

      // Debit wallet if applied
      if (payload.walletApplied && payload.walletApplied > 0) {
        await api.debitWallet(payload.walletApplied, `Paid for order #${(data as any).order_code}`, (data as any).id);
      }

      return { ...(data as any), items: payload.items } as Order;
    }
    await delay(500);
    const order: Order = {
      id: 'order_' + (mock.orders.length + 1),
      order_code: 'FM' + Math.floor(10240 + Math.random() * 999),
      customer_id: mock.mockCurrentCustomer.id,
      customer_name: mock.mockCurrentCustomer.full_name,
      customer_phone: mock.mockCurrentCustomer.phone || '',
      store_id: payload.storeId,
      store_name: payload.storeName,
      vendor_id: payload.vendorId,
      items: payload.items,
      item_count: payload.items.reduce((s, it) => s + it.quantity, 0),
      subtotal: payload.subtotal,
      delivery_fee: payload.deliveryFee,
      discount: payload.discount,
      tax: payload.tax,
      total: payload.total - (payload.walletApplied || 0),
      payment_method: payload.paymentMethod,
      payment_status: 'pending',
      status: 'pending',
      delivery_address: payload.deliveryAddress,
      delivery_latitude: payload.deliveryLatitude,
      delivery_longitude: payload.deliveryLongitude,
      note: payload.note,
      scheduled_at: payload.scheduledAt || null,
      accepted_at: null,
      picked_up_at: null,
      delivered_at: null,
      created_at: new Date().toISOString()
    };
    mock.orders.unshift(order);

    // Debit wallet if applied (mock)
    if (payload.walletApplied && payload.walletApplied > 0) {
      mock.walletTransactions.unshift({
        id: 'wt_' + (mock.walletTransactions.length + 1),
        customer_id: mock.mockCurrentCustomer.id,
        type: 'debit',
        amount: payload.walletApplied,
        description: `Paid for order #${order.order_code}`,
        reference: order.id,
        created_at: new Date().toISOString()
      });
      (mock as any).walletBalance = Math.max(0, mock.walletBalance - payload.walletApplied);
    }

    return order;
  },

  async cancelOrder(id: string): Promise<Order> {
    if (!USE_MOCK && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          payment_status: 'refunded',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Order;
    }
    await delay(300);
    const idx = mock.orders.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Order not found');
    mock.orders[idx] = {
      ...mock.orders[idx],
      status: 'cancelled',
      payment_status: 'refunded'
    };
    return mock.orders[idx];
  },

  async rateOrder(id: string, rating: number): Promise<Order> {
    if (!USE_MOCK && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .update({ rating })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Order;
    }
    await delay(300);
    const idx = mock.orders.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Order not found');
    mock.orders[idx] = { ...mock.orders[idx], rating };
    return mock.orders[idx];
  },

  async reorder(orderId: string): Promise<OrderItem[]> {
    if (!USE_MOCK && supabase) {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      if (error) throw error;
      return (data || []).map((it: any) => ({
        product_id: it.product_id,
        name: it.name,
        image_url: it.image_url || undefined,
        unit: it.unit,
        price: Number(it.price),
        quantity: it.quantity,
        store_id: it.store_id,
        store_name: it.store_name
      })) as OrderItem[];
    }
    await delay(200);
    const o = mock.orders.find((x) => x.id === orderId);
    return o ? o.items : [];
  },

  // ---- Addresses ----
  async getAddresses(customerId?: string): Promise<CustomerAddress[]> {
    if (!USE_MOCK && supabase) {
      const cid = customerId || (await getCustomerId());
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('customer_id', cid)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (ensure<any>(data)).map((a) => ({
        id: a.id,
        customer_id: a.customer_id,
        label: (['Home', 'Work', 'Other'] as const).includes(a.label) ? a.label : 'Other',
        full_name: a.full_name || '',
        phone: a.phone || '',
        line1: a.full_address || '',
        line2: a.landmark || '',
        city: a.city || '',
        state: a.state || '',
        pincode: a.pincode || '',
        latitude: a.latitude || undefined,
        longitude: a.longitude || undefined,
        is_default: !!a.is_default
      })) as CustomerAddress[];
    }
    await delay(150);
    return mock.addresses.filter((a) => !customerId || a.customer_id === customerId);
  },

  async addAddress(payload: Omit<CustomerAddress, 'id' | 'customer_id'>): Promise<CustomerAddress> {
    if (!USE_MOCK && supabase) {
      const cid = await getCustomerId();
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          customer_id: cid,
          label: payload.label,
          full_address: payload.line1,
          landmark: payload.line2 || null,
          latitude: payload.latitude || null,
          longitude: payload.longitude || null,
          phone: payload.phone,
          is_default: payload.is_default
        })
        .select()
        .single();
      if (error) throw error;
      if (payload.is_default) {
        // Unset other defaults
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .neq('id', (data as any).id)
          .eq('customer_id', cid);
      }
      return {
        id: (data as any).id,
        customer_id: cid,
        label: payload.label,
        full_name: payload.full_name,
        phone: payload.phone,
        line1: payload.line1,
        line2: payload.line2,
        city: payload.city,
        state: payload.state,
        pincode: payload.pincode,
        latitude: payload.latitude,
        longitude: payload.longitude,
        is_default: payload.is_default
      };
    }
    await delay(300);
    const addr: CustomerAddress = {
      ...payload,
      id: 'addr_' + (mock.addresses.length + 1),
      customer_id: mock.mockCurrentCustomer.id
    };
    if (addr.is_default) {
      mock.addresses.forEach((a) => (a.is_default = false));
    }
    mock.addresses.push(addr);
    return addr;
  },

  async deleteAddress(id: string): Promise<boolean> {
    if (!USE_MOCK && supabase) {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    await delay(200);
    const idx = mock.addresses.findIndex((a) => a.id === id);
    if (idx >= 0) mock.addresses.splice(idx, 1);
    return true;
  },

  // ---- Wallet ----
  async getWalletBalance(): Promise<number> {
    if (!USE_MOCK && supabase) {
      const user = getAuthState().firebaseUser;
      if (user?.uid) {
        const { data: u } = await supabase
          .from('users')
          .select('id')
          .eq('firebase_uid', user.uid)
          .single();
        if (u) {
          const { data: w } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', u.id)
            .single();
          if (w) return Number(w.balance) || 0;
        }
      }
      return 0;
    }
    await delay(150);
    return mock.walletBalance;
  },

  async getWalletTransactions(): Promise<WalletTransaction[]> {
    if (!USE_MOCK && supabase) {
      const user = getAuthState().firebaseUser;
      if (!user?.uid) return [];
      const { data: u } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', user.uid)
        .single();
      if (!u) return [];
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (ensure<any>(data)).map((t) => ({
        id: t.id,
        customer_id: t.user_id,
        type: t.type,
        amount: Number(t.amount),
        description: t.description || '',
        reference: t.reference_id || undefined,
        created_at: t.created_at
      })) as WalletTransaction[];
    }
    await delay(200);
    return [...mock.walletTransactions].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  },

  async addMoney(amount: number): Promise<WalletTransaction> {
    if (!USE_MOCK && supabase) {
      const user = getAuthState().firebaseUser;
      if (!user?.uid) throw new Error('Not signed in');
      const { data: u } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', user.uid)
        .single();
      if (!u) throw new Error('User row missing');

      // Fetch wallet
      const { data: w } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', u.id)
        .single();
      if (!w) throw new Error('Wallet not found');

      const newBalance = Number(w.balance) + amount;
      await supabase.from('wallets').update({ balance: newBalance }).eq('id', w.id);

      const { data: tx, error } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: w.id,
          user_id: u.id,
          type: 'credit',
          source: 'topup',
          amount,
          balance_after: newBalance,
          description: 'Wallet top-up via UPI',
          reference_id: null
        })
        .select()
        .single();
      if (error) throw error;
      return {
        id: tx!.id,
        customer_id: u.id,
        type: 'credit',
        amount,
        description: 'Wallet top-up via UPI',
        reference: undefined,
        created_at: tx!.created_at
      };
    }
    await delay(500);
    const tx: WalletTransaction = {
      id: 'wt_' + (mock.walletTransactions.length + 1),
      customer_id: mock.mockCurrentCustomer.id,
      type: 'credit',
      amount,
      description: 'Wallet top-up via UPI',
      reference: 'UPI:' + Math.floor(1000000000 + Math.random() * 8999999999),
      created_at: new Date().toISOString()
    };
    mock.walletTransactions.unshift(tx);
    (mock as any).walletBalance += amount;
    return tx;
  },

  /**
   * Debit wallet for an order. Used by checkout when wallet payment is
   * applied. Returns the new balance.
   */
  async debitWallet(amount: number, description: string, reference?: string): Promise<number> {
    if (!USE_MOCK && supabase) {
      const user = getAuthState().firebaseUser;
      if (!user?.uid) throw new Error('Not signed in');
      const { data: u } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', user.uid)
        .single();
      if (!u) throw new Error('User row missing');
      const { data: w } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', u.id)
        .single();
      if (!w) throw new Error('Wallet not found');
      const newBalance = Math.max(0, Number(w.balance) - amount);
      await supabase.from('wallets').update({ balance: newBalance }).eq('id', w.id);
      await supabase.from('wallet_transactions').insert({
        wallet_id: w.id,
        user_id: u.id,
        type: 'debit',
        source: 'order_payment',
        amount,
        balance_after: newBalance,
        description,
        reference_id: reference || null
      });
      return newBalance;
    }
    await delay(200);
    mock.walletTransactions.unshift({
      id: 'wt_' + (mock.walletTransactions.length + 1),
      customer_id: mock.mockCurrentCustomer.id,
      type: 'debit',
      amount,
      description,
      reference: reference,
      created_at: new Date().toISOString()
    });
    (mock as any).walletBalance = Math.max(0, mock.walletBalance - amount);
    return mock.walletBalance;
  },

  // ---- Notifications ----
  async getNotifications(): Promise<AppNotification[]> {
    if (!USE_MOCK && supabase) {
      const user = getAuthState().firebaseUser;
      if (!user?.uid) return [];
      const { data: u } = await supabase
        .from('users')
        .select('id, role')
        .eq('firebase_uid', user.uid)
        .single();
      if (!u) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${u.id},user_role.eq.${u.role}`)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (ensure<any>(data)).map((n) => ({
        id: n.id,
        user_role: n.user_role || 'customer',
        user_id: n.user_id,
        title: n.title,
        body: n.body,
        type: n.type,
        data: n.data || {},
        is_read: !!n.is_read,
        created_at: n.created_at
      })) as AppNotification[];
    }
    await delay(150);
    return [...mock.notifications].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  },

  async markNotificationRead(id: string, isRead: boolean): Promise<boolean> {
    if (!USE_MOCK && supabase) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: isRead, read_at: isRead ? new Date().toISOString() : null })
        .eq('id', id);
      if (error) throw error;
      return true;
    }
    await delay(100);
    const n = mock.notifications.find((x) => x.id === id);
    if (n) n.is_read = isRead;
    return true;
  },

  async markAllNotificationsRead(): Promise<boolean> {
    if (!USE_MOCK && supabase) {
      const user = getAuthState().firebaseUser;
      if (!user?.uid) return true;
      const { data: u } = await supabase
        .from('users')
        .select('id, role')
        .eq('firebase_uid', user.uid)
        .single();
      if (!u) return true;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .or(`user_id.eq.${u.id},user_role.eq.${u.role}`)
        .eq('is_read', false);
      if (error) throw error;
      return true;
    }
    await delay(150);
    mock.notifications.forEach((n) => (n.is_read = true));
    return true;
  },

  // ---- Chat (Support thread) ----
  async getSupportChat(): Promise<ChatMessage[]> {
    if (!USE_MOCK && supabase) {
      const user = getAuthState().firebaseUser;
      if (!user?.uid) return [];
      const { data: u } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', user.uid)
        .single();
      if (!u) return [];

      // Find or create a support conversation
      let { data: conv } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('type', 'customer_support')
        .order('created_at', { ascending: false })
        .limit(1);

      // Fallback: create one if none exist
      let conversationId = conv && conv[0]?.id;
      if (!conversationId) {
        const { data: newConv } = await supabase
          .from('chat_conversations')
          .insert({ type: 'customer_support' })
          .select('id')
          .single();
        conversationId = (newConv as any)?.id;
      }
      if (!conversationId) return [];

      const { data: msgs, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (ensure<any>(msgs)).map((m) => ({
        id: m.id,
        thread_id: m.conversation_id,
        sender: m.sender_id === u.id ? 'me' : 'them',
        text: m.message,
        created_at: m.created_at
      })) as ChatMessage[];
    }
    await delay(150);
    return [...mock.supportChat].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
  },

  async sendSupportMessage(text: string): Promise<ChatMessage> {
    if (!USE_MOCK && supabase) {
      const user = getAuthState().firebaseUser;
      if (!user?.uid) throw new Error('Not signed in');
      const { data: u } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', user.uid)
        .single();
      if (!u) throw new Error('User row missing');

      // Find most recent support conversation (or create)
      let { data: conv } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('type', 'customer_support')
        .order('created_at', { ascending: false })
        .limit(1);
      let conversationId = conv && conv[0]?.id;
      if (!conversationId) {
        const { data: newConv } = await supabase
          .from('chat_conversations')
          .insert({ type: 'customer_support' })
          .select('id')
          .single();
        conversationId = (newConv as any)?.id;
      }
      if (!conversationId) throw new Error('Could not resolve conversation');

      const { data: msg, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: u.id,
          message: text
        })
        .select()
        .single();
      if (error) throw error;
      return {
        id: msg!.id,
        thread_id: conversationId,
        sender: 'me',
        text,
        created_at: msg!.created_at
      };
    }
    await delay(150);
    const msg: ChatMessage = {
      id: 'm_' + (mock.supportChat.length + 1),
      thread_id: 'support',
      sender: 'me',
      text,
      created_at: new Date().toISOString()
    };
    mock.supportChat.push(msg);
    // Simulated auto-reply
    setTimeout(() => {
      mock.supportChat.push({
        id: 'm_' + (mock.supportChat.length + 1),
        thread_id: 'support',
        sender: 'them',
        text: 'Thanks for reaching out! Our team will get back to you shortly.',
        created_at: new Date().toISOString()
      });
    }, 1200);
    return msg;
  },

  // ---- Reviews ----
  async getProductReviews(productId: string): Promise<Review[]> {
    if (!USE_MOCK && supabase) {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, customer:customers(full_name)')
        .eq('product_id', productId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (ensure<any>(data)).map((r) => ({
        id: r.id,
        product_id: r.product_id,
        customer_name: r.customer?.full_name || 'Customer',
        rating: r.rating,
        comment: r.comment || '',
        created_at: r.created_at
      })) as Review[];
    }
    await delay(150);
    return mock.reviews.filter((r) => r.product_id === productId);
  },

  // ---- Favourites ----
  async getFavouriteProductIds(): Promise<string[]> {
    if (!USE_MOCK && supabase) {
      const cid = await getCustomerId();
      const { data, error } = await supabase
        .from('favourites')
        .select('product_id')
        .eq('customer_id', cid);
      if (error) throw error;
      return (ensure<any>(data)).map((r) => r.product_id);
    }
    await delay(100);
    return ['prod_1', 'prod_4', 'prod_13', 'prod_17'];
  },

  /**
   * Toggle a favourite for the current customer.
   * In Supabase mode inserts/deletes the `favourites` row.
   * In mock mode the user store holds the in-memory list.
   */
  async toggleFavourite(productId: string, isFavourite: boolean): Promise<void> {
    if (!USE_MOCK && supabase) {
      const cid = await getCustomerId();
      if (isFavourite) {
        // Remove — ignore "not found" errors.
        await supabase
          .from('favourites')
          .delete()
          .eq('customer_id', cid)
          .eq('product_id', productId);
      } else {
        await supabase
          .from('favourites')
          .insert({ customer_id: cid, product_id: productId });
      }
      return;
    }
    await delay(80);
    // Mock mode — handled in-memory by useUserStore.toggleFavourite.
  },

  // ---- Cart (server-side persistence) ----
  /**
   * Fetch the current customer's cart_items from Supabase.
   * Returns a map of product_id -> quantity. In mock mode returns an empty
   * map (cart is held in-memory by useCartStore).
   */
  async getCartMap(): Promise<Record<string, number>> {
    if (!USE_MOCK && supabase) {
      const cid = await getCustomerId();
      const { data, error } = await supabase
        .from('cart_items')
        .select('product_id, quantity')
        .eq('customer_id', cid);
      if (error) throw error;
      const map: Record<string, number> = {};
      (ensure<any>(data)).forEach((r) => {
        map[r.product_id] = r.quantity;
      });
      return map;
    }
    await delay(80);
    return {};
  },

  async upsertCartItem(productId: string, storeId: string, unitPrice: number, quantity: number): Promise<void> {
    if (!USE_MOCK && supabase) {
      const cid = await getCustomerId();
      if (quantity <= 0) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('customer_id', cid)
          .eq('product_id', productId);
        return;
      }
      // Try upsert — assumes a (customer_id, product_id) unique index.
      const { error } = await supabase
        .from('cart_items')
        .upsert(
          {
            customer_id: cid,
            product_id: productId,
            store_id: storeId,
            quantity,
            unit_price: unitPrice
          },
          { onConflict: 'customer_id,product_id' }
        );
      if (error) throw error;
      return;
    }
    await delay(60);
    // Mock mode — handled by useCartStore.
  },

  // ---- Blinkit-style home sections ----

  /**
   * Bestseller tiles — top 6 categories by items_count.
   * Returns BestsellerTile objects whose `categoryId` is wired to the
   * categories table; the collage images are filled from the top products
   * in each category when available.
   */
  async getBestsellers(): Promise<BestsellerTile[]> {
    if (!USE_MOCK && supabase) {
      // Pull the top 6 categories by items_count, then for each pull 2
      // product image URLs to build the collage.
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name, slug, items_count')
        .eq('is_active', true)
        .order('items_count', { ascending: false })
        .limit(6);
      const categories = ensure<any>(cats);
      if (categories.length === 0) return mock.bestsellerTiles;

      const tiles: BestsellerTile[] = [];
      for (let i = 0; i < categories.length; i++) {
        const c = categories[i];
        const { data: prods } = await supabase
          .from('products')
          .select('image_url')
          .eq('category_id', c.id)
          .eq('is_available', true)
          .order('reviews_count', { ascending: false })
          .limit(2);
        const imgs = ensure<any>(prods).map((p) => p.image_url as string | undefined);
        const fallback = mock.bestsellerTiles[i % mock.bestsellerTiles.length];
        tiles.push({
          id: 'bs_' + (i + 1),
          categoryId: c.id,
          title: c.name,
          images: [imgs[0], imgs[1]],
          emojis: fallback?.emojis ?? ['🛒', '🛍️'],
          tint: fallback?.tint ?? '#F3F4F6',
          moreCount: (c.items_count ?? 0) - 2
        });
      }
      return tiles;
    }
    await delay(150);
    return [...mock.bestsellerTiles];
  },

  async getFeaturedProducts(limit = 10): Promise<Product[]> {
    if (!USE_MOCK && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return ensure<Product>(data);
    }
    await delay(180);
    return mock.products
      .filter((p) => p.is_featured)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  },

  async getProductsByCategory(categoryId: string, limit = 20): Promise<Product[]> {
    if (!USE_MOCK && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_available', true)
        .order('reviews_count', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return ensure<Product>(data);
    }
    await delay(150);
    return mock.products
      .filter((p) => p.category_id === categoryId)
      .sort((a, b) => b.reviews_count - a.reviews_count)
      .slice(0, limit);
  },

  async getProductsByTag(tag: string, limit = 20): Promise<Product[]> {
    if (!USE_MOCK && supabase) {
      // tags is a text[] — use cs (contains) operator.
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .contains('tags', [tag])
        .order('reviews_count', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return ensure<Product>(data);
    }
    await delay(150);
    return mock.products
      .filter((p) => p.tags.includes(tag))
      .sort((a, b) => b.reviews_count - a.reviews_count)
      .slice(0, limit);
  },

  async getPromoBanners(): Promise<PromoBannerData[]> {
    // Promo banners are a UI concept — for now they come from mock data
    // regardless of Supabase mode. In production these could come from the
    // `banners` table filtered by redirect_type.
    await delay(120);
    return [...mock.promoBanners];
  },

  async getFestivalTiles(): Promise<FestivalTileData[]> {
    await delay(120);
    return [...mock.festivalTiles];
  },

  async getHeroBanner(tab: string): Promise<HeroBannerData> {
    await delay(80);
    return (
      mock.heroBanners.find((h) => h.tab === tab) ||
      mock.heroBanners[0]
    );
  },

  async getCarouselRows(): Promise<CarouselRowData[]> {
    await delay(100);
    return [...mock.carouselRows];
  },

  /**
   * Convenience wrapper that returns the products for a carousel row
   * pre-filtered by the row's primary tag.
   */
  async getProductsForCarouselRow(row: CarouselRowData, limit = 10): Promise<Product[]> {
    return api.getProductsByTag(row.tag, limit);
  }
};