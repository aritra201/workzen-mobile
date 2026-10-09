import { useCallback, useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { listMyAttendance } from '../../src/api/attendance';
import {
  cancelMyUnlockRequest,
  createUnlockRequest,
  listMyUnlockRequests,
} from '../../src/api/unlockRequests';
import { listRangeLastDays } from '../../src/utils/dateRange';
import { formatDateLabel } from '../../src/utils/format';
import { getMyAttendanceListItems } from '../../src/utils/myAttendanceList';
import Screen from '../../src/components/Screen';
import AppHeader from '../../src/components/AppHeader';
import PrimaryButton from '../../src/components/PrimaryButton';
import StatusChip from '../../src/components/StatusChip';
import LoadingState from '../../src/components/LoadingState';
import FormError from '../../src/components/FormError';
import { useToast } from '../../src/context/ToastContext';
import { useThemedStyles } from '../../src/theme/useThemedStyles';

export default function EmployeeUnlockRequestsScreen() {
  const { showSuccess, showError } = useToast();
  const styles = useThemedStyles(createStyles);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const range = listRangeLastDays(90);
      const [attendanceData, unlockData] = await Promise.all([
        listMyAttendance({ ...range, page: 1, limit: 50 }),
        listMyUnlockRequests(),
      ]);
      setAttendanceRows(getMyAttendanceListItems(attendanceData));
      setRequests(unlockData.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const pendingAttendanceIds = useMemo(
    () =>
      new Set(
        requests.filter((r) => r.status === 'pending').map((r) => String(r.attendanceId))
      ),
    [requests]
  );

  const lockedRows = useMemo(
    () => attendanceRows.filter((row) => row.lockAttendance),
    [attendanceRows]
  );

  function requestUnlock(row) {
    Alert.alert(
      'Request unlock?',
      `Send an unlock request for ${formatDateLabel(row.date)}? An admin must approve before you can edit.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request unlock',
          onPress: async () => {
            setSubmitting(true);
            setError('');
            try {
              await createUnlockRequest({ attendanceId: row.attendanceId });
              await load();
              showSuccess('Unlock request sent.');
            } catch (err) {
              setError(err.message);
              showError(err.message);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  }

  if (loading && !attendanceRows.length && !requests.length) {
    return <LoadingState label="Loading unlock requests…" />;
  }

  return (
    <Screen scroll>
      <AppHeader
        title="Unlock requests"
        subtitle="Request access to locked attendance days"
      />
      <FormError message={error} />

      <Text style={styles.sectionTitle}>Locked attendance (90 days)</Text>
      {lockedRows.length === 0 ? (
        <Text style={styles.empty}>No locked attendance in the last 90 days.</Text>
      ) : (
        lockedRows.map((row) => {
          const pending = pendingAttendanceIds.has(String(row.attendanceId));
          return (
            <View key={String(row.attendanceId)} style={styles.card}>
              <Text style={styles.date}>{formatDateLabel(row.date)}</Text>
              {pending ? (
                <StatusChip tone="pending">Request pending</StatusChip>
              ) : (
                <PrimaryButton
                  title="Request unlock"
                  loading={submitting}
                  onPress={() => requestUnlock(row)}
                />
              )}
            </View>
          );
        })
      )}

      <Text style={styles.sectionTitle}>Your requests</Text>
      {requests.length === 0 ? (
        <Text style={styles.empty}>No unlock requests yet.</Text>
      ) : (
        requests.map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.date}>{formatDateLabel(r.date)}</Text>
              <StatusChip
                tone={
                  r.status === 'approved'
                    ? 'verified'
                    : r.status === 'denied'
                      ? 'rejected'
                      : 'pending'
                }
              >
                {r.status}
              </StatusChip>
            </View>
            {r.status === 'pending' ? (
              <PrimaryButton
                title="Cancel request"
                variant="outline"
                onPress={() =>
                  cancelMyUnlockRequest(r.id)
                    .then(() => {
                      showSuccess('Request cancelled.');
                      return load();
                    })
                    .catch((e) => {
                      setError(e.message);
                      showError(e.message);
                    })
                }
              />
            ) : null}
          </View>
        ))
      )}
    </Screen>
  );
}

function createStyles(colors) {
  return {
    sectionTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.onSurface,
      marginTop: 16,
      marginBottom: 8,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      gap: 8,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    date: { fontSize: 16, fontWeight: '600', color: colors.onSurface },
    empty: { fontSize: 14, color: colors.onSurfaceVariant, marginBottom: 12 },
  };
}
