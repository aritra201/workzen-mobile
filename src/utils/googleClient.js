function cleanEnv(value) {
  if (!value || typeof value !== 'string') return '';
  return value.replace(/^['"]|['"]$/g, '').trim();
}

/** Web OAuth client ID — must match backend `GOOGLE_CLIENT_ID` (same as VITE_GOOGLE_CLIENT_ID). */
export function getGoogleWebClientId() {
  return cleanEnv(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
}

export function getGoogleAndroidClientId() {
  return cleanEnv(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);
}

export function isGoogleSignInConfigured() {
  return getGoogleWebClientId().length > 0;
}
