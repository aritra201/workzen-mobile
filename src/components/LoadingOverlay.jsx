import { ActivityIndicator, Modal, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function LoadingOverlay({ visible, label = 'Please wait…' }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Modal visible={Boolean(visible)} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors) {
  return {
    backdrop: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.scrim ?? 'rgba(0,0,0,0.45)',
    },
    card: {
      minWidth: 200,
      paddingVertical: 24,
      paddingHorizontal: 28,
      borderRadius: 16,
      alignItems: 'center',
      backgroundColor: colors.surfaceContainerHighest ?? colors.surface,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    label: {
      marginTop: 14,
      fontSize: 15,
      fontWeight: '600',
      color: colors.onSurface,
      textAlign: 'center',
    },
  };
}
