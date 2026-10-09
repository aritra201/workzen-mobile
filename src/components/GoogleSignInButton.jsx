import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { getGoogleAndroidClientId, getGoogleWebClientId, isGoogleSignInConfigured } from '../utils/googleClient';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_G_URI = 'https://developers.google.com/identity/images/g-logo.png';

export default function GoogleSignInButton({ onIdToken, loading, disabled }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [error, setError] = useState('');
  const webClientId = getGoogleWebClientId();
  const androidClientId = getGoogleAndroidClientId() || webClientId;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: webClientId,
    androidClientId,
  });

  useEffect(() => {
    if (response?.type !== 'success') {
      if (response?.type === 'error') {
        setError(response.error?.message || 'Google sign-in failed');
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
  }, [response, onIdToken]);

  if (!isGoogleSignInConfigured()) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        disabled={disabled || loading || !request}
        onPress={() => {
          setError('');
          promptAsync();
        }}
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
    error: { fontSize: 13, color: colors.error, textAlign: 'center', marginTop: 8 },
  };
}
