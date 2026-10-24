import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getTodayAttendance } from '../../src/api/attendance';
import { listMarkAttendanceShiftItems } from '../../src/utils/attendanceUi';
import { formatDateLabel } from '../../src/utils/format';
import Screen from '../../src/components/Screen';
import AppHeader from '../../src/components/AppHeader';
import EmployeeShiftCard from '../../src/components/EmployeeShiftCard';
import { AccordionGroup } from '../../src/components/AccordionGroup';
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
  const attendanceDate = record?.date;
  const defaultOpenId = shiftItems[0]?.accordionId ?? null;

  return (
    <Screen>
      <AppHeader title="Mark attendance" subtitle={formatDateLabel(attendanceDate, { weekday: true })} />
      <View style={styles.dateCard}>
        <Text style={styles.dateTitle}>{formatDateLabel(attendanceDate, { weekday: true })}</Text>
        {record?.lockAttendance ? (
          <Text style={styles.dateLocked}>
            This day is locked. Request an unlock from the unlock requests page.
          </Text>
        ) : (
          <Text style={styles.dateHint}>
            Confirm each shift you worked — amount is applied from your profile. Comments and photos
            are optional.
          </Text>
        )}
      </View>
      <FormError message={error} />
      <AccordionGroup defaultOpenId={defaultOpenId}>
        {shiftItems.map(({ shiftKey, shift, label, accordionId }) => (
          <EmployeeShiftCard
            key={accordionId || shiftKey}
            accordionId={accordionId || shiftKey}
            shiftKey={shiftKey}
            shift={shift}
            attendance={record}
            attendanceDate={attendanceDate}
            label={label}
            onUpdated={load}
          />
        ))}
      </AccordionGroup>
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
    dateCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    dateTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.onSurface,
    },
    dateHint: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginTop: 6,
      lineHeight: 18,
    },
    dateLocked: {
      fontSize: 12,
      color: colors.error,
      marginTop: 6,
      lineHeight: 18,
    },
    locked: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 8, marginBottom: 12 },
  };
}
