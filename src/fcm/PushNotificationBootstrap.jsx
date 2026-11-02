import { useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { attachPushRegistrationOnAppActive, syncWorkzenPushRegistration } from './registerPush';

/** Runs push permission + /api/fcm/link after login when the main UI (Activity) is ready. */
export default function PushNotificationBootstrap() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) {
      return;
    }
    void syncWorkzenPushRegistration();
  }, [user, loading]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }
    return attachPushRegistrationOnAppActive(() => user);
  }, [user]);

  return null;
}
