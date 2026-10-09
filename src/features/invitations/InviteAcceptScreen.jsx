import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  acceptEmployeeInvitation,
  acceptEmployeeInvitationGoogle,
  acceptMemberInvitation,
  acceptMemberInvitationGoogle,
  previewEmployeeInvitation,
  previewMemberInvitation,
} from '../../api/invitations';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { useAuth } from '../../auth/AuthContext';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import FormError from '../../components/FormError';
import LoadingState from '../../components/LoadingState';
import { homeRouteForRole, pickPrimaryMembership } from '../../utils/membership';
import { useToast } from '../../context/ToastContext';
import { colors } from '../../theme/colors';

export default function InviteAcceptScreen({ kind }) {
  const { token } = useLocalSearchParams();
  const rawToken = typeof token === 'string' ? token : token?.[0];
  const router = useRouter();
  const { loginWithTokens } = useAuth();
  const { showSuccess, showError } = useToast();
  const [preview, setPreview] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isMember = kind === 'member';
  const title = isMember ? 'Join as member' : 'Join as employee';

  useEffect(() => {
    if (!rawToken) return;
    const load = isMember ? previewMemberInvitation : previewEmployeeInvitation;
    load(rawToken)
      .then(setPreview)
      .catch((err) => setError(err.message));
  }, [rawToken, isMember]);

  async function finish(tokens) {
    const me = await loginWithTokens(tokens);
    const membership = pickPrimaryMembership(me.memberships);
    router.replace(homeRouteForRole(membership?.role));
  }

  async function handleAccept() {
    if (!rawToken) return;
    setBusy(true);
    setError('');
    try {
      const accept = isMember ? acceptMemberInvitation : acceptEmployeeInvitation;
      const tokens = await accept({ token: rawToken, password });
      await finish(tokens);
      showSuccess('Welcome to WorkZen!');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!rawToken) {
    return (
      <Screen>
        <Text style={styles.error}>Invalid invitation link — missing token.</Text>
        <Text style={styles.hint}>Open the invitation link from your email (use “Open in app” if shown).</Text>
      </Screen>
    );
  }

  if (!preview && !error) {
    return <LoadingState label="Loading invitation…" />;
  }

  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        {preview ? (
          <Text style={styles.body}>
            You are invited to <Text style={styles.strong}>{preview.companyName}</Text> as{' '}
            {preview.email || preview.employeeEmail || preview.invitedEmail}.
          </Text>
        ) : null}
        <FormError message={error} />
        <TextField
          label="Create password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <PrimaryButton title="Accept invitation" onPress={handleAccept} loading={busy} />
        <GoogleSignInButton
          loading={busy}
          disabled={busy}
          onIdToken={async (idToken) => {
            if (!rawToken) return;
            setBusy(true);
            setError('');
            try {
              const tokens = isMember
                ? await acceptMemberInvitationGoogle({ token: rawToken, idToken })
                : await acceptEmployeeInvitationGoogle({ token: rawToken, idToken });
              await finish(tokens);
              showSuccess('Welcome to WorkZen!');
            } catch (err) {
              setError(err.message);
              showError(err.message);
            } finally {
              setBusy(false);
            }
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.onSurface, marginBottom: 12 },
  body: { fontSize: 15, color: colors.onSurfaceVariant, marginBottom: 16, lineHeight: 22 },
  strong: { fontWeight: '600', color: colors.onSurface },
  note: { marginTop: 16, fontSize: 12, color: colors.onSurfaceVariant, lineHeight: 18 },
  error: { color: colors.error, fontSize: 16, marginTop: 24 },
  hint: { color: colors.onSurfaceVariant, marginTop: 8 },
});
