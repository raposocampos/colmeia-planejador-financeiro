import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const anonymousKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
const rememberKey = "colmeia-auth-remember";
let preferPersistentSession = false;
let client: SupabaseClient | null = null;

const browserStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
  },
  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    const selected = preferPersistentSession
      ? window.localStorage
      : window.sessionStorage;
    const other = preferPersistentSession ? window.sessionStorage : window.localStorage;
    selected.setItem(key, value);
    other.removeItem(key);
  },
  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

export const isSupabaseConfigured = (): boolean => Boolean(url && anonymousKey);

export const setRememberPreference = (remember: boolean): void => {
  preferPersistentSession = remember;
  if (typeof window === "undefined") return;
  if (remember) window.localStorage.setItem(rememberKey, "true");
  else window.localStorage.removeItem(rememberKey);
};

export const getRememberPreference = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(rememberKey) === "true";
};

export const getSupabaseBrowserClient = (): SupabaseClient => {
  if (!isSupabaseConfigured())
    throw new Error("A sincronização ainda não foi configurada neste ambiente.");
  if (!client) {
    preferPersistentSession = getRememberPreference();
    client = createClient(url, anonymousKey, {
      auth: {
        storage: browserStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
  }
  return client;
};

export const clearAuthenticationStorage = (): void => {
  if (typeof window === "undefined") return;
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (key?.startsWith("sb-") || key === rememberKey) storage.removeItem(key);
    }
  }
  preferPersistentSession = false;
};

export const authRedirectUrl = (path: string): string => {
  const configuredSite = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const origin =
    configuredSite || (typeof window !== "undefined" ? window.location.origin : "");
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${origin}${basePath}${path}`;
};
