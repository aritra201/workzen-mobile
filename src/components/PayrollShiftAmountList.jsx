import { Text, View } from 'react-native';
import { formatCurrencyInr } from '../utils/format';
import { shiftChipStyle } from '../utils/shiftChipStyles';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function PayrollShiftAmountList({ shifts }) {
  const { isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const lines = Array.isArray(shifts) ? shifts : [];

  if (!lines.length) {
    return <Text style={styles.empty}>—</Text>;
  }

  return (
    <View style={styles.stack}>
      {lines.map((line) => {
        const chip = shiftChipStyle(line.shiftKey, isDark);
        return (
          <View key={line.shiftKey} style={styles.row}>
            <View style={[styles.shiftBadge, { backgroundColor: chip.bg, borderColor: chip.border }]}>
              <Text style={[styles.shiftText, { color: chip.text }]}>{line.shiftLabel}</Text>
            </View>
            <Text style={styles.amount}>
              {line.amount != null ? formatCurrencyInr(line.amount) : '—'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function createStyles(colors) {
  return {
    stack: { gap: 6 },
    row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
    shiftBadge: {
      minWidth: 72,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
    },
    shiftText: { fontSize: 12, fontWeight: '700' },
    amount: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.onSurface,
      fontVariant: ['tabular-nums'],
    },
    empty: { fontSize: 14, color: colors.onSurfaceVariant },
  };
}
