import { Text, View } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function ListPagination({ page, totalPages, total, onPageChange, loading }) {
  const styles = useThemedStyles(createStyles);

  if (!totalPages || totalPages <= 1) {
    return total > 0 ? (
      <Text style={styles.meta}>{total} record{total === 1 ? '' : 's'}</Text>
    ) : null;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.meta}>
        Page {page} of {totalPages} ({total} total)
      </Text>
      <View style={styles.row}>
        <PrimaryButton
          title="Previous"
          variant="outline"
          disabled={page <= 1 || loading}
          onPress={() => onPageChange(page - 1)}
        />
        <PrimaryButton
          title="Next"
          variant="outline"
          disabled={page >= totalPages || loading}
          onPress={() => onPageChange(page + 1)}
        />
      </View>
    </View>
  );
}

function createStyles(colors) {
  return {
    wrap: { marginTop: 16, gap: 8 },
    meta: { fontSize: 13, color: colors.onSurfaceVariant, textAlign: 'center' },
    row: { flexDirection: 'row', gap: 8 },
  };
}
