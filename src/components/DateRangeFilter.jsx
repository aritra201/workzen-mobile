import { Switch, Text, View } from 'react-native';
import DateField from './DateField';
import PrimaryButton from './PrimaryButton';
import FilterCard from './FilterCard';
import EmployeeFilterSelect from './EmployeeFilterSelect';
import { parseDateKey } from '../utils/dateRange';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  markedOnly,
  onMarkedOnlyChange,
  showMarkedOnly,
  employeeIds,
  onEmployeeIdsChange,
  showEmployeeFilter,
  onApply,
  onReset,
  applying,
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const endParsed = parseDateKey(endDate);
  const startParsed = parseDateKey(startDate);

  return (
    <FilterCard compact>
      <View style={styles.dateRow}>
        <DateField
          compact
          label="From"
          value={startDate}
          onChange={onStartDateChange}
          maximumDate={endParsed}
          disabled={applying}
        />
        <DateField
          compact
          label="To"
          value={endDate}
          onChange={onEndDateChange}
          minimumDate={startParsed}
          disabled={applying}
        />
      </View>
      {showEmployeeFilter ? (
        <EmployeeFilterSelect
          compact
          value={employeeIds || []}
          onChange={onEmployeeIdsChange}
          disabled={applying}
        />
      ) : null}
      {showMarkedOnly ? (
        <View style={styles.markedRow}>
          <Text style={styles.switchLabel}>Marked attendance only</Text>
          <Switch
            value={markedOnly}
            onValueChange={onMarkedOnlyChange}
            trackColor={{ true: colors.primary, false: colors.outlineVariant }}
          />
        </View>
      ) : null}
      <View style={styles.actions}>
        <PrimaryButton title="Reset" variant="outline" compact onPress={onReset} disabled={applying} style={styles.actionBtn} />
        <PrimaryButton
          title={applying ? 'Loading…' : 'Apply'}
          compact
          onPress={onApply}
          loading={applying}
          style={styles.actionBtn}
        />
      </View>
    </FilterCard>
  );
}

function createStyles(colors) {
  return {
    dateRow: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'flex-start',
    },
    markedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainer,
    },
    switchLabel: { fontSize: 13, color: colors.onSurface, flex: 1, marginRight: 8 },
    actions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 2,
    },
    actionBtn: {
      flex: 1,
      marginTop: 0,
    },
  };
}
