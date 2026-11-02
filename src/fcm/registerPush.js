import { Alert, AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { linkFcmSubscriber } from '../api/fcm';

const debugFcmUi = process.env.EXPO_PUBLIC_DEBUG_FCM === 'true';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function logFcm(message, extra) {
  // Stripped in release APKs — use EXPO_PUBLIC_DEBUG_FCM=true for on-screen alerts.
  // eslint-disable-next-line no-console
  console.warn('[WorkZen FCM]', message, extra ?? '');
}

function showFcmDebugAlert(title, body) {
  if (!debugFcmUi) {
    return;
  }
  Alert.alert(title, body, [{ text: 'OK' }]);
}

function isMobileFcmEnabled() {
  if (process.env.EXPO_PUBLIC_FCM_ENABLED === 'false') {
    return false;
  }
  return Boolean(process.env.EXPO_PUBLIC_API_URL);
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Short delay after login so the Activity is ready (Android permission / token). */
function afterUiReady() {
  return delay(Platform.OS === 'android' ? 500 : 100);
}

let syncInFlight = null;
let lastLinkedTokenPrefix = null;

async function syncWorkzenPushRegistrationInner() {
  if (!isMobileFcmEnabled()) {
    logFcm('skipped — set EXPO_PUBLIC_API_URL (and rebuild APK if you changed .env)');
    showFcmDebugAlert(
      'Push debug',
      'FCM sync skipped: EXPO_PUBLIC_API_URL missing in this build. Rebuild preview APK with eas.json env.'
    );
    return { ok: false, reason: 'disabled' };
  }

  await afterUiReady();

  const before = await Notifications.getPermissionsAsync();
  logFcm('permissions before request', {
    status: before.status,
    granted: before.granted,
    canAskAgain: before.canAskAgain,
    android: before.android,
  });

  let finalStatus = before.status;
  if (before.status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowSound: true,
        allowBadge: false,
      },
    });
    finalStatus = requested.status;
    logFcm('permissions after request', {
      status: requested.status,
      granted: requested.granted,
      canAskAgain: requested.canAskAgain,
    });
  }

  if (finalStatus !== 'granted') {
    logFcm('notifications not granted — enable in system Settings → Apps → WorkZen → Notifications');
    showFcmDebugAlert(
      'Push debug',
      `Notifications: ${finalStatus}. On Android 9 / MIUI there is no popup — open Settings → Apps → WorkZen → Notifications and turn ON.`
    );
    return { ok: false, reason: 'not_granted', status: finalStatus };
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('workzen', {
      name: 'WorkZen',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const tokenResult = await Notifications.getDevicePushTokenAsync();
  const deviceToken = tokenResult?.data;
  if (!deviceToken) {
    logFcm('no device push token from getDevicePushTokenAsync()');
    showFcmDebugAlert(
      'Push debug',
      'Permission OK but no FCM device token. Check Google Play services / Firebase on EAS credentials.'
    );
    return { ok: false, reason: 'no_token' };
  }

  const prefix = String(deviceToken).slice(0, 12);
  if (lastLinkedTokenPrefix === prefix) {
    return { ok: true, reason: 'already_linked' };
  }

  try {
    await linkFcmSubscriber(undefined, deviceToken);
  } catch (err) {
    showFcmDebugAlert('Push debug', `Link failed: ${err?.message || err}`);
    throw err;
  }
  lastLinkedTokenPrefix = prefix;
  logFcm('linked via POST /api/fcm/link', { tokenPrefix: `${prefix}…` });
  showFcmDebugAlert('Push debug', `Linked OK (token ${prefix}…). Backend can send pushes to this device.`);
  return { ok: true, reason: 'linked' };
}

export async function syncWorkzenPushRegistration() {
  if (syncInFlight) {
    return syncInFlight;
  }
  syncInFlight = syncWorkzenPushRegistrationInner()
    .catch((err) => {
      logFcm('error', err?.message || err);
      return { ok: false, reason: 'error', message: err?.message || String(err) };
    })
    .finally(() => {
      syncInFlight = null;
    });
  return syncInFlight;
}

export function attachPushRegistrationOnAppActive(getUser) {
  const sub = AppState.addEventListener('change', (next) => {
    if (next !== 'active') {
      return;
    }
    if (!getUser()) {
      return;
    }
    void syncWorkzenPushRegistration();
  });
  return () => sub.remove();
}
