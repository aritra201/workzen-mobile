import { Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function ThemeToggle() {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={toggleTheme}
      hitSlop={10}
      accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <MaterialIcons name={isDark ? 'light-mode' : 'dark-mode'} size={20} color={colors.onSurfaceVariant} />
    </Pressable>
  );
}

function createStyles(colors) {
  return {
    btn: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainer,
      overflow: 'hidden',
    },
    pressed: { opacity: 0.85 },
  };
}
