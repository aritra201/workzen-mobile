import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { googleAuthCompanyAdmin, registerCompany } from '../../src/api/auth';
import GoogleSignInButton from '../../src/components/GoogleSignInButton';
import { useAuth } from '../../src/auth/AuthContext';
import TextField from '../../src/components/TextField';
import PrimaryButton from '../../src/components/PrimaryButton';
import FormError from '../../src/components/FormError';
import AuthFormCard, { AuthDivider } from '../../src/components/AuthFormCard';
import { homeRouteForRole, pickPrimaryMembership } from '../../src/utils/membership';
import { useTheme } from '../../src/theme/ThemeContext';
import { useThemedStyles } from '../../src/theme/useThemedStyles';

export default function RegisterScreen() {
  const router = useRouter();
  const { loginWithTokens } = useAuth();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError('');
    setLoading(true);
    try {
      await registerCompany({ companyName: companyName.trim(), email: email.trim(), password });
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: email.trim() },
      });
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
        title="Register company"
        subtitle="Create an admin account for your organization on WorkZen."
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
                const tokens = await googleAuthCompanyAdmin({ idToken });
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
        <AuthDivider label="or register with email" />
        <TextField label="Company name" tone="auth" value={companyName} onChangeText={setCompanyName} />
        <TextField
          label="Admin email"
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
        />
        <PrimaryButton title="Create account" onPress={handleRegister} loading={loading} />
        <Text style={styles.footer}>
          Already have an account? <Link href="/(auth)/login" style={styles.footerLink}>Sign in</Link>
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
    googleBlock: {
      marginTop: 16,
      zIndex: 2,
    },
    footer: { marginTop: 20, textAlign: 'center', fontSize: 14, color: colors.onSurfaceVariant },
    footerLink: { fontWeight: '700', color: colors.primary },
  };
}
