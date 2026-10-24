import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, NativeModules, Pressable, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  canUseNativeGoogleSignIn,
  expoGoGoogleRedirectUri,
} from '../utils/googleAuthRedirect';
import { getGoogleWebClientId, isGoogleSignInConfigured } from '../utils/googleClient';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_G_URI = 'https://developers.google.com/identity/images/g-logo.png';

function loadNativeGoogleSignin() {
  if (!NativeModules.RNGoogleSignin) return null;
  try {
    return require('@react-native-google-signin/google-signin').GoogleSignin;
  } catch {
    return null;
  }
}

function GoogleSignInBrowserButton({ onIdToken, loading, disabled }) {
  const styles = useThemedStyles(createStyles);
  const [error, setError] = useState('');
  const webClientId = getGoogleWebClientId();
  const redirectUri = useMemo(() => expoGoGoogleRedirectUri(), []);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: webClientId,
    webClientId,
    redirectUri,
  });

  useEffect(() => {
    if (__DEV__) {
      console.log(`[Google OAuth] Web client redirect URI:\n${redirectUri}`);
    }
  }, [redirectUri]);

  useEffect(() => {
    if (!response) return;
    if (response.type === 'dismiss' || response.type === 'cancel') {
      return;
    }
    if (response.type !== 'success') {
      if (response.type === 'error') {
        const msg = response.error?.message || 'Google sign-in failed';
        setError(
          msg.includes('redirect_uri')
            ? `Google redirect mismatch. Add this URI in Cloud Console (Web client):\n${redirectUri}`
            : msg
        );
      }
      return;
    }
    const idToken =
      response.params?.id_token ||
      response.authentication?.idToken ||
      response.authentication?.id_token;
    if (!idToken) {
      setError('Google did not return an ID token');
      return;
    }
    setError('');
    Promise.resolve(onIdToken(idToken)).catch((err) => {
      setError(err?.message || 'Sign-in failed');
    });
  }, [response, onIdToken, redirectUri]);

  return (
    <GoogleSignInUi
      styles={styles}
      disabled={disabled}
      loading={loading}
      error={error}
      ready={Boolean(request)}
      onPress={() => {
        setError('');
        promptAsync();
      }}
    />
  );
}

function GoogleSignInNativeButton({ onIdToken, loading, disabled }) {
  const styles = useThemedStyles(createStyles);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const webClientId = getGoogleWebClientId();
  const GoogleSignin = useMemo(() => loadNativeGoogleSignin(), []);

  useEffect(() => {
    if (!GoogleSignin || !webClientId) return;
    GoogleSignin.configure({
      webClientId,
      offlineAccess: false,
    });
  }, [GoogleSignin, webClientId]);

  const handlePress = useCallback(async () => {
    if (!GoogleSignin) {
      setError('Rebuild and reinstall the app (npm run build:preview).');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      if (result.type === 'cancelled') {
        return;
      }
      if (result.type !== 'success') {
        return;
      }
      const idToken = result.data?.idToken;
      if (!idToken) {
        setError('Google did not return an ID token.');
        return;
      }
      await onIdToken(idToken);
    } catch (err) {
      if (err?.code === 'SIGN_IN_CANCELLED') return;
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  }, [GoogleSignin, onIdToken]);

  return (
    <GoogleSignInUi
      styles={styles}
      disabled={disabled}
      loading={loading || busy}
      error={error}
      ready={Boolean(GoogleSignin && webClientId)}
      onPress={handlePress}
    />
  );
}

function GoogleSignInUi({ styles, disabled, loading, error, ready, onPress }) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Pressable
        disabled={disabled || loading || !ready}
        onPress={onPress}
        style={({ pressed }) => [styles.googleRow, pressed && styles.pressed, (disabled || loading) && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <Image source={{ uri: GOOGLE_G_URI }} style={styles.googleIcon} />
            <Text style={styles.googleLabel}>Continue with Google</Text>
          </>
        )}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export default function GoogleSignInButton(props) {
  if (!isGoogleSignInConfigured()) {
    return null;
  }
  if (canUseNativeGoogleSignIn()) {
    return <GoogleSignInNativeButton {...props} />;
  }
  return <GoogleSignInBrowserButton {...props} />;
}

function createStyles(colors) {
  return {
    wrap: { marginTop: 4, marginBottom: 4 },
    googleRow: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.googleButtonBg,
    },
    googleIcon: { width: 20, height: 20 },
    googleLabel: { fontSize: 15, fontWeight: '600', color: colors.googleButtonText },
    pressed: { opacity: 0.92 },
    disabled: { opacity: 0.5 },
    error: { fontSize: 12, color: colors.error, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  };
}
