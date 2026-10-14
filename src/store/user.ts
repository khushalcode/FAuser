/**
 * User state store (Zustand) — wraps non-auth profile data:
 * wallet balance, loyalty points, favourites (in-memory), addresses, etc.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api';
import {
  walletBalance as mockWalletBalance,
  loyaltyPoints as mockLoyaltyPoints,
  loyaltyTier as mockLoyaltyTier,
  loyaltyProgress as mockLoyaltyProgress
} from '@/data/mock-data';
import type { CustomerAddress, WalletTransaction } from '@/lib/types';

interface UserState {
  walletBalance: number;
  loyaltyPoints: number;
  loyaltyTier: string;
  loyaltyProgress: number;
  favouriteProductIds: string[];
  addresses: CustomerAddress[];
  walletTransactions: WalletTransaction[];
  selectedAddressId: string | null;
  isLoading: boolean;

  loadProfile: () => Promise<void>;
  toggleFavourite: (productId: string) => void;
  isFavourite: (productId: string) => boolean;
  loadAddresses: () => Promise<void>;
  addAddress: (addr: Omit<CustomerAddress, 'id' | 'customer_id'>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setSelectedAddress: (id: string) => void;
  loadWallet: () => Promise<void>;
  addMoney: (amount: number) => Promise<void>;
  getDefaultAddress: () => CustomerAddress | null;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      walletBalance: mockWalletBalance,
      loyaltyPoints: mockLoyaltyPoints,
      loyaltyTier: mockLoyaltyTier,
      loyaltyProgress: mockLoyaltyProgress,
      favouriteProductIds: ['prod_1', 'prod_4', 'prod_13', 'prod_17'],
      addresses: [],
      walletTransactions: [],
      selectedAddressId: null,
      isLoading: false,

      async loadProfile() {
        set({ isLoading: true });
        try {
          const [favIds, addr, balance, txns] = await Promise.all([
            api.getFavouriteProductIds(),
            api.getAddresses(),
            api.getWalletBalance(),
            api.getWalletTransactions()
          ]);
          const defaultAddr = addr.find((a) => a.is_default) || addr[0] || null;
          set({
            favouriteProductIds: favIds,
            addresses: addr,
            walletBalance: balance,
            walletTransactions: txns,
            selectedAddressId: defaultAddr?.id || null,
            isLoading: false
          });
        } catch (e) {
          set({ isLoading: false });
        }
      },

      toggleFavourite(productId) {
        set((s) => {
          const exists = s.favouriteProductIds.includes(productId);
          return {
            favouriteProductIds: exists
              ? s.favouriteProductIds.filter((id) => id !== productId)
              : [...s.favouriteProductIds, productId]
          };
        });
      },

      isFavourite(productId) {
        return get().favouriteProductIds.includes(productId);
      },

      async loadAddresses() {
        const addr = await api.getAddresses();
        set((s) => ({
          addresses: addr,
          selectedAddressId: s.selectedAddressId || addr.find((a) => a.is_default)?.id || addr[0]?.id || null
        }));
      },

      async addAddress(payload) {
        const a = await api.addAddress(payload);
        set((s) => ({
          addresses: [...s.addresses, a],
          selectedAddressId: payload.is_default ? a.id : s.selectedAddressId
        }));
      },

      async deleteAddress(id) {
        await api.deleteAddress(id);
        set((s) => ({
          addresses: s.addresses.filter((a) => a.id !== id),
          selectedAddressId: s.selectedAddressId === id ? (s.addresses[0]?.id || null) : s.selectedAddressId
        }));
      },

      setSelectedAddress(id) {
        set({ selectedAddressId: id });
      },

      async loadWallet() {
        const [balance, txns] = await Promise.all([
          api.getWalletBalance(),
          api.getWalletTransactions()
        ]);
        set({ walletBalance: balance, walletTransactions: txns });
      },

      async addMoney(amount) {
        await api.addMoney(amount);
        set((s) => ({ walletBalance: s.walletBalance + amount }));
        await get().loadWallet();
      },

      getDefaultAddress() {
        const { addresses, selectedAddressId } = get();
        return addresses.find((a) => a.id === selectedAddressId) ||
          addresses.find((a) => a.is_default) ||
          addresses[0] ||
          null;
      }
    }),
    {
      name: 'foodmunch-customer-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        favouriteProductIds: s.favouriteProductIds,
        selectedAddressId: s.selectedAddressId
      })
    }
  )
);
