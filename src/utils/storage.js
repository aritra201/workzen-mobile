import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'workzen_access_token';
const REFRESH_KEY = 'workzen_refresh_token';

const isWeb = Platform.OS === 'web';

async function getItem(key) {
  if (isWeb) {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key, value) {
  if (isWeb) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeItem(key) {
  if (isWeb) {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function getAccessToken() {
  return getItem(ACCESS_KEY);
}

export async function getRefreshToken() {
  return getItem(REFRESH_KEY);
}

export async function setTokens({ accessToken, refreshToken }) {
  if (accessToken) {
    await setItem(ACCESS_KEY, accessToken);
  }
  if (refreshToken) {
    await setItem(REFRESH_KEY, refreshToken);
  }
}

export async function clearTokens() {
  await removeItem(ACCESS_KEY);
  await removeItem(REFRESH_KEY);
}
