import { sessionStore } from '../services/api';

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const googleAuthAvailable = () =>
  Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_AUTH_PROXY);

function buildGoogleUrl(appName) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GOOGLE_AUTH_PROXY;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!clientId || !redirectUri) return null;
  const state = btoa(JSON.stringify({ origin: window.location.origin, appName, supabaseUrl, supabaseAnonKey }));
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&prompt=select_account&state=${encodeURIComponent(state)}`;
}

// Opens Google sign-in in a popup; the proxy posts back a session which we
// store the same way as an email/password login.
export function signInWithGoogle(appName, onSuccess) {
  const url = buildGoogleUrl(appName);
  if (!url) return;
  const popup = window.open(url, 'google-auth', isMobile() ? '' : 'width=500,height=600');

  const handler = (event) => {
    if (event.source !== popup) return;
    if (event.data?.type === 'google-auth-denied') {
      window.removeEventListener('message', handler);
      return;
    }
    if (event.data?.type !== 'google-auth-success') return;
    window.removeEventListener('message', handler);
    const { access_token, refresh_token } = event.data;
    sessionStore.set({ access_token, refresh_token });
    onSuccess?.();
  };
  window.addEventListener('message', handler);
}

// Redirect fallback: the popup lands here with tokens in the URL fragment.
export function handleGoogleRedirect() {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  if (!fragment.has('google_auth_popup')) return;
  const access_token = fragment.get('access_token');
  const refresh_token = fragment.get('refresh_token');
  if (!access_token || !refresh_token) return;
  sessionStore.set({ access_token, refresh_token });
  window.close();
}
