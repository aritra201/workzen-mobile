import { Text, View } from 'react-native';
import { formatCurrencyInr, formatDateLabel } from '../utils/format';
import {
  getAttendanceEmployeeName,
  getAttendanceEmployeeProfilePicture,
} from '../utils/companyAttendanceList';
import MobileListCard from './MobileListCard';
import PersonAvatar from './PersonAvatar';
import PayrollShiftAmountList from './PayrollShiftAmountList';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function PayrollRowCard({ row, onPress, employeeScope = false }) {
  const styles = useThemedStyles(createStyles);
  const employeeName = getAttendanceEmployeeName(row);
  const dayTotal =
    row.dayTotal != null
      ? row.dayTotal
      : Array.isArray(row.shifts)
        ? row.shifts.reduce((sum, line) => {
            if (line.amount == null || Number.isNaN(Number(line.amount))) return sum;
            return sum + Number(line.amount);
          }, 0)
        : null;

  const content = (
    <>
      {employeeScope ? (
        <Text style={styles.dateOnly}>{formatDateLabel(row.date)}</Text>
      ) : (
        <View style={styles.header}>
          <PersonAvatar
            name={employeeName}
            email={row.employee?.email}
            src={getAttendanceEmployeeProfilePicture(row)}
            size={40}
          />
          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={1}>{employeeName}</Text>
            <Text style={styles.date}>{formatDateLabel(row.date)}</Text>
          </View>
        </View>
      )}
      <View style={styles.shiftsBlock}>
        <PayrollShiftAmountList shifts={row.shifts} />
      </View>
      <Text style={styles.dayTotal}>
        Day total: {row.dayTotal != null ? formatCurrencyInr(row.dayTotal) : dayTotal != null ? formatCurrencyInr(dayTotal) : '—'}
      </Text>
      {onPress ? <Text style={styles.detailLink}>View detail</Text> : null}
    </>
  );

  return <MobileListCard onPress={onPress}>{content}</MobileListCard>;
}

function createStyles(colors) {
  return {
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerText: { flex: 1, minWidth: 0 },
    name: { fontSize: 16, fontWeight: '700', color: colors.onSurface },
    date: { fontSize: 14, color: colors.onSurfaceVariant, marginTop: 2 },
    dateOnly: { fontSize: 16, fontWeight: '700', color: colors.onSurface },
    shiftsBlock: { marginTop: 12 },
    dayTotal: {
      marginTop: 12,
      fontSize: 15,
      fontWeight: '700',
      color: colors.onSurface,
      fontVariant: ['tabular-nums'],
    },
    detailLink: {
      marginTop: 12,
      fontSize: 15,
      fontWeight: '700',
      color: colors.primary,
    },
  };
}
