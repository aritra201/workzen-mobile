import { useCallback, useState } from 'react';
import { FlatList, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { listCompanyAttendance } from '../../api/companyAttendance';
import { getListItems } from '../../utils/attendanceList';
import { listRangeLastDays } from '../../utils/dateRange';
import { employeeIdsQueryParam } from '../../utils/employeeIds';
import { attendanceListRangeLabel } from '../../utils/companyAttendanceList';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import ListPageHeader from '../../components/ListPageHeader';
import DateRangeFilter from '../../components/DateRangeFilter';
import AttendanceRowCard from '../../components/AttendanceRowCard';
import ListPagination from '../../components/ListPagination';
import ListRangeMeta from '../../components/ListRangeMeta';
import LoadingState from '../../components/LoadingState';
import FormError from '../../components/FormError';
import { useThemedStyles } from '../../theme/useThemedStyles';

const PAGE_SIZE = 20;
const DEFAULT_RANGE_DAYS = 30;

export default function CompanyAttendanceListScreen({
  title,
  subtitle,
  listTitle,
  description,
  statusFilter,
  mode,
  readOnly,
}) {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const initialRange = listRangeLastDays(DEFAULT_RANGE_DAYS);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [employeeIds, setEmployeeIds] = useState([]);
  const [markedOnly, setMarkedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(
    async ({ pageNum = page, from, to, marked = markedOnly, employees = employeeIds } = {}) => {
      setLoading(true);
      setError('');
      try {
        const params = {
          startDate: from ?? startDate,
          endDate: to ?? endDate,
          limit: PAGE_SIZE,
          page: pageNum,
          fresh: true,
        };
        if (statusFilter) params.status = statusFilter;
        const employeeIdParam = employeeIdsQueryParam(employees);
        if (employeeIdParam) params.employeeId = employeeIdParam;
        if (marked) params.markedAttendance = 'true';
        const data = await listCompanyAttendance(params);
        setRecords(getListItems(data));
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 0);
        setPage(data.page ?? pageNum);
      } catch (err) {
        setError(err.message);
        setRecords([]);
        setTotal(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate, markedOnly, employeeIds, page, statusFilter]
  );

  useFocusEffect(
    useCallback(() => {
      load({ pageNum: 1 });
    }, [load])
  );

  function handleApply() {
    setPage(1);
    load({ pageNum: 1, from: startDate, to: endDate, marked: markedOnly, employees: employeeIds });
  }

  function handleReset() {
    const range = listRangeLastDays(DEFAULT_RANGE_DAYS);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setMarkedOnly(false);
    setEmployeeIds([]);
    setPage(1);
    load({
      pageNum: 1,
      from: range.startDate,
      to: range.endDate,
      marked: false,
      employees: [],
    });
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
    load({ pageNum: nextPage });
  }

  const rangeLabel = attendanceListRangeLabel(page, PAGE_SIZE, total);

  return (
    <Screen>
      <AppHeader title={title} subtitle={subtitle} showThemeToggle />
      <ListPageHeader
        title={listTitle || title}
        description={
          description ||
          (readOnly
            ? 'View-only member access'
            : `Filter by date range (default: last ${DEFAULT_RANGE_DAYS} days) and employee.`)
        }
      />
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        markedOnly={markedOnly}
        onMarkedOnlyChange={setMarkedOnly}
        showMarkedOnly
        employeeIds={employeeIds}
        onEmployeeIdsChange={setEmployeeIds}
        showEmployeeFilter
        onApply={handleApply}
        onReset={handleReset}
        applying={loading}
      />
      <FormError message={error} />
      <ListRangeMeta label={rangeLabel} loading={loading && records.length > 0} />
      {loading && records.length === 0 ? (
        <LoadingState label="Loading attendance…" />
      ) : (
        <>
          <FlatList
            data={records}
            keyExtractor={(item) => String(item.attendanceId || item.id || item.date)}
            renderItem={({ item }) => (
              <AttendanceRowCard
                row={item}
                onPress={() =>
                  router.push({
                    pathname: '/attendance-record',
                    params: {
                      attendanceId: String(item.attendanceId),
                      mode: mode || 'member',
                    },
                  })
                }
              />
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>No attendance records for this date range.</Text>
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
