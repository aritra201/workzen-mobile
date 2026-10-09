import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function LoadingState({ label = 'Loading…' }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function createStyles(colors) {
  return {
    wrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: colors.surface,
    },
    label: {
      marginTop: 12,
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
  };
}
