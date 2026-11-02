import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { linkFcmSubscriber } from '../api/fcm';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function isMobileFcmEnabled() {
  if (process.env.EXPO_PUBLIC_FCM_ENABLED === 'false') {
    return false;
  }
  // Device token is registered via WorkZen POST /api/fcm/link (backend talks to FCM).
  return Boolean(process.env.EXPO_PUBLIC_API_URL);
}

export async function syncWorkzenPushRegistration() {
  if (!isMobileFcmEnabled()) {
    return;
  }

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }
    if (finalStatus !== 'granted') {
      return;
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
      return;
    }

    await linkFcmSubscriber(undefined, deviceToken);
  } catch (err) {
    console.warn('[WorkZen FCM]', err?.message || err);
  }
}
