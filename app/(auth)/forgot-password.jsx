import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { forgotPassword } from '../../src/api/auth';
import TextField from '../../src/components/TextField';
import PrimaryButton from '../../src/components/PrimaryButton';
import FormError from '../../src/components/FormError';
import AuthFormCard from '../../src/components/AuthFormCard';
import AuthScreenScroll from '../../src/components/AuthScreenScroll';
import BackButton from '../../src/components/BackButton';
import { useThemedStyles } from '../../src/theme/useThemedStyles';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const styles = useThemedStyles(createStyles);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initial = typeof params.email === 'string' ? params.email : '';
    if (initial) setEmail(initial);
  }, [params.email]);

  async function handleSubmit() {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await forgotPassword({ email: email.trim() });
      setMessage('If an account exists, a reset code was sent to your email.');
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email: email.trim() },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenScroll align="top">
      <View style={styles.stack}>
        <BackButton label="Back to sign in" onPress={() => router.replace('/(auth)/login')} />
        <AuthFormCard
          showBranding={false}
          title="Forgot password"
          subtitle="Enter your work email and we will send a reset code."
        >
          <FormError message={error} />
          {message ? <Text style={styles.success}>{message}</Text> : null}
          <TextField
            label="Work email"
            icon="email"
            tone="auth"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <PrimaryButton title="Send reset code" compact onPress={handleSubmit} loading={loading} />
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
    success: { color: colors.primary, marginBottom: 12, marginTop: 4 },
  };
}
