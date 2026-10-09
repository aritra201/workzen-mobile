import { useCallback, useState } from 'react';
import { FlatList, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { listMyAttendance } from '../../api/attendance';
import { listRangeLastDays } from '../../utils/dateRange';
import { getMyAttendanceListItems } from '../../utils/myAttendanceList';
import { attendanceListRangeLabel } from '../../utils/companyAttendanceList';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import DateRangeFilter from '../../components/DateRangeFilter';
import AttendanceRowCard from '../../components/AttendanceRowCard';
import ListRangeMeta from '../../components/ListRangeMeta';
import LoadingState from '../../components/LoadingState';
import FormError from '../../components/FormError';
import { useThemedStyles } from '../../theme/useThemedStyles';

const DEFAULT_RANGE_DAYS = 30;
const PAGE_LIMIT = 50;

export default function EmployeeAttendanceHistoryScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const initialRange = listRangeLastDays(DEFAULT_RANGE_DAYS);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [markedOnly, setMarkedOnly] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(
    async ({ from, to, marked = markedOnly } = {}) => {
      setLoading(true);
      setError('');
      try {
        const params = {
          startDate: from ?? startDate,
          endDate: to ?? endDate,
          page: 1,
          limit: PAGE_LIMIT,
        };
        if (marked) params.markedAttendance = 'true';
        const data = await listMyAttendance(params);
        setRecords(getMyAttendanceListItems(data));
      } catch (err) {
        setError(err.message);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    },
    [startDate, endDate, markedOnly]
  );

  useFocusEffect(
    useCallback(() => {
      load({});
    }, [load])
  );

  function handleApply() {
    load({ from: startDate, to: endDate, marked: markedOnly });
  }

  function handleReset() {
    const range = listRangeLastDays(DEFAULT_RANGE_DAYS);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setMarkedOnly(false);
    load({ from: range.startDate, to: range.endDate, marked: false });
  }

  const rangeLabel = attendanceListRangeLabel(1, PAGE_LIMIT, records.length);

  return (
    <Screen>
      <AppHeader title="Attendance history" subtitle={`Default last ${DEFAULT_RANGE_DAYS} days`} showThemeToggle />
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        markedOnly={markedOnly}
        onMarkedOnlyChange={setMarkedOnly}
        showMarkedOnly
        onApply={handleApply}
        onReset={handleReset}
        applying={loading}
      />
      <FormError message={error} />
      <ListRangeMeta label={rangeLabel} loading={loading && records.length > 0} />
      {loading && records.length === 0 ? (
        <LoadingState label="Loading history…" />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => String(item.attendanceId)}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <AttendanceRowCard
              row={item}
              onPress={() =>
                router.push({
                  pathname: '/attendance-record',
                  params: { attendanceId: String(item.attendanceId), mode: 'employee' },
                })
              }
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>No records in this range.</Text>}
        />
      )}
    </Screen>
  );
}

function createStyles(colors) {
  return {
    empty: {
      textAlign: 'center',
      color: colors.onSurfaceVariant,
      marginTop: 24,
      padding: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.card,
    },
  };
}
