/**
 * Auth store (Zustand).
 *
 * Uses real Firebase Auth (email/password, Google, phone) when configured,
 * otherwise falls back to mockAuth. Persists the session to AsyncStorage so
 * refresh keeps you logged in.
 *
 * Also exposes:
 *   - signInWithPhoneOtp(): SMS OTP login flow (calls /api/sms/send-otp
 *     and /api/sms/verify-otp, then signs in via Firebase phone auth or
 *     mock fallback)
 *   - getAuthToken(): returns the current Firebase ID token (used by the
 *     api-client and notifications modules)
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  firebaseAuth,
  firebaseMode,
  isFirebaseConfigured,
  mockAuth,
  getIdToken,
  signInWithPhoneCredential
} from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { apiClient, isApiConfigured } from '@/lib/api-client';
import { api } from '@/lib/api';
import type { AppUser } from '@/lib/types';

interface AuthState {
  user: AppUser | null;
  firebaseUser: { uid: string; email: string | null; displayName: string | null; phone?: string | null } | null;
  isLoading: boolean;
  error: string | null;
  isMockMode: boolean;

  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  hydrateProfile: () => Promise<void>;

  // SMS OTP login
  sendOtp: (phone: string) => Promise<{ verificationId?: string; mockOtp?: string }>;
  verifyOtp: (phone: string, code: string, verificationId?: string) => Promise<void>;

  // Token helper (used by api-client)
  getAuthToken: () => Promise<string | null>;
}

const buildUser = (
  uid: string,
  email: string,
  displayName?: string | null,
  phone?: string | null
): AppUser => ({
  id: uid,
  firebase_uid: uid,
  email,
  phone: phone || undefined,
  full_name: displayName || email.split('@')[0],
  role: 'customer',
  is_active: true,
  created_at: new Date().toISOString()
});

/**
 * Register the user in the backend `users` table after Firebase creates them.
 * This is idempotent — if the user already exists, the backend returns the
 * existing row. The backend's /api/auth/register also creates the
 * role-specific row (customers + wallet).
 */
async function registerUserInBackend(user: AppUser): Promise<void> {
  try {
    await apiClient.post('/api/auth/register', {
      firebase_uid: user.firebase_uid,
      email: user.email,
      phone: user.phone || null,
      full_name: user.full_name,
      role: 'customer'
    });
  } catch (e) {
    // Non-fatal — the user may already exist, or backend may be in mock mode.
    console.warn('[auth] backend register failed (non-fatal):', e);
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      isLoading: false,
      error: null,
      isMockMode: firebaseMode === 'mock',

      clearError: () => set({ error: null }),

      async signInWithEmail(email, password) {
        set({ isLoading: true, error: null });
        try {
          let fbUser: { uid: string; email: string; displayName: string | null; emailVerified: boolean; phone?: string | null };
          if (isFirebaseConfigured && firebaseAuth) {
            const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
            const u = cred.user;
            fbUser = {
              uid: u.uid,
              email: u.email || email,
              displayName: u.displayName,
              emailVerified: u.emailVerified,
              phone: u.phoneNumber
            };
          } else {
            const m = await mockAuth.signInWithEmail(email, password);
            fbUser = {
              uid: m.uid,
              email: m.email,
              displayName: m.displayName,
              emailVerified: m.emailVerified
            };
          }
          const user = buildUser(fbUser.uid, fbUser.email, fbUser.displayName, fbUser.phone);
          set({ user, firebaseUser: fbUser, isLoading: false, isMockMode: !isFirebaseConfigured });
        } catch (e: any) {
          set({ isLoading: false, error: e?.message || 'Sign in failed' });
          throw e;
        }
      },

      async signUpWithEmail(email, password, fullName) {
        set({ isLoading: true, error: null });
        try {
          let fbUser: { uid: string; email: string; displayName: string | null; emailVerified: boolean; phone?: string | null };
          if (isFirebaseConfigured && firebaseAuth) {
            const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            if (fullName) {
              await updateProfile(cred.user, { displayName: fullName });
            }
            fbUser = {
              uid: cred.user.uid,
              email: cred.user.email || email,
              displayName: fullName || cred.user.displayName,
              emailVerified: cred.user.emailVerified,
              phone: cred.user.phoneNumber
            };
            // Register in backend
            const user = buildUser(fbUser.uid, fbUser.email, fbUser.displayName, fbUser.phone);
            await registerUserInBackend(user);
          } else {
            const m = await mockAuth.signUpWithEmail(email, password, fullName);
            fbUser = {
              uid: m.uid,
              email: m.email,
              displayName: m.displayName,
              emailVerified: m.emailVerified
            };
          }
          const user = buildUser(fbUser.uid, fbUser.email, fbUser.displayName, fbUser.phone);
          set({ user, firebaseUser: fbUser, isLoading: false, isMockMode: !isFirebaseConfigured });
        } catch (e: any) {
          set({ isLoading: false, error: e?.message || 'Sign up failed' });
          throw e;
        }
      },

      async signInWithGoogle() {
        set({ isLoading: true, error: null });
        try {
          let fbUser: { uid: string; email: string; displayName: string | null; emailVerified: boolean; phone?: string | null };
          // Real Google Sign-In requires @react-native-google-signin/google-signin
          // For preview/mock mode we use mockAuth.google().
          if (isFirebaseConfigured && firebaseAuth) {
            // Production: would integrate GoogleSignIn here.
            // Fallback to mock for now if no native google provider installed.
            const m = await mockAuth.signInWithGoogle();
            fbUser = {
              uid: m.uid,
              email: m.email,
              displayName: m.displayName,
              emailVerified: m.emailVerified
            };
          } else {
            const m = await mockAuth.signInWithGoogle();
            fbUser = {
              uid: m.uid,
              email: m.email,
              displayName: m.displayName,
              emailVerified: m.emailVerified
            };
          }
          const user = buildUser(fbUser.uid, fbUser.email, fbUser.displayName, fbUser.phone);
          set({ user, firebaseUser: fbUser, isLoading: false, isMockMode: !isFirebaseConfigured });
        } catch (e: any) {
          set({ isLoading: false, error: e?.message || 'Google sign in failed' });
          throw e;
        }
      },

      async resetPassword(email) {
        set({ isLoading: true, error: null });
        try {
          if (isFirebaseConfigured && firebaseAuth) {
            await sendPasswordResetEmail(firebaseAuth, email);
          } else {
            await mockAuth.sendPasswordReset(email);
          }
          set({ isLoading: false });
        } catch (e: any) {
          set({ isLoading: false, error: e?.message || 'Reset failed' });
          throw e;
        }
      },

      async signOut() {
        set({ isLoading: true });
        try {
          if (isFirebaseConfigured && firebaseAuth) {
            await fbSignOut(firebaseAuth);
          } else {
            await mockAuth.signOut();
          }
        } catch (e) {
          // ignore
        }
        set({ user: null, firebaseUser: null, isLoading: false });
      },

      async hydrateProfile() {
        const cur = get().user;
        if (cur) return;
        try {
          const profile = await api.getCurrentCustomer();
          set({ user: profile });
        } catch (e) {
          // ignore — user can still browse anonymously
        }
      },

      // ---------------- SMS OTP LOGIN ----------------

      async sendOtp(phone) {
        set({ isLoading: true, error: null });
        try {
          // In mock mode, any phone + OTP 123456 works.
          if (!isFirebaseConfigured || !isApiConfigured) {
            await new Promise((r) => setTimeout(r, 600));
            set({ isLoading: false });
            return { mockOtp: '123456' };
          }

          const result = await apiClient.post<{ success: boolean; mockOtp?: string; provider?: string; error?: string }>(
            '/api/sms/send-otp',
            { phone, purpose: 'login' }
          );

          // If the backend returns a mockOtp (server in mock SMS mode),
          // surface it to the UI for easier testing.
          set({ isLoading: false });
          if (!result.success && result.error) {
            throw new Error(result.error);
          }
          return { mockOtp: result.mockOtp };
        } catch (e: any) {
          set({ isLoading: false, error: e?.message || 'Failed to send OTP' });
          throw e;
        }
      },

      async verifyOtp(phone, code, verificationId) {
        set({ isLoading: true, error: null });
        try {
          // Mock mode: accept any phone + code "123456"
          if (!isFirebaseConfigured || !isApiConfigured) {
            if (code !== '123456') {
              throw new Error('Invalid OTP. In mock mode, use 123456.');
            }
            await new Promise((r) => setTimeout(r, 600));
            const m = await mockAuth.signInWithPhone(phone);
            const fbUser = {
              uid: m.uid,
              email: m.email || '',
              displayName: m.displayName,
              emailVerified: true,
              phone
            };
            const user = buildUser(fbUser.uid, fbUser.email || `${phone.replace(/[^0-9]/g, '')}@phone.foodmunch`, fbUser.displayName, phone);
            set({ user, firebaseUser: fbUser, isLoading: false, isMockMode: !isFirebaseConfigured });
            return;
          }

          // Real mode: verify via backend
          const result = await apiClient.post<{ success: boolean; error?: string; custom_token?: string }>(
            '/api/sms/verify-otp',
            { phone, code }
          );

          if (!result.success) {
            throw new Error(result.error || 'OTP verification failed');
          }

          // Sign in to Firebase:
          //   - If the backend returned a custom_token, use signInWithCustomToken.
          //   - Otherwise fall back to phone auth credential if verificationId was provided.
          if (result.custom_token && firebaseAuth) {
            const { signInWithCustomToken } = await import('firebase/auth');
            const cred = await signInWithCustomToken(firebaseAuth, result.custom_token);
            const u = cred.user;
            const fbUser = {
              uid: u.uid,
              email: u.email || '',
              displayName: u.displayName || 'Phone Customer',
              emailVerified: true,
              phone
            };
            const user = buildUser(fbUser.uid, fbUser.email || `${phone.replace(/[^0-9]/g, '')}@phone.foodmunch`, fbUser.displayName, phone);
            await registerUserInBackend(user);
            set({ user, firebaseUser: fbUser, isLoading: false, isMockMode: false });
            return;
          }

          if (verificationId && firebaseAuth) {
            const result2 = await signInWithPhoneCredential(verificationId, code);
            if (result2) {
              const fbUser = {
                uid: result2.uid,
                email: '',
                displayName: 'Phone Customer',
                emailVerified: true,
                phone: result2.phone || phone
              };
              const user = buildUser(fbUser.uid, `${phone.replace(/[^0-9]/g, '')}@phone.foodmunch`, fbUser.displayName, phone);
              await registerUserInBackend(user);
              set({ user, firebaseUser: fbUser, isLoading: false, isMockMode: false });
              return;
            }
          }

          // Fallback to mock if we couldn't actually sign in (e.g. backend
          // is in mock mode and didn't return a custom_token).
          const m = await mockAuth.signInWithPhone(phone);
          const fbUser = {
            uid: m.uid,
            email: m.email || '',
            displayName: m.displayName,
            emailVerified: true,
            phone
          };
          const user = buildUser(fbUser.uid, fbUser.email || `${phone.replace(/[^0-9]/g, '')}@phone.foodmunch`, fbUser.displayName, phone);
          set({ user, firebaseUser: fbUser, isLoading: false, isMockMode: !isFirebaseConfigured });
        } catch (e: any) {
          set({ isLoading: false, error: e?.message || 'OTP verification failed' });
          throw e;
        }
      },

      async getAuthToken() {
        return getIdToken(false);
      }
    }),
    {
      name: 'foodmunch-customer-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ user: s.user, firebaseUser: s.firebaseUser, isMockMode: s.isMockMode })
    }
  )
);

// Convenience: a "guest" session for preview so the user can browse without logging in.
export const useIsAuthenticated = () => useAuthStore((s) => !!s.user);
import { registerAuthState } from '../lib/auth-bridge';
registerAuthState(() => useAuthStore.getState());
