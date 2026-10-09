import { useCallback, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { listMyPayroll } from '../../api/payroll';
import { listRangeLastDays } from '../../utils/dateRange';
import { attendanceListRangeLabel } from '../../utils/companyAttendanceList';
import { formatCurrencyInr } from '../../utils/format';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import DateRangeFilter from '../../components/DateRangeFilter';
import PayrollRowCard from '../../components/PayrollRowCard';
import ListPagination from '../../components/ListPagination';
import ListRangeMeta from '../../components/ListRangeMeta';
import LoadingState from '../../components/LoadingState';
import FormError from '../../components/FormError';
import MobileListCard from '../../components/MobileListCard';
import { useThemedStyles } from '../../theme/useThemedStyles';

const PAGE_SIZE = 20;
const DEFAULT_RANGE_DAYS = 30;

function SummaryStat({ label, value }) {
  const styles = useThemedStyles(createSummaryStyles);
  return (
    <MobileListCard style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </MobileListCard>
  );
}

export default function EmployeePayrollListScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const initialRange = listRangeLastDays(DEFAULT_RANGE_DAYS);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(
    async ({ pageNum = page, from, to } = {}) => {
      setLoading(true);
      setError('');
      try {
        const data = await listMyPayroll({
          startDate: from ?? startDate,
          endDate: to ?? endDate,
          limit: PAGE_SIZE,
          page: pageNum,
        });
        setRecords(data.items || []);
        setSummary(data.summary || null);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 0);
        setPage(data.page ?? pageNum);
      } catch (err) {
        setError(err.message);
        setRecords([]);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate, page]
  );

  useFocusEffect(
    useCallback(() => {
      load({ pageNum: 1 });
    }, [load])
  );

  const rangeLabel = attendanceListRangeLabel(page, PAGE_SIZE, total);

  return (
    <Screen>
      <AppHeader title="My payroll" subtitle="Confirmed shifts in range" showThemeToggle />
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onApply={() => {
          setPage(1);
          load({ pageNum: 1, from: startDate, to: endDate });
        }}
        onReset={() => {
          const range = listRangeLastDays(DEFAULT_RANGE_DAYS);
          setStartDate(range.startDate);
          setEndDate(range.endDate);
          setPage(1);
          load({ pageNum: 1, from: range.startDate, to: range.endDate });
        }}
        applying={loading}
      />
      <FormError message={error} />
      {summary ? (
        <View style={styles.summaryGrid}>
          <SummaryStat
            label="Grand total"
            value={summary.grandTotal != null ? formatCurrencyInr(summary.grandTotal) : '—'}
          />
          <View style={styles.summaryRow}>
            <SummaryStat label="Marked days" value={String(summary.recordCount ?? 0)} />
            <SummaryStat label="Confirmed shifts" value={String(summary.markedShiftCount ?? 0)} />
          </View>
        </View>
      ) : null}
      <ListRangeMeta label={rangeLabel} loading={loading && records.length > 0} />
      {loading && !records.length ? (
        <LoadingState label="Loading payroll…" />
      ) : (
        <>
          <FlatList
            data={records}
            keyExtractor={(item) => String(item.attendanceId || item.date)}
            renderItem={({ item }) => (
              <PayrollRowCard
                row={item}
                employeeScope
                onPress={
                  item.attendanceId
                    ? () =>
                        router.push({
                          pathname: '/attendance-record',
                          params: {
                            attendanceId: String(item.attendanceId),
                            mode: 'employee',
                          },
                        })
                    : undefined
                }
              />
            )}
            ListEmptyComponent={<Text style={styles.empty}>No payroll in this range.</Text>}
            scrollEnabled={false}
          />
          <ListPagination
            page={page}
            totalPages={totalPages}
            total={total}
            loading={loading}
            onPageChange={(p) => {
              setPage(p);
              load({ pageNum: p });
            }}
          />
        </>
      )}
    </Screen>
  );
}

function createStyles(colors) {
  return {
    summaryGrid: { gap: 8, marginBottom: 12 },
    summaryRow: { flexDirection: 'row', gap: 8 },
    empty: {
      textAlign: 'center',
      color: colors.onSurfaceVariant,
      marginTop: 24,
      padding: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainerLowest,
    },
  };
}

function createSummaryStyles(colors) {
  return {
    card: { flex: 1, marginBottom: 0, paddingVertical: 12, paddingHorizontal: 12 },
    label: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.onSurfaceVariant,
    },
    value: {
      marginTop: 4,
      fontSize: 20,
      fontWeight: '800',
      color: colors.onSurface,
      fontVariant: ['tabular-nums'],
    },
  };
}
