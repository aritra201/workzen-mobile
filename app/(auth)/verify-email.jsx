import { useState } from 'react';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { resendVerification, verifyEmail } from '../../src/api/auth';
import { useAuth } from '../../src/auth/AuthContext';
import TextField from '../../src/components/TextField';
import PrimaryButton from '../../src/components/PrimaryButton';
import FormError from '../../src/components/FormError';
import AuthFormCard from '../../src/components/AuthFormCard';
import { homeRouteForRole, pickPrimaryMembership } from '../../src/utils/membership';
import { useTheme } from '../../src/theme/ThemeContext';
import { useThemedStyles } from '../../src/theme/useThemedStyles';

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams();
  const initialEmail = typeof params.email === 'string' ? params.email : params.email?.[0] || '';
  const router = useRouter();
  const { loginWithTokens } = useAuth();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setError('');
    setLoading(true);
    try {
      const tokens = await verifyEmail({ email: email.trim(), otp: otp.trim() });
      const me = await loginWithTokens(tokens);
      const membership = pickPrimaryMembership(me.memberships);
      router.replace(homeRouteForRole(membership?.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await resendVerification({ email: email.trim() });
      setMessage(res.message || 'Code sent.');
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
      <AuthFormCard title="Verify email" subtitle="Enter the code sent to your inbox.">
        <FormError message={error} />
        {message ? <Text style={styles.ok}>{message}</Text> : null}
        <TextField
          label="Work email"
          icon="email"
          tone="auth"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextField
          label="Verification code"
          tone="auth"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
        />
        <PrimaryButton title="Verify" onPress={handleVerify} loading={loading} />
        <PrimaryButton title="Resend code" variant="outline" compact onPress={handleResend} loading={loading} />
        <Text style={styles.footer}>
          <Link href="/(auth)/login" style={styles.footerLink}>Back to sign in</Link>
        </Text>
      </AuthFormCard>
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
      maxWidth: 520,
      width: '100%',
      alignSelf: 'center',
    },
    ok: { color: colors.primary, marginBottom: 12, marginTop: 8 },
    footer: { marginTop: 20, textAlign: 'center', fontSize: 14, color: colors.onSurfaceVariant },
    footerLink: { fontWeight: '700', color: colors.primary },
  };
}
