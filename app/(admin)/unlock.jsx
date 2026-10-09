import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { decideUnlockRequest, listUnlockRequestsAdmin } from '../../src/api/unlockRequests';
import { formatDateLabel } from '../../src/utils/format';
import { attendanceListRangeLabel } from '../../src/utils/companyAttendanceList';
import Screen from '../../src/components/Screen';
import AppHeader from '../../src/components/AppHeader';
import ListPageHeader from '../../src/components/ListPageHeader';
import PrimaryButton from '../../src/components/PrimaryButton';
import StatusChip from '../../src/components/StatusChip';
import ListPagination from '../../src/components/ListPagination';
import ListRangeMeta from '../../src/components/ListRangeMeta';
import MobileListCard from '../../src/components/MobileListCard';
import PersonAvatar from '../../src/components/PersonAvatar';
import LoadingState from '../../src/components/LoadingState';
import FormError from '../../src/components/FormError';
import { useThemedStyles } from '../../src/theme/useThemedStyles';
import { useToast } from '../../src/context/ToastContext';

const PAGE_SIZE = 20;

export default function AdminUnlockScreen() {
  const { showSuccess, showError } = useToast();
  const styles = useThemedStyles(createStyles);
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deciding, setDeciding] = useState(null);

  const load = useCallback(async (pageNum = page) => {
    setLoading(true);
    setError('');
    try {
      const data = await listUnlockRequestsAdmin({
        status: 'pending',
        page: pageNum,
        limit: PAGE_SIZE,
      });
      setRequests(data.requests || []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 0);
      setPage(data.page ?? pageNum);
    } catch (err) {
      setError(err.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useFocusEffect(
    useCallback(() => {
      load(1);
    }, [load])
  );

  async function decide(row, status) {
    setDeciding({ id: row.id, status });
    setError('');
    try {
      await decideUnlockRequest({ attendanceId: row.attendanceId, status });
      await load(page);
      showSuccess(status === 'approved' ? 'Request approved.' : 'Request denied.');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setDeciding(null);
    }
  }

  return (
    <Screen>
      <AppHeader title="Unlock" subtitle="Pending employee requests" showThemeToggle />
      <ListPageHeader
        title="Unlock requests"
        description="Approve or deny requests to edit locked attendance days."
      />
      <FormError message={error} />
      <ListRangeMeta label={attendanceListRangeLabel(page, PAGE_SIZE, total)} loading={loading} />
      {loading && requests.length === 0 ? (
        <LoadingState />
      ) : (
        <>
          {requests.map((r) => (
            <MobileListCard key={r.id}>
              <View style={styles.header}>
                <PersonAvatar name={r.employeeName} email={r.employeeEmail} size={40} />
                <View style={styles.headerText}>
                  <Text style={styles.name}>{r.employeeName || 'Employee'}</Text>
                  <Text style={styles.date}>{formatDateLabel(r.date)}</Text>
                </View>
              </View>
              <StatusChip tone="pending">{r.status}</StatusChip>
              <View style={styles.actions}>
                <PrimaryButton
                  title="Approve"
                  loading={deciding?.id === r.id && deciding.status === 'approved'}
                  disabled={Boolean(deciding)}
                  onPress={() => decide(r, 'approved')}
                />
                <PrimaryButton
                  title="Deny"
                  variant="outline"
                  loading={deciding?.id === r.id && deciding.status === 'denied'}
                  disabled={Boolean(deciding)}
                  onPress={() => decide(r, 'denied')}
                />
              </View>
            </MobileListCard>
          ))}
          <ListPagination
            page={page}
            totalPages={totalPages}
            total={total}
            loading={loading}
            onPageChange={(p) => load(p)}
          />
        </>
      )}
    </Screen>
  );
}

function createStyles(colors) {
  return {
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerText: { flex: 1 },
    name: { fontSize: 16, fontWeight: '700', color: colors.onSurface },
    date: { fontSize: 14, color: colors.onSurfaceVariant, marginTop: 2 },
    actions: { gap: 8, marginTop: 12 },
  };
}
