import { useEffect, useState } from 'react';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { resetPassword } from '../../src/api/auth';
import TextField from '../../src/components/TextField';
import OtpInput from '../../src/components/OtpInput';
import PrimaryButton from '../../src/components/PrimaryButton';
import FormError from '../../src/components/FormError';
import AuthFormCard from '../../src/components/AuthFormCard';
import AuthScreenScroll from '../../src/components/AuthScreenScroll';
import BackButton from '../../src/components/BackButton';
import { useThemedStyles } from '../../src/theme/useThemedStyles';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resolved =
      typeof params.email === 'string' ? params.email.trim() : (params.email?.[0] || '').trim();
    if (!resolved) {
      router.replace('/(auth)/forgot-password');
      return;
    }
    setEmail(resolved);
  }, [params.email, router]);

  function handleResend() {
    router.push({
      pathname: '/(auth)/forgot-password',
      params: { email: email.trim() },
    });
  }

  async function handleSubmit() {
    if (!email.trim()) {
      router.replace('/(auth)/forgot-password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword({ email: email.trim(), otp: otp.trim(), newPassword });
      router.replace('/(auth)/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!email) {
    return null;
  }

  return (
    <AuthScreenScroll align="top">
      <View style={styles.stack}>
        <BackButton label="Back" onPress={() => router.back()} />
        <AuthFormCard showBranding={false} title="Enter reset code">
          <Text style={styles.subtitle}>
            We sent a code to <Text style={styles.emailBold}>{email}</Text>. Enter it below with your
            new password.
          </Text>
          <FormError message={error} />
          <Text style={styles.otpLabel}>Reset code</Text>
          <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          <TextField
            label="New password"
            icon="lock"
            tone="auth"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <PrimaryButton
            title="Update password"
            compact
            onPress={handleSubmit}
            loading={loading}
            disabled={otp.length < 4 || newPassword.length < 8}
          />
          <Pressable onPress={handleResend} hitSlop={8} style={styles.resendWrap}>
            <Text style={styles.resendLink}>Didn&apos;t receive the code? Resend</Text>
          </Pressable>
          <Text style={styles.footer}>
            <Link href="/(auth)/login" style={styles.footerLink}>Back to sign in</Link>
          </Text>
        </AuthFormCard>
      </View>
    </AuthScreenScroll>
  );
}

function createStyles(colors) {
  return {
    stack: {
      width: '100%',
      gap: 12,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.onSurfaceVariant,
      marginBottom: 16,
    },
    emailBold: {
      fontWeight: '700',
      color: colors.onSurface,
    },
    otpLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.onSurface,
      marginBottom: 8,
    },
    resendWrap: {
      marginTop: 20,
      alignItems: 'center',
    },
    resendLink: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
    },
    footer: { marginTop: 12, textAlign: 'center', fontSize: 14, color: colors.onSurfaceVariant },
    footerLink: { fontWeight: '700', color: colors.primary },
  };
}
