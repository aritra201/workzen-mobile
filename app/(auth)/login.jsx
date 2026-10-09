import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { login, loginGoogle } from '../../src/api/auth';
import GoogleSignInButton from '../../src/components/GoogleSignInButton';
import { useAuth } from '../../src/auth/AuthContext';
import TextField from '../../src/components/TextField';
import PrimaryButton from '../../src/components/PrimaryButton';
import FormError from '../../src/components/FormError';
import AuthFormCard, { AuthDivider } from '../../src/components/AuthFormCard';
import { homeRouteForRole, pickPrimaryMembership } from '../../src/utils/membership';
import { API_BASE } from '../../src/api/client';
import { useTheme } from '../../src/theme/ThemeContext';
import { useThemedStyles } from '../../src/theme/useThemedStyles';

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithTokens } = useAuth();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    if (!API_BASE) {
      setError('Set EXPO_PUBLIC_API_URL in .env (see .env.example).');
      return;
    }
    setLoading(true);
    try {
      const tokens = await login({ email: email.trim(), password });
      const me = await loginWithTokens(tokens);
      const membership = pickPrimaryMembership(me.memberships);
      router.replace(homeRouteForRole(membership?.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.surface }]}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <AuthFormCard
        title="Welcome back"
        subtitle="Sign in to manage attendance, verification, and payroll ledgers."
      >
        <FormError message={error} />
        <View style={styles.googleBlock}>
          <GoogleSignInButton
            loading={loading}
            disabled={loading}
            onIdToken={async (idToken) => {
              setLoading(true);
              setError('');
              try {
                const tokens = await loginGoogle({ idToken });
                const me = await loginWithTokens(tokens);
                const membership = pickPrimaryMembership(me.memberships);
                router.replace(homeRouteForRole(membership?.role));
              } catch (err) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}
          />
        </View>
        <AuthDivider />
        <TextField
          label="Work email"
          icon="email"
          tone="auth"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextField
          label="Password"
          icon="lock"
          tone="auth"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          labelRight={
            <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
              Forgot?
            </Link>
          }
        />
        <PrimaryButton
          title={loading ? 'Signing in…' : 'Log in to WorkZen'}
          onPress={handleLogin}
          loading={loading}
        />
        <Text style={styles.footer}>
          New organization?{' '}
          <Link href="/(auth)/register" style={styles.footerLink}>Register company</Link>
        </Text>
      </AuthFormCard>

      <View style={styles.promo}>
        <View style={styles.promoGlow} pointerEvents="none" />
        <Text style={styles.promoBadge}>Live field sync</Text>
        <Text style={styles.promoTitle}>Civil site ledger & punch</Text>
        <Text style={styles.promoBody}>
          Geofenced roll calls, shift verification, and wage reconciliation in one workspace.
        </Text>
        <View style={styles.promoStat}>
          <Text style={styles.promoStatLabel}>Daily reconciliation</Text>
          <Text style={styles.promoStatValue}>98.4%</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function createStyles(colors) {
  return {
    scrollView: {
      flex: 1,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 16,
      paddingBottom: 32,
      gap: 16,
      maxWidth: 520,
      width: '100%',
      alignSelf: 'center',
    },
    googleBlock: {
      marginTop: 16,
      zIndex: 2,
    },
    forgotLink: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    footer: {
      marginTop: 20,
      textAlign: 'center',
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    footerLink: {
      fontWeight: '700',
      color: colors.primary,
    },
    promo: {
      borderRadius: 14,
      padding: 20,
      backgroundColor: colors.primary,
      overflow: 'hidden',
      position: 'relative',
    },
    promoGlow: {
      position: 'absolute',
      right: -40,
      bottom: -40,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: colors.primaryContainer,
      opacity: 0.45,
    },
    promoBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.18)',
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      color: colors.onPrimary,
    },
    promoTitle: {
      marginTop: 12,
      fontSize: 20,
      fontWeight: '700',
      color: colors.onPrimary,
    },
    promoBody: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 20,
      color: colors.onPrimary,
      opacity: 0.92,
    },
    promoStat: {
      marginTop: 20,
      borderRadius: 10,
      padding: 14,
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    promoStatLabel: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      color: colors.onPrimary,
      opacity: 0.85,
    },
    promoStatValue: {
      marginTop: 4,
      fontSize: 26,
      fontWeight: '800',
      color: colors.onPrimary,
      fontVariant: ['tabular-nums'],
    },
  };
}
