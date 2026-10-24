import Constants, { ExecutionEnvironment } from 'expo-constants';
import { makeRedirectUri } from 'expo-auth-session';
import { NativeModules, Platform } from 'react-native';

export function isExpoGo() {
  if (Constants.appOwnership === 'expo') return true;
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

/** True only when the native RNGoogleSignin module exists (EAS preview/production APK). */
export function canUseNativeGoogleSignIn() {
  if (Platform.OS === 'web' || isExpoGo()) return false;
  return Boolean(NativeModules.RNGoogleSignin);
}

/** Direct deep link back to the app (do not use https://auth.expo.io — proxy is removed in SDK 58). */
export function expoGoGoogleRedirectUri() {
  return makeRedirectUri({ path: 'oauthredirect' });
}
