import { ActivityIndicator, Pressable, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  icon,
  compact = false,
  style,
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';
  const isGoogle = variant === 'google';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        compact && styles.baseCompact,
        isGoogle && styles.google,
        isSecondary && styles.secondary,
        isOutline && styles.outline,
        !isOutline && !isSecondary && !isGoogle && styles.primary,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline || isSecondary || isGoogle ? colors.primary : colors.onPrimary} />
      ) : (
        <>
          {icon ? <MaterialIcons name={icon} size={18} color={isGoogle ? colors.googleButtonText : isOutline || isSecondary ? colors.onSurface : colors.onPrimary} /> : null}
          <Text
            style={[
              styles.label,
              compact && styles.labelCompact,
              (isOutline || isSecondary) && styles.labelMuted,
              isGoogle && styles.labelGoogle,
            ]}
          >
            {title}
          </Text>
          {variant === 'primary' && !icon && !compact ? (
            <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimary} />
          ) : null}
        </>
      )}
    </Pressable>
  );
}

function createStyles(colors) {
  return {
    base: {
      minHeight: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      flexDirection: 'row',
      gap: 8,
      marginTop: 4,
    },
    baseCompact: {
      minHeight: 40,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginTop: 0,
    },
    primary: {
      backgroundColor: colors.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 2,
    },
    secondary: {
      backgroundColor: colors.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    outline: {
      backgroundColor: colors.surfaceContainer,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    google: {
      backgroundColor: colors.googleButtonBg,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      marginTop: 0,
    },
    disabled: {
      opacity: 0.5,
    },
    pressed: {
      opacity: 0.9,
      transform: [{ scale: 0.99 }],
    },
    label: {
      color: colors.onPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    labelCompact: {
      fontSize: 14,
    },
    labelMuted: {
      color: colors.onSurface,
    },
    labelGoogle: {
      color: colors.googleButtonText,
      fontWeight: '600',
    },
  };
}
