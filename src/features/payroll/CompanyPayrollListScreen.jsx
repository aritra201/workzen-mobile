import { useCallback, useRef, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { downloadPayrollCsv, listPayroll } from '../../api/payroll';
import { listRangeLastDays } from '../../utils/dateRange';
import { employeeIdsQueryParam } from '../../utils/employeeIds';
import { attendanceListRangeLabel } from '../../utils/companyAttendanceList';
import { formatCurrencyInr } from '../../utils/format';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import ListPageHeader from '../../components/ListPageHeader';
import DateRangeFilter from '../../components/DateRangeFilter';
import PayrollRowCard from '../../components/PayrollRowCard';
import ListPagination from '../../components/ListPagination';
import ListRangeMeta from '../../components/ListRangeMeta';
import LoadingState from '../../components/LoadingState';
import FormError from '../../components/FormError';
import { useToast } from '../../context/ToastContext';
import PrimaryButton from '../../components/PrimaryButton';
import MobileListCard from '../../components/MobileListCard';
import { useThemedStyles } from '../../theme/useThemedStyles';

const PAGE_SIZE = 20;
const DEFAULT_RANGE_DAYS = 30;
function SummaryStat({ label, value, highlight }) {
  const styles = useThemedStyles(createSummaryStyles);
  return (
    <MobileListCard style={[styles.card, highlight && styles.cardHighlight]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, highlight && styles.valueHighlight]}>{value}</Text>
    </MobileListCard>
  );
}

export default function CompanyPayrollListScreen({
  title,
  subtitle,
  mode = 'admin',
  readOnly = false,
  employeeScope = false,
}) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const styles = useThemedStyles(createStyles);
  const initialRange = listRangeLastDays(DEFAULT_RANGE_DAYS);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [employeeIds, setEmployeeIds] = useState([]);
  const [markedOnly, setMarkedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageRef = useRef(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const load = useCallback(
    async ({ pageNum, from, to, employees = employeeIds, marked = markedOnly } = {}) => {
      const targetPage = pageNum ?? pageRef.current;
      setLoading(true);
      setError('');
      try {
        const params = {
          startDate: from ?? startDate,
          endDate: to ?? endDate,
          limit: PAGE_SIZE,
          page: targetPage,
        };
        if (!employeeScope) {
          const employeeIdParam = employeeIdsQueryParam(employees);
          if (employeeIdParam) params.employeeId = employeeIdParam;
        }
        if (marked) params.markedAttendance = 'true';
        const data = await listPayroll(params);
        const resolvedPage = data.page ?? targetPage;
        pageRef.current = resolvedPage;
        setRecords(data.items || []);
        setSummary(data.summary || null);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 0);
        setPage(resolvedPage);
      } catch (err) {
        setError(err.message);
        setRecords([]);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate, employeeIds, markedOnly, employeeScope]
  );

  useFocusEffect(
    useCallback(() => {
      load({ pageNum: pageRef.current });
    }, [load])
  );

  function handleApply() {
    pageRef.current = 1;
    setPage(1);
    load({ pageNum: 1, from: startDate, to: endDate, employees: employeeIds, marked: markedOnly });
  }

  async function handleExport() {
    setExporting(true);
    setError('');
    try {
      const params = { startDate, endDate };
      const employeeIdParam = employeeIdsQueryParam(employeeIds);
      if (employeeIdParam) params.employeeId = employeeIdParam;
      if (markedOnly) params.markedAttendance = 'true';
      await downloadPayrollCsv(params);
      showSuccess('CSV exported successfully.');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setExporting(false);
    }
  }

  function handleReset() {
    const range = listRangeLastDays(DEFAULT_RANGE_DAYS);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setEmployeeIds([]);
    setMarkedOnly(false);
    pageRef.current = 1;
    setPage(1);
    load({
      pageNum: 1,
      from: range.startDate,
      to: range.endDate,
      employees: [],
      marked: false,
    });
  }

  function handlePageChange(nextPage) {
    pageRef.current = nextPage;
    setPage(nextPage);
    load({ pageNum: nextPage });
  }

  const rangeLabel = attendanceListRangeLabel(page, PAGE_SIZE, total);
  const detailMode = readOnly || mode === 'member' ? 'member' : mode;

  return (
    <Screen>
      <AppHeader title={title} subtitle={subtitle} showThemeToggle />
      <ListPageHeader
        title="Payroll & reports"
        description={
          readOnly
            ? 'View-only payroll from confirmed shifts — filter by date and employee.'
            : `Payroll from confirmed shifts — default last ${DEFAULT_RANGE_DAYS} days. Filter by date and employee.`
        }
      />
      {!employeeScope ? (
        <PrimaryButton title="Export CSV" variant="outline" compact onPress={handleExport} loading={exporting} />
      ) : null}
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        employeeIds={employeeIds}
        onEmployeeIdsChange={setEmployeeIds}
        showEmployeeFilter={!employeeScope}
        markedOnly={markedOnly}
        onMarkedOnlyChange={setMarkedOnly}
        showMarkedOnly={false}
        onApply={handleApply}
        onReset={handleReset}
        applying={loading}
      />
      <FormError message={error} />
      {summary ? (
        <View style={styles.summaryGrid}>
          <SummaryStat
            highlight
            label="Total (filtered range)"
            value={summary.grandTotal != null ? formatCurrencyInr(summary.grandTotal) : '—'}
          />
          <View style={styles.summaryRow}>
            <SummaryStat label="Marked days" value={String(summary.recordCount ?? 0)} />
            <SummaryStat label="Confirmed shifts" value={String(summary.markedShiftCount ?? 0)} />
          </View>
        </View>
      ) : null}
      <ListRangeMeta label={rangeLabel} loading={loading && records.length > 0} />
      {loading && records.length === 0 ? (
        <LoadingState label="Loading payroll…" />
      ) : (
        <>
          <FlatList
            data={records}
            keyExtractor={(item) => String(item.attendanceId || item.id || item.date)}
            renderItem={({ item }) => (
              <PayrollRowCard
                row={item}
                employeeScope={employeeScope}
                onPress={
                  item.attendanceId
                    ? () =>
                        router.push({
                          pathname: '/attendance-record',
                          params: {
                            attendanceId: String(item.attendanceId),
                            mode: detailMode,
                          },
                        })
                    : undefined
                }
              />
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>
                No payroll rows for this filter. Only days with at least one confirmed shift appear here.
              </Text>
            }
            scrollEnabled={false}
          />
          <ListPagination
            page={page}
            totalPages={totalPages}
            total={total}
            loading={loading}
            onPageChange={handlePageChange}
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
      fontSize: 14,
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 24,
      padding: 24,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainerLowest,
    },
  };
}

function createSummaryStyles(colors) {
  return {
    card: { flex: 1, marginBottom: 0, paddingVertical: 12, paddingHorizontal: 12 },
    cardHighlight: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceContainer,
    },
    label: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.onSurfaceVariant,
    },
    value: {
      marginTop: 4,
      fontSize: 22,
      fontWeight: '800',
      color: colors.onSurface,
      fontVariant: ['tabular-nums'],
    },
    valueHighlight: {
      color: colors.onSurface,
    },
  };
}
