/**
 * Cart store (Zustand).
 * Holds the in-memory cart and exposes actions for add/remove/update qty.
 * Persisted to AsyncStorage so the cart survives app reloads.
 *
 * Rules:
 * - Cart items from the same store can be combined. Adding an item from a
 *   different store will prompt the user to clear the cart (handled in UI).
 * - Each cart item stores its effective price (discount applied).
 *
 * UNIFIED: there is no module_type in the cart any more.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem, Product, Coupon, Store } from '@/lib/types';
import { effectivePrice } from '@/utils/format';

interface CartState {
  items: CartItem[];
  storeId: string | null;
  storeName: string | null;
  appliedCoupon: Coupon | null;
  /** How much of the wallet balance should be applied at checkout. */
  walletApplied: number;
  isLoading: boolean;

  addItem: (product: Product, store: Store, quantity?: number) => { added: boolean; reason?: string };
  addItemsFromDifferentStore: (product: Product, store: Store, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  applyCoupon: (coupon: Coupon | null) => void;
  setWalletApplied: (amount: number) => void;

  // selectors (computed via functions)
  subtotal: () => number;
  itemCount: () => number;
  discount: () => number;
  deliveryFee: () => number;
  tax: () => number;
  total: () => number;
  /** Final amount after wallet is applied (>= 0). */
  payable: () => number;
}

const TAX_RATE = 0.05; // 5% GST

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      storeId: null,
      storeName: null,
      appliedCoupon: null,
      walletApplied: 0,
      isLoading: false,

      addItem(product, store, quantity = 1) {
        const state = get();
        if (state.storeId && state.storeId !== store.id) {
          return {
            added: false,
            reason: `Your cart has items from ${state.storeName}. Clear it to add items from ${store.name}.`
          };
        }
        const price = effectivePrice(product.price, product.discount_price);
        const existing = state.items.find((i) => i.product_id === product.id);
        let items: CartItem[];
        if (existing) {
          items = state.items.map((i) =>
            i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i
          );
        } else {
          const newItem: CartItem = {
            id: 'ci_' + Date.now(),
            product_id: product.id,
            name: product.name,
            image_url: product.image_url,
            unit: product.unit,
            price,
            quantity,
            store_id: store.id,
            store_name: store.name
          };
          items = [...state.items, newItem];
        }
        set({
          items,
          storeId: store.id,
          storeName: store.name
        });
        return { added: true };
      },

      addItemsFromDifferentStore(product, store, quantity = 1) {
        const price = effectivePrice(product.price, product.discount_price);
        const newItem: CartItem = {
          id: 'ci_' + Date.now(),
          product_id: product.id,
          name: product.name,
          image_url: product.image_url,
          unit: product.unit,
          price,
          quantity,
          store_id: store.id,
          store_name: store.name
        };
        set({
          items: [newItem],
          storeId: store.id,
          storeName: store.name,
          appliedCoupon: null,
          walletApplied: 0
        });
      },

      updateQuantity(productId, quantity) {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((s) => ({
          items: s.items.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
        }));
      },

      increment(productId) {
        set((s) => ({
          items: s.items.map((i) =>
            i.product_id === productId ? { ...i, quantity: i.quantity + 1 } : i
          )
        }));
      },

      decrement(productId) {
        const item = get().items.find((i) => i.product_id === productId);
        if (!item) return;
        if (item.quantity <= 1) {
          get().removeItem(productId);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.product_id === productId ? { ...i, quantity: i.quantity - 1 } : i
          )
        }));
      },

      removeItem(productId) {
        set((s) => {
          const items = s.items.filter((i) => i.product_id !== productId);
          return {
            items,
            storeId: items.length === 0 ? null : s.storeId,
            storeName: items.length === 0 ? null : s.storeName,
            appliedCoupon: items.length === 0 ? null : s.appliedCoupon,
            walletApplied: items.length === 0 ? 0 : s.walletApplied
          };
        });
      },

      clear() {
        set({ items: [], storeId: null, storeName: null, appliedCoupon: null, walletApplied: 0 });
      },

      applyCoupon(coupon) {
        set({ appliedCoupon: coupon });
      },

      setWalletApplied(amount) {
        set({ walletApplied: Math.max(0, Math.round(amount)) });
      },

      subtotal() {
        return get().items.reduce((s, i) => s + i.price * i.quantity, 0);
      },

      itemCount() {
        return get().items.reduce((s, i) => s + i.quantity, 0);
      },

      discount() {
        const { appliedCoupon, items } = get();
        if (!appliedCoupon || items.length === 0) return 0;
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        if (subtotal < appliedCoupon.minimum_order) return 0;
        let disc =
          appliedCoupon.discount_type === 'percentage'
            ? Math.round((subtotal * appliedCoupon.discount_value) / 100)
            : appliedCoupon.discount_value;
        if (appliedCoupon.maximum_discount) {
          disc = Math.min(disc, appliedCoupon.maximum_discount);
        }
        return disc;
      },

      deliveryFee() {
        const { items } = get();
        if (items.length === 0) return 0;
        // Flat ₹30 default — would come from store in real impl
        const baseFee = 30;
        if (get().subtotal() >= 499) return 0; // free delivery above ₹499
        return baseFee;
      },

      tax() {
        return Math.round(get().subtotal() * TAX_RATE);
      },

      total() {
        const s = get();
        return s.subtotal() + s.deliveryFee() - s.discount() + s.tax();
      },

      payable() {
        const s = get();
        return Math.max(0, s.total() - s.walletApplied);
      }
    }),
    {
      name: 'foodmunch-customer-cart',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist what's needed — walletApplied is recomputed at checkout.
      partialize: (s) => ({
        items: s.items,
        storeId: s.storeId,
        storeName: s.storeName,
        appliedCoupon: s.appliedCoupon
      })
    }
  )
);
