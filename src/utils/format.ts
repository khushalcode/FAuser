/**
 * Format helpers for the Food Munch Customer app.
 * Indian context: ₹ currency, rupee formatting, dates in DD MMM style.
 */
import type { OrderStatus } from '@/lib/types';

export const formatCurrency = (value: number, withSymbol = true): string => {
  const v = Number.isFinite(value) ? value : 0;
  const formatted = v.toLocaleString('en-IN', {
    maximumFractionDigits: 0
  });
  return withSymbol ? `₹${formatted}` : formatted;
};

export const formatNumber = (value: number): string => {
  return (value ?? 0).toLocaleString('en-IN');
};

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const formatDate = (iso: string, withTime = false): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const date = `${String(d.getDate()).padStart(2, '0')} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
  if (!withTime) return date;
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${date}, ${h}:${m} ${ampm}`;
};

export const formatTime = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

export const timeAgo = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 4) return `${wk}w ago`;
  return formatDate(iso);
};

export const formatDiscountPercent = (price: number, discountPrice?: number | null): number => {
  if (!price || price <= 0 || !discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

export const effectivePrice = (price: number, discountPrice?: number | null): number => {
  if (discountPrice && discountPrice > 0 && discountPrice < price) return discountPrice;
  return price;
};

export const initialCaps = (s: string): string => {
  if (!s) return '';
  return s
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

export const truncate = (s: string, n: number): string => {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
};

/**
 * Format a count in Indian style (lac / crore).
 * 820000 → "8.2 lac", 12000000 → "1.2 cr", 8200 → "8.2k", 820 → "820"
 */
export const formatIndianCount = (n: number): string => {
  if (!Number.isFinite(n) || n < 0) return '0';
  if (n >= 10000000) {
    const cr = n / 10000000;
    return `${cr >= 10 ? Math.round(cr) : cr.toFixed(1).replace(/\.0$/, '')} cr`;
  }
  if (n >= 100000) {
    const lac = n / 100000;
    return `${lac >= 10 ? Math.round(lac) : lac.toFixed(1).replace(/\.0$/, '')} lac`;
  }
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(n);
};

/** Short delivery-time string e.g. 8 -> "8 mins" */
export const formatDeliveryTime = (minutes?: number): string => {
  if (!minutes || minutes <= 0) return '8 mins';
  return `${minutes} mins`;
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  picked_up: 'Picked Up',
  on_the_way: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  rejected: 'Rejected'
};

export const orderStatusColor: Record<OrderStatus, string> = {
  pending: '#F59E0B',
  accepted: '#3B82F6',
  preparing: '#8B5CF6',
  ready: '#06B6D4',
  picked_up: '#F97316',
  on_the_way: '#F97316',
  delivered: '#12B76A',
  cancelled: '#F04438',
  rejected: '#F04438'
};

export const activeOrderStatuses: OrderStatus[] = [
  'pending', 'accepted', 'preparing', 'ready', 'picked_up', 'on_the_way'
];

export const pastOrderStatuses: OrderStatus[] = [
  'delivered', 'cancelled', 'rejected'
];
