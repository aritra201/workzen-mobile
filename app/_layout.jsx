import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/auth/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';
import { parseInvitationUrl, invitationRouteForKind } from '../src/utils/inviteLinks';

function DeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    function handleUrl(event) {
      const url = typeof event === 'string' ? event : event?.url;
      const invite = parseInvitationUrl(url);
      if (invite) {
        router.push(`${invitationRouteForKind(invite.kind)}?token=${encodeURIComponent(invite.token)}`);
      }
    }

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    const sub = Linking.addEventListener('url', handleUrl);
    return () => sub.remove();
  }, [router]);

  return null;
}

function RootStack() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <DeepLinkHandler />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <RootStack />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
