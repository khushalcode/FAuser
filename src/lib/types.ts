/**
 * Unified data model for the Food Munch Customer app.
 *
 * Food + Grocery are combined into ONE unified UI — there is no longer a
 * module_type toggle. Stores, products and categories share a single feed
 * so customers can browse meals and household essentials together.
 *
 * The `ModuleType` type and `module_type` field have been intentionally
 * removed. A few legacy fields are kept (is_veg, prep_time_minutes, brand,
 * barcode) since they remain useful for distinguishing prepared meals from
 * packaged grocery items inside the unified list.
 */
export type UserRole = 'admin' | 'customer' | 'vendor' | 'delivery';

export interface AppUser {
  id: string;
  firebase_uid: string;
  email: string;
  phone?: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  email?: string;
  vendor_id: string;
  is_active: boolean;
  is_open: boolean;
  rating: number;
  reviews_count: number;
  minimum_order: number;
  delivery_fee: number;
  delivery_time_minutes: number;
  /** Optional store-type tag (e.g. "Restaurant", "Grocery", "Cafe") for display only — not used for filtering. */
  store_type?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  icon_url?: string;
  position: number;
  is_active: boolean;
  stores_count: number;
  items_count: number;
  /** Optional category-group label (e.g. "food", "grocery") for display only — not used for filtering. */
  group?: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  images?: string[];
  price: number;
  discount_price?: number | null;
  unit: string; // kg, pcs, liter, pack, etc.
  stock: number;
  is_available: boolean;
  is_featured: boolean;
  rating: number;
  reviews_count: number;
  tags: string[];
  // Food-specific (kept for prepared meals)
  is_veg?: boolean;
  prep_time_minutes?: number;
  // Grocery-specific (kept for packaged items)
  brand?: string;
  barcode?: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  image_url?: string;
  unit: string;
  price: number;
  quantity: number;
  store_id: string;
  store_name: string;
}

export type OrderStatus =
  | 'pending'        // customer placed
  | 'accepted'       // vendor accepted
  | 'preparing'      // vendor preparing (food) / packing (grocery)
  | 'ready'          // ready for pickup
  | 'picked_up'      // delivery man picked up
  | 'on_the_way'     // out for delivery
  | 'delivered'
  | 'cancelled'
  | 'rejected';

export type PaymentMethod = 'cash' | 'card' | 'wallet' | 'online';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  product_id: string;
  name: string;
  image_url?: string;
  unit: string;
  price: number;
  quantity: number;
  store_id: string;
  store_name: string;
}

export interface Order {
  id: string;
  order_code: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  store_id: string;
  store_name: string;
  vendor_id: string;
  delivery_man_id?: string | null;
  delivery_man_name?: string;
  items: OrderItem[];
  item_count: number;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  delivery_address: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  note?: string;
  scheduled_at?: string | null;
  accepted_at?: string | null;
  picked_up_at?: string | null;
  delivered_at?: string | null;
  rating?: number;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order: number;
  maximum_discount?: number;
  usage_limit: number;
  used_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  cta_text?: string;
  image_url?: string;
  gradient?: [string, string];
  redirect_type: 'store' | 'category' | 'product' | 'url' | 'none';
  redirect_id?: string;
  redirect_url?: string;
  position: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: 'Home' | 'Work' | 'Other';
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

export interface WalletTransaction {
  id: string;
  customer_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference?: string;
  created_at: string;
}

/** Pincode-based delivery area for a store. */
export interface DeliveryArea {
  id: string;
  store_id: string;
  pincode: string;
  delivery_fee: number;
  estimated_minutes: number;
  is_active: boolean;
  /** Optional service radius (km) — for radius-based checks. */
  radius_km?: number;
}

export interface AppNotification {
  id: string;
  user_role: UserRole;
  user_id?: string | null;
  title: string;
  body: string;
  type: 'order' | 'promo' | 'system' | 'chat';
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface DeliveryMan {
  id: string;
  firebase_uid: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  vehicle_type: 'bike' | 'car' | 'cycle' | 'scooter';
  is_online: boolean;
  is_active: boolean;
  rating: number;
  total_deliveries: number;
  current_order_id?: string | null;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender: 'me' | 'them';
  text: string;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}
