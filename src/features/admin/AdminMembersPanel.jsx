import { useCallback, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { inviteMember, listMembers, resendMemberInvite, cancelMemberInvite, updateMemberStatus } from '../../api/members';
import { attendanceListRangeLabel } from '../../utils/companyAttendanceList';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import ListPagination from '../../components/ListPagination';
import ListRangeMeta from '../../components/ListRangeMeta';
import LoadingState from '../../components/LoadingState';
import LoadingOverlay from '../../components/LoadingOverlay';
import FormError from '../../components/FormError';
import TeamPersonCard from '../../components/TeamPersonCard';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { useToast } from '../../context/ToastContext';

const PAGE_SIZE = 20;

function memberStatus(member) {
  if (!member.userId) return { label: 'Invitation pending', tone: 'pending' };
  if (member.isActive) return { label: 'Active', tone: 'verified' };
  return { label: 'Inactive', tone: 'locked' };
}

export default function AdminMembersPanel() {
  const styles = useThemedStyles(createStyles);
  const { showSuccess, showError } = useToast();
  const [members, setMembers] = useState([]);
  const [page, setPage] = useState(1);
  const pageRef = useRef(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ memberName: '', email: '' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (pageNum) => {
    const targetPage = pageNum ?? pageRef.current;
    setLoading(true);
    setError('');
    try {
      const data = await listMembers({ page: targetPage, limit: PAGE_SIZE });
      const resolvedPage = data.page ?? targetPage;
      pageRef.current = resolvedPage;
      setMembers(data.items || data.members || []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 0);
      setPage(resolvedPage);
    } catch (err) {
      setError(err.message);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(pageRef.current);
    }, [load])
  );

  function handlePageChange(nextPage) {
    pageRef.current = nextPage;
    setPage(nextPage);
    load(nextPage);
  }

  async function handleInvite() {
    if (!form.memberName.trim() || !form.email.trim()) {
      showError('Name and email are required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await inviteMember({
        memberName: form.memberName.trim(),
        email: form.email.trim(),
      });
      setShowInvite(false);
      setForm({ memberName: '', email: '' });
      await load(pageRef.current);
      showSuccess('Invitation sent.');
    } catch (err) {
      showError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function toggleActive(member) {
    const next = !member.isActive;
    Alert.alert(next ? 'Activate member?' : 'Deactivate member?', member.name || member.email, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: next ? 'Activate' : 'Deactivate',
        onPress: async () => {
          try {
            await updateMemberStatus(member.id, { isActive: next });
            await load(pageRef.current);
            showSuccess(next ? 'Member activated.' : 'Member deactivated.');
          } catch (err) {
            showError(err.message);
          }
        },
      },
    ]);
  }

  function promptCancelInvite(member) {
    Alert.alert(
      'Cancel invitation?',
      `Remove the pending invite for ${member.name || member.email}? They will be removed from your list until you invite again.`,
      [
        { text: 'Keep invite', style: 'cancel' },
        {
          text: 'Cancel invitation',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await cancelMemberInvite({ email: member.email });
              await load(pageRef.current);
              showSuccess('Invitation cancelled.');
            } catch (err) {
              showError(err.message);
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  }

  async function handleResend(member) {
    setError('');
    setBusy(true);
    try {
      await resendMemberInvite({ email: member.email });
      await load(pageRef.current);
      showSuccess('Invitation resent.');
    } catch (err) {
      showError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading && !members.length && !showInvite) {
    return <LoadingState label="Loading members…" />;
  }

  return (
    <View>
      <LoadingOverlay visible={busy} label="Sending invitation…" />
      <FormError message={error} />
      <PrimaryButton
        title={showInvite ? 'Cancel invite' : 'Invite member'}
        variant={showInvite ? 'outline' : 'primary'}
        onPress={() => setShowInvite((v) => !v)}
      />
      {showInvite ? (
        <View style={styles.inviteBox}>
          <TextField
            label="Name"
            value={form.memberName}
            onChangeText={(v) => setForm((f) => ({ ...f, memberName: v }))}
          />
          <TextField
            label="Email"
            icon="email"
            value={form.email}
            onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
            keyboardType="email-address"
          />
          <PrimaryButton title="Send invitation" onPress={handleInvite} loading={busy} />
        </View>
      ) : null}

      <ListRangeMeta label={attendanceListRangeLabel(page, PAGE_SIZE, total)} loading={loading} />

      {members.map((m) => {
        const status = memberStatus(m);
        return (
          <TeamPersonCard
            key={m.id}
            name={m.name || m.memberName}
            email={m.email}
            photoUrl={m.profilePicture}
            status={status}
            primaryAction={
              !m.userId
                ? { title: 'Resend invite', onPress: () => handleResend(m) }
                : {
                    title: m.isActive ? 'Deactivate' : 'Activate',
                    onPress: () => toggleActive(m),
                  }
            }
            secondaryAction={
              !m.userId ? { title: 'Cancel invite', onPress: () => promptCancelInvite(m) } : null
            }
          />
        );
      })}

      <ListPagination
        page={page}
        totalPages={totalPages}
        total={total}
        loading={loading}
        onPageChange={handlePageChange}
      />
    </View>
  );
}

function createStyles() {
  return {
    inviteBox: { marginVertical: 12, gap: 4 },
  };
}
