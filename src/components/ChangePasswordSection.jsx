import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { changePassword, fetchMe } from '../api/auth';
import TextField from './TextField';
import PrimaryButton from './PrimaryButton';
import FormError from './FormError';
import FilterCard from './FilterCard';
import LoadingState from './LoadingState';
import { useThemedStyles } from '../theme/useThemedStyles';
import { useToast } from '../context/ToastContext';

export default function ChangePasswordSection({ authProvider: authProviderProp, userEmail }) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const styles = useThemedStyles(createStyles);
  const [authProvider, setAuthProvider] = useState(authProviderProp || null);
  const [hasPassword, setHasPassword] = useState(false);
  const [loadingMe, setLoadingMe] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoadingMe(true);
      fetchMe()
        .then((me) => {
          if (cancelled) return;
          setAuthProvider(me.auth_provider || authProviderProp || 'local');
          setHasPassword(Boolean(me.has_password));
        })
        .catch(() => {
          if (!cancelled && authProviderProp) {
            setAuthProvider(authProviderProp);
          }
        })
        .finally(() => {
          if (!cancelled) setLoadingMe(false);
        });
      return () => {
        cancelled = true;
      };
    }, [authProviderProp])
  );

  function goForgotPassword() {
    router.push({
      pathname: '/(auth)/forgot-password',
      params: userEmail ? { email: userEmail } : undefined,
    });
  }

  const showGoogleOnly = authProvider === 'google' && !hasPassword;

  async function handleSave() {
    setError('');
    setMessage('');
    if (!currentPassword.trim()) {
      showError('Enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      showError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New password and confirmation do not match.');
      return;
    }
    setSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setMessage('');
      setHasPassword(true);
      showSuccess('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOpen(false);
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loadingMe) {
    return (
      <FilterCard compact style={styles.wrap}>
        <LoadingState label="Loading account…" />
      </FilterCard>
    );
  }

  if (showGoogleOnly) {
    return (
      <FilterCard compact style={styles.wrap}>
        <Text style={styles.heading}>Password</Text>
        <Text style={styles.googleNote}>
          You sign in with Google. Your Google account password is managed at Google. If you also sign in with
          email, you can reset your WorkZen password below.
        </Text>
        <View style={styles.actionsRow}>
          <Pressable onPress={goForgotPassword} hitSlop={8}>
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </Pressable>
        </View>
      </FilterCard>
    );
  }

  return (
    <FilterCard compact style={styles.wrap}>
      <Text style={styles.heading}>Password</Text>
      <Text style={styles.hint}>Update the password you use to sign in with email.</Text>
      {!open ? (
        <View style={styles.actionsRow}>
          <PrimaryButton title="Change password" variant="secondary" compact onPress={() => setOpen(true)} />
          <Pressable onPress={goForgotPassword} hitSlop={8}>
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FormError message={error} />
          {message ? <Text style={styles.success}>{message}</Text> : null}
          <TextField
            label="Current password"
            icon="lock"
            tone="auth"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <TextField
            label="New password"
            icon="lock"
            tone="auth"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TextField
            label="Confirm new password"
            icon="lock"
            tone="auth"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <PrimaryButton title="Update password" compact onPress={handleSave} loading={saving} />
          <PrimaryButton
            title="Cancel"
            variant="outline"
            compact
            onPress={() => {
              setOpen(false);
              setError('');
            }}
          />
        </>
      )}
    </FilterCard>
  );
}

function createStyles(colors) {
  return {
    wrap: { marginTop: 8 },
    heading: { fontSize: 16, fontWeight: '700', color: colors.onSurface, marginBottom: 4 },
    hint: { fontSize: 13, color: colors.onSurfaceVariant, marginBottom: 12 },
    googleNote: { fontSize: 13, color: colors.onSurfaceVariant, lineHeight: 20, marginBottom: 12 },
    actionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 16,
    },
    forgotLink: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },
    success: { color: colors.primary, fontSize: 14, marginBottom: 8 },
  };
}
