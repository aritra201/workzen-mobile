import Constants, { ExecutionEnvironment } from 'expo-constants';
import { makeRedirectUri } from 'expo-auth-session';
import { NativeModules, Platform } from 'react-native';
import { getGoogleIosClientId } from './googleClient';

export function isExpoGo() {
  if (Constants.appOwnership === 'expo') return true;
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

/** Native module (EAS dev/preview/production build). iOS also needs EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID. */
export function canUseNativeGoogleSignIn() {
  if (Platform.OS === 'web' || isExpoGo()) return false;
  if (!NativeModules.RNGoogleSignin) return false;
  if (Platform.OS === 'ios' && !getGoogleIosClientId()) return false;
  return true;
}

/** Direct deep link back to the app (do not use https://auth.expo.io — proxy is removed in SDK 58). */
export function expoGoGoogleRedirectUri() {
  return makeRedirectUri({ path: 'oauthredirect' });
}
