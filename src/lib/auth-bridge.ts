type AuthState = ReturnType<typeof import('@/store/auth').useAuthStore.getState>;

let _get: () => AuthState = () => ({} as AuthState);
export const registerAuthState = (fn: () => AuthState) => { _get = fn; };
export const getAuthState = () => _get();
