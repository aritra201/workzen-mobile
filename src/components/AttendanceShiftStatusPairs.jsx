import { Text, View } from 'react-native';
import { getAttendanceShiftStatusEntries } from '../utils/companyAttendanceList';
import { shiftChipStyle } from '../utils/shiftChipStyles';
import StatusChip from './StatusChip';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function AttendanceShiftStatusPairs({ shifts, emptyLabel = 'Not marked attendance' }) {
  const { isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const entries = getAttendanceShiftStatusEntries(shifts);

  if (!entries.length) {
    return (
      <View style={styles.row}>
        <Text style={styles.dash}>—</Text>
        <StatusChip tone="notMarked">{emptyLabel}</StatusChip>
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      {entries.map((entry) => {
        const chip = shiftChipStyle(entry.responseKey, isDark);
        return (
          <View key={entry.responseKey} style={styles.row}>
            <View style={[styles.shiftBadge, { backgroundColor: chip.bg, borderColor: chip.border }]}>
              <Text style={[styles.shiftText, { color: chip.text }]}>{entry.shiftLabel}</Text>
            </View>
            <StatusChip tone={entry.tone}>{entry.label}</StatusChip>
          </View>
        );
      })}
    </View>
  );
}

function createStyles(colors) {
  return {
    stack: { gap: 8 },
    row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
    dash: { minWidth: 44, fontSize: 12, color: colors.onSurfaceVariant },
    shiftBadge: {
      minWidth: 72,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
    },
    shiftText: { fontSize: 12, fontWeight: '700' },
  };
}
