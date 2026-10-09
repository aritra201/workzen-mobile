import { useState } from 'react';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { resetPassword } from '../../src/api/auth';
import TextField from '../../src/components/TextField';
import PrimaryButton from '../../src/components/PrimaryButton';
import FormError from '../../src/components/FormError';
import AuthFormCard from '../../src/components/AuthFormCard';
import AuthScreenScroll from '../../src/components/AuthScreenScroll';
import BackButton from '../../src/components/BackButton';
import { useThemedStyles } from '../../src/theme/useThemedStyles';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const initialEmail = typeof params.email === 'string' ? params.email : params.email?.[0] || '';
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <AuthScreenScroll align="top">
      <View style={styles.stack}>
        <BackButton label="Back" onPress={() => router.back()} />
        <AuthFormCard
          showBranding={false}
          title="Reset password"
          subtitle="Enter the code from your email and choose a new password."
        >
          <FormError message={error} />
          <TextField label="Work email" icon="email" tone="auth" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <TextField label="Reset code" tone="auth" value={otp} onChangeText={setOtp} keyboardType="number-pad" />
          <TextField label="New password" icon="lock" tone="auth" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
          <PrimaryButton title="Update password" compact onPress={handleSubmit} loading={loading} />
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
    footer: { marginTop: 16, textAlign: 'center', fontSize: 14, color: colors.onSurfaceVariant },
    footerLink: { fontWeight: '700', color: colors.primary },
  };
}
