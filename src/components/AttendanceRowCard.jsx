import { Text, View } from 'react-native';
import { formatCurrencyInr, formatDateLabel } from '../utils/format';
import {
  getAttendanceEmployeeName,
  getAttendanceEmployeeProfilePicture,
  sumShiftAmountsFromShifts,
} from '../utils/companyAttendanceList';
import MobileListCard from './MobileListCard';
import PersonAvatar from './PersonAvatar';
import AttendanceShiftStatusPairs from './AttendanceShiftStatusPairs';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function AttendanceRowCard({ row, onPress }) {
  const styles = useThemedStyles(createStyles);
  const employeeName = getAttendanceEmployeeName(row);
  const totalAmount = sumShiftAmountsFromShifts(row.shifts);

  const content = (
    <>
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
      <View style={styles.shiftsBlock}>
        <Text style={styles.shiftsLabel}>SHIFTS</Text>
        <AttendanceShiftStatusPairs shifts={row.shifts} />
      </View>
      <Text style={styles.amount}>
        {totalAmount != null ? formatCurrencyInr(totalAmount) : 'N/A'}
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
    shiftsBlock: { marginTop: 14 },
    shiftsLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.8,
      color: colors.outline,
      marginBottom: 6,
    },
    amount: {
      marginTop: 12,
      fontSize: 16,
      fontWeight: '700',
      color: colors.onSurface,
      fontVariant: ['tabular-nums'],
    },
    detailLink: {
      marginTop: 14,
      fontSize: 15,
      fontWeight: '700',
      color: colors.primary,
    },
  };
}
