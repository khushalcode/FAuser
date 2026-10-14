/**
 * Firebase Auth client for Food Munch Customer app.
 *
 * Reads config from (in priority order):
 *   1. EXPO_PUBLIC_FIREBASE_* env vars (override for EAS builds, .env files)
 *   2. `Constants.expoConfig.extra.firebase` baked into app.json
 *
 * If both are missing/invalid, `isFirebaseConfigured` is false and the app
 * falls back to a local mock auth flow (see src/store/auth.ts) — this keeps
 * the app fully interactive in Expo Go preview without real Firebase keys.
 *
 * Exposes:
 *   - firebaseApp / firebaseAuth singletons (when configured)
 *   - getIdToken() helper used by api-client.ts
 *   - mockAuth fallback for preview mode
 *   - signInWithPhoneCredential() helper used by the OTP login flow
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  User as FirebaseUser,
  onAuthStateChanged,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import Constants from 'expo-constants';

type FirebaseExtra = {
  apiKey?: string;
  projectId?: string;
  appId?: string;
  messagingSenderId?: string;
  storageBucket?: string;
};

const extra = (Constants.expoConfig as any)?.extra ?? {};
const extraFirebase: FirebaseExtra = extra.firebase ?? {};

function pick(envKey: string, extraKey: keyof FirebaseExtra): string | undefined {
  return (process.env[envKey] || extraFirebase[extraKey] || '').toString().trim() || undefined;
}

const projectId = pick('EXPO_PUBLIC_FIREBASE_PROJECT_ID', 'projectId');
const apiKey = pick('EXPO_PUBLIC_FIREBASE_API_KEY', 'apiKey');
const appId = pick('EXPO_PUBLIC_FIREBASE_APP_ID', 'appId');

const firebaseConfig = {
  apiKey,
  authDomain: (process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || (projectId ? `${projectId}.firebaseapp.com` : '')).trim() || undefined,
  projectId,
  appId,
  messagingSenderId: pick('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'messagingSenderId'),
  storageBucket: pick('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', 'storageBucket')
};

export const isFirebaseConfigured =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId &&
  !!firebaseConfig.appId;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig as any);
    auth = getAuth(app);
  } catch (e) {
    console.warn('[firebase] init failed, falling back to mock auth', e);
    app = null;
    auth = null;
  }
}

export { app as firebaseApp, auth as firebaseAuth };

export const firebaseMode: 'live' | 'mock' = isFirebaseConfigured && auth ? 'live' : 'mock';

/**
 * Get the current Firebase user's ID token.
 * Returns null in mock mode or when no user is signed in.
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  if (!auth) return null;
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch (e) {
    console.warn('[firebase] getIdToken failed', e);
    return null;
  }
}

/**
 * Subscribe to auth state changes (used to refresh session on token refresh).
 */
export function subscribeToAuth(callback: (user: FirebaseUser | null) => void): () => void {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

/**
 * Sign in with a phone auth credential (used after SMS OTP verification).
 * On the server we use Twilio/MSG91 to verify OTP and Firebase Admin SDK to
 * mint a custom token; this client helper signs in with the credential if
 * one is provided. In mock mode, just resolves with the mock user.
 */
export async function signInWithPhoneCredential(
  verificationId: string,
  verificationCode: string
): Promise<{ uid: string; phone: string | null } | null> {
  if (!auth) return null;
  try {
    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    const result = await signInWithCredential(auth, credential);
    return {
      uid: result.user.uid,
      phone: result.user.phoneNumber
    };
  } catch (e) {
    console.warn('[firebase] phone credential sign-in failed', e);
    throw e;
  }
}

/**
 * Mock auth helpers used when real Firebase is not configured.
 * Each function returns a fake user object after a small simulated delay
 * so the UI feels realistic.
 */
export const mockAuth = {
  async signInWithEmail(email: string, _password: string) {
    await new Promise((r) => setTimeout(r, 600));
    return {
      uid: 'mock-' + Buffer.from(email).slice(0, 12).toString('hex'),
      email,
      emailVerified: true,
      displayName: email.split('@')[0]
    };
  },
  async signUpWithEmail(email: string, _password: string, fullName: string) {
    await new Promise((r) => setTimeout(r, 800));
    return {
      uid: 'mock-' + Buffer.from(email).slice(0, 12).toString('hex'),
      email,
      emailVerified: false,
      displayName: fullName || email.split('@')[0]
    };
  },
  async signInWithGoogle() {
    await new Promise((r) => setTimeout(r, 600));
    return {
      uid: 'mock-google-' + Date.now(),
      email: 'customer.google@gmail.com',
      emailVerified: true,
      displayName: 'Google Customer'
    };
  },
  async signInWithPhone(phone: string) {
    await new Promise((r) => setTimeout(r, 600));
    return {
      uid: 'mock-phone-' + phone.replace(/[^0-9]/g, ''),
      email: '',
      emailVerified: true,
      displayName: 'Phone Customer',
      phoneNumber: phone
    };
  },
  async sendPasswordReset(_email: string) {
    await new Promise((r) => setTimeout(r, 500));
    return true;
  },
  async signOut() {
    await new Promise((r) => setTimeout(r, 200));
    return true;
  }
};
