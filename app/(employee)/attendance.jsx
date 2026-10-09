import { useCallback, useState } from 'react';
import { Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getTodayAttendance } from '../../src/api/attendance';
import { listMarkAttendanceShiftItems } from '../../src/utils/attendanceUi';
import Screen from '../../src/components/Screen';
import AppHeader from '../../src/components/AppHeader';
import EmployeeShiftCard from '../../src/components/EmployeeShiftCard';
import LoadingState from '../../src/components/LoadingState';
import FormError from '../../src/components/FormError';
import PrimaryButton from '../../src/components/PrimaryButton';
import { useThemedStyles } from '../../src/theme/useThemedStyles';

export default function EmployeeAttendanceScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTodayAttendance();
      setRecord(data);
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

  if (loading && !record) {
    return <LoadingState label="Loading today…" />;
  }

  const shiftItems = listMarkAttendanceShiftItems(record);
  const dateLabel = record?.date || 'Today';
  const attendanceDate = record?.date;

  return (
    <Screen>
      <AppHeader title="Mark attendance" subtitle={dateLabel} />
      <FormError message={error} />
      {shiftItems.map(({ shiftKey, shift, label }) => (
        <EmployeeShiftCard
          key={shiftKey}
          shiftKey={shiftKey}
          shift={shift}
          attendance={record}
          attendanceDate={attendanceDate}
          label={label}
          onUpdated={load}
        />
      ))}
      {!record?.canEdit ? (
        <Text style={styles.locked}>
          This day is locked. Request an unlock to edit attendance.
        </Text>
      ) : null}
      <PrimaryButton
        title="Unlock requests"
        variant="outline"
        onPress={() => router.push('/(employee)/unlock-requests')}
      />
    </Screen>
  );
}

function createStyles(colors) {
  return {
    locked: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 8, marginBottom: 12 },
  };
}
