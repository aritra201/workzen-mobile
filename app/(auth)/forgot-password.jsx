import { useEffect, useState } from 'react';
import { View } from 'react-native';
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initial =
      typeof params.email === 'string' ? params.email : params.email?.[0] || '';
    if (initial) setEmail(initial);
  }, [params.email]);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      await forgotPassword({ email: email.trim() });
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
          subtitle="Enter your email and we'll send a reset code if an account exists."
        >
          <FormError message={error} />
          <TextField
            label="Email"
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
  };
}
