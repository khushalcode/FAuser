import { getAuthState } from "./auth-bridge";
/**
 * API client for the Food Munch Customer app.
 *
 * Wraps all calls to the admin Next.js backend (EXPO_PUBLIC_API_URL).
 * Automatically:
 *   - Attaches the Firebase ID token as `Authorization: Bearer <token>`
 *   - Refreshes the token once on 401 (then signs out if it still fails)
 *   - Returns JSON parsed responses
 *
 * All higher-level feature modules (notifications, payments, storage, sms)
 * should use this client rather than calling `fetch` directly.
 *
 * In MOCK MODE (no Firebase configured) the client is still safe to call —
 * most calls will simply not be made because the api.ts layer short-circuits
 * to local mock data. But for upload / fcm / otp / razorpay the API client
 * is what makes the call, and it gracefully degrades when there is no token
 * (the backend returns a mock response when FIREBASE_SERVICE_ACCOUNT_JSON is
 * not set on the server).
 */
import { firebaseAuth, isFirebaseConfigured } from './firebase';
import Constants from 'expo-constants';

const extra = (Constants.expoConfig as any)?.extra ?? {};
const configuredApiUrl: string =
  process.env.EXPO_PUBLIC_API_URL ||
  (typeof extra.apiUrl === 'string' ? extra.apiUrl : '') ||
  '';

/** Backend base URL — never has a trailing slash. */
export const API_BASE_URL: string = (
  configuredApiUrl || 'http://localhost:3000'
).replace(/\/+$/, '');

export const isApiConfigured: boolean = !!configuredApiUrl;

export class ApiError extends Error {
  status: number;
  body?: any;
  constructor(message: string, status: number, body?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Get the current Firebase ID token (or null in mock mode).
 * Forces a refresh every 5 minutes via the `forceRefresh` param when needed.
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  if (!isFirebaseConfigured || !firebaseAuth) return null;
  const user = firebaseAuth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch (e) {
    console.warn('[api-client] getIdToken failed', e);
    return null;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  /** Skip the JSON-content-type header (for multipart/form-data uploads). */
  rawBody?: boolean;
  /** When true, do not throw on non-2xx — return the raw response object. */
  returnRaw?: boolean;
  /** Override the auth token (used for the 401-retry path). */
  tokenOverride?: string;
}

async function request<T = any>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const url = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts.headers || {})
  };

  const token = opts.tokenOverride !== undefined ? opts.tokenOverride : await getIdToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    if (opts.rawBody) {
      // Caller has constructed the body (e.g. FormData)
      body = opts.body as BodyInit;
    } else {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      body = JSON.stringify(opts.body);
    }
  }

  const method = opts.method || 'GET';

  let res: Response;
  try {
    res = await fetch(url, { method, headers, body });
  } catch (e: any) {
    throw new ApiError(
      e?.message || 'Network request failed. Is the backend running?',
      0
    );
  }

  // 401 — try refreshing the token once
  if (res.status === 401 && !opts.tokenOverride && isFirebaseConfigured) {
    const refreshed = await getIdToken(true);
    if (refreshed) {
      return request<T>(path, { ...opts, tokenOverride: refreshed });
    }
    // Token refresh failed — sign the user out
    try {
      await getAuthState().signOut();
    } catch (e) {
      /* ignore */
    }
    throw new ApiError('Session expired — please sign in again', 401);
  }

  if (opts.returnRaw) {
    return res as unknown as T;
  }

  // Parse JSON (best-effort)
  let json: any = null;
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
  }

  if (!res.ok) {
    const message =
      json?.error || json?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, json);
  }

  return json as T;
}

export const apiClient = {
  get: <T = any>(path: string, opts: RequestOptions = {}) =>
    request<T>(path, { ...opts, method: 'GET' }),

  post: <T = any>(path: string, body?: any, opts: RequestOptions = {}) =>
    request<T>(path, { ...opts, method: 'POST', body }),

  put: <T = any>(path: string, body?: any, opts: RequestOptions = {}) =>
    request<T>(path, { ...opts, method: 'PUT', body }),

  patch: <T = any>(path: string, body?: any, opts: RequestOptions = {}) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),

  delete: <T = any>(path: string, opts: RequestOptions = {}) =>
    request<T>(path, { ...opts, method: 'DELETE' }),

  /** Upload a file via multipart/form-data. */
  upload: async <T = any>(
    path: string,
    fields: { bucket: string; prefix?: string },
    file: { uri: string; name: string; type: string },
    opts: RequestOptions = {}
  ): Promise<T> => {
    const formData = new FormData();
    formData.append('bucket', fields.bucket);
    if (fields.prefix) formData.append('prefix', fields.prefix);
    // @ts-ignore — RN FormData accepts { uri, name, type }
    formData.append('file', file as any);
    return request<T>(path, {
      ...opts,
      method: 'POST',
      body: formData,
      rawBody: true
    });
  },

  /** Raw fetch with auth headers — used for non-JSON endpoints. */
  raw: (path: string, opts: RequestOptions = {}) => request<Response>(path, { ...opts, returnRaw: true })
};

export default apiClient;