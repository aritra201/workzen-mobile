import { View } from 'react-native';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function FilterCard({ children, style, compact = false }) {
  const styles = useThemedStyles(createStyles);
  return <View style={[styles.card, compact && styles.cardCompact, style]}>{children}</View>;
}

function createStyles(colors) {
  return {
    card: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      gap: 0,
    },
    cardCompact: {
      padding: 10,
      marginBottom: 12,
      borderRadius: 10,
      gap: 8,
    },
  };
}
