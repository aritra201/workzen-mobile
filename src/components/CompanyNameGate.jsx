import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { getCompanyProfile, updateCompanyProfile } from '../api/company';
import { useAuth } from '../auth/AuthContext';
import AuthFormCard from './AuthFormCard';
import TextField from './TextField';
import PrimaryButton from './PrimaryButton';
import FormError from './FormError';
import LoadingState from './LoadingState';
import Screen from './Screen';
import { useThemedStyles } from '../theme/useThemedStyles';

/**
 * Blocks admin app until company_name is set (Google company registration onboarding).
 * Matches web AdminShell + CompanyNameGate.
 */
export default function CompanyNameGate({ children }) {
  const { refreshSession } = useAuth();
  const styles = useThemedStyles(createStyles);
  const [loading, setLoading] = useState(true);
  const [needsName, setNeedsName] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await getCompanyProfile();
      const missing = !profile?.companyName?.trim();
      setNeedsName(missing);
    } catch {
      setNeedsName(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    const trimmed = companyName.trim();
    if (!trimmed) {
      setError('Company name is required');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await updateCompanyProfile({ companyName: trimmed });
      await refreshSession();
      setNeedsName(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Screen>
        <LoadingState label="Loading company…" />
      </Screen>
    );
  }

  if (!needsName) {
    return children;
  }

  return (
    <Screen>
      <View style={styles.center}>
        <AuthFormCard
          title="Name your company"
          subtitle="Complete onboarding by setting your organization name."
          showBranding
        >
          <FormError message={error} />
          <TextField
            label="Company name"
            tone="auth"
            value={companyName}
            onChangeText={setCompanyName}
            autoCapitalize="words"
          />
          <PrimaryButton
            title={saving ? 'Saving…' : 'Continue to dashboard'}
            onPress={handleSave}
            loading={saving}
            disabled={!companyName.trim()}
          />
        </AuthFormCard>
      </View>
    </Screen>
  );
}

function createStyles() {
  return {
    center: {
      flex: 1,
      justifyContent: 'center',
      padding: 16,
      maxWidth: 520,
      width: '100%',
      alignSelf: 'center',
    },
  };
}
