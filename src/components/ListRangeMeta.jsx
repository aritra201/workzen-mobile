import { Text, View } from 'react-native';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function ListRangeMeta({ label, loading }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {loading ? <Text style={styles.updating}>Updating…</Text> : null}
    </View>
  );
}

function createStyles(colors) {
  return {
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      gap: 8,
    },
    label: { fontSize: 14, color: colors.onSurfaceVariant, flex: 1 },
    updating: { fontSize: 12, color: colors.primary },
  };
}
