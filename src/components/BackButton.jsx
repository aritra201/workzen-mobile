import { Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function BackButton({ onPress, label = 'Back', style }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed, style]}
    >
      <View style={styles.iconWrap}>
        <MaterialIcons name="arrow-back" size={18} color={colors.onSurface} />
      </View>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors) {
  return {
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'stretch',
      gap: 8,
      marginBottom: 4,
      paddingVertical: 4,
      paddingRight: 4,
      maxWidth: '100%',
    },
    iconWrap: {
      flexShrink: 0,
      width: 36,
      height: 36,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      flex: 1,
      flexShrink: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.onSurface,
    },
    pressed: { opacity: 0.88 },
  };
}
