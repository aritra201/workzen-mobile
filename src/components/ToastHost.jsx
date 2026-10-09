import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function ToastHost({ toast }) {
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);

  if (!toast?.message) return null;

  const isError = toast.variant === 'error';

  return (
    <View pointerEvents="none" style={[styles.wrap, { bottom: insets.bottom + 16 }]}>
      <View style={[styles.bubble, isError ? styles.bubbleError : styles.bubbleSuccess]}>
        <Text style={[styles.text, isError ? styles.textError : styles.textSuccess]} numberOfLines={3}>
          {toast.message}
        </Text>
      </View>
    </View>
  );
}

function createStyles(colors) {
  return {
    wrap: {
      position: 'absolute',
      left: 16,
      right: 16,
      zIndex: 9999,
      alignItems: 'center',
    },
    bubble: {
      maxWidth: 420,
      width: '100%',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    bubbleSuccess: {
      backgroundColor: colors.primaryContainer,
      borderColor: colors.primary,
    },
    bubbleError: {
      backgroundColor: colors.errorContainer,
      borderColor: colors.error,
    },
    text: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 20,
    },
    textSuccess: {
      color: colors.onPrimaryContainer,
    },
    textError: {
      color: colors.error,
    },
  };
}
