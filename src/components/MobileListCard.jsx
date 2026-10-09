import { Pressable, View } from 'react-native';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function MobileListCard({ children, onPress, style }) {
  const styles = useThemedStyles(createStyles);
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

function createStyles(colors) {
  return {
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
    pressed: {
      opacity: 0.92,
    },
  };
}
